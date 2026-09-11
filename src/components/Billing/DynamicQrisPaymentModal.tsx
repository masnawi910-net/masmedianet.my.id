import React, { useState, useEffect, useRef } from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  QrCode,
  CheckCircle2,
  Printer,
  Share2,
  Clock,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  Receipt,
  Sparkles,
  ArrowRight,
  Send,
  Building,
  Calendar,
  AlertCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

interface DynamicQrisPaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (invoiceId: string) => void;
}

export const DynamicQrisPaymentModal: React.FC<DynamicQrisPaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { 
    customers, 
    payInvoice, 
    paymentChannels, 
    ispProfile, 
    sendWhatsAppMessage, 
    logActivity,
    processIncomingAutoMutation,
  } = useApp();

  // Mode: 'dynamic' (auto amount locked) or 'static' (merchant sticker QRIS, manual amount entry)
  const [qrisMode, setQrisMode] = useState<'dynamic' | 'static'>('static');
  // 'scanning' | 'verifying' | 'success'
  const [step, setStep] = useState<'scanning' | 'verifying' | 'success'>('scanning');
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes timer for dynamic mode
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [receiptFormat, setReceiptFormat] = useState<'digital' | 'thermal'>('digital');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [settledTime, setSettledTime] = useState<string>('');
  const [paidMethodType, setPaidMethodType] = useState<'QRIS Dinamis' | 'QRIS Statis'>('QRIS Statis');
  const [customRefInput, setCustomRefInput] = useState<string>('');
  const timerRef = useRef<any>(null);

  // Generate unique reference when modal opens
  useEffect(() => {
    if (isOpen && invoice) {
      if (invoice.status === 'paid') {
        setStep('success');
        setTransactionRef(invoice.transactionRef || `QRIS-PAID-${Date.now().toString().slice(-6)}`);
        setSettledTime(invoice.paidAt || new Date().toISOString());
        setPaidMethodType(invoice.receivedBy?.includes('Statis') ? 'QRIS Statis' : 'QRIS Dinamis');
      } else {
        const ref = `QRIS-${Date.now().toString().slice(-8)}`;
        setTransactionRef(ref);
        setStep('scanning');
        setTimeLeft(900); // 15 mins
        setCustomRefInput('');
      }
    }
  }, [isOpen, invoice]);

  // Countdown timer for dynamic mode
  useEffect(() => {
    if (isOpen && step === 'scanning' && qrisMode === 'dynamic' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, step, qrisMode, timeLeft]);

  if (!isOpen || !invoice) return null;

  const customer = customers.find(c => c.id === invoice.customerId);
  const isUniqueCodeActive = paymentChannels.autoMutationConfig?.uniqueCodeEnabled ?? true;
  const uniqueCode = invoice.uniqueCode || 124;
  const baseAmount = invoice.totalAmount || invoice.packagePrice || 0;
  // If unique code is enabled, invoice with code is used
  const totalPay = isUniqueCodeActive
    ? (invoice.amountWithCode || (baseAmount + uniqueCode))
    : baseAmount;
  const merchantName = paymentChannels.qrisConfig?.merchantName || paymentChannels.merchantName || ispProfile?.name || 'MASMEDIA NETWORK';
  const nmid = paymentChannels.qrisConfig?.nmid || 'ID102030405060';

  // Format countdown minutes:seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // QR Strings
  // 1. Dynamic QRIS payload (amount locked)
  const dynamicQrString = `00020101021226${nmid}52045812530336054${totalPay}5802ID59${merchantName}6007JAKARTA62${transactionRef}6304`;
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(dynamicQrString)}`;

  // 2. Static QRIS payload (merchant standard barcode)
  const staticQrString = paymentChannels.qrisStaticString || paymentChannels.qrisPayload || `00020101021126590014ID.LINKAJA.WWW01189360091100220100000208102030405204581253033605802ID5916MASMEDIA NETWORK6007JAKARTA6304`;
  const staticQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(staticQrString)}`;

  // Process Auto-Mutation Webhook Simulation (Moota / Cekmutasi)
  const handleSimulateAutoMutationSuccess = () => {
    setStep('verifying');
    setTimeout(() => {
      const prov = paymentChannels.autoMutationConfig?.provider || 'moota';
      const result = processIncomingAutoMutation({
        provider: prov as any,
        bank: 'BCA / QRIS',
        amount: totalPay,
        description: `QRIS MUTASI MASUK ${invoice.id} ${customer?.name || ''}`,
      });

      if (result.success) {
        setSettledTime(new Date().toISOString());
        setPaidMethodType('QRIS Statis');
        setTransactionRef(`MUT-${prov.toUpperCase()}-${Date.now().toString().slice(-6)}`);
        setStep('success');

        if (onPaymentSuccess) {
          onPaymentSuccess(invoice.id);
        }
      }
    }, 1200);
  };

  // Process Instant Confirmation for Static QRIS
  const handleConfirmStaticPayment = () => {
    setStep('verifying');
    const finalRef = customRefInput.trim() 
      ? `QRIS-STATIS-${customRefInput.trim().toUpperCase()}`
      : `QRIS-STATIS-${Date.now().toString().slice(-6)}`;
    
    setTimeout(() => {
      const nowIso = new Date().toISOString();
      payInvoice(invoice.id, 'qris', finalRef, 'QRIS Statis Merchant (Konfirmasi Mandiri / Kasir)');
      setTransactionRef(finalRef);
      setSettledTime(nowIso);
      setPaidMethodType('QRIS Statis');
      setStep('success');

      logActivity(
        'billing',
        'QRIS Statis Lunas',
        `Invoice ${invoice.id} sebesar ${formatRupiah(totalPay)} terkonfirmasi lunas via QRIS Statis Merchant (${finalRef}).`
      );

      if (onPaymentSuccess) {
        onPaymentSuccess(invoice.id);
      }
    }, 1200);
  };

  // Process Webhook Simulation for Dynamic QRIS
  const handleSimulateDynamicSuccess = () => {
    setStep('verifying');
    setTimeout(() => {
      const nowIso = new Date().toISOString();
      payInvoice(invoice.id, 'qris', transactionRef, 'QRIS Payment Gateway (Auto Webhook)');
      setSettledTime(nowIso);
      setPaidMethodType('QRIS Dinamis');
      setStep('success');

      logActivity(
        'billing',
        'QRIS Dinamis Lunas',
        `Invoice ${invoice.id} sebesar ${formatRupiah(totalPay)} lunas via QRIS Dinamis (${transactionRef}).`
      );

      if (onPaymentSuccess) {
        onPaymentSuccess(invoice.id);
      }
    }, 1200);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalPay.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transactionRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleSendWA = () => {
    if (!customer) return;
    const msg = `*BUKTI PEMBAYARAN RESMI - ${merchantName.toUpperCase()}*
----------------------------------------
No. Ref: *${transactionRef}*
No. Invoice: *${invoice.id}*
Pelanggan: *${customer.name}* (${customer.id})
Layanan: *${invoice.packageName}*
Periode: *${invoice.period}*
Total Bayar: *${formatRupiah(totalPay)}*
Metode: *${paidMethodType === 'QRIS Statis' ? 'QRIS Statis Merchant' : 'QRIS Real-Time Settlement'}*
Waktu: *${formatDateTimeIndo(settledTime || new Date().toISOString())}*
Status: *LUNAS (PAID) ✓*
----------------------------------------
Terima kasih! Pembayaran Anda telah kami terima dan koneksi internet aktif kembali. Simpan struk digital ini sebagai bukti yang sah.`;

    sendWhatsAppMessage(customer.phone, msg);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[96vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
              step === 'success' 
                ? 'bg-blue-500/20 text-white border border-blue-500/30'
                : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
            }`}>
              {step === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                {step === 'success' 
                  ? 'Bukti Pembayaran Resmi (LUNAS)' 
                  : qrisMode === 'static' ? 'Pembayaran QRIS Statis Merchant' : 'Pembayaran QRIS Dinamis'
                }
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 'success' 
                  ? 'Transaksi terverifikasi & kuitansi langsung terbit otomatis' 
                  : 'Scan barcode menggunakan BCA Mobile, Mandiri, BRImo, DANA, GoPay, dll.'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* STEP 1: SCANNING STATE */}
          {step === 'scanning' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Switch QRIS Mode Tabs (Statis vs Dinamis) */}
              <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setQrisMode('static')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    qrisMode === 'static'
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>QRIS Statis (Barcode Merchant)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrisMode('dynamic')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    qrisMode === 'dynamic'
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>QRIS Dinamis (Nominal Terkunci)</span>
                </button>
              </div>

              {/* Order Amount Banner */}
              <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/30 rounded-2xl p-4 text-center">
                <span className="text-[11px] font-bold text-pink-300 uppercase tracking-wider block">
                  Total Tagihan Yang Harus Dibayar
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    {formatRupiah(totalPay)}
                  </span>
                  {qrisMode === 'static' && (
                    <button
                      onClick={handleCopyAmount}
                      className="px-2.5 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-pink-500/30"
                      title="Salin Angka Nominal"
                    >
                      {copiedAmount ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAmount ? 'Disalin' : 'Salin Angka'}</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-300 mt-2">
                  <span>{invoice.packageName}</span>
                  <span>&bull;</span>
                  <span>Periode {invoice.period}</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 text-center space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold px-2 text-slate-400">
                  <div className="flex items-center gap-1.5 text-white">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{qrisMode === 'static' ? 'QRIS Statis Resmi Toko' : 'QRIS Dinamis Standar BI'}</span>
                  </div>
                  {qrisMode === 'dynamic' ? (
                    <div className="flex items-center gap-1 text-amber-400 font-mono font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeFormatted}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-white font-semibold text-[11px] bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                      <span>Aktif Selamanya</span>
                    </div>
                  )}
                </div>

                {/* QR Canvas */}
                <div className="relative w-56 h-56 sm:w-60 sm:h-60 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-xl border-2 border-pink-500/30 group">
                  <img
                    src={qrisMode === 'static' ? staticQrCodeUrl : dynamicQrCodeUrl}
                    alt={qrisMode === 'static' ? 'QRIS Statis Toko' : 'QRIS Dinamis'}
                    className="w-full h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  {/* Watermarked center badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-slate-950/90 border border-pink-500/60 flex items-center justify-center shadow-lg">
                      {qrisMode === 'static' ? (
                        <QrCode className="w-5 h-5 text-pink-400" />
                      ) : (
                        <Zap className="w-5 h-5 text-pink-400 fill-pink-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Merchant & Reference Info */}
                <div className="text-xs space-y-1">
                  <div className="font-bold text-white uppercase tracking-wide">
                    {merchantName}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <span>NMID: {nmid}</span>
                    <span>&bull;</span>
                    <span className="font-mono">{transactionRef}</span>
                    <button 
                      onClick={handleCopyRef} 
                      className="p-1 hover:text-white transition-colors" 
                      title="Salin No. Referensi"
                    >
                      {copiedRef ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Static Mode Step Instructions & Unique Code Badge */}
                {qrisMode === 'static' && (
                  <div className="space-y-2">
                    {isUniqueCodeActive && (
                      <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3 text-left space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                            Kode Unik Otomatis Auto-Mutasi:
                          </span>
                          <span className="font-mono bg-blue-500/20 text-white px-2 py-0.5 rounded-md border border-blue-500/30">
                            +{uniqueCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Sistem menambahkan 3 digit kode unik agar transfer Anda <strong className="text-white">terverifikasi otomatis (100% tanpa admin)</strong> oleh layanan Auto-Mutasi (Moota / Cekmutasi).
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-3 text-left space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Petunjuk Scan QRIS Statis:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-400">
                        <li>Buka m-Banking / E-Wallet Anda lalu scan QRIS di atas.</li>
                        <li>Ketik nominal persis: <strong className="text-white font-mono">{formatRupiah(totalPay)}</strong>.</li>
                        <li>Selesaikan pembayaran di aplikasi bank/e-wallet Anda.</li>
                        <li>Tekan tombol di bawah jika ingin langsung menerbitkan <strong className="text-white">Bukti Pembayaran Resmi</strong>.</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Supported Apps Badges */}
              <div className="text-center space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Bisa Discan Memakai Seluruh Aplikasi QRIS:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold">
                  {['BCA Mobile', 'Livin Mandiri', 'BRImo', 'BNI Mobile', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'].map(app => (
                    <span key={app} className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/60 rounded-md text-slate-300">
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: Confirm Paid & Instantly Emit Receipt */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                {qrisMode === 'static' ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleConfirmStaticPayment}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-blue-500/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Saya Sudah Bayar via QRIS (Terbitkan Bukti Pembayaran)</span>
                    </button>
                    
                    {/* Auto-Mutation Quick Test Button */}
                    <button
                      type="button"
                      onClick={handleSimulateAutoMutationSuccess}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-blue-500/30 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-white" />
                      <span>Simulasikan Auto-Mutasi Terdeteksi ({paymentChannels.autoMutationConfig?.provider?.toUpperCase() || 'MOOTA'} / Cekmutasi)</span>
                    </button>

                    <p className="text-[10px] text-center text-slate-400">
                      ✓ Tagihan otomatis lunas, isolir MikroTik terbuka, dan bukti kuitansi resmi langsung terbit seketika.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleSimulateDynamicSuccess}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-blue-500/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Simulasikan Webhook Selesai (Otomatis Lunas)</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                      ⚡ Pada integrasi payment gateway live, layar ini otomatis berganti ke Bukti Pembayaran saat scan berhasil.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: VERIFYING STATE */}
          {step === 'verifying' && (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto flex items-center justify-center" />
              <div>
                <h4 className="text-base font-bold text-white">Memverifikasi Pembayaran QRIS...</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Menerbitkan nomor kuitansi resmi, memperbarui status invoice ke LUNAS, dan membuka isolir pelanggan.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS STATE (BUKTI PEMBAYARAN RESMI) */}
          {step === 'success' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Receipt Style Selector & Actions */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setReceiptFormat('digital')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      receiptFormat === 'digital'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Kuitansi Modern
                  </button>
                  <button
                    onClick={() => setReceiptFormat('thermal')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      receiptFormat === 'thermal'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Struk Thermal
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSendWA}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                    title="Kirim Struk ke WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kirim WhatsApp</span>
                  </button>
                  <button
                    onClick={handlePrintReceipt}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="Cetak / Unduh PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>

              {/* RECEIPT VIEW 1: MODERN DIGITAL RECEIPT */}
              {receiptFormat === 'digital' ? (
                <div className="bg-slate-950 border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
                  
                  {/* Watermark Paid Stamp */}
                  <div className="absolute right-4 top-4 border-2 border-blue-500/40 text-white px-3 py-1 rounded-lg font-black text-xs tracking-wider uppercase rotate-[-6deg] bg-blue-500/10 pointer-events-none">
                    LUNAS / PAID ✓
                  </div>

                  {/* Header ISP info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-pink-600 flex items-center justify-center font-black text-white text-xs">
                        M
                      </div>
                      <h4 className="font-black text-sm text-white tracking-wide uppercase">
                        {merchantName}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {ispProfile?.address || 'Layanan Akses Internet Broadband & RTRW Net'} &bull; WA: {ispProfile?.phone || customer?.phone}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">No. Transaksi</span>
                      <span className="font-mono font-bold text-white">{transactionRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">No. Invoice Tagihan</span>
                      <span className="font-mono font-bold text-blue-400">{invoice.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Waktu Pembayaran</span>
                      <span className="font-medium text-white">{formatDateTimeIndo(settledTime || new Date().toISOString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nama Pelanggan</span>
                      <span className="font-bold text-white">{customer?.name || invoice.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ID Pelanggan / No WA</span>
                      <span className="text-slate-300">{customer?.id} &bull; {customer?.phone || invoice.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paket Langganan</span>
                      <span className="text-slate-200">{invoice.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Periode Tagihan</span>
                      <span className="text-slate-200">{invoice.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kanal Pembayaran</span>
                      <span className="font-semibold text-blue-400">
                        {paidMethodType === 'QRIS Statis' 
                          ? 'QRIS Statis Merchant (Konfirmasi Mandiri / Kasir)' 
                          : 'QRIS Dinamis (Real-Time Settlement)'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Harga Paket Pokok:</span>
                      <span>{formatRupiah(invoice.packagePrice || totalPay)}</span>
                    </div>
                    {Boolean(invoice.lateFee) && (
                      <div className="flex justify-between text-rose-400">
                        <span>Denda Keterlambatan:</span>
                        <span>+{formatRupiah(invoice.lateFee)}</span>
                      </div>
                    )}
                    {Boolean(invoice.discount) && (
                      <div className="flex justify-between text-blue-400">
                        <span>Potongan Diskon:</span>
                        <span>-{formatRupiah(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700/80 pt-2 flex justify-between items-baseline font-bold text-sm text-white">
                      <span>TOTAL DIBAYARKAN:</span>
                      <span className="font-mono text-blue-400 text-base">{formatRupiah(totalPay)}</span>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="text-[10px] text-center text-slate-400 pt-1 leading-relaxed">
                    Struk ini merupakan bukti pembayaran elektronik yang sah dan telah disetujui secara resmi oleh sistem billing {merchantName}.
                  </div>
                </div>
              ) : (
                /* RECEIPT VIEW 2: THERMAL RECEIPT (58mm/80mm Style) */
                <div className="bg-white text-slate-950 font-mono text-xs p-5 rounded-2xl shadow-xl border border-slate-300 space-y-3 max-w-sm mx-auto">
                  <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-1">
                    <h3 className="font-black text-sm tracking-wider uppercase">{merchantName}</h3>
                    <p className="text-[10px] text-slate-600">BUKTI PEMBAYARAN RESMI</p>
                    <p className="text-[9px] text-slate-500">CS: {ispProfile?.phone || customer?.phone}</p>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>No Ref:</span>
                      <span className="font-bold">{transactionRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invoice:</span>
                      <span className="font-bold">{invoice.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waktu:</span>
                      <span>{formatDateTimeIndo(settledTime || new Date().toISOString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mitra/User:</span>
                      <span className="font-bold">{customer?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paket:</span>
                      <span>{invoice.packageName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Periode:</span>
                      <span>{invoice.period}</span>
                    </div>
                  </div>

                  <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1 text-[11px]">
                    <div className="flex justify-between font-bold">
                      <span>TOTAL BAYAR:</span>
                      <span>{formatRupiah(totalPay)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-700">
                      <span>METODE:</span>
                      <span>{paidMethodType === 'QRIS Statis' ? 'QRIS STATIS' : 'QRIS DINAMIS'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-blue-400">
                      <span>STATUS:</span>
                      <span>LUNAS (PAID) ✓</span>
                    </div>
                  </div>

                  <div className="text-center pt-2 space-y-1 text-[10px] text-slate-700">
                    <p className="font-bold">TERIMA KASIH 🙏</p>
                    <p className="text-[9px] text-slate-500">Internet Anda otomatis aktif kembali.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2 print:hidden">
                <button
                  onClick={onClose}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup Jendela
                </button>
                <button
                  onClick={handleSendWA}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
