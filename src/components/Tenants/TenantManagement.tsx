import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Plus,
  Server,
  Users,
  Receipt,
  Globe,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Shield,
  ShieldAlert,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
  Key,
  CreditCard,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { Tenant, TenantPlanId, SAAS_TENANT_PLANS } from '../../types';

export const TenantManagement: React.FC = () => {
  const {
    tenants,
    currentTenantId,
    switchTenant,
    addTenant,
    updateTenant,
    deleteTenant,
    allCustomers,
    allInvoices,
    allNasList,
    accounts,
    theme,
    currentUser,
    loginAsRole,
  } = useApp();

  const isDark = theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    city: '',
    address: '',
    status: 'active' as Tenant['status'],
    maxCustomers: 250,
    maxPppoeUsers: 250,
    maxHotspotUsers: 5000,
    maxActiveHotspotSessions: 500,
    priceMonthly: 100000,
    maxNas: 5,
    plan: 'basic' as TenantPlanId,
  });

  const handleOpenAddModal = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      subdomain: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      city: '',
      address: '',
      status: 'active',
      maxCustomers: 250,
      maxPppoeUsers: 250,
      maxHotspotUsers: 5000,
      maxActiveHotspotSessions: 500,
      priceMonthly: 100000,
      maxNas: 5,
      plan: 'basic',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (t: Tenant) => {
    setEditingTenant(t);
    const planKey = (t.plan as TenantPlanId) || 'starter';
    const planSpec = SAAS_TENANT_PLANS[planKey] || SAAS_TENANT_PLANS.starter;
    setFormData({
      name: t.name,
      subdomain: t.subdomain,
      ownerName: t.ownerName,
      ownerPhone: t.ownerPhone,
      ownerEmail: t.ownerEmail,
      city: t.city,
      address: t.address || '',
      status: t.status,
      maxCustomers: t.maxCustomers || planSpec.maxPppoeUsers,
      maxPppoeUsers: t.maxPppoeUsers || planSpec.maxPppoeUsers,
      maxHotspotUsers: t.maxHotspotUsers || planSpec.maxHotspotUsers,
      maxActiveHotspotSessions: t.maxActiveHotspotSessions || planSpec.maxActiveHotspotSessions,
      priceMonthly: t.priceMonthly || planSpec.priceMonthly,
      maxNas: t.maxNas || planSpec.maxNas,
      plan: planKey,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama ISP / Cabang wajib diisi');
      return;
    }

    const subdomain = (formData.subdomain || formData.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .toLowerCase()
      .replace(/\s+/g, '-');

    const planSpec = SAAS_TENANT_PLANS[formData.plan] || SAAS_TENANT_PLANS.starter;

    if (editingTenant) {
      updateTenant(editingTenant.id, {
        name: formData.name,
        subdomain,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        ownerEmail: formData.ownerEmail,
        city: formData.city,
        address: formData.address,
        status: formData.status,
        plan: formData.plan,
        tier: formData.plan,
        priceMonthly: Number(formData.priceMonthly) || planSpec.priceMonthly,
        maxCustomers: Number(formData.maxCustomers) || planSpec.maxPppoeUsers,
        maxPppoeUsers: Number(formData.maxPppoeUsers) || planSpec.maxPppoeUsers,
        maxHotspotUsers: Number(formData.maxHotspotUsers) || planSpec.maxHotspotUsers,
        maxActiveHotspotSessions: Number(formData.maxActiveHotspotSessions) || planSpec.maxActiveHotspotSessions,
        maxNas: Number(formData.maxNas) || planSpec.maxNas,
      });
      alert(`Data Cabang ISP "${formData.name}" berhasil diperbarui!`);
    } else {
      addTenant({
        name: formData.name,
        subdomain,
        ownerName: formData.ownerName || 'Admin Cabang',
        ownerPhone: formData.ownerPhone || '081234567890',
        ownerEmail: formData.ownerEmail || `${subdomain}@isp.net`,
        city: formData.city || 'Jakarta',
        address: formData.address || 'Kantor Cabang',
        status: formData.status,
        plan: formData.plan,
        tier: formData.plan,
        priceMonthly: Number(formData.priceMonthly) || planSpec.priceMonthly,
        maxCustomers: Number(formData.maxCustomers) || planSpec.maxPppoeUsers,
        maxPppoeUsers: Number(formData.maxPppoeUsers) || planSpec.maxPppoeUsers,
        maxHotspotUsers: Number(formData.maxHotspotUsers) || planSpec.maxHotspotUsers,
        maxActiveHotspotSessions: Number(formData.maxActiveHotspotSessions) || planSpec.maxActiveHotspotSessions,
        maxNas: Number(formData.maxNas) || planSpec.maxNas,
      });
      alert(`Cabang / Mitra ISP "${formData.name}" berhasil ditambahkan beserta Default Router & Akun Admin!`);
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (t: Tenant) => {
    if (t.id === 'TENANT-01' || t.id === 'default') {
      alert('Cabang Pusat (Tenant Utama) tidak dapat dihapus.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus data cabang "${t.name}"? Seluruh data pelanggan dan router terkait akan dibersihkan.`)) {
      deleteTenant(t.id);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);

  // Aggregate SaaS Metrics
  const totalCustomersAcrossTenants = allCustomers.length;
  const totalRoutersAcrossTenants = allNasList.length;
  const totalRevenueEst = allInvoices
    .filter(i => i.status === 'paid')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  if (currentUser?.role !== 'superadmin') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Akses Khusus Super Admin</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Data Mitra & Cabang ISP hanya dapat diakses oleh Pemilik Sistem / Super Admin. Anda saat ini login dengan hak akses terbatas ({currentUser?.role || 'Admin'}).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDark
          ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-indigo-500/30'
          : 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-indigo-400/40 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Model Multi-Cabang & Multi-ISP (SaaS Multi-Tenant)
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold uppercase">
                    Isolasi Data 100%
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-indigo-200">
                  Kelola dan sewakan sistem aplikasi ini ke ISP rekanan, cabang RT/RW Net, atau mitra jaringan dengan pemisahan database & tenant ID mandiri.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Cabang / ISP Baru</span>
            </button>
          </div>
        </div>

        {/* Quick SaaS Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-indigo-500/20">
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-indigo-500/20">
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Total Cabang ISP
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {tenants.length} <span className="text-xs font-normal text-indigo-300">Tenant</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-indigo-500/20">
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Total Pelanggan Terdaftar
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {totalCustomersAcrossTenants} <span className="text-xs font-normal text-indigo-300">User</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-indigo-500/20">
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Total Router Terhubung
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-0.5">
              {totalRoutersAcrossTenants} <span className="text-xs font-normal text-indigo-300">NAS</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-indigo-500/20">
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Omset Agregat Terbayar
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
              Rp {(totalRevenueEst / 1000).toLocaleString('id-ID')}K
            </div>
          </div>
        </div>
      </div>

      {/* Role & Isolation Security Alert Box */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-200'
          : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-xs sm:text-sm flex items-center gap-2">
              <span>Status Login Anda:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-600 text-white">
                {currentUser?.role === 'superadmin' ? '👑 Super Admin (Akses Penuh Semua Cabang)' : `🏢 Admin Cabang (${currentUser?.tenantId})`}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cabang aktif yang sedang ditampilkan saat ini: <strong className="text-indigo-600 dark:text-indigo-300">{tenants.find(t => t.id === currentTenantId)?.name}</strong>. Semua tabel pelanggan, router, dan tagihan otomatis terfilter untuk cabang ini.
            </p>
          </div>
        </div>

        {/* Quick Test Switcher Buttons for Demo */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => loginAsRole('superadmin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              currentUser?.role === 'superadmin'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            Mode Super Admin
          </button>
          <button
            onClick={() => loginAsRole('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              currentUser?.role === 'admin'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            Mode Admin Cabang
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama ISP, subdomain, PIC, atau kota..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-xs'
            }`}
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Menampilkan <strong>{filteredTenants.length}</strong> dari <strong>{tenants.length}</strong> cabang terdaftar
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTenants.map(tenant => {
          const isActiveTenant = tenant.id === currentTenantId;
          const tenantCustCount = allCustomers.filter(c => c.tenantId === tenant.id).length;
          const tenantNasCount = allNasList.filter(n => n.tenantId === tenant.id).length;
          const tenantInvoices = allInvoices.filter(i => i.tenantId === tenant.id);
          const tenantPaidRevenue = tenantInvoices
            .filter(i => i.status === 'paid')
            .reduce((sum, inv) => sum + inv.totalAmount, 0);

          const custPercentage = Math.min(100, Math.round((tenantCustCount / tenant.maxCustomers) * 100));

          return (
            <div
              key={tenant.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
                isActiveTenant
                  ? isDark
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-indigo-50/80 border-indigo-500 shadow-lg ring-1 ring-indigo-500'
                  : isDark
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Active Badge */}
              {isActiveTenant && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  Cabang Aktif
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Header info */}
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 ${
                    isActiveTenant
                      ? 'bg-indigo-600 text-white'
                      : isDark
                      ? 'bg-slate-800 text-indigo-400'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pr-12">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      {tenant.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      <span>{tenant.id}</span>
                      <span>•</span>
                      <span className="font-sans text-indigo-600 dark:text-indigo-400 font-bold">
                        {tenant.subdomain}.masmedia.net
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plan and Status badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                    tenant.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {tenant.status === 'active' ? 'Aktif' : 'Suspended'}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Paket {(tenant.plan || 'starter').toUpperCase()}
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-800/80 border border-slate-700 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-indigo-400" />
                    {tenant.city || 'Indonesia'}
                  </span>
                </div>

                {/* Contact PIC */}
                <div className={`p-3 rounded-xl text-xs space-y-1.5 border ${
                  isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Penanggung Jawab:</span>
                    <strong className="text-slate-200 font-semibold">{tenant.ownerName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp:
                    </span>
                    <span className="font-mono text-slate-300">{tenant.ownerPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-400" /> Email:
                    </span>
                    <span className="text-slate-300 truncate max-w-[150px]">{tenant.ownerEmail}</span>
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> Kuota Pelanggan:
                    </span>
                    <strong className="text-slate-200 font-bold">
                      {tenantCustCount} / {tenant.maxCustomers} ({custPercentage}%)
                    </strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        custPercentage > 90
                          ? 'bg-rose-500'
                          : custPercentage > 75
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${custPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Server className="w-3.5 h-3.5 text-cyan-400" /> Router MikroTik:
                    </span>
                    <strong className="text-slate-200 font-bold">
                      {tenantNasCount} / {tenant.maxNas} Unit
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-amber-400" /> Omset Cabang:
                    </span>
                    <strong className="text-emerald-400 font-extrabold">
                      Rp {tenantPaidRevenue.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className={`p-3.5 border-t flex items-center justify-between gap-2 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {/* Switch / Masuk ke Dashboard Cabang */}
                <button
                  onClick={() => switchTenant(tenant.id)}
                  disabled={isActiveTenant}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    isActiveTenant
                      ? 'bg-slate-800 text-slate-500 cursor-default border border-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                  }`}
                >
                  {isActiveTenant ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sedang Aktif</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Buka Dashboard</span>
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEditModal(tenant)}
                  className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Edit Cabang ISP"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                {tenant.id !== 'TENANT-01' && tenant.id !== 'default' && (
                  <button
                    onClick={() => handleDelete(tenant)}
                    className="p-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Hapus Cabang ISP"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Multi-Tenant Architecture Guide */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900/70 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Cara Kerja Model Multi-Tenant & Sewa Aplikasi ISP
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              1. Isolasi Data Mandiri
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Setiap pelanggan, router MikroTik, dan invoice tagihan disematkan <code>tenantId</code> unik. Admin Cabang B tidak akan pernah bisa melihat atau mengubah pelanggan milik Cabang A.
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-400" />
              2. Hak Akses & Akun Login
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Saat membuat cabang baru, sistem otomatis menyediakan router bawaan serta akun login admin khusus yang langsung terkunci ke Tenant ID tersebut saat login.
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              3. Model Langganan (SaaS)
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Anda dapat membatasi kuota pelanggan (misal: Starter 100 user, Pro 500 user, Enterprise Unlimited) dan menetapkan biaya sewa bulanan ke masing-masing mitra pengelola.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Tenant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-slate-900 border-indigo-500/40 text-slate-100' : 'bg-white border-indigo-300 text-slate-900'
          }`}>
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950 to-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {editingTenant ? 'Edit Cabang / Mitra ISP' : 'Tambah Cabang / Mitra ISP Baru (Multi-Tenant)'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">
                    Nama ISP / Cabang RT-RW Net <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Citra Net Mandiri"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Subdomain / Slug Organisasi <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="citranet"
                      value={formData.subdomain}
                      onChange={e => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border font-mono focus:outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-indigo-300' : 'bg-slate-50 border-slate-300 text-indigo-700'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    URL: {formData.subdomain || 'citranet'}.masmedia.net
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Kota / Wilayah Operasional
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bandung Barat"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Nama Penanggung Jawab (PIC)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Hendra Gunawan"
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Nomor WhatsApp PIC
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formData.ownerPhone}
                    onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">
                    Email Kontak Resmi
                  </label>
                  <input
                    type="email"
                    placeholder="kontak@citranet.id"
                    value={formData.ownerEmail}
                    onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Paket Lisensi SaaS & Biaya Sewa
                  </label>
                  <select
                    value={formData.plan}
                    onChange={e => {
                      const newPlan = e.target.value as TenantPlanId;
                      const spec = SAAS_TENANT_PLANS[newPlan] || SAAS_TENANT_PLANS.starter;
                      setFormData({
                        ...formData,
                        plan: newPlan,
                        priceMonthly: spec.priceMonthly,
                        maxCustomers: spec.maxPppoeUsers,
                        maxPppoeUsers: spec.maxPppoeUsers,
                        maxHotspotUsers: spec.maxHotspotUsers,
                        maxActiveHotspotSessions: spec.maxActiveHotspotSessions,
                        maxNas: spec.maxNas,
                      });
                    }}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="starter">1. Paket Starter - Rp 50.000/bln (250 PPP, 1.000 Hotspot, 200 Sesi, 1 NAS, Gratis 1 VPN)</option>
                    <option value="basic">2. Paket Basic - Rp 100.000/bln (500 PPP, 3.000 Hotspot, 500 Sesi, 2 NAS, Gratis 2 VPN)</option>
                    <option value="standar">3. Paket Standar - Rp 150.000/bln (750 PPP, 5.000 Hotspot, 700 Sesi, 3 NAS, Gratis 3 VPN)</option>
                    <option value="pro">4. Paket Pro Bisnis - Rp 250.000/bln (1.000 PPP, 10.000 Hotspot, 1.000 Sesi, 5 NAS, Gratis 4 VPN)</option>
                    <option value="enterprise">5. Paket Enterprise - Rp 500.000/bln (Unlimited PPP, Hotspot, Sesi, NAS, Gratis 5 VPN)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Biaya Sewa Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.priceMonthly}
                    onChange={e => setFormData({ ...formData, priceMonthly: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border font-mono focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-300 text-emerald-700'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Batas Kuota Pelanggan PPP
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="999999"
                    value={formData.maxCustomers}
                    onChange={e => setFormData({ ...formData, maxCustomers: Number(e.target.value), maxPppoeUsers: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Batas Kuota Router MikroTik (NAS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxNas}
                    onChange={e => setFormData({ ...formData, maxNas: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Status Layanan Cabang
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="active">Aktif (Beroperasi Normal)</option>
                    <option value="suspended">Ditangguhkan (Suspended)</option>
                  </select>
                </div>
              </div>

              {!editingTenant && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  isDark ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Otomatisasi Sistem Tenant Baru:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
                    <li>Dibuatkan 1 Router MikroTik Gateway bawaan untuk cabang ini.</li>
                    <li>Data pelanggan & invoice tagihan terisolasi penuh 100%.</li>
                    <li>Bisa langsung dialihkan ke dashboard cabang tersebut setelah disimpan.</li>
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                >
                  {editingTenant ? 'Simpan Perubahan' : 'Buat Cabang ISP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
