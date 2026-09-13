export type CustomerStatus = 'active' | 'due_soon' | 'overdue' | 'isolated' | 'disabled';

export type ConnectionType = 'pppoe' | 'hotspot';

export interface Customer {
  id: string; // e.g. CUST-001
  tenantId?: string; // Tenant / Branch ID e.g. 'tenant-masmedia'
  name: string;
  phone: string; // e.g. 081234567890
  address: string;
  rtRw?: string;
  username: string; // RADIUS Username
  password: string; // RADIUS Password
  packageId: string;
  ipAddress: string;
  macAddress?: string;
  connectionType: ConnectionType;
  installDate: string; // YYYY-MM-DD
  installationDate?: string;
  dueDateDay: number; // e.g. 10 (tanggal jatuh tempo tiap bulan)
  dueDate?: number | string;
  status: CustomerStatus;
  autoIsolate: boolean;
  notes?: string;
  nasId: string; // Router ID
  onuSerial?: string; // Serial modem/ONT
  coordinates?: {
    lat: number;
    lng: number;
  };
  lastPaymentDate?: string;
  totalPaid?: number;
  createdAt: string;
}

export interface InternetPackage {
  id: string;
  tenantId?: string;
  name: string;
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  rateLimit: string; // e.g. "10M/5M" or "20M/20M"
  price: number; // IDR, e.g. 150000
  validityDays: number; // e.g. 30
  sharedUsers: number; // e.g. 1
  fupQuotaGB?: number; // 0 or null = Unlimited
  profileName: string; // MikroTik profile
  poolName: string; // e.g. "pool-pppoe"
  burstLimit?: string;
  priority: number; // 1-8
  category: 'pppoe' | 'hotspot' | 'both';
  description: string;
  colorBadge: string;
  isActive: boolean;
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'transfer_bca' | 'transfer_mandiri' | 'transfer_bri' | 'transfer_bni' | 'qris' | 'cash' | 'payment_gateway';

export interface Invoice {
  id: string; // e.g. INV-202608-0001
  tenantId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  packagePrice: number;
  period: string; // e.g. "Agustus 2026"
  periodMonth: number; // 1-12
  periodYear: number; // e.g. 2026
  lateFee: number; // Denda jika menunggak
  discount: number;
  totalAmount: number;
  uniqueCode?: number; // 3 digit unique code (e.g. 124)
  amountWithCode?: number; // totalAmount + uniqueCode (e.g. 150124)
  createdAt: string;
  dueDate: string; // YYYY-MM-DD
  paidAt?: string;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  receivedBy?: string;
  notes?: string;
}

export interface MikroTikNAS {
  id: string;
  tenantId?: string;
  name: string;
  ipAddress: string;
  apiPort: number;
  radiusSecret: string;
  username: string;
  password?: string;
  model: string;
  rosVersion: string;
  cpuLoad: number;
  freeMemoryMB: number;
  totalMemoryMB: number;
  uptime: string;
  status: 'online' | 'offline' | 'warning';
  activePppoeCount: number;
  activeHotspotCount: number;
  lastPing: string;
}

export interface ActiveSession {
  id: string;
  tenantId?: string;
  username: string;
  customerName: string;
  ipAddress: string;
  macAddress: string;
  nasId: string;
  nasName: string;
  service: ConnectionType;
  uptime: string;
  uptimeSeconds: number;
  bytesIn: number; // Downloaded
  bytesOut: number; // Uploaded
  rxRate: string; // e.g. "8.4 Mbps"
  txRate: string; // e.g. "2.1 Mbps"
  callerId: string;
  loginTime: string;
}

export interface WhatsAppTemplate {
  id: string;
  code: 'tagihan_baru' | 'pengingat_h3' | 'pengingat_h1' | 'pemberitahuan_isolir' | 'pembayaran_lunas' | 'aktivasi_baru';
  title: string;
  content: string;
  description: string;
}

export interface IsolirRuleConfig {
  autoIsolateEnabled: boolean;
  gracePeriodDays: number; // Toleransi hari setelah jatuh tempo sebelum isolir (e.g. 3 hari)
  defaultDueDateDay: number; // Default tgl jatuh tempo (e.g. tgl 10)
  isolirPoolName: string; // e.g. "pool-isolir"
  isolirProfileName: string; // e.g. "profile-isolir"
  isolirAddressList: string; // e.g. "ISOLIR_USERS"
  autoSendWaNotice: boolean;
  autoRestoreOnPayment: boolean;
  lateFeeAmount: number; // Nominal denda (Rp)
}

export type TenantPlanId = 'starter' | 'basic' | 'standar' | 'pro' | 'enterprise';

export interface TenantPlanDetails {
  id: TenantPlanId;
  name: string;
  priceMonthly: number; // e.g. 50000, 100000, 150000, 250000, 500000
  maxPppoeUsers: number; // 250, 500, 750, 1000, 999999 (Unlimited)
  maxHotspotUsers: number; // 1000, 3000, 5000, 10000, 999999 (Unlimited)
  maxActiveHotspotSessions: number; // 200, 500, 700, 1000, 999999 (Unlimited)
  maxNas: number; // 1, 2, 3, 5, 999999 (Unlimited)
  freeVpnBillspot: number; // 1, 2, 3, 4, 5
  features: string[];
  recommendedFor: string;
  badgeColor: string;
  popular?: boolean;
}

export const SAAS_TENANT_PLANS: Record<TenantPlanId, TenantPlanDetails> = {
  starter: {
    id: 'starter',
    name: 'Paket Starter',
    priceMonthly: 50000,
    maxPppoeUsers: 250,
    maxHotspotUsers: 1000,
    maxActiveHotspotSessions: 200,
    maxNas: 1,
    freeVpnBillspot: 1,
    features: [
      '250 User PPP (PPPoE)',
      '1.000 User Hotspot (Voucher)',
      '200 Sesi Hotspot Aktif',
      '1 Router MikroTik (NAS)',
      'Gratis 1 VPN BILLSPOT',
      'Billing Otomatis & Invoice WhatsApp',
      'Integrasi Payment Gateway QRIS & VA',
      'Isolir Otomatis & Buka Isolir Realtime',
      '❌ FTTH, Peta GIS & TR-069 (Tersedia mulai Paket Basic)',
    ],
    recommendedFor: 'RT-RW Net Pemula & Perumahan Cluster',
    badgeColor: 'emerald',
  },
  basic: {
    id: 'basic',
    name: 'Paket Basic',
    priceMonthly: 100000,
    maxPppoeUsers: 500,
    maxHotspotUsers: 3000,
    maxActiveHotspotSessions: 500,
    maxNas: 2,
    freeVpnBillspot: 2,
    features: [
      '500 User PPP (PPPoE)',
      '3.000 User Hotspot (Voucher)',
      '500 Sesi Hotspot Aktif',
      '2 Router MikroTik (NAS)',
      'Gratis 2 VPN BILLSPOT',
      '✅ Termasuk FTTH OLT/ODP/ONU, Peta GIS FO, TR-069 GenieACS',
      'Payment Gateway Tripay / Midtrans / Duitku',
      'Backup Database Cloud Otomatis Harian',
      'Multi-User Staff (Admin, Kasir, Teknisi)',
    ],
    recommendedFor: 'ISP Desa & RT-RW Net Berkembang',
    badgeColor: 'blue',
  },
  standar: {
    id: 'standar',
    name: 'Paket Standar',
    priceMonthly: 150000,
    maxPppoeUsers: 750,
    maxHotspotUsers: 5000,
    maxActiveHotspotSessions: 700,
    maxNas: 3,
    freeVpnBillspot: 3,
    popular: true,
    features: [
      '750 User PPP (PPPoE)',
      '5.000 User Hotspot (Voucher)',
      '700 Sesi Hotspot Aktif',
      '3 Router MikroTik (NAS)',
      'Gratis 3 VPN BILLSPOT',
      '✅ Termasuk FTTH OLT/ODP/ONU, Peta GIS FO, TR-069 GenieACS',
      'Payment Gateway Tripay / Midtrans / Duitku',
      'Backup Database Cloud Otomatis Harian',
      'Multi-User Staff & Monitoring Trafik Realtime',
    ],
    recommendedFor: 'ISP Komunitas Menengah & Cakupan Beberapa RW',
    badgeColor: 'amber',
  },
  pro: {
    id: 'pro',
    name: 'Paket Pro Bisnis',
    priceMonthly: 250000,
    maxPppoeUsers: 1000,
    maxHotspotUsers: 10000,
    maxActiveHotspotSessions: 1000,
    maxNas: 5,
    freeVpnBillspot: 4,
    features: [
      '1.000 User PPP (PPPoE)',
      '10.000 User Hotspot (Voucher)',
      '1.000 Sesi Hotspot Aktif',
      '5 Router MikroTik (NAS)',
      'Gratis 4 VPN BILLSPOT',
      '✅ Termasuk FTTH OLT/ODP/ONU, Peta GIS FO, TR-069 GenieACS',
      'Multi-Staff Unlimited dengan Hak Akses Kustom',
      'Priority Support Tiket & WhatsApp SLA 24/7',
    ],
    recommendedFor: 'ISP Skala Kecamatan / Mitra Berkembang Pesat',
    badgeColor: 'purple',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Paket Enterprise',
    priceMonthly: 500000,
    maxPppoeUsers: 999999, // Unlimited
    maxHotspotUsers: 999999, // Unlimited
    maxActiveHotspotSessions: 999999, // Unlimited
    maxNas: 999999, // Unlimited
    freeVpnBillspot: 5,
    features: [
      'Unlimited User PPP (PPPoE)',
      'Unlimited User Hotspot (Voucher)',
      'Unlimited Sesi Hotspot Aktif',
      'Unlimited Router MikroTik (NAS)',
      'Gratis 5 VPN BILLSPOT',
      '✅ Termasuk FTTH OLT/ODP/ONU, Peta GIS FO, TR-069 GenieACS',
      'Dedicated Cloud Server & Custom API Webhook',
      'Dedicated Account Manager VIP',
    ],
    recommendedFor: 'ISP Mitra Skala Besar & Korporasi',
    badgeColor: 'pink',
  },
};

export interface Tenant {
  id: string; // e.g. 'tenant-masmedia', 'tenant-nusantara', 'tenant-garuda'
  name: string; // e.g. 'Masmedia Network (Pusat)'
  code?: string; // e.g. 'MM-01'
  slug?: string; // e.g. 'masmedia'
  subdomain: string; // e.g. 'masmedia'
  ownerName: string; // e.g. 'Masnawi'
  ownerEmail: string; // e.g. 'masnawi910@gmail.com'
  ownerPhone: string; // e.g. '0812-3456-7890'
  phone?: string; // e.g. '0812-3456-7890'
  streetAddress?: string;
  address?: string;
  province?: string;
  city: string;
  district?: string;
  village?: string;
  status: 'active' | 'suspended' | 'trial';
  tier?: TenantPlanId;
  plan: TenantPlanId | 'unselected';
  hasSelectedPlan?: boolean;
  priceMonthly?: number; // e.g. 50000, 100000, 250000, 500000
  maxPppoeUsers?: number; // e.g. 100, 250, 1000, 999999
  maxHotspotUsers?: number; // e.g. 1000, 5000, 15000, 999999
  maxActiveHotspotSessions?: number; // e.g. 200, 500, 2000, 999999
  maxCustomers: number;
  maxRouters?: number;
  maxNas: number;
  freeVpnBillspot?: number;
  expiryDate?: string; // YYYY-MM-DD
  billingCycleDay?: number; // tgl jatuh tempo sewa bulanan e.g. tgl 10
  subscriptionStatus?: 'active' | 'due' | 'grace_period' | 'suspended';
  lastSubscriptionPayment?: string;
  isEmailVerified?: boolean;
  activationCode?: string;
  activationToken?: string;
  activatedAt?: string;
  createdAt?: string;
  ispProfile?: ISPProfile;
  paymentChannels?: PaymentChannelConfig;
}

export interface AdminAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'operator' | 'teknisi' | 'kasir' | 'admin';
  tenantId?: string; // e.g. 'tenant-masmedia', 'tenant-nusantara', 'all'
  tenantName?: string;
  status: 'active' | 'inactive' | 'pending_activation';
  isEmailVerified?: boolean;
  activationCode?: string;
  activationToken?: string;
  activatedAt?: string;
  lastLogin: string;
  avatar?: string;
  permissions: string[];
  createdAt: string;
  streetAddress?: string;
  province?: string;
  city?: string;
  district?: string;
  village?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  isEnabled: boolean;
}

