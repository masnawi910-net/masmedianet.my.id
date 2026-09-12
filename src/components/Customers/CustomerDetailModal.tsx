import React, { useState } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Phone,
  MapPin,
  Wifi,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Key,
  Eye,
  EyeOff,
  Radio,
  Send,
  Receipt,
  CheckCircle,
  ExternalLink,
  Power,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { formatRupiah, formatDateIndo, formatBytes } from '../../utils/formatters';

interface CustomerDetailModalProps {
  customerId: string | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customerId,
  onClose,
  onEdit,
}) => {
  const {
    customers,
    packages,
    nasList,
    invoices,
    activeSessions,
    isolateCustomer,
    unIsolateCustomer,
    disconnectSession,
    connectCustomerSession,
    payInvoice,
    sendWhatsAppMessage,
    getFormattedMessage,
    setSelectedInvoiceId,
    setActiveTab,
  } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('tagihan_baru');

  if (!customerId) return null;

  const customer = customers.find(c => c.id === customerId);
  if (!customer) return null;

  const pkg = packages.find(p => p.id === customer.packageId) || packages[0];
  const nas = nasList.find(n => n.id === customer.nasId) || nasList[0];
  const customerInvoices = invoices.filter(i => i.customerId === customer.id);
  const isRouterOnline = nas ? nas.status === 'online' : false;
  const liveSession = isRouterOnline
    ? activeSessions.find(s => (s.username || '').toLowerCase().trim() === (customer.username || '').toLowerCase().trim())
    : null;

  const handleSendWA = () => {
    const msg = getFormattedMessage(customer.id, selectedTemplate);
    sendWhatsAppMessage(customer.phone, msg);
  };

  const handleToggleIsolir = () => {
    if (customer.status === 'isolated') {
      unIsolateCustomer(customer.id);
      alert(`Berhasil membuka isolir untuk ${customer.name}. Koneksi internet telah diaktifkan kembali.`);
    } else {
      if (confirm(`Yakin ingin mengisolir akses internet ${customer.name} secara manual?`)) {
        isolateCustomer(customer.id);
      }
    }
  };

  const handleKick = () => {
    if (liveSession) {
      disconnectSession(liveSession.id);
      alert(`Sesi PPPoE ${customer.username} berhasil diputus/kick dari MikroTik ${nas.name}. Router akan meminta re-autentikasi.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{customer.name}</h3>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {customer.id}
                </span>
                {customer.status === 'active' && (
                  <span className="text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full">
                    Langganan Aktif
                  </span>
                )}
                {customer.status === 'isolated' && (
                  <span className="text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                    Terisolir
                  </span>
                )}
                {customer.status === 'overdue' && (
                  <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Menunggak
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{customer.address}</span> &bull; <span>{customer.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(customer)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Edit Data
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Ribbon: Isolir Control & Live Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Live Session Status */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${liveSession ? 'bg-blue-500/15 text-white border border-blue-500/30' : 'bg-slate-800 text-slate-500'}`}>
                  <Radio className={`w-4 h-4 ${liveSession ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Sesi MikroTik Live</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {liveSession
                        ? 'Terkoneksi (Online Dial-in)'
                        : !isRouterOnline
                        ? 'Offline (MikroTik Belum Terhubung)'
                        : 'Offline (Belum Konek ke MikroTik)'}
                    </span>
                  </div>
                  {liveSession ? (
                    <span className="text-[11px] text-blue-400 font-mono">
                      Uptime: {liveSession.uptime} &bull; Rx: {liveSession.rxRate} &bull; Tx: {liveSession.txRate}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      {!isRouterOnline
                        ? `Router MikroTik (${nas?.name || 'NAS'}) belum terhubung / offline`
                        : `Modem/ONT belum dial-in ke Router ${nas?.name || 'MikroTik'}`}
                    </span>
                  )}
                </div>
              </div>
              {liveSession ? (
                <button
                  onClick={handleKick}
                  className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Putus Sesi PPPoE MikroTik (Kick)"
                >
                  <Power className="w-3.5 h-3.5" /> Kick Sesi
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!isRouterOnline) {
                      alert(`Router MikroTik (${nas?.name || 'NAS'}) belum terhubung atau sedang offline. Anda belum menghubungkan router ke MikroTik, silakan hubungkan router terlebih dahulu di menu MikroTik.`);
                      return;
                    }
                    const ok = connectCustomerSession(customer.id);
                    if (!ok) {
                      alert(`Router MikroTik (${nas?.name || 'NAS'}) sedang offline atau belum terhubung.`);
                    }
                  }}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isRouterOnline
                      ? 'bg-blue-500/15 hover:bg-blue-500/25 text-white border border-blue-500/30'
                      : 'bg-slate-800/60 text-slate-500 border-slate-700/40 cursor-not-allowed opacity-60'
                  }`}
                  title={isRouterOnline ? "Simulasi / Tes Dial-in ke MikroTik" : "Router MikroTik belum terhubung"}
                >
                  <Wifi className="w-3.5 h-3.5" /> Tes Konek
                </button>
              )}
            </div>

            {/* Isolir Status Control */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${customer.status === 'isolated' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-white border border-blue-500/30'}`}>
                  {customer.status === 'isolated' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Akses Internet Pelanggan</span>
                  <span className="text-sm font-bold text-white">
                    {customer.status === 'isolated' ? 'Sedang Terisolir' : 'Akses Penuh (Normal)'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {customer.autoIsolate ? 'Isolir otomatis aktif' : 'Isolir otomatis dimatikan'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleIsolir}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  customer.status === 'isolated'
                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-md'
                    : 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30'
                }`}
              >
                {customer.status === 'isolated' ? 'Buka Isolir' : 'Isolir Sekarang'}
              </button>
            </div>
          </div>

          {/* Grid 2: RADIUS Credentials & Network Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RADIUS Info */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                Akun RADIUS Authentication
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Username:</span>
                  <span className="font-mono font-bold text-blue-400">{customer.username}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Password:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-white">
                      {showPassword ? customer.password : '••••••••'}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Tipe Layanan:</span>
                  <span className="font-semibold text-slate-200 uppercase">{customer.connectionType} Client</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">IP Address:</span>
                  <span className="font-mono text-slate-200">{customer.ipAddress}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Router NAS:</span>
                  <span className="font-medium text-slate-200">{nas?.name}</span>
                </div>
              </div>
            </div>

            {/* Package & Billing Info */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                Paket Internet & Penagihan
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Nama Paket:</span>
                  <span className="font-bold text-white">{pkg.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Bandwidth Speed:</span>
                  <span className="font-mono font-bold text-blue-400">{pkg.rateLimit} (↓{pkg.downloadSpeed}M / ↑{pkg.uploadSpeed}M)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Tarif Bulanan:</span>
                  <span className="font-bold text-blue-400 font-mono">{formatRupiah(pkg.price)} / bulan</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Jatuh Tempo:</span>
                  <span className="font-semibold text-slate-200">Setiap tanggal {customer.dueDateDay}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Total Terbayar:</span>
                  <span className="font-mono text-slate-200">{formatRupiah(customer.totalPaid || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Action Bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-400" />
              Kirim Notifikasi WhatsApp Cepat
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
                className="w-full sm:w-auto flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="tagihan_baru">Pemberitahuan Tagihan Baru</option>
                <option value="pengingat_h3">Pengingat H-3 Jatuh Tempo</option>
                <option value="pengingat_h1">Peringatan H-1 / Hari H</option>
                <option value="pemberitahuan_isolir">Pemberitahuan Isolir Otomatis</option>
                <option value="pembayaran_lunas">Konfirmasi Pembayaran Lunas</option>
                <option value="aktivasi_baru">Selamat Datang & Akun Baru</option>
              </select>
              <button
                onClick={handleSendWA}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Buka WhatsApp
              </button>
            </div>
          </div>

          {/* Riwayat Tagihan / Invoices */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                Riwayat Tagihan & Pembayaran
              </h4>
            </div>

            <div className="space-y-2">
              {customerInvoices.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  Belum ada riwayat tagihan untuk pelanggan ini.
                </div>
              ) : (
                customerInvoices.map(inv => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-200">{inv.id}</span>
                        <span className="text-slate-400">&bull; Periode {inv.period}</span>
                        {inv.status === 'paid' && (
                          <span className="text-[10px] font-semibold bg-blue-500/20 text-white px-1.5 py-0.2 rounded border border-blue-500/30">
                            Lunas
                          </span>
                        )}
                        {inv.status === 'overdue' && (
                          <span className="text-[10px] font-semibold bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded border border-red-500/30">
                            Menunggak
                          </span>
                        )}
                        {inv.status === 'unpaid' && (
                          <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                            Belum Bayar
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        Jatuh tempo: {formatDateIndo(inv.dueDate)} {inv.paidAt && `(Dibayar: ${formatDateIndo(inv.paidAt)})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm">
                        {formatRupiah(inv.totalAmount)}
                      </span>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            onClose();
                            setActiveTab('billing');
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-400 text-white"
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
