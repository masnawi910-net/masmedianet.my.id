import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  ShieldCheck,
  UserPlus,
  Server,
  Cloud,
  Terminal,
  Key,
  Database,
  Lock,
  Wifi,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Printer,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Download,
  Radio,
  Zap,
  FileSpreadsheet,
  FileText,
  Sliders,
  Compass,
  ArrowRight,
  Ticket,
  Shield,
  Router,
  Network,
  Cpu,
  Layers,
  Globe,
} from 'lucide-react';
import { downloadCustomerTemplateExcel, downloadCustomerTemplateCSV } from '../../utils/excelHelper';

interface GuideArticle {
  id: string;
  category: 'vpn' | 'superadmin' | 'idcloud' | 'import' | 'payment' | 'isolir' | 'whatsapp' | 'hotspot' | 'tr069' | 'backup';
  categoryLabel: string;
  badgeColor: string;
  title: string;
  summary: string;
  readingTime: string;
  content: React.ReactNode;
  tags: string[];
}

export const GuideView: React.FC = () => {
  const { setActiveTab, theme } = useApp();
  const isDark = theme === 'dark';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('mikrotik-wireguard-guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Article database
  const articles: GuideArticle[] = useMemo(
    () => [
      {
        id: 'mikrotik-wireguard-guide',
        category: 'vpn',
        categoryLabel: 'Integrasi MikroTik (VPN)',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold',
        title: 'Buku Panduan Integrasi MikroTik ke Billing via WireGuard (RouterOS v7)',
        summary: 'Panduan lengkap dan teruji A-Z mengkoneksikan MikroTik RouterOS v7 menggunakan protokol WireGuard berkecepatan tinggi, alokasi IP tunnel & remote Winbox, aktivasi RADIUS AAA, isolir otomatis, dan remote jarak jauh.',
        readingTime: '6 menit baca',
        tags: ['wireguard', 'mikrotik', 'ros v7', 'vpn remote', 'radius', 'isolir', 'winbox', 'integrasi'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* Header Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-emerald-500/10 border border-cyan-500/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    Rekomendasi Terbaik untuk RouterOS v7
                  </span>
                  <span className="text-xs text-slate-400">Latensi Paling Rendah & Throughput Maksimal</span>
                </div>
                <h4 className="font-bold text-white text-base">Integrasi WireGuard MikroTik ke Sistem Billing</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  <strong>WireGuard</strong> adalah protokol VPN generasi modern dengan enkripsi mutakhir (ChaCha20-Poly1305). WireGuard bekerja langsung di level kernel Linux / RouterOS v7, menghasilkan <strong>penggunaan CPU sangat ringan</strong> bahkan pada router entry-level seperti hEX (RB750Gr3) maupun hAP ax.
                </p>
              </div>
            </div>

            {/* Peta Alur Integrasi */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                Alur Integrasi WireGuard dari Awal Sampai Siap Digunakan:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">1.</span> Buat Akun di Menu VPN
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">2.</span> Salin Skrip MikroTik
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">3.</span> Paste di Terminal Winbox
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">4.</span> Cek Peering Handshake
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">5.</span> Hubungkan ke Radius NAS
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                  <span className="text-emerald-400 font-bold mr-1.5">6.</span> Remote Winbox & Auto-Isolir
                </div>
              </div>
            </div>

            {/* TAHAP 1 */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                Tahap 1: Buat Akun Klien WireGuard di Menu Pengaturan VPN
              </h3>
              <p className="text-xs text-slate-300">
                Aplikasi ini dilengkapi <strong>Multi-Tenant Dynamic VPN Remote Engine</strong>. Anda tidak perlu repot mengetik perintah iptables di server VPS Linux secara manual:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>
                  Buka menu samping aplikasi: <strong>2. Radius &gt; Pengaturan: VPN</strong> (atau klik tombol pintas di bawah).
                </li>
                <li>
                  Pada panel <strong>"Buat Akun Klien Dinamis"</strong> di sebelah kiri:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-400">
                    <li>Klik tombol <strong className="text-amber-300">"Auto-Fill"</strong> untuk menghasilkan nama, username, password, IP tunnel, dan port unik secara instan.</li>
                    <li><strong className="text-slate-200">Pilih Protokol:</strong> Klik tombol <strong>"WireGuard (Ros 7)"</strong>.</li>
                    <li><strong className="text-slate-200">Nomor WhatsApp Klien:</strong> (Opsional) Masukkan nomor HP teknisi/klien agar rincian akses bisa dikirim via WA sekali klik.</li>
                  </ul>
                </li>
                <li>
                  Perhatikan kotak <strong>Alokasi Dinamis Otomatis</strong>:
                  <div className="mt-1.5 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">IP Tunnel Klien</span>
                      <strong className="text-emerald-400 font-mono">10.200.0.10</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Port Remote Winbox</span>
                      <strong className="text-cyan-400 font-mono">18291</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Port Remote WebFig</span>
                      <strong className="text-purple-400 font-mono">18080</strong>
                    </div>
                  </div>
                </li>
                <li>Klik tombol hijau <strong>"Buat Akun Klien"</strong>. Data akun akan langsung tersimpan di tabel sebelah kanan.</li>
              </ol>
            </div>

            {/* TAHAP 2 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                Tahap 2: Salin & Jalankan Skrip WireGuard di Terminal MikroTik
              </h3>
              <p className="text-xs text-slate-300">
                Pada baris router klien yang baru dibuat di tabel, klik tombol <strong>"Lihat Skrip"</strong> atau gunakan template skrip siap pakai di bawah ini (ganti nilai IP/Host sesuai router Anda):
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Skrip MikroTik WireGuard (RouterOS v7):
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '# ====================================================================\n# SKRIP KONEKSI WIREGUARD MIKROTIK (ROUTEROS v7)\n# ====================================================================\n/interface wireguard remove [find name="wg-masmedia"]\n\n/interface wireguard\nadd name="wg-masmedia" listen-port=13231 mtu=1420 comment="VPN Remote Masmedia Hub"\n\n/ip address\nadd address=10.200.0.10/24 interface="wg-masmedia" network=10.200.0.0 comment="IP Tunnel VPN Masmedia"\n\n/interface wireguard peers\nadd interface="wg-masmedia" endpoint-address="103.49.239.150" endpoint-port=51820 allowed-address=10.200.0.0/24 persistent-keepalive=25s comment="Masmedia VPS WireGuard Hub"\n\n/ip service enable winbox\n/ip service set winbox port=8291\n/ip service enable api\n/ip service set api port=8728\n/ip service enable www\n/ip service set www port=80\n\n/ip firewall filter\nadd chain=input in-interface="wg-masmedia" action=accept place-before=0 comment="Allow Remote via WireGuard Masmedia"\n\n:put ">>> SUKSES! VPN WIREGUARD BERHASIL TERPASANG <<<"',
                        'guide-wg-script'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold border border-cyan-500/30 transition-all cursor-pointer"
                  >
                    {copiedKey === 'guide-wg-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'guide-wg-script' ? 'Tersalin!' : 'Salin Skrip WireGuard'}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto space-y-1">
                  <p className="text-slate-500"># 1. Tambah Interface WireGuard</p>
                  <p className="text-cyan-300">/interface wireguard</p>
                  <p className="text-white">add name="wg-masmedia" listen-port=13231 mtu=1420 comment="VPN Remote Masmedia"</p>
                  <p className="text-slate-500 mt-2"># 2. Pasang IP Tunnel Klien</p>
                  <p className="text-cyan-300">/ip address</p>
                  <p className="text-white">add address=10.200.0.10/24 interface="wg-masmedia" network=10.200.0.0</p>
                  <p className="text-slate-500 mt-2"># 3. Hubungkan ke Server VPS Billing Masmedia</p>
                  <p className="text-cyan-300">/interface wireguard peers</p>
                  <p className="text-white">add interface="wg-masmedia" endpoint-address="103.49.239.150" endpoint-port=51820 allowed-address=10.200.0.0/24 persistent-keepalive=25s</p>
                  <p className="text-slate-500 mt-2"># 4. Izinkan Firewall Filter & Buka Port API (8728) & Winbox (8291)</p>
                  <p className="text-cyan-300">/ip service enable winbox,api,www</p>
                  <p className="text-white">/ip firewall filter add chain=input in-interface="wg-masmedia" action=accept place-before=0</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                <strong className="text-amber-400">Cara Eksekusi:</strong> Buka aplikasi Winbox &gt; Klik menu <strong>New Terminal</strong> di sisi kiri &gt; Klik kanan dan pilih <strong>Paste</strong> &gt; Tekan <strong>Enter</strong>.
              </div>
            </div>

            {/* TAHAP 3 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">3</span>
                Tahap 3: Verifikasi Peering Handshake WireGuard
              </h3>
              <p className="text-xs text-slate-300">
                Untuk memastikan router telah terhubung dengan baik ke server VPS:
              </p>
              <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Di Winbox, buka menu <strong>WireGuard</strong> &gt; tab <strong>Peers</strong>.</li>
                <li>Lihat kolom <strong>Last Handshake</strong>: jika terisi waktu (contoh: <code>4s</code> atau <code>12s</code>), artinya koneksi telah berhasil dan data sedang berlalu-lalang!</li>
                <li>Uji ping dari terminal MikroTik ke gateway tunnel VPS: ketik <code>ping 10.200.0.1</code>. Hasil ping harus <strong>reply (0-2 ms)</strong>.</li>
              </ol>
            </div>

            {/* TAHAP 4 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">4</span>
                Tahap 4: Hubungkan Router ke Menu Pengaturan: Radius (NAS)
              </h3>
              <p className="text-xs text-slate-300">
                Sekarang integrasikan router MikroTik Anda ke database sistem billing agar aplikasi dapat membaca sesi pelanggan, mengisolir otomatis, dan membuat voucher:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu samping: <strong>2. Radius &gt; Pengaturan: Radius (NAS)</strong>.</li>
                <li>Klik tombol <strong>"+ Tambah Router / Server NAS"</strong>.</li>
                <li>
                  Isi formulir pendaftaran router:
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Nama Router:</span>
                      <strong className="text-white">Router Utama RW 04</strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">IP NAS / Host API:</span>
                      <strong className="text-emerald-400 font-mono">10.200.0.10</strong>
                      <span className="text-[10px] text-slate-500 block">(Gunakan IP Tunnel WireGuard Anda)</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Port API MikroTik:</span>
                      <strong className="text-cyan-400 font-mono">8728</strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Shared Secret RADIUS:</span>
                      <strong className="text-amber-400 font-mono">masmedia123</strong>
                    </div>
                  </div>
                </li>
                <li>Klik <strong>"Simpan &amp; Uji Koneksi"</strong>. Status router akan otomatis berubah menjadi <span className="text-emerald-400 font-bold">ONLINE</span>.</li>
              </ol>
            </div>

            {/* TAHAP 5 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">5</span>
                Tahap 5: Pasang Konfigurasi RADIUS Client &amp; CoA (Kick Sesi) di MikroTik
              </h3>
              <p className="text-xs text-slate-300">
                Jalankan script konfigurasi RADIUS ini di terminal MikroTik agar router menggunakan server FreeRADIUS billing untuk otentikasi PPPoE dan Hotspot:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Skrip RADIUS Client &amp; Incoming CoA:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '/radius remove [find comment="Masmedia-RTRW"]\n\n/radius\nadd service=ppp,hotspot,login address=10.200.0.1 secret="masmedia123" authentication-port=1812 accounting-port=1813 timeout=3000ms comment="Masmedia-RTRW"\n\n/ppp aaa\nset use-radius=yes accounting=yes interim-update=00:01:00\n\n/radius incoming\nset accept=yes port=3799\n\n:put ">>> Konfigurasi RADIUS AAA Masmedia Berhasil Diterapkan! <<<"',
                        'wg-radius-script'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold border border-cyan-500/30 transition-all cursor-pointer"
                  >
                    {copiedKey === 'wg-radius-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'wg-radius-script' ? 'Tersalin!' : 'Salin Skrip RADIUS'}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto space-y-1">
                  <p className="text-cyan-300">/radius add service=ppp,hotspot,login address=10.200.0.1 secret="masmedia123" authentication-port=1812 accounting-port=1813 comment="Masmedia-RTRW"</p>
                  <p className="text-cyan-300">/ppp aaa set use-radius=yes accounting=yes interim-update=00:01:00</p>
                  <p className="text-emerald-400 font-bold">/radius incoming set accept=yes port=3799</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  <em>Catatan:</em> <code>port=3799</code> adalah <strong>Packet of Disconnect (CoA)</strong> yang dipakai sistem untuk memutuskan sesi internet pelanggan saat tanggal jatuh tempo isolir tiba secara seketika.
                </p>
              </div>
            </div>

            {/* TAHAP 6 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">6</span>
                Tahap 6: Uji Coba Remote Winbox dari Jaringan Luar / HP Android
              </h3>
              <p className="text-xs text-slate-300">
                Sekarang router Anda bisa diremote dari luar kota tanpa memerlukan IP Publik di lokasi pelanggan/kantor Anda:
              </p>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Format Login Winbox:</span>
                  <span className="text-cyan-400 font-mono font-bold">IP_SERVER_VPS:PORT_WINBOX</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Contoh Connect To:</span>
                    <strong className="font-mono text-cyan-300 text-sm">103.49.239.150:18291</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Kredensial:</span>
                    <span className="text-xs text-slate-200">Username &amp; Password MikroTik lokal Anda</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Untuk WebFig (buka via Chrome/Browser): ketik <code>http://103.49.239.150:18080</code>
                </p>
              </div>
            </div>

            {/* TAHAP 7: BAGAIMANA FITUR LAIN BERFUNGSI */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">7</span>
                Bagaimana Fitur Billing Bekerja Secara Otomatis:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <Sliders className="w-4 h-4" />
                    <span>Mesin Isolir &amp; Unisolir Otomatis</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Saat pelanggan menunggak di menu <strong>Billing &gt; Isolir Otomatis</strong>, billing mengirim perintah ke IP Tunnel <code>10.200.0.10:8728</code> untuk mengganti profile PPP ke profil isolir dan memutus sesi via port 3799. Ketika pelanggan bayar via QRIS / Auto-Mutasi, profil dipulihkan seketika dalam 2 detik!
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Ticket className="w-4 h-4" />
                    <span>Voucher Hotspot Thermal &amp; Stiker</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Voucher yang di-generate di menu <strong>Radius &gt; Hotspot</strong> otomatis tersinkronisasi ke server RADIUS. Pelanggan warung login menggunakan kode voucher, dan kuota/uptime terlacak realtime.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Layers className="w-4 h-4" />
                    <span>Spooler &amp; Retry Command Queue</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Jika router MikroTik Anda sempat mati lampu atau koneksi internet terputus, perintah perubahan paket tidak akan hilang, melainkan disimpan di antrean <strong>Spooler</strong> dan dieksekusi begitu koneksi WireGuard tersambung kembali.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Router className="w-4 h-4" />
                    <span>Monitoring Sesi PPPoE Realtime</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Di menu <strong>PPP-DHCP</strong>, Anda dapat melihat seluruh pelanggan yang sedang online, durasi koneksi (*uptime*), IP yang didapat, hingga jumlah upload/download bytes.
                  </p>
                </div>
              </div>

              {/* Action Jump Buttons */}
              <div className="pt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('setting-vpn')}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Shield className="w-4 h-4" />
                  Buka Menu Pengaturan: VPN
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radius-setting')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Radio className="w-4 h-4" />
                  Buka Menu Radius (NAS)
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('isolir')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-rose-400" />
                  Pengaturan Isolir
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'mikrotik-sstp-guide',
        category: 'vpn',
        categoryLabel: 'Integrasi MikroTik (VPN)',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
        title: 'Buku Panduan Integrasi MikroTik ke Billing via SSTP (Bypass NAT / IndiHome / Starlink)',
        summary: 'Panduan lengkap menghubungkan MikroTik di balik modem ISP (CGNAT) menggunakan protokol SSTP port 443 SSL. Solusi nomor 1 bagi router tanpa IP Publik, di balik modem IndiHome, Starlink, atau Telkomsel Orbit.',
        readingTime: '5 menit baca',
        tags: ['sstp', 'mikrotik', 'cgnat', 'indihome', 'starlink', 'port 443', 'ssl', 'vpn remote', 'isolir'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* Header Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    Solusi Tembus Blokir &amp; CGNAT Terkuat
                  </span>
                  <span className="text-xs text-slate-400">Berjalan di Atas Port 443 SSL (HTTPS)</span>
                </div>
                <h4 className="font-bold text-white text-base">Integrasi SSTP MikroTik ke Sistem Billing</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  <strong>SSTP (Secure Socket Tunneling Protocol)</strong> adalah protokol VPN berbasis SSL/TLS enkripsi 2048-bit yang menggunakan <strong>TCP Port 443</strong> standar. Karena port 443 adalah port yang sama persis dengan lalu lintas web HTTPS (seperti Google / YouTube), <strong>SSTP tidak akan pernah bisa diblokir oleh provider internet sumber (seperti IndiHome, Starlink, Telkomsel Orbit, atau modem ONT bawaan)</strong>.
                </p>
              </div>
            </div>

            {/* Checklist Indikator Keunggulan SSTP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <strong className="text-emerald-400 block font-bold">1. Tembus Multi-NAT:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Berfungsi sempurna meski di balik 2-3 router tanpa perlu DMZ atau port forward di modem utama.</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <strong className="text-cyan-400 block font-bold">2. Kompatibel Ros v6 &amp; v7:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Dapat digunakan pada MikroTik versi lama (6.48+) maupun RouterOS v7 terbaru.</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <strong className="text-purple-400 block font-bold">3. Sangat Stabil:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Koneksi TCP memiliki mekanisme ACK sehingga tunnel tidak mudah putus pada koneksi nirkabel/GSM.</p>
              </div>
            </div>

            {/* TAHAP 1 */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                Tahap 1: Buat Akun SSTP di Menu Pengaturan: VPN
              </h3>
              <p className="text-xs text-slate-300">
                Langkah pertama adalah membuat akun tunnel SSTP di dalam aplikasi:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu samping: <strong>2. Radius &gt; Pengaturan: VPN</strong>.</li>
                <li>Pada formulir sebelah kiri:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-400">
                    <li>Pilih protokol <strong>"SSTP (SSL 443)"</strong>.</li>
                    <li>Isi <strong>Nama Klien / Router</strong> (contoh: <em>MikroTik-IndiHome-Posko</em>).</li>
                    <li>Masukkan <strong>Username</strong> (contoh: <code>klien_posko</code>) dan <strong>Password</strong>.</li>
                    <li>Sistem otomatis memberikan IP Tunnel (contoh: <code>10.200.0.11</code>) dan Port Remote Winbox (contoh: <code>18292</code>).</li>
                  </ul>
                </li>
                <li>Klik <strong>"Buat Akun Klien"</strong>.</li>
              </ol>
            </div>

            {/* TAHAP 2 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                Tahap 2: Pasang Skrip SSTP Client di MikroTik (RouterOS v6 / v7)
              </h3>
              <p className="text-xs text-slate-300">
                Salin skrip konfigurasi berikut dan jalankan di menu <strong>New Terminal</strong> Winbox MikroTik Anda:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Skrip SSTP Client MikroTik:
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '# ====================================================================\n# SKRIP SSTP CLIENT MIKROTIK (BYPASS BLOKIR ISP / PORT 443)\n# ====================================================================\n/interface sstp-client remove [find name~"vpn-sstp-billing|vpn-remote|vpn-masmedia"]\n\n/interface sstp-client\nadd name="vpn-sstp-billing" connect-to="103.49.239.150" user="klien_posko" \\\n    password="vpnpass123" profile=default-encryption verify-server-certificate=no \\\n    add-default-route=no disabled=no comment="VPN SSTP Remote Masmedia"\n\n/ip service enable winbox\n/ip service set winbox port=8291\n/ip service enable api\n/ip service set api port=8728\n/ip service enable www\n/ip service set www port=80\n\n/ip firewall filter\nadd chain=input in-interface="vpn-sstp-billing" action=accept place-before=0 comment="Allow Remote via SSTP Masmedia"\n\n:put ">>> VPN SSTP BERHASIL DIHUBUNGKAN! <<<"',
                        'guide-sstp-script'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    {copiedKey === 'guide-sstp-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'guide-sstp-script' ? 'Tersalin!' : 'Salin Skrip SSTP'}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto space-y-1">
                  <p className="text-slate-500"># 1. Tambahkan Interface SSTP Client</p>
                  <p className="text-emerald-300">/interface sstp-client</p>
                  <p className="text-white">add name="vpn-sstp-billing" connect-to="103.49.239.150" user="klien_posko" password="vpnpass123" profile=default-encryption verify-server-certificate=no add-default-route=no disabled=no</p>
                  <p className="text-slate-500 mt-2"># 2. Buka Akses Remote &amp; Service API</p>
                  <p className="text-emerald-300">/ip service enable winbox,api,www</p>
                  <p className="text-white">/ip firewall filter add chain=input in-interface="vpn-sstp-billing" action=accept place-before=0</p>
                </div>
              </div>
            </div>

            {/* TAHAP 3 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">3</span>
                Tahap 3: Cek Status Koneksi SSTP di Winbox
              </h3>
              <p className="text-xs text-slate-300">
                Begitu skrip dijalankan:
              </p>
              <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu <strong>Interfaces</strong> atau <strong>PPP &gt; Interface</strong> di Winbox.</li>
                <li>Lihat interface <code>vpn-sstp-billing</code>: Jika di sisi kiri muncul huruf <strong className="text-emerald-400 font-mono">R (Running)</strong>, artinya router sudah 100% tersambung ke VPS billing!</li>
                <li>Buka menu <strong>IP &gt; Addresses</strong>: Anda akan melihat IP Tunnel (contoh: <code>10.200.0.11</code>) terpasang otomatis secara dinamis.</li>
              </ol>
            </div>

            {/* TAHAP 4 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">4</span>
                Tahap 4: Daftarkan ke Menu Pengaturan: Radius (NAS)
              </h3>
              <p className="text-xs text-slate-300">
                Langkah integrasi ke database billing sama dengan protokol lainnya:
              </p>
              <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu <strong>2. Radius &gt; Pengaturan: Radius (NAS)</strong>.</li>
                <li>Klik <strong>Tambah Router</strong> &gt; Masukkan IP Address dengan IP Tunnel SSTP Anda (contoh: <code>10.200.0.11</code>).</li>
                <li>Masukkan Port API <code>8728</code> dan Shared Secret RADIUS <code>masmedia123</code>.</li>
                <li>Klik tombol <strong>"Simpan &amp; Uji Koneksi"</strong>. Indikator status akan berubah hijau (ONLINE).</li>
              </ol>
            </div>

            {/* TAHAP 5 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">5</span>
                Tahap 5: Remote Winbox &amp; Penggunaan Fitur Otomatis
              </h3>
              <p className="text-xs text-slate-300">
                Dengan SSTP yang aktif, Anda kini bisa:
              </p>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside pl-1">
                <li><strong className="text-white">Remote Winbox:</strong> Buka Winbox di PC atau smartphone &gt; Masukkan <code>103.49.239.150:18292</code> &gt; Login menggunakan user admin MikroTik lokal. Anda bisa setting router dari mana saja!</li>
                <li><strong className="text-white">Auto-Isolir Pelanggan:</strong> Sistem billing dapat mengubah profile PPP dan kick user secara instan melalui tunnel SSTP port 8728 dan CoA port 3799.</li>
                <li><strong className="text-white">Bypass FUP / Blokir ISP:</strong> Jalur remote aman dari inspeksi paket (*Deep Packet Inspection*) karena terenkripsi SSL HTTPS.</li>
              </ul>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('setting-vpn')}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Lock className="w-4 h-4" />
                  Buka Menu Pengaturan: VPN
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radius-setting')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Radio className="w-4 h-4" />
                  Buka Pengaturan Radius (NAS)
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'mikrotik-l2tp-guide',
        category: 'vpn',
        categoryLabel: 'Integrasi MikroTik (VPN)',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold',
        title: 'Buku Panduan Integrasi MikroTik ke Billing via L2TP / IPsec (Kompatibel Universal v6 & v7)',
        summary: 'Panduan integrasi standar industri menggunakan protokol L2TP client. Kompatibel penuh dengan seluruh tipe MikroTik RouterBOARD dari seri lawas RouterOS v6 hingga seri terbaru RouterOS v7.',
        readingTime: '5 menit baca',
        tags: ['l2tp', 'ipsec', 'mikrotik', 'routeros v6', 'universal', 'vpn remote', 'radius', 'winbox'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* Header Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Network className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                    Standar Universal RouterBOARD
                  </span>
                  <span className="text-xs text-slate-400">Kompatibel 100% dengan Seri RB Lama hingga Baru</span>
                </div>
                <h4 className="font-bold text-white text-base">Integrasi L2TP / IPsec MikroTik ke Billing</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  <strong>L2TP (Layer 2 Tunneling Protocol)</strong> adalah protokol tunnel paling populer di dunia jaringan MikroTik. Didukung native oleh seluruh versi RouterOS tanpa perlu instalasi paket tambahan, sangat cocok bagi Anda yang masih menggunakan perangkat seperti RB750 r2, RB941-2nD (hAP lite), RB450G, atau CCR series.
                </p>
              </div>
            </div>

            {/* TAHAP 1 */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">1</span>
                Tahap 1: Generate Akun L2TP di Menu Pengaturan: VPN
              </h3>
              <p className="text-xs text-slate-300">
                Pembuatan akun L2TP dilakukan di menu VPN aplikasi:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu: <strong>2. Radius &gt; Pengaturan: VPN</strong>.</li>
                <li>Pada form pembuatan akun, klik pilihan protokol <strong>"L2TP Ros 6/7"</strong>.</li>
                <li>Gunakan fitur <strong>"Auto-Fill"</strong> atau isi nama akun, username, dan password secara mandiri.</li>
                <li>Catat alokasi IP tunnel (misal <code>10.200.0.12</code>) dan Port Winbox remote (misal <code>18293</code>).</li>
                <li>Klik tombol <strong>"Buat Akun Klien"</strong>.</li>
              </ol>
            </div>

            {/* TAHAP 2 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">2</span>
                Tahap 2: Pasang Skrip L2TP Client di Winbox Terminal
              </h3>
              <p className="text-xs text-slate-300">
                Salin skrip konfigurasi di bawah ini dan tempelkan di <strong>New Terminal</strong> Winbox:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Skrip L2TP Client MikroTik:
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '# ====================================================================\n# SKRIP KONEKSI L2TP MIKROTIK (ROUTEROS v6 & v7)\n# ====================================================================\n/interface l2tp-client remove [find name~"vpn-l2tp-billing|vpn-remote|vpn-masmedia"]\n\n/interface l2tp-client\nadd name="vpn-l2tp-billing" connect-to="103.49.239.150" user="klien_l2tp" \\\n    password="vpnpass123" profile=default-encryption allow=mschap2,chap,pap \\\n    add-default-route=no disabled=no comment="VPN L2TP Remote Masmedia"\n\n/ip service enable winbox\n/ip service set winbox port=8291\n/ip service enable api\n/ip service set api port=8728\n/ip service enable www\n/ip service set www port=80\n\n/ip firewall filter\nadd chain=input in-interface="vpn-l2tp-billing" action=accept place-before=0 comment="Allow Remote via L2TP Masmedia"\n\n:put ">>> VPN L2TP BERHASIL DIAKTIFKAN! <<<"',
                        'guide-l2tp-script'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-xs font-bold border border-blue-500/30 transition-all cursor-pointer"
                  >
                    {copiedKey === 'guide-l2tp-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'guide-l2tp-script' ? 'Tersalin!' : 'Salin Skrip L2TP'}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto space-y-1">
                  <p className="text-slate-500"># Tambah Interface L2TP Client</p>
                  <p className="text-blue-300">/interface l2tp-client</p>
                  <p className="text-white">add name="vpn-l2tp-billing" connect-to="103.49.239.150" user="klien_l2tp" password="vpnpass123" profile=default-encryption allow=mschap2,chap,pap add-default-route=no disabled=no</p>
                  <p className="text-slate-500 mt-2"># Izinkan Akses Input Winbox &amp; API MikroTik</p>
                  <p className="text-blue-300">/ip service enable winbox,api,www</p>
                  <p className="text-white">/ip firewall filter add chain=input in-interface="vpn-l2tp-billing" action=accept place-before=0</p>
                </div>
              </div>
            </div>

            {/* TAHAP 3 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">3</span>
                Tahap 3: Verifikasi Interface &amp; Ping ke Gateway Billing
              </h3>
              <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu <strong>PPP &gt; Interface</strong> di Winbox: Pastikan interface <code>vpn-l2tp-billing</code> berstatus <strong>Connected / Running (R)</strong>.</li>
                <li>Di terminal Winbox, lakukan tes ping ke gateway VPS: <code>ping 10.200.0.1</code>. Pastikan respon <em>reply</em> tanpa packet loss.</li>
              </ol>
            </div>

            {/* TAHAP 4 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">4</span>
                Tahap 4: Daftarkan NAS di Pengaturan Radius &amp; Sinkronisasi Billing
              </h3>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu <strong>2. Radius &gt; Pengaturan: Radius (NAS)</strong>.</li>
                <li>Masukkan IP Tunnel L2TP Anda (misal <code>10.200.0.12</code>), Port API <code>8728</code>, dan Shared Secret.</li>
                <li>Simpan data router. Kini sistem billing telah terhubung dua arah dengan MikroTik Anda.</li>
                <li>
                  Gunakan seluruh fitur unggulan:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-400">
                    <li><strong>PPPoE Customer Sync:</strong> Tambah/edit rahasia PPP pelanggan otomatis sinkron ke router.</li>
                    <li><strong>Isolir Otomatis:</strong> Eksekusi isolir dan unisolir otomatis 24 jam nonstop.</li>
                    <li><strong>Remote Winbox:</strong> Buka Winbox &gt; Connect To <code>103.49.239.150:18293</code>.</li>
                  </ul>
                </li>
              </ol>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('setting-vpn')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Network className="w-4 h-4" />
                  Buka Menu Pengaturan: VPN
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radius-ppp')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Router className="w-4 h-4 text-emerald-400" />
                  Buka Menu PPPoE &amp; Sesi
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'mikrotik-matrix-guide',
        category: 'vpn',
        categoryLabel: 'Integrasi MikroTik (VPN)',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold',
        title: 'Matriks & Komparasi: WireGuard vs SSTP vs L2TP — Rekomendasi Pemilihan Jalur Tunnel ISP',
        summary: 'Tabel perbandingan teknis beban CPU, kecepatan throughput, enkripsi, kemampuan menembus modem IndiHome/Starlink, serta panduan troubleshooting bila tunnel tidak terhubung.',
        readingTime: '4 menit baca',
        tags: ['komparasi', 'wireguard', 'sstp', 'l2tp', 'matriks', 'rekomendasi', 'troubleshooting', 'mikrotik'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* Header Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                    Panduan Pengambilan Keputusan Arsitektur
                  </span>
                  <span className="text-xs text-slate-400">Pilih Jalur VPN yang Paling Tepat</span>
                </div>
                <h4 className="font-bold text-white text-base">Matriks Komparasi Protokol VPN Remote</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  Setiap jaringan ISP memiliki topologi yang berbeda-beda. Gunakan tabel komparasi berikut untuk menentukan protokol VPN mana yang paling optimal untuk router MikroTik Anda.
                </p>
              </div>
            </div>

            {/* Tabel Komparasi */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                    <th className="p-3">Parameter Evaluasi</th>
                    <th className="p-3 text-cyan-400">WireGuard</th>
                    <th className="p-3 text-emerald-400">SSTP (SSL 443)</th>
                    <th className="p-3 text-blue-400">L2TP / IPsec</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Target Versi RouterOS</td>
                    <td className="p-3 font-mono text-cyan-300">RouterOS v7+ Saja</td>
                    <td className="p-3 font-mono text-emerald-300">RouterOS v6 &amp; v7</td>
                    <td className="p-3 font-mono text-blue-300">RouterOS v6 &amp; v7</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Protokol &amp; Port Default</td>
                    <td className="p-3 font-mono text-slate-300">UDP 51820</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">TCP 443 (HTTPS)</td>
                    <td className="p-3 font-mono text-slate-300">UDP 1701 / 500 / 4500</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Beban Penggunaan CPU</td>
                    <td className="p-3 text-emerald-400 font-bold">Sangat Rendah (&lt;3%)</td>
                    <td className="p-3 text-amber-300">Sedang (~10-15%)</td>
                    <td className="p-3 text-slate-300">Rendah-Sedang (~8%)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Throughput &amp; Latensi</td>
                    <td className="p-3 text-cyan-400 font-bold">Maksimal (Gigabit Ready)</td>
                    <td className="p-3 text-slate-300">Baik (Stabil TCP)</td>
                    <td className="p-3 text-slate-300">Sangat Baik</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Tembus Modem ISP / CGNAT</td>
                    <td className="p-3 text-amber-300">Bagus (via UDP keepalive)</td>
                    <td className="p-3 text-emerald-400 font-bold">Terbaik (Anti-Blokir 100%)</td>
                    <td className="p-3 text-slate-300">Bagus (perlu NAT-T)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Rekomendasi Utama</td>
                    <td className="p-3 text-cyan-300">Router modern v7, core router, CCR, RB4011, hEX</td>
                    <td className="p-3 text-emerald-300">Di balik IndiHome, Starlink, Telkomsel Orbit, multi-NAT</td>
                    <td className="p-3 text-blue-300">Router lama ROS v6, RB750, hAP lite, compatibility mode</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rekomendasi Skenario */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Panduan Memilih Sesuai Kondisi Lapangan Anda:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3.5 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>Pilih WireGuard Jika:</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    MikroTik Anda sudah di-upgrade ke <strong>RouterOS v7</strong>, melayani banyak pelanggan PPPoE/Hotspot, dan Anda menginginkan latensi serendah mungkin tanpa membebani CPU router.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Lock className="w-4 h-4" />
                    <span>Pilih SSTP Jika:</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Sumber internet utama Anda berasal dari modem ISP rumahan (IndiHome, Biznet Home, Starlink, atau modem GSM Orbit) yang menerapkan CGNAT ketat atau memblokir port VPN biasa.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-blue-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <Network className="w-4 h-4" />
                    <span>Pilih L2TP Jika:</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Anda masih menggunakan MikroTik seri lama ber-RouterOS v6 (seperti RB750 r2, hAP lite) yang belum mendukung WireGuard namun membutuhkan tunnel stabil dan ringan.
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist Troubleshooting */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Checklist Troubleshooting Kendala Umum:
              </h4>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <strong className="text-white block">1. Peering WireGuard tidak bertambah handshake-nya:</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Pastikan server VPS IDCloudHost Anda telah membuka port <code>51820/udp</code> di firewall UFW (<code>sudo ufw allow 51820/udp</code>) dan parameter <code>persistent-keepalive=25s</code> terpasang.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <strong className="text-white block">2. Status SSTP berhenti di "terminating... - certificate failure":</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Pastikan opsi <code>verify-server-certificate=no</code> disetel pada konfigurasi <code>/interface sstp-client</code> agar MikroTik tidak menolak sertifikat self-signed.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <strong className="text-white block">3. Winbox remote tidak bisa dibuka dari luar:</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Pastikan port remote Winbox di-forward di VPS iptables (contoh port 18291 -&gt; IP Klien:8291) dan service Winbox di MikroTik tidak di-disable (<code>/ip service enable winbox</code>).
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <strong className="text-white block">4. Fitur Isolir Otomatis tidak memutuskan sesi pelanggan seketika:</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Pastikan port Incoming RADIUS / CoA telah diaktifkan di MikroTik: <code>/radius incoming set accept=yes port=3799</code>.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('setting-vpn')}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Shield className="w-4 h-4" />
                  Buka Manajemen VPN Remote Sekarang
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'pppoe-status-integration-guide',
        category: 'vpn',
        categoryLabel: 'Integrasi MikroTik (VPN)',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
        title: 'Buku Panduan Status Pelanggan PPPoE: Perbedaan Akun Terdaftar vs Sesi Dial-in Jaringan MikroTik',
        summary: 'Penjelasan lengkap alur status pelanggan: mengapa user baru berstatus offline saat belum ada router yang terhubung, perbedaan status akun billing vs sesi dial-in live, dan cara menghubungkan router MikroTik agar user otomatis online.',
        readingTime: '4 menit baca',
        tags: ['pppoe', 'status', 'online', 'offline', 'mikrotik', 'dial-in', 'secret', 'radius', 'troubleshooting'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* Header Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-emerald-500/10 border border-amber-500/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                    Konsep & Logika Jaringan
                  </span>
                  <span className="text-xs text-slate-400">Transparansi Real-Time Tanpa Data Palsu</span>
                </div>
                <h4 className="font-bold text-white text-base">Memahami Alur Status Pelanggan PPPoE & MikroTik</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  Pada aplikasi billing ISP profesional, status pelanggan terbagi menjadi dua lapisan independen: <strong>Status Akun Billing (Database)</strong> dan <strong>Status Sesi Jaringan (MikroTik Live)</strong>. Mengetahui perbedaan ini sangat penting saat Anda baru menambahkan pelanggan sebelum router fisik terpasang di lapangan.
                </p>
              </div>
            </div>

            {/* Perbandingan 2 Lapisan Status */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                Dua Lapisan Status di Sistem: Billing vs Jaringan Real-Time
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">1. Status Akun Billing (Database)</h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Menunjukkan hak akses pelanggan berdasarkan pembayaran tagihan bulanan:
                  </p>
                  <ul className="text-xs space-y-1.5 text-slate-400 list-disc list-inside">
                    <li><strong className="text-slate-200">Akun Terdaftar / Langganan Aktif:</strong> Pelanggan sudah terdaftar di sistem, paket internet dipilih, kredensial username & password siap digunakan.</li>
                    <li><strong className="text-rose-400">Terisolir:</strong> Akun dinonaktifkan sementara karena melewati tanggal jatuh tempo pembayaran.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider">2. Status Sesi Jaringan (MikroTik Live)</h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Menunjukkan kondisi fisik koneksi kabel, modem, dan router MikroTik:
                  </p>
                  <ul className="text-xs space-y-1.5 text-slate-400 list-disc list-inside">
                    <li><strong className="text-emerald-400">Online (Dial-in):</strong> Router MikroTik online DAN modem ONT pelanggan aktif melakukan dial-in PPPoE dengan uptime & bandwidth live.</li>
                    <li><strong className="text-rose-400">Offline (Router Belum Konek):</strong> Router fisik MikroTik belum terhubung ke sistem via VPN/skrip.</li>
                    <li><strong className="text-slate-400">Offline (Modem Belum Konek):</strong> Router MikroTik sudah terhubung, namun modem pelanggan di rumah mati atau kabel fiber optik belum terpasang.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tanya Jawab Inti */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Pertanyaan Umum: "Kenapa User Baru Ditambahkan Masih Berstatus Offline?"
              </h4>
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>
                  Ketika Anda menambahkan pelanggan baru di menu <strong>PPP-DHCP &gt; User PPPoE</strong> atau <strong>Data Pelanggan</strong>, akun tersebut berstatus <strong>"Akun Terdaftar"</strong> di database billing, tetapi status jaringannya adalah <strong>"Offline (Router Belum Konek)"</strong>.
                </p>
                <p className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/60 text-slate-200">
                  <strong className="text-emerald-400">Ini adalah perilaku yang benar dan akurat.</strong> Sistem kami tidak memalsukan status online. Selama router fisik MikroTik Anda belum terhubung via skrip VPN (WireGuard, SSTP, atau L2TP) atau belum ada modem yang melakukan dial-in, sistem akan jujur menampilkan bahwa sesi jaringan masih offline.
                </p>
              </div>
            </div>

            {/* Langkah Integrasi */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                Langkah Mengubah Status Pelanggan Menjadi "Online (Dial-in)"
              </h3>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-white">Hubungkan Router MikroTik:</strong>
                    <p className="text-slate-400 mt-0.5">
                      Buka menu <strong>Buku Panduan &amp; SOP &gt; Integrasi MikroTik (VPN)</strong>. Pilih protokol yang sesuai dengan perangkat Anda (<strong>WireGuard</strong> untuk ROS v7, <strong>SSTP</strong> untuk menembus modem ISP IndiHome/Starlink, atau <strong>L2TP</strong> untuk universal ROS v6/v7). Salin skrip dan paste di New Terminal Winbox.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-white">Verifikasi Status Router NAS:</strong>
                    <p className="text-slate-400 mt-0.5">
                      Buka menu <strong>Radius &gt; Pengaturan: Radius (NAS)</strong> atau <strong>MikroTik &gt; Daftar Router</strong>. Pastikan status router Anda menunjukkan badge hijau <span className="text-emerald-400 font-bold">ONLINE</span>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-white">Setting PPPoE Client di Modem ONT Pelanggan:</strong>
                    <p className="text-slate-400 mt-0.5">
                      Masukkan username dan password yang Anda buat ke menu WAN PPPoE modem pelanggan (ZTE F609/F670L, Huawei HG8245, Fiberhome, dll). Saat modem menekan dial-in dan terkoneksi ke port router MikroTik, status di tabel seketika berubah menjadi <span className="text-emerald-300 font-bold">🟢 Online (Dial-in)</span> lengkap dengan IP dinamis dan grafik kecepatan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedArticleId('mikrotik-wireguard-guide')}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Shield className="w-4 h-4" />
                  Buka Panduan WireGuard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedArticleId('mikrotik-sstp-guide')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Lock className="w-4 h-4" />
                  Buka Panduan SSTP
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedArticleId('mikrotik-l2tp-guide')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Network className="w-4 h-4" />
                  Buka Panduan L2TP
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radius-ppp')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Router className="w-4 h-4 text-emerald-400" />
                  Buka Menu PPP-DHCP
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'superadmin-guide',
        category: 'superadmin',
        categoryLabel: 'Super Admin & Akun',
        badgeColor: 'bg-blue-500/20 text-white border-blue-500/30',
        title: 'Buku Panduan Super Admin: Manajemen Akun & Hak Akses (RBAC)',
        summary: 'Panduan lengkap wewenang Super Admin, pembagian role kasir/teknisi, dan langkah pembuatan akun tim.',
        readingTime: '4 menit baca',
        tags: ['superadmin', 'akun', 'role', 'rbac', 'kasir', 'teknisi', 'hak akses'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Prinsip Role-Based Access Control (RBAC)</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Sebagai Super Admin, Anda memegang hak istimewa tertinggi. Jangan membagikan akun Super Admin kepada staf kasir atau teknisi lapangan. Buatkan akun terpisah sesuai tugas masing-masing agar aman dan setiap aktivitas tercatat rapi di <strong>Audit Trail</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">1</span>
                Tingkatan Role & Rekomendasi Wewenang
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> Super Admin
                    </span>
                    <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-mono">Role: superadmin</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Pemilik ISP / Direktur Utama. Berwenang mengelola semua cabang (tenant), menambah/menghapus akun admin lain, konfigurasi SMTP email, upgrade kuota SaaS, dan restore database sistem.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" /> Admin NOC / Router
                    </span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">Role: admin</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Kepala teknis jaringan. Berwenang konfigurasi Router NAS MikroTik, paket internet bandwidth, secret PPPoE, monitoring traffic, dan penanganan tiket gangguan.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" /> Kasir / Finance
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">Role: kasir</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Staf loket kasir / penagihan. Hanya berwenang menerima pembayaran, mencetak struk/invoice thermal, validasi bukti transfer manual, dan melihat laporan harian kasir. <em>(Tidak bisa mengakses router).</em>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5" /> Teknisi Lapangan
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-white px-2 py-0.5 rounded font-mono">Role: teknisi</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Staf penarikan kabel & pasang baru. Memiliki akses ke Peta GIS ODP/Kabel FO, status redaman OLT, dan restart modem pelanggan via TR-069 GenieACS.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">2</span>
                Langkah-Langkah Membuat Akun Baru
              </h3>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu samping <strong>Dashboard &gt; Account Admin</strong> atau langsung tab <strong>Manajemen Akun Pengguna</strong>.</li>
                <li>Klik tombol hijau <strong>"Tambah Akun Pengguna"</strong> di pojok kanan atas.</li>
                <li>
                  Isi formulir:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">Nama Lengkap:</strong> Nama personil (contoh: <em>Hendra - Kasir Loket Barat</em>).</li>
                    <li><strong className="text-slate-200">Username / Email:</strong> Kredensial login (contoh: <em>hendra@masmedia.net</em>).</li>
                    <li><strong className="text-slate-200">Nomor WhatsApp:</strong> Format <em>62812...</em> untuk reset password dan verifikasi.</li>
                    <li><strong className="text-slate-200">Password:</strong> Minimal 6 karakter aman.</li>
                    <li><strong className="text-slate-200">Peran:</strong> Pilih role sesuai wewenang.</li>
                    <li><strong className="text-slate-200">Hak Akses Modul:</strong> Centang modul yang diperbolehkan.</li>
                  </ul>
                </li>
                <li>Klik <strong>"Simpan Akun"</strong>. Kredensial langsung aktif dan siap digunakan.</li>
              </ol>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <UserPlus className="w-4 h-4" />
                  Buka Menu Account Admin Sekarang
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'idcloud-complete-master-guide',
        category: 'idcloud',
        categoryLabel: 'ID Cloud & Server VPS',
        badgeColor: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/40 font-bold',
        title: 'Buku Panduan Lengkap: Pembuatan Akun ID Cloud, Instalasi Server VPS & Integrasi ke Billing (A-Z Siap Pakai)',
        summary: 'Panduan tunggal dan berurutan dari langkah 1 awal pendaftaran IDCloudHost, top-up saldo QRIS, deploy Cloud VPS, buka port firewall, hingga terintegrasi ke aplikasi billing dan 100% siap digunakan.',
        readingTime: '7 menit baca',
        tags: ['id cloud', 'idcloudhost', 'vps', 'instalasi', 'ubuntu', 'firewall', 'ssh', 'cloud server', 'integrasi', 'siap pakai'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* Header Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 flex items-start gap-4">
              <Cloud className="w-7 h-7 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    Panduan Resmi Super Admin
                  </span>
                  <span className="text-xs text-slate-400">Tahapan Terurut 1 s/d 9 Lengkap</span>
                </div>
                <h4 className="font-bold text-white text-base">Buku Panduan ID Cloud & Server Pusat ISP</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  Panduan ini disusun secara berurutan tanpa ada langkah yang terlewati, dirancang khusus untuk Anda sebagai <strong>Penyedia Aplikasi / Super Admin</strong> agar server ID Cloud (IDCloudHost) Anda berdiri kokoh, memiliki IP Publik Statis Dedicated, dan terhubung 100% ke aplikasi billing ini untuk operasional 24 jam nonstop.
                </p>
              </div>
            </div>

            {/* Checklist Indikator Tahapan */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                Peta Alur 9 Langkah Praktis (Dari Awal Sampai Siap Pakai):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">1.</span> Daftar Akun Baru
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">2.</span> Verifikasi Profil
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">3.</span> Top-Up Saldo QRIS/VA
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">4.</span> Deploy Mesin Cloud VPS
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">5.</span> Catat IP Publik Statis
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">6.</span> Login Perdana SSH
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">7.</span> Buka Port Firewall (UFW)
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold mr-1.5">8.</span> Integrasi ke Billing
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-white font-bold">
                  <span className="text-blue-400 font-bold mr-1.5">9.</span> Siap Digunakan 100%
                </div>
              </div>
            </div>

            {/* LANGKAH 1 */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                Langkah 1: Pendaftaran Akun Baru di IDCloudHost
              </h3>
              <p className="text-xs text-slate-300">
                <strong>IDCloudHost</strong> adalah penyedia cloud provider lokal Indonesia yang berlokasi di data center Cyber / DCI Jakarta dengan latensi 1-5 ms ke OpenIXP/IIX:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>
                  Buka browser Anda dan kunjungi halaman registrasi konsol resmi:
                  <div className="mt-1 p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-cyan-300 font-bold">https://console.idcloudhost.com</span>
                    <a
                      href="https://console.idcloudhost.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-[11px] font-bold inline-flex items-center gap-1 border border-cyan-500/30"
                    >
                      Buka Web <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </li>
                <li>
                  Klik tombol <strong>"Daftar" / "Sign Up"</strong>, lalu isi formulir pendaftaran:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-400">
                    <li><strong>Nama Lengkap:</strong> Nama Super Admin / Pemilik Usaha.</li>
                    <li><strong>Email:</strong> Masukkan email aktif (contoh: <code>noc@masmedia.net</code> atau akun Gmail Anda).</li>
                    <li><strong>Nomor Handphone / WhatsApp:</strong> Format diawali <code>08...</code> atau <code>628...</code> untuk verifikasi OTP.</li>
                    <li><strong>Password Akun:</strong> Buat kata sandi minimal 8 karakter kombinasi huruf besar, huruf kecil, angka, dan simbol.</li>
                  </ul>
                </li>
                <li>Klik tombol <strong>"Daftar Sekarang"</strong>.</li>
                <li>Buka kotak masuk email Anda, cari pesan dari IDCloudHost, lalu klik tombol <strong>"Verifikasi Email Saya"</strong>.</li>
                <li>Masukkan 6 digit kode OTP yang masuk ke WhatsApp atau SMS Anda. Akun IDCloudHost Anda kini resmi aktif!</li>
              </ol>
            </div>

            {/* LANGKAH 2 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                Langkah 2: Verifikasi Profil Akun & Pengaturan Keamanan
              </h3>
              <p className="text-xs text-slate-300">
                Setelah masuk ke dashboard konsol IDCloudHost:
              </p>
              <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Klik menu <strong>Profil Akun</strong> di pojok kanan atas.</li>
                <li>Isi nama perusahaan/ISP Anda (contoh: <em>PT Masmedia Net Nusantara</em>) dan alamat domisili operasional.</li>
                <li>
                  <strong>Keamanan Tambahan (Sangat Disarankan):</strong> Aktifkan fitur <strong>Two-Factor Authentication (2FA)</strong> menggunakan aplikasi Google Authenticator di smartphone Anda agar akun cloud Anda tidak bisa dibajak pihak luar.
                </li>
              </ol>
            </div>

            {/* LANGKAH 3 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">3</span>
                Langkah 3: Pengisian Saldo Billing Awal (Top-Up Balance via QRIS / VA)
              </h3>
              <p className="text-xs text-slate-300">
                IDCloudHost menggunakan sistem <strong>Pay-As-You-Go</strong>, di mana biaya server dipotong otomatis per jam dari saldo deposit Anda (sangat hemat, Anda tidak ditagih di belakang):
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Pada bilah menu sebelah kiri, klik menu <strong>Billing</strong>, lalu pilih <strong>Top Up Balance / Deposit</strong>.</li>
                <li>
                  Masukkan nominal pengisian awal:
                  <div className="mt-1 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                    Rekomendasi: <strong>Rp 50.000 s/d Rp 100.000</strong> <em>(Cukup untuk operasional server selama 1 hingga 2 bulan penuh)</em>.
                  </div>
                </li>
                <li>
                  Pilih metode pembayaran:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-400">
                    <li><strong>QRIS (Paling Cepat):</strong> Bisa scan menggunakan BCA Mobile, Livin by Mandiri, BRImo, BNI, GoPay, OVO, DANA, atau ShopeePay. Saldo masuk otomatis dalam 10 detik!</li>
                    <li><strong>Virtual Account:</strong> Transfer via VA BCA, Mandiri, BRI, BNI, atau Permata.</li>
                  </ul>
                </li>
                <li>Selesaikan pembayaran. Periksa saldo di pojok kanan atas dashboard IDCloudHost Anda, saldo akan langsung terisi.</li>
              </ol>
            </div>

            {/* LANGKAH 4 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">4</span>
                Langkah 4: Deploy / Pembuatan Mesin Server Cloud VPS Baru
              </h3>
              <p className="text-xs text-slate-300">
                Setelah saldo terisi, sekarang buat mesin virtual server (VPS Cloud) Anda:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Klik tombol biru <strong>"+ New"</strong> di sudut kanan atas konsol, lalu pilih <strong>Virtual Machine</strong>.</li>
                <li>
                  Atur konfigurasi spesifikasi server sebagai berikut:
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-500 block text-[10px]">1. LOKASI DATA CENTER:</span>
                      <strong className="text-cyan-400 text-xs">Indonesia (Jakarta - ID01 Cyber / DCI)</strong>
                      <p className="text-slate-400 text-[11px]">Memberikan latensi paling rendah ke seluruh provider di Indonesia.</p>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-500 block text-[10px]">2. SISTEM OPERASI (OS):</span>
                      <strong className="text-blue-400 text-xs">Ubuntu 22.04 LTS (x86_64)</strong>
                      <p className="text-slate-400 text-[11px]">Sistem operasi Linux standar industri yang paling stabil dan kompatibel.</p>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-500 block text-[10px]">3. SPESIFIKASI PAKET RESOURCE:</span>
                      <strong className="text-white text-xs">Pilih: 1 vCPU dan 2 GB RAM (20 GB SSD)</strong>
                      <p className="text-slate-400 text-[11px]">
                        <em>Catatan:</em> Jika paket 1 GB RAM berstatus <strong>"Out of Stock" (Habis)</strong> atau tidak muncul, <strong>PILIH LANGSUNG PAKET 1 vCPU / 2 GB RAM</strong>. Ini adalah ukuran standar resmi Ubuntu 22.04 agar server tidak kehabisan memori. Biayanya tetap sangat hemat (~Rp 70.000 - Rp 80.000/bln atau ~Rp 100/jam).
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-500 block text-[10px]">4. METODE AUTENTIKASI:</span>
                      <strong className="text-amber-400 text-xs">Password</strong>
                      <p className="text-slate-400 text-[11px]">Buat password root yang aman (misal: <code>MasmediaCloud2026!#</code>). Catat password ini!</p>
                    </div>
                  </div>
                </li>
                <li>
                  <strong>Public IP IPv4:</strong> Pastikan opsi IP Publik tercentang (IDCloudHost otomatis memberikan 1 buah IP Publik Statis Dedicated).
                </li>
                <li>
                  <strong>Hostname:</strong> Isi nama server Anda, contoh: <code>vps-billing-masmedia</code>.
                </li>
                <li>Klik tombol <strong>"Create Virtual Machine"</strong> di bagian bawah.</li>
                <li>Tunggu 1 hingga 2 menit saat sistem IDCloudHost menyiapkan server Anda.</li>
              </ol>

              {/* Tips Callout Jika 1 GB RAM Tidak Tersedia */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Kenapa Paket 1 vCPU & 1 GB RAM Tidak Tersedia / Out of Stock?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>1. Kuota Node Habis (Out of Stock):</strong> Paket 1 GB RAM adalah paket paling murah sehingga paling cepat habis di data center ID01 Jakarta.
                  <br />
                  <strong>2. Rekomendasi Resmi Ubuntu:</strong> Sistem operasi Ubuntu 22.04 LTS membutuhkan minimal <strong>2 GB RAM</strong> agar service database, billing, dan FreeRADIUS dapat berjalan lancar tanpa mengalami <em>Out-of-Memory (OOM crash)</em>.
                  <br />
                  <strong className="text-blue-400">Solusi:</strong> Langsung pilih paket <strong>1 vCPU dan 2 GB RAM</strong> (biaya hanya ~Rp 70.000 - Rp 80.000/bulan atau ~Rp 100/jam). Kapasitas ini jauh lebih stabil, responsif, dan sanggup menampung ribuan user PPPoE/Hotspot.
                </p>
              </div>
            </div>

            {/* LANGKAH 5 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">5</span>
                Langkah 5: Mendapatkan IP Publik Statis Dedicated & Verifikasi Status Server
              </h3>
              <p className="text-xs text-slate-300">
                Setelah proses deploy selesai:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>
                  Status mesin Virtual Machine Anda akan berubah menjadi <span className="px-2 py-0.5 rounded bg-blue-500/20 text-white font-bold border border-blue-500/30">RUNNING (Hijau)</span>.
                </li>
                <li>Klik pada nama mesin virtual Anda untuk membuka halaman detail.</li>
                <li>
                  Cari informasi <strong>Public IPv4 Address</strong>.
                  <div className="mt-1.5 p-3 bg-slate-950 rounded-xl font-mono text-cyan-300 font-bold text-sm border border-slate-800 flex items-center justify-between">
                    <span>Contoh IP Publik: 103.187.145.22</span>
                    <span className="text-slate-500 font-sans text-xs">Catat IP Publik server Anda!</span>
                  </div>
                </li>
                <li>IP Publik ini bersifat statis (permanen) dan merupakan alamat rumah server Anda di internet global.</li>
              </ol>
            </div>

            {/* LANGKAH 6 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">6</span>
                Langkah 6: Login Perdana ke Server VPS via Terminal SSH / PuTTY
              </h3>
              <p className="text-xs text-slate-300">
                Hubungkan komputer Anda ke server cloud menggunakan protokol SSH:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>
                  Buka aplikasi terminal di laptop / PC Anda:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-400">
                    <li>Pengguna Windows: Buka aplikasi <strong>PowerShell</strong> atau <strong>PuTTY</strong>.</li>
                    <li>Pengguna MacOS / Linux: Buka aplikasi <strong>Terminal</strong>.</li>
                  </ul>
                </li>
                <li>
                  Ketik perintah SSH berikut (ganti IP dengan IP Publik server Anda dari Langkah 5):
                  <div className="mt-1.5 p-3 bg-slate-950 rounded-xl font-mono text-xs text-cyan-300 border border-slate-800">
                    ssh root@IP_PUBLIK_VPS_ANDA
                  </div>
                </li>
                <li>
                  Jika muncul pertanyaan: <code>Are you sure you want to continue connecting (yes/no/[fingerprint])?</code>, ketik <strong>yes</strong> lalu tekan <strong>Enter</strong>.
                </li>
                <li>
                  Masukkan password `root` yang Anda buat pada Langkah 4 lalu tekan <strong>Enter</strong> <em>(Catatan: karakter password di terminal Linux sengaja tidak ditampilkan saat diketik demi keamanan, ketik saja dengan benar)</em>.
                </li>
                <li>Selamat! Anda kini berada di dalam sistem server Linux IDCloudHost Anda.</li>
              </ol>
            </div>

            {/* LANGKAH 7 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-black">7</span>
                Langkah 7: Update Sistem & Buka Port Firewall Cloud (UFW)
              </h3>
              <p className="text-xs text-slate-300">
                Jalankan script satu-klik ini langsung di terminal server VPS Anda untuk memperbarui sistem dan membuka seluruh port yang dibutuhkan aplikasi billing, FreeRADIUS, dan Cloud VPN:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Script Konfigurasi Firewall & Paket Lengkap:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '# 1. Update OS Linux Ubuntu\nsudo apt update && sudo apt upgrade -y\n\n# 2. Buka Port Web, API & Cloud VPN Server\nsudo ufw allow 22/tcp\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw allow 3000/tcp\nsudo ufw allow 8728/tcp\nsudo ufw allow 1812:1813/udp\nsudo ufw allow 4443/tcp\nsudo ufw allow 1194/udp\nsudo ufw allow 10000:20000/tcp\nsudo ufw enable',
                        'master-vps-firewall-script'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold border border-cyan-500/30 transition-all cursor-pointer"
                  >
                    {copiedKey === 'master-vps-firewall-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'master-vps-firewall-script' ? 'Tersalin!' : 'Salin Script Lengkap'}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto space-y-1">
                  <p className="text-slate-500"># Jalankan perintah berikut di terminal SSH VPS Anda:</p>
                  <p className="text-cyan-300">sudo apt update && sudo apt upgrade -y</p>
                  <p className="text-cyan-300">sudo ufw allow 22,80,443,3000,8728/tcp</p>
                  <p className="text-cyan-300">sudo ufw allow 1812:1813/udp</p>
                  <p className="text-cyan-300">sudo ufw allow 4443/tcp</p>
                  <p className="text-white">sudo ufw allow 10000:20000/tcp</p>
                  <p className="text-white">sudo ufw enable</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-cyan-400 font-bold block">Port 80, 443, 3000:</span>
                    <p className="text-slate-400 text-[11px]">Akses Web Panel Billing & Dashboard.</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-white font-bold block">Port 1812 & 1813 (UDP):</span>
                    <p className="text-slate-400 text-[11px]">FreeRADIUS Authentication & Accounting PPPoE.</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-amber-400 font-bold block">Port 8728 (TCP):</span>
                    <p className="text-slate-400 text-[11px]">API RouterOS MikroTik untuk isolir otomatis.</p>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <span className="text-purple-400 font-bold block">Port 10000 - 20000 (TCP):</span>
                    <p className="text-slate-400 text-[11px]">Port forwarding otomatis untuk remote Winbox klien.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* LANGKAH 8 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-black">8</span>
                Langkah 8: Integrasi ke Aplikasi Billing Masmedia Net
              </h3>
              <p className="text-xs text-slate-300">
                Sekarang hubungkan server ID Cloud Anda ke dalam aplikasi ini:
              </p>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka bilah menu sebelah kiri aplikasi ini, lalu pilih <strong>Radius &gt; Pengaturan: Radius (NAS)</strong> atau menu <strong>VPS Master Hub</strong>.</li>
                <li>Klik tombol <strong>"Tambah Router / Server"</strong> atau edit server utama Anda.</li>
                <li>
                  Isi formulir konfigurasi:
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Nama Server:</span>
                      <strong className="text-white">Server Pusat IDCloudHost Jakarta</strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">IP Address / Host Server:</span>
                      <strong className="text-cyan-400 font-mono">103.187.145.22</strong>
                      <span className="text-slate-500 text-[10px] block">(Masukkan IP Publik dari Langkah 5)</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Port API MikroTik:</span>
                      <strong className="text-white font-mono">8728</strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                      <span className="text-slate-400 text-[10px] block">Shared Secret RADIUS:</span>
                      <strong className="text-white font-mono">masmedia123</strong>
                    </div>
                  </div>
                </li>
                <li>Klik tombol <strong>"Simpan &amp; Uji Koneksi"</strong>.</li>
              </ol>
            </div>

            {/* LANGKAH 9 */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">9</span>
                Langkah 9: Verifikasi Pengujian &amp; Server ID Cloud Siap Digunakan 100%
              </h3>
              <p className="text-xs text-slate-300">
                Periksa hasil integrasi pada aplikasi:
              </p>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>SELAMAT! SERVER ID CLOUD ANDA TELAH 100% SIAP DIGUNAKAN</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lampu indikator server kini berwarna <strong>ONLINE (Hijau)</strong> dengan latensi stabil. Server ID Cloud Anda kini siap menjalankan:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                  <li><strong>Layanan Billing 24 Jam Nonstop:</strong> Sistem tetap aktif meskipun komputer kantor Anda dimatikan.</li>
                  <li><strong>FreeRADIUS Server Terpusat:</strong> Menangani login PPPoE dan Hotspot pelanggan ISP secara instan.</li>
                  <li><strong>Isolir &amp; Unisolir Otomatis:</strong> Pelanggan yang menunggak otomatis terisolir, dan unisolir seketika setelah bayar.</li>
                  <li><strong>Cloud VPN Master Hub:</strong> Menghubungkan router-router klien tanpa perlu klien menyewa IP Publik mahal.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('vps-master-hub')}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Server className="w-4 h-4" />
                  Buka Menu VPS Master Hub
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radius-setting')}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <Radio className="w-4 h-4" />
                  Buka Pengaturan Router &amp; NAS
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'import-pppoe-bulk',
        category: 'import',
        categoryLabel: 'Impor Pelanggan PPPoE',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        title: 'Panduan Impor Pelanggan PPPoE Massal (>47 Hingga Ribuan Akun)',
        summary: 'Format kolom CSV/Excel, cara unduh template resmi, dan teknik impor ratusan data akun dalam sekali klik.',
        readingTime: '3 menit baca',
        tags: ['impor', 'pppoe', 'csv', 'excel', 'bulk import', 'template', 'pelanggan'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Kapasitas Impor Tanpa Batas</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Sistem ini <strong>sama sekali tidak dibatasi hanya 47 akun</strong>. Anda bisa mengimpor <strong>100, 500, 1.000, hingga 5.000+ pelanggan sekaligus</strong> dalam satu file Excel (.xlsx) atau file teks CSV dengan pemisah titik koma (<code>;</code>).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">1</span>
                Struktur Kolom Wajib (10 Kolom)
              </h3>
              <p className="text-xs text-slate-300">
                Urutan header kolom harus persis sesuai format berikut:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-amber-300 border border-slate-800 overflow-x-auto">
                no;user;password;profile;nas;service;ip;name;phone;address
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] mt-2">
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">no</strong> Nomor urut (1, 2, 3...)
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">user</strong> Username PPPoE
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">password</strong> Password PPPoE
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">profile</strong> Profil paket (cth: 5MB)
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">nas</strong> Nama router MikroTik
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">service</strong> Jenis layanan (pppoe)
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">ip</strong> IP Remote pelanggan
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">name</strong> Nama lengkap pelanggan
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">phone</strong> No WhatsApp (628...)
                </div>
                <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <strong className="text-white block">address</strong> Alamat rumah/blok
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">2</span>
                Unduh Template Resmi (.XLSX & .CSV)
              </h3>
              <p className="text-xs text-slate-300">
                Gunakan template resmi ini untuk menghindari kesalahan nama kolom atau salah format:
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={downloadCustomerTemplateExcel}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Unduh Template Excel (.XLSX)
                </button>
                <button
                  type="button"
                  onClick={downloadCustomerTemplateCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  Unduh Template CSV (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radius-ppp')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Download className="w-4 h-4" />
                  Buka Menu Impor di PPPoE
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'auto-mutasi-bank',
        category: 'payment',
        categoryLabel: 'Pembayaran & Auto-Mutasi',
        badgeColor: 'bg-blue-500/20 text-white border-blue-500/30',
        title: 'Panduan Auto-Mutasi Bank: Waktu Verifikasi & Keamanan Rekening',
        summary: 'Penjelasan cara kerja auto mutasi bank (Moota / Cekmutasi), respon verifikasi 1-5 menit, dan garansi keamanan tanpa hak transfer keluar.',
        readingTime: '3 menit baca',
        tags: ['auto mutasi', 'bank', 'moota', 'cekmutasi', 'bca', 'bri', 'mandiri', 'qris', 'keamanan', 'verifikasi'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
              <Zap className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Pembayaran Otomatis Paling Hemat Biaya</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Sistem Auto-Mutasi Bank menggunakan <strong>Kode Unik 3 Digit</strong> di ujung nominal tagihan (contoh: Rp 150.128). Ketika pelanggan mentransfer jumlah yang tepat, mutasi bank terdeteksi otomatis dan internet pelanggan langsung aktif seketika tanpa perlu kirim struk WhatsApp manual!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">1</span>
                Berapa Lama Waktu yang Dibutuhkan untuk Verifikasi?
              </h3>
              <p className="text-xs text-slate-300">
                Rata-rata waktu verifikasi berkisar antara <strong>1 hingga 5 menit</strong> setelah pelanggan berhasil mentransfer:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside pl-1">
                <li>Layanan auto-mutasi (seperti Moota, Cekmutasi, atau iPaymu) menjalankan pengecekan (*scraping/API cron*) mutasi rekening setiap 1 - 3 menit sekali.</li>
                <li>Begitu dana masuk tercatat di mutasi bank Anda dengan nominal yang persis, sistem auto-mutasi mengirimkan data melalui <strong>Webhook</strong> ke billing Anda.</li>
                <li>Status invoice pelanggan langsung berubah menjadi <span className="text-white font-bold">LUNAS</span>, isolir otomatis terbuka dalam 2 detik, dan notifikasi terima kasih terkirim ke WhatsApp pelanggan.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">2</span>
                Apakah Aman Jika Akun Bank Dimasukkan ke Sistem Auto-Mutasi?
              </h3>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sangat Aman Karena Bersifat Read-Only (Hanya Membaca Mutasi)</span>
                </div>
                <p className="text-slate-300">
                  Berikut alasan teknis mengapa auto-mutasi aman bagi rekening Anda:
                </p>
                <ol className="space-y-1.5 list-decimal list-inside pl-1 text-slate-400">
                  <li><strong className="text-slate-200">Tidak Bisa Transfer Keluar:</strong> Perbankan di Indonesia mewajibkan 2FA dinamis (seperti <em>KeyBCA / Token Fisik / SMS OTP / PIN Transaksi</em>) untuk setiap pengiriman uang keluar. Sistem auto-mutasi <strong>tidak pernah meminta dan tidak memiliki token tersebut</strong>.</li>
                  <li><strong className="text-slate-200">Hak Akses Inquiry Saja:</strong> Kredensial internet banking hanya digunakan untuk membaca halaman daftar transaksi masuk (*inquiry history*).</li>
                  <li><strong className="text-slate-200">Tips Praktis dari Kami:</strong> Gunakan rekening bank khusus operasional penampung pembayaran pelanggan, bukan rekening tabungan pribadi utama Anda, atau buat user internet banking operator khusus tanpa hak transfer.</li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('payment-auto-mutasi')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <CreditCard className="w-4 h-4" />
                  Buka Pengaturan Auto-Mutasi & Rekening
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'isolir-mikrotik',
        category: 'isolir',
        categoryLabel: 'Isolir Otomatis MikroTik',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        title: 'Panduan Cara Kerja Mesin Isolir & Unisolir Otomatis MikroTik',
        summary: 'Mekanisme pergantian profile PPPoE jatuh tempo, halaman pengalihan tagihan, dan pembukaan isolir instan.',
        readingTime: '3 menit baca',
        tags: ['isolir', 'mikrotik', 'unisolir', 'jatuh tempo', 'tunggakan', 'landing page', 'pppoe'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Mesin Isolir Otomatis Terintegrasi</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Aplikasi ini memiliki fitur <strong>Auto-Isolir Engine</strong> yang terhubung ke MikroTik API. Saat tanggal jatuh tempo tiba (misal tgl 20), pelanggan yang belum membayar otomatis dipindahkan ke profil isolir tanpa Anda harus login ke Winbox satu per satu!
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">3 Alur Kerja Isolir:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-amber-400 font-bold block">1. Scan Jatuh Tempo</span>
                  <p className="text-slate-400">Sistem mendeteksi invoice berstatus "Unpaid" yang telah melewati tanggal toleransi jatuh tempo.</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-rose-400 font-bold block">2. Ganti Profile Isolir</span>
                  <p className="text-slate-400">MikroTik mengubah profile PPP secret ke profil isolir ber-IP khusus (contoh: <code>10.10.10.x</code>) dan memutus sesi aktif agar langsung terisolir.</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-white font-bold block">3. Auto Unisolir</span>
                  <p className="text-slate-400">Begitu kasir mencatat bayar atau mutasi bank masuk, profile otomatis dikembalikan ke paket semula dan internet langsung normal kembali.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('isolir')}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-500/20"
              >
                <Sliders className="w-4 h-4" />
                Buka Pengaturan Mesin Isolir
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ),
      },
      {
        id: 'whatsapp-gateway-guide',
        category: 'whatsapp',
        categoryLabel: 'WhatsApp & Notifikasi',
        badgeColor: 'bg-blue-500/20 text-white border-blue-500/30',
        title: 'Panduan WhatsApp Gateway: Kirim Tagihan Otomatis & Pengingat',
        summary: 'Pengiriman rincian tagihan via WhatsApp, pengingat otomatis sebelum jatuh tempo, dan bukti pembayaran digital.',
        readingTime: '2 menit baca',
        tags: ['whatsapp', 'notifikasi', 'tagihan', 'wa gateway', 'pengingat', 'invoice'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Notifikasi Langsung ke Handphone Pelanggan</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Tingkatkan persentase pembayaran tepat waktu hingga 90% dengan mengirimkan pesan WhatsApp otomatis berisi rincian tagihan, nomor rekening, QRIS, dan link portal mandiri pelanggan.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fitur Utama WhatsApp Gateway:</h4>
              <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside pl-1">
                <li><strong className="text-white">Broadcast Tagihan Bulanan:</strong> Sekali klik, tagihan ke ratusan pelanggan terkirim rapi tanpa perlu save nomor satu-persatu.</li>
                <li><strong className="text-white">Pengingat H-3 & Hari H:</strong> Pesan ramah mengingatkan sebelum sistem isolir otomatis bekerja.</li>
                <li><strong className="text-white">Kuitansi Pembayaran Digital:</strong> Bukti lunas dan nomor resi otomatis terkirim begitu kasir menyelesaikan transaksi.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20"
              >
                <MessageSquare className="w-4 h-4" />
                Buka WhatsApp Gateway
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ),
      },
      {
        id: 'hotspot-voucher-guide',
        category: 'hotspot',
        categoryLabel: 'Hotspot & Voucher Kasir',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        title: 'Panduan Generate & Cetak Voucher Hotspot (Thermal 58/80mm & Stiker A4)',
        summary: 'Cara membuat ratusan kode voucher sekali klik, setting limit kuota/waktu, dan mencetak template voucher cantik siap jual.',
        readingTime: '3 menit baca',
        tags: ['hotspot', 'voucher', 'mikrotik', 'thermal', 'print', 'stiker', 'kuota', 'uptime'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
              <Ticket className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Mesin Generator Voucher Hotspot Cepat</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Sistem ini mendukung pembuatan voucher massal dengan format User=Password otomatis. Anda bisa langsung mencetak voucher ke printer kasir thermal (58mm / 80mm) atau kertas A4 untuk dijual di warung / konter pulsa.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-black">1</span>
                Langkah Membuat Voucher Hotspot
              </h3>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu <strong>Radius &gt; Paket Hotspot</strong> untuk memastikan profil tarif dan batas kecepatan telah dibuat (contoh: <em>Paket 2 Jam 3 Mbps</em> atau <em>Paket 24 Jam 5 GB</em>).</li>
                <li>Buka menu <strong>Radius &gt; Voucher Hotspot</strong>.</li>
                <li>Klik tombol <strong>"+ Buat Voucher Massal"</strong>.</li>
                <li>Pilih <strong>Profil Paket</strong>, masukkan <strong>Jumlah Voucher</strong> yang ingin dibuat (misal: 50 atau 100 lembar), serta tentukan format karakter (angka saja atau kombinasi huruf kecil).</li>
                <li>Klik <strong>"Generate Voucher"</strong>. Seluruh voucher akan langsung tersimpan di database dan sinkron ke server RADIUS.</li>
              </ol>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-black">2</span>
                Mencetak Voucher ke Printer Kasir
              </h3>
              <p className="text-xs text-slate-300">
                Setelah voucher dibuat, klik tombol <strong>"Cetak Voucher"</strong>. Anda dapat memilih layout cetak:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-purple-300 block">Printer Thermal Kasir (58mm / 80mm):</strong>
                  <p className="text-slate-400 text-[11px]">Format struk beruntun lengkap dengan nama WiFi, username, password, dan barcode/QR login instan tanpa ketik.</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-purple-300 block">Kertas A4 / Stiker Potong:</strong>
                  <p className="text-slate-400 text-[11px]">Layout grid kartu voucher 3x6 per lembar yang siap digunting untuk dititipkan ke reseller warung.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('radius-hotspot')}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-500/20"
              >
                <Ticket className="w-4 h-4" />
                Buka Menu Voucher Hotspot
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ),
      },
      {
        id: 'tr069-genieacs-guide',
        category: 'tr069',
        categoryLabel: 'TR-069 & Remote Modem',
        badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        title: 'Panduan TR-069 GenieACS: Remote Manajemen Modem ONT Pelanggan Jarak Jauh',
        summary: 'Cara memonitor modem optical power (redaman dBm), ubah SSID/Password WiFi, dan restart modem pelanggan tanpa harus ke lokasi.',
        readingTime: '4 menit baca',
        tags: ['tr069', 'genieacs', 'ont', 'modem', 'zte', 'huawei', 'fiberhome', 'redaman', 'wifi'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-start gap-3">
              <Radio className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Kontrol Penuh Modem ONT dari Kantor Anda</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Fitur <strong>TR-069 ACS</strong> memungkinkan teknisi dan NOC memantau ratusan modem pelanggan (ZTE F609, Huawei HG8245, Fiberhome, VSOL) secara terpusat tanpa repot datang ke rumah pelanggan.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-black">1</span>
                Pengaturan URL ACS di Modem Pelanggan
              </h3>
              <p className="text-xs text-slate-300">
                Di halaman web admin modem pelanggan, masuk ke menu <strong>Network &gt; TR-069</strong> atau <strong>Management &gt; TR-069</strong>:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-pink-300 border border-slate-800 space-y-1">
                <p className="text-slate-400">ACS URL: <strong>http://IP_SERVER_ANDA:7547/</strong></p>
                <p className="text-slate-400">ACS User: <strong>masmedia</strong></p>
                <p className="text-slate-400">ACS Password: <strong>masmedia123</strong></p>
                <p className="text-slate-400">Periodic Inform: <strong>Enable (Interval: 300 detik)</strong></p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-black">2</span>
                Operasi Jarak Jauh yang Bisa Dilakukan dari Billing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-white block">Cek Redaman Optik (dBm):</strong>
                  <p className="text-slate-400 text-[11px]">Melihat nilai RX Optical Power secara realtime. Jika di bawah -27 dBm, sistem memberi peringatan kabel bending/kotor.</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-white block">Ganti Nama & Sandi WiFi:</strong>
                  <p className="text-slate-400 text-[11px]">Pelanggan lupa kata sandi WiFi? Ubah nama SSID & Password dari meja Anda hanya dalam 3 detik!</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <strong className="text-white block">Reboot / Reset Jarak Jauh:</strong>
                  <p className="text-slate-400 text-[11px]">Kirim perintah restart modem tanpa perlu menyuruh pelanggan cabut adaptor colokan listrik.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('tr069')}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                <Radio className="w-4 h-4" />
                Buka Menu TR-069 Remote Modem
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ),
      },
      {
        id: 'backup-firestore',
        category: 'backup',
        categoryLabel: 'Database & Backup Cloud',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        title: 'Panduan Backup, Restore & Keamanan Cloud Firestore',
        summary: 'Cara mengunduh cadangan database offline mandiri, sinkronisasi cloud realtime, dan perlindungan dari kehilangan data.',
        readingTime: '2 menit baca',
        tags: ['backup', 'restore', 'database', 'firestore', 'cloud', 'audit trail'],
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-sm">Cloud Firestore Terintegrasi</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Database Anda disimpan secara aman di <strong>Cloud Firestore (Google Cloud Platform)</strong>. Seluruh data transaksi, pelanggan, router, dan log staf otomatis tersimpan dengan replikasi tingkat tinggi.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">1</span>
                Cara Melakukan Backup Mandiri ke Komputer Lokal
              </h3>
              <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li>Buka menu samping <strong>Laporan &gt; Audit Trail & Log Staf</strong>.</li>
                <li>Pilih tab <strong>Cadangan & Pemulihan Database</strong>.</li>
                <li>Klik tombol <strong>"Unduh Cadangan JSON (Full Backup)"</strong>.</li>
                <li>File backup berformat <code>.json</code> terenkripsi akan tersimpan di komputer Anda. Simpan file ini di tempat aman (Google Drive atau flashdisk).</li>
              </ol>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('laporan-audit')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Database className="w-4 h-4" />
                Buka Menu Backup Database
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  // Filter articles based on category and search query
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchCat = activeCategory === 'all' || art.category === activeCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [articles, activeCategory, searchQuery]);

  const selectedArticle = useMemo(() => {
    return articles.find(a => a.id === selectedArticleId) || articles[0];
  }, [articles, selectedArticleId]);

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5 animate-fadeIn text-slate-100">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-white border border-blue-500/30 uppercase tracking-wider">
                  Utilitas Tambahan
                </span>
                <span className="text-[10px] text-slate-400">Pusat Dokumentasi & SOP Resmi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Pusat Panduan & Buku Pedoman Sistem
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Cetak panduan ini untuk arsip fisik / SOP teknisi"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Cetak SOP</span>
            </button>
            <button
              onClick={downloadCustomerTemplateExcel}
              className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-white border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Unduh Template Excel Pelanggan PPPoE"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Template PPPoE</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 max-w-xl relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari panduan... (contoh: WireGuard, SSTP, L2TP, VPN Remote, MikroTik, ID Cloud, isolir)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              Hapus
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Semua Panduan', icon: BookOpen },
          { id: 'vpn', label: 'Integrasi MikroTik (VPN)', icon: Shield },
          { id: 'superadmin', label: 'Super Admin & Akun', icon: UserPlus },
          { id: 'idcloud', label: 'ID Cloud (IDCloudHost)', icon: Cloud },
          { id: 'import', label: 'Impor Pelanggan PPPoE', icon: Download },
          { id: 'payment', label: 'Auto-Mutasi & Bank', icon: CreditCard },
          { id: 'isolir', label: 'Isolir MikroTik', icon: Sliders },
          { id: 'whatsapp', label: 'WhatsApp Gateway', icon: MessageSquare },
          { id: 'hotspot', label: 'Voucher Hotspot', icon: Ticket },
          { id: 'tr069', label: 'TR-069 Remote Modem', icon: Radio },
          { id: 'backup', label: 'Database & Cloud', icon: Database },
        ].map(cat => {
          const CatIcon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Article List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Daftar Topik ({filteredArticles.length})
            </span>
            <span className="text-[11px] text-slate-500">Pilih topik untuk membaca</span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
              <h4 className="font-bold text-white text-sm">Tidak ada panduan yang cocok</h4>
              <p className="text-xs text-slate-400">
                Coba gunakan kata kunci lain seperti <em>"id cloud"</em>, <em>"impor"</em>, atau <em>"mutasi"</em>.
              </p>
            </div>
          ) : (
            filteredArticles.map(art => {
              const isSelected = art.id === selectedArticle.id;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/60 shadow-lg shadow-blue-950/30 scale-[1.01]'
                      : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${art.badgeColor}`}>
                      {art.categoryLabel}
                    </span>
                    <span className="text-[10px] text-slate-400">{art.readingTime}</span>
                  </div>

                  <h3 className={`font-bold text-xs sm:text-sm mt-2 leading-snug ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {art.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className={`flex items-center gap-1 font-bold ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                      <span>Buka</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Article Content Reader */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 sticky top-20">
            {/* Article Header */}
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${selectedArticle.badgeColor}`}>
                  {selectedArticle.categoryLabel}
                </span>
                <span className="text-xs text-slate-400">• {selectedArticle.readingTime}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {selectedArticle.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedArticle.summary}
              </p>
            </div>

            {/* Article Dynamic Content */}
            <div className="prose prose-invert max-w-none">
              {selectedArticle.content}
            </div>

            {/* Quick Footer inside Article */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Terverifikasi untuk Sistem Billing Masmedia Net</span>
              </div>
              <button
                onClick={handlePrint}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Halaman Ini
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
