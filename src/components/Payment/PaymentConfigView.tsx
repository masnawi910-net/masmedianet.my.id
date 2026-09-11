import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BankRekening, Invoice, PaymentMethod } from '../../types';
import {
  CreditCard,
  QrCode,
  Globe,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Copy,
  Upload,
  Sparkles,
  Zap,
  Building2,
  Smartphone,
  ShieldCheck,
  Send,
  Eye,
  Download,
  Image as ImageIcon,
  RefreshCw,
  Check,
  FileCheck,
  Activity,
  ArrowRight,
  Receipt,
  MessageSquare,
  Lock,
  Unlock,
  Radio,
  ExternalLink,
  Code,
} from 'lucide-react';
import { formatRupiah, formatDateTimeIndo } from '../../utils/formatters';
import { AutoMutationSettingsTab } from './AutoMutationSettingsTab';

interface WebhookLogItem {
  id: string;
  provider: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  status: '200_OK' | 'FAILED';
  signatureVerified: boolean;
  receivedAt: string;
  payload: string;
  actionsExecuted: string[];
}

export const PaymentConfigView: React.FC = () => {
  const {
    activeTab,
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    toggleBankAccount,
    qrisConfig,
    updateQRISConfig,
    paymentGatewayConfig,
    updatePaymentGatewayConfig,
    invoices,
    customers,
    payInvoice,
    unIsolateCustomer,
    sendWhatsAppMessage,
    getFormattedMessage,
  } = useApp();

  // Sub Tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<'auto_mutasi' | 'gateway' | 'rekening' | 'qris'>(() => {
    if (activeTab === 'payment-auto-mutasi') return 'auto_mutasi';
    if (activeTab === 'payment-gateway') return 'gateway';
    if (activeTab === 'payment-rekening') return 'rekening';
    if (activeTab === 'payment-qris') return 'qris';
    return 'auto_mutasi';
  });

  useEffect(() => {
    if (activeTab === 'payment-auto-mutasi') setActiveSubTab('auto_mutasi');
    else if (activeTab === 'payment-gateway') setActiveSubTab('gateway');
    else if (activeTab === 'payment-rekening') setActiveSubTab('rekening');
    else if (activeTab === 'payment-qris') setActiveSubTab('qris');
  }, [activeTab]);

  // Bank Form
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState<Omit<BankRekening, 'id'>>({
    bankCode: 'BCA',
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '',
    accountHolder: 'MASMEDIA DIGITAL',
    isQris: false,
    isActive: true,
    description: 'Transfer via BCA Mobile / ATM / Virtual Account',
  });

  // QRIS Form & Upload State
  const [qrisForm, setQrisForm] = useState(qrisConfig);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [copiedString, setCopiedString] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gateway Form
  const [gatewayForm, setGatewayForm] = useState(paymentGatewayConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [apiTestStatus, setApiTestStatus] = useState<{ testing: boolean; success: boolean | null; message: string | null }>({
    testing: false,
    success: null,
    message: null,
  });

  // Interactive Webhook Simulator State
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
  const [simInvoiceId, setSimInvoiceId] = useState<string>(unpaidInvoices[0]?.id || invoices[0]?.id || '');
  const [simChannel, setSimChannel] = useState<string>('QRIS');
  const [simExecuting, setSimExecuting] = useState(false);
  const [simResult, setSimResult] = useState<{
    success: boolean;
    invoiceId: string;
    customerName: string;
    amount: number;
    reference: string;
    actions: string[];
    waMessagePreview?: string;
  } | null>(null);

  // Webhook Logs
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogItem[]>([]);
  const [selectedLogPayload, setSelectedLogPayload] = useState<WebhookLogItem | null>(null);

  // Dynamic QRIS Generator Simulator
  const [dynQrisAmount, setDynQrisAmount] = useState<number>(150000);
  const [dynQrisCustomer, setDynQrisCustomer] = useState<string>('');
  const [dynQrisCodeUrl, setDynQrisCodeUrl] = useState<string>(
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226580016ID.CO.MASMEDIA.WWW01189360099887766554430215ID102002381290303UMI51440014ID.GO.QRIS.WWW0215ID102002381290303UMI52045812530336054061500005802ID5914MASMEDIA%20SPEED6007BANDUNG61054011562070703A01630489A1'
  );

  const handleGenerateDynQRIS = () => {
    const rawData = `00020101021226580016ID.CO.MASMEDIA.WWW01189360099887766554430215ID102002381290303UMI51440014ID.GO.QRIS.WWW0215ID102002381290303UMI5204581253033605406${dynQrisAmount}5802ID5914MASMEDIA%20SPEED6007BANDUNG61054011562070703A01630489A1`;
    setDynQrisCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(rawData)}`);
  };

  const handleOpenAddBank = () => {
    setEditingBankId(null);
    setBankForm({
      bankCode: 'BCA',
      bankName: 'Bank Central Asia (BCA)',
      accountNumber: '',
      accountHolder: 'MASMEDIA DIGITAL',
      isQris: false,
      isActive: true,
      description: 'Transfer bank otomatis',
    });
    setShowBankModal(true);
  };

  const handleOpenEditBank = (bank: BankRekening) => {
    setEditingBankId(bank.id);
    setBankForm({
      bankCode: bank.bankCode,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountHolder: bank.accountHolder,
      isQris: bank.isQris,
      isActive: bank.isActive,
      description: bank.description || '',
    });
    setShowBankModal(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBankId) {
      updateBankAccount(editingBankId, bankForm);
    } else {
      addBankAccount(bankForm);
    }
    setShowBankModal(false);
  };

  const handleSaveQRIS = (e: React.FormEvent) => {
    e.preventDefault();
    updateQRISConfig(qrisForm);
    setUploadSuccessMsg('Konfigurasi & Gambar QRIS Statis Masmedia berhasil disimpan!');
    setTimeout(() => setUploadSuccessMsg(null), 3500);
  };

  const processQRISFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('File yang diunggah harus berupa gambar (PNG, JPG, JPEG, atau WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      const updated = {
        ...qrisForm,
        qrImageUrl: dataUrl,
      };
      setQrisForm(updated);
      updateQRISConfig(updated);
      setUploadSuccessMsg(`Berhasil mengunggah gambar QRIS statis: "${file.name}"!`);
      setTimeout(() => setUploadSuccessMsg(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processQRISFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processQRISFile(file);
  };

  const handleResetQRISImage = () => {
    const defaultQR =
      'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226580016ID.CO.MASMEDIA.WWW01189360099887766554430215ID102002381290303UMI51440014ID.GO.QRIS.WWW0215ID102002381290303UMI5204581253033605802ID5914MASMEDIA%20SPEED6007BANDUNG61054011562070703A01630489A1';
    const updated = { ...qrisForm, qrImageUrl: defaultQR };
    setQrisForm(updated);
    updateQRISConfig(updated);
    setUploadSuccessMsg('Gambar QRIS dikembalikan ke default generator Masmedia.');
    setTimeout(() => setUploadSuccessMsg(null), 3000);
  };

  const handleGenerateQRFromString = () => {
    if (!qrisForm.qrisString) {
      alert('Masukkan string EMVCo QRIS terlebih dahulu.');
      return;
    }
    const encoded = encodeURIComponent(qrisForm.qrisString.trim());
    const generatedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encoded}`;
    const updated = { ...qrisForm, qrImageUrl: generatedUrl };
    setQrisForm(updated);
    updateQRISConfig(updated);
    setUploadSuccessMsg('QR Code berhasil di-generate dari string EMVCo!');
    setTimeout(() => setUploadSuccessMsg(null), 3000);
  };

  const handleCopyEMVCo = () => {
    if (qrisForm.qrisString) {
      navigator.clipboard.writeText(qrisForm.qrisString);
      setCopiedString(true);
      setTimeout(() => setCopiedString(false), 2000);
    }
  };

  const handleDownloadQRIS = () => {
    if (!qrisConfig.qrImageUrl) return;
    const a = document.createElement('a');
    a.href = qrisConfig.qrImageUrl;
    a.download = `QRIS_MASMEDIA_${qrisConfig.merchantName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentGatewayConfig(gatewayForm);
    alert('Pengaturan API Payment Gateway Masmedia berhasil disimpan!');
  };

  const handleTestApiConnection = () => {
    setApiTestStatus({ testing: true, success: null, message: null });
    setTimeout(() => {
      setApiTestStatus({
        testing: false,
        success: true,
        message: `Koneksi API ${gatewayForm.provider.toUpperCase()} (${gatewayForm.environment.toUpperCase()}) Berhasil! Merchant Valid & Saldo Escrow Siap.`,
      });
    }, 1200);
  };

  // Live Webhook Simulation & Auto-Settlement
  const handleExecuteWebhookSimulation = () => {
    if (!simInvoiceId) {
      alert('Pilih invoice yang ingin disimulasikan pembayarannya.');
      return;
    }

    const targetInvoice = invoices.find(i => i.id === simInvoiceId);
    if (!targetInvoice) return;

    setSimExecuting(true);
    const targetCustomer = customers.find(c => c.id === targetInvoice.customerId);
    const txRef = `${gatewayForm.provider.toUpperCase()}-PAY-${Date.now().toString().slice(-6)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setTimeout(() => {
      // 1. Pay invoice
      payInvoice(targetInvoice.id, 'payment_gateway', txRef, `${gatewayForm.provider.toUpperCase()} Auto Webhook`);

      // 2. Un-isolate customer if needed
      if (targetCustomer) {
        unIsolateCustomer(targetCustomer.id);
      }

      // 3. Format simulated WhatsApp receipt
      const waMsg = getFormattedMessage(targetInvoice.customerId, 'pembayaran_lunas', targetInvoice.id);

      // 4. Generate payload & log
      const payloadObj = {
        event: 'payment.settlement',
        provider: gatewayForm.provider,
        merchant_code: gatewayForm.merchantCode,
        transaction_reference: txRef,
        merchant_ref: targetInvoice.id,
        customer_id: targetInvoice.customerId,
        customer_name: targetInvoice.customerName,
        package_name: targetInvoice.packageName,
        channel: simChannel,
        amount: targetInvoice.totalAmount,
        status: 'PAID',
        paid_at: nowStr,
        signature: 'sha256_mock_' + Math.random().toString(36).substring(2, 18),
      };

      const actions = [
        `Verifikasi Signature HMAC SHA256 (${gatewayForm.provider.toUpperCase()}) VALID 100%`,
        `Invoice ${targetInvoice.id} status diubah menjadi LUNAS (Rp ${targetInvoice.totalAmount.toLocaleString('id-ID')})`,
        `Pelanggan "${targetInvoice.customerName}" otomatis dibuka isolir di RADIUS MikroTik (Address List clear)`,
        `Notifikasi WhatsApp Struk Bukti Bayar siap diteruskan ke nomor ${targetInvoice.customerPhone}`,
      ];

      const newLog: WebhookLogItem = {
        id: `WH-LOG-${Date.now().toString().slice(-4)}`,
        provider: gatewayForm.provider.toUpperCase(),
        invoiceId: targetInvoice.id,
        customerName: targetInvoice.customerName,
        amount: targetInvoice.totalAmount,
        paymentMethod: `${simChannel} Gateway`,
        transactionRef: txRef,
        status: '200_OK',
        signatureVerified: true,
        receivedAt: nowStr,
        payload: JSON.stringify(payloadObj, null, 2),
        actionsExecuted: actions,
      };

      setWebhookLogs(prev => [newLog, ...prev]);
      setSimResult({
        success: true,
        invoiceId: targetInvoice.id,
        customerName: targetInvoice.customerName,
        amount: targetInvoice.totalAmount,
        reference: txRef,
        actions,
        waMessagePreview: waMsg,
      });

      setSimExecuting(false);
    }, 800);
  };

  const channelOptions = [
    { code: 'QRIS', name: 'QRIS Realtime Dynamic', fee: '0.7%', badge: 'Instan' },
    { code: 'BCAVA', name: 'BCA Virtual Account', fee: 'Rp 2.000', badge: 'VA' },
    { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', fee: 'Rp 2.000', badge: 'VA' },
    { code: 'BRIVA', name: 'BRI Virtual Account', fee: 'Rp 2.000', badge: 'VA' },
    { code: 'BNIVA', name: 'BNI Virtual Account', fee: 'Rp 2.000', badge: 'VA' },
    { code: 'PERMATAVA', name: 'Permata Virtual Account', fee: 'Rp 2.000', badge: 'VA' },
    { code: 'ALFAMART', name: 'Alfamart / Alfamidi Retail', fee: 'Rp 3.500', badge: 'Retail' },
    { code: 'INDOMARET', name: 'Indomaret Retail Counter', fee: 'Rp 3.500', badge: 'Retail' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            Payment / Kanal Pembayaran Masmedia
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payment Gateway, Rekening Bank & QRIS</h1>
          <p className="text-sm text-slate-400 mt-1">
            Integrasi pembayaran otomatis Tripay / Midtrans / Xendit / Duitku, webhook live auto-isolir, dan rekening penampung.
          </p>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('auto_mutasi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'auto_mutasi'
              ? 'bg-blue-500 text-white shadow font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-400 group-hover:text-white" />
          Auto-Mutasi & Webhook (Moota / Cekmutasi)
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        </button>
        <button
          onClick={() => setActiveSubTab('gateway')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'gateway'
              ? 'bg-blue-500 text-white shadow font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          Payment Gateway API (Tripay / Midtrans)
        </button>
        <button
          onClick={() => setActiveSubTab('rekening')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'rekening'
              ? 'bg-blue-500 text-white shadow font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Nomor Rekening Bank ({bankAccounts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('qris')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'qris'
              ? 'bg-blue-500 text-white shadow font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Upload QRIS Merchant
        </button>
      </div>

      {/* SUB-MENU: AUTO-MUTASI & WEBHOOK (MOOTA / CEKMUTASI) */}
      {activeSubTab === 'auto_mutasi' && (
        <AutoMutationSettingsTab />
      )}

      {/* SUB-MENU 1: PAYMENT GATEWAY LIVE HUB */}
      {activeSubTab === 'gateway' && (
        <div className="space-y-6">
          {/* Quick Notice to Auto-Mutation */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white block">Mau otomatisasi verifikasi QRIS Statis atau Bank tanpa potongan biaya per transaksi gateway?</span>
                <span className="text-slate-400">Gunakan layanan Auto-Mutasi (Moota / Cekmutasi) dengan generator kode unik otomatis.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('auto_mutasi')}
              className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <span>Buka Auto-Mutasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Provider Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'tripay',
                name: 'Tripay PG',
                desc: 'QRIS 0.7%, VA Rp 2.000, Retail Mart, Callback Cepat',
                badge: 'Rekomendasi ISP',
                color: 'border-blue-500/40 bg-blue-500/5',
              },
              {
                id: 'midtrans',
                name: 'Midtrans SNAP',
                desc: 'GoPay, ShopeePay, Semua VA Bank, Kartu Kredit',
                badge: 'Multi-Channel',
                color: 'border-blue-500/40 bg-blue-500/5',
              },
              {
                id: 'xendit',
                name: 'Xendit Invoice',
                desc: 'XenInvoice, Direct Debit, QRIS Nasional, OVO',
                badge: 'Enterprise',
                color: 'border-purple-500/40 bg-purple-500/5',
              },
              {
                id: 'duitku',
                name: 'Duitku POP',
                desc: 'Biaya VA sangat hemat, LinkAja, Indomaret, Alfamart',
                badge: 'Hemat Biaya',
                color: 'border-amber-500/40 bg-amber-500/5',
              },
            ].map(prov => (
              <div
                key={prov.id}
                onClick={() => setGatewayForm({ ...gatewayForm, provider: prov.id as any })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  gatewayForm.provider === prov.id
                    ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase">{prov.name}</span>
                  <span className="text-[10px] font-bold text-white bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                    {prov.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{prov.desc}</p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-mono">Status:</span>
                  <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    {gatewayForm.provider === prov.id ? 'Terpilih' : 'Tersedia'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Credentials Config (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" />
                    Kredensial API {gatewayForm.provider.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Masukkan API Key & Secret Signature dari Dashboard Gateway Anda.
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                    gatewayForm.environment === 'production'
                      ? 'bg-blue-500/15 text-white border-blue-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  Mode {gatewayForm.environment}
                </span>
              </div>

              <form onSubmit={handleSaveGateway} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Pilihan Provider</label>
                    <select
                      value={gatewayForm.provider}
                      onChange={e => setGatewayForm({ ...gatewayForm, provider: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:border-blue-500 focus:outline-none"
                    >
                      <option value="tripay">Tripay Payment Gateway</option>
                      <option value="midtrans">Midtrans SNAP Gateway</option>
                      <option value="xendit">Xendit Invoice API</option>
                      <option value="duitku">Duitku Payment Hub</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Environment Mode</label>
                    <select
                      value={gatewayForm.environment}
                      onChange={e => setGatewayForm({ ...gatewayForm, environment: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="sandbox">Sandbox (Testing / Uji Coba)</option>
                      <option value="production">Production (Live Transaksi Nyata)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merchant Code / ID</label>
                  <input
                    type="text"
                    required
                    value={gatewayForm.merchantCode}
                    onChange={e => setGatewayForm({ ...gatewayForm, merchantCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. T19827 / M102938"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">API Key / Client Key</label>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {showApiKey ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {showApiKey ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={gatewayForm.apiKey}
                    onChange={e => setGatewayForm({ ...gatewayForm, apiKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="DEV-y78a892b192837482910..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Private Key (Secret Signature Key)</label>
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {showPrivateKey ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {showPrivateKey ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <input
                    type={showPrivateKey ? 'text' : 'password'}
                    value={gatewayForm.privateKey}
                    onChange={e => setGatewayForm({ ...gatewayForm, privateKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="DEV-sec-889128391829381928..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">URL Callback Webhook (Masukkan di Dashboard Gateway)</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(gatewayForm.callbackUrl);
                        alert('URL Webhook berhasil disalin!');
                      }}
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Salin URL
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={gatewayForm.callbackUrl}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-mono text-[11px] select-all"
                  />
                </div>

                {apiTestStatus.message && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      apiTestStatus.success
                        ? 'bg-blue-500/15 border-blue-500/30 text-white'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400" />
                      <span>{apiTestStatus.message}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleTestApiConnection}
                    disabled={apiTestStatus.testing}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Activity className={`w-3.5 h-3.5 ${apiTestStatus.testing ? 'animate-spin' : 'text-blue-400'}`} />
                    {apiTestStatus.testing ? 'Menguji API...' : 'Tes Koneksi API'}
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-3.5 h-3.5" /> Simpan Pengaturan
                  </button>
                </div>
              </form>
            </div>

            {/* Interactive Webhook Simulator & Auto-Settlement Tester (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Simulator Webhook & Auto-Isolir Clear
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Uji coba notifikasi pembayaran gateway otomatis melunaskan tagihan & buka isolir MikroTik secara instan.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {unpaidInvoices.length} Belum Bayar
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pilih Tagihan / Invoice yang Disimulasikan</label>
                  <select
                    value={simInvoiceId}
                    onChange={e => setSimInvoiceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:border-blue-500 focus:outline-none"
                  >
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} - {inv.customerName} ({formatRupiah(inv.totalAmount)}) - Status: {inv.status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pilih Kanal Pembayaran Simulasi</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {channelOptions.map(ch => (
                      <button
                        key={ch.code}
                        type="button"
                        onClick={() => setSimChannel(ch.code)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          simChannel === ch.code
                            ? 'border-blue-400 bg-blue-500/15 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{ch.code}</div>
                        <div className="text-[9px] text-slate-500">{ch.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExecuteWebhookSimulation}
                    disabled={simExecuting}
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                  >
                    <Zap className={`w-4 h-4 ${simExecuting ? 'animate-bounce' : ''}`} />
                    {simExecuting ? 'Memproses Webhook Callback & RADIUS CoA...' : '⚡ Kirim Webhook Test & Eksekusi Otomatis'}
                  </button>
                </div>

                {simResult && (
                  <div className="bg-slate-950 border border-blue-500/40 rounded-xl p-3.5 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        Webhook 200 OK: {simResult.invoiceId} LUNAS
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{simResult.reference}</span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      {simResult.actions.map((act, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                          <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>

                    {simResult.waMessagePreview && (
                      <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[10.5px] text-slate-300 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                        <div className="text-[9.5px] font-bold text-white mb-1">Pratinjau Struk WhatsApp:</div>
                        {simResult.waMessagePreview}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Webhook Callback Logs Inspector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white" />
                  Riwayat Log Webhook & Transaksi Gateway ({webhookLogs.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit log panggilan webhook masuk dari provider gateway beserta verifikasi tanda tangan kriptografi.
                </p>
              </div>
              <button
                onClick={() => setWebhookLogs([])}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Bersihkan Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2.5">Waktu</th>
                    <th className="pb-2.5">Provider</th>
                    <th className="pb-2.5">No. Invoice</th>
                    <th className="pb-2.5">Pelanggan</th>
                    <th className="pb-2.5">Kanal / Nominal</th>
                    <th className="pb-2.5">Status HTTP</th>
                    <th className="pb-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {webhookLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono text-slate-400 text-[11px]">{log.receivedAt}</td>
                      <td className="py-3 font-bold text-white">{log.provider}</td>
                      <td className="py-3 font-mono text-white font-bold">{log.invoiceId}</td>
                      <td className="py-3 text-slate-300">{log.customerName}</td>
                      <td className="py-3">
                        <div className="font-bold text-white">{formatRupiah(log.amount)}</div>
                        <div className="text-[10px] text-slate-400">{log.paymentMethod}</div>
                      </td>
                      <td className="py-3">
                        <span className="bg-blue-500/20 text-white border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedLogPayload(log)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 ml-auto"
                        >
                          <Code className="w-3 h-3 text-white" /> Lihat Payload
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 2: INPUT NOMOR REKENING */}
      {activeSubTab === 'rekening' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white" />
                Daftar Rekening Bank & E-Wallet Penampung Masmedia
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rekening yang tampil di nota tagihan, kuitansi cetak, dan portal pelanggan mandiri.
              </p>
            </div>
            <button
              onClick={handleOpenAddBank}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow"
            >
              <Plus className="w-4 h-4" />
              + Tambah No. Rekening
            </button>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-white flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Belum Ada Daftar Rekening Bank / E-Wallet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Tambahkan rekening bank resmi (BCA, Mandiri, BRI, BNI) atau akun e-wallet (DANA, OVO, GoPay) untuk menerima transfer pembayaran tagihan pelanggan secara manual/otomatis.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddBank}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Tambah Rekening Bank Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAccounts.map(bank => (
                <div
                  key={bank.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-white bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
                          {bank.bankCode}
                        </span>
                        <h4 className="font-bold text-white text-base mt-1">{bank.bankName}</h4>
                      </div>
                      <button
                        onClick={() => toggleBankAccount(bank.id)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          bank.isActive ? 'bg-blue-500/20 text-white' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {bank.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>

                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs mb-3">
                      <div className="text-slate-400 text-[11px]">Nomor Rekening:</div>
                      <div className="font-mono font-bold text-white text-base tracking-wide flex items-center justify-between">
                        <span>{bank.accountNumber}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bank.accountNumber);
                            alert(`Nomor rekening ${bank.accountNumber} disalin!`);
                          }}
                          className="text-slate-400 hover:text-blue-400 p-1 cursor-pointer"
                          title="Salin Nomor"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-slate-400 text-[11px] pt-1">
                        Atas Nama (a/n): <strong className="text-slate-200">{bank.accountHolder}</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{bank.description}</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-3">
                    <button
                      onClick={() => handleOpenEditBank(bank)}
                      className="text-slate-400 hover:text-blue-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Rekening"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus rekening ${bank.bankName} (${bank.accountNumber})?`)) {
                          deleteBankAccount(bank.id);
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-MENU 3: UPLOAD QRIS STATIS & DYNAMIC SIMULATOR */}
      {activeSubTab === 'qris' && (
        <div className="space-y-6">
          {uploadSuccessMsg && (
            <div className="flex items-center gap-2.5 bg-blue-500/15 border border-blue-500/30 text-white px-4 py-3 rounded-2xl text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Upload Zone & Form Settings */}
            <div className="lg:col-span-7 space-y-5">
              {/* Dedicated Upload Area for Static QRIS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Upload className="w-5 h-5 text-white" />
                      Upload Gambar QRIS Statis Merchant Masmedia
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Unggah foto/gambar QRIS resmi (BCA, Mandiri, BRI, ShopeePay, Dana, GoPay, Nobu, atau DOKU).
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-white border border-blue-500/30 px-2.5 py-1 rounded-full">
                    QRIS Statis Aktif
                  </span>
                </div>

                {/* Drag and Drop Zone */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-400 bg-blue-500/10'
                      : 'border-slate-700/80 hover:border-blue-500/60 bg-slate-950/60 hover:bg-slate-950/90'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Klik untuk Memilih File atau Tarik (Drag & Drop) Foto QRIS
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Mendukung format PNG, JPG, JPEG, WEBP (Resolusi jernih agar mudah di-scan kamera HP).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Pilih Foto QRIS dari Komputer / HP
                    </button>
                  </div>
                </div>

                {/* Action Buttons for QRIS Image */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadQRIS}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      title="Download QRIS Image"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      Download Gambar QRIS
                    </button>
                    <button
                      type="button"
                      onClick={handleResetQRISImage}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 px-3 py-1.5 text-xs transition-all"
                      title="Reset ke gambar default"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Gambar Default
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">Otomatis tersinkron ke invoice & portal</span>
                </div>
              </div>

              {/* Data & Merchant Info Form */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  Informasi & Parameter Merchant QRIS Masmedia
                </h3>

                <form onSubmit={handleSaveQRIS} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nama Merchant / Usaha (Muncul di Header QRIS)
                    </label>
                    <input
                      type="text"
                      required
                      value={qrisForm.merchantName}
                      onChange={e => setQrisForm({ ...qrisForm, merchantName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Masmedia Digital Network"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">NMID (National Merchant ID)</label>
                      <input
                        type="text"
                        required
                        value={qrisForm.nmid}
                        onChange={e => setQrisForm({ ...qrisForm, nmid: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                        placeholder="e.g. ID1020023812903"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Kota / Domisili Merchant</label>
                      <input
                        type="text"
                        value={qrisForm.city}
                        onChange={e => setQrisForm({ ...qrisForm, city: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-blue-500 focus:outline-none"
                        placeholder="e.g. BANDUNG"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-semibold">String Payload EMVCo QRIS (Opsional)</label>
                      <div className="flex items-center gap-2">
                        {qrisForm.qrisString && (
                          <button
                            type="button"
                            onClick={handleCopyEMVCo}
                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {copiedString ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedString ? 'Tersalin!' : 'Salin String'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleGenerateQRFromString}
                          className="text-[10px] text-teal-400 hover:underline"
                        >
                          Generate QR dari String
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={qrisForm.qrisString}
                      onChange={e => setQrisForm({ ...qrisForm, qrisString: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-[10px] focus:border-blue-500 focus:outline-none"
                      placeholder="00020101021226580016ID.CO.MASMEDIA.WWW01189360099887766554430215..."
                    />
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-800">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      Simpan Pengaturan QRIS
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Live QRIS Standar ASPI / BI Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 sticky top-20">
                <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-300">Pratinjau QRIS Masmedia</span>
                  <button
                    type="button"
                    onClick={handleDownloadQRIS}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Gambar
                  </button>
                </div>

                {/* Standar BI / ASPI Style Card */}
                <div className="bg-white p-5 rounded-2xl shadow-2xl max-w-[290px] w-full text-slate-950 space-y-3 border border-slate-200">
                  <div className="border-b border-slate-200 pb-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-[12px] font-black tracking-widest text-slate-950">QRIS</span>
                      <span className="text-[9px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded">
                        STANDAR ASPI / BI
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight">
                      {qrisConfig.merchantName}
                    </div>
                    <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">NMID: {qrisConfig.nmid}</div>
                    {qrisConfig.city && <div className="text-[8.5px] text-slate-400 uppercase">{qrisConfig.city}</div>}
                  </div>

                  <div className="bg-white p-2 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner">
                    <img
                      src={
                        qrisConfig.qrImageUrl ||
                        'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MASMEDIA_QRIS_SAMPLE'
                      }
                      alt="QRIS Merchant"
                      className="w-52 h-52 object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-2">
                    <div className="text-[8px] text-slate-500 uppercase font-bold tracking-wider leading-tight">
                      Menerima Seluruh Pembayaran Digital
                    </div>
                    <div className="text-[7.5px] text-slate-400 mt-1 font-medium">
                      BCA Mobile • Livin Mandiri • BRImo • BNI Mobile • DANA • GoPay • OVO • ShopeePay • LinkAja
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 max-w-xs text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-blue-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Siap Digunakan di Invoice & Portal</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Gambar QRIS statis ini langsung tampil saat pelanggan membuka rincian tagihan atau tautan pembayaran WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Bank */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Tambah Nomor Rekening Bank
            </h3>
            <form onSubmit={handleSaveBank} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kode Bank</label>
                  <input
                    type="text"
                    required
                    value={bankForm.bankCode}
                    onChange={e => setBankForm({ ...bankForm, bankCode: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                    placeholder="BCA / BRI / DANA"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Bank</label>
                  <input
                    type="text"
                    required
                    value={bankForm.bankName}
                    onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="Bank Central Asia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nomor Rekening / No. HP E-Wallet</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountNumber}
                  onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  placeholder="8821098712"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Atas Nama (Account Holder)</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountHolder}
                  onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase"
                  placeholder="MASMEDIA DIGITAL"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  value={bankForm.description}
                  onChange={e => setBankForm({ ...bankForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Webhook Raw JSON Payload */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  Detail Raw Payload Webhook ({selectedLogPayload.provider})
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Ref: {selectedLogPayload.transactionRef} • {selectedLogPayload.receivedAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Eksekusi Tindakan Otomatis:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                {selectedLogPayload.actionsExecuted.map((act, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-blue-300">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Raw JSON Payload:</span>
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-blue-400 overflow-x-auto max-h-60">
                {selectedLogPayload.payload}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogPayload(null)}
                className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
