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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Smartphone,
  Sparkles,
  RefreshCw,
  Sliders,
  Send,
  Cpu,
  Layers,
  CheckCheck,
} from 'lucide-react';

export const VPNSettingView: React.FC = () => {
  const { vpnConfigs, addVPN, deleteVPN, toggleVPN } = useApp();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'clients' | 'vps_automation' | 'port_matrix'>('clients');

  // VPS Server Public Host IP (Default user VPS IP)
  const defaultServerHost = '103.49.239.150';
  const [serverHost, setServerHost] = useState(defaultServerHost);

  // Form State
  const [accountName, setAccountName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [protocol, setProtocol] = useState<'wireguard' | 'sstp' | 'l2tp'>('wireguard');
  const [clientPhone, setClientPhone] = useState('');
  const [customIp, setCustomIp] = useState('');
  const [customWinboxPort, setCustomWinboxPort] = useState('');
  const [customWebPort, setCustomWebPort] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  // Modal State
  const [selectedVpnModal, setSelectedVpnModal] = useState<VPNConfig | null>(null);
  const [modalTab, setModalTab] = useState<'mikrotik' | 'whatsapp' | 'vps_command'>('mikrotik');
  const [copiedModalScript, setCopiedModalScript] = useState(false);
  const [quickCopiedId, setQuickCopiedId] = useState<string | null>(null);

  // Calculate Next Dynamic Allocation (IP and Ports)
  const nextAllocation = useMemo(() => {
    // 1. Next IP in 10.200.0.X (starts from 10.200.0.10)
    const usedLastOctets: number[] = [];
    const usedWinboxPorts: number[] = [];
    const usedWebPorts: number[] = [];

    vpnConfigs.forEach(item => {
      if (item.remoteIp) {
        const parts = item.remoteIp.split('.');
        const lastOct = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastOct)) usedLastOctets.push(lastOct);
      }
      if (item.remoteWinboxPort) usedWinboxPorts.push(item.remoteWinboxPort);
      if (item.remoteWebPort) usedWebPorts.push(item.remoteWebPort);
    });

    let nextOctet = 10;
    while (usedLastOctets.includes(nextOctet)) {
      nextOctet++;
    }

    let nextWinboxPort = 18291;
    while (usedWinboxPorts.includes(nextWinboxPort)) {
      nextWinboxPort++;
    }

    let nextWebPort = 18080;
    while (usedWebPorts.includes(nextWebPort)) {
      nextWebPort++;
    }

    const clientNumber = vpnConfigs.length + 1;
    const randomSuffix = Math.random().toString(36).substring(2, 6);

    return {
      ip: `10.200.0.${nextOctet}`,
      winboxPort: nextWinboxPort,
      webPort: nextWebPort,
      suggestedName: `Klien-Mikrotik-${String(clientNumber).padStart(2, '0')}`,
      suggestedUser: `klien${clientNumber}_${randomSuffix}`,
      suggestedPass: `vpn${Math.floor(1000 + Math.random() * 9000)}@Net`,
    };
  }, [vpnConfigs]);

  // Handler for Dynamic 1-Click Auto Fill
  const handleAutoGenerate = () => {
    setAccountName(nextAllocation.suggestedName);
    setUsername(nextAllocation.suggestedUser);
    setPassword(nextAllocation.suggestedPass);
    setCustomIp(nextAllocation.ip);
    setCustomWinboxPort(String(nextAllocation.winboxPort));
    setCustomWebPort(String(nextAllocation.webPort));
    setFormSuccessMessage('⚡ Data akun & alokasi port dinamis berhasil di-generate secara otomatis!');
    setTimeout(() => setFormSuccessMessage(null), 3500);
  };

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccessMessage(null);
    setFormErrorMessage(null);

    if (!accountName.trim()) {
      setFormErrorMessage('Nama Akun Klien tidak boleh kosong.');
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
      const allocatedIp = customIp.trim() || nextAllocation.ip;
      const allocatedWinboxPort = parseInt(customWinboxPort, 10) || nextAllocation.winboxPort;
      const allocatedWebPort = parseInt(customWebPort, 10) || nextAllocation.webPort;

      addVPN({
        name: accountName.trim(),
        type: protocol,
        serverAddress: serverHost.trim() || defaultServerHost,
        username: username.trim().toLowerCase(),
        password: password.trim(),
        remoteIp: allocatedIp,
        localIp: '10.200.0.1',
        clientIp: `${allocatedIp}/24`,
        subnet: '10.200.0.0/24',
        port: protocol === 'sstp' ? 443 : protocol === 'wireguard' ? 51820 : 1701,
        remoteWinboxPort: allocatedWinboxPort,
        remoteWebPort: allocatedWebPort,
        clientPhone: clientPhone.trim(),
        secretKey: password.trim(),
        status: 'connected',
        createdAt: new Date().toISOString().slice(0, 10),
      });

      setIsSubmitting(false);
      setFormSuccessMessage(
        `Akun VPN "${accountName}" berhasil dibuat! Port Remote Winbox: ${allocatedWinboxPort}. Silahkan klik tombol [Lihat Skrip] untuk mengirim ke klien.`
      );

      // Reset form fields
      setAccountName('');
      setUsername('');
      setPassword('');
      setClientPhone('');
      setCustomIp('');
      setCustomWinboxPort('');
      setCustomWebPort('');

      setTimeout(() => {
        setFormSuccessMessage(null);
      }, 6000);
    }, 350);
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
        (item.remoteWinboxPort && String(item.remoteWinboxPort).includes(q)) ||
        (item.clientPhone && item.clientPhone.includes(q)) ||
        item.type.toLowerCase().includes(q)
      );
    });
  }, [vpnConfigs, searchQuery]);

  // Paginated data
  const totalItems = filteredVpnConfigs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredVpnConfigs.slice(startIndex, startIndex + rowsPerPage);

  // Script Generators
  const generateFullMikrotikScript = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const user = vpn.username || 'masmedia_client';
    const pass = vpn.password || vpn.secretKey || 'vpnpass123';
    const clientIp = vpn.remoteIp || '10.200.0.10';
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const webPort = vpn.remoteWebPort || 18080;
    const ifaceName = `vpn-${user.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    if (vpn.type === 'wireguard') {
      return `# ====================================================================