export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  type: 'activation' | 'invoice' | 'password_reset' | 'test';
  sentAt: string;
  status: 'sent' | 'simulated' | 'failed';
  activationCode?: string;
  contentHtml?: string;
  error?: string;
}

export interface ISPProfile {
  brandName: string;
  wifiName: string;
  logoUrl?: string;
  email: string;
  phone: string;
  address: string;
  footerNote: string;
  website?: string;
}

export interface FTTH_OLT {
  id: string;
  tenantId?: string;
  name: string;
  brand: string; // e.g. ZTE C320, Huawei MA5608T, HSGQ, VSOL
  ipAddress: string;
  ponPortsCount: number;
  activeOnuCount: number;
  uplinkSpeed: string;
  status: 'online' | 'offline' | 'warning';
  location: string;
  temperature: number;
}

export interface FTTH_ODP {
  id: string;
  tenantId?: string;
  name: string; // e.g. ODP-RTRW-01/08
  oltId: string;
  ponPort: string; // e.g. PON 1/1
  locationAddress: string;
  totalPorts: number;
  usedPorts: number;
  opticalRxDb: number; // e.g. -19.4 dBm
  coordinates: { lat: number; lng: number };
  status: 'good' | 'warning' | 'critical';
}

export interface FTTH_ONU {
  id: string;
  tenantId?: string;
  customerId?: string;
  customerName?: string;
  serialNumber: string; // e.g. ZTEGC1234567, HWTC890ABC
  macAddress: string;
  odpId: string;
  odpPort: number;
  onuType: string; // e.g. F609, F660, HG8245H5
  rxOpticalPower: number; // e.g. -21.5 dBm
  txOpticalPower: number; // e.g. 2.3 dBm
  distanceMeters: number;
  status: 'online' | 'offline' | 'dying_gasp' | 'los' | 'warning';
  lastOnline: string;
}

