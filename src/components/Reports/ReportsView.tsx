import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  Users,
  CheckCircle,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { formatRupiah } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { customers, invoices, packages, stats } = useApp();

  const [selectedYear, setSelectedYear] = useState('2026');

  // Revenue Monthly Data
  const monthlyRevenueData = [
    { month: 'Jan', pendapatan: 1850000, target: 2000000 },
    { month: 'Feb', pendapatan: 2100000, target: 2000000 },
    { month: 'Mar', pendapatan: 2450000, target: 2500000 },
    { month: 'Apr', pendapatan: 2800000, target: 2500000 },
    { month: 'Mei', pendapatan: 3100000, target: 3000000 },
    { month: 'Jun', pendapatan: 3300000, target: 3000000 },
    { month: 'Jul', pendapatan: 3650000, target: 3500000 },
    { month: 'Agu', pendapatan: stats.monthlyRevenue, target: 3800000 },
  ];

  // Package breakdown
  const packageStats = packages.map(pkg => {
    const count = customers.filter(c => c.packageId === pkg.id).length;
    const rev = count * pkg.price;
    return {
      name: pkg.name,
      count,
      revenue: rev,
      color: pkg.downloadSpeed >= 20 ? '#6366f1' : pkg.downloadSpeed >= 10 ? '#3b82f6' : '#10b981',
    };
  });

  const exportCSV = () => {
    const headers = ['ID Invoice', 'Pelanggan', 'No HP', 'Paket', 'Periode', 'Status', 'Total', 'Tgl Bayar', 'Metode'];
    const rows = invoices.map(i => [
      i.id,
      `"${i.customerName}"`,
      i.customerPhone,
      `"${i.packageName}"`,
      i.period,
      i.status,
      i.totalAmount,
      i.paidAt || '-',
      i.paymentMethod || '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_billing_rtrw_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Laporan Keuangan & Analisis Jaringan
          </h2>
          <p className="text-xs text-slate-400">
            Ringkasan omset langganan bulanan, kolektibilitas tagihan, dan proyeksi pertumbuhan RTRW.NET
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export ke Excel / CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Total Omset Bulan Ini</span>
          <span className="text-xl font-bold text-emerald-400 font-mono block mt-1">
            {formatRupiah(stats.monthlyRevenue)}
          </span>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">↑ +14.8% dari bulan lalu</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Tagihan Tertagih (Kolektibilitas)</span>
          <span className="text-xl font-bold text-white font-mono block mt-1">
            {stats.collectionRate}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">{stats.totalCustomers - stats.isolatedCustomers} pelanggan tertib</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Piutang / Belum Lunas</span>
          <span className="text-xl font-bold text-amber-400 font-mono block mt-1">
            {formatRupiah(stats.unpaidAmount)}
          </span>
          <span className="text-[10px] text-amber-400/80 mt-1 block">{stats.unpaidInvoicesCount} invoice menunggu</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Total Pelanggan Aktif</span>
          <span className="text-xl font-bold text-blue-400 font-mono block mt-1">
            {stats.activeCustomers} / {stats.totalCustomers}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">{stats.isolatedCustomers} status isolir</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Grafik Pertumbuhan Pendapatan Tahun 2026 (IDR)
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `Rp${v / 1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Pendapatan']}
                />
                <Bar dataKey="pendapatan" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Revenue Share (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-400" />
            Kontribusi Omset per Paket
          </h3>

          <div className="space-y-3 pt-2">
            {packageStats.map(pkg => (
              <div key={pkg.name} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">{pkg.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatRupiah(pkg.revenue)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{pkg.count} Pelanggan</span>
                  <span>{((pkg.revenue / (stats.monthlyRevenue || 1)) * 100).toFixed(1)}% share</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
