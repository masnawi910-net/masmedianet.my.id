import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  Terminal,
  FileCode2,
  Copy,
  Check,
  Download,
  Eye,
  RefreshCw,
  Zap,
  Shield,
  Wifi,
  Network,
  Sliders,
  Cpu,
  ArrowRight,
  Send,
  HelpCircle,
  ExternalLink,
  Layers,
  Code2,
  CheckCircle2,
  Printer,
  ChevronRight,
  Search,
  Router,
} from 'lucide-react';
import { MikrotikFormGenerators } from './MikrotikFormGenerators';

interface AIPreset {
  id: string;
  title: string;
  category: 'hotspot' | 'qos' | 'security' | 'loadbalance' | 'radius_isolir' | 'vpn';
  categoryLabel: string;
  icon: React.ElementType;
  description: string;
  prompt: string;
  isHTML?: boolean;
}

const AI_PRESETS: AIPreset[] = [
  {
    id: 'hotspot-a4-21',
    title: 'Template Hotspot A4 (21 Voucher per Lembar)',
    category: 'hotspot',
    categoryLabel: 'Hotspot Voucher',
    icon: Printer,
    description: 'Format presisi 3x7 (21 kartu) per lembar A4 portrait dengan QR Code scan login dan desain modern minimalis.',
    prompt: 'Buatkan kode HTML dan CSS lengkap untuk template voucher Hotspot lembar A4 berisi 21 voucher (grid 3 kolom x 7 baris). Sertakan variabel MikroTik $(username), $(price), $(limit-uptime), barcode/QR code, dan kontak CS WA dengan gaya elegan modern.',
    isHTML: true,
  },
  {
    id: 'hotspot-thermal-58',
    title: 'Template Struk Thermal 58mm / 80mm POS',
    category: 'hotspot',
    categoryLabel: 'Hotspot Voucher',
    icon: Wifi,
    description: 'Format struk kasir mini hemat kertas untuk printer thermal Bluetooth / USB dengan font monospaced tebal.',
    prompt: 'Buatkan kode HTML dan CSS template voucher Hotspot khusus printer kasir Thermal 58mm/80mm dengan layout ringkas, kode voucher besar, batas putus-putus, dan petunjuk login.',
    isHTML: true,
  },
  {
    id: 'hotspot-login-modern',
    title: 'Captive Portal Login Page (Glassmorphism & Mobile)',
    category: 'hotspot',
    categoryLabel: 'Hotspot Login',
    icon: FileCode2,
    description: 'Halaman login hotspot responsif modern dengan status kuota, formulir kode voucher cepat, dan integrasi WhatsApp.',
    prompt: 'Buatkan kode halaman login Hotspot (login.html) captive portal MikroTik dengan tema modern dark glassmorphism, input kode voucher otomatis, status error banner, dan tombol bantuan CS.',
    isHTML: true,
  },
  {
    id: 'qos-game-streaming',
    title: 'QoS Simple Queue & PCQ Anti-Lag (Game Prioritas)',
    category: 'qos',
    categoryLabel: 'Bandwidth & QoS',
    icon: Zap,
    description: 'Prioritas traffic game online (MLBB, Free Fire, PUBG, Valorant) dengan ping rendah saat download heavy.',
    prompt: 'Buatkan script MikroTik RouterOS v7 untuk QoS Bandwidth Management menggunakan Simple Queue + PCQ Tree dengan prioritas game online (port UDP/TCP game), DNS fast-lookup, dan pembagian bandwidth browsing yang adil.',
  },
  {
    id: 'pcc-dual-wan',
    title: 'Dual WAN Load Balancing PCC + Failover (2 ISP)',
    category: 'loadbalance',
    categoryLabel: 'Multi-WAN ISP',
    icon: Network,
    description: 'Bagi beban 2 ISP uplink secara proporsional dengan failover otomatis recursive gateway jika link terputus.',
    prompt: 'Buatkan script MikroTik RouterOS v7 lengkap untuk Load Balancing 2 ISP (Dual WAN) menggunakan Per Connection Classifier (PCC) dengan routing-table baru, NAT Masquerade, dan Check Gateway Ping untuk failover otomatis.',
  },
  {
    id: 'security-raw-ddos',
    title: 'Firewall RAW Anti-DDoS & Anti Brute Force',
    category: 'security',
    categoryLabel: 'Keamanan Router',
    icon: Shield,
    description: 'Proteksi tingkat kernel di tabel RAW untuk membuang paket invalid, SYN flood, dan blacklist otomatis penyerang.',
    prompt: 'Buatkan script MikroTik RouterOS v7 untuk Firewall Security menggunakan tabel RAW untuk drop Bogon IP, SYN flood DDoS protection, dan filter anti brute-force Winbox/SSH dengan auto-blacklist IP penyerang selama 7 hari.',
  },
  {
    id: 'auto-isolir-script',
    title: 'Isolir Otomatis Pelanggan Nunggak ke Web Billing',
    category: 'radius_isolir',
    categoryLabel: 'Billing & Isolir',
    icon: Sliders,
    description: 'Redirect otomatis pelanggan belum bayar ke halaman pengingat tagihan dan blokir port internet.',
    prompt: 'Buatkan script MikroTik untuk sistem Isolir Otomatis pelanggan nunggak menggunakan Address-List ISOLIR_PELANGGAN, NAT redirect ke IP server billing, dan firewall filter drop akses internet umum.',
  },
  {
    id: 'wireguard-tunnel',
    title: 'VPN WireGuard Server & Client (Remote Router)',
    category: 'vpn',
    categoryLabel: 'VPN & Remote',
    icon: Cpu,
    description: 'Tunnel WireGuard ultra-cepat dan hemat CPU untuk menghubungkan router cabang ke server RADIUS pusat.',
    prompt: 'Buatkan script MikroTik RouterOS v7 untuk konfigurasi WireGuard VPN Server dan Client dengan interface listen-port, generate public/private key, routing subnet lokal, dan firewall filter allow VPN handshake.',
  },
];

