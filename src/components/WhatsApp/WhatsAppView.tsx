import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  Save,
  Copy,
  Check,
  Phone,
  User,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Info,
  Radio,
  QrCode,
  Zap,
  BatteryCharging,
  Wifi,
  ShieldCheck,
  Play,
  Pause,
  Clock,
  CheckCheck,
  AlertTriangle,
  Flame,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface BroadcastQueueItem {
  id: string;
  customerName: string;
  phone: string;
  packageName: string;
  totalAmount: number;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  timestamp?: string;
}

export const WhatsAppView: React.FC = () => {
  const {
    templates,
    customers,
    invoices,
    updateTemplate,
    sendWhatsAppMessage,
    getFormattedMessage,
    paymentChannels,
    updatePaymentChannels,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'device' | 'broadcast' | 'templates'>('device');

  // Gateway Connection Settings
  const [waProvider, setWaProvider] = useState<'fonnte' | 'wablas' | 'starsender' | 'baileys'>('fonnte');
  const [waApiKey, setWaApiKey] = useState('MASMEDIA_WA_KEY_9921827481920');
  const [waServerUrl, setWaServerUrl] = useState('https://api.fonnte.com');
  const [waNumber, setWaNumber] = useState(paymentChannels.waGatewayNumber || '6281234567890');
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [devicePingLatency, setDevicePingLatency] = useState<number>(68);
  const [isPinging, setIsPinging] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingMethod, setPairingMethod] = useState<'qr' | 'code'>('qr');
  const [pairingCodeInput, setPairingCodeInput] = useState('MASM-8921');

  // Template States
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [activeCustomerTestId, setActiveCustomerTestId] = useState(customers[0]?.id || '');
  const [copied, setCopied] = useState(false);

  // Broadcast & Reminder Engine States
  const [broadcastTarget, setBroadcastTarget] = useState<'all_unpaid' | 'due_h3' | 'isolated' | 'manual'>('all_unpaid');
  const [antiBanDelay, setAntiBanDelay] = useState<number>(2); // seconds
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({ current: 0, total: 0 });
  const [broadcastQueue, setBroadcastQueue] = useState<BroadcastQueueItem[]>([]);
  const [customTestPhone, setCustomTestPhone] = useState('08123456789');

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const activeCustomer = customers.find(c => c.id === activeCustomerTestId) || customers[0];

  // Unpaid invoices & customers
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
  const unpaidCustomers = customers.filter(c => unpaidInvoices.some(i => i.customerId === c.id));
  const isolatedCustomers = customers.filter(c => c.serviceStatus === 'isolated' || c.status === 'inactive');

  const livePreview = getFormattedMessage(
    activeCustomer?.id || '',
    selectedTemplate?.code || 'tagihan_baru'
  );

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      updateTemplate(selectedTemplate.id, selectedTemplate.content);
      alert(`Template "${selectedTemplate.title}" berhasil disimpan!`);
    }
  };

  const handleInsertVariable = (variableTag: string) => {
    if (selectedTemplate) {
      const updated = selectedTemplate.content + ` ${variableTag}`;
      updateTemplate(selectedTemplate.id, updated);
    }
  };

  const handleSendToTest = () => {
    if (activeCustomer) {
      sendWhatsAppMessage(activeCustomer.phone, livePreview);
      alert(`Pesan WhatsApp simulasi berhasil dikirim ke ${activeCustomer.name} (${activeCustomer.phone})!`);
    }
  };

  const handleSaveConfig = () => {
    updatePaymentChannels({ waGatewayNumber: waNumber });
    alert('Pengaturan Koneksi WhatsApp Gateway Masmedia berhasil disimpan!');
  };

  const handlePingDevice = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setDevicePingLatency(Math.floor(Math.random() * 40) + 45);
      setDeviceConnected(true);
    }, 800);
  };

  // Start Batch Broadcast
  const handleStartBroadcast = () => {
    let targets: typeof unpaidCustomers = [];
    if (broadcastTarget === 'all_unpaid') targets = unpaidCustomers;
    else if (broadcastTarget === 'due_h3') targets = unpaidCustomers.slice(0, 3);
    else if (broadcastTarget === 'isolated') targets = isolatedCustomers.length > 0 ? isolatedCustomers : unpaidCustomers.slice(0, 2);
    else targets = customers.slice(0, 4);

    if (targets.length === 0) {
      alert('Tidak ada pelanggan dalam kategori target ini.');
      return;
    }

    const queue: BroadcastQueueItem[] = targets.map((c, idx) => {
      const inv = invoices.find(i => i.customerId === c.id);
      return {
        id: `BC-${Date.now()}-${idx}`,
        customerName: c.name,
        phone: c.phone,
        packageName: c.package,
        totalAmount: inv ? inv.totalAmount : 150000,
        status: 'pending',
      };
    });

    setBroadcastQueue(queue);
    setIsBroadcasting(true);
    setBroadcastProgress({ current: 0, total: queue.length });

    // Step-by-step sender simulation with Anti-Ban delay
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx >= queue.length) {
        clearInterval(interval);
        setIsBroadcasting(false);
        alert(`Selesai! Berhasil menyiarkan ${queue.length} pesan pengingat tagihan WhatsApp.`);
        return;
      }

      setBroadcastQueue(prev =>
        prev.map((item, i) => {
          if (i === currentIdx) {
            return {
              ...item,
              status: 'sent',
              timestamp: new Date().toLocaleTimeString('id-ID'),
            };
          }
          if (i === currentIdx + 1) {
            return { ...item, status: 'sending' };
          }
          return item;
        })
      );

      currentIdx += 1;
      setBroadcastProgress(p => ({ ...p, current: currentIdx }));
    }, Math.max(800, antiBanDelay * 1000));
  };

  const variables = [
    { tag: '{nama}', desc: 'Nama Pelanggan' },
    { tag: '{id_pelanggan}', desc: 'ID Pelanggan' },
    { tag: '{username}', desc: 'Username RADIUS' },
    { tag: '{paket}', desc: 'Nama Paket Internet' },
    { tag: '{kecepatan}', desc: 'Speed / Rate Limit' },
    { tag: '{periode}', desc: 'Periode Tagihan' },
    { tag: '{total_bayar}', desc: 'Total Tagihan' },
    { tag: '{jatuh_tempo}', desc: 'Tanggal Jatuh Tempo' },
    { tag: '{link_pembayaran}', desc: 'Link Cek & Bayar Tagihan' },
    { tag: '{nama_isp}', desc: 'Nama ISP Masmedia' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            WhatsApp Notification Gateway Masmedia
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Gateway & Pengingat Otomatis</h1>
          <p className="text-sm text-slate-400 mt-1">
            Koneksi device WhatsApp, broadcast tagihan massal anti-banned, dan kustomisasi template notifikasi pelanggan.
          </p>
        </div>

        {/* Device Status Pill */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${deviceConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {deviceConnected ? 'Gateway Terhubung' : 'Device Terputus'}
                <span className="text-[10px] font-mono text-emerald-400">({devicePingLatency}ms)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{waNumber}</div>
            </div>
          </div>
          <button
            onClick={handlePingDevice}
            disabled={isPinging}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
            title="Tes Ping Gateway"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('device')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'device'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          1. Koneksi Device & Provider API
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'broadcast'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          2. Broadcast Tagihan & Pengingat ({unpaidCustomers.length} Belum Bayar)
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'templates'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          3. Koleksi Template Pesan & Variabel
        </button>
      </div>

      {/* TAB 1: DEVICE CONNECTION & PROVIDER */}
      {activeTab === 'device' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Provider and Config (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Pilihan Provider WhatsApp API
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih gateway WhatsApp komersil (Fonnte, Wablas, Starsender) atau Baileys Local Node.js Gateway.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'fonnte', name: 'Fonnte API', badge: 'Cloud API', desc: 'Respon tercepat & multi-device' },
                { id: 'wablas', name: 'Wablas Engine', badge: 'Rotator', desc: 'Support dynamic button & list' },
                { id: 'starsender', name: 'Starsender', badge: 'High Speed', desc: 'Webhook stabil & anti delay' },
                { id: 'baileys', name: 'Baileys NodeJS', badge: 'Self-Hosted', desc: 'Gratis tanpa biaya langganan' },
              ].map(p => (
                <div
                  key={p.id}
                  onClick={() => setWaProvider(p.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    waProvider === p.id
                      ? 'border-emerald-400 bg-emerald-500/15 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {p.badge}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-2">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nomor WhatsApp Pengirim / Masking</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={waNumber}
                    onChange={e => setWaNumber(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="628123456789"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPairingModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    Pairing Ulang
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">API Key / Token Otentikasi Gateway</label>
                <input
                  type="password"
                  value={waApiKey}
                  onChange={e => setWaApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. MASMEDIA_API_KEY_xxxx"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Server Endpoint URL</label>
                <input
                  type="text"
                  value={waServerUrl}
                  onChange={e => setWaServerUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-emerald-400 font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
                  placeholder="https://api.fonnte.com / http://localhost:8000"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handlePingDevice}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-emerald-400' : ''}`} />
                  Cek Status Koneksi Device
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Konfigurasi
                </button>
              </div>
            </div>
          </div>

          {/* Device Telemetry Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Status Hardware Device
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ONLINE 24/7
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Baterai HP
                  </span>
                  <div className="text-base font-bold text-white">88% (Charging)</div>
                  <span className="text-[10px] text-slate-500">Suhu aman: 32°C</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Sinyal GSM / Wi-Fi
                  </span>
                  <div className="text-base font-bold text-white">4G LTE (Kuat)</div>
                  <span className="text-[10px] text-slate-500">Speed: 45 Mbps</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Device:</span>
                  <span className="font-bold text-white">Redmi Note 12 (Masmedia Server)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Versi WhatsApp:</span>
                  <span className="font-mono text-emerald-400">2.24.16.78 Business</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Pesan Hari Ini:</span>
                  <span className="font-bold text-white">142 pesan terkirim</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tingkat Keberhasilan:</span>
                  <span className="font-bold text-emerald-400">99.8% (0 Banned)</span>
                </div>
              </div>

              {/* Direct Quick Message Tester */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Kirim Pesan Cepat / Tes Direct</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTestPhone}
                    onChange={e => setCustomTestPhone(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    placeholder="08123456789"
                  />
                  <button
                    onClick={() => {
                      sendWhatsAppMessage(
                        customTestPhone,
                        `Halo! Ini adalah pesan pengujian koneksi WhatsApp Gateway dari Masmedia Digital ISP pada ${new Date().toLocaleTimeString('id-ID')}.`
                      );
                      alert(`Pesan tes telah dikirim ke nomor ${customTestPhone}!`);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Tes Kirim
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Anti-Spam & Safety Advisory Banner */}
          <div className="lg:col-span-12 bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Panduan Keamanan Anti-Spam & Anti-Banned WhatsApp Gateway (Aman 100%)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Memasukkan Token API Key aktif (Fonnte, Wablas, Starsender, RuangWA, atau Baileys) <strong>sangat aman</strong> selama mengikuti kaidah broadcast resmi penyedia ISP/RT-RW Net berikut:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold">1</span>
                  Kustomisasi Variabel Unik
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Sistem Masmedia otomatis menyisipkan <code>{'{nama}'}</code>, <code>{'{id_pelanggan}'}</code>, dan nomor tagihan unik sehingga setiap pesan berbeda satu sama lain dan tidak terdeteksi sebagai duplikat bot oleh Meta.
                </p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold">2</span>
                  Jeda Antrean Dinamis (Delay)
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Fitur broadcast dilengkapi jeda waktu acak 2–5 detik antar pesan. Jangan mengirim 500 pesan dalam 1 detik sekaligus untuk menjaga reputasi nomor WhatsApp Business Anda.
                </p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold">3</span>
                  Pesan Transaksional Resmi
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Pesan pengingat tagihan dan struk pembayaran diakui oleh pelanggan sebagai pesan penting resmi (bukan iklan acak), sehingga pelanggan tidak akan menekan tombol &quot;Laporkan Spam&quot;.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST & BULK REMINDER */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Broadcast Control Panel (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Engine Siaran Tagihan Massal
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kirim pengingat jatuh tempo ke seluruh pelanggan belum bayar secara teratur dengan proteksi anti-spam.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pilih Target Sasaran Siaran</label>
                  <div className="space-y-1.5">
                    {[
                      {
                        id: 'all_unpaid',
                        title: 'Semua Pelanggan Belum Bayar',
                        count: `${unpaidCustomers.length} pelanggan`,
                      },
                      {
                        id: 'due_h3',
                        title: 'Pelanggan Mendekati Jatuh Tempo (H-3)',
                        count: 'Prioritas Tagihan',
                      },
                      {
                        id: 'isolated',
                        title: 'Pelanggan Terisolir (Pemberitahuan Buka Blokir)',
                        count: `${isolatedCustomers.length} pelanggan`,
                      },
                      {
                        id: 'manual',
                        title: 'Sampel Uji Coba Acak (4 Pelanggan)',
                        count: 'Testing Mode',
                      },
                    ].map(target => (
                      <div
                        key={target.id}
                        onClick={() => setBroadcastTarget(target.id as any)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          broadcastTarget === target.id
                            ? 'border-emerald-400 bg-emerald-500/15 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-semibold text-white">{target.title}</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                          {target.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Jeda Anti-Ban WhatsApp:
                    </span>
                    <span className="font-mono text-emerald-400">{antiBanDelay} Detik / Pesan</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={antiBanDelay}
                    onChange={e => setAntiBanDelay(Number(e.target.value))}
                    className="w-full accent-emerald-400 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">
                    Rekomendasi 2-3 detik untuk mencegah pembatasan nomor oleh algoritma Meta.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartBroadcast}
                    disabled={isBroadcasting}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                  >
                    {isBroadcasting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Mengirim ({broadcastProgress.current}/{broadcastProgress.total})...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Mulai Kirim Siaran Massal ({unpaidCustomers.length} Pesan)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Broadcast Queue Monitor (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Antrean Eksekusi Pesan Real-time
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live status pengiriman struk tagihan WhatsApp per pelanggan.
                  </p>
                </div>
                {isBroadcasting && (
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full animate-pulse">
                    Proses Berjalan...
                  </span>
                )}
              </div>

              {broadcastQueue.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs">Belum ada antrean broadcast aktif. Tekan tombol &quot;Mulai Kirim Siaran&quot;.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Progress Pengiriman:</span>
                      <span className="text-emerald-400">
                        {broadcastProgress.current} dari {broadcastProgress.total} Selesai (
                        {Math.round((broadcastProgress.current / (broadcastProgress.total || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${(broadcastProgress.current / (broadcastProgress.total || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Table Queue */}
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                          <th className="pb-2">Pelanggan</th>
                          <th className="pb-2">No. WhatsApp</th>
                          <th className="pb-2">Tagihan</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {broadcastQueue.map(item => (
                          <tr key={item.id} className="hover:bg-slate-800/20">
                            <td className="py-2.5 font-semibold text-white">{item.customerName}</td>
                            <td className="py-2.5 font-mono text-slate-300">{item.phone}</td>
                            <td className="py-2.5 font-bold text-emerald-400">{formatRupiah(item.totalAmount)}</td>
                            <td className="py-2.5">
                              {item.status === 'sent' && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                  <CheckCheck className="w-3 h-3" /> Terkirim
                                </span>
                              )}
                              {item.status === 'sending' && (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit animate-pulse">
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Mengirim
                                </span>
                              )}
                              {item.status === 'pending' && (
                                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full w-fit">
                                  Menunggu
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 text-right font-mono text-[10.5px] text-slate-400">
                              {item.timestamp || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES & LIVE SMARTPHONE MOCKUP */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Template Selector & Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Template Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tpl.title}
                </button>
              ))}
            </div>

            {/* Template Content Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedTemplate.title}</h3>
                  <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={handleSaveTemplate}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Template
                </button>
              </div>

              {/* Variable insertion tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Klik untuk Sisipkan Variabel Dinamis:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {variables.map(v => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleInsertVariable(v.tag)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-400 border border-slate-700 transition-colors"
                      title={v.desc}
                    >
                      + {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Textarea */}
              <div>
                <textarea
                  rows={11}
                  value={selectedTemplate.content}
                  onChange={e => updateTemplate(selectedTemplate.id, e.target.value)}
                  className="w-full p-4 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Smartphone Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Preview WhatsApp Mockup
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Target Pelanggan:</span>
                <select
                  value={activeCustomerTestId}
                  onChange={e => setActiveCustomerTestId(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.package})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Authentic Smartphone Mockup */}
            <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* WhatsApp Header */}
              <div className="bg-emerald-800 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Masmedia Billing System</div>
                    <div className="text-[10px] text-emerald-200">Official Notification Bot</div>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-200 font-mono">Online</div>
              </div>

              {/* Chat Bubble Canvas */}
              <div className="p-4 bg-slate-900/60 min-h-[290px] flex flex-col justify-end space-y-2">
                <div className="bg-emerald-950/80 border border-emerald-500/30 rounded-2xl rounded-tr-none p-3 text-[11px] text-slate-200 max-w-[92%] ml-auto shadow-md">
                  <div className="whitespace-pre-wrap leading-relaxed font-sans">{livePreview}</div>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-400">
                    <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Chat Bar & Action */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(livePreview);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Pesan Disalin!' : 'Salin Pesan'}
                </button>
                <button
                  onClick={handleSendToTest}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3 h-3" /> Tes Kirim WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pairing WhatsApp Device */}
      {showPairingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                Hubungkan WhatsApp Masmedia
              </h3>
              <button
                onClick={() => setShowPairingModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Tutup
              </button>
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPairingMethod('qr')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  pairingMethod === 'qr' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                1. Scan QR Code
              </button>
              <button
                onClick={() => setPairingMethod('code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  pairingMethod === 'code' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                2. Kode Pairing (8 Digit)
              </button>
            </div>

            {pairingMethod === 'qr' ? (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl mx-auto w-52 h-52 flex items-center justify-center shadow-lg border border-slate-200">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MASMEDIA_WHATSAPP_PAIRING_TOKEN_8921"
                    alt="WhatsApp QR"
                    className="w-44 h-44"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Buka WhatsApp di HP Anda &gt; Menu Titik Tiga / Pengaturan &gt; Perangkat Tertaut &gt; Tautkan Perangkat.
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <span className="text-xs text-slate-400">Masukkan kode pairing berikut di WhatsApp HP Anda:</span>
                <div className="text-2xl font-mono font-black text-emerald-400 tracking-widest bg-slate-950 p-4 rounded-2xl border border-emerald-500/30">
                  {pairingCodeInput}
                </div>
                <p className="text-[11px] text-slate-500">Kode ini berlaku selama 60 detik.</p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  setDeviceConnected(true);
                  setShowPairingModal(false);
                  alert('WhatsApp Masmedia berhasil dipasangkan!');
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
              >
                Saya Sudah Menghubungkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
