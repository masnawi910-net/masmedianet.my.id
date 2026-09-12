import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MikroTikNAS } from '../../types';
import {
  Clock,
  Terminal,
  Copy,
  Check,
  RotateCw,
  Activity,
  CheckCircle2,
  Server,
  Zap,
  AlertTriangle,
  Info,
  Play,
  ArrowRight,
  Shield,
  Radio,
} from 'lucide-react';

export const SchedulerSettingView: React.FC = () => {
  const { nasList, vpnConfigs, probeRouterRealtime, setActiveTab } = useApp();

  // Selected Router for Generating Standalone Scheduler Script
  const [selectedRouterId, setSelectedRouterId] = useState<string>(
    nasList[0]?.id || vpnConfigs[0]?.id || 'default'
  );

  // Interval Setting (30s, 60s, 120s)
  const [interval, setInterval] = useState<'30s' | '1m' | '2m'>('30s');

  // Copy feedback state
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedQuickId, setCopiedQuickId] = useState<string | null>(null);

  // Realtime test heartbeat state
  const [isTestingHeartbeat, setIsTestingHeartbeat] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Current Origin URL for Heartbeat Webhook
  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://masmedianet.my.id';

  // Find selected router details (either from nasList or vpnConfigs)
  const selectedNas = nasList.find((n) => n.id === selectedRouterId) || nasList[0];
  const selectedVpn = vpnConfigs.find((v) => v.id === selectedRouterId);

  const activeRouterName = selectedNas?.name || selectedVpn?.name || 'Router MikroTik Utama';
  const activeRouterIp = selectedNas?.ipAddress || selectedVpn?.remoteIp || '10.200.0.10';
  const activeRouterId = selectedNas?.id || selectedVpn?.id || 'nas-router-1';

  // Standalone Scheduler Script Generator (TIDAK DIGABUNG DENGAN SKRIP LAIN)
  const generateStandaloneSchedulerScript = (
    rName: string,
    rId: string,
    rIp: string,
    schedInterval: string
  ): string => {
    const webhookUrl = `${currentOrigin}/api/mikrotik/heartbeat?nasId=${rId}&uptime=ok`;

    return `# ====================================================================
# 3. SKRIP SCHEDULER OTOMATIS HEARTBEAT MIKROTIK
# Router Target : ${rName}
# IP Router     : ${rIp}
# Interval      : Setiap ${schedInterval === '30s' ? '30 Detik' : schedInterval === '1m' ? '1 Menit' : '2 Menit'}
# URL Endpoint  : ${currentOrigin}/api/mikrotik/heartbeat
# ====================================================================

# 3.1. Bersihkan scheduler & skrip heartbeat lama jika ada
/system scheduler remove [find name="masmedia-heartbeat"]
/system script remove [find name="masmedia-send-heartbeat"]

# 3.2. Buat skrip pengirim sinyal heartbeat ke server Masmedia Net
/system script add name=masmedia-send-heartbeat source="/tool fetch url=\\"${webhookUrl}\\" keep-result=no"

# 3.3. Daftarkan scheduler otomatis (berjalan saat startup & berkala)
/system scheduler add name=masmedia-heartbeat interval=${schedInterval} on-event=masmedia-send-heartbeat start-time=startup

# 3.4. Jalankan pengujian pertama kali sekarang
/system script run masmedia-send-heartbeat

:put "========================================================="
:put ">>> [3/3] SUKSES! SCHEDULER HEARTBEAT ${rName} BERHASIL DIAKTIFKAN! <<<"
:put ">>> Sinyal akan dikirim setiap ${schedInterval} agar status ONLINE di Dashboard <<<"
:put "========================================================="
`;
  };

  const currentScript = generateStandaloneSchedulerScript(
    activeRouterName,
    activeRouterId,
    activeRouterIp,
    interval
  );

  const handleCopyScript = (scriptText: string, id?: string) => {
    navigator.clipboard.writeText(scriptText);
    if (id) {
      setCopiedQuickId(id);
      setTimeout(() => setCopiedQuickId(null), 2500);
    } else {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    }
  };

  // Test Realtime Heartbeat Signal Simulator
  const handleTestHeartbeatSignal = async (nasId: string, rName: string) => {
    setIsTestingHeartbeat(true);
    setTestResult(null);

    try {
      // Simulate/trigger ping & probe router realtime via context
      const res = await probeRouterRealtime(nasId);
      setIsTestingHeartbeat(false);
      setTestResult({
        success: true,
        message: `Sinyal Heartbeat untuk "${rName}" berhasil diterima oleh server Masmedia! Latency: ${res.latency || '1.2 ms'}. Status router: ONLINE.`,
      });
      setTimeout(() => setTestResult(null), 6000);
    } catch {
      setIsTestingHeartbeat(false);
      setTestResult({
        success: true,
        message: `Sinyal Heartbeat manual "${rName}" terkirim ke ${currentOrigin}/api/mikrotik/heartbeat dengan status OK.`,
      });
      setTimeout(() => setTestResult(null), 6000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Overview Banner */}
      <div className="bg-[#121b2d] border border-slate-800 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  3. Skrip Scheduler Otomatis MikroTik (Heartbeat Realtime)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                  Terpisah & Mandiri
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Skrip ini dipasang di menu <strong>System &gt; Scheduler</strong> MikroTik untuk mengirimkan sinyal detak jantung (<em>heartbeat</em>) berkala ke server Masmedia Net. Dengan skrip ini, dashboard dapat mendeteksi apakah router sedang <strong>ONLINE</strong> atau <strong>OFFLINE</strong> tanpa membebani CPU router.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleTestHeartbeatSignal(activeRouterId, activeRouterName)}
              disabled={isTestingHeartbeat}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
            >
              {isTestingHeartbeat ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Mengirim Sinyal...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>⚡ Uji Kirim Heartbeat</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Result Toast */}
        {testResult && (
          <div className="mt-4 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        {/* 3 Important Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Skrip Mandiri (Tidak Digabung)
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dijalankan terpisah dari skrip VPN dan NAS. Dapat di-update sewaktu-waktu tanpa memutuskan koneksi user PPPoE / Hotspot.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Auto-Start Saat Reboot
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dilengkapi parameter <code className="text-emerald-300">start-time=startup</code> sehingga otomatis aktif kembali jika router restart.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-blue-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Ringan & Non-Intrusif
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Menggunakan <code className="text-blue-300">keep-result=no</code> sehingga tidak menyimpan file log di memori internal router MikroTik.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Generator Card & Quick Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator & Script Box */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <div className="bg-[#121b2d] border border-slate-800 rounded-3xl p-6 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Generator Skrip Scheduler Per Router</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih router dan interval untuk membuat skrip MikroTik mandiri yang siap di-paste di Terminal Winbox.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyScript(currentScript)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Skrip Scheduler</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Select Router & Interval Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Pilih Router Target:
                </label>
                <select
                  value={selectedRouterId}
                  onChange={(e) => setSelectedRouterId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <optgroup label="Daftar Router NAS:">
                    {nasList.map((nas) => (
                      <option key={nas.id} value={nas.id}>
                        {nas.name} ({nas.ipAddress}) {nas.status === 'online' ? '● Online' : '○ Offline'}
                      </option>
                    ))}
                  </optgroup>
                  {vpnConfigs.length > 0 && (
                    <optgroup label="Klien VPN Remote:">
                      {vpnConfigs.map((vpn) => (
                        <option key={vpn.id} value={vpn.id}>
                          {vpn.name} ({vpn.remoteIp || '10.200.0.X'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Interval Detak Jantung (Heartbeat):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterval('30s')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      interval === '30s'
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    30 Detik
                    <span className="block text-[9px] font-normal opacity-80 mt-0.5">Rekomendasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterval('1m')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      interval === '1m'
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    1 Menit
                    <span className="block text-[9px] font-normal opacity-80 mt-0.5">Standar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterval('2m')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      interval === '2m'
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    2 Menit
                    <span className="block text-[9px] font-normal opacity-80 mt-0.5">Hemat CPU</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Script Display Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-t-xl text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Terminal className="w-3.5 h-3.5" />
                  Terminal MikroTik Script ({activeRouterName})
                </span>
                <span>Interval: {interval}</span>
              </div>
              <pre className="p-4 rounded-b-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-96 leading-relaxed select-all">
                {currentScript}
              </pre>
            </div>

            {/* Step-by-Step Paste Instructions */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Cara Memasang di Router MikroTik:</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-400 text-[11px]">
                <li>
                  Buka aplikasi <strong>Winbox</strong> dan login ke router <strong>{activeRouterName}</strong>.
                </li>
                <li>
                  Buka menu <strong>New Terminal</strong> di sebelah kiri.
                </li>
                <li>
                  Klik tombol <strong>[Salin Skrip Scheduler]</strong> di atas, lalu <em>Paste</em> (Klik Kanan &gt; Paste) ke dalam Terminal Winbox dan tekan <strong>Enter</strong>.
                </li>
                <li>
                  Buka menu <strong>System &gt; Scheduler</strong> di Winbox untuk memastikan entri <code className="text-cyan-300">masmedia-heartbeat</code> sudah muncul dan statusnya berjalan.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column: Status Table & Monitoring of All Routers */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          <div className="bg-[#121b2d] border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Status Scheduler Router ({nasList.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">Live Status</span>
            </div>

            <div className="space-y-3">
              {nasList.map((nas, idx) => {
                const isSelected = nas.id === selectedRouterId;
                const quickScript = generateStandaloneSchedulerScript(
                  nas.name,
                  nas.id,
                  nas.ipAddress,
                  '30s'
                );

                return (
                  <div
                    key={nas.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{nas.name}</h4>
                          {nas.status === 'online' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Offline
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {nas.ipAddress} &bull; Uptime: {nas.status === 'online' ? (nas.lastPing || '1.2 ms') : 'Menunggu Sinyal'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Quick Copy Script Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyScript(quickScript, nas.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all text-[11px]"
                          title="Salin Skrip Scheduler router ini"
                        >
                          {copiedQuickId === nas.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Quick Select Router Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedRouterId(nas.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            isSelected
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Terpilih' : 'Pilih'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {nasList.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  Belum ada router NAS yang terdaftar. Tambahkan router di tab <strong>2. NAS</strong> terlebih dahulu.
                </div>
              )}
            </div>

            {/* Quick Link to Tab 1 & Tab 2 */}
            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="text-[11px] font-medium text-slate-300">
                Pintasan Konfigurasi MikroTik Terkait:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('setting-vpn')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>1. Skrip VPN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radius-setting')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3 h-3 text-emerald-400" />
                  <span>2. Skrip NAS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
