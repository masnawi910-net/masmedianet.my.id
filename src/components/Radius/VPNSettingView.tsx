import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VPNConfig } from '../../types';
import {
  generateWireGuardPrivateKey,
  getSavedWireGuardServerPubKey,
  saveWireGuardServerPubKey,
  DEFAULT_WG_SERVER_PUBKEY,
} from '../../utils/wireguardKeys';
import {
  Shield,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Info,
  Trash2,
  CheckCircle2,
  X,
  Terminal,
  Server,
  Zap,
  ChevronLeft,
  ChevronRight,
  Send,
  Settings,
  Key,
} from 'lucide-react';

export interface VPNSettingViewProps {
  embedded?: boolean;
}

export const VPNSettingView: React.FC<VPNSettingViewProps> = ({ embedded = false }) => {
  const { vpnConfigs, addVPN, deleteVPN, setActiveTab } = useApp();

  // VPS Server Public Host IP (Default user VPS IP)
  const defaultServerHost = '103.49.239.150';
  const [serverHost] = useState(defaultServerHost);

  // Form State - ONLY Account Name, Username, and Password as requested
  const [accountName, setAccountName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Password visibility map for table rows
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modal State for Script Viewer with 3 Protocol Tabs
  const [selectedVpnModal, setSelectedVpnModal] = useState<VPNConfig | null>(null);
  const [activeProtocolTab, setActiveProtocolTab] = useState<'wireguard' | 'sstp' | 'l2tp'>('wireguard');
  const [showWaShare, setShowWaShare] = useState(false);
  const [copiedModalScript, setCopiedModalScript] = useState(false);
  const [quickCopiedId, setQuickCopiedId] = useState<string | null>(null);

  // Calculate Next Dynamic Allocation (IP and Ports)
  const nextAllocation = useMemo(() => {
    const usedIps = new Set(vpnConfigs.map(item => item.remoteIp).filter(Boolean));
    const usedWinboxPorts = new Set(vpnConfigs.map(item => item.remoteWinboxPort).filter(Boolean));
    const usedWebPorts = new Set(vpnConfigs.map(item => item.remoteWebPort).filter(Boolean));

    // Next IP in 10.200.0.X (bersih dari 172.31.154.X milik RadbooX)
    let octet = 10;
    while (usedIps.has(`10.200.0.${octet}`) && octet < 254) {
      octet++;
    }
    const nextIp = `10.200.0.${octet}`;

    let nextWinboxPort = 18291;
    while (usedWinboxPorts.has(nextWinboxPort)) {
      nextWinboxPort++;
    }

    let nextWebPort = 18080;
    while (usedWebPorts.has(nextWebPort)) {
      nextWebPort++;
    }

    return {
      ip: nextIp,
      winboxPort: nextWinboxPort,
      webPort: nextWebPort,
    };
  }, [vpnConfigs]);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyScript = (script: string, id?: string) => {
    navigator.clipboard.writeText(script);
    if (id) {
      setQuickCopiedId(id);
      setTimeout(() => setQuickCopiedId(null), 2500);
    } else {
      setCopiedModalScript(true);
      setTimeout(() => setCopiedModalScript(false), 2500);
    }
  };

  // Form Submission: Mitra hanya mengisi nama akun, username, dan password
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccessMessage(null);
    setFormErrorMessage(null);

    if (!accountName.trim()) {
      setFormErrorMessage('Account Name tidak boleh kosong.');
      return;
    }
    if (!username.trim()) {
      setFormErrorMessage('User (Username) tidak boleh kosong.');
      return;
    }
    if (!password.trim()) {
      setFormErrorMessage('Password tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const allocatedIp = nextAllocation.ip;
      const allocatedWinboxPort = nextAllocation.winboxPort;
      const allocatedWebPort = nextAllocation.webPort;

      addVPN({
        name: accountName.trim(),
        type: 'wireguard',
        serverAddress: serverHost.trim() || defaultServerHost,
        username: username.trim(),
        password: password.trim(),
        remoteIp: allocatedIp,
        localIp: '10.200.0.1',
        clientIp: `${allocatedIp}/24`,
        subnet: '10.200.0.0/24',
        port: 51820,
        remoteWinboxPort: allocatedWinboxPort,
        remoteWebPort: allocatedWebPort,
        secretKey: password.trim(),
        status: 'connected',
        createdAt: new Date().toISOString().slice(0, 10),
      });

      setIsSubmitting(false);
      setFormSuccessMessage(
        `Akun VPN "${accountName}" berhasil dibuat! IP: ${allocatedIp}, Remote Winbox: ${allocatedWinboxPort}. Silakan klik tombol [View] untuk melihat skrip WireGuard, SSTP, atau L2TP.`
      );

      // Reset form fields
      setAccountName('');
      setUsername('');
      setPassword('');

      setTimeout(() => {
        setFormSuccessMessage(null);
      }, 5000);
    }, 250);
  };

  // Filtered VPN configs based on search query
  const filteredVpnConfigs = useMemo(() => {
    return vpnConfigs.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.username && item.username.toLowerCase().includes(q)) ||
        (item.remoteIp && item.remoteIp.toLowerCase().includes(q)) ||
        (item.serverAddress && item.serverAddress.toLowerCase().includes(q)) ||
        (item.remoteWinboxPort && String(item.remoteWinboxPort).includes(q))
      );
    });
  }, [vpnConfigs, searchQuery]);

  // Paginated data
  const totalItems = filteredVpnConfigs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredVpnConfigs.slice(startIndex, startIndex + rowsPerPage);

  // Script Generator 1: WireGuard (Ros 7)
  const generateWireGuardScript = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const ip = vpn.remoteIp || '10.200.0.10';
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const iface = 'wg-masmedia';

    return `# ====================================================================
# TAB 1. SCRIPT WIREGUARD CLIENT MIKROTIK (ROUTEROS v7)
# Akun: ${vpn.name} | User: ${vpn.username}
# Server Host: ${host} | Port Endpoint: 51820
# IP Tunnel  : ${ip}/24
# Remote Winbox: ${host}:${winboxPort}
# ====================================================================

# 1. Bersihkan interface WireGuard lama jika ada
/interface wireguard remove [find name="${iface}"]

# 2. Buat interface WireGuard Client
/interface wireguard
add name="${iface}" listen-port=13231 mtu=1420 comment="VPN Remote Masmedia WireGuard - ${vpn.name}"

# 3. Tetapkan IP Tunnel ke Router
/ip address
add address=${ip}/24 interface="${iface}" comment="IP Tunnel WireGuard Masmedia"

# 4. Daftarkan Peer ke Server VPS Masmedia
# (Pastikan public-key server VPS diisi sesuai dengan output 'wg show' di VPS Anda)
/interface wireguard peers
add interface="${iface}" public-key="${vpn.serverPublicKey || 'MASUKKAN_PUBLIC_KEY_VPS_ANDA'}" endpoint-address="${host}" endpoint-port=51820 \\
    allowed-address=0.0.0.0/0 persistent-keepalive=25s comment="Masmedia VPS WireGuard Endpoint"

# 5. Aktifkan Service Winbox, API & Web
/ip service enable winbox
/ip service set winbox port=8291
/ip service enable api
/ip service set api port=8728
/ip service enable www
/ip service set www port=80

# 6. Izinkan Firewall Masuk dari WireGuard
/ip firewall filter
add chain=input in-interface="${iface}" action=accept place-before=0 comment="Allow Remote via WireGuard Masmedia"

:put "========================================================="
:put ">>> SUKSES! WIREGUARD (ROS 7) ${vpn.name} BERHASIL DIPASANG <<<"
:put ">>> Remote Winbox: ${host}:${winboxPort} <<<"
:put "========================================================="
`;
  };

  // Script Generator 2: SSTP (SSL 443)
  const generateSstpScript = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const user = vpn.username || 'masmedia';
    const pass = vpn.password || vpn.secretKey || 'server@123';
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const iface = 'sstp-masmedia';

    return `# ====================================================================
# TAB 2. SCRIPT SSTP CLIENT MIKROTIK (SSL PORT 443)
# Akun: ${vpn.name} | User: ${user}
# Server Host: ${host} | Port: 443 (SSL TCP - Anti Blokir)
# Remote Winbox: ${host}:${winboxPort}
# Kompatibel: RouterOS v6 & RouterOS v7
# ====================================================================

# 1. Hapus koneksi SSTP lama jika ada
/interface sstp-client remove [find name~"${iface}|vpn-sstp"]

# 2. Hubungkan SSTP Client ke VPS Masmedia
/interface sstp-client
add name="${iface}" connect-to="${host}" port=443 user="${user}" \\
    password="${pass}" profile=default-encryption verify-server-certificate=no \\
    add-default-route=no disabled=no comment="VPN SSTP Remote Masmedia - ${vpn.name}"

# 3. Aktifkan Service Winbox, API & Web
/ip service enable winbox
/ip service set winbox port=8291
/ip service enable api
/ip service set api port=8728
/ip service enable www
/ip service set www port=80

# 4. Izinkan Firewall Input dari Interface SSTP
/ip firewall filter
add chain=input in-interface="${iface}" action=accept place-before=0 comment="Allow Remote via SSTP Masmedia"

:put "========================================================="
:put ">>> SUKSES! SSTP (SSL 443) ${vpn.name} BERHASIL DIHUBUNGKAN! <<<"
:put ">>> Remote Winbox: ${host}:${winboxPort} <<<"
:put "========================================================="
`;
  };

  // Script Generator 3: L2TP Ros 6/7
  const generateL2tpScript = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const user = vpn.username || 'masmedia';
    const pass = vpn.password || vpn.secretKey || 'server@123';
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const iface = 'l2tp-masmedia';

    return `# ====================================================================
# TAB 3. SCRIPT L2TP CLIENT MIKROTIK (ROUTEROS v6 & v7)
# Akun: ${vpn.name} | User: ${user}
# Server Host: ${host} | Port: 1701 UDP (IPsec)
# Remote Winbox: ${host}:${winboxPort}
# Kompatibel: RouterOS v6 & RouterOS v7
# ====================================================================

# 1. Hapus koneksi L2TP lama jika ada
/interface l2tp-client remove [find name~"${iface}|vpn-l2tp"]

# 2. Hubungkan L2TP Client ke VPS Masmedia
/interface l2tp-client
add name="${iface}" connect-to="${host}" user="${user}" \\
    password="${pass}" ipsec-secret="Server@123" use-ipsec=yes \\
    profile=default-encryption allow=mschap2,chap,pap add-default-route=no \\
    disabled=no comment="VPN L2TP Remote Masmedia - ${vpn.name}"

# 3. Buka Service Winbox, API & Web
/ip service enable winbox
/ip service set winbox port=8291
/ip service enable api
/ip service set api port=8728
/ip service enable www
/ip service set www port=80

# 4. Izinkan Akses Input dari Interface L2TP
/ip firewall filter
add chain=input in-interface="${iface}" action=accept place-before=0 comment="Allow Remote via L2TP Masmedia"

:put "========================================================="
:put ">>> SUKSES! L2TP ROS 6/7 ${vpn.name} AKTIF! <<<"
:put ">>> Remote Winbox: ${host}:${winboxPort} <<<"
:put "========================================================="
`;
  };

  // Get active script according to the active tab
  const getActiveScript = (vpn: VPNConfig): string => {
    switch (activeProtocolTab) {
      case 'wireguard':
        return generateWireGuardScript(vpn);
      case 'sstp':
        return generateSstpScript(vpn);
      case 'l2tp':
        return generateL2tpScript(vpn);
      default:
        return generateWireGuardScript(vpn);
    }
  };

  const getActiveProtocolLabel = (): string => {
    switch (activeProtocolTab) {
      case 'wireguard':
        return 'WireGuard (Ros 7)';
      case 'sstp':
        return 'SSTP (SSL 443)';
      case 'l2tp':
        return 'L2TP Ros 6/7';
      default:
        return 'WireGuard (Ros 7)';
    }
  };

  const generateWhatsAppMessage = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const webPort = vpn.remoteWebPort || 18080;

    return `*LAYANAN VPN REMOTE MIKROTIK - MASMEDIA DIGITAL*
--------------------------------------------------
Halo *${vpn.name}*,
Akun Remote Jarak Jauh Router MikroTik Anda telah aktif dan siap digunakan:

🖥️ *AKSES REMOTE WINBOX:*
• Host: \`${host}\`
• Port: \`${winboxPort}\`
👉 *Connect To di Winbox:* \`${host}:${winboxPort}\`

🌐 *AKSES REMOTE WEBFIG (Browser):*
👉 http://${host}:${webPort}

📋 *Detail Akun VPN:*
• IP Tunnel: ${vpn.remoteIp || '10.200.0.10'}
• Username: ${vpn.username}
• Password: ${vpn.password}

*CARA PAKAI DI WINBOX:*
1. Buka aplikasi Winbox di PC / Laptop / Android.
2. Di kolom *Connect To*, ketik: *${host}:${winboxPort}*
3. Masukkan Login & Password MikroTik Anda seperti biasa.
4. Klik Connect. Router kini bisa diremot dari mana saja tanpa IP Publik!`;
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Top Banner Notice - Matching screenshot notice text */}
      <div className="bg-[#121b2d] border border-slate-800/80 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 space-y-1.5 shadow-sm">
        <p className="leading-relaxed">
          Radius server will automatically respond to your request packet via Private IP from VPN. You can see the character constants in the info below
        </p>
        <p className="text-slate-400 leading-relaxed">
          If your MikroTik Router does not have a Public IP, please create a VPN account on the form that has been prepared. It's free without any additional costs and you can have more than one.
        </p>
      </div>

      {/* Main Content: Left Form + Right Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Create Account VPN */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-[#121b2d] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Create Account VPN</h2>
            </div>

            {formSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            {formErrorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Field 1: Account Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Account Name</label>
                <input
                  type="text"
                  placeholder="Account Name"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  required
                />
              </div>

              {/* Field 2: User */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">User</label>
                <input
                  type="text"
                  placeholder="User"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  required
                />
              </div>

              {/* Field 3: Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Password</label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showFormPassword ? 'Hide password' : 'Show password'}
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1e88e5] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Data Account VPN */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-[#121b2d] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4 flex flex-col justify-between min-h-[460px]">
            <div>
              {/* Header with Title and Search Input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <h2 className="text-base font-bold text-white tracking-tight">Data Account VPN</h2>

                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Table Data Account VPN */}
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold select-none">
                      <th className="py-3 px-3 w-10">#</th>
                      <th className="py-3 px-3">Name</th>
                      <th className="py-3 px-3">Username</th>
                      <th className="py-3 px-3">Password</th>
                      <th className="py-3 px-3">IP Address</th>
                      <th className="py-3 px-3 text-center">Script Mikrotik</th>
                      <th className="py-3 px-3 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          <p className="font-semibold text-slate-400">Belum ada data akun VPN.</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Isi nama akun, username dan password pada form di samping lalu klik Submit.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item, index) => {
                        const rowNumber = startIndex + index + 1;
                        const pwd = item.password || item.secretKey || 'server@123';
                        const ip = item.remoteIp || '10.200.0.10';
                        const isPwdVisible = !!visiblePasswords[item.id];

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                            {/* # */}
                            <td className="py-3.5 px-3 text-slate-400 font-mono">{rowNumber}</td>

                            {/* Name */}
                            <td className="py-3.5 px-3">
                              <span className="font-bold text-slate-200">{item.name}</span>
                            </td>

                            {/* Username */}
                            <td className="py-3.5 px-3 font-mono text-slate-300">{item.username || '-'}</td>

                            {/* Password */}
                            <td className="py-3.5 px-3 font-mono">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <span>{isPwdVisible ? pwd : '••••••••'}</span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(item.id)}
                                  className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                                  title={isPwdVisible ? 'Sembunyikan' : 'Lihat'}
                                >
                                  {isPwdVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>

                            {/* IP Address */}
                            <td className="py-3.5 px-3 font-mono text-slate-300">{ip}</td>

                            {/* Script Mikrotik Button (View with Info icon) */}
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVpnModal(item);
                                  setActiveProtocolTab('wireguard');
                                  setShowWaShare(false);
                                  setCopiedModalScript(false);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-sky-600 active:scale-95 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                                title="Lihat Skrip MikroTik"
                              >
                                <Info className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            </td>

                            {/* Action: Delete */}
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus akun VPN "${item.name}"?`)) {
                                    deleteVPN(item.id);
                                  }
                                }}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Hapus akun VPN"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={e => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#0a0f1d] border border-slate-700/80 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span>
                  {totalItems === 0
                    ? '0-0 of 0'
                    : `${startIndex + 1}-${Math.min(startIndex + rowsPerPage, totalItems)} of ${totalItems}`}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-[#0a0f1d] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-[#0a0f1d] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LIHAT SKRIP: 3 TAB PILIHAN PROTOKOL */}
      {selectedVpnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Script MikroTik VPN - {selectedVpnModal.name}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>User: <strong className="text-slate-200 font-mono">{selectedVpnModal.username}</strong></span>
                    <span>•</span>
                    <span>IP Address: <strong className="text-emerald-400 font-mono">{selectedVpnModal.remoteIp || '10.200.0.10'}</strong></span>
                    <span>•</span>
                    <span>Remote Winbox: <strong className="text-blue-400 font-mono">{selectedVpnModal.serverAddress || serverHost}:{selectedVpnModal.remoteWinboxPort || 18291}</strong></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVpnModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Tab Pilihan Protokol */}
            <div className="flex items-center gap-1.5 px-5 pt-3 border-b border-slate-800 bg-slate-900/50 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveProtocolTab('wireguard');
                  setShowWaShare(false);
                  setCopiedModalScript(false);
                }}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeProtocolTab === 'wireguard' && !showWaShare
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>tab 1. WireGuard (Ros 7)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveProtocolTab('sstp');
                  setShowWaShare(false);
                  setCopiedModalScript(false);
                }}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeProtocolTab === 'sstp' && !showWaShare
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>tab 2. SSTP (SSL 443)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveProtocolTab('l2tp');
                  setShowWaShare(false);
                  setCopiedModalScript(false);
                }}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  activeProtocolTab === 'l2tp' && !showWaShare
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-4 h-4 text-purple-400" />
                <span>tab 3. L2TP Ros 6/7</span>
              </button>

              {/* Optional: Format WA tab for convenience */}
              <button
                type="button"
                onClick={() => setShowWaShare(true)}
                className={`ml-auto px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  showWaShare
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-emerald-300'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Format WA</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {!showWaShare ? (
                <div className="space-y-3 animate-fadeIn">
                  {/* Protocol Guide Callout */}
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                    <div className="flex items-center gap-2 font-bold text-blue-100 mb-1">
                      <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Protokol {getActiveProtocolLabel()}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {activeProtocolTab === 'wireguard' && (
                        <>
                          WireGuard adalah protokol VPN modern berkecepatan tinggi dengan enkripsi mutakhir, khusus untuk MikroTik RouterOS v7. Salin skrip di bawah lalu tempelkan (paste) di <strong>Winbox &gt; New Terminal</strong>.
                        </>
                      )}
                      {activeProtocolTab === 'sstp' && (
                        <>
                          SSTP menggunakan port 443 SSL (TCP), sangat andal menembus blokir ISP / Starlink / GSM tanpa perlu konfigurasi rumit. Kompatibel dengan MikroTik RouterOS v6 dan v7.
                        </>
                      )}
                      {activeProtocolTab === 'l2tp' && (
                        <>
                          L2TP/IPsec adalah protokol standar industri yang kompatibel untuk semua versi MikroTik RouterOS (v6 &amp; v7). Salin dan tempelkan ke New Terminal Winbox.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Terminal Script Code Box */}
                  <div className="relative">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-x border-slate-800 rounded-t-xl text-[11px] text-slate-400 font-mono">
                      <span>{getActiveProtocolLabel()} - Siap Tempel di Terminal MikroTik</span>
                      <button
                        type="button"
                        onClick={() => handleCopyScript(getActiveScript(selectedVpnModal))}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {copiedModalScript ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 rounded-b-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72 leading-relaxed selection:bg-blue-500 selection:text-white">
                      {getActiveScript(selectedVpnModal)}
                    </pre>
                  </div>
                </div>
              ) : (
                /* Format Pesan WhatsApp */
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
                    <p className="font-bold text-emerald-100 mb-1">Format Pesan WhatsApp untuk Klien/Mitra:</p>
                    <p className="text-slate-300 text-[11px]">
                      Kirim teks ini ke WhatsApp klien/mitra agar mereka mengetahui alamat port Winbox dan cara meremote router mereka.
                    </p>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-sans text-xs text-slate-200 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500 selection:text-white">
                    {generateWhatsAppMessage(selectedVpnModal)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Connect To:</span>
                <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {selectedVpnModal.serverAddress || serverHost}:{selectedVpnModal.remoteWinboxPort || 18291}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyScript(
                      `${selectedVpnModal.serverAddress || serverHost}:${selectedVpnModal.remoteWinboxPort || 18291}`,
                      'winbox-conn'
                    )
                  }
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Salin alamat Winbox"
                >
                  {quickCopiedId === 'winbox-conn' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVpnModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (showWaShare) {
                      handleCopyScript(generateWhatsAppMessage(selectedVpnModal));
                    } else {
                      handleCopyScript(getActiveScript(selectedVpnModal));
                    }
                  }}
                  className="bg-[#1e88e5] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {copiedModalScript ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>
                        {showWaShare
                          ? 'Salin Pesan WA'
                          : `Salin Skrip ${getActiveProtocolLabel()}`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

