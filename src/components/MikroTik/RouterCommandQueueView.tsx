import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouterCommandQueueItem, CommandQueueAction } from '../../types';
import {
  ListFilter,
  RefreshCw,
  Play,
  RotateCcw,
  Trash2,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  Zap,
  Terminal,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Eye,
  ChevronRight,
  Wifi,
  WifiOff,
  Sliders,
  Check,
  Code,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const RouterCommandQueueView: React.FC = () => {
  const {
    commandQueue,
    nasList,
    customers,
    packages,
    processQueue,
    retryCommand,
    cancelCommand,
    clearCompletedCommands,
    pingRouter,
    enqueueCommand,
    logActivity,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterNas, setFilterNas] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<RouterCommandQueueItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Form State for Manual Command Enqueue
  const [formNasId, setFormNasId] = useState<string>(nasList[0]?.id || 'NAS-01');
  const [formAction, setFormAction] = useState<CommandQueueAction>('isolate_customer');
  const [formCustomerId, setFormCustomerId] = useState<string>(customers[0]?.id || '');
  const [formCustomTitle, setFormCustomTitle] = useState('');
  const [formCustomScript, setFormCustomScript] = useState('');
  const [formMaxRetries, setFormMaxRetries] = useState(5);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);
    try {
      const result = await processQueue();
      showToast(
        result.succeeded > 0 ? 'success' : result.failed > 0 ? 'error' : 'info',
        `Proses Antrean Selesai: ${result.succeeded} berhasil dieksekusi, ${result.failed} gagal/menunggu router online.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualRetry = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await retryCommand(id);
      showToast(res.success ? 'success' : 'error', res.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNas = nasList.find(n => n.id === formNasId) || nasList[0];
    const targetCust = customers.find(c => c.id === formCustomerId);
    const targetPkg = packages.find(p => p.id === targetCust?.packageId) || packages[0];

    let title = formCustomTitle;
    let description = '';
    let script = formCustomScript;

    if (formAction === 'isolate_customer') {
      title = title || `Isolir Pelanggan: ${targetCust?.name || 'Manual'} (${targetCust?.username || 'user'})`;
      description = `Alihkan profile PPPoE ke isolir dan masukkan IP ke Address List ISOLIR_USERS.`;
      script = script || `/ppp secret set [find name="${targetCust?.username || 'user'}"] profile="ISOLIR_PROFILE" comment="ISOLIR_OVERDUE"\n/ppp active remove [find name="${targetCust?.username || 'user'}"]`;
    } else if (formAction === 'restore_customer') {
      title = title || `Buka Isolir: ${targetCust?.name || 'Manual'} (${targetCust?.username || 'user'})`;
      description = `Kembalikan profile paket normal ${targetPkg?.name || '10Mbps'} dan hapus batasan.`;
      script = script || `/ppp secret set [find name="${targetCust?.username || 'user'}"] profile="${targetPkg?.profileName || 'default'}" comment="NORMAL"\n/ppp active remove [find name="${targetCust?.username || 'user'}"]`;
    } else if (formAction === 'change_package') {
      title = title || `Ubah Paket: ${targetCust?.name || 'Manual'} -> ${targetPkg?.name || 'Upgrade'}`;
      description = `Sinkronisasi limit rate baru ${targetPkg?.downloadSpeed}M/${targetPkg?.uploadSpeed}M ke MikroTik.`;
      script = script || `/ppp secret set [find name="${targetCust?.username || 'user'}"] profile="${targetPkg?.profileName || 'default'}"\n/queue simple set [find name="<pppoe-${targetCust?.username || 'user'}>"] max-limit=${targetPkg?.uploadSpeed}M/${targetPkg?.downloadSpeed}M`;
    } else if (formAction === 'reboot_router') {
      title = title || `Reboot Terjadwal: Router ${targetNas?.name}`;
      description = `Restart sistem MikroTik RouterOS secara aman.`;
      script = script || `/system reboot`;
    } else if (formAction === 'flush_dns') {
      title = title || `Flush DNS Cache & Refresh ARP`;
      description = `Bersihkan cache resolver MikroTik.`;
      script = script || `/ip dns cache flush\n/ip arp remove [find dynamic=yes]`;
    } else {
      title = title || `Custom Script RouterOS`;
      description = `Eksekusi script baris perintah RouterOS kustom.`;
      script = script || `/system resource print`;
    }

    enqueueCommand({
      nasId: targetNas?.id || 'NAS-01',
      nasName: targetNas?.name || 'Router MikroTik Utama',
      action: formAction,
      title,
      description,
      commandSnippet: script,
      targetUsername: targetCust?.username,
      customerId: targetCust?.id,
      maxRetries: Number(formMaxRetries) || 5,
    });

    setIsCreateModalOpen(false);
    showToast('success', `Perintah baru berhasil dimasukkan ke dalam antrean spooler!`);
  };

  // Filtered Queue
  const filteredQueue = commandQueue.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterNas !== 'all' && item.nasId !== filterNas) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNas = item.nasName.toLowerCase().includes(q);
      const matchUser = item.targetUsername?.toLowerCase().includes(q);
      const matchScript = item.commandSnippet.toLowerCase().includes(q);
      if (!matchTitle && !matchNas && !matchUser && !matchScript) return false;
    }
    return true;
  });

  const totalCount = commandQueue.length;
  const pendingCount = commandQueue.filter(q => q.status === 'pending').length;
  const completedCount = commandQueue.filter(q => q.status === 'completed').length;
  const failedCount = commandQueue.filter(q => q.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm shadow-xl transition-all ${
            toastMessage.type === 'success'
              ? 'bg-blue-950/90 border-blue-500/50 text-white'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
              : 'bg-blue-950/90 border-blue-500/50 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
            {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {toastMessage.type === 'info' && <Zap className="w-5 h-5 text-blue-400" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner Explainer & Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              Toleransi Gangguan Jaringan & Offline Command Spooler
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              MikroTik Offline Command Retry Queue
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Ketika router di lokasi site/tower mati lampu atau link BTS putus, semua instruksi (isolir, un-isolir, ganti paket, ubah firewall) tidak akan hilang. Sistem otomatis menampung perintah dalam antrean spooler lokal dan melakukan auto-retry seketika router kembali online.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all border border-slate-700 active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              Enqueue Manual
            </button>
            <button
              onClick={handleProcessAll}
              disabled={isProcessing || pendingCount === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg active:scale-95 ${
                pendingCount > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              Proses Antrean ({pendingCount})
            </button>
            <button
              onClick={clearCompletedCommands}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all border border-slate-700/60"
              title="Bersihkan riwayat selesai"
            >
              <Trash2 className="w-4 h-4" />
              Bersihkan
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Antrean</span>
            <span className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <ListFilter className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-2">{totalCount}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Perintah tercatat dalam spooler</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Menunggu (Pending)</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-amber-400 mt-2">{pendingCount}</h3>
          <p className="text-[11px] text-amber-400/80 mt-1">Siap dikirim saat router online</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Berhasil Sinkron</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-white">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-2">{completedCount}</h3>
          <p className="text-[11px] text-white/80 mt-1">Response RouterOS =!done</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gagal / Overlimit</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-rose-400 mt-2">{failedCount}</h3>
          <p className="text-[11px] text-rose-400/80 mt-1">Mencapai batas retry maksimum</p>
        </div>
      </div>

      {/* Router Status Simulation Switcher Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Status Router di Lapangan (Simulasi Koneksi):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {nasList.map(nas => {
              const isOnline = nas.status === 'online';
              return (
                <div
                  key={nas.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    isOnline
                      ? 'bg-blue-950/40 border-blue-500/40 text-white'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span className="font-semibold">{nas.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({nas.ipAddress})</span>
                  <button
                    onClick={() => pingRouter(nas.id)}
                    className="ml-1 text-[10px] px-2 py-0.5 rounded font-bold transition-all bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
                    title="Uji konektivitas ping & sinkronisasi antrean router secara realtime"
                  >
                    <RefreshCw className="w-2.5 h-2.5 text-cyan-400" />
                    Ping
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status filter tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['all', 'pending', 'completed', 'failed', 'cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-blue-500 text-white shadow font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'Semua' : st}
              </button>
            ))}
          </div>

          {/* NAS Router Filter */}
          <select
            value={filterNas}
            onChange={e => setFilterNas(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Router</option>
            {nasList.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.ipAddress})
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari perintah / user..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Queue List Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Status & Waktu</th>
                <th className="py-3.5 px-4">Target Router</th>
                <th className="py-3.5 px-4">Aksi / Judul Perintah</th>
                <th className="py-3.5 px-4">Pelanggan / Secret</th>
                <th className="py-3.5 px-4">Retry / Batas</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ListFilter className="w-8 h-8 text-slate-600" />
                      <p className="font-semibold text-slate-400">Tidak ada perintah dalam antrean</p>
                      <p className="text-[11px] text-slate-500">
                        {searchQuery ? 'Coba ubah filter pencarian Anda.' : 'Semua perintah router telah berhasil disinkronisasi.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueue.map(item => {
                  const targetNas = nasList.find(n => n.id === item.nasId);
                  const isNasOnline = targetNas ? targetNas.status === 'online' : true;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {item.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-white border border-blue-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Sukses
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                              <Clock className="w-3 h-3" />
                              Menunggu
                            </span>
                          )}
                          {item.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              Gagal
                            </span>
                          )}
                          {item.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              <XCircle className="w-3 h-3" />
                              Dibatalkan
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                          {item.createdAt.slice(11, 19)} ({item.createdAt.slice(0, 10)})
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isNasOnline ? 'bg-blue-400' : 'bg-rose-400'
                            }`}
                          />
                          {item.nasName}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {targetNas?.ipAddress || '192.168.88.1'} · {isNasOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-white truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.description}</div>
                        {item.errorMessage && (
                          <div className="text-[10px] text-rose-400 font-medium truncate mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            {item.errorMessage}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {item.targetUsername ? (
                          <div>
                            <span className="font-mono text-white bg-blue-500/10 px-1.5 py-0.5 rounded text-[11px]">
                              {item.targetUsername}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Sistem Global</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span
                            className={
                              item.retryCount >= item.maxRetries
                                ? 'text-rose-400 font-bold'
                                : item.retryCount > 0
                                ? 'text-amber-400 font-bold'
                                : 'text-slate-400'
                            }
                          >
                            {item.retryCount}
                          </span>
                          <span className="text-slate-600">/</span>
                          <span className="text-slate-400">{item.maxRetries}</span>
                        </div>
                        {item.lastAttemptAt && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Coba: {item.lastAttemptAt.slice(11, 19)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                            title="Lihat Detail & Log Eksekusi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {(item.status === 'pending' || item.status === 'failed') && (
                            <>
                              <button
                                onClick={() => handleManualRetry(item.id)}
                                disabled={isProcessing}
                                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-all font-semibold"
                                title="Retry Eksekusi Sekarang"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => cancelCommand(item.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all"
                                title="Batalkan Perintah"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Execution Logs */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Detail Perintah & Audit Trail</h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {selectedItem.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Status</span>
                  <span className="font-semibold text-white capitalize">{selectedItem.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Router Target</span>
                  <span className="font-semibold text-white">{selectedItem.nasName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Percobaan Retry</span>
                  <span className="font-mono text-amber-400 font-bold">{selectedItem.retryCount} / {selectedItem.maxRetries}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Waktu Dibuat</span>
                  <span className="font-mono text-slate-300">{selectedItem.createdAt}</span>
                </div>
              </div>

              {/* Command Snippet */}
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Perintah RouterOS API / CLI:</label>
                <pre className="bg-slate-950 text-blue-400 font-mono text-[11px] p-3 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                  {selectedItem.commandSnippet}
                </pre>
              </div>

              {/* Error Message if any */}
              {selectedItem.errorMessage && (
                <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl text-rose-300">
                  <strong className="block text-rose-400 mb-0.5">Pesan Error / Status Terakhir:</strong>
                  <span>{selectedItem.errorMessage}</span>
                </div>
              )}

              {/* Logs */}
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Riwayat Eksekusi (Execution Trace Logs):</label>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedItem.executionLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-600">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-800 bg-slate-950/60">
              {(selectedItem.status === 'pending' || selectedItem.status === 'failed') && (
                <button
                  onClick={() => {
                    handleManualRetry(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  Coba Eksekusi Ulang
                </button>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create / Enqueue Manual Command */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCommand}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Enqueue Perintah Baru ke Spooler</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Router MikroTik</label>
                <select
                  value={formNasId}
                  onChange={e => setFormNasId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {nasList.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.ipAddress}) - {n.status === 'online' ? 'Online' : 'Offline'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Jenis Aksi</label>
                <select
                  value={formAction}
                  onChange={e => setFormAction(e.target.value as CommandQueueAction)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="isolate_customer">Isolir Pelanggan PPPoE</option>
                  <option value="restore_customer">Buka Isolir Pelanggan</option>
                  <option value="change_package">Ubah Paket / Limitasi Bandwidth</option>
                  <option value="reboot_router">Reboot RouterOS</option>
                  <option value="flush_dns">Flush DNS & Reset Dynamic ARP</option>
                  <option value="custom_script">Skrip Kustom RouterOS</option>
                </select>
              </div>

              {(formAction === 'isolate_customer' || formAction === 'restore_customer' || formAction === 'change_package') && (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Pilih Pelanggan</label>
                  <select
                    value={formCustomerId}
                    onChange={e => setFormCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.username}) - {c.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Judul / Label Perintah (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Isolir Pelanggan Karena Telat Bayar"
                  value={formCustomTitle}
                  onChange={e => setFormCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Skrip RouterOS (Opsional - Otomatis jika kosong)</label>
                <textarea
                  rows={3}
                  placeholder="/ppp secret set [find name=user1] profile=ISOLIR"
                  value={formCustomScript}
                  onChange={e => setFormCustomScript(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-blue-400 font-mono text-[11px] rounded-xl p-3 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Maksimal Percobaan Retry Otomatis</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formMaxRetries}
                  onChange={e => setFormMaxRetries(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-800 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow"
              >
                <Check className="w-4 h-4" />
                Simpan & Masukkan Antrean
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
