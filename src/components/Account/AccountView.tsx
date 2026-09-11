import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminAccount, ISPProfile, TenantPlanId, SAAS_TENANT_PLANS, SmtpConfig } from '../../types';
import { AuditTrailAndBackupView } from '../Database/AuditTrailAndBackupView';
import { TenantManagement } from '../Tenants/TenantManagement';
import {
  getStoredSmtpConfig,
  saveStoredSmtpConfig,
  testSmtpConnection,
} from '../../services/emailService';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield,
  Upload,
  Image as ImageIcon,
  Building2,
  Wifi,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Globe,
  Receipt,
  Zap,
  Layers,
  CreditCard,
  ArrowUpRight,
  Activity,
  Server,
  Users,
  QrCode,
  AlertCircle,
  Check,
  Send,
  Sliders,
  CheckCheck,
  BookOpen,
} from 'lucide-react';
import { SuperAdminGuideModal } from './SuperAdminGuideModal';

export const AccountView: React.FC = () => {
  const {
    currentUser,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    ispProfile,
    updateISPProfile,
    currentTenant,
    tenants,
    switchTenant,
    upgradeTenantPlan,
    customers,
    hotspotVouchers,
    activeSessions,
    nasList,
    activeSubTab,
    setActiveSubTab,
  } = useApp();

  // Active Sub-tab: 'profil-usaha' | 'paket-layanan' | 'akun-pengguna' | 'mitra-isp' | 'smtp-config' | 'audit-log'
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [activeTab, setActiveTabState] = useState<'profil-usaha' | 'paket-layanan' | 'akun-pengguna' | 'mitra-isp' | 'smtp-config' | 'audit-log'>(() => {
    if (isSuperAdmin && (activeSubTab === 'smtp' || activeSubTab === 'smtp-config' || activeSubTab === 'email')) {
      return 'smtp-config';
    }
    if (isSuperAdmin && (activeSubTab === 'mitra' || activeSubTab === 'mitra-isp' || activeSubTab === 'tenants')) {
      return 'mitra-isp';
    }
    if (activeSubTab === 'paket-layanan' || activeSubTab === 'saas' || activeSubTab === 'plan') {
      return 'paket-layanan';
    }
    if (activeSubTab === 'akun-pengguna' || activeSubTab === 'users') {
      return 'akun-pengguna';
    }
    if (activeSubTab === 'audit-log' || activeSubTab === 'audit') {
      return 'audit-log';
    }
    return 'profil-usaha';
  });

  const setActiveTab = (tab: 'profil-usaha' | 'paket-layanan' | 'akun-pengguna' | 'mitra-isp' | 'smtp-config' | 'audit-log') => {
    if (!isSuperAdmin && (tab === 'smtp-config' || tab === 'mitra-isp')) {
      setActiveTabState('profil-usaha');
      return;
    }
    setActiveTabState(tab);
    if (setActiveSubTab) {
      setActiveSubTab(tab);
    }
  };

  // Sync if activeSubTab changes from external navigation (e.g. Upgrade prompt button)
  useEffect(() => {
    if (activeSubTab === 'smtp' || activeSubTab === 'smtp-config' || activeSubTab === 'email') {
      setActiveTabState(isSuperAdmin ? 'smtp-config' : 'profil-usaha');
    } else if (activeSubTab === 'mitra' || activeSubTab === 'mitra-isp' || activeSubTab === 'tenants') {
      setActiveTabState(isSuperAdmin ? 'mitra-isp' : 'profil-usaha');
    } else if (activeSubTab === 'paket-layanan' || activeSubTab === 'saas' || activeSubTab === 'plan') {
      setActiveTabState('paket-layanan');
    } else if (activeSubTab === 'akun-pengguna' || activeSubTab === 'users') {
      setActiveTabState('akun-pengguna');
    } else if (activeSubTab === 'audit-log' || activeSubTab === 'audit') {
      setActiveTabState('audit-log');
    } else if (activeSubTab === 'profil-usaha' || activeSubTab === 'profile') {
      setActiveTabState('profil-usaha');
    }
  }, [activeSubTab, isSuperAdmin]);

  // SaaS Upgrade Modal State
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<TenantPlanId | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'tripay_qris' | 'bca_va' | 'bri_va' | 'mandiri_va' | 'manual'>('tripay_qris');
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Business / ISP Profile Form State
  const [profileForm, setProfileForm] = useState<ISPProfile>({
    brandName: ispProfile?.brandName || 'Masmedia Network',
    wifiName: ispProfile?.wifiName || 'Masmedia-WiFi-Hotspot',
    logoUrl: ispProfile?.logoUrl || '',
    email: ispProfile?.email || 'masnawi910@gmail.com',
    phone: ispProfile?.phone || '0851-5767-1244',
    address: ispProfile?.address || 'Jl. Merdeka No. 45, RT 02/RW 03, Kel. Sukamaju',
    footerNote: ispProfile?.footerNote || 'Terima kasih atas pembayaran Anda. Simpan bukti ini sebagai konfirmasi resmi pembayaran.',
    website: ispProfile?.website || 'https://masmedia.rtrw.net',
  });
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // SMTP Settings State
  const [smtpForm, setSmtpForm] = useState<SmtpConfig>(() => {
    const saved = getStoredSmtpConfig();
    return {
      host: saved.host || 'smtp.gmail.com',
      port: saved.port || 587,
      secure: saved.secure || false,
      user: saved.user || (ispProfile?.email || 'masnawi910@gmail.com'),
      pass: saved.pass || '',
      fromName: saved.fromName || (ispProfile?.brandName || 'Masmedia Network'),
      fromEmail: saved.fromEmail || (ispProfile?.email || 'masnawi910@gmail.com'),
      isEnabled: saved.isEnabled ?? true,
    };
  });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpToast, setSmtpToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSmtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSmtp(true);
    try {
      const cleanPass = (smtpForm.pass || '').replace(/\s+/g, '').trim();
      const updated: SmtpConfig = {
        ...smtpForm,
        pass: cleanPass,
        isEnabled: true,
      };
      setSmtpForm(updated);
      saveStoredSmtpConfig(updated);

      // Also persist to backend server runtime
      await fetch('/api/email/save-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(err => console.warn('Save SMTP backend sync:', err));

      setSmtpToast({ type: 'success', text: '✅ Pengaturan Server SMTP & Email Berhasil Disimpan!' });
      setTimeout(() => setSmtpToast(null), 4500);
    } catch (err: any) {
      setSmtpToast({ type: 'error', text: '❌ Gagal menyimpan: ' + (err.message || 'Error') });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    const targetEmail = prompt('Masukkan alamat email penerima untuk uji coba pengiriman:', smtpForm.user || 'masservi4@gmail.com');
    if (!targetEmail || !targetEmail.trim()) return;

    setIsTestingSmtp(true);
    setSmtpToast(null);

    const cleanPass = (smtpForm.pass || '').replace(/\s+/g, '').trim();
    const configToTest: SmtpConfig = {
      ...smtpForm,
      pass: cleanPass,
    };

    try {
      const result = await testSmtpConnection(configToTest, targetEmail.trim());
      if (result.success) {
        setSmtpToast({
          type: 'success',
          text: `✅ Email uji coba BERHASIL terkirim ke "${targetEmail}"! Silakan cek Kotak Masuk (Inbox / Spam).`,
        });
      } else {
        setSmtpToast({
          type: 'error',
          text: `❌ Gagal Mengirim: ${result.message}`,
        });
      }
    } catch (err: any) {
      setSmtpToast({
        type: 'error',
        text: `❌ Terjadi kesalahan: ${err.message || 'Koneksi gagal'}`,
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Accounts Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Account Form state
  const [accountFormData, setAccountFormData] = useState<Partial<AdminAccount>>({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'operator',
    status: 'active',
    permissions: ['radius', 'billing_view'],
  });

  const availablePermissions = [
    { key: 'all', label: 'Akses Penuh (Super Admin)' },
    { key: 'billing', label: 'Kelola Billing & Tagihan' },
    { key: 'billing_view', label: 'Lihat Tagihan (Read-Only)' },
    { key: 'radius', label: 'Kelola RADIUS & MikroTik' },
    { key: 'ftth', label: 'Kelola FTTH & OLT' },
    { key: 'tr069', label: 'Kelola TR-069 & GenieACS' },
    { key: 'payment', label: 'Kelola Kanal Pembayaran' },
    { key: 'whatsapp_notice', label: 'Kirim Notifikasi WhatsApp' },
    { key: 'report', label: 'Lihat Laporan Keuangan' },
  ];

  // Handle Logo Upload via FileReader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileForm(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateISPProfile(profileForm);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
    }, 3500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setShowFormPassword(false);
    setAccountFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      role: 'operator',
      status: 'active',
      permissions: ['radius', 'billing_view'],
      tenantId: currentTenant?.id,
      tenantName: currentTenant?.name,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (acc: AdminAccount) => {
    setEditingId(acc.id);
    setShowFormPassword(false);
    setAccountFormData({
      email: acc.email,
      password: acc.password || 'admin123',
      name: acc.name,
      phone: acc.phone,
      role: acc.role,
      status: acc.status,
      permissions: acc.permissions,
      tenantId: acc.tenantId || currentTenant?.id,
      tenantName: acc.tenantName || currentTenant?.name,
    });
    setShowModal(true);
  };

  const handleTogglePermission = (permKey: string) => {
    const current = accountFormData.permissions || [];
    if (current.includes(permKey)) {
      setAccountFormData({ ...accountFormData, permissions: current.filter(p => p !== permKey) });
    } else {
      setAccountFormData({ ...accountFormData, permissions: [...current, permKey] });
    }
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.email || !accountFormData.name) {
      alert('Email dan Nama Lengkap harus diisi!');
      return;
    }

    const emailVal = accountFormData.email.trim();
    const nameVal = accountFormData.name.trim();
    const passVal = accountFormData.password?.trim() || '123456';

    if (editingId) {
      updateAccount(editingId, {
        ...accountFormData,
        email: emailVal,
        username: emailVal,
        password: passVal,
        name: nameVal,
      });
    } else {
      addAccount({
        username: emailVal,
        email: emailVal,
        password: passVal,
        name: nameVal,
        phone: accountFormData.phone || '081234567890',
        role: (accountFormData.role as any) || 'operator',
        status: (accountFormData.status as any) || 'active',
        permissions: accountFormData.permissions || ['billing_view'],
        tenantId: accountFormData.tenantId || currentTenant?.id,
        tenantName: accountFormData.tenantName || (tenants.find(t => t.id === (accountFormData.tenantId || currentTenant?.id))?.name) || currentTenant?.name,
      });
    }
    setShowModal(false);
  };

  // Filter accounts strictly by current tenant, tenantFilter, role and search
  const filteredAccounts = accounts
    .filter(acc => {
      // If user is superadmin and set a tenant filter
      if (currentUser?.role === 'superadmin') {
        if (tenantFilter !== 'all') {
          return acc.tenantId === tenantFilter;
        }
        return true;
      }
      // Non-superadmin partners must ONLY see accounts belonging to their tenant
      return acc.tenantId === currentTenant?.id;
    })
    .filter(acc => {
      const sTerm = (searchTerm || '').toLowerCase();
      const matchSearch =
        (acc.name || '').toLowerCase().includes(sTerm) ||
        (acc.email || '').toLowerCase().includes(sTerm) ||
        (acc.username || '').toLowerCase().includes(sTerm) ||
        (acc.tenantName || '').toLowerCase().includes(sTerm);
      const matchRole = roleFilter === 'all' || acc.role === roleFilter;
      return matchSearch && matchRole;
    });

  const getRoleBadge = (role: AdminAccount['role']) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'admin':
        return 'bg-blue-500/20 text-white border-blue-500/40';
      case 'teknisi':
        return 'bg-blue-500/20 text-white border-blue-500/40';
      case 'kasir':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600';
    }
  };

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Pengaturan Admin & Manajemen Akun
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Profil Usaha & Akun Pengguna
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Atur logo, nama WiFi, kontak, dan alamat untuk ditampilkan di invoice, serta kelola akun akses sistem.
            </p>
          </div>

          {/* Action on Header */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-white border border-blue-500/40 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              title="Buka buku panduan lengkap manajemen akun dan instalasi ID Cloud"
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span>Buku Panduan Super Admin</span>
              <span className="text-[10px] bg-blue-500/30 text-white px-1.5 py-0.5 rounded font-mono hidden sm:inline">
                Akun & ID Cloud
              </span>
            </button>

            {activeTab === 'akun-pengguna' && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex-shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Tambah Akun Pengguna
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 gap-2 pt-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profil-usaha')}
            className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profil-usaha'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil Usaha & Kop Surat Invoice</span>
          </button>
          {/* Konfigurasi Email & SMTP (Hanya Superadmin) */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('smtp-config')}
              className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'smtp-config'
                  ? 'border-pink-500 text-pink-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4 text-pink-400" />
              <span>Konfigurasi Email & SMTP</span>
              <span className="text-[10px] bg-pink-500/20 text-pink-300 font-mono px-2 py-0.5 rounded-full border border-pink-500/30">
                Notifikasi
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('paket-layanan')}
            className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'paket-layanan'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Paket & Kuota Layanan SaaS</span>
            <span className="text-[10px] bg-blue-500/20 text-white font-mono px-2 py-0.5 rounded-full border border-blue-500/30 uppercase">
              {currentTenant?.plan || 'Starter'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('akun-pengguna')}
            className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'akun-pengguna'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Manajemen Akun Pengguna ({accounts.length})</span>
          </button>
          {/* Data Mitra & Cabang ISP (Hanya Superadmin) */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('mitra-isp')}
              className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'mitra-isp'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Data Mitra & Cabang ISP ({tenants.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('audit-log')}
            className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit-log'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Audit Trail & Backup Data JSON</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessToast && (
        <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-white flex items-center justify-between text-xs animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <div>
              <span className="font-bold">Pengaturan Berhasil Disimpan!</span>
              <p className="text-[11px] text-white/90">
                Logo, nama WiFi, nomor HP, email, dan alamat kini otomatis tampil pada seluruh Invoice & Kuitansi Cetak.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessToast(false)}
            className="text-white hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: PROFIL USAHA & PENGATURAN INVOICE */}
      {activeTab === 'profil-usaha' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-pink-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Data Identitas Usaha & Tagihan
                  </h2>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                  Digunakan di Invoice
                </span>
              </div>

              {/* 1. Upload Logo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Logo Usaha / ISP / RT-RW Net
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  {/* Logo Preview Box */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 relative group shadow-md">
                    {profileForm.logoUrl ? (
                      <img
                        src={profileForm.logoUrl}
                        alt="Logo Usaha"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <Wifi className="w-8 h-8 mx-auto text-white mb-1" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Default</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Logo</span>
                      </button>

                      {profileForm.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileForm(prev => ({ ...prev, logoUrl: '' }))}
                          className="px-3 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
                        >
                          Hapus Logo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Format: PNG, JPG, atau SVG (Maks. 2MB). Logo ini akan tercetak pada kop surat invoice dan struk pembayaran.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Nama Usaha / Brand ISP */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Nama Usaha / Brand ISP <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="contoh: Masmedia Network"
                    value={profileForm.brandName}
                    onChange={e => setProfileForm(prev => ({ ...prev, brandName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                  />
                </div>
              </div>

              {/* 3. Email Usaha & Nomor HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Email Resmi Usaha <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="contoh: masnawi910@gmail.com"
                      value={profileForm.email}
                      onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Nomor WhatsApp / HP CS <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="contoh: 0851-5767-1244"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Alamat Lengkap Usaha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Alamat Kantor / Domisili Usaha <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    required
                    placeholder="contoh: Jl. Merdeka No. 45, RT 02/RW 03, Kel. Sukamaju, Kec. Cibeunying"
                    value={profileForm.address}
                    onChange={e => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                  />
                </div>
              </div>

              {/* 5. Catatan Kaki / Footer Invoice */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Catatan Kaki Invoice (Footer Note)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="contoh: Terima kasih atas pembayaran Anda. Simpan bukti ini sebagai konfirmasi resmi."
                    value={profileForm.footerNote}
                    onChange={e => setProfileForm(prev => ({ ...prev, footerNote: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil & Invoice</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Invoice Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white" />
                  <h3 className="text-xs font-bold text-white">
                    Live Pratinjau Kop Surat Invoice
                  </h3>
                </div>
                <span className="text-[10px] text-white font-bold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  Tampilan Real-Time
                </span>
              </div>

              {/* Paper Preview Simulation */}
              <div className="bg-white text-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-xs space-y-4">
                {/* Header Kop Surat */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {profileForm.logoUrl ? (
                        <img
                          src={profileForm.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <Wifi className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white uppercase tracking-tight leading-tight">
                        {profileForm.brandName || 'Masmedia Network'}
                      </h4>
                      <p className="text-[9px] text-slate-500 leading-tight max-w-[200px]">
                        {profileForm.address || 'Alamat Usaha'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[9px] text-slate-600 space-y-0.5">
                    <div className="font-mono font-bold text-white text-[10px]">INVOICE</div>
                    <div>WA: <b>{profileForm.phone}</b></div>
                    <div>{profileForm.email}</div>
                  </div>
                </div>

                {/* Preview Format Body */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-[10px]">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Pelanggan: [Nama Pelanggan]</span>
                    <span className="font-mono text-white font-bold">LUNAS</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1">
                    <span>Paket Internet 20 Mbps Family (1 Bulan)</span>
                    <span className="font-bold text-white">Rp 175.000</span>
                  </div>
                  <div className="flex justify-between font-black text-white border-t-2 border-slate-300 pt-1 text-[11px]">
                    <span>TOTAL PEMBAYARAN:</span>
                    <span className="text-white">Rp 175.000</span>
                  </div>
                </div>

                {/* Dummy Footer Note */}
                <div className="text-[9px] text-slate-500 italic border-t border-slate-200 pt-2 text-center">
                  "{profileForm.footerNote || 'Terima kasih atas pembayaran Anda.'}"
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-pink-400 font-bold">✓ Otomatis Terintegrasi:</span> Informasi di atas akan digunakan pada cetak kuitansi satuan, cetak massal (*Batch Print*), struk thermal, dan pesan invoice WhatsApp.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: KONFIGURASI EMAIL & SMTP (SUPERADMIN ONLY) */}
      {activeTab === 'smtp-config' && isSuperAdmin && (
        <div className="space-y-6 animate-fadeIn">
          {/* Toast Notification Banner */}
          {smtpToast && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
                smtpToast.type === 'success'
                  ? 'bg-blue-500/10 border-blue-500/30 text-white'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {smtpToast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{smtpToast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setSmtpToast(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Card Info & Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-inner">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">
                    Pengaturan Server Email Keluar (SMTP)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Konfigurasi SMTP digunakan untuk mengirim Email Aktivasi Akun Pengguna Baru, Kode OTP Verifikasi, dan Notifikasi Tagihan Invoice.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSmtpForm(prev => ({
                      ...prev,
                      host: 'smtp.gmail.com',
                      port: 587,
                      secure: false,
                      fromName: profileForm.brandName || 'Masmedia Network',
                      fromEmail: smtpForm.user || profileForm.email || 'masnawi910@gmail.com',
                    }));
                    setSmtpToast({ type: 'success', text: '⚡ Preset Gmail (smtp.gmail.com:587) telah diterapkan. Silakan isi password sandi aplikasi Anda!' });
                  }}
                  className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1.5 font-bold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Preset Gmail 1-Klik
                </button>
              </div>
            </div>

            {/* Variable Guide Reference Table */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/90 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" />
                <span>Panduan Nilai Variabel Server SMTP</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 text-[11px] font-mono uppercase">
                    <tr>
                      <th className="px-3 py-2 rounded-l-xl">Nama Variabel</th>
                      <th className="px-3 py-2">Fungsi / Penjelasan</th>
                      <th className="px-3 py-2 rounded-r-xl">Contoh Nilai (Gmail / Webmail)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300 text-[11px]">
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-pink-300">SMTP_HOST</td>
                      <td className="px-3 py-2">Alamat server keluar email pengirim</td>
                      <td className="px-3 py-2 font-mono text-white">smtp.gmail.com / mail.domain.com</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-pink-300">SMTP_PORT</td>
                      <td className="px-3 py-2">Port koneksi server SMTP</td>
                      <td className="px-3 py-2 font-mono text-white">587 (STARTTLS) atau 465 (SSL)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-pink-300">SMTP_SECURE</td>
                      <td className="px-3 py-2">Enkripsi SSL langsung</td>
                      <td className="px-3 py-2 font-mono text-white">false (port 587) / true (port 465)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-pink-300">SMTP_USER</td>
                      <td className="px-3 py-2">Alamat email akun pengirim</td>
                      <td className="px-3 py-2 font-mono text-white">masnawi910@gmail.com</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-pink-300">SMTP_PASS</td>
                      <td className="px-3 py-2">Sandi Aplikasi 16 huruf (Gmail) tanpa spasi</td>
                      <td className="px-3 py-2 font-mono text-white">ibwsvdhgdppxrmnl (16 karakter)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-pink-300">SMTP_FROM</td>
                      <td className="px-3 py-2">Nama & email header yang tampil di inbox penerima</td>
                      <td className="px-3 py-2 font-mono text-white">"Masmedia Network" &lt;masnawi910@gmail.com&gt;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Settings Box */}
            <form onSubmit={handleSaveSmtp} className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Form Left */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    SMTP Host / Server <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpForm.host}
                    onChange={e => setSmtpForm(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-pink-500 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      SMTP Port <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={smtpForm.port}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10) || 587;
                        setSmtpForm(prev => ({
                          ...prev,
                          port: val,
                          secure: val === 465,
                        }));
                      }}
                      placeholder="587"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-pink-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Enkripsi Keamanan
                    </label>
                    <select
                      value={smtpForm.secure || smtpForm.port === 465 ? 'ssl' : 'tls'}
                      onChange={e => {
                        const isSsl = e.target.value === 'ssl';
                        setSmtpForm(prev => ({
                          ...prev,
                          secure: isSsl,
                          port: isSsl ? 465 : 587,
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:border-pink-500 transition-all outline-none"
                    >
                      <option value="tls">STARTTLS (Port 587)</option>
                      <option value="ssl">SSL / TLS (Port 465)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Email Pengirim (SMTP User) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={smtpForm.user}
                    onChange={e => setSmtpForm(prev => ({ ...prev, user: e.target.value }))}
                    placeholder="emailanda@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-pink-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      Password / Sandi Aplikasi Google (SMTP Pass) <span className="text-pink-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-medium"
                    >
                      {showSmtpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showSmtpPass ? 'Sembunyikan' : 'Lihat Sandi'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSmtpPass ? 'text' : 'password'}
                      required
                      value={smtpForm.pass}
                      onChange={e => {
                        const cleaned = e.target.value.replace(/\s+/g, '');
                        setSmtpForm(prev => ({ ...prev, pass: cleaned }));
                      }}
                      placeholder="16 karakter sandi aplikasi (contoh: ibwsvdhgdppxrmnl)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-pink-500 transition-all outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    💡 *Spasi otomatis dihapus oleh sistem agar langsung valid untuk Google SMTP.*
                  </p>
                </div>
              </div>

              {/* Form Right & Actions */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Nama Pengirim Header
                      </label>
                      <input
                        type="text"
                        value={smtpForm.fromName}
                        onChange={e => setSmtpForm(prev => ({ ...prev, fromName: e.target.value }))}
                        placeholder="Masmedia Network"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Email Pengirim Header
                      </label>
                      <input
                        type="email"
                        value={smtpForm.fromEmail}
                        onChange={e => setSmtpForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                        placeholder="noreply@domain.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-pink-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCheck className="w-4 h-4" />
                      <span>Mode Cerdas & Proteksi Pengiriman</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Setelah pengaturan disimpan dan password diisi, seluruh email aktivasi pengguna baru dan notifikasi tagihan akan terkirim secara nyata dari server Google ke kotak masuk penerima.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSavingSmtp}
                    className="flex-1 py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSavingSmtp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSavingSmtp ? 'Menyimpan...' : 'Simpan Pengaturan SMTP'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isTestingSmtp}
                    onClick={handleTestSmtp}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isTestingSmtp ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                    <span>{isTestingSmtp ? 'Sedang Menguji...' : 'Uji Kirim Email Tes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PAKET & KUOTA LAYANAN SAAS */}
      {activeTab === 'paket-layanan' && (
        <div className="space-y-6">
          {/* Upgrade Success Notification */}
          {upgradeSuccessMsg && (
            <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-white flex items-center justify-between text-xs animate-fadeIn shadow-lg">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                <span className="font-semibold">{upgradeSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setUpgradeSuccessMsg(null)}
                className="text-white hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Current Active Plan Status Banner */}
          {(() => {
            const planKey = (currentTenant?.plan as TenantPlanId) || 'starter';
            const currentPlanSpec = SAAS_TENANT_PLANS[planKey] || SAAS_TENANT_PLANS.starter;
            const pppCount = customers.filter(c => !c.connectionType || c.connectionType === 'pppoe' || c.connectionType === 'static' || c.connectionType === 'dhcp').length;
            const maxPpp = currentTenant?.maxPppoeUsers || currentPlanSpec.maxPppoeUsers;
            const hotspotCount = hotspotVouchers.length;
            const maxHotspot = currentTenant?.maxHotspotUsers || currentPlanSpec.maxHotspotUsers;
            const activeHotspotCount = activeSessions.filter(s => s.service === 'hotspot').length;
            const maxActiveHotspot = currentTenant?.maxActiveHotspotSessions || currentPlanSpec.maxActiveHotspotSessions;
            const nasCount = nasList.length;
            const maxNas = currentTenant?.maxNas || currentPlanSpec.maxNas;

            const pppPct = maxPpp >= 999999 ? 5 : Math.min(100, Math.round((pppCount / maxPpp) * 100));
            const hotspotPct = maxHotspot >= 999999 ? 5 : Math.min(100, Math.round((hotspotCount / maxHotspot) * 100));
            const activePct = maxActiveHotspot >= 999999 ? 5 : Math.min(100, Math.round((activeHotspotCount / maxActiveHotspot) * 100));
            const nasPct = maxNas >= 50 ? 5 : Math.min(100, Math.round((nasCount / maxNas) * 100));

            return (
              <div className="space-y-6">
                {/* Active Plan Card Header */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-500/20 text-white font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-blue-500/30 uppercase flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          Paket {currentPlanSpec.name} ({(currentTenant?.plan || currentPlanSpec.id || 'starter').toUpperCase()})
                        </span>
                        <span className="text-xs text-slate-400">
                          ID Cabang: <b className="text-slate-200 font-mono">{currentTenant?.code || 'CAB-01'}</b>
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {currentTenant?.name || 'ISP Mitra RT-RW Net'}
                      </h2>
                      <p className="text-xs text-slate-400 max-w-2xl">
                        Biaya sewa bulanan: <b className="text-white font-mono font-bold text-sm">Rp {(currentTenant?.priceMonthly || currentPlanSpec.priceMonthly).toLocaleString('id-ID')} / bulan</b>. Tagihan sewa jatuh tempo setiap tanggal <b className="text-slate-200 font-mono">{currentTenant?.billingCycleDay || 10}</b>. Masa aktif lisensi hingga: <b className="text-white font-mono">{currentTenant?.expiryDate || '2027-12-31'}</b>.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const nextPlan: TenantPlanId = planKey === 'starter' ? 'basic' : planKey === 'basic' ? 'pro' : 'enterprise';
                          setSelectedUpgradePlan(nextPlan);
                          setShowUpgradeModal(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        Upgrade / Perpanjang Paket
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 Live Quota Utilization Meters */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-white" />
                      Status Penggunaan Kuota Layanan Cabang
                    </h3>
                    <span className="text-[11px] text-slate-400">Diperbarui realtime otomatis</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Meter 1: Pelanggan PPP */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                          <Users className="w-4 h-4 text-white" />
                          <span>Pelanggan PPP</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          pppPct > 90 ? 'bg-rose-500/20 text-rose-300' : pppPct > 75 ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-white'
                        }`}>
                          {pppPct}%
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-white font-mono">{pppCount}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          / {maxPpp >= 999999 ? 'Unlimited' : `${maxPpp.toLocaleString('id-ID')} User`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pppPct > 90 ? 'bg-rose-500' : pppPct > 75 ? 'bg-amber-400' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.max(5, pppPct)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {maxPpp >= 999999 ? 'Tanpa batasan kuota pelanggan' : `Sisa kuota: ${Math.max(0, maxPpp - pppCount)} pelanggan`}
                      </p>
                    </div>

                    {/* Meter 2: Database Voucher Hotspot */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                          <Wifi className="w-4 h-4 text-amber-400" />
                          <span>User Hotspot</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          hotspotPct > 90 ? 'bg-rose-500/20 text-rose-300' : hotspotPct > 75 ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {hotspotPct}%
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-white font-mono">{hotspotCount}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          / {maxHotspot >= 999999 ? 'Unlimited' : `${maxHotspot.toLocaleString('id-ID')} User`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            hotspotPct > 90 ? 'bg-rose-500' : hotspotPct > 75 ? 'bg-amber-400' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(5, hotspotPct)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {maxHotspot >= 999999 ? 'Kapasitas database voucher unlimited' : `Sisa: ${Math.max(0, maxHotspot - hotspotCount)} voucher`}
                      </p>
                    </div>

                    {/* Meter 3: Sesi Hotspot Aktif */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                          <Activity className="w-4 h-4 text-pink-400" />
                          <span>Sesi Aktif</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          activePct > 90 ? 'bg-rose-500/20 text-rose-300' : 'bg-pink-500/20 text-pink-300'
                        }`}>
                          {activePct}%
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-white font-mono">{activeHotspotCount}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          / {maxActiveHotspot >= 999999 ? 'Unlimited' : `${maxActiveHotspot.toLocaleString('id-ID')} Sesi`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-pink-500"
                          style={{ width: `${Math.max(5, activePct)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {maxActiveHotspot >= 999999 ? 'Bebas trafik sesi simultan' : `Maks: ${maxActiveHotspot} perangkat`}
                      </p>
                    </div>

                    {/* Meter 4: Router NAS */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                          <Server className="w-4 h-4 text-white" />
                          <span>MikroTik (NAS)</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-white">
                          {nasPct}%
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-white font-mono">{nasCount}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          / {maxNas >= 999999 ? 'Unlimited' : `${maxNas} Unit`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-blue-500"
                          style={{ width: `${Math.max(10, (nasCount / (maxNas >= 999999 ? 100 : maxNas)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Sinkronisasi RADIUS MikroTik aktif
                      </p>
                    </div>

                    {/* Meter 5: Gratis VPN BILLSPOT */}
                    <div className="bg-slate-900/90 border border-pink-500/30 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-pink-300 text-xs font-semibold">
                          <Zap className="w-4 h-4 text-pink-400" />
                          <span>VPN BILLSPOT</span>
                        </div>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          GRATIS
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-pink-400 font-mono">
                          {currentTenant?.freeVpnBillspot || currentPlanSpec.freeVpnBillspot}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Akun VPN Aktif
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-pink-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <p className="text-[10px] text-pink-300/80 font-medium">
                        Termasuk IP Public/Port Forwarding
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5 SaaS Subscription Plans Comparison Grid */}
                <div className="space-y-4 pt-2">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      Pilihan Paket Langganan & Sewa Bulanan Mitra Pengelola
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pilih paket yang sesuai dengan kapasitas jaringan dan jumlah pelanggan RT-RW Net cabang Anda. Upgrade otomatis aktif realtime setelah pembayaran.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {(Object.keys(SAAS_TENANT_PLANS) as TenantPlanId[]).map(pId => {
                      const spec = SAAS_TENANT_PLANS[pId];
                      const isCurrent = planKey === pId;

                      return (
                        <div
                          key={pId}
                          className={`rounded-3xl p-4 border flex flex-col justify-between transition-all duration-200 relative ${
                            isCurrent
                              ? 'bg-slate-900 border-blue-500/80 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30'
                              : spec.popular
                              ? 'bg-slate-900/90 border-pink-500/60 shadow-lg shadow-pink-500/10'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Badge tag */}
                          {(spec.popular || pId === 'pro' || pId === 'enterprise' || pId === 'standar') && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span className={`text-[9px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full border shadow-sm whitespace-nowrap ${
                                spec.popular
                                  ? 'bg-pink-500 text-white border-pink-400'
                                  : pId === 'enterprise'
                                  ? 'bg-purple-600 text-white border-purple-400'
                                  : pId === 'pro'
                                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                                  : 'bg-indigo-600 text-white border-indigo-400'
                              }`}>
                                {spec.popular ? 'POPULER' : pId === 'enterprise' ? 'UNLIMITED' : pId === 'pro' ? 'PRO BISNIS' : 'STANDAR'}
                              </span>
                            </div>
                          )}

                          <div>
                            {/* Card Header */}
                            <div className="border-b border-slate-800/80 pb-3 pt-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-black text-white">{spec.name}</h4>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-white bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 min-h-[30px] leading-tight">{spec.recommendedFor}</p>
                              
                              <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-xl font-black text-white font-mono tracking-tight">
                                  Rp {spec.priceMonthly.toLocaleString('id-ID')}
                                </span>
                                <span className="text-xs text-slate-400">/bln</span>
                              </div>
                            </div>

                            {/* Quota Specs List */}
                            <div className="py-3 space-y-2 text-xs">
                              <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                                Kuota Kapasitas:
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-200 text-[11px]">
                                <Users className="w-3.5 h-3.5 text-white flex-shrink-0" />
                                <span><b>{spec.maxPppoeUsers >= 999999 ? 'Unlimited' : `${spec.maxPppoeUsers.toLocaleString('id-ID')}`}</b> User PPP</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-200 text-[11px]">
                                <Wifi className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                <span><b>{spec.maxHotspotUsers >= 999999 ? 'Unlimited' : `${spec.maxHotspotUsers.toLocaleString('id-ID')}`}</b> Voucher</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-200 text-[11px]">
                                <Activity className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                                <span><b>{spec.maxActiveHotspotSessions >= 999999 ? 'Unlimited' : `${spec.maxActiveHotspotSessions.toLocaleString('id-ID')}`}</b> Sesi Aktif</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-200 text-[11px]">
                                <Server className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                <span><b>{spec.maxNas >= 999999 ? 'Unlimited' : spec.maxNas}</b> Router MikroTik</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-pink-300 text-[11px] font-semibold bg-pink-950/30 p-1.5 rounded-lg border border-pink-500/20">
                                <Zap className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                                <span>Gratis <b>{spec.freeVpnBillspot}</b> VPN BILLSPOT</span>
                              </div>

                              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  Fitur Unggulan:
                                </div>
                                {spec.features.slice(5, 8).map((feat, idx) => {
                                  const isExcluded = feat.startsWith('❌');
                                  const cleanFeat = feat.replace(/^[❌✅]\s*/, '');
                                  return (
                                    <div key={idx} className={`flex items-start gap-1.5 text-[10.5px] ${isExcluded ? 'text-slate-500' : 'text-slate-300'}`}>
                                      {isExcluded ? (
                                        <span className="text-rose-400 text-xs flex-shrink-0 font-bold">✕</span>
                                      ) : (
                                        <Check className="w-3 h-3 text-white flex-shrink-0 mt-0.5" />
                                      )}
                                      <span className={isExcluded ? 'line-through opacity-80' : ''}>{cleanFeat}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 border-t border-slate-800/80">
                            {isCurrent ? (
                              <button
                                type="button"
                                disabled
                                className="w-full bg-blue-500/20 border border-blue-500/40 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Aktif
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUpgradePlan(pId);
                                  setShowUpgradeModal(true);
                                }}
                                className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                  spec.popular
                                    ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/20'
                                    : 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20'
                                }`}
                              >
                                <span>Pilih Paket</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info Payment Gateway & SLA Box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-white">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Sistem Pembayaran Sewa Otomatis & Gateway Tripay / VA</div>
                      <p className="text-slate-400 mt-0.5">
                        Pembayaran sewa bulanan cabang diproses secara instan melalui Tripay QRIS Nasional (biaya admin 0.7% terendah) atau Virtual Account BCA, BRI, Mandiri, dan BNI. Notifikasi perpanjangan otomatis dikirimkan ke WhatsApp pemilik cabang 3 hari sebelum jatuh tempo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: MANAJEMEN AKUN PENGGUNA */}
      {activeTab === 'akun-pengguna' && (
        <div className="space-y-6">
          {/* Multi-Tenant Scope Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Cabang Aktif:</span>
                  <span className="text-pink-400 font-mono font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                    {currentTenant?.name || 'ISP Utama'} ({currentTenant?.code || 'CAB-01'})
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {currentUser?.role === 'superadmin'
                    ? `Mode Super Admin: Menampilkan total ${accounts.length} akun pengguna terdaftar di seluruh cabang.`
                    : `Menampilkan akun staf & operator yang terdaftar di cabang ${currentTenant?.name || 'ini'}.`}
                </p>
              </div>
            </div>
            {currentUser?.role === 'superadmin' && tenants.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Filter Cabang:</span>
                <select
                  value={tenantFilter}
                  onChange={e => setTenantFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="all">🌐 Semua Cabang / Mitra ({tenants.length})</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code || t.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, email login, username, atau nama mitra..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Semua Peran (Role)</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="teknisi">Teknisi</option>
                <option value="kasir">Kasir</option>
                <option value="operator">Operator NOC</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + Tambah Akun Pengguna
            </button>
          </div>

          {/* Account Grid */}
          {filteredAccounts.length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-white flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-white">Tidak Ada Akun Pengguna yang Cocok</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tidak ditemukan akun pengguna dengan kata kunci atau filter peran yang dipilih.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                + Tambah Akun Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccounts.map(acc => {
                const isRevealed = !!revealedPasswords[acc.id];
                return (
                  <div
                    key={acc.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                            {acc.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-base">{acc.name}</h3>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-slate-400 font-mono">{acc.email}</span>
                              {acc.tenantName && (
                                <span className="text-[10px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-1.5 py-0.5 rounded font-mono">
                                  {acc.tenantName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getRoleBadge(
                            acc.role
                          )}`}
                        >
                          {acc.role}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-400 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        {acc.username && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-slate-400">Username:</span>
                            </div>
                            <span className="text-white font-medium font-mono bg-slate-800/60 px-2 py-0.5 rounded">{acc.username}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-pink-400" />
                            <span className="text-slate-400">Cabang / Mitra:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                              {acc.tenantName || (tenants.find(t => t.id === acc.tenantId)?.name) || 'Pusat / Global'}
                            </span>
                            {currentUser?.role === 'superadmin' && acc.tenantId && acc.tenantId !== currentTenant?.id && (
                              <button
                                type="button"
                                onClick={() => switchTenant(acc.tenantId!)}
                                className="text-[10px] text-pink-400 hover:text-pink-300 underline font-semibold cursor-pointer"
                                title="Buka cabang ini"
                              >
                                Masuk Cabang
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-slate-400">Email Login:</span>
                          </div>
                          <span className="text-white font-medium font-mono">{acc.email}</span>
                        </div>

                        {acc.activationCode && (
                          <div className="flex items-center justify-between bg-amber-500/10 -mx-1 px-2 py-1 rounded-lg border border-amber-500/20">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-amber-300 font-bold text-[11px]">Kode OTP:</span>
                            </div>
                            <span className="text-amber-300 font-mono font-bold tracking-widest text-xs">{acc.activationCode}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-pink-400" />
                            <span className="text-slate-400">Password:</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-slate-200">
                              {isRevealed ? (acc.password || 'admin123') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordReveal(acc.id)}
                              className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors cursor-pointer"
                              title={isRevealed ? 'Sembunyikan password' : 'Lihat password'}
                            >
                              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-400">No. WhatsApp:</span>
                          </div>
                          <span className="text-slate-300">{acc.phone}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-400">Login Terakhir:</span>
                          </div>
                          <span className="text-slate-300">{acc.lastLogin || 'Belum pernah'}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-blue-400" />
                          Hak Akses Modul:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {acc.permissions.map(perm => (
                            <span
                              key={perm}
                              className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            acc.status === 'active' ? 'bg-blue-400 animate-pulse' : 'bg-red-400'
                          }`}
                        />
                        <span className="text-[11px] text-slate-400 capitalize">{acc.status}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Akun"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus akun ${acc.name}?`)) {
                              deleteAccount(acc.id);
                            }
                          }}
                          disabled={acc.role === 'superadmin'}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title={acc.role === 'superadmin' ? 'Superadmin tidak dapat dihapus' : 'Hapus Akun'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DATA MITRA & CABANG ISP (SUPERADMIN ONLY) */}
      {activeTab === 'mitra-isp' && isSuperAdmin && (
        <div className="space-y-6">
          <TenantManagement />
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL & BACKUP DATA */}
      {activeTab === 'audit-log' && (
        <AuditTrailAndBackupView />
      )}

      {/* Account Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mas Nawi"
                  value={accountFormData.name}
                  onChange={e => setAccountFormData({ ...accountFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email (Username Login) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. masnawi910@gmail.com"
                  value={accountFormData.email}
                  onChange={e => setAccountFormData({ ...accountFormData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password Login *
                </label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password..."
                    value={accountFormData.password}
                    onChange={e => setAccountFormData({ ...accountFormData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={accountFormData.phone}
                    onChange={e => setAccountFormData({ ...accountFormData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Peran (Role)</label>
                  <select
                    value={accountFormData.role}
                    onChange={e =>
                      setAccountFormData({ ...accountFormData, role: e.target.value as AdminAccount['role'] })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin Billing</option>
                    <option value="teknisi">Teknisi Lapangan</option>
                    <option value="kasir">Kasir</option>
                    <option value="operator">Operator NOC</option>
                  </select>
                </div>
              </div>

              {currentUser?.role === 'superadmin' && tenants.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cabang / Tenant Mitra
                  </label>
                  <select
                    value={accountFormData.tenantId || currentTenant?.id}
                    onChange={e => {
                      const tId = e.target.value;
                      const selectedT = tenants.find(t => t.id === tId);
                      setAccountFormData({
                        ...accountFormData,
                        tenantId: tId,
                        tenantName: selectedT?.name || '',
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code || t.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Akun
                </label>
                <select
                  value={accountFormData.status}
                  onChange={e =>
                    setAccountFormData({
                      ...accountFormData,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Hak Akses Modul
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {availablePermissions.map(perm => {
                    const isChecked = accountFormData.permissions?.includes(perm.key);
                    return (
                      <label key={perm.key} className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.key)}
                          className="rounded bg-slate-900 border-slate-700 text-white focus:ring-0"
                        />
                        <span className={isChecked ? 'text-white font-medium' : 'text-slate-400'}>
                          {perm.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAAS UPGRADE & CHECKOUT MODAL */}
      {showUpgradeModal && selectedUpgradePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4 fill-current" />
                  Upgrade & Perpanjangan Lisensi SaaS
                </div>
                <h3 className="text-xl font-black text-white">
                  Konfirmasi Paket {SAAS_TENANT_PLANS[selectedUpgradePlan]?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                disabled={isProcessingUpgrade}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Plan Quota Summary */}
            {(() => {
              const spec = SAAS_TENANT_PLANS[selectedUpgradePlan];
              return (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-baseline justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">Total Biaya Sewa Bulanan:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white font-mono">
                        Rp {spec.priceMonthly.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-slate-500"> / bulan</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-white" />
                      <span>PPP: <b>{spec.maxPppoeUsers >= 999999 ? 'Unlimited' : spec.maxPppoeUsers}</b> User</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hotspot: <b>{spec.maxHotspotUsers >= 999999 ? 'Unlimited' : spec.maxHotspotUsers}</b> User</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-pink-400" />
                      <span>Sesi Aktif: <b>{spec.maxActiveHotspotSessions >= 999999 ? 'Unlimited' : spec.maxActiveHotspotSessions}</b></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-white" />
                      <span>Router NAS: <b>{spec.maxNas}</b> Unit</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Pilih Jalur Pembayaran (Payment Gateway):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Tripay QRIS */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tripay_qris')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'tripay_qris'
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      Tripay QRIS Instant
                      <span className="text-[9px] bg-blue-500/20 text-white px-1.5 py-0.2 rounded">
                        0.7% Fee
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">BCA, Mandiri, GoPay, OVO, ShopeePay</div>
                  </div>
                </button>

                {/* Virtual Account BCA */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bca_va')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'bca_va'
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white">BCA Virtual Account</div>
                    <div className="text-[10px] text-slate-400">Verifikasi Otomatis 24 Jam</div>
                  </div>
                </button>

                {/* Virtual Account BRI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bri_va')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'bri_va'
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white">BRI Virtual Account (BRIVA)</div>
                    <div className="text-[10px] text-slate-400">Verifikasi Otomatis Realtime</div>
                  </div>
                </button>

                {/* Virtual Account Mandiri */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mandiri_va')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'mandiri_va'
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white">Mandiri Virtual Account</div>
                    <div className="text-[10px] text-slate-400">Verifikasi Otomatis Realtime</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Visual QRIS / Payment Instruction Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-4">
              {paymentMethod === 'tripay_qris' ? (
                <>
                  <div className="w-20 h-20 bg-white p-1 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
                    <QrCode className="w-16 h-16 text-slate-950" />
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="font-bold text-white">Scan QRIS Nasional Tripay</div>
                    <div className="text-[11px] text-slate-400">
                      Buka aplikasi m-Banking atau E-Wallet apa saja, lalu scan kode QR di atas untuk aktivasi instan 5 detik.
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="font-bold text-white">Nomor Virtual Account Otomatis:</div>
                  <div className="font-mono text-base font-black text-blue-400 tracking-wider">
                    88301 0812 3456 7890
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Atas Nama: <b className="text-slate-300">MASMEDIA DIGITAL INDONESIA</b>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isProcessingUpgrade}
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessingUpgrade}
                onClick={() => {
                  setIsProcessingUpgrade(true);
                  setTimeout(() => {
                    const res = upgradeTenantPlan(
                      currentTenant.id,
                      selectedUpgradePlan,
                      paymentMethod === 'tripay_qris' ? 'Tripay QRIS' : paymentMethod === 'bca_va' ? 'BCA VA' : paymentMethod === 'bri_va' ? 'BRI VA' : 'Mandiri VA'
                    );
                    setIsProcessingUpgrade(false);
                    setShowUpgradeModal(false);
                    if (res.success) {
                      setUpgradeSuccessMsg(res.message);
                      setTimeout(() => setUpgradeSuccessMsg(null), 10000);
                    }
                  }, 750);
                }}
                className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingUpgrade ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pembayaran & Aktifkan Paket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Guidebook Modal */}
      <SuperAdminGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
    </div>
  );
};
