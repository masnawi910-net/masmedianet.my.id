import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseRecord, Customer, Invoice } from '../../types';
import { formatRupiah, formatDate } from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Filter,
  Download,
  Receipt,
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  AlertTriangle,
  UserX,
  Users,
  ShieldCheck,
  Zap,
  PhoneCall,
  Activity,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Search,
  Printer,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface MonthlyPnL {
  monthKey: string;
  monthName: string;
  pppoeRevenue: number;
  voucherRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  bandwidthExpense: number;
  infrastructureExpense: number;
  electricityExpense: number;
  salaryExpense: number;
  otherExpense: number;
  totalExpense: number;
  ebitda: number;
  netProfit: number;
  marginPercent: number;
  activeSubscribers: number;
  newSubscribers: number;
  churnedSubscribers: number;
  churnRate: number;
  arpu: number;
}

export const FinancialReportsView: React.FC = () => {
  const { invoices, hotspotVouchers, expenses, addExpense, deleteExpense, customers, packages, tickets, activeTab } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'pnl' | 'churn' | 'income' | 'expense'>('pnl');

  useEffect(() => {
    if (activeTab === 'laporan-pemasukan' || activeTab === 'income') {
      setActiveSubTab('income');
    } else if (activeTab === 'laporan-pengeluaran' || activeTab === 'expense') {
      setActiveSubTab('expense');
    } else if (activeTab === 'churn') {
      setActiveSubTab('churn');
    } else if (activeTab === 'laporan-keuntungan' || activeTab === 'pnl') {
      setActiveSubTab('pnl');
    }
  }, [activeTab]);

  // Time range filter for P&L
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [churnRiskFilter, setChurnRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchRiskCustomer, setSearchRiskCustomer] = useState('');

  // Modal Add Expense
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState<Omit<ExpenseRecord, 'id'>>({
    category: 'bandwidth_isp',
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    recordedBy: 'Admin Utama',
  });

  // Calculate Total Live Incomes
  const pppoeIncome = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0);

  const voucherIncome = hotspotVouchers
    .filter(v => v.status === 'used')
    .reduce((acc, v) => acc + v.price, 0);

  const totalIncome = pppoeIncome + voucherIncome;

  // Calculate Total Live Expenses
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Net Profit & Margin
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Active Subscribers & ARPU Calculation
  const activeCustomersCount = customers.filter(c => c.status === 'active').length || 1;
  const totalCustomersCount = customers.length || 1;
  const arpu = Math.round(totalIncome / activeCustomersCount);
  const ltv = Math.round(arpu * 18); // Average 18 months retention lifetime

  // Historical Monthly P&L Data Simulation & Projection
  const monthlyPnLData: MonthlyPnL[] = useMemo(() => {
    const months = [
      { key: '2025-01', name: 'Januari 2025', baseRev: 18500000, baseExp: 7200000, active: 85, newSubs: 12, churn: 1 },
      { key: '2025-02', name: 'Februari 2025', baseRev: 21200000, baseExp: 7800000, active: 96, newSubs: 14, churn: 3 },
      { key: '2025-03', name: 'Maret 2025', baseRev: 23900000, baseExp: 8100000, active: 107, newSubs: 15, churn: 4 },
      { key: '2025-04', name: 'April 2025', baseRev: 26800000, baseExp: 8900000, active: 118, newSubs: 16, churn: 5 },
      { key: '2025-05', name: 'Mei 2025', baseRev: 29500000, baseExp: 9400000, active: 129, newSubs: 15, churn: 4 },
      { key: '2025-06', name: 'Juni 2025', baseRev: 32400000, baseExp: 9800000, active: 140, newSubs: 16, churn: 5 },
      { key: '2025-07', name: 'Juli 2025', baseRev: 35600000, baseExp: 10500000, active: 151, newSubs: 18, churn: 7 },
      { key: '2025-08', name: 'Agustus 2025', baseRev: 38900000, baseExp: 11200000, active: 162, newSubs: 19, churn: 8 },
      { key: '2025-09', name: 'September 2025', baseRev: totalIncome > 0 ? totalIncome : 42500000, baseExp: totalExpense > 0 ? totalExpense : 12000000, active: activeCustomersCount > 10 ? activeCustomersCount : 173, newSubs: 18, churn: 7 },
    ];

    return months.map(m => {
      const pppoe = Math.round(m.baseRev * 0.82);
      const voucher = Math.round(m.baseRev * 0.18);
      const totalRev = pppoe + voucher;

      const bw = Math.round(m.baseExp * 0.42);
      const infra = Math.round(m.baseExp * 0.18);
      const electricity = Math.round(m.baseExp * 0.12);
      const salary = Math.round(m.baseExp * 0.22);
      const other = m.baseExp - (bw + infra + electricity + salary);
      const totalExp = bw + infra + electricity + salary + other;

      const ebitda = totalRev - totalExp;
      const profit = ebitda;
      const margin = totalRev > 0 ? (profit / totalRev) * 100 : 0;
      const churnRateVal = m.active > 0 ? (m.churn / m.active) * 100 : 0;
      const arpuVal = m.active > 0 ? Math.round(totalRev / m.active) : 0;

      return {
        monthKey: m.key,
        monthName: m.name,
        pppoeRevenue: pppoe,
        voucherRevenue: voucher,
        otherRevenue: 0,
        totalRevenue: totalRev,
        bandwidthExpense: bw,
        infrastructureExpense: infra,
        electricityExpense: electricity,
        salaryExpense: salary,
        otherExpense: other,
        totalExpense: totalExp,
        ebitda,
        netProfit: profit,
        marginPercent: Math.round(margin * 10) / 10,
        activeSubscribers: m.active,
        newSubscribers: m.newSubs,
        churnedSubscribers: m.churn,
        churnRate: Math.round(churnRateVal * 10) / 10,
        arpu: arpuVal,
      };
    });
  }, [totalIncome, totalExpense, activeCustomersCount]);

  // Overall Churn Metrics
  const avgMonthlyChurnRate = useMemo(() => {
    const sum = monthlyPnLData.reduce((acc, curr) => acc + curr.churnRate, 0);
    return (sum / monthlyPnLData.length).toFixed(1);
  }, [monthlyPnLData]);

  // Churn Reasons Analysis
  const churnReasons = [
    { reason: 'Ekspansi Fiber ISP Kompetitor (Promo Murah)', count: 18, percent: 42, color: 'bg-rose-500' },
    { reason: 'Pindah Domisili / Rumah / Kontrakan', count: 11, percent: 26, color: 'bg-amber-500' },
    { reason: 'Keluhan Kecepatan Lemot / Latensi Game', count: 7, percent: 16, color: 'bg-blue-500' },
    { reason: 'Ekonomi / Penurunan Daya Beli Pelanggan', count: 4, percent: 9, color: 'bg-purple-500' },
    { reason: 'Kolektabilitas / Telat Bayar Berkepanjangan', count: 3, percent: 7, color: 'bg-slate-500' },
  ];

  // Customer Churn Early Warning Radar (Calculated from overdue invoices, tickets, and status)
  const churnRiskRadar = useMemo(() => {
    return customers.map(cust => {
      const unpaidInvoices = invoices.filter(i => i.customerId === cust.id && i.status === 'unpaid');
      const overdueInvoices = unpaidInvoices.filter(i => new Date(i.dueDate) < new Date());
      const custTickets = tickets.filter(t => t.customerId === cust.id);
      const openTickets = custTickets.filter(t => t.status === 'open' || t.status === 'in_progress');

      let riskScore = 0;
      let reasons: string[] = [];

      if (cust.status === 'isolated') {
        riskScore += 50;
        reasons.push('Sedang dalam status ISOLIR');
      }
      if (overdueInvoices.length > 0) {
        riskScore += 30 * overdueInvoices.length;
        reasons.push(`${overdueInvoices.length} tagihan jatuh tempo terlewati`);
      }
      if (openTickets.length > 0) {
        riskScore += 25 * openTickets.length;
        reasons.push(`${openTickets.length} tiket keluhan gangguan belum tuntas`);
      }
      if (cust.status === 'suspended') {
        riskScore += 40;
        reasons.push('Layanan berstatus SUSPEND');
      }

      // Default baseline activity score for demo completeness
      if (riskScore === 0) {
        riskScore = (cust.id.charCodeAt(cust.id.length - 1) % 4) * 10;
      }

      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      let recommendedAction = 'Pertahankan layanan & kirim ucapan loyalitas.';

      if (riskScore >= 50) {
        riskLevel = 'high';
        recommendedAction = 'Hubungi via WhatsApp/Telepon langsung, tawarkan diskon loyalitas atau upgrade bandwidth 1 bulan gratis.';
      } else if (riskScore >= 25) {
        riskLevel = 'medium';
        recommendedAction = 'Kirim reminder invoice simpatik dan lakukan cek redaman optical dBm ONU.';
      }

      const pkg = packages.find(p => p.id === cust.packageId);

      return {
        customer: cust,
        packageName: pkg?.name || 'Paket Reguler',
        packagePrice: pkg?.price || 150000,
        riskScore,
        riskLevel,
        reasons,
        recommendedAction,
        unpaidCount: unpaidInvoices.length,
        ticketCount: custTickets.length,
      };
    });
  }, [customers, invoices, tickets, packages]);

  const filteredRiskCustomers = churnRiskRadar.filter(item => {
    if (churnRiskFilter !== 'all' && item.riskLevel !== churnRiskFilter) return false;
    if (searchRiskCustomer.trim()) {
      const q = searchRiskCustomer.toLowerCase();
      return (
        item.customer.name.toLowerCase().includes(q) ||
        item.customer.username.toLowerCase().includes(q) ||
        item.customer.phone.includes(q) ||
        item.customer.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const highRiskCount = churnRiskRadar.filter(r => r.riskLevel === 'high').length;
  const mediumRiskCount = churnRiskRadar.filter(r => r.riskLevel === 'medium').length;
  const lowRiskCount = churnRiskRadar.filter(r => r.riskLevel === 'low').length;

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense(expenseForm);
    setShowExpenseModal(false);
    alert('Data pengeluaran operasional berhasil dicatat!');
  };

  const getCategoryLabel = (cat: ExpenseRecord['category']) => {
    switch (cat) {
      case 'bandwidth_isp': return 'ISP Uplink / Bandwidth';
      case 'tower_sewa': return 'Sewa Tiang / Tower';
      case 'listrik_ops': return 'Listrik Sentral / OLT';
      case 'gaji_teknisi': return 'Gaji Karyawan & Teknisi';
      case 'perangkat_fo': return 'Kabel FO / Splicing / ODP';
      default: return 'Lain-lain';
    }
  };

  const handleExportCSV = () => {
    const headers = 'Bulan,Pendapatan PPPoE,Pendapatan Voucher,Total Pendapatan,Beban Bandwidth,Beban Gaji,Total Biaya,Laba Bersih,Margin (%),Pelanggan Aktif,Churn Rate (%)\n';
    const rows = monthlyPnLData
      .map(
        m =>
          `"${m.monthName}",${m.pppoeRevenue},${m.voucherRevenue},${m.totalRevenue},${m.bandwidthExpense},${m.salaryExpense},${m.totalExpense},${m.netProfit},"${m.marginPercent}%",${m.activeSubscribers},"${m.churnRate}%"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Laba_Rugi_Masmedia_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            Laporan Keuangan Eksekutif & Analitik Retensi Pelanggan
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Laporan Laba/Rugi & Churn Rate Pelanggan</h1>
          <p className="text-sm text-slate-400 mt-1">
            Analisis komprehensif Profit & Loss Statement (P&L), Margin EBITDA, ARPU, LTV, serta deteksi dini risiko Churn pelanggan ISP.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all border border-slate-700 active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export CSV / Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all border border-slate-700 active:scale-95"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            Cetak Laporan
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pendapatan Berjalan</span>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{formatRupiah(totalIncome)}</h3>
              <span className="text-[11px] text-emerald-400/80 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                PPPoE ({formatRupiah(pppoeIncome)}) + Voucher ({formatRupiah(voucherIncome)})
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Laba Bersih (Net Profit)</span>
              <h3 className="text-2xl font-black text-white mt-1">{formatRupiah(netProfit)}</h3>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                <Percent className="w-3.5 h-3.5" />
                Margin Keuntungan: {profitMargin}%
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ARPU & LTV */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ARPU (Rata-rata / User)</span>
              <h3 className="text-2xl font-black text-purple-400 mt-1">{formatRupiah(arpu)}</h3>
              <span className="text-[11px] text-purple-300 flex items-center gap-1 mt-1 font-mono">
                LTV Est: {formatRupiah(ltv)} (18 bln)
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg. Churn Rate Bulanan</span>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{avgMonthlyChurnRate}%</h3>
              <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {highRiskCount} Pelanggan Berisiko Tinggi
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('pnl')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'pnl'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          1. Laporan Laba/Rugi Bulanan (P&L Statement)
        </button>
        <button
          onClick={() => setActiveSubTab('churn')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'churn'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserX className="w-4 h-4" />
          2. Analisis Churn & Early Warning Radar
          {highRiskCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
              {highRiskCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('income')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'income'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          3. Rincian Pemasukan
        </button>
        <button
          onClick={() => setActiveSubTab('expense')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'expense'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          4. Rincian Pengeluaran ({expenses.length})
        </button>
      </div>

      {/* SUB-MENU 1: PROFIT & LOSS STATEMENT (P&L) */}
      {activeSubTab === 'pnl' && (
        <div className="space-y-6">
          {/* Visual Breakdown summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-400" />
                  Ringkasan Arus Kas & Margin Usaha Berjalan
                </h3>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Tahun {selectedYear}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Komposisi Pendapatan (Revenue Streams)
                  </span>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Langganan PPPoE Bulanan:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatRupiah(pppoeIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Penjualan Voucher Hotspot:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatRupiah(voucherIncome)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center font-bold text-white">
                    <span>Total Pendapatan Kotor:</span>
                    <span className="font-mono text-emerald-400 text-sm">{formatRupiah(totalIncome)}</span>
                  </div>
                </div>

                <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Beban Operasional Utama (OPEX)
                  </span>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Sewa Bandwidth ISP Uplink:</span>
                    <span className="font-mono text-rose-400 font-semibold">
                      -{formatRupiah(expenses.filter(e => e.category === 'bandwidth_isp').reduce((a, b) => a + b.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Gaji Teknisi & Staf:</span>
                    <span className="font-mono text-rose-400 font-semibold">
                      -{formatRupiah(expenses.filter(e => e.category === 'gaji_teknisi').reduce((a, b) => a + b.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Listrik Sentral & OLT:</span>
                    <span className="font-mono text-rose-400 font-semibold">
                      -{formatRupiah(expenses.filter(e => e.category === 'listrik_ops').reduce((a, b) => a + b.amount, 0))}
                    </span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between items-center font-bold text-white">
                    <span>Total Pengeluaran:</span>
                    <span className="font-mono text-rose-400 text-sm">-{formatRupiah(totalExpense)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <strong className="text-white text-sm block">LABA BERSIH OPERASIONAL (NET OPERATING PROFIT)</strong>
                  <span className="text-xs text-emerald-400/80">
                    Margin Keuntungan Bersih: <span className="font-bold text-emerald-300">{profitMargin}%</span> dari total omzet.
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-black text-2xl">{formatRupiah(netProfit)}</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown Visual */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Receipt className="w-5 h-5 text-blue-400" />
                Alokasi Beban Usaha
              </h3>
              <div className="space-y-3 text-xs">
                {['bandwidth_isp', 'tower_sewa', 'listrik_ops', 'gaji_teknisi', 'perangkat_fo'].map(cat => {
                  const catTotal = expenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);
                  const percent = totalExpense > 0 ? ((catTotal / totalExpense) * 100).toFixed(0) : '0';
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>{getCategoryLabel(cat as any)}</span>
                        <span className="font-mono font-semibold text-white">{formatRupiah(catTotal)} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-rose-400 h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Historical Monthly Profit & Loss Statement Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Tabel Komparasi Laba & Rugi Multi-Bulan (P&L Trend {selectedYear})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Laporan tren finansial bulanan, margin profitabilitas, dan unit economics ISP.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4">PPPoE</th>
                    <th className="py-3 px-4">Voucher</th>
                    <th className="py-3 px-4">Total Revenue</th>
                    <th className="py-3 px-4">Bandwidth ISP</th>
                    <th className="py-3 px-4">Beban Lain</th>
                    <th className="py-3 px-4">Total Biaya</th>
                    <th className="py-3 px-4">Laba Bersih</th>
                    <th className="py-3 px-4">Margin %</th>
                    <th className="py-3 px-4">ARPU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {monthlyPnLData.map(m => (
                    <tr key={m.monthKey} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{m.monthName}</td>
                      <td className="py-3 px-4 font-mono">{formatRupiah(m.pppoeRevenue)}</td>
                      <td className="py-3 px-4 font-mono">{formatRupiah(m.voucherRevenue)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{formatRupiah(m.totalRevenue)}</td>
                      <td className="py-3 px-4 font-mono text-rose-400">-{formatRupiah(m.bandwidthExpense)}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">-{formatRupiah(m.totalExpense - m.bandwidthExpense)}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-rose-400">-{formatRupiah(m.totalExpense)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white bg-slate-950/40">
                        {formatRupiah(m.netProfit)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          {m.marginPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-300">{formatRupiah(m.arpu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 2: CHURN RATE & EARLY WARNING RADAR */}
      {activeSubTab === 'churn' && (
        <div className="space-y-6">
          {/* Churn Analytics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tingkat Churn Rata-Rata</span>
              <h3 className="text-3xl font-black text-amber-400">{avgMonthlyChurnRate}% <span className="text-xs text-slate-400 font-normal">/ bulan</span></h3>
              <p className="text-xs text-slate-400">
                Standar industri ISP fixed broadband sehat adalah di bawah <strong>2.5% per bulan</strong>.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Potensi Pendapatan Hilang</span>
              <h3 className="text-3xl font-black text-rose-400">
                {formatRupiah(highRiskCount * (arpu || 150000))} <span className="text-xs text-slate-400 font-normal">/ bln</span>
              </h3>
              <p className="text-xs text-slate-400">
                Jika {highRiskCount} pelanggan berisiko tinggi berhenti berlangganan.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Skor Retensi Pelanggan</span>
              <h3 className="text-3xl font-black text-emerald-400">
                {(100 - Number(avgMonthlyChurnRate)).toFixed(1)}%
              </h3>
              <p className="text-xs text-slate-400">
                Tingkat loyalitas pelanggan aktif Masmedia Network.
              </p>
            </div>
          </div>

          {/* Churn Reasons Breakdown Chart/Progress Bars */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserX className="w-5 h-5 text-amber-400" />
              Faktor Utama Penyebab Pelanggan Berhenti Berlangganan (Churn Reasons)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              {churnReasons.map((item, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-semibold text-white">{item.reason}</span>
                    <span className="font-mono text-slate-400 font-bold">{item.count} User ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Churn Risk Prediction Radar Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
            <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Radar Deteksi Dini Risiko Churn (Early Warning System)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI & Algoritma Prediksi mengidentifikasi pelanggan berisiko berhenti berdasarkan riwayat telat bayar, status isolir, dan keluhan tiket.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setChurnRiskFilter('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      churnRiskFilter === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Semua ({churnRiskRadar.length})
                  </button>
                  <button
                    onClick={() => setChurnRiskFilter('high')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      churnRiskFilter === 'high' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400'
                    }`}
                  >
                    Tinggi ({highRiskCount})
                  </button>
                  <button
                    onClick={() => setChurnRiskFilter('medium')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      churnRiskFilter === 'medium' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-400'
                    }`}
                  >
                    Sedang ({mediumRiskCount})
                  </button>
                  <button
                    onClick={() => setChurnRiskFilter('low')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      churnRiskFilter === 'low' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    Rendah ({lowRiskCount})
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama pelanggan..."
                    value={searchRiskCustomer}
                    onChange={e => setSearchRiskCustomer(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Tingkat Risiko</th>
                    <th className="py-3 px-4">Pelanggan & Username</th>
                    <th className="py-3 px-4">Paket & Tagihan</th>
                    <th className="py-3 px-4">Indikator Masalah</th>
                    <th className="py-3 px-4">Rekomendasi Tindakan Retensi</th>
                    <th className="py-3 px-4 text-right">Aksi CS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRiskCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        Tidak ada pelanggan dalam kategori risiko ini.
                      </td>
                    </tr>
                  ) : (
                    filteredRiskCustomers.map(item => (
                      <tr key={item.customer.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          {item.riskLevel === 'high' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              RISIKO TINGGI ({item.riskScore}%)
                            </span>
                          )}
                          {item.riskLevel === 'medium' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <Activity className="w-3 h-3" />
                              RISIKO SEDANG ({item.riskScore}%)
                            </span>
                          )}
                          {item.riskLevel === 'low' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              AMAN ({item.riskScore}%)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.customer.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.customer.username} · {item.customer.phone}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{item.packageName}</div>
                          <div className="font-mono text-emerald-400 font-bold">{formatRupiah(item.packagePrice)}</div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          {item.reasons.length > 0 ? (
                            <ul className="space-y-0.5 text-[11px] text-amber-300">
                              {item.reasons.map((r, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="text-rose-400">•</span>
                                  {r}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Pembayaran lancar & tidak ada keluhan</span>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-[11px] text-slate-300 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                            "{item.recommendedAction}"
                          </p>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <a
                            href={`https://wa.me/${item.customer.phone.replace(/[^0-9]/g, '')}?text=Halo%20Bapak%2FIbu%20${encodeURIComponent(item.customer.name)},%20kami%20dari%20Customer%20Care%20Masmedia%20Network.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all shadow"
                          >
                            <PhoneCall className="w-3 h-3" />
                            Hubungi WA
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 3: PEMASUKAN */}
      {activeSubTab === 'income' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Sumber Transaksi</th>
                    <th className="px-4 py-3">Pelanggan / Keterangan</th>
                    <th className="px-4 py-3">Waktu Transaksi</th>
                    <th className="px-4 py-3">Metode Bayar</th>
                    <th className="px-4 py-3 text-right">Nominal Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {invoices.filter(i => i.status === 'paid').length === 0 && hotspotVouchers.filter(v => v.status === 'used').length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Receipt className="w-8 h-8 text-slate-600" />
                          <p className="font-semibold text-slate-400">Belum Ada Transaksi Pemasukan</p>
                          <p className="text-[11px] text-slate-500 max-w-sm">
                            Pemasukan dari pembayaran tagihan bulanan PPPoE atau penjualan voucher hotspot akan otomatis tercatat di sini.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {invoices
                        .filter(i => i.status === 'paid')
                        .map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-800/40">
                            <td className="px-4 py-3 font-semibold text-white">Langganan PPPoE Bulanan</td>
                            <td className="px-4 py-3">{inv.customerName} ({inv.packageName})</td>
                            <td className="px-4 py-3 text-slate-400">{inv.paidAt || formatDate(inv.createdAt)}</td>
                            <td className="px-4 py-3 text-slate-300">{inv.paymentMethod || 'Manual'}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                              +{formatRupiah(inv.amount)}
                            </td>
                          </tr>
                        ))}
                      {hotspotVouchers
                        .filter(v => v.status === 'used')
                        .map(vou => (
                          <tr key={vou.id} className="hover:bg-slate-800/40">
                            <td className="px-4 py-3 font-semibold text-blue-400">Voucher Hotspot Koin/Waktu</td>
                            <td className="px-4 py-3">Kode: {vou.code} ({vou.profileName})</td>
                            <td className="px-4 py-3 text-slate-400">{vou.usedAt || 'Hari ini'}</td>
                            <td className="px-4 py-3 text-slate-300">Tunai / QRIS</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                              +{formatRupiah(vou.price)}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 4: PENGELUARAN */}
      {activeSubTab === 'expense' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Uraian / Keperluan</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Dicatat Oleh</th>
                    <th className="px-4 py-3">Catatan</th>
                    <th className="px-4 py-3 text-right">Biaya Keluar</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <TrendingDown className="w-8 h-8 text-slate-600" />
                          <p className="font-semibold text-slate-400">Belum Ada Catatan Pengeluaran</p>
                          <p className="text-[11px] text-slate-500 max-w-sm">
                            Klik tombol "Catat Pengeluaran Baru" di atas untuk mencatat biaya operasional, sewa bandwidth, listrik, atau gaji karyawan.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold bg-slate-800 text-rose-300 px-2 py-0.5 rounded border border-slate-700">
                            {getCategoryLabel(exp.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">{exp.title}</td>
                        <td className="px-4 py-3 text-slate-400">{exp.date}</td>
                        <td className="px-4 py-3 text-slate-400">{exp.recordedBy}</td>
                        <td className="px-4 py-3 text-slate-400">{exp.notes || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-rose-400">
                          -{formatRupiah(exp.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan pengeluaran ${exp.title}?`)) deleteExpense(exp.id);
                            }}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              Catat Pengeluaran Operasional Baru
            </h3>
            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kategori Pengeluaran</label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="bandwidth_isp">ISP Uplink / Bandwidth Dedicated</option>
                  <option value="tower_sewa">Sewa Tiang PLN / Tower Bersama</option>
                  <option value="listrik_ops">Listrik Sentral / OLT / POP</option>
                  <option value="gaji_teknisi">Gaji Karyawan & Teknisi Lapangan</option>
                  <option value="perangkat_fo">Kabel FO / Splicer / Fast Connector / ODP</option>
                  <option value="lainnya">Lain-lain / Operasional Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Keperluan / Uraian</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  placeholder="misal: Pembelian 1 Roll Kabel Dropcore 1 Core"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nominal Biaya (Rp)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={expenseForm.notes}
                  onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  placeholder="No. Nota / Kwitansi"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-400 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
