import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WifiRegistration, InternetPackage } from '../../types';
import {
  Wifi,
  User,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Printer,
  Share2,
  Upload,
  Camera,
  Compass,
  ArrowRight,
  Info,
  Phone,
  Mail,
  Home,
  Check,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import { WifiRegistrationPdfModal } from './WifiRegistrationPdfModal';

interface WifiRegistrationFormSectionProps {
  onSuccessCreated?: (reg: WifiRegistration) => void;
}

export const WifiRegistrationFormSection: React.FC<WifiRegistrationFormSectionProps> = ({
  onSuccessCreated,
}) => {
  const { packages, ispProfile, paymentChannels, logActivity } = useApp();

  // Ambil profil paket dinamis dari Manajemen PPPoE & DHCP Server (Profile PPP)
  const dynamicPackages = packages.filter(p => p.isActive !== false && p.category !== 'hotspot');
  const availablePackages = dynamicPackages.length > 0 ? dynamicPackages : packages;
  const defaultPackage = availablePackages[0] || packages[0];

  // Form State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(defaultPackage?.id || '');
  const [fullName, setFullName] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  
  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState<string>('');
  const [emergencyRelation, setEmergencyRelation] = useState<string>('');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('');

  // Address
  const [address, setAddress] = useState<string>('');
  const [rtRw, setRtRw] = useState<string>('');
  const [village, setVillage] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [housingStatus, setHousingStatus] = useState<'owned' | 'rented' | 'office' | 'other'>('owned');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Schedule & Add-ons
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultInstallDate = tomorrow.toISOString().slice(0, 10);
  const [preferredDate, setPreferredDate] = useState<string>(defaultInstallDate);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'pagi' | 'siang' | 'sore'>('pagi');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [installationFee, setInstallationFee] = useState<number>(0); // Promo Rp 0 (Free) or 150000

  // Attachments Preview
  const [ktpPhotoPreview, setKtpPhotoPreview] = useState<string | null>(null);
  const [housePhotoPreview, setHousePhotoPreview] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Result / Modal
  const [createdRegistration, setCreatedRegistration] = useState<WifiRegistration | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [pdfModalFormat, setPdfModalFormat] = useState<'filled' | 'blank'>('filled');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sinkronisasi paket terpilih jika paket belum ada atau diubah di Manajemen PPPoE
  useEffect(() => {
    if (availablePackages.length > 0) {
      if (!selectedPackageId || !availablePackages.some(p => p.id === selectedPackageId)) {
        setSelectedPackageId(availablePackages[0].id);
      }
    }
  }, [availablePackages, selectedPackageId]);

  const handleOpenPdfModal = (formatPref?: 'filled' | 'blank') => {
    if (formatPref === 'blank') {
      setPdfModalFormat('blank');
      setShowPdfModal(true);
      return;
    }

    if (createdRegistration) {
      setPdfModalFormat('filled');
      setShowPdfModal(true);
      return;
    }

    const hasEnteredData = fullName.trim() || phone.trim() || address.trim();
    if (hasEnteredData) {
      const currentPkg = availablePackages.find(p => p.id === selectedPackageId) || defaultPackage;
      const liveReg: WifiRegistration = {
        id: `DRAFT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        createdAt: new Date().toISOString(),
        fullName: fullName.trim(),
        nik: nik.trim() || '-',
        phone: phone.trim() || '-',
        emergencyContactName: emergencyName.trim(),
        emergencyContactRelation: emergencyRelation.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
        email: email.trim(),
        occupation: occupation.trim(),
        address: address.trim() || '-',
        rtRw: rtRw.trim(),
        village: village.trim(),
        district: district.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        landmark: landmark.trim(),
        housingStatus,
        latitude: latitude.trim(),
        longitude: longitude.trim(),
        packageId: currentPkg?.id || '',
        packageName: currentPkg?.name || 'Paket Fiber',
        packageSpeed: currentPkg?.rateLimit || '20M/20M',
        packagePrice: currentPkg?.price || 0,
        installationFee,
        preferredDate,
        preferredTimeSlot,
        additionalServices: selectedAddons,
        ktpPhotoPreview: ktpPhotoPreview || undefined,
        housePhotoPreview: housePhotoPreview || undefined,
        agreedToTerms: true,
        notes: notes.trim(),
        status: 'pending',
      };
      setCreatedRegistration(liveReg);
      setPdfModalFormat('filled');
      setShowPdfModal(true);
    } else {
      // Clean blank template without any dummy text
      setPdfModalFormat('blank');
      setShowPdfModal(true);
    }
  };

  const selectedPkg = availablePackages.find(p => p.id === selectedPackageId) || defaultPackage;

  // Handle GPS Auto Detect
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur GPS tidak didukung di browser ini.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setIsDetectingLocation(false);
      },
      err => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        alert('Gagal mendeteksi lokasi otomatis. Silakan masukkan patokan rumah secara manual.');
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'house') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (type === 'ktp') setKtpPhotoPreview(dataUrl);
      if (type === 'house') setHousePhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const toggleAddon = (addon: string) => {
    setSelectedAddons(prev =>
      prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !nik.trim() || !phone.trim() || !address.trim()) {
      alert('Mohon lengkapi Nama, NIK KTP, No. WhatsApp, dan Alamat Pemasangan!');
      return;
    }

    if (!agreedToTerms) {
      alert('Anda harus menyetujui Syarat dan Ketentuan Berlangganan terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const regId = `REG-${dateStr}-${randomSuffix}`;

    const newReg: WifiRegistration = {
      id: regId,
      createdAt: new Date().toISOString(),
      fullName: fullName.trim(),
      nik: nik.trim(),
      phone: phone.trim(),
      emergencyContactName: emergencyName.trim(),
      emergencyContactRelation: emergencyRelation,
      emergencyContactPhone: emergencyPhone.trim(),
      email: email.trim(),
      occupation: occupation.trim(),
      address: address.trim(),
      rtRw: rtRw.trim(),
      village: village.trim() || 'Kelurahan Setempat',
      district: district.trim() || 'Kecamatan Setempat',
      city: city.trim() || 'Kota/Kabupaten',
      postalCode: postalCode.trim(),
      landmark: landmark.trim() || 'Rumah calon pelanggan',
      latitude,
      longitude,
      housingStatus,
      packageId: selectedPkg?.id || 'pkg-default',
      packageName: selectedPkg?.name || 'Paket Internet Fiber',
      packageSpeed: selectedPkg?.rateLimit || '20M/20M',
      packagePrice: selectedPkg?.price || 175000,
      installationFee,
      preferredDate,
      preferredTimeSlot,
      additionalServices: selectedAddons,
      ktpPhotoPreview: ktpPhotoPreview || undefined,
      housePhotoPreview: housePhotoPreview || undefined,
      agreedToTerms: true,
      notes: notes.trim(),
      status: 'pending',
    };

    // Save to localStorage so it persists across reloads
    try {
      const existingStr = localStorage.getItem('masmedia_wifi_registrations');
      const existing: WifiRegistration[] = existingStr ? JSON.parse(existingStr) : [];
      existing.unshift(newReg);
      localStorage.setItem('masmedia_wifi_registrations', JSON.stringify(existing.slice(0, 50)));
    } catch (err) {
      console.error('Failed to save registration locally:', err);
    }

    logActivity(
      'customer',
      'Pendaftaran Pasang Baru WiFi',
      `Pendaftaran baru diterima: ${newReg.fullName} (${newReg.phone}) - Paket: ${newReg.packageName} (${regId})`
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedRegistration(newReg);
      setShowPdfModal(true);
      if (onSuccessCreated) onSuccessCreated(newReg);
    }, 600);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Form Intro */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <Wifi className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Formulir Pasang Baru ISP
                </span>
                <span className="text-[10px] text-slate-400">100% Fiber Optic Dedicated</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Pendaftaran Sambungan WiFi Baru &amp; Berkas PDF
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Daftar mandiri dari rumah! Dapatkan nomor formulir resmi, surat kontrak berlangganan siap cetak PDF, dan jadwal teknisi cepat.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleOpenPdfModal('filled')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              title="Buka Formulir PDF Pendaftaran Baru (bisa dicetak atau dibagikan)"
            >
              <FileText className="w-4 h-4" />
              <span>{createdRegistration ? `Formulir PDF (${createdRegistration.id})` : 'Formulir PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BAGIAN 1: PILIHAN PAKET INTERNET */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                1
              </span>
              <h3 className="text-sm font-bold text-white">
                Pilih Paket Layanan Internet Rumah / Bisnis
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">Unlimited Tanpa Kuota / FUP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {availablePackages.map(pkg => {
              const isSelected = selectedPackageId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {pkg.rateLimit}
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">{pkg.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{pkg.description || 'Koneksi stabil fiber optik untuk streaming, gaming, dan WFH.'}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Tarif Bulanan:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {formatRupiah(pkg.price)}
                      <span className="text-[10px] font-normal text-slate-400">/bln</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Opsi Biaya Pasang Baru & Addon */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Biaya Pasang Baru / Registrasi:</span>
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Ditentukan Saat Survey</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Biaya instalasi &amp; tarikan kabel dropcore FO ditentukan langsung oleh teknisi saat survey lokasi/kelayakan ODP.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">Perangkat Tambahan (Add-On Opsional):</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Mesh WiFi Extender (+Rp 25.000/bln)',
                  'STB Android TV 4K (+Rp 35.000/bln)',
                  'IP Publik Statis (+Rp 50.000/bln)',
                ].map(addon => {
                  const active = selectedAddons.includes(addon);
                  return (
                    <button
                      type="button"
                      key={addon}
                      onClick={() => toggleAddon(addon)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        active
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {addon}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: DATA IDENTITAS CALON PELANGGAN */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
              2
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                Data Identitas Calon Pelanggan (Pemohon)
              </h3>
              <p className="text-[11px] text-slate-400">
                Sesuai standar ISP Indonesia (KTP dan kontak aktif verifikasi)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nama Lengkap (Sesuai KTP) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                No. Induk Kependudukan (NIK KTP 16 Digit) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="3201xxxxxxxxxxxx"
                value={nik}
                onChange={e => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                No. WhatsApp / HP Aktif <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="0812xxxxxxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Alamat Email (Untuk Invoice Digital)
              </label>
              <input
                type="email"
                placeholder="budi@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Pekerjaan / Bidang Usaha
              </label>
              <input
                type="text"
                placeholder="Karyawan Swasta / Wiraswasta"
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Status Bangunan / Rumah
              </label>
              <select
                value={housingStatus}
                onChange={e => setHousingStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="owned">Rumah Milik Sendiri</option>
                <option value="rented">Sewa / Kontrak / Kost</option>
                <option value="office">Kantor / Ruko / Usaha</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Kontak Darurat / Keluarga */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Kontak Darurat / Penanggung Jawab Lain:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nama Keluarga / Kerabat</label>
                <input
                  type="text"
                  placeholder="Nama kerabat"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Hubungan</label>
                <input
                  type="text"
                  placeholder="Istri / Orang Tua / Saudara"
                  value={emergencyRelation}
                  onChange={e => setEmergencyRelation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nomor Telepon Darurat</label>
                <input
                  type="text"
                  placeholder="08xxxxxxxx"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: ALAMAT LENGKAP & TITIK LOKASI PEMASANGAN */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                3
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Alamat Pemasangan &amp; Titik Tarikan Kabel (Dropcore)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Untuk penentuan tiang ODP Fiber terdekat oleh teknisi
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <Compass className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Mencari GPS...' : 'Ambil Titik GPS Saya'}</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Alamat Jalan &amp; Nomor Rumah <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Contoh: Jl. Melati Raya No. 15, Blok B4"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">RT / RW</label>
                <input
                  type="text"
                  placeholder="002/005"
                  value={rtRw}
                  onChange={e => setRtRw(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kelurahan / Desa</label>
                <input
                  type="text"
                  placeholder="Kelurahan"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kecamatan</label>
                <input
                  type="text"
                  placeholder="Kecamatan"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  placeholder="Kota / Kab"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Patokan / Titik Acuan Lokasi (PENTING untuk Teknisi) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Samping Musholla Al-Ikhlas, Rumah Pagar Hitam, Depan Warung Bu Sri"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude (GPS)</label>
                  <input
                    type="text"
                    placeholder="-6.2088"
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude (GPS)</label>
                  <input
                    type="text"
                    placeholder="106.8456"
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 4: JADWAL & UNGGAH BERKAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
              4
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                Rencana Jadwal Instalasi &amp; Berkas Pendukung
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih waktu yang cocok saat Anda berada di rumah
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tanggal Pemasangan yang Diinginkan
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Sesi Waktu Kunjungan Teknisi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pagi', label: 'Pagi', time: '09:00 - 12:00' },
                  { id: 'siang', label: 'Siang', time: '13:00 - 15:00' },
                  { id: 'sore', label: 'Sore', time: '15:00 - 17:00' },
                ].map(slot => (
                  <button
                    type="button"
                    key={slot.id}
                    onClick={() => setPreferredTimeSlot(slot.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      preferredTimeSlot === slot.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="font-bold block text-xs">{slot.label}</span>
                    <span className="text-[10px] text-slate-400 block">{slot.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Foto KTP & Rumah (Opsional / Pratinjau) */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Foto KTP Asli (Opsional untuk Verifikasi Cepat)
              </label>
              <div className="p-3 bg-slate-950 border border-dashed border-slate-800 rounded-2xl flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handlePhotoUpload(e, 'ktp')}
                  className="text-[11px] text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                />
                {ktpPhotoPreview && (
                  <img
                    src={ktpPhotoPreview}
                    alt="KTP Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-emerald-500"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Foto Rumah Tampak Depan (Opsional)
              </label>
              <div className="p-3 bg-slate-950 border border-dashed border-slate-800 rounded-2xl flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handlePhotoUpload(e, 'house')}
                  className="text-[11px] text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                />
                {housePhotoPreview && (
                  <img
                    src={housePhotoPreview}
                    alt="Rumah Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-emerald-500"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SYARAT KETENTUAN & SUBMIT */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Pernyataan &amp; Syarat Berlangganan:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pl-1">
              <li>Perangkat modem ONT dan kabel fiber adalah hak milik ISP yang dipinjamkan secara gratis selama berlangganan.</li>
              <li>Minimal masa berlangganan aktif adalah 3 (tiga) bulan.</li>
              <li>Pembayaran tagihan pertama dibayarkan setelah internet berhasil terpasang dan aktif oleh tim teknisi.</li>
            </ul>
            <label className="flex items-center gap-2.5 pt-2 border-t border-slate-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-white font-semibold">
                Saya menyetujui seluruh Syarat &amp; Ketentuan Berlangganan di atas dengan sah.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-xs text-slate-400 block">Estimasi Iuran Paket Bulanan:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {formatRupiah(selectedPkg?.price || 0)} <span className="text-xs font-normal text-slate-400">/bln</span>
              </span>
              <span className="text-[11px] text-slate-400 block">
                Biaya Pasang Baru: <strong className="text-amber-400">Ditentukan Saat Survey</strong> (oleh teknisi di lokasi)
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleOpenPdfModal('blank')}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-md"
                title="Cetak formulir blangko fisik kosong"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Blangko Kosong</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran & Cetak PDF'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* PDF Modal Viewer & Printable Sheet */}
      <WifiRegistrationPdfModal
        registration={createdRegistration}
        isOpen={showPdfModal}
        defaultFormat={pdfModalFormat}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
};
