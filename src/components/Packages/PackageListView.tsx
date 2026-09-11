import React, { useState } from 'react';
import { InternetPackage } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Wifi,
  Download,
  Upload,
  Clock,
  Users,
  Copy,
  Check,
  Terminal,
  X,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import { generatePackageProfileScript } from '../../utils/mikrotikScripts';

export const PackageListView: React.FC = () => {
  const { packages, addPackage, updatePackage, deletePackage, customers } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<InternetPackage | null>(null);

  // Script Modal State
  const [scriptModalPkg, setScriptModalPkg] = useState<InternetPackage | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState<number>(10);
  const [uploadSpeed, setUploadSpeed] = useState<number>(5);
  const [price, setPrice] = useState<number>(150000);
  const [validityDays, setValidityDays] = useState<number>(30);
  const [sharedUsers, setSharedUsers] = useState<number>(1);
  const [fupQuotaGB, setFupQuotaGB] = useState<number>(0);
  const [profileName, setProfileName] = useState('');
  const [poolName, setPoolName] = useState('pool-pppoe');
  const [category, setCategory] = useState<'pppoe' | 'hotspot' | 'both'>('pppoe');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setName('');
    setDownloadSpeed(10);
    setUploadSpeed(5);
    setPrice(150000);
    setValidityDays(30);
    setSharedUsers(1);
    setFupQuotaGB(0);
    setProfileName('profile-10m-custom');
    setPoolName('pool-pppoe');
    setCategory('pppoe');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: InternetPackage) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setDownloadSpeed(pkg.downloadSpeed);
    setUploadSpeed(pkg.uploadSpeed);
    setPrice(pkg.price);
    setValidityDays(pkg.validityDays);
    setSharedUsers(pkg.sharedUsers);
    setFupQuotaGB(pkg.fupQuotaGB || 0);
    setProfileName(pkg.profileName);
    setPoolName(pkg.poolName);
    setCategory(pkg.category);
    setDescription(pkg.description);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rateLimit = `${downloadSpeed}M/${uploadSpeed}M`;
    const cleanProfile = profileName.trim() || `profile-${(name || 'package').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    if (editingPkg) {
      updatePackage(editingPkg.id, {
        name,
        downloadSpeed,
        uploadSpeed,
        rateLimit,
        price,
        validityDays,
        sharedUsers,
        fupQuotaGB: fupQuotaGB > 0 ? fupQuotaGB : 0,
        profileName: cleanProfile,
        poolName,
        category,
        description,
      });
    } else {
      addPackage({
        name,
        downloadSpeed,
        uploadSpeed,
        rateLimit,
        price,
        validityDays,
        sharedUsers,
        fupQuotaGB: fupQuotaGB > 0 ? fupQuotaGB : 0,
        profileName: cleanProfile,
        poolName,
        priority: 7,
        category,
        description: description || `Paket internet ${downloadSpeed} Mbps kecepatan stabil.`,
        colorBadge: downloadSpeed >= 20 ? 'indigo' : downloadSpeed >= 10 ? 'blue' : 'blue',
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-white" />
            Paket Internet & Bandwidth Management
          </h2>
          <p className="text-xs text-slate-400">
            Atur limit kecepatan download/upload, tarif langganan, masa aktif, dan sync profile MikroTik
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Paket Baru
        </button>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map(pkg => {
          const subscriberCount = customers.filter(c => c.packageId === pkg.id).length;

          return (
            <div
              key={pkg.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative group transition-all"
            >
              <div>
                {/* Top Row: Category badge & Actions */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-white border border-blue-500/30">
                    {pkg.category === 'pppoe' ? 'PPPoE Client' : pkg.category === 'hotspot' ? 'Hotspot Voucher' : 'Semua Layanan'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setScriptModalPkg(pkg)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Salin Script MikroTik"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Edit Paket"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {packages.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus paket ${pkg.name}?`)) deletePackage(pkg.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Package Name & Price */}
                <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-blue-400 font-mono">
                    {formatRupiah(pkg.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ {pkg.validityDays} hari</span>
                </div>

                <p className="text-xs text-slate-400 mt-2 min-h-[32px]">{pkg.description}</p>

                {/* Speed Specs Badge */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-blue-400" /> Download
                    </span>
                    <span className="font-mono font-bold text-white">{pkg.downloadSpeed} Mbps</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-blue-400" /> Upload
                    </span>
                    <span className="font-mono font-bold text-white">{pkg.uploadSpeed} Mbps</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                    <span className="text-slate-400">Rate Limit:</span>
                    <span className="font-mono font-semibold text-blue-400">{pkg.rateLimit}</span>
                  </div>
                </div>

                {/* Additional Specs */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Shared: {pkg.sharedUsers} User</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-slate-500" />
                    <span>{pkg.fupQuotaGB ? `FUP: ${pkg.fupQuotaGB} GB` : 'FUP: Unlimited'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom footer: Subscriber Count & Quick Script */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  <strong className="text-white">{subscriberCount}</strong> Pelanggan Aktif
                </span>
                <button
                  onClick={() => setScriptModalPkg(pkg)}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  Script RouterOS &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPkg ? 'Edit Paket Internet' : 'Tambah Paket Internet Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Paket *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 15 Mbps Super"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Download Speed (Mbps) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={downloadSpeed}
                    onChange={e => setDownloadSpeed(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Upload Speed (Mbps) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={uploadSpeed}
                    onChange={e => setUploadSpeed(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tarif Harga (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-blue-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Masa Aktif (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={e => setValidityDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Shared Users</label>
                  <input
                    type="number"
                    min="1"
                    value={sharedUsers}
                    onChange={e => setSharedUsers(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Limit Kuota / FUP (GB, 0 = Unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    value={fupQuotaGB}
                    onChange={e => setFupQuotaGB(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">MikroTik Profile Name</label>
                  <input
                    type="text"
                    placeholder="profile-15m"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">IP Pool Name</label>
                  <input
                    type="text"
                    placeholder="pool-pppoe"
                    value={poolName}
                    onChange={e => setPoolName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Deskripsi Paket</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan kegunaan paket untuk pelanggan..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white shadow-md"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Script Generator Modal */}
      {scriptModalPkg && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Script MikroTik ROS: {scriptModalPkg.name}
                </h3>
              </div>
              <button
                onClick={() => setScriptModalPkg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400">
                Jalankan script ini di terminal MikroTik (Winbox / SSH / WebFig) untuk membuat PPP Profile & Hotspot Profile secara otomatis:
              </p>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-blue-400 overflow-x-auto max-h-60">
                  {generatePackageProfileScript(scriptModalPkg)}
                </pre>
                <button
                  onClick={() => handleCopyScript(generatePackageProfileScript(scriptModalPkg))}
                  className="absolute right-3 top-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin!' : 'Salin Script'}
                </button>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setScriptModalPkg(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
