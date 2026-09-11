import { InternetPackage, MikroTikNAS, IsolirRuleConfig, VPNConfig, RadiusServerConfig } from '../types';

export function generateRadiusConfigScript(nas: MikroTikNAS, serverIp = '192.168.88.2', sharedSecret = ''): string {
  const secret = sharedSecret || nas.radiusSecret || 'rtrw_radius_secret_2026';
  return `# ====================================================================
# KONFIGURASI RADIUS CLIENT UNTUK MIKROTIK (${nas.name})
# Target ROS: ${nas.rosVersion || 'RouterOS v7'}
# Server RADIUS: ${serverIp} | Port Auth: 1812 | Port Acct: 1813 | CoA: 3799
# ====================================================================

# 1. Hapus konfigurasi lama jika ada dengan comment yang sama
/radius remove [find comment="Masmedia-RTRW"]

# 2. Tambah RADIUS Server untuk PPPoE (PPP), Hotspot, dan Login DHCP
/radius
add service=ppp,hotspot,login,dhcp address=${serverIp} secret="${secret}" \\
    authentication-port=1812 accounting-port=1813 timeout=3000ms comment="Masmedia-RTRW"

# 3. Aktifkan RADIUS Authentication & Accounting pada PPP (PPPoE / L2TP)
/ppp aaa
set use-radius=yes accounting=yes interim-update=00:01:00

# 4. Aktifkan Incoming RADIUS / CoA (Packet of Disconnect via Port 3799)
/radius incoming
set accept=yes port=3799

# 5. Aktifkan RADIUS pada Hotspot Server Profile Default
/ip hotspot profile
set [find default=yes] use-radius=yes radius-accounting=yes radius-interim-update=00:01:00

# 6. Cetak Konfirmasi Sukses ke Terminal
:put ">>> Konfigurasi RADIUS AAA Masmedia Berhasil Diterapkan ke MikroTik! <<<"
`;
}

export function generateVpnClientScript(vpn: VPNConfig, rosVersion: 'v7' | 'v6' = 'v7'): string {
  const vpnName = vpn.name.replace(/\s+/g, '_') || 'VPN_Remote';
  
  if (vpn.type === 'wireguard') {
    return `# ====================================================================
# MIKROTIK WIREGUARD VPN CLIENT SETUP (RouterOS v7)
# Tunnel Name: ${vpnName} | Server: ${vpn.serverAddress}
# ====================================================================

# 1. Buat Interface WireGuard
/interface wireguard
add name="${vpnName}" listen-port=13231 mtu=1420 comment="VPN Remote RTRW Net"

# 2. Assign IP Address ke Interface WireGuard
/ip address
add address=${vpn.remoteIp || '10.255.0.2'}/24 interface="${vpnName}" network=10.255.0.0 comment="IP Tunnel WireGuard"

# 3. Tambahkan WireGuard Peer (Server Gateway)
/interface wireguard peers
add interface="${vpnName}" endpoint-address="${vpn.serverAddress}" endpoint-port=51820 \\
    allowed-address=10.255.0.0/24,10.10.0.0/16 persistent-keepalive=25s comment="Server Peer"

# 4. Izinkan Winbox & API melalui Interface VPN
/ip firewall filter
add chain=input action=accept in-interface="${vpnName}" comment="Allow Remote Winbox via VPN"

:put ">>> WireGuard VPN Interface ${vpnName} Berhasil Diaktifkan! <<<"
`;
  }

  if (vpn.type === 'sstp') {
    return `# ====================================================================
# MIKROTIK SSTP CLIENT SETUP (Bypass Blokir ISP / Port 443 HTTPS)
# Tunnel Name: ${vpnName} | Server: ${vpn.serverAddress}
# ====================================================================

/interface sstp-client
add name="${vpnName}" connect-to="${vpn.serverAddress}" user="${vpn.username}" \\
    password="${vpn.password}" profile=default-encryption verify-server-certificate=no \\
    add-default-route=no disabled=no comment="VPN Remote SSTP RTRW Net"

# Izinkan Traffic Remote Management Winbox (Port 8291) & API (Port 8728)
/ip firewall filter
add chain=input action=accept in-interface="${vpnName}" comment="Allow Winbox via SSTP"

:put ">>> SSTP Client ${vpnName} Berhasil Diterapkan! Status: Connecting... <<<"
`;
  }

  if (vpn.type === 'openvpn') {
    return `# ====================================================================
# MIKROTIK OPENVPN (OVPN) CLIENT SETUP
# Tunnel Name: ${vpnName} | Server: ${vpn.serverAddress}
# ====================================================================

/interface ovpn-client
add name="${vpnName}" connect-to="${vpn.serverAddress}" port=1194 mode=ip \\
    user="${vpn.username}" password="${vpn.password}" cipher=aes256 \\
    auth=sha1 add-default-route=no disabled=no comment="VPN Remote OVPN RTRW Net"

:put ">>> OpenVPN Client ${vpnName} Berhasil Diterapkan! <<<"
`;
  }

  // Default: L2TP / IPsec Client
  return `# ====================================================================
# MIKROTIK L2TP/IPSEC CLIENT SETUP (Rekomendasi Remote Winbox Cepat)
# Tunnel Name: ${vpnName} | Server: ${vpn.serverAddress}
# ====================================================================

/interface l2tp-client
add name="${vpnName}" connect-to="${vpn.serverAddress}" user="${vpn.username}" \\
    password="${vpn.password}" profile=default-encryption use-ipsec=yes \\
    ipsec-secret="rtrwipsec2026" add-default-route=no allow=mschap2,chap,pap disabled=no \\
    comment="VPN Remote L2TP RTRW Net"

# Izinkan Traffic Remote Winbox (Port 8291), Web (Port 80), & API (Port 8728)
/ip firewall filter
add chain=input action=accept in-interface="${vpnName}" comment="Allow Remote Management via VPN"

:put ">>> L2TP/IPsec Client ${vpnName} Berhasil Diterapkan! <<<"
`;
}

