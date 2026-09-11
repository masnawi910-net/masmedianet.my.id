import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HotspotProfile, HotspotVoucher, HotspotTemplate } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Wifi,
  Ticket,
  Activity,
  Sliders,
  FileCode2,
  Plus,
  Printer,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  Clock,
  Zap,
  Copy,
  Download,
  Eye,
  X,
  FileText,
  Layers,
  Sparkles,
  QrCode,
  Smartphone,
  Check,
  Terminal,
  Palette,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export const HotspotView: React.FC = () => {
  const {
    hotspotProfiles,
    hotspotVouchers,
    hotspotTemplates,
    activeSessions,
    addHotspotProfile,
    updateHotspotProfile,
    deleteHotspotProfile,
    generateVoucherBatch,
    deleteVoucher,
    updateHotspotTemplate,
    deleteHotspotTemplate,
    setNavigation,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'user' | 'session' | 'profile' | 'templet'>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  // Selected Template for Voucher Generation & Print (Dynamically loaded from AppContext / AI Tools)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return sessionStorage.getItem('selected_hotspot_template') || (hotspotTemplates[0]?.id || 'TPL-A4-21');
  });

  // Generator Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genCount, setGenCount] = useState(21); // Default 21 vouchers for standard A4
  const [genProfileId, setGenProfileId] = useState(hotspotProfiles[0]?.id || '');
  const [genPrefix, setGenPrefix] = useState('MM-');
  const [genCharType, setGenCharType] = useState<'num' | 'alphanumeric' | 'uppercase' | 'lowercase' | 'uppercase_only'>('alphanumeric');
  const [genCodeLength, setGenCodeLength] = useState(6);
  const [genLoginMode, setGenLoginMode] = useState<'same' | 'distinct'>('same');
  const [genCustomPrice, setGenCustomPrice] = useState<number>(5000);
  const [genCustomValidity, setGenCustomValidity] = useState<string>('1 Hari / 24 Jam');
  const [genShowScriptTab, setGenShowScriptTab] = useState(false);
  const [genGeneratedBatch, setGenGeneratedBatch] = useState<HotspotVoucher[]>([]);
  const [genScriptCopied, setGenScriptCopied] = useState(false);

  // Check if opened directly from AI Tools "Desain Background & Layout Voucher"
  useEffect(() => {
    const openGen = sessionStorage.getItem('open_gen_voucher_modal');
    const targetTpl = sessionStorage.getItem('selected_hotspot_template');
    if (openGen === 'true') {
      setShowGenModal(true);
      if (targetTpl) {
        setSelectedTemplateId(targetTpl);
      }
      sessionStorage.removeItem('open_gen_voucher_modal');
    } else if (targetTpl && hotspotTemplates.some(t => t.id === targetTpl)) {
      setSelectedTemplateId(targetTpl);
    }
  }, [hotspotTemplates]);

  // Profile Edit / Add Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<HotspotProfile | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    price: 5000,
    rateLimit: '5M/2M',
    validity: '1 Hari / 24 Jam',
    sharedUsers: 1,
    keepaliveTimeout: '2m',
    addressPool: 'hs-pool-1',
    description: 'Akses hotspot berkecepatan tinggi',
  });

  // Print Batch Modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printLayout, setPrintLayout] = useState<'a4_21' | 'thermal_58'>('a4_21');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedPrintProfile, setSelectedPrintProfile] = useState<string>('all');

  // Preview & Edit Template Modals
  const [previewTemplate, setPreviewTemplate] = useState<HotspotTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<HotspotTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = useState<Partial<HotspotTemplate>>({
    name: '',
    badge: '',
    size: 'A4 21 Kupon',
    headerTitle: '',
    greetingText: '',
    wifiName: '',
    contactWa: '',
    bgType: 'gradient',
    colorStart: '#064e3b',
    colorEnd: '#022c22',
    gradientAngle: 135,
    cardBorder: 'dashed',
    borderColor: '#10b981',
    cardRadius: 10,
    textColorTheme: 'light',
    htmlContent: '',
  });

  // Hotspot Active Sessions
  const hotspotSessions = activeSessions.filter(s => {
    const sTerm = (searchTerm || '').toLowerCase();
    const isHotspot = s.service === 'hotspot';
    const matchSearch =
      (s.username || '').toLowerCase().includes(sTerm) ||
      (s.customerName || '').toLowerCase().includes(sTerm) ||
      (s.ipAddress || '').includes(sTerm);
    return isHotspot && matchSearch;
  });

  // Filtered Vouchers
  const filteredVouchers = hotspotVouchers.filter(v => {
    const sTerm = (searchTerm || '').toLowerCase();
    const matchSearch =
      (v.code || '').toLowerCase().includes(sTerm) ||
      (v.profileName || '').toLowerCase().includes(sTerm) ||
      (v.usedBy ? v.usedBy.toLowerCase().includes(sTerm) : false);
    const matchProfile = profileFilter === 'all' || v.profileId === profileFilter;
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchProfile && matchStatus;
  });

  // Unique Batches for Filter
  const batches = Array.from(new Set(hotspotVouchers.map(v => v.batchCode))).filter(Boolean);

  // Print Vouchers
  const printableVouchers = hotspotVouchers.filter(v => {
    const matchBatch = selectedBatch === 'all' || v.batchCode === selectedBatch;
    const matchProfile = selectedPrintProfile === 'all' || v.profileId === selectedPrintProfile;
    const matchStatus = v.status === 'active'; // Print active vouchers
    return matchBatch && matchProfile && matchStatus;
  });

  // Open Generate Modal
  const handleOpenGenerateModal = () => {
    const prof = hotspotProfiles.find(p => p.id === genProfileId) || hotspotProfiles[0];
    if (prof) {
      setGenCustomPrice(prof.price);
      setGenCustomValidity(prof.validity);
    }
    setGenGeneratedBatch([]);
    setGenShowScriptTab(false);
    setShowGenModal(true);
  };

  // Handler Generate Vouchers
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const prof = hotspotProfiles.find(p => p.id === genProfileId) || hotspotProfiles[0];
    const newBatch = generateVoucherBatch(
      prof.id,
      genCount,
      genCustomPrice,
      genPrefix,
      genCharType,
      genCodeLength,
      genLoginMode,
      genCustomValidity
    );
    setGenGeneratedBatch(newBatch);
  };

  // Generate MikroTik Script from batch
  const getMikrotikBatchScript = () => {
    if (!genGeneratedBatch.length) return '';
    const prof = hotspotProfiles.find(p => p.id === genProfileId) || hotspotProfiles[0];
    let script = `# ====================================================================\n`;
    script += `# MIKROTIK HOTSPOT USER BATCH (${genGeneratedBatch.length} KUPON)\n`;
    script += `# Profile    : ${prof?.name || 'Default'}\n`;
    script += `# Batch Code : ${genGeneratedBatch[0]?.batchCode || 'BATCH'}\n`;
    script += `# Tanggal    : ${new Date().toLocaleDateString('id-ID')}\n`;
    script += `# ====================================================================\n\n`;
    script += `/ip hotspot user\n`;
    genGeneratedBatch.forEach(v => {
      script += `add server=all profile="${prof?.name || 'default'}" name="${v.code}" password="${v.password || v.code}" limit-uptime=${v.timeLimit} comment="${v.batchCode} - Rp ${v.price.toLocaleString('id-ID')}"\n`;
    });
    return script;
  };

  // Open Add Profile Modal
  const handleOpenAddProfile = () => {
    setEditingProfile(null);
    setProfileFormData({
      name: '',
      price: 5000,
      rateLimit: '5M/2M',
      validity: '1 Hari (24 Jam)',
      sharedUsers: 1,
      keepaliveTimeout: '2m',
      addressPool: 'hs-pool-1',
      description: 'Akses hotspot berkecepatan tinggi',
    });
    setShowProfileModal(true);
  };

  // Open Edit Profile Modal
  const handleOpenEditProfile = (prof: HotspotProfile) => {
    setEditingProfile(prof);
    setProfileFormData({
      name: prof.name || '',
      price: prof.price || 5000,
      rateLimit: prof.rateLimit || '5M/2M',
      validity: prof.validity || '1 Hari',
      sharedUsers: prof.sharedUsers || 1,
      keepaliveTimeout: prof.keepaliveTimeout || '2m',
      addressPool: prof.addressPool || 'hs-pool-1',
      description: prof.description || '',
    });
    setShowProfileModal(true);
  };

  // Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFormData.name.trim()) {
      alert('Nama Profil Hotspot wajib diisi!');
      return;
    }

    if (editingProfile) {
      updateHotspotProfile(editingProfile.id, {
        name: profileFormData.name,
        price: Number(profileFormData.price),
        rateLimit: profileFormData.rateLimit,
        validity: profileFormData.validity,
        sharedUsers: Number(profileFormData.sharedUsers),
        keepaliveTimeout: profileFormData.keepaliveTimeout,
        addressPool: profileFormData.addressPool,
        description: profileFormData.description,
      });
      alert(`Profil Hotspot "${profileFormData.name}" berhasil diperbarui!`);
    } else {
      addHotspotProfile({
        name: profileFormData.name,
        price: Number(profileFormData.price),
        rateLimit: profileFormData.rateLimit,
        validity: profileFormData.validity,
        sharedUsers: Number(profileFormData.sharedUsers),
        keepaliveTimeout: profileFormData.keepaliveTimeout,
        addressPool: profileFormData.addressPool,
        description: profileFormData.description,
      });
      alert(`Profil Hotspot "${profileFormData.name}" berhasil ditambahkan!`);
    }
    setShowProfileModal(false);
  };

  // Delete Profile
  const handleDeleteProfile = (prof: HotspotProfile) => {
    const usedVouchersCount = hotspotVouchers.filter(v => v.profileId === prof.id).length;
    if (usedVouchersCount > 0) {
      if (!confirm(`Profil "${prof.name}" memiliki ${usedVouchersCount} voucher terkait. Apakah Anda yakin ingin menghapus profil ini?`)) {
        return;
      }
    } else {
      if (!confirm(`Hapus Profil Hotspot "${prof.name}"?`)) {
        return;
      }
    }
    deleteHotspotProfile(prof.id);
  };

  // Delete Single Voucher
  const handleDeleteVoucher = (vou: HotspotVoucher) => {
    if (confirm(`Hapus voucher kode "${vou.code}"? Tindakan ini permanen.`)) {
      deleteVoucher(vou.id);
    }
  };

  // Bulk Delete Used Vouchers
  const handleClearUsedVouchers = () => {
    const usedVouchers = hotspotVouchers.filter(v => v.status === 'used');
    if (usedVouchers.length === 0) {
      alert('Tidak ada voucher berstatus terpakai untuk dibersihkan.');
      return;
    }
    if (confirm(`Bersihkan ${usedVouchers.length} voucher yang sudah terpakai?`)) {
      usedVouchers.forEach(v => deleteVoucher(v.id));
      alert(`Berhasil menghapus ${usedVouchers.length} voucher terpakai.`);
    }
  };

  // Copy template code to clipboard
  const handleCopyTemplate = (tpl: HotspotTemplate) => {
    navigator.clipboard.writeText(tpl.htmlContent || '');
    setCopiedTemplateId(tpl.id);
    setTimeout(() => setCopiedTemplateId(null), 2500);
  };

  // Open Edit Template Modal
  const handleOpenEditTemplate = (tpl: HotspotTemplate) => {
    setEditingTemplate(tpl);
    setTemplateFormData({
      name: tpl.name || '',
      badge: tpl.badge || '',
      size: tpl.size || 'A4 21 Kupon',
      headerTitle: tpl.headerTitle || 'MASMEDIA ULTRA SPEED',
      greetingText: tpl.greetingText || 'Internet Cepat & Tanpa Batas',
      wifiName: tpl.wifiName || 'wifi.masmedia.net',
      contactWa: tpl.contactWa || '0851-5767-1244',
      bgType: tpl.bgType || 'gradient',
      colorStart: tpl.colorStart || '#064e3b',
      colorEnd: tpl.colorEnd || '#022c22',
      gradientAngle: tpl.gradientAngle || 135,
      cardBorder: tpl.cardBorder || 'dashed',
      borderColor: tpl.borderColor || '#10b981',
      cardRadius: tpl.cardRadius ?? 10,
      textColorTheme: tpl.textColorTheme || 'light',
      htmlContent: tpl.htmlContent || '',
    });
  };

  // Save Edit Template
  const handleSaveEditTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    if (!templateFormData.name?.trim()) {
      alert('Nama template tidak boleh kosong.');
      return;
    }
    updateHotspotTemplate(editingTemplate.id, templateFormData);
    alert(`Template "${templateFormData.name || editingTemplate.name}" berhasil diperbarui!`);
    setEditingTemplate(null);
  };

  // Delete Template
  const handleDeleteTemplate = (tpl: HotspotTemplate) => {
    if (hotspotTemplates.length <= 1) {
      alert('Minimal harus ada 1 template aktif di sistem.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus template "${tpl.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteHotspotTemplate(tpl.id);
      if (selectedTemplateId === tpl.id) {
        const remaining = hotspotTemplates.filter(t => t.id !== tpl.id);
        if (remaining.length > 0) {
          setSelectedTemplateId(remaining[0].id);
        }
      }
      alert(`Template "${tpl.name}" berhasil dihapus.`);
    }
  };

  // Execute Window Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Stylesheet for A4 21 Voucher and Thermal */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-voucher-area, #print-voucher-area * {
            visibility: visible;
          }
          #print-voucher-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          .a4-print-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 4mm !important;
            page-break-inside: avoid;
          }
          .a4-print-card {
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
            padding: 6px 8px !important;
            height: 38mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Wifi className="w-4 h-4" />
            Radius / Hotspot RTRW.NET
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Hotspot & Voucher Koin/Waktu</h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate voucher massal, cetak template lembar A4 (21 voucher/lembar) & thermal POS, kelola profil, dan pantau sesi user online.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenGenerateModal}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Generate Voucher Hotspot Massal
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Cetak Voucher (A4 / Thermal)
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'user', label: `1. User / Voucher (${hotspotVouchers.length})`, icon: Ticket },
            { id: 'session', label: `2. Session (${hotspotSessions.length} Online)`, icon: Activity },
            { id: 'profile', label: `3. Profile (${hotspotProfiles.length})`, icon: Sliders },
            { id: 'templet', label: `4. Templet Siap Pakai (${hotspotTemplates.length})`, icon: FileCode2 },
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
            placeholder="Cari kode voucher, profile..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* SUB-MENU 1: USER / VOUCHER */}
      {activeSubTab === 'user' && (
        <div className="space-y-4">
          {/* Quick Filters and Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={profileFilter}
                onChange={e => setProfileFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Profil Paket</option>
                {hotspotProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.price)})</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif (Belum Terpakai)</option>
                <option value="used">Sudah Digunakan</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearUsedVouchers}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded-xl text-xs transition-colors"
                title="Hapus semua voucher yang sudah terpakai"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpakai
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Kode Voucher</th>
                    <th className="px-4 py-3">Paket / Profil</th>
                    <th className="px-4 py-3">Harga</th>
                    <th className="px-4 py-3">Masa Aktif</th>
                    <th className="px-4 py-3">Batch Code</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Digunakan Oleh</th>
                    <th className="px-4 py-3 text-right">Aksi Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredVouchers.map(vou => (
                    <tr key={vou.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                          {vou.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{vou.profileName}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{formatRupiah(vou.price)}</td>
                      <td className="px-4 py-3 text-slate-300">{vou.timeLimit}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{vou.batchCode}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          vou.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          ● {vou.status === 'active' ? 'Aktif' : 'Terpakai'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {vou.usedBy ? `${vou.usedBy} (${vou.usedAt})` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {/* Tombol Hapus User Hotspot / Voucher */}
                        <button
                          onClick={() => handleDeleteVoucher(vou)}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-red-600/30 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 px-2.5 py-1 rounded-lg text-xs transition-colors"
                          title="Hapus Voucher ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredVouchers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Ticket className="w-6 h-6" />
                          </div>
                          <div className="text-sm font-bold text-white">Belum Ada Voucher Hotspot</div>
                          <p className="text-xs text-slate-400 max-w-sm">
                            Generate batch voucher hotspot baru untuk paket harian/mingguan/bulanan atau cetak template lembar A4 & thermal.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={handleOpenGenerateModal}
                              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                            >
                              <Plus className="w-4 h-4" />
                              + Generate Voucher Hotspot Sekarang
                            </button>
                          </div>
                        </div>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">User Voucher</th>
                    <th className="px-4 py-3">IP Hotspot</th>
                    <th className="px-4 py-3">MAC Address</th>
                    <th className="px-4 py-3">Uptime</th>
                    <th className="px-4 py-3">Rx / Tx Rate</th>
                    <th className="px-4 py-3">Router NAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {hotspotSessions.map(sess => (
                    <tr key={sess.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">{sess.username}</td>
                      <td className="px-4 py-3 font-mono text-white">{sess.ipAddress}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{sess.macAddress || sess.callerId}</td>
                      <td className="px-4 py-3 text-slate-300">{sess.uptime}</td>
                      <td className="px-4 py-3 text-emerald-400 font-mono">{sess.rxRate} / {sess.txRate}</td>
                      <td className="px-4 py-3 text-slate-400">{sess.nasName}</td>
                    </tr>
                  ))}
                  {hotspotSessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                        Tidak ada sesi Hotspot aktif saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 3: PROFILE (DENGAN TOMBOL EDIT & HAPUS) */}
      {activeSubTab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Daftar Profil Paket Hotspot (MikroTik User-Profile)
            </h3>
            <button
              onClick={handleOpenAddProfile}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              + Tambah Profile Hotspot
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hotspotProfiles.map(prof => {
              const countVouchers = hotspotVouchers.filter(v => v.profileId === prof.id).length;
              return (
                <div key={prof.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-white text-base">{prof.name}</h4>
                        <span className="text-xs text-slate-400">{prof.id}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {formatRupiah(prof.price)}
                      </span>
                    </div>

                    <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs mb-3">
                      <div className="flex justify-between text-slate-300">
                        <span>Masa Berlaku:</span>
                        <strong className="text-white">{prof.validity}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Rate Limit:</span>
                        <span className="font-mono text-emerald-400">{prof.rateLimit}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Shared Users:</span>
                        <span>{prof.sharedUsers} User</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Address Pool:</span>
                        <span className="font-mono text-slate-400">{prof.addressPool || 'default'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800 mb-3">
                      <span>Voucher Terbuat:</span>
                      <span className="text-emerald-400 font-semibold">{countVouchers} Kupon</span>
                    </div>

                    {/* Tombol Edit & Hapus Profile Hotspot */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProfile(prof)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1.5 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-400" />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(prof)}
                        className="flex items-center justify-center p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl text-xs transition-colors"
                        title="Hapus Profile Hotspot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-MENU 4: TEMPLET HOTSPOT & KODE SIAP DIGUNAKAN */}
      {activeSubTab === 'templet' && (
        <div className="space-y-6">
          {/* Banner A4 21 Voucher Info */}
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <FileCode2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  Templet Hotspot Standar A4 (21 Voucher / 3x7 Grid) & Thermal
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Siap Digunakan
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kode template HTML/CSS di bawah tersinkronisasi otomatis dengan <strong>Form Desain Background & Layout Voucher</strong> di AI Tools.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setNavigation('ai-tools', 'generator', 'hotspot')}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow"
              >
                <Sparkles className="w-4 h-4" />
                Desain Template Baru (AI Tools)
              </button>
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow shrink-0"
              >
                <Printer className="w-4 h-4" />
                Cetak Template Sekarang
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hotspotTemplates.map(tpl => (
              <div key={tpl.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-white text-base">{tpl.name}</h4>
                        {tpl.badge && (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {tpl.badge}
                          </span>
                        )}
                        {tpl.id === 'TPL-A4-21' && (
                          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            21 Voucher A4
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{tpl.size || 'Format Standar'}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-500">{tpl.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyTemplate(tpl)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                          copiedTemplateId === tpl.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                        title="Salin kode HTML template"
                      >
                        {copiedTemplateId === tpl.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline">Salin</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setPreviewTemplate(tpl)}
                        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg"
                        title="Lihat Pratinjau Voucher"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditTemplate(tpl)}
                        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-blue-500/20 text-slate-200 hover:text-blue-400 border border-slate-700 hover:border-blue-500/40 px-2.5 py-1.5 rounded-lg transition-colors"
                        title="Edit Properti & Desain Template"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(tpl)}
                        className="flex items-center justify-center p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-lg transition-colors"
                        title="Hapus Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Live Preview Chip */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Pratinjau Desain Kartu:</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {tpl.bgType === 'solid' ? 'Warna Solid' : 'Linear Gradient'} • Border {tpl.cardBorder || 'dashed'}
                      </span>
                    </div>

                    <div
                      className="p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden transition-all text-xs"
                      style={{
                        background: tpl.bgType === 'solid'
                          ? (tpl.colorStart || '#0f172a')
                          : `linear-gradient(${tpl.gradientAngle || 135}deg, ${tpl.colorStart || '#064e3b'}, ${tpl.colorEnd || '#022c22'})`,
                        borderColor: tpl.borderColor || '#10b981',
                        borderStyle: tpl.cardBorder || 'dashed',
                        borderWidth: '1.5px',
                        borderRadius: `${tpl.cardRadius ?? 10}px`,
                        color: tpl.textColorTheme === 'dark' ? '#0f172a' : '#ffffff',
                      }}
                    >
                      <div className="flex items-center justify-between border-b pb-1.5 border-white/20">
                        <div>
                          <div className="font-black text-xs tracking-tight uppercase">
                            {tpl.headerTitle || 'MASMEDIA ULTRA SPEED'}
                          </div>
                          <div className="text-[9px] opacity-80">SSID: @{tpl.wifiName || 'wifi.masmedia.net'}</div>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-black/30 border border-white/20">
                          Rp 5.000
                        </span>
                      </div>

                      <div className="flex items-center justify-between my-2.5 gap-2">
                        <div className="flex-1 bg-black/25 border border-white/15 rounded-lg p-2 text-center">
                          <div className="text-[7.5px] font-bold uppercase tracking-wider opacity-75">KODE VOUCHER</div>
                          <div className="font-mono font-black text-sm tracking-wider mt-0.5">MM-849201</div>
                        </div>
                        <div className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center bg-white shrink-0 p-0.5">
                          <QrCode className="w-7 h-7 text-slate-900" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] border-t pt-1.5 border-white/20 opacity-90">
                        <span className="font-semibold">⏱ 24 Jam / 1 Hari</span>
                        <span>WA: {tpl.contactWa || '0851-5767-1244'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Kode HTML Template (Dapat Diedit Langsung):</span>
                      <span className="text-[10px] text-slate-500 font-normal">Tag: &#123;&#123;code&#125;&#125;, &#123;&#123;price&#125;&#125;, &#123;&#123;validity&#125;&#125;</span>
                    </label>
                    <textarea
                      rows={6}
                      value={tpl.htmlContent || ''}
                      onChange={e => updateHotspotTemplate(tpl.id, { htmlContent: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Footer Quick Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersimpan di Sistem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setShowGenModal(true);
                      }}
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold transition-all shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pakai di Generator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setShowPrintModal(true);
                      }}
                      className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold transition-all shadow"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Lembar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL GENERATE BATCH */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-emerald-400" />
                  Generate Voucher Hotspot Massal
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Buat kode voucher acak massal, atur profil paket, format karakter, dan mode login pelanggan.
                </p>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {genGeneratedBatch.length === 0 ? (
              <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                {/* 1. Profil Paket */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-slate-300 font-bold">1. Pilih Profil Paket Hotspot:</label>
                  <select
                    value={genProfileId}
                    onChange={e => {
                      const id = e.target.value;
                      setGenProfileId(id);
                      const p = hotspotProfiles.find(x => x.id === id);
                      if (p) {
                        setGenCustomPrice(p.price);
                        setGenCustomValidity(p.validity);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {hotspotProfiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatRupiah(p.price)} | {p.validity} | Limit: {p.rateLimit}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Harga Kupon (Rp)</label>
                      <input
                        type="number"
                        value={genCustomPrice}
                        onChange={e => setGenCustomPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Masa Aktif / Validity</label>
                      <input
                        type="text"
                        value={genCustomValidity}
                        onChange={e => setGenCustomValidity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        placeholder="1 Hari / 24 Jam"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Jumlah Kupon & Presets */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold">2. Jumlah Voucher yang Dibuat:</label>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">{genCount} Kupon</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { count: 21, label: '21 pcs (1 Lembar A4)' },
                      { count: 42, label: '42 pcs (2 Lembar A4)' },
                      { count: 63, label: '63 pcs (3 Lembar A4)' },
                      { count: 100, label: '100 pcs (Batch Besar)' },
                    ].map(preset => (
                      <button
                        key={preset.count}
                        type="button"
                        onClick={() => setGenCount(preset.count)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          genCount === preset.count
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="block font-bold text-xs">{preset.count}</span>
                        <span className="text-[9px] text-slate-400 block leading-tight">{preset.label.split('(')[1]?.replace(')', '') || 'pcs'}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-1">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Atau Masukkan Jumlah Manual:</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={genCount}
                      onChange={e => setGenCount(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 3. Format Kode & Karakter */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <label className="block text-slate-300 font-bold">3. Format Kode Voucher & Login:</label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Prefix Kode</label>
                      <input
                        type="text"
                        value={genPrefix}
                        onChange={e => setGenPrefix(e.target.value.toUpperCase())}
                        placeholder="MM-"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Tipe Karakter</label>
                      <select
                        value={genCharType}
                        onChange={e => setGenCharType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs"
                      >
                        <option value="alphanumeric">Huruf + Angka Acak</option>
                        <option value="uppercase_only">Huruf KAPITAL SAJA (A-Z)</option>
                        <option value="uppercase">Huruf Kapital + Angka</option>
                        <option value="num">Angka Saja (0-9)</option>
                        <option value="lowercase">Huruf Kecil Saja</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Panjang Karakter</label>
                      <select
                        value={genCodeLength}
                        onChange={e => setGenCodeLength(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs font-mono"
                      >
                        <option value={4}>4 Karakter (Singkat)</option>
                        <option value={6}>6 Karakter (Standar)</option>
                        <option value={8}>8 Karakter (Panjang)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Mode Login Pelanggan</label>
                      <select
                        value={genLoginMode}
                        onChange={e => setGenLoginMode(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs"
                      >
                        <option value="same">User = Password (Praktis & Populer)</option>
                        <option value="distinct">User + Password Terpisah (Keamanan Tinggi)</option>
                      </select>
                    </div>

                    {/* Live Sample Preview */}
                    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-2 flex flex-col justify-center">
                      <span className="text-[9px] text-slate-400 font-semibold block">Pratinjau Kode Voucher:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 font-mono font-black text-xs tracking-wider">
                          {genPrefix}
                          {genCharType === 'num'
                            ? '849201'.slice(0, genCodeLength)
                            : genCharType === 'uppercase_only'
                            ? 'XKMPRJ'.slice(0, genCodeLength)
                            : genCharType === 'uppercase'
                            ? '7K9M4P'.slice(0, genCodeLength)
                            : '8k9a2p'.slice(0, genCodeLength)}
                        </span>
                        {genLoginMode === 'distinct' && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            (Pass: 492015)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Pilihan Desain & Layout Voucher (Dinamis dari AI Tools) */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                      <Palette className="w-4 h-4 text-emerald-400" />
                      <span>4. Pilihan Desain & Layout Kupon (Dinamis dari AI Tools):</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGenModal(false);
                        setNavigation('ai-tools', 'generator', 'hotspot');
                      }}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-all shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+ Desain Baru di AI Tools</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {hotspotTemplates.map(tpl => {
                      const isSelected = selectedTemplateId === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative text-left ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="font-bold text-white text-xs block line-clamp-1">{tpl.name}</span>
                              <span className="text-[10px] text-slate-400">{tpl.size || 'A4 21 Kupon'}</span>
                            </div>
                            {tpl.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 uppercase">
                                {tpl.badge}
                              </span>
                            )}
                          </div>

                          {/* Mini Live Preview Chip */}
                          <div
                            className="w-full h-10 rounded-lg flex items-center justify-between px-2.5 text-[9px] font-bold border overflow-hidden"
                            style={{
                              background: tpl.bgType === 'solid'
                                ? (tpl.colorStart || '#0f172a')
                                : `linear-gradient(${tpl.gradientAngle || 135}deg, ${tpl.colorStart || '#064e3b'}, ${tpl.colorEnd || '#022c22'})`,
                              borderColor: tpl.borderColor || '#10b981',
                              borderStyle: tpl.cardBorder || 'dashed',
                              color: tpl.textColorTheme === 'dark' ? '#0f172a' : '#ffffff',
                            }}
                          >
                            <span className="truncate max-w-[110px] uppercase">{tpl.headerTitle || 'MASMEDIA'}</span>
                            <span className="font-mono text-[8.5px] bg-black/25 px-1 py-0.5 rounded border border-white/10">MM-XXXXXX</span>
                          </div>

                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowGenModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Generate {genCount} Voucher Sekarang</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Success / Result View */
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {genGeneratedBatch.length} Voucher Berhasil Digenerate!
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Batch: <span className="font-mono text-emerald-400 font-bold">{genGeneratedBatch[0]?.batchCode}</span> • Profil: <span className="text-white font-semibold">{genGeneratedBatch[0]?.profileName}</span> • Template: <span className="text-emerald-300 font-semibold">{hotspotTemplates.find(t => t.id === selectedTemplateId)?.name || 'Default A4'}</span> • Total: <span className="text-amber-400 font-bold">{formatRupiah((genGeneratedBatch[0]?.price || 0) * genGeneratedBatch.length)}</span>
                    </p>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setGenShowScriptTab(false)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      !genShowScriptTab ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Daftar Kupon Terbuat ({genGeneratedBatch.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenShowScriptTab(true)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                      genShowScriptTab ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Script RouterOS MikroTik</span>
                  </button>
                </div>

                {!genShowScriptTab ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {genGeneratedBatch.slice(0, 30).map((v, i) => (
                      <div key={i} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-mono">Kode:</span>
                        <span className="font-mono font-bold text-white text-xs">{v.code}</span>
                        {v.password && v.password !== v.code && (
                          <span className="text-[9px] text-slate-400 font-mono block">Pass: {v.password}</span>
                        )}
                      </div>
                    ))}
                    {genGeneratedBatch.length > 30 && (
                      <div className="col-span-full text-center py-2 text-slate-500 font-semibold text-[10px]">
                        + {genGeneratedBatch.length - 30} kupon lainnya dalam batch ini...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(getMikrotikBatchScript());
                          setGenScriptCopied(true);
                          setTimeout(() => setGenScriptCopied(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                      >
                        {genScriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{genScriptCopied ? 'Tersalin' : 'Salin Script'}</span>
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-xl font-mono text-[10px] text-emerald-400 max-h-56 overflow-y-auto border border-slate-800 select-all">
                      {getMikrotikBatchScript()}
                    </pre>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setGenGeneratedBatch([]);
                      setShowGenModal(false);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold"
                  >
                    Tutup
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGenModal(false);
                        setSelectedBatch(genGeneratedBatch[0]?.batchCode || 'all');
                        setShowPrintModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold flex items-center gap-1.5 shadow"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Lembar Batch Ini ({genGeneratedBatch.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH PROFILE HOTSPOT */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                {editingProfile ? 'Edit Profile Hotspot' : 'Tambah Profile Hotspot Baru'}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                  placeholder="Contoh: Paket 1 Hari (5 Jam)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Voucher (Rp) *</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    required
                    value={profileFormData.price}
                    onChange={e => setProfileFormData({ ...profileFormData, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Masa Berlaku (Validity) *</label>
                  <input
                    type="text"
                    required
                    value={profileFormData.validity}
                    onChange={e => setProfileFormData({ ...profileFormData, validity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="Contoh: 1 Hari / 24 Jam / 5 Jam"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rate Limit (Rx/Tx)</label>
                  <input
                    type="text"
                    required
                    value={profileFormData.rateLimit}
                    onChange={e => setProfileFormData({ ...profileFormData, rateLimit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono"
                    placeholder="5M/2M"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shared Users (Perangkat)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={profileFormData.sharedUsers}
                    onChange={e => setProfileFormData({ ...profileFormData, sharedUsers: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Address Pool</label>
                  <input
                    type="text"
                    value={profileFormData.addressPool}
                    onChange={e => setProfileFormData({ ...profileFormData, addressPool: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="hs-pool-1"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Keepalive Timeout</label>
                  <input
                    type="text"
                    value={profileFormData.keepaliveTimeout}
                    onChange={e => setProfileFormData({ ...profileFormData, keepaliveTimeout: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="2m"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  value={profileFormData.description}
                  onChange={e => setProfileFormData({ ...profileFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  placeholder="Keterangan paket voucher"
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
                  {editingProfile ? 'Simpan Perubahan' : 'Simpan Profile Hotspot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRINT VOUCHER DENGAN FORMAT A4 (21 VOUCHER / LEMBAR) & THERMAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Cetak Voucher Hotspot Siap Jual</h3>
                  <p className="text-[11px] text-slate-400">Pilih format kertas A4 (21 Voucher) atau Struk Kasir Thermal Roll</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter, Template & Layout Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPrintLayout('a4_21')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    printLayout === 'a4_21'
                      ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  📄 Lembar A4 (21 Voucher / 3x7)
                </button>
                <button
                  onClick={() => setPrintLayout('thermal_58')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    printLayout === 'thermal_58'
                      ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  🧾 Struk Thermal 58mm / 80mm
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Dynamic Template Selection */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200">
                  <Palette className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <select
                    value={selectedTemplateId}
                    onChange={e => setSelectedTemplateId(e.target.value)}
                    className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[200px] truncate"
                    title="Pilih Desain & Layout Voucher"
                  >
                    {hotspotTemplates.map(tpl => (
                      <option key={tpl.id} value={tpl.id} className="bg-slate-900 text-slate-200">
                        {tpl.name} ({tpl.badge || tpl.size || 'A4'})
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedPrintProfile}
                  onChange={e => setSelectedPrintProfile(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="all">Semua Profil</option>
                  {hotspotProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="all">Semua Batch</option>
                  {batches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* PREVIEW CONTAINER PRINT */}
            {(() => {
              const activeTpl = hotspotTemplates.find(t => t.id === selectedTemplateId) || hotspotTemplates[0] || {
                name: 'Standar A4 21',
                bgType: 'solid',
                colorStart: '#ffffff',
                colorEnd: '#f8fafc',
                borderColor: '#cbd5e1',
                cardBorder: 'solid',
                cardRadius: 8,
                textColorTheme: 'dark',
                headerTitle: 'MASMEDIA ULTRA SPEED',
                wifiName: 'wifi.masmedia.net',
                contactWa: '0851-5767-1244',
              };

              return (
                <div id="print-voucher-area" className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-[460px] overflow-y-auto">
                  {printLayout === 'a4_21' ? (
                    /* Dynamic A4 Grid 3 Columns x 7 Rows (21 Vouchers per page) Styled from Template */
                    <div className="a4-print-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {printableVouchers.slice(0, 21).map((v) => (
                        <div
                          key={v.id}
                          className="a4-print-card p-3 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all"
                          style={{
                            background: activeTpl.bgType === 'solid'
                              ? (activeTpl.colorStart || '#ffffff')
                              : `linear-gradient(${activeTpl.gradientAngle || 135}deg, ${activeTpl.colorStart || '#064e3b'}, ${activeTpl.colorEnd || '#022c22'})`,
                            borderColor: activeTpl.borderColor || '#cbd5e1',
                            borderStyle: activeTpl.cardBorder || 'solid',
                            borderWidth: '1.5px',
                            borderRadius: `${activeTpl.cardRadius || 8}px`,
                            color: activeTpl.textColorTheme === 'light' ? '#ffffff' : '#0f172a',
                          }}
                        >
                          <div
                            className="flex items-center justify-between border-b pb-1.5"
                            style={{
                              borderColor: activeTpl.textColorTheme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                            }}
                          >
                            <div>
                              <div className="text-[10px] font-extrabold tracking-tight uppercase">
                                {activeTpl.headerTitle || 'MASMEDIA ULTRA SPEED'}
                              </div>
                              <div
                                className="text-[7.5px] font-medium"
                                style={{ color: activeTpl.textColorTheme === 'light' ? 'rgba(255,255,255,0.7)' : '#64748b' }}
                              >
                                SSID: @{activeTpl.wifiName || 'MASMEDIA-HOTSPOT'}
                              </div>
                            </div>
                            <span
                              className="text-[9.5px] font-bold px-2 py-0.5 rounded-md border"
                              style={{
                                background: activeTpl.textColorTheme === 'light' ? 'rgba(255,255,255,0.15)' : '#0f172a',
                                color: activeTpl.textColorTheme === 'light' ? '#34d399' : '#ffffff',
                                borderColor: activeTpl.borderColor || '#10b981',
                              }}
                            >
                              {formatRupiah(v.price)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between my-2 gap-2">
                            <div
                              className="flex-1 rounded-md p-1.5 text-center border"
                              style={{
                                background: activeTpl.textColorTheme === 'light' ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                                borderColor: activeTpl.textColorTheme === 'light' ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
                              }}
                            >
                              <div
                                className="text-[6.5px] font-bold uppercase tracking-wider"
                                style={{ color: activeTpl.textColorTheme === 'light' ? 'rgba(255,255,255,0.6)' : '#64748b' }}
                              >
                                KODE VOUCHER / USER
                              </div>
                              <div
                                className="font-mono font-extrabold text-sm tracking-wider mt-0.5"
                                style={{ color: activeTpl.textColorTheme === 'light' ? '#ffffff' : '#0f172a' }}
                              >
                                {v.code}
                              </div>
                              {v.password && v.password !== v.code && (
                                <div className="text-[8px] font-mono opacity-80">Pass: {v.password}</div>
                              )}
                            </div>
                            <div className="w-9 h-9 border rounded-md flex flex-col items-center justify-center bg-white shrink-0 p-0.5">
                              <QrCode className="w-6 h-6 text-slate-900" />
                            </div>
                          </div>

                          <div
                            className="flex items-center justify-between text-[7.5px] border-t pt-1"
                            style={{
                              borderColor: activeTpl.textColorTheme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                              color: activeTpl.textColorTheme === 'light' ? 'rgba(255,255,255,0.8)' : '#64748b',
                            }}
                          >
                            <span
                              className="font-semibold"
                              style={{ color: activeTpl.textColorTheme === 'light' ? '#34d399' : '#059669' }}
                            >
                              ⏱ Aktif: {v.timeLimit}
                            </span>
                            <span>WA: {activeTpl.contactWa || '0851-5767-1244'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Thermal 58mm POS Slip Mode - Modern Minimalist */
                    <div className="flex flex-wrap gap-4 justify-center">
                      {printableVouchers.slice(0, 4).map(v => (
                        <div
                          key={v.id}
                          className="bg-white text-slate-900 p-4 rounded-lg border border-slate-200 w-56 font-mono text-[11px] text-center space-y-1.5 shadow-sm"
                        >
                          <div className="font-extrabold text-sm tracking-wider uppercase">{activeTpl.headerTitle || 'MASMEDIA WIFI'}</div>
                          <div className="text-[9.5px] text-slate-500">SSID: @{activeTpl.wifiName || 'MASMEDIA-HOTSPOT'}</div>
                          <div className="border-t border-dashed border-slate-300 my-1.5"></div>
                          <div className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">KODE VOUCHER</div>
                          <div className="font-black text-base bg-slate-100 py-1.5 rounded text-slate-900 tracking-widest my-1">{v.code}</div>
                          {v.password && v.password !== v.code && (
                            <div className="text-[10px] text-slate-500 font-mono">Password: {v.password}</div>
                          )}
                          <div className="flex justify-between text-[10px] text-slate-600 px-1">
                            <span>Tarif:</span>
                            <strong className="text-slate-900">{formatRupiah(v.price)}</strong>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-600 px-1">
                            <span>Masa Aktif:</span>
                            <strong className="text-slate-900">{v.timeLimit}</strong>
                          </div>
                          <div className="border-t border-dashed border-slate-300 my-1.5"></div>
                          <div className="text-[8.5px] text-slate-400">Login: http://{activeTpl.wifiName || 'wifi.masmedia.net'}</div>
                          <div className="text-[8.5px] text-slate-400">CS WA: {activeTpl.contactWa || '0851-5767-1244'}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {printableVouchers.length === 0 && (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      Tidak ada voucher aktif yang siap dicetak. Silakan generate voucher baru terlebih dahulu.
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="text-slate-400">
                {printLayout === 'a4_21' ? (
                  <span>Menampilkan <strong>{Math.min(printableVouchers.length, 21)}</strong> dari <strong>{printableVouchers.length}</strong> voucher (1 Lembar A4 = 21 Voucher)</span>
                ) : (
                  <span>Menampilkan struk thermal siap cetak</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Tutup
                </button>
                <button
                  onClick={handlePrint}
                  disabled={printableVouchers.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-5 py-2 rounded-xl flex items-center gap-2 shadow"
                >
                  <Printer className="w-4 h-4" />
                  Kirim ke Printer / Simpan PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW TEMPLATE */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  Pratinjau Templet: {previewTemplate.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{previewTemplate.size || 'Format Standar'} • ID: {previewTemplate.id}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Contoh Tampilan Kupon Cetak:</span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  {previewTemplate.bgType === 'solid' ? 'Warna Solid' : 'Linear Gradient'} • {previewTemplate.cardBorder || 'dashed'}
                </span>
              </div>

              {/* Dynamic Styled Voucher Preview */}
              <div className="flex justify-center p-2">
                <div
                  className="w-72 p-4 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all text-xs"
                  style={{
                    background: previewTemplate.bgType === 'solid'
                      ? (previewTemplate.colorStart || '#0f172a')
                      : `linear-gradient(${previewTemplate.gradientAngle || 135}deg, ${previewTemplate.colorStart || '#064e3b'}, ${previewTemplate.colorEnd || '#022c22'})`,
                    borderColor: previewTemplate.borderColor || '#10b981',
                    borderStyle: previewTemplate.cardBorder || 'dashed',
                    borderWidth: '2px',
                    borderRadius: `${previewTemplate.cardRadius ?? 10}px`,
                    color: previewTemplate.textColorTheme === 'dark' ? '#0f172a' : '#ffffff',
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: previewTemplate.textColorTheme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}>
                    <div>
                      <div className="font-black text-sm tracking-tight uppercase">
                        {previewTemplate.headerTitle || 'MASMEDIA ULTRA SPEED'}
                      </div>
                      <div className="text-[10px] opacity-80">{previewTemplate.greetingText || 'Internet Cepat & Tanpa Batas'}</div>
                    </div>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded shadow-sm bg-black/30 border border-white/20">
                      Rp 5.000
                    </span>
                  </div>

                  <div className="flex items-center justify-between my-3 gap-2.5">
                    <div className="flex-1 bg-black/25 border border-white/15 rounded-lg p-2 text-center">
                      <div className="text-[8px] font-bold uppercase tracking-wider opacity-75">KODE VOUCHER</div>
                      <div className="font-mono font-black text-base tracking-wider mt-0.5">MM-884920</div>
                    </div>
                    <div className="w-12 h-12 border border-white/20 rounded-lg flex items-center justify-center bg-white shrink-0 p-1">
                      <QrCode className="w-9 h-9 text-slate-900" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9.5px] border-t pt-2 opacity-90" style={{ borderColor: previewTemplate.textColorTheme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}>
                    <span className="font-semibold text-emerald-300">⏱ Masa Aktif: 24 Jam</span>
                    <span>SSID: @{previewTemplate.wifiName || 'wifi.masmedia.net'}</span>
                  </div>
                  <div className="text-[8.5px] opacity-75 text-center mt-1">
                    Bantuan CS WA: {previewTemplate.contactWa || '0851-5767-1244'}
                  </div>
                </div>
              </div>

              {previewTemplate.htmlContent && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Snippet HTML Template:</label>
                  <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-32">
                    {previewTemplate.htmlContent}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const tpl = previewTemplate;
                    setPreviewTemplate(null);
                    handleOpenEditTemplate(tpl);
                  }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(previewTemplate.id);
                    setPreviewTemplate(null);
                    setShowGenModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gunakan di Generator
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Tutup Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT TEMPLATE */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-400" />
                  Edit Desain & Properti Template Hotspot
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: <span className="font-mono text-emerald-400">{editingTemplate.id}</span> • Perubahan tersimpan secara instan di sistem
                </p>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTemplate} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Controls Left */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nama Template *
                      </label>
                      <input
                        type="text"
                        required
                        value={templateFormData.name || ''}
                        onChange={e => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Contoh: Modern Emerald Luxury"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Ukuran Kertas / Format
                      </label>
                      <input
                        type="text"
                        value={templateFormData.size || ''}
                        onChange={e => setTemplateFormData(prev => ({ ...prev, size: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Contoh: A4 21 Kupon / Thermal 58mm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Header Brand / Judul Kartu
                      </label>
                      <input
                        type="text"
                        value={templateFormData.headerTitle || ''}
                        onChange={e => setTemplateFormData(prev => ({ ...prev, headerTitle: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Contoh: MASMEDIA ULTRA SPEED"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Slogan / Greeting Text
                      </label>
                      <input
                        type="text"
                        value={templateFormData.greetingText || ''}
                        onChange={e => setTemplateFormData(prev => ({ ...prev, greetingText: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Contoh: Internet Cepat & Stabil"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        SSID WiFi / Login Domain
                      </label>
                      <input
                        type="text"
                        value={templateFormData.wifiName || ''}
                        onChange={e => setTemplateFormData(prev => ({ ...prev, wifiName: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Contoh: wifi.masmedia.net"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nomor WhatsApp CS
                      </label>
                      <input
                        type="text"
                        value={templateFormData.contactWa || ''}
                        onChange={e => setTemplateFormData(prev => ({ ...prev, contactWa: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        placeholder="Contoh: 0851-5767-1244"
                      />
                    </div>
                  </div>

                  {/* Colors & Gradient */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" />
                      Pengaturan Warna & Background
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Tipe Background</label>
                        <select
                          value={templateFormData.bgType || 'gradient'}
                          onChange={e => setTemplateFormData(prev => ({ ...prev, bgType: e.target.value as 'solid' | 'gradient' }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="gradient">Gradient</option>
                          <option value="solid">Solid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Warna Awal</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={templateFormData.colorStart || '#064e3b'}
                            onChange={e => setTemplateFormData(prev => ({ ...prev, colorStart: e.target.value }))}
                            className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={templateFormData.colorStart || '#064e3b'}
                            onChange={e => setTemplateFormData(prev => ({ ...prev, colorStart: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Warna Akhir</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={templateFormData.colorEnd || '#022c22'}
                            onChange={e => setTemplateFormData(prev => ({ ...prev, colorEnd: e.target.value }))}
                            className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={templateFormData.colorEnd || '#022c22'}
                            onChange={e => setTemplateFormData(prev => ({ ...prev, colorEnd: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Sudut Gradient (°)</label>
                        <input
                          type="number"
                          value={templateFormData.gradientAngle ?? 135}
                          onChange={e => setTemplateFormData(prev => ({ ...prev, gradientAngle: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Gaya Border</label>
                        <select
                          value={templateFormData.cardBorder || 'dashed'}
                          onChange={e => setTemplateFormData(prev => ({ ...prev, cardBorder: e.target.value as any }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="dashed">Dashed</option>
                          <option value="solid">Solid</option>
                          <option value="dotted">Dotted</option>
                          <option value="double">Double</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Warna Border</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={templateFormData.borderColor || '#10b981'}
                            onChange={e => setTemplateFormData(prev => ({ ...prev, borderColor: e.target.value }))}
                            className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={templateFormData.borderColor || '#10b981'}
                            onChange={e => setTemplateFormData(prev => ({ ...prev, borderColor: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Radius Sudut (px)</label>
                        <input
                          type="number"
                          min="0"
                          max="28"
                          value={templateFormData.cardRadius ?? 10}
                          onChange={e => setTemplateFormData(prev => ({ ...prev, cardRadius: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Tema Teks</label>
                        <select
                          value={templateFormData.textColorTheme || 'light'}
                          onChange={e => setTemplateFormData(prev => ({ ...prev, textColorTheme: e.target.value as 'light' | 'dark' }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="light">Terang / Putih (Kontras Background Gelap)</option>
                          <option value="dark">Gelap / Hitam (Kontras Background Terang)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Column Right */}
                <div className="lg:col-span-5 space-y-3 flex flex-col">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Pratinjau Desain Real-Time:</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Live Update</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1 flex flex-col justify-center items-center">
                    <div
                      className="w-full max-w-xs p-4 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all text-xs"
                      style={{
                        background: templateFormData.bgType === 'solid'
                          ? (templateFormData.colorStart || '#0f172a')
                          : `linear-gradient(${templateFormData.gradientAngle ?? 135}deg, ${templateFormData.colorStart || '#064e3b'}, ${templateFormData.colorEnd || '#022c22'})`,
                        borderColor: templateFormData.borderColor || '#10b981',
                        borderStyle: templateFormData.cardBorder || 'dashed',
                        borderWidth: '2px',
                        borderRadius: `${templateFormData.cardRadius ?? 10}px`,
                        color: templateFormData.textColorTheme === 'dark' ? '#0f172a' : '#ffffff',
                      }}
                    >
                      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: templateFormData.textColorTheme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}>
                        <div>
                          <div className="font-black text-sm tracking-tight uppercase">
                            {templateFormData.headerTitle || 'MASMEDIA ULTRA SPEED'}
                          </div>
                          <div className="text-[10px] opacity-80">{templateFormData.greetingText || 'Internet Cepat & Tanpa Batas'}</div>
                        </div>
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded shadow-sm bg-black/30 border border-white/20">
                          Rp 5.000
                        </span>
                      </div>

                      <div className="flex items-center justify-between my-3.5 gap-2.5">
                        <div className="flex-1 bg-black/25 border border-white/15 rounded-lg p-2 text-center">
                          <div className="text-[8px] font-bold uppercase tracking-wider opacity-75">KODE VOUCHER</div>
                          <div className="font-mono font-black text-base tracking-wider mt-0.5">MM-884920</div>
                        </div>
                        <div className="w-12 h-12 border border-white/20 rounded-lg flex items-center justify-center bg-white shrink-0 p-1">
                          <QrCode className="w-9 h-9 text-slate-900" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9.5px] border-t pt-2 opacity-90" style={{ borderColor: templateFormData.textColorTheme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}>
                        <span className="font-semibold text-emerald-300">⏱ Masa Aktif: 24 Jam</span>
                        <span>SSID: @{templateFormData.wifiName || 'wifi.masmedia.net'}</span>
                      </div>
                      <div className="text-[8.5px] opacity-75 text-center mt-1">
                        Bantuan CS WA: {templateFormData.contactWa || '0851-5767-1244'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HTML Code Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Kode HTML/CSS Template MikroTik / Mikhmon:</span>
                  <span className="text-[10px] text-slate-500 font-normal">Variabel yang didukung: &#123;&#123;code&#125;&#125;, &#123;&#123;price&#125;&#125;, &#123;&#123;validity&#125;&#125;</span>
                </label>
                <textarea
                  rows={5}
                  value={templateFormData.htmlContent || ''}
                  onChange={e => setTemplateFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                  placeholder="Kode HTML/CSS template voucher..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
