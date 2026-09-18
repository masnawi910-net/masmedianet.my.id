import {
  Customer,
  InternetPackage,
  Invoice,
  MikroTikNAS,
  ActiveSession,
  WhatsAppTemplate,
  IsolirRuleConfig,
  PaymentChannelConfig,
  AdminAccount,
  FTTH_OLT,
  FTTH_ODP,
  FTTH_ONU,
  GenieACSConfig,
  TR069Device,
  HotspotVoucher,
  HotspotProfile,
  HotspotTemplate,
  VPNConfig,
  RadiusServerConfig,
  Expense,
  BankRekening,
  QRISConfig,
  PaymentGatewayConfig,
  ISPProfile,
  Tenant,
} from './types';

export const initialISPProfile: ISPProfile = {
  brandName: 'Masmedia Network',
  wifiName: 'Masmedia-WiFi-Hotspot',
  logoUrl: '',
  email: 'masnawi910@gmail.com',
  phone: '0851-5767-1244',
  address: 'Jl. Merdeka No. 45, RT 02/RW 03, Kel. Sukamaju, Kec. Cibeunying',
  footerNote: 'Terima kasih atas pembayaran Anda. Simpan bukti ini sebagai konfirmasi resmi pembayaran.',
  website: 'https://masmedia.rtrw.net',
};

export const initialTenants: Tenant[] = [
  {
    id: 'tenant-masmedia',
    name: 'Masmedia Network (Pusat)',
    code: 'MM-01',
    slug: 'masmedia',
    subdomain: 'masmedia',
    ownerName: 'Masnawi',
    ownerEmail: 'masnawi910@gmail.com',
    ownerPhone: '0851-5767-1244',
    phone: '0851-5767-1244',
    city: 'Jakarta / Bandung',
    address: 'Jl. Merdeka No. 45, RT 02/RW 03, Kel. Sukamaju',
    status: 'active',
    tier: 'enterprise',
    plan: 'enterprise',
    hasSelectedPlan: true,
    priceMonthly: 500000,
    maxPppoeUsers: 999999,
    maxHotspotUsers: 999999,
    maxActiveHotspotSessions: 999999,
    maxCustomers: 999999,
    maxRouters: 50,
    maxNas: 50,
    billingCycleDay: 1,
    subscriptionStatus: 'active',
    lastSubscriptionPayment: '2026-08-01',
    expiryDate: '2028-12-31',
    createdAt: '2025-01-01',
    ispProfile: {
      brandName: 'Masmedia Network',
      wifiName: 'Masmedia-WiFi-Hotspot',
      logoUrl: '',
      email: 'masnawi910@gmail.com',
      phone: '0851-5767-1244',
      address: 'Jl. Merdeka No. 45, RT 02/RW 03, Kel. Sukamaju',
      footerNote: 'Terima kasih atas pembayaran Anda. Simpan bukti ini sebagai konfirmasi resmi.',
      website: 'https://masmedia.rtrw.net',
    },
    paymentChannels: {
      bcaAccount: { number: '', name: 'MASMEDIA DIGITAL' },
      mandiriAccount: { number: '', name: 'MASMEDIA DIGITAL' },
      briAccount: { number: '', name: 'MASMEDIA DIGITAL' },
      qrisPayload: '',
      merchantName: 'Masmedia Network',
      waGatewayNumber: '',
      waApiKey: '',
    },
  },
];

