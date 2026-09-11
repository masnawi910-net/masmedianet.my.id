import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VPNConfig } from '../../types';
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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { generateVpnClientScript } from '../../utils/mikrotikScripts';

export const VPNSettingView: React.FC = () => {
  const { vpnConfigs, addVPN, deleteVPN, toggleVPN, setActiveTab, nasList } = useApp();

  // Form State
  const [accountName, setAccountName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [protocol, setProtocol] = useState<'l2tp' | 'sstp' | 'wireguard'>('l2tp');
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

  // Modal State for "Lihat Skrip MikroTik"
  const [selectedVpnModal, setSelectedVpnModal] = useState<VPNConfig | null>(null);
  const [copiedModalScript, setCopiedModalScript] = useState(false);
  const [quickCopiedId, setQuickCopiedId] = useState<string | null>(null);

  // Server default Host IP
  const defaultServerHost = '103.187.99.50';

  // Automatically update username suggestion when typing account name if username is untouched
  const handleAccountNameChange = (val: string) => {
    setAccountName(val);
    if (!username || username === accountName.toLowerCase()) {
      setUsername(val.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccessMessage(null);
    setFormErrorMessage(null);

    if (!accountName.trim()) {
      setFormErrorMessage('Nama Akun tidak boleh kosong.');
      return;
    }
    if (!username.trim()) {
      setFormErrorMessage('Nama Pengguna (Username) tidak boleh kosong.');
      return;
    }
    if (!password.trim()) {
      setFormErrorMessage('Kata Sandi tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Allocate an IP on the tunnel subnet
      const allocatedIp = `10.200.0.${10 + (vpnConfigs.length % 240)}`;

      addVPN({
        name: accountName.trim(),
        type: protocol,
        serverAddress: defaultServerHost,
        username: username.trim(),
        password: password.trim(),
        remoteIp: allocatedIp,
        localIp: '10.200.0.1',
        clientIp: `${allocatedIp}/24`,
        subnet: '10.200.0.0/24',
        port: protocol === 'sstp' ? 443 : protocol === 'wireguard' ? 51820 : 1701,
        secretKey: password.trim(),
        status: 'connected',
      });

      setIsSubmitting(false);
      setFormSuccessMessage(`Akun VPN "${accountName}" berhasil dibuat! Silahkan klik tombol [Lihat] untuk mengambil skrip MikroTik.`);

      // Reset form
      setAccountName('');
      setUsername('');
      setPassword('');

      setTimeout(() => {
        setFormSuccessMessage(null);
      }, 5000);
    }, 400);
  };

  // Filtered VPN configs based on search query
  const filteredVpnConfigs = useMemo(() => {
    return vpnConfigs.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.username && item.username.toLowerCase().includes(q)) ||
        item.serverAddress.toLowerCase().includes(q) ||
        (item.remoteIp && item.remoteIp.toLowerCase().includes(q)) ||
        item.type.toLowerCase().includes(q)
      );
    });
  }, [vpnConfigs, searchQuery]);

  // Paginated data
  const totalItems = filteredVpnConfigs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredVpnConfigs.slice(startIndex, startIndex + rowsPerPage);

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

  const generateFullMikrotikScript = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const user = vpn.username || 'masmedia';
    const pass = vpn.password || vpn.secretKey || 'password123';
    const ifaceName = `vpn-${user.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    if (vpn.type === 'sstp') {
      return `# ====================================================================
# SCRIPT KONEKSI VPN SSTP MIKROTIK (PORT 443 SSL - ANTI BLOKIR ISP)
# Nama Akun: ${vpn.name} | Host Server: ${host}
# ====================================================================

# 1. Hapus konfigurasi interface VPN SSTP lama jika ada
/interface sstp-client remove [find name~"${ifaceName}|vpn-masmedia|vpn-remote"]

# 2. Tambah interface SSTP Client ke VPS Master
/interface sstp-client
add name="${ifaceName}" connect-to="${host}" user="${user}" \\
    password="${pass}" profile=default-encryption verify-server-certificate=no \\
    add-default-route=no disabled=no comment="VPN SSTP Remote MasmediaGroup"

# 3. Aktifkan Service API & Winbox MikroTik
/ip service enable api
/ip service set api port=8728
/ip service enable winbox

# 4. Izinkan Firewall Input dari Interface VPN
/ip firewall filter
add chain=input in-interface="${ifaceName}" action=accept comment="Allow Remote Management via VPN SSTP"

:put ">>> VPN SSTP ${vpn.name} BERHASIL DIKONFIGURASI! Status: Connected <<<"
`;
    }

    if (vpn.type === 'wireguard') {
      const clientIp = vpn.remoteIp || '10.200.0.10';
      return `# ====================================================================
# SCRIPT KONEKSI WIREGUARD MIKROTIK (ROUTEROS v7)
# Nama Akun: ${vpn.name} | Server: ${host}
# ====================================================================

