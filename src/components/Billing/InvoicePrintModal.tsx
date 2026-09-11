import React, { useState } from 'react';
import { Invoice, Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  FileText,
  Receipt,
  QrCode,
  CheckCircle,
  Building,
  Phone,
} from 'lucide-react';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  onClose,
}) => {
  const { customers, paymentChannels, ispProfile } = useApp();
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');

  if (!invoice) return null;

  const customer = customers.find(c => c.id === invoice.customerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  printFormat === 'thermal'
                    ? 'bg-blue-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" /> Struk Thermal (58/80mm)
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  printFormat === 'a4'
                    ? 'bg-blue-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Invoice A4 Resmi
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" /> Cetak / Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          {printFormat === 'thermal' ? (
            /* Thermal POS Slip Format (58mm / 80mm standard receipt) */
            <div className="w-full max-w-[320px] bg-white text-slate-900 font-mono text-xs p-5 rounded-lg shadow-xl print:shadow-none print:m-0 print:p-2 border border-slate-200">
              {/* Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
                {ispProfile?.logoUrl ? (
                  <img src={ispProfile.logoUrl} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1" />
                ) : null}
                <h3 className="font-bold text-base tracking-tight">{ispProfile?.brandName || paymentChannels.merchantName}</h3>
                <p className="text-[10px] text-slate-600">WA/CS: {ispProfile?.phone || paymentChannels.waGatewayNumber} &bull; {ispProfile?.email}</p>
                <p className="text-[9px] text-slate-500">{ispProfile?.address}</p>
              </div>

              {/* Invoice Meta */}
              <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>No. Invoice:</span>
                  <span className="font-bold">{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{formatDateIndo(invoice.createdAt.slice(0, 10))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold truncate max-w-[150px]">{invoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID / User:</span>
                  <span>{customer?.id} ({customer?.username})</span>
                </div>
                <div className="flex justify-between">
                  <span>Periode:</span>
                  <span className="font-bold">{invoice.period}</span>
                </div>
              </div>

              {/* Items */}
              <div className="py-2.5 space-y-1.5 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold">
                  <span>{invoice.packageName}</span>
                  <span>{formatRupiah(invoice.packagePrice)}</span>
                </div>
                {invoice.lateFee > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Denda Keterlambatan</span>
                    <span>{formatRupiah(invoice.lateFee)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-blue-500">
                    <span>Diskon Khusus</span>
                    <span>- {formatRupiah(invoice.discount)}</span>
                  </div>
                )}
              </div>

              {/* Total & Status */}
              <div className="py-3 space-y-1.5 border-b border-dashed border-slate-400">
                <div className="flex justify-between text-sm font-extrabold">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>STATUS:</span>
                  <span className={`font-bold ${invoice.status === 'paid' ? 'text-blue-500' : 'text-amber-600'}`}>
                    {invoice.status === 'paid' ? 'LUNAS (PAID)' : 'BELUM LUNAS'}
                  </span>
                </div>
                {invoice.paidAt && (
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Tgl Bayar:</span>
                    <span>{formatDateTimeIndo(invoice.paidAt)}</span>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Metode:</span>
                    <span>{invoice.paymentMethod.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center pt-3 space-y-1 text-[10px] text-slate-600">
                <p>Simpan struk ini sebagai bukti pembayaran yang sah.</p>
                <p className="font-bold text-white">Terima kasih atas kepercayaan Anda! 🙏</p>
                <div className="pt-2 flex justify-center">
                  <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-white" />
                  </div>
                </div>
                <p className="text-[8px] text-slate-400 pt-1">Powered by Masmedia System</p>
              </div>
            </div>
          ) : (
            /* A4 Full Official Invoice Format */
            <div className="w-full bg-white text-white p-8 rounded-xl shadow-xl font-sans print:shadow-none print:p-0">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {ispProfile?.logoUrl ? (
                      <img src={ispProfile.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                        ISP
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight uppercase text-white">
                      {ispProfile?.brandName || paymentChannels.merchantName}
                    </h2>
                    <p className="text-xs text-slate-600 max-w-[320px]">
                      {ispProfile?.address || 'Komplek Jaringan RT/RW Net Mandiri'}
                    </p>
                    <p className="text-xs text-slate-600">
                      WA/CS: <strong>{ispProfile?.phone || paymentChannels.waGatewayNumber}</strong> &bull; Email: {ispProfile?.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white block tracking-tight">FAKTUR TAGIHAN</span>
                  <span className="text-xs font-mono font-bold text-white block">{invoice.id}</span>
                  <span className="text-xs text-slate-500">Tgl: {formatDateIndo(invoice.createdAt.slice(0, 10))}</span>
                </div>
              </div>

              {/* Bill To & Due Date */}
              <div className="grid grid-cols-2 gap-6 py-5 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Tagihan Ditujukan Kepada:</span>
                  <h4 className="text-sm font-bold text-white">{invoice.customerName}</h4>
                  <p className="text-slate-600">{customer?.address}</p>
                  <p className="text-slate-600">No. WA: {invoice.customerPhone}</p>
                  <p className="text-slate-600 font-mono">ID Pelanggan: {invoice.customerId}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Informasi Penagihan:</span>
                  <p><strong className="text-white">Periode Layanan:</strong> {invoice.period}</p>
                  <p><strong className="text-white">Jatuh Tempo:</strong> {formatDateIndo(invoice.dueDate)}</p>
                  <p>
                    <strong className="text-white">Status Pembayaran: </strong>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${invoice.status === 'paid' ? 'bg-blue-100 text-white' : 'bg-red-100 text-red-800'}`}>
                      {invoice.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Item Table */}
              <table className="w-full text-xs text-left my-4 border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Deskripsi Layanan</th>
                    <th className="p-3 text-center">Periode</th>
                    <th className="p-3 text-right">Tarif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3">
                      <span className="font-bold block text-sm">{invoice.packageName}</span>
                      <span className="text-slate-500">Akses internet unlimited broadband RT/RW Net</span>
                    </td>
                    <td className="p-3 text-center text-slate-600">{invoice.period}</td>
                    <td className="p-3 text-right font-mono font-bold">{formatRupiah(invoice.packagePrice)}</td>
                  </tr>
                  {invoice.lateFee > 0 && (
                    <tr className="bg-red-50/50 text-red-700">
                      <td className="p-3 font-semibold">Denda Keterlambatan Pembayaran</td>
                      <td className="p-3 text-center">-</td>
                      <td className="p-3 text-right font-mono font-bold">{formatRupiah(invoice.lateFee)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-sm">
                  <tr>
                    <td colSpan={2} className="p-3 text-right">TOTAL TAGIHAN:</td>
                    <td className="p-3 text-right font-mono text-blue-400 font-extrabold text-base">
                      {formatRupiah(invoice.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Bank Accounts & Signature */}
              <div className="grid grid-cols-2 gap-6 pt-4 text-xs border-t border-slate-200">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Metode Pembayaran Transfer Bank / QRIS:</span>
                  <p className="text-slate-600">BCA: <strong>{paymentChannels.bcaAccount.number}</strong> a/n {paymentChannels.bcaAccount.name}</p>
                  <p className="text-slate-600">Mandiri: <strong>{paymentChannels.mandiriAccount.number}</strong> a/n {paymentChannels.mandiriAccount.name}</p>
                  <p className="text-slate-600">BRI: <strong>{paymentChannels.briAccount.number}</strong> a/n {paymentChannels.briAccount.name}</p>
                </div>
                <div className="text-center flex flex-col items-center justify-end">
                  <p className="text-slate-600 mb-10">Pengelola &bull; {ispProfile?.brandName || 'Masmedia'},</p>
                  <p className="font-bold text-slate-800 border-t border-slate-400 pt-1 px-8">
                    {invoice.receivedBy || 'Admin Keuangan'}
                  </p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 italic">
                "{ispProfile?.footerNote || 'Terima kasih atas pembayaran Anda. Simpan bukti ini sebagai konfirmasi sah.'}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
