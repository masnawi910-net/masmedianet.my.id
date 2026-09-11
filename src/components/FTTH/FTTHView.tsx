import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FTTH_OLT, FTTH_ODP, FTTH_ONU } from '../../types';
import {
  Network,
  Server,
  Radio,
  Wifi,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Trash2,
  Edit,
  Sliders,
  Cable,
  Signal,
  RefreshCw,
  Cpu,
  Layers,
  Thermometer,
  User,
  Users,
  UserCheck,
  AlertCircle,
  Info,
  Sparkles,
} from 'lucide-react';

export const FTTHView: React.FC = () => {
  const {
    customers,
    packages,
    nasList,
    ftthOLTs,
    ftthODPs,
    ftthONUs,
    addOLT,
    updateOLT,
    deleteOLT,
    addODP,
    updateODP,
    deleteODP,
    addONU,
    updateONU,
    deleteONU,
    updateCustomer,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'olt' | 'odp' | 'onu'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // OLT Modal
  const [showOltModal, setShowOltModal] = useState(false);
  const [editingOltId, setEditingOltId] = useState<string | null>(null);
  const [oltForm, setOltForm] = useState<Partial<FTTH_OLT>>({
    name: '',
    brand: 'ZTE C320 GPON',
    ipAddress: '192.168.10.2',
    ponPortsCount: 8,
    activeOnuCount: 0,
    uplinkSpeed: '10G SFP+',
    status: 'online',
    location: 'Server Room POP Core',
    temperature: 38,
  });

  // ODP Modal
  const [showOdpModal, setShowOdpModal] = useState(false);
  const [editingOdpId, setEditingOdpId] = useState<string | null>(null);
  const [odpForm, setOdpForm] = useState<Partial<FTTH_ODP>>({
    name: '',
    oltId: 'OLT-01',
    ponPort: 1,
    locationAddress: '',
    totalPorts: 8,
    usedPorts: 1,
    opticalRxDb: -19.5,
    status: 'good',
    coordinates: { lat: -6.9175, lng: 107.6191 },
  });

  // ONU Modal
  const [showOnuModal, setShowOnuModal] = useState(false);
  const [editingOnuId, setEditingOnuId] = useState<string | null>(null);
  const [onuInputMode, setOnuInputMode] = useState<'pppoe' | 'manual'>('pppoe');
  const [onuForm, setOnuForm] = useState<Partial<FTTH_ONU>>({
    customerId: '',
    customerName: '',
    serialNumber: '',
    macAddress: '',
    odpId: 'ODP-01',
    odpPort: 1,
    onuType: 'ZTE F609 GPON ONT',
    rxOpticalPower: -20.4,
    txOpticalPower: 2.1,
    distanceMeters: 380,
    status: 'online',
  });

  // User PPPoE yang belum diregistrasikan ke modem ONU
  const unassignedPppoeCustomers = useMemo(() => {
    return customers.filter(cust => {
      // Filter hanya pelanggan PPPoE
      const isPppoe = !cust.connectionType || cust.connectionType === 'pppoe';
      if (!isPppoe) return false;

      // Cek apakah sudah terdaftar di daftar ONU
      const isRegistered = ftthONUs.some(onu => {
        // Jika sedang edit ONU tertentu, kecualikan ONU tersebut
        if (editingOnuId && onu.id === editingOnuId) return false;
        if (onu.customerId && onu.customerId === cust.id) return true;
        if (onu.customerName && onu.customerName.trim().toLowerCase() === cust.name.trim().toLowerCase()) return true;
        if (cust.onuSerial && onu.serialNumber && cust.onuSerial === onu.serialNumber) return true;
        return false;
      });

      return !isRegistered;
    });
  }, [customers, ftthONUs, editingOnuId]);

  // Data detail pelanggan terpilih saat ini pada modal ONU
  const selectedCustomer = useMemo(() => {
    if (onuForm.customerId) {
      return customers.find(c => c.id === onuForm.customerId) || null;
    }
    if (onuForm.customerName) {
      return customers.find(c => c.name.trim().toLowerCase() === (onuForm.customerName || '').trim().toLowerCase()) || null;
    }
    return null;
  }, [customers, onuForm.customerId, onuForm.customerName]);

  const selectedPkg = useMemo(() => {
    if (!selectedCustomer) return null;
    return packages.find(p => p.id === selectedCustomer.packageId) || null;
  }, [packages, selectedCustomer]);

  const selectedNas = useMemo(() => {
    if (!selectedCustomer) return null;
    return nasList.find(n => n.id === selectedCustomer.nasId) || null;
  }, [nasList, selectedCustomer]);

  // Calculate Health
  const totalOnus = ftthONUs.length;
  const onlineOnus = ftthONUs.filter(o => o.status === 'online').length;
  const warningOnus = ftthONUs.filter(o => o.rxOpticalPower <= -27 || o.status === 'warning').length;
  const criticalOnus = ftthONUs.filter(o => o.status === 'los' || o.status === 'dying_gasp' || o.status === 'offline').length;

  // Handlers for OLT
  const handleOpenAddOLT = () => {
    setEditingOltId(null);
    setOltForm({
      name: `OLT-GPON-0${ftthOLTs.length + 1}`,
      brand: 'ZTE C320 GPON',
      ipAddress: `192.168.10.${ftthOLTs.length + 2}`,
      ponPortsCount: 8,
      activeOnuCount: 0,
      uplinkSpeed: '10G SFP+',
      status: 'online',
      location: 'Server Room POP RW04',
      temperature: 37,
    });
    setShowOltModal(true);
  };

  const handleOpenEditOLT = (olt: FTTH_OLT) => {
    setEditingOltId(olt.id);
    setOltForm(olt);
    setShowOltModal(true);
  };

  const handleSaveOLT = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOltId) {
      updateOLT(editingOltId, oltForm);
    } else {
      addOLT(oltForm as any);
    }
    setShowOltModal(false);
  };

  const handleDeleteOLT = (olt: FTTH_OLT) => {
    if (confirm(`Yakin ingin menghapus sentral OLT ${olt.name} (${olt.ipAddress})?`)) {
      deleteOLT(olt.id);
    }
  };

  // Handlers for ODP
  const handleOpenAddODP = () => {
    setEditingOdpId(null);
    setOdpForm({
      name: `ODP-RW0${ftthODPs.length + 1}-A`,
      oltId: ftthOLTs[0]?.id || 'OLT-01',
      ponPort: 1,
      locationAddress: 'Tiang Fiber Jl. Utama',
      totalPorts: 8,
      usedPorts: 0,
      opticalRxDb: -19.2,
      status: 'good',
      coordinates: { lat: -6.9175, lng: 107.6191 },
    });
    setShowOdpModal(true);
  };

  const handleOpenEditODP = (odp: FTTH_ODP) => {
    setEditingOdpId(odp.id);
    setOdpForm(odp);
    setShowOdpModal(true);
  };

  const handleSaveODP = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOdpId) {
      updateODP(editingOdpId, odpForm);
    } else {
      addODP(odpForm as any);
    }
    setShowOdpModal(false);
  };

  const handleDeleteODP = (odp: FTTH_ODP) => {
    if (confirm(`Yakin ingin menghapus ODP ${odp.name} di ${odp.locationAddress}?`)) {
      deleteODP(odp.id);
    }
  };

  // Handlers for ONU
  const handleOpenAddONU = (preselectedCustId?: string) => {
    setEditingOnuId(null);

    // Cari user PPPoE target: jika ada parameter preselectedCustId, gunakan itu.
    // Jika tidak ada parameter tapi ada user PPPoE yang belum terdaftar ONU, pre-select user pertama.
    let targetCust = preselectedCustId ? customers.find(c => c.id === preselectedCustId) : null;
    if (!targetCust && unassignedPppoeCustomers.length > 0) {
      targetCust = unassignedPppoeCustomers[0];
    }

    if (targetCust) {
      setOnuInputMode('pppoe');
      setOnuForm({
        customerId: targetCust.id,
        customerName: targetCust.name,
        serialNumber: targetCust.onuSerial || `ZTEGC${Math.floor(100000 + Math.random() * 900000)}`,
        macAddress: targetCust.macAddress || `70:8B:CD:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
        odpId: ftthODPs[0]?.id || 'ODP-01',
        odpPort: 1,
        onuType: 'ZTE F609 GPON ONT',
        rxOpticalPower: -20.4,
        txOpticalPower: 2.1,
        distanceMeters: 380,
        status: 'online',
      });
    } else {
      setOnuInputMode(unassignedPppoeCustomers.length > 0 ? 'pppoe' : 'manual');
      setOnuForm({
        customerId: '',
        customerName: '',
        serialNumber: `ZTEGC${Math.floor(100000 + Math.random() * 900000)}`,
        macAddress: `70:8B:CD:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
        odpId: ftthODPs[0]?.id || 'ODP-01',
        odpPort: 1,
        onuType: 'ZTE F609 GPON ONT',
        rxOpticalPower: -20.4,
        txOpticalPower: 2.1,
        distanceMeters: 380,
        status: 'online',
      });
    }

    setShowOnuModal(true);
  };

  const handleOpenEditONU = (onu: FTTH_ONU) => {
    setEditingOnuId(onu.id);
    setOnuForm(onu);
    const matched = customers.find(c => c.id === onu.customerId || (onu.customerName && c.name.trim().toLowerCase() === onu.customerName.trim().toLowerCase()));
    if (matched) {
      setOnuInputMode('pppoe');
      if (!onu.customerId) {
        setOnuForm(prev => ({ ...prev, customerId: matched.id }));
      }
    } else {
      setOnuInputMode('manual');
    }
    setShowOnuModal(true);
  };

  const handleSaveONU = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onuForm.customerName || !onuForm.customerName.trim()) {
      alert('Silakan pilih akun User PPPoE atau masukkan nama pelanggan.');
      return;
    }

    if (editingOnuId) {
      updateONU(editingOnuId, onuForm);
    } else {
      addONU(onuForm as any);
    }

    // Sinkronisasi serial modem ONU & MAC address ke data Pelanggan
    if (onuForm.customerId) {
      updateCustomer(onuForm.customerId, {
        onuSerial: onuForm.serialNumber,
        ...(onuForm.macAddress ? { macAddress: onuForm.macAddress } : {}),
      });
    }

    setShowOnuModal(false);
  };

  const handleDeleteONU = (onu: FTTH_ONU) => {
    if (confirm(`Yakin ingin menghapus ONU ${onu.customerName} (${onu.serialNumber})?`)) {
      deleteONU(onu.id);
    }
  };

  const getSignalBadge = (rxDbm: number) => {
    if (rxDbm > -24) {
      return {
        label: 'Sinyal Bagus (Ideal)',
        color: 'bg-blue-500/15 text-white border-blue-500/30',
        icon: CheckCircle2,
      };
    } else if (rxDbm > -27) {
      return {
        label: 'Sinyal Sedang (Waspada)',
        color: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
        icon: AlertTriangle,
      };
    } else {
      return {
        label: 'Sinyal Redup (Kritis)',
        color: 'bg-red-500/15 text-red-500 border-red-500/30',
        icon: XCircle,
      };
    }
  };

  const filteredONUs = ftthONUs.filter(onu =>
    onu.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    onu.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    onu.odpId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Add OLT, Add ODP, Registrasi ONU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider mb-1">
            <Network className="w-4 h-4" />
            Dashboard / Manajemen FTTH (Fiber to the Home)
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Jaringan FTTH & GPON/EPON</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitoring sentral OLT, Tiang Distribusi ODP, redaman optik (dBm), dan status ONT pelanggan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddOLT}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 btn-solid-text-white"
            title="Tambah Sentral OLT Baru"
          >
            <Server className="w-4 h-4 text-white" />
            <span>+ Tambah OLT</span>
          </button>
          <button
            onClick={handleOpenAddODP}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 btn-solid-text-white"
            title="Tambah Box ODP Tiang"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Tambah ODP</span>
          </button>
          <button
            onClick={() => handleOpenAddONU()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 btn-solid-text-white relative"
            title="Registrasi Modem ONU Pelanggan dari User PPPoE"
          >
            <Radio className="w-4 h-4 text-white" />
            <span>+ Registrasi ONU</span>
            {unassignedPppoeCustomers.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-400 text-white text-[10px] font-black" title={`${unassignedPppoeCustomers.length} user PPPoE belum memiliki registrasi ONU`}>
                {unassignedPppoeCustomers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Optical Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-400 font-medium">Sentral OLT Aktif</span>
            <h3 className="text-xl font-bold text-white mt-1">{ftthOLTs.length} Unit</h3>
            <span className="text-[11px] text-white font-semibold flex items-center gap-1 mt-0.5">
              {ftthOLTs.reduce((acc, o) => acc + o.ponPortsCount, 0)} PON Ports Tersedia
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Tiang ODP</span>
            <h3 className="text-xl font-bold text-white mt-1">{ftthODPs.length} Box</h3>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Kapasitas: {ftthODPs.reduce((acc, o) => acc + o.usedPorts, 0)} / {ftthODPs.reduce((acc, o) => acc + o.totalPorts, 0)} Port
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-white">
            <Cable className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-400 font-medium">ONU / Modem Aktif</span>
            <h3 className="text-xl font-bold text-white mt-1">{onlineOnus} / {totalOnus}</h3>
            <span className="text-[11px] text-white font-semibold">Online & Terkoneksi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-white">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-400 font-medium">Peringatan Redaman</span>
            <h3 className="text-xl font-bold text-amber-500 mt-1">{warningOnus} Warning</h3>
            <span className="text-[11px] text-red-500 font-semibold">
              {criticalOnus} LOS / Drop
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Signal className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Semua Perangkat' },
            { id: 'olt', label: `Sentral OLT (${ftthOLTs.length})` },
            { id: 'odp', label: `Tiang ODP (${ftthODPs.length})` },
            { id: 'onu', label: `Modem ONU (${ftthONUs.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm btn-solid-text-white'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari SN, ODP, Pelanggan..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* OLT Section with Add & Edit & Delete */}
      {(activeSubTab === 'all' || activeSubTab === 'olt') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-500" />
              Sentral OLT (Optical Line Terminal)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ftthOLTs.map(olt => (
              <div key={olt.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider">{olt.brand}</span>
                    <h4 className="text-base font-bold text-white">{olt.name}</h4>
                    <span className="text-xs text-slate-400 font-medium">{olt.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-500/15 text-white border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      {olt.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs text-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold">IP Management</span>
                    <span className="font-mono text-blue-400 font-bold">{olt.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold">PON Ports</span>
                    <span className="font-bold text-white">{olt.ponPortsCount} Port GPON</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold">ONU Terdaftar</span>
                    <span className="font-bold text-white">{olt.activeOnuCount} Unit</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700">
                  <div className="flex items-center gap-3">
                    <span>Uplink: <strong className="text-white">{olt.uplinkSpeed}</strong></span>
                    <span>Suhu: <strong className="text-white">{olt.temperature}°C</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditOLT(olt)}
                      className="px-2.5 py-1 rounded-lg text-white hover:text-white hover:bg-blue-500/10 font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Edit Konfigurasi OLT"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-500" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOLT(olt)}
                      className="px-2.5 py-1 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Hapus OLT"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ODP Section */}
      {(activeSubTab === 'all' || activeSubTab === 'odp') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cable className="w-4 h-4 text-blue-500" />
              Tiang Distribusi ODP (Optical Distribution Point)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ftthODPs.map(odp => (
              <div key={odp.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{odp.name}</h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" /> {odp.locationAddress}
                    </span>
                  </div>
                  <span className="text-[10px] bg-blue-500/15 text-white border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                    {odp.oltId} (P{odp.ponPort})
                  </span>
                </div>

                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Port Terpakai</span>
                    <span className="font-bold text-white">
                      {odp.usedPorts} / {odp.totalPorts} Port
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Redaman Input</span>
                    <span className="font-mono font-bold text-blue-400">{odp.opticalRxDb} dBm</span>
                  </div>
                </div>

                {/* Port Visualizer */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Status Port Splitter:</span>
                  <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: odp.totalPorts }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                          idx < odp.usedPorts
                            ? 'bg-blue-500 text-white font-mono shadow-xs'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                        title={`Port ${idx + 1}: ${idx < odp.usedPorts ? 'Terpakai (Pelanggan)' : 'Tersedia'}`}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
                  <button
                    onClick={() => handleOpenEditODP(odp)}
                    className="px-2.5 py-1 text-xs font-bold text-white hover:text-white flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-white" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteODP(odp)}
                    className="px-2.5 py-1 text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONU Section */}
      {(activeSubTab === 'all' || activeSubTab === 'onu') && (
        <div className="space-y-3">
          {/* Banner Peringatan User PPPoE Belum Memiliki Modem ONU */}
          {unassignedPppoeCustomers.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-blue-950/70 via-slate-900 to-blue-950/60 border border-blue-500/30 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{unassignedPppoeCustomers.length} Akun PPPoE Menunggu Registrasi Modem ONU</span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    User PPPoE berikut belum dipasangkan perangkat modem ONT/ONU: {unassignedPppoeCustomers.slice(0, 3).map(c => c.name).join(', ')}{unassignedPppoeCustomers.length > 3 ? ` (+${unassignedPppoeCustomers.length - 3} lainnya)` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpenAddONU(unassignedPppoeCustomers[0].id)}
                className="shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 btn-solid-text-white"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Registrasi Sekarang</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-white" />
              Daftar Modem ONU Pelanggan ({filteredONUs.length})
            </h3>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">Pelanggan / Tipe ONU</th>
                    <th className="px-4 py-3.5">Serial Number & MAC</th>
                    <th className="px-4 py-3.5">Jalur Distribusi</th>
                    <th className="px-4 py-3.5">Redaman Rx / Tx</th>
                    <th className="px-4 py-3.5">Jarak Drop Core</th>
                    <th className="px-4 py-3.5">Status Optik</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-slate-200">
                  {filteredONUs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Tidak ada ONU yang cocok dengan pencarian &quot;{searchTerm}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredONUs.map(onu => {
                      const sig = getSignalBadge(onu.rxOpticalPower);
                      const SigIcon = sig.icon;
                      const matchedCust = customers.find(c => c.id === onu.customerId || (onu.customerName && c.name.trim().toLowerCase() === onu.customerName.trim().toLowerCase()));
                      return (
                        <tr key={onu.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                              <span>{onu.customerName}</span>
                              {matchedCust && (
                                <span className="text-[10px] bg-blue-500/20 text-white px-1.5 py-0.5 rounded border border-blue-500/30 font-mono font-bold" title={`User PPPoE: @${matchedCust.username}`}>
                                  @{matchedCust.username}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">{onu.onuType}</span>
                          </td>
                          <td className="px-4 py-3 font-mono">
                            <span className="text-blue-400 font-bold block">{onu.serialNumber}</span>
                            <span className="text-[10px] text-slate-400">{onu.macAddress}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-white">{onu.odpId}</span>
                            <span className="text-[11px] text-slate-400 block">Port #{onu.odpPort}</span>
                          </td>
                          <td className="px-4 py-3 font-mono">
                            <span className="font-bold text-white block">Rx: {onu.rxOpticalPower} dBm</span>
                            <span className="text-[10px] text-slate-400">Tx: +{onu.txOpticalPower} dBm</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-300">
                            {onu.distanceMeters} meter
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${sig.color}`}
                            >
                              <SigIcon className="w-3.5 h-3.5" />
                              {sig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditONU(onu)}
                                className="p-1.5 rounded-lg text-white hover:text-white hover:bg-blue-500/10 transition-colors"
                                title="Edit ONU"
                              >
                                <Edit className="w-4 h-4 text-blue-500" />
                              </button>
                              <button
                                onClick={() => handleDeleteONU(onu)}
                                className="p-1.5 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Hapus ONU"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
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
        </div>
      )}

      {/* Modal Add / Edit OLT */}
      {showOltModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-500" />
                {editingOltId ? 'Edit Konfigurasi Sentral OLT' : 'Tambah Sentral OLT Baru'}
              </h3>
              <button
                onClick={() => setShowOltModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveOLT} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Sentral OLT</label>
                <input
                  type="text"
                  required
                  value={oltForm.name}
                  onChange={e => setOltForm({ ...oltForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-purple-500 focus:outline-none"
                  placeholder="Contoh: OLT-GPON-01"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand / Model OLT</label>
                  <select
                    value={oltForm.brand}
                    onChange={e => setOltForm({ ...oltForm, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-purple-500 focus:outline-none"
                  >
                    <option value="HSGQ EPON 4-Port">HSGQ EPON 4-Port (E04/E04R)</option>
                    <option value="HSGQ EPON 8-Port">HSGQ EPON 8-Port (E08/E08R)</option>
                    <option value="HSGQ GPON 4-Port">HSGQ GPON 4-Port (G004/G04)</option>
                    <option value="HSGQ GPON 8-Port">HSGQ GPON 8-Port (G008/G08)</option>
                    <option value="HSGQ GPON 16-Port">HSGQ GPON 16-Port (G016)</option>
                    <option value="ZTE C320 GPON">ZTE C320 GPON</option>
                    <option value="ZTE C300 GPON/EPON">ZTE C300 GPON</option>
                    <option value="Huawei SmartAX MA5608T">Huawei MA5608T</option>
                    <option value="Huawei MA5800-X7">Huawei MA5800-X7</option>
                    <option value="Fiberhome AN5516-04">Fiberhome AN5516</option>
                    <option value="VSOL V1600G GPON">VSOL V1600G GPON</option>
                    <option value="HIOSO EPON 4-Port">HIOSO EPON 4-Port</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">IP Management</label>
                  <input
                    type="text"
                    required
                    value={oltForm.ipAddress}
                    onChange={e => setOltForm({ ...oltForm, ipAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold focus:border-purple-500 focus:outline-none"
                    placeholder="192.168.10.2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah PON Ports</label>
                  <select
                    value={oltForm.ponPortsCount}
                    onChange={e => setOltForm({ ...oltForm, ponPortsCount: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-purple-500 focus:outline-none"
                  >
                    <option value={2}>2 Port GPON</option>
                    <option value={4}>4 Port GPON</option>
                    <option value={8}>8 Port GPON</option>
                    <option value={16}>16 Port GPON</option>
                    <option value={32}>32 Port GPON</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Uplink Interface</label>
                  <select
                    value={oltForm.uplinkSpeed}
                    onChange={e => setOltForm({ ...oltForm, uplinkSpeed: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-purple-500 focus:outline-none"
                  >
                    <option value="10G SFP+">10G SFP+ (Optik)</option>
                    <option value="1G SFP">1G SFP (Optik)</option>
                    <option value="1Gbps RJ45">1Gbps RJ45 (Ethernet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lokasi POP / Server Room</label>
                <input
                  type="text"
                  required
                  value={oltForm.location}
                  onChange={e => setOltForm({ ...oltForm, location: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-purple-500 focus:outline-none"
                  placeholder="Contoh: Server Room POP RW04"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowOltModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl shadow-md btn-solid-text-white active:scale-95"
                >
                  Simpan Sentral OLT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit ODP */}
      {showOdpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cable className="w-5 h-5 text-blue-500" />
                {editingOdpId ? 'Edit Box ODP Tiang' : 'Tambah Box ODP Baru'}
              </h3>
              <button
                onClick={() => setShowOdpModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveODP} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama / Label ODP</label>
                <input
                  type="text"
                  required
                  value={odpForm.name}
                  onChange={e => setOdpForm({ ...odpForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                  placeholder="misal: ODP-RW04-A"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sentral OLT Induk</label>
                  <select
                    value={odpForm.oltId}
                    onChange={e => setOdpForm({ ...odpForm, oltId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                  >
                    {ftthOLTs.map(olt => (
                      <option key={olt.id} value={olt.id}>{olt.name} ({olt.brand})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Port PON OLT</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={odpForm.ponPort}
                    onChange={e => setOdpForm({ ...odpForm, ponPort: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lokasi Alamat Tiang</label>
                <input
                  type="text"
                  required
                  value={odpForm.locationAddress}
                  onChange={e => setOdpForm({ ...odpForm, locationAddress: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                  placeholder="Jl. Merdeka No. 42 / Tiang Telkom 03"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kapasitas Splitter</label>
                  <select
                    value={odpForm.totalPorts}
                    onChange={e => setOdpForm({ ...odpForm, totalPorts: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                  >
                    <option value={2}>2 Port (1:2)</option>
                    <option value={4}>4 Port (1:4)</option>
                    <option value={8}>8 Port (1:8)</option>
                    <option value={16}>16 Port (1:16)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Redaman Input (dBm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={odpForm.opticalRxDb}
                    onChange={e => setOdpForm({ ...odpForm, opticalRxDb: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowOdpModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-md btn-solid-text-white active:scale-95"
                >
                  Simpan ODP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit ONU */}
      {showOnuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-400" />
                {editingOnuId ? 'Edit Registrasi Modem ONU' : 'Registrasi Modem ONU Pelanggan'}
              </h3>
              <button
                onClick={() => setShowOnuModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveONU} className="space-y-3.5 text-xs">
              {/* Pemilihan Pelanggan PPPoE atau Manual */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Nama Pelanggan (User PPPoE)</span>
                    <span className="text-blue-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {unassignedPppoeCustomers.length > 0 && (
                      <span className="text-[10px] bg-blue-500/15 text-white border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                        {unassignedPppoeCustomers.length} Belum Registrasi
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (onuInputMode === 'pppoe') {
                          setOnuInputMode('manual');
                          setOnuForm(prev => ({ ...prev, customerId: '', customerName: prev.customerName || '' }));
                        } else {
                          setOnuInputMode('pppoe');
                          if (unassignedPppoeCustomers.length > 0) {
                            const first = unassignedPppoeCustomers[0];
                            setOnuForm(prev => ({
                              ...prev,
                              customerId: first.id,
                              customerName: first.name,
                              macAddress: first.macAddress || prev.macAddress,
                              serialNumber: first.onuSerial || prev.serialNumber,
                            }));
                          }
                        }
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline transition-colors"
                    >
                      {onuInputMode === 'pppoe' ? 'Input Manual' : 'Pilih dari User PPPoE'}
                    </button>
                  </div>
                </div>

                {onuInputMode === 'pppoe' ? (
                  <div>
                    {unassignedPppoeCustomers.length === 0 && !selectedCustomer ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Semua User PPPoE Sudah Registrasi ONU</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Tidak ada akun PPPoE yang belum terpasang ONT. Anda dapat beralih ke mode{' '}
                            <button
                              type="button"
                              onClick={() => setOnuInputMode('manual')}
                              className="text-blue-400 underline font-bold"
                            >
                              Input Manual
                            </button>{' '}
                            atau daftarkan pelanggan PPPoE baru terlebih dahulu.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <select
                        required
                        value={onuForm.customerId || ''}
                        onChange={e => {
                          const custId = e.target.value;
                          if (!custId) {
                            setOnuForm(prev => ({ ...prev, customerId: '', customerName: '' }));
                            return;
                          }
                          const c = customers.find(item => item.id === custId);
                          if (c) {
                            setOnuForm(prev => ({
                              ...prev,
                              customerId: c.id,
                              customerName: c.name,
                              macAddress: c.macAddress || prev.macAddress,
                              serialNumber: c.onuSerial || prev.serialNumber,
                            }));
                          }
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">-- Pilih User PPPoE yang Belum Registrasi ({unassignedPppoeCustomers.length} Akun) --</option>
                        {/* Jika sedang edit dan ada customer terpilih yang tidak ada di unassigned */}
                        {editingOnuId && selectedCustomer && !unassignedPppoeCustomers.some(c => c.id === selectedCustomer.id) && (
                          <option key={selectedCustomer.id} value={selectedCustomer.id}>
                            {selectedCustomer.name} (PPPoE: @{selectedCustomer.username}) [Terpasang Saat Ini]
                          </option>
                        )}
                        {unassignedPppoeCustomers.map(c => {
                          const pkg = packages.find(p => p.id === c.packageId);
                          return (
                            <option key={c.id} value={c.id}>
                              {c.name} (@{c.username}) &bull; {pkg ? pkg.name : 'Paket Internet'} &bull; {c.ipAddress || 'Dynamic IP'}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    {/* Card Detail Pelanggan PPPoE Terpilih */}
                    {selectedCustomer && (
                      <div className="mt-2.5 p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{selectedCustomer.name}</span>
                            <span className="text-[10px] bg-blue-500/20 text-white font-mono px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                              PPPoE: @{selectedCustomer.username}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{selectedCustomer.phone}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-blue-500/20">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Alamat Pemasangan:</span>
                            <span className="text-slate-200 truncate block">{selectedCustomer.address || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Paket & Router NAS:</span>
                            <span className="text-blue-400 font-semibold block">
                              {selectedPkg?.name || 'Paket Internet'} &bull; {selectedNas?.name || 'MikroTik'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      value={onuForm.customerName}
                      onChange={e => setOnuForm({ ...onuForm, customerName: e.target.value, customerId: '' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                      placeholder="misal: Budi Santoso (Ketik manual)"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Mode input manual digunakan bila perangkat modem belum dihubungkan ke akun user PPPoE.
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Serial Number (SN)</label>
                  <input
                    type="text"
                    required
                    value={onuForm.serialNumber}
                    onChange={e => setOnuForm({ ...onuForm, serialNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold focus:border-blue-500 focus:outline-none"
                    placeholder="ZTEGC123456"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipe Modem</label>
                  <input
                    type="text"
                    required
                    value={onuForm.onuType}
                    onChange={e => setOnuForm({ ...onuForm, onuType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                    placeholder="misal: ZTE F609 / Huawei HG8245H5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MAC Address Modem</label>
                  <input
                    type="text"
                    value={onuForm.macAddress || ''}
                    onChange={e => setOnuForm({ ...onuForm, macAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 font-mono font-medium focus:border-blue-500 focus:outline-none"
                    placeholder="70:8B:CD:XX:XX:XX"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pilih Box ODP</label>
                  <select
                    value={onuForm.odpId}
                    onChange={e => setOnuForm({ ...onuForm, odpId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500 focus:outline-none"
                  >
                    {ftthODPs.map(odp => (
                      <option key={odp.id} value={odp.id}>{odp.name} ({odp.locationAddress})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Port ODP (#)</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={onuForm.odpPort || 1}
                    onChange={e => setOnuForm({ ...onuForm, odpPort: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rx Power (dBm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={onuForm.rxOpticalPower}
                    onChange={e => setOnuForm({ ...onuForm, rxOpticalPower: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowOnuModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-md btn-solid-text-white active:scale-95"
                >
                  Simpan ONU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