/interface wireguard remove [find name="wg-masmedia"]
/interface wireguard add name="wg-masmedia" listen-port=13231 comment="VPN WireGuard Masmedia"

/ip address add address=${clientIp}/24 interface="wg-masmedia" network=10.200.0.0

/interface wireguard peers
add interface="wg-masmedia" endpoint-address="${host}" endpoint-port=51820 \\
    allowed-address=0.0.0.0/0 persistent-keepalive=25s comment="Masmedia VPS WireGuard Peer"

/ip service enable api
/ip service set api port=8728
/ip firewall filter
add chain=input in-interface="wg-masmedia" action=accept comment="Allow Remote via WireGuard"

:put ">>> WIREGUARD VPN ${vpn.name} BERHASIL DIPASANG! <<<"
`;
    }

    // Default L2TP
    return `# ====================================================================
# SCRIPT KONEKSI VPN L2TP MIKROTIK (RINGAN & STABIL)
# Nama Akun: ${vpn.name} | Server Host: ${host}
# ====================================================================

# 1. Bersihkan interface L2TP lama jika ada
/interface l2tp-client remove [find name~"${ifaceName}|vpn-masmedia|vpn-remote|l2tp-tunnel"]

# 2. Tambahkan L2TP Client baru ke VPS Masmedia
/interface l2tp-client
add name="${ifaceName}" connect-to="${host}" user="${user}" \\
    password="${pass}" profile=default-encryption allow=mschap2,chap,pap \\
    add-default-route=no disabled=no comment="VPN Remote Billing App Masmedia"

# 3. Aktifkan Service API (Port 8728) & Winbox (Port 8291)
/ip service enable api
/ip service set api port=8728
/ip service enable winbox

# 4. Buka Firewall Masuk (Input) dari Interface VPN
/ip firewall filter
add chain=input in-interface="${ifaceName}" action=accept comment="Allow API & Winbox via VPN"