export const AIToolsView: React.FC = () => {
  const { hotspotTemplates, addHotspotTemplate } = useApp();

  // Mode Selection: 'form' (Form Wizard) or 'ai-prompt' (AI Gemini Assistant)
  const [mainMode, setMainMode] = useState<'form' | 'ai-prompt' | 'presets'>('form');

  // State Management for AI Prompt
  const [promptInput, setPromptInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rosVersion, setRosVersion] = useState<'v7' | 'v6'>('v7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [outputSource, setOutputSource] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  // Handle Generate with AI
  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || promptInput;
    if (!finalPrompt.trim()) {
      alert('Silakan ketik deskripsi kebutuhan script atau pilih salah satu preset di bawah.');
      return;
    }

    setIsGenerating(true);
    setAppliedSuccess(false);
    setActiveTab('code');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          category: selectedCategory,
          targetROSVersion: rosVersion,
          variables: {
            app: 'Masmedia Network',
            date: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setGeneratedOutput(data.result);
        setOutputSource(data.source || 'AI Engine');
      } else {
        throw new Error(data.error || 'Gagal menghasilkan script.');
      }
    } catch (err: any) {
      console.error('Generation failed, using smart offline fallback:', err);
      setGeneratedOutput(`### ⚠️ Gagal menghubungi server AI\nSilakan coba lagi beberapa saat.`);
      setOutputSource('Offline Fallback');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (preset: AIPreset) => {
    setPromptInput(preset.prompt);
    setMainMode('ai-prompt');
    handleGenerate(preset.prompt);
  };

  // Copy Clean Code from Generated Output
  const handleCopyCode = () => {
    if (!generatedOutput) return;
    const codeMatch = generatedOutput.match(/```(?:routeros|bash|html|css)?\n([\s\S]*?)```/);
    const codeToCopy = codeMatch ? codeMatch[1].trim() : generatedOutput;

    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Code File (.rsc or .html)
  const handleDownloadCode = () => {
    if (!generatedOutput) return;
    const isHtml = generatedOutput.includes('<!DOCTYPE html>') || generatedOutput.includes('<html');
    const extension = isHtml ? 'html' : 'rsc';
    const codeMatch = generatedOutput.match(/```(?:routeros|bash|html|css)?\n([\s\S]*?)```/);
    const content = codeMatch ? codeMatch[1].trim() : generatedOutput;

    const blob = new Blob([content], { type: isHtml ? 'text/html' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MikroTik_AI_Export_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Apply directly to system hotspot template
  const handleApplyToSystemTemplates = () => {
    if (!generatedOutput) return;
    const codeMatch = generatedOutput.match(/```(?:html)?\n([\s\S]*?)```/);
    const htmlCode = codeMatch ? codeMatch[1].trim() : generatedOutput;

    const newTemplateId = `TPL-AI-${Date.now()}`;
    addHotspotTemplate({
      id: newTemplateId,
      name: `AI Generated Template (${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`,
      type: 'a4_21',
      description: 'Template Hotspot yang digenerate oleh Masmedia AI Assistant',
      headerTitle: 'RTRW.NET HOTSPOT',
      greetingText: 'Selamat Datang di Hotspot Cepat & Stabil',
      wifiName: '@RTRW-HOTSPOT',
      contactWa: '0851-5767-1244',
      htmlContent: htmlCode,
    });

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3500);
  };

  // Filter presets
  const filteredPresets = selectedCategory === 'all'
    ? AI_PRESETS
    : AI_PRESETS.filter(p => p.category === selectedCategory);

  // Extract clean code for rendering
  const extractedCodeMatch = generatedOutput ? generatedOutput.match(/```(?:routeros|bash|html|css)?\n([\s\S]*?)```/) : null;
  const rawCode = extractedCodeMatch ? extractedCodeMatch[1].trim() : null;
  const isHtmlResult = generatedOutput?.includes('<!DOCTYPE html>') || generatedOutput?.includes('<html') || false;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
            <Bot className="w-4 h-4" />
            <span>Tools MikroTik & AI Generator • Masmedia Network</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            MikroTik Form Generator & AI Script Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Lengkapi formulir interaktif untuk kalkulasi otomatis <strong>Load Balance (PCC/ECMP)</strong>, cetak <strong>Voucher Hotspot</strong>, konfigurasi <strong>PPPoE</strong>, <strong>QoS Game Anti-Lag</strong>, <strong>Isolir</strong>, dan <strong>Auto Backup Telegram</strong>.
          </p>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs relative z-10">
          <button
            onClick={() => setMainMode('form')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
              mainMode === 'form'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Form Visual MikroTik</span>
          </button>
          <button
            onClick={() => setMainMode('ai-prompt')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
              mainMode === 'ai-prompt'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Prompt Studio</span>
          </button>
          <button
            onClick={() => setMainMode('presets')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
              mainMode === 'presets'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Preset Template</span>
          </button>
        </div>
      </div>

      {/* 1. VISUAL FORM BUILDER */}
      {mainMode === 'form' && <MikrotikFormGenerators />}

      {/* 2. AI PROMPT STUDIO & PRESETS */}
      {mainMode !== 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Prompt & Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Prompt Input Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Prompt / Perintah Kebutuhan
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Gemini 3.7 Pro Model</span>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                  placeholder="Contoh: Buatkan script Load Balance PCC 3 ISP dengan failover recursive gateway, atau buatkan template voucher hotspot A4 21 kupon..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setPromptInput('')}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Bersihkan Prompt
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Merancang Kode...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Generate Kode Terbaik</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Presets Category Selector */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Katalog Preset Template & Script Siap Pakai
                </span>
                <span className="text-[10px] text-white bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                  1-Klik Generate
                </span>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'hotspot', label: 'Hotspot Voucher' },
                  { id: 'qos', label: 'QoS & Bandwidth' },
                  { id: 'security', label: 'Firewall & DDoS' },
                  { id: 'loadbalance', label: 'Load Balance PCC' },
                  { id: 'radius_isolir', label: 'Isolir Billing' },
                  { id: 'vpn', label: 'WireGuard VPN' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-slate-800 text-blue-400 border border-blue-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Presets List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredPresets.map(preset => {
                  const Icon = preset.icon;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-blue-500/40 rounded-xl cursor-pointer transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                              {preset.title}
                            </h4>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Output Workbench (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 min-h-[620px] flex flex-col justify-between shadow-xl">
              <div>
                {/* Output Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Hasil Kode & Script MikroTik AI</span>
                    {outputSource && (
                      <span className="text-[10px] bg-slate-800 text-blue-400 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                        {outputSource}
                      </span>
                    )}
                  </div>

                  {/* Tab Switcher if HTML */}
                  {isHtmlResult && (
                    <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs">
                      <button
                        onClick={() => setActiveTab('code')}
                        className={`px-3 py-1 rounded font-semibold transition-all ${
                          activeTab === 'code' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5 inline mr-1" />
                        Kode Sumber
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1 rounded font-semibold transition-all ${
                          activeTab === 'preview' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        Pratinjau Desain
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="mt-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                        <Bot className="w-5 h-5 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Menghasilkan Script & Template Cerdas...</p>
                        <p className="text-xs text-slate-400 mt-1">Mengoptimalkan konfigurasi MikroTik RouterOS & CSS presisi</p>
                      </div>
                    </div>
                  ) : generatedOutput ? (
                    activeTab === 'preview' && isHtmlResult ? (
                      /* Live HTML Preview Iframe */
                      <div className="bg-white rounded-xl overflow-hidden border border-slate-300 shadow-inner">
                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                          <span className="font-mono">Pratinjau Halaman Template Voucher / Login</span>
                          <span className="text-[11px] text-blue-500 font-bold">● Siap Cetak / Pasang</span>
                        </div>
                        <iframe
                          title="HTML Template Preview"
                          srcDoc={rawCode || generatedOutput}
                          className="w-full h-[520px] bg-white border-0"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    ) : (
                      /* Code / Markdown Display */
                      <div className="relative">
                        <pre className="bg-slate-950 p-5 rounded-xl text-xs font-mono text-blue-400 leading-relaxed overflow-x-auto max-h-[520px] border border-slate-800/80 shadow-inner select-all">
                          {rawCode || generatedOutput}
                        </pre>
                      </div>
                    )
                  ) : (
                    /* Initial Empty State */
                    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
                        <Sparkles className="w-8 h-8 text-blue-400/60" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Belum Ada Script yang Digenerate</h3>
                      <p className="text-xs text-slate-400 max-w-sm mt-1.5">
                        Gunakan tab <strong>Form Visual MikroTik</strong> untuk mengisi formulir Load Balance & Voucher, atau ketik prompt di sebelah kiri.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Toolbar */}
              {generatedOutput && !isGenerating && (
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-blue-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                    </button>

                    <button
                      onClick={handleDownloadCode}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File</span>
                    </button>
                  </div>

                  {isHtmlResult && (
                    <button
                      onClick={handleApplyToSystemTemplates}
                      className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      {appliedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
                      <span>{appliedSuccess ? 'Tersimpan ke Menu Hotspot!' : 'Simpan ke Template Hotspot'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
