import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Server,
  Users,
  Wifi,
  Activity,
  Sparkles,
  Layers,
  CreditCard,
  Building2,
  Check,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Clock,
  QrCode,
  Landmark,
  Radio,
  LogOut,
  X,
} from 'lucide-react';
import { TenantPlanId, SAAS_TENANT_PLANS, TenantPlanDetails } from '../../types';

interface TenantPlanSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isForced?: boolean; // Jika true, mitra wajib memilih paket sebelum bisa masuk ke dashboard
}

export const TenantPlanSelectionModal: React.FC<TenantPlanSelectionModalProps> = ({
  isOpen,
  onClose,
  isForced = false,
}) => {
  const {
    currentTenant,
    upgradeTenantPlan,
    updateTenant,
    logout,
    theme,
    logActivity,
  } = useApp();

  const isDark = theme === 'dark';

  const [selectedPlanId, setSelectedPlanId] = useState<TenantPlanId>('basic');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'instant' | 'qris' | 'va' | 'transfer'>('instant');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ planName: string; duration: string } | null>(null);

  if (!isOpen) return null;

  const currentPlan = SAAS_TENANT_PLANS[selectedPlanId] || SAAS_TENANT_PLANS.basic;

  // Calculate pricing with multi-month discounts
  const baseMonthlyPrice = currentPlan.priceMonthly;
  let discountPercent = 0;
  if (durationMonths === 3) discountPercent = 5;
  if (durationMonths === 6) discountPercent = 10;
  if (durationMonths === 12) discountPercent = 15;

  const rawTotal = baseMonthlyPrice * durationMonths;
  const discountAmount = Math.round((rawTotal * discountPercent) / 100);
  const finalTotal = rawTotal - discountAmount;

  const handleConfirmPlan = () => {
    if (!currentTenant) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const res = upgradeTenantPlan(currentTenant.id, selectedPlanId, paymentMethod);
      
      // Calculate new expiry date based on selected duration
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (durationMonths * 30));
      const expiryStr = expiry.toISOString().slice(0, 10);

      updateTenant(currentTenant.id, {
        hasSelectedPlan: true,
        plan: selectedPlanId,
        tier: selectedPlanId,
        priceMonthly: currentPlan.priceMonthly,
        maxCustomers: currentPlan.maxPppoeUsers,
        maxPppoeUsers: currentPlan.maxPppoeUsers,
        maxHotspotUsers: currentPlan.maxHotspotUsers,
        maxActiveHotspotSessions: currentPlan.maxActiveHotspotSessions,
        maxNas: currentPlan.maxNas,
        freeVpnBillspot: currentPlan.freeVpnBillspot,
        subscriptionStatus: 'active',
        lastSubscriptionPayment: new Date().toISOString().slice(0, 10),
        expiryDate: expiryStr,
      });

      logActivity(
        'system',
        'PILIH_PAKET_SEWA_MITRA',
        `Mitra "${currentTenant.name}" berhasil memilih ${currentPlan.name} durasi ${durationMonths} bulan (${paymentMethod.toUpperCase()}).`
      );

      setIsSubmitting(false);
      setSuccessInfo({
        planName: currentPlan.name,
        duration: `${durationMonths} Bulan`,
      });
      setShowSuccessBanner(true);

      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-7xl my-auto rounded-3xl border shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Top Header */}
        <div className="relative px-6 py-5 sm:px-8 sm:py-6 bg-gradient-to-r from-pink-900 via-rose-900 to-indigo-950 text-white border-b border-pink-700/40">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Paket Langganan & Sewa Bulanan Mitra Pengelola</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Pilih Kapasitas Jaringan untuk Mitra ISP Anda
              </h2>
              <p className="text-xs sm:text-sm text-pink-100/80 max-w-3xl font-medium">
                Selamat datang di <strong className="text-white">Masmedia Network</strong>. Organisasi cabang Anda:{' '}
                <strong className="text-pink-300 underline">{currentTenant?.name || 'Mitra ISP Baru'}</strong>. Silakan pilih paket sewa untuk mengaktifkan kuota pelanggan, router MikroTik, FTTH OLT, dan TR-069 GenieACS.
              </p>
            </div>

            {/* Close Button or Logout Button if forced */}
            <div>
              {isForced ? (
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
                  title="Keluar / Batalkan Login"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              ) : (
                onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Success Banner */}
          {showSuccessBanner && successInfo && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-black text-sm">
                  Paket Berhasil Diaktifkan!
                </div>
                <div className="text-xs text-emerald-200">
                  Selamat! {successInfo.planName} ({successInfo.duration}) telah aktif untuk cabang Anda. Mengarahkan ke Dashboard...
                </div>
              </div>
            </div>
          )}

          {/* Duration Selector Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                1. Pilih Durasi Periode Sewa
              </label>
              {discountPercent > 0 && (
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Hemat {discountPercent}% ({durationMonths} Bulan)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { months: 1, label: '1 Bulan', sub: 'Bulanan Fleksibel', discount: 0 },
                { months: 3, label: '3 Bulan', sub: 'Diskon 5%', discount: 5 },
                { months: 6, label: '6 Bulan', sub: 'Diskon 10%', discount: 10 },
                { months: 12, label: '12 Bulan / 1 Tahun', sub: 'Diskon 15% (Hemat)', discount: 15 },
              ].map(d => {
                const isSelected = durationMonths === d.months;
                return (
                  <button
                    key={d.months}
                    type="button"
                    onClick={() => setDurationMonths(d.months)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-600/20 to-rose-600/20 border-pink-500 text-white shadow-md'
                        : isDark
                        ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-xs sm:text-sm flex items-center justify-between">
                      <span>{d.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-pink-400" />}
                    </div>
                    <div className={`text-[11px] mt-0.5 font-semibold ${isSelected ? 'text-pink-300' : 'text-slate-500'}`}>
                      {d.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 Plan Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              2. Pilih Paket Langganan & Kapasitas Jaringan Mitra
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
              {(Object.keys(SAAS_TENANT_PLANS) as TenantPlanId[]).map(planKey => {
                const plan = SAAS_TENANT_PLANS[planKey];
                const isSelected = selectedPlanId === planKey;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-3xl p-4 border flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-b from-pink-950/50 via-slate-900 to-slate-950 border-pink-500 shadow-xl shadow-pink-600/20 ring-2 ring-pink-500/50 scale-[1.02]'
                        : isDark
                        ? 'bg-slate-950 hover:bg-slate-800/50 border-slate-800 text-slate-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    {/* Popular Pill */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-md whitespace-nowrap">
                        Paling Populer
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-sm text-white">
                          {plan.name}
                        </span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-pink-600 border-pink-500 text-white' : 'border-slate-600 bg-slate-800'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-2.5 pb-2.5 border-b border-slate-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-white font-mono">
                            Rp {plan.priceMonthly.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            /bln
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          {plan.recommendedFor}
                        </div>
                      </div>

                      {/* Key Quota Badges */}
                      <div className="space-y-1.5 mb-3 text-xs font-semibold">
                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-slate-400 text-[10.5px] flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-400 flex-shrink-0" /> PPP (PPPoE):
                          </span>
                          <span className="text-emerald-300 font-bold text-[10.5px]">
                            {plan.maxPppoeUsers >= 999999 ? 'Unlimited' : `${plan.maxPppoeUsers} User`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-slate-400 text-[10.5px] flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-blue-400 flex-shrink-0" /> Hotspot:
                          </span>
                          <span className="text-blue-300 font-bold text-[10.5px]">
                            {plan.maxHotspotUsers >= 999999 ? 'Unlimited' : `${plan.maxHotspotUsers.toLocaleString('id-ID')}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-slate-400 text-[10.5px] flex items-center gap-1">
                            <Activity className="w-3 h-3 text-amber-400 flex-shrink-0" /> Sesi Aktif:
                          </span>
                          <span className="text-amber-300 font-bold text-[10.5px]">
                            {plan.maxActiveHotspotSessions >= 999999 ? 'Unlimited' : `${plan.maxActiveHotspotSessions.toLocaleString('id-ID')}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-slate-400 text-[10.5px] flex items-center gap-1">
                            <Server className="w-3 h-3 text-purple-400 flex-shrink-0" /> MikroTik:
                          </span>
                          <span className="text-purple-300 font-bold text-[10.5px]">
                            {plan.maxNas >= 999999 ? 'Unlimited' : `${plan.maxNas} NAS`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-1.5 rounded-xl bg-pink-950/40 border border-pink-500/30">
                          <span className="text-pink-300 text-[10.5px] flex items-center gap-1 font-bold">
                            <Zap className="w-3 h-3 text-pink-400 flex-shrink-0" /> VPN BILLSPOT:
                          </span>
                          <span className="text-pink-200 font-black text-[10.5px]">
                            Gratis {plan.freeVpnBillspot} VPN
                          </span>
                        </div>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-1 text-[10.5px] text-slate-300">
                        {plan.features.slice(5, 8).map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1 leading-tight">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Select Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <button
                        type="button"
                        className={`w-full py-1.5 px-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isSelected ? 'Paket Terpilih' : 'Pilih Paket'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Activation Method */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-pink-400" />
              3. Pilih Metode Pembayaran / Aktivasi
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'instant',
                  title: 'Aktivasi Instan & Masuk Dashboard',
                  desc: 'Mulai uji coba & aktifkan kuota jaringan langsung tanpa antre.',
                  icon: <Zap className="w-5 h-5 text-amber-400" />,
                  recommended: true,
                },
                {
                  id: 'qris',
                  title: 'QRIS Realtime (Semua Bank & e-Wallet)',
                  desc: 'BCA, Mandiri, BRI, BNI, Dana, GoPay, OVO, ShopeePay.',
                  icon: <QrCode className="w-5 h-5 text-pink-400" />,
                },
                {
                  id: 'va',
                  title: 'Virtual Account / Transfer Bank',
                  desc: 'BCA VA, Mandiri VA, BRI VA, atau Rekening Resmi.',
                  icon: <Landmark className="w-5 h-5 text-blue-400" />,
                },
              ].map(m => {
                const isSelected = paymentMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-slate-900 border-pink-500 text-white ring-1 ring-pink-500 shadow-md'
                        : isDark
                        ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0">
                      {m.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-xs flex items-center justify-between">
                        <span>{m.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {m.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Summary Box & Confirmation */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-950/40 via-slate-950 to-indigo-950/40 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs text-slate-400 font-semibold">
                Total Biaya Sewa ({currentPlan.name} • {durationMonths} Bulan):
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  Rp {finalTotal.toLocaleString('id-ID')}
                </span>
                {discountAmount > 0 && (
                  <span className="text-xs text-rose-400 line-through">
                    Rp {rawTotal.toLocaleString('id-ID')}
                  </span>
                )}
                <span className="text-xs text-emerald-400 font-bold">
                  (Aktif s/d {new Date(Date.now() + durationMonths * 30 * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isForced ? (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-4 py-3 rounded-2xl border border-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors"
                >
                  Keluar
                </button>
              ) : (
                onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 rounded-2xl border border-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors"
                  >
                    Nanti Saja
                  </button>
                )
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmPlan}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-xl shadow-pink-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengaktifkan Paket...</span>
                  </>
                ) : (
                  <>
                    <span>Konfirmasi & Aktifkan Paket Mitra</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
