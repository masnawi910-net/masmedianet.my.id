import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { LoginPage } from './components/Auth/LoginPage';
import { Building2, ShieldAlert } from 'lucide-react';

// Views
import { DashboardView } from './components/Dashboard/DashboardView';
import { AccountView } from './components/Account/AccountView';
import { FTTHView } from './components/FTTH/FTTHView';
import { GISMapView } from './components/FTTH/GISMapView';
import { TR069View } from './components/TR069/TR069View';

import { PPPDHCPView } from './components/Radius/PPPDHCPView';
import { HotspotView } from './components/Radius/HotspotView';
import { RadiusSettingView } from './components/Radius/RadiusSettingView';
import { VPNSettingView } from './components/Radius/VPNSettingView';

import { BatchInvoicePrintView } from './components/Billing/BatchInvoicePrintView';
import { IsolirEngineView } from './components/Isolir/IsolirEngineView';

import { PaymentConfigView } from './components/Payment/PaymentConfigView';
import { FinancialReportsView } from './components/Reports/FinancialReportsView';
import { AIToolsView } from './components/AITools/AIToolsView';
import { TicketHelpdeskView } from './components/Helpdesk/TicketHelpdeskView';
import { AuditTrailAndBackupView } from './components/Database/AuditTrailAndBackupView';

import { WhatsAppView } from './components/WhatsApp/WhatsAppView';
import { CustomerPortalView } from './components/Portal/CustomerPortalView';
import { CustomerListView } from './components/Customers/CustomerListView';
import { PackageListView } from './components/Packages/PackageListView';
import { MikroTikView } from './components/MikroTik/MikroTikView';
import { BillingView } from './components/Billing/BillingView';
import { TenantManagement } from './components/Tenants/TenantManagement';
import { VPSMasterHubView } from './components/VPS/VPSMasterHubView';
import { GuideView } from './components/Guide/GuideView';
import { PlanUpgradePrompt } from './components/common/PlanUpgradePrompt';
import { TenantPlanSelectionModal } from './components/Tenants/TenantPlanSelectionModal';

