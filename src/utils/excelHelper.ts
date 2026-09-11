import * as XLSX from 'xlsx';
import { Customer, InternetPackage, MikroTikNAS } from '../types';

export interface CustomerExportRow {
  'No': number;
  'User': string;
  'Password': string;
  'Profile': string;
  'NAS': string;
  'Service': string;
  'IP': string;
  'Name': string;
  'Phone': string;
  'Address': string;
}

export interface ImportResult {
  success: boolean;
  totalParsed: number;
  addedCount: number;
  updatedCount: number;
  errors: string[];
  importedCustomers: Customer[];
}

/**
 * Format string profile / speed to matching InternetPackage
 */
export function findOrCreatePackage(
  profileStr: string,
  existingPackages: InternetPackage[]
): InternetPackage {
  const cleanProfile = (profileStr || '').trim();
  const lower = cleanProfile.toLowerCase().replace(/\s+/g, '');

  // Match existing package by name or profileName
  const matched = existingPackages.find(p => {
    const pNameLower = p.name.toLowerCase().replace(/\s+/g, '');
    const pProfileLower = p.profileName.toLowerCase().replace(/\s+/g, '');
    return (
      pNameLower === lower ||
      pProfileLower === lower ||
      p.rateLimit.toLowerCase().includes(lower) ||
      (lower.includes('20') && p.downloadSpeed === 20) ||
      (lower.includes('10') && p.downloadSpeed === 10) ||
      ((lower.includes('5mb') || lower === '5mbps' || lower === '5m') && p.downloadSpeed === 5)
    );
  });

  if (matched) return matched;

  const isAdminOrBypass = lower.includes('admin') || lower.includes('bypass');
  const speed = lower.includes('20') ? 20 : lower.includes('10') ? 10 : lower.includes('5') ? 5 : isAdminOrBypass ? 100 : 5;

  // Fallback to first available package or create a reasonable package match
  return {
    id: `PKG-${cleanProfile.toUpperCase().replace(/[^A-Z0-9]/g, '') || '5M'}`,
    name: cleanProfile.toUpperCase() || '5 MBPS',
    downloadSpeed: speed,
    uploadSpeed: Math.max(2, Math.floor(speed / 2)),
    rateLimit: `${speed}M/${Math.max(2, Math.floor(speed / 2))}M`,
    price: isAdminOrBypass ? 0 : speed === 20 ? 250000 : speed === 10 ? 175000 : 100000,
    validityDays: 30,
    sharedUsers: 1,
    profileName: `profile-${cleanProfile.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    poolName: 'pool-pppoe',
    priority: 8,
    category: 'pppoe',
    description: `Paket ${cleanProfile}`,
    colorBadge: isAdminOrBypass ? 'purple' : speed >= 20 ? 'amber' : speed >= 10 ? 'blue' : 'emerald',
    isActive: true,
  };
}

/**
 * Export customers to Excel (.xlsx) file matching the user's specific column format:
 * no;user;password;profile;nas;service;ip;name;phone;address
 */
export function exportCustomersToExcel(
  customers: Customer[],
  packages: InternetPackage[],
  nasList: MikroTikNAS[],
  filename: string = 'data_pelanggan_ppp_dhcp.xlsx'
) {
  // Format rows exactly to the requested headers
  const data: CustomerExportRow[] = customers.map((c, index) => {
    const pkg = packages.find(p => p.id === c.packageId);
    const nas = nasList.find(n => n.id === c.nasId);
    
    // Formatter Profile Name e.g. "5 MBPS", "10 MBPS", "ADMIN", "BYPASS"
    const profileLabel = pkg ? (pkg.name.toUpperCase().includes('MBPS') ? pkg.name.toUpperCase() : `${pkg.downloadSpeed} MBPS`) : '5 MBPS';
    const nasLabel = nas ? nas.name.toUpperCase() : 'MASMEDIA';

    return {
      'No': index + 1,
      'User': c.username || '',
      'Password': c.password || '',
      'Profile': profileLabel,
      'NAS': nasLabel,
      'Service': c.connectionType === 'pppoe' ? 'pppoe' : c.connectionType === 'hotspot' ? 'hotspot' : '-',
      'IP': c.ipAddress || '',
      'Name': c.name || c.username || '',
      'Phone': c.phone ? String(c.phone).replace(/[^0-9]/g, '') : '',
      'Address': c.address || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for a clean presentation
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // User
    { wch: 18 }, // Password
    { wch: 16 }, // Profile
    { wch: 14 }, // NAS
    { wch: 12 }, // Service
    { wch: 18 }, // IP
    { wch: 24 }, // Name
    { wch: 18 }, // Phone
    { wch: 32 }, // Address
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pelanggan PPP-DHCP');

  XLSX.writeFile(workbook, filename);
}

/**
 * Export customers to CSV (.csv with semicolon delimiter) matching format:
 * no;user;password;profile;nas;service;ip;name;phone;address
 */
export function exportCustomersToCSV(
  customers: Customer[],
  packages: InternetPackage[],
  nasList: MikroTikNAS[],
  filename: string = 'data_pelanggan_ppp_dhcp.csv'
) {
  const headers = ['no', 'user', 'password', 'profile', 'nas', 'service', 'ip', 'name', 'phone', 'address'];
  
  const rows = customers.map((c, index) => {
    const pkg = packages.find(p => p.id === c.packageId);
    const nas = nasList.find(n => n.id === c.nasId);
    const profileLabel = pkg ? (pkg.name.toUpperCase().includes('MBPS') ? pkg.name.toUpperCase() : `${pkg.downloadSpeed} MBPS`) : '5 MBPS';
    const nasLabel = nas ? nas.name.toUpperCase() : 'MASMEDIA';
    const service = c.connectionType === 'pppoe' ? 'pppoe' : c.connectionType === 'hotspot' ? 'hotspot' : '-';

    return [
      index + 1,
      `"${(c.username || '').replace(/"/g, '""')}"`,
      `"${(c.password || '').replace(/"/g, '""')}"`,
      `"${profileLabel.replace(/"/g, '""')}"`,
      `"${nasLabel.replace(/"/g, '""')}"`,
      `"${service.replace(/"/g, '""')}"`,
      `"${(c.ipAddress || '').replace(/"/g, '""')}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses Raw Semicolon or Comma Separated Text OR Excel workbook buffer
 */
export function parseRawCustomerText(
  rawText: string,
  existingPackages: InternetPackage[],
  existingNAS: MikroTikNAS[],
  currentCustomers: Customer[]
): ImportResult {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const errors: string[] = [];
  const parsedCustomers: Customer[] = [];

  let startIdx = 0;
  if (lines.length > 0) {
    const firstLineLower = lines[0].toLowerCase();
    if (firstLineLower.includes('user') && (firstLineLower.includes('password') || firstLineLower.includes('profile') || firstLineLower.includes('ip'))) {
      startIdx = 1; // Header row detected
    }
  }

  const defaultNasId = existingNAS[0]?.id || 'NAS-01';

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Split by semicolon or comma or tab
    let cols: string[] = [];
    if (line.includes(';')) {
      cols = line.split(';').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
    } else if (line.includes('\t')) {
      cols = line.split('\t').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
    } else if (line.includes(',')) {
      cols = line.split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
    } else {
      cols = line.split(/\s+/).map(c => c.trim());
    }

    if (cols.length < 2) {
      errors.push(`Baris ${i + 1}: Format tidak valid "${line}"`);
      continue;
    }

    // Expected format:
    // 0: no (optional/number), 1: user, 2: password, 3: profile, 4: nas, 5: service, 6: ip, 7: name, 8: phone, 9: address
    let no = '', username = '', password = '', profile = '', nasName = '', service = '', ip = '', name = '', phone = '', address = '';

    if (cols.length >= 10) {
      [no, username, password, profile, nasName, service, ip, name, phone, address] = cols;
    } else if (cols.length === 9) {
      // Missing 'no' column
      [username, password, profile, nasName, service, ip, name, phone, address] = cols;
    } else {
      // Partial columns mapping
      username = cols[1] || cols[0] || '';
      password = cols[2] || cols[1] || username;
      profile = cols[3] || '5 MBPS';
      nasName = cols[4] || 'MASMEDIA';
      service = cols[5] || 'pppoe';
      ip = cols[6] || '';
      name = cols[7] || username;
      phone = cols[8] || '';
      address = cols[9] || '';
    }

    if (!username) {
      continue;
    }

    // Match package
    const matchedPkg = findOrCreatePackage(profile, existingPackages);

    // Format phone to 62...
    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('08')) {
      cleanPhone = '628' + cleanPhone.slice(2);
    }

    const matchedNas =
      existingNAS.find(
        n =>
          (nasName && nasName !== '-' && n.name.toLowerCase() === nasName.toLowerCase()) ||
          (nasName && nasName !== '-' && n.id.toLowerCase() === nasName.toLowerCase())
      ) ||
      existingNAS[0] || { id: 'NAS-01', name: 'MASMEDIA', ipAddress: '10.10.10.1' };

    const isAdminOrBypass = profile && (profile.toUpperCase().includes('ADMIN') || profile.toUpperCase().includes('BYPASS'));
    const customerIndex = parsedCustomers.length + currentCustomers.length + 1;

    const newCust: Customer = {
      id: `CUST-${String(customerIndex).padStart(3, '0')}`,
      name: name || username,
      phone: cleanPhone || '',
      address: address && address !== '-' ? address : '',
      rtRw: 'RT 01 / RW 01',
      username: username,
      password: password || username,
      packageId: matchedPkg.id,
      ipAddress: ip && ip !== '-' ? ip : `10.10.10.${50 + (customerIndex % 150)}`,
      macAddress: `48:8A:D2:77:88:${String(customerIndex % 99).padStart(2, '0')}`,
      connectionType: service && service.toLowerCase() === 'hotspot' ? 'hotspot' : 'pppoe',
      installDate: new Date().toISOString().slice(0, 10),
      dueDateDay: 10,
      status: 'active',
      autoIsolate: !isAdminOrBypass,
      notes: `PPPoE Import (${profile || '5 MBPS'}) - NAS: ${nasName && nasName !== '-' ? nasName : 'MASMEDIA'}`,
      nasId: matchedNas.id,
      onuSerial: `ZTEGC${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      coordinates: { lat: -6.9175 + (Math.random() - 0.5) * 0.01, lng: 107.6191 + (Math.random() - 0.5) * 0.01 },
      createdAt: new Date().toISOString().slice(0, 10),
    };

    parsedCustomers.push(newCust);
  }

  return {
    success: parsedCustomers.length > 0,
    totalParsed: parsedCustomers.length,
    addedCount: parsedCustomers.length,
    updatedCount: 0,
    errors,
    importedCustomers: parsedCustomers,
  };
}

