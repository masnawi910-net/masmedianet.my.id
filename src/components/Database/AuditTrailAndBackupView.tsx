import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Database,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  FileSpreadsheet,
  Trash2,
  HardDrive,
  FileCode2,
  Server,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Calendar,
  Eye,
  Key,
} from 'lucide-react';
import { ActivityLog, ActivityCategory } from '../../types';
import { DatabaseBackupPayload, downloadDatabaseBackup } from '../../services/databaseService';
import { formatDateTimeIndo } from '../../utils/formatters';

export const AuditTrailAndBackupView: React.FC = () => {
  const {
    activityLogs,
    clearActivityLogs,
    logActivity,
    customers,
    packages,
    invoices,
    nasList,
    activeSessions,
    templates,
    isolirConfig,
    paymentChannels,
    accounts,
    ftthOLTs,
    ftthODPs,
    ftthONUs,
    genieACSConfig,
    tr069Devices,
    hotspotProfiles,
    hotspotVouchers,
    hotspotTemplates,
    vpnConfigs,
    radiusServerConfig,
    expenses,
    bankAccounts,
    qrisConfig,
    paymentGatewayConfig,
    tickets,
    fiberCables,
    ispProfile,
    importFullDatabase,
    resetAllData,
    currentTenant,
    currentUser,
    activeTab: appActiveTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'audit_logs' | 'database_backup'>(
    appActiveTab === 'backup' ? 'database_backup' : 'audit_logs'
  );

  React.useEffect(() => {
    if (appActiveTab === 'backup') {
      setActiveTab('database_backup');
    } else if (appActiveTab === 'laporan-audit' || appActiveTab === 'audit-trail') {
      setActiveTab('audit_logs');
    }
  }, [appActiveTab]);

  // Audit Logs State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Backup & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    status: 'idle' | 'analyzing' | 'preview' | 'success' | 'error';
    message?: string;
    payload?: DatabaseBackupPayload;
    summary?: {
      customers: number;
      invoices: number;
      packages: number;
      nasList: number;
      tickets: number;
      ftth: number;
      vouchers: number;
    };
  }>({ status: 'idle' });

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
      if (userFilter !== 'all' && log.userName !== userFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          (log.ipAddress && log.ipAddress.includes(q))
        );
      }
      return true;
    });
  }, [activityLogs, categoryFilter, userFilter, searchQuery]);

  // Unique staff list for dropdown
  const uniqueUsers = useMemo(() => {
    const set = new Set(activityLogs.map(l => l.userName));
    return Array.from(set);
  }, [activityLogs]);

  // Export Audit Logs as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Waktu', 'Nama Staf', 'Role', 'Kategori', 'Aksi', 'Detail Aktivitas', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || '-'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${currentTenant?.slug || 'isp'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logActivity('system', 'Export Log CSV', `Mengekspor ${filteredLogs.length} riwayat aktivitas staf`);
  };

  // Full Database Backup Download
  const handleDownloadFullBackup = () => {
    const payload: DatabaseBackupPayload = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      appName: `${ispProfile?.brandName || 'Masmedia'} RouterOS Radius`,
      data: {
        customers,
        packages,
        invoices,
        nasList,
        activeSessions,
        templates,
        isolirConfig,
        paymentChannels,
        accounts,
        ftthOLTs,
        ftthODPs,
        ftthONUs,
        genieACSConfig,
        tr069Devices,
        hotspotProfiles,
        hotspotVouchers,
        hotspotTemplates,
        vpnConfigs,
        radiusServerConfig,
        expenses,
        bankAccounts,
        qrisConfig,
        paymentGatewayConfig,
        tickets,
        fiberCables,
        activityLogs,
      },
    };

    downloadDatabaseBackup(payload);
    logActivity('system', 'Backup Database JSON', 'Melakukan ekspor penuh seluruh data aplikasi');
  };

  // Handle File Upload for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ status: 'analyzing', message: 'Membaca dan memverifikasi berkas backup...' });

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const parsed: DatabaseBackupPayload = JSON.parse(content);

        if (!parsed.data || typeof parsed.data !== 'object') {
          throw new Error('Format berkas database tidak valid (data root tidak ditemukan).');
        }

        const data = parsed.data;
        const summary = {
          customers: Array.isArray(data.customers) ? data.customers.length : 0,
          invoices: Array.isArray(data.invoices) ? data.invoices.length : 0,
          packages: Array.isArray(data.packages) ? data.packages.length : 0,
          nasList: Array.isArray(data.nasList) ? data.nasList.length : 0,
          tickets: Array.isArray(data.tickets) ? data.tickets.length : 0,
          ftth: (Array.isArray(data.ftthOLTs) ? data.ftthOLTs.length : 0) + (Array.isArray(data.ftthODPs) ? data.ftthODPs.length : 0),
          vouchers: Array.isArray(data.hotspotVouchers) ? data.hotspotVouchers.length : 0,
        };

        setImportStatus({
          status: 'preview',
          payload: parsed,
          summary,
        });
      } catch (err: any) {
        setImportStatus({
          status: 'error',
          message: err.message || 'Gagal membaca berkas JSON backup.',
        });
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = () => {
    if (!importStatus.payload) return;
    try {
      const importedCount = importFullDatabase(importStatus.payload);
      logActivity('system', 'Restore Database JSON', `Berhasil memulihkan ${importedCount} entitas dari berkas backup.`);
      setImportStatus({
        status: 'success',
        message: `Restorasi berhasil! Sebanyak total data berhasil disinkronkan ke sistem dan IndexedDB lokal.`,
      });
      setTimeout(() => {
        setImportStatus({ status: 'idle' });
      }, 4000);
    } catch (err: any) {
      setImportStatus({
        status: 'error',
        message: `Gagal memulihkan database: ${err.message}`,
      });
    }
  };

  const getCategoryBadge = (cat: ActivityCategory) => {
    switch (cat) {
      case 'billing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Billing & Kasir</span>;
      case 'mikrotik':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-white border border-blue-500/30">MikroTik / Isolir</span>;
      case 'ticket':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Tiket / Helpdesk</span>;
      case 'customer':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-white border border-blue-500/30">Pelanggan</span>;
      case 'ftth':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">FTTH & TR069</span>;
      case 'voucher':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Voucher Hotspot</span>;
      case 'auth':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Autentikasi</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">Sistem</span>;
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Audit Trail Staf & Backup Database</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Security & Redundancy
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pemantauan jejak audit operasional staf, transparansi perubahan data, dan mekanisme backup/restore database JSON
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit_logs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Log Aktivitas Staf ({activityLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('database_backup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'database_backup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Backup & Restore JSON</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AUDIT TRAIL LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Log Tercatat</span>
              <span className="text-2xl font-black text-white mt-1 block">{activityLogs.length}</span>
              <span className="text-[10px] text-blue-400">Perekaman otomatis aktif</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Staf / Operator Aktif</span>
              <span className="text-2xl font-black text-indigo-300 mt-1 block">{uniqueUsers.length}</span>
              <span className="text-[10px] text-slate-400">Staf NOC & Kasir</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Aktivitas Hari Ini</span>
              <span className="text-2xl font-black text-amber-300 mt-1 block">
                {activityLogs.filter(l => l.timestamp.startsWith(new Date().toISOString().slice(0, 10))).length}
              </span>
              <span className="text-[10px] text-slate-400">Transaksi & Pengaturan</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Aksi Cepat Log</span>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  title="Unduh file CSV untuk rekap audit"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Hapus seluruh riwayat log aktivitas staf saat ini?')) {
                      clearActivityLogs();
                    }
                  }}
                  className="p-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-xl transition-all"
                  title="Bersihkan Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari aksi, detail, atau nama staf..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                <option value="billing">Billing & Kasir</option>
                <option value="mikrotik">MikroTik & Isolir</option>
                <option value="ticket">Helpdesk & Tiket</option>
                <option value="customer">Pelanggan</option>
                <option value="ftth">FTTH & TR069</option>
                <option value="voucher">Voucher Hotspot</option>
                <option value="auth">Autentikasi Login</option>
                <option value="system">Sistem</option>
              </select>

              <select
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Staf</option>
                {uniqueUsers.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Waktu (WIB)</th>
                    <th className="py-3.5 px-4">Staf & Role</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Aksi / Operasi</th>
                    <th className="py-3.5 px-4">Detail Keterangan</th>
                    <th className="py-3.5 px-4 text-right">IP Client</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{log.userName}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">{log.userRole}</div>
                        </td>
                        <td className="py-3.5 px-4">{getCategoryBadge(log.category)}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{log.action}</td>
                        <td className="py-3.5 px-4 text-slate-300 leading-relaxed max-w-md">{log.details}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                          {log.ipAddress || '192.168.88.1'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                        Tidak ada catatan aktivitas yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE BACKUP & RESTORE */}
      {activeTab === 'database_backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Download Full Backup */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white">
                  <ArrowDownToLine className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ekspor Full Database (.JSON)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Unduh cadangan lengkap seluruh data operasional ISP Anda, mencakup database pelanggan, tagihan, router MikroTik NAS, data FTTH OLT/ODP, sesi voucher, konfigurasi QRIS, dan tiket helpdesk.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Pelanggan Aktif:</span>
                    <span className="font-bold text-white font-mono">{customers.length} data</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tagihan & Invoice:</span>
                    <span className="font-bold text-white font-mono">{invoices.length} data</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Router MikroTik & NAS:</span>
                    <span className="font-bold text-white font-mono">{nasList.length} router</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tiket Gangguan:</span>
                    <span className="font-bold text-white font-mono">{tickets.length} tiket</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Perangkat FTTH (OLT/ODP/ONU):</span>
                    <span className="font-bold text-white font-mono">{ftthOLTs.length + ftthODPs.length + ftthONUs.length} unit</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadFullBackup}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan Database Sekarang (.JSON)</span>
              </button>
            </div>

            {/* Box 2: Restore from JSON */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ArrowUpFromLine className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pulihkan Database dari Berkas Backup</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Unggah berkas JSON backup untuk memulihkan atau memindahkan seluruh data sistem ke perangkat ini. Data akan disinkronkan secara aman ke IndexedDB lokal peramban.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />

                {/* Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/60 hover:bg-indigo-500/5"
                >
                  <FileCode2 className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-white block">Klik untuk Memilih File .JSON Backup</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Format yang didukung: NetRadius / Masmedia JSON export</span>
                </div>

                {/* Import Status Alert */}
                {importStatus.status === 'analyzing' && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-white text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{importStatus.message}</span>
                  </div>
                )}

                {importStatus.status === 'error' && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{importStatus.message}</span>
                  </div>
                )}

                {importStatus.status === 'success' && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-white text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{importStatus.message}</span>
                  </div>
                )}

                {/* Preview State */}
                {importStatus.status === 'preview' && importStatus.summary && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                      <Check className="w-4 h-4" />
                      <span>Berkas Terverifikasi: {importStatus.payload?.appName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div>Pelanggan: <b>{importStatus.summary.customers}</b></div>
                      <div>Tagihan: <b>{importStatus.summary.invoices}</b></div>
                      <div>Paket: <b>{importStatus.summary.packages}</b></div>
                      <div>MikroTik: <b>{importStatus.summary.nasList}</b></div>
                      <div>FTTH: <b>{importStatus.summary.ftth}</b></div>
                      <div>Tiket: <b>{importStatus.summary.tickets}</b></div>
                    </div>
                    <button
                      onClick={handleExecuteRestore}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Konfirmasi & Terapkan Restore Data</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-slate-500 block text-center">
                  Disarankan melakukan backup sebelum menjalankan restorasi berkas baru.
                </span>
              </div>
            </div>
          </div>

          {/* Database Reset Danger Zone */}
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Reset Database ke Pengaturan Awal Pabrik</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menghapus semua cache LocalStorage & IndexedDB dan mengembalikan seluruh entitas ke data demonstrasi default.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database aplikasi ke setelan pabrik default?')) {
                  resetAllData();
                  alert('Database berhasil direset ke data default pabrik!');
                }
              }}
              className="px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all self-stretch sm:self-auto text-center"
            >
              Reset ke Setelan Awal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
