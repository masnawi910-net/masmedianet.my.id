import React, { useState } from 'react';
import { Invoice, PaymentMethod, Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Printer,
  Send,
  CreditCard,
  QrCode,
  Building,
  Check,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';
import { InvoicePrintModal } from './InvoicePrintModal';
import { DynamicQrisPaymentModal } from './DynamicQrisPaymentModal';
import confetti from 'canvas-confetti';

export const BillingView: React.FC = () => {
  const {
    invoices,
    customers,
    packages,
    payInvoice,
    generateMonthlyInvoices,
    deleteInvoice,
    createManualInvoice,
    sendWhatsAppMessage,
    getFormattedMessage,
    selectedInvoiceId,
    setSelectedInvoiceId,
    paymentChannels,
    setActiveTab,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Generate Invoices Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genMonth, setGenMonth] = useState(8);
  const [genYear, setGenYear] = useState(2026);

  // Pay Invoice Modal
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('transfer_bca');
  const [transRef, setTransRef] = useState('');
  const [collectorName, setCollectorName] = useState('Admin Billing');

  // Print Modal
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [qrisModalInvoice, setQrisModalInvoice] = useState<Invoice | null>(null);

  // Summary calculations
  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + (i.totalAmount || i.packagePrice || 0), 0);
  const totalUnpaid = invoices
    .filter(i => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((acc, i) => acc + (i.totalAmount || i.packagePrice || 0), 0);

  // Filter logic
  const filteredInvoices = invoices.filter(inv => {
    if (selectedInvoiceId && inv.id === selectedInvoiceId) {
      return true;
    }
    const searchLower = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (inv.customerName || '').toLowerCase().includes(searchLower) ||
      (inv.id || '').toLowerCase().includes(searchLower) ||
      (inv.customerPhone || '').includes(searchLower) ||
      (inv.period || '').toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unpaid' && inv.status === 'unpaid') ||
      (statusFilter === 'paid' && inv.status === 'paid') ||
      (statusFilter === 'overdue' && inv.status === 'overdue');

    return matchesSearch && matchesStatus;
  });

  const handleOpenPay = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPayMethod('transfer_bca');
    setTransRef(`TRX-${Date.now().toString().slice(-6)}`);
    setCollectorName('Admin Billing');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    payInvoice(payingInvoice.id, payMethod, transRef, collectorName);

    // Fire confetti celebrating payment!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    const paidCustomer = customers.find(c => c.id === payingInvoice.customerId);
    const invoiceId = payingInvoice.id;
    setPayingInvoice(null);

    // Optional ask to send WA receipt
    if (paidCustomer) {
      if (confirm(`Pembayaran LUNAS berhasil disimpan! Pelanggan ${paidCustomer.name} telah diaktifkan kembali. Buka WhatsApp untuk kirim struk lunas?`)) {
        const msg = getFormattedMessage(paidCustomer.id, 'pembayaran_lunas', invoiceId);
        sendWhatsAppMessage(paidCustomer.phone, msg);
      }
    }
  };

  const handleBatchGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const createdCount = generateMonthlyInvoices(genMonth, genYear);
    setIsGenerateModalOpen(false);
    alert(`Berhasil membuat ${createdCount} invoice baru untuk periode bulan ${genMonth}/${genYear}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-white" />
            Billing & Invoicing Otomatis
          </h2>
          <p className="text-xs text-slate-400">
            Generate tagihan bulanan massal, pencatatan multi-pembayaran, denda otomatis, dan cetak struk
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('billing-batch-print')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border border-slate-700 active:scale-95"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Cetak Kuitansi Massal (Kolektor)</span>
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Generate Tagihan Bulanan
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-400">Total Tagihan Lunas</span>
            <h3 className="text-xl font-bold text-white mt-1">{formatRupiah(totalPaid)}</h3>
            <span className="text-[11px] text-white/80 font-medium">
              {invoices.filter(i => i.status === 'paid').length} Transaksi Berhasil
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-400">Total Belum Lunas / Tertunggak</span>
            <h3 className="text-xl font-bold text-amber-400 mt-1">{formatRupiah(totalUnpaid)}</h3>
            <span className="text-[11px] text-amber-400/80 font-medium">
              {invoices.filter(i => i.status !== 'paid').length} Tagihan Menunggu
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-400">Total Invoice Diterbitkan</span>
            <h3 className="text-xl font-bold text-white mt-1">{invoices.length} Lembar</h3>
            <span className="text-[11px] text-slate-400 font-medium">Semua Periode Transaksi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-white">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Selected Invoice Banner if filtered from Dashboard */}
      {selectedInvoiceId && (
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-slate-200">
              Menampilkan tagihan terpilih <span className="font-bold font-mono text-white">{selectedInvoiceId}</span> dari Dashboard.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedInvoiceId(null)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold transition-colors shrink-0"
          >
            Tampilkan Semua Tagihan
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Invoice, nama pelanggan, no WA, periode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            Semua ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'unpaid' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            Belum Bayar ({invoices.filter(i => i.status === 'unpaid').length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'overdue' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            Menunggak ({invoices.filter(i => i.status === 'overdue').length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'paid' ? 'bg-blue-500/20 text-white border border-blue-500/30' : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            Lunas ({invoices.filter(i => i.status === 'paid').length})
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">No. Invoice</th>
                <th className="px-4 py-3.5">Pelanggan</th>
                <th className="px-4 py-3.5">Periode / Paket</th>
                <th className="px-4 py-3.5">Jatuh Tempo</th>
                <th className="px-4 py-3.5">Nominal + Denda</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada invoice yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr
                    key={inv.id}
                    className={`transition-colors ${
                      selectedInvoiceId === inv.id
                        ? 'bg-blue-500/15 ring-1 ring-blue-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Invoice ID */}
                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-white block">{inv.id}</span>
                      <span className="text-[11px] text-slate-400">{formatDateIndo(inv.createdAt.slice(0, 10))}</span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-200 block">{inv.customerName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{inv.customerPhone}</span>
                    </td>

                    {/* Period & Package */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-400 block">{inv.period}</span>
                      <span className="text-slate-400 text-[11px]">{inv.packageName}</span>
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-300 block">{formatDateIndo(inv.dueDate)}</span>
                      {inv.paidAt && (
                        <span className="text-[10px] text-blue-400">
                          Lunas: {formatDateIndo(inv.paidAt.slice(0, 10))}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-sm text-white block">
                        {formatRupiah(inv.totalAmount)}
                      </span>
                      {inv.lateFee > 0 && (
                        <span className="text-[10px] text-red-400 block">
                          Termasuk Denda {formatRupiah(inv.lateFee)}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {inv.status === 'paid' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-white border border-blue-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Lunas
                        </span>
                      )}
                      {inv.status === 'overdue' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Menunggak
                        </span>
                      )}
                      {inv.status === 'unpaid' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3 mr-1" />
                          Belum Bayar
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'paid' ? (
                          <>
                            <button
                              onClick={() => setQrisModalInvoice(inv)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-500/30 font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                              title="QRIS Dinamis & Struk Otomatis"
                            >
                              <QrCode className="w-3.5 h-3.5" /> QRIS
                            </button>
                            <button
                              onClick={() => handleOpenPay(inv)}
                              className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Bayar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              const msg = getFormattedMessage(inv.customerId, 'pembayaran_lunas', inv.id);
                              sendWhatsAppMessage(inv.customerPhone, msg);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-white transition-colors"
                            title="Kirim Struk WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setPrintingInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Cetak Struk / Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Generate Invoices Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Generate Tagihan Bulanan Otomatis
            </h3>
            <p className="text-xs text-slate-400">
              Sistem akan membuat tagihan baru untuk seluruh {customers.filter(c => c.status !== 'disabled').length} pelanggan aktif yang belum memiliki tagihan pada periode yang dipilih.
            </p>

            <form onSubmit={handleBatchGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Bulan</label>
                  <select
                    value={genMonth}
                    onChange={e => setGenMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>Januari</option>
                    <option value={2}>Februari</option>
                    <option value={3}>Maret</option>
                    <option value={4}>April</option>
                    <option value={5}>Mei</option>
                    <option value={6}>Juni</option>
                    <option value={7}>Juli</option>
                    <option value={8}>Agustus</option>
                    <option value={9}>September</option>
                    <option value={10}>Oktober</option>
                    <option value={11}>November</option>
                    <option value={12}>Desember</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={genYear}
                    onChange={e => setGenYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white shadow-md"
                >
                  Generate Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Invoice Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Terima Pembayaran Tagihan
              </h3>
              <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {payingInvoice.id}
              </span>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pelanggan:</span>
                <span className="font-bold text-white">{payingInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paket Internet:</span>
                <span className="text-slate-200">{payingInvoice.packageName} ({payingInvoice.period})</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-800">
                <span className="text-slate-300 font-semibold">Total Tagihan (Termasuk Denda):</span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {formatRupiah(payingInvoice.totalAmount)}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${payMethod === 'transfer_bca' ? 'bg-blue-500/15 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    <input type="radio" name="pay" checked={payMethod === 'transfer_bca'} onChange={() => setPayMethod('transfer_bca')} className="hidden" />
                    <span>Transfer BCA</span>
                  </label>
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${payMethod === 'transfer_mandiri' ? 'bg-blue-500/15 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    <input type="radio" name="pay" checked={payMethod === 'transfer_mandiri'} onChange={() => setPayMethod('transfer_mandiri')} className="hidden" />
                    <span>Transfer Mandiri</span>
                  </label>
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${payMethod === 'qris' ? 'bg-blue-500/15 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    <input type="radio" name="pay" checked={payMethod === 'qris'} onChange={() => setPayMethod('qris')} className="hidden" />
                    <span>QRIS Dinamis</span>
                  </label>
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${payMethod === 'cash' ? 'bg-blue-500/15 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    <input type="radio" name="pay" checked={payMethod === 'cash'} onChange={() => setPayMethod('cash')} className="hidden" />
                    <span>Tunai / Kolektor</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nomor Referensi Transaksi</label>
                  <input
                    type="text"
                    value={transRef}
                    onChange={e => setTransRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Diterima Oleh</label>
                  <input
                    type="text"
                    value={collectorName}
                    onChange={e => setCollectorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-white">
                ⚡ <strong>Sistem Otomatis:</strong> Setelah disimpan, status isolir pelanggan akan langsung dibuka kembali secara otomatis di MikroTik.
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20"
                >
                  Konfirmasi Pembayaran Lunas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      <InvoicePrintModal
        invoice={printingInvoice}
        onClose={() => setPrintingInvoice(null)}
      />

      {/* Dynamic QRIS Payment & Receipt Modal */}
      <DynamicQrisPaymentModal
        invoice={qrisModalInvoice}
        isOpen={Boolean(qrisModalInvoice)}
        onClose={() => setQrisModalInvoice(null)}
        onPaymentSuccess={() => {
          // Keep modal open to show proof
        }}
      />
    </div>
  );
};