# SCRIPT KONEKSI WIREGUARD MIKROTIK (ROUTEROS v7)
# Klien: ${vpn.name} | Host Server: ${host}
# Akses Remote Winbox: ${host}:${winboxPort}
# ====================================================================

# 1. Bersihkan interface WireGuard lama jika ada
/interface wireguard remove [find name="wg-masmedia"]

# 2. Tambah interface WireGuard Client
/interface wireguard
add name="wg-masmedia" listen-port=13231 mtu=1420 comment="VPN Remote Masmedia Hub"

# 3. Tetapkan IP Tunnel ke Router Klien
/ip address
add address=${clientIp}/24 interface="wg-masmedia" network=10.200.0.0 comment="IP Tunnel VPN Masmedia"

# 4. Tambahkan WireGuard Peer ke VPS Server Masmedia
/interface wireguard peers
add interface="wg-masmedia" endpoint-address="${host}" endpoint-port=51820 \\
    allowed-address=10.200.0.0/24 persistent-keepalive=25s comment="Masmedia VPS WireGuard Hub"

# 5. Pastikan Service Winbox & API Aktif
/ip service enable winbox
/ip service set winbox port=8291
/ip service enable api
/ip service set api port=8728
/ip service enable www
/ip service set www port=80

# 6. Izinkan Firewall Masuk dari Interface VPN
/ip firewall filter
add chain=input in-interface="wg-masmedia" action=accept place-before=0 comment="Allow Remote via WireGuard Masmedia"

:put "========================================================="
:put ">>> SUKSES! VPN WIREGUARD ${vpn.name} BERHASIL DIPASANG <<<"
:put ">>> Remote Winbox: ${host}:${winboxPort} <<<"
:put "========================================================="
`;
    }

    if (vpn.type === 'sstp') {
      return `# ====================================================================
# SCRIPT KONEKSI VPN SSTP MIKROTIK (ROUTEROS v6 & v7)
# Klien: ${vpn.name} | Server: ${host} | Port 443 SSL
# Akses Remote Winbox: ${host}:${winboxPort}
# ====================================================================

# 1. Hapus koneksi lama jika ada
/interface sstp-client remove [find name~"${ifaceName}|vpn-masmedia|vpn-remote"]

# 2. Hubungkan SSTP Client ke VPS
/interface sstp-client
add name="${ifaceName}" connect-to="${host}" user="${user}" \\
    password="${pass}" profile=default-encryption verify-server-certificate=no \\
    add-default-route=no disabled=no comment="VPN SSTP Remote Masmedia"

# 3. Aktifkan Service Winbox & API
/ip service enable winbox
/ip service set winbox port=8291
/ip service enable www
/ip service set www port=80

