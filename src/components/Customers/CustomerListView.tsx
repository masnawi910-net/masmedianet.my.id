import React, { useState } from 'react';
import { Customer, CustomerStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  exportCustomersToExcel,
  exportCustomersToCSV,
  downloadCustomerTemplateCSV,
  downloadCustomerTemplateExcel,
} from '../../utils/excelHelper';
import { ImportCustomerModal } from './ImportCustomerModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Key,
  Wifi,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Power,
  CheckCircle,
  Eye,
  RotateCcw,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  ArrowDown,
} from 'lucide-react';
import { formatRupiah, formatDateIndo, getWhatsAppLink } from '../../utils/formatters';
import { CustomerModal } from './CustomerModal';
import { CustomerDetailModal } from './CustomerDetailModal';

export const CustomerListView: React.FC = () => {
  const {
    customers,
    packages,
    nasList,
    activeSessions,
    searchQuery,
    setSearchQuery,
    bulkImportCustomers,
    deleteCustomer,
    isolateCustomer,
    unIsolateCustomer,
    sendWhatsAppMessage,
    getFormattedMessage,
    selectedCustomerId,
    setSelectedCustomerId,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Filter logic
  const filteredCustomers = customers.filter(cust => {
    const pkg = packages.find(p => p.id === cust.packageId);
    const searchLower = (searchQuery || '').toLowerCase();

    const matchesSearch =
      (cust.name || '').toLowerCase().includes(searchLower) ||
      (cust.phone || '').includes(searchLower) ||
      (cust.username || '').toLowerCase().includes(searchLower) ||
      (cust.ipAddress || '').includes(searchLower) ||
      (cust.address || '').toLowerCase().includes(searchLower) ||
      (cust.id || '').toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && cust.status === 'active') ||
      (statusFilter === 'due_soon' && cust.status === 'due_soon') ||
      (statusFilter === 'overdue' && cust.status === 'overdue') ||
      (statusFilter === 'isolated' && cust.status === 'isolated');

    const matchesPackage = packageFilter === 'all' || cust.packageId === packageFilter;
    const matchesConnection = connectionFilter === 'all' || cust.connectionType === connectionFilter;

    return matchesSearch && matchesStatus && matchesPackage && matchesConnection;
  });

  const handleOpenEdit = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus pelanggan ${name}? Akun RADIUS dan riwayat akan dihapus.`)) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            Data Pelanggan & RADIUS User
          </h2>
          <p className="text-xs text-slate-400">
            Total {customers.length} pelanggan terdaftar &bull; Pengelolaan kredensial PPPoE, Hotspot & status isolir
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white hover:text-white font-semibold text-xs border border-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            title="Impor Data Pelanggan dari file Excel (.xlsx) atau teks CSV"
          >
            <Upload className="w-4 h-4" />
            Impor Data (.xlsx)
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(prev => !prev)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
              title="Expor Data Pelanggan"
            >
              <Download className="w-4 h-4 text-white" />
              Expor Data
              <ArrowDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-30 animate-fadeIn text-xs">
                <button
                  onClick={() => {
                    exportCustomersToExcel(filteredCustomers, packages, nasList);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <div>
                    <div className="font-semibold">Format Excel (.xlsx)</div>
                    <span className="text-[10px] text-slate-500">Standar Microsoft Excel</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    exportCustomersToCSV(filteredCustomers, packages, nasList);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors border-t border-slate-800/80 mt-1 pt-1"
                >
                  <FileText className="w-4 h-4 text-white" />
                  <div>
                    <div className="font-semibold">Format CSV (Titik-koma)</div>
                    <span className="text-[10px] text-slate-500">no;user;password;profile;nas;...</span>
                  </div>
                </button>

                <div className="border-t border-slate-800/90 my-1 pt-1 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Unduh Template Kosong
                </div>
                <button
                  onClick={() => {
                    downloadCustomerTemplateCSV();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-white hover:text-white hover:bg-blue-950/40 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-white" />
                  <div>
                    <div className="font-semibold">Template CSV (.csv)</div>
                    <span className="text-[10px] text-slate-400">Siap diisi pelanggan Anda</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    downloadCustomerTemplateExcel();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-white hover:text-white hover:bg-blue-950/40 flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <div>
                    <div className="font-semibold">Template Excel (.xlsx)</div>
                    <span className="text-[10px] text-slate-400">Format tabel Microsoft Excel</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setCustomerToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Pelanggan Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, No HP/WA, username, IP, alamat..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif Normal</option>
              <option value="due_soon">Mendekati Jatuh Tempo</option>
              <option value="overdue">Menunggak</option>
              <option value="isolated">Terisolir</option>
            </select>
          </div>

          {/* Package Filter */}
          <div>
            <select
              value={packageFilter}
              onChange={e => setPackageFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Paket Internet</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.rateLimit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Status Count Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-blue-500/20 text-white border border-blue-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            Aktif ({customers.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'overdue'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-amber-400'
            }`}
          >
            Menunggak ({customers.filter(c => c.status === 'overdue').length})
          </button>
          <button
            onClick={() => setStatusFilter('isolated')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'isolated'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-red-400'
            }`}
          >
            Terisolir ({customers.filter(c => c.status === 'isolated').length})
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Pelanggan</th>
                <th className="px-4 py-3.5">Akun RADIUS</th>
                <th className="px-4 py-3.5">Paket & Speed</th>
                <th className="px-4 py-3.5">IP / NAS</th>
                <th className="px-4 py-3.5">Jatuh Tempo</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-white flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-white">Belum Ada Data Pelanggan</div>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Mulai uji coba nyata dengan menambahkan pelanggan baru atau import data pelanggan massal dari file Excel / CSV.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerToEdit(null);
                            setIsAddModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          + Tambah Pelanggan Baru
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsImportModalOpen(true)}
                          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl font-medium text-xs transition-all cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-white" />
                          Import Excel / CSV
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const pkg = packages.find(p => p.id === cust.packageId);
                  const nas = nasList.find(n => n.id === cust.nasId);

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Contact */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                onClick={() => setSelectedCustomerId(cust.id)}
                                className="font-bold text-white hover:text-white cursor-pointer text-sm"
                              >
                                {cust.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                                {cust.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                              <button
                                onClick={() => {
                                  const msg = getFormattedMessage(cust.id, 'tagihan_baru');
                                  sendWhatsAppMessage(cust.phone, msg);
                                }}
                                className="text-white hover:underline flex items-center gap-1"
                                title="Kirim WhatsApp"
                              >
                                <Phone className="w-3 h-3" /> {cust.phone}
                              </button>
                              <span>&bull; {cust.address}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* RADIUS Creds */}
                      <td className="px-4 py-3 font-mono">
                        <span className="font-semibold text-white block">{cust.username}</span>
                        <span className="text-[11px] text-slate-400">{cust.password}</span>
                      </td>

                      {/* Package & Speed */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-200 block">{pkg?.name || '-'}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] text-white bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                            {pkg?.rateLimit || '-'}
                          </span>
                          <span className="text-slate-400">{formatRupiah(pkg?.price || 0)}</span>
                        </div>
                      </td>

                      {/* IP & NAS */}
                      <td className="px-4 py-3 font-mono">
                        <span className={`block font-medium ${cust.status === 'isolated' ? 'text-red-400' : 'text-slate-300'}`}>
                          {cust.ipAddress}
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans">{nas?.name || 'Core'}</span>
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3">
                        <span className="text-slate-200 font-medium block">
                          Tgl {cust.dueDateDay} / bulan
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Pasang: {cust.installDate}
                        </span>
                      </td>

                      {/* Status Layanan & Sesi MikroTik */}
                      <td className="px-4 py-3">
                        {(() => {
                          const custNas = nasList.find(n => n.id === cust.nasId) || nasList[0];
                          const isRouterOnline = custNas ? custNas.status === 'online' : false;
                          const isOnline = isRouterOnline && activeSessions.some(
                            s => (s.username || '').toLowerCase().trim() === (cust.username || '').toLowerCase().trim()
                          );
                          return (
                            <div className="flex flex-col gap-1 items-start">
                              {cust.status === 'active' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5" />
                                  Langganan Aktif
                                </span>
                              )}
                              {cust.status === 'isolated' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
                                  Terisolir
                                </span>
                              )}
                              {cust.status === 'overdue' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
                                  Menunggak
                                </span>
                              )}
                              {cust.status === 'due_soon' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-white border border-blue-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5" />
                                  Jatuh Tempo
                                </span>
                              )}

                              {/* Indikator Real-time Dial-in MikroTik */}
                              {isOnline ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Online (Dial-in)
                                </span>
                              ) : !isRouterOnline ? (
                                <span
                                  className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40"
                                  title="Router MikroTik belum terhubung / offline. Hubungkan router via VPN/skrip terlebih dahulu."
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Offline (Router Belum Konek)
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800"
                                  title="Modem/ONT pelanggan belum melakukan dial-in PPPoE ke MikroTik"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                  Offline (Modem Belum Konek)
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send WhatsApp */}
                          <button
                            onClick={() => {
                              const msg = getFormattedMessage(cust.id, 'tagihan_baru');
                              sendWhatsAppMessage(cust.phone, msg);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-white transition-colors"
                            title="Kirim Tagihan WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Detail Drawer */}
                          <button
                            onClick={() => setSelectedCustomerId(cust.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Lihat Detail Pelanggan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Isolate / Un-isolate */}
                          <button
                            onClick={() => {
                              if (cust.status === 'isolated') {
                                unIsolateCustomer(cust.id);
                              } else {
                                isolateCustomer(cust.id);
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              cust.status === 'isolated'
                                ? 'bg-blue-500/20 text-white hover:bg-blue-500/30'
                                : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                            }`}
                            title={cust.status === 'isolated' ? 'Buka Isolir' : 'Isolir Akses'}
                          >
                            {cust.status === 'isolated' ? (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(cust.id, cust.name)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors"
                            title="Hapus Pelanggan"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customerToEdit={customerToEdit}
      />

      <CustomerDetailModal
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onEdit={customer => {
          setSelectedCustomerId(null);
          handleOpenEdit(customer);
        }}
      />

      {/* Import Customer Modal */}
      <ImportCustomerModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        packages={packages}
        nasList={nasList}
        existingCustomers={customers}
        onImportSuccess={imported => {
          const count = bulkImportCustomers(imported);
          alert(`Sukses mengimpor ${count} data pelanggan ke sistem!`);
        }}
      />
    </div>
  );
};