export const initialPackages: InternetPackage[] = [
  {
    id: 'PKG-01',
    name: '5 Mbps Hemat',
    downloadSpeed: 5,
    uploadSpeed: 2,
    rateLimit: '5M/2M',
    price: 100000,
    validityDays: 30,
    sharedUsers: 1,
    fupQuotaGB: 0, // Unlimited
    profileName: 'profile-5m-hemat',
    poolName: 'pool-pppoe',
    priority: 8,
    category: 'pppoe',
    description: 'Cocok untuk browsing santai, WA, sosial media 1-3 perangkat.',
    colorBadge: 'emerald',
    isActive: true,
  },
  {
    id: 'PKG-02',
    name: '10 Mbps Keluarga',
    downloadSpeed: 10,
    uploadSpeed: 5,
    rateLimit: '10M/5M',
    price: 150000,
    validityDays: 30,
    sharedUsers: 1,
    fupQuotaGB: 0,
    profileName: 'profile-10m-family',
    poolName: 'pool-pppoe',
    priority: 7,
    category: 'pppoe',
    description: 'Paling diminati! Streaming YouTube HD, Zoom, sekolah online 3-5 perangkat.',
    colorBadge: 'blue',
    isActive: true,
  },
  {
    id: 'PKG-03',
    name: '20 Mbps Home Gamer',
    downloadSpeed: 20,
    uploadSpeed: 10,
    rateLimit: '20M/10M',
    price: 200000,
    validityDays: 30,
    sharedUsers: 1,
    fupQuotaGB: 0,
    profileName: 'profile-20m-gamer',
    poolName: 'pool-pppoe',
    priority: 6,
    category: 'pppoe',
    description: 'Kecepatan tinggi latensi rendah untuk gaming, Smart TV 4K, dan download cepat.',
    colorBadge: 'indigo',
    isActive: true,
  },
  {
    id: 'PKG-04',
    name: '20 Mbps Bisnis Prioritas',
    downloadSpeed: 20,
    uploadSpeed: 20,
    rateLimit: '20M/20M',
    price: 300000,
    validityDays: 30,
    sharedUsers: 1,
    fupQuotaGB: 0,
    profileName: 'profile-20m-biz',
    poolName: 'pool-pppoe',
    priority: 4,
    category: 'pppoe',
    description: 'Simetris 1:1, prioritas traffic tertinggi untuk toko, kantor desa, dan cafe.',
    colorBadge: 'purple',
    isActive: true,
  },
  {
    id: 'PKG-05',
    name: 'Hotspot Voucher 24 Jam',
    downloadSpeed: 5,
    uploadSpeed: 2,
    rateLimit: '5M/2M',
    price: 5000,
    validityDays: 1,
    sharedUsers: 1,
    fupQuotaGB: 10,
    profileName: 'profile-hotspot-24h',
    poolName: 'pool-hotspot',
    priority: 8,
    category: 'hotspot',
    description: 'Voucher WiFi Hotspot harian tanpa langganan bulanan.',
    colorBadge: 'amber',
    isActive: true,
  },
];

export const initialNAS: MikroTikNAS[] = [];

export const initialCustomers: Customer[] = [];

export const initialInvoices: Invoice[] = [];

export const initialActiveSessions: ActiveSession[] = [];

