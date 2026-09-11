import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  RefreshCw,
  Send,
  AlertTriangle,
  ExternalLink,
  WifiOff,
  QrCode,
  CreditCard,
  Settings,
  CheckCircle,
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import { DynamicQrisPaymentModal } from '../Billing/DynamicQrisPaymentModal';
import { Invoice } from '../../types';

export const IsolirEngineView: React.FC = () => {
  const {
    customers,
    invoices,
    isolirConfig,
    updateIsolirConfig,
    runAutoIsolirScan,
    unIsolateCustomer,
    isolateCustomer,
    sendWhatsAppMessage,
    getFormattedMessage,
    payInvoice,
    paymentChannels,
  } = useApp();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ isolatedCount: number; checkedCount: number } | null>(null);

  // Edit config state
  const [gracePeriod, setGracePeriod] = useState(isolirConfig.gracePeriodDays);
  const [lateFee, setLateFee] = useState(isolirConfig.lateFeeAmount);
  const [autoIsolateEnabled, setAutoIsolateEnabled] = useState(isolirConfig.autoIsolateEnabled);
  const [autoRestore, setAutoRestore] = useState(isolirConfig.autoRestoreOnPayment);

  // Simulated portal selected customer
  const isolatedCustomers = customers.filter(c => c.status === 'isolated');
  const [previewCustomerId, setPreviewCustomerId] = useState<string>(
    isolatedCustomers[0]?.id || customers[0]?.id || ''
  );

  const previewCustomer = customers.find(c => c.id === previewCustomerId);
  const previewInvoice = invoices.find(
    i => i.customerId === previewCustomerId && (i.status === 'unpaid' || i.status === 'overdue')
  );
  const [qrisModalInvoice, setQrisModalInvoice] = useState<Invoice | null>(null);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = runAutoIsolirScan();
      setScanResult(res);
      setIsScanning(false);
    }, 600);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateIsolirConfig({
      gracePeriodDays: gracePeriod,
      lateFeeAmount: lateFee,
      autoIsolateEnabled: autoIsolateEnabled,
      autoRestoreOnPayment: autoRestore,
    });
    alert('Pengaturan aturan isolir otomatis berhasil diperbarui!');
  };

  const handleSimulatedPortalPay = () => {
    if (previewInvoice) {
      payInvoice(previewInvoice.id, 'qris', `QRIS-PORTAL-${Date.now().toString().slice(-4)}`, 'Portal Isolir Self-Service');
      alert(`Pembayaran Rp ${previewInvoice.totalAmount.toLocaleString('id-ID')} via QRIS berhasil diverifikasi! Router MikroTik telah membuka isolir dan internet ${previewCustomer?.name} kembali aktif.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Sistem Isolir Otomatis MikroTik
          </h2>
          <p className="text-xs text-slate-400">
            Otomatisasi pengalihan pelanggan menunggak ke IP Pool Isolir & portal tagihan mandiri
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Memindai Pelanggan...' : 'Jalankan Scan Isolir Sekarang'}
        </button>
      </div>

      {/* Visual Workflow Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Alur & Siklus Isolir Pelanggan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 relative">
            <span className="text-[10px] font-bold uppercase text-white block mb-1">Fase 1</span>
            <h4 className="text-sm font-bold text-white">1. Aktif Normal</h4>
            <p className="text-xs text-slate-400 mt-1">Akses internet kecepatan penuh sesuai paket.</p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 relative">
            <span className="text-[10px] font-bold uppercase text-white block mb-1">Fase 2</span>
            <h4 className="text-sm font-bold text-white">2. Jatuh Tempo</h4>
            <p className="text-xs text-slate-400 mt-1">Tgl 10 tiap bulan. Notifikasi WA dikirim.</p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 relative">
            <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Fase 3</span>
            <h4 className="text-sm font-bold text-white">3. Menunggak</h4>
            <p className="text-xs text-slate-400 mt-1">Masa tenggang {isolirConfig.gracePeriodDays} hari. Denda {formatRupiah(isolirConfig.lateFeeAmount)} berlaku.</p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 relative">
            <span className="text-[10px] font-bold uppercase text-red-400 block mb-1">Fase 4</span>
            <h4 className="text-sm font-bold text-white">4. Terisolir</h4>
            <p className="text-xs text-red-300/80 mt-1">IP dialihkan ke pool isolir. Akses web diarahkan ke portal bayar.</p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 relative">
            <span className="text-[10px] font-bold uppercase text-white block mb-1">Fase 5</span>
            <h4 className="text-sm font-bold text-white">5. Buka Otomatis</h4>
            <p className="text-xs text-white/80 mt-1">Setelah bayar QRIS/Bank, RADIUS & MikroTik langsung buka isolir.</p>
          </div>
        </div>
      </div>

      {/* Grid 2: Configuration & Current Isolated Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Isolir Rules Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-white" />
            Pengaturan Aturan Isolir
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Masa Toleransi / Grace Period (Hari)
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={gracePeriod}
                onChange={e => setGracePeriod(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Contoh: Jatuh tempo tgl 10 + 3 hari = di-isolir tanggal 14.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Besaran Denda Keterlambatan (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={lateFee}
                onChange={e => setLateFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={autoIsolateEnabled}
                  onChange={e => setAutoIsolateEnabled(e.target.checked)}
                  className="rounded text-white bg-slate-800 border-slate-700"
                />
                <span>Aktifkan Eksekusi Isolir Otomatis</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={autoRestore}
                  onChange={e => setAutoRestore(e.target.checked)}
                  className="rounded text-white bg-slate-800 border-slate-700"
                />
                <span>Otomatis Buka Isolir Setelah Pelunasan</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              Simpan Pengaturan
            </button>
          </form>
        </div>

        {/* Current Isolated Customers List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Daftar Pelanggan Terisolir ({isolatedCustomers.length})
              </h3>
              <p className="text-xs text-slate-400">Akses internet pelanggan ini sedang diblokir sementara</p>
            </div>
          </div>

          {isolatedCustomers.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800">
              <CheckCircle className="w-8 h-8 text-white mx-auto mb-2" />
              Tidak ada pelanggan yang sedang terisolir. Semua pelanggan tertib!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {isolatedCustomers.map(cust => {
                const unpaid = invoices.find(i => i.customerId === cust.id && (i.status === 'unpaid' || i.status === 'overdue'));

                return (
                  <div
                    key={cust.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{cust.name}</span>
                        <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded border border-red-500/30">
                          {cust.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        No. WA: {cust.phone} &bull; Tagihan Menunggak: <strong className="text-red-400 font-mono">{formatRupiah(unpaid?.totalAmount || 150000)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const msg = getFormattedMessage(cust.id, 'pemberitahuan_isolir');
                          sendWhatsAppMessage(cust.phone, msg);
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-white transition-colors text-xs"
                        title="Kirim Notifikasi Isolir WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          unIsolateCustomer(cust.id);
                          alert(`Isolir ${cust.name} berhasil dibuka manual!`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-colors"
                      >
                        Buka Isolir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Customer Isolir Portal Page Simulator Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              Simulasi Tampilan Halaman Portal Isolir Pelanggan
            </h3>
            <p className="text-xs text-slate-400">
              Berikut adalah halaman yang muncul di browser pelanggan saat mereka mencoba membuka website ketika terisolir
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Simulasikan untuk:</span>
            <select
              value={previewCustomerId}
              onChange={e => setPreviewCustomerId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) - {c.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Simulated Browser Viewport */}
        <div className="rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl bg-slate-950 max-w-2xl mx-auto">
          {/* Fake Browser Toolbar */}
          <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700 text-xs text-slate-400">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            </div>
            <span className="flex-1 text-center font-mono text-[11px] text-slate-300 bg-slate-900 py-0.5 rounded px-3 truncate">
              http://billing.rtrw.net/isolir?user={previewCustomer?.username || 'user'}
            </span>
          </div>

          {/* Web Portal Content */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-900 to-slate-950 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-500/20">
              <WifiOff className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                Akses Internet Terisolir
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                Halo, {previewCustomer?.name || 'Pelanggan'}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Layanan internet Anda sementara dinonaktifkan karena tagihan periode{' '}
                <strong className="text-slate-200">{previewInvoice?.period || 'Agustus 2026'}</strong> belum diselesaikan.
              </p>
            </div>

            {/* Bill Summary Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">ID Pelanggan:</span>
                <span className="font-mono font-bold text-white">{previewCustomer?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Tagihan:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {formatRupiah(previewInvoice?.totalAmount || 150000)}
                </span>
              </div>
            </div>

            {/* Instant Payment Trigger in Simulator */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (previewInvoice) {
                    setQrisModalInvoice(previewInvoice);
                  } else {
                    alert('Tidak ada tagihan tertunggak untuk pelanggan ini.');
                  }
                }}
                className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                Bayar Sekarang via QRIS Dinamis & Cetak Struk
              </button>
              <p className="text-[10px] text-slate-400 mt-2">
                *Koneksi internet akan otomatis aktif kembali dalam hitungan detik setelah QRIS diverifikasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic QRIS Payment & Receipt Modal */}
      <DynamicQrisPaymentModal
        invoice={qrisModalInvoice}
        isOpen={Boolean(qrisModalInvoice)}
        onClose={() => setQrisModalInvoice(null)}
        onPaymentSuccess={() => {
          // Keep open to show proof
        }}
      />
    </div>
  );
};