export interface GenieACSConfig {
  apiUrl: string; // e.g. http://acs.rtrw.net:7557
  apiKey: string;
  uiUrl: string; // e.g. http://acs.rtrw.net:3000
  nbiPort: number;
  syncIntervalSeconds: number;
  status: 'connected' | 'disconnected' | 'connecting';
  lastSyncTime: string;
  totalSyncedDevices: number;
}

export interface TR069Device {
  id: string;
  tenantId?: string;
  deviceId: string;
  manufacturer: string; // ZTE, Huawei, Fiberhome, Totolink
  modelName: string;
  serialNumber: string;
  softwareVersion: string;
  hardwareVersion: string;
  ipAddress: string;
  pppoeUsername?: string;
  wifiSsid: string;
  wifiPassword?: string;
  wifiEnabled: boolean;
  rxPowerDbm: number;
  temperature: number;
  uptimeSeconds: number;
  lastInform: string;
  status: 'online' | 'offline';
  associatedCustomerId?: string;
}

export interface HotspotVoucher {
  id: string;
  tenantId?: string;
  code: string; // Voucher code / Username
  password?: string;
  profileId: string;
  profileName: string;
  price: number;
  timeLimit: string; // e.g. 1 Hari / 5 Jam
  quotaLimitMB?: number;
  status: 'active' | 'used' | 'expired';
  usedBy?: string;
  usedAt?: string;
  expiredAt?: string;
  batchCode: string;
  createdAt: string;
}

