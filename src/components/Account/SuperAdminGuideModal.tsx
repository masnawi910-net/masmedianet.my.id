import React, { useState } from 'react';
import {
  BookOpen,
  X,
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
  Printer,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SuperAdminGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminGuideModal: React.FC<SuperAdminGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeChapter, setActiveChapter] = useState<'akun' | 'mikrotik-cloud' | 'idcloudhost' | 'firestore' | 'checklist'>('akun');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-500/20 text-white font-bold px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider">
                  Buku Panduan Resmi
                </span>
                <span className="text-[10px] text-slate-400">Versi Super Admin & NOC</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Panduan Super Admin: Manajemen Akun & Instalasi ID Cloud
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold"
              title="Cetak panduan ini"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Chapters Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveChapter('akun')}
            className={`py-3 px-3.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeChapter === 'akun'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Bab 1: Manajemen Akun Tim</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChapter('mikrotik-cloud')}
            className={`py-3 px-3.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeChapter === 'mikrotik-cloud'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Bab 2: ID Cloud MikroTik (DDNS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChapter('idcloudhost')}
            className={`py-3 px-3.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeChapter === 'idcloudhost'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Bab 3: Instalasi VPS (IDCloudHost)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChapter('firestore')}
            className={`py-3 px-3.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeChapter === 'firestore'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Bab 4: Sinkronisasi Cloud Firestore</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChapter('checklist')}
            className={`py-3 px-3.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeChapter === 'checklist'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Bab 5: Checklist Super Admin</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* ========================================================================= */}
          {/* BAB 1: MANAJEMEN AKUN PENGGUNA */}
          {/* ========================================================================= */}
          {activeChapter === 'akun' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Prinsip Role-Based Access Control (RBAC)</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Sebagai Super Admin, Anda memegang hak istimewa tertinggi. Jangan membagikan akun Super Admin kepada staf kasir atau teknisi lapangan. Buatkan akun spesifik sesuai tugas masing-masing agar aman dan tercatat di <strong>Audit Trail</strong>.
                  </p>
                </div>
              </div>

              {/* Roles Table */}
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

              {/* Step by Step Creation */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black">2</span>
                  Langkah-Langkah Membuat Akun Baru
                </h3>

                <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside pl-1">
                  <li>
                    Buka menu samping <strong>Dashboard &gt; Akun</strong> atau langsung tab <strong>Manajemen Akun Pengguna</strong>.
                  </li>
                  <li>
                    Klik tombol hijau <strong>"Tambah Akun Pengguna"</strong> di pojok kanan atas.
                  </li>
                  <li>
                    Isi formulir pembuatan akun:
                    <ul className="list-disc list-inside pl-4 mt-1.5 space-y-1 text-slate-400">
                      <li><strong className="text-slate-200">Nama Lengkap:</strong> Nama asli staf (contoh: <em>Rizky - Kasir Loket Timur</em>).</li>
                      <li><strong className="text-slate-200">Username / Email:</strong> Digunakan untuk masuk sistem (contoh: <em>kasir.timur@masmedia.net</em>).</li>
                      <li><strong className="text-slate-200">Nomor WhatsApp:</strong> Nomor aktif dengan format <em>62812...</em> (untuk reset password / OTP).</li>
                      <li><strong className="text-slate-200">Password:</strong> Minimal 6 karakter, dianjurkan kombinasi huruf besar, kecil, dan angka.</li>
                      <li><strong className="text-slate-200">Peran (Role):</strong> Pilih sesuai tanggung jawab personil.</li>
                      <li><strong className="text-slate-200">Hak Akses Modul:</strong> Centang modul yang diizinkan (Billing, RADIUS, FTTH, WhatsApp, Laporan).</li>
                    </ul>
                  </li>
                  <li>
                    Klik <strong>"Simpan Akun"</strong>. Akun baru langsung aktif dan siap digunakan untuk login.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BAB 2: ID CLOUD MIKROTIK (DDNS) */}
          {/* ========================================================================= */}
          {activeChapter === 'mikrotik-cloud' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                <Cloud className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Apa itu "ID Cloud" / IP Cloud MikroTik?</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong>ID Cloud MikroTik</strong> adalah fitur bawaan MikroTik RouterOS (DDNS gratis) yang memberikan nama domain unik (contoh: <code>4a2b1c3d.sn.mynetname.net</code>) berdasarkan Serial Number router. Dengan ID Cloud, billing Anda bisa terhubung ke MikroTik <strong>tanpa harus menyewa IP Publik Statis</strong> yang mahal dari ISP upstream!
                  </p>
                </div>
              </div>

              {/* Cara Mengaktifkan via Winbox */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                  Cara 1: Aktivasi via Winbox GUI
                </h3>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                  <li>Buka aplikasi <strong>Winbox</strong> dan login ke Router MikroTik Anda.</li>
                  <li>Di menu sebelah kiri, klik menu <strong>IP &gt; Cloud</strong>.</li>
                  <li>Beri centang pada opsi <strong>DDNS Enabled</strong>.</li>
                  <li>Beri centang pada opsi <strong>Update Time</strong> (agar jam router otomatis tersinkronisasi).</li>
                  <li>Klik tombol <strong>Apply</strong>.</li>
                  <li>
                    Tunggu 5-10 detik. Di kolom <strong>DNS Name</strong> akan muncul nama ID Cloud router Anda, misalnya:
                    <div className="mt-1.5 p-2 bg-slate-950 font-mono text-cyan-400 font-bold rounded-lg border border-slate-800">
                      4a2b1c3d5e6f.sn.mynetname.net
                    </div>
                  </li>
                </ol>
              </div>

              {/* Cara Mengaktifkan via Terminal CLI */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                    Cara 2: Aktivasi Sekali Klik via Terminal MikroTik (Script CLI)
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '/ip cloud set ddns-enabled=yes ddns-update-interval=none update-time=yes\n/ip cloud force-update\n/ip cloud print',
                        'cli-cloud'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold border border-cyan-500/30 transition-all cursor-pointer"
                  >
                    {copiedKey === 'cli-cloud' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'cli-cloud' ? 'Tersalin!' : 'Salin Script Terminal'}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto space-y-1">
                  <p className="text-slate-500"># 1. Aktifkan fitur DDNS IP Cloud MikroTik</p>
                  <p className="text-cyan-300">/ip cloud set ddns-enabled=yes ddns-update-interval=none update-time=yes</p>
                  <p className="text-slate-500"># 2. Paksa update status ke server MikroTik</p>
                  <p className="text-cyan-300">/ip cloud force-update</p>
                  <p className="text-slate-500"># 3. Lihat hasil ID Cloud yang didapatkan</p>
                  <p className="text-blue-400">/ip cloud print</p>
                </div>
              </div>

              {/* Cara Menghubungkan ID Cloud ke Billing Masmedia */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-black">3</span>
                  Menghubungkan ID Cloud ke Billing & RADIUS
                </h3>
                <p className="text-xs text-slate-300">
                  Setelah mendapatkan DNS Name (misal <code>4a2b1c3d5e6f.sn.mynetname.net</code>):
                </p>
                <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                  <li>Buka menu <strong>Radius &gt; Router MikroTik (NAS)</strong> di aplikasi billing ini.</li>
                  <li>Pilih router Anda lalu klik tombol <strong>Edit Router</strong>.</li>
                  <li>Pada kolom <strong>IP Address / Host Router</strong>, masukkan DNS Name ID Cloud tersebut.</li>
                  <li>Pastikan port API MikroTik (default: <code>8728</code> atau SSL <code>8729</code>) sudah terbuka di firewall router.</li>
                  <li>Klik <strong>Simpan</strong>. Sistem akan otomatis memonitor status uptime, CPU load, dan session PPPoE secara langsung!</li>
                </ol>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BAB 3: INSTALASI DI PROVIDER VPS CLOUD (IDCLOUDHOST / UBUNTU) */}
          {/* ========================================================================= */}
          {activeChapter === 'idcloudhost' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
                <Server className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Instalasi Server di Provider Cloud (IDCloudHost / Biznet / DigitalOcean)</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Jika Anda menyewa VPS Cloud di <strong>IDCloudHost</strong> (atau provider Cloud lainnya), server ini berfungsi sebagai host 24 jam nonstop untuk Web Billing, FreeRADIUS, dan Remote VPN Gateway MikroTik Anda.
                  </p>
                </div>
              </div>

              {/* Spesifikasi Rekomendasi */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                  Spesifikasi Minimum VPS IDCloudHost
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block">Sistem Operasi:</span>
                    <strong className="text-white">Ubuntu 22.04 LTS</strong>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block">Processor:</span>
                    <strong className="text-white">1 - 2 vCPU</strong>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block">Memory RAM:</span>
                    <strong className="text-white">1 GB - 2 GB</strong>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block">Storage:</span>
                    <strong className="text-white">20 GB NVMe</strong>
                  </div>
                </div>
              </div>

              {/* Perintah CLI Instalasi */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                    Langkah Instalasi Server via SSH
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        '# 1. Update OS\nsudo apt update && sudo apt upgrade -y\n\n# 2. Install Node.js 20 LTS\ncurl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt install -y nodejs git build-essential ufw\n\n# 3. Buka Port Firewall\nsudo ufw allow 22/tcp\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw allow 3000/tcp\nsudo ufw allow 1812/udp\nsudo ufw allow 1813/udp\nsudo ufw enable',
                        'vps-bash'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-bold border border-purple-500/30 transition-all cursor-pointer"
                  >
                    {copiedKey === 'vps-bash' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'vps-bash' ? 'Tersalin!' : 'Salin Perintah Bash'}
                  </button>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto space-y-1">
                  <p className="text-slate-500"># Buka Terminal / PuTTY, hubungkan ke IP VPS IDCloudHost Anda:</p>
                  <p className="text-purple-300">ssh root@IP_VPS_ANDA</p>
                  <p className="text-slate-500 mt-2"># Jalankan update sistem & install dependency:</p>
                  <p className="text-slate-200">sudo apt update && sudo apt upgrade -y</p>
                  <p className="text-slate-200">curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -</p>
                  <p className="text-slate-200">sudo apt install -y nodejs git ufw</p>
                </div>
              </div>

              {/* Port Firewall Wajib */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Port Firewall yang Wajib Dibuka (UFW):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span>Port 3000 (TCP) / 80 / 443</span>
                    <span className="text-blue-400 font-sans font-bold">Web Billing Panel</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span>Port 1812 & 1813 (UDP)</span>
                    <span className="text-cyan-400 font-sans font-bold">RADIUS Auth & Acct</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span>Port 8728 / 8729 (TCP)</span>
                    <span className="text-amber-400 font-sans font-bold">MikroTik RouterOS API</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span>Port 7547 / 7557 (TCP)</span>
                    <span className="text-pink-400 font-sans font-bold">GenieACS TR-069 Modem</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BAB 4: SINKRONISASI CLOUD FIRESTORE */}
          {/* ========================================================================= */}
          {activeChapter === 'firestore' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Cloud Firestore Database & Multi-Tenant ID</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Aplikasi ini menggunakan database cloud berkecepatan tinggi: <strong>ai-studio-masmedianet-a2adbdd6-c0e6-473a-9541-fcad88b5a7b5</strong>. Seluruh data pelanggan, tagihan invoice, log mutasi bank, dan konfigurasi MikroTik tersinkronisasi realtime ke cloud.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                  Keuntungan Cloud Sync Terintegrasi
                </h3>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside pl-1">
                  <li>
                    <strong className="text-white">Anti Hilang Data:</strong> Walaupun browser dihapus riwayatnya (Clear Cache) atau Anda berganti laptop/HP, semua data langsung kembali otomatis setelah login.
                  </li>
                  <li>
                    <strong className="text-white">Multi-Device Realtime:</strong> Staf kasir yang menginput pembayaran di kantor langsung terlihat seketika oleh Super Admin di tempat lain tanpa harus refresh manual.
                  </li>
                  <li>
                    <strong className="text-white">Isolir Multi-Cabang:</strong> Setiap tenant/cabang memiliki namespace data terpisah sehingga data antar mitra ISP tidak saling bercampur.
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                  Cara Backup & Restore Database Mandiri
                </h3>
                <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                  <li>Masuk ke menu <strong>Akun &gt; Audit Trail & Backup Database</strong>.</li>
                  <li>Klik tombol <strong>"Unduh Cadangan JSON (Full Backup)"</strong>. File cadangan terenkripsi akan tersimpan di komputer Anda.</li>
                  <li>Jika sewaktu-waktu membutuhkan pemulihan, klik <strong>"Pulihkan Data dari File"</strong> dan pilih file cadangan tersebut.</li>
                </ol>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BAB 5: CHECKLIST OPERASIONAL SUPER ADMIN */}
          {/* ========================================================================= */}
          {activeChapter === 'checklist' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Daftar Periksa (Checklist) Super Admin Baru</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Pastikan Anda telah menyelesaikan langkah-langkah di bawah ini sebelum menyerahkan akses sistem ke staf kasir atau teknisi:
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { title: 'Ganti Password Default Super Admin', desc: 'Pastikan akun utama Anda menggunakan password yang kuat dan aman.' },
                  { title: 'Lengkapi Profil Usaha & Logo Kop Surat', desc: 'Atur nama usaha, kontak WA kantor, dan logo di menu Akun > Profil Usaha agar tercetak rapi di invoice.' },
                  { title: 'Aktifkan IP Cloud MikroTik (DDNS)', desc: 'Jalankan script /ip cloud set ddns-enabled=yes di Winbox dan pasang DNS Name ke menu Radius.' },
                  { title: 'Daftarkan Paket Internet Bandwidth', desc: 'Sesuaikan nama profil kecepatan di menu Paket Internet (cth: 5 MBPS, 10 MBPS, 20 MBPS).' },
                  { title: 'Buatkan Akun Personil Tim (Kasir & Teknisi)', desc: 'Buat akun masing-masing dengan role kasir, teknisi, atau operator sesuai SOP perusahaan.' },
                  { title: 'Konfigurasi Pembayaran (QRIS / Rekening Bank / Auto-Mutasi)', desc: 'Masukkan rekening bank atau aktifkan auto mutasi di menu Pembayaran agar pelanggan bisa bayar mandiri.' },
                  { title: 'Lakukan Uji Coba Impor Pelanggan PPPoE', desc: 'Unduh template Excel / CSV resmi di menu Pelanggan, isi data, dan lakukan impor massal.' },
                  { title: 'Uji Notifikasi WhatsApp / Email Tagihan', desc: 'Kirim invoice tagihan simulasi ke nomor WA Anda sendiri untuk memastikan format rapi.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-white border border-blue-500/40 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-white text-xs">{item.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Dokumentasi resmi untuk Super Admin Masmedia Net</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
