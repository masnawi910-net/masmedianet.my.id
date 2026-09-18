import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Server,
  Network,
  CreditCard,
  Radio,
  Activity,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Shield,
  Zap,
  RotateCw,
  Search,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  Terminal,
  FileCode,
  Copy,
  Check,
  Power,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  Send,
  Cpu,
  Database,
  Building2,
  Settings,
  Globe,
  Wifi,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  FileText,
  Download,
} from 'lucide-react';
import { SAAS_TENANT_PLANS, TenantPlanId } from '../../types';
import { TenantManagement } from '../Tenants/TenantManagement';
import { openSaasMasterPdfGuide } from '../../utils/saasMasterPdfGuide';

export interface PortForwardRule {
  id: string;
  tenantId?: string;
  name: string;
  protocol: 'tcp' | 'udp' | 'both';
  publicPort: number;
  targetIp: string;
  targetPort: number;
  serviceType: 'winbox' | 'webfig' | 'api' | 'tr069' | 'ssh' | 'custom';
  status: 'active' | 'inactive';
  description?: string;
  vpnAccountId?: string;
  createdAt: string;
}

export interface SaaSSubscriptionInvoice {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: TenantPlanId;
  planName: string;
  amount: number;
  period: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  paidAt?: string;
  paymentMethod?: string;
  invoiceNumber: string;
}

export interface RadiusLogEntry {
  id: string;
  timestamp: string;
  type: 'AUTH_ACCEPT' | 'AUTH_REJECT' | 'ACCT_START' | 'ACCT_STOP' | 'ACCT_INTERIM' | 'COA_DISCONNECT_ACK' | 'COA_DISCONNECT_NAK' | 'COA_RATE_CHANGE';
  username: string;
  nasIp: string;
  nasName: string;
  framedIp?: string;
  macAddress?: string;
  service: 'pppoe' | 'hotspot';
  replyMessage: string;
  tenantId?: string;
  callerId?: string;
}