export interface HotspotProfile {
  id: string;
  tenantId?: string;
  name: string;
  rateLimit: string; // e.g. 5M/2M
  price: number;
  sharedUsers: number;
  validity: string; // e.g. 1d, 12h, 30d
  keepaliveTimeout: string;
  addressPool: string;
  description: string;
}

export interface HotspotTemplate {
  id: string;
  tenantId?: string;
  name: string;
  size?: string; // e.g. 'A4 (21 Voucher / 3x7 Grid)', 'Thermal 58mm', 'Login Page'
  type?: 'voucher_print' | 'login_page';
  theme: 'cyberpunk' | 'modern_dark' | 'clean_light' | 'retro_rtrw' | 'emerald' | 'sapphire' | 'sunset' | 'dark' | 'clean' | string;
  headerTitle: string;
  greetingText: string;
  contactWa: string;
  wifiName: string;
  logoUrl?: string;
  termsText: string;
  customCss?: string;
  htmlContent?: string;
  bgType?: 'gradient' | 'solid' | 'pattern';
  colorStart?: string;
  colorEnd?: string;
  gradientAngle?: number;
  bgPattern?: 'wifi' | 'dots' | 'grid' | 'none' | string;
  cardBorder?: 'dashed' | 'solid' | 'double' | 'none' | string;
  borderColor?: string;
  cardRadius?: number;
  textColorTheme?: 'light' | 'dark';
  badge?: string;
  description?: string;
  category?: 'a4' | 'thermal' | 'custom' | string;
  createdAt?: string;
}