export const initialWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: 'TPL-01',
    code: 'tagihan_baru',
    title: 'Notifikasi Tagihan Baru',
    description: 'Dikirim saat invoice bulanan berhasil dibuat di awal periode.',
    content: `Halo Bpk/Ibu *{nama}*,

Berikut informasi tagihan internet *{nama_isp}* untuk periode *{periode}*:

📋 ID Pelanggan: *{id_pelanggan}*
📦 Paket: *{paket}* ({kecepatan})
💰 Total Tagihan: *{total_bayar}*
📅 Jatuh Tempo: *{jatuh_tempo}*

Pembayaran dapat ditransfer melalui:
🏦 Rekening Bank / QRIS: {no_rekening}
📱 Cek Tagihan / Bayar Online: {link_pembayaran}

Mohon melakukan pembayaran sebelum tanggal jatuh tempo agar koneksi internet tetap lancar dan tidak terisolir otomatis. Terima kasih! 🙏`,
  },
  {
    id: 'TPL-02',
    code: 'pengingat_h3',
    title: 'Pengingat H-3 Jatuh Tempo',
    description: 'Pengingat sopan 3 hari sebelum batas tanggal jatuh tempo.',
    content: `Halo Bpk/Ibu *{nama}*,

Mengingatkan kembali bahwa tagihan internet *{nama_isp}* periode *{periode}* sebesar *{total_bayar}* akan jatuh tempo pada *{jatuh_tempo}* (3 hari lagi).

ID Pelanggan: *{id_pelanggan}*
Paket: *{paket}*

Silakan lakukan pembayaran melalui transfer bank atau QRIS di: {link_pembayaran}

Abaikan pesan ini jika Anda sudah melakukan pembayaran. Terima kasih atas kerjasamanya! 🙏`,
  },
  {
    id: 'TPL-03',
    code: 'pengingat_h1',
    title: 'Peringatan H-1 / Hari H Jatuh Tempo',
    description: 'Peringatan penting agar pelanggan tidak terkena denda dan isolir.',
    content: `⚠️ *PENTING: PENGINGAT JATUH TEMPO INTERNET*

Halo Bpk/Ibu *{nama}*,
Hari ini / besok adalah batas akhir pembayaran tagihan internet *{nama_isp}* periode *{periode}*.

Total Tagihan: *{total_bayar}*
Batas Jatuh Tempo: *{jatuh_tempo}*

Jika melewati batas tanggal tersebut, sistem kami akan melakukan pembatasan / isolir akses internet otomatis oleh router MikroTik.

Segera lakukan pembayaran & konfirmasi melalui: {link_pembayaran}
Terima kasih!`,
  },
  {
    id: 'TPL-04',
    code: 'pemberitahuan_isolir',
    title: 'Pemberitahuan Isolir Otomatis',
    description: 'Dikirim saat akses internet pelanggan dialihkan ke status isolir.',
    content: `🔴 *PEMBERITAHUAN ISOLIR AKSES INTERNET*

Kepada Bpk/Ibu *{nama}* (ID: *{id_pelanggan}*),

Mohon maaf, per hari ini akses koneksi internet Anda telah *TERISOLIR OTOMATIS* karena tagihan periode *{periode}* sebesar *{total_bayar}* belum terbayar melewati jatuh tempo.

Koneksi internet Anda akan otomatis aktif kembali dalam 1-2 menit setelah pembayaran terverifikasi.

💳 *Cara Buka Isolir:*
1. Lakukan pembayaran sejumlah *{total_bayar}* via QRIS / Bank Transfer.
2. Link Pembayaran Instan: {link_pembayaran}
3. Atau konfirmasi ke admin: wa.me/{no_hp_admin}

Terima kasih atas perhatian dan kerjasamanya.`,
  },
  {
    id: 'TPL-05',
    code: 'pembayaran_lunas',
    title: 'Konfirmasi Pembayaran Lunas',
    description: 'Struk bukti lunas otomatis dikirim ke WhatsApp setelah bayar.',
    content: `✅ *PEMBAYARAN DITERIMA & LUNAS*

Terima kasih Bpk/Ibu *{nama}*!
Pembayaran tagihan internet *{nama_isp}* telah kami terima dengan rincian:

No. Invoice: *{no_invoice}*
ID Pelanggan: *{id_pelanggan}*
Paket: *{paket}*
Periode: *{periode}*
Nominal: *{total_bayar}*
Metode: *{metode_bayar}*
Status: *LUNAS* ✅

Akses internet Anda aktif normal dengan kecepatan penuh. Selamat berinternet! 🚀✨`,
  },
  {
    id: 'TPL-06',
    code: 'aktivasi_baru',
    title: 'Aktivasi Pelanggan Baru',
    description: 'Informasi akun PPPoE/Hotspot & selamat datang pelanggan baru.',
    content: `🎉 *SELAMAT DATANG DI {nama_isp}*

Halo Bpk/Ibu *{nama}*,
Pemasangan dan aktivasi jaringan internet Anda telah selesai dan siap digunakan!

Berikut detail akun pelanggan Anda:
📋 ID Pelanggan: *{id_pelanggan}*
🔑 Username RADIUS: *{username}*
📦 Paket: *{paket}* ({kecepatan})
📅 Tanggal Tagihan: Setiap tanggal *{jatuh_tempo_tgl}* tiap bulan
💰 Tarif Bulanan: *{tagihan}*

Simpan pesan ini sebagai bukti berlangganan. Jika ada kendala jaringan, silakan hubungi tim helpdesk kami. Terima kasih telah mempercayai kami! 🌐`,
  },
];

export const initialIsolirConfig: IsolirRuleConfig = {
  autoIsolateEnabled: true,
  gracePeriodDays: 3, // Jatuh tempo tgl 10 + 3 hari = isolir tgl 14
  defaultDueDateDay: 10,
  isolirPoolName: 'pool-isolir',
  isolirProfileName: 'profile-isolir',
  isolirAddressList: 'ISOLIR_USERS',
  autoSendWaNotice: true,
  autoRestoreOnPayment: true,
  lateFeeAmount: 10000,
};

export const initialPaymentChannels: PaymentChannelConfig = {
  bcaAccount: {
    number: '',
    name: 'MASMEDIA DIGITAL',
  },
  mandiriAccount: {
    number: '',
    name: 'MASMEDIA DIGITAL',
  },
  briAccount: {
    number: '',
    name: 'MASMEDIA DIGITAL',
  },
  qrisPayload: '',
  merchantName: 'Masmedia Network',
  waGatewayNumber: '',
  waApiKey: '',
  qrisStaticString: '',
  autoMutationConfig: {
    enabled: true,
    provider: 'moota',
    webhookSecret: '',
    uniqueCodeEnabled: true,
    uniqueCodeRange: { min: 101, max: 999 },
    excessHandling: 'isp_revenue',
    bankTarget: 'ALL',
    autoSettle: true,
    webhookLogs: []
  },
};

