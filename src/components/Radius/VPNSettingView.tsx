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
  const { vpnConfigs, addVPN, deleteVPN, setActiveTab, radiusServer } = useApp();

  // VPS Server Public Host IP (Default user VPS IP)
  const defaultServerHost = radiusServer?.ip || '103.49.239.150';
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

  // Modal State for Script Viewer: Dipisah antara RADIUS Auth & Remote Winbox
  const [selectedVpnModal, setSelectedVpnModal] = useState<VPNConfig | null>(null);
  const [scriptMode, setScriptMode] = useState<'radius' | 'remote'>('radius');
  const [activeProtocolTab, setActiveProtocolTab] = useState<'wireguard' | 'sstp' | 'l2tp'>('sstp');
  const [showWaShare, setShowWaShare] = useState(false);
  const [copiedModalScript, setCopiedModalScript] = useState(false);
  const [quickCopiedId, setQuickCopiedId] = useState<string | null>(null);

  // Parameter Khusus untuk Skrip Autentikasi RADIUS MasmediaNet (Dapat Berjalan Bersama RadbooX / Sistem Lain)
  const [radiusTargetIp, setRadiusTargetIp] = useState(radiusServer?.ip || '103.49.239.150');
  const [radiusConnectTo, setRadiusConnectTo] = useState(radiusServer?.hostname || radiusServer?.ip || '103.49.239.150');
  const [radiusSstpPort, setRadiusSstpPort] = useState<number>(radiusServer?.sstpPort || 443);
  const [radiusSecret, setRadiusSecret] = useState(radiusServer?.secret || 'MasmediaSecret2026');
  const [includeRadiusServiceRule, setIncludeRadiusServiceRule] = useState(true);
  const [radiusRouterOsVersion, setRadiusRouterOsVersion] = useState<'v7' | 'v6'>('v7');
  const [includeSnmpRule, setIncludeSnmpRule] = useState(false);
  const [snmpServerIp, setSnmpServerIp] = useState(`${radiusServer?.ip || '103.49.239.150'}/32`);
  const [snmpCommunityName, setSnmpCommunityName] = useState('MasmediaNet');

  // Calculate Next Dynamic Allocation (IP and Ports)
  const nextAllocation = useMemo(() => {
    const usedIps = new Set(vpnConfigs.map(item => item.remoteIp).filter(Boolean));
    const usedWinboxPorts = new Set(vpnConfigs.map(item => item.remoteWinboxPort).filter(Boolean));
    const usedWebPorts = new Set(vpnConfigs.map(item => item.remoteWebPort).filter(Boolean));

    // Next IP in 10.200.0.X (alokasi mandiri untuk MasmediaNet)
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

  // --- KELOMPOK 1: SCRIPT AUTENTIKASI RADIUS MASMEDIANET (TUNNEL & ROUTING KHUSUS RADIUS) ---

  // 1.1 RADIUS SSTP Client (Port 443 / SSTP MasmediaNet)
  const generateRadiusSstpScript = (vpn: VPNConfig): string => {
    const connectHost = radiusConnectTo.trim() || defaultServerHost;
    const radIp = radiusTargetIp.trim() || defaultServerHost;
    const user = vpn.username && vpn.username !== 'user' ? vpn.username : 'masmedia';
    const pass = vpn.password || vpn.secretKey || 'Server@123';
    const sstpPort = radiusSstpPort || 443;
    const radSecret = radiusSecret.trim() || pass;
    const iface = 'sstp-MasmediaNet';

    return `# ====================================================================
# [BAGIAN 1] SCRIPT AUTENTIKASI RADIUS VIA SSTP CLIENT (PORT ${sstpPort})
# Aplikasi             : MasmediaNet
# Akun Router MikroTik : ${vpn.name}
# Gateway Server       : ${connectHost}:${sstpPort}
# Target IP RADIUS     : ${radIp}
# Interface VPN        : ${iface}
# Catatan Keamanan     : TIDAK mengganggu/menghapus konfigurasi RadbooX atau VPN lain!
# ====================================================================

# 1. Bersihkan interface tunnel & route MasmediaNet sebelumnya (jika ada)
/interface sstp-client remove [find name="${iface}"]
/ip route remove [find comment="Route-MasmediaNet-RADIUS"]
/ip route remove [find gateway="${iface}"]

# 2. Hubungkan SSTP Client ke VPN Gateway RADIUS MasmediaNet
/interface sstp-client
add connect-to=${connectHost} disabled=no name=${iface} port=${sstpPort} \\
    user="${user}" password="${pass}" profile=default-encryption \\
    verify-server-certificate=no verify-server-address-from-certificate=no add-default-route=no comment="Tunnel RADIUS Server - MasmediaNet (${vpn.name})"

# 3. Tambahkan Routing Khusus ke IP Server RADIUS MasmediaNet
/ip route
add disabled=no distance=1 dst-address=${radIp} gateway=${iface} comment="Route-MasmediaNet-RADIUS"
${includeRadiusServiceRule ? (radiusRouterOsVersion === 'v7' ? `
# 4. Daftarkan Server RADIUS MasmediaNet MikroTik V7 (RouterOS v7)
/radius remove [find comment="MasmediaNet-RADIUS"]
/radius
 add address=${radIp} require-message-auth=no service=ppp,hotspot,dhcp timeout=2s secret=${radSecret} comment="MasmediaNet-RADIUS"
/radius incoming 
 set accept=yes
` : `
# 4. Daftarkan Server RADIUS MasmediaNet MikroTik (RouterOS v6)
/radius remove [find comment="MasmediaNet-RADIUS"]
/radius 
 add address=${radIp} secret="${radSecret}" service=ppp,hotspot,dhcp timeout=2000ms comment="MasmediaNet-RADIUS"
/radius incoming 
 set accept=yes
`) : ''}${includeSnmpRule ? `
# 5. Aktifkan SNMP MikroTik MasmediaNet (Community: ${snmpCommunityName.trim() || 'MasmediaNet'})
/snmp community remove [find name="${snmpCommunityName.trim() || 'MasmediaNet'}"]
/snmp community 
 add addresses=${snmpServerIp.trim() || `${defaultServerHost}/32`} name=${snmpCommunityName.trim() || 'MasmediaNet'} write-access=yes read-access=yes
/snmp 
 set enabled=yes
` : ''}
:put "========================================================="
:put ">>> SUKSES! AUTENTIKASI RADIUS SSTP MASMEDIANET KE ${radIp} AKTIF! <<<"
:put ">>> Interface: ${iface} | RadbooX Tetap Aman Berjalan <<<"
:put "========================================================="
`;
  };

  // 1.2 RADIUS WireGuard Client (RouterOS v7 - MasmediaNet)
  const generateRadiusWireGuardScript = (vpn: VPNConfig): string => {
    const connectHost = radiusConnectTo.trim() || vpn.serverAddress || defaultServerHost;
    const radIp = radiusTargetIp.trim() || defaultServerHost;
    const tunnelIp = vpn.remoteIp || '10.200.0.10';
    const radSecret = radiusSecret.trim() || vpn.password || 'server@123';
    const iface = 'wg-MasmediaNet';

    return `# ====================================================================
# [BAGIAN 1] SCRIPT AUTENTIKASI RADIUS VIA WIREGUARD (ROUTEROS v7)
# Aplikasi             : MasmediaNet
# Akun Router MikroTik : ${vpn.name}
# Gateway Server       : ${connectHost}:51820
# IP Tunnel Client     : ${tunnelIp}/24
# Target IP RADIUS     : ${radIp}
# Interface VPN        : ${iface}
# Catatan Keamanan     : TIDAK mengganggu/menghapus konfigurasi RadbooX atau VPN lain!
# ====================================================================

# 1. Bersihkan interface WireGuard & route MasmediaNet sebelumnya (jika ada)
/interface wireguard remove [find name="${iface}"]
/ip route remove [find comment="Route-MasmediaNet-RADIUS"]
/ip route remove [find gateway="${iface}"]

# 2. Buat Interface WireGuard Khusus RADIUS MasmediaNet
/interface wireguard
add name="${iface}" listen-port=13231 mtu=1420 comment="WireGuard RADIUS - MasmediaNet (${vpn.name})"

# 3. Tetapkan IP Tunnel ke Router
/ip address
add address=${tunnelIp}/24 interface="${iface}" comment="IP Tunnel WireGuard RADIUS MasmediaNet"

# 4. Daftarkan Peer ke Server VPS
/interface wireguard peers
add interface="${iface}" public-key="${vpn.serverPublicKey || DEFAULT_WG_SERVER_PUBKEY}" \\
    endpoint-address="${connectHost}" endpoint-port=51820 allowed-address=${radIp}/32,${tunnelIp}/24 \\
    persistent-keepalive=25s comment="VPS WireGuard RADIUS Endpoint MasmediaNet"

# 5. Tambahkan Routing Khusus ke IP Server RADIUS MasmediaNet
/ip route
add disabled=no distance=1 dst-address=${radIp} gateway="${iface}" comment="Route-MasmediaNet-RADIUS"
${includeRadiusServiceRule ? (radiusRouterOsVersion === 'v7' ? `
# 6. Daftarkan Server RADIUS MasmediaNet MikroTik V7 (RouterOS v7)
/radius remove [find comment="MasmediaNet-RADIUS"]
/radius
 add address=${radIp} require-message-auth=no service=ppp,hotspot,dhcp timeout=2s secret=${radSecret} comment="MasmediaNet-RADIUS"
/radius incoming 
 set accept=yes
` : `
# 6. Daftarkan Server RADIUS MasmediaNet MikroTik (RouterOS v6)
/radius remove [find comment="MasmediaNet-RADIUS"]
/radius 
 add address=${radIp} secret="${radSecret}" service=ppp,hotspot,dhcp timeout=2000ms comment="MasmediaNet-RADIUS"
/radius incoming 
 set accept=yes
`) : ''}${includeSnmpRule ? `
# 7. Aktifkan SNMP MikroTik MasmediaNet (Community: ${snmpCommunityName.trim() || 'MasmediaNet'})
/snmp community remove [find name="${snmpCommunityName.trim() || 'MasmediaNet'}"]
/snmp community 
 add addresses=${snmpServerIp.trim() || `${defaultServerHost}/32`} name=${snmpCommunityName.trim() || 'MasmediaNet'} write-access=yes read-access=yes
/snmp 
 set enabled=yes
` : ''}
:put "========================================================="
:put ">>> SUKSES! AUTENTIKASI RADIUS WIREGUARD MASMEDIANET KE ${radIp} AKTIF! <<<"
:put "========================================================="
`;
  };

  // 1.3 RADIUS L2TP/IPsec Client (RouterOS v6 & v7 - MasmediaNet)
  const generateRadiusL2tpScript = (vpn: VPNConfig): string => {
    const connectHost = radiusConnectTo.trim() || vpn.serverAddress || defaultServerHost;
    const radIp = radiusTargetIp.trim() || defaultServerHost;
    const user = vpn.username || 'masmedia';
    const pass = vpn.password || vpn.secretKey || 'server@123';
    const radSecret = radiusSecret.trim() || pass;
    const iface = 'l2tp-MasmediaNet';

    return `# ====================================================================
# [BAGIAN 1] SCRIPT AUTENTIKASI RADIUS VIA L2TP/IPSEC (ROUTEROS v6 & v7)
# Aplikasi             : MasmediaNet
# Akun Router MikroTik : ${vpn.name}
# Gateway Server       : ${connectHost} (Port: 1701 UDP IPsec)
# Target IP RADIUS     : ${radIp}
# Interface VPN        : ${iface}
# Catatan Keamanan     : TIDAK mengganggu/menghapus konfigurasi RadbooX atau VPN lain!
# ====================================================================

# 1. Bersihkan interface L2TP & route MasmediaNet sebelumnya (jika ada)
/interface l2tp-client remove [find name="${iface}"]
/ip route remove [find comment="Route-MasmediaNet-RADIUS"]
/ip route remove [find gateway="${iface}"]

# 2. Hubungkan L2TP Client
/interface l2tp-client
add name="${iface}" connect-to="${connectHost}" user="${user}" \\
    password="${pass}" ipsec-secret="Server@123" use-ipsec=yes \\
    profile=default-encryption allow=mschap2,chap,pap add-default-route=no \\
    disabled=no comment="VPN L2TP Khusus RADIUS MasmediaNet - ${vpn.name}"

# 3. Tambahkan Routing Khusus ke IP Server RADIUS MasmediaNet
/ip route
add disabled=no distance=1 dst-address=${radIp} gateway="${iface}" comment="Route-MasmediaNet-RADIUS"
${includeRadiusServiceRule ? (radiusRouterOsVersion === 'v7' ? `
# 4. Daftarkan Server RADIUS MasmediaNet MikroTik V7 (RouterOS v7)
/radius remove [find comment="MasmediaNet-RADIUS"]
/radius
 add address=${radIp} require-message-auth=no service=ppp,hotspot,dhcp timeout=2s secret=${radSecret} comment="MasmediaNet-RADIUS"
/radius incoming 
 set accept=yes
` : `
# 4. Daftarkan Server RADIUS MasmediaNet MikroTik (RouterOS v6)
/radius remove [find comment="MasmediaNet-RADIUS"]
/radius 
 add address=${radIp} secret="${radSecret}" service=ppp,hotspot,dhcp timeout=2000ms comment="MasmediaNet-RADIUS"
/radius incoming 
 set accept=yes
`) : ''}${includeSnmpRule ? `
# 5. Aktifkan SNMP MikroTik MasmediaNet (Community: ${snmpCommunityName.trim() || 'MasmediaNet'})
/snmp community remove [find name="${snmpCommunityName.trim() || 'MasmediaNet'}"]
/snmp community 
 add addresses=${snmpServerIp.trim() || `${defaultServerHost}/32`} name=${snmpCommunityName.trim() || 'MasmediaNet'} write-access=yes read-access=yes
/snmp 
 set enabled=yes
` : ''}
:put "========================================================="
:put ">>> SUKSES! AUTENTIKASI RADIUS L2TP MASMEDIANET KE ${radIp} AKTIF! <<<"
:put "========================================================="
`;
  };

  // --- KELOMPOK 2: SCRIPT REMOTE WINBOX & MANAJEMEN ROUTER (AKSES DARI LUAR JARINGAN) ---

  // 2.1 Remote Winbox WireGuard (Ros 7 - Cepat & Ringan)
  const generateWireGuardScript = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const ip = vpn.remoteIp || '10.200.0.10';
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const iface = 'wg-masmedia';

    return `# ====================================================================
# [BAGIAN 2] SCRIPT REMOTE WINBOX & MANAJEMEN ROUTER (WIREGUARD ROS 7)
# Akun: ${vpn.name} | User: ${vpn.username}
# Server Host: ${host} | Port Endpoint: 51820
# IP Tunnel  : ${ip}/24
# Remote Winbox: ${host}:${winboxPort}
# Fungsi: Membuka Akses Remote Winbox, WebFig & API dari Luar Jaringan
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
/interface wireguard peers
add interface="${iface}" public-key="${vpn.serverPublicKey || DEFAULT_WG_SERVER_PUBKEY}" endpoint-address="${host}" endpoint-port=51820 \\
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
:put ">>> SUKSES! REMOTE WIREGUARD ${vpn.name} BERHASIL DIPASANG <<<"
:put ">>> Buka Winbox -> Connect To: ${host}:${winboxPort} <<<"
:put "========================================================="
`;
  };

  // 2.2 Remote Winbox SSTP (SSL Port 443 - Anti Blokir)
  const generateSstpScript = (vpn: VPNConfig): string => {
    const host = radiusConnectTo.trim() || defaultServerHost;
    const user = vpn.username && vpn.username !== 'user' ? vpn.username : 'masmedia';
    const pass = vpn.password || vpn.secretKey || 'Server@123';
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const iface = 'sstp-masmedia';

    return `# ====================================================================
# [BAGIAN 2] SCRIPT REMOTE WINBOX & MANAJEMEN ROUTER (SSTP SSL PORT 443)
# Akun: ${vpn.name} | User: ${user}
# Server Host: ${host} | Port: 443 (SSL TCP - Anti Blokir)
# Remote Winbox: ${host}:${winboxPort}
# Kompatibel: RouterOS v6 & RouterOS v7
# Fungsi: Membuka Akses Remote Winbox, WebFig & API dari Luar Jaringan
# ====================================================================

# 1. Hapus koneksi SSTP MasmediaNet lama jika ada
/interface sstp-client remove [find name="${iface}"]

# 2. Hubungkan SSTP Client ke VPS Masmedia
/interface sstp-client
add name="${iface}" connect-to="${host}" port=443 user="${user}" \\
    password="${pass}" profile=default-encryption verify-server-certificate=no \\
    verify-server-address-from-certificate=no add-default-route=no disabled=no comment="VPN SSTP Remote MasmediaNet - ${vpn.name}"

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
:put ">>> SUKSES! REMOTE SSTP (SSL 443) ${vpn.name} BERHASIL AKTIF! <<<"
:put ">>> Buka Winbox -> Connect To: ${host}:${winboxPort} <<<"
:put "========================================================="
`;
  };

  // 2.3 Remote Winbox L2TP Ros 6/7
  const generateL2tpScript = (vpn: VPNConfig): string => {
    const host = vpn.serverAddress || defaultServerHost;
    const user = vpn.username || 'masmedia';
    const pass = vpn.password || vpn.secretKey || 'server@123';
    const winboxPort = vpn.remoteWinboxPort || 18291;
    const iface = 'l2tp-masmedia';

    return `# ====================================================================
# [BAGIAN 2] SCRIPT REMOTE WINBOX & MANAJEMEN ROUTER (L2TP/IPSEC ROS 6 & 7)
# Akun: ${vpn.name} | User: ${user}
# Server Host: ${host} | Port: 1701 UDP (IPsec)
# Remote Winbox: ${host}:${winboxPort}
# Kompatibel: RouterOS v6 & RouterOS v7
# Fungsi: Membuka Akses Remote Winbox, WebFig & API dari Luar Jaringan
# ====================================================================

# 1. Hapus koneksi L2TP MasmediaNet lama jika ada
/interface l2tp-client remove [find name="${iface}"]

# 2. Hubungkan L2TP Client ke VPS Masmedia
/interface l2tp-client
add name="${iface}" connect-to="${host}" user="${user}" \\
    password="${pass}" ipsec-secret="Server@123" use-ipsec=yes \\
    profile=default-encryption allow=mschap2,chap,pap add-default-route=no \\
    disabled=no comment="VPN L2TP Remote MasmediaNet - ${vpn.name}"

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
:put ">>> SUKSES! REMOTE L2TP ROS 6/7 ${vpn.name} AKTIF! <<<"
:put ">>> Buka Winbox -> Connect To: ${host}:${winboxPort} <<<"
:put "========================================================="
`;
  };

  // Get active script according to the active mode and protocol tab
  const getActiveScript = (vpn: VPNConfig): string => {
    if (scriptMode === 'radius') {
      switch (activeProtocolTab) {
        case 'sstp':
          return generateRadiusSstpScript(vpn);
        case 'wireguard':
          return generateRadiusWireGuardScript(vpn);
        case 'l2tp':
          return generateRadiusL2tpScript(vpn);
        default:
          return generateRadiusSstpScript(vpn);
      }
    } else {
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
    }
  };

  const getActiveProtocolLabel = (): string => {
    if (scriptMode === 'radius') {
      switch (activeProtocolTab) {
        case 'sstp':
          return `SSTP RADIUS (Port ${radiusSstpPort})`;
        case 'wireguard':
          return 'WireGuard RADIUS (Ros 7)';
        case 'l2tp':
          return 'L2TP RADIUS (Ros 6 & 7)';
        default:
          return 'SSTP RADIUS';
      }
    } else {
      switch (activeProtocolTab) {
        case 'wireguard':
          return 'WireGuard Remote (Ros 7)';
        case 'sstp':
          return 'SSTP Remote (SSL 443)';
        case 'l2tp':
          return 'L2TP Remote (Ros 6/7)';
        default:
          return 'WireGuard Remote (Ros 7)';
      }
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

                            {/* Script Mikrotik Buttons: Dipisah antara RADIUS Auth & Remote Winbox */}
                            <td className="py-3.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVpnModal(item);
                                    setScriptMode('radius');
                                    setActiveProtocolTab('sstp');
                                    setShowWaShare(false);
                                    setCopiedModalScript(false);
                                    if (item.serverAddress) setRadiusConnectTo(item.serverAddress);
                                    if (item.password) setRadiusSecret(item.password);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/90 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                                  title="Lihat Skrip Autentikasi RADIUS via Tunnel"
                                >
                                  <Shield className="w-3.5 h-3.5 text-indigo-200" />
                                  <span>RADIUS</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedVpnModal(item);
                                    setScriptMode('remote');
                                    setActiveProtocolTab('wireguard');
                                    setShowWaShare(false);
                                    setCopiedModalScript(false);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0284c7] hover:bg-sky-500 active:scale-95 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                                  title="Lihat Skrip Remote Winbox & Manajemen"
                                >
                                  <Terminal className="w-3.5 h-3.5 text-sky-200" />
                                  <span>Remote</span>
                                </button>
                              </div>
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

            {/* PRIMARY MODE SWITCHER: 1. AUTENTIKASI RADIUS vs 2. REMOTE WINBOX */}
            <div className="p-3.5 bg-slate-900 border-b border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Tab 1: Autentikasi RADIUS */}
                <button
                  type="button"
                  onClick={() => {
                    setScriptMode('radius');
                    setActiveProtocolTab('sstp');
                    setShowWaShare(false);
                    setCopiedModalScript(false);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3 border ${
                    scriptMode === 'radius'
                      ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${scriptMode === 'radius' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">1. Autentikasi RADIUS</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Tunnel &amp; Route
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Routing khusus IP RADIUS ({radiusTargetIp}) via VPN MasmediaNet (Dapat Berjalan Berdampingan dengan RadbooX)
                    </p>
                  </div>
                </button>

                {/* Tab 2: Remote Winbox & Manajemen */}
                <button
                  type="button"
                  onClick={() => {
                    setScriptMode('remote');
                    setActiveProtocolTab('wireguard');
                    setShowWaShare(false);
                    setCopiedModalScript(false);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3 border ${
                    scriptMode === 'remote'
                      ? 'bg-sky-600/15 border-sky-500/50 shadow-md text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${scriptMode === 'remote' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">2. Remote Winbox &amp; Manajemen</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Akses Luar
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Membuka Remote Winbox ({selectedVpnModal.remoteWinboxPort || 18291}), WebFig &amp; API dari luar jaringan
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* SUB-PROTOCOL SELECTOR TABS */}
            <div className="flex items-center gap-1.5 px-5 pt-3 border-b border-slate-800 bg-slate-900/50 overflow-x-auto">
              {scriptMode === 'radius' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProtocolTab('sstp');
                      setShowWaShare(false);
                      setCopiedModalScript(false);
                    }}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      activeProtocolTab === 'sstp' && !showWaShare
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>SSTP (Port {radiusSstpPort} - MasmediaNet)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveProtocolTab('wireguard');
                      setShowWaShare(false);
                      setCopiedModalScript(false);
                    }}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      activeProtocolTab === 'wireguard' && !showWaShare
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>WireGuard RADIUS (Ros 7)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveProtocolTab('l2tp');
                      setShowWaShare(false);
                      setCopiedModalScript(false);
                    }}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      activeProtocolTab === 'l2tp' && !showWaShare
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10 rounded-t-lg'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Server className="w-4 h-4 text-purple-400" />
                    <span>L2TP/IPsec RADIUS</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProtocolTab('wireguard');
                      setShowWaShare(false);
                      setCopiedModalScript(false);
                    }}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      activeProtocolTab === 'wireguard' && !showWaShare
                        ? 'border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-lg'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>tab 1. WireGuard (Ros 7)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveProtocolTab('sstp');
                      setShowWaShare(false);
                      setCopiedModalScript(false);
                    }}
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      activeProtocolTab === 'sstp' && !showWaShare
                        ? 'border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-lg'
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
                    className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      activeProtocolTab === 'l2tp' && !showWaShare
                        ? 'border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-lg'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Server className="w-4 h-4 text-purple-400" />
                    <span>tab 3. L2TP Ros 6/7</span>
                  </button>

                  {/* Format WA tab */}
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
                </>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* PARAMETER CONFIGURATION TOOLBAR (HANYA MUNCUL DI MODE RADIUS) */}
              {scriptMode === 'radius' && (
                <div className="bg-[#0a0f1d] border border-indigo-900/40 rounded-2xl p-4 space-y-3 shadow-inner animate-fadeIn">
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Parameter Skrip RADIUS &amp; Routing (Bisa Disesuaikan Real-Time):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRadiusTargetIp(defaultServerHost);
                        setRadiusConnectTo(defaultServerHost);
                        setRadiusSstpPort(443);
                        setRadiusSecret('Server@123');
                        setIncludeRadiusServiceRule(true);
                      }}
                      className="text-[11px] text-slate-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Reset Default MasmediaNet
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Input Target IP RADIUS */}
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium text-[11px] block">Target IP RADIUS (/ip route):</label>
                      <input
                        type="text"
                        value={radiusTargetIp}
                        onChange={e => setRadiusTargetIp(e.target.value)}
                        placeholder="103.49.239.150"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-indigo-200 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Input Gateway Server / Connect-To */}
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium text-[11px] block">Connect-To (Gateway Host):</label>
                      <input
                        type="text"
                        value={radiusConnectTo}
                        onChange={e => setRadiusConnectTo(e.target.value)}
                        placeholder="103.49.239.150"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Port SSTP Selector */}
                    {activeProtocolTab === 'sstp' && (
                      <div className="space-y-1">
                        <label className="text-slate-400 font-medium text-[11px] block">Port SSTP Client:</label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRadiusSstpPort(4433)}
                            className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-xs border transition-all cursor-pointer ${
                              radiusSstpPort === 4433
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            4433 (Default)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRadiusSstpPort(443)}
                            className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-xs border transition-all cursor-pointer ${
                              radiusSstpPort === 443
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            443 (SSL)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Secret RADIUS */}
                    <div className="space-y-1">
                      <label className="text-slate-400 font-medium text-[11px] block">RADIUS Shared Secret:</label>
                      <input
                        type="text"
                        value={radiusSecret}
                        onChange={e => setRadiusSecret(e.target.value)}
                        placeholder="server@123"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Baris Pilihan: Versi RouterOS & Checkbox Radius & SNMP */}
                  <div className="flex items-center gap-4 flex-wrap pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-semibold">Versi RouterOS:</span>
                      <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-700">
                        <button
                          type="button"
                          onClick={() => setRadiusRouterOsVersion('v7')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                            radiusRouterOsVersion === 'v7'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          RouterOS v7
                        </button>
                        <button
                          type="button"
                          onClick={() => setRadiusRouterOsVersion('v6')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                            radiusRouterOsVersion === 'v6'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          RouterOS v6
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={includeRadiusServiceRule}
                        onChange={e => setIncludeRadiusServiceRule(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Sertakan <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">/radius add</code> &amp; <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">/radius incoming</code> (CoA 3799)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={includeSnmpRule}
                        onChange={e => setIncludeSnmpRule(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>Sertakan <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">/snmp community</code> ({snmpCommunityName})</span>
                    </label>
                  </div>
                </div>
              )}

              {!showWaShare ? (
                <div className="space-y-3 animate-fadeIn">
                  {/* Protocol Guide Callout */}
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    scriptMode === 'radius'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                      : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-slate-100 mb-1">
                      {scriptMode === 'radius' ? (
                        <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : (
                        <Terminal className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                      <span>
                        {scriptMode === 'radius'
                          ? `Skrip Autentikasi RADIUS via ${getActiveProtocolLabel()}`
                          : `Skrip Remote Winbox via ${getActiveProtocolLabel()}`}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {scriptMode === 'radius' ? (
                        <>
                          <strong>Fungsi Script:</strong> Menghubungkan tunnel VPN dan menambahkan aturan routing{' '}
                          <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 font-mono">
                            /ip route add dst-address={radiusTargetIp} gateway={activeProtocolTab === 'wireguard' ? 'wg-MasmediaNet' : activeProtocolTab === 'l2tp' ? 'l2tp-MasmediaNet' : 'sstp-MasmediaNet'}
                          </code>.
                          Dengan routing ini, <em>hanya</em> komunikasi autentikasi PPPoE, Hotspot &amp; Isolir yang diarahkan ke Server RADIUS, sedangkan <strong>seluruh trafik internet pelanggan tetap berjalan normal lewat ISP lokal router</strong>.
                        </>
                      ) : (
                        <>
                          <strong>Fungsi Script:</strong> Membuka akses jarak jauh ke <strong>Winbox (Port 8291)</strong>, <strong>WebFig (Port 80)</strong>, dan <strong>API (Port 8728)</strong> melalui server VPS Masmedia. Anda dapat mengakses router MikroTik dari mana saja menggunakan alamat:
                          <span className="block mt-1 font-mono text-sky-300 font-bold">
                            Connect To: {selectedVpnModal.serverAddress || serverHost}:{selectedVpnModal.remoteWinboxPort || 18291}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Terminal Script Code Box */}
                  <div className="relative">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-x border-slate-800 rounded-t-xl text-[11px] text-slate-400 font-mono">
                      <span>{getActiveProtocolLabel()} - Tempelkan di Winbox &gt; New Terminal</span>
                      <button
                        type="button"
                        onClick={() => handleCopyScript(getActiveScript(selectedVpnModal))}
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        {copiedModalScript ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Skrip</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 rounded-b-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72 leading-relaxed selection:bg-indigo-500 selection:text-white">
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
              {scriptMode === 'remote' ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Remote Winbox:</span>
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
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Target Server RADIUS:</span>
                  <span className="font-mono text-indigo-300 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {radiusTargetIp} via {activeProtocolTab === 'wireguard' ? 'wg-MasmediaNet' : activeProtocolTab === 'l2tp' ? 'l2tp-MasmediaNet' : 'sstp-MasmediaNet'}
                  </span>
                </div>
              )}

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
                  className={`font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 text-white ${
                    scriptMode === 'radius'
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                      : 'bg-[#0284c7] hover:bg-sky-500 shadow-sky-600/25'
                  }`}
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