export interface VPNConfig {
  id: string;
  tenantId?: string;
  name: string;
  type: 'wireguard' | 'openvpn' | 'l2tp' | 'l2tp_ipsec' | 'sstp' | 'zerotier';
  serverAddress: string;
  port?: number;
  secretKey?: string;
  clientIp?: string;
  subnet?: string;
  username?: string;
  password?: string;
  remoteIp?: string;
  localIp?: string;
  status: 'connected' | 'disconnected' | 'error';
  uptime: string;
  rxBytes?: number;
  txBytes?: number;
  remoteWinboxPort?: number;
  remoteWebPort?: number;
  serverPublicKey?: string;
  clientPublicKey?: string;
  clientPrivateKey?: string;
  clientPhone?: string;
  notes?: string;
  createdAt?: string;
  expiresAt?: string;
}

export interface RadiusServerConfig {
  serverHost: string;
  authPort: number; // 1812
  acctPort: number; // 1813
  coaPort: number; // 3799
  sharedSecret: string;
  interimIntervalSeconds: number;
  dictionaryType: string;
  enableAccounting: boolean;
  status: 'running' | 'stopped';
}

export interface Expense {
  id: string;
  tenantId?: string;
  title: string;
  category: 'bandwidth_isp' | 'bandwidth_upstream' | 'tower_sewa' | 'listrik_ops' | 'listrik_bts' | 'gaji_teknisi' | 'gaji_karyawan' | 'perangkat_fo' | 'alat_kabel' | 'perizinan' | 'operasional_teknisi' | 'lainnya';
  amount: number;
  date: string; // YYYY-MM-DD
  recordedBy: string;
  notes?: string;
  receiptNumber?: string;
}

export type ExpenseRecord = Expense;

