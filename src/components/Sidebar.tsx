import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Shield,
  Network,
  Radio,
  Router,
  Server,
  Wifi,
  ReceiptText,
  CreditCard,
  Building2,
  QrCode,
  TrendingUp,
  PieChart,
  Settings,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Globe2,
  Sparkles,
  Bot,
  Compass,
  Printer,
  LifeBuoy,
  Lock,
  ListFilter,
  Zap,
  BookOpen,
  Database,
} from 'lucide-react';

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  themeStyle: {
    gradient: string;
    border: string;
    iconBg: string;
    iconText: string;
    badgeBg: string;
    subContainerBg: string;
    subItemActive: string;
    subItemHover: string;
    subActiveBadge: string;
    subInactiveBadge: string;
  };
  badge?: string | number;
  subMenus: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    isLocked?: boolean;
    minPlan?: string;
  }[];
}

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    stats,
    tickets,
    nasList,
    theme,
    currentUser,
    currentTenant,
    tenants,
    commandQueue,
  } = useApp();

  const isDark = theme === 'dark';

  // Tenant Plan check: FTTH & TR-069 require at least 'basic', 'pro', or 'enterprise'
  const tenantPlan = currentTenant?.plan || 'starter';
  const hasFtthAccess = tenantPlan === 'basic' || tenantPlan === 'pro' || tenantPlan === 'enterprise' || currentUser?.role === 'superadmin';

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  // Smart accordion: only keep the active category open to ensure the entire menu fits on screen without scrolling
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'dashboard-group': true,
  });

  // Automatically open the category containing the active tab
  React.useEffect(() => {
    const parent = categories.find(cat => cat.subMenus.some(sm => sm.id === activeTab));
    if (parent) {
      setOpenCategories({ [parent.id]: true });
    }
  }, [activeTab]);

  const toggleCategory = (catId: string) => {
    setOpenCategories(prev => {
      const isCurrentlyOpen = !!prev[catId];
      return isCurrentlyOpen ? {} : { [catId]: true };
    });
  };

  const isSuperAdmin = currentUser?.role === 'superadmin';

  const categories: MenuCategory[] = [
    {
      id: 'dashboard-group',
      label: '1. Dashboard',
      icon: LayoutDashboard,
      themeStyle: {
        gradient: 'bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950',
        border: 'border-purple-500/40 hover:border-purple-400',
        iconBg: 'bg-purple-500/25 border border-purple-400/40',
        iconText: 'text-purple-300',
        badgeBg: 'bg-purple-950 text-purple-200 border border-purple-400/30',
        subContainerBg: 'bg-gradient-to-b from-purple-950/90 via-slate-950/95 to-purple-950/90 border-purple-500/50 shadow-inner',
        subItemActive: 'bg-purple-600 text-white font-extrabold shadow-sm',
        subItemHover: 'text-purple-100 hover:text-white hover:bg-purple-900/60 font-medium',
        subActiveBadge: 'bg-purple-900 text-white',
        subInactiveBadge: 'bg-purple-950 text-purple-200 border border-purple-800',
      },
      subMenus: [
        { id: 'dashboard', label: 'Ringkasan Utama', icon: LayoutDashboard },
        { id: 'account', label: 'Account Admin', icon: Users },
        {
          id: 'ftth',
          label: 'FTTH (OLT/ODP/ONU)',
          icon: Network,
        },
        {
          id: 'ftth-gis',
          label: 'Peta GIS & Jalur Fiber',
          icon: Compass,
        },
        {
          id: 'tr069',
          label: 'TR 069 (GenieACS API/Cloud)',
          icon: Radio,
        },
      ],
    },
    {
      id: 'radius-group',
      label: '2. Radius',
      icon: Router,
      badge: `${stats.activeSessionsCount} online`,
      themeStyle: {
        gradient: 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950',
        border: 'border-emerald-500/40 hover:border-emerald-400',
        iconBg: 'bg-emerald-500/25 border border-emerald-400/40',
        iconText: 'text-emerald-300',
        badgeBg: 'bg-emerald-950 text-emerald-300 border border-emerald-400/40 font-bold',
        subContainerBg: 'bg-gradient-to-b from-emerald-950/90 via-slate-950/95 to-emerald-950/90 border-emerald-500/50 shadow-inner',
        subItemActive: 'bg-emerald-600 text-white font-extrabold shadow-sm',
        subItemHover: 'text-emerald-100 hover:text-white hover:bg-emerald-900/60 font-medium',
        subActiveBadge: 'bg-emerald-900 text-white',
        subInactiveBadge: 'bg-emerald-950 text-emerald-200 border border-emerald-800',
      },
      subMenus: [
        { id: 'setting-vpn', label: 'Pengaturan: VPN', icon: Shield },
        { id: 'radius-setting', label: 'Pengaturan: Radius (NAS)', icon: Radio, badge: `${nasList.length}` },
        { id: 'radius-ppp', label: 'PPP-DHCP (PPPoE, Sesi, Profil)', icon: Router },
        { id: 'radius-hotspot', label: 'Hotspot (Voucher, Sesi, Profil)', icon: Wifi },
        {
          id: 'mikrotik-queue',
          label: 'Spooler & Retry Queue',
          icon: ListFilter,
          badge: commandQueue.filter(q => q.status === 'pending').length > 0
            ? `${commandQueue.filter(q => q.status === 'pending').length}`
            : undefined,
          badgeColor: 'bg-amber-500 text-slate-950',
        },
      ],
    },
    {
      id: 'billing-group',
      label: '3. Billing',
      icon: ReceiptText,
      badge: stats.unpaidInvoicesCount > 0 ? `${stats.unpaidInvoicesCount} tagihan` : undefined,
      themeStyle: {
        gradient: 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950',
        border: 'border-amber-500/40 hover:border-amber-400',
        iconBg: 'bg-amber-500/25 border border-amber-400/40',
        iconText: 'text-amber-300',
        badgeBg: 'bg-amber-950 text-amber-300 border border-amber-400/40 font-bold',
        subContainerBg: 'bg-gradient-to-b from-amber-950/90 via-slate-950/95 to-amber-950/90 border-amber-500/50 shadow-inner',
        subItemActive: 'bg-amber-600 text-white font-extrabold shadow-sm',
        subItemHover: 'text-amber-100 hover:text-white hover:bg-amber-900/60 font-medium',
        subActiveBadge: 'bg-amber-900 text-white',
        subInactiveBadge: 'bg-amber-950 text-amber-200 border border-amber-800',
      },
      subMenus: [
        { id: 'billing-member', label: 'Member Pelanggan', icon: Users },
        { id: 'billing-transaction', label: 'Transaction & Invoice', icon: ReceiptText },
        { id: 'billing-batch-print', label: 'Cetak Massal & Kuitansi', icon: Printer },
        { id: 'isolir', label: 'Isolir Otomatis MikroTik', icon: Shield },
      ],
    },
    {
      id: 'payment-group',
      label: '4. Payment',
      icon: CreditCard,
      themeStyle: {
        gradient: 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950',
        border: 'border-blue-500/40 hover:border-blue-400',
        iconBg: 'bg-blue-500/25 border border-blue-400/40',
        iconText: 'text-blue-300',
        badgeBg: 'bg-blue-950 text-blue-300 border border-blue-400/40 font-bold',
        subContainerBg: 'bg-gradient-to-b from-blue-950/90 via-slate-950/95 to-blue-950/90 border-blue-500/50 shadow-inner',
        subItemActive: 'bg-blue-600 text-white font-extrabold shadow-sm',
        subItemHover: 'text-blue-100 hover:text-white hover:bg-blue-900/60 font-medium',
        subActiveBadge: 'bg-blue-900 text-white',
        subInactiveBadge: 'bg-blue-950 text-blue-200 border border-blue-800',
      },
      subMenus: [
        { id: 'payment-auto-mutasi', label: 'Auto-Mutasi & Webhook (Moota)', icon: Zap },
        { id: 'payment-gateway', label: 'Payment Gateway API', icon: Sparkles },
        { id: 'payment-rekening', label: 'Input Nomor Rekening', icon: Building2 },
        { id: 'payment-qris', label: 'Upload QRIS Merchant', icon: QrCode },
      ],
    },
    {
      id: 'laporan-group',
      label: '5. Laporan',
      icon: TrendingUp,
      themeStyle: {
        gradient: 'bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950',
        border: 'border-cyan-500/40 hover:border-cyan-400',
        iconBg: 'bg-cyan-500/25 border border-cyan-400/40',
        iconText: 'text-cyan-300',
        badgeBg: 'bg-cyan-950 text-cyan-300 border border-cyan-400/40 font-bold',
        subContainerBg: 'bg-gradient-to-b from-cyan-950/90 via-slate-950/95 to-cyan-950/90 border-cyan-500/50 shadow-inner',
        subItemActive: 'bg-cyan-600 text-white font-extrabold shadow-sm',
        subItemHover: 'text-cyan-100 hover:text-white hover:bg-cyan-900/60 font-medium',
        subActiveBadge: 'bg-cyan-900 text-white',
        subInactiveBadge: 'bg-cyan-950 text-cyan-200 border border-cyan-800',
      },
      subMenus: [
        { id: 'laporan-keuntungan', label: 'Laba/Rugi & Churn Rate', icon: PieChart },
        { id: 'laporan-audit', label: 'Audit Trail & Log Staf', icon: Shield },
        { id: 'backup', label: 'Backup & Restore Database', icon: Database },
      ],
    },
    {
      id: 'ai-tools-group',
      label: '6. Tools AI',
      icon: Bot,
      badge: 'Gemini Pro',
      themeStyle: {
        gradient: 'bg-gradient-to-r from-pink-950 via-slate-900 to-pink-950',
        border: 'border-pink-500/40 hover:border-pink-400',
        iconBg: 'bg-pink-500/25 border border-pink-400/40',
        iconText: 'text-pink-300',
        badgeBg: 'bg-pink-950 text-pink-300 border border-pink-400/40 font-bold',
        subContainerBg: 'bg-gradient-to-b from-pink-950/90 via-slate-950/95 to-pink-950/90 border-pink-500/50 shadow-inner',
        subItemActive: 'bg-pink-600 text-white font-extrabold shadow-sm',
        subItemHover: 'text-pink-100 hover:text-white hover:bg-pink-900/60 font-medium',
        subActiveBadge: 'bg-pink-900 text-white',
        subInactiveBadge: 'bg-pink-950 text-pink-200 border border-pink-800',
      },
      subMenus: [
        { id: 'ai-tools', label: 'AI MikroTik & Hotspot Generator', icon: Sparkles },
      ],
    },
    {
      id: 'helpdesk-group',
      label: '7. Helpdesk & Tiket',
      icon: LifeBuoy,
      badge: openTicketsCount > 0 ? `${openTicketsCount} open` : undefined,
      themeStyle: {
        gradient: 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950',
        border: 'border-rose-500/40 hover:border-rose-400',
        iconBg: 'bg-rose-500/25 border border-rose-400/40',
        iconText: 'text-rose-300',
        badgeBg: 'bg-rose-950 text-rose-300 border border-rose-400/40 font-bold',
        subContainerBg: 'bg-gradient-to-b from-rose-950/90 via-slate-950/95 to-rose-950/90 border-rose-500/50 shadow-inner',
        subItemActive: 'bg-rose-600 text-white font-extrabold shadow-sm',
        subItemHover: 'text-rose-100 hover:text-white hover:bg-rose-900/60 font-medium',
        subActiveBadge: 'bg-rose-900 text-white',
        subInactiveBadge: 'bg-rose-950 text-rose-200 border border-rose-800',
      },
      subMenus: [
        { id: 'helpdesk', label: 'Tiket Gangguan & Dispatch', icon: LifeBuoy },
      ],
    },
    // 8. Server VPS & Hub (Pusat Penyedia & Infrastruktur Masmedianet)
    ...(isSuperAdmin
      ? [
          {
            id: 'tenants-group',
            label: '8. Server VPS & Hub',
            icon: Server,
            badge: `Master VPS`,
            themeStyle: {
              gradient: 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950',
              border: 'border-indigo-500/40 hover:border-indigo-400',
              iconBg: 'bg-indigo-500/25 border border-indigo-400/40',
              iconText: 'text-indigo-300',
              badgeBg: 'bg-indigo-950 text-indigo-300 border border-indigo-400/40 font-bold',
              subContainerBg: 'bg-gradient-to-b from-indigo-950/90 via-slate-950/95 to-indigo-950/90 border-indigo-500/50 shadow-inner',
              subItemActive: 'bg-indigo-600 text-white font-extrabold shadow-sm',
              subItemHover: 'text-indigo-100 hover:text-white hover:bg-indigo-900/60 font-medium',
              subActiveBadge: 'bg-indigo-900 text-white',
              subInactiveBadge: 'bg-indigo-950 text-indigo-200 border border-indigo-800',
            },
            subMenus: [
              { id: 'vps-master-hub', label: 'Port Forwarding (Remote)', icon: Network, badge: 'Pusat' },
              { id: 'tenants', label: 'Kelola Cabang & Mitra ISP', icon: Building2, badge: `${tenants.length}` },
              { id: 'saas-billing', label: 'Auto-Billing Langganan SaaS', icon: ReceiptText, badge: 'SaaS' },
              { id: 'radius-debugger', label: 'Log Radius AAA & CoA', icon: Radio, badge: 'Live' },
            ],
          },
        ]
      : []),
  ];

  const quickLinks = [
    { id: 'panduan', label: 'Buku Panduan & SOP', icon: BookOpen },
    { id: 'whatsapp', label: 'WhatsApp Gateway', icon: MessageSquare },
    { id: 'portal', label: 'Portal Pelanggan', icon: Globe2 },
  ];

  const content = (
    <div className={`w-72 flex flex-col flex-shrink-0 h-full select-none shadow-sm overflow-hidden border-r transition-colors duration-200 ${
      isDark
        ? 'bg-slate-950 border-slate-800 text-slate-200'
        : 'bg-gradient-to-b from-[#500724]/95 via-[#700936]/95 to-[#4c0519]/95 border-pink-700/60 text-white backdrop-blur-md'
    }`}>
      {/* Mobile-only close button header */}
      {onCloseMobile && (
        <div className={`lg:hidden flex items-center justify-between px-4 py-3 border-b ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-pink-700/60 bg-pink-950/80'
        }`}>
          <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-pink-200'}`}>
            Menu Navigasi
          </span>
          <button
            onClick={onCloseMobile}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-pink-300 hover:text-white hover:bg-pink-900/80'
            }`}
            aria-label="Tutup Menu"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scrollable menu items */}
      <div className="p-2 sm:p-2.5 space-y-1 sm:space-y-1.5 flex-1 overflow-y-auto">
        {/* Logged-in User Account Card */}
        {currentUser && (
          <div className={`p-2 rounded-xl mb-1.5 flex items-center justify-between border ${
            currentUser.role === 'superadmin' || currentUser.role === 'admin'
              ? 'bg-purple-950/50 border-purple-500/30 text-purple-200'
              : currentUser.role === 'teknisi'
              ? 'bg-blue-950/50 border-blue-500/30 text-blue-200'
              : currentUser.role === 'kasir'
              ? 'bg-amber-950/50 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-white text-slate-900 font-extrabold text-[10.5px] flex items-center justify-center flex-shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[9px] uppercase font-extrabold opacity-80 truncate">
                  {currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role}
                </div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          </div>
        )}

        <div className={`px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wider uppercase flex items-center justify-between ${
          isDark ? 'text-pink-400' : 'text-pink-300'
        }`}>
          <span>Navigasi Menu Sistem</span>
        </div>

        {categories.map(cat => {
          const CatIcon = cat.icon;
          const isOpen = openCategories[cat.id];
          const hasActiveChild = cat.subMenus.some(sm => sm.id === activeTab);

          return (
            <div key={cat.id} className="space-y-1">
              {/* Category Header (Thematic Dark Gradient Card) */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-xs ${
                  cat.themeStyle.gradient
                } ${cat.themeStyle.border} ${
                  hasActiveChild ? 'ring-1.5 ring-pink-500/60 shadow-sm scale-[1.005]' : 'hover:scale-[1.005]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${cat.themeStyle.iconBg} ${cat.themeStyle.iconText} flex items-center justify-center shadow-xs flex-shrink-0`}>
                    <CatIcon className="w-3 h-3" />
                  </div>
                  <span className="font-extrabold text-[12px] text-white tracking-wide">{cat.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {cat.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${cat.themeStyle.badgeBg}`}>
                      {cat.badge}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>
              </button>

              {/* Sub-menus with Matching Thematic Container */}
              {isOpen && (
                <div className={`pl-1.5 pr-1 py-1 space-y-0.5 ml-2 rounded-lg border shadow-xs ${cat.themeStyle.subContainerBg}`}>
                  {cat.subMenus.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectTab(sub.id)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11.5px] transition-all ${
                          isSubActive
                            ? cat.themeStyle.subItemActive
                            : cat.themeStyle.subItemHover
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <SubIcon className={`w-3 h-3 flex-shrink-0 ${
                            isSubActive ? 'text-white' : 'text-slate-300'
                          }`} />
                          <span className="truncate text-white/95">{sub.label}</span>
                          {sub.isLocked && (
                            <Lock className="w-2.5 h-2.5 text-amber-400 flex-shrink-0 opacity-80" />
                          )}
                        </div>
                        {sub.badge && (
                          <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold ${
                            sub.badgeColor
                              ? sub.badgeColor
                              : isSubActive
                              ? cat.themeStyle.subActiveBadge
                              : cat.themeStyle.subInactiveBadge
                          }`}>
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Quick Utilities (Directly visible without scroll) */}
        <div className={`pt-1.5 border-t space-y-1 ${isDark ? 'border-slate-800' : 'border-pink-700/60'}`}>
          <div className={`px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-pink-300'
          }`}>
            Utilitas Tambahan
          </div>
          {quickLinks.map(link => {
            const LinkIcon = link.icon;
            const isLinkActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleSelectTab(link.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isLinkActive
                    ? 'bg-pink-600 text-white border-pink-700 shadow-xs'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/70 shadow-xs'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white text-[11.5px]">{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile / Tablet Drawer with smooth overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
