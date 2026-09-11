/**
 * SaaS Provider (Host Master) Complete Guide Generator
 * Generates and downloads or prints an exhaustive, end-to-end PDF handbook
 * covering VPS Setup, FreeRADIUS Installation, Database & Cloud Sync, and Customer Management.
 */

export interface SaasGuideConfig {
  vpsIp: string;
  hostname: string;
  secret: string;
  authPort: number;
  acctPort: number;
  wireguardPort: number;
  sstpPort: number;
  apiPort: number;
  location: string;
}

export function openSaasMasterPdfGuide(config: SaasGuideConfig) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup diblokir oleh browser. Harap izinkan popup untuk mengunduh PDF.');
    return;
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Buku Panduan Lengkap Host Master - SaaS VPS, FreeRADIUS, Database & Billing</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 9.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    }

    .btn-print {
      background: #2563eb;
      color: white;
      border: none;
      padding: 9px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-print:hover {
      background: #1d4ed8;
    }

    .page {
      max-width: 820px;
      margin: 0 auto;
      padding: 18px 12px;
    }

    @media print {
      .no-print-bar {
        display: none !important;
      }
      .page {
        padding: 0;
        max-width: 100%;
      }
      .page-break {
        page-break-before: always;
      }
    }

    .header-box {
      border-bottom: 2.5px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .header-title h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .header-title p {
      font-size: 9.5pt;
      color: #475569;
      font-weight: 600;
      margin-top: 3px;
    }

    .badge-master {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }

    .meta-item {
      font-size: 8.8pt;
    }
    .meta-item strong {
      color: #334155;
      display: inline-block;
      min-width: 130px;
    }
    .meta-item code {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #0f172a;
      background: #e2e8f0;
      padding: 1px 5px;
      border-radius: 4px;
    }

    h2 {
      font-size: 12pt;
      font-weight: 800;
      color: #0f172a;
      border-left: 4px solid #2563eb;
      padding-left: 8px;
      margin: 16px 0 8px 0;
    }

    h3 {
      font-size: 10pt;
      font-weight: 700;
      color: #1e293b;
      margin: 10px 0 4px 0;
    }

    p, li {
      font-size: 9pt;
      color: #334155;
      line-height: 1.5;
    }

    ul, ol {
      padding-left: 18px;
      margin: 4px 0 8px 0;
    }

    li {
      margin-bottom: 3px;
    }

    .code-box {
      background: #0f172a;
      color: #f8fafc;
      padding: 9px 12px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      line-height: 1.45;
      margin: 6px 0 10px 0;
      overflow-x: auto;
      border: 1px solid #1e293b;
    }
    .code-box .comment {
      color: #94a3b8;
    }
    .code-box .highlight {
      color: #38bdf8;
      font-weight: 700;
    }
    .code-box .val {
      color: #fbbf24;
      font-weight: 600;
    }
    .code-box .cmd {
      color: #4ade80;
      font-weight: 700;
    }

    .table-spec {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
      font-size: 8.5pt;
    }
    .table-spec th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      text-align: left;
      padding: 6px 9px;
      border: 1px solid #cbd5e1;
    }
    .table-spec td {
      padding: 6px 9px;
      border: 1px solid #e2e8f0;
    }
    .table-spec tr:nth-child(even) {
      background: #f8fafc;
    }

    .callout {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 9px 12px;
      border-radius: 0 6px 6px 0;
      margin: 8px 0;
      font-size: 8.8pt;
    }
    .callout strong {
      color: #1e40af;
    }

    .step-badge {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      font-weight: 800;
      font-size: 8.5pt;
      padding: 2px 7px;
      border-radius: 4px;
      margin-right: 6px;
    }

    .footer-note {
      margin-top: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 7.8pt;
      color: #64748b;
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <strong>Buku Panduan Lengkap Host Master (SaaS Provider)</strong>
      <span style="font-size: 11px; opacity: 0.8; margin-left: 10px;">Panduan Komprehensif: Instalasi VPS, FreeRADIUS, Database Cloud & Manajemen Pelanggan</span>
    </div>
    <button class="btn-print" onclick="window.print()">
      🖨️ Cetak / Simpan PDF (Ctrl + P)
    </button>
  </div>

  <div class="page">
    <div class="header-box">
      <div class="header-title">
        <h1>Buku Panduan Operasional Lengkap Host Master</h1>
        <p>SOP Penyedia Sewa Server Cloud, FreeRADIUS AAA, Sinkronisasi Database & Billing Pelanggan</p>
      </div>
      <div class="badge-master">Level: Host Master Provider</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>IP Server VPS:</strong> <code>${config.vpsIp}</code></div>
      <div class="meta-item"><strong>Hostname / FQDN:</strong> <code>${config.hostname}</code></div>
      <div class="meta-item"><strong>Lokasi Data Center:</strong> <span>${config.location}</span></div>
      <div class="meta-item"><strong>FreeRADIUS Secret:</strong> <code>${config.secret}</code></div>
      <div class="meta-item"><strong>Port Auth / Acct:</strong> <code>UDP ${config.authPort} / UDP ${config.acctPort}</code></div>
      <div class="meta-item"><strong>Port VPN (WG / SSTP):</strong> <code>${config.wireguardPort} (UDP) / ${config.sstpPort} (TCP)</code></div>
    </div>

    <h2>1. Arsitektur Host Master (Tanpa Router Fisik)</h2>
    <p>
      Sebagai <strong>Host Master</strong>, Anda adalah pemilik infrastruktur cloud server terpusat. Anda <strong>tidak perlu membeli router fisik MikroTik</strong>. Router-router fisik MikroTik adalah milik <strong>Mitra / Klien ISP / Pengusaha RT-RW Net</strong> yang menyewa sistem Anda.
    </p>
    <ul>
      <li><strong>Infrastruktur Anda:</strong> VPS IDCloudHost, IP Publik Statis, Server FreeRADIUS, VPN Tunnel Server (WireGuard/SSTP), Cloud Database Firestore, dan Aplikasi Web Billing Multi-Tenant.</li>
      <li><strong>Infrastruktur Mitra:</strong> Router MikroTik di lokasi masing-masing yang terhubung ke VPS Anda lewat jalur tunnel VPN privat terenkripsi.</li>
    </ul>

    <h2>2. Panduan Instalasi Paket di VPS IDCloudHost (Ubuntu / Debian)</h2>
    <p>Jalankan perintah ini di terminal SSH VPS Anda untuk menginstal seluruh paket pendukung yang diperlukan:</p>

    <div class="code-box">
<span class="comment"># 1. Update repository dan instal FreeRADIUS + WireGuard + IPTables</span>
<span class="cmd">sudo apt update && sudo apt upgrade -y</span>
<span class="cmd">sudo apt install -y</span> freeradius freeradius-utils wireguard iptables-persistent ufw

<span class="comment"># 2. Cek status FreeRADIUS</span>
<span class="cmd">sudo systemctl enable freeradius</span>
<span class="cmd">sudo systemctl start freeradius</span>
<span class="cmd">sudo systemctl status freeradius</span>
    </div>

    <h2>3. Konfigurasi FreeRADIUS Server (clients.conf & users)</h2>
    <p>FreeRADIUS perlu dikonfigurasi agar menerima koneksi dari seluruh router mitra dan membaca akun pelanggan:</p>

    <h3>A. Daftarkan Jaringan Router Mitra di <code>/etc/freeradius/3.0/clients.conf</code>:</h3>
    <div class="code-box">
<span class="cmd">sudo nano</span> /etc/freeradius/3.0/clients.conf

<span class="comment"># Tambahkan konfigurasi ini di baris paling bawah:</span>
client all_tenant_nas {
    ipaddr = <span class="val">0.0.0.0/0</span>             <span class="comment"># Izinkan seluruh router mitra yang terhubung</span>
    secret = <span class="val">${config.secret}</span>         <span class="comment"># Secret master yang sama diisikan ke MikroTik mitra</span>
    shortname = tenant-master
    require_message_authenticator = no
}
    </div>

    <h3>B. Pengujian Login Manual di <code>/etc/freeradius/3.0/users</code> (Opsional):</h3>
    <div class="code-box">
<span class="comment"># Format entri akun PPPoE di FreeRADIUS:</span>
pelanggan_test Cleartext-Password := "pass123"
    Framed-IP-Address = 10.10.10.50,
    Mikrotik-Rate-Limit = "10M/10M"
    </div>

    <h3>C. Buka Port Firewall VPS (UFW & IDCloudHost Security Group):</h3>
    <div class="code-box">
<span class="cmd">sudo ufw allow</span> <span class="val">${config.authPort}/udp</span> comment 'RADIUS Auth'
<span class="cmd">sudo ufw allow</span> <span class="val">${config.acctPort}/udp</span> comment 'RADIUS Acct'
<span class="cmd">sudo ufw allow</span> <span class="val">3799/udp</span> comment 'RADIUS CoA Disconnect'
<span class="cmd">sudo ufw allow</span> <span class="val">${config.wireguardPort}/udp</span> comment 'WireGuard VPN'
<span class="cmd">sudo ufw allow</span> <span class="val">${config.sstpPort}/tcp</span> comment 'SSTP VPN'
<span class="cmd">sudo ufw allow</span> <span class="val">14000:14100/tcp</span> comment 'Range Port Remote Winbox'
<span class="cmd">sudo ufw reload</span>
<span class="cmd">sudo systemctl restart freeradius</span>
    </div>

    <div class="page-break"></div>

    <h2>4. Manajemen Database & Sinkronisasi Cloud (Firestore + Local)</h2>
    <p>Aplikasi ini memiliki sistem ketahanan data berlapis ganda (Dual-Layer Resilience):</p>
    <ul>
      <li><strong>Google Cloud Firestore:</strong> Database cloud utama Anda (<code>ai-studio-masmedianet</code>). Setiap ada penambahan pelanggan, invoice, atau router, data otomatis tersinkronisasi ke server Google Cloud secara realtime.</li>
      <li><strong>Lapis Offline (IndexedDB & LocalStorage):</strong> Data tersimpan lokal di browser sehingga jika koneksi internet terputus, data tetap aman dan tidak akan hilang saat halaman dimuat ulang.</li>
      <li><strong>Cadangan Manual (Ekspor/Impor JSON):</strong> Anda dapat mengunduh seluruh data aplikasi menjadi file backup JSON melalui menu <em>Database & Cloud Sync</em>.</li>
    </ul>

    <h2>5. Siklus Manajemen Pelanggan (Customer Lifecycle)</h2>
    <table class="table-spec">
      <thead>
        <tr>
          <th>Tahapan</th>
          <th>Aksi di Aplikasi</th>
          <th>Dampak Otomatis di Jaringan / MikroTik</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Pendaftaran Baru</strong></td>
          <td>Menu <em>Pelanggan</em> &rarr; <em>Tambah Pelanggan</em>. Isi username, password PPPoE, dan pilih paket kecepatan.</td>
          <td>Akun terdaftar di database. Saat router mitra meminta Auth ke VPS, radius membalas <code>Access-Accept</code> dengan limit bandwidth (misal: 20M/20M).</td>
        </tr>
        <tr>
          <td><strong>2. Penerbitan Tagihan</strong></td>
          <td>Menu <em>Billing & Invoice</em> &rarr; sistem otomatis menerbitkan invoice bulanan sesuai paket.</td>
          <td>Kirim tagihan via tombol WhatsApp Gateway langsung ke nomor HP pelanggan beserta link pembayaran QRIS.</td>
        </tr>
        <tr>
          <td><strong>3. Pelanggan Membayar</strong></td>
          <td>Status tagihan berubah <em>Lunas (Paid)</em> baik melalui transfer manual atau otomatis via QRIS Payment Gateway.</td>
          <td>Masa aktif diperpanjang otomatis ke bulan berikutnya.</td>
        </tr>
        <tr>
          <td><strong>4. Jatuh Tempo & Isolir</strong></td>
          <td>Jika tanggal jatuh tempo terlewati dan belum bayar, klik <em>Isolir</em> (atau aktifkan auto-isolir).</td>
          <td>Server VPS mengirimkan sinyal <strong>CoA Disconnect (UDP 3799)</strong> ke MikroTik untuk memutus koneksi internet dan mengarahkan ke halaman isolir.</td>
        </tr>
      </tbody>
    </table>

    <h2>6. Skrip Siap Tempel untuk Router MikroTik Mitra (Klien)</h2>
    <p>Berikan skrip ini kepada mitra untuk ditempelkan di <strong>New Terminal</strong> Winbox mereka:</p>

    <div class="code-box">
<span class="comment"># 1. Sambungkan MikroTik ke Server RADIUS VPS Anda</span>
/radius
add address=<span class="val">${config.vpsIp}</span> secret=<span class="val">${config.secret}</span> service=ppp,hotspot \
    authentication-port=<span class="val">${config.authPort}</span> accounting-port=<span class="val">${config.acctPort}</span> timeout=3s comment="SaaS-Master-RADIUS"

<span class="comment"># 2. Buka port penerima sinyal pemutus isolir otomatis (CoA Disconnect)</span>
/radius incoming
set accept=yes port=3799

<span class="comment"># 3. Wajibkan PPPoE & Hotspot membaca user dari RADIUS</span>
/ppp aaa set use-radius=yes accounting=yes interim-update=5m
/ip hotspot profile set [find default=yes] use-radius=yes
    </div>

    <h2>7. Alur Bisnis SaaS: Cara Menagih Sewa ke Mitra (Auto-Billing)</h2>
    <ol>
      <li><strong>Daftarkan Mitra Baru:</strong> Masuk ke tab <em>Kelola Cabang / Tenant</em> &rarr; <em>Tambah Tenant Baru</em> &rarr; Tentukan paket (Starter, Pro ISP, Enterprise).</li>
      <li><strong>Buat Port Remote Winbox:</strong> Masuk ke tab <em>Port Forwarding & NAT</em> &rarr; Petakan port publik VPS (misal: <code>${config.vpsIp}:14015</code>) ke IP tunnel router mitra (misal: <code>10.200.0.15:8291</code>).</li>
      <li><strong>Terbitkan Invoice Tagihan Sewa:</strong> Masuk ke tab <em>Auto-Billing SaaS Mitra</em> &rarr; Klik <em>Buat Tagihan Sewa Baru</em> &rarr; Kirim invoice via WhatsApp.</li>
      <li><strong>Mitra Menunggak:</strong> Ubah status tenant mitra menjadi <em>Suspended</em> untuk memblokir sementara akses seluruh router mereka sampai sewa dilunasi.</li>
    </ol>

    <div class="footer-note">
      <div>Dokumen Resmi Pedoman Operasional Host Master • Dicetak pada ${currentDate}</div>
      <div>Sistem Cloud Multi-Tenant Masmedia Net</div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
