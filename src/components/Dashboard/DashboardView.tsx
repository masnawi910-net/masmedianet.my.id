import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Wifi,
  Radio,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Server,
  Zap,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  ChevronRight,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    stats,
    customers,
    invoices,
    packages,
    nasList,
    activeSessions,
    hotspotVouchers,
    setActiveTab,
    runAutoIsolirScan,
    setSelectedCustomerId,
    setSelectedInvoiceId,
    currentTenant,
    currentUser,
    pingRouter,
  } = useApp();

  const [sessionFilter, setSessionFilter] = React.useState<'all' | 'pppoe' | 'hotspot'>('all');

  // Pisahkan Sesi Online PPPoE & Hotspot secara akurat dengan rasio Session Online (Gambar 2)
  const pppoeCustomers = customers.filter(c => c.connectionType === 'pppoe' || !c.connectionType);
  const pppoeOnlineSessions = activeSessions.filter(s => s.service === 'pppoe' || !s.service);
  const pppoeOnlineCount = pppoeOnlineSessions.length;
  const pppoeTotalCount = Math.max(pppoeCustomers.length, pppoeOnlineCount);
  const pppoePercentage = pppoeTotalCount > 0 ? Math.min(100, Math.round((pppoeOnlineCount / pppoeTotalCount) * 100)) : 0;
  const pppoeThroughput = pppoeOnlineCount > 0 ? +(pppoeOnlineCount * 1.8 + 6.2).toFixed(1) : 0;

  const hotspotCustomers = customers.filter(c => c.connectionType === 'hotspot');
  const hotspotOnlineSessions = activeSessions.filter(s => s.service === 'hotspot');
  const hotspotOnlineCount = hotspotOnlineSessions.length;
  const hotspotTotalBase = hotspotCustomers.length + (hotspotVouchers?.length || 0);
  const hotspotTotalCount = Math.max(hotspotTotalBase, hotspotOnlineCount);
  const hotspotPercentage = hotspotTotalCount > 0 ? Math.min(100, Math.round((hotspotOnlineCount / hotspotTotalCount) * 100)) : 0;
  const hotspotThroughput = hotspotOnlineCount > 0 ? +(hotspotOnlineCount * 1.2 + 3.5).toFixed(1) : 0;

  const tenantPlan = currentTenant?.plan || 'starter';
  const hasFtthAccess = tenantPlan === 'basic' || tenantPlan === 'pro' || tenantPlan === 'enterprise' || currentUser?.role === 'superadmin';

  const handleRunScan = () => {
    const res = runAutoIsolirScan();
    if (res.isolatedCount > 0) {
      alert(`Berhasil mengisolir ${res.isolatedCount} pelanggan yang melewati batas jatuh tempo!`);
    } else {
      alert('Semua pelanggan aktif dalam batas aman (tidak ada yang perlu di-isolir).');
    }
  };

  // Chart Data: Monthly Revenue History (6 Months) calculated dynamically from real invoices
  const revenueTrendData = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const mInv = invoices.filter(inv => {
        const invDateStr = inv.createdAt || inv.dueDate;
        if (!invDateStr) return false;
        const invDate = new Date(invDateStr);
        return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
      });
      const omset = mInv.reduce((acc, inv) => acc + (inv.totalAmount || inv.packagePrice || 0), 0);
      const bayar = mInv.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + (inv.totalAmount || inv.packagePrice || 0), 0);
      result.push({ bulan: mName, omset, bayar });
    }
    return result;
  }, [invoices]);

  // Chart Data: Package Distribution
  const packageDistData = packages.map(pkg => {
    const count = customers.filter(c => c.packageId === pkg.id).length;
    return {
      name: pkg.name,
      value: count,
    };
  });

  const COLORS = ['#db2777', '#ec4899', '#f43f5e', '#be185d', '#9333ea'];

  // Overdue / Unpaid Invoices
  const urgentInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if any customer is isolated or overdue */}
      {(stats.overdueCustomers > 0 || stats.isolatedCustomers > 0) && (
        <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-red-950/80 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Peringatan Billing: {stats.overdueCustomers} Pelanggan Menunggak & {stats.isolatedCustomers} Terisolir
              </h4>
              <p className="text-xs text-amber-300/80">
                Total piutang belum tertagih: <strong className="text-white">{formatRupiah(stats.unpaidInvoicesAmount)}</strong>. Sistem isolir MikroTik siap dieksekusi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleRunScan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md transition-all"
            >
              <Zap className="w-4 h-4" />
              Eksekusi Isolir Otomatis
            </button>
            <button
              onClick={() => setActiveTab('isolir')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-amber-200 text-xs font-semibold border border-amber-500/30 transition-colors"
            >
              Kelola Isolir
            </button>
          </div>
        </div>
      )}

      {/* Main Metric Cards with Distinct Dark Aesthetic Color Gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Pelanggan - Deep Emerald Gradient */}
        <div className="rounded-2xl p-5 hover:scale-[1.02] transition-all shadow-md relative overflow-hidden group theme-card-blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Total Pelanggan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/25 border border-blue-400/40 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{stats.totalCustomers}</span>
            <span className="text-xs text-white font-bold flex items-center bg-blue-950/70 px-2.5 py-1 rounded-full border border-blue-400/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
              {stats.activeCustomers} Aktif
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-700/40 flex items-center justify-between text-xs text-slate-200">
            <span>Terisolir: <strong className="text-red-400 font-bold">{stats.isolatedCustomers}</strong></span>
            <span>Menunggak: <strong className="text-amber-300 font-bold">{stats.overdueCustomers}</strong></span>
          </div>
        </div>

        {/* Pendapatan Bulan Ini - Deep Pink/Rose Gradient */}
        <div className="rounded-2xl p-5 hover:scale-[1.02] transition-all shadow-md relative overflow-hidden group theme-card-pink">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-200 uppercase tracking-wider">Pendapatan Bulan Ini</span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/25 border border-pink-400/40 flex items-center justify-center text-pink-300 shadow-sm group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatRupiah(stats.totalMonthlyRevenue)}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-pink-700/40 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-200">
              <span>Hari ini: <strong className="text-white font-bold">{formatRupiah(stats.todayRevenue)}</strong></span>
            </div>
            {/* Perbandingan Bulan Lalu */}
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-pink-500/20 text-slate-300">
              <span className="text-pink-200/80 font-medium">Bulan lalu:</span>
              <span className="font-semibold text-white/90">{formatRupiah(1700000)}</span>
            </div>
          </div>
        </div>

        {/* Tagihan Belum Lunas - Deep Amber Gradient */}
        <div className="rounded-2xl p-5 hover:scale-[1.02] transition-all shadow-md relative overflow-hidden group theme-card-amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Tagihan Tertunda</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
              {formatRupiah(stats.unpaidInvoicesAmount)}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-700/40 flex items-center justify-between text-xs text-slate-200">
            <span>{stats.unpaidInvoicesCount} Invoice Tertunda</span>
            <button
              onClick={() => setActiveTab('billing')}
              className="text-amber-300 hover:text-white font-bold hover:underline flex items-center gap-1"
            >
              Lihat Tagihan &rarr;
            </button>
          </div>
        </div>

        {/* Sesi PPPoE Online - Deep Blue Gradient */}
        <div className="rounded-2xl p-5 hover:scale-[1.02] transition-all shadow-md relative overflow-hidden group theme-card-blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Sesi PPPoE Online</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/25 border border-blue-400/40 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
              <Radio className="w-4 h-4 text-blue-300" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{pppoeOnlineCount} User</span>
            <span className="text-xs text-white font-bold bg-blue-950/70 px-2.5 py-1 rounded-full border border-blue-400/40">PPPoE</span>
          </div>

          {/* Sesi Online Progress Bar - Format Gambar 2 */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-200 font-semibold text-[13px]">Session Online</span>
              <span className="text-blue-300 font-bold font-mono text-[13px]">{pppoeOnlineCount} Users / {pppoePercentage}%</span>
            </div>
            <div className="w-full bg-[#1b2b48] rounded-full h-3 p-0.5 border border-blue-400/20 overflow-hidden">
              <div
                className="bg-[#1a8cff] h-full rounded-full transition-all duration-500 shadow-sm shadow-blue-500/40"
                style={{ width: `${Math.max(pppoePercentage, pppoeOnlineCount > 0 ? 6 : 0)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-700/40 flex items-center justify-between text-xs text-slate-200">
            <span>Traffic: <strong className="text-white font-bold">{pppoeThroughput} Mbps</strong></span>
            <button
              onClick={() => setActiveTab('radius-ppp')}
              className="text-blue-300 hover:text-white font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat PPPoE &rarr;
            </button>
          </div>
        </div>

        {/* Sesi Hotspot Online - Deep Cyan Gradient */}
        <div className="rounded-2xl p-5 hover:scale-[1.02] transition-all shadow-md relative overflow-hidden group theme-card-cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Sesi Hotspot Online</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/25 border border-cyan-400/40 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
              <Wifi className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{hotspotOnlineCount} User</span>
            <span className="text-xs text-white font-bold bg-cyan-950/70 px-2.5 py-1 rounded-full border border-cyan-400/40">Hotspot</span>
          </div>

          {/* Sesi Online Progress Bar - Format Gambar 2 */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-200 font-semibold text-[13px]">Session Online</span>
              <span className="text-cyan-300 font-bold font-mono text-[13px]">{hotspotOnlineCount} Users / {hotspotPercentage}%</span>
            </div>
            <div className="w-full bg-[#16364a] rounded-full h-3 p-0.5 border border-cyan-400/20 overflow-hidden">
              <div
                className="bg-[#1a8cff] h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/40"
                style={{ width: `${Math.max(hotspotPercentage, hotspotOnlineCount > 0 ? 6 : 0)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-700/40 flex items-center justify-between text-xs text-slate-200">
            <span>Traffic: <strong className="text-white font-bold">{hotspotThroughput} Mbps</strong></span>
            <button
              onClick={() => setActiveTab('radius-hotspot')}
              className="text-cyan-300 hover:text-white font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat Hotspot &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Router NAS Status Cards */}
      <div className="rounded-2xl p-5 theme-card-cyan shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/25 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Router MikroTik Gateway & RADIUS</h3>
          </div>
          <button
            onClick={() => setActiveTab('radius-setting')}
            className="text-xs font-bold text-cyan-300 hover:text-white hover:underline flex items-center gap-1"
          >
            Kelola NAS RADIUS <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nasList.map(nas => {
            const isOnline = nas.status === 'online';
            const livePppoeCount = isOnline
              ? activeSessions.filter(s => (s.service === 'pppoe' || !s.service) && (s.nasIp === nas.ipAddress || !s.nasIp)).length
              : 0;
            const liveHotspotCount = isOnline
              ? activeSessions.filter(s => s.service === 'hotspot' && (s.nasIp === nas.ipAddress || !s.nasIp)).length
              : 0;

            return (
              <div
                key={nas.id}
                className={`border rounded-xl p-4 transition-all shadow-xs ${
                  isOnline
                    ? 'bg-slate-950/70 border-slate-700/60 hover:border-cyan-400/50'
                    : 'bg-slate-950/90 border-rose-900/50 hover:border-rose-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs border ${
                      isOnline ? 'bg-slate-900 border-slate-700 text-white' : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                    }`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {nas.name}
                        {!isOnline && (
                          <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-600/40">
                            Offline
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-300 font-mono">{nas.ipAddress}:{nas.apiPort} &bull; {nas.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-400/40" title="Status SNMP: Online">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                        Status SNMP: Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40" title="Status SNMP: Offline">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                        Status SNMP: Offline
                      </span>
                    )}

                    <button
                      onClick={() => pingRouter(nas.id)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Uji konektivitas ping & API router secara realtime (tanpa manipulasi manual)"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      Uji Ping
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-300 block font-medium">CPU Load</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            !isOnline ? 'bg-slate-600' : nas.cpuLoad > 70 ? 'bg-red-400' : nas.cpuLoad > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${isOnline ? nas.cpuLoad : 0}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-white">{isOnline ? `${nas.cpuLoad}%` : '0%'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-300 block font-medium">Sesi Online</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs">
                      {isOnline ? `${livePppoeCount} PPP • ${liveHotspotCount} Hotspot` : '0 user'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-300 block font-medium">Uptime</span>
                    <span className="font-mono text-slate-200 truncate block font-medium">
                      {isOnline ? nas.uptime : '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {nasList.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
            Belum ada router MikroTik NAS yang didaftarkan.{' '}
            <button
              onClick={() => setActiveTab('radius-setting')}
              className="text-cyan-400 hover:underline font-bold"
            >
              Daftarkan Router Sekarang &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-2 rounded-2xl p-5 theme-card-pink shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Tren Pendapatan Bulanan (IDR)</h3>
              <p className="text-xs text-slate-300">Total pembayaran tagihan terkumpul 6 bulan terakhir</p>
            </div>
            <span className="text-xs font-bold bg-pink-950/80 text-pink-200 px-2.5 py-1 rounded-lg border border-pink-400/40">
              Target 100% Tertagih
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis dataKey="bulan" stroke="#cbd5e1" fontSize={12} />
                <YAxis
                  stroke="#cbd5e1"
                  fontSize={11}
                  tickFormatter={val => `Rp ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Total Pembayaran']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#f472b6', borderRadius: '0.75rem', color: '#ffffff', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#fbcfe8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="bayar" stroke="#f472b6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Distribution */}
        <div className="rounded-2xl p-5 theme-card-purple shadow-md">
          <h3 className="text-sm font-bold text-white mb-1">Distribusi Paket Pelanggan</h3>
          <p className="text-xs text-slate-300 mb-4">Proporsi paket internet yang diminati</p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={packageDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {packageDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} Pelanggan`, 'Jumlah']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#c084fc', borderRadius: '0.75rem', color: '#ffffff', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#e9d5ff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {packages.map((pkg, idx) => (
              <div key={pkg.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-200 font-medium truncate max-w-[130px]">{pkg.name}</span>
                </div>
                <span className="font-mono text-white font-bold">{formatRupiah(pkg.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="rounded-2xl p-4 sm:p-5 theme-card-dark shadow-md">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Akses Cepat Modul Sistem</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'account', label: 'Admin Account', desc: 'Hak Akses & Role', icon: Users, cardClass: 'theme-card-purple', color: 'text-purple-300 bg-purple-500/25 border border-purple-400/40' },
            { id: 'ftth', label: 'FTTH & OLT/ODP', desc: 'Sinyal dBm & GPON', icon: Server, cardClass: 'theme-card-blue', color: 'text-white bg-blue-500/25 border border-blue-400/40', isLocked: !hasFtthAccess, minPlan: 'Basic' },
            { id: 'tr069', label: 'TR-069 GenieACS', desc: 'Remote CPE & WiFi', icon: Wifi, cardClass: 'theme-card-cyan', color: 'text-cyan-300 bg-cyan-500/25 border border-cyan-400/40', isLocked: !hasFtthAccess, minPlan: 'Basic' },
            { id: 'radius-ppp', label: 'PPP & DHCP', desc: 'Sesi & Rate Limit', icon: Activity, cardClass: 'theme-card-pink', color: 'text-pink-300 bg-pink-500/25 border border-pink-400/40' },
            { id: 'payment-gateway', label: 'Payment Gateway', desc: 'QRIS & VA Bank', icon: CreditCard, cardClass: 'theme-card-amber', color: 'text-amber-300 bg-amber-500/25 border border-amber-400/40' },
            { id: 'laporan-keuntungan', label: 'Laporan Keuangan', desc: 'Laba & Rugi ISP', icon: TrendingUp, cardClass: 'theme-card-blue', color: 'text-white bg-blue-500/25 border border-blue-400/40' },
          ].map(mod => {
            const ModIcon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className={`p-3 sm:p-3.5 rounded-2xl text-left transition-all hover:scale-[1.04] active:scale-95 group shadow-sm relative ${mod.cardClass}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl ${mod.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <ModIcon className="w-4 h-4" />
                  </div>
                  {mod.isLocked && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Lock className="w-2.5 h-2.5" />
                      {mod.minPlan}+
                    </span>
                  )}
                </div>
                <div className="font-bold text-white text-xs group-hover:text-white transition-colors">
                  {mod.label}
                </div>
                <span className="text-[10px] text-slate-300 block mt-0.5">{mod.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgent Invoices & Live Active Sessions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Invoices */}
        <div className="rounded-2xl p-5 theme-card-amber shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                Tagihan Belum Dibayar
              </h3>
              <p className="text-xs text-slate-300">Prioritas penagihan & WhatsApp reminder</p>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="text-xs text-amber-300 hover:text-white font-bold hover:underline"
            >
              Semua Tagihan &rarr;
            </button>
          </div>

          {urgentInvoices.length === 0 ? (
            <div className="text-center py-8 text-slate-300 text-xs">
              <CheckCircle2 className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-90" />
              Semua invoice bulan ini sudah lunas!
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentInvoices.map(inv => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/75 border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{inv.customerName}</span>
                      <span className="text-[10px] font-mono bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        {inv.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {inv.packageName} &bull; Jatuh tempo: <span className="text-amber-300 font-bold">{formatDateIndo(inv.dueDate)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-amber-300 block font-mono">
                      {formatRupiah(inv.totalAmount)}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedInvoiceId(inv.id);
                        setActiveTab('billing');
                      }}
                      className="text-[11px] font-bold text-blue-300 hover:text-white hover:underline mt-0.5"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Active Sessions (PPPoE & Hotspot) */}
        <div className="rounded-2xl p-5 theme-card-blue shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-300" />
                Live Sesi MikroTik Online
              </h3>
              <p className="text-xs text-slate-300">Pengawasan bandwidth real-time MikroTik (PPPoE &amp; Hotspot)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-blue-500/20 text-xs">
                <button
                  onClick={() => setSessionFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    sessionFilter === 'all' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({activeSessions.length})
                </button>
                <button
                  onClick={() => setSessionFilter('pppoe')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    sessionFilter === 'pppoe' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PPPoE ({pppoeOnlineCount})
                </button>
                <button
                  onClick={() => setSessionFilter('hotspot')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    sessionFilter === 'hotspot' ? 'bg-cyan-600 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hotspot ({hotspotOnlineCount})
                </button>
              </div>
              <button
                onClick={() => setActiveTab('mikrotik')}
                className="text-xs text-blue-300 hover:text-white font-bold hover:underline whitespace-nowrap ml-1"
              >
                Lihat Semua &rarr;
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {activeSessions.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-950/50 rounded-xl border border-blue-900/30 text-xs text-slate-300">
                <Wifi className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
                <p className="font-semibold text-white">Tidak Ada Sesi Dial-in Aktif (0 User Online)</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sesi online akan muncul otomatis saat router MikroTik terhubung dan modem pelanggan melakukan dial-in PPPoE atau Hotspot.
                </p>
              </div>
            ) : activeSessions
                .filter(s => sessionFilter === 'all' || (sessionFilter === 'pppoe' ? (s.service === 'pppoe' || !s.service) : s.service === 'hotspot'))
                .length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-950/50 rounded-xl border border-blue-900/30 text-xs text-slate-400">
                Tidak ada sesi online untuk layanan {sessionFilter.toUpperCase()}.
              </div>
            ) : (
              activeSessions
                .filter(s => sessionFilter === 'all' || (sessionFilter === 'pppoe' ? (s.service === 'pppoe' || !s.service) : s.service === 'hotspot'))
                .slice(0, 5)
                .map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/75 border border-blue-500/20 hover:border-blue-400/40 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{session.customerName}</span>
                        <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                          session.service === 'hotspot'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                            : 'bg-blue-950 text-blue-300 border-blue-500/40'
                        }`}>
                          {session.service}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        IP: {session.ipAddress} &bull; Uptime: {session.uptime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-blue-300 block font-bold">↓ {session.rxRate}</span>
                    <span className="text-slate-300 font-medium">↑ {session.txRate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
