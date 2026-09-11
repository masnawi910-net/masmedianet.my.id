import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Router,
  Menu,
  Sparkles,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenMenu,
  isMobileMenuOpen,
}) => {
  const { activeTab, setActiveTab, stats, tickets, theme } = useApp();
  const isDark = theme === 'dark';

  const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: activeTab === 'dashboard',
      onClick: () => setActiveTab('dashboard'),
    },
    {
      id: 'billing-member',
      label: 'Pelanggan',
      icon: Users,
      badge: stats.totalCustomers > 0 ? stats.totalCustomers : undefined,
      isActive: activeTab === 'billing-member' || activeTab === 'customers',
      onClick: () => setActiveTab('billing-member'),
    },
    {
      id: 'billing-transaction',
      label: 'Tagihan',
      icon: ReceiptText,
      badge: stats.unpaidInvoicesCount > 0 ? stats.unpaidInvoicesCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
      isActive: activeTab === 'billing-transaction' || activeTab === 'billing-batch-print' || activeTab === 'isolir',
      onClick: () => setActiveTab('billing-transaction'),
    },
    {
      id: 'radius-ppp',
      label: 'MikroTik',
      icon: Router,
      badge: stats.activeSessionsCount > 0 ? `${stats.activeSessionsCount}` : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950',
      isActive: activeTab === 'radius-ppp' || activeTab === 'radius-hotspot' || activeTab === 'mikrotik' || activeTab === 'radius-setting',
      onClick: () => setActiveTab('radius-ppp'),
    },
  ];

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t select-none pb-safe transition-colors ${
      isDark
        ? 'bg-slate-950/95 border-slate-800/90 text-slate-200'
        : 'bg-gradient-to-r from-[#500724]/95 via-[#700936]/95 to-[#500724]/95 border-pink-700/60 text-white shadow-md'
    }`}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                item.isActive
                  ? isDark ? 'text-pink-400 font-bold' : 'text-pink-300 font-extrabold'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-pink-200/70 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${
                  item.isActive ? (isDark ? 'scale-110 text-pink-400' : 'scale-110 text-pink-300') : ''
                }`} />
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight shadow-xs ${
                      item.badgeColor || 'bg-pink-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[64px] ${
                item.isActive
                  ? isDark ? 'font-extrabold text-pink-300' : 'font-extrabold text-white'
                  : 'font-medium'
              }`}>
                {item.label}
              </span>
              {item.isActive && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${isDark ? 'bg-pink-400' : 'bg-pink-300'}`} />
              )}
            </button>
          );
        })}

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={onOpenMenu}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
            isMobileMenuOpen
              ? isDark ? 'text-pink-400 font-bold' : 'text-pink-300 font-extrabold'
              : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-pink-200/70 hover:text-white'
          }`}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {openTicketsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-semibold tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