export function generatePppoeServerRadiusScript(): string {
  return `# ====================================================================
# SETUP PPPoE SERVER MIKROTIK + RADIUS AAA
# Pool: 10.10.10.10 - 10.10.10.254 | Gateway: 10.10.10.1
# ====================================================================

# 1. Buat IP Pool PPPoE
/ip pool
add name=pool-pppoe ranges=10.10.10.10-10.10.10.254

# 2. Buat Profile Default PPPoE yang menggunakan RADIUS
/ppp profile
add name=profile-pppoe-radius local-address=10.10.10.1 remote-address=pool-pppoe \\
    dns-server=1.1.1.1,8.8.8.8 use-encryption=yes use-upnp=no only-one=yes \\
    comment="PPPoE Profile Auto RADIUS"

# 3. Aktifkan PPPoE Server pada Interface Bridge Local (ganti bridge-lan jika beda)
/interface pppoe-server server
add service-name=PPPoE-RTRW interface=bridge-lan default-profile=profile-pppoe-radius \\
    one-session-per-host=yes authentication=pap,chap,mschap2 max-mru=1480 max-mtu=1480 disabled=no

# 4. Pastikan PPP AAA Menggunakan RADIUS
/ppp aaa
set use-radius=yes accounting=yes interim-update=00:01:00

:put ">>> PPPoE Server + RADIUS Siap Melayani Pelanggan! <<<"
`;
}

export function generateWalledGardenScript(): string {
  return `# ====================================================================
# WALLED GARDEN & BYPASS PAYMENT GATEWAY MIKROTIK
# Mengizinkan pelanggan terisolir membuka portal bayar & gateway perbankan
# ====================================================================

/ip hotspot walled-garden
add dst-host="*tripay.co.id" action=allow comment="Tripay Gateway"
add dst-host="*midtrans.com" action=allow comment="Midtrans Gateway"
add dst-host="*xendit.co" action=allow comment="Xendit Gateway"
add dst-host="*duitku.com" action=allow comment="Duitku Gateway"
add dst-host="*bca.co.id" action=allow comment="BCA Virtual Account"
add dst-host="*mandiri.co.id" action=allow comment="Mandiri VA"
add dst-host="*bri.co.id" action=allow comment="BRI VA"
add dst-host="*bni.co.id" action=allow comment="BNI VA"
add dst-host="*fonnte.com" action=allow comment="WhatsApp Fonnte Gateway"
add dst-host="*qrserver.com" action=allow comment="QR Code Generator API"

/ip hotspot walled-garden ip
add dst-address=192.168.88.2 action=accept comment="Billing Portal Local"
add dst-port=3000 protocol=tcp action=accept comment="Billing Web Port 3000"

:put ">>> Walled Garden Bypass Berhasil Diterapkan! <<<"
`;
}

export function generateSimpleQueueScript(): string {
  return `# ====================================================================
# BANDWIDTH MANAGEMENT (SIMPLE QUEUE QoS MIKROTIK)
# Manajemen antrean prioritas browsing, gaming, dan video streaming
# ====================================================================

/queue simple
add name="TOTAL-BANDWIDTH-ISP" max-limit=200M/200M target=ether2-LAN comment="Parent Global ISP"
add name="PAKET-HOME-20M" parent="TOTAL-BANDWIDTH-ISP" max-limit=20M/20M limit-at=5M/5M priority=8/8 comment="Paket Home Basic"
add name="PAKET-PRO-50M" parent="TOTAL-BANDWIDTH-ISP" max-limit=50M/50M limit-at=15M/15M priority=5/5 comment="Paket Pro Gamer"
add name="PAKET-VIP-100M" parent="TOTAL-BANDWIDTH-ISP" max-limit=100M/100M limit-at=30M/30M priority=3/3 comment="Paket VIP dedicated"

:put ">>> QoS Simple Queue Berhasil Diterapkan! <<<"
`;
}

