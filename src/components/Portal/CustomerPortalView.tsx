import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  User,
  Shield,
  Wifi,
  Download,
  Upload,
  Calendar,
  CreditCard,
  QrCode,
  CheckCircle,
  Clock,
  Phone,
  Printer,
  FileText,
  AlertTriangle,
  Zap,
  Radio,
  RefreshCw,
  Lock,
  Key,
  Smartphone,
  Search,
  Check,
  Sparkles,
  ArrowRight,
  Copy,
  Receipt,
} from 'lucide-react';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';
import { InvoicePrintModal } from '../Billing/InvoicePrintModal';
import { DynamicQrisPaymentModal } from '../Billing/DynamicQrisPaymentModal';
import { Invoice, SupportTicket, WifiRegistration } from '../../types';
import { WifiRegistrationFormSection } from './WifiRegistrationFormSection';

interface CustomerPortalViewProps {
  isPublicStandalone?: boolean;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({ isPublicStandalone = false }) => {
  const {
    customers,
    packages,
    invoices,
    bankAccounts,
    qrisConfig,
    payInvoice,
    tickets,
    addTicket,
    ispProfile,
    logActivity,
  } = useApp();

  // Active customer state
  const [activeCustomerId, setActiveCustomerId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const custParam = params.get('cust') || params.get('id') || params.get('customer');
        const phoneParam = params.get('wa') || params.get('phone');
        if (custParam) {
          const match = customers.find(c => c.id.toLowerCase() === custParam.toLowerCase() || c.username.toLowerCase() === custParam.toLowerCase());
          if (match) return match.id;
        }
        if (phoneParam) {
          const cleanP = phoneParam.replace(/[^0-9]/g, '');
          const match = customers.find(c => c.phone.replace(/[^0-9]/g, '').includes(cleanP));
          if (match) return match.id;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return customers[0]?.id || '';
  });
  const [loginSearchInput, setLoginSearchInput] = useState<string>('');
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [qrisModalInvoice, setQrisModalInvoice] = useState<Invoice | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Auto detect if URL parameters change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const custParam = params.get('cust') || params.get('id') || params.get('customer');
      const phoneParam = params.get('wa') || params.get('phone');
      if (custParam) {
        const match = customers.find(c => c.id.toLowerCase() === custParam.toLowerCase() || c.username.toLowerCase() === custParam.toLowerCase());
        if (match) setActiveCustomerId(match.id);
      } else if (phoneParam) {
        const cleanP = phoneParam.replace(/[^0-9]/g, '');
        const match = customers.find(c => c.phone.replace(/[^0-9]/g, '').includes(cleanP));
        if (match) setActiveCustomerId(match.id);
      }
    }
  }, [customers]);

  const [activePortalTab, setActivePortalTab] = useState<'billing' | 'new_registration'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'register' || params.get('daftar') === 'true' || params.get('action') === 'register') {
          return 'new_registration';
        }
      } catch (e) {
        console.error(e);
      }
    }
    return 'billing';
  });

  const handleCopyPublicLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?tab=portal-pelanggan`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Self-service WiFi Manager State
  const [wifiSsid, setWifiSsid] = useState<string>('Masmedia_Family_5G');
  const [wifiPassword, setWifiPassword] = useState<string>('indonesia2026');
  const [isUpdatingWifi, setIsUpdatingWifi] = useState<boolean>(false);
  const [isRebootingOnt, setIsRebootingOnt] = useState<boolean>(false);
  const [wifiSuccessMsg, setWifiSuccessMsg] = useState<string | null>(null);

  // Manual Transfer Upload Proof state
  const [selectedPayTab, setSelectedPayTab] = useState<'qris' | 'va' | 'manual'>('qris');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);

  const customer = customers.find(c => c.id === activeCustomerId) || customers[0];
  const pkg = packages.find(p => p.id === customer?.packageId);
  const customerInvoices = invoices.filter(i => i.customerId === customer?.id);
  const unpaidInvoice = customerInvoices.find(i => i.status === 'unpaid' || i.status === 'overdue');

  // Handle Search / Login simulation
  const handleSearchLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginSearchInput.trim()) return;
    const q = loginSearchInput.toLowerCase().trim();
    const found = customers.find(
      c =>
        c.id.toLowerCase() === q ||
        c.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
        c.username.toLowerCase() === q ||
        c.name.toLowerCase().includes(q)
    );
    if (found) {
      setActiveCustomerId(found.id);
      setLoginSearchInput('');
    } else {
      alert('Pelanggan tidak ditemukan. Pastikan Nomor WA atau ID Pelanggan sudah sesuai.');
    }
  };

  const handlePortalPayQRIS = () => {
    if (unpaidInvoice) {
      payInvoice(unpaidInvoice.id, 'qris', `QRIS-PORTAL-${Date.now().toString().slice(-4)}`, 'Portal Self-Service Pelanggan');
      logActivity('billing', 'Bayar QRIS Portal', `Pelanggan ${customer?.name} membayar invoice ${unpaidInvoice.id} via Portal.`);
      alert('Pembayaran QRIS Berhasil! Status layanan Anda kini Aktif Penuh.');
    }
  };

  const handleUpdateWifiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingWifi(true);
    setTimeout(() => {
      setIsUpdatingWifi(false);
      setWifiSuccessMsg('Nama WiFi & Password baru berhasil disinkronkan ke modem ONT via TR-069!');
      logActivity('ftth', 'Update WiFi Portal', `Pelanggan ${customer?.name} mengubah SSID/Password WiFi via Portal.`);
      setTimeout(() => setWifiSuccessMsg(null), 4000);
    }, 1500);
  };

  const handleRebootOnt = () => {
    if (confirm('Jalankan restart modem ONT sekarang? Internet akan terputus selama ~1 menit.')) {
      setIsRebootingOnt(true);
      setTimeout(() => {
        setIsRebootingOnt(false);
        alert('Perintah Reboot selesai dikirim ke modem ONT!');
        logActivity('ftth', 'Reboot ONT Portal', `Pelanggan ${customer?.name} merestart modem via TR-069 Portal.`);
      }, 2000);
    }
  };

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setProofImage(ev.target?.result as string);
      setIsUploadingProof(true);
      setTimeout(() => {
        setIsUploadingProof(false);
        alert('Bukti transfer berhasil dikirim ke Admin NOC untuk verifikasi cepat!');
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      {/* Public Link Share Banner for Admins */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/30 rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-white flex-shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white">Link Portal Publik untuk Pelanggan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-white border border-blue-500/30">
                Akses Langsung Tanpa Login
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Bagikan link ini ke grup RT/RW atau kirim via WhatsApp ke pelanggan WiFi Anda.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActivePortalTab(prev => prev === 'new_registration' ? 'billing' : 'new_registration')}
            className="px-3.5 py-2 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>{activePortalTab === 'new_registration' ? 'Cek Tagihan Akun' : 'Pasang WiFi Baru'}</span>
          </button>
          <button
            onClick={handleCopyPublicLink}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md ${
              copiedLink
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Link Portal Publik</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Mode Switcher: Tagihan & Layanan VS Pendaftaran/Pasang Baru */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <button
          type="button"
          onClick={() => setActivePortalTab('billing')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePortalTab === 'billing'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Status &amp; Tagihan Akun Pelanggan</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePortalTab('new_registration')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activePortalTab === 'new_registration'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Pendaftaran/Pasang Baru</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Calon Pelanggan
          </span>
        </button>
      </div>

      {activePortalTab === 'new_registration' ? (
        <WifiRegistrationFormSection />
      ) : (
        <>
      {/* Top Customer Switcher / Search Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              Pencarian Akun Pelanggan WiFi
            </span>
            <span className="text-[11px] text-slate-400">
              Ketik nomor WhatsApp terdaftar (cth: 0812...) atau ID Pelanggan
            </span>
          </div>
        </div>

        {/* Customer Select or Search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSearchLogin} className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Ketik No WA / ID..."
              value={loginSearchInput}
              onChange={e => setLoginSearchInput(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 w-44"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Cari Pelanggan"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari</span>
            </button>
          </form>

          {!isPublicStandalone && (
            <select
              value={activeCustomerId}
              onChange={e => setActiveCustomerId(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none max-w-xs"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) - {c.status}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/10">
              {customer?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{customer?.name}</h2>
                <span className="font-mono text-xs text-white bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  {customer?.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{customer?.address} &bull; {customer?.phone}</p>
            </div>
          </div>

          <div>
            {customer?.status === 'active' && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-white border border-blue-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse" />
                Layanan Aktif Normal
              </span>
            )}
            {customer?.status === 'isolated' && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-rose-400 mr-2" />
                Layanan Terisolir (Menunggak)
              </span>
            )}
            {customer?.status === 'due_soon' && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
                Mendekati Jatuh Tempo
              </span>
            )}
          </div>
        </div>

        {/* Package & Connection details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Paket Internet</span>
            <span className="font-bold text-white text-sm block mt-0.5">{pkg?.name}</span>
            <span className="text-[11px] text-blue-400 font-mono">{pkg?.rateLimit}</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Tarif Langganan</span>
            <span className="font-bold text-white text-sm block mt-0.5">{formatRupiah(pkg?.price || 0)}</span>
            <span className="text-[11px] text-slate-400">/ {pkg?.validityDays} hari</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Jatuh Tempo</span>
            <span className="font-bold text-white text-sm block mt-0.5">Tgl {customer?.dueDateDay} Tiap Bulan</span>
            <span className="text-[11px] text-slate-400">Periode Berjalan</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Redaman Optik (ONT)</span>
            <span className="font-bold text-blue-400 text-sm block mt-0.5 font-mono">-19.45 dBm</span>
            <span className="text-[10px] text-slate-400">Sinyal Fiber Bagus</span>
          </div>
        </div>
      </div>

      {/* Active Unpaid Bill Banner (If any) */}
      {unpaidInvoice ? (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tagihan Belum Lunas
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Tagihan Periode {unpaidInvoice.period}
                </h3>
                <p className="text-xs text-slate-400">
                  Jatuh tempo: <strong className="text-slate-200">{formatDateIndo(unpaidInvoice.dueDate)}</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total yang harus dibayar:</span>
              <span className="text-2xl font-black text-blue-400 font-mono">
                {formatRupiah(unpaidInvoice.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setSelectedPayTab('qris')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPayTab === 'qris'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              1. QRIS Instant (Semua Bank/E-Wallet)
            </button>
            <button
              onClick={() => setSelectedPayTab('va')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPayTab === 'va'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              2. Transfer Virtual Account
            </button>
            <button
              onClick={() => setSelectedPayTab('manual')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPayTab === 'manual'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              3. Upload Bukti Transfer Struk
            </button>
          </div>

          {/* TAB 1: QRIS */}
          {selectedPayTab === 'qris' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>Scan QRIS Merchant Resmi</span>
                </div>
                <div className="w-44 h-44 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-md border border-slate-200">
                  <img
                    src={qrisConfig.qrImageUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=RTRW_QRIS_SAMPLE'}
                    alt="QRIS Merchant"
                    className="w-full h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {qrisConfig.merchantName} &bull; NMID: {qrisConfig.nmid}
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-white block">Petunjuk Pembayaran QRIS:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                    <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, Dana, ShopeePay).</li>
                    <li>Pilih menu <b>Scan QR / QRIS</b> lalu arahkan kamera ke barcode di samping.</li>
                    <li>Pastikan nama merchant tertera <b>{qrisConfig.merchantName}</b> dengan nominal <b>{formatRupiah(unpaidInvoice.totalAmount)}</b>.</li>
                    <li>Masukkan PIN transaksi Anda. Pembayaran akan terverifikasi secara otomatis dalam hitungan detik.</li>
                  </ol>
                </div>

                <button
                  onClick={() => setQrisModalInvoice(unpaidInvoice)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Buka QRIS Dinamis & Bukti Pembayaran Otomatis</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Virtual Account */}
          {selectedPayTab === 'va' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white block">Pilih Rekening Bank / Virtual Account:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bankAccounts.filter(b => b.isActive).map(bank => (
                  <div key={bank.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-blue-400 font-bold text-[10px] uppercase block">{bank.bankName}</span>
                      <span className="font-mono font-bold text-white text-xs block mt-0.5">{bank.accountNumber}</span>
                      <span className="text-[10px] text-slate-400 block">a/n {bank.accountHolder}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(bank.accountNumber);
                        alert(`Nomor rekening ${bank.accountNumber} berhasil disalin!`);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Upload Proof */}
          {selectedPayTab === 'manual' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white block">Konfirmasi Pembayaran Manual:</span>
              <p className="text-slate-400 text-[11px]">
                Jika Anda telah melakukan transfer ke rekening di atas, silakan lampirkan foto struk / tangkapan layar m-Banking untuk konfirmasi instan oleh Admin.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadProof}
                  className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
                {proofImage && (
                  <span className="text-white font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Berkas terlampir
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Semua Tagihan Sudah Lunas</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Terima kasih! Anda tidak memiliki tunggakan. Layanan internet aktif dengan bandwidth penuh.
            </p>
          </div>
        </div>
      )}

      {/* Self-Service WiFi SSID & Password Manager (TR-069) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pengaturan WiFi & Remote Modem ONT</h3>
              <span className="text-[10px] text-slate-400">Kelola nama SSID & ganti kata sandi langsung dari HP Anda via TR-069</span>
            </div>
          </div>

          <button
            onClick={handleRebootOnt}
            disabled={isRebootingOnt}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRebootingOnt ? 'animate-spin' : ''}`} />
            <span>Restart Modem</span>
          </button>
        </div>

        {wifiSuccessMsg && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-white text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{wifiSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateWifiConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Nama WiFi (SSID):</label>
            <input
              type="text"
              value={wifiSsid}
              onChange={e => setWifiSsid(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Password Baru (Min. 8 Karakter):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={wifiPassword}
                onChange={e => setWifiPassword(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
              />
              <button
                type="submit"
                disabled={isUpdatingWifi}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isUpdatingWifi ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Invoice History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-white" />
          <span>Riwayat Tagihan & Pembayaran Anda</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">No. Invoice</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Jatuh Tempo</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Struk Lunas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {customerInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono font-bold text-white">{inv.id}</td>
                  <td className="px-4 py-3 text-slate-200">{inv.period}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDateIndo(inv.dueDate)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-white">{formatRupiah(inv.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.status === 'paid' ? 'bg-blue-500/20 text-white' : 'bg-amber-500/20 text-amber-300'}`}>
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPrintingInvoice(inv)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Cetak Kuitansi Pembayaran Lunas"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Support Tickets & Report Gangguan */}
      <CustomerTicketsSection
        customerId={activeCustomerId}
        customerName={customer?.name || ''}
        customerPhone={customer?.phone || ''}
        customerAddress={customer?.address || ''}
      />
        </>
      )}

      {/* Print Modal */}
      <InvoicePrintModal
        invoice={printingInvoice}
        onClose={() => setPrintingInvoice(null)}
      />

      {/* Dynamic QRIS Payment & Instant Proof Modal */}
      <DynamicQrisPaymentModal
        invoice={qrisModalInvoice}
        isOpen={Boolean(qrisModalInvoice)}
        onClose={() => setQrisModalInvoice(null)}
        onPaymentSuccess={() => {
          // Keep modal open to show proof
        }}
      />
    </div>
  );
};

const CustomerTicketsSection: React.FC<{
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}> = ({ customerId, customerName, customerPhone, customerAddress }) => {
  const { tickets, addTicket, logActivity } = useApp();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<any>('los_red');

  const myTickets = tickets.filter(t => t.customerId === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    addTicket({
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      rtRw: 'RT 02/RW 01',
      odpName: 'ODP-RW01-A',
      category,
      priority: category === 'los_red' ? 'high' : 'medium',
      status: 'open',
      subject: subject.trim(),
      description: description.trim() || 'Laporan gangguan mandiri dari portal pelanggan.',
      reportedVia: 'portal_pelanggan',
    });

    logActivity('ticket', 'Komplain Pelanggan Portal', `Pelanggan ${customerName} mengajukan laporan: ${subject}`);

    setSubject('');
    setDescription('');
    setShowModal(false);
    alert('Laporan gangguan berhasil dikirim ke Helpdesk NOC! Teknisi akan segera ditugaskan.');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Pengaduan Gangguan & Bantuan Teknis ({myTickets.length})</span>
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          + Laporkan Gangguan
        </button>
      </div>

      {myTickets.length > 0 ? (
        <div className="space-y-2">
          {myTickets.map(t => (
            <div key={t.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{t.ticketNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'resolved' || t.status === 'closed'
                      ? 'bg-blue-500/20 text-white'
                      : t.status === 'in_progress'
                      ? 'bg-blue-500/20 text-white'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{t.createdAt}</span>
              </div>
              <p className="text-slate-200 font-semibold">{t.subject}</p>
              {t.logs && t.logs.length > 0 && (
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-[10px] text-teal-400 font-bold block mb-0.5">Update Terkini NOC:</span>
                  {t.logs[t.logs.length - 1].message}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 text-xs bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
          Koneksi internet Anda berjalan normal. Tidak ada tiket pengaduan aktif.
        </div>
      )}

      {/* Modal Laporkan Gangguan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Form Pengaduan Gangguan Internet</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jenis Kendala</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="los_red">Lampu Indikator LOS Merah (Mati Total)</option>
                  <option value="slow_speed">Koneksi Sangat Lambat / Lemot</option>
                  <option value="wifi_issue">Tidak Bisa Konek WiFi / Lupa Password</option>
                  <option value="relocation">Permintaan Relokasi / Geser Jalur Kabel</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul Keluhan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lampu merah berkedip di modem"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan kendala Anda secara spesifik..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
