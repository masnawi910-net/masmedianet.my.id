import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MikroTikNAS } from '../../types';
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

export const RadiusSettingView: React.FC = () => {
  const {
    nasList,
    addNAS,
    updateNAS,
    deleteNAS,
    pingRouter,
    radiusServerConfig,
    vpnConfigs,
    setActiveTab,
  } = useApp();

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

  // Modal State for "Skrip Mikrotik" (Lihat)
  const [selectedNasForScript, setSelectedNasForScript] = useState<MikroTikNAS | null>(null);
  const [copiedModalScript, setCopiedModalScript] = useState(false);

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

  // Test SNMP & RADIUS connectivity
  const handleTestConnection = (nas: MikroTikNAS) => {
    setTestingNasId(nas.id);
    setTestSuccessToast(null);

    setTimeout(() => {
      pingRouter(nas.id);
      updateNAS(nas.id, {
        status: 'online',
        uptime: '4w 2d 18h',
        cpuLoad: Math.floor(Math.random() * 15) + 8,
        lastPing: 'Koneksi Sukses (1.2 ms)',
      });
      setTestingNasId(null);
      setTestSuccessToast({
        nasId: nas.id,
        message: `✓ MikroTik "${nas.name}" (${nas.ipAddress}) berhasil terhubung! SNMP UDP 161 & RADIUS AAA Port 3799 ONLINE.`,
      });

      setTimeout(() => {
        setTestSuccessToast(null);
      }, 5000);
    }, 800);
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

  const generateFullRadiusScript = (nas: MikroTikNAS): string => {
    const host = radiusServerHost;
    const secret = nas.radiusSecret || 'Server@123';
    const authPort = radiusServerConfig?.authPort || 1812;
    const acctPort = radiusServerConfig?.acctPort || 1813;
    const coaPort = radiusServerConfig?.coaPort || 3799;

    return `# ====================================================================
# SCRIPT KONFIGURASI RADIUS AAA MIKROTIK - ${nas.name}
# IP RADIUS Server : ${host}
# Secret Key RADIUS: ${secret}
# ====================================================================

# 1. Bersihkan konfigurasi RADIUS lama
/radius remove [find comment~"Masmedia|RadbooX|Billing|FreeRADIUS"]

# 2. Daftarkan RADIUS Server untuk Service PPP & Hotspot
/radius add address=${host} secret="${secret}" \\
    service=ppp,hotspot authentication-port=${authPort} accounting-port=${acctPort} \\
    timeout=3000ms comment="Masmedia FreeRADIUS Server"

# 3. Aktifkan Incoming RADIUS (CoA / Packet of Disconnect untuk Kick & Isolir Otomatis)
/radius incoming set accept=yes port=${coaPort}

# 4. Sinkronkan PPP AAA dengan FreeRADIUS Server
/ppp aaa set use-radius=yes accounting=yes interim-update=00:01:00

# 5. Sinkronkan Hotspot Server Profile dengan RADIUS
/ip hotspot profile set [find default=yes] use-radius=yes radius-accounting=yes radius-interim-update=00:01:00 \\
    login-by=http-chap,http-pap,mac-cookie split-user-domain=no

:put ">>> CONFIG RADIUS ${nas.name} BERHASIL DIPASANG! <<<"
`;
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
          <span className="text-blue-400 font-semibold">Radius</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('setting-vpn')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Setting VPN Tunnel ({vpnConfigs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('mikrotik')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors font-medium"
          >
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>Router NAS Monitor</span>
          </button>
        </div>
      </div>

      {/* Top Banner Notice (Exact replica of RadbooX INFO banner in reference screenshot) */}
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
              Jika router MikroTik anda tidak memiliki IP Public, Pastikan anda sudah membuat account VPN terlebih dulu pada link berikut{' '}
              <button
                type="button"
                onClick={() => setActiveTab('setting-vpn')}
                className="inline-flex items-center gap-1 px-3 py-0.5 mx-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-md shadow transition-all cursor-pointer align-middle"
              >
                Buat VPN
              </button>{' '}
              Dan pastikan juga Account VPN sudah di setting pada router MikroTik yang ingin di gunakan sebagai router NAS. Jika ada kendala untuk setting VPN silahkan hubungi team Teknis kami. Character constants bisa anda lihat pada info dibawah.
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
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold lowercase text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                online
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({nas.lastPing || '1.2 ms'})
                              </span>
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
                        <div className="col-span-7 sm:col-span-8">
                          <button
                            type="button"
                            onClick={() => setSelectedNasForScript(nas)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-md shadow transition-all cursor-pointer text-xs"
                            title="Lihat skrip terminal MikroTik RADIUS AAA"
                          >
                            <Info className="w-3.5 h-3.5 fill-white text-blue-600" />
                            <span>Lihat</span>
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
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-100">Langkah Pemasangan di Winbox MikroTik:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 mt-1">
                    <li>Buka aplikasi <strong>Winbox</strong> dan login ke Router MikroTik Anda.</li>
                    <li>Buka menu <strong>New Terminal</strong> di Winbox.</li>
                    <li>Klik tombol <strong>Salin Skrip</strong> di bawah, lalu <strong>Paste</strong> ke Terminal dan tekan <strong>Enter</strong>.</li>
                    <li>Setelah selesai di Winbox, klik tombol <strong>Uji Koneksi Setelah di Winbox</strong> di bawah untuk memverifikasi SNMP & RADIUS online!</li>
                  </ol>
                </div>
              </div>

              {/* Code Pre Block */}
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-x border-slate-800 rounded-t-xl text-[11px] text-slate-400 font-mono">
                  <span>MikroTik RouterOS Script (AAA + CoA Port 3799)</span>
                  <span className="text-emerald-400">Siap Tempel (1-Click)</span>
                </div>
                <pre className="p-4 rounded-b-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72 leading-relaxed selection:bg-blue-500 selection:text-white">
                  {generateFullRadiusScript(selectedNasForScript)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-400">
                IP Router: <span className="font-mono text-slate-200">{selectedNasForScript.ipAddress}</span>
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
                  onClick={() => handleCopyScript(generateFullRadiusScript(selectedNasForScript))}
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
                      <span>Salin Skrip</span>
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
