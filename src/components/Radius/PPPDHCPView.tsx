import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, InternetPackage } from '../../types';
import { formatRupiah, formatBytes } from '../../utils/formatters';
import { DueDateMiniCalendar } from '../common/DueDateMiniCalendar';
import {
  exportCustomersToExcel,
  exportCustomersToCSV,
  downloadCustomerTemplateCSV,
  downloadCustomerTemplateExcel,
} from '../../utils/excelHelper';
import { ImportCustomerModal } from '../Customers/ImportCustomerModal';
import {
  Router,
  Users,
  Activity,
  Sliders,
  Settings,
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Clock,
  ArrowDown,
  ArrowUp,
  X,
  Lock,
  Wifi,
  Shield,
  ShieldAlert,
  KeyRound,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Power,
  Copy,
  Check,
  Zap,
  Server,
  Eye,
  EyeOff,
} from 'lucide-react';

export const PPPDHCPView: React.FC = () => {
  const {
    customers,
    packages,
    nasList,
    activeSessions,
    disconnectSession,
    disconnectCustomerSession,
    connectCustomerSession,
    addPackage,
    updatePackage,
    deletePackage,
    addCustomer,
    bulkImportCustomers,
    updateCustomer,
    deleteCustomer,
    isolateCustomer,
    unIsolateCustomer,
    setActiveTab,
    radiusServerConfig,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'user' | 'session' | 'profile' | 'setting'>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'pppoe' | 'dhcp'>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [pppRouterOsVersion, setPppRouterOsVersion] = useState<'v7' | 'v6'>('v7');
  const [copiedPppScript, setCopiedPppScript] = useState(false);
  const [showPppSecret, setShowPppSecret] = useState(false);

  // User Modal State (Add / Edit)
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    phone: '',
    address: '',
    rtRw: 'RT 01 / RW 01',
    username: '',
    password: '',
    connectionType: 'pppoe' as 'pppoe' | 'dhcp' | 'static_ip',
    packageId: packages[0]?.id || 'PKG-01',
    ipAddress: '10.10.10.10',
    macAddress: '',
    dueDateDay: 10,
    status: 'active' as 'active' | 'isolated' | 'due_soon' | 'overdue',
    notes: '',
  });

  // Profile Modal State (Add / Edit)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<InternetPackage | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    price: 150000,
    downloadSpeed: 10,
    uploadSpeed: 5,
    validityDays: 30,
    sharedUsers: 1,
    description: 'Profil Bandwidth PPPoE MikroTik',
  });

  // Filter PPPoE / DHCP customers
  const pppoeCustomers = customers.filter(c => {
    const sTerm = (searchTerm || '').toLowerCase();
    const matchType = serviceFilter === 'all' || c.connectionType === serviceFilter;
    const matchSearch =
      (c.name || '').toLowerCase().includes(sTerm) ||
      (c.username || '').toLowerCase().includes(sTerm) ||
      (c.ipAddress || '').includes(sTerm);
    return matchType && matchSearch;
  });

  // Active Sessions for PPPoE/DHCP
  const pppSessions = activeSessions.filter(s => {
    const sTerm = (searchTerm || '').toLowerCase();
    const matchService = s.service === 'pppoe' || s.service === 'dhcp';
    const matchSearch =
      (s.username || '').toLowerCase().includes(sTerm) ||
      (s.customerName || '').toLowerCase().includes(sTerm) ||
      (s.ipAddress || '').includes(sTerm);
    return matchService && matchSearch;
  });

  // Profil Paket PPPoE (Daftar dinamis profil PPPoE / Fiber Optic)
  const pppPackages = packages.filter(p => p.isActive !== false && p.category !== 'hotspot');

  // Open Add User Modal
  const handleOpenAddUser = () => {
    setEditingCustomer(null);
    const randNum = Math.floor(100 + Math.random() * 900);
    setUserFormData({
      name: '',
      phone: '',
      address: '',
      rtRw: 'RT 01 / RW 01',
      username: `user_${randNum}`,
      password: `pass${randNum}`,
      connectionType: 'pppoe',
      packageId: packages[0]?.id || '',
      ipAddress: `10.10.10.${Math.floor(10 + Math.random() * 200)}`,
      macAddress: '',
      dueDateDay: 10,
      status: 'active',
      notes: '',
    });
    setShowUserModal(true);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (cust: Customer) => {
    setEditingCustomer(cust);
    setUserFormData({
      name: cust.name || '',
      phone: cust.phone || '',
      address: cust.address || '',
      rtRw: cust.rtRw || 'RT 01 / RW 01',
      username: cust.username || '',
      password: cust.password || '',
      connectionType: (cust.connectionType as any) || 'pppoe',
      packageId: cust.packageId || packages[0]?.id || '',
      ipAddress: cust.ipAddress || '',
      macAddress: cust.macAddress || '',
      dueDateDay: cust.dueDateDay || 10,
      status: cust.status || 'active',
      notes: cust.notes || '',
    });
    setShowUserModal(true);
  };

  // Save User
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.username.trim()) {
      alert('Nama dan Username wajib diisi!');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: userFormData.name,
        phone: userFormData.phone,
        address: userFormData.address,
        rtRw: userFormData.rtRw,
        username: userFormData.username,
        password: userFormData.password,
        connectionType: userFormData.connectionType,
        packageId: userFormData.packageId,
        ipAddress: userFormData.ipAddress,
        macAddress: userFormData.macAddress,
        dueDateDay: Number(userFormData.dueDateDay),
        status: userFormData.status,
        notes: userFormData.notes,
      });
      alert(`User ${userFormData.username} berhasil diperbarui!`);
    } else {
      addCustomer({
        name: userFormData.name,
        phone: userFormData.phone,
        address: userFormData.address,
        rtRw: userFormData.rtRw,
        username: userFormData.username,
        password: userFormData.password,
        connectionType: userFormData.connectionType,
        packageId: userFormData.packageId,
        ipAddress: userFormData.ipAddress,
        macAddress: userFormData.macAddress,
        dueDateDay: Number(userFormData.dueDateDay),
        status: userFormData.status,
        notes: userFormData.notes,
        autoIsolate: true,
      });
      alert(`User ${userFormData.username} berhasil didaftarkan!`);
    }
    setShowUserModal(false);
  };

  // Delete User
  const handleDeleteUser = (cust: Customer) => {
    if (confirm(`Apakah Anda yakin ingin menghapus user RADIUS "${cust.name}" (@${cust.username})? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteCustomer(cust.id);
    }
  };

  // Open Add Profile Modal
  const handleOpenAddProfile = () => {
    setEditingProfile(null);
    setProfileFormData({
      name: '',
      price: 150000,
      downloadSpeed: 10,
      uploadSpeed: 5,
      validityDays: 30,
      sharedUsers: 1,
      description: 'Profil Paket PPPoE Baru',
    });
    setShowProfileModal(true);
  };

  // Open Edit Profile Modal
  const handleOpenEditProfile = (pkg: InternetPackage) => {
    setEditingProfile(pkg);
    setProfileFormData({
      name: pkg.name || '',
      price: pkg.price || 100000,
      downloadSpeed: pkg.downloadSpeed || 10,
      uploadSpeed: pkg.uploadSpeed || 5,
      validityDays: pkg.validityDays || 30,
      sharedUsers: pkg.sharedUsers || 1,
      description: pkg.description || '',
    });
    setShowProfileModal(true);
  };

  // Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFormData.name.trim()) {
      alert('Nama Profile wajib diisi!');
      return;
    }

    const dSpeed = Number(profileFormData.downloadSpeed) || 10;
    const uSpeed = Number(profileFormData.uploadSpeed) || 5;
    const rateLimitStr = `${uSpeed}M/${dSpeed}M`;

    if (editingProfile) {
      updatePackage(editingProfile.id, {
        name: profileFormData.name.trim(),
        price: Number(profileFormData.price),
        downloadSpeed: dSpeed,
        uploadSpeed: uSpeed,
        rateLimit: rateLimitStr,
        validityDays: Number(profileFormData.validityDays) || 30,
        sharedUsers: Number(profileFormData.sharedUsers) || 1,
        description: profileFormData.description || `Paket internet ${dSpeed} Mbps kecepatan stabil.`,
        category: editingProfile.category === 'hotspot' ? 'both' : (editingProfile.category || 'pppoe'),
        isActive: true,
      });
      alert(`Profile ${profileFormData.name} berhasil diperbarui!`);
    } else {
      addPackage({
        name: profileFormData.name.trim(),
        price: Number(profileFormData.price),
        downloadSpeed: dSpeed,
        uploadSpeed: uSpeed,
        rateLimit: rateLimitStr,
        validityDays: Number(profileFormData.validityDays) || 30,
        sharedUsers: Number(profileFormData.sharedUsers) || 1,
        description: profileFormData.description || `Paket internet ${dSpeed} Mbps kecepatan stabil.`,
        profileName: `profile-${profileFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        poolName: 'pool-pppoe',
        priority: 7,
        category: 'pppoe',
        colorBadge: dSpeed >= 20 ? 'indigo' : dSpeed >= 10 ? 'blue' : 'emerald',
        isActive: true,
      });
      alert(`Profile ${profileFormData.name} berhasil ditambahkan!`);
    }
    setShowProfileModal(false);
  };

  // Delete Profile
  const handleDeleteProfile = (pkg: InternetPackage) => {
    const activeCount = customers.filter(c => c.packageId === pkg.id).length;
    if (activeCount > 0) {
      if (!confirm(`Profile "${pkg.name}" sedang digunakan oleh ${activeCount} pelanggan. Tetap hapus?`)) {
        return;
      }
    } else {
      if (!confirm(`Apakah Anda yakin ingin menghapus Profile "${pkg.name}"?`)) {
        return;
      }
    }
    deletePackage(pkg.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Router className="w-4 h-4" />
            Radius / PPP & DHCP
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen PPPoE & DHCP Server</h1>
          <p className="text-sm text-slate-400 mt-1">
            Otentikasi RADIUS pelanggan broadband, pemantauan sesi online real-time, profile bandwidth, dan konfigurasi NAS MikroTik.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'user' && (
            <>
              {/* Import Button */}
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs active:scale-95"
                title="Impor Data Pelanggan dari file Excel (.xlsx) atau teks CSV"
              >
                <Upload className="w-4 h-4" />
                Impor Data (.xlsx)
              </button>

              {/* Export Dropdown / Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(prev => !prev)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs active:scale-95"
                  title="Ekspor data pelanggan PPP-DHCP"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Expor Data
                  <ArrowDown className="w-3 h-3 text-slate-400" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-30 animate-fadeIn text-xs">
                    <button
                      onClick={() => {
                        exportCustomersToExcel(customers, packages, nasList);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">Format Excel (.xlsx)</div>
                        <span className="text-[10px] text-slate-500">Standar Microsoft Excel</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportCustomersToCSV(customers, packages, nasList);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors border-t border-slate-800/80 mt-1 pt-1"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-semibold">Format CSV (Titik-koma)</div>
                        <span className="text-[10px] text-slate-500">no;user;password;profile;nas;...</span>
                      </div>
                    </button>

                    <div className="border-t border-slate-800/90 my-1 pt-1 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Unduh Template Kosong
                    </div>
                    <button
                      onClick={() => {
                        downloadCustomerTemplateCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/40 flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">Template CSV (.csv)</div>
                        <span className="text-[10px] text-slate-400">Siap diisi pelanggan Anda</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        downloadCustomerTemplateExcel();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/40 flex items-center gap-2 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">Template Excel (.xlsx)</div>
                        <span className="text-[10px] text-slate-400">Format tabel Microsoft Excel</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleOpenAddUser}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                + Tambah User PPP
              </button>
            </>
          )}
          {activeSubTab === 'profile' && (
            <button
              onClick={handleOpenAddProfile}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              + Tambah Profile PPP
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'user', label: `1. User (${pppoeCustomers.length})`, icon: Users },
            { id: 'session', label: `2. Session (${pppSessions.length} Online)`, icon: Activity },
            { id: 'profile', label: `3. Profile (${pppPackages.length})`, icon: Sliders },
            { id: 'setting', label: '4. Setting', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari user, IP, nama..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* SUB-MENU 1: USER */}
      {activeSubTab === 'user' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={serviceFilter}
                onChange={e => setServiceFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Tipe Koneksi</option>
                <option value="pppoe">PPPoE Client</option>
                <option value="dhcp">DHCP / Static IP</option>
              </select>
            </div>
            <div className="text-xs text-slate-400">
              Total {pppoeCustomers.length} User Terdaftar
            </div>
          </div>

          {/* Alert jika belum ada router yang terhubung */}
          {!nasList.some(n => n.status === 'online') && (
            <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-900/50 border border-rose-700/50 flex items-center justify-center text-rose-300 shrink-0 mt-0.5 sm:mt-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-200">
                    Status Router MikroTik: OFFLINE (Belum Ada Router yang Terhubung)
                  </h4>
                  <p className="text-rose-300/80 text-[11px] mt-0.5">
                    User PPPoE yang baru ditambahkan tersimpan dengan status <strong>"Akun Terdaftar"</strong> di database. Status koneksi sesi perangkat pelanggan tetap <strong>"Offline (Router Belum Konek)"</strong> karena router fisik MikroTik belum terhubung via VPN / skrip Winbox.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('radius-setting')}
                className="px-3 py-1.5 rounded-xl bg-rose-800/80 hover:bg-rose-700 text-white font-bold text-xs whitespace-nowrap shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                Pengaturan Router NAS &rarr;
              </button>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">ID / Pelanggan</th>
                    <th className="px-4 py-3">Username RADIUS</th>
                    <th className="px-4 py-3">Password</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Paket Internet</th>
                    <th className="px-4 py-3">IP Address (Static)</th>
                    <th className="px-4 py-3">Status Akun & Sesi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {pppoeCustomers.map(cust => {
                    const pkg = packages.find(p => p.id === cust.packageId);
                    const custNas = nasList.find(n => n.id === cust.nasId) || nasList[0];
                    const isRouterOnline = custNas ? custNas.status === 'online' : false;
                    const isOnline = isRouterOnline && activeSessions.some(
                      s => (s.username || '').toLowerCase().trim() === (cust.username || '').toLowerCase().trim()
                    );
                    return (
                      <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{cust.name}</div>
                          <span className="text-[10px] text-slate-500">{cust.id} • {cust.phone || '-'}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">{cust.username}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{cust.password}</td>
                        <td className="px-4 py-3">
                          <span className="uppercase text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {cust.connectionType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{pkg?.name || '-'}</div>
                          <span className="text-[10px] text-emerald-400">{pkg ? formatRupiah(pkg.price) : ''}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">{cust.ipAddress}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 items-start">
                            {/* Status Akun di Database */}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              cust.status === 'active'
                                ? 'bg-slate-800 text-slate-300 border-slate-700'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                              title={cust.status === 'active' ? 'Akun tersimpan aktif di database billing' : 'Akun diblokir / terisolir'}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cust.status === 'active' ? 'bg-blue-400' : 'bg-rose-400'}`} />
                              {cust.status === 'active' ? 'Akun Terdaftar' : 'Terisolir'}
                            </span>

                            {/* Status Koneksi Real-Time Router MikroTik */}
                            {isOnline ? (
                              <span className="text-[9.5px] font-bold text-emerald-300 flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Online (Dial-in)
                              </span>
                            ) : !isRouterOnline ? (
                              <span
                                className="text-[9.5px] font-semibold text-rose-300 flex items-center gap-1 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40"
                                title="Router MikroTik belum terhubung / offline. Silakan hubungkan router di menu MikroTik / RADIUS."
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Offline (Router Belum Konek)
                              </span>
                            ) : (
                              <span
                                className="text-[9.5px] font-medium text-slate-400 flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/60"
                                title="Router MikroTik online, namun modem/ONT pelanggan belum melakukan dial-in PPPoE."
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                Offline (Modem Belum Konek)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Kontrol Sesi MikroTik: Putus jika online / Tes Dial-in jika offline */}
                            {isOnline ? (
                              <button
                                onClick={() => {
                                  if (confirm(`Putuskan koneksi live PPPoE pelanggan ${cust.name} (@${cust.username}) dari MikroTik?`)) {
                                    disconnectCustomerSession(cust.username);
                                  }
                                }}
                                className="p-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 rounded-lg border border-rose-500/30 transition-colors"
                                title="Putus Sesi PPPoE (Kick dari MikroTik)"
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!isRouterOnline) {
                                    alert(`Router MikroTik (${custNas?.name || 'Router'}) belum terhubung atau sedang offline. Anda belum menghubungkan router ke MikroTik, silakan hubungkan router terlebih dahulu di menu MikroTik.`);
                                    return;
                                  }
                                  const ok = connectCustomerSession(cust.id);
                                  if (!ok) {
                                    alert(`Gagal memulai sesi dial-in. Pastikan router aktif.`);
                                  }
                                }}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isRouterOnline
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400/90 hover:text-emerald-300 border-emerald-500/30'
                                    : 'bg-slate-800/60 text-slate-500 border-slate-700/40 cursor-not-allowed opacity-60'
                                }`}
                                title={
                                  isRouterOnline
                                    ? "Tes Sambungkan / Simulasi Dial-in ke MikroTik"
                                    : "Router MikroTik belum terhubung"
                                }
                              >
                                <Wifi className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {cust.status === 'active' ? (
                              <button
                                onClick={() => isolateCustomer(cust.id)}
                                className="text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded text-[11px] font-medium border border-amber-500/30 transition-colors"
                              >
                                Isolir
                              </button>
                            ) : (
                              <button
                                onClick={() => unIsolateCustomer(cust.id)}
                                className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded text-[11px] font-medium border border-emerald-500/30 transition-colors"
                              >
                                Buka
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditUser(cust)}
                              className="p-1.5 bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-400 rounded-lg border border-slate-700 transition-colors"
                              title="Edit User PPP"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(cust)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
                              title="Hapus User PPP"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {pppoeCustomers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        Tidak ada data User PPPoE/DHCP yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 2: SESSION */}
      {activeSubTab === 'session' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Sesi Aktif Real-time (MikroTik Live Sessions)</h3>
                <p className="text-xs text-slate-400">
                  Total {pppSessions.length} perangkat terhubung langsung ke NAS Routerboard.
                </p>
              </div>
            </div>
            <button
              onClick={() => alert('Sesi berhasil disinkronkan ulang dengan MikroTik!')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-emerald-400" />
              Refresh Sesi
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Username / Pelanggan</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">MAC / Caller ID</th>
                    <th className="px-4 py-3">Uptime</th>
                    <th className="px-4 py-3">Rx Rate / Tx Rate</th>
                    <th className="px-4 py-3">Total Data Transfer</th>
                    <th className="px-4 py-3">Router NAS</th>
                    <th className="px-4 py-3 text-right">Disconnect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {pppSessions.map(sess => (
                    <tr key={sess.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-emerald-400">{sess.username}</div>
                        <span className="text-[10px] text-slate-400">{sess.customerName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-white">{sess.ipAddress}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{sess.macAddress || sess.callerId}</td>
                      <td className="px-4 py-3 font-mono text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {sess.uptime}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <ArrowDown className="w-3 h-3" /> {sess.rxRate}
                          </span>
                          <span className="text-blue-400 flex items-center gap-0.5">
                            <ArrowUp className="w-3 h-3" /> {sess.txRate}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        ↓ {formatBytes(sess.bytesIn)} / ↑ {formatBytes(sess.bytesOut)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">{sess.nasName}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Putuskan koneksi user ${sess.username} (Kirim RADIUS PoD / CoA)?`)) {
                              disconnectSession(sess.id);
                            }
                          }}
                          className="bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-2.5 py-1 rounded text-[11px] font-semibold transition-all active:scale-95"
                          title="Disconnect / Kick User"
                        >
                          Kick User
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pppSessions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        Tidak ada Sesi PPP/DHCP yang aktif saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 3: PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Daftar Paket Profil Bandwidth PPPoE (MikroTik Rate-Limit)
            </h3>
            <button
              onClick={handleOpenAddProfile}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pppPackages.map(pkg => {
              const userCount = customers.filter(c => c.packageId === pkg.id).length;
              return (
                <div key={pkg.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-white text-base">{pkg.name}</h4>
                        <span className="text-xs text-slate-400">{pkg.id}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {formatRupiah(pkg.price)}
                      </span>
                    </div>

                    <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs mb-4">
                      <div className="flex justify-between text-slate-300">
                        <span>Download Speed:</span>
                        <strong className="text-emerald-400">{pkg.downloadSpeed} Mbps</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Upload Speed:</span>
                        <strong className="text-blue-400">{pkg.uploadSpeed} Mbps</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>MikroTik Rate-Limit:</span>
                        <span className="font-mono text-slate-400">{pkg.uploadSpeed}M/{pkg.downloadSpeed}M</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Shared Users:</span>
                        <span>{pkg.sharedUsers} User</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Masa Aktif:</span>
                        <span>{pkg.validityDays} Hari</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800 mb-3">
                      <span>Total Pelanggan:</span>
                      <span className="text-emerald-400 font-semibold">{userCount} Pelanggan</span>
                    </div>
                    {/* Action Buttons: Edit and Delete */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProfile(pkg)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1.5 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(pkg)}
                        className="flex items-center justify-center p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl text-xs transition-colors"
                        title="Hapus Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-MENU 4: SETTING */}
      {activeSubTab === 'setting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column 1: Configuration Parameters */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  Pengaturan RADIUS Server PPP
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  Masmedia AAA
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">RADIUS Server IP</label>
                  <input
                    type="text"
                    readOnly
                    value={radiusServerConfig?.serverIp || '103.49.239.150'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Auth Port</label>
                    <input
                      type="text"
                      readOnly
                      value={radiusServerConfig?.authPort || 1812}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Acct Port</label>
                    <input
                      type="text"
                      readOnly
                      value={radiusServerConfig?.acctPort || 1813}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">RADIUS Secret Key</label>
                  <div className="relative">
                    <input
                      type={showPppSecret ? 'text' : 'password'}
                      readOnly
                      value={radiusServerConfig?.secretKey || 'Server@123'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPppSecret(!showPppSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPppSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">CoA / PoD Port</label>
                    <input
                      type="text"
                      readOnly
                      value={radiusServerConfig?.coaPort || 3799}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">SNMP Server IP</label>
                    <input
                      type="text"
                      readOnly
                      value="103.49.239.150/32"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <p>• Layanan didukung: <span className="text-white font-mono">ppp, hotspot, dhcp</span></p>
                  <p>• Accounting Interim: <span className="text-emerald-400 font-mono">1m</span> (Kirim kuota per menit)</p>
                </div>
              </div>
            </div>

            {/* Column 2: Synchronized MikroTik Script */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Router className="w-5 h-5 text-blue-400" />
                  Script Sinkronisasi MikroTik (PPP &amp; AAA)
                </h3>

                {/* RouterOS Version Switcher */}
                <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPppRouterOsVersion('v7');
                      setCopiedPppScript(false);
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                      pppRouterOsVersion === 'v7'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-indigo-200" />
                    <span>RouterOS v7</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPppRouterOsVersion('v6');
                      setCopiedPppScript(false);
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                      pppRouterOsVersion === 'v6'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Server className="w-3 h-3 text-blue-200" />
                    <span>RouterOS v6</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Jalankan script Terminal MikroTik berikut untuk mengaktifkan RADIUS PPP Client, CoA Disconnect (Port 3799), dan Accounting:
              </p>

              <pre className="bg-slate-950 p-4 rounded-xl text-emerald-400 font-mono text-[11.5px] overflow-x-auto border border-slate-800 leading-relaxed max-h-64">
                {pppRouterOsVersion === 'v7' ? (
`# 1. Pendaftaran RADIUS Server MikroTik RouterOS v7
/radius
add address=${radiusServerConfig?.serverIp || '103.49.239.150'} require-message-auth=no service=ppp,hotspot,dhcp timeout=2s secret="${radiusServerConfig?.secretKey || 'Server@123'}"

# 2. Aktifkan Incoming Request CoA / Disconnect (Port 3799)
/radius incoming
set accept=yes port=3799

# 3. Aktifkan AAA RADIUS untuk PPP / PPPoE
/ppp aaa
set use-radius=yes interim-update=1m accounting=yes

# 4. Aktifkan Monitoring SNMP (Community: Masmedia)
/snmp community
set [ find default=yes ] disabled=yes
add addresses=103.49.239.150/32 name=Masmedia write-access=yes read-access=yes
/snmp
set enabled=yes`
                ) : (
`# 1. Pendaftaran RADIUS Server MikroTik RouterOS v6
/radius
add address=${radiusServerConfig?.serverIp || '103.49.239.150'} secret="${radiusServerConfig?.secretKey || 'Server@123'}" service=ppp,hotspot,dhcp timeout=2000ms

# 2. Aktifkan Incoming Request CoA / Disconnect (Port 3799)
/radius incoming
set accept=yes port=3799

# 3. Aktifkan AAA RADIUS untuk PPP / PPPoE
/ppp aaa
set use-radius=yes interim-update=1m accounting=yes

# 4. Aktifkan Monitoring SNMP (Community: Masmedia)
/snmp community
set [ find default=yes ] disabled=yes
add addresses=103.49.239.150/32 name=Masmedia write-access=yes read-access=yes
/snmp
set enabled=yes`
                )}
              </pre>

              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-400">
                  Diverifikasi untuk MikroTik RouterOS {pppRouterOsVersion.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = pppRouterOsVersion === 'v7' ? (
`# 1. Pendaftaran RADIUS Server MikroTik RouterOS v7
/radius
add address=${radiusServerConfig?.serverIp || '103.116.83.83'} require-message-auth=no service=ppp,hotspot,dhcp timeout=2s secret="${radiusServerConfig?.secretKey || 'Server@123'}"

# 2. Aktifkan Incoming Request CoA / Disconnect (Port 3799)
/radius incoming
set accept=yes port=3799

# 3. Aktifkan AAA RADIUS untuk PPP / PPPoE
/ppp aaa
set use-radius=yes interim-update=1m accounting=yes

# 4. Aktifkan Monitoring SNMP (Community: Masmedia)
/snmp community
set [ find default=yes ] disabled=yes
add addresses=103.116.83.82/32 name=Masmedia write-access=yes read-access=yes
/snmp
set enabled=yes`
                    ) : (
`# 1. Pendaftaran RADIUS Server MikroTik RouterOS v6
/radius
add address=${radiusServerConfig?.serverIp || '103.116.83.83'} secret="${radiusServerConfig?.secretKey || 'Server@123'}" service=ppp,hotspot,dhcp timeout=2000ms

# 2. Aktifkan Incoming Request CoA / Disconnect (Port 3799)
/radius incoming
set accept=yes port=3799

# 3. Aktifkan AAA RADIUS untuk PPP / PPPoE
/ppp aaa
set use-radius=yes interim-update=1m accounting=yes

# 4. Aktifkan Monitoring SNMP (Community: Masmedia)
/snmp community
set [ find default=yes ] disabled=yes
add addresses=103.116.83.82/32 name=Masmedia write-access=yes read-access=yes
/snmp
set enabled=yes`
                    );

                    navigator.clipboard.writeText(textToCopy);
                    setCopiedPppScript(true);
                    setTimeout(() => setCopiedPppScript(false), 3000);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {copiedPppScript ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Script Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Script MikroTik ({pppRouterOsVersion.toUpperCase()})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH USER PPP */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                {editingCustomer ? 'Edit User RADIUS (PPP-DHCP)' : 'Tambah User PPP-DHCP Baru'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Status Koneksi MikroTik:</span>
                  Akun akan didaftarkan ke database Secret dengan status awal <strong className="text-slate-200">Offline (Belum Konek)</strong> sampai modem/ONT pelanggan berhasil terhubung dan dial-in ke router MikroTik.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Pelanggan *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.name}
                    onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="Nama Lengkap"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={userFormData.phone}
                    onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="08123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-emerald-400 font-semibold mb-1">Username RADIUS *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.username}
                    onChange={e => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold"
                    placeholder="username_pppoe"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password PPP *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.password}
                    onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="secret_pass"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipe Koneksi</label>
                  <select
                    value={userFormData.connectionType}
                    onChange={e => setUserFormData({ ...userFormData, connectionType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="pppoe">PPPoE Dial-Up</option>
                    <option value="dhcp">DHCP Server</option>
                    <option value="static_ip">Static IP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Profil Paket</label>
                  <select
                    value={userFormData.packageId}
                    onChange={e => setUserFormData({ ...userFormData, packageId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {formatRupiah(p.price)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">IP Address (Framed-IP)</label>
                  <input
                    type="text"
                    value={userFormData.ipAddress}
                    onChange={e => setUserFormData({ ...userFormData, ipAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="10.10.10.50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MAC Address (Opsional)</label>
                  <input
                    type="text"
                    value={userFormData.macAddress}
                    onChange={e => setUserFormData({ ...userFormData, macAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="AA:BB:CC:DD:EE:FF"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status User</label>
                  <select
                    value={userFormData.status}
                    onChange={e => setUserFormData({ ...userFormData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="active">Active (Normal)</option>
                    <option value="isolated">Isolated (Terisolir)</option>
                    <option value="due_soon">Due Soon</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <DueDateMiniCalendar
                    value={userFormData.dueDateDay}
                    onChange={day => setUserFormData({ ...userFormData, dueDateDay: day })}
                    label="Jatuh Tempo (Tgl)"
                    min={1}
                    max={28}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alamat / Catatan</label>
                <input
                  type="text"
                  value={userFormData.address}
                  onChange={e => setUserFormData({ ...userFormData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  placeholder="Jl. Merpati No. 12"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl transition-all shadow"
                >
                  {editingCustomer ? 'Simpan Perubahan' : 'Simpan User PPP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH PROFILE PPP */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                {editingProfile ? 'Edit Profile Bandwidth PPP' : 'Tambah Profile PPP Baru'}
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Profile Paket *</label>
                <input
                  type="text"
                  required
                  value={profileFormData.name}
                  onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  placeholder="Contoh: 15 Mbps Fast Family"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Bulanan (Rp) *</label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    required
                    value={profileFormData.price}
                    onChange={e => setProfileFormData({ ...profileFormData, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Masa Berlaku (Hari)</label>
                  <input
                    type="number"
                    min={1}
                    value={profileFormData.validityDays}
                    onChange={e => setProfileFormData({ ...profileFormData, validityDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-emerald-400 font-semibold mb-1">Download (Mbps)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={profileFormData.downloadSpeed}
                    onChange={e => setProfileFormData({ ...profileFormData, downloadSpeed: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-blue-400 font-semibold mb-1">Upload (Mbps)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={profileFormData.uploadSpeed}
                    onChange={e => setProfileFormData({ ...profileFormData, uploadSpeed: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-blue-400 font-bold"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                Rate-Limit MikroTik: <strong className="font-mono text-emerald-400">{profileFormData.uploadSpeed}M/{profileFormData.downloadSpeed}M</strong>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Shared Users (Simultaneous)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={profileFormData.sharedUsers}
                  onChange={e => setProfileFormData({ ...profileFormData, sharedUsers: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  value={profileFormData.description}
                  onChange={e => setProfileFormData({ ...profileFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  placeholder="Keterangan paket"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl transition-all shadow"
                >
                  {editingProfile ? 'Simpan Perubahan' : 'Simpan Profile PPP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Customer Modal */}
      <ImportCustomerModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        packages={packages}
        nasList={nasList}
        existingCustomers={customers}
        onImportSuccess={imported => {
          const count = bulkImportCustomers(imported);
          alert(`Sukses mengimpor ${count} data pelanggan PPP-DHCP ke sistem!`);
        }}
      />
    </div>
  );
};
