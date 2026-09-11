import React, { useState, useEffect, useMemo } from 'react';
import masmediaLogo from '../../assets/images/masmedia_logo_modern_1788628511980.jpg';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  Phone,
  MessageCircle,
  Building2,
  MapPin,
  Compass,
  Home,
  Check,
  Sparkles,
  Send,
  RefreshCw,
  Inbox,
  ExternalLink,
  KeyRound,
  X,
} from 'lucide-react';
import {
  ALL_INDONESIA_PROVINCES,
  getCitiesForProvince,
  getDistrictsForCity,
  getVillagesForDistrict,
} from '../../data/indonesiaRegions';
import {
  getDistrictsAsync,
  getVillagesAsync,
  getProvincesAsync,
} from '../../services/indonesiaRegionService';
import {
  sendActivationEmail,
  generateActivationCode,
  getSentEmailLogs,
} from '../../services/emailService';

export const LoginPage: React.FC = () => {
  const { login, addTenant, tenants, accounts, theme, activateAccount, resendActivationCode } = useApp();
  const isDark = theme === 'dark';

  // Login form state
  const [identifierInput, setIdentifierInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // 1. Akun & Kredensial
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // 2. Data Lengkap & Alamat Wilayah
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regProvince, setRegProvince] = useState('Jawa Barat');
  const [regCity, setRegCity] = useState('Kota Bandung');
  const [regDistrict, setRegDistrict] = useState('Coblong');
  const [customDistrict, setCustomDistrict] = useState('');
  const [useCustomDistrict, setUseCustomDistrict] = useState(false);
  const [regVillage, setRegVillage] = useState('Dago');
  const [customVillage, setCustomVillage] = useState('');
  const [useCustomVillage, setUseCustomVillage] = useState(false);

  const [liveDistricts, setLiveDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [liveVillages, setLiveVillages] = useState<string[]>([]);
  const [loadingVillages, setLoadingVillages] = useState(false);

  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Activation & Verification Modal state
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showRegistrationSuccessModal, setShowRegistrationSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredUsername, setRegisteredUsername] = useState('');
  const [activationTargetEmail, setActivationTargetEmail] = useState('');
  const [activationTargetUsername, setActivationTargetUsername] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [activationMsg, setActivationMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [lastEmailDispatchInfo, setLastEmailDispatchInfo] = useState<{
    sentReal?: boolean;
    code?: string;
    message?: string;
    htmlPreview?: string;
  } | null>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

  // Handle URL activation query parameters (?action=activate&code=123456&email=xxx)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      const code = urlParams.get('code');
      const email = urlParams.get('email');

      if (action === 'activate' && (email || code)) {
        const target = (email || '').trim();
        const otp = (code || '').trim();
        
        if (target && otp) {
          // Automatic instant activation when user clicks link in Gmail
          const res = activateAccount(target, otp);
          if (res.success) {
            setSuccessMsg(`✅ Akun Anda (${target}) berhasil diaktivasi via tautan email Gmail! Silakan masukkan password untuk login dan memilih Paket Langganan & Sewa Bulanan Mitra Pengelola.`);
            setErrorMsg('');
            setIdentifierInput(target);
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            return;
          }
        }

        if (email) {
          setActivationTargetEmail(email);
          setActivationTargetUsername(email);
        }
        if (code) {
          setEnteredOtp(code);
        }
        setShowActivationModal(true);
        setActivationMsg({
          text: 'Tautan aktivasi email Gmail terdeteksi. Silakan klik tombol "Verifikasi & Aktifkan Akun" di bawah ini.',
        });
      }
    } catch (e) {
      console.warn('Failed to parse URL query:', e);
    }
  }, []);

  // Fetch live Kemendagri districts when province or city changes
  useEffect(() => {
    let isMounted = true;
    if (!regProvince || !regCity) return;

    setLoadingDistricts(true);
    getDistrictsAsync(regProvince, regCity)
      .then(res => {
        if (isMounted) {
          if (res && res.length > 0) {
            setLiveDistricts(res);
          }
          setLoadingDistricts(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingDistricts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [regProvince, regCity]);

  // Cascading options lists
  const availableCities = useMemo(() => {
    return getCitiesForProvince(regProvince);
  }, [regProvince]);

  const availableDistricts = useMemo(() => {
    const offlineDistricts = getDistrictsForCity(regProvince, regCity);
    if (liveDistricts && liveDistricts.length > 0) {
      // Merge unique
      const combined = Array.from(new Set([...liveDistricts, ...offlineDistricts]));
      return combined.sort((a, b) => a.localeCompare('id'));
    }
    return offlineDistricts;
  }, [regProvince, regCity, liveDistricts]);

  const activeDistrictName = useCustomDistrict ? customDistrict : regDistrict;

  // Fetch live Kemendagri villages when province, city, or activeDistrictName changes
  useEffect(() => {
    let isMounted = true;
    if (!regProvince || !regCity || !activeDistrictName) return;

    setLoadingVillages(true);
    getVillagesAsync(regProvince, regCity, activeDistrictName)
      .then(res => {
        if (isMounted) {
          if (res && res.length > 0) {
            setLiveVillages(res);
          } else {
            setLiveVillages([]);
          }
          setLoadingVillages(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingVillages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [regProvince, regCity, activeDistrictName]);

  const availableVillages = useMemo(() => {
    const offlineVillages = getVillagesForDistrict(regProvince, regCity, activeDistrictName);
    if (liveVillages && liveVillages.length > 0) {
      const combined = Array.from(new Set([...liveVillages, ...offlineVillages]));
      return combined.sort((a, b) => a.localeCompare('id'));
    }
    return offlineVillages;
  }, [regProvince, regCity, activeDistrictName, liveVillages]);

  // Automatically update selected village if current is invalid
  useEffect(() => {
    if (!useCustomVillage && availableVillages.length > 0) {
      if (!availableVillages.includes(regVillage)) {
        setRegVillage(availableVillages[0]);
      }
    }
  }, [availableVillages, useCustomVillage, regVillage]);

  // When province changes, update city
  const handleProvinceChange = (newProv: string) => {
    setRegProvince(newProv);
    const newCities = getCitiesForProvince(newProv);
    const defaultCity = newCities[0] || '';
    setRegCity(defaultCity);

    const newDistricts = getDistrictsForCity(newProv, defaultCity);
    const defaultDistrict = newDistricts[0] || '';
    setRegDistrict(defaultDistrict);
    setUseCustomDistrict(false);
    setCustomDistrict('');

    const newVillages = getVillagesForDistrict(newProv, defaultCity, defaultDistrict);
    setRegVillage(newVillages[0] || '');
    setUseCustomVillage(false);
  };

  // When city changes, update district
  const handleCityChange = (newCity: string) => {
    setRegCity(newCity);
    const newDistricts = getDistrictsForCity(regProvince, newCity);
    const defaultDistrict = newDistricts[0] || '';
    setRegDistrict(defaultDistrict);
    setUseCustomDistrict(false);
    setCustomDistrict('');

    const newVillages = getVillagesForDistrict(regProvince, newCity, defaultDistrict);
    setRegVillage(newVillages[0] || '');
    setUseCustomVillage(false);
  };

  // When district changes, update village
  const handleDistrictChange = (newDistrict: string) => {
    setRegDistrict(newDistrict);
    const newVillages = getVillagesForDistrict(regProvince, regCity, newDistrict);
    setRegVillage(newVillages[0] || '');
    setUseCustomVillage(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim()) {
      setErrorMsg('Harap masukkan Nama Pengguna atau Email akun Anda!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = login(identifierInput, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Nama pengguna/email atau password yang dimasukkan salah!');
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanPass = regPassword.trim();
    const cleanConfirmPass = regConfirmPass.trim();
    const cleanFullName = regFullName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();
    const cleanStreet = regStreet.trim();
    const cleanProv = regProvince.trim();
    const cleanCity = regCity.trim();
    const finalDistrict = useCustomDistrict ? customDistrict.trim() : regDistrict.trim();
    const finalVillage = useCustomVillage ? customVillage.trim() : regVillage.trim();

    // 1. Validasi Kredensial
    if (!cleanUsername) {
      setRegError('Nama pengguna (username) wajib diisi!');
      return;
    }
    if (cleanUsername.length < 3) {
      setRegError('Nama pengguna minimal 3 karakter!');
      return;
    }
    if (!cleanPass) {
      setRegError('Password wajib diisi!');
      return;
    }
    if (cleanPass.length < 4) {
      setRegError('Password minimal 4 karakter!');
      return;
    }
    if (cleanPass !== cleanConfirmPass) {
      setRegError('Konfirmasi password tidak cocok dengan password!');
      return;
    }

    // 2. Validasi Data Diri & Alamat
    if (!cleanFullName) {
      setRegError('Nama lengkap wajib diisi!');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setRegError('Format email tidak valid!');
      return;
    }
    if (!cleanPhone) {
      setRegError('Nomor WhatsApp wajib diisi!');
      return;
    }
    if (!cleanStreet) {
      setRegError('Alamat jalan (RT/RW) wajib diisi!');
      return;
    }
    if (!cleanProv) {
      setRegError('Pilihan provinsi wajib dipilih!');
      return;
    }
    if (!cleanCity) {
      setRegError('Pilihan kota/kabupaten wajib dipilih!');
      return;
    }
    if (!finalDistrict) {
      setRegError('Pilihan atau isian kecamatan wajib diisi!');
      return;
    }
    if (!finalVillage) {
      setRegError('Pilihan atau isian desa/kelurahan wajib diisi!');
      return;
    }

    // Uniqueness checks
    const isExistingUsername = accounts.some(
      a => (a.username || '').toLowerCase() === cleanUsername
    );
    if (isExistingUsername) {
      if (cleanUsername === 'admin') {
        setRegError('Nama pengguna "admin" adalah akun default Super Admin sistem. Silakan buat nama pengguna unik lain (contoh: ' + (cleanFullName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 12) || 'mitra_net') + ').');
      } else {
        setRegError(`Nama pengguna "${cleanUsername}" sudah digunakan. Silakan gunakan nama pengguna lain.`);
      }
      return;
    }

    const isExistingEmail = accounts.some(
      a => (a.email || '').toLowerCase() === cleanEmail
    );
    if (isExistingEmail) {
      setRegError('EMAIL_ALREADY_REGISTERED');
      return;
    }

    setIsRegistering(true);

    setTimeout(async () => {
      const cleanSub = cleanUsername.replace(/[^a-z0-9]/g, '').slice(0, 15) || 'net';
      const ispName = `ISP ${cleanFullName}`;
      const code = cleanSub.slice(0, 4).toUpperCase();
      const formattedAddress = `${cleanStreet}, Kel./Desa ${finalVillage}, Kec. ${finalDistrict}, ${cleanCity}, Prov. ${cleanProv}`;
      const generatedOtp = generateActivationCode();

      // Register new Tenant & Admin Account (Mitra ISP baru belum memiliki paket sewa, wajib pilih setelah aktivasi/login)
      addTenant(
        {
          name: ispName,
          code,
          slug: cleanSub,
          subdomain: cleanSub,
          plan: 'unselected',
          hasSelectedPlan: false,
          maxCustomers: 0,
          maxNas: 0,
          status: 'active',
          subscriptionStatus: 'due',
          ownerName: cleanFullName,
          ownerEmail: cleanEmail,
          ownerPhone: cleanPhone,
          phone: cleanPhone,
          email: cleanEmail,
          streetAddress: cleanStreet,
          province: cleanProv,
          city: cleanCity,
          district: finalDistrict,
          village: finalVillage,
          address: formattedAddress,
        },
        {
          username: cleanUsername,
          name: cleanFullName,
          email: cleanEmail,
          password: cleanPass,
          phone: cleanPhone,
          streetAddress: cleanStreet,
          province: cleanProv,
          city: cleanCity,
          district: finalDistrict,
          village: finalVillage,
        }
      );

      // Trigger Email Dispatch to registrant's email
      try {
        const emailRes = await sendActivationEmail({
          email: cleanEmail,
          name: cleanFullName,
          username: cleanUsername,
          activationCode: generatedOtp,
          tenantName: ispName,
          planName: 'Wajib Pilih Paket Saat Login',
          address: formattedAddress,
          phone: cleanPhone,
        });

        setLastEmailDispatchInfo({
          sentReal: emailRes.sentReal,
          code: generatedOtp,
          message: emailRes.message,
          htmlPreview: emailRes.htmlPreview,
        });
      } catch (err: any) {
        console.warn('Failed to send email activation on registration:', err);
      }

      setIsRegistering(false);
      setShowRegisterModal(false);

      // Open friendly post-registration success modal instructing user to check Gmail
      setRegisteredEmail(cleanEmail);
      setRegisteredUsername(cleanUsername);
      setActivationTargetEmail(cleanEmail);
      setActivationTargetUsername(cleanUsername);
      setEnteredOtp('');
      setShowRegistrationSuccessModal(true);

      // Prepopulate login form
      setIdentifierInput(cleanUsername);
      setPassword(cleanPass);
    }, 450);
  };

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      setActivationMsg({ text: 'Harap masukkan 6-digit kode aktivasi!', isError: true });
      return;
    }

    setIsActivating(true);
    setActivationMsg(null);

    setTimeout(() => {
      const res = activateAccount(activationTargetEmail || activationTargetUsername, enteredOtp);
      setIsActivating(false);

      if (res.success) {
        setShowActivationModal(false);
        setSuccessMsg(res.message);
        setErrorMsg('');
      } else {
        setActivationMsg({ text: res.message, isError: true });
      }
    }, 400);
  };

  const handleResendOtp = async () => {
    if (!activationTargetEmail && !activationTargetUsername) return;
    setIsResending(true);
    setActivationMsg(null);

    const res = resendActivationCode(activationTargetEmail || activationTargetUsername);
    if (res.success && res.code) {
      try {
        const sendRes = await sendActivationEmail({
          email: activationTargetEmail,
          name: activationTargetUsername,
          username: activationTargetUsername,
          activationCode: res.code,
          tenantName: 'Masmedia Network',
        });

        setLastEmailDispatchInfo({
          sentReal: sendRes.sentReal,
          code: res.code,
          message: sendRes.message,
          htmlPreview: sendRes.htmlPreview,
        });

        setActivationMsg({
          text: sendRes.sentReal
            ? `Kode aktivasi baru (${res.code}) telah dikirim ke ${activationTargetEmail}.`
            : `Kode aktivasi baru (${res.code}) telah dibuat untuk ${activationTargetEmail}.`,
        });
      } catch (err: any) {
        setActivationMsg({
          text: `Kode aktivasi baru dibuat: ${res.code}. Masukkan kode tersebut untuk mengaktifkan.`,
        });
      }
    } else {
      setActivationMsg({ text: res.message, isError: true });
    }
    setIsResending(false);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between select-none relative overflow-hidden transition-colors duration-200 ${
      isDark
        ? 'bg-slate-950 text-slate-100'
        : 'bg-gradient-to-br from-[#3b0313] via-[#5c072b] to-[#45051e] text-white'
    }`}>
      {/* Decorative Subtle Grid Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>
      </div>

      {/* Ambient Glowing Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-blue-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-900 border border-blue-500/50 flex items-center justify-center shadow-lg">
            <img
              src={masmediaLogo}
              alt="Masmedia Network Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight inline-flex items-center select-none">
                <span className="blink-blue-cyan">Mas</span>
                <span className="blink-cyan-blue">media</span>
                <span className="blink-blue-cyan ml-1.5">Network</span>
              </span>
              <span className="text-[8px] sm:text-[8.5px] font-bold tracking-normal px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 leading-none">
                Masmedia Apps
              </span>
            </div>
            <p className="text-[11px] font-semibold text-white/90">
              Sistem Manajemen Billing & Jaringan
            </p>
          </div>
        </div>
      </header>

      {/* Main Centered Login Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-pink-700/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center mx-auto text-pink-400 shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Masuk ke Akun
            </h2>
            <p className="text-xs text-slate-400">
              Masukkan nama pengguna / email dan password Anda untuk masuk ke sistem.
            </p>
          </div>

          {/* Success Alert Message */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center gap-2.5 text-white text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Error Alert Message */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username or Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Nama Pengguna atau Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Masukkan nama pengguna atau email..."
                  value={identifierInput}
                  onChange={e => {
                    setIdentifierInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 font-medium transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password Anda..."
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-pink-600 focus:ring-pink-500 bg-slate-950 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">Ingat saya</span>
              </label>
              <span className="text-xs text-pink-400 hover:underline cursor-pointer">
                Lupa sandi?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 hover:from-pink-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-lg shadow-pink-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Section Below 'Masuk ke Sistem' */}
          <div className="pt-3 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setRegError('');
                  setRegUsername('');
                  setRegPassword('');
                  setRegConfirmPass('');
                  setRegFullName('');
                  setRegEmail('');
                  setRegPhone('');
                  setRegStreet('');
                  setRegProvince('Jawa Barat');
                  setRegCity('Kota Bandung');
                  setRegDistrict('Coblong');
                  setCustomDistrict('');
                  setUseCustomDistrict(false);
                  setRegVillage('Dago');
                  setCustomVillage('');
                  setUseCustomVillage(false);
                  setShowRegisterModal(true);
                }}
                className="text-pink-400 hover:text-pink-300 font-bold hover:underline cursor-pointer transition-colors"
              >
                Buat akun
              </button>
            </p>
          </div>

          {/* Security Note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Sesi Terenkripsi & Terdaftar Resmi</span>
          </div>
        </div>
      </main>

      {/* Registration Modal Dialog */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-pink-700/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-md flex-shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Buat Akun Baru
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lengkapi data kredensial dan alamat wilayah di bawah untuk mendaftar akun baru.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg text-base cursor-pointer hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Error in Register Modal */}
            {regError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-shake flex-shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span className="font-semibold">
                    {regError === 'EMAIL_ALREADY_REGISTERED'
                      ? `Email "${regEmail}" sudah terdaftar di sistem!`
                      : regError}
                  </span>
                </div>
                {regError === 'EMAIL_ALREADY_REGISTERED' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegisterModal(false);
                        setIdentifierInput(regEmail);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      Langsung Masuk / Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegisterModal(false);
                        setActivationTargetEmail(regEmail);
                        setActivationTargetUsername(regEmail);
                        setShowActivationModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-blue-500/30 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                      Masukkan Kode Aktivasi OTP
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Register Form Scrollable Area */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs overflow-y-auto pr-1">
              
              {/* BAGIAN 1: Kredensial Akun (Nama Pengguna, Password, Konfirmasi Password) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-pink-400 font-bold border-b border-slate-800/80 pb-2">
                  <Lock className="w-4 h-4" />
                  <span className="uppercase text-[11px] tracking-wider">1. Kredensial Akun & Kata Sandi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Nama Pengguna */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">
                      Nama Pengguna <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: admin_masmedia"
                        value={regUsername}
                        onChange={e => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">
                      Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 4 karakter"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">
                      Konfirmasi Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Ulangi password"
                        value={regConfirmPass}
                        onChange={e => setRegConfirmPass(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: Data Lengkap, Kontak & Alamat Wilayah */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-pink-400 font-bold border-b border-slate-800/80 pb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="uppercase text-[11px] tracking-wider">2. Data Lengkap & Alamat Domisili</span>
                </div>

                {/* Nama Lengkap, Email, Nomor WA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">
                      Nama Lengkap <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Nama lengkap Anda"
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">
                      Email <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="email@anda.com"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">
                      Nomor WA <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="081234567890"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Alamat Jalan */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">
                    Jalan (Nama Jalan / Gang / RT / RW / No. Rumah) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Home className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jl. Merpati Raya No. 15, RT 02 / RW 05"
                      value={regStreet}
                      onChange={e => setRegStreet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                    />
                  </div>
                </div>

                {/* Cascaded Selects: Provinsi & Kota/Kabupaten */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Provinsi */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300 flex items-center justify-between">
                      <span>Provinsi <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-pink-400 font-normal">38 Provinsi di Indonesia</span>
                    </label>
                    <div className="relative">
                      <Compass className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        required
                        value={regProvince}
                        onChange={e => handleProvinceChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-white focus:outline-none focus:border-pink-500 font-medium appearance-none cursor-pointer"
                      >
                        {ALL_INDONESIA_PROVINCES.map(prov => (
                          <option key={prov} value={prov} className="bg-slate-900 text-white">
                            {prov}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Kota / Kabupaten */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-300">
                      Kota / Kabupaten <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        required
                        value={regCity}
                        onChange={e => handleCityChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-white focus:outline-none focus:border-pink-500 font-medium appearance-none cursor-pointer"
                      >
                        {availableCities.map(city => (
                          <option key={city} value={city} className="bg-slate-900 text-white">
                            {city}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cascaded Selects: Kecamatan & Desa/Kelurahan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kecamatan */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-300">
                        Kecamatan <span className="text-rose-400">*</span>
                        {loadingDistricts && (
                          <span className="ml-1.5 text-[10px] text-pink-400 animate-pulse font-normal">
                            (memuat data...)
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !useCustomDistrict;
                          setUseCustomDistrict(next);
                          if (next && !customDistrict) {
                            setCustomDistrict(regDistrict);
                          }
                        }}
                        className="text-[10px] text-pink-400 hover:text-pink-300 underline cursor-pointer"
                      >
                        {useCustomDistrict ? 'Pilih dari daftar' : '+ Ketik Manual'}
                      </button>
                    </div>

                    {useCustomDistrict ? (
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ketik nama Kecamatan..."
                          value={customDistrict}
                          onChange={e => setCustomDistrict(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                          required
                          value={regDistrict}
                          onChange={e => handleDistrictChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-white focus:outline-none focus:border-pink-500 font-medium appearance-none cursor-pointer"
                        >
                          {availableDistricts.map(dist => (
                            <option key={dist} value={dist} className="bg-slate-900 text-white">
                              {dist}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                          ▼
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desa / Kelurahan */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-300">
                        Desa / Kelurahan <span className="text-rose-400">*</span>
                        {loadingVillages && (
                          <span className="ml-1.5 text-[10px] text-pink-400 animate-pulse font-normal">
                            (memuat data...)
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !useCustomVillage;
                          setUseCustomVillage(next);
                          if (next && !customVillage) {
                            setCustomVillage(regVillage);
                          }
                        }}
                        className="text-[10px] text-pink-400 hover:text-pink-300 underline cursor-pointer"
                      >
                        {useCustomVillage ? 'Pilih dari daftar' : '+ Ketik Manual'}
                      </button>
                    </div>

                    {useCustomVillage || availableVillages.length === 0 ? (
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder={loadingVillages ? 'Sedang memuat data desa...' : 'Ketik nama Desa / Kelurahan...'}
                          value={useCustomVillage ? customVillage : (customVillage || regVillage)}
                          onChange={e => {
                            setCustomVillage(e.target.value);
                            setUseCustomVillage(true);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                          required
                          value={regVillage}
                          onChange={e => setRegVillage(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-8 py-2 text-white focus:outline-none focus:border-pink-500 font-medium appearance-none cursor-pointer"
                        >
                          {availableVillages.map(vil => (
                            <option key={vil} value={vil} className="bg-slate-900 text-white">
                              {vil}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]">
                          ▼
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isRegistering ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Akun & Kirim Email</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Activation & OTP Verification Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 my-auto">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Aktivasi & Verifikasi Akun
                  </h3>
                  <p className="text-xs text-slate-400">
                    Masukkan kode verifikasi yang dikirim ke email Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowActivationModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notice / Status */}
            {activationMsg && (
              <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                activationMsg.isError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-white'
              }`}>
                {activationMsg.isError ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed font-medium">{activationMsg.text}</span>
              </div>
            )}

            {/* Email Dispatch & Simulation helper badge */}
            {lastEmailDispatchInfo && (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Pengiriman:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    lastEmailDispatchInfo.sentReal
                      ? 'bg-blue-500/20 text-white border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {lastEmailDispatchInfo.sentReal ? '✓ Terkirim via SMTP' : '⚡ Mode Siap Pakai / Sandboxed'}
                  </span>
                </div>
                {lastEmailDispatchInfo.code && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Kode OTP Anda:</span>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(lastEmailDispatchInfo.code || '')}
                      className="font-mono text-sm font-black text-pink-400 hover:text-pink-300 underline cursor-pointer"
                      title="Klik untuk mengisi otomatis"
                    >
                      {lastEmailDispatchInfo.code} (Klik untuk isi)
                    </button>
                  </div>
                )}
                {lastEmailDispatchInfo.htmlPreview && (
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => setShowEmailPreviewModal(true)}
                      className="text-[11px] text-pink-400 hover:text-pink-300 inline-flex items-center gap-1 font-semibold hover:underline"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Lihat Tampilan Email Aktivasi</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleActivationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email atau Nama Pengguna
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="email@domain.com atau username"
                    value={activationTargetEmail || activationTargetUsername}
                    onChange={e => {
                      setActivationTargetEmail(e.target.value);
                      setActivationTargetUsername(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kode Verifikasi 6-Digit (OTP)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={enteredOtp}
                    onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-9 pr-3 py-2.5 text-center tracking-widest font-mono text-base font-black text-blue-400 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>Kirim Ulang Kode</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Quick one-click activation
                    const res = activateAccount(activationTargetEmail || activationTargetUsername);
                    if (res.success) {
                      setShowActivationModal(false);
                      setSuccessMsg(res.message);
                    } else {
                      setActivationMsg({ text: res.message, isError: true });
                    }
                  }}
                  className="text-pink-400 hover:text-pink-300 font-semibold cursor-pointer"
                >
                  ⚡ Aktivasi Instan
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowActivationModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isActivating}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isActivating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Verifikasi & Aktifkan Akun</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Success - Direct to Gmail Modal */}
      {showRegistrationSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-white font-extrabold text-base">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div>Pendaftaran Berhasil!</div>
                  <div className="text-[11px] font-medium text-blue-400">Aktivasi melalui pesan di Gmail</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegistrationSuccessModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Akun mitra ISP Anda atas nama <strong className="text-white">{registeredUsername}</strong> telah berhasil dibuat di sistem.
              </p>
              
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-1.5">
                <div className="text-[11px] text-blue-300 font-semibold flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  Email Verifikasi Telah Dikirim ke:
                </div>
                <div className="font-mono text-sm font-bold text-white tracking-wide">
                  {registeredEmail}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="font-bold text-white text-xs">
                  Langkah Aktivasi Akun Anda:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                  <li>Buka kotak masuk (inbox) atau folder spam di Gmail Anda.</li>
                  <li>Buka email dari <strong className="text-white">Masmedia Network</strong>.</li>
                  <li>Klik tombol / tautan <strong className="text-blue-400">"Aktifkan Akun Saya"</strong> di dalam email tersebut.</li>
                  <li>Setelah teraktivasi, Anda dapat langsung login dan memilih <strong className="text-pink-300">Paket Langganan & Sewa Bulanan Mitra Pengelola</strong>.</li>
                </ol>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              {lastEmailDispatchInfo?.htmlPreview && (
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(true)}
                  className="w-full sm:w-auto text-[11px] text-slate-400 hover:text-pink-300 underline font-semibold flex items-center justify-center gap-1 py-1"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Lihat Pratinjau Email</span>
                </button>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Buka Gmail</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowRegistrationSuccessModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  Ke Halaman Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HTML Email Preview Modal */}
      {showEmailPreviewModal && lastEmailDispatchInfo?.htmlPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Inbox className="w-4 h-4 text-pink-400" />
                <span>Pratinjau Email Aktivasi Masmedia Network</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-2xl p-2 sm:p-4 text-slate-900">
              <div dangerouslySetInnerHTML={{ __html: lastEmailDispatchInfo.htmlPreview }} />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-4 border-t border-pink-900/40 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 backdrop-blur-md">
        <p>
          &copy; {new Date().getFullYear()} <strong className="text-white">Masmedia Network</strong> &bull; Portal Layanan Internet
        </p>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Bantuan Teknis:</span>
          <a
            href="https://wa.me/6285157671244?text=Halo%20Bantuan%20Teknis%20Masmedia%20Network"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Chat WhatsApp Bantuan Teknis"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

