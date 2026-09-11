import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Users,
  Receipt,
  Router,
  LifeBuoy,
  Wifi,
  Sparkles,
  RotateCcw,
  X,
  ShieldCheck,
  FileCode2,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { downloadDatabaseBackup, parseDatabaseBackupFile, DatabaseBackupPayload } from '../../services/databaseService';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    customers,
    packages,
    invoices,
    nasList,
    activeSessions,
    templates,
    isolirConfig,
    paymentChannels,
    accounts,
    ftthOLTs,
    ftthODPs,
    ftthONUs,
    genieACSConfig,
    tr069Devices,
    hotspotProfiles,
    hotspotVouchers,
    hotspotTemplates,
    vpnConfigs,
    radiusServerConfig,
    expenses,
    bankAccounts,
    qrisConfig,
    paymentGatewayConfig,
    tickets,
    fiberCables,
    importFullDatabase,
    resetAllData,
    theme,
    cloudSyncStatus,
    lastCloudSync,
    isCloudQuotaExceeded,
    syncNowToCloud,
  } = useApp();

  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmationText, setResetConfirmationText] = useState('');

  if (!isOpen) return null;

  // Calculate live database metrics
  const totalRecords =
    customers.length +
    packages.length +
    invoices.length +
    nasList.length +
    accounts.length +
    ftthOLTs.length +
    ftthODPs.length +
    ftthONUs.length +
    tr069Devices.length +
    hotspotProfiles.length +
    hotspotVouchers.length +
    hotspotTemplates.length +
    vpnConfigs.length +
    expenses.length +
    bankAccounts.length +
    tickets.length +
    fiberCables.length;

  const ftthTotal = ftthOLTs.length + ftthODPs.length + ftthONUs.length;

  // Handle Export Backup
  const handleExportBackup = () => {
    const payload: DatabaseBackupPayload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'Masmedia ISP MikroTik RADIUS & Billing Hub',
      data: {
        customers,
        packages,
        invoices,
        nasList,
        activeSessions,
        templates,
        isolirConfig,
        paymentChannels,
        accounts,
        ftthOLTs,
        ftthODPs,
        ftthONUs,
        genieACSConfig,
        tr069Devices,
        hotspotProfiles,
        hotspotVouchers,
        hotspotTemplates,
        vpnConfigs,
        radiusServerConfig,
        expenses,
        bankAccounts,
        qrisConfig,
        paymentGatewayConfig,
        tickets,
        fiberCables,
      },
    };

    downloadDatabaseBackup(payload);
    setImportStatus({
      type: 'success',
      message: 'File backup JSON database berhasil diunduh dan disimpan ke perangkat Anda!',
    });
  };

  // Handle File Upload Restore
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus({ type: 'loading', message: 'Memverifikasi dan memulihkan data database...' });
      const payload = await parseDatabaseBackupFile(file);
      const count = importFullDatabase(payload);
      setImportStatus({
        type: 'success',
        message: `Database berhasil dipulihkan! ${count} total rekaman data telah diperbarui ke sistem.`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Format file backup tidak valid.',
      });
    }
  };

  const handleExecuteReset = () => {
    if (resetConfirmationText !== 'RESET') {
      alert('Ketik "RESET" dengan huruf besar untuk mengonfirmasi.');
      return;
    }
    resetAllData();
    setShowResetConfirm(false);
    setResetConfirmationText('');
    setImportStatus({
      type: 'success',
      message: 'Database berhasil di-reset ke pengaturan standar demo.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-gradient-to-b from-[#4c0519] via-[#61082d] to-[#4c0519] border-pink-700/70 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-pink-700/40 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-white shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Pusat Database & Keamanan Data
              </h3>
              <p className="text-xs text-pink-200/80">
                Penyimpanan Permanen Offline-First & Sinkronisasi Real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Cloud Firestore & Real-time Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cloud Firestore Card */}
            <div className="rounded-xl p-4 bg-indigo-950/60 border border-indigo-500/40 flex flex-col justify-between gap-3 shadow-inner">
              <div className="flex items-start gap-3">
                <Cloud className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-indigo-300">
                      Cloud Firestore Sync
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isCloudQuotaExceeded
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : cloudSyncStatus === 'synced'
                        ? 'bg-blue-500/20 text-white border border-blue-500/40'
                        : cloudSyncStatus === 'syncing'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isCloudQuotaExceeded
                        ? 'Kuota Free Tier Penuh (Lokal Aktif)'
                        : cloudSyncStatus === 'synced'
                        ? 'Tersinkron'
                        : cloudSyncStatus === 'syncing'
                        ? 'Menyinkronkan...'
                        : 'Offline'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-200/80 mt-1 leading-relaxed">
                    {isCloudQuotaExceeded ? (
                      <span className="text-amber-300/90 font-medium">
                        Batas kuota harian database gratis Firebase (20.000 writes/hari) sementara tercapai. Aplikasi 100% aman dan lancar menggunakan penyimpanan lokal IndexedDB & Browser Storage.
                      </span>
                    ) : (
                      <>Database cloud tersimpan di Google Cloud Firestore. Akses data yang sama dari perangkat mana saja.</>
                    )}
                    {lastCloudSync && (
                      <span className="block mt-0.5 text-indigo-300 font-mono text-[10px]">
                        Sync terakhir: {lastCloudSync}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const res = await syncNowToCloud(true);
                  if (res) {
                    setImportStatus({
                      type: 'success',
                      message: 'Sinkronisasi instan ke Cloud Firestore berhasil!',
                    });
                  } else {
                    setImportStatus({
                      type: 'error',
                      message: isCloudQuotaExceeded
                        ? 'Kuota tulis harian Firebase (free tier) dari Google Cloud telah habis untuk hari ini. Semua data tetap tersimpan 100% aman di IndexedDB & Local Storage.'
                        : 'Gagal menyinkronkan ke Cloud Firestore. Silakan cek koneksi internet.',
                    });
                  }
                }}
                disabled={cloudSyncStatus === 'syncing'}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{cloudSyncStatus === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan Sekarang ke Cloud'}</span>
              </button>
            </div>

            {/* Offline IndexedDB Card */}
            <div className="rounded-xl p-4 bg-blue-950/60 border border-blue-500/40 flex flex-col justify-between gap-3 shadow-inner">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      Local Offline Storage
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
                    Snapshot tersimpan offline di IndexedDB & LocalStorage perangkat. Aplikasi tetap berjalan mulus walau tanpa internet.
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-white font-mono bg-blue-950/80 px-2.5 py-1.5 rounded-lg border border-blue-600/30 flex items-center justify-between">
                <span>Status Local Storage:</span>
                <span className="font-bold text-white">READY (OFFLINE-FIRST)</span>
              </div>
            </div>
          </div>

          {/* Feedback Status Alert */}
          {importStatus.type !== 'idle' && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                importStatus.type === 'success'
                  ? 'bg-blue-950/80 text-white border-blue-500/50'
                  : importStatus.type === 'error'
                  ? 'bg-rose-950/80 text-rose-200 border-rose-500/50'
                  : 'bg-blue-950/80 text-white border-blue-500/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                ) : importStatus.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
              <button
                onClick={() => setImportStatus({ type: 'idle' })}
                className="text-slate-400 hover:text-white ml-2 text-sm"
              >
                ✕
              </button>
            </div>
          )}

          {/* Live Data Count Bento Grid */}
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-pink-200 block mb-2.5">
              Statistik Rekaman Database ({totalRecords} Total Item)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-pink-700/40 flex flex-col">
                <div className="flex items-center gap-1.5 text-pink-300 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <span>Pelanggan</span>
                </div>
                <span className="text-lg sm:text-xl font-extrabold text-white mt-1">
                  {customers.length}
                </span>
                <span className="text-[10.5px] text-pink-200/70">{packages.length} Paket</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-pink-700/40 flex flex-col">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tagihan</span>
                </div>
                <span className="text-lg sm:text-xl font-extrabold text-amber-300 mt-1">
                  {invoices.length}
                </span>
                <span className="text-[10.5px] text-amber-200/70">{expenses.length} Pengeluaran</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-pink-700/40 flex flex-col">
                <div className="flex items-center gap-1.5 text-blue-300 text-xs font-semibold">
                  <Router className="w-3.5 h-3.5 text-blue-400" />
                  <span>Router & FTTH</span>
                </div>
                <span className="text-lg sm:text-xl font-extrabold text-blue-300 mt-1">
                  {nasList.length + ftthTotal}
                </span>
                <span className="text-[10.5px] text-blue-200/70">{ftthTotal} OLT/ODP/ONU</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-pink-700/40 flex flex-col">
                <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-semibold">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hotspot & Tiket</span>
                </div>
                <span className="text-lg sm:text-xl font-extrabold text-cyan-300 mt-1">
                  {hotspotVouchers.length + tickets.length}
                </span>
                <span className="text-[10.5px] text-cyan-200/70">{tickets.length} Tiket Support</span>
              </div>
            </div>
          </div>

          {/* Backup & Restore Action Buttons */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-pink-200 block">
              Cadangan & Pemulihan (Backup & Restore)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Button */}
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup Database (.json)</span>
              </button>

              {/* Import Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore / Upload Database (.json)</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-pink-200/70">
              💡 <strong>Tips:</strong> Anda dapat mengunduh backup database ke komputer/HP dan memulihkannya kapan saja di browser atau perangkat lain tanpa kehilangan data.
            </p>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="pt-3 border-t border-pink-700/40">
            {!showResetConfirm ? (
              <div className="flex items-center justify-between text-xs text-pink-200/80">
                <span>Ingin memuat ulang data contoh bawaan?</span>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-rose-300 hover:text-white font-bold underline transition-colors"
                >
                  Opsi Reset Database
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Konfirmasi Reset Database ke Default</span>
                </div>
                <p className="text-[11.5px] text-rose-200 leading-relaxed">
                  Tindakan ini akan mengembalikan data ke contoh bawaan. Ketik <strong>RESET</strong> di bawah untuk melanjutkan:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder='Ketik "RESET"'
                    value={resetConfirmationText}
                    onChange={e => setResetConfirmationText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-rose-500/40 text-white font-mono"
                  />
                  <button
                    onClick={handleExecuteReset}
                    disabled={resetConfirmationText !== 'RESET'}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs transition-colors"
                  >
                    Eksekusi Reset
                  </button>
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetConfirmationText('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-pink-700/40 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>Penyimpanan: <strong>IndexedDB + LocalStorage</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
