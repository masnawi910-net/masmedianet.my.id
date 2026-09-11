import React, { useState, useRef } from 'react';
import { Customer, InternetPackage, MikroTikNAS } from '../../types';
import {
  parseExcelOrCsvFile,
  parseRawCustomerText,
  ImportResult,
  downloadCustomerTemplateCSV,
  downloadCustomerTemplateExcel,
  DEFAULT_PPPOE_CSV_TEMPLATE,
  USER_RAW_PPPOE_CSV_DATA,
  generateBulkSamplePPPoE,
} from '../../utils/excelHelper';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Download,
  AlertCircle,
  Sparkles,
  Info,
  Users,
} from 'lucide-react';

interface ImportCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: InternetPackage[];
  nasList: MikroTikNAS[];
  existingCustomers: Customer[];
  onImportSuccess: (importedCustomers: Customer[]) => void;
}

export const ImportCustomerModal: React.FC<ImportCustomerModalProps> = ({
  isOpen,
  onClose,
  packages,
  nasList,
  existingCustomers,
  onImportSuccess,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewResult, setPreviewResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process File
  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    try {
      const result = await parseExcelOrCsvFile(selectedFile, packages, nasList, existingCustomers);
      setPreviewResult(result);
    } catch (err: any) {
      alert(`Gagal memproses file: ${err?.message || 'Format tidak valid'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Raw Text (Semicolon CSV like user sample)
  const handleProcessText = () => {
    if (!rawText.trim()) {
      alert('Masukkan teks data pelanggan terlebih dahulu.');
      return;
    }
    setIsProcessing(true);
    try {
      const result = parseRawCustomerText(rawText, packages, nasList, existingCustomers);
      setPreviewResult(result);
    } catch (err: any) {
      alert(`Gagal memproses data teks: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!previewResult || previewResult.importedCustomers.length === 0) {
      alert('Tidak ada data pelanggan yang valid untuk diimpor.');
      return;
    }

    onImportSuccess(previewResult.importedCustomers);
    onClose();
  };

  // Sample data to copy / template
  const handleFillSample = () => {
    setRawText(DEFAULT_PPPOE_CSV_TEMPLATE);
    const result = parseRawCustomerText(DEFAULT_PPPOE_CSV_TEMPLATE, packages, nasList, existingCustomers);
    setPreviewResult(result);
  };

  const handleFillUserPromptData = () => {
    setRawText(USER_RAW_PPPOE_CSV_DATA);
    const result = parseRawCustomerText(USER_RAW_PPPOE_CSV_DATA, packages, nasList, existingCustomers);
    setPreviewResult(result);
  };

  const handleFillBulkSample = (count: number = 100) => {
    const generated = generateBulkSamplePPPoE(count);
    setRawText(generated);
    const result = parseRawCustomerText(generated, packages, nasList, existingCustomers);
    setPreviewResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Impor Data Pelanggan (PPPoE & DHCP)
              </h3>
              <p className="text-xs text-slate-400">
                Mendukung format Excel (.xlsx, .xls) & CSV semi-colon (no;user;password;profile;nas;service;ip;name;phone;address)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Template Download Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">Template Impor Akun PPPoE Resmi</span>
                <span className="text-[10px] bg-blue-500/20 text-white font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Kolom Persis Sesuai File CSV Anda
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Kapasitas: Tanpa Batas (100 - 5.000+ Akun)
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Header kolom: <code className="text-white font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">no;user;password;profile;nas;service;ip;name;phone;address</code>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadCustomerTemplateCSV()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white hover:text-white text-xs font-bold border border-blue-500/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Unduh file template dalam format CSV titik-koma"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                Unduh Template (.CSV)
              </button>
              <button
                type="button"
                onClick={() => downloadCustomerTemplateExcel()}
                className="px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Unduh file template dalam format Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Unduh Template (.XLSX)
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 max-w-md">
            <button
              onClick={() => {
                setActiveInputMode('file');
                setPreviewResult(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeInputMode === 'file'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File (.xlsx / .csv)
            </button>
            <button
              onClick={() => {
                setActiveInputMode('text');
                setPreviewResult(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeInputMode === 'text'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Tempel Format Teks (CSV)
            </button>
          </div>

          {/* Mode 1: File Upload */}
          {activeInputMode === 'file' && (
            <div className="space-y-4">
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragOver
                    ? 'border-blue-400 bg-blue-500/10'
                    : 'border-slate-700 hover:border-blue-500/50 bg-slate-950/40 hover:bg-slate-950/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, .txt"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {file ? file.name : 'Klik untuk memilih file Excel (.xlsx) atau Drag & Drop'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Format kolom: <code className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded">no; user; password; profile; nas; service; ip; name; phone; address</code>
                  </p>
                </div>
                {file && (
                  <span className="text-xs font-semibold text-white bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    File terpilih ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Belum punya file? Unduh template resmi siap diisi:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadCustomerTemplateCSV()}
                    className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    Template CSV (.csv)
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => downloadCustomerTemplateExcel()}
                    className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    Template Excel (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Paste Raw CSV Text */}
          {activeInputMode === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-medium text-slate-300">
                  Tempel data baris pelanggan (Pemisah titik-koma <code className="text-blue-400 font-mono">;</code> atau koma):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillUserPromptData}
                    className="text-xs text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Muat 47 data akun PPPoE dari teks yang Anda kirimkan"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Muat 47 Akun Saya
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillBulkSample(100)}
                    className="text-xs text-cyan-300 hover:text-cyan-200 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Uji coba muat 100 data akun PPPoE massal sekaligus"
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Uji 100 Akun Massal
                  </button>
                  <button
                    type="button"
                    onClick={handleFillSample}
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                  >
                    Contoh 5 Baris
                  </button>
                </div>
              </div>
              <textarea
                rows={7}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="no;user;password;profile;nas;service;ip;name;phone;address&#10;1;ALAMIN;ALAMIN;5 MBPS;MASMEDIA;-;10.10.10.66;ALAMIN;6285331752024;Batulintang"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
              <button
                type="button"
                onClick={handleProcessText}
                disabled={isProcessing || !rawText.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Validasi & Pratinjau Data Teks
              </button>
            </div>
          )}

          {/* Preview Table Result */}
          {previewResult && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hasil Pratinjau ({previewResult.importedCustomers.length} Pelanggan Terdeteksi)
                  </h4>
                </div>
                {previewResult.errors.length > 0 && (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {previewResult.errors.length} baris diabaikan / tidak lengkap
                  </span>
                )}
              </div>

              {previewResult.importedCustomers.length > 50 && (
                <div className="text-[11px] text-slate-300 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    Menampilkan 50 baris pertama untuk pratinjau cepat (dari total{' '}
                    <strong className="text-white font-bold">{previewResult.importedCustomers.length}</strong> akun).
                  </span>
                  <span className="text-white font-semibold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    Semua {previewResult.importedCustomers.length} akun akan diimpor sekaligus
                  </span>
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                    <tr>
                      <th className="px-3 py-2">No</th>
                      <th className="px-3 py-2">User / RADIUS</th>
                      <th className="px-3 py-2">Password</th>
                      <th className="px-3 py-2">Profile</th>
                      <th className="px-3 py-2">IP Address</th>
                      <th className="px-3 py-2">Nama Lengkap</th>
                      <th className="px-3 py-2">No WhatsApp</th>
                      <th className="px-3 py-2">Alamat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {previewResult.importedCustomers.slice(0, 50).map((c, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{i + 1}</td>
                        <td className="px-3 py-2 font-mono font-bold text-blue-400">{c.username}</td>
                        <td className="px-3 py-2 font-mono text-slate-400">{c.password}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                            {packages.find(p => p.id === c.packageId)?.name || '5 MBPS'}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">{c.ipAddress}</td>
                        <td className="px-3 py-2 font-medium text-white">{c.name}</td>
                        <td className="px-3 py-2 font-mono text-slate-400">{c.phone}</td>
                        <td className="px-3 py-2 text-slate-400 truncate max-w-[150px]">{c.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!previewResult || previewResult.importedCustomers.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                previewResult && previewResult.importedCustomers.length > 0
                  ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Impor Semua ({previewResult?.importedCustomers.length || 0} Akun) Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