export const initialAccounts: AdminAccount[] = [
  {
    id: 'ACC-01',
    username: 'masnawi910@gmail.com',
    password: 'admin123',
    name: 'Masnawi (Super Admin / Owner)',
    email: 'masnawi910@gmail.com',
    phone: '081234567890',
    role: 'superadmin',
    tenantId: 'tenant-masmedia',
    tenantName: 'Masmedia Network (Pusat)',
    status: 'active',
    lastLogin: '2026-08-15 19:42',
    permissions: ['all', 'billing', 'radius', 'ftth', 'tr069', 'reports', 'settings', 'tenants'],
    createdAt: '2025-01-01',
  },
];

export const initialFTTH_OLT: FTTH_OLT[] = [];

export const initialFTTH_ODP: FTTH_ODP[] = [];

export const initialFTTH_ONU: FTTH_ONU[] = [];

export const initialGenieACSConfig: GenieACSConfig = {
  apiUrl: 'http://acs.masmedia.net:7557',
  apiKey: '',
  uiUrl: 'http://acs.masmedia.net:3000',
  nbiPort: 7557,
  syncIntervalSeconds: 60,
  status: 'disconnected',
  lastSyncTime: '',
  totalSyncedDevices: 0,
};

export const initialTR069Devices: TR069Device[] = [];

export const initialHotspotProfiles: HotspotProfile[] = [
  {
    id: 'HSP-01',
    name: 'Voucher 2 Jam',
    rateLimit: '3M/1M',
    price: 3000,
    sharedUsers: 1,
    validity: '2h',
    keepaliveTimeout: '00:02:00',
    addressPool: 'hs-pool-1',
    description: 'Akses internet cepat 2 jam nonstop untuk santai di warung/cafe.',
  },
  {
    id: 'HSP-02',
    name: 'Voucher 6 Jam Hemat',
    rateLimit: '4M/2M',
    price: 5000,
    sharedUsers: 1,
    validity: '6h',
    keepaliveTimeout: '00:02:00',
    addressPool: 'hs-pool-1',
    description: 'Voucher terlaris! 6 jam streaming & sosial media.',
  },
  {
    id: 'HSP-03',
    name: 'Voucher 24 Jam Seharian',
    rateLimit: '5M/3M',
    price: 10000,
    sharedUsers: 1,
    validity: '1d',
    keepaliveTimeout: '00:05:00',
    addressPool: 'hs-pool-1',
    description: 'Akses 24 jam penuh download & upload tanpa FUP.',
  },
  {
    id: 'HSP-04',
    name: 'Voucher 7 Hari Mingguan',
    rateLimit: '7M/3M',
    price: 35000,
    sharedUsers: 1,
    validity: '7d',
    keepaliveTimeout: '00:05:00',
    addressPool: 'hs-pool-1',
    description: 'Paket mingguan hemat untuk kos & tamu jangka menengah.',
  },
  {
    id: 'HSP-05',
    name: 'Voucher 30 Hari Bulanan',
    rateLimit: '10M/5M',
    price: 100000,
    sharedUsers: 2,
    validity: '30d',
    keepaliveTimeout: '00:10:00',
    addressPool: 'hs-pool-1',
    description: 'Bulanan 2 user simultan untuk rumah kos & ruko.',
  },
];

export const initialHotspotVouchers: HotspotVoucher[] = [];

