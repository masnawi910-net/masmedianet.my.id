import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Phone,
  MapPin,
  Key,
  Shield,
  Package,
  Server,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  generateRandomPassword,
  generateRadiusUsername,
} from '../../utils/formatters';
import { DueDateMiniCalendar } from '../common/DueDateMiniCalendar';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { packages, nasList, addCustomer, updateCustomer, isolirConfig } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rtRw, setRtRw] = useState('RT 01 / RW 04');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [packageId, setPackageId] = useState('');
  const [nasId, setNasId] = useState('');
  const [connectionType, setConnectionType] = useState<'pppoe' | 'hotspot'>('pppoe');
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [onuSerial, setOnuSerial] = useState('');
  const [installDate, setInstallDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDateDay, setDueDateDay] = useState(10);
  const [autoIsolate, setAutoIsolate] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setAddress(customerToEdit.address);
      setRtRw(customerToEdit.rtRw || 'RT 01 / RW 04');
      setUsername(customerToEdit.username);
      setPassword(customerToEdit.password);
      setPackageId(customerToEdit.packageId);
      setNasId(customerToEdit.nasId);
      setConnectionType(customerToEdit.connectionType);
      setIpAddress(customerToEdit.ipAddress);
      setMacAddress(customerToEdit.macAddress || '');
      setOnuSerial(customerToEdit.onuSerial || '');
      setInstallDate(customerToEdit.installDate);
      setDueDateDay(customerToEdit.dueDateDay);
      setAutoIsolate(customerToEdit.autoIsolate);
      setNotes(customerToEdit.notes || '');
    } else {
      // Defaults for new customer
      setName('');
      setPhone('');
      setAddress('');
      setRtRw('RT 01 / RW 04');
      setUsername('');
      setPassword(generateRandomPassword(8));
      setPackageId(packages[0]?.id || '');
      setNasId(nasList[0]?.id || '');
      setConnectionType('pppoe');
      setIpAddress('10.10.10.' + Math.floor(20 + Math.random() * 80));
      setMacAddress('');
      setOnuSerial('ZTEGC' + Math.floor(10000000 + Math.random() * 90000000));
      setInstallDate(new Date().toISOString().slice(0, 10));
      setDueDateDay(isolirConfig.defaultDueDateDay);
      setAutoIsolate(true);
      setNotes('');
    }
  }, [customerToEdit, isOpen, packages, nasList, isolirConfig]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!customerToEdit && val) {
      setUsername(generateRadiusUsername(val, '01'));
    }
  };

  const handleGeneratePassword = () => {
    setPassword(generateRandomPassword(8));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !username.trim() || !password.trim()) {
      alert('Mohon isi nama, no HP, username, dan password!');
      return;
    }

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name,
        phone,
        address,
        rtRw,
        username,
        password,
        packageId,
        nasId,
        connectionType,
        ipAddress,
        macAddress,
        onuSerial,
        installDate,
        dueDateDay,
        autoIsolate,
        notes,
      });
    } else {
      addCustomer({
        name,
        phone,
        address,
        rtRw,
        username,
        password,
        packageId,
        nasId,
        connectionType,
        ipAddress,
        macAddress,
        onuSerial,
        installDate,
        dueDateDay,
        autoIsolate,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {customerToEdit ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <p className="text-xs text-slate-400">Pengaturan akun RADIUS, profil MikroTik & penagihan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Section: Identitas Pelanggan */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              1. Identitas Pelanggan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">No. WhatsApp / HP *</label>
                <input
                  type="text"
                  required
                  placeholder="081234567890"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Alamat Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Merak No. 12, RT 02 / RW 04"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Akun RADIUS & Koneksi */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Kredensial RADIUS & MikroTik
            </h4>

            <div className="mb-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-400" />
              <span>
                Status koneksi awal adalah <strong className="text-white">Offline</strong>. Pelanggan baru hanya akan berstatus <strong className="text-blue-400">Online</strong> setelah modem/ONT terhubung dan berhasil melakukan dial-in PPPoE ke MikroTik.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Username RADIUS *</label>
                <input
                  type="text"
                  required
                  placeholder="budi_m12"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-blue-400 font-mono font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password RADIUS *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Acak Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tipe Koneksi</label>
                <select
                  value={connectionType}
                  onChange={e => setConnectionType(e.target.value as 'pppoe' | 'hotspot')}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="pppoe">PPPoE Client (Rumahan)</option>
                  <option value="hotspot">Hotspot / WiFi Voucher</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Router NAS MikroTik</label>
                <select
                  value={nasId}
                  onChange={e => setNasId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  {nasList.map(nas => (
                    <option key={nas.id} value={nas.id}>
                      {nas.name} ({nas.ipAddress})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">IP Address Static (Opsional)</label>
                <input
                  type="text"
                  placeholder="10.10.10.22"
                  value={ipAddress}
                  onChange={e => setIpAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Serial Number Modem / ONT</label>
                <input
                  type="text"
                  placeholder="ZTEGC11223344"
                  value={onuSerial}
                  onChange={e => setOnuSerial(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Paket Internet & Billing */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              3. Paket Internet & Billing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Pilih Paket Internet *</label>
                <select
                  value={packageId}
                  onChange={e => setPackageId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.rateLimit}) - Rp {pkg.price.toLocaleString('id-ID')}/bln
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <DueDateMiniCalendar
                  value={dueDateDay}
                  onChange={day => setDueDateDay(day)}
                  label="Tanggal Jatuh Tempo Tiap Bulan"
                  min={1}
                  max={28}
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">Otomatis Isolir MikroTik</span>
                  <span className="text-[11px] text-slate-400">
                    Jika menunggak setelah jatuh tempo + toleransi {isolirConfig.gracePeriodDays} hari, firewall MikroTik otomatis mengisolir
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoIsolate}
                  onChange={e => setAutoIsolate(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-400 bg-slate-800 border-slate-700 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Lokasi tiang ODP, tipe ONT, catatan pemasangan..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {customerToEdit ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