/**
 * Parses XLSX / XLS / CSV file uploaded by user
 */
export async function parseExcelOrCsvFile(
  file: File,
  existingPackages: InternetPackage[],
  existingNAS: MikroTikNAS[],
  currentCustomers: Customer[]
): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          resolve({
            success: false,
            totalParsed: 0,
            addedCount: 0,
            updatedCount: 0,
            errors: ['File kosong atau tidak dapat dibaca'],
            importedCustomers: [],
          });
          return;
        }

        // If CSV, read as text first to support semicolon formats cleanly
        if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          const text = new TextDecoder('utf-8').decode(buffer as ArrayBuffer);
          const res = parseRawCustomerText(text, existingPackages, existingNAS, currentCustomers);
          resolve(res);
          return;
        }

        // Parse Excel workbook (.xlsx / .xls)
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          resolve({
            success: false,
            totalParsed: 0,
            addedCount: 0,
            updatedCount: 0,
            errors: ['Worksheet Excel kosong'],
            importedCustomers: [],
          });
          return;
        }

        // Convert 2D array of cells into text lines and parse
        const lines = rawJson
          .filter(row => Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && String(cell).trim().length > 0))
          .map(row => (row as any[]).map(cell => (cell !== null && cell !== undefined ? String(cell).trim() : '')).join(';'));

        const res = parseRawCustomerText(lines.join('\n'), existingPackages, existingNAS, currentCustomers);
        resolve(res);
      } catch (err: any) {
        resolve({
          success: false,
          totalParsed: 0,
          addedCount: 0,
          updatedCount: 0,
          errors: [err?.message || 'Gagal memproses file Excel'],
          importedCustomers: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        totalParsed: 0,
        addedCount: 0,
        updatedCount: 0,
        errors: ['Gagal membaca file dari browser'],
        importedCustomers: [],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Standard CSV Template with exact columns requested:
 * no;user;password;profile;nas;service;ip;name;phone;address
 */
export const DEFAULT_PPPOE_CSV_TEMPLATE = `no;user;password;profile;nas;service;ip;name;phone;address
1;ALAMIN;ALAMIN;5 MBPS;MASMEDIA;pppoe;10.10.10.66;ALAMIN;6285331752024;Batulintang
2;QUDSI;QUDSI;5 MBPS;MASMEDIA;pppoe;10.10.10.65;QUDSI;6282338166064;Padang jambu
3;MAWI;MAWI;5 MBPS;MASMEDIA;pppoe;10.10.10.63;MAWI;6282253279124;Padang jambu
4;AGUS;AGUS;10 MBPS;MASMEDIA;pppoe;10.10.10.25;AGUS;6282231133977;Padang jambu
5;UPTSDN388GRESIK;SDN388;20 MBPS;MASMEDIA;pppoe;10.10.10.2;SDN TELUKJATIDAWANG III;6282131681782;Jl. Sayyid Yusuf Desa Telukjatidawang`;

/**
 * User's full raw PPPoE dataset (47 customers) from prompt
 */
export const USER_RAW_PPPOE_CSV_DATA = `no;user;password;profile;nas;service;ip;name;phone;address
0;NURHAYATI;NURHAYATI;5 MBPS;MASMEDIA;-;10.10.10.66;NURHAYATI;;
1;ALAMIN;ALAMIN;5 MBPS;-;-;10.10.10.66;ALAMIN;6285331752024;
2;QUDSI;QUDSI;5 MBPS;MASMEDIA;-;10.10.10.65;QUDSI;6282338166064;
3;MAWI;MAWI;5 MBPS;MASMEDIA;-;10.10.10.63;MAWI;6282253279124;
4;KAMSIYAH;KAMSIYAH;5 MBPS;MASMEDIA;-;10.10.10.64;KAMSIYAH;6282142069991;
5;MUSAMMIL;MUSAMMIL;5 MBPS;MASMEDIA;-;10.10.10.62;MUSAMMIL;6282336742566;
6;KAMIL;KAMIL;5 MBPS;MASMEDIA;-;10.10.10.61;KAMIL;6285188622389;
7;ANAM;ANAM;5 MBPS;MASMEDIA;-;10.10.10.60;ANAM;6282339749598;
8;JAY;JAY;5 MBPS;MASMEDIA;-;10.10.10.59;JAY;6281249274033;
9;SUMRI;SUMRI;5 MBPS;MASMEDIA;-;10.10.10.58;SUMRI;6285335318133;
10;WIWIN;WIWIN;5MB;-;-;10.10.10.57;WIWIN;6285156217140;Batulintang
11;GARDU;GARDU;ADMIN;MASMEDIA;-;10.10.10.4;GARDU;;
12;ZAINAL;ZAINAL;5 MBPS;MASMEDIA;-;10.10.10.56;ZAINAL;6282330898852;
13;DILA;DILA;5 MBPS;-;-;10.10.10.55;DILA;6282337298365;
14;MAS;MAS;ADMIN;MASMEDIA;-;10.10.10.254;MAS;;
15;DAIFI;DAIFI;5 MBPS;-;-;10.10.10.52;DAIFI;6281234841644;
16;UTARI;UTARI;5 MBPS;-;-;10.10.10.33;UTARI;6282337509094;Padangjambu
17;FATAH;FATAH;5 MBPS;-;-;10.10.10.32;FATAH;6281334757950;Padang jambu
18;JUMALI;JUMALI;5 MBPS;-;-;10.10.10.31;JUMALI;6285124264687;Padangjambu
19;HAMIDA;HAMIDA;5 MBPS;-;-;10.10.10.51;HAMIDA;6282264476949;
20;BUNGA;BUNGA;5 MBPS;-;-;10.10.10.50;BUNGA;6285179658843;
21;KAMILATUN;KAMILATUN;5 MBPS;-;-;10.10.10.18;KAMILATUN;6282143447873;
22;HATMIN;HATMIN;5 MBPS;-;-;10.10.10.17;HATMIN;6282114284383;
23;RATIH;RATIH;BYPASS;-;-;10.10.10.30;RATIH;;
24;MADIYAH;MADIYAH;5 MBPS;-;-;10.10.10.29;MADIYAH;6282171828157;
25;RIFA;RIFA;5 MBPS;-;-;10.10.10.28;RIFA;6282232719451;
26;BIBA;BIBA;5 MBPS;-;-;10.10.10.16;BIBA;6282245719229;
27;IRMA;IRMA;5 MBPS;-;-;10.10.10.15;IRMA;6281333740813;
28;MAMAT;MAMAT;5 MBPS;-;-;10.10.10.27;MAMAT;6282145466628;Padang jambu
29;PIPI;PIPI;5 MBPS;-;-;10.10.10.26;PIPI;6285156242581;Padang jambu
30;AGUS;AGUS;10 MBPS;-;-;10.10.10.25;AGUS;6282231133977;Padang jambu
31;SALEHEN;SALEHEN;5 MBPS;-;-;10.10.10.13;SALEHEN;6282228987175;Batulintang
32;MUNISA;MUNISA;5 MBPS;-;-;10.10.10.12;MUNISA;6285236302817;Batulintang
33;SOFI;SOFI;5 MBPS;-;-;10.10.10.11;SOFI;6282163028502;Batulintang
34;DINI;DINI;5 MBPS;-;-;10.10.10.24;DINI;6285161914356;Padang jambu
35;MUIN;MUIN;5 MBPS;-;-;10.10.10.23;MUIN;6285232289980;Padang jambu
36;HASNA;HASNA;5 MBPS;-;-;10.10.10.22;ASNA;6285328194429;Padang jambu
37;NOVA;NOVA;5 MBPS;-;-;10.10.10.21;NOVA;6285331752050;Padang jambu
38;IBNU;IBNU;5 MBPS;-;-;10.10.10.20;IBNU;6285156242581;Padang jambu
39;HASBULLAH;HASBULLAH;5 MBPS;MASMEDIA;-;10.10.10.10;HASBULLAH;6285148458382;Batulintang
40;ABIDIN;ABIDIN;5 MBPS;MASMEDIA;-;10.10.10.8;ABIDIN;6282350166340;Batulintang
41;ZAMAN;ZAMAN;5 MBPS;MASMEDIA;-;10.10.10.7;ZAMAN;6281232089564;Batulintang
42;ari;ari;ADMIN;-;-;10.10.10.252;ari;;
43;HUB;HUB;ADMIN;MASMEDIA;-;10.10.10.253;HUB;;
44;ILA;ILA;5 MBPS;MASMEDIA;-;10.10.10.6;ILA;6281227897675;Batulintang
45;UPTSDN388GRESIK;SDN388;20 MBPS;MASMEDIA;-;10.10.10.2;SDN TELUKJATIDAWANG III;6282131681782;Jl. Sayyid Yusuf Desa Telukjatidawang
46;yanto;yanto;5 MBPS;MASMEDIA;-;10.10.10.3;YANTO;6281331343554;Batulintang`;

/**
 * Downloads CSV template matching user column specification:
 * no;user;password;profile;nas;service;ip;name;phone;address
 */
export function downloadCustomerTemplateCSV(filename: string = 'template_impor_pppoe.csv') {
  const csvContent = '\uFEFF' + DEFAULT_PPPOE_CSV_TEMPLATE;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads Excel (.xlsx) template matching user column specification
 */
export function downloadCustomerTemplateExcel(filename: string = 'template_impor_pppoe.xlsx') {
  const sampleRows = [
    { no: 1, user: 'ALAMIN', password: 'password123', profile: '5 MBPS', nas: 'MASMEDIA', service: 'pppoe', ip: '10.10.10.66', name: 'ALAMIN', phone: '6285331752024', address: 'Batulintang' },
    { no: 2, user: 'QUDSI', password: 'password123', profile: '5 MBPS', nas: 'MASMEDIA', service: 'pppoe', ip: '10.10.10.65', name: 'QUDSI', phone: '6282338166064', address: 'Padang jambu' },
    { no: 3, user: 'MAWI', password: 'password123', profile: '5 MBPS', nas: 'MASMEDIA', service: 'pppoe', ip: '10.10.10.63', name: 'MAWI', phone: '6282253279124', address: 'Padang jambu' },
    { no: 4, user: 'AGUS', password: 'password123', profile: '10 MBPS', nas: 'MASMEDIA', service: 'pppoe', ip: '10.10.10.25', name: 'AGUS', phone: '6282231133977', address: 'Padang jambu' },
    { no: 5, user: 'UPTSDN388GRESIK', password: 'password123', profile: '20 MBPS', nas: 'MASMEDIA', service: 'pppoe', ip: '10.10.10.2', name: 'SDN TELUKJATIDAWANG III', phone: '6282131681782', address: 'Jl. Sayyid Yusuf Desa Telukjatidawang' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows, {
    header: ['no', 'user', 'password', 'profile', 'nas', 'service', 'ip', 'name', 'phone', 'address'],
  });

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 26 },
    { wch: 18 },
    { wch: 36 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template PPPoE');
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates sample bulk PPPoE rows for stress-testing and demonstration of importing > 47 accounts
 */
export function generateBulkSamplePPPoE(count: number = 100): string {
  const desa = ['Batulintang', 'Padang jambu', 'Telukjatidawang', 'Kepanjen', 'Bungah', 'Dukun', 'Sidayu', 'Panceng'];
  const speeds = ['5 MBPS', '5 MBPS', '10 MBPS', '10 MBPS', '20 MBPS'];
  let lines = ['no;user;password;profile;nas;service;ip;name;phone;address'];

  for (let i = 1; i <= count; i++) {
    const user = `user_pppoe_${String(i).padStart(3, '0')}`;
    const pass = `pass${String(i).padStart(3, '0')}`;
    const sp = speeds[i % speeds.length];
    const ip = `10.10.${Math.floor(i / 250) + 10}.${(i % 240) + 2}`;
    const d = desa[i % desa.length];
    const phone = `62821${String(10000000 + i).slice(1)}`;
    const name = `Pelanggan PPPoE ${i}`;
    lines.push(`${i};${user};${pass};${sp};MASMEDIA;pppoe;${ip};${name};${phone};Desa ${d}`);
  }

  return lines.join('\n');
}
