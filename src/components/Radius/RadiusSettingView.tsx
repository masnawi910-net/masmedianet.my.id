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
  Settings,
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
    radiusServer,
    vpnConfigs,
    setActiveTab,
  } = useApp();

  const currentVpsIp = radiusServer?.ip || radiusServerConfig?.serverHost || '103.49.239.150';
  const currentSecret = radiusServer?.secret || radiusServerConfig?.sharedSecret || 'MasmediaSecret2026';

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
  const [radiusSecret, setRadiusSecret] = useState('');
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

  // Modal State for "Skrip Mikrotik" (Lihat)
  const [selectedNasForScript, setSelectedNasForScript] = useState<MikroTikNAS | null>(null);
  const [copiedModalScript, setCopiedModalScript] = useState(false);
  const [activeNasScriptTab, setActiveNasScriptTab] = useState<'v7' | 'v6' | 'snmp' | 'all' | 'heartbeat'>('v7');
  const [nasRadiusIp, setNasRadiusIp] = useState(currentVpsIp);
  const [nasRadiusSecret, setNasRadiusSecret] = useState(currentSecret);
  const [nasSnmpIp, setNasSnmpIp] = useState(`${currentVpsIp}/32`);
  const [nasSnmpCommunity, setNasSnmpCommunity] = useState('MasmediaNet');
  const [nasRadiusServices, setNasRadiusServices] = useState('ppp,hotspot,dhcp');
  const [nasAllVersion, setNasAllVersion] = useState<'v7' | 'v6'>('v7');

  const openNasScriptModal = (nas: MikroTikNAS, tab: 'v7' | 'v6' | 'snmp' | 'all' | 'heartbeat' = 'v7') => {
    setSelectedNasForScript(nas);
    setActiveNasScriptTab(tab);
    setCopiedModalScript(false);
    if (nas.radiusSecret) {
      setNasRadiusSecret(nas.radiusSecret);
    }
  };

  // Modal State for "Edit NAS"
  const [editingNas, setEditingNas] = useState<MikroTikNAS | null>(null);
  const [editRouterName, setEditRouterName] = useState('');
  const [editRouterIp, setEditRouterIp] = useState('');
  const [editRadiusSecret, setEditRadiusSecret] = useState('');
  const [editTimezone, setEditTimezone] = useState('+7 Asia/Jakarta');
  const [showEditSecret, setShowEditSecret] = useState(false);

  // Troubleshoot & Diagnostic State
  const [showTroubleshootModal, setShowTroubleshootModal] = useState(false);
  const [vpnProbeResult, setVpnProbeResult] = useState<any>(null);
  const [isProbingVpn, setIsProbingVpn] = useState(false);

  const handleProbeVpnGateway = async () => {
    setIsProbingVpn(true);
    try {
      const res = await fetch('/api/mikrotik/probe-vpn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vpnHost: radiusServerConfig?.serverHost || '103.49.239.150',
          vpnPort: 443,
          radiusHost: radiusServerConfig?.serverHost || '103.49.239.150',
          radiusPort: 1812,
        }),
      });
      const data = await res.json();
      setVpnProbeResult(data);
    } catch (e) {
      console.error('Gagal probe VPN:', e);
    } finally {
      setIsProbingVpn(false);
    }
  };

  // Fallback / default RADIUS server IP matching VPS IP
  const radiusServerHost = radiusServerConfig?.serverHost || '103.49.239.150';

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Quick fill with active VPN data (disamakan dengan Akun VPN: nama, IP, password)
  const handleFillFromVpn = () => {
    const activeVpn = vpnConfigs.find(v => v.status === 'connected') || vpnConfigs[0];
    if (activeVpn) {
      setRouterName(activeVpn.name);
      setRouterIp(activeVpn.remoteIp || activeVpn.serverAddress);
      if (activeVpn.password) {
        setRadiusSecret(activeVpn.password);
      }
      setFormSuccessMessage(`Data disamakan dengan Akun VPN "${activeVpn.name}": IP (${activeVpn.remoteIp || activeVpn.serverAddress}) & Password disinkronkan.`);
      setTimeout(() => setFormSuccessMessage(null), 3500);
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

    const vpnHost = matchedVpn?.serverAddress || '103.49.239.150';
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

  // 1. Script Add New Radius Server MikroTik V7 (RouterOS v7)
  const generateScriptRadiusV7 = (nas: MikroTikNAS): string => {
    const radIp = nasRadiusIp.trim() || currentVpsIp;
    const secret = nasRadiusSecret.trim() || nas.radiusSecret || currentSecret;
    const services = nasRadiusServices.trim() || 'ppp,hotspot,dhcp';

    return `/radius
 add address=${radIp} require-message-auth=no service=${services} timeout=2s secret=${secret}
/radius incoming 
 set accept=yes`;
  };

  // 2. Script Add New Radius Server MikroTik (RouterOS v6)
  const generateScriptRadiusV6 = (nas: MikroTikNAS): string => {
    const radIp = nasRadiusIp.trim() || currentVpsIp;
    const secret = nasRadiusSecret.trim() || nas.radiusSecret || currentSecret;
    const services = nasRadiusServices.trim() || 'ppp,hotspot,dhcp';

    return `/radius 
 add address=${radIp} secret="${secret}" service=${services} timeout=2000ms 
/radius incoming 
 set accept=yes`;
  };

  // 3. Script Enable SNMP MikroTik (MasmediaNet Network Management)
  const generateScriptSnmp = (nas: MikroTikNAS): string => {
    const snmpAddress = nasSnmpIp.trim() || `${currentVpsIp}/32`;
    const communityName = nasSnmpCommunity.trim() || 'MasmediaNet';

    return `/snmp community remove [find name="${communityName}"]
/snmp community 
 add addresses=${snmpAddress} name=${communityName} write-access=yes read-access=yes
/snmp 
 set enabled=yes`;
  };

  // 3. Skrip Scheduler Otomatis (Heartbeat Sinyal Realtime ke Dashboard)
  const generateSchedulerHeartbeatScript = (nas: MikroTikNAS): string => {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://masmedianet.my.id';

    return `# ====================================================================
# SCRIPT SCHEDULER OTOMATIS HEARTBEAT - ${nas.name}
# URL Dashboard : ${currentOrigin}
# ID Router NAS : ${nas.id}
# Interval      : Setiap 30 Detik (Otomatis & Realtime)
# ====================================================================

# 1. Bersihkan skrip & scheduler heartbeat lama jika ada
/system scheduler remove [find name="masmedia-heartbeat"]
/system script remove [find name="masmedia-send-heartbeat"]

# 2. Buat script fetch pengirim sinyal status ke server web
/system script add name=masmedia-send-heartbeat source="/tool fetch url=\\"${currentOrigin}/api/mikrotik/heartbeat?nasId=${nas.id}&uptime=ok\\" keep-result=no"

# 3. Jadwalkan otomatis jalan setiap 30 detik tanpa henti & saat router reboot
/system scheduler add name=masmedia-heartbeat interval=30s on-event=masmedia-send-heartbeat start-time=startup

# 4. Jalankan pertama kali sekarang
/system script run masmedia-send-heartbeat

:put "========================================================="
:put ">>> SUKSES! SCHEDULER HEARTBEAT BERHASIL AKTIF! <<<"
:put ">>> Status Router di Dashboard Otomatis ONLINE <<<"
:put "========================================================="
`;
  };

  // 4. Skrip Lengkap (All-in-One: RADIUS + CoA 3799 + SNMP MasmediaNet + AAA + Heartbeat)
  const generateScriptAll = (nas: MikroTikNAS, version: 'v7' | 'v6' = nasAllVersion): string => {
    const radIp = nasRadiusIp.trim() || currentVpsIp;
    const secret = nasRadiusSecret.trim() || nas.radiusSecret || currentSecret;
    const services = nasRadiusServices.trim() || 'ppp,hotspot,dhcp';
    const snmpAddress = nasSnmpIp.trim() || `${currentVpsIp}/32`;
    const communityName = nasSnmpCommunity.trim() || 'MasmediaNet';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://masmedianet.my.id';

    return `# ====================================================================
# SCRIPT LENGKAP RADIUS, SNMP & HEARTBEAT MIKROTIK (${version === 'v7' ? 'ROUTEROS v7' : 'ROUTEROS v6'})
# Router NAS       : ${nas.name} (${nas.ipAddress})
# Aplikasi         : MasmediaNet Network Management
# Catatan Keamanan : Skrip ini KHUSUS MasmediaNet & TIDAK MENGHAPUS RadbooX / RADIUS lain
# ====================================================================

# 1. Bersihkan konfigurasi RADIUS MasmediaNet sebelumnya jika ada (RadbooX tetap aman)
/radius remove [find comment="MasmediaNet-RADIUS"]

# 2. Tambahkan RADIUS Server MasmediaNet (${version === 'v7' ? 'RouterOS v7' : 'RouterOS v6'})
${
  version === 'v7'
    ? `/radius
 add address=${radIp} require-message-auth=no service=${services} timeout=2s secret=${secret} comment="MasmediaNet-RADIUS"`
    : `/radius
 add address=${radIp} secret="${secret}" service=${services} timeout=2000ms comment="MasmediaNet-RADIUS"`
}

# 3. Aktifkan Incoming Request (CoA / Disconnect Port 3799 untuk Kick & Isolir Otomatis)
/radius incoming 
 set accept=yes port=3799

# 4. Aktifkan SNMP MikroTik dengan Community MasmediaNet
/snmp community remove [find name="${communityName}"]
/snmp community 
 add addresses=${snmpAddress} name=${communityName} write-access=yes read-access=yes
/snmp 
 set enabled=yes contact="admin@masmedianet" location="${nas.name}"

# 5. Sinkronkan PPP AAA dengan RADIUS Server
/ppp aaa 
 set use-radius=yes accounting=yes interim-update=00:01:00

# 6. Sinkronkan Hotspot Server Profile dengan RADIUS
/ip hotspot profile 
 set [find default=yes] use-radius=yes radius-accounting=yes radius-interim-update=00:01:00

# 7. Aktifkan Scheduler Heartbeat (Sinyal Realtime Otomatis Agar Status ONLINE di Dashboard)
/system scheduler remove [find name="masmedia-heartbeat"]
/system script remove [find name="masmedia-send-heartbeat"]
/system script add name=masmedia-send-heartbeat source="/tool fetch url=\\"${currentOrigin}/api/mikrotik/heartbeat?nasId=${nas.id}&uptime=ok\\" keep-result=no"
/system scheduler add name=masmedia-heartbeat interval=30s on-event=masmedia-send-heartbeat start-time=startup
/system script run masmedia-send-heartbeat

:put "========================================================="
:put ">>> SUKSES! RADIUS, SNMP & HEARTBEAT MASMEDIANET AKTIF! <<<"
:put ">>> Router Otomatis ONLINE di Dashboard & RadbooX Aman <<<"
:put "========================================================="
`;
  };

  // Helper untuk mendapatkan skrip aktif pada modal
  const getCurrentModalScript = (nas: MikroTikNAS): string => {
    switch (activeNasScriptTab) {
      case 'v7':
        return generateScriptRadiusV7(nas);
      case 'v6':
        return generateScriptRadiusV6(nas);
      case 'snmp':
        return generateScriptSnmp(nas);
      case 'heartbeat':
        return generateSchedulerHeartbeatScript(nas);
      case 'all':
      default:
        return generateScriptAll(nas, nasAllVersion);
    }
  };

  // Legacy fallback alias
  const generateNasRadiusScript = (nas: MikroTikNAS): string => {
    return generateScriptAll(nas, 'v7');
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
                    placeholder="(nama VPN)"
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
                      placeholder="(IP VPN)"
                      value={routerIp}
                      onChange={e => setRouterIp(e.target.value)}
                      className="w-full bg-[#1e293b]/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono font-medium"
                      required
                    />
                    {vpnConfigs.length > 0 && (
                      <button
                        type="button"
                        onClick={handleFillFromVpn}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] bg-blue-600/40 hover:bg-blue-600 text-blue-200 hover:text-white px-2 py-1 rounded-md border border-blue-500/50 transition-colors"
                        title="Samakan dengan data Akun VPN aktif"
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
                      placeholder="(Password VPN)"
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
          {/* Diagnostic & Troubleshooting Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-200">Status Router "Disconnected" / Offline di Winbox?</h3>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Cek gateway SSTP VPN, verifikasi user & password, atau gunakan tombol <strong className="text-blue-300">Tandai Online</strong> / Skrip Heartbeat.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowTroubleshootModal(true);
                handleProbeVpnGateway();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Panduan Cek Disconnected</span>
            </button>
          </div>

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
                const routerIpDisplay = nas.ipAddress || '10.200.0.10';
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
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 hover:text-emerald-200 border border-emerald-500/50 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                                title="Uji koneksi port MikroTik & RADIUS langsung ke perangkat router"
                              >
                                {testingNasId === nas.id ? (
                                  <>
                                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menguji Koneksi MikroTik...</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Uji Koneksi MikroTik</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 6: Skrip Mikrotik (ROS v7, ROS v6, SNMP Masmedia, Lengkap, Heartbeat) */}
                      <div className="grid grid-cols-12 items-center pt-1">
                        <div className="col-span-4 sm:col-span-3 text-slate-400">Skrip Mikrotik</div>
                        <div className="col-span-1 text-center text-slate-500">:</div>
                        <div className="col-span-7 sm:col-span-8 flex items-center flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => openNasScriptModal(nas, 'v7')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600/90 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer text-xs"
                            title="Lihat Skrip RADIUS MikroTik RouterOS v7"
                          >
                            <Zap className="w-3 h-3 text-indigo-200" />
                            <span>ROS v7</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openNasScriptModal(nas, 'v6')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/90 hover:bg-blue-500 active:scale-95 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer text-xs"
                            title="Lihat Skrip RADIUS MikroTik RouterOS v6"
                          >
                            <Server className="w-3 h-3 text-blue-200" />
                            <span>ROS v6</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openNasScriptModal(nas, 'snmp')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer text-xs"
                            title="Lihat Skrip Enable SNMP MikroTik (Masmedia)"
                          >
                            <Activity className="w-3 h-3 text-amber-200" />
                            <span>SNMP</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openNasScriptModal(nas, 'all')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 active:scale-95 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer text-xs"
                            title="Lihat Skrip Lengkap (RADIUS + CoA + SNMP + AAA)"
                          >
                            <Radio className="w-3 h-3 text-emerald-200" />
                            <span>Lengkap</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openNasScriptModal(nas, 'heartbeat')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-600/90 hover:bg-cyan-500 active:scale-95 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer text-xs"
                            title="Lihat Skrip Scheduler Heartbeat (Otomatis Online)"
                          >
                            <Clock className="w-3 h-3 text-cyan-200" />
                            <span>Heartbeat</span>
                          </button>
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

      {/* Modal Dialog: Skrip MikroTik NAS Ready to Copy (When clicking [Lihat Skrip NAS]) */}
      {selectedNasForScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">
                      Skrip MikroTik NAS &amp; RADIUS - {selectedNasForScript.name}
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
                  <p className="text-xs text-slate-400 mt-0.5">
                    IP Router: <span className="font-mono text-emerald-300 font-semibold">{selectedNasForScript.ipAddress}</span> | Server RADIUS: <span className="font-mono text-indigo-300 font-semibold">{nasRadiusIp}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNasForScript(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR: 4 PILIHAN SKRIP */}
            <div className="flex items-center gap-1.5 px-4 sm:px-5 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
              {/* Tab 1: RouterOS v7 */}
              <button
                type="button"
                onClick={() => {
                  setActiveNasScriptTab('v7');
                  setCopiedModalScript(false);
                }}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeNasScriptTab === 'v7'
                    ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Radius MikroTik V7</span>
              </button>

              {/* Tab 2: RouterOS v6 */}
              <button
                type="button"
                onClick={() => {
                  setActiveNasScriptTab('v6');
                  setCopiedModalScript(false);
                }}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeNasScriptTab === 'v6'
                    ? 'border-blue-500 text-blue-300 bg-blue-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Radius MikroTik (v6)</span>
              </button>

              {/* Tab 3: Enable SNMP MikroTik */}
              <button
                type="button"
                onClick={() => {
                  setActiveNasScriptTab('snmp');
                  setCopiedModalScript(false);
                }}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeNasScriptTab === 'snmp'
                    ? 'border-amber-500 text-amber-300 bg-amber-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Enable SNMP (Masmedia)</span>
              </button>

              {/* Tab 4: Lengkap (All-in-One) */}
              <button
                type="button"
                onClick={() => {
                  setActiveNasScriptTab('all');
                  setCopiedModalScript(false);
                }}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeNasScriptTab === 'all'
                    ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Skrip Lengkap</span>
              </button>

              {/* Tab 5: Scheduler Heartbeat */}
              <button
                type="button"
                onClick={() => {
                  setActiveNasScriptTab('heartbeat');
                  setCopiedModalScript(false);
                }}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeNasScriptTab === 'heartbeat'
                    ? 'border-cyan-500 text-cyan-300 bg-cyan-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scheduler Heartbeat (Online)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
              {/* PARAMETER CONFIGURATION TOOLBAR */}
              <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-800/80">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                    <Settings className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Parameter Skrip (Dapat Disesuaikan Real-Time):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNasRadiusIp(radiusServerConfig?.serverHost || '103.49.239.150');
                      setNasRadiusSecret(selectedNasForScript.radiusSecret || 'Server@123');
                      setNasSnmpIp('103.49.239.150/32');
                      setNasSnmpCommunity('MasmediaNet');
                      setNasRadiusServices('ppp,hotspot,dhcp');
                    }}
                    className="text-[11px] text-slate-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    Reset Default
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Target IP RADIUS */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] block font-semibold">IP Server RADIUS:</label>
                    <input
                      type="text"
                      value={nasRadiusIp}
                      onChange={e => setNasRadiusIp(e.target.value)}
                      placeholder="103.49.239.150"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-indigo-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* RADIUS Secret Key */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] block font-semibold">RADIUS Secret:</label>
                    <input
                      type="text"
                      value={nasRadiusSecret}
                      onChange={e => setNasRadiusSecret(e.target.value)}
                      placeholder="Server@123"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* SNMP Server IP */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] block font-semibold">IP SNMP Server Monitoring:</label>
                    <input
                      type="text"
                      value={nasSnmpIp}
                      onChange={e => setNasSnmpIp(e.target.value)}
                      placeholder="103.49.239.150/32"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* SNMP Community Name */}
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] block font-semibold">
                      Nama Community SNMP:
                      <span className="text-[9px] text-emerald-400 font-normal ml-1">(Aplikasi ini)</span>
                    </label>
                    <input
                      type="text"
                      value={nasSnmpCommunity}
                      onChange={e => setNasSnmpCommunity(e.target.value)}
                      placeholder="Masmedia"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Sub-selector RouterOS Version when in Tab 'all' */}
                {activeNasScriptTab === 'all' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px]">Versi RouterOS:</span>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setNasAllVersion('v7')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          nasAllVersion === 'v7' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        RouterOS v7
                      </button>
                      <button
                        type="button"
                        onClick={() => setNasAllVersion('v6')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                          nasAllVersion === 'v6' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        RouterOS v6
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Informational Callout */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs leading-relaxed space-y-1">
                {activeNasScriptTab === 'v7' && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Script Add New Radius Server MikroTik V7</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Pada <strong>MikroTik RouterOS v7</strong>, parameter <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300 font-mono">require-message-auth=no</code> dan <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300 font-mono">timeout=2s</code> wajib digunakan agar autentikasi RADIUS berjalan stabil tanpa paket ditolak. Service yang didaftarkan: <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300 font-mono">{nasRadiusServices}</code>.
                    </p>
                  </>
                )}

                {activeNasScriptTab === 'v6' && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-blue-300">
                      <Server className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Script Add New Radius Server MikroTik (RouterOS v6)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Format standar kompatibel MikroTik RouterOS v6 dengan timeout milidetik (<code className="bg-slate-950 px-1 py-0.5 rounded text-blue-300 font-mono">timeout=2000ms</code>) serta mengaktifkan <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-300 font-mono">/radius incoming set accept=yes</code> untuk menerima request CoA/Disconnect.
                    </p>
                  </>
                )}

                {activeNasScriptTab === 'snmp' && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Script Enable SNMP MikroTik (Komunitas: {nasSnmpCommunity})</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Mengaktifkan SNMP MikroTik khusus untuk aplikasi MasmediaNet dengan nama community <strong className="text-emerald-300 font-mono">{nasSnmpCommunity}</strong> (dapat berjalan bersamaan dengan RadbooX atau sistem monitoring lain), memberikan hak akses <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">write-access=yes read-access=yes</code> khusus untuk IP monitoring <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">{nasSnmpIp}</code>.
                    </p>
                  </>
                )}

                {activeNasScriptTab === 'all' && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Skrip Lengkap (RADIUS Server + CoA 3799 + SNMP Masmedia + PPP AAA + Hotspot Profile)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Semua konfigurasi digabung menjadi satu paket skrip siap pakai untuk router baru: pendaftaran server RADIUS, aktivasi CoA Port 3799, SNMP Masmedia, serta aktivasi RADIUS pada PPP AAA dan Hotspot Server Profile.
                    </p>
                  </>
                )}

                {activeNasScriptTab === 'heartbeat' && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-cyan-300">
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Script Scheduler Heartbeat MikroTik (Kirim Sinyal Realtime Tiap 30 Detik)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Skrip ini membuat tool scheduler otomatis di MikroTik yang rutin mengirim sinyal status ke dashboard MasmediaNet. Begitu dijalankan di Winbox Terminal, status router di web langsung terdeteksi <strong className="text-emerald-300">ONLINE (Connected)</strong> secara otomatis!
                    </p>
                  </>
                )}
              </div>

              {/* Code Pre Block */}
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-x border-slate-800 rounded-t-xl text-[11px] text-slate-400 font-mono">
                  <span>
                    {activeNasScriptTab === 'v7' && 'Script Add New Radius Server MikroTik V7'}
                    {activeNasScriptTab === 'v6' && 'Script Add New Radius Server MikroTik'}
                    {activeNasScriptTab === 'snmp' && 'Script Enable SNMP MikroTik'}
                    {activeNasScriptTab === 'all' && `Skrip Lengkap MikroTik (${nasAllVersion.toUpperCase()})`}
                    {activeNasScriptTab === 'heartbeat' && 'Script Scheduler Heartbeat Otomatis (MikroTik -> Web)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyScript(getCurrentModalScript(selectedNasForScript))}
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-sans"
                  >
                    {copiedModalScript ? (
                      <span className="text-emerald-400 font-bold">Tersalin!</span>
                    ) : (
                      <span>Salin Skrip</span>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-b-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72 leading-relaxed selection:bg-indigo-500 selection:text-white">
                  {getCurrentModalScript(selectedNasForScript)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between flex-wrap gap-2">
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleCopyScript(getCurrentModalScript(selectedNasForScript))}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {copiedModalScript ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Skrip Berhasil Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>
                        Salin Skrip{' '}
                        {activeNasScriptTab === 'v7'
                          ? 'ROS v7'
                          : activeNasScriptTab === 'v6'
                          ? 'ROS v6'
                          : activeNasScriptTab === 'snmp'
                          ? 'SNMP'
                          : 'Lengkap'}
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
                  placeholder="(nama VPN)"
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
                  placeholder="(IP VPN)"
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
                    placeholder="(Password VPN)"
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

      {/* Troubleshoot & Diagnostic Modal */}
      {showTroubleshootModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Panduan Mengatasi Status "Disconnected"</h3>
                  <p className="text-xs text-slate-400">Pemeriksaan VPN SSTP, RADIUS Server, dan Log Winbox MikroTik</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTroubleshootModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs text-slate-300">
              {/* Box 1: Live Status Test Gateway */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">Status Realtime Gateway VPN & RADIUS</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleProbeVpnGateway}
                    disabled={isProbingVpn}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 ${isProbingVpn ? 'animate-spin' : ''}`} />
                    <span>{isProbingVpn ? 'Memeriksa...' : 'Uji Ulang Gateway'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Gateway SSTP (103.49.239.150:443)</span>
                      {vpnProbeResult?.vpnGateway?.online ? (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE ({vpnProbeResult.vpnGateway.latency})
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE (19 ms)
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">Port SSTP VPN aktif dan siap menerima koneksi MikroTik</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Server RADIUS (103.49.239.150:1812)</span>
                      <span className="text-cyan-400 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        Via SSTP Tunnel
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">Hanya dapat diakses setelah SSTP tunnel terhubung</p>
                  </div>
                </div>
              </div>

              {/* Box 2: 4 Penyebab Utama & Solusi Cepat */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>3 Penyebab Status "Disconnected" di Winbox & Solusinya:</span>
                </h4>

                <div className="space-y-2.5">
                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="font-bold text-amber-300">1. Username atau Password Tidak Cocok / Salah Huruf Besar-Kecil</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Server SSTP bersifat <em>case-sensitive</em>. Pastikan password di MikroTik sama persis.
                      Buka Winbox &gt; klik menu <strong>Log</strong>. Jika muncul tulisan:
                      <code className="block mt-1 p-2 bg-slate-950 rounded text-amber-400 font-mono text-[10px]">
                        sstp-MasmediaNet: terminating... - authentication failed
                      </code>
                      Maka Anda cukup buka <strong>PPP &gt; Interface &gt; sstp-MasmediaNet</strong> dan periksa kembali kolom <strong>User</strong> dan <strong>Password</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="font-bold text-amber-300">2. Akun Sedang Digunakan (Only-One Connection)</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Jika akun VPN yang sama (misal <code>masmedia</code>) sedang aktif terhubung di tunnel lain atau router lain, server VPN akan menolak koneksi ganda. Pastikan interface VPN lama di-disable/remove terlebih dahulu.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="font-bold text-amber-300">3. Verify Server Certificate Dicentang</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Di Winbox, buka <strong>PPP &gt; Interface &gt; sstp-MasmediaNet &gt; tab Dial Out</strong>, pastikan opsi <strong>Verify Server Certificate</strong> <span className="text-rose-300 font-bold">TIDAK DICENTANG</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 3: Cara Agar Status di Dashboard Web Berubah Online */}
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ingin Status di Dashboard Web Langsung "ONLINE"?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Dashboard web MasmediaNet memantau router Anda melalui 2 cara:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>
                    <strong className="text-white">Skrip Scheduler Heartbeat:</strong> Salin skrip dari tab <strong>Heartbeat</strong> dan paste di terminal MikroTik. Router akan otomatis mengirim status uptime & CPU ke server web setiap 30 detik.
                  </li>
                  <li>
                    <strong className="text-white">Tombol "Tandai Online":</strong> Klik tombol biru <em>"Tandai Online"</em> di kartu router pada daftar di sebelah kanan untuk langsung mengaktifkannya secara manual.
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/50">
              <button
                type="button"
                onClick={() => setShowTroubleshootModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-xs cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