export function generateIsolirFirewallScript(config: IsolirRuleConfig, billingWebIp = '192.168.88.2'): string {
  return `# ===================================================
# SCRIPT SISTEM ISOLIR OTOMATIS MIKROTIK RTRW.NET
# Address List Target: ${config.isolirAddressList}
# Web Portal Isolir IP: ${billingWebIp} (Port 3000 / 80)
# ===================================================

# 1. Buat IP Pool Khusus Isolir
/ip pool
add name=${config.isolirPoolName} ranges=10.99.99.10-10.99.99.250

# 2. Buat Profile Khusus Isolir dengan Bandwidth Minimum (128k)
/ppp profile
add name=${config.isolirProfileName} local-address=10.99.99.1 remote-address=${config.isolirPoolName} \\
    rate-limit="128k/128k" address-list=${config.isolirAddressList} comment="Profile Pelanggan Terisolir"

# 3. NAT Redirection: Redirect browsing HTTP port 80 ke Halaman Pembayaran Isolir
/ip firewall nat
add chain=dstnat action=dst-nat to-addresses=${billingWebIp} to-ports=3000 \\
    protocol=tcp dst-port=80 src-address-list=${config.isolirAddressList} \\
    comment="Masmedia: Redirect Pelanggan Terisolir ke Web Billing"

# 4. Filter Rule: Blokir semua akses internet (kecuali DNS dan Web Billing) untuk user terisolir
/ip firewall filter
add chain=forward action=accept protocol=udp dst-port=53 src-address-list=${config.isolirAddressList} comment="Allow DNS"
add chain=forward action=accept dst-address=${billingWebIp} src-address-list=${config.isolirAddressList} comment="Allow Portal Tagihan"
add chain=forward action=drop src-address-list=${config.isolirAddressList} comment="Masmedia: Drop Internet Akses Terisolir"

# 5. Hotspot Walled Garden (Bypass URL Pembayaran & QRIS)
/ip hotspot walled-garden ip
add action=accept dst-host="*midtrans.com" comment="Payment Gateway"
add action=accept dst-host="*xendit.co" comment="Payment Gateway"
add action=accept dst-host="*api.whatsapp.com" comment="WhatsApp API"
add action=accept dst-host="*web.whatsapp.com" comment="WhatsApp Web"
add action=accept dst-address=${billingWebIp} comment="Billing Portal"

:put ">>> Firewall & Rule Isolir Berhasil Dibuat! <<<"
`;
}

export function generatePackageProfileScript(pkg: InternetPackage): string {
  return `# Profile untuk Paket: ${pkg.name} (${pkg.rateLimit})
/ppp profile
add name="${pkg.profileName}" \\
    rate-limit="${pkg.rateLimit}" \\
    local-address=10.10.10.1 \\
    remote-address=${pkg.poolName} \\
    only-one=yes \\
    comment="Paket ${pkg.name} - Rp ${pkg.price}/bln"

/ip hotspot user profile
add name="${pkg.profileName}" \\
    rate-limit="${pkg.rateLimit}" \\
    shared-users=${pkg.sharedUsers} \\
    address-pool=${pkg.poolName} \\
    status-autorefresh=1m \\
    comment="Paket ${pkg.name} - Rp ${pkg.price}/bln"
`;
}

export function generateDisconnectUserCommand(username: string, service: 'pppoe' | 'hotspot'): string {
  if (service === 'pppoe') {
    return `/ppp active remove [find name="${username}"]`;
  } else {
    return `/ip hotspot active remove [find user="${username}"]`;
  }
}

export function generateIsolateUserCommand(ipAddress: string, username: string, addressList = 'ISOLIR_USERS'): string {
  return `# Masukkan IP atau User ke Address-List Isolir & Kick session
/ip firewall address-list add list=${addressList} address=${ipAddress} comment="Isolir: ${username}"
/ppp active remove [find name="${username}"]
`;
}

export function generateUnisolateUserCommand(ipAddress: string, username: string, addressList = 'ISOLIR_USERS'): string {
  return `# Hapus IP dari daftar isolir & refresh koneksi
/ip firewall address-list remove [find address="${ipAddress}"]
/ip firewall address-list remove [find comment~"${username}"]
:put "User ${username} (${ipAddress}) telah di-unisolir dan aktif kembali."
`;
}