# 4. Izinkan Firewall
/ip firewall filter
add chain=input in-interface="${ifaceName}" action=accept place-before=0 comment="Allow Remote via SSTP Masmedia"

:put ">>> VPN SSTP ${vpn.name} BERHASIL DIHUBUNGKAN! <<<"
:put ">>> Remote Winbox: ${host}:${winboxPort} <<<"
`;
    }

    // Default L2TP
    return `# ====================================================================
# SCRIPT KONEKSI VPN L2TP MIKROTIK (ROUTEROS v6 & v7)
# Klien: ${vpn.name} | Server: ${host}
# Akses Remote Winbox: ${host}:${winboxPort}
# ====================================================================

# 1. Hapus koneksi lama jika ada
/interface l2tp-client remove [find name~"${ifaceName}|vpn-masmedia|vpn-remote"]

# 2. Hubungkan L2TP Client
/interface l2tp-client
add name="${ifaceName}" connect-to="${host}" user="${user}" \\
    password="${pass}" profile=default-encryption allow=mschap2,chap,pap \\
    add-default-route=no disabled=no comment="VPN L2TP Remote Masmedia"

# 3. Buka Service Winbox & Web
/ip service enable winbox
/ip service set winbox port=8291
/ip service enable www
/ip service set www port=80

# 4. Izinkan Akses Input dari VPN
/ip firewall filter
add chain=input in-interface="${ifaceName}" action=accept place-before=0 comment="Allow Remote via L2TP Masmedia"

:put ">>> VPN L2TP ${vpn.name} AKTIF! Remote: ${host}:${winboxPort} <<<"
`;
  };

  const generateWhatsAppMessage = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const webPort = vpn.remoteWebPort || 18080;

    return `*LAYANAN VPN REMOTE MIKROTIK - MASMEDIA DIGITAL*
--------------------------------------------------
Halo *${vpn.name}*,
Akun Remote Jarak Jauh Router MikroTik Anda telah aktif dan siap digunakan dari mana saja:

🖥️ *AKSES REMOTE WINBOX:*
• Host: \`${host}\`
• Port: \`${winboxPort}\`
👉 *Connect To di Winbox:* \`${host}:${winboxPort}\`

🌐 *AKSES REMOTE WEBFIG (Browser):*
👉 http://${host}:${webPort}

📋 *Detail Akun VPN:*
• Protokol: ${vpn.type.toUpperCase()}
• IP Tunnel: ${vpn.remoteIp || '10.200.0.10'}
• Username: ${vpn.username}
• Password: ${vpn.password}

*CARA PAKAI DI WINBOX:*
1. Buka aplikasi Winbox di PC / Laptop / Android.
2. Di kolom *Connect To*, ketik: *${host}:${winboxPort}*
3. Masukkan Login & Password MikroTik Anda seperti biasa.
4. Klik Connect. Anda kini bisa meremote router dari mana saja tanpa IP Publik!

Jika butuh bantuan teknis, hubungi tim support MasMedia. Terima kasih!`;
  };

  const generateVPSCommands = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const clientIp = vpn.remoteIp || '10.200.0.10';
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const webPort = vpn.remoteWebPort || 18080;

    return `# ==========================================================
# PERINTAH IPTABLES VPS UNTUK KLIEN: ${vpn.name}
# ==========================================================

# 1. Forward Port Winbox Eksternal (${winboxPort}) -> IP Klien (${clientIp}:8291)
sudo iptables -t nat -A PREROUTING -p tcp -d ${host} --dport ${winboxPort} -j DNAT --to-destination ${clientIp}:8291
sudo iptables -A FORWARD -p tcp -d ${clientIp} --dport 8291 -j ACCEPT

# 2. Forward Port WebFig Browser (${webPort}) -> IP Klien (${clientIp}:80)
sudo iptables -t nat -A PREROUTING -p tcp -d ${host} --dport ${webPort} -j DNAT --to-destination ${clientIp}:80
sudo iptables -A FORWARD -p tcp -d ${clientIp} --dport 80 -j ACCEPT

# 3. Simpan rule iptables agar permanen saat VPS reboot
sudo netfilter-persistent save
`;
  };

  // Batch VPS Rule for all clients
  const generateAllClientsVPSBatchScript = (): string => {
    let script = `#!/bin/bash
# ====================================================================
# MASMEDIA VPN REMOTE - BATCH IPTABLES CONFIGURATION SCRIPT
# Server VPS: ${serverHost}
# Generated: ${new Date().toLocaleString('id-ID')}
# ====================================================================

echo ">>> Mengaktifkan IP Forwarding Kernel Linux..."
sysctl -w net.ipv4.ip_forward=1
sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf

echo ">>> Menerapkan Rule Port Forwarding untuk ${vpnConfigs.length} Klien VPN..."

`;

    vpnConfigs.forEach((c, idx) => {
      const clientIp = c.remoteIp || `10.200.0.${10 + idx}`;
      const winboxPort = c.remoteWinboxPort || 18291 + idx;
      const webPort = c.remoteWebPort || 18080 + idx;

      script += `# Klien #${idx + 1}: ${c.name} (${c.type.toUpperCase()})
iptables -t nat -A PREROUTING -p tcp -d ${serverHost} --dport ${winboxPort} -j DNAT --to-destination ${clientIp}:8291
iptables -A FORWARD -p tcp -d ${clientIp} --dport 8291 -j ACCEPT
iptables -t nat -A PREROUTING -p tcp -d ${serverHost} --dport ${webPort} -j DNAT --to-destination ${clientIp}:80
iptables -A FORWARD -p tcp -d ${clientIp} --dport 80 -j ACCEPT

`;
    });

    script += `echo ">>> Menyimpan rule iptables permanen..."
if command -v netfilter-persistent > /dev/null; then
  netfilter-persistent save
else
  iptables-save > /etc/iptables/rules.v4
fi

echo ">>> SELESAI! Seluruh ${vpnConfigs.length} Klien VPN Kini Aktif & Ter-forward!"
`;

    return script;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Dynamic Remote VPN Hub */}
      <div className="bg-gradient-to-r from-[#0d1627] via-[#121c33] to-[#0d1627] border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Multi-Tenant Dynamic VPN Remote Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Manajemen VPN Remote Klien</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Buat akun VPN untuk router MikroTik klien secara <strong>otomatis & dinamis</strong> tanpa harus masuk terminal VPS setiap ada klien baru. Sistem otomatis mengalokasikan IP Tunnel, Port Winbox, dan Port WebFig terisolasi.
            </p>
          </div>

          {/* Quick Server Info Card */}
          <div className="bg-[#0a0f1d]/80 border border-slate-700/80 rounded-2xl p-4 shrink-0 flex flex-col sm:flex-row items-center gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono font-bold">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[11px] font-medium">IP Publik VPS Gateway</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">{serverHost}</span>
                  <button
                    onClick={() => handleCopyScript(serverHost, 'server-ip')}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Salin IP VPS"
                  >
                    {quickCopiedId === 'server-ip' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2 text-[11px]">
              <div className="text-right">
                <p className="text-slate-400">Total Klien</p>
                <p className="text-sm font-bold text-blue-400 font-mono">{vpnConfigs.length} Router</p>
              </div>
              <div className="text-right pl-3 border-l border-slate-800">
                <p className="text-slate-400">Port Terpakai</p>
                <p className="text-sm font-bold text-emerald-400 font-mono">18291 - {18290 + Math.max(1, vpnConfigs.length)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Daftar Klien VPN Remote ({vpnConfigs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vps_automation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'vps_automation'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>⚡ Zero-Touch Otomatisasi VPS (Tanpa Sentuh Terminal)</span>
          </button>

          <button
            onClick={() => setActiveTab('port_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'port_matrix'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Peta Port Forwarding & NAT</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CLIENTS & FORM GENERATOR */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Buat Akun Klien Dinamis */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-[#121b2d] border border-slate-800 rounded-3xl p-6 shadow-md space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Buat Akun Klien Dinamis</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">Otomatis alokasi IP & Port Remote</p>
                  </div>

                  {/* 1-Click Dynamic Autofill Button */}
                  <button
                    type="button"
                    onClick={handleAutoGenerate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-all cursor-pointer active:scale-95"
                    title="Generate otomatis IP dan Port berikutnya"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-Fill</span>
                  </button>
                </div>

                {formSuccessMessage && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{formSuccessMessage}</span>
                  </div>
                )}

                {formErrorMessage && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{formErrorMessage}</span>
                  </div>
                )}

                <form id="create-vpn-form" onSubmit={handleFormSubmit} className="mt-5 space-y-4">
                  {/* Field 1: Nama Akun / Klien */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Nama Klien / Router Mitra</span>
                      <span className="text-[10px] text-slate-400">Contoh: Budi Hotspot</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama klien atau nama router"
                      value={accountName}
                      onChange={e => setAccountName(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  {/* Field 2: No WhatsApp Klien (Optional for quick send) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Nomor WhatsApp Klien</span>
                      <span className="text-[10px] text-emerald-400 font-normal">Kirim akses via WA</span>
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Contoh: 08123456789"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Field 3: Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Username VPN Klien</label>
                    <input
                      type="text"
                      placeholder="Contoh: klien_budi"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                      required
                    />
                  </div>

                  {/* Field 4: Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password VPN Klien</label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl px-4 py-2.5 pr-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        title={showFormPassword ? 'Sembunyikan' : 'Lihat'}
                      >
                        {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Field 5: Protocol Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-slate-300">Pilih Protokol</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setProtocol('wireguard')}
                        className={`py-2 px-1.5 rounded-xl text-center border text-[11px] font-bold transition-all cursor-pointer leading-tight ${
                          protocol === 'wireguard'
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-sm'
                            : 'bg-[#0a0f1d] text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        WireGuard (Ros 7)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProtocol('sstp')}
                        className={`py-2 px-1.5 rounded-xl text-center border text-[11px] font-bold transition-all cursor-pointer leading-tight ${
                          protocol === 'sstp'
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-sm'
                            : 'bg-[#0a0f1d] text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        SSTP (SSL 443)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProtocol('l2tp')}
                        className={`py-2 px-1.5 rounded-xl text-center border text-[11px] font-bold transition-all cursor-pointer leading-tight ${
                          protocol === 'l2tp'
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-sm'
                            : 'bg-[#0a0f1d] text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        L2TP Ros 6/7
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Port Allocation Preview Box */}
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Alokasi Dinamis Otomatis:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-slate-400 hover:text-white underline text-[10px] cursor-pointer"
                      >
                        {showAdvanced ? 'Tutup Manual' : 'Ubah Manual'}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-xl bg-[#0a0f1d] border border-slate-800">
                        <p className="text-slate-400 text-[9px]">IP Tunnel</p>
                        <p className="font-mono font-bold text-emerald-400">{customIp || nextAllocation.ip}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#0a0f1d] border border-slate-800">
                        <p className="text-slate-400 text-[9px]">Port Winbox</p>
                        <p className="font-mono font-bold text-blue-400">{customWinboxPort || nextAllocation.winboxPort}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#0a0f1d] border border-slate-800">
                        <p className="text-slate-400 text-[9px]">Port WebFig</p>
                        <p className="font-mono font-bold text-purple-400">{customWebPort || nextAllocation.webPort}</p>
                      </div>
                    </div>

                    {showAdvanced && (
                      <div className="pt-2 border-t border-blue-500/20 space-y-2 text-[11px] animate-fadeIn">
                        <div>
                          <label className="text-slate-400">Custom IP Tunnel:</label>
                          <input
                            type="text"
                            placeholder={nextAllocation.ip}
                            value={customIp}
                            onChange={e => setCustomIp(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono mt-0.5"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-400">Custom Winbox Port:</label>
                            <input
                              type="number"
                              placeholder={String(nextAllocation.winboxPort)}
                              value={customWinboxPort}
                              onChange={e => setCustomWinboxPort(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400">Custom Web Port:</label>
                            <input
                              type="number"
                              placeholder={String(nextAllocation.webPort)}
                              value={customWebPort}
                              onChange={e => setCustomWebPort(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono mt-0.5"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Bottom Submit Button */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Target: <strong className="text-white font-mono">{customWinboxPort || nextAllocation.winboxPort}</strong>
                </span>
                <button
                  type="submit"
                  form="create-vpn-form"
                  disabled={isSubmitting}
                  className="bg-[#1e88e5] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Buat Akun Klien</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Table Data Akun Klien VPN */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-[#121b2d] border border-slate-800 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between min-h-[540px]">
              <div>
                {/* Header with Title, Search, and Batch Copy */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Daftar Klien VPN Remote</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                        {vpnConfigs.length}
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Klik tombol <strong>[Lihat Skrip]</strong> atau <strong>[Kirim WA]</strong> untuk memberikan akses ke klien.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-56">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari nama, port, IP..."
                        value={searchQuery}
                        onChange={e => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-[#0a0f1d] border border-slate-700/70 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Table Data Akun VPN */}
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold select-none">
                        <th className="py-3 px-3 w-8">#</th>
                        <th className="py-3 px-3">Klien / Router</th>
                        <th className="py-3 px-3">Username & Sandi</th>
                        <th className="py-3 px-3">IP Tunnel</th>
                        <th className="py-3 px-3">Remote Winbox</th>
                        <th className="py-3 px-3">Protokol</th>
                        <th className="py-3 px-3 text-center">Aksi Klien</th>
                        <th className="py-3 px-3 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500">
                            <p className="font-semibold text-slate-400">Belum ada data klien VPN.</p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Gunakan form di samping untuk membuat akun klien VPN pertama.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((item, index) => {
                          const rowNumber = startIndex + index + 1;
                          const pwd = item.password || item.secretKey || 'password123';
                          const ip = item.remoteIp || '10.200.0.10';
                          const winboxPort = item.remoteWinboxPort || (18291 + index);
                          const webPort = item.remoteWebPort || (18080 + index);
                          const isPwdVisible = !!visiblePasswords[item.id];
                          const winboxFullAddress = `${item.serverAddress || serverHost}:${winboxPort}`;

                          return (
                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                              {/* # */}
                              <td className="py-3.5 px-3 text-slate-500 font-mono">{rowNumber}</td>

                              {/* Nama Klien */}
                              <td className="py-3.5 px-3">
                                <div className="font-bold text-slate-200">{item.name}</div>
                                {item.clientPhone ? (
                                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                                    <Smartphone className="w-3 h-3" />
                                    <span>{item.clientPhone}</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-500">ID: {item.id}</div>
                                )}
                              </td>

                              {/* Username & Password */}
                              <td className="py-3.5 px-3 font-mono">
                                <div className="text-slate-300 font-bold">{item.username || '-'}</div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                                  <span>{isPwdVisible ? pwd : '••••••••'}</span>
                                  <button
                                    onClick={() => togglePasswordVisibility(item.id)}
                                    className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                                  >
                                    {isPwdVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </button>
                                </div>
                              </td>

                              {/* IP Tunnel */}
                              <td className="py-3.5 px-3 font-mono">
                                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]">
                                  {ip}
                                </span>
                              </td>

                              {/* Remote Winbox Address */}
                              <td className="py-3.5 px-3 font-mono">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                                  <span>{winboxFullAddress}</span>
                                  <button
                                    onClick={() => handleCopyScript(winboxFullAddress, `winbox-${item.id}`)}
                                    className="p-1 hover:text-white transition-colors cursor-pointer"
                                    title="Salin alamat Winbox"
                                  >
                                    {quickCopiedId === `winbox-${item.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </button>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  WebFig: Port <span className="text-purple-300 font-bold">{webPort}</span>
                                </div>
                              </td>

                              {/* Protokol */}
                              <td className="py-3.5 px-3">
                                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase">
                                  {item.type}
                                </span>
                              </td>

                              {/* Skrip MikroTik & WA Actions */}
                              <td className="py-3.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedVpnModal(item);
                                      setModalTab('mikrotik');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1e88e5] hover:bg-blue-600 text-white font-bold rounded-lg transition-all cursor-pointer text-xs shadow-xs"
                                    title="Lihat skrip MikroTik"
                                  >
                                    <Terminal className="w-3 h-3" />
                                    <span>Skrip</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedVpnModal(item);
                                      setModalTab('whatsapp');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer text-xs shadow-xs"
                                    title="Kirim pesan WhatsApp ke Klien"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>WA</span>
                                  </button>
                                </div>
                              </td>

                              {/* Hapus */}
                              <td className="py-3.5 px-3 text-center">
                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus akun VPN remote "${item.name}"?`)) {
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
                  <span>Baris per halaman:</span>
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
      )}

      {/* TAB 2: ZERO-TOUCH VPS AUTOMATION (PENJELASAN & SKRIP VPS DINAMIS) */}
      {activeTab === 'vps_automation' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Architecture Card */}
          <div className="bg-[#121b2d] border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Bagaimana VPS Bekerja Otomatis Tanpa Login Manual Setiap Ada Klien Baru?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Agar Anda tidak perlu membuka terminal VPS setiap kali ada klien baru yang ingin MikroTik-nya diremote, Anda cukup memasang <strong>Daemon Otomatisasi (Zero-Touch Provisioning)</strong> 1 kali saja di VPS.
                </p>
              </div>
            </div>

            {/* 3 Auto Solutions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A */}
              <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <h4 className="text-sm font-bold text-white">Opsi A: Daemon Auto-NAT (WireGuard)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pasang skrip cron / systemd service di VPS yang memonitor peer WireGuard. Setiap ada IP baru yang aktif di subnet <code className="text-emerald-400">10.200.0.X</code>, daemon langsung membuka port Winbox <code className="text-blue-400">1829X</code> otomatis!
                </p>
              </div>

              {/* Option B */}
              <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  B
                </div>
                <h4 className="text-sm font-bold text-white">Opsi B: Accel-PPP Hook (L2TP/SSTP)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Menggunakan script <code className="text-purple-400">/etc/ppp/ip-up</code> di VPS. Saat router klien dial-in, script langsung mengeksekusi iptables DNAT secara dinamis dan menghapusnya saat router klien disconnect.
                </p>
              </div>

              {/* Option C */}
              <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <h4 className="text-sm font-bold text-white">Opsi C: 1-Click Batch Update Sync</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jika Anda lebih suka kontrol penuh tanpa daemon, tombol <strong>[Salin Skrip Batch VPS]</strong> di bawah langsung merangkum seluruh rule iptables untuk semua klien dalam 1 baris perintah terminal.
                </p>
              </div>
            </div>

            {/* Skrip 1-Click Install Daemon Otomatis di VPS */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Skrip Pasang 1-Kali Daemon Auto-Port Forward di VPS:</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Jalankan skrip ini <strong>sekali saja</strong> di VPS Anda melalui SSH. Setelah itu, port 18291-18350 akan otomatis ter-forward ke IP klien yang sesuai!
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleCopyScript(
                      `# 1. Buka Port Range 18291-18350 di IPTABLES VPS Sekaligus (Range Otomatis)
sudo iptables -t nat -A PREROUTING -p tcp -m multiport --dports 18291:18350 -j DNAT --to-destination 10.200.0.10-10.200.0.69:8291
sudo iptables -A FORWARD -p tcp --dport 8291 -j ACCEPT

# 2. Simpan agar permanen
sudo netfilter-persistent save

echo ">>> SUKSES! Seluruh Port Remote Winbox 18291 s/d 18350 kini otomatis aktif!"
`,
                      'daemon-script'
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow"
                >
                  {quickCopiedId === 'daemon-script' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Skrip Pasang 1-Kali</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`# 1. Buka Port Range 18291-18350 di IPTABLES VPS Sekaligus (Range Otomatis)
sudo iptables -t nat -A PREROUTING -p tcp -m multiport --dports 18291:18350 -j DNAT --to-destination 10.200.0.10-10.200.0.69:8291
sudo iptables -A FORWARD -p tcp --dport 8291 -j ACCEPT

# 2. Simpan agar permanen saat VPS restart
sudo netfilter-persistent save

echo ">>> SUKSES! Seluruh Port Remote Winbox 18291 s/d 18350 kini otomatis aktif!"`}
              </pre>
            </div>

            {/* Skrip Batch Sinkronisasi Seluruh Klien */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>Skrip Batch Sync Seluruh Klien Aktif Saat Ini ({vpnConfigs.length} Klien):</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ekspor seluruh konfigurasi iptables untuk semua router klien yang ada di tabel.
                  </p>
                </div>

                <button
                  onClick={() => handleCopyScript(generateAllClientsVPSBatchScript(), 'batch-script')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow"
                >
                  {quickCopiedId === 'batch-script' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Semua Rule ({vpnConfigs.length} Klien)</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto max-h-60 leading-relaxed">
                {generateAllClientsVPSBatchScript()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PORT MATRIX TABLE */}
      {activeTab === 'port_matrix' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#121b2d] border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-white">Matriks Port Forwarding & Pemetaan NAT</h3>
                <p className="text-xs text-slate-400">
                  Daftar port publik eksternal VPS yang diteruskan ke port lokal MikroTik masing-masing klien.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold select-none">
                    <th className="py-3 px-3">Port Publik VPS</th>
                    <th className="py-3 px-3">Nama Klien / Router</th>
                    <th className="py-3 px-3">IP Tunnel Target</th>
                    <th className="py-3 px-3">Port Internal Target</th>
                    <th className="py-3 px-3">Layanan</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {vpnConfigs.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {/* Winbox row */}
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">
                          {c.remoteWinboxPort || 18291 + i}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-200 font-bold">{c.name}</td>
                        <td className="py-2.5 px-3 text-blue-300">{c.remoteIp || `10.200.0.${10 + i}`}</td>
                        <td className="py-2.5 px-3 text-slate-300">8291 (TCP)</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            Winbox GUI
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Aktif
                          </span>
                        </td>
                      </tr>

                      {/* Webfig row */}
                      <tr className="hover:bg-slate-800/30 bg-slate-900/20">
                        <td className="py-2.5 px-3 text-purple-400 font-bold">
                          {c.remoteWebPort || 18080 + i}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-400 text-xs">{c.name}</td>
                        <td className="py-2.5 px-3 text-blue-300">{c.remoteIp || `10.200.0.${10 + i}`}</td>
                        <td className="py-2.5 px-3 text-slate-300">80 (TCP HTTP)</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                            WebFig Browser
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Aktif
                          </span>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: SKRIP MIKROTIK, PESAN WA, & VPS COMMANDS */}
      {selectedVpnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedVpnModal.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] uppercase font-mono">
                      {selectedVpnModal.type}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Remote Winbox:{' '}
                    <span className="font-mono text-emerald-400 font-bold">
                      {selectedVpnModal.serverAddress || serverHost}:
                      {selectedVpnModal.remoteWinboxPort || 18291}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVpnModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setModalTab('mikrotik')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'mikrotik'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Skrip MikroTik (RouterOS)</span>
              </button>

              <button
                onClick={() => setModalTab('whatsapp')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'whatsapp'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Pesan WhatsApp Klien</span>
              </button>

              <button
                onClick={() => setModalTab('vps_command')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'vps_command'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Perintah VPS (iptables)</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Tab 1: MikroTik Script */}
              {modalTab === 'mikrotik' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-100">Panduan Tempel di MikroTik Klien:</p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 mt-1">
                        <li>Buka aplikasi <strong>Winbox</strong> dan login ke MikroTik klien.</li>
                        <li>Buka menu <strong>New Terminal</strong>.</li>
                        <li>Salin skrip di bawah ini, lalu <strong>Paste</strong> ke Terminal dan tekan <strong>Enter</strong>.</li>
                        <li>Interface VPN akan langsung <strong>Connected / Running</strong>.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-x border-slate-800 rounded-t-2xl text-[11px] text-slate-400 font-mono">
                      <span>RouterOS Script (1-Click Paste)</span>
                      <span className="text-emerald-400">Siap Pakai</span>
                    </div>
                    <pre className="p-4 rounded-b-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-64 leading-relaxed selection:bg-blue-500 selection:text-white">
                      {generateFullMikrotikScript(selectedVpnModal)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 2: WhatsApp Format */}
              {modalTab === 'whatsapp' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-100">Format Pesan WhatsApp untuk Klien:</p>
                      <p className="text-slate-300 mt-0.5">
                        Kirim teks ini ke WhatsApp klien/mitra agar mereka mengetahui alamat port Winbox dan cara meremote router mereka.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-sans text-xs text-slate-200 overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500 selection:text-white">
                      {generateWhatsAppMessage(selectedVpnModal)}
                    </pre>
                  </div>

                  {selectedVpnModal.clientPhone && (
                    <div className="flex justify-end">
                      <a
                        href={`https://wa.me/${selectedVpnModal.clientPhone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(generateWhatsAppMessage(selectedVpnModal))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Langsung ke WhatsApp ({selectedVpnModal.clientPhone})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: VPS Commands */}
              {modalTab === 'vps_command' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed flex items-start gap-2.5">
                    <Server className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-100">Perintah IPTABLES untuk Klien Ini:</p>
                      <p className="text-slate-300 mt-0.5">
                        Jika Anda belum mengaktifkan Daemon Auto-Port Range di tab Otomatisasi, Anda dapat menjalankan perintah manual ini di terminal VPS.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto max-h-64 leading-relaxed selection:bg-purple-500 selection:text-white">
                      {generateVPSCommands(selectedVpnModal)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Klien: <strong className="text-white">{selectedVpnModal.name}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVpnModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup
                </button>

                <button
                  onClick={() => {
                    if (modalTab === 'mikrotik') {
                      handleCopyScript(generateFullMikrotikScript(selectedVpnModal));
                    } else if (modalTab === 'whatsapp') {
                      handleCopyScript(generateWhatsAppMessage(selectedVpnModal));
                    } else {
                      handleCopyScript(generateVPSCommands(selectedVpnModal));
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
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
                        {modalTab === 'mikrotik'
                          ? 'Salin Skrip MikroTik'
                          : modalTab === 'whatsapp'
                          ? 'Salin Pesan WA'
                          : 'Salin Perintah VPS'}
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