:put ">>> VPN L2TP ${vpn.name} BERHASIL DIHUBUNGKAN! <<<"
`;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Info Notice (Matching RadbooX Reference) */}
      <div className="bg-[#121b2d] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span>INFO</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm">
              VPN digunakan untuk menghubungkan Router MikroTik anda dengan Router kami melalui jaringan internet/public. Radius server kami tidak dapat meneruskan paket request dari router anda jika router anda tidak mempunyai IP Public atau tidak dalam satu jaringan. Setelah router MikroTik anda terhubung dengan router kami, otomatis radius server akan merespond paket request anda melalui IP Private dari VPN. Character constants bisa anda lihat pada info dibawah.
            </p>
            <p className="text-slate-300 text-xs sm:text-sm">
              Jika Router MikroTik anda tidak mempunyai IP Public, silahkan buat account vpn pada form yang sudah di siapkan. Gratis tanpa ada biaya tambahan dan boleh lebih dari satu.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Grid (Buat Akun VPN & Data Akun VPN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Card "Buat Akun VPN" */}
        <div className="lg:col-span-4 xl:col-span-4">
          <div className="bg-[#121b2d] border border-slate-800 rounded-2xl p-6 shadow-md space-y-5 h-full flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-800/80">
                <h2 className="text-base font-bold text-white">Buat Akun VPN</h2>
              </div>

              {formSuccessMessage && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              {formErrorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formErrorMessage}</span>
                </div>
              )}

              <form id="create-vpn-form" onSubmit={handleFormSubmit} className="mt-5 space-y-4">
                {/* Field 1: Nama Akun */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Nama Akun</label>
                  <input
                    type="text"
                    placeholder="Nama Akun"
                    value={accountName}
                    onChange={e => handleAccountNameChange(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Field 2: Pengguna */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Pengguna</label>
                  <input
                    type="text"
                    placeholder="MASMEDIA"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition-all font-mono"
                    required
                  />
                </div>

                {/* Field 3: Kata Sandi */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                      title={showFormPassword ? 'Sembunyikan' : 'Lihat'}
                    >
                      {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Protocol Quick Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs text-slate-400">Protokol</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setProtocol('l2tp')}
                      className={`py-2 px-1.5 rounded-lg text-center border text-[11px] font-bold transition-all cursor-pointer leading-tight ${
                        protocol === 'l2tp'
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                          : 'bg-[#0a0f1d] text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      L2TP Ros 6&7
                    </button>
                    <button
                      type="button"
                      onClick={() => setProtocol('sstp')}
                      className={`py-2 px-1.5 rounded-lg text-center border text-[11px] font-bold transition-all cursor-pointer leading-tight ${
                        protocol === 'sstp'
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                          : 'bg-[#0a0f1d] text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      SSTP Ros 6&7
                    </button>
                    <button
                      type="button"
                      onClick={() => setProtocol('wireguard')}
                      className={`py-2 px-1.5 rounded-lg text-center border text-[11px] font-bold transition-all cursor-pointer leading-tight ${
                        protocol === 'wireguard'
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                          : 'bg-[#0a0f1d] text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Wireguard Ros 7
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Bottom Submit Button (Blue Button "Kirim" at bottom right) */}
            <div className="pt-4 border-t border-slate-800/80 flex justify-end">
              <button
                type="submit"
                form="create-vpn-form"
                disabled={isSubmitting}
                className="bg-[#1e88e5] hover:bg-blue-600 active:scale-95 text-white font-bold text-sm px-6 py-2 rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

        {/* Right Column: Card "Data Akun VPN" */}
        <div className="lg:col-span-8 xl:col-span-8">
          <div className="bg-[#121b2d] border border-slate-800 rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between min-h-[480px]">
            <div>
              {/* Header with Title and Search Input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <h2 className="text-base font-bold text-white">Data Akun VPN</h2>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Table Data Akun VPN */}
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold select-none">
                      <th className="py-3 px-3 w-10">#</th>
                      <th className="py-3 px-3">Nama</th>
                      <th className="py-3 px-3">Nama Pengguna</th>
                      <th className="py-3 px-3">Kata Sandi</th>
                      <th className="py-3 px-3">Alamat IP</th>
                      <th className="py-3 px-3 text-center">Skrip Mikrotik</th>
                      <th className="py-3 px-3 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          <p className="font-semibold text-slate-400">Belum ada data akun VPN.</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Silahkan buat akun VPN baru pada form di samping.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item, index) => {
                        const rowNumber = startIndex + index + 1;
                        const pwd = item.password || item.secretKey || 'server@123';
                        const ip = item.remoteIp || item.serverAddress || defaultServerHost;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-800/30 transition-colors"
                          >
                            {/* # */}
                            <td className="py-3.5 px-3 text-slate-400">
                              {rowNumber}
                            </td>

                            {/* Nama */}
                            <td className="py-3.5 px-3 text-slate-200">
                              {item.name}
                            </td>

                            {/* Nama Pengguna */}
                            <td className="py-3.5 px-3 text-slate-300 font-mono">
                              {item.username || '-'}
                            </td>

                            {/* Kata Sandi */}
                            <td className="py-3.5 px-3 text-slate-300 font-mono">
                              {pwd}
                            </td>

                            {/* Alamat IP */}
                            <td className="py-3.5 px-3 font-mono text-slate-300">
                              {ip}
                            </td>

                            {/* Skrip Mikrotik (Blue Button [i] Lihat) */}
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => setSelectedVpnModal(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1e88e5] hover:bg-blue-600 text-white font-bold rounded-lg transition-all cursor-pointer text-xs shadow-xs"
                                title="Lihat skrip MikroTik"
                              >
                                <Info className="w-3.5 h-3.5 fill-white text-[#1e88e5]" />
                                <span>Lihat</span>
                              </button>
                            </td>

                            {/* Hapus (Red Trash Icon) */}
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus akun VPN "${item.name}"?`)) {
                                    deleteVPN(item.id);
                                  }
                                }}
                                className="p-1 rounded text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
                  className="bg-[#0a0f1d] border border-slate-700/70 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-blue-500"
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
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-[#0a0f1d] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-[#0a0f1d] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog: Skrip MikroTik Ready to Copy */}
      {selectedVpnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Skrip MikroTik - {selectedVpnModal.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Protokol: <span className="uppercase text-blue-400 font-bold">{selectedVpnModal.type}</span> | Server: <span className="font-mono text-emerald-400">{selectedVpnModal.serverAddress || defaultServerHost}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVpnModal(null)}
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
                  <p className="font-semibold text-blue-100">Cara Pemasangan di MikroTik:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 mt-1">
                    <li>Buka aplikasi <strong>Winbox</strong> dan login ke MikroTik Anda.</li>
                    <li>Buka menu <strong>New Terminal</strong>.</li>
                    <li>Klik tombol <strong>Salin Skrip</strong> di bawah, lalu <strong>Paste</strong> ke Terminal dan tekan <strong>Enter</strong>.</li>
                    <li>Status interface VPN akan berubah menjadi <strong className="text-emerald-400">R (Running/Connected)</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* Code Pre Block */}
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-x border-slate-800 rounded-t-xl text-[11px] text-slate-400 font-mono">
                  <span>MikroTik RouterOS Script</span>
                  <span className="text-emerald-400">Siap Tempel (1-Click)</span>
                </div>
                <pre className="p-4 rounded-b-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72 leading-relaxed selection:bg-blue-500 selection:text-white">
                  {generateFullMikrotikScript(selectedVpnModal)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                User: <span className="font-mono text-slate-200">{selectedVpnModal.username}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVpnModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleCopyScript(generateFullMikrotikScript(selectedVpnModal))}
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
    </div>
  );
};
