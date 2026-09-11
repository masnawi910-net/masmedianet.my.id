import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  FileText,
  CheckSquare,
  Square,
  Filter,
  Layers,
  QrCode,
  Building2,
  Calendar,
  Users,
  Download,
  Receipt,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import { Invoice } from '../../types';

export const BatchInvoicePrintView: React.FC = () => {
  const { invoices, customers, packages, paymentChannels, bankAccounts, qrisConfig, ispProfile } = useApp();

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Agustus 2026');
  const [statusFilter, setStatusFilter] = useState<'unpaid_only' | 'all'>('unpaid_only');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [layoutMode, setLayoutMode] = useState<'a4_slip' | 'thermal_pos' | 'recap_sheet'>('a4_slip');

  // Selected Invoices IDs
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Unique areas from customers
  const areas = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (c.rtRw) set.add(c.rtRw);
      else if (c.address) set.add(c.address.slice(0, 15));
    });
    return Array.from(set);
  }, [customers]);

  // Filtered invoices
  const eligibleInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const cust = customers.find(c => c.id === inv.customerId);
      if (!cust) return false;

      if (statusFilter === 'unpaid_only' && inv.status === 'paid') return false;
      if (areaFilter !== 'all' && cust.rtRw !== areaFilter && !cust.address.includes(areaFilter)) return false;

      return true;
    });
  }, [invoices, customers, statusFilter, areaFilter]);

  // Select all or deselect all
  const handleToggleSelectAll = () => {
    if (selectedInvoiceIds.length === eligibleInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(eligibleInvoices.map(i => i.id));
    }
  };

  const handleToggleInvoice = (id: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Selected invoice objects with customer & package data
  const invoicesToPrint = useMemo(() => {
    return eligibleInvoices.filter(inv => selectedInvoiceIds.includes(inv.id));
  }, [eligibleInvoices, selectedInvoiceIds]);

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 select-none">
      {/* Screen Only Header & Controls */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white shadow-md">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Cetak Massal Tagihan & Kuitansi Fisik</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/20 text-white px-2 py-0.5 rounded-full border border-blue-500/30">
                  Batch Print & Kolektor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cetak struk tagihan door-to-door untuk kolektor lapangan, format kertas A4 4-slip, struk mini thermal POS 58mm/80mm, atau lembar rekap penagihan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              disabled={invoicesToPrint.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
                invoicesToPrint.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak {invoicesToPrint.length} Lembar Terpilih</span>
            </button>
          </div>
        </div>

        {/* Filter & Layout Selection Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Status Tagihan</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
            >
              <option value="unpaid_only">Hanya Belum Lunas / Overdue</option>
              <option value="all">Semua Tagihan (Termasuk Lunas)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Filter Wilayah / RW</label>
            <select
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
            >
              <option value="all">Semua Wilayah RT/RW</option>
              {areas.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Format Layout Cetak</label>
            <select
              value={layoutMode}
              onChange={e => setLayoutMode(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-blue-400 font-bold focus:outline-none"
            >
              <option value="a4_slip">Kuitansi A4 (4 Slip / Halaman)</option>
              <option value="thermal_pos">Struk Kasir Mini Thermal (58mm/80mm)</option>
              <option value="recap_sheet">Lembar Rekap Kolektibilitas Tagihan</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleToggleSelectAll}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              {selectedInvoiceIds.length === eligibleInvoices.length && eligibleInvoices.length > 0 ? (
                <>
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                  <span>Batalkan Pilihan Semua</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  <span>Pilih Semua ({eligibleInvoices.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Invoice Selection Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-white">
              Daftar Tagihan Tersedia ({eligibleInvoices.length}) &bull; <b className="text-blue-400">{selectedInvoiceIds.length}</b> dipilih
            </span>
            <span className="text-slate-400">Centang tagihan yang akan dicetak kuitansinya</span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-4 w-10">#</th>
                  <th className="py-2.5 px-4">No. Invoice</th>
                  <th className="py-2.5 px-4">Nama Pelanggan</th>
                  <th className="py-2.5 px-4">Alamat / RT RW</th>
                  <th className="py-2.5 px-4">Paket & Total</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {eligibleInvoices.map(inv => {
                  const isChecked = selectedInvoiceIds.includes(inv.id);
                  const cust = customers.find(c => c.id === inv.customerId);

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => handleToggleInvoice(inv.id)}
                      className={`cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-500/10' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-4" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleInvoice(inv.id)}
                          className="rounded bg-slate-800 border-slate-700 text-blue-400 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-white">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-400">{cust?.phone}</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{cust?.address} ({cust?.rtRw || '-'})</td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-blue-400">{formatRupiah(inv.totalAmount)}</div>
                        <div className="text-[10px] text-slate-400">{inv.packageName}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'paid'
                              ? 'bg-blue-500/20 text-white'
                              : inv.status === 'overdue'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Preview Label on Screen */}
        <div className="flex items-center justify-between pt-2">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Pratinjau Kertas Cetak (Akan Dicetak Bersih Tanpa Header/Sidebar Sistem)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Mode: {layoutMode === 'a4_slip' ? 'A4 4-Slip Grid' : layoutMode === 'thermal_pos' ? 'Struk Mini POS' : 'Tabel Rekap Penagihan'}
          </span>
        </div>
      </div>

      {/* PRINTABLE CONTAINER (Styled for printing & screen preview) */}
      <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-2xl print:p-0 print:m-0 print:shadow-none print:rounded-none">
        {invoicesToPrint.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Pilih minimal satu tagihan di atas untuk melihat pratinjau cetak.
          </div>
        ) : layoutMode === 'a4_slip' ? (
          /* MODE 1: A4 4-Slip Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
            {invoicesToPrint.map(inv => {
              const cust = customers.find(c => c.id === inv.customerId);
              return (
                <div
                  key={inv.id}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-[11px] flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                  {/* Watermark for paid/unpaid */}
                  <div className="absolute top-2 right-2 opacity-20 font-black text-2xl uppercase tracking-widest pointer-events-none text-slate-400">
                    {inv.status === 'paid' ? 'LUNAS' : 'TAGIHAN'}
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {ispProfile?.logoUrl ? (
                          <img src={ispProfile.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <div className="w-full h-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                            ISP
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs leading-tight">
                          {ispProfile?.brandName || 'Masmedia Network'}
                        </div>
                        <div className="text-[9px] text-blue-400 font-semibold">
                          WA: {ispProfile?.phone || '0851-5767-1244'} &bull; {ispProfile?.email}
                        </div>
                        <div className="text-[8.5px] text-slate-500 truncate max-w-[200px]">
                          {ispProfile?.address || 'Jl. Merdeka No. 45'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-800 text-[10px]">{inv.invoiceNumber}</div>
                      <div className="text-[9px] text-slate-500">Periode: {inv.period}</div>
                      <div className="text-[8.5px] text-slate-400">{ispProfile?.email}</div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-white p-2 rounded-lg border border-slate-200 grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Nama Pelanggan:</span>
                      <span className="font-bold text-slate-900">{inv.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ID / Alamat:</span>
                      <span className="text-slate-800">{cust?.id} - {cust?.address}</span>
                    </div>
                  </div>

                  {/* Billing breakdown */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Paket {inv.packageName}:</span>
                      <span className="font-semibold">{formatRupiah(inv.packagePrice)}</span>
                    </div>
                    {inv.lateFee > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Denda Keterlambatan:</span>
                        <span>+{formatRupiah(inv.lateFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 text-xs">
                      <span>TOTAL HARUS DIBAYAR:</span>
                      <span className="text-blue-400">{formatRupiah(inv.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Payment Methods & Signature */}
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-600">
                    <div>
                      <div>Transfer: <b>BCA {paymentChannels.bcaAccount.number}</b></div>
                      <div>Atas Nama: {paymentChannels.bcaAccount.name}</div>
                      <div>Jatuh Tempo: <b>{inv.dueDate}</b></div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 mb-6">Tanda Tangan Kolektor</div>
                      <div className="border-t border-slate-400 w-24 pt-0.5 font-semibold text-[8.5px]">
                        (............................)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : layoutMode === 'thermal_pos' ? (
          /* MODE 2: Mini Thermal POS 58mm / 80mm Layout */
          <div className="max-w-xs mx-auto space-y-6">
            {invoicesToPrint.map(inv => {
              const cust = customers.find(c => c.id === inv.customerId);
              return (
                <div
                  key={inv.id}
                  className="font-mono text-[10px] p-4 bg-white border border-slate-300 rounded-lg shadow-sm space-y-2 leading-relaxed"
                >
                  <div className="text-center border-b border-dashed border-slate-400 pb-2">
                    {ispProfile?.logoUrl && (
                      <img src={ispProfile.logoUrl} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1" />
                    )}
                    <div className="font-bold text-xs">{ispProfile?.brandName || 'Masmedia Network'}</div>
                    <div className="text-[8px] text-slate-500">CS/WA: {ispProfile?.phone || '0851-5767-1244'} &bull; {ispProfile?.email}</div>
                    <div className="text-[7.5px] text-slate-400">{ispProfile?.address}</div>
                  </div>

                  <div className="space-y-1 text-[9px]">
                    <div>No. Inv : {inv.invoiceNumber}</div>
                    <div>Tgl     : {inv.dueDate}</div>
                    <div>ID Pel  : {inv.customerId}</div>
                    <div>Nama    : {inv.customerName}</div>
                    <div>Alamat  : {cust?.address}</div>
                  </div>

                  <div className="border-t border-b border-dashed border-slate-400 py-1.5 space-y-1">
                    <div className="flex justify-between">
                      <span>{inv.packageName}</span>
                      <span>{formatRupiah(inv.packagePrice)}</span>
                    </div>
                    {inv.lateFee > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Denda</span>
                        <span>{formatRupiah(inv.lateFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                      <span>TOTAL</span>
                      <span>{formatRupiah(inv.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="text-[8.5px] text-center space-y-1 pt-1 text-slate-600">
                    <div>BCA: {paymentChannels.bcaAccount.number} (a/n {paymentChannels.bcaAccount.name})</div>
                    <div>Terima kasih atas pembayaran Anda!</div>
                    <div className="text-[7.5px] text-slate-400 font-sans mt-2">=== Simpan struk ini sebagai bukti sah ===</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* MODE 3: Rekapitulasi Lembar Kolektibilitas Tagihan Lapangan */
          <div className="space-y-4">
            <div className="border-b-2 border-slate-800 pb-3 text-center">
              <h2 className="font-bold text-base text-slate-900">LEMBAR REKAPITULASI PENAGIHAN LAPANGAN</h2>
              <p className="text-xs text-slate-600">
                Periode: <b>{selectedPeriod}</b> &bull; Wilayah: <b>{areaFilter === 'all' ? 'Semua RT/RW' : areaFilter}</b>
              </p>
            </div>

            <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border border-slate-300 w-8">No</th>
                  <th className="p-2 border border-slate-300">No. Invoice</th>
                  <th className="p-2 border border-slate-300">Nama Pelanggan</th>
                  <th className="p-2 border border-slate-300">Alamat / RT RW</th>
                  <th className="p-2 border border-slate-300">Paket</th>
                  <th className="p-2 border border-slate-300">Jumlah Tagihan</th>
                  <th className="p-2 border border-slate-300 w-28 text-center">Status Bayar</th>
                  <th className="p-2 border border-slate-300 w-32 text-center">Paraf Pelanggan</th>
                </tr>
              </thead>
              <tbody>
                {invoicesToPrint.map((inv, idx) => {
                  const cust = customers.find(c => c.id === inv.customerId);
                  return (
                    <tr key={inv.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono">{inv.invoiceNumber}</td>
                      <td className="p-2 border border-slate-300 font-bold">{inv.customerName}</td>
                      <td className="p-2 border border-slate-300">{cust?.address} ({cust?.rtRw})</td>
                      <td className="p-2 border border-slate-300">{inv.packageName}</td>
                      <td className="p-2 border border-slate-300 font-bold">{formatRupiah(inv.totalAmount)}</td>
                      <td className="p-2 border border-slate-300 text-center">
                        <span className="inline-block w-4 h-4 border border-slate-400 rounded mr-1 align-middle" />
                        <span>Lunas Cash</span>
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-slate-300">
                        .....................
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold">
                <tr>
                  <td colSpan={5} className="p-2 text-right border border-slate-300">TOTAL TAGIHAN:</td>
                  <td colSpan={3} className="p-2 border border-slate-300 text-blue-300 text-xs">
                    {formatRupiah(invoicesToPrint.reduce((sum, i) => sum + i.totalAmount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-between pt-6 text-xs text-slate-700 px-6">
              <div className="text-center">
                <div>Petugas Kolektor Lapangan</div>
                <div className="mt-14 border-t border-slate-400 pt-1 font-bold">(........................................)</div>
              </div>
              <div className="text-center">
                <div>Bendahara / Kasir NOC</div>
                <div className="mt-14 border-t border-slate-400 pt-1 font-bold">( Masnawi )</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
