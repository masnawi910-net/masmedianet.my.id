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
} from 'lucide-react';
import { downloadCustomerTemplateExcel, downloadCustomerTemplateCSV } from '../../utils/excelHelper';

interface GuideArticle {
  id: string;
  category: 'superadmin' | 'idcloud' | 'import' | 'payment' | 'isolir' | 'whatsapp' | 'hotspot' | 'tr069' | 'backup';
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
  const [selectedArticleId, setSelectedArticleId] = useState<string>('superadmin-guide');
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
            placeholder="Cari panduan... (contoh: ID Cloud, auto mutasi, impor akun, vps, isolir, reset password)"
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
