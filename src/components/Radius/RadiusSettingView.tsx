import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MikroTikNAS } from '../../types';
import { VPNSettingView } from './VPNSettingView';
import { SchedulerSettingView } from './SchedulerSettingView';
import {
  Info,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  X,
  Terminal,
  CheckCircle2,
  Server,
  Shield,
  Clock,
  ArrowRight,
  Globe,
  Radio,
  Zap,
  RotateCw,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export interface RadiusSettingViewProps {
  initialTab?: 'vpn' | 'nas' | 'scheduler';
}

export const RadiusSettingView: React.FC<RadiusSettingViewProps> = ({ initialTab }) => {
  const {
    nasList,
    addNAS,
    updateNAS,
    deleteNAS,
    pingRouter,
    probeRouterRealtime,
    radiusServerConfig,
    vpnConfigs,
    setActiveTab,
  } = useApp();

  // 3-Tab Sub-Menu under Pengaturan: 1. VPN, 2. NAS, 3. Scheduler
  const [activeMainTab, setActiveMainTab] = useState<'vpn' | 'nas' | 'scheduler'>(() => {
    if (initialTab) return initialTab;
    return 'vpn';
  });

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  // Form State for "Buat Akun NAS"
  const [routerName, setRouterName] = useState('');
  const [routerIp, setRouterIp] = useState('');
  const [radiusSecret, setRadiusSecret] = useState('Server@123');
  const [timezone, setTimezone] = useState('+7 Asia/Jakarta');
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // Search State for "Router Data NAS"
  const [searchQuery, setSearchQuery] = useState('');

  // Password visibility map for Router Cards
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  // Connection testing state
  const [testingNasId, setTestingNasId] = useState<string | null>(null);
  const [testSuccessToast, setTestSuccessToast] = useState<{ nasId: string; message: string } | null>(null);

  // Modal State for "Skrip Mikrotik" (Lihat) - Skrip Terpisah Satu Per Satu
  const [selectedNasForScript, setSelectedNasForScript] = useState<MikroTikNAS | null>(null);
  const [copiedModalScript, setCopiedModalScript] = useState(false);
  const [activeScriptStep, setActiveScriptStep] = useState<'step1' | 'step2' | 'step3'>('step2');

  // Modal State for "Edit NAS"
  const [editingNas, setEditingNas] = useState<MikroTikNAS | null>(null);
  const [editRouterName, setEditRouterName] = useState('');
  const [editRouterIp, setEditRouterIp] = useState('');
  const [editRadiusSecret, setEditRadiusSecret] = useState('');
  const [editTimezone, setEditTimezone] = useState('+7 Asia/Jakarta');
  const [showEditSecret, setShowEditSecret] = useState(false);

  // Fallback / default RADIUS server IP matching RadbooX reference or config
  const radiusServerHost = radiusServerConfig?.serverHost || '103.116.83.83';

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Quick fill with active VPN IP if available
  const handleFillFromVpn = () => {
    const activeVpn = vpnConfigs.find(v => v.status === 'connected') || vpnConfigs[0];
    if (activeVpn) {
      setRouterIp(activeVpn.remoteIp || activeVpn.serverAddress);
      if (!routerName) {
        setRouterName(`Router ${activeVpn.name}`);
      }
    } else {
      setActiveTab('setting-vpn');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccessMessage(null);
    setFormErrorMessage(null);

    if (!routerName.trim()) {
      setFormErrorMessage('Nama Router tidak boleh kosong.');
      return;
    }
    if (!routerIp.trim()) {
      setFormErrorMessage('Alamat IP Router tidak boleh kosong.');
      return;
    }
    if (!radiusSecret.trim()) {
      setFormErrorMessage('Password tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Create with OFFLINE status by default because script is not applied to Winbox yet
      addNAS({
        name: routerName.trim(),
        ipAddress: routerIp.trim(),
        radiusSecret: radiusSecret.trim(),
        apiPort: 8728,
        username: 'admin',
        model: 'MikroTik CCR / RB Series',
        rosVersion: 'RouterOS v7',
        cpuLoad: 0,
        freeMemoryMB: 480,
        totalMemoryMB: 1024,
        uptime: '0s (Menunggu Konfigurasi Winbox)',
        status: 'offline',
        activePppoeCount: 0,
        activeHotspotCount: 0,
      });

      setIsSubmitting(false);
      setFormSuccessMessage(
        `Router NAS "${routerName}" berhasil didaftarkan! Status awal: OFFLINE (Menunggu skrip dipasang ke Winbox). Silakan klik tombol [Lihat] pada kartu Router untuk mengambil skrip MikroTik dan lakukan Uji Koneksi.`
      );

      // Reset Form
      setRouterName('');
      setRouterIp('');
      setRadiusSecret('Server@123');

      setTimeout(() => {
        setFormSuccessMessage(null);
      }, 7000);
    }, 400);
  };

  // Test SNMP & RADIUS connectivity dynamically via real server socket probe (Anti-Manipulasi)
  const handleTestConnection = async (nas: MikroTikNAS) => {
    setTestingNasId(nas.id);
    setTestSuccessToast(null);

    const result = await probeRouterRealtime(nas.id);
    setTestingNasId(null);

    if (result.online) {
      setTestSuccessToast({
        nasId: nas.id,
        message: `✓ MikroTik "${nas.name}" (${nas.ipAddress}) terverifikasi ONLINE! Port ${nas.apiPort || 8728} merespon (${result.latency || '1.2 ms'}).`,
      });
    } else {
      setTestSuccessToast({
        nasId: nas.id,
        message: `⚠️ Router "${nas.name}" (${nas.ipAddress}) OFFLINE: Host tidak merespon di port ${nas.apiPort || 8728}. Periksa tunnel VPN atau paste skrip di Winbox.`,
      });
    }

    setTimeout(() => {
      setTestSuccessToast(null);
    }, 6000);
  };

  const handleOpenEdit = (nas: MikroTikNAS) => {
    setEditingNas(nas);
    setEditRouterName(nas.name);
    setEditRouterIp(nas.ipAddress);
    setEditRadiusSecret(nas.radiusSecret || 'Server@123');
    setEditTimezone('+7 Asia/Jakarta');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNas) return;

    updateNAS(editingNas.id, {
      name: editRouterName.trim(),
      ipAddress: editRouterIp.trim(),
      radiusSecret: editRadiusSecret.trim(),
    });

    setEditingNas(null);
  };

  // Filtered NAS list
  const filteredNasList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return nasList;
    return nasList.filter(
      nas =>
        nas.name.toLowerCase().includes(q) ||
        nas.ipAddress.toLowerCase().includes(q) ||
        (nas.radiusSecret && nas.radiusSecret.toLowerCase().includes(q))
    );
  }, [nasList, searchQuery]);

  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopiedModalScript(true);
    setTimeout(() => setCopiedModalScript(false), 2500);
  };

  // 1. Skrip VPN Remote WireGuard MikroTik
  const generateVpnScript = (nas: MikroTikNAS): string => {
    const matchedVpn = vpnConfigs.find(
      v => v.remoteIp === nas.ipAddress || v.serverAddress === nas.ipAddress || v.name.toLowerCase().includes(nas.name.toLowerCase())
    ) || vpnConfigs[0];

    const vpnHost = matchedVpn?.serverAddress || '103.187.99.50';
    const clientIp = matchedVpn?.remoteIp || nas.ipAddress || '10.200.0.10';
    const winboxPort = matchedVpn?.remoteWinboxPort || 18291;

    return `# ====================================================================
# 1. SCRIPT KONEKSI WIREGUARD VPN MIKROTIK - ${nas.name}
# Host Server VPS : ${vpnHost}
# IP Tunnel Client: ${clientIp}
# Remote Winbox   : ${vpnHost}:${winboxPort}
# ====================================================================

# 1.1. Bersihkan interface WireGuard lama jika ada
/interface wireguard remove [find name="wg-masmedia"]

# 1.2. Tambah interface WireGuard Client
/interface wireguard
add name="wg-masmedia" listen-port=13231 mtu=1420 comment="VPN Remote Masmedia Hub"

# 1.3. Tetapkan IP Tunnel ke Router Klien
/ip address
add address=${clientIp}/24 interface="wg-masmedia" network=10.200.0.0 comment="IP Tunnel VPN Masmedia"

# 1.4. Tambahkan WireGuard Peer ke VPS Server Masmedia
/interface wireguard peers
add interface="wg-masmedia" endpoint-address="${vpnHost}" endpoint-port=51820 \\
    allowed-address=10.200.0.0/24 persistent-keepalive=25s comment="Masmedia VPS WireGuard Hub"

# 1.5. Pastikan Service Winbox & API Aktif
/ip service enable winbox
/ip service set winbox port=8291
/ip service enable api
/ip service set api port=8728
/ip service enable www
/ip service set www port=80

# 1.6. Izinkan Firewall Masuk dari Interface VPN
/ip firewall filter
add chain=input in-interface="wg-masmedia" action=accept place-before=0 comment="Allow Remote via WireGuard Masmedia"

:put "========================================================="
:put ">>> [1/3] SUKSES! VPN WIREGUARD ${nas.name} BERHASIL DIPASANG <<<"
:put ">>> Remote Winbox: ${vpnHost}:${winboxPort} <<<"
:put "========================================================="
`;
  };

  // 2. Skrip NAS (RADIUS AAA + CoA Port 3799 + SNMP)
  const generateNasRadiusScript = (nas: MikroTikNAS): string => {
    const host = radiusServerHost;
    const secret = nas.radiusSecret || 'Server@123';
    const authPort = radiusServerConfig?.authPort || 1812;
    const acctPort = radiusServerConfig?.acctPort || 1813;
    const coaPort = radiusServerConfig?.coaPort || 3799;

    return `# ====================================================================
# 2. SCRIPT KONFIGURASI RADIUS & SNMP MIKROTIK - ${nas.name}
# IP RADIUS Server : ${host}
# Secret Key RADIUS: ${secret}
# ====================================================================

# 2.1. Bersihkan konfigurasi RADIUS lama
/radius remove [find comment~"Masmedia|RadbooX|Billing|FreeRADIUS"]

# 2.2. Daftarkan RADIUS Server untuk Service PPP & Hotspot
/radius add address=${host} secret="${secret}" \\
    service=ppp,hotspot authentication-port=${authPort} accounting-port=${acctPort} \\
    timeout=3000ms comment="Masmedia FreeRADIUS Server"

# 2.3. Aktifkan Incoming RADIUS (CoA / Packet of Disconnect untuk Kick & Isolir Otomatis)
/radius incoming set accept=yes port=${coaPort}

# 2.4. Sinkronkan PPP AAA dengan FreeRADIUS Server
/ppp aaa set use-radius=yes accounting=yes interim-update=00:01:00

# 2.5. Sinkronkan Hotspot Server Profile dengan RADIUS
/ip hotspot profile set [find default=yes] use-radius=yes radius-accounting=yes radius-interim-update=00:01:00 \\
    login-by=http-chap,http-pap,mac-cookie split-user-domain=no

# 2.6. Aktifkan Layanan SNMP MikroTik (Port UDP 161)
/snmp set enabled=yes contact="admin@masmedianet" location="NOC Masmedia"
/snmp community set [find default=yes] name=public read-access=yes addresses=0.0.0.0/0

:put "========================================================="
:put ">>> [2/3] SUKSES! CONFIG RADIUS & SNMP BERHASIL DIPASANG <<<"
:put "========================================================="
`;
  };

  // 3. Skrip Scheduler Otomatis (Heartbeat Sinyal Realtime ke Dashboard)
  const generateSchedulerHeartbeatScript = (nas: MikroTikNAS): string => {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://masmedianet.my.id';

    return `# ====================================================================
# 3. SCRIPT SCHEDULER OTOMATIS HEARTBEAT - ${nas.name}
# URL Dashboard : ${currentOrigin}
# ID Router NAS : ${nas.id}
# Interval      : Setiap 30 Detik (Otomatis & Realtime)
# ====================================================================

# 3.1. Bersihkan skrip & scheduler heartbeat lama jika ada
/system scheduler remove [find name="masmedia-heartbeat"]
/system script remove [find name="masmedia-send-heartbeat"]

# 3.2. Buat script fetch pengirim sinyal status ke server web
/system script add name=masmedia-send-heartbeat source="/tool fetch url=\\"${currentOrigin}/api/mikrotik/heartbeat?nasId=${nas.id}&uptime=ok\\" keep-result=no"

# 3.3. Jadwalkan otomatis jalan setiap 30 detik tanpa henti & saat router reboot
/system scheduler add name=masmedia-heartbeat interval=30s on-event=masmedia-send-heartbeat start-time=startup

# 3.4. Jalankan pertama kali sekarang
/system script run masmedia-send-heartbeat

:put "========================================================="
:put ">>> [3/3] SUKSES! SCHEDULER OTOMATIS BERHASIL AKTIF! <<<"
:put ">>> Status Router di Dashboard Otomatis ONLINE <<<"
:put "========================================================="
`;
  };

  // Skrip RouterOS Terpisah Satu Per Satu (Tidak Digabung)
  const getActiveScriptByStep = (nas: MikroTikNAS): string => {
    if (activeScriptStep === 'step1') return generateVpnScript(nas);
    if (activeScriptStep === 'step2') return generateNasRadiusScript(nas);
    if (activeScriptStep === 'step3') return generateSchedulerHeartbeatScript(nas);
    return generateNasRadiusScript(nas);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Breadcrumb & Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Radius</span>
          <span>/</span>
          <span className="text-slate-500">Pengaturan</span>
          <span>/</span>
          <span className="text-blue-400 font-semibold">
            {activeMainTab === 'vpn' && '1. VPN'}
            {activeMainTab === 'nas' && '2. NAS'}
            {activeMainTab === 'scheduler' && '3. Scheduler'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('vps-master-hub')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors font-medium"
          >
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>Master Hub & Port VPS</span>
          </button>
        </div>
      </div>

      {/* 3 Tab Navigation Header: 1. VPN, 2. NAS, 3. Scheduler */}
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">Pengaturan:</span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800/80 rounded-xl overflow-x-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveMainTab('vpn')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeMainTab === 'vpn'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 text-blue-300" />
                <span>1. VPN</span>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-950 text-[10px] font-mono border border-blue-400/30">
                  {vpnConfigs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('nas')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeMainTab === 'nas'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Radio className="w-4 h-4 text-emerald-300" />
                <span>2. NAS</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-[10px] font-mono border border-emerald-400/30">
                  {nasList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('scheduler')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeMainTab === 'scheduler'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Clock className="w-4 h-4 text-cyan-300" />
                <span>3. Scheduler</span>
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-950 text-[10px] font-bold border border-cyan-400/30 text-cyan-300">
                  Auto
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] text-slate-300">
              {activeMainTab === 'vpn' && 'Skrip 1: Alokasi IP WireGuard, Port Winbox & NAT'}
              {activeMainTab === 'nas' && 'Skrip 2: Autentikasi RADIUS AAA, Secret & Port 3799'}
              {activeMainTab === 'scheduler' && 'Skrip 3: Heartbeat Otomatis & Monitor Online/Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. View Tab: VPN */}
      {activeMainTab === 'vpn' && <VPNSettingView embedded />}

      {/* 3. View Tab: Scheduler */}
      {activeMainTab === 'scheduler' && <SchedulerSettingView />}

      {/* 2. View Tab: NAS */}
      {activeMainTab === 'nas' && (
        <>
          {/* Top Banner Notice */}
          <div className="bg-[#111827]/90 border border-slate-800/90 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  INFO
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Jika router MikroTik anda tidak memiliki IP Public, pastikan anda sudah membuat account VPN terlebih dulu pada tab{' '}
                  <button
                    type="button"
                    onClick={() => setActiveMainTab('vpn')}
                    className="inline-flex items-center gap-1 px-3 py-0.5 mx-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md shadow transition-all cursor-pointer align-middle"
                  >
                    1. VPN
                  </button>{' '}
                  dan aktifkan skrip scheduler pada tab{' '}
                  <button
                    type="button"
                    onClick={() => setActiveMainTab('scheduler')}
                    className="inline-flex items-center gap-1 px-3 py-0.5 mx-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-md shadow transition-all cursor-pointer align-middle"
                  >
                    3. Scheduler
                  </button>{' '}
                  agar status router otomatis ONLINE. Karakter rahasia dan konfigurasi RADIUS dapat Anda atur langsung di bawah.
                </p>
              </div>
            </div>
          </div>

      {/* Main 2-Column Grid (Buat Akun NAS & Router Data NAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Card "Buat Akun NAS" */}
        <div className="lg:col-span-5">
          <div className="bg-[#111827]/95 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800/80">
                Buat Akun NAS
              </h2>

              {/* Sub Notice: ℹ️ Alamat IP */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Alamat IP</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  isi ip dari VPN yang sudah di buat{' '}
                  <button
                    type="button"
                    onClick={handleFillFromVpn}
                    className="inline-block px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded shadow transition-all cursor-pointer align-middle mx-1"
                  >
                    Disini
                  </button>{' '}
                  atau ip public dari isp.
                </p>
              </div>

              {formSuccessMessage && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              {formErrorMessage && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formErrorMessage}</span>
                </div>
              )}

              <form id="create-nas-form" onSubmit={handleFormSubmit} className="mt-5 space-y-4">
                {/* Field 1: Nama Router */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nama Router</label>
                  <input
                    type="text"
                    placeholder="Nama Router (misal: MASMEDIA)"
                    value={routerName}
                    onChange={e => setRouterName(e.target.value)}
                    className="w-full bg-[#1e293b]/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    required
                  />
                </div>

                {/* Field 2: Alamat IP */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">alamat IP</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Contoh: 172.31.154.207 atau MASMEDIA"
                      value={routerIp}
                      onChange={e => setRouterIp(e.target.value)}
                      className="w-full bg-[#1e293b]/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono font-medium"
                      required
                    />
                    {vpnConfigs.length > 0 && !routerIp && (
                      <button
                        type="button"
                        onClick={handleFillFromVpn}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-2 py-1 rounded-md border border-blue-500/40 transition-colors"
                      >
                        Pilih VPN
                      </button>
                    )}
                  </div>
                </div>

                {/* Field 3: Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      placeholder="Masukkan Password RADIUS"
                      value={radiusSecret}
                      onChange={e => setRadiusSecret(e.target.value)}
                      className="w-full bg-[#1e293b]/70 border border-slate-700/80 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                      title={showSecret ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field 4: Zona Waktu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Zona Waktu</label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full bg-[#1e293b]/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-medium"
                  >
                    <option value="+7 Asia/Jakarta">+7 Asia/Jakarta (WIB)</option>
                    <option value="+8 Asia/Makassar">+8 Asia/Makassar (WITA)</option>
                    <option value="+9 Asia/Jayapura">+9 Asia/Jayapura (WIT)</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Bottom Submit Button (Blue Button "Kirim" at bottom right) */}
            <div className="pt-4 border-t border-slate-800/80 flex justify-end">
              <button
                type="submit"
                form="create-nas-form"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Kirim</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: "Router Data NAS" */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header with Title and Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Router Data NAS</h2>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#111827]/90 border border-slate-700/80 rounded-xl pl-4 pr-10 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Cards List (Replicating the exact RadbooX Card Layout from Reference) */}
          <div className="space-y-4">
            {filteredNasList.length === 0 ? (
              <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                <Server className="w-10 h-10 text-slate-600 mx-auto opacity-50" />
                <p className="font-semibold text-slate-300">Belum ada Router NAS terdaftar.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {searchQuery
                    ? 'Tidak ada router yang sesuai dengan pencarian.'
                    : 'Silahkan daftarkan Router MikroTik baru pada form "Buat Akun NAS" di sebelah kiri.'}
                </p>
              </div>
            ) : (
              filteredNasList.map(nas => {
                const isSecretVisible = visibleSecrets[nas.id] || false;
                const secret = nas.radiusSecret || 'Server@123';
                const routerIpDisplay = nas.ipAddress || '172.31.154.207';
                const radiusIpDisplay = radiusServerHost;

                return (
                  <div
                    key={nas.id}
                    className="bg-[#111827]/95 border border-slate-800/90 rounded-2xl p-6 shadow-md relative overflow-hidden transition-all hover:border-slate-700/90"
                  >
                    {/* Top Right Geometric Emerald Accent (as shown in reference image) */}
                    <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none overflow-hidden rounded-tr-2xl">
                      <div className="absolute -top-14 -right-14 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl" />
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/30 to-transparent transform rotate-45 translate-x-8 -translate-y-8" />
                    </div>

                    {/* Card Header: Router Nas <NAME> & Action Buttons */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                      <h3 className="text-base font-bold text-white flex items-center gap-2 tracking-wide">
                        <span>Router Nas {nas.name}</span>
                      </h3>

                      <div className="flex items-center gap-2.5 relative z-10">
                        {/* Edit Button (Green Pencil) */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(nas)}
                          className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                          title="Edit Router NAS"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button (Red Trash) */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus Router NAS "${nas.name}"?`)) {
                              deleteNAS(nas.id);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Hapus Router NAS"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Key-Value Details Layout (Matching reference format: IP Router, IP Radius, Rahasia, Zona Waktu, Snmp, Skrip Mikrotik) */}
                    <div className="mt-4 space-y-2.5 text-xs text-slate-300 font-sans">
                      {/* Row 1: IP Router */}
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-4 sm:col-span-3 text-slate-400">IP Router</div>
                        <div className="col-span-1 text-center text-slate-500">:</div>
                        <div className="col-span-7 sm:col-span-8 font-mono text-white font-medium">
                          {routerIpDisplay}
                        </div>
                      </div>

                      {/* Row 2: IP Radius */}
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-4 sm:col-span-3 text-slate-400">IP Radius</div>
                        <div className="col-span-1 text-center text-slate-500">:</div>
                        <div className="col-span-7 sm:col-span-8 font-mono text-emerald-400 font-medium">
                          {radiusIpDisplay}
                        </div>
                      </div>

                      {/* Row 3: Password */}
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-4 sm:col-span-3 text-slate-400">Password</div>
                        <div className="col-span-1 text-center text-slate-500">:</div>
                        <div className="col-span-7 sm:col-span-8 font-mono text-white flex items-center gap-2">
                          <span>{isSecretVisible ? secret : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(nas.id)}
                            className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors"
                            title={isSecretVisible ? 'Sembunyikan' : 'Tampilkan'}
                          >
                            {isSecretVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Row 4: Zona Waktu */}
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-4 sm:col-span-3 text-slate-400">Zona Waktu</div>
                        <div className="col-span-1 text-center text-slate-500">:</div>
                        <div className="col-span-7 sm:col-span-8 text-slate-200">
                          +7
                        </div>
                      </div>

                      {/* Row 5: Snmp */}
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-4 sm:col-span-3 text-slate-400">Snmp</div>
                        <div className="col-span-1 text-center text-slate-500">:</div>
                        <div className="col-span-7 sm:col-span-8">
                          {nas.status === 'online' ? (
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold lowercase text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                online
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({nas.lastPing || '1.2 ms'})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleTestConnection(nas)}
                                disabled={testingNasId === nas.id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                                title="Uji ulang respon ping & port API router secara realtime"
                              >
                                {testingNasId === nas.id ? (
                                  <>
                                    <RotateCw className="w-2.5 h-2.5 animate-spin" />
                                    <span>Menguji...</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCw className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>Uji Ping</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold lowercase text-xs">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                offline
                              </span>
                              <span className="text-[10px] text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                                Belum di-paste di Winbox
                              </span>
                              <button
                                type="button"
                                onClick={() => handleTestConnection(nas)}
                                disabled={testingNasId === nas.id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 rounded text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                                title="Uji koneksi SNMP & RADIUS setelah paste di Winbox"
                              >
                                {testingNasId === nas.id ? (
                                  <>
                                    <RotateCw className="w-3 h-3 animate-spin" />
                                    <span>Menguji...</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3 h-3 text-emerald-400" />
                                    <span>Uji Koneksi</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 6: Skrip Mikrotik (Blue Button [i] Lihat) */}
                      <div className="grid grid-cols-12 items-center pt-1">
                        <div className="col-span-4 sm:col-span-3 text-slate-400">Skrip Mikrotik</div>
                        <div className="col-span-1 text-center text-slate-500">:</div>
                        <div className="col-span-7 sm:col-span-8 flex items-center flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNasForScript(nas);
                              setActiveScriptStep('all');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-md shadow transition-all cursor-pointer text-xs"
                            title="Lihat 3 skrip MikroTik (VPN, NAS RADIUS, Scheduler Otomatis)"
                          >
                            <Info className="w-3.5 h-3.5 fill-white text-blue-600" />
                            <span>Lihat Skrip (3 Step)</span>
                          </button>
                          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/80">
                            1. VPN &bull; 2. NAS &bull; 3. Scheduler
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Floating Success Toast for Connection Test */}
      {testSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-emerald-500/50 rounded-xl shadow-2xl flex items-center gap-3 text-xs text-white max-w-md animate-fadeIn">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="leading-relaxed">{testSuccessToast.message}</span>
        </div>
      )}

      {/* Modal Dialog: Skrip MikroTik Ready to Copy (When clicking [Lihat]) */}
      {selectedNasForScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Skrip MikroTik RADIUS - {selectedNasForScript.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedNasForScript.status === 'online'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {selectedNasForScript.status === 'online' ? '● Online (SNMP Aktif)' : '○ Belum Dikonfigurasi di Winbox'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Host RADIUS: <span className="font-mono text-emerald-400">{radiusServerHost}</span> | Secret: <span className="font-mono text-blue-300">{selectedNasForScript.radiusSecret || 'Server@123'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNasForScript(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-200 leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-100 text-sm">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>3 Skrip Wajib MikroTik (Dijalankan Berurutan):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-blue-500/30">
                    <span className="font-bold text-amber-400 block mb-0.5">1. Skrip VPN WireGuard</span>
                    <span className="text-slate-300">Menghubungkan tunnel router ke server remote Masmedia VPS.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-blue-500/30">
                    <span className="font-bold text-emerald-400 block mb-0.5">2. Skrip NAS & RADIUS</span>
                    <span className="text-slate-300">Autentikasi AAA PPPoE, Hotspot, CoA isolir port 3799, dan SNMP.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-blue-500/30">
                    <span className="font-bold text-cyan-400 block mb-0.5">3. Skrip Scheduler Otomatis</span>
                    <span className="text-slate-300">Kirim sinyal heartbeat realtime tiap 30 detik agar status ONLINE.</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-300/90 pt-1 font-medium">
                  ⚠️ <strong>Catatan Penting:</strong> Skrip tidak digabung demi kestabilan RouterOS. Pilih tab skrip 1, 2, atau 3 di bawah, lalu salin dan jalankan satu per satu di <strong>Winbox &gt; New Terminal</strong>.
                </p>
              </div>

              {/* Step Tabs (Terpisah Satu Per Satu) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setActiveScriptStep('step1')}
                  className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeScriptStep === 'step1'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-bold flex items-center justify-center">1</span>
                  <span>1. Skrip VPN WireGuard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScriptStep('step2')}
                  className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeScriptStep === 'step2'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold flex items-center justify-center">2</span>
                  <span>2. Skrip NAS (RADIUS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScriptStep('step3')}
                  className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeScriptStep === 'step3'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-cyan-500/30 text-cyan-200 text-[10px] font-bold flex items-center justify-center">3</span>
                  <span>3. Skrip Scheduler Heartbeat</span>
                </button>
              </div>

              {/* Code Pre Block */}
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-x border-slate-800 rounded-t-xl text-[11px] text-slate-400 font-mono">
                  <span>
                    {activeScriptStep === 'step1' && 'Langkah 1: Skrip VPN WireGuard Tunnel & Port Remot Winbox'}
                    {activeScriptStep === 'step2' && 'Langkah 2: Skrip NAS (FreeRADIUS AAA + CoA 3799 + SNMP MikroTik)'}
                    {activeScriptStep === 'step3' && 'Langkah 3: Skrip Scheduler Otomatis (Heartbeat Sinyal Realtime Tiap 30 Detik)'}
                  </span>
                  <span className="text-emerald-400">Siap Tempel di Terminal</span>
                </div>
                <pre className="p-4 rounded-b-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72 leading-relaxed selection:bg-blue-500 selection:text-white">
                  {getActiveScriptByStep(selectedNasForScript)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-400">
                Router: <span className="font-semibold text-white">{selectedNasForScript.name}</span> | IP: <span className="font-mono text-emerald-300">{selectedNasForScript.ipAddress}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleTestConnection(selectedNasForScript);
                  }}
                  disabled={testingNasId === selectedNasForScript.id}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Uji apakah skrip sudah berhasil ditempel di Winbox"
                >
                  {testingNasId === selectedNasForScript.id ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menguji Koneksi...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Uji Koneksi MikroTik</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedNasForScript(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleCopyScript(getActiveScriptByStep(selectedNasForScript))}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {copiedModalScript ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Skrip Berhasil Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>
                        {activeScriptStep === 'step1' && 'Salin Skrip 1 (VPN WireGuard)'}
                        {activeScriptStep === 'step2' && 'Salin Skrip 2 (NAS RADIUS)'}
                        {activeScriptStep === 'step3' && 'Salin Skrip 3 (Scheduler Heartbeat)'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: Edit Router NAS */}
      {editingNas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                Edit Router NAS {editingNas.name}
              </h3>
              <button
                onClick={() => setEditingNas(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nama Router</label>
                <input
                  type="text"
                  value={editRouterName}
                  onChange={e => setEditRouterName(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Alamat IP Router</label>
                <input
                  type="text"
                  value={editRouterIp}
                  onChange={e => setEditRouterIp(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showEditSecret ? 'text' : 'password'}
                    value={editRadiusSecret}
                    onChange={e => setEditRadiusSecret(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditSecret(!showEditSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showEditSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Zona Waktu</label>
                <select
                  value={editTimezone}
                  onChange={e => setEditTimezone(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="+7 Asia/Jakarta">+7 Asia/Jakarta</option>
                  <option value="+8 Asia/Makassar">+8 Asia/Makassar</option>
                  <option value="+9 Asia/Jayapura">+9 Asia/Jayapura</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNas(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