export const initialHotspotTemplates: HotspotTemplate[] = [
  {
    id: 'TPL-A4-21',
    name: 'Template Lembar A4 (21 Voucher / Grid 3x7 Modern Elegan)',
    size: 'Kertas A4 (3 Kolom x 7 Baris = 21 Voucher/Halaman)',
    type: 'voucher_print',
    theme: 'modern_dark',
    headerTitle: 'HOTSPOT MASMEDIA.NET ULTRA-SPEED',
    greetingText: 'Voucher Internet Wi-Fi Cepat & Stabil',
    contactWa: '0851-5767-1244',
    wifiName: '@MASMEDIA-HOTSPOT',
    termsText: '1 Voucher hanya untuk 1 HP/Laptop. Masa aktif berjalan sejak login pertama.',
    htmlContent: `<!-- TEMPLATE VOUCHER HOTSPOT A4 (21 VOUCHER / 3x7 GRID) - MODERN & ELEGANT -->
<style>
  @page {
    size: A4 portrait;
    margin: 6mm 7mm;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #ffffff;
    color: #0f172a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .voucher-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 4mm;
  }
  .voucher-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 7px 9px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 38mm; /* Pas 7 baris pada lembar A4 */
    position: relative;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }
  .voucher-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 4px;
  }
  .brand-name {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.3px;
    color: #0f172a;
  }
  .brand-dot {
    color: #10b981;
  }
  .wifi-badge {
    font-size: 7.5px;
    color: #64748b;
    font-weight: 500;
  }
  .price-pill {
    background: #0f172a;
    color: #ffffff;
    font-size: 9.5px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 6px;
    letter-spacing: 0.3px;
  }
  .voucher-main {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 3px 0;
  }
  .code-container {
    flex: 1;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 6px;
    text-align: center;
  }
  .code-caption {
    font-size: 6.5px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .code-text {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: 1px;
    margin-top: 1px;
  }
  .qr-placeholder {
    width: 32px;
    height: 32px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 6px;
    font-weight: 700;
    color: #475569;
    flex-shrink: 0;
  }
  .voucher-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 3px;
    font-size: 7.5px;
  }
  .duration-tag {
    font-weight: 700;
    color: #059669;
  }
  .cs-text {
    color: #94a3b8;
  }
</style>

<div class="voucher-grid">
  <!-- Looping 21 Voucher (3 Kolom x 7 Baris) -->
  <div class="voucher-card">
    <div class="voucher-header">
      <div>
        <div class="brand-name">RTRW<span class="brand-dot">.NET</span></div>
        <div class="wifi-badge">SSID: {{wifi_name}}</div>
      </div>
      <div class="price-pill">{{price}}</div>
    </div>
    <div class="voucher-main">
      <div class="code-container">
        <div class="code-caption">Kode Voucher / Username</div>
        <div class="code-text">{{code}}</div>
      </div>
      <div class="qr-placeholder">QR CODE</div>
    </div>
    <div class="voucher-footer">
      <span class="duration-tag">⏱ {{validity}} ({{rate_limit}})</span>
      <span class="cs-text">WA: {{contact_wa}}</span>
    </div>
  </div>
</div>`,
  },
  {
    id: 'TPL-THERMAL-58',
    name: 'Template Thermal POS 58mm / 80mm (Modern Minimalis)',
    size: 'Struk Thermal Roll (Lebar 58mm / 80mm)',
    type: 'voucher_print',
    theme: 'retro_rtrw',
    headerTitle: 'STRUK VOUCHER WIFI RTRW.NET',
    greetingText: 'Terima kasih telah menggunakan layanan internet kami.',
    contactWa: '0851-5767-1244',
    wifiName: '@RTRW-NET-HOTSPOT',
    termsText: 'Simpan struk ini sebagai bukti pembelian.',
    htmlContent: `<!-- TEMPLATE STRUK VOUCHER THERMAL 58mm / 80mm - MODERN & BERSIH -->
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 58mm;
    font-family: ui-monospace, 'Courier New', Courier, monospace;
    font-size: 10px;
    text-align: center;
    color: #000000;
    padding: 6px;
    background: #ffffff;
  }
  .brand-header { font-weight: 900; font-size: 13px; letter-spacing: 1px; }
  .sub-header { font-size: 9px; color: #333; margin-top: 2px; }
  .separator { border-top: 1px dashed #000; margin: 5px 0; }
  .code-label { font-size: 9px; text-transform: uppercase; }
  .code-box {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 2px;
    padding: 4px 0;
    margin: 3px 0;
  }
  .info-row { display: flex; justify-content: space-between; font-size: 9.5px; margin: 2px 0; }
  .footer-note { font-size: 8px; color: #444; margin-top: 4px; }
</style>

<div class="brand-header">RTRW.NET WIFI</div>
<div class="sub-header">SSID: {{wifi_name}}</div>
<div class="separator"></div>
<div class="code-label">KODE VOUCHER</div>
<div class="code-box">{{code}}</div>
<div class="separator"></div>
<div class="info-row"><span>Tarif:</span><strong>{{price}}</strong></div>
<div class="info-row"><span>Masa Aktif:</span><strong>{{validity}}</strong></div>
<div class="info-row"><span>Kecepatan:</span><strong>{{rate_limit}}</strong></div>
<div class="separator"></div>
<div class="footer-note">Login: http://wifi.rtrw.net</div>
<div class="footer-note">CS WA: {{contact_wa}}</div>
<div class="footer-note">Terima kasih atas kunjungan Anda!</div>`,
  },
  {
    id: 'TPL-LOGIN-PAGE',
    name: 'Template Login Page MikroTik Hotspot (Modern Dark & Simple)',
    size: 'Halaman Captive Portal Web / Mobile Responsive',
    type: 'login_page',
    theme: 'modern_dark',
    headerTitle: '⚡ RTRW.NET HIGH SPEED HOTSPOT',
    greetingText: 'Selamat Datang! Masukkan kode voucher untuk mulai browsing.',
    contactWa: '0851-5767-1244',
    wifiName: '@RTRW-NET-HOTSPOT',
    termsText: 'Dilarang menggunakan koneksi untuk tindakan melanggar hukum.',
    htmlContent: `<!-- HTML LOGIN PAGE MIKROTIK HOTSPOT (login.html) - SLEEK MODERN DARK -->
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Hotspot - RTRW.NET</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .login-container {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      padding: 28px 24px;
      width: 100%;
      max-width: 360px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      text-align: center;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .brand-title span { color: #10b981; }
    .tagline {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 4px;
      margin-bottom: 20px;
    }
    .input-field {
      width: 100%;
      padding: 13px 16px;
      background: #090d16;
      border: 1px solid #374151;
      border-radius: 12px;
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      letter-spacing: 1px;
      margin-bottom: 12px;
      outline: none;
      transition: border-color 0.2s;
    }
    .input-field:focus { border-color: #10b981; }
    .btn-connect {
      width: 100%;
      padding: 13px;
      background: #10b981;
      color: #090d16;
      font-weight: 800;
      font-size: 14px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-connect:hover { background: #34d399; }
    .footer-links {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #1f2937;
      font-size: 11px;
      color: #6b7280;
    }
    .footer-links a { color: #10b981; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="brand-title">RTRW<span>.NET</span></div>
    <div class="tagline">Koneksi Internet Cepat & Stabil</div>
    
    <form name="login" action="$(link-login-only)" method="post">
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="hidden" name="popup" value="true" />
      <input class="input-field" name="username" type="text" placeholder="Masukkan Kode Voucher" required />
      <input type="hidden" name="password" value="" />
      <button type="submit" class="btn-connect">HUBUNGKAN SEKARANG</button>
    </form>
    
    <div class="footer-links">
      Butuh voucher atau bantuan?<br>
      <a href="https://wa.me/6285157671244" target="_blank">Chat WhatsApp CS</a>
    </div>
  </div>
</body>
</html>`,
  },
];

