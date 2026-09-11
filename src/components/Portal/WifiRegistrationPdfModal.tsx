import React, { useRef, useState, useEffect } from 'react';
import { WifiRegistration } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  FileText,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Share2,
  ShieldCheck,
  QrCode,
  Download,
  FileCheck,
  FileSpreadsheet,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

interface WifiRegistrationPdfModalProps {
  registration: WifiRegistration | null;
  isOpen: boolean;
  onClose: () => void;
  defaultFormat?: 'filled' | 'blank';
}

export const WifiRegistrationPdfModal: React.FC<WifiRegistrationPdfModalProps> = ({
  registration,
  isOpen,
  onClose,
  defaultFormat = 'filled',
}) => {
  const { ispProfile, paymentChannels, packages } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const [docType, setDocType] = useState<'filled' | 'blank'>(defaultFormat);

  useEffect(() => {
    if (isOpen) {
      if (!registration && defaultFormat !== 'filled') {
        setDocType('blank');
      } else {
        setDocType(defaultFormat || (registration ? 'filled' : 'blank'));
      }
    }
  }, [isOpen, defaultFormat, registration]);

  if (!isOpen) return null;

  // Clean registration data without fake dummy values
  const activeReg: WifiRegistration = registration || {
    id: '-',
    createdAt: new Date().toISOString(),
    fullName: '-',
    nik: '-',
    phone: '-',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    email: '',
    occupation: '',
    address: '-',
    rtRw: '',
    village: '',
    district: '',
    city: '',
    postalCode: '',
    landmark: '',
    housingStatus: 'owned',
    packageId: packages[0]?.id || '',
    packageName: packages[0]?.name || '-',
    packageSpeed: packages[0]?.rateLimit || '-',
    packagePrice: packages[0]?.price || 0,
    installationFee: 0,
    preferredDate: new Date().toISOString().slice(0, 10),
    preferredTimeSlot: 'pagi',
    additionalServices: [],
    agreedToTerms: true,
    status: 'pending',
  };

  const totalInitialPayment = (activeReg.packagePrice || 0) + (activeReg.installationFee || 0);

  // Ambil daftar paket profil aktif dari Manajemen PPPoE & DHCP Server (Profile PPP)
  const pppoePackages = packages.filter(p => p.isActive !== false && p.category !== 'hotspot');
  const displayPackages = pppoePackages.length > 0 ? pppoePackages : packages;

  // Generate self-contained, 100% clean HTML for isolated A4 printing
  const generateOfficialFormHtml = () => {
    const brandName = ispProfile?.brandName || 'PT MASMEDIA NET NUSANTARA';
    const address = ispProfile?.address || 'Gedung Cyber Cyber Lt. 3, Jl. Kuningan Barat No. 8, Jakarta Selatan';
    const hotline = ispProfile?.phone || paymentChannels?.waGatewayNumber || '0851-5767-1244';
    const email = ispProfile?.email || 'sales@masmedia.net';
    const website = ispProfile?.website || 'www.masmedia.net';
    const docNumber = docType === 'filled' ? activeReg.id : 'REG-........................';
    const dateStr = docType === 'filled' ? formatDateIndo(activeReg.createdAt.slice(0, 10)) : '...... / ...... / ......';
    const isFilled = docType === 'filled';

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Formulir_Pasang_Baru_${activeReg.id || 'ISP'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 9.5px;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .sheet {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
      background: #ffffff;
    }
    /* KOP SURAT */
    .kop {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .kop-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .kop-logo {
      width: 52px;
      height: 52px;
      object-fit: contain;
    }
    .kop-logo-box {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
      letter-spacing: -1px;
    }
    .kop-brand {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin: 0;
    }
    .kop-sub {
      font-size: 8.5px;
      font-weight: 700;
      color: #334155;
      margin: 1px 0;
      letter-spacing: 0.3px;
    }
    .kop-desc {
      font-size: 8px;
      color: #475569;
      margin: 1px 0;
      line-height: 1.25;
    }
    .kop-meta {
      text-align: right;
      font-size: 8px;
      color: #334155;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 8px;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .badge-verified {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-blank {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    /* TITLE */
    .doc-title {
      text-align: center;
      margin: 6px 0 8px 0;
      padding-bottom: 6px;
      border-bottom: 1px dashed #cbd5e1;
    }
    .doc-title h2 {
      font-size: 11.5px;
      font-weight: 900;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #0f172a;
    }
    .doc-title p {
      font-size: 8.5px;
      color: #475569;
      margin: 0;
    }
    /* SECTIONS */
    .section {
      margin-bottom: 7px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-head {
      background: #f1f5f9;
      padding: 3px 6px;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      border-left: 3px solid #0f172a;
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .table-data {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      border: 1px solid #94a3b8;
    }
    .table-data td, .table-data th {
      border: 1px solid #cbd5e1;
      padding: 3.5px 6px;
      vertical-align: middle;
    }
    .table-data th {
      background: #f1f5f9;
      font-weight: 800;
      font-size: 8px;
      text-transform: uppercase;
      color: #1e293b;
    }
    .label-col {
      background: #f8fafc;
      font-weight: 600;
      color: #334155;
      width: 26%;
    }
    .val-col {
      color: #0f172a;
    }
    .nik-box {
      display: inline-block;
      width: 13px;
      height: 16px;
      line-height: 16px;
      border: 1px solid #64748b;
      text-align: center;
      font-weight: bold;
      margin-right: 1.5px;
      font-family: monospace;
      font-size: 9px;
    }
    .checkbox-box {
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 1px solid #334155;
      vertical-align: middle;
      margin-right: 4px;
      border-radius: 2px;
    }
    .sla-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 5px 7px;
      font-size: 7.5px;
      line-height: 1.35;
      color: #334155;
    }
    .sla-box p {
      margin: 1.5px 0;
    }
    .sig-grid {
      display: flex;
      gap: 8px;
      margin-top: 6px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sig-card {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 8px;
      text-align: center;
      font-size: 8px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 80px;
      background: #ffffff;
    }
    .sig-title {
      font-weight: 700;
      color: #1e293b;
    }
    .sig-note {
      font-size: 7px;
      color: #64748b;
      font-style: italic;
    }
    .sig-name {
      font-weight: 800;
      text-transform: uppercase;
      border-top: 1px solid #64748b;
      padding-top: 2px;
      margin-top: 4px;
      font-size: 8px;
      color: #0f172a;
    }
    .sig-sub {
      font-size: 7px;
      color: #64748b;
    }
    .doc-footer {
      border-top: 1px solid #cbd5e1;
      margin-top: 6px;
      padding-top: 3px;
      display: flex;
      justify-content: space-between;
      font-size: 7px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <!-- KOP SURAT -->
    <div class="kop">
      <div class="kop-left">
        ${
          ispProfile?.logoUrl
            ? `<img src="${ispProfile.logoUrl}" alt="Logo" class="kop-logo" />`
            : `<div class="kop-logo-box">MN</div>`
        }
        <div>
          <h1 class="kop-brand">${brandName}</h1>
          <p class="kop-sub">PENYELENGGARA JASA INTERNET (ISP) &amp; JARINGAN FIBER OPTIK RESMI</p>
          <p class="kop-desc">${address}</p>
          <p class="kop-desc">Hotline/WA NOC: <strong>${hotline}</strong> &bull; Email: ${email} &bull; Web: ${website}</p>
        </div>
      </div>
      <div class="kop-meta">
        <div style="font-family: monospace; font-size: 9px; font-weight: bold; color: #0f172a;">${docNumber}</div>
        <div class="badge ${isFilled ? 'badge-verified' : 'badge-blank'}">
          ${isFilled ? 'VERIFIED DIGITAL' : 'BLANGKO RESMI'}
        </div>
      </div>
    </div>

    <!-- JUDUL DOKUMEN -->
    <div class="doc-title">
      <h2>SURAT PERMOHONAN &amp; FORMULIR BERLANGGANAN BARU INTERNET FIBER</h2>
      <p>Nomor Formulir: <strong style="font-family: monospace; color: #0f172a;">${docNumber}</strong> &bull; Tanggal Pengajuan: <strong>${dateStr}</strong></p>
    </div>

    ${
      isFilled
        ? `
    <!-- BAGIAN 1: IDENTITAS PEMOHON -->
    <div class="section">
      <div class="section-head">
        <span>I. DATA IDENTITAS CALON PELANGGAN (PEMOHON)</span>
        <span style="font-size: 7.5px; font-weight: normal; color: #475569;">Sesuai KTP / Tanda Pengenal Sah</span>
      </div>
      <table class="table-data">
        <tbody>
          <tr>
            <td class="label-col">Nama Lengkap Pemohon</td>
            <td class="val-col" style="font-weight: bold; text-transform: uppercase;">${activeReg.fullName}</td>
            <td class="label-col" style="width: 18%;">No. KTP / NIK</td>
            <td class="val-col" style="font-family: monospace; font-weight: bold;">${activeReg.nik}</td>
          </tr>
          <tr>
            <td class="label-col">No. WhatsApp / HP</td>
            <td class="val-col" style="font-family: monospace; font-weight: bold; color: #047857;">${activeReg.phone}</td>
            <td class="label-col">Email</td>
            <td class="val-col">${activeReg.email || '-'}</td>
          </tr>
          <tr>
            <td class="label-col">Pekerjaan / Instansi</td>
            <td class="val-col">${activeReg.occupation || '-'}</td>
            <td class="label-col">Status Rumah</td>
            <td class="val-col" style="text-transform: capitalize;">
              ${activeReg.housingStatus === 'owned' ? 'Milik Sendiri' : activeReg.housingStatus === 'rented' ? 'Sewa / Kontrak' : 'Kantor / Usaha'}
            </td>
          </tr>
          <tr>
            <td class="label-col">Kontak Darurat</td>
            <td class="val-col" colspan="3">
              ${activeReg.emergencyContactName ? `<strong>${activeReg.emergencyContactName}</strong> ${activeReg.emergencyContactRelation ? `(${activeReg.emergencyContactRelation})` : ''} ${activeReg.emergencyContactPhone ? `&bull; No. HP: <span style="font-family: monospace;">${activeReg.emergencyContactPhone}</span>` : ''}` : '-'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- BAGIAN 2: ALAMAT LOKASI -->
    <div class="section">
      <div class="section-head">
        <span>II. ALAMAT LENGKAP &amp; TITIK LOKASI PEMASANGAN (INSTALLATION SITE)</span>
        <span style="font-size: 7.5px; font-weight: normal; color: #475569;">Titik Penarikan Kabel Dropcore</span>
      </div>
      <table class="table-data">
        <tbody>
          <tr>
            <td class="label-col">Alamat &amp; No. Rumah</td>
            <td class="val-col" colspan="3" style="font-weight: bold;">${activeReg.address}</td>
          </tr>
          <tr>
            <td class="label-col">RT / RW &amp; Kelurahan</td>
            <td class="val-col">${activeReg.rtRw ? `RT ${activeReg.rtRw}` : ''}${activeReg.rtRw && activeReg.village ? ' &bull; ' : ''}${activeReg.village ? `Kel. ${activeReg.village}` : (!activeReg.rtRw ? '-' : '')}</td>
            <td class="label-col" style="width: 18%;">Kecamatan</td>
            <td class="val-col">${activeReg.district ? `Kec. ${activeReg.district}` : '-'}</td>
          </tr>
          <tr>
            <td class="label-col">Kota &amp; Kode Pos</td>
            <td class="val-col">${activeReg.city || '-'}${activeReg.postalCode ? ` &bull; Pos: ${activeReg.postalCode}` : ''}</td>
            <td class="label-col">Koordinat GPS</td>
            <td class="val-col" style="font-family: monospace; font-size: 8.5px;">
              ${activeReg.latitude && activeReg.longitude ? `${activeReg.latitude}, ${activeReg.longitude}` : '-'}
            </td>
          </tr>
          <tr>
            <td class="label-col">Patokan / Acuan Rumah</td>
            <td class="val-col" colspan="3" style="${activeReg.landmark ? 'font-style: italic; background: #fffbeb;' : ''}">
              ${activeReg.landmark ? `&quot;${activeReg.landmark}&quot;` : '-'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- BAGIAN 3: PAKET & BIAYA -->
    <div class="section">
      <div class="section-head">
        <span>III. PILIHAN PAKET LAYANAN INTERNET &amp; BIAYA INVESTASI</span>
        <span style="font-size: 7.5px; font-weight: normal; color: #475569;">Unlimited Kuota (Tanpa FUP)</span>
      </div>
      <table class="table-data">
        <thead>
          <tr>
            <th style="text-align: left; width: 45%;">Rincian Layanan / Komponen</th>
            <th style="text-align: center; width: 20%;">Spesifikasi</th>
            <th style="text-align: center; width: 15%;">Jadwal Pasang</th>
            <th style="text-align: right; width: 20%;">Tarif / Biaya</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${activeReg.packageName}</strong>
              <div style="font-size: 7.5px; color: #475569;">Langganan Internet Dedicated Fiber Optik 24 Jam Nonstop</div>
            </td>
            <td style="text-align: center; font-family: monospace; font-weight: bold; color: #047857;">${activeReg.packageSpeed}</td>
            <td style="text-align: center; font-size: 8px;">
              ${formatDateIndo(activeReg.preferredDate)}
              <div style="font-size: 7px; color: #64748b; text-transform: uppercase;">(${activeReg.preferredTimeSlot})</div>
            </td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">${formatRupiah(activeReg.packagePrice)} /bln</td>
          </tr>
          <tr>
            <td>
              <strong>Biaya Pasang Baru / Registrasi</strong>
              <div style="font-size: 7.5px; color: #475569;">Termasuk penarikan kabel dropcore &amp; aktivasi terminasi optik</div>
            </td>
            <td style="text-align: center; font-size: 8px; color: #475569;">Standar ISP</td>
            <td style="text-align: center; font-size: 8px; font-weight: bold; color: #475569;">Ditentukan Saat Survey</td>
            <td style="text-align: right; color: #64748b; font-size: 8px; font-family: monospace;">-</td>
          </tr>
          ${
            activeReg.additionalServices && activeReg.additionalServices.length > 0
              ? `<tr>
                  <td colspan="3"><strong>Layanan Tambahan (Add-On):</strong> ${activeReg.additionalServices.join(', ')}</td>
                  <td style="text-align: right; font-family: monospace; color: #475569;">Termasuk</td>
                </tr>`
              : ''
          }
          <tr style="background: #f8fafc; font-weight: bold; border-top: 1.5px solid #64748b;">
            <td colspan="3" style="text-align: right; text-transform: uppercase; font-size: 8.5px;">
              Estimasi Iuran Paket Bulanan (Biaya Pasang Ditentukan Saat Survey):
            </td>
            <td style="text-align: right; font-family: monospace; font-size: 10px; color: #047857;">
              ${formatRupiah(activeReg.packagePrice)} /bln
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `
        : `
    <!-- BAGIAN 1 BLANGKO: IDENTITAS -->
    <div class="section">
      <div class="section-head">
        <span>I. DATA IDENTITAS CALON PELANGGAN (PEMOHON)</span>
        <span style="font-size: 7.5px; font-weight: normal; color: #475569;">Harap Diisi dengan Huruf Cetak / Balok</span>
      </div>
      <table class="table-data">
        <tbody>
          <tr>
            <td class="label-col">Nama Lengkap (KTP)</td>
            <td class="val-col" colspan="3" style="color: #94a3b8; font-family: monospace;">
              ................................................................................................................................................
            </td>
          </tr>
          <tr>
            <td class="label-col">No. Induk Kependudukan (NIK)</td>
            <td class="val-col" colspan="3">
              ${Array.from({ length: 16 })
                .map(() => '<span class="nik-box">&nbsp;</span>')
                .join('')}
              <span style="font-size: 7.5px; color: #64748b; margin-left: 4px;">(16 Digit KTP)</span>
            </td>
          </tr>
          <tr>
            <td class="label-col">No. WhatsApp / HP Utama</td>
            <td class="val-col" style="font-family: monospace; color: #64748b; width: 35%;">08 ........................................</td>
            <td class="label-col" style="width: 15%;">Email</td>
            <td class="val-col" style="color: #94a3b8;">................................................</td>
          </tr>
          <tr>
            <td class="label-col">Pekerjaan / Instansi</td>
            <td class="val-col" style="color: #94a3b8;">................................................</td>
            <td class="label-col">Status Rumah</td>
            <td class="val-col">
              <span class="checkbox-box"></span> Milik Sendiri &nbsp;&nbsp;
              <span class="checkbox-box"></span> Kontrak &nbsp;&nbsp;
              <span class="checkbox-box"></span> Usaha
            </td>
          </tr>
          <tr>
            <td class="label-col">Kontak Darurat (Keluarga)</td>
            <td class="val-col" colspan="3" style="color: #64748b;">
              Nama: .................................................... Hubungan: ............................ No. HP: ....................................................
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- BAGIAN 2 BLANGKO: ALAMAT -->
    <div class="section">
      <div class="section-head">
        <span>II. ALAMAT LENGKAP &amp; TITIK LOKASI PEMASANGAN (INSTALLATION SITE)</span>
        <span style="font-size: 7.5px; font-weight: normal; color: #475569;">Titik Penarikan Kabel Dropcore</span>
      </div>
      <table class="table-data">
        <tbody>
          <tr>
            <td class="label-col">Alamat &amp; No. Rumah</td>
            <td class="val-col" colspan="3" style="color: #94a3b8; font-family: monospace;">
              ................................................................................................................................................
            </td>
          </tr>
          <tr>
            <td class="label-col">RT / RW &amp; Kelurahan</td>
            <td class="val-col" style="color: #64748b;">RT: .......... / RW: .......... &bull; Kel: ........................................</td>
            <td class="label-col" style="width: 18%;">Kecamatan</td>
            <td class="val-col" style="color: #94a3b8;">................................................</td>
          </tr>
          <tr>
            <td class="label-col">Kota &amp; Kode Pos</td>
            <td class="val-col" style="color: #64748b;">................................................ &bull; Pos: ....................</td>
            <td class="label-col">Koordinat GPS</td>
            <td class="val-col" style="font-family: monospace; color: #94a3b8;">Lat: ................ Lng: ................</td>
          </tr>
          <tr>
            <td class="label-col">Patokan / Acuan Lokasi</td>
            <td class="val-col" colspan="3" style="font-style: italic; color: #64748b;">
              Contoh: Samping Masjid / Rumah Cat Hijau Pagar Hitam: ..................................................................................
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- BAGIAN 3 BLANGKO: PAKET -->
    <div class="section">
      <div class="section-head">
        <span>III. PILIHAN PAKET LAYANAN INTERNET FIBER OPTIC (BERI TANDA CENTANG [ ✓ ])</span>
        <span style="font-size: 7.5px; font-weight: normal; color: #475569;">Pilih Salah Satu</span>
      </div>
      <table class="table-data">
        <thead>
          <tr>
            <th style="text-align: center; width: 8%;">Pilih</th>
            <th style="text-align: left; width: 42%;">Nama Paket Layanan</th>
            <th style="text-align: center; width: 22%;">Kecepatan Bandwidth</th>
            <th style="text-align: right; width: 28%;">Tarif Bulanan (IDR)</th>
          </tr>
        </thead>
        <tbody>
          ${displayPackages
            .map(
              p => `
          <tr>
            <td style="text-align: center;"><span class="checkbox-box"></span></td>
            <td style="font-weight: bold;">${p.name}</td>
            <td style="text-align: center; font-family: monospace; font-weight: bold;">${p.rateLimit}</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">${formatRupiah(p.price)} /bln</td>
          </tr>`
            )
            .join('')}
          <tr style="background: #f8fafc;">
            <td style="text-align: center; font-weight: bold;">Biaya:</td>
            <td>Biaya Pasang Baru / Registrasi:</td>
            <td style="text-align: center; font-weight: bold; color: #475569;">Ditentukan Saat Survey</td>
            <td style="text-align: right; color: #94a3b8; font-size: 8px;">-</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: bold;">Jadwal:</td>
            <td colspan="3">
              Rencana Tanggal Pasang: ...... / ...... / ...... &nbsp;&bull;&nbsp; Sesi: [ &nbsp; ] Pagi (09-12) &nbsp;&nbsp; [ &nbsp; ] Siang (13-15) &nbsp;&nbsp; [ &nbsp; ] Sore (15-17)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `
    }

    <!-- BAGIAN 4: SYARAT & KETENTUAN (SLA) -->
    <div class="section">
      <div class="section-head">
        <span>IV. SYARAT DAN KETENTUAN BERLANGGANAN LAYANAN (STANDAR SLA ISP)</span>
      </div>
      <div class="sla-box">
        <p><strong>1. Hak Milik Perangkat:</strong> Perangkat Optical Network Terminal (ONT/Modem WiFi) dan kabel Dropcore Fiber Optik yang terpasang merupakan aset inventaris milik Penyelenggara Layanan (ISP) yang dipinjam-pakaikan selama masa berlangganan aktif.</p>
        <p><strong>2. Masa Berlangganan:</strong> Masa komitmen berlangganan minimal adalah 3 (tiga) bulan kalender sejak status layanan dinyatakan aktif/terpasang oleh teknisi lapangan.</p>
        <p><strong>3. Kewajiban Pembayaran:</strong> Tagihan bulanan diselesaikan selambat-lambatnya tanggal jatuh tempo setiap bulannya. Keterlambatan pembayaran berakibat isolir otomatis oleh server.</p>
        <p><strong>4. Larangan Reselling:</strong> Pelanggan dilarang keras menjual kembali (reselling) atau membagikan sambungan kabel ke luar bangunan tempat tinggal tanpa izin tertulis sesuai UU Telekomunikasi.</p>
        <p><strong>5. Persetujuan:</strong> Pemohon menyatakan data yang dicantumkan sah dan benar, serta telah menyetujui seluruh ketentuan di atas.</p>
      </div>
    </div>

    <!-- BAGIAN 5: 3 KOLOM TANDA TANGAN -->
    <div class="sig-grid">
      <div class="sig-card">
        <div class="sig-title">Pemohon / Calon Pelanggan</div>
        <div>
          <div class="sig-name">${isFilled ? activeReg.fullName : '................................................'}</div>
          <div class="sig-sub">${isFilled ? `Tgl: ${formatDateIndo(activeReg.createdAt.slice(0, 10))}` : 'Tgl: ...... / ...... / ......'}</div>
        </div>
      </div>

      <div class="sig-card">
        <div class="sig-title">Sales / Account Representative</div>
        <div>
          <div class="sig-name">${brandName}</div>
          <div class="sig-sub">Petugas Pemasaran ISP</div>
        </div>
      </div>

      <div class="sig-card">
        <div class="sig-title">Supervisor Teknik / NOC</div>
        <div>
          <div class="sig-name">Tim Lapangan FTTH</div>
          <div class="sig-sub">Status: Siap Pasang &amp; Aktivasi</div>
        </div>
      </div>
    </div>

    <!-- FOOTER RESMI -->
    <div class="doc-footer">
      <span>Diunduh via Billing Portal Mandiri &bull; Cetak Rangkap 2</span>
      <span style="font-family: monospace;">TIMESTAMP: ${formatDateTimeIndo(new Date().toISOString())}</span>
    </div>
  </div>
</body>
</html>`;
  };

  // Robust isolated iframe printing
  const handlePrint = () => {
    try {
      const htmlContent = generateOfficialFormHtml();

      const existingIframe = document.getElementById('print-registration-iframe');
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'print-registration-iframe';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        // Allow document render before printing
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print error, falling back to window.print():', e);
            window.print();
          }
        }, 350);
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Print handler failed:', err);
      window.print();
    }
  };

  // Direct download option for users
  const handleDownloadDocument = () => {
    try {
      const htmlContent = generateOfficialFormHtml();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Formulir_Pasang_Baru_${activeReg.id || 'ISP'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download document:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const phone = ispProfile?.phone || paymentChannels?.waGatewayNumber || '6281234567890';
    const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const msg =
      `*FORMULIR PENDAFTARAN PASANG BARU WIFI*\n` +
      `No. Registrasi: *${activeReg.id}*\n` +
      `Nama Pemohon: *${activeReg.fullName}*\n` +
      `NIK KTP: *${activeReg.nik}*\n` +
      `No. WhatsApp: ${activeReg.phone}\n` +
      `Alamat Pasang: ${activeReg.address}, RT/RW ${activeReg.rtRw}, Kel. ${activeReg.village}, Kec. ${activeReg.district}, ${activeReg.city}\n` +
      `Patokan Lokasi: ${activeReg.landmark}\n` +
      `Paket Dipilih: *${activeReg.packageName}* (${activeReg.packageSpeed}) - ${formatRupiah(activeReg.packagePrice)}/bln\n` +
      `Biaya Pasang Baru: *Ditentukan Saat Survey (oleh teknisi di lokasi)*\n` +
      `Rencana Pemasangan: ${formatDateIndo(activeReg.preferredDate)} (Sesi: ${activeReg.preferredTimeSlot.toUpperCase()})\n` +
      `Status: MENUNGGU JADWAL SURVEY/INSTALASI TEKNISI\n\n` +
      `Mohon segera diproses untuk jadwal instalasi tim lapangan. Terima kasih.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div
      id="wifi-pdf-modal-container"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:max-w-none print:w-full print:rounded-none">
        {/* Action Bar Header (Hidden when printing) */}
        <div className="flex flex-col px-5 py-4 border-b border-slate-800 bg-slate-950/90 gap-3 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Formulir Pasang Baru WiFi (Format PDF Resmi A4)
                  </h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {docType === 'filled' ? activeReg.id : 'TEMPLATE-KOSONG'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Dokumen resmi berstandar ISP Indonesia (Format cetak presisi A4)
                </p>
              </div>
            </div>

            {/* Controls: Mode Switcher & Print / Download Buttons */}
            <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
              {/* Format Switcher */}
              <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setDocType('filled')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    docType === 'filled'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Formulir Terisi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('blank')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    docType === 'blank'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Template Kosong (Blangko)</span>
                </button>
              </div>

              {docType === 'filled' && (
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                  title="Kirim Salinan ke WhatsApp CS"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Kirim ke WA</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadDocument}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                title="Unduh berkas dokumen resmi (.html)"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Unduh Dokumen</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                title="Cetak atau Simpan sebagai PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Guide Banner */}
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[11px] text-emerald-300">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Tips Cetak / PDF:</strong> Klik tombol <strong>&quot;Cetak / Simpan PDF&quot;</strong>. Di jendela printer yang muncul, pada pilihan <em>Tujuan / Destination</em>, pilih <strong>&quot;Simpan sebagai PDF&quot; (Save as PDF)</strong> untuk menyimpan file ke HP/Laptop Anda.
            </span>
          </div>
        </div>

        {/* Printable Paper Canvas (A4 Standard) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center print:bg-white print:p-0 print:overflow-visible">
          <div
            ref={printRef}
            className="w-full max-w-[820px] bg-white !text-slate-900 text-[11px] p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-200 print:border-none print:shadow-none print:m-0 print:p-4 print:w-full font-sans leading-relaxed"
          >
            {/* KOP SURAT RESMI PERUSAHAAN ISP */}
            <div className="flex items-center justify-between pb-3 border-b-2 !border-slate-900 gap-4">
              <div className="flex items-center gap-3.5">
                {ispProfile?.logoUrl ? (
                  <img
                    src={ispProfile.logoUrl}
                    alt="Logo ISP"
                    className="w-14 h-14 object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl !bg-slate-900 flex items-center justify-center !text-white font-black text-xl tracking-tighter">
                    MN
                  </div>
                )}
                <div>
                  <h1 className="text-base font-black uppercase !text-slate-900 tracking-tight">
                    {ispProfile?.brandName || 'PT MASMEDIA NET NUSANTARA'}
                  </h1>
                  <p className="text-[10px] !text-slate-700 font-bold tracking-wide">
                    PENYELENGGARA JASA INTERNET (ISP) &amp; JARINGAN FIBER OPTIK RESMI
                  </p>
                  <p className="text-[9px] !text-slate-600">
                    {ispProfile?.address || 'Gedung Cyber Cyber Lt. 3, Jl. Kuningan Barat No. 8, Jakarta Selatan'}
                  </p>
                  <p className="text-[9px] !text-slate-600">
                    Hotline/WA NOC: <strong className="!text-slate-900">{ispProfile?.phone || paymentChannels?.waGatewayNumber || '0851-5767-1244'}</strong> &bull; Email: {ispProfile?.email || 'sales@masmedia.net'} &bull; Web: {ispProfile?.website || 'www.masmedia.net'}
                  </p>
                </div>
              </div>

              {/* QR & Form Meta */}
              <div className="text-right flex flex-col items-end shrink-0">
                <div className="p-1.5 !bg-slate-100 rounded border !border-slate-300">
                  <QrCode className="w-10 h-10 !text-slate-800" />
                </div>
                <span className="font-mono text-[9px] !text-slate-700 mt-1 font-bold">
                  {docType === 'filled' ? activeReg.id : 'BLANK-FORM-A4'}
                </span>
                <span className="text-[8px] !text-emerald-800 font-bold !bg-emerald-50 px-1.5 py-0.5 rounded border !border-emerald-300 uppercase">
                  {docType === 'filled' ? 'VERIFIED DIGITAL' : 'BLANGKO RESMI'}
                </span>
              </div>
            </div>

            {/* DOKUMEN JUDUL UTAMA */}
            <div className="text-center my-3 pb-2 border-b border-dashed !border-slate-300">
              <h2 className="text-sm font-black uppercase tracking-wider !text-slate-900">
                SURAT PERMOHONAN &amp; FORMULIR BERLANGGANAN BARU INTERNET FIBER
              </h2>
              <p className="text-[10px] !text-slate-600">
                Nomor Formulir:{' '}
                <strong className="font-mono !text-slate-900">
                  {docType === 'filled' ? activeReg.id : 'REG-........................'}
                </strong>{' '}
                &bull; Tanggal Pengajuan:{' '}
                {docType === 'filled' ? formatDateIndo(activeReg.createdAt.slice(0, 10)) : '...... / ...... / ......'}
              </p>
            </div>

            {/* ======================================================== */}
            {/* TAMPILAN 1: FORMULIR TERISI (DIGITAL DATA)               */}
            {/* ======================================================== */}
            {docType === 'filled' ? (
              <>
                {/* SECTION 1: DATA PEMOHON */}
                <div className="mb-3">
                  <div className="!bg-slate-100 px-2 py-1 font-bold text-[10px] uppercase !text-slate-800 border-l-4 !border-slate-800 mb-1.5 flex items-center justify-between">
                    <span>I. DATA IDENTITAS CALON PELANGGAN (PEMOHON)</span>
                    <span className="text-[9px] font-normal !text-slate-600">Sesuai KTP / Tanda Pengenal Sah</span>
                  </div>
                  <table className="w-full text-[10.5px] border !border-slate-300 border-collapse">
                    <tbody>
                      <tr className="border-b !border-slate-200">
                        <td className="w-[28%] p-1.5 !bg-slate-50 font-semibold !text-slate-700">Nama Lengkap Pemohon</td>
                        <td className="p-1.5 font-bold uppercase !text-slate-900">{activeReg.fullName}</td>
                        <td className="w-[18%] p-1.5 !bg-slate-50 font-semibold !text-slate-700">No. KTP / NIK</td>
                        <td className="p-1.5 font-mono font-bold !text-slate-900">{activeReg.nik}</td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">No. WhatsApp / HP Utama</td>
                        <td className="p-1.5 font-mono font-bold !text-emerald-800">{activeReg.phone}</td>
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">Alamat Email</td>
                        <td className="p-1.5 !text-slate-800">{activeReg.email || '-'}</td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">Pekerjaan / Instansi</td>
                        <td className="p-1.5 !text-slate-800">{activeReg.occupation || '-'}</td>
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">Status Tempat Tinggal</td>
                        <td className="p-1.5 !text-slate-800 capitalize">
                          {activeReg.housingStatus === 'owned' ? 'Milik Sendiri' : activeReg.housingStatus === 'rented' ? 'Sewa / Kontrak' : 'Kantor / Usaha'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">Kontak Darurat (Keluarga)</td>
                        <td colSpan={3} className="p-1.5 !text-slate-800">
                          {activeReg.emergencyContactName ? (
                            <>
                              <strong>{activeReg.emergencyContactName}</strong>{' '}
                              {activeReg.emergencyContactRelation ? `(${activeReg.emergencyContactRelation})` : ''} &bull; No. HP:{' '}
                              <span className="font-mono">{activeReg.emergencyContactPhone || '-'}</span>
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECTION 2: ALAMAT & LOKASI PEMASANGAN */}
                <div className="mb-3">
                  <div className="!bg-slate-100 px-2 py-1 font-bold text-[10px] uppercase !text-slate-800 border-l-4 !border-slate-800 mb-1.5 flex items-center justify-between">
                    <span>II. ALAMAT LENGKAP &amp; TITIK LOKASI PEMASANGAN (INSTALLATION SITE)</span>
                    <span className="text-[9px] font-normal !text-slate-600">Titik Penarikan Kabel Dropcore</span>
                  </div>
                  <table className="w-full text-[10.5px] border !border-slate-300 border-collapse">
                    <tbody>
                      <tr className="border-b !border-slate-200">
                        <td className="w-[28%] p-1.5 !bg-slate-50 font-semibold !text-slate-700">Alamat Jalan &amp; No. Rumah</td>
                        <td colSpan={3} className="p-1.5 font-bold !text-slate-900">{activeReg.address}</td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">RT / RW &amp; Kelurahan / Desa</td>
                        <td className="p-1.5 !text-slate-800">
                          {activeReg.rtRw ? `RT ${activeReg.rtRw}` : ''}
                          {activeReg.rtRw && activeReg.village ? ' • ' : ''}
                          {activeReg.village ? `Kel. ${activeReg.village}` : (!activeReg.rtRw ? '-' : '')}
                        </td>
                        <td className="w-[18%] p-1.5 !bg-slate-50 font-semibold !text-slate-700">Kecamatan</td>
                        <td className="p-1.5 !text-slate-800">{activeReg.district ? `Kec. ${activeReg.district}` : '-'}</td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">Kota / Kab. &amp; Kode Pos</td>
                        <td className="p-1.5 !text-slate-800">{activeReg.city || '-'}{activeReg.postalCode ? ` • Pos: ${activeReg.postalCode}` : ''}</td>
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">Koordinat GPS</td>
                        <td className="p-1.5 font-mono text-[10px] !text-slate-800">
                          {activeReg.latitude && activeReg.longitude
                            ? `${activeReg.latitude}, ${activeReg.longitude}`
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-1.5 !bg-slate-50 font-semibold !text-slate-700">Patokan / Acuan Lokasi</td>
                        <td colSpan={3} className={`p-1.5 !text-slate-900 ${activeReg.landmark ? 'font-semibold italic !bg-amber-50' : ''}`}>
                          {activeReg.landmark ? `"${activeReg.landmark}"` : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECTION 3: PAKET LAYANAN & RINCIAN BIAYA */}
                <div className="mb-3">
                  <div className="!bg-slate-100 px-2 py-1 font-bold text-[10px] uppercase !text-slate-800 border-l-4 !border-slate-800 mb-1.5 flex items-center justify-between">
                    <span>III. PILIHAN PAKET LAYANAN INTERNET &amp; BIAYA INVESTASI</span>
                    <span className="text-[9px] font-normal !text-slate-600">Unlimited Kuota (Tanpa FUP)</span>
                  </div>
                  <table className="w-full text-[10.5px] border !border-slate-300 border-collapse">
                    <thead>
                      <tr className="!bg-slate-100 border-b !border-slate-300 !text-slate-800 text-[10px]">
                        <th className="p-1.5 text-left w-[45%]">Rincian Layanan / Komponen</th>
                        <th className="p-1.5 text-center w-[20%]">Spesifikasi</th>
                        <th className="p-1.5 text-center w-[15%]">Jadwal Pasang</th>
                        <th className="p-1.5 text-right w-[20%]">Tarif / Biaya</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b !border-slate-200">
                        <td className="p-1.5">
                          <strong className="!text-slate-900">{activeReg.packageName}</strong>
                          <span className="block text-[9px] !text-slate-600">Langganan Internet Dedicated Fiber Optik 24 Jam Nonstop</span>
                        </td>
                        <td className="p-1.5 text-center font-mono font-bold !text-emerald-800">
                          {activeReg.packageSpeed}
                        </td>
                        <td className="p-1.5 text-center !text-slate-700 text-[10px]">
                          {formatDateIndo(activeReg.preferredDate)}
                          <span className="block text-[8.5px] !text-slate-500 uppercase">({activeReg.preferredTimeSlot})</span>
                        </td>
                        <td className="p-1.5 text-right font-mono font-bold !text-slate-900">
                          {formatRupiah(activeReg.packagePrice)} /bln
                        </td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-1.5">
                          <strong>Biaya Pasang Baru / Registrasi</strong>
                          <span className="block text-[9px] !text-slate-600">Termasuk penarikan kabel dropcore &amp; aktivasi terminasi optik</span>
                        </td>
                        <td className="p-1.5 text-center !text-slate-600 text-[10px]">Standar ISP</td>
                        <td className="p-1.5 text-center font-bold !text-slate-700 text-[10px]">Ditentukan Saat Survey</td>
                        <td className="p-1.5 text-right font-mono !text-slate-400 text-[10px]">-</td>
                      </tr>
                      {activeReg.additionalServices && activeReg.additionalServices.length > 0 && (
                        <tr className="border-b !border-slate-200">
                          <td className="p-1.5" colSpan={3}>
                            <strong>Layanan Tambahan (Add-On):</strong> {activeReg.additionalServices.join(', ')}
                          </td>
                          <td className="p-1.5 text-right font-mono !text-slate-700">Termasuk</td>
                        </tr>
                      )}
                      <tr className="!bg-slate-50 font-bold border-t !border-slate-300">
                        <td colSpan={3} className="p-2 text-right uppercase text-[10px] !text-slate-800">
                          Estimasi Iuran Paket Bulanan (Biaya Pasang Ditentukan Saat Survey):
                        </td>
                        <td className="p-2 text-right font-mono text-xs !text-emerald-800">
                          {formatRupiah(activeReg.packagePrice)} /bln
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* ======================================================== */
              /* TAMPILAN 2: BLANGKO KOSONG UNTUK FORMULIR FISIK LAPANGAN */
              /* ======================================================== */
              <>
                {/* SECTION 1 BLANK: DATA CALON PELANGGAN */}
                <div className="mb-3">
                  <div className="!bg-slate-100 px-2 py-1 font-bold text-[10px] uppercase !text-slate-800 border-l-4 !border-slate-800 mb-1.5 flex items-center justify-between">
                    <span>I. DATA IDENTITAS CALON PELANGGAN (PEMOHON)</span>
                    <span className="text-[9px] font-normal !text-slate-600">Harap Diisi dengan Huruf Cetak / Balok</span>
                  </div>
                  <table className="w-full text-[10px] border !border-slate-300 border-collapse">
                    <tbody>
                      <tr className="border-b !border-slate-200">
                        <td className="w-[28%] p-2 !bg-slate-50 font-semibold !text-slate-700">Nama Lengkap (KTP)</td>
                        <td className="p-2 border-b border-dotted !border-slate-400 font-mono !text-slate-500" colSpan={3}>
                          ................................................................................................................................................
                        </td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">No. Induk Kependudukan (NIK)</td>
                        <td className="p-2" colSpan={3}>
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <span key={i} className="w-5 h-6 border !border-slate-400 inline-flex items-center justify-center font-bold !text-slate-400">
                                &nbsp;
                              </span>
                            ))}
                            <span className="text-[9px] !text-slate-500 ml-2">(16 Digit KTP)</span>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">No. WhatsApp / HP Utama</td>
                        <td className="p-2 w-[35%] font-mono !text-slate-500">08 ........................................</td>
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700 w-[15%]">Email</td>
                        <td className="p-2 !text-slate-500">................................................</td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">Pekerjaan / Instansi</td>
                        <td className="p-2 !text-slate-500">................................................</td>
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">Status Rumah</td>
                        <td className="p-2">
                          <div className="flex items-center gap-3 text-[9.5px]">
                            <label className="flex items-center gap-1">
                              <span className="w-3.5 h-3.5 border !border-slate-500 inline-block" /> Milik Sendiri
                            </label>
                            <label className="flex items-center gap-1">
                              <span className="w-3.5 h-3.5 border !border-slate-500 inline-block" /> Kontrak/Sewa
                            </label>
                            <label className="flex items-center gap-1">
                              <span className="w-3.5 h-3.5 border !border-slate-500 inline-block" /> Usaha
                            </label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">Kontak Darurat (Keluarga)</td>
                        <td colSpan={3} className="p-2 !text-slate-500">
                          Nama: .................................................... Hubungan: ............................ No. HP: ....................................................
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECTION 2 BLANK: ALAMAT LOKASI PEMASANGAN */}
                <div className="mb-3">
                  <div className="!bg-slate-100 px-2 py-1 font-bold text-[10px] uppercase !text-slate-800 border-l-4 !border-slate-800 mb-1.5 flex items-center justify-between">
                    <span>II. ALAMAT LENGKAP &amp; TITIK LOKASI PEMASANGAN (INSTALLATION SITE)</span>
                    <span className="text-[9px] font-normal !text-slate-600">Titik Penarikan Kabel Dropcore</span>
                  </div>
                  <table className="w-full text-[10px] border !border-slate-300 border-collapse">
                    <tbody>
                      <tr className="border-b !border-slate-200">
                        <td className="w-[28%] p-2 !bg-slate-50 font-semibold !text-slate-700">Alamat Jalan &amp; No. Rumah</td>
                        <td colSpan={3} className="p-2 !text-slate-500">
                          ................................................................................................................................................
                        </td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">RT / RW &amp; Kelurahan</td>
                        <td className="p-2 !text-slate-500">RT: .......... / RW: .......... &bull; Kel: ........................................</td>
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700 w-[18%]">Kecamatan</td>
                        <td className="p-2 !text-slate-500">................................................</td>
                      </tr>
                      <tr className="border-b !border-slate-200">
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">Kota / Kab. &amp; Kode Pos</td>
                        <td className="p-2 !text-slate-500">................................................ &bull; Pos: ....................</td>
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">Koordinat GPS</td>
                        <td className="p-2 !text-slate-500 font-mono">Lat: ................ Lng: ................</td>
                      </tr>
                      <tr>
                        <td className="p-2 !bg-slate-50 font-semibold !text-slate-700">Patokan / Acuan Rumah</td>
                        <td colSpan={3} className="p-2 !text-slate-500 italic">
                          Contoh: Samping Masjid / Rumah Pagar Hitam Cat Hijau: ......................................................................................
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECTION 3 BLANK: PILIHAN PAKET LAYANAN */}
                <div className="mb-3">
                  <div className="!bg-slate-100 px-2 py-1 font-bold text-[10px] uppercase !text-slate-800 border-l-4 !border-slate-800 mb-1.5 flex items-center justify-between">
                    <span>III. PILIHAN PAKET LAYANAN INTERNET FIBER OPTIC (BERI TANDA CENTANG [ ✓ ])</span>
                    <span className="text-[9px] font-normal !text-slate-600">Pilih Salah Satu</span>
                  </div>
                  <table className="w-full text-[10px] border !border-slate-300 border-collapse">
                    <thead>
                      <tr className="!bg-slate-100 border-b !border-slate-300 !text-slate-800">
                        <th className="p-1.5 text-center w-[8%]">Pilih</th>
                        <th className="p-1.5 text-left w-[42%]">Nama Paket Layanan</th>
                        <th className="p-1.5 text-center w-[20%]">Kecepatan Bandwidth</th>
                        <th className="p-1.5 text-right w-[30%]">Tarif Bulanan (IDR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayPackages.map(p => (
                        <tr key={p.id} className="border-b !border-slate-200">
                          <td className="p-2 text-center">
                            <span className="w-4 h-4 border !border-slate-700 inline-block rounded" />
                          </td>
                          <td className="p-2 font-semibold !text-slate-900">{p.name}</td>
                          <td className="p-2 text-center font-mono font-bold !text-slate-800">{p.rateLimit}</td>
                          <td className="p-2 text-right font-mono font-bold !text-slate-900">{formatRupiah(p.price)} /bln</td>
                        </tr>
                      ))}
                      <tr className="border-b !border-slate-200 !bg-slate-50">
                        <td className="p-1.5 text-center font-bold">Biaya:</td>
                        <td className="p-1.5">
                          Biaya Pasang Baru / Registrasi:
                        </td>
                        <td className="p-1.5 text-center font-bold !text-slate-700">Ditentukan Saat Survey</td>
                        <td className="p-1.5 text-right text-[9px] !text-slate-400">-</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 text-center font-bold">Jadwal:</td>
                        <td colSpan={3} className="p-1.5">
                          Rencana Tanggal Pasang: ...... / ...... / ...... &nbsp;&bull;&nbsp; Sesi: [ &nbsp; ] Pagi (09-12) &nbsp;&nbsp; [ &nbsp; ] Siang (13-15) &nbsp;&nbsp; [ &nbsp; ] Sore (15-17)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* SECTION 4: KETENTUAN DAN PERSYARATAN BERLANGGANAN (SLA RESMI) */}
            <div className="mb-4">
              <div className="!bg-slate-100 px-2 py-1 font-bold text-[10px] uppercase !text-slate-800 border-l-4 !border-slate-800 mb-1.5">
                IV. SYARAT DAN KETENTUAN BERLANGGANAN LAYANAN (STANDAR SLA ISP)
              </div>
              <div className="p-2 !bg-slate-50 border !border-slate-300 rounded text-[8.5px] !text-slate-700 space-y-1 leading-normal">
                <p>
                  <strong>1. Hak Milik Perangkat:</strong> Perangkat Optical Network Terminal (ONT / Modem WiFi) dan kabel Dropcore Fiber Optik yang terpasang di lokasi pelanggan merupakan aset inventaris milik Penyelenggara Layanan (ISP) yang dipinjam-pakaikan selama status berlangganan aktif.
                </p>
                <p>
                  <strong>2. Masa Berlangganan:</strong> Masa komitmen berlangganan minimal adalah 3 (tiga) bulan kalender sejak status layanan dinyatakan aktif / terpasang secara sukses oleh tim teknisi lapangan.
                </p>
                <p>
                  <strong>3. Kewajiban Pembayaran &amp; Jatuh Tempo:</strong> Tagihan bulanan wajib diselesaikan selambat-lambatnya pada tanggal jatuh tempo setiap bulannya. Keterlambatan pembayaran berakibat pada sistem isolir otomatis (pemutusan akses internet sementara secara digital oleh server).
                </p>
                <p>
                  <strong>4. Larangan Penjualan Kembali (Anti-Reselling):</strong> Pelanggan dilarang keras menjual kembali (reselling), membagikan jalur kabel ke pihak ketiga di luar bangunan tempat tinggal tanpa izin tertulis dari pihak ISP sesuai UU Telekomunikasi No. 36 Tahun 1999.
                </p>
                <p>
                  <strong>5. Pernyataan Persetujuan:</strong> Calon Pelanggan menyatakan seluruh data yang tercantum adalah sah dan benar, serta telah membaca, memahami, dan menyepakati seluruh ketentuan di atas.
                </p>
              </div>
            </div>

            {/* SECTION 5: KOLOM 3 TANDA TANGAN & PENGESAHAN */}
            <div className="grid grid-cols-3 gap-3 text-center text-[9.5px] pt-1">
              <div className="p-2 border !border-slate-300 rounded !bg-white flex flex-col justify-between h-28">
                <span className="font-semibold !text-slate-700 block">Pemohon / Calon Pelanggan,</span>
                <div>
                  <strong className="block !text-slate-900 border-t !border-slate-400 pt-1 uppercase">
                    {docType === 'filled' ? activeReg.fullName : '................................................'}
                  </strong>
                  <span className="text-[8px] !text-slate-500">
                    {docType === 'filled' ? `Tgl: ${formatDateIndo(activeReg.createdAt.slice(0, 10))}` : 'Tgl: ...... / ...... / ......'}
                  </span>
                </div>
              </div>

              <div className="p-2 border !border-slate-300 rounded !bg-white flex flex-col justify-between h-28">
                <span className="font-semibold !text-slate-700 block">Sales / Account Representative,</span>
                <div>
                  <strong className="block !text-slate-900 border-t !border-slate-400 pt-1 uppercase">
                    {ispProfile?.brandName || 'Masmedia Net Official'}
                  </strong>
                  <span className="text-[8px] !text-slate-500">Petugas Pemasaran ISP</span>
                </div>
              </div>

              <div className="p-2 border !border-slate-300 rounded !bg-white flex flex-col justify-between h-28">
                <span className="font-semibold !text-slate-700 block">Supervisor Teknik / NOC,</span>
                <div>
                  <strong className="block !text-slate-900 border-t !border-slate-400 pt-1 uppercase">
                    Tim Lapangan FTTH
                  </strong>
                  <span className="text-[8px] !text-slate-500">Status: Siap Pasang &amp; Aktivasi</span>
                </div>
              </div>
            </div>

            {/* FOOTER KETERANGAN DOKUMEN */}
            <div className="mt-3 pt-2 border-t !border-slate-300 text-[8px] !text-slate-500 flex items-center justify-between">
              <span>Diunduh via Billing Portal Mandiri &bull; Cetak Rangkap 2</span>
              <span className="font-mono">TIMESTAMP: {formatDateTimeIndo(new Date().toISOString())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
