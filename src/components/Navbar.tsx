import React, { useState } from 'react';
import masmediaLogo from '../assets/images/masmedia_logo_modern_1788628511980.jpg';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  Search,
  Server,
  ExternalLink,
  RotateCcw,
  Zap,
  Bot,
  Menu,
  X,
  ShieldAlert,
  LifeBuoy,
  CreditCard,
  MessageSquare,
  Sun,
  Moon,
  Database,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Wrench,
  Receipt,
  Headphones,
  Building2,
  Check,
  Plus,
  Cloud,
} from 'lucide-react';
import { DatabaseManagerModal } from './Database/DatabaseManagerModal';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const {
    nasList,
    stats,
    tickets,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    runAutoIsolirScan,
    resetAllData,
    currentUser,
    loginAsRole,
    logout,
    tenants,
    currentTenant,
    currentTenantId,
    switchTenant,
    cloudSyncStatus,
  } = useApp();

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTenantMenu, setShowTenantMenu] = useState(false);

  const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  const handleIsolirScan = () => {
    const res = runAutoIsolirScan();
    if (res.isolatedCount > 0) {
      alert(`Scan Selesai: ${res.isolatedCount} pelanggan yang menunggak telah berhasil di-isolir otomatis di MikroTik!`);
    } else {
      alert(`Scan Selesai: Semua pelanggan tertib atau masih dalam batas toleransi. Tidak ada yang perlu di-isolir.`);
    }
  };

  // Helper title for active page
  const getPageTitle = (tab: string): string => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'account': return 'Account Admin';
      case 'ftth': return 'FTTH & OLT';
      case 'ftth-gis':
      case 'gis-map': return 'Peta GIS Fiber';
      case 'tr069': return 'TR-069 GenieACS';
      case 'radius-ppp':
      case 'ppp-dhcp': return 'PPP & DHCP MikroTik';
      case 'radius-hotspot':
      case 'hotspot': return 'Hotspot & Voucher';
      case 'radius-setting':
      case 'setting': return 'Setting MikroTik / RADIUS';
      case 'billing-member':
      case 'member': return 'Member Pelanggan';
      case 'billing-transaction':
      case 'transaction': return 'Transaksi & Invoice';
      case 'billing-batch-print':
      case 'batch-print': return 'Cetak Massal Invoice';
      case 'isolir': return 'Isolir Otomatis MikroTik';
      case 'payment-gateway':
      case 'payment': return 'Payment Gateway API';
      case 'payment-rekening': return 'Rekening Bank';
      case 'payment-qris': return 'QRIS Merchant';
      case 'laporan-keuntungan':
      case 'reports': return 'Laporan Keuangan';
      case 'ai-tools':
      case 'tools-ai': return 'AI Generator MikroTik';
      case 'helpdesk':
      case 'tickets': return 'Helpdesk & Tiket';
      case 'panduan':
      case 'guide':
      case 'buku-panduan': return 'Pusat Panduan & SOP';
      case 'whatsapp': return 'WhatsApp Gateway';
      case 'portal': return 'Portal Pelanggan';
      case 'mikrotik': return 'MikroTik Live Monitor';
      case 'tenants': return 'Kelola Cabang / Mitra ISP';
      default: return 'Masmedia Billing';
    }
  };

  const isDark = theme === 'dark';

  return (
    <header className={`backdrop-blur-md border-b sticky top-0 z-40 select-none shadow-sm transition-colors duration-200 ${
      isDark
        ? 'bg-slate-950/95 border-slate-800/80 text-white'
        : 'bg-gradient-to-r from-[#500724]/95 via-[#700936]/95 to-[#500724]/95 border-pink-700/50 text-white shadow-md'
    }`}>
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Button (Mobile & Tablet) */}
            <button
              onClick={onToggleMobileMenu}
              className={`lg:hidden p-2 -ml-1 rounded-xl border active:scale-95 transition-all ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
              }`}
              aria-label="Buka Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <div
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-blue-500/50 bg-slate-900 flex items-center justify-center transition-all shadow-md group-hover:scale-105 group-hover:border-blue-400 group-hover:shadow-blue-500/20">
                <img
                  src={masmediaLogo}
                  alt="Masmedia Network Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight transition-transform group-hover:scale-[1.02] inline-flex items-center select-none">
                    <span className="blink-blue-cyan font-black">Mas</span>
                    <span className="blink-cyan-blue font-black">media</span>
                    <span className="blink-blue-cyan font-black ml-1.5">Network</span>
                  </span>
                  <span className={`text-[7.5px] sm:text-[8.5px] font-bold tracking-normal px-1.5 py-0.5 rounded-full border leading-none ${
                    isDark
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-amber-950 text-amber-200 border-amber-400/40 font-extrabold shadow-xs'
                  }`}>
                    Masmedia Apps
                  </span>
                </div>
                <p className="text-[10px] hidden sm:flex items-center gap-1 font-semibold tracking-tight select-none mt-0.5">
                  <span className="blink-blue-cyan font-bold">ISP</span>
                  <span className="blink-cyan-blue font-bold">MikroTik</span>
                  <span className="blink-blue-cyan font-bold">RADIUS</span>
                  <span className="text-blue-200/70 font-normal">&</span>
                  <span className="blink-cyan-blue font-bold">Billing</span>
                  <span className="blink-blue-cyan font-bold">Hub</span>
                </p>
              </div>
            </div>

            {/* Active page badge on tablet/mobile */}
            <div className={`hidden sm:flex lg:hidden items-center text-xs font-semibold px-2.5 py-1 rounded-xl border ${
              isDark ? 'text-slate-400 bg-slate-900 border-slate-800' : 'text-white bg-pink-950/80 border-pink-500/40'
            }`}>
              <span className={`truncate max-w-[140px] ${isDark ? 'text-white' : 'text-white font-bold'}`}>{getPageTitle(activeTab)}</span>
            </div>
          </div>

          {/* Center: Search bar on Desktop */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-pink-200'}`} />
              <input
                type="text"
                placeholder="Cari pelanggan, no HP, IP, atau username RADIUS..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all font-medium ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-pink-500'
                    : 'bg-pink-950/70 border-pink-500/40 text-white placeholder-pink-200/70 focus:bg-pink-950 focus:border-pink-400'
                }`}
              />
            </div>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(prev => !prev)}
              className={`md:hidden p-2 rounded-xl border ${
                isDark ? 'bg-slate-900 text-slate-300 hover:text-white border-slate-800' : 'bg-pink-950/80 text-pink-200 hover:text-white border-pink-500/40'
              }`}
              aria-label="Cari"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* MikroTik Status Chips on Large Screens */}
            <div className="hidden xl:flex items-center gap-2">
              {nasList.map(nas => {
                const isOnline = nas.status === 'online';
                return (
                  <div
                    key={nas.id}
                    onClick={() => setActiveTab('mikrotik')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs cursor-pointer transition-colors border ${
                      isOnline
                        ? isDark
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                          : 'bg-pink-950/70 hover:bg-pink-900/80 border-pink-500/40 text-white'
                        : isDark
                        ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800/40 text-rose-300'
                        : 'bg-rose-950/60 hover:bg-rose-900/70 border-rose-500/40 text-rose-200'
                    }`}
                    title={`${nas.name} (${nas.ipAddress}) - Status SNMP: ${isOnline ? `Online (CPU: ${nas.cpuLoad}%)` : 'Offline'} - Klik untuk Buka Manajemen Router`}
                  >
                    <Server className={`w-3.5 h-3.5 ${isOnline ? (isDark ? 'text-slate-400' : 'text-pink-300') : 'text-rose-400'}`} />
                    <span className="font-medium truncate max-w-[90px] text-[11px]">{nas.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  </div>
                );
              })}
            </div>

            {/* Cloud Firestore Persistence Status Indicator */}
            <button
              onClick={() => setShowDatabaseModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-xs active:scale-95 cursor-pointer ${
                cloudSyncStatus === 'synced'
                  ? isDark
                    ? 'bg-blue-950/60 hover:bg-blue-900/60 border-blue-500/40 text-white'
                    : 'bg-blue-950/80 hover:bg-blue-900 border-blue-400/50 text-white'
                  : cloudSyncStatus === 'syncing'
                  ? isDark
                    ? 'bg-amber-950/60 hover:bg-amber-900/60 border-amber-500/40 text-amber-300'
                    : 'bg-amber-950/80 hover:bg-amber-900 border-amber-400/50 text-amber-200'
                  : isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-pink-950 hover:bg-pink-900 border-pink-500/40 text-pink-300'
              }`}
              title={`Cloud Database: ${cloudSyncStatus === 'synced' ? 'Tersinkron ke Google Cloud Firestore (Aman saat redeploy)' : cloudSyncStatus === 'syncing' ? 'Sedang menyinkronkan data...' : 'Offline / Cache Lokal'}. Klik untuk Buka Database Manager.`}
            >
              <Cloud className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin text-amber-400' : 'text-blue-400'}`} />
              <span className="hidden md:inline text-[11px] font-medium">
                {cloudSyncStatus === 'synced' ? 'Cloud Aktif' : cloudSyncStatus === 'syncing' ? 'Sync...' : 'Database'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${cloudSyncStatus === 'synced' ? 'bg-blue-400 animate-pulse' : cloudSyncStatus === 'syncing' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
            </button>

            {/* Theme Toggle (Moda Siang / Malam) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-xs active:scale-95 ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-pink-950 hover:bg-pink-900 border-pink-500/50 text-white shadow-sm'
              }`}
              title={theme === 'dark' ? 'Ganti ke Moda Siang (Light Mode)' : 'Ganti ke Moda Malam (Dark Mode)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline text-[11px] font-medium">Siang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-300" />
                  <span className="hidden sm:inline text-[11px] font-bold text-white">Malam</span>
                </>
              )}
            </button>

            {/* Active User Account & Multi-Role Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(prev => !prev)}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
                  currentUser?.role === 'superadmin' || currentUser?.role === 'admin'
                    ? 'bg-purple-950/50 hover:bg-purple-900/60 border-purple-500/40 text-purple-200'
                    : currentUser?.role === 'teknisi'
                    ? 'bg-blue-950/50 hover:bg-blue-900/60 border-blue-500/40 text-white'
                    : currentUser?.role === 'kasir'
                    ? 'bg-amber-950/50 hover:bg-amber-900/60 border-amber-500/40 text-amber-200'
                    : 'bg-blue-950/50 hover:bg-blue-900/60 border-blue-500/40 text-white'
                }`}
                title="Klik untuk melihat detail profil atau ganti akun role"
              >
                <div className="w-6 h-6 rounded-lg bg-white text-slate-900 font-extrabold text-[11px] flex items-center justify-center shadow-xs">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="font-bold text-[11px] leading-tight truncate max-w-[100px] text-white">
                    {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                    {currentUser?.role === 'superadmin' ? 'Super Admin' : currentUser?.role || 'Admin'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
              )}

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-pink-700/40 rounded-2xl shadow-2xl z-50 p-4 space-y-3.5 text-xs animate-fadeIn text-slate-100">
                  {/* Account Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-300 font-bold text-sm">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">
                        {currentUser?.name || 'Administrator'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate font-mono">
                        {currentUser?.email || currentUser?.username || 'admin@rtrw.net'}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-block text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          currentUser?.role === 'superadmin' || currentUser?.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : currentUser?.role === 'teknisi'
                            ? 'bg-blue-500/20 text-white border-blue-500/30'
                            : currentUser?.role === 'kasir'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/20 text-white border-blue-500/30'
                        }`}>
                          Role: {currentUser?.role === 'superadmin' ? 'Super Admin' : currentUser?.role || 'Admin'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Halaman Login)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Database Management Modal */}
        <DatabaseManagerModal
          isOpen={showDatabaseModal}
          onClose={() => setShowDatabaseModal(false)}
        />

        {/* Expandable Mobile Search Bar */}
        {showMobileSearch && (
          <div className={`md:hidden py-2.5 border-t animate-fadeIn ${isDark ? 'border-slate-800' : 'border-pink-500/30'}`}>
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-pink-200'}`} />
              <input
                type="text"
                autoFocus
                placeholder="Cari nama, nomor HP, IP, atau user..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border focus:outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-pink-500'
                    : 'bg-pink-950/80 border-pink-500/40 text-white placeholder-pink-200/70 focus:bg-pink-950 focus:border-pink-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-pink-200 hover:text-white'
                  }`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
