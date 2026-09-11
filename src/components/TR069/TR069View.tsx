import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TR069Device } from '../../types';
import {
  Radio,
  Wifi,
  RotateCw,
  Zap,
  Server,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Sliders,
  Cpu,
  Thermometer,
  Lock,
  Edit2,
  Send,
  Eye,
  EyeOff,
  Power,
  RefreshCcw,
} from 'lucide-react';

export const TR069View: React.FC = () => {
  const {
    genieACSConfig,
    updateGenieACSConfig,
    testGenieACSConnection,
    tr069Devices,
    rebootTR069Device,
    updateTR069WiFi,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'devices' | 'api' | 'cloud'>('devices');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // WiFi Modal
  const [selectedDevice, setSelectedDevice] = useState<TR069Device | null>(null);
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [newSsid, setNewSsid] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingWifi, setIsUpdatingWifi] = useState(false);

  // ACS Form
  const [apiForm, setApiForm] = useState({
    apiUrl: genieACSConfig.apiUrl,
    apiKey: genieACSConfig.apiKey,
    uiUrl: genieACSConfig.uiUrl,
    nbiPort: genieACSConfig.nbiPort,
    syncIntervalSeconds: genieACSConfig.syncIntervalSeconds,
  });

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTestResult(null);
    setTimeout(() => {
      const ok = testGenieACSConnection();
      setTestingConnection(false);
      if (ok) {
        setTestResult('✅ Koneksi ke GenieACS API Berhasil! NBI Port 7557 aktif merespons.');
      } else {
        setTestResult('❌ Gagal terhubung ke GenieACS. Periksa URL API dan API Key.');
      }
    }, 1200);
  };

  const handleOpenWifiModal = (dev: TR069Device) => {
    setSelectedDevice(dev);
    setNewSsid(dev.wifiSsid);
    setNewPassword(dev.wifiPassword || '');
    setShowWifiModal(true);
  };

  const handleSaveWifi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    setIsUpdatingWifi(true);

    setTimeout(() => {
      updateTR069WiFi(selectedDevice.id, newSsid, newPassword);
      setIsUpdatingWifi(false);
      setShowWifiModal(false);
      alert(`Berhasil mengirim perintah TR-069 SetParameterValues: SSID diubah ke "${newSsid}"!`);
    }, 1000);
  };

  const handleReboot = (dev: TR069Device) => {
    if (confirm(`Kirim sinyal TR-069 RPC Reboot ke perangkat ${dev.modelName} (${dev.serialNumber})?`)) {
      rebootTR069Device(dev.id);
      alert(`Perintah RPC Reboot berhasil dikirim ke CPE ID: ${dev.deviceId}!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4" />
            Dashboard / TR-069 ACS Engine
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TR-069 Remote Management (GenieACS)</h1>
          <p className="text-sm text-slate-400 mt-1">
            Auto-Configuration Server untuk kontrol jarak jauh modem CPE ONT (Ganti WiFi SSID/Pass, Reboot, Auto Provisioning).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-medium text-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 text-emerald-400 ${testingConnection ? 'animate-spin' : ''}`} />
            {testingConnection ? 'Memeriksa...' : 'Test API GenieACS'}
          </button>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Status Server ACS</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-base font-bold text-emerald-400">GenieACS Connected</h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{genieACSConfig.apiUrl}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Perangkat CPE Terhubung</span>
            <h4 className="text-xl font-bold text-white mt-1">{tr069Devices.length} ONT</h4>
            <span className="text-[11px] text-emerald-400">ZTE, Huawei, Fiberhome Auto-Sync</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Sync Interval & NBI</span>
            <h4 className="text-base font-bold text-purple-400 mt-1">NBI Port {genieACSConfig.nbiPort}</h4>
            <span className="text-[11px] text-slate-400">Sinkron tiap {genieACSConfig.syncIntervalSeconds} detik</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <RotateCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xl border text-xs font-semibold ${
          testResult.includes('✅')
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
            : 'bg-red-950/40 text-red-300 border-red-500/30'
        }`}>
          {testResult}
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('devices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'devices'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          Daftar Perangkat CPE ({tr069Devices.length})
        </button>
        <button
          onClick={() => setActiveSubTab('api')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'api'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          GenieACS API Settings
        </button>
        <button
          onClick={() => setActiveSubTab('cloud')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'cloud'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cloud className="w-4 h-4" />
          GenieACS Cloud Integration
        </button>
      </div>

      {/* Tab 1: CPE Device Management */}
      {activeSubTab === 'devices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tr069Devices.map(dev => (
              <div
                key={dev.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                          {dev.manufacturer}
                        </span>
                        <span className="text-xs font-bold text-white">{dev.modelName}</span>
                      </div>
                      <span className="font-mono text-xs text-slate-400 mt-1 block">SN: {dev.serialNumber}</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      ONLINE
                    </span>
                  </div>

                  {/* Device Specs & TR-069 Parameters */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block">IP Remote ONT</span>
                      <span className="font-mono text-slate-200">{dev.ipAddress}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Username PPPoE</span>
                      <span className="font-semibold text-emerald-400">{dev.pppoeUsername || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Optical Signal (Rx)</span>
                      <span className="font-mono font-bold text-emerald-400">{dev.rxPowerDbm} dBm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Suhu Perangkat</span>
                      <span className="text-slate-200">{dev.temperature}°C</span>
                    </div>
                  </div>

                  {/* WiFi Info */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                        SSID WiFi:
                      </span>
                      <strong className="text-white font-mono">{dev.wifiSsid}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        Password:
                      </span>
                      <span className="font-mono text-slate-300">••••••••</span>
                    </div>
                    <div className="text-[10px] text-slate-500 text-right pt-1">
                      Inform Terakhir: {dev.lastInform}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenWifiModal(dev)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Ganti Nama & Pass WiFi
                  </button>
                  <button
                    onClick={() => handleReboot(dev)}
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    title="Kirim RPC Reboot ke ONT"
                  >
                    <Power className="w-3.5 h-3.5" />
                    Reboot ONT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: GenieACS API */}
      {activeSubTab === 'api' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Pengaturan GenieACS NBI / REST API
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Hubungkan aplikasi Masmedia dengan server GenieACS lokal atau remote VPS Anda.
            </p>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              updateGenieACSConfig(apiForm);
              alert('Konfigurasi GenieACS API berhasil disimpan!');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-300 font-semibold mb-1">URL GenieACS API (NBI)</label>
              <input
                type="text"
                required
                value={apiForm.apiUrl}
                onChange={e => setApiForm({ ...apiForm, apiUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-sm"
                placeholder="http://192.168.10.10:7557"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default GenieACS NBI port adalah 7557</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">API Key / Secret Token</label>
              <input
                type="password"
                value={apiForm.apiKey}
                onChange={e => setApiForm({ ...apiForm, apiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-sm"
                placeholder="acs-secret-token-12345"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">NBI Port</label>
                <input
                  type="number"
                  value={apiForm.nbiPort}
                  onChange={e => setApiForm({ ...apiForm, nbiPort: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Interval Sync (detik)</label>
                <input
                  type="number"
                  value={apiForm.syncIntervalSeconds}
                  onChange={e => setApiForm({ ...apiForm, syncIntervalSeconds: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-xs"
              >
                Simpan Pengaturan API
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: GenieACS Cloud */}
      {activeSubTab === 'cloud' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" />
              GenieACS Cloud / SaaS Integration
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan layanan GenieACS Cloud tersentralisasi tanpa perlu repot menginstall server MongoDB & Node.js sendiri.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status GenieACS Cloud:</span>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                READY TO CONNECT
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Inform URL untuk Modem:</span>
              <span className="font-mono text-emerald-400">http://acs.cloud.rtrw.net:7547/</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Username CWMP:</span>
              <span className="font-mono text-slate-200">cwmp_user</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Password CWMP:</span>
              <span className="font-mono text-slate-200">cwmp_pass9912</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            💡 <strong>Panduan Setting di Modem ONT Pelanggan:</strong>
            <ol className="list-decimal list-inside space-y-1 mt-2 text-slate-300">
              <li>Buka IP Modem pelanggan (misal: 192.168.1.1).</li>
              <li>Masuk ke menu <strong>Network / Administration &gt; TR-069</strong>.</li>
              <li>Aktifkan <strong>TR-069 Enable</strong> dan masukkan URL Inform di atas.</li>
              <li>Modem akan otomatis terdeteksi di daftar perangkat Masmedia dalam hitungan detik.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Modal Change WiFi SSID & Password */}
      {showWifiModal && selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-400" />
                Ubah Nama & Password WiFi Remote
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Perangkat: <strong>{selectedDevice.modelName}</strong> ({selectedDevice.serialNumber})
              </p>
            </div>

            <form onSubmit={handleSaveWifi} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama WiFi (SSID Baru)</label>
                <input
                  type="text"
                  required
                  value={newSsid}
                  onChange={e => setNewSsid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium text-sm"
                  placeholder="misal: RTRW_BUDI_5G"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password WiFi (WPA2-PSK)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-white font-mono text-sm"
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Perubahan akan langsung dieksekusi ke ONT via TR-069 SetParameterValues.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWifiModal(false)}
                  disabled={isUpdatingWifi}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingWifi}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdatingWifi ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Mengirim ke ONT...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Terapkan ke Modem
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
