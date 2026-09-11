import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Zap, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SAAS_TENANT_PLANS } from '../../types';

interface PlanUpgradePromptProps {
  featureName: string;
  minPlanName?: string;
  description?: string;
}

export const PlanUpgradePrompt: React.FC<PlanUpgradePromptProps> = ({
  featureName,
  minPlanName = 'Paket Basic',
  description = 'Fitur ini tersedia mulai dari Paket Basic (Rp 100.000/bulan), Pro Bisnis, atau Enterprise untuk pengelolaan jaringan FTTH & TR-069 tingkat lanjut.',
}) => {
  const { setActiveTab, setActiveSubTab, setNavigation, currentTenant } = useApp();

  const basicPlan = SAAS_TENANT_PLANS.basic;

  const handleGoToUpgrade = () => {
    setNavigation('dashboard', 'account', 'paket-layanan');
    setActiveTab('account');
    setActiveSubTab('paket-layanan');
  };

  return (
    <div className="max-w-3xl mx-auto my-6 sm:my-10 space-y-6 animate-fadeIn">
      {/* Locked Feature Card */}
      <div className="bg-slate-900/90 border-2 border-dashed border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Tersedia Mulai dari {minPlanName}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Akses Menu {featureName} Terkunci
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Current vs Required Plan comparison pill */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between gap-4 text-left">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Paket Anda Saat Ini:</span>
            <span className="text-xs font-black text-rose-400 uppercase font-mono">
              Paket {currentTenant?.plan || 'Starter'}
            </span>
          </div>
          <div className="text-slate-600 font-black text-sm">➔</div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Minimal Paket:</span>
            <span className="text-xs font-black text-blue-400 uppercase font-mono">
              {minPlanName} (Rp {basicPlan.priceMonthly.toLocaleString('id-ID')}/bln)
            </span>
          </div>
        </div>

        {/* Feature Highlights of Basic Plan */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 max-w-lg mx-auto text-left space-y-2">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Keuntungan Upgrade ke Paket Basic (Rp 100.000 / bln):
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span><b>FTTH OLT/ODP/ONU:</b> Monitoring redaman sinyal dBm, status GPON/EPON realtime.</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span><b>Peta GIS & Jalur Fiber:</b> Pemetaan kabel FO, ODC, ODP, dan drop core pelanggan di peta interaktif.</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span><b>TR-069 GenieACS Cloud:</b> Remote setting modem ONT, ganti SSID/password WiFi, reboot ONT tanpa ke rumah pelanggan.</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span><b>Kapasitas & VPN:</b> Hingga 500 Pelanggan PPP, 3.000 Voucher Hotspot, 2 Router MikroTik & Gratis 2 VPN BILLSPOT.</span>
            </li>
          </ul>
        </div>

        {/* Upgrade Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoToUpgrade}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-blue-500/25 active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current text-white" />
            <span>Upgrade ke Paket Basic Sekarang</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </button>
          <p className="text-[11px] text-slate-500 mt-2">
            Aktivasi instan via QRIS Tripay, BCA, BRI, dan Mandiri Virtual Account.
          </p>
        </div>
      </div>
    </div>
  );
};