const MainContent: React.FC = () => {
  const { activeTab, currentUser, currentTenant } = useApp();

  const tenantPlan = currentTenant?.plan || 'starter';
  const hasFtthAccess = tenantPlan === 'basic' || tenantPlan === 'pro' || tenantPlan === 'enterprise' || currentUser?.role === 'superadmin';

  return (
    <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto overflow-y-auto pb-24 md:pb-8">
      {/* 1. Dashboard Sub-menus */}
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'account' && <AccountView />}
      {activeTab === 'ftth' && (
        hasFtthAccess ? (
          <FTTHView />
        ) : (
          <PlanUpgradePrompt
            featureName="FTTH (OLT / ODP / ONU)"
            minPlanName="Paket Basic"
            description="Modul FTTH OLT/ODP/ONU untuk manajemen port PON, splitter ODC/ODP, dan redaman sinyal optical dBm tersedia mulai dari Paket Basic (Rp 100.000/bln)."
          />
        )
      )}
      {(activeTab === 'ftth-gis' || activeTab === 'gis-map') && (
        hasFtthAccess ? (
          <GISMapView />
        ) : (
          <PlanUpgradePrompt
            featureName="Peta GIS & Jalur Fiber Optik"
            minPlanName="Paket Basic"
            description="Fitur Peta GIS Geografis & Tracing Jalur Kabel Fiber Optik (ODC/ODP/Drop Core) tersedia mulai dari Paket Basic (Rp 100.000/bln)."
          />
        )
      )}
      {activeTab === 'tr069' && (
        hasFtthAccess ? (
          <TR069View />
        ) : (
          <PlanUpgradePrompt
            featureName="TR-069 (GenieACS Cloud)"
            minPlanName="Paket Basic"
            description="Fitur Manajemen Jarak Jauh Modem / CPE Pelanggan (Ganti SSID WiFi, Password, Remote Reboot, Diagnostic ONT) via TR-069 GenieACS API tersedia mulai dari Paket Basic (Rp 100.000/bln)."
          />
        )
      )}

      {/* 2. Radius Sub-menus */}
      {(activeTab === 'radius-ppp' || activeTab === 'ppp-dhcp') && <PPPDHCPView />}
      {(activeTab === 'radius-hotspot' || activeTab === 'hotspot') && <HotspotView />}
      {(activeTab === 'radius-setting' || activeTab === 'setting' || activeTab === 'setting-radius' || activeTab === 'radius') && <RadiusSettingView />}
      {(activeTab === 'mikrotik-queue' || activeTab === 'queue') && <MikroTikView initialTab="queue" />}

      {/* 3. Billing Sub-menus */}
      {(activeTab === 'billing-member' || activeTab === 'member' || activeTab === 'customers' || activeTab === 'pelanggan' || activeTab === 'pelanggan-member') && <CustomerListView />}
      {(activeTab === 'billing-transaction' || activeTab === 'transaction' || activeTab === 'billing' || activeTab === 'tagihan' || activeTab === 'tagihan-bulanan') && <BillingView />}
      {(activeTab === 'billing-batch-print' || activeTab === 'batch-print') && <BatchInvoicePrintView />}
      {activeTab === 'isolir' && <IsolirEngineView />}

      {/* 4. Payment Sub-menus */}
      {(activeTab === 'payment-gateway' ||
        activeTab === 'payment-auto-mutasi' ||
        activeTab === 'payment-rekening' ||
        activeTab === 'payment-qris' ||
        activeTab === 'payment') && <PaymentConfigView />}

      {/* 5. Laporan Sub-menus */}
      {(activeTab === 'laporan-keuntungan' ||
        activeTab === 'laporan-pemasukan' ||
        activeTab === 'laporan-pengeluaran' ||
        activeTab === 'reports') && <FinancialReportsView />}
      {(activeTab === 'audit-trail' ||
        activeTab === 'laporan-audit' ||
        activeTab === 'backup') && <AuditTrailAndBackupView />}

      {/* 6. Tools AI Sub-menus */}
      {(activeTab === 'ai-tools' || activeTab === 'tools-ai') && <AIToolsView />}

      {/* 7. Helpdesk & Tiket */}
      {(activeTab === 'helpdesk' || activeTab === 'tickets') && <TicketHelpdeskView />}

      {/* 8. Server VPS & Hub (Superadmin Exclusive) */}
      {(activeTab === 'tenants' ||
        activeTab === 'multi-tenant' ||
        activeTab === 'vps-master-hub' ||
        activeTab === 'port-forwarding' ||
        activeTab === 'saas-billing' ||
        activeTab === 'radius-debugger') && (
        currentUser?.role === 'superadmin' ? (
          <VPSMasterHubView />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Akses Khusus Super Admin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Menu Manajemen Multi-ISP & Server VPS hanya dapat diakses oleh Pemilik Aplikasi / Super Admin. Anda saat ini login sebagai Admin Cabang ({currentUser?.tenantName || 'Organisasi Anda'}).
            </p>
          </div>
        )
      )}

      {/* Radius Pengaturan: VPN */}
      {(activeTab === 'vpn' || activeTab === 'setting-vpn') && <VPNSettingView />}

      {/* Utilities */}
      {(activeTab === 'panduan' || activeTab === 'guide' || activeTab === 'buku-panduan') && <GuideView />}
      {activeTab === 'whatsapp' && <WhatsAppView />}
      {(activeTab === 'portal' || activeTab === 'portal-pelanggan') && <CustomerPortalView />}
      {activeTab === 'packages' && <PackageListView />}
      {activeTab === 'mikrotik' && <MikroTikView />}
    </main>
  );
};

const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, currentUser, currentTenant, activeTab, setActiveTab } = useApp();
  const isDark = theme === 'dark';

  // Check if current logged-in partner must select their subscription package first
  const mustSelectPlan =
    currentUser &&
    currentUser.role !== 'superadmin' &&
    (!currentTenant?.hasSelectedPlan || currentTenant?.plan === 'unselected');

  // If user visits the public customer portal (without needing admin credentials)
  if ((activeTab === 'portal' || activeTab === 'portal-pelanggan') && !currentUser) {
    return (
      <div className={`min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
      }`}>
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3.5 flex items-center justify-between max-w-5xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white font-extrabold shadow-lg shadow-pink-500/20">
              NR
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-wide">Portal Pelanggan Internet</h1>
              <p className="text-[11px] text-slate-400">Cek tagihan, bayar QRIS, ganti WiFi, & lapor gangguan</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('login')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            Login Admin / Petugas
          </button>
        </header>

        <main className="flex-1 p-3 sm:p-6 max-w-5xl w-full mx-auto">
          <CustomerPortalView isPublicStandalone={true} />
        </main>

        <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} NetRadius Internet Service • Sistem Layanan Mandiri Pelanggan
        </footer>
      </div>
    );
  }

  if (!currentUser || activeTab === 'login') {
    return <LoginPage />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white transition-colors duration-200 ${
      isDark
        ? 'bg-slate-950 text-slate-100'
        : 'bg-gradient-to-br from-[#4c0519] via-[#700936] to-[#500724] text-white'
    }`}>
      {/* Top App Bar with Mobile Menu Toggle */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Body Shell: Desktop Sidebar + Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <MainContent />
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav
        onOpenMenu={() => setMobileMenuOpen(true)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* Mandatory Plan Selection Modal for New ISP Partners */}
      <TenantPlanSelectionModal
        isOpen={!!mustSelectPlan}
        isForced={true}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
