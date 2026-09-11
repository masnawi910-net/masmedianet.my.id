import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Phone,
  MessageSquare,
  MapPin,
  Radio,
  Send,
  Printer,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Wrench,
  Calendar,
  FileText,
  Camera,
  Image as ImageIcon,
  Trash2,
  Compass,
  Check,
  X,
  Share2,
} from 'lucide-react';
import { SupportTicket, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

export const TicketHelpdeskView: React.FC = () => {
  const {
    tickets,
    customers,
    addTicket,
    updateTicket,
    addTicketLog,
    deleteTicket,
    sendWhatsAppMessage,
    setActiveTab,
    logActivity,
    ispProfile,
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPrintSPKModal, setShowPrintSPKModal] = useState<boolean>(false);

  // New ticket form state
  const [formCustomerId, setFormCustomerId] = useState<string>(customers[0]?.id || '');
  const [formCategory, setFormCategory] = useState<TicketCategory>('los_red');
  const [formPriority, setFormPriority] = useState<TicketPriority>('high');
  const [formSubject, setFormSubject] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formReportedVia, setFormReportedVia] = useState<'portal_pelanggan' | 'whatsapp' | 'telepon' | 'admin'>('whatsapp');
  const [formAssignedTech, setFormAssignedTech] = useState<string>('Teknisi Lapangan 1');
  const [formScheduledDate, setFormScheduledDate] = useState<string>(
    new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  // Quick Action in ticket detail
  const [newLogMessage, setNewLogMessage] = useState<string>('');
  const [resolutionInput, setResolutionInput] = useState<string>('');
  const fileEvidenceRef = useRef<HTMLInputElement>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const critical = tickets.filter(t => t.priority === 'critical' || t.category === 'los_red').length;
    return { total, open, inProgress, resolved, critical };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (activeTabFilter === 'open' && t.status !== 'open') return false;
      if (activeTabFilter === 'in_progress' && t.status !== 'in_progress') return false;
      if (activeTabFilter === 'resolved' && (t.status !== 'resolved' && t.status !== 'closed')) return false;
      if (activeTabFilter === 'critical' && t.priority !== 'critical' && t.category !== 'los_red') return false;

      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.ticketNumber.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerPhone.includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.odpName && t.odpName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tickets, activeTabFilter, categoryFilter, priorityFilter, searchQuery]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formCustomerId);
    if (!cust) return;

    addTicket({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      rtRw: cust.rtRw || 'RT 01/RW 01',
      odpName: cust.odp || 'ODP-RW01-A',
      onuSerial: cust.onuSerial || 'ZTEGC123456',
      category: formCategory,
      priority: formPriority,
      status: 'open',
      subject: formSubject || `Gangguan Layanan - ${cust.name}`,
      description: formDescription || 'Pelanggan melaporkan kendala koneksi.',
      reportedVia: formReportedVia,
      assignedTechnicianName: formAssignedTech,
      scheduledDate: formScheduledDate,
    });

    logActivity('ticket', 'Buat Tiket Baru', `Menerbitkan tiket ${formSubject} untuk ${cust.name}`);

    setFormSubject('');
    setFormDescription('');
    setShowCreateModal(false);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newLogMessage.trim()) return;
    addTicketLog(selectedTicket.id, 'Masnawi (Admin NOC)', newLogMessage.trim());
    setNewLogMessage('');
  };

  const handleUpdateStatus = (status: TicketStatus) => {
    if (!selectedTicket) return;
    addTicketLog(
      selectedTicket.id,
      'Masnawi (Admin NOC)',
      `Status tiket diubah menjadi "${status.toUpperCase()}"`,
      status
    );
    if (status === 'resolved' && resolutionInput.trim()) {
      updateTicket(selectedTicket.id, { resolutionNotes: resolutionInput.trim() });
    }
  };

  const handleUploadEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTicket) return;

    const reader = new FileReader();
    reader.onload = event => {
      const base64 = event.target?.result as string;
      const updatedEvidence = [...(currentTicket.evidenceImages || []), base64];
      updateTicket(currentTicket.id, { evidenceImages: updatedEvidence });
      addTicketLog(currentTicket.id, 'Teknisi Lapangan', 'Mengunggah 1 foto dokumentasi perbaikan.');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteEvidence = (index: number) => {
    if (!currentTicket || !currentTicket.evidenceImages) return;
    const updated = currentTicket.evidenceImages.filter((_, i) => i !== index);
    updateTicket(currentTicket.id, { evidenceImages: updated });
  };

  const handleSendWATicketUpdate = (ticket: SupportTicket) => {
    const text = `Halo Kak *${ticket.customerName}*,\n\nUpdate perihal laporan gangguan internet Anda (*${ticket.ticketNumber}*):\n📌 *Status:* ${ticket.status.toUpperCase()}\n👨‍🔧 *Teknisi:* ${ticket.assignedTechnicianName || 'Tim Support'}\n📅 *Jadwal Kunjungan:* ${ticket.scheduledDate ? ticket.scheduledDate.replace('T', ' ') : 'Hari ini'}\n📝 *Catatan:* ${ticket.resolutionNotes || 'Tim teknisi kami sedang melakukan penanganan optimal.'}\n\nTerima kasih atas kesabaran Anda.\n*NOC ${ispProfile?.brandName || 'RTRW.NET'}*`;
    sendWhatsAppMessage(ticket.customerPhone, text);
  };

  const handleDispatchTechWA = (ticket: SupportTicket) => {
    const techPhone = '081234567890';
    const text = `🚨 *SPK DISPATCH PENUGASAN TEKNISI NOC*\n\n` +
      `No Tiket: *${ticket.ticketNumber}*\n` +
      `Prioritas: *${ticket.priority.toUpperCase()}*\n` +
      `Pelanggan: *${ticket.customerName}* (${ticket.customerPhone})\n` +
      `Alamat: ${ticket.customerAddress} (${ticket.rtRw || '-'})\n` +
      `Titik ODP: *${ticket.odpName || '-'}* | Serial ONT: ${ticket.onuSerial || '-'}\n` +
      `Kendala: *${ticket.subject}*\n` +
      `Catatan: ${ticket.description}\n\n` +
      `Mohon segera menuju lokasi dan konfirmasi jika sudah di titik ODP.`;
    sendWhatsAppMessage(techPhone, text);
  };

  const getCategoryBadge = (cat: TicketCategory) => {
    switch (cat) {
      case 'los_red':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">LOS Merah (Kabel Optik)</span>;
      case 'slow_speed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Internet Lambat</span>;
      case 'wifi_issue':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-white border border-blue-500/30">Kendala WiFi / Password</span>;
      case 'relocation':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Pindah Rumah / Tiang</span>;
      case 'new_install':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Pemasangan Baru</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">Lainnya</span>;
    }
  };

  const getPriorityBadge = (prio: TicketPriority) => {
    switch (prio) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">LOW</span>;
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> Baru Masuk</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-500/15 text-white border border-blue-500/30 flex items-center gap-1"><Wrench className="w-3 h-3" /> Ditangani Teknisi</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-500/15 text-white border border-blue-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Selesai Normal</span>;
      case 'closed':
        return <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">Ditutup</span>;
      default:
        return null;
    }
  };

  // Sync selected ticket with updated state
  const currentTicket = useMemo(() => {
    if (!selectedTicket) return null;
    return tickets.find(t => t.id === selectedTicket.id) || null;
  }, [tickets, selectedTicket]);

  return (
    <div className="space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <LifeBuoy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Sistem Tiket Gangguan & Dispatch Lapangan</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                Helpdesk & SPK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pusat keluhan komplain pelanggan, penugasan teknisi lapangan, cetak SPK kerja, dokumentasi foto redaman, dan notifikasi WhatsApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tiket Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setActiveTabFilter('all')}
          className={`cursor-pointer bg-slate-900/90 border rounded-2xl p-4 transition-all ${
            activeTabFilter === 'all' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center text-slate-400 mb-1 text-xs font-medium">
            <span>Total Tiket</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>

        <div
          onClick={() => setActiveTabFilter('open')}
          className={`cursor-pointer bg-slate-900/90 border rounded-2xl p-4 transition-all ${
            activeTabFilter === 'open' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center text-amber-400 mb-1 text-xs font-semibold">
            <span>Menunggu (Open)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{stats.open}</div>
        </div>

        <div
          onClick={() => setActiveTabFilter('in_progress')}
          className={`cursor-pointer bg-slate-900/90 border rounded-2xl p-4 transition-all ${
            activeTabFilter === 'in_progress' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center text-blue-400 mb-1 text-xs font-semibold">
            <span>Ditangani Teknisi</span>
            <Wrench className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">{stats.inProgress}</div>
        </div>

        <div
          onClick={() => setActiveTabFilter('resolved')}
          className={`cursor-pointer bg-slate-900/90 border rounded-2xl p-4 transition-all ${
            activeTabFilter === 'resolved' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center text-blue-400 mb-1 text-xs font-semibold">
            <span>Selesai (Resolved)</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">{stats.resolved}</div>
        </div>

        <div
          onClick={() => setActiveTabFilter('critical')}
          className={`cursor-pointer bg-slate-900/90 border rounded-2xl p-4 transition-all ${
            activeTabFilter === 'critical' ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center text-rose-400 mb-1 text-xs font-semibold">
            <span>Kabel Putus / LOS</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{stats.critical}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no tiket, nama, no HP, atau ODP..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="los_red">LOS Merah (Kabel Optik)</option>
            <option value="slow_speed">Internet Lambat</option>
            <option value="wifi_issue">Kendala WiFi</option>
            <option value="relocation">Relokasi / Pindah Tiang</option>
            <option value="new_install">Pemasangan Baru</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Semua Prioritas</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">No. Tiket & Jadwal</th>
                <th className="py-3.5 px-4">Pelanggan & Lokasi ODP</th>
                <th className="py-3.5 px-4">Kategori Gangguan</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Status & Teknisi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white text-xs">{ticket.ticketNumber}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>{ticket.scheduledDate ? ticket.scheduledDate.replace('T', ' ') : ticket.createdAt}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{ticket.customerName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{ticket.odpName || ticket.customerAddress}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div>{getCategoryBadge(ticket.category)}</div>
                        <div className="text-[11px] text-slate-300 font-medium truncate max-w-xs">{ticket.subject}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getPriorityBadge(ticket.priority)}</td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div>{getStatusBadge(ticket.status)}</div>
                        <div className="text-[10.5px] text-slate-400">
                          Teknisi: <b className="text-slate-300">{ticket.assignedTechnicianName || 'Belum ditugaskan'}</b>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowPrintSPKModal(true);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                          title="Cetak SPK Kerja Teknisi"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendWATicketUpdate(ticket)}
                          className="p-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-white rounded-lg border border-blue-500/30 transition-colors"
                          title="Kirim Update WhatsApp ke Pelanggan"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Tidak ada tiket pengaduan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail & Dispatch Modal */}
      {currentTicket && !showPrintSPKModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">{currentTicket.ticketNumber}</h3>
                    {getPriorityBadge(currentTicket.priority)}
                  </div>
                  <p className="text-xs text-slate-400">Dilaporkan via {currentTicket.reportedVia} pada {currentTicket.createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintSPKModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cetak SPK Lapangan</span>
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-white text-xl font-bold p-1"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Customer and Network Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Informasi Pelanggan</span>
                  <div className="font-bold text-white text-sm">{currentTicket.customerName}</div>
                  <div className="text-slate-400">{currentTicket.customerAddress} ({currentTicket.rtRw})</div>
                  <div className="text-white font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{currentTicket.customerPhone}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Detail Perangkat & ODP</span>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Titik ODP:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-teal-400 font-bold">{currentTicket.odpName || '-'}</span>
                      <button
                        onClick={() => setActiveTab('ftth-gis')}
                        className="text-[10px] text-teal-300 hover:underline flex items-center gap-0.5"
                      >
                        <Compass className="w-3 h-3" /> Map
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Serial ONT:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-mono">{currentTicket.onuSerial || '-'}</span>
                      <button
                        onClick={() => setActiveTab('tr069')}
                        className="text-[10px] text-indigo-300 hover:underline flex items-center gap-0.5"
                      >
                        <Radio className="w-3 h-3" /> TR-069
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teknisi Ditugaskan:</span>
                    <span className="text-amber-300 font-bold">{currentTicket.assignedTechnicianName || 'Belum ada'}</span>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kategori & Judul Keluhan:</span>
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryBadge(currentTicket.category)}
                  <span className="font-bold text-white text-sm">{currentTicket.subject}</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentTicket.description}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Update Status Pengerjaan:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus('open')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      currentTicket.status === 'open'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    1. Open (Baru)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      currentTicket.status === 'in_progress'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    2. In Progress (Teknisi)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      currentTicket.status === 'resolved'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    3. Resolved (Selesai Normal)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('closed')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      currentTicket.status === 'closed'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    4. Closed
                  </button>
                </div>

                {/* Optional Final Resolution note */}
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Tulis solusi akhir / tindakan perbaikan teknisi (cth: Splicing ulang core 2 tiang 14)..."
                    value={resolutionInput || currentTicket.resolutionNotes || ''}
                    onChange={e => setResolutionInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Evidence Gallery */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dokumentasi Foto Perbaikan Lapangan ({currentTicket.evidenceImages?.length || 0}):
                  </span>
                  <input
                    type="file"
                    ref={fileEvidenceRef}
                    onChange={handleUploadEvidence}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileEvidenceRef.current?.click()}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                  </button>
                </div>

                {currentTicket.evidenceImages && currentTicket.evidenceImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {currentTicket.evidenceImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
                        <img src={img} alt="Bukti Penanganan" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleDeleteEvidence(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-xl">
                    Belum ada foto dokumentasi redaman atau kabel. Klik Upload Foto untuk menambah.
                  </div>
                )}
              </div>

              {/* Progress Logs & Timeline */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Log Riwayat & Catatan Penanganan ({currentTicket.logs?.length || 0}):
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {currentTicket.logs?.map(log => (
                    <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-teal-400">{log.author}</span>
                        <span className="text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-xs">{log.message}</p>
                    </div>
                  ))}
                </div>

                {/* Add new log comment */}
                <form onSubmit={handleAddLog} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Tulis catatan update penanganan lapangan..."
                    value={newLogMessage}
                    onChange={e => setNewLogMessage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Catat</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => {
                  if (confirm(`Hapus tiket ${currentTicket.ticketNumber}?`)) {
                    deleteTicket(currentTicket.id);
                    setSelectedTicket(null);
                  }
                }}
                className="px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold"
              >
                Hapus Tiket
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDispatchTechWA(currentTicket)}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                  title="Kirim SPK Tugas ke WhatsApp Teknisi Lapangan"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Dispatch WA Teknisi</span>
                </button>
                <button
                  onClick={() => handleSendWATicketUpdate(currentTicket)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Update WA Pelanggan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal SPK Print View */}
      {currentTicket && showPrintSPKModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            {/* SPK Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  {ispProfile?.brandName || 'MASMEDIA INTERNET SERVICE'}
                </h2>
                <p className="text-xs text-slate-600">
                  SURAT PERINTAH KERJA (SPK) PENANGANAN GANGGUAN LAPANGAN
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  NOC Center &bull; Hotline: {ispProfile?.hotlinePhone || '0851-5767-1244'} &bull; {ispProfile?.address || 'Jl. Raya Fiber No. 88'}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm bg-slate-100 px-3 py-1 border border-slate-300 rounded block">
                  {currentTicket.ticketNumber}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">Tgl: {currentTicket.createdAt}</span>
              </div>
            </div>

            {/* Table Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 p-3 rounded space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">DATA PELANGGAN:</span>
                <div className="font-bold text-sm text-slate-900">{currentTicket.customerName}</div>
                <div>{currentTicket.customerAddress} ({currentTicket.rtRw || 'RT/RW'})</div>
                <div className="font-mono text-slate-700">No. WA/Telp: {currentTicket.customerPhone}</div>
              </div>

              <div className="border border-slate-300 p-3 rounded space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">TITIK INFRASTRUKTUR:</span>
                <div>Nama ODP: <b>{currentTicket.odpName || '-'}</b></div>
                <div>Serial ONT: <b className="font-mono">{currentTicket.onuSerial || '-'}</b></div>
                <div>Prioritas: <b className="uppercase">{currentTicket.priority}</b></div>
                <div>Teknisi: <b>{currentTicket.assignedTechnicianName || 'Tim Support'}</b></div>
              </div>
            </div>

            {/* Symptom */}
            <div className="border border-slate-300 p-3 rounded text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">KELUHAN / GEJALA:</span>
              <div className="font-bold text-slate-900">{currentTicket.subject}</div>
              <div className="text-slate-700">{currentTicket.description}</div>
            </div>

            {/* Field Checklist */}
            <div className="border border-slate-300 p-3 rounded text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">CHECKLIST PEKERJAAN & REDAMAN:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-slate-400 rounded-sm" /> Cek Redaman ODP (Optical Power)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-slate-400 rounded-sm" /> Splicing / Pasang Fast Connector</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-slate-400 rounded-sm" /> Cek Redaman Roset ONT (&lt; -24 dBm)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 border border-slate-400 rounded-sm" /> Testing Speed & Ping Gateway</div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-600 block">Redaman Hasil Ukur (OPM): _________ dBm &bull; Material Dipakai: Fast Connector [ ] bh &bull; Dropcore [ ] m</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4">
              <div>
                <p className="text-slate-600 mb-14">Petugas / Teknisi Lapangan,</p>
                <p className="font-bold border-t border-slate-400 pt-1">({currentTicket.assignedTechnicianName || '................................'})</p>
              </div>
              <div>
                <p className="text-slate-600 mb-14">Pelanggan / Penerima,</p>
                <p className="font-bold border-t border-slate-400 pt-1">({currentTicket.customerName})</p>
              </div>
            </div>

            {/* Actions for modal */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowPrintSPKModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar SPK</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create New Ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Buat Tiket Gangguan Baru</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Pelanggan</label>
                <select
                  value={formCustomerId}
                  onChange={e => setFormCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - {c.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Masalah</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as TicketCategory)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="los_red">LOS Merah (Kabel Optik)</option>
                    <option value="slow_speed">Internet Lambat / Lemot</option>
                    <option value="wifi_issue">Kendala WiFi / Password</option>
                    <option value="relocation">Relokasi / Pindah Tiang</option>
                    <option value="new_install">Pemasangan Baru</option>
                    <option value="billing_dispute">Masalah Pembayaran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tingkat Prioritas</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="critical">Critical (Darurat)</option>
                    <option value="high">High (Tinggi)</option>
                    <option value="medium">Medium (Sedang)</option>
                    <option value="low">Low (Biasa)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Judul / Ringkasan Kendala</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lampu PON mati, indikator LOS merah kedip-kedip"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Lengkap Laporan</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan detail komplain dari pelanggan atau info tiang ODP..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tugaskan Teknisi</label>
                  <select
                    value={formAssignedTech}
                    onChange={e => setFormAssignedTech(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Teknisi Lapangan 1">Teknisi Lapangan 1</option>
                    <option value="Teknisi Lapangan 2">Teknisi Lapangan 2</option>
                    <option value="NOC Support">NOC Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jadwal Kunjungan Teknisi</label>
                  <input
                    type="datetime-local"
                    value={formScheduledDate}
                    onChange={e => setFormScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  Terbitkan Tiket & SPK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
