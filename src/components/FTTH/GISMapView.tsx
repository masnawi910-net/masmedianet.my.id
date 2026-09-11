import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Search,
  Plus,
  Radio,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  Users,
  Compass,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Cable,
  Zap,
  Info,
  Home,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface MapNode {
  id: string;
  type: 'olt' | 'odp' | 'customer';
  name: string;
  x: number; // 0 - 1000 coordinate space
  y: number; // 0 - 600 coordinate space
  status: 'normal' | 'warning' | 'danger' | 'offline';
  data: any;
}

export const GISMapView: React.FC = () => {
  const {
    ftthOLTs,
    ftthODPs,
    ftthONUs,
    customers,
    fiberCables,
    addODP,
    addFiberCable,
    setActiveTab,
  } = useApp();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Layers filter
  const [showCables, setShowCables] = useState<boolean>(true);
  const [showCustomers, setShowCustomers] = useState<boolean>(true);
  const [showODPDetails, setShowODPDetails] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal Add ODP
  const [showAddODPModal, setShowAddODPModal] = useState<boolean>(false);
  const [newOdpName, setNewOdpName] = useState<string>('');
  const [newOdpLocation, setNewOdpLocation] = useState<string>('');
  const [newOdpCapacity, setNewOdpCapacity] = useState<number>(8);
  const [newOdpOltId, setNewOdpOltId] = useState<string>(ftthOLTs[0]?.id || '');

  // Pre-calculated node coordinates in 1000x650 viewport
  const nodes: MapNode[] = useMemo(() => {
    const list: MapNode[] = [];

    // OLT Nodes (Central NOCs)
    ftthOLTs.forEach((olt, idx) => {
      list.push({
        id: olt.id,
        type: 'olt',
        name: olt.name,
        x: 180 + idx * 320,
        y: 120 + idx * 30,
        status: olt.status === 'online' ? 'normal' : 'danger',
        data: olt,
      });
    });

    // ODP Nodes
    const odpPositions = [
      { x: 380, y: 220 },
      { x: 540, y: 320 },
      { x: 740, y: 240 },
      { x: 260, y: 440 },
      { x: 620, y: 500 },
    ];

    ftthODPs.forEach((odp, idx) => {
      const pos = odpPositions[idx % odpPositions.length];
      const isRedamanHigh = odp.opticalPowerDbm < -24;
      list.push({
        id: odp.id,
        type: 'odp',
        name: odp.name,
        x: pos.x,
        y: pos.y,
        status: isRedamanHigh ? 'warning' : 'normal',
        data: odp,
      });
    });

    // Customer Nodes (Surrounding ODPs)
    if (showCustomers) {
      customers.forEach((cust, idx) => {
        // Find associated ODP or assign nearby
        const matchedOdpIdx = idx % (ftthODPs.length || 1);
        const parentOdp = list.find(n => n.id === ftthODPs[matchedOdpIdx]?.id);
        const baseOdpX = parentOdp ? parentOdp.x : 400;
        const baseOdpY = parentOdp ? parentOdp.y : 300;

        const angle = (idx * (2 * Math.PI)) / Math.max(customers.length, 1);
        const radius = 65 + (idx % 3) * 25;
        const custX = Math.max(50, Math.min(950, baseOdpX + Math.cos(angle) * radius));
        const custY = Math.max(50, Math.min(600, baseOdpY + Math.sin(angle) * radius));

        let nodeStatus: 'normal' | 'warning' | 'danger' | 'offline' = 'normal';
        if (cust.status === 'isolated') nodeStatus = 'danger';
        else if (cust.status === 'overdue' || cust.status === 'due_soon') nodeStatus = 'warning';

        list.push({
          id: cust.id,
          type: 'customer',
          name: cust.name,
          x: custX,
          y: custY,
          status: nodeStatus,
          data: cust,
        });
      });
    }

    return list;
  }, [ftthOLTs, ftthODPs, customers, showCustomers]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'danger' && n.status !== 'danger') return false;
        if (filterStatus === 'warning' && n.status !== 'warning') return false;
        if (filterStatus === 'normal' && n.status !== 'normal') return false;
      }
      if (searchQuery) {
        return n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [nodes, filterStatus, searchQuery]);

  // Pan & Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    setSelectedCableId(null);
  };

  const handleCreateODP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOdpName.trim()) return;
    addODP({
      name: newOdpName,
      oltId: newOdpOltId,
      ponPort: 'PON 1',
      totalPorts: Number(newOdpCapacity),
      usedPorts: 0,
      location: newOdpLocation || 'Tiang Distribusi Baru',
      opticalPowerDbm: -18.5,
      splitterRatio: `1:${newOdpCapacity}`,
    });
    setNewOdpName('');
    setNewOdpLocation('');
    setShowAddODPModal(false);
  };

  return (
    <div className="space-y-5 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-md">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Peta Interaktif FTTH & GIS Network</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                Fiber Map
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualisasi topologi jalur kabel Fiber Optik, OLT ZTE Pusat, Splitter ODP, dan persebaran Rumah Pelanggan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddODPModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Titik ODP</span>
          </button>
        </div>
      </div>

      {/* Control Filters and Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">OLT Server Pusat</span>
            <div className="text-base font-bold text-white">{ftthOLTs.length} Unit</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Titik Kotak ODP</span>
            <div className="text-base font-bold text-white">{ftthODPs.length} Box</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Dropcore Pelanggan</span>
            <div className="text-base font-bold text-white">{customers.length} Rumah</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white">
            <Cable className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Total Jalur Fiber</span>
            <div className="text-base font-bold text-white">{fiberCables.length} Segmen</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Canvas (Left 3 Cols) */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col h-[640px]">
          {/* Overlay Map Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Search Bar in Map */}
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-2xl shadow-lg w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari OLT, ODP, atau pelanggan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white">
                  &times;
                </button>
              )}
            </div>

            {/* Quick Status Filters & Toggles */}
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-lg">
              <button
                onClick={() => setShowCables(!showCables)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  showCables ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilkan / Sembunyikan Garis Kabel"
              >
                Kabel FO
              </button>
              <button
                onClick={() => setShowCustomers(!showCustomers)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  showCustomers ? 'bg-blue-500/20 text-white border border-blue-500/30' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilkan / Sembunyikan Node Pelanggan"
              >
                Pelanggan
              </button>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-2 py-1 text-[11px] font-semibold bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="normal">Normal Sinyal</option>
                <option value="warning">Redaman Tinggi</option>
                <option value="danger">Terisolir / Putus</option>
              </select>
            </div>
          </div>

          {/* Map Controls (Zoom, Pan Reset) Bottom Left */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-lg">
            <button
              onClick={() => setZoom(prev => Math.min(2.5, prev + 0.2))}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Perbesar Peta (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Perkecil Peta (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-slate-700 mx-1" />
            <button
              onClick={resetView}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              title="Reset Tampilan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-2">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Map Legend (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-lg hidden sm:block text-[11px] space-y-1.5">
            <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" /> Legenda Peta
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" /> OLT Pusat (NOC)
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-teal-400 shadow-sm" /> ODP Splitter
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3.5 h-3.5 rounded-md bg-blue-500 flex items-center justify-center text-[9px] shadow-sm">🏠</span> Pelanggan Aktif (Rumah)
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-500 flex items-center justify-center text-[9px] shadow-sm">🏠</span> Redaman / Tagihan
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-500 flex items-center justify-center text-[9px] shadow-sm">🏠</span> Terisolir / Putus
            </div>
          </div>

          {/* SVG Interactive Topology Area */}
          <div
            className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              className="w-full h-full select-none transition-transform duration-75"
              viewBox="0 0 1000 650"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '500px 325px',
              }}
            >
              <defs>
                {/* Background Grid Pattern */}
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  <circle cx="0" cy="0" r="1.5" fill="#e2e8f0" />
                </pattern>

                {/* Glow Filter */}
                <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Canvas Background */}
              <rect width="1000" height="650" fill="url(#grid-pattern)" />

              {/* Area boundary markings */}
              <rect x="50" y="50" width="900" height="550" rx="30" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 6" />

              {/* 1. Draw Fiber Cable Lines (Backbone & Distribution) */}
              {showCables &&
                nodes.map((sourceNode, i) => {
                  if (sourceNode.type === 'olt') {
                    // Connect OLT to nearby ODPs
                    const odpChildren = nodes.filter(n => n.type === 'odp');
                    return odpChildren.map((odpNode, j) => {
                      const isHighAttn = odpNode.status === 'warning';
                      const strokeColor = isHighAttn ? '#fbbf24' : '#14b8a6';
                      return (
                        <g key={`cable-olt-${i}-${j}`}>
                          <path
                            d={`M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + odpNode.x) / 2} ${(sourceNode.y + odpNode.y) / 2 - 20} ${odpNode.x} ${odpNode.y}`}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="3"
                            strokeOpacity="0.7"
                            className="transition-all hover:stroke-white hover:stroke-width-4 cursor-pointer"
                          />
                          {/* Animated signal pulse along cable from OLT to ODP */}
                          <circle r="3.2" fill="#ffffff" filter="url(#glow-teal)">
                            <animateMotion
                              path={`M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + odpNode.x) / 2} ${(sourceNode.y + odpNode.y) / 2 - 20} ${odpNode.x} ${odpNode.y}`}
                              dur={`${2.8 + (j % 3) * 0.4}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        </g>
                      );
                    });
                  }
                  return null;
                })}

              {/* 2. Draw Dropcore Lines to Customers with Flowing Internet Packets */}
              {showCables &&
                showCustomers &&
                nodes
                  .filter(n => n.type === 'customer')
                  .map((custNode, k) => {
                    // Find closest ODP
                    const odpNodes = nodes.filter(n => n.type === 'odp');
                    let closestOdp = odpNodes[0];
                    let minDistance = 99999;
                    odpNodes.forEach(odp => {
                      const dist = Math.hypot(custNode.x - odp.x, custNode.y - odp.y);
                      if (dist < minDistance) {
                        minDistance = dist;
                        closestOdp = odp;
                      }
                    });

                    if (!closestOdp) return null;

                    let dropColor = '#3b82f6'; // Blue active
                    let packetColor = '#93c5fd'; // Bright light blue internet flow
                    const isIsolated = custNode.status === 'danger';
                    if (isIsolated) {
                      dropColor = '#f43f5e'; // Red isolated
                      packetColor = '#fda4af';
                    } else if (custNode.status === 'warning') {
                      dropColor = '#f59e0b'; // Amber overdue
                      packetColor = '#fde047';
                    }

                    const dropPath = `M ${closestOdp.x} ${closestOdp.y} L ${custNode.x} ${custNode.y}`;

                    return (
                      <g key={`dropcore-${k}`}>
                        {/* Dropcore physical line */}
                        <path
                          d={dropPath}
                          fill="none"
                          stroke={dropColor}
                          strokeWidth="1.5"
                          strokeDasharray={isIsolated ? '3 3' : 'none'}
                          strokeOpacity={isIsolated ? 0.4 : 0.65}
                        />

                        {/* Live Animated Internet Flow from ODP directly into Customer Home */}
                        {!isIsolated && (
                          <>
                            {/* Primary Internet Packet Flow */}
                            <circle r="2.4" fill={packetColor}>
                              <animateMotion
                                path={dropPath}
                                dur={`${1.6 + (k % 4) * 0.3}s`}
                                repeatCount="indefinite"
                              />
                            </circle>
                            {/* Secondary Flowing Pulse */}
                            <circle r="1.5" fill="#ffffff" opacity="0.85">
                              <animateMotion
                                path={dropPath}
                                dur={`${1.6 + (k % 4) * 0.3}s`}
                                begin={`${0.8 + (k % 4) * 0.15}s`}
                                repeatCount="indefinite"
                              />
                            </circle>
                          </>
                        )}
                      </g>
                    );
                  })}

              {/* 3. Render Nodes */}
              {filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;

                if (node.type === 'olt') {
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode(node)}
                    >
                      {/* Pulse Circle */}
                      <circle r="36" fill="#a855f7" fillOpacity="0.15" className="animate-ping" />
                      <circle
                        r="24"
                        fill="#7e22ce"
                        stroke={isSelected ? '#ffffff' : '#c084fc'}
                        strokeWidth={isSelected ? '3' : '2'}
                        filter="url(#glow-purple)"
                      />
                      {/* Icon */}
                      <text textAnchor="middle" dy="5" fill="#ffffff" fontSize="11" fontWeight="bold">
                        NOC
                      </text>
                      {/* Label */}
                      <rect x="-60" y="30" width="120" height="20" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#334155" strokeWidth="1" />
                      <text textAnchor="middle" y="44" fill="#ffffff" fontSize="10" fontWeight="bold">
                        {node.name}
                      </text>
                    </g>
                  );
                }

                if (node.type === 'odp') {
                  const isRedamanHigh = node.status === 'warning';
                  const fillColor = isRedamanHigh ? '#d97706' : '#0d9488';
                  const strokeColor = isSelected ? '#ffffff' : isRedamanHigh ? '#fbbf24' : '#2dd4bf';

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode(node)}
                    >
                      <circle
                        r="18"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? '3' : '2'}
                        filter="url(#glow-teal)"
                      />
                      <text textAnchor="middle" dy="4" fill="#ffffff" fontSize="9" fontWeight="bold">
                        ODP
                      </text>

                      {/* Details Box */}
                      {showODPDetails && (
                        <g transform="translate(0, 24)">
                          <rect x="-55" y="0" width="110" height="26" rx="6" fill="#0f172a" fillOpacity="0.95" stroke="#1e293b" strokeWidth="1" />
                          <text textAnchor="middle" y="11" fill="#f1f5f9" fontSize="9" fontWeight="bold">
                            {node.name.split(' ')[0]}
                          </text>
                          <text textAnchor="middle" y="21" fill={isRedamanHigh ? '#fbbf24' : '#5eead4'} fontSize="8" fontFamily="monospace">
                            {node.data?.opticalPowerDbm || -19.5} dBm ({node.data?.usedPorts || 4}/{node.data?.totalPorts || 8})
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }

                // Customer Node (House / Rumah Icon)
                if (node.type === 'customer') {
                  let custFill = '#2563eb'; // Blue active
                  let custStroke = '#60a5fa';
                  if (node.status === 'danger') {
                    custFill = '#be123c';
                    custStroke = '#fb7185';
                  } else if (node.status === 'warning') {
                    custFill = '#b45309';
                    custStroke = '#fcd34d';
                  }

                  const radius = isSelected ? 13 : 10;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode(node)}
                    >
                      {/* Active Wi-Fi / Online Aura */}
                      {node.status === 'normal' && (
                        <circle r={radius + 5} fill="#10b981" fillOpacity="0.18" className="animate-pulse" />
                      )}

                      {/* House Circle Badge */}
                      <circle
                        r={radius}
                        fill={custFill}
                        stroke={isSelected ? '#ffffff' : custStroke}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="transition-all group-hover:scale-110"
                      />

                      {/* Icon Rumah (Crisp SVG House Path) */}
                      <path
                        d="M -5 1 L 0 -4 L 5 1 V 5 H 2 V 2 H -2 V 5 H -5 Z"
                        fill="#ffffff"
                        className="pointer-events-none"
                      />

                      {/* Hover Name Label */}
                      <g transform="translate(0, 16)" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                        <rect x="-55" y="0" width="110" height="18" rx="5" fill="#020617" fillOpacity="0.95" stroke="#334155" strokeWidth="0.8" />
                        <text textAnchor="middle" y="12" fill="#f8fafc" fontSize="8.5" fontWeight="bold">
                          🏠 {node.name.slice(0, 15)}
                        </text>
                      </g>
                    </g>
                  );
                }

                return null;
              })}
            </svg>
          </div>
        </div>

        {/* Node Detail & Diagnostic Sidebar (Right 1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 h-[640px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white ${
                      selectedNode.type === 'olt'
                        ? 'bg-purple-600'
                        : selectedNode.type === 'odp'
                        ? 'bg-teal-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    {selectedNode.type === 'olt' ? <Server className="w-4 h-4" /> : selectedNode.type === 'odp' ? <Radio className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{selectedNode.name}</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      {selectedNode.type === 'customer' ? 'RUMAH PELANGGAN' : selectedNode.type.toUpperCase()} &bull; ID: {selectedNode.id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  &times;
                </button>
              </div>

              {/* Conditional Node Details */}
              {selectedNode.type === 'olt' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model OLT:</span>
                      <span className="text-white font-bold">{selectedNode.data.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IP Address:</span>
                      <span className="text-blue-400 font-mono">{selectedNode.data.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total PON Port:</span>
                      <span className="text-white font-bold">{selectedNode.data.totalPonPorts} Port (GPON)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ONU Terdaftar:</span>
                      <span className="text-white font-bold">{selectedNode.data.connectedOnus} Perangkat</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uplink Speed:</span>
                      <span className="text-teal-400 font-bold">{selectedNode.data.uplinkPort}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('ftth')}
                    className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Buka Manajemen OLT ZTE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {selectedNode.type === 'odp' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lokasi / Tiang:</span>
                      <span className="text-white font-medium">{selectedNode.data.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Splitter Ratio:</span>
                      <span className="text-teal-400 font-bold">{selectedNode.data.splitterRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Port Terpakai:</span>
                      <span className="text-white font-bold">
                        {selectedNode.data.usedPorts} / {selectedNode.data.totalPorts} Port
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Redaman Optik:</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          selectedNode.data.opticalPowerDbm < -24
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-white'
                        }`}
                      >
                        {selectedNode.data.opticalPowerDbm} dBm
                      </span>
                    </div>
                  </div>

                  {/* Connected Customers in this ODP */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pelanggan Terhubung ke Box Ini:
                    </span>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {customers.slice(0, 4).map((c, idx) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800"
                        >
                          <div>
                            <div className="font-bold text-white text-[11px]">{c.name}</div>
                            <div className="text-[10px] text-slate-400">Port #{idx + 1} &bull; {c.ipAddress}</div>
                          </div>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              c.status === 'active' ? 'bg-blue-400' : 'bg-rose-400'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('ftth')}
                    className="w-full py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Kelola Port ODP</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {selectedNode.type === 'customer' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ID Pelanggan:</span>
                      <span className="text-white font-mono font-bold">{selectedNode.data.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Alamat Rumah:</span>
                      <span className="text-white font-medium">{selectedNode.data.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nomor WhatsApp:</span>
                      <span className="text-blue-400 font-mono">{selectedNode.data.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status Layanan:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                          selectedNode.data.status === 'active'
                            ? 'bg-blue-500/20 text-white'
                            : selectedNode.data.status === 'isolated'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {selectedNode.data.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IP Radius:</span>
                      <span className="text-cyan-400 font-mono">{selectedNode.data.ipAddress}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveTab('tr069')}
                      className="py-2 bg-blue-600/20 hover:bg-blue-600/30 text-white border border-blue-500/30 rounded-xl font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Remote ONT</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('helpdesk')}
                      className="py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Buat Tiket</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <MapPin className="w-6 h-6 text-teal-400 animate-bounce" />
              </div>
              <h4 className="text-sm font-bold text-white">Pilih Titik di Peta</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Klik ikon <b className="text-purple-300">OLT Pusat</b>, <b className="text-teal-300">Kotak ODP</b>, atau <b className="text-blue-300">Rumah Pelanggan</b> di peta untuk memeriksa redaman dBm, status sinyal optik, dan diagnostik kabel secara live.
              </p>
            </div>
          )}

          {/* Quick Help Footer */}
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <span>
              Tip: Anda dapat menggeser peta (*drag & pan*) dan menggunakan scroll mouse untuk memperbesar detail topologi.
            </span>
          </div>
        </div>
      </div>

      {/* Modal Add ODP */}
      {showAddODPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Tambah Titik ODP Baru</h3>
              </div>
              <button
                onClick={() => setShowAddODPModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateODP} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Kotak ODP</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ODP-RW06-E (Tiang 32)"
                  value={newOdpName}
                  onChange={e => setNewOdpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lokasi Tiang / Patokan</label>
                <input
                  type="text"
                  placeholder="Contoh: Depan Pos Kamling RT 03/RW 06"
                  value={newOdpLocation}
                  onChange={e => setNewOdpLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kapasitas Port</label>
                  <select
                    value={newOdpCapacity}
                    onChange={e => setNewOdpCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value={2}>2 Port (Splitter 1:2)</option>
                    <option value={4}>4 Port (Splitter 1:4)</option>
                    <option value={8}>8 Port (Splitter 1:8)</option>
                    <option value={16}>16 Port (Splitter 1:16)</option>
                    <option value={24}>24 Port (Splitter 1:24)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Uplink OLT</label>
                  <select
                    value={newOdpOltId}
                    onChange={e => setNewOdpOltId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {ftthOLTs.map(olt => (
                      <option key={olt.id} value={olt.id}>
                        {olt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddODPModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-600/20"
                >
                  Simpan Titik ODP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