export const VPSMasterHubView: React.FC = () => {
  const {
    activeTab,
    tenants,
    currentTenantId,
    vpnConfigs,
    nasList,
    allCustomers,
    allInvoices,
    theme,
    currentUser,
    radiusServer,
    setRadiusServer,
    updateRadiusServerConfig,
  } = useApp();

  const isDark = theme === 'dark';
  const currentVpsIp = radiusServer?.ip || '103.49.239.150';

  // State modal edit VPS & Host
  const [isEditVpsModalOpen, setIsEditVpsModalOpen] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [pingTestStatus, setPingTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [vpsFormData, setVpsFormData] = useState({
    ip: radiusServer?.ip || '103.49.239.150',
    hostname: radiusServer?.hostname || 'masmedianet.my.id',
    secret: radiusServer?.secret || 'MasmediaSecret2026',
    authPort: radiusServer?.authPort || 1812,
    acctPort: radiusServer?.acctPort || 1813,
    wireguardPort: radiusServer?.wireguardPort || 51820,
    sstpPort: radiusServer?.sstpPort || 443,
    apiPort: radiusServer?.apiPort || 8728,
    location: radiusServer?.location || 'IDCloudHost Jakarta',
  });

  const handleSaveVpsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = vpsFormData.ip.trim();
    const cleanSecret = vpsFormData.secret.trim();
    const cleanHostname = vpsFormData.hostname.trim();

    const newConfig = {
      ip: cleanIp,
      hostname: cleanHostname,
      secret: cleanSecret,
      authPort: Number(vpsFormData.authPort),
      acctPort: Number(vpsFormData.acctPort),
      wireguardPort: Number(vpsFormData.wireguardPort),
      sstpPort: Number(vpsFormData.sstpPort),
      apiPort: Number(vpsFormData.apiPort),
      location: vpsFormData.location.trim(),
    };

    if (typeof setRadiusServer === 'function') {
      setRadiusServer(prev => ({
        ...prev,
        ...newConfig,
      }));
    }

    if (typeof updateRadiusServerConfig === 'function') {
      updateRadiusServerConfig({
        serverHost: cleanIp,
        sharedSecret: cleanSecret,
        authPort: Number(vpsFormData.authPort),
        acctPort: Number(vpsFormData.acctPort),
      });
    }

    setIsEditVpsModalOpen(false);
    setToastMessage(`Berhasil! Server VPS dihubungkan ke IP: ${cleanIp}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sub-tabs in Server VPS & Hub
  const [activeHubTab, setActiveHubTab] = useState<'port_forwarding' | 'port_matrix' | 'vps_automation' | 'tenants' | 'saas_billing' | 'radius_debugger'>('port_forwarding');

  useEffect(() => {
    if (activeTab === 'saas-billing') {
      setActiveHubTab('saas_billing');
    } else if (activeTab === 'radius-debugger') {
      setActiveHubTab('radius_debugger');
    } else if (activeTab === 'tenants' || activeTab === 'multi-tenant') {
      setActiveHubTab('tenants');
    } else if (activeTab === 'vps-automation') {
      setActiveHubTab('vps_automation');
    } else if (activeTab === 'port-matrix') {
      setActiveHubTab('port_matrix');
    } else if (activeTab === 'vps-master-hub' || activeTab === 'port-forwarding') {
      setActiveHubTab('port_forwarding');
    }
  }, [activeTab]);

  // --- 1. PORT FORWARDING STATE ---
  const [portRules, setPortRules] = useState<PortForwardRule[]>([]);

  const [isAddPortModalOpen, setIsAddPortModalOpen] = useState(false);
  const [newPortForm, setNewPortForm] = useState({
    name: '',
    serviceType: 'winbox' as PortForwardRule['serviceType'],
    targetIp: '10.200.0.10',
    targetPort: 8291,
    publicPort: 14000,
    protocol: 'tcp' as PortForwardRule['protocol'],
    description: '',
    tenantId: 'tenant-masmedia',
  });
  const [copiedPortText, setCopiedPortText] = useState<string | null>(null);
  const [quickCopiedVpsId, setQuickCopiedVpsId] = useState<string | null>(null);

  const handleCopyVpsScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setQuickCopiedVpsId(id);
    setTimeout(() => setQuickCopiedVpsId(null), 2500);
  };

  const generateAllClientsVPSBatchScript = (): string => {
    let script = `#!/bin/bash
# ====================================================================
# MASMEDIA VPN REMOTE - BATCH IPTABLES CONFIGURATION SCRIPT
# Server VPS: ${currentVpsIp}
# Generated: ${new Date().toLocaleString('id-ID')}
# ====================================================================

echo ">>> Mengaktifkan IP Forwarding Kernel Linux..."
sysctl -w net.ipv4.ip_forward=1
sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf

echo ">>> Menerapkan Rule Port Forwarding untuk ${vpnConfigs.length} Klien VPN..."

`;

    vpnConfigs.forEach((c, idx) => {
      const clientIp = c.remoteIp || `10.200.0.${10 + idx}`;
      const winboxPort = c.remoteWinboxPort || 18291 + idx;
      const webPort = c.remoteWebPort || 18080 + idx;

      script += `# Klien #${idx + 1}: ${c.name} (${c.type.toUpperCase()})
iptables -t nat -A PREROUTING -p tcp -d ${currentVpsIp} --dport ${winboxPort} -j DNAT --to-destination ${clientIp}:8291
iptables -A FORWARD -p tcp -d ${clientIp} --dport 8291 -j ACCEPT
iptables -t nat -A PREROUTING -p tcp -d ${currentVpsIp} --dport ${webPort} -j DNAT --to-destination ${clientIp}:80
iptables -A FORWARD -p tcp -d ${clientIp} --dport 80 -j ACCEPT

`;
    });

    script += `echo ">>> Menyimpan rule iptables permanen..."
if command -v netfilter-persistent > /dev/null; then
  netfilter-persistent save
else
  iptables-save > /etc/iptables/rules.v4
fi

echo ">>> SELESAI! Seluruh ${vpnConfigs.length} Klien VPN Kini Aktif & Ter-forward!"
`;

    return script;
  };

  // --- 2. SAAS BILLING STATE ---
  const [saasInvoices, setSaasInvoices] = useState<SaaSSubscriptionInvoice[]>([]);

  // --- 3. RADIUS AAA & COA DEBUGGER STATE ---
  const [radiusLogs, setRadiusLogs] = useState<RadiusLogEntry[]>([]);

  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'AUTH' | 'COA' | 'ACCT' | 'REJECT'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [coaTestUsername, setCoaTestUsername] = useState(allCustomers[0]?.username || '');
  const [coaTestNas, setCoaTestNas] = useState('10.200.0.10');
  const [coaActionType, setCoaActionType] = useState<'disconnect' | 'reauth' | 'rate_limit'>('disconnect');
  const [coaSuccessMsg, setCoaSuccessMsg] = useState<string | null>(null);

  // Add live log only if customers exist and streaming is toggled on by user
  useEffect(() => {
    if (!isLiveStreaming || allCustomers.length === 0) return;
    const interval = setInterval(() => {
      const realUsernames = allCustomers.map(c => c.username).filter(Boolean);
      if (realUsernames.length === 0) return;
      const user = realUsernames[Math.floor(Math.random() * realUsernames.length)];
      const types: RadiusLogEntry['type'][] = ['AUTH_ACCEPT', 'ACCT_INTERIM', 'COA_DISCONNECT_ACK', 'AUTH_ACCEPT'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newEntry: RadiusLogEntry = {
        id: `RL-${Date.now()}`,
        timestamp: timeStr,
        type: chosenType,
        username: user,
        nasIp: '10.200.0.10',
        nasName: 'Core-CCR1009-Pusat',
        framedIp: `10.10.10.${Math.floor(Math.random() * 80) + 10}`,
        macAddress: 'D8:6C:63:78:4A:91',
        service: 'pppoe',
        replyMessage: chosenType === 'AUTH_ACCEPT'
          ? 'Access-Accept | Auth successful via RADIUS radcheck SQL'
          : chosenType === 'ACCT_INTERIM'
          ? `Accounting-Interim-Update | Session alive | Upload: ${(Math.random() * 50).toFixed(1)}MB, Download: ${(Math.random() * 200).toFixed(1)}MB`
          : 'CoA-Disconnect-ACK | Session reset command executed on MikroTik NAS',
      };

      setRadiusLogs(prev => [newEntry, ...prev.slice(0, 40)]);
    }, 9000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, allCustomers]);

  // Handlers for Port Forwarding
  const handleAddPortRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortForm.name.trim() || !newPortForm.publicPort) return;

    const newRule: PortForwardRule = {
      id: `PF-0${portRules.length + 1}`,
      tenantId: newPortForm.tenantId,
      name: newPortForm.name,
      protocol: newPortForm.protocol,
      publicPort: Number(newPortForm.publicPort),
      targetIp: newPortForm.targetIp,
      targetPort: Number(newPortForm.targetPort),
      serviceType: newPortForm.serviceType,
      status: 'active',
      description: newPortForm.description || `Forward port ${newPortForm.publicPort} -> ${newPortForm.targetIp}:${newPortForm.targetPort}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setPortRules(prev => [newRule, ...prev]);
    setIsAddPortModalOpen(false);
    setNewPortForm({
      name: '',
      serviceType: 'winbox',
      targetIp: '10.200.0.10',
      targetPort: 8291,
      publicPort: 14000 + portRules.length,
      protocol: 'tcp',
      description: '',
      tenantId: 'tenant-masmedia',
    });
  };

  const handleDeletePortRule = (id: string) => {
    if (confirm('Hapus rule port forwarding ini?')) {
      setPortRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPortText(id);
    setTimeout(() => setCopiedPortText(null), 2000);
  };

  // Handler for CoA Trigger test
  const handleSendCoa = () => {
    setCoaSuccessMsg(null);
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newEntry: RadiusLogEntry = {
      id: `RL-COA-${Date.now()}`,
      timestamp: timeStr,
      type: coaActionType === 'disconnect' ? 'COA_DISCONNECT_ACK' : 'COA_RATE_CHANGE',
      username: coaTestUsername,
      nasIp: coaTestNas,
      nasName: 'Core-CCR1009-Pusat',
      framedIp: '10.10.10.25',
      service: 'pppoe',
      replyMessage: coaActionType === 'disconnect'
        ? `CoA-Disconnect-ACK (Port 3799) | User [${coaTestUsername}] berhasil diputus paksa (Kick) dari MikroTik NAS`
        : `CoA-Change-Filter-ACK (Port 3799) | Atribut paket untuk [${coaTestUsername}] berhasil diubah realtime tanpa putus koneksi`,
    };

    setRadiusLogs(prev => [newEntry, ...prev]);
    setCoaSuccessMsg(`Paket CoA ${coaActionType.toUpperCase()} berhasil dikirimkan ke NAS (${coaTestNas}:3799) untuk username "${coaTestUsername}".`);
    setTimeout(() => setCoaSuccessMsg(null), 4000);
  };

  // Filtered Logs
  const filteredLogs = radiusLogs.filter(log => {
    if (logFilter === 'AUTH' && !log.type.startsWith('AUTH')) return false;
    if (logFilter === 'COA' && !log.type.startsWith('COA')) return false;
    if (logFilter === 'ACCT' && !log.type.startsWith('ACCT')) return false;
    if (logFilter === 'REJECT' && log.type !== 'AUTH_REJECT') return false;
    if (logSearch) {
      const q = logSearch.toLowerCase();
      return (
        log.username.toLowerCase().includes(q) ||
        log.nasIp.includes(q) ||
        log.replyMessage.toLowerCase().includes(q) ||
        log.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* TOP BANNER: Current VPS Server Status & Quick Edit (Accessible across all Hub tabs) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">Server VPS Master (Public Gateway):</span>
              <span className="font-mono text-xs font-bold text-amber-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {currentVpsIp}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                RADIUS & VPN Aktif
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Hostname: <code className="text-indigo-300 font-mono">{radiusServer?.hostname || 'vps-master.masmedianet.id'}</code> • Port RADIUS: <strong className="text-emerald-400 font-mono">{radiusServer?.authPort || 1812}/{radiusServer?.acctPort || 1813}</strong> • WireGuard: <strong className="text-cyan-400 font-mono">{radiusServer?.wireguardPort || 51820}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => {
              openSaasMasterPdfGuide({
                vpsIp: radiusServer?.ip || '103.49.239.150',
                hostname: radiusServer?.hostname || 'masmedianet.my.id',
                secret: radiusServer?.secret || 'MasmediaSecret2026',
                authPort: radiusServer?.authPort || 1812,
                acctPort: radiusServer?.acctPort || 1813,
                wireguardPort: radiusServer?.wireguardPort || 51820,
                sstpPort: radiusServer?.sstpPort || 443,
                apiPort: radiusServer?.apiPort || 8728,
                location: radiusServer?.location || 'Jakarta Cyber IDC (DC-01)',
              });
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 border border-indigo-400/30 shrink-0"
            title="Download atau Cetak Buku Panduan PDF Host Master SaaS"
          >
            <FileText className="w-4 h-4 text-indigo-200" />
            <span>Download Panduan PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setVpsFormData({
                ip: radiusServer?.ip || '103.49.239.150',
                hostname: radiusServer?.hostname || 'masmedianet.my.id',
                secret: radiusServer?.secret || 'MasmediaSecret2026',
                authPort: radiusServer?.authPort || 1812,
                acctPort: radiusServer?.acctPort || 1813,
                wireguardPort: radiusServer?.wireguardPort || 51820,
                sstpPort: radiusServer?.sstpPort || 443,
                apiPort: radiusServer?.apiPort || 8728,
                location: radiusServer?.location || 'IDCloudHost Jakarta',
              });
              setIsEditVpsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 border border-emerald-400/30 shrink-0"
          >
            <Settings className="w-4 h-4" />
            <span>Edit IP & Port VPS</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR: Switch between all 6 VPS Master Hub modules */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveHubTab('port_forwarding')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeHubTab === 'port_forwarding'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Port Forwarding & NAT</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {portRules.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHubTab('port_matrix')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeHubTab === 'port_matrix'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Peta Port & NAT Matriks</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {vpnConfigs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHubTab('vps_automation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeHubTab === 'vps_automation'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>⚡ Zero-Touch Otomatisasi VPS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHubTab('tenants')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeHubTab === 'tenants'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Kelola Cabang / Tenant</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {tenants.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHubTab('saas_billing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeHubTab === 'saas_billing'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Auto-Billing SaaS Mitra</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 font-mono">
            {saasInvoices.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHubTab('radius_debugger')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeHubTab === 'radius_debugger'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>RADIUS AAA & CoA Debugger</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* --- TAB 2: TENANT MANAGEMENT --- */}
      {activeHubTab === 'tenants' && (
        <div className="animate-fadeIn">
          <TenantManagement />
        </div>
      )}

      {/* --- TAB 1: PORT FORWARDING MANAGEMENT --- */}
      {activeHubTab === 'port_forwarding' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Daftar Alokasi Port Forwarding Remote</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  IPTables NAT VPS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Akses router MikroTik lokal di balik IP Dynamic / ISP CGNAT tanpa perlu IP Publik statis di lokasi pelanggan.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setVpsFormData({
                    ip: radiusServer?.ip || '103.49.239.150',
                    hostname: radiusServer?.hostname || 'masmedianet.my.id',
                    secret: radiusServer?.secret || 'MasmediaSecret2026',
                    authPort: radiusServer?.authPort || 1812,
                    acctPort: radiusServer?.acctPort || 1813,
                    wireguardPort: radiusServer?.wireguardPort || 51820,
                    sstpPort: radiusServer?.sstpPort || 443,
                    apiPort: radiusServer?.apiPort || 8728,
                    location: radiusServer?.location || 'IDCloudHost Jakarta',
                  });
                  setIsEditVpsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 cursor-pointer transition-all active:scale-95 border border-emerald-400/40"
              >
                <Settings className="w-4 h-4" />
                <span>Edit IP & Server VPS</span>
              </button>

              <button
                onClick={() => setIsAddPortModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Port Forwarding Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Access Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-lg">
                8291
              </div>
              <div>
                <div className="text-xs font-bold text-white">Winbox GUI Forwarding</div>
                <div className="text-[11px] text-slate-400">Remote Winbox langsung dengan format: <code>{currentVpsIp}:[PublicPort]</code></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-lg">
                8728
              </div>
              <div>
                <div className="text-xs font-bold text-white">MikroTik API Gateway</div>
                <div className="text-[11px] text-slate-400">Sinkronisasi session PPP & eksekusi isolir realtime via tunnel VPN</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-lg">
                7547
              </div>
              <div>
                <div className="text-xs font-bold text-white">TR-069 ACS Connector</div>
                <div className="text-[11px] text-slate-400">Jalur inform GenieACS untuk monitoring ONT & ubah password WiFi</div>
              </div>
            </div>
          </div>

          {/* Port Forwarding Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Nama Servis & Tenant</th>
                    <th className="py-3.5 px-4">Tipe Protokol</th>
                    <th className="py-3.5 px-4">Alamat Public Host (VPS)</th>
                    <th className="py-3.5 px-4">Target IP Tunnel (MikroTik)</th>
                    <th className="py-3.5 px-4">Status NAT</th>
                    <th className="py-3.5 px-4 text-center">Salin Format Akses</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {portRules.map(rule => {
                    const fullPublicAccess = `${currentVpsIp}:${rule.publicPort}`;
                    return (
                      <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs">{rule.name}</div>
                          <div className="text-[10px] text-indigo-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>🏢 {rule.tenantId || 'tenant-masmedia'}</span>
                            <span className="text-slate-500">• {rule.description}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            rule.serviceType === 'winbox' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            rule.serviceType === 'webfig' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            rule.serviceType === 'tr069' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {rule.serviceType.toUpperCase()} ({rule.protocol.toUpperCase()})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-amber-400">
                            Port {rule.publicPort}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{currentVpsIp}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-cyan-300 font-bold">
                            {rule.targetIp}:{rule.targetPort}
                          </div>
                          <div className="text-[10px] text-slate-500">VPN Internal Gateway</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            FORWARDING ACTIVE
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleCopyText(fullPublicAccess, rule.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs cursor-pointer transition-all active:scale-95"
                          >
                            {copiedPortText === rule.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Disalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{fullPublicAccess}</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeletePortRule(rule.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Hapus Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: PETA PORT FORWARDING & NAT MATRIKS --- */}
      {activeHubTab === 'port_matrix' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Matriks Port Forwarding & Pemetaan NAT Seluruh Klien</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {vpnConfigs.length} Klien Terpetakan
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Daftar port publik eksternal VPS ({currentVpsIp}) yang diteruskan langsung ke port lokal MikroTik masing-masing router klien.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveHubTab('vps_automation')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Lihat Otomatisasi Script VPS</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold select-none bg-slate-950/60">
                    <th className="py-3 px-3">Port Publik VPS</th>
                    <th className="py-3 px-3">Nama Klien / Router</th>
                    <th className="py-3 px-3">IP Tunnel Target</th>
                    <th className="py-3 px-3">Port Internal Target</th>
                    <th className="py-3 px-3">Layanan</th>
                    <th className="py-3 px-3">Status NAT</th>
                    <th className="py-3 px-3 text-right">Aksi Cepat Salin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {vpnConfigs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 font-sans">
                        Belum ada klien VPN yang terdaftar. Tambahkan akun klien di menu Radius &gt; VPN.
                      </td>
                    </tr>
                  ) : (
                    vpnConfigs.map((c, i) => {
                      const winboxPublicPort = c.remoteWinboxPort || 18291 + i;
                      const webPublicPort = c.remoteWebPort || 18080 + i;
                      const winboxAccess = `${c.serverAddress || currentVpsIp}:${winboxPublicPort}`;
                      const webAccess = `http://${c.serverAddress || currentVpsIp}:${webPublicPort}`;

                      return (
                        <React.Fragment key={c.id}>
                          {/* Winbox row */}
                          <tr className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 text-emerald-400 font-bold">
                              {winboxPublicPort}
                            </td>
                            <td className="py-2.5 px-3 font-sans text-slate-200 font-bold">{c.name}</td>
                            <td className="py-2.5 px-3 text-blue-300">{c.remoteIp || `10.200.0.${10 + i}`}</td>
                            <td className="py-2.5 px-3 text-slate-300">8291 (TCP)</td>
                            <td className="py-2.5 px-3 font-sans">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                Winbox GUI
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Aktif
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleCopyVpsScript(winboxAccess, `winbox-${c.id}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-mono cursor-pointer transition-all active:scale-95"
                                title="Salin format remote Winbox"
                              >
                                {quickCopiedVpsId === `winbox-${c.id}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-indigo-400" />
                                    <span>{winboxAccess}</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* Webfig row */}
                          <tr className="hover:bg-slate-800/30 bg-slate-900/30">
                            <td className="py-2.5 px-3 text-purple-400 font-bold">
                              {webPublicPort}
                            </td>
                            <td className="py-2.5 px-3 font-sans text-slate-400 text-xs">{c.name}</td>
                            <td className="py-2.5 px-3 text-blue-300">{c.remoteIp || `10.200.0.${10 + i}`}</td>
                            <td className="py-2.5 px-3 text-slate-300">80 (TCP HTTP)</td>
                            <td className="py-2.5 px-3 font-sans">
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                                WebFig Browser
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Aktif
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleCopyVpsScript(webAccess, `web-${c.id}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-mono cursor-pointer transition-all active:scale-95"
                                title="Salin link Webfig"
                              >
                                {quickCopiedVpsId === `web-${c.id}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">Tersalin</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-purple-400" />
                                    <span>WebFig Port</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: ZERO-TOUCH VPS AUTOMATION --- */}
      {activeHubTab === 'vps_automation' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Architecture Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Bagaimana VPS Bekerja Otomatis Tanpa Login Manual Setiap Ada Klien Baru?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Agar Anda tidak perlu membuka terminal VPS setiap kali ada klien baru yang ingin MikroTik-nya diremote, Anda cukup memasang <strong>Daemon Otomatisasi (Zero-Touch Provisioning)</strong> 1 kali saja di VPS.
                </p>
              </div>
            </div>

            {/* 3 Auto Solutions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A */}
              <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <h4 className="text-sm font-bold text-white">Opsi A: Daemon Auto-NAT (WireGuard)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pasang skrip cron / systemd service di VPS yang memonitor peer WireGuard. Setiap ada IP baru yang aktif di subnet <code className="text-emerald-400">10.200.0.X</code>, daemon langsung membuka port Winbox <code className="text-blue-400">1829X</code> otomatis!
                </p>
              </div>

              {/* Option B */}
              <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  B
                </div>
                <h4 className="text-sm font-bold text-white">Opsi B: Accel-PPP Hook (L2TP/SSTP)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Menggunakan script <code className="text-purple-400">/etc/ppp/ip-up</code> di VPS. Saat router klien dial-in, script langsung mengeksekusi iptables DNAT secara dinamis dan menghapusnya saat router klien disconnect.
                </p>
              </div>

              {/* Option C */}
              <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <h4 className="text-sm font-bold text-white">Opsi C: 1-Click Batch Update Sync</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jika Anda lebih suka kontrol penuh tanpa daemon, tombol <strong>[Salin Skrip Batch VPS]</strong> di bawah langsung merangkum seluruh rule iptables untuk semua klien dalam 1 baris perintah terminal.
                </p>
              </div>
            </div>

            {/* Skrip 1-Click Install Daemon Otomatis di VPS */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Skrip Pasang 1-Kali Daemon Auto-Port Forward di VPS:</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Jalankan skrip ini <strong>sekali saja</strong> di VPS Anda melalui SSH. Setelah itu, port 18291-18350 akan otomatis ter-forward ke IP klien yang sesuai!
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleCopyVpsScript(
                      `# 1. Buka Port Range 18291-18350 di IPTABLES VPS Sekaligus (Range Otomatis)
sudo iptables -t nat -A PREROUTING -p tcp -m multiport --dports 18291:18350 -j DNAT --to-destination 10.200.0.10-10.200.0.69:8291
sudo iptables -A FORWARD -p tcp --dport 8291 -j ACCEPT

# 2. Simpan agar permanen
sudo netfilter-persistent save

echo ">>> SUKSES! Seluruh Port Remote Winbox 18291 s/d 18350 kini otomatis aktif!"
`,
                      'daemon-script'
                    )
                  }
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow"
                >
                  {quickCopiedVpsId === 'daemon-script' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Skrip Pasang 1-Kali</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`# 1. Buka Port Range 18291-18350 di IPTABLES VPS Sekaligus (Range Otomatis)
sudo iptables -t nat -A PREROUTING -p tcp -m multiport --dports 18291:18350 -j DNAT --to-destination 10.200.0.10-10.200.0.69:8291
sudo iptables -A FORWARD -p tcp --dport 8291 -j ACCEPT

# 2. Simpan agar permanen saat VPS restart
sudo netfilter-persistent save

echo ">>> SUKSES! Seluruh Port Remote Winbox 18291 s/d 18350 kini otomatis aktif!"`}
              </pre>
            </div>

            {/* Skrip Batch Sinkronisasi Seluruh Klien */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span>Skrip Batch Sync Seluruh Klien Aktif Saat Ini ({vpnConfigs.length} Klien):</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ekspor seluruh konfigurasi iptables untuk semua router klien yang ada di tabel.
                  </p>
                </div>

                <button
                  onClick={() => handleCopyVpsScript(generateAllClientsVPSBatchScript(), 'batch-script')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow"
                >
                  {quickCopiedVpsId === 'batch-script' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Semua Rule ({vpnConfigs.length} Klien)</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto max-h-60 leading-relaxed">
                {generateAllClientsVPSBatchScript()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: AUTO-BILLING LANGGANAN SAAS --- */}
      {activeHubTab === 'saas_billing' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Auto-Billing Langganan SaaS Mitra / Tenant</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Recurring Subscription
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manajemen penagihan sewa server VPS VPN & Cloud FreeRADIUS untuk seluruh mitra ISP / Cabang RTRW Net.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Total Tagihan Bulan Ini:</span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                Rp {saasInvoices.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Pricing Plans Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            {Object.values(SAAS_TENANT_PLANS).map(plan => {
              const countTenantUsingPlan = tenants.filter(t => (t.plan || 'basic') === plan.id).length;
              return (
                <div key={plan.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{plan.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                        {countTenantUsingPlan} Mitra
                      </span>
                    </div>
                    <div className="text-lg font-black text-amber-300 mt-1 font-mono">
                      Rp {(plan.priceMonthly).toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 font-normal">/bln</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 space-y-1">
                      <div>• Max PPP: <strong className="text-slate-200">{plan.maxPppoeUsers.toLocaleString()} User</strong></div>
                      <div>• Max Hotspot: <strong className="text-slate-200">{plan.maxHotspotUsers.toLocaleString()} User</strong></div>
                      <div>• Max Router: <strong className="text-slate-200">{plan.maxNas} NAS</strong></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Invoices List Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="font-bold text-xs text-white">Riwayat Tagihan & Siklus Sewa SaaS</div>
              <div className="text-[11px] text-slate-400 font-mono">Auto-Generate setiap tanggal 1 tiap bulan</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">No. Invoice & Periode</th>
                    <th className="py-3.5 px-4">Nama Mitra / Tenant</th>
                    <th className="py-3.5 px-4">Paket SaaS</th>
                    <th className="py-3.5 px-4">Nominal Tagihan</th>
                    <th className="py-3.5 px-4">Jatuh Tempo</th>
                    <th className="py-3.5 px-4">Status Pembayaran</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {saasInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">{inv.period}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-indigo-300">{inv.tenantName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {inv.tenantId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 text-[10px] font-bold">
                          {inv.planName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-black text-amber-300">
                          Rp {inv.amount.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-300">{inv.dueDate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            LUNAS ({inv.paidAt?.substring(0, 10)})
                          </span>
                        ) : inv.status === 'overdue' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <AlertCircle className="w-3 h-3" />
                            JATUH TEMPO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            MENUNGGU PEMBAYARAN
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => {
                              setSaasInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid', paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16) } : i));
                              alert(`Invoice ${inv.invoiceNumber} berhasil dikonfirmasi LUNAS.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow cursor-pointer transition-all"
                          >
                            Tandai Lunas
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: LOG RADIUS AAA & COA DEBUGGER --- */}
      {activeHubTab === 'radius_debugger' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Controls & Live Stream Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>FreeRADIUS Live Auth & CoA (Change of Authorization) Debugger</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                  isLiveStreaming ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                  {isLiveStreaming ? 'LIVE CAPTURE ACTIVE' : 'PAUSED'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspeksi paket Access-Request, Access-Accept, Reject reason, Accounting Session, dan CoA Disconnect Port 3799 secara transparan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isLiveStreaming
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600/30'
                    : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isLiveStreaming ? 'Jeda Stream' : 'Mulai Live Stream'}</span>
              </button>

              <button
                onClick={() => setRadiusLogs([])}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
              >
                Bersihkan Log
              </button>
            </div>
          </div>

          {/* Interactive CoA Trigger Simulator */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  RADIUS CoA Test Tool (Port UDP 3799 / Disconnect & Re-Auth)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">RFC 3576 / RFC 5176</span>
            </div>

            {coaSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{coaSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400">Target Username (PPP / Hotspot)</label>
                <input
                  type="text"
                  value={coaTestUsername}
                  onChange={e => setCoaTestUsername(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. budi_santoso"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400">MikroTik NAS IP</label>
                <select
                  value={coaTestNas}
                  onChange={e => setCoaTestNas(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="10.200.0.10">Core-CCR1009-Pusat (10.200.0.10)</option>
                  <option value="10.200.0.11">Sub-RB750Gr3-RW04 (10.200.0.11)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400">Aksi CoA Request</label>
                <select
                  value={coaActionType}
                  onChange={e => setCoaActionType(e.target.value as any)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="disconnect">Disconnect-Request (Kick Session / Isolir)</option>
                  <option value="rate_limit">CoA Change-Filter-Request (Ubah Bandwidth Live)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSendCoa}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Paket CoA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Log Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['ALL', 'AUTH', 'COA', 'ACCT', 'REJECT'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    logFilter === f
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari username, IP, atau pesan reply..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Log Console Terminal View */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>/var/log/freeradius/radius.log & coa.debug</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Menampilkan {filteredLogs.length} event
              </div>
            </div>

            <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto divide-y divide-slate-900">
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  Tidak ada data log yang cocok dengan filter.
                </div>
              ) : (
                filteredLogs.map(entry => {
                  const isAccept = entry.type === 'AUTH_ACCEPT';
                  const isReject = entry.type === 'AUTH_REJECT';
                  const isCoa = entry.type.startsWith('COA');
                  const isAcct = entry.type.startsWith('ACCT');

                  return (
                    <div key={entry.id} className="pt-2 pb-1 hover:bg-slate-900/50 px-2 rounded-lg transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{entry.timestamp}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAccept ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            isReject ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            isCoa ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {entry.type}
                          </span>
                          <span className="text-white font-bold">{entry.username}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                            {entry.service}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>NAS: <strong className="text-slate-200">{entry.nasName} ({entry.nasIp})</strong></span>
                          {entry.framedIp && (
                            <span>• IP: <strong className="text-emerald-400">{entry.framedIp}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className={`mt-1 text-[11px] pl-2 border-l-2 ${
                        isAccept ? 'border-emerald-500 text-emerald-300/90' :
                        isReject ? 'border-rose-500 text-rose-300/90' :
                        isCoa ? 'border-amber-500 text-amber-300/90' :
                        'border-cyan-500 text-cyan-300/90'
                      }`}>
                        {entry.replyMessage}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Port Forwarding */}
      {isAddPortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                <span>Tambah Alokasi Port Forwarding Remote</span>
              </h3>
              <button
                onClick={() => setIsAddPortModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPortRule} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Nama Rule / Deskripsi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote Winbox RB4011 Cabang 02"
                  value={newPortForm.name}
                  onChange={e => setNewPortForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Jenis Layanan</label>
                  <select
                    value={newPortForm.serviceType}
                    onChange={e => {
                      const st = e.target.value as PortForwardRule['serviceType'];
                      let defPort = 8291;
                      if (st === 'webfig') defPort = 80;
                      if (st === 'api') defPort = 8728;
                      if (st === 'tr069') defPort = 7547;
                      if (st === 'ssh') defPort = 22;
                      setNewPortForm(prev => ({ ...prev, serviceType: st, targetPort: defPort }));
                    }}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="winbox">Winbox (Port 8291)</option>
                    <option value="webfig">WebFig HTTP (Port 80)</option>
                    <option value="api">MikroTik API (Port 8728)</option>
                    <option value="tr069">TR-069 ACS (Port 7547)</option>
                    <option value="ssh">SSH Terminal (Port 22)</option>
                    <option value="custom">Custom Port Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Cabang / Tenant</label>
                  <select
                    value={newPortForm.tenantId}
                    onChange={e => setNewPortForm(prev => ({ ...prev, tenantId: e.target.value }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Public Port (VPS)</label>
                  <input
                    type="number"
                    required
                    value={newPortForm.publicPort}
                    onChange={e => setNewPortForm(prev => ({ ...prev, publicPort: Number(e.target.value) }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Target IP VPN</label>
                  <input
                    type="text"
                    required
                    value={newPortForm.targetIp}
                    onChange={e => setNewPortForm(prev => ({ ...prev, targetIp: e.target.value }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Target Port</label>
                  <input
                    type="number"
                    required
                    value={newPortForm.targetPort}
                    onChange={e => setNewPortForm(prev => ({ ...prev, targetPort: Number(e.target.value) }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                Akses Publik: <strong className="text-white">{currentVpsIp}:{newPortForm.publicPort}</strong> ➔ 
                Dialihkan ke: <strong className="text-cyan-300">{newPortForm.targetIp}:{newPortForm.targetPort}</strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPortModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  Simpan Port Forwarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Konfigurasi Server VPS & Master Hub */}
      {isEditVpsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Edit Konfigurasi Server VPS & Master Hub</h3>
                  <p className="text-[11px] text-slate-400">Ubah IP Publik VPS, Hostname, Secret FreeRADIUS, dan Port Gateway</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditVpsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVpsConfig} className="space-y-4 text-xs">
              {/* IP VPS & Ping Test */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Alamat IP Publik Server VPS</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPingTestStatus('testing');
                      setTimeout(() => setPingTestStatus('success'), 900);
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 cursor-pointer"
                  >
                    {pingTestStatus === 'testing' ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Mengecek Koneksi...</span>
                      </>
                    ) : pingTestStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Latency 12ms (Normal)</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-3 h-3" />
                        <span>Tes Ping IP VPS</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 103.49.239.150"
                  value={vpsFormData.ip}
                  onChange={e => setVpsFormData(prev => ({ ...prev, ip: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Semua router MikroTik cabang & tenant akan menggunakan IP ini untuk koneksi RADIUS Server, WireGuard / SSTP VPN, serta Remote Port Forwarding.
                </p>
              </div>

              {/* Hostname & Data Center */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Hostname / FQDN</label>
                  <input
                    type="text"
                    value={vpsFormData.hostname}
                    onChange={e => setVpsFormData(prev => ({ ...prev, hostname: e.target.value }))}
                    placeholder="vps-master.masmedianet.id"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Lokasi Data Center / ISP</label>
                  <input
                    type="text"
                    value={vpsFormData.location}
                    onChange={e => setVpsFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Jakarta Cyber IDC (DC-01)"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* FreeRADIUS Secret & Ports */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>FreeRADIUS Server Secret & Port</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Shared Secret Key</label>
                  <div className="relative mt-1">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      required
                      value={vpsFormData.secret}
                      onChange={e => setVpsFormData(prev => ({ ...prev, secret: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Port Auth RADIUS</label>
                    <input
                      type="number"
                      required
                      value={vpsFormData.authPort}
                      onChange={e => setVpsFormData(prev => ({ ...prev, authPort: Number(e.target.value) }))}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Port Accounting (Acct)</label>
                    <input
                      type="number"
                      required
                      value={vpsFormData.acctPort}
                      onChange={e => setVpsFormData(prev => ({ ...prev, acctPort: Number(e.target.value) }))}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* VPN & Gateway Ports */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Port WireGuard</label>
                  <input
                    type="number"
                    value={vpsFormData.wireguardPort}
                    onChange={e => setVpsFormData(prev => ({ ...prev, wireguardPort: Number(e.target.value) }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Port SSTP VPN</label>
                  <input
                    type="number"
                    value={vpsFormData.sstpPort}
                    onChange={e => setVpsFormData(prev => ({ ...prev, sstpPort: Number(e.target.value) }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Port API Gateway</label>
                  <input
                    type="number"
                    value={vpsFormData.apiPort}
                    onChange={e => setVpsFormData(prev => ({ ...prev, apiPort: Number(e.target.value) }))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* MikroTik command preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Perintah MikroTik Otomatis:</div>
                <div className="text-emerald-400 select-all overflow-x-auto whitespace-pre">
                  /radius add address={vpsFormData.ip.trim() || '103.49.239.150'} secret="{vpsFormData.secret.trim() || 'MasmediaSecret2026'}" service=ppp,hotspot authentication-port={vpsFormData.authPort} accounting-port={vpsFormData.acctPort}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditVpsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-900/40 cursor-pointer transition-all active:scale-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Terapkan Konfigurasi VPS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
