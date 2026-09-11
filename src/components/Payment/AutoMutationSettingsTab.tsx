import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  Sparkles,
  Key,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Layers,
  Info,
  ShieldCheck,
  Clock,
  ArrowRight,
  Send,
  Save,
  QrCode,
  Building,
  Smartphone,
  Server
} from 'lucide-react';
import { formatRupiah, formatDateTimeIndo } from '../../utils/formatters';
import { AutoMutationConfig, AutoMutationWebhookLog } from '../../types';

export const AutoMutationSettingsTab: React.FC = () => {
  const {
    paymentChannels,
    updatePaymentChannels,
    invoices,
    customers,
    unIsolateCustomer,
    sendWhatsAppMessage,
    getFormattedMessage,
    processIncomingAutoMutation,
  } = useApp();

  const currentConfig: AutoMutationConfig = paymentChannels.autoMutationConfig || {
    enabled: true,
    provider: 'moota',
    webhookSecret: 'whsec_masmedia_9a8b7c6d5e4f3a2b',
    uniqueCodeEnabled: true,
    uniqueCodeRange: { min: 101, max: 999 },
    excessHandling: 'isp_revenue',
    bankTarget: 'ALL',
    autoSettle: true,
    webhookLogs: [],
  };

  // Form State
  const [enabled, setEnabled] = useState(currentConfig.enabled);
  const [provider, setProvider] = useState<'moota' | 'cekmutasi' | 'hijrahpay' | 'android_forwarder' | 'custom'>(
    currentConfig.provider || 'moota'
  );
  const [apiToken, setApiToken] = useState(currentConfig.apiToken || '');
  const [webhookSecret, setWebhookSecret] = useState(
    currentConfig.webhookSecret || 'whsec_masmedia_9a8b7c6d5e4f3a2b'
  );
  const [showSecret, setShowSecret] = useState(false);
  const [uniqueCodeEnabled, setUniqueCodeEnabled] = useState(currentConfig.uniqueCodeEnabled);
  const [codeMin, setCodeMin] = useState(currentConfig.uniqueCodeRange?.min || 101);
  const [codeMax, setCodeMax] = useState(currentConfig.uniqueCodeRange?.max || 999);
  const [excessHandling, setExcessHandling] = useState<'isp_revenue' | 'customer_deposit'>(
    currentConfig.excessHandling || 'isp_revenue'
  );
  const [bankTarget, setBankTarget] = useState(currentConfig.bankTarget || 'ALL');

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedMootaUrl, setCopiedMootaUrl] = useState(false);
  const [copiedCekmutasiUrl, setCopiedCekmutasiUrl] = useState(false);
  const [copiedGenericUrl, setCopiedGenericUrl] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Interactive Live Generator Demo
  const [calcSampleAmount, setCalcSampleAmount] = useState<number>(150000);
  const [calcSampleCode, setCalcSampleCode] = useState<number>(247);

  // Simulator State
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
  const [simInvoiceId, setSimInvoiceId] = useState<string>(unpaidInvoices[0]?.id || invoices[0]?.id || '');
  const [simBank, setSimBank] = useState<string>('BCA');
  const [simCustomAmount, setSimCustomAmount] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
    invoiceId?: string;
    customerName?: string;
    actionsExecuted?: string[];
  } | null>(null);

  // Detail Payload Modal
  const [inspectLog, setInspectLog] = useState<AutoMutationWebhookLog | null>(null);

  // Webhook URLs
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://masmedia.app';
  const mootaWebhookUrl = `${baseUrl}/api/webhook/moota`;
  const cekmutasiWebhookUrl = `${baseUrl}/api/webhook/cekmutasi`;
  const genericWebhookUrl = `${baseUrl}/api/webhook/auto-mutasi`;

  // Auto-sync simulated amount whenever selected invoice changes
  useEffect(() => {
    if (simInvoiceId) {
      const selected = invoices.find(i => i.id === simInvoiceId);
      if (selected) {
        const code = selected.uniqueCode || 124;
        const total = selected.amountWithCode || (selected.totalAmount + code);
        setSimCustomAmount(total);
      }
    }
  }, [simInvoiceId, invoices]);

  // Generate a cryptographically secure random secret key
  const handleGenerateNewSecret = async () => {
    try {
      const res = await fetch('/api/webhook/generate-secret', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.secret) {
          setWebhookSecret(data.secret);
          setSaveSuccessMsg('Kunci rahasia Webhook baru berhasil di-generate!');
          setTimeout(() => setSaveSuccessMsg(null), 3000);
          return;
        }
      }
    } catch {
      // Fallback local random generator
    }
    const chars = 'abcdef0123456789';
    let rand = '';
    for (let i = 0; i < 24; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    const newSec = `whsec_masmedia_${rand}`;
    setWebhookSecret(newSec);
    setSaveSuccessMsg('Kunci rahasia Webhook baru berhasil di-generate!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Shuffle sample code for interactive preview
  const handleShufflePreviewCode = () => {
    const range = Math.max(10, codeMax - codeMin);
    const newCode = Math.floor(codeMin + Math.random() * range);
    setCalcSampleCode(newCode);
  };

  const handleCopy = (text: string, type: 'secret' | 'moota' | 'cekmutasi' | 'generic') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'moota') {
      setCopiedMootaUrl(true);
      setTimeout(() => setCopiedMootaUrl(false), 2000);
    } else if (type === 'cekmutasi') {
      setCopiedCekmutasiUrl(true);
      setTimeout(() => setCopiedCekmutasiUrl(false), 2000);
    } else if (type === 'generic') {
      setCopiedGenericUrl(true);
      setTimeout(() => setCopiedGenericUrl(false), 2000);
    }
  };

  // Save Config
  const handleSaveConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedConfig: AutoMutationConfig = {
      enabled,
      provider,
      apiToken: apiToken.trim(),
      webhookSecret: webhookSecret.trim(),
      uniqueCodeEnabled,
      uniqueCodeRange: { min: Number(codeMin), max: Number(codeMax) },
      excessHandling,
      bankTarget,
      autoSettle: true,
      webhookLogs: currentConfig.webhookLogs || [],
    };

    updatePaymentChannels({
      ...paymentChannels,
      autoMutationConfig: updatedConfig,
    });

    setSaveSuccessMsg('Pengaturan Webhook Auto-Mutasi & Kode Unik berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Execute Webhook Simulation
  const handleExecuteSimulation = async () => {
    if (!simCustomAmount || simCustomAmount <= 0) return;
    setIsSimulating(true);

    try {
      // 1. Post to backend webhook endpoint for persistence and audit
      await fetch('/api/webhook/auto-mutasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          bank: simBank,
          amount: simCustomAmount,
          description: `SIMULASI AUTO-MUTASI ${provider.toUpperCase()} [${simBank}] Rp ${simCustomAmount}`,
          secret: webhookSecret,
        }),
      }).catch(() => null);

      // 2. Process in AppContext to auto-settle invoice and un-isolate customer
      const res = processIncomingAutoMutation({
        provider,
        bank: simBank,
        amount: simCustomAmount,
        description: `SIMULASI AUTO-MUTASI WEBHOOK ${provider.toUpperCase()} [${simBank}]`,
      });

      const matchedInv = invoices.find(i => i.id === res.invoiceId);
      if (matchedInv && res.success) {
        unIsolateCustomer(matchedInv.customerId);
      }

      setSimResult({
        success: res.success,
        message: res.message,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        invoiceId: res.invoiceId,
        customerName: res.customerName,
        actionsExecuted: res.success
          ? [
              `Status invoice ${res.invoiceId} diubah menjadi 'paid' (LUNAS)`,
              `Status isolir pelanggan ${res.customerName} dicabut di MikroTik Router`,
              `Kuitansi bukti pembayaran resmi diterbitkan secara otomatis`,
              `Notifikasi WhatsApp konfirmasi pembayaran siap dikirimkan`,
            ]
          : ['Nominal mutasi tidak cocok dengan tagihan invoice belum lunas manapun.'],
      });
    } catch (e: any) {
      setSimResult({
        success: false,
        message: `Terjadi kendala pemrosesan webhook: ${e.message}`,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const webhookLogs = paymentChannels.autoMutationConfig?.webhookLogs || [];

  return (
    <div className="space-y-6">
      {/* Header Banner & Master Switch */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div
            className={`p-3.5 rounded-2xl ${
              enabled
                ? 'bg-blue-500/20 text-white border border-blue-500/40 shadow-lg shadow-blue-500/10'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-white">
                Sistem Webhook Auto-Mutasi Rekening & QRIS Statis
              </h3>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  enabled
                    ? 'bg-blue-500/20 text-white border border-blue-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {enabled ? 'AKTIF ONLINE' : 'NON-AKTIF'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Mendeteksi transaksi transfer bank (BCA, Mandiri, BRI, BNI) dan QRIS Statis secara realtime melalui webhook layanan mutasi (Moota / Cekmutasi). Sistem otomatis melunasi tagihan dan membuka isolir MikroTik <strong className="text-blue-300">100% tanpa campur tangan admin manual</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
          </label>
          <button
            type="button"
            onClick={() => handleSaveConfig()}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-white text-xs font-semibold animate-fadeIn shadow-md">
          <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid Layout: Settings (Left 7 Cols) & Live Simulator/Logs (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Provider, Unique Code, Secret Key & Endpoints */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Provider Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Pilih Layanan Auto-Mutasi
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'moota', name: 'Moota.co', badge: 'Populer & Stabil', desc: 'BCA, Mandiri, BRI, QRIS' },
                { id: 'cekmutasi', name: 'Cekmutasi.com', badge: 'Multi Bank & E-Wallet', desc: 'OVO, GoPay, DANA, BCA' },
                { id: 'hijrahpay', name: 'HijrahPay', badge: 'Syariah & BSI', desc: 'BSI, Muamalat & QRIS' },
                { id: 'android_forwarder', name: 'Android Notif', badge: 'Gratis SMS/App', desc: 'MacroDroid / Tasker' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    provider === p.id
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{p.name}</span>
                    {provider === p.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <span className="text-[10px] text-blue-400 block font-semibold">{p.badge}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{p.desc}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  API Token Provider (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="Contoh: moota_tok_xxxxxxxxxxxx"
                  value={apiToken}
                  onChange={e => setApiToken(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Rekening Bank / QRIS yang Dipantau
                </label>
                <select
                  value={bankTarget}
                  onChange={e => setBankTarget(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Semua Rekening & QRIS Terdaftar</option>
                  <option value="BCA">Khusus Rekening BCA</option>
                  <option value="MANDIRI">Khusus Rekening Mandiri</option>
                  <option value="BRI">Khusus Rekening BRI</option>
                  <option value="QRIS">Khusus QRIS Statis Merchant</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Automatic Unique Code Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Generator Kode Unik Otomatis (Reconciliation Engine)
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={uniqueCodeEnabled}
                  onChange={e => setUniqueCodeEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem secara otomatis menambahkan 3 digit kode unik ke tagihan (contoh: paket Rp 150.000 menjadi Rp 150.247). Ketika dana masuk persis Rp 150.247, webhook mutasi bank langsung melunasi tagihan tanpa salah sasaran.
            </p>

            {/* Range Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Digit Minimal Kode Unik
                </label>
                <input
                  type="number"
                  min={1}
                  max={900}
                  value={codeMin}
                  onChange={e => setCodeMin(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Default: 101 (hindari angka genap 00)</span>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Digit Maksimal Kode Unik
                </label>
                <input
                  type="number"
                  min={100}
                  max={999}
                  value={codeMax}
                  onChange={e => setCodeMax(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Maksimal 3 digit: 999</span>
              </div>
            </div>

            {/* Excess Handling */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                Perlakuan Selisih Nominal Kode Unik:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    excessHandling === 'isp_revenue'
                      ? 'bg-blue-500/10 border-blue-500 text-white'
                      : 'bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="excessHandling"
                    value="isp_revenue"
                    checked={excessHandling === 'isp_revenue'}
                    onChange={() => setExcessHandling('isp_revenue')}
                    className="text-blue-400"
                  />
                  <span>Pendapatan ISP / Biaya Admin (Disarankan)</span>
                </label>

                <label
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    excessHandling === 'customer_deposit'
                      ? 'bg-blue-500/10 border-blue-500 text-white'
                      : 'bg-slate-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="excessHandling"
                    value="customer_deposit"
                    checked={excessHandling === 'customer_deposit'}
                    onChange={() => setExcessHandling('customer_deposit')}
                    className="text-blue-400"
                  />
                  <span>Dicatat Saldo Deposit Pelanggan</span>
                </label>
              </div>
            </div>

            {/* Interactive Live Generator Demo Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Pratinjau Kode Unik di Invoice & QRIS:
                </span>
                <button
                  type="button"
                  onClick={handleShufflePreviewCode}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Acak Ulang Kode
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Harga Paket:</span>
                  <span className="font-bold text-white font-mono">{formatRupiah(calcSampleAmount)}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-blue-400 font-bold block">+ Kode Unik:</span>
                  <span className="font-bold text-blue-300 font-mono">+{calcSampleCode}</span>
                </div>
                <div className="p-2 bg-blue-950/40 rounded-xl border border-blue-500/30">
                  <span className="text-[10px] text-blue-400 font-bold block">Total Transfer:</span>
                  <span className="font-bold text-white font-mono">
                    {formatRupiah(calcSampleAmount + calcSampleCode)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic text-center">
                💡 Pelanggan diminta transfer persis <strong className="text-white font-mono">{formatRupiah(calcSampleAmount + calcSampleCode)}</strong> agar webhook mutasi mendeteksi lunas dalam 2 detik.
              </p>
            </div>
          </div>

          {/* Card 3: Secret Key & Callback Endpoints */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              Kunci Rahasia Webhook & URL Callback Endpoint
            </h4>

            {/* Secret Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Kunci Rahasia Webhook (Webhook Secret / Signature Key)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateNewSecret}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Generate Secret Key Baru
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={webhookSecret}
                  onChange={e => setWebhookSecret(e.target.value)}
                  className="w-full pl-3 pr-24 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title={showSecret ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(webhookSecret, 'secret')}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Salin Kunci Rahasia"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Salin kunci ini ke formulir pengaturan webhook Moota/Cekmutasi untuk memvalidasi tanda tangan pengirim.
              </span>
            </div>

            {/* Endpoints */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">
                Pilih URL Callback Sesuai Layanan Mutasi:
              </span>

              {/* Moota Endpoint */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Endpoint Callback Moota.co:
                  </span>
                  <span className="text-xs text-white font-mono truncate block">{mootaWebhookUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(mootaWebhookUrl, 'moota')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedMootaUrl ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMootaUrl ? 'Tersalin' : 'Salin URL'}</span>
                </button>
              </div>

              {/* Cekmutasi Endpoint */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    Endpoint Callback Cekmutasi.com:
                  </span>
                  <span className="text-xs text-white font-mono truncate block">{cekmutasiWebhookUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(cekmutasiWebhookUrl, 'cekmutasi')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedCekmutasiUrl ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCekmutasiUrl ? 'Tersalin' : 'Salin URL'}</span>
                </button>
              </div>

              {/* Generic / Android Endpoint */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Endpoint Custom / Android MacroDroid (SMS / m-Banking):
                  </span>
                  <span className="text-xs text-white font-mono truncate block">{genericWebhookUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(genericWebhookUrl, 'generic')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedGenericUrl ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGenericUrl ? 'Tersalin' : 'Salin URL'}</span>
                </button>
              </div>
            </div>

            {/* Quick 3 Step Guide */}
            <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                Panduan Integrasi 3 Langkah Cepat:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                <li>Buka dasbor penyedia mutasi (<strong className="text-slate-200">Moota</strong> atau <strong className="text-slate-200">Cekmutasi</strong>) &rarr; masuk ke menu <strong>Integrasi Webhook</strong>.</li>
                <li>Buat Webhook baru, tempelkan <strong>URL Callback</strong> di atas.</li>
                <li>Isi <strong>Webhook Secret</strong> di atas ke kolom Token/Signature &rarr; Simpan & Kirim Uji Coba.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Realtime Webhook Simulator & QRIS Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Simulator Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Simulator Webhook Real-time
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-white border border-blue-500/30">
                LIVE TEST
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Uji coba pengiriman payload mutasi dana masuk dari bank/QRIS persis seperti yang dikirim oleh server Moota / Cekmutasi:
            </p>

            <div className="space-y-3">
              {/* Select Invoice */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Pilih Invoice Belum Lunas:
                </label>
                <select
                  value={simInvoiceId}
                  onChange={e => setSimInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  {invoices.map(inv => {
                    const code = inv.uniqueCode || 124;
                    const withCode = inv.amountWithCode || (inv.totalAmount + code);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} - {inv.customerName} ({formatRupiah(withCode)}) [{inv.status.toUpperCase()}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Bank & Amount Fields */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Rekening Tujuan</label>
                  <select
                    value={simBank}
                    onChange={e => setSimBank(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="BCA">Bank BCA</option>
                    <option value="MANDIRI">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="QRIS">QRIS Merchant</option>
                    <option value="DANA">DANA E-Wallet</option>
                    <option value="GOPAY">GoPay E-Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nominal Mutasi (Rp)</label>
                  <input
                    type="number"
                    value={simCustomAmount}
                    onChange={e => setSimCustomAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-blue-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Execute Simulator Button */}
              <button
                type="button"
                disabled={isSimulating}
                onClick={handleExecuteSimulation}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Memproses Sinyal Webhook...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Kirim Sinyal Mutasi Masuk (Otomatis Lunas)</span>
                  </>
                )}
              </button>

              {/* Simulation Result Box */}
              {simResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-mono space-y-2 animate-fadeIn ${
                    simResult.success
                      ? 'bg-blue-950/40 border-blue-500/40 text-white'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {simResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                      {simResult.success ? 'HTTP 200 OK (AUTO-SETTLED)' : 'HTTP 400 NOT MATCHED'}
                    </span>
                    <span className="text-[10px] text-slate-400">{simResult.timestamp}</span>
                  </div>

                  <p className="text-[11px] leading-relaxed font-sans">{simResult.message}</p>

                  {simResult.actionsExecuted && simResult.actionsExecuted.length > 0 && (
                    <div className="pt-2 border-t border-blue-500/20 space-y-1 font-sans text-[11px]">
                      <span className="font-bold text-white block">Tindakan Otomatis Dijalankan:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {simResult.actionsExecuted.map((act, idx) => (
                          <li key={idx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* QRIS & Rekening Info Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pratinjau QRIS Statis Merchant Terhubung
            </span>
            <div className="w-36 h-36 bg-white p-2 rounded-2xl border-2 border-blue-500 mx-auto flex items-center justify-center shadow-lg">
              <QrCode className="w-32 h-32 text-slate-900" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {paymentChannels.merchantName || 'MASMEDIA NETWORK'}
              </span>
              <span className="text-xs text-slate-400">
                NMID: ID102008899812 &bull; QRIS Standar Bank Indonesia
              </span>
            </div>
            <p className="text-[10px] text-slate-400 px-4">
              Kode QRIS Statis ini dapat dipasang di loket kasir atau dicetak pada kartu tagihan pelanggan. Pembayaran akan terdeteksi otomatis via webhook Moota / Cekmutasi.
            </p>
          </div>
        </div>
      </div>

      {/* Table: Recent Webhook Mutation Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Log Callback Mutasi Masuk Terkini ({webhookLogs.length})
          </h4>
          <span className="text-xs text-slate-400">Audit trail sinkronisasi otomatis dari server</span>
        </div>

        {webhookLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            Belum ada transaksi mutasi yang masuk. Anda dapat menggunakan panel simulator di atas untuk menguji coba.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Waktu Masuk</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Bank / Channel</th>
                  <th className="px-4 py-3 text-right">Nominal Mutasi</th>
                  <th className="px-4 py-3">No. Invoice Cocok</th>
                  <th className="px-4 py-3">Nama Pelanggan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {webhookLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {formatDateTimeIndo(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-bold uppercase text-white">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {log.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-blue-400 font-bold">{log.bank}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {formatRupiah(log.amount)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-300">
                      {log.matchedInvoiceId || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-200">{log.matchedCustomerName || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'success'
                            ? 'bg-blue-500/20 text-white border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {log.status === 'success' ? '200 Lunas' : 'Belum Cocok'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectLog(log)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Detail JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Inspect Log JSON */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Detail Raw Payload Mutasi Masuk
              </h4>
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div>
                <strong>ID Log:</strong> <span className="font-mono text-slate-400">{inspectLog.id}</span>
              </div>
              <div>
                <strong>Provider:</strong> <span className="font-bold text-white uppercase">{inspectLog.provider}</span>
              </div>
              <div>
                <strong>Bank / Channel:</strong> <span className="text-blue-400 font-bold">{inspectLog.bank}</span>
              </div>
              <div>
                <strong>Nominal Terbaca:</strong> <span className="font-mono text-white font-bold">{formatRupiah(inspectLog.amount)}</span>
              </div>
              <div>
                <strong>Keterangan Mutasi:</strong> <span className="text-slate-400">{inspectLog.message}</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Raw Payload JSON:</span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-blue-300 font-mono overflow-x-auto max-h-52 whitespace-pre-wrap">
                {inspectLog.rawPayload || JSON.stringify(inspectLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