export interface BankRekening {
  id: string;
  tenantId?: string;
  bankCode: string; // BCA, MANDIRI, BRI, BNI, BSI, DANA, GOPAY, OVO, SHOPEEPAY
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isQris: boolean;
  isActive: boolean;
  description?: string;
}

export interface QRISConfig {
  merchantName: string;
  nmid: string;
  qrisString: string;
  qrImageUrl?: string;
  accountName: string;
  city: string;
  postalCode: string;
}

export interface PaymentGatewayConfig {
  provider: 'tripay' | 'midtrans' | 'xendit' | 'duitku';
  environment: 'sandbox' | 'production';
  merchantCode: string;
  apiKey: string;
  privateKey: string;
  callbackUrl: string;
  returnUrl: string;
  autoConfirmPayment: boolean;
  activePaymentChannels: string[];
}

export interface AutoMutationWebhookLog {
  id: string;
  timestamp: string;
  provider: 'moota' | 'cekmutasi' | 'hijrahpay' | 'android_forwarder' | 'midtrans' | 'tripay';
  bank: string;
  amount: number;
  matchedInvoiceId?: string;
  matchedCustomerName?: string;
  status: 'success' | 'ignored' | 'not_found';
  message: string;
  rawPayload?: string;
}

export interface AutoMutationConfig {
  enabled: boolean;
  provider: 'moota' | 'cekmutasi' | 'hijrahpay' | 'android_forwarder' | 'custom';
  apiToken?: string;
  webhookSecret: string;
  uniqueCodeEnabled: boolean;
  uniqueCodeRange: { min: number; max: number }; // default min: 101, max: 999
  excessHandling: 'isp_revenue' | 'customer_deposit';
  bankTarget: string; // 'BCA' | 'MANDIRI' | 'BRI' | 'ALL'
  autoSettle: boolean;
  webhookLogs?: AutoMutationWebhookLog[];
}

export interface PaymentChannelConfig {
  bcaAccount: { number: string; name: string };
  mandiriAccount: { number: string; name: string };
  briAccount: { number: string; name: string };
  qrisPayload: string;
  qrisStaticString?: string;
  merchantName: string;
  waGatewayNumber: string;
  waApiKey?: string;
  midtransServerKey?: string;
  qrisConfig?: {
    merchantName?: string;
    nmid?: string;
  };
  autoMutationConfig?: AutoMutationConfig;
}