export const initialVPNConfigs: VPNConfig[] = [];

export const initialRadiusServerConfig: RadiusServerConfig = {
  serverHost: '103.49.239.150',
  authPort: 1812,
  acctPort: 1813,
  coaPort: 3799,
  sharedSecret: 'Server@123',
  interimIntervalSeconds: 300,
  dictionaryType: 'MikroTik-MikroTik-Dictionary-v7',
  enableAccounting: true,
  status: 'running',
};

export const initialExpenses: Expense[] = [];

export const initialCommandQueue: import('./types').RouterCommandQueueItem[] = [];

export const initialBankRekening: BankRekening[] = [];

export const initialQRISConfig: QRISConfig = {
  merchantName: 'Masmedia Digital Network',
  nmid: '',
  qrisString: '',
  accountName: 'Masmedia Digital',
  city: '',
  postalCode: '',
  qrImageUrl: '',
};

export const initialPaymentGatewayConfig: PaymentGatewayConfig = {
  provider: 'tripay',
  environment: 'sandbox',
  merchantCode: '',
  apiKey: '',
  privateKey: '',
  callbackUrl: 'https://ais-dev-slz2gktivjl4aocduhdewy-656525506274.asia-southeast1.run.app/api/payment/callback',
  returnUrl: 'https://ais-dev-slz2gktivjl4aocduhdewy-656525506274.asia-southeast1.run.app/payment/success',
  autoConfirmPayment: true,
  activePaymentChannels: ['QRIS', 'BCAVA', 'BNIVA', 'BRIVA', 'MANDIRIVA', 'ALFAMART', 'INDOMARET'],
};

export const initialTickets: import('./types').SupportTicket[] = [];

export const initialFiberCables: import('./types').GISFiberCable[] = [];

export const initialActivityLogs: import('./types').ActivityLog[] = [];