export interface SystemStats {
  totalCustomers: number;
  activeCustomers: number;
  dueSoonCustomers: number;
  overdueCustomers: number;
  isolatedCustomers: number;
  totalMonthlyRevenue: number;
  todayRevenue: number;
  unpaidInvoicesCount: number;
  unpaidInvoicesAmount: number;
  activeSessionsCount: number;
  totalThroughputMbps: number;
  totalExpensesMonth: number;
  netProfitMonth: number;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'pending_part' | 'resolved' | 'closed';
export type TicketCategory =
  | 'no_internet'
  | 'slow_speed'
  | 'los_red'
  | 'wifi_issue'
  | 'relocation'
  | 'billing_dispute'
  | 'new_install'
  | 'other';

export interface TicketLog {
  id: string;
  timestamp: string;
  author: string;
  message: string;
  statusChange?: TicketStatus;
}

export interface SupportTicket {
  id: string; // TIKET-202608-001
  tenantId?: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  rtRw?: string;
  odpName?: string;
  onuSerial?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  reportedVia: 'portal_pelanggan' | 'whatsapp' | 'telepon' | 'admin';
  resolutionNotes?: string;
  evidenceImages?: string[]; // Base64 data URLs for technician repair proof
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  logs: TicketLog[];
}

export type ActivityCategory = 'auth' | 'customer' | 'billing' | 'mikrotik' | 'ticket' | 'ftth' | 'system' | 'voucher' | 'queue';

// ==========================================
// Poin 5: Offline Command Queue & Router Spooler
// ==========================================
export type CommandQueueAction =
  | 'isolate_customer'
  | 'restore_customer'
  | 'change_profile'
  | 'disconnect_session'
  | 'add_secret'
  | 'remove_secret'
  | 'add_voucher'
  | 'update_rate_limit'
  | 'custom_script';

export type CommandQueueStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';

export interface RouterCommandQueueItem {
  id: string;
  tenantId?: string;
  nasId: string;
  nasName: string;
  action: CommandQueueAction;
  title: string;
  description: string;
  commandSnippet: string;
  targetUsername?: string;
  customerId?: string;
  payload?: any;
  status: CommandQueueStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttemptAt?: string;
  completedAt?: string;
  errorMessage?: string;
  executionLogs: string[];
}

// ==========================================
// Poin 6: Financial P&L & Churn Rate Analysis
// ==========================================
export interface MonthlyFinancialSummary {
  month: string; // e.g. "Jan 2026", "Feb 2026"
  monthIndex: number; // 1 - 12
  year: number;
  pppoeRevenue: number;
  hotspotRevenue: number;
  installationFeeRevenue: number;
  totalGrossRevenue: number;
  bandwidthExpense: number;
  infrastructureExpense: number;
  salaryExpense: number;
  otherExpense: number;
  totalExpense: number;
  grossProfit: number;
  netProfit: number;
  profitMarginPct: number;
  activeCustomerCount: number;
  newCustomerCount: number;
  churnedCustomerCount: number;
  churnRatePct: number;
  retentionRatePct: number;
  arpu: number; // Average Revenue Per User
}

export interface ChurnReasonStat {
  reason: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CustomerChurnRiskItem {
  customer: Customer;
  riskScore: 'low' | 'medium' | 'high';
  riskReason: string;
  daysOverdue: number;
  unpaidInvoicesCount: number;
  suggestedAction: string;
}

export interface ActivityLog {
  id: string;
  tenantId?: string;
  timestamp: string; // ISO String
  userName: string;
  userRole: string;
  category: ActivityCategory;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface GISMapMarker {
  id: string;
  tenantId?: string;
  type: 'olt' | 'odp' | 'customer' | 'server';
  name: string;
  lat: number;
  lng: number;
  status?: string;
  details?: Record<string, any>;
  parentId?: string; // e.g. customer connects to ODP, ODP connects to OLT
}

export interface GISFiberCable {
  id: string;
  tenantId?: string;
  name: string;
  type: 'backbone' | 'distribution' | 'dropcore';
  coreCount: number;
  fromId: string;
  toId: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  lengthMeters: number;
  status: 'normal' | 'attenuation_high' | 'cut_off';
}

export interface WifiRegistration {
  id: string; // e.g. REG-20260907-8921
  createdAt: string;
  // Data Calon Pelanggan
  fullName: string;
  nik: string; // 16 digit KTP
  phone: string; // WhatsApp utama
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  email: string;
  occupation: string;

  // Lokasi Pemasangan
  address: string;
  rtRw: string;
  village: string; // Kelurahan / Desa
  district: string; // Kecamatan
  city: string; // Kota / Kabupaten
  postalCode: string;
  landmark: string; // Patokan lokasi
  latitude?: string;
  longitude?: string;
  housingStatus: 'owned' | 'rented' | 'office' | 'other';

  // Layanan & Paket
  packageId: string;
  packageName: string;
  packageSpeed: string;
  packagePrice: number;
  installationFee: number;
  preferredDate: string;
  preferredTimeSlot: 'pagi' | 'siang' | 'sore';
  additionalServices: string[]; // e.g. ["Mesh WiFi Extender", "STB Android TV"]

  // Dokumen & Persetujuan
  ktpPhotoPreview?: string;
  housePhotoPreview?: string;
  agreedToTerms: boolean;
  notes?: string;
  status: 'pending' | 'surveyed' | 'approved' | 'installed' | 'cancelled';
}

