import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Customer,
  InternetPackage,
  Invoice,
  MikroTikNAS,
  ActiveSession,
  WhatsAppTemplate,
  IsolirRuleConfig,
  PaymentChannelConfig,
  SystemStats,
  PaymentMethod,
  AdminAccount,
  FTTH_OLT,
  FTTH_ODP,
  FTTH_ONU,
  GenieACSConfig,
  TR069Device,
  HotspotVoucher,
  HotspotProfile,
  HotspotTemplate,
  VPNConfig,
  RadiusServerConfig,
  Expense,
  BankRekening,
  QRISConfig,
  PaymentGatewayConfig,
  SupportTicket,
  TicketStatus,
  GISFiberCable,
  ISPProfile,
  Tenant,
  TenantPlanId,
  SAAS_TENANT_PLANS,
  ActivityLog,
  ActivityCategory,
  RouterCommandQueueItem,
  CommandQueueAction,
  AutoMutationWebhookLog,
} from '../types';
import {
  initialCustomers,
  initialPackages,
  initialInvoices,
  initialNAS,
  initialActiveSessions,
  initialWhatsAppTemplates,
  initialIsolirConfig,
  initialPaymentChannels,
  initialAccounts,
  initialFTTH_OLT,
  initialFTTH_ODP,
  initialFTTH_ONU,
  initialGenieACSConfig,
  initialTR069Devices,
  initialHotspotProfiles,
  initialHotspotVouchers,
  initialHotspotTemplates,
  initialVPNConfigs,
  initialRadiusServerConfig,
  initialExpenses,
  initialBankRekening,
  initialQRISConfig,
  initialPaymentGatewayConfig,
  initialTickets,
  initialFiberCables,
  initialISPProfile,
  initialTenants,
  initialActivityLogs,
  initialCommandQueue,
} from '../mockData';
import { generateInvoiceNumber, getWhatsAppLink, replaceWhatsAppPlaceholders, formatRupiah } from '../utils/formatters';
import { saveToIndexedDB, syncToCloudFirestore, loadFromCloudFirestore, testConnection, DatabaseBackupPayload } from '../services/databaseService';

interface AppContextType {
  // Multi-Tenant / SaaS Branches
  tenants: Tenant[];
  currentTenantId: string;
  currentTenant: Tenant;
  switchTenant: (tenantId: string) => void;
  addTenant: (
    tenantData: Omit<Tenant, 'id' | 'createdAt'>,
    adminUser?: { name: string; email: string; password?: string; phone: string }
  ) => Tenant;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => void;
  upgradeTenantPlan: (
    tenantId: string,
    planId: TenantPlanId,
    paymentMethod?: string
  ) => { success: boolean; message: string };
  deleteTenant: (tenantId: string) => void;
  allCustomers: Customer[];
  allInvoices: Invoice[];
  allNasList: MikroTikNAS[];

  customers: Customer[];
  packages: InternetPackage[];
  invoices: Invoice[];
  nasList: MikroTikNAS[];
  activeSessions: ActiveSession[];
  templates: WhatsAppTemplate[];
  isolirConfig: IsolirRuleConfig;
  paymentChannels: PaymentChannelConfig;
  stats: SystemStats;

  // Theme Moda Siang / Malam
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  // Navigation
  activeCategory: string; // 'dashboard' | 'radius' | 'billing' | 'payment' | 'laporan'
  activeSubMenu: string;  // e.g. 'account', 'ftth', 'tr069', 'ppp-dhcp', 'hotspot', etc.
  activeSubTab: string;   // e.g. 'user', 'session', 'profile', 'setting', etc.
  setActiveSubTab: (subTab: string) => void;
  setNavigation: (category: string, subMenu?: string, subTab?: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  
  // Accounts & Authentication
  currentUser: AdminAccount | null;
  login: (username: string, password?: string) => { success: boolean; message?: string };
  activateAccount: (identifier: string, code?: string) => { success: boolean; message: string };
  resendActivationCode: (identifier: string) => { success: boolean; message: string; code?: string };
  loginAsRole: (role: 'superadmin' | 'admin' | 'teknisi' | 'kasir' | 'operator') => void;
  logout: () => void;
  accounts: AdminAccount[];
  addAccount: (acc: Omit<AdminAccount, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<AdminAccount>) => void;
  deleteAccount: (id: string) => void;

  // FTTH
  ftthOLTs: FTTH_OLT[];
  ftthODPs: FTTH_ODP[];
  ftthONUs: FTTH_ONU[];
  addOLT: (olt: Omit<FTTH_OLT, 'id'>) => void;
  updateOLT: (id: string, updates: Partial<FTTH_OLT>) => void;
  deleteOLT: (id: string) => void;
  addODP: (odp: Omit<FTTH_ODP, 'id'>) => void;
  updateODP: (id: string, updates: Partial<FTTH_ODP>) => void;
  deleteODP: (id: string) => void;
  addONU: (onu: Omit<FTTH_ONU, 'id'>) => void;
  updateONU: (id: string, updates: Partial<FTTH_ONU>) => void;
  deleteONU: (id: string) => void;

  // TR-069 & GenieACS
  genieACSConfig: GenieACSConfig;
  updateGenieACSConfig: (updates: Partial<GenieACSConfig>) => void;
  testGenieACSConnection: () => Promise<boolean>;
  tr069Devices: TR069Device[];
  rebootTR069Device: (id: string) => void;
  updateTR069WiFi: (id: string, ssid: string, password?: string) => void;

  // Hotspot
  hotspotProfiles: HotspotProfile[];
  hotspotVouchers: HotspotVoucher[];
  hotspotTemplates: HotspotTemplate[];
  addHotspotProfile: (prof: Omit<HotspotProfile, 'id'>) => void;
  updateHotspotProfile: (id: string, updates: Partial<HotspotProfile>) => void;
  deleteHotspotProfile: (id: string) => void;
  generateVoucherBatch: (
    profileId: string,
    count: number,
    price?: number,
    prefix?: string,
    charType?: 'num' | 'alphanumeric' | 'uppercase' | 'lowercase' | 'uppercase_only',
    codeLength?: number,
    loginMode?: 'same' | 'distinct',
    customValidity?: string
  ) => HotspotVoucher[];
  deleteVoucher: (id: string) => void;
  markVoucherUsed: (id: string, username: string) => void;
  addHotspotTemplate: (tpl: Omit<HotspotTemplate, 'id'>) => HotspotTemplate;
  updateHotspotTemplate: (id: string, updates: Partial<HotspotTemplate>) => void;
  deleteHotspotTemplate: (id: string) => void;

  // VPN & Radius Settings
  vpnConfigs: VPNConfig[];
  addVPN: (vpn: Omit<VPNConfig, 'id' | 'uptime' | 'rxBytes' | 'txBytes'>) => void;
  toggleVPN: (id: string) => void;
  deleteVPN: (id: string) => void;
  radiusServerConfig: RadiusServerConfig;
  updateRadiusServerConfig: (updates: Partial<RadiusServerConfig>) => void;
  radiusServer: {
    ip: string;
    hostname: string;
    secret: string;
    authPort: number;
    acctPort: number;
    wireguardPort: number;
    sstpPort: number;
    apiPort: number;
    location: string;
  };
  setRadiusServer: React.Dispatch<React.SetStateAction<{
    ip: string;
    hostname: string;
    secret: string;
    authPort: number;
    acctPort: number;
    wireguardPort: number;
    sstpPort: number;
    apiPort: number;
    location: string;
  }>>;

  // Expenses & Finance
  expenses: Expense[];
  addExpense: (exp: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Bank Accounts & QRIS & Gateway
  bankAccounts: BankRekening[];
  addBankAccount: (acc: Omit<BankRekening, 'id'>) => void;
  updateBankAccount: (id: string, updates: Partial<BankRekening>) => void;
  deleteBankAccount: (id: string) => void;
  toggleBankAccount: (id: string) => void;
  qrisConfig: QRISConfig;
  updateQRISConfig: (updates: Partial<QRISConfig>) => void;
  paymentGatewayConfig: PaymentGatewayConfig;
  updatePaymentGatewayConfig: (updates: Partial<PaymentGatewayConfig>) => void;

  // Helpdesk & Support Tickets
  tickets: SupportTicket[];
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'logs'>) => SupportTicket;
  updateTicket: (id: string, updates: Partial<SupportTicket>) => void;
  deleteTicket: (id: string) => void;
  addTicketLog: (ticketId: string, author: string, message: string, statusChange?: TicketStatus) => void;

  // GIS & FTTH Mapping
  fiberCables: GISFiberCable[];
  addFiberCable: (cable: Omit<GISFiberCable, 'id'>) => void;
  updateFiberCable: (id: string, updates: Partial<GISFiberCable>) => void;
  deleteFiberCable: (id: string) => void;

  // Customer Actions
  addCustomer: (data: Partial<Customer>) => Customer;
  bulkImportCustomers: (newCusts: Customer[]) => number;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  isolateCustomer: (id: string) => void;
  unIsolateCustomer: (id: string) => void;
  
  // Package Actions
  addPackage: (pkg: Omit<InternetPackage, 'id'>) => void;
  updatePackage: (id: string, updates: Partial<InternetPackage>) => void;
  deletePackage: (id: string) => void;
  
  // MikroTik & Sessions Actions
  addNAS: (nas: Omit<MikroTikNAS, 'id' | 'lastPing'>) => void;
  updateNAS: (id: string, updates: Partial<MikroTikNAS>) => void;
  deleteNAS: (id: string) => void;
  disconnectSession: (sessionId: string) => void;
  disconnectCustomerSession: (identifier: string) => void;
  connectCustomerSession: (identifier: string) => boolean;
  pingRouter: (nasId: string) => void;
  
  // Billing Actions
  generateMonthlyInvoices: (month: number, year: number) => number;
  payInvoice: (invoiceId: string, method: PaymentMethod, transactionRef?: string, receivedBy?: string) => void;
  deleteInvoice: (id: string) => void;
  createManualInvoice: (data: Partial<Invoice>) => Invoice;
  
  // Isolir Automation
  runAutoIsolirScan: () => { isolatedCount: number; checkedCount: number };
  updateIsolirConfig: (updates: Partial<IsolirRuleConfig>) => void;
  
  // WhatsApp Gateway
  updateTemplate: (id: string, newContent: string) => void;
  sendWhatsAppMessage: (phone: string, text: string) => void;
  getFormattedMessage: (customerId: string, templateCode: string, invoiceId?: string) => string;
  
  // Config & Database
  ispProfile: ISPProfile;
  updateISPProfile: (updates: Partial<ISPProfile>) => void;
  updatePaymentChannels: (updates: Partial<PaymentChannelConfig>) => void;
  processIncomingAutoMutation: (payload: {
    provider: 'moota' | 'cekmutasi' | 'hijrahpay' | 'android_forwarder' | 'midtrans' | 'tripay';
    bank: string;
    amount: number;
    description?: string;
    txId?: string;
  }) => { success: boolean; message: string; invoiceId?: string; customerName?: string };
  resetAllData: () => void;
  importFullDatabase: (payload: DatabaseBackupPayload) => number;

  // Staff Activity Logs (Audit Trail)
  activityLogs: ActivityLog[];
  logActivity: (category: ActivityCategory, action: string, details: string) => void;
  clearActivityLogs: () => void;

  // Poin 5: MikroTik Offline Command Retry Queue & Spooler
  commandQueue: RouterCommandQueueItem[];
  allCommandQueue: RouterCommandQueueItem[];
  enqueueCommand: (item: Omit<RouterCommandQueueItem, 'id' | 'createdAt' | 'status' | 'retryCount' | 'executionLogs' | 'maxRetries'> & { maxRetries?: number }) => RouterCommandQueueItem;
  processQueue: (nasId?: string) => Promise<{ executed: number; succeeded: number; failed: number }>;
  retryCommand: (commandId: string) => Promise<{ success: boolean; message: string }>;
  cancelCommand: (commandId: string) => void;
  clearCompletedCommands: () => void;
  toggleRouterStatus: (nasId: string, status?: 'online' | 'offline') => void;

  // Firebase Cloud Database Persistence
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  lastCloudSync: string | null;
  isCloudReady: boolean;
  syncNowToCloud: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: 'netradius_customers_v2',
  PACKAGES: 'netradius_packages_v2',
  INVOICES: 'netradius_invoices_v2',
  NAS: 'netradius_nas_v2',
  SESSIONS: 'netradius_sessions_v2',
  TEMPLATES: 'netradius_templates_v2',
  ISOLIR: 'netradius_isolir_config_v2',
  PAYMENT: 'netradius_payment_channels_v2',
  ACCOUNTS: 'netradius_accounts_v2',
  FTTH_OLT: 'netradius_ftth_olt_v2',
  FTTH_ODP: 'netradius_ftth_odp_v2',
  FTTH_ONU: 'netradius_ftth_onu_v2',
  GENIEACS_CONFIG: 'netradius_genieacs_v2',
  TR069_DEVICES: 'netradius_tr069_devices_v2',
  HOTSPOT_PROFILES: 'netradius_hotspot_profiles_v2',
  HOTSPOT_VOUCHERS: 'netradius_hotspot_vouchers_v2',
  HOTSPOT_TEMPLATES: 'netradius_hotspot_templates_v2',
  VPN_CONFIGS: 'netradius_vpn_configs_v2',
  RADIUS_CONFIG: 'netradius_radius_config_v2',
  EXPENSES: 'netradius_expenses_v2',
  BANK_ACCOUNTS: 'netradius_bank_accounts_v2',
  QRIS_CONFIG: 'netradius_qris_config_v2',
  GATEWAY_CONFIG: 'netradius_gateway_config_v2',
  TICKETS: 'netradius_tickets_v2',
  FIBER_CABLES: 'netradius_fiber_cables_v2',
  THEME: 'netradius_theme_v2',
  CURRENT_USER: 'netradius_current_user_v2',
  ISP_PROFILE: 'netradius_isp_profile_v2',
  TENANTS: 'netradius_tenants_v2',
  CURRENT_TENANT: 'netradius_current_tenant_v2',
  ACTIVITY_LOGS: 'netradius_activity_logs_v2',
  COMMAND_QUEUE: 'netradius_command_queue_v2',
  VPS_RADIUS_SERVER: 'netradius_vps_radius_server_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme Moda Siang / Malam
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Multi-Tenant / Cabang ISP State
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
    return saved ? JSON.parse(saved) : initialTenants;
  });

  const [selectedTenantId, setSelectedTenantId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TENANT);
    return saved || 'tenant-masmedia';
  });

  // Base persistent state
  const [allCustomers, setAllCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => c.username !== 'ahmad.fauzi' && c.username !== 'siti.rahma');
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialCustomers;
  });

  const [packages, setPackages] = useState<InternetPackage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (!saved) return initialPackages;
    try {
      const parsed: InternetPackage[] = JSON.parse(saved);
      return parsed.map(p => ({
        ...p,
        isActive: p.isActive !== false,
        category: p.category || 'pppoe',
        rateLimit: p.rateLimit || `${p.uploadSpeed || 2}M/${p.downloadSpeed || 5}M`,
      }));
    } catch {
      return initialPackages;
    }
  });

  const [allInvoices, setAllInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(inv => inv.id !== 'INV-202608-0001');
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialInvoices;
  });

  const [allNasList, setAllNasList] = useState<MikroTikNAS[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NAS);
    return saved ? JSON.parse(saved) : initialNAS;
  });

  const [allActiveSessions, setAllActiveSessions] = useState<ActiveSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(s => s.username !== 'ahmad.fauzi' && s.username !== 'siti.rahma');
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialActiveSessions;
  });

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return saved ? JSON.parse(saved) : initialWhatsAppTemplates;
  });

  const [isolirConfig, setIsolirConfig] = useState<IsolirRuleConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ISOLIR);
    return saved ? JSON.parse(saved) : initialIsolirConfig;
  });

  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.autoMutationConfig?.webhookLogs) {
          parsed.autoMutationConfig.webhookLogs = parsed.autoMutationConfig.webhookLogs.filter(
            (log: any) => !log.id?.startsWith('LOG-MUT-0')
          );
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialPaymentChannels;
  });

  // Accounts state & Active Authentication Session
  const [accounts, setAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge any initialAccounts that are missing by username or email
          const existingMap = new Map<string, AdminAccount>();
          parsed.forEach((a: AdminAccount) => {
            if (a.email) existingMap.set(a.email.toLowerCase(), a);
            if (a.username) existingMap.set(a.username.toLowerCase(), a);
          });

          const missingInitial = initialAccounts.filter(
            ia => !existingMap.has((ia.email || '').toLowerCase()) && !existingMap.has((ia.username || '').toLowerCase())
          );

          return [...parsed, ...missingInitial];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialAccounts;
  });

  const [currentUser, setCurrentUser] = useState<AdminAccount | null>(() => {
    // Pengguna harus selalu login setiap membuka aplikasi
    return null;
  });

  // Multi-Tenant effective ID and active tenant entity
  const currentTenantId = useMemo(() => {
    if (currentUser && currentUser.role !== 'superadmin' && currentUser.tenantId) {
      return currentUser.tenantId;
    }
    return selectedTenantId;
  }, [currentUser, selectedTenantId]);

  const currentTenant: Tenant = useMemo(() => {
    const found = tenants.find(t => t.id === currentTenantId);
    if (found) return found;
    return tenants[0] || initialTenants[0];
  }, [tenants, currentTenantId]);

  const switchTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, tenantId);
  };

  const addTenant = (
    tenantData: Omit<Tenant, 'id' | 'createdAt'>,
    adminUser?: {
      name: string;
      email: string;
      username?: string;
      password?: string;
      phone: string;
      streetAddress?: string;
      province?: string;
      city?: string;
      district?: string;
      village?: string;
    }
  ): Tenant => {
    const newId = `tenant-${Date.now()}`;
    const hasSelectedPlan = tenantData.hasSelectedPlan ?? false;
    const planKey = hasSelectedPlan ? ((tenantData.plan as TenantPlanId) || 'starter') : 'unselected';
    const planSpec = planKey !== 'unselected' ? (SAAS_TENANT_PLANS[planKey] || SAAS_TENANT_PLANS.starter) : {
      priceMonthly: 0,
      maxPppoeUsers: 0,
      maxHotspotUsers: 0,
      maxActiveHotspotSessions: 0,
      maxNas: 0,
    };

    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
      hasSelectedPlan,
      plan: planKey,
      tier: hasSelectedPlan ? (planKey as TenantPlanId) : undefined,
      priceMonthly: tenantData.priceMonthly ?? planSpec.priceMonthly,
      maxPppoeUsers: tenantData.maxPppoeUsers ?? planSpec.maxPppoeUsers,
      maxHotspotUsers: tenantData.maxHotspotUsers ?? planSpec.maxHotspotUsers,
      maxActiveHotspotSessions: tenantData.maxActiveHotspotSessions ?? planSpec.maxActiveHotspotSessions,
      maxCustomers: tenantData.maxCustomers ?? planSpec.maxPppoeUsers,
      maxNas: tenantData.maxNas ?? planSpec.maxNas,
      billingCycleDay: tenantData.billingCycleDay || 10,
      subscriptionStatus: hasSelectedPlan ? 'active' : 'due',
      lastSubscriptionPayment: hasSelectedPlan ? new Date().toISOString().slice(0, 10) : undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setTenants(prev => [...prev, newTenant]);

    // Create an admin account for this tenant if provided
    if (adminUser) {
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newAcc: AdminAccount = {
        id: `ACC-${Date.now()}`,
        username: adminUser.username?.trim() || adminUser.email.trim(),
        password: adminUser.password || 'admin123',
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone || newTenant.phone || '',
        streetAddress: adminUser.streetAddress || newTenant.streetAddress || newTenant.address,
        province: adminUser.province || newTenant.province,
        city: adminUser.city || newTenant.city,
        district: adminUser.district || newTenant.district,
        village: adminUser.village || newTenant.village,
        role: 'admin',
        tenantId: newId,
        tenantName: newTenant.name,
        status: 'active',
        isEmailVerified: false,
        activationCode: generatedCode,
        lastLogin: 'Belum pernah',
        permissions: ['billing', 'radius', 'ftth', 'reports', 'settings'],
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setAccounts(prev => [...prev, newAcc]);
    }

    // Add default core router for the tenant
    const newNas: MikroTikNAS = {
      id: `NAS-${Date.now().toString().slice(-4)}`,
      tenantId: newId,
      name: `Core-Router-${newTenant.code || newTenant.slug || '01'}`,
      ipAddress: '192.168.88.1',
      apiPort: 8728,
      radiusSecret: `${newTenant.slug}_secret_${new Date().getFullYear()}`,
      username: 'admin',
      model: 'MikroTik RB4011',
      rosVersion: 'RouterOS v7.15',
      cpuLoad: 10,
      freeMemoryMB: 850,
      totalMemoryMB: 1024,
      uptime: '1d 00:00:00',
      status: 'online',
      activePppoeCount: 0,
      activeHotspotCount: 0,
      lastPing: 'Baru saja',
    };
    setAllNasList(prev => [...prev, newNas]);

    return newTenant;
  };

  const updateTenant = (tenantId: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => (t.id === tenantId ? { ...t, ...updates } : t)));
  };

  const upgradeTenantPlan = (
    tenantId: string,
    planId: TenantPlanId,
    paymentMethod: string = 'qris'
  ): { success: boolean; message: string } => {
    const planSpec = SAAS_TENANT_PLANS[planId];
    if (!planSpec) {
      return { success: false, message: 'Paket yang dipilih tidak valid.' };
    }

    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 30);
    const expiryStr = expiry.toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    setTenants(prev =>
      prev.map(t => {
        if (t.id === tenantId) {
          return {
            ...t,
            hasSelectedPlan: true,
            plan: planId,
            tier: planId,
            priceMonthly: planSpec.priceMonthly,
            maxPppoeUsers: planSpec.maxPppoeUsers,
            maxHotspotUsers: planSpec.maxHotspotUsers,
            maxActiveHotspotSessions: planSpec.maxActiveHotspotSessions,
            maxCustomers: planSpec.maxPppoeUsers,
            maxNas: planSpec.maxNas,
            subscriptionStatus: 'active',
            lastSubscriptionPayment: todayStr,
            expiryDate: expiryStr,
          };
        }
        return t;
      })
    );

    return {
      success: true,
      message: `Paket sewa cabang berhasil diperbarui ke "${planSpec.name}" (Rp ${planSpec.priceMonthly.toLocaleString('id-ID')}/bulan) via ${paymentMethod.toUpperCase()}. Kuota pelanggan PPP (${planSpec.maxPppoeUsers >= 999999 ? 'Unlimited' : planSpec.maxPppoeUsers} user) dan Hotspot (${planSpec.maxHotspotUsers >= 999999 ? 'Unlimited' : planSpec.maxHotspotUsers} user) telah aktif!`,
    };
  };

  const deleteTenant = (tenantId: string) => {
    if (tenantId === 'tenant-masmedia') return; // Protect primary tenant
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    setAllCustomers(prev => prev.filter(c => c.tenantId !== tenantId));
    setAllInvoices(prev => prev.filter(i => i.tenantId !== tenantId));
    setAllNasList(prev => prev.filter(n => n.tenantId !== tenantId));
    setAllActiveSessions(prev => prev.filter(s => s.tenantId !== tenantId));
    setAllFtthOLTs(prev => prev.filter(o => o.tenantId !== tenantId));
    setAllFtthODPs(prev => prev.filter(o => o.tenantId !== tenantId));
    setAllFtthONUs(prev => prev.filter(o => o.tenantId !== tenantId));
    setAllTr069Devices(prev => prev.filter(d => d.tenantId !== tenantId));
    setAllHotspotVouchers(prev => prev.filter(v => v.tenantId !== tenantId));
    setAllVpnConfigs(prev => prev.filter(v => v.tenantId !== tenantId));
    setAllExpenses(prev => prev.filter(e => e.tenantId !== tenantId));
    setAllBankAccounts(prev => prev.filter(b => b.tenantId !== tenantId));
    setAllTickets(prev => prev.filter(t => t.tenantId !== tenantId));
    setAllFiberCables(prev => prev.filter(c => c.tenantId !== tenantId));
    setAllActivityLogs(prev => prev.filter(l => l.tenantId !== tenantId));
    setAccounts(prev => prev.filter(a => a.tenantId !== tenantId));
    if (selectedTenantId === tenantId) {
      setSelectedTenantId('tenant-masmedia');
    }
  };

  const isPrimary = currentTenantId === 'tenant-masmedia';

  // Scoped views for current active tenant
  const customers = useMemo(() => {
    return allCustomers.filter(c => (c.tenantId ? c.tenantId === currentTenantId : isPrimary));
  }, [allCustomers, currentTenantId, isPrimary]);

  const invoices = useMemo(() => {
    const isUniqueCodeEnabled = paymentChannels.autoMutationConfig?.uniqueCodeEnabled ?? true;
    return allInvoices
      .filter(i => (i.tenantId ? i.tenantId === currentTenantId : isPrimary))
      .map(inv => {
        let hash = 0;
        for (let idx = 0; idx < inv.id.length; idx++) {
          hash = (hash * 31 + inv.id.charCodeAt(idx)) & 0xffffffff;
        }
        const code = inv.uniqueCode || (101 + (Math.abs(hash) % 890));
        const amountWithCode = isUniqueCodeEnabled ? inv.totalAmount + code : inv.totalAmount;
        return {
          ...inv,
          uniqueCode: code,
          amountWithCode,
        };
      });
  }, [allInvoices, currentTenantId, isPrimary, paymentChannels.autoMutationConfig?.uniqueCodeEnabled]);

  const nasList = useMemo(() => {
    return allNasList.filter(n => (n.tenantId ? n.tenantId === currentTenantId : isPrimary));
  }, [allNasList, currentTenantId, isPrimary]);

  const activeSessions = useMemo(() => {
    // SYARAT MUTLAK: Harus ada router MikroTik NAS yang BENAR-BENAR TERHUBUNG dan BERSTATUS ONLINE
    // Jika tidak ada router atau semua router offline/belum terhubung, maka 100% TIDAK ADA SESI ONLINE (0 dial-in)
    const onlineNasList = allNasList.filter(n => n.status === 'online');
    if (onlineNasList.length === 0) {
      return [];
    }

    const onlineNasIdSet = new Set(onlineNasList.map(n => n.id));
    const tenantNasIds = new Set(nasList.filter(n => n.status === 'online').map(n => n.id));
    const tenantUsernames = new Set(customers.map(c => (c.username || '').toLowerCase().trim()).filter(Boolean));

    return allActiveSessions.filter(s => {
      // 1. Username harus valid dan tidak kosong
      if (!s.username || !s.username.trim()) return false;
      const lowerUsername = s.username.toLowerCase().trim();

      // 2. User harus terdaftar pada pelanggan tenant saat ini
      if (!tenantUsernames.has(lowerUsername)) return false;

      // 3. Router NAS dari sesi ini harus terdaftar dan berstatus ONLINE
      const cust = customers.find(c => (c.username || '').toLowerCase().trim() === lowerUsername);
      const targetNasId = s.nasId || cust?.nasId;
      if (!targetNasId || !onlineNasIdSet.has(targetNasId)) {
        return false;
      }

      // 4. Validasi tenant
      let belongs = false;
      if (s.tenantId) belongs = s.tenantId === currentTenantId;
      else if (s.nasId && tenantNasIds.has(s.nasId)) belongs = true;
      else belongs = isPrimary;

      return belongs;
    });
  }, [allActiveSessions, nasList, customers, currentTenantId, isPrimary, allNasList]);

  const [allFtthOLTs, setAllFtthOLTs] = useState<FTTH_OLT[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FTTH_OLT);
    return saved ? JSON.parse(saved) : initialFTTH_OLT;
  });
  const ftthOLTs = useMemo(() => {
    return allFtthOLTs.filter(o => (o.tenantId ? o.tenantId === currentTenantId : isPrimary));
  }, [allFtthOLTs, currentTenantId, isPrimary]);

  const [allFtthODPs, setAllFtthODPs] = useState<FTTH_ODP[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FTTH_ODP);
    return saved ? JSON.parse(saved) : initialFTTH_ODP;
  });
  const ftthODPs = useMemo(() => {
    return allFtthODPs.filter(o => (o.tenantId ? o.tenantId === currentTenantId : isPrimary));
  }, [allFtthODPs, currentTenantId, isPrimary]);

  const [allFtthONUs, setAllFtthONUs] = useState<FTTH_ONU[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FTTH_ONU);
    return saved ? JSON.parse(saved) : initialFTTH_ONU;
  });
  const ftthONUs = useMemo(() => {
    return allFtthONUs.filter(o => (o.tenantId ? o.tenantId === currentTenantId : isPrimary));
  }, [allFtthONUs, currentTenantId, isPrimary]);

  const [genieACSConfig, setGenieACSConfig] = useState<GenieACSConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GENIEACS_CONFIG);
    return saved ? JSON.parse(saved) : initialGenieACSConfig;
  });

  const [allTr069Devices, setAllTr069Devices] = useState<TR069Device[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TR069_DEVICES);
    return saved ? JSON.parse(saved) : initialTR069Devices;
  });
  const tr069Devices = useMemo(() => {
    return allTr069Devices.filter(d => (d.tenantId ? d.tenantId === currentTenantId : isPrimary));
  }, [allTr069Devices, currentTenantId, isPrimary]);

  const [hotspotProfiles, setHotspotProfiles] = useState<HotspotProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOTSPOT_PROFILES);
    return saved ? JSON.parse(saved) : initialHotspotProfiles;
  });

  const [allHotspotVouchers, setAllHotspotVouchers] = useState<HotspotVoucher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOTSPOT_VOUCHERS);
    return saved ? JSON.parse(saved) : initialHotspotVouchers;
  });
  const hotspotVouchers = useMemo(() => {
    return allHotspotVouchers.filter(v => (v.tenantId ? v.tenantId === currentTenantId : isPrimary));
  }, [allHotspotVouchers, currentTenantId, isPrimary]);

  const [hotspotTemplates, setHotspotTemplates] = useState<HotspotTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOTSPOT_TEMPLATES);
    return saved ? JSON.parse(saved) : initialHotspotTemplates;
  });

  const [allVpnConfigs, setAllVpnConfigs] = useState<VPNConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VPN_CONFIGS);
    return saved ? JSON.parse(saved) : initialVPNConfigs;
  });
  const vpnConfigs = useMemo(() => {
    return allVpnConfigs.filter(v => (v.tenantId ? v.tenantId === currentTenantId : isPrimary));
  }, [allVpnConfigs, currentTenantId, isPrimary]);

  const [radiusServerConfig, setRadiusServerConfig] = useState<RadiusServerConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RADIUS_CONFIG);
    return saved ? JSON.parse(saved) : initialRadiusServerConfig;
  });

  const [radiusServer, setRadiusServer] = useState<{
    ip: string;
    hostname: string;
    secret: string;
    authPort: number;
    acctPort: number;
    wireguardPort: number;
    sstpPort: number;
    apiPort: number;
    location: string;
  }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VPS_RADIUS_SERVER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      ip: '103.49.239.150',
      hostname: 'masmedianet.my.id',
      secret: 'MasmediaSecret2026',
      authPort: 1812,
      acctPort: 1813,
      wireguardPort: 51820,
      sstpPort: 443,
      apiPort: 8728,
      location: 'IDCloudHost Jakarta',
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VPS_RADIUS_SERVER, JSON.stringify(radiusServer));
    setRadiusServerConfig(prev => ({
      ...prev,
      serverHost: radiusServer.ip,
      sharedSecret: radiusServer.secret,
      authPort: radiusServer.authPort,
      acctPort: radiusServer.acctPort,
    }));
  }, [radiusServer]);

  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(e => !e.id?.startsWith('EXP-0'));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialExpenses;
  });
  const expenses = useMemo(() => {
    return allExpenses.filter(e => (e.tenantId ? e.tenantId === currentTenantId : isPrimary));
  }, [allExpenses, currentTenantId, isPrimary]);

  const [allBankAccounts, setAllBankAccounts] = useState<BankRekening[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    return saved ? JSON.parse(saved) : initialBankRekening;
  });
  const bankAccounts = useMemo(() => {
    return allBankAccounts.filter(b => (b.tenantId ? b.tenantId === currentTenantId : isPrimary));
  }, [allBankAccounts, currentTenantId, isPrimary]);

  const [qrisConfig, setQrisConfig] = useState<QRISConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QRIS_CONFIG);
    return saved ? JSON.parse(saved) : initialQRISConfig;
  });

  const [paymentGatewayConfig, setPaymentGatewayConfig] = useState<PaymentGatewayConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GATEWAY_CONFIG);
    return saved ? JSON.parse(saved) : initialPaymentGatewayConfig;
  });

  const [allTickets, setAllTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : initialTickets;
  });
  const tickets = useMemo(() => {
    return allTickets.filter(t => (t.tenantId ? t.tenantId === currentTenantId : isPrimary));
  }, [allTickets, currentTenantId, isPrimary]);

  const [allFiberCables, setAllFiberCables] = useState<GISFiberCable[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FIBER_CABLES);
    return saved ? JSON.parse(saved) : initialFiberCables;
  });
  const fiberCables = useMemo(() => {
    return allFiberCables.filter(c => (c.tenantId ? c.tenantId === currentTenantId : isPrimary));
  }, [allFiberCables, currentTenantId, isPrimary]);

  // Poin 5: MikroTik Offline Command Retry Queue & Spooler State
  const [allCommandQueue, setAllCommandQueue] = useState<RouterCommandQueueItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMMAND_QUEUE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => !c.id?.startsWith('CMD-00'));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialCommandQueue;
  });
  const commandQueue = useMemo(() => {
    return allCommandQueue.filter(q => (q.tenantId ? q.tenantId === currentTenantId : isPrimary));
  }, [allCommandQueue, currentTenantId, isPrimary]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMAND_QUEUE, JSON.stringify(allCommandQueue));
  }, [allCommandQueue]);

  const [ispProfile, setIspProfile] = useState<ISPProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ISP_PROFILE);
    return saved ? JSON.parse(saved) : initialISPProfile;
  });

  const [allActivityLogs, setAllActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });
  const activityLogs = useMemo(() => {
    return allActivityLogs.filter(l => (l.tenantId ? l.tenantId === currentTenantId : isPrimary));
  }, [allActivityLogs, currentTenantId, isPrimary]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(allActivityLogs));
  }, [allActivityLogs]);

  // Cloud Firestore Persistence State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);
  const [isCloudReady, setIsCloudReady] = useState<boolean>(false);
  const isCloudRestoredRef = useRef<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);

  // Auto-sync entire state snapshot to Cloud Firestore with debouncing
  const syncNowToCloud = async (): Promise<boolean> => {
    if (isSyncingRef.current) return false;
    isSyncingRef.current = true;
    setCloudSyncStatus('syncing');
    try {
      const payload: DatabaseBackupPayload = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        appName: 'Masmedia Multi-ISP Cloud',
        data: {
          customers: allCustomers,
          packages,
          invoices: allInvoices,
          nasList: allNasList,
          activeSessions: allActiveSessions,
          templates,
          isolirConfig,
          paymentChannels,
          accounts,
          ftthOLTs: allFtthOLTs,
          ftthODPs: allFtthODPs,
          ftthONUs: allFtthONUs,
          genieACSConfig,
          tr069Devices: allTr069Devices,
          hotspotProfiles,
          hotspotVouchers: allHotspotVouchers,
          hotspotTemplates,
          vpnConfigs: allVpnConfigs,
          radiusServerConfig,
          expenses: allExpenses,
          bankAccounts: allBankAccounts,
          qrisConfig,
          paymentGatewayConfig,
          tickets: allTickets,
          fiberCables: allFiberCables,
          activityLogs: allActivityLogs,
          commandQueue: allCommandQueue,
          ispProfile,
          tenants,
        },
      };

      // Also save to local IndexedDB backup
      saveToIndexedDB('snapshot_v2', payload);

      // Save to Firebase Cloud Firestore (with redundant fallback keys)
      const ok = await syncToCloudFirestore(currentTenantId || 'tenant-masmedia', payload);
      if (ok) {
        setCloudSyncStatus('synced');
        setLastCloudSync(new Date().toLocaleTimeString('id-ID'));
        return true;
      } else {
        setCloudSyncStatus('offline');
        return false;
      }
    } catch (e) {
      console.warn('[CloudSync] Sync error:', e);
      setCloudSyncStatus('offline');
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Initial cloud restore on mount: fetch from Cloud Firestore first
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Validate server connectivity
        testConnection();

        const cloudData = await loadFromCloudFirestore(currentTenantId || 'tenant-masmedia');
        if (cloudData && isMounted) {
          const payloadData = cloudData.data || cloudData;
          // Check if cloud data contains user data records
          const hasCloudRecords = 
            (Array.isArray(payloadData.customers) && payloadData.customers.length > 0) ||
            (Array.isArray(payloadData.packages) && payloadData.packages.length > 0) ||
            (Array.isArray(payloadData.invoices) && payloadData.invoices.length > 0) ||
            (Array.isArray(payloadData.nasList) && payloadData.nasList.length > 0) ||
            payloadData.paymentChannels ||
            payloadData.ispProfile;

          if (hasCloudRecords) {
            console.info('[CloudRestore] Data ditemukan di Cloud Firestore, melakukan pemulihan otomatis...');
            importFullDatabase(cloudData.data ? cloudData : { version: '2.0.0', exportedAt: new Date().toISOString(), appName: 'Masmedia Multi-ISP Cloud', data: payloadData });
            setLastCloudSync(new Date().toLocaleTimeString('id-ID'));
            setCloudSyncStatus('synced');
          } else {
            console.info('[CloudRestore] Cloud Firestore kosong, memeriksa data lokal...');
            // If cloud is empty but local storage has user data, sync local data to cloud immediately
            if (allCustomers.length > 0 || packages.length > 0 || allInvoices.length > 0 || allNasList.length > 0) {
              console.info('[CloudRestore] Mengunggah data lokal yang ada ke Cloud Firestore...');
              await syncNowToCloud();
            }
          }
        } else {
          // Cloud document did not exist yet; if local state has records, push to cloud
          if (allCustomers.length > 0 || packages.length > 0 || allInvoices.length > 0 || allNasList.length > 0) {
            console.info('[CloudRestore] Mengunggah data awal ke Cloud Firestore...');
            await syncNowToCloud();
          }
        }
      } catch (err) {
        console.warn('[CloudRestore] Notice:', err);
      } finally {
        if (isMounted) {
          isCloudRestoredRef.current = true;
          setIsCloudReady(true);
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Continuous debounced auto-sync to Cloud Firestore whenever ANY core state changes
  useEffect(() => {
    // Only auto-sync AFTER initial cloud restoration has completed to avoid race conditions!
    if (!isCloudRestoredRef.current) return;

    const timer = setTimeout(() => {
      syncNowToCloud();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [
    allCustomers,
    allInvoices,
    packages,
    allNasList,
    allActiveSessions,
    templates,
    isolirConfig,
    paymentChannels,
    accounts,
    allFtthOLTs,
    allFtthODPs,
    allFtthONUs,
    genieACSConfig,
    allTr069Devices,
    hotspotProfiles,
    allHotspotVouchers,
    hotspotTemplates,
    allVpnConfigs,
    radiusServerConfig,
    allExpenses,
    allBankAccounts,
    qrisConfig,
    paymentGatewayConfig,
    allTickets,
    allFiberCables,
    ispProfile,
    tenants,
  ]);

  const logActivity = (category: ActivityCategory, action: string, details: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: ActivityLog = {
      id: `LOG-ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId: currentTenantId,
      timestamp: now,
      userName: currentUser?.name || 'Admin Sistem',
      userRole: currentUser?.role || 'admin',
      category,
      action,
      details,
      ipAddress: '192.168.88.10',
    };
    setAllActivityLogs(prev => [newLog, ...prev.slice(0, 499)]);
  };

  const clearActivityLogs = () => {
    setAllActivityLogs(prev => prev.filter(l => l.tenantId !== currentTenantId));
  };

  const updateISPProfile = (updates: Partial<ISPProfile>) => {
    setIspProfile(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.ISP_PROFILE, JSON.stringify(updated));
      return updated;
    });
  };

  // Helper to read initial tab from URL
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      try {
        const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
        if (path === 'portal' || path === 'portal-pelanggan' || path === 'customer-portal') {
          return 'portal';
        }
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab') || urlParams.get('page') || urlParams.get('p');
        if (tabParam) {
          if (tabParam === 'portal-pelanggan' || tabParam === 'customer-portal' || tabParam === 'portal') return 'portal';
          return tabParam;
        }
        if (urlParams.get('portal') === 'true') return 'portal';
        if (window.location.hash) {
          const hash = window.location.hash.replace('#', '').toLowerCase();
          if (hash === 'portal' || hash === 'portal-pelanggan') return 'portal';
        }
      } catch (e) {
        console.error(e);
      }
    }
    return 'dashboard';
  };

  // Navigation State
  const [activeCategory, setActiveCategory] = useState<string>('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string>('user');
  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const setNavigation = (category: string, subMenu?: string, subTab?: string) => {
    setActiveCategory(category);
    if (subMenu) setActiveSubMenu(subMenu);
    if (subTab) setActiveSubTab(subTab);
    setActiveTabState(category);
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (tab === 'dashboard') {
      setActiveCategory('dashboard');
      setActiveSubMenu('overview');
    } else if (tab === 'account') {
      setActiveCategory('dashboard');
      setActiveSubMenu('account');
    } else if (tab === 'ftth') {
      setActiveCategory('dashboard');
      setActiveSubMenu('ftth');
    } else if (tab === 'tr069') {
      setActiveCategory('dashboard');
      setActiveSubMenu('tr069');
    } else if (tab === 'radius' || tab === 'mikrotik') {
      setActiveCategory('radius');
      setActiveSubMenu('ppp-dhcp');
    } else if (tab === 'hotspot') {
      setActiveCategory('radius');
      setActiveSubMenu('hotspot');
    } else if (tab === 'billing') {
      setActiveCategory('billing');
      setActiveSubMenu('member');
    } else if (tab === 'payment') {
      setActiveCategory('payment');
      setActiveSubMenu('payment-gateway');
    } else if (tab === 'reports') {
      setActiveCategory('laporan');
      setActiveSubMenu('pemasukan');
    }
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, selectedTenantId);
  }, [selectedTenantId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(allCustomers));
  }, [allCustomers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(allInvoices));
  }, [allInvoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NAS, JSON.stringify(allNasList));
  }, [allNasList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(allActiveSessions));
  }, [allActiveSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ISOLIR, JSON.stringify(isolirConfig));
  }, [isolirConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT, JSON.stringify(paymentChannels));
  }, [paymentChannels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FTTH_OLT, JSON.stringify(allFtthOLTs));
  }, [allFtthOLTs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FTTH_ODP, JSON.stringify(allFtthODPs));
  }, [allFtthODPs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FTTH_ONU, JSON.stringify(allFtthONUs));
  }, [allFtthONUs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GENIEACS_CONFIG, JSON.stringify(genieACSConfig));
  }, [genieACSConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TR069_DEVICES, JSON.stringify(allTr069Devices));
  }, [allTr069Devices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOTSPOT_PROFILES, JSON.stringify(hotspotProfiles));
  }, [hotspotProfiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOTSPOT_VOUCHERS, JSON.stringify(allHotspotVouchers));
  }, [allHotspotVouchers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOTSPOT_TEMPLATES, JSON.stringify(hotspotTemplates));
  }, [hotspotTemplates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VPN_CONFIGS, JSON.stringify(allVpnConfigs));
  }, [allVpnConfigs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RADIUS_CONFIG, JSON.stringify(radiusServerConfig));
  }, [radiusServerConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(allExpenses));
  }, [allExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(allBankAccounts));
  }, [allBankAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QRIS_CONFIG, JSON.stringify(qrisConfig));
  }, [qrisConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GATEWAY_CONFIG, JSON.stringify(paymentGatewayConfig));
  }, [paymentGatewayConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(allTickets));
  }, [allTickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIBER_CABLES, JSON.stringify(allFiberCables));
  }, [allFiberCables]);

  // Compute System Statistics
  const stats: SystemStats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const dueSoonCustomers = customers.filter(c => c.status === 'due_soon').length;
    const overdueCustomers = customers.filter(c => c.status === 'overdue').length;
    const isolatedCustomers = customers.filter(c => c.status === 'isolated').length;

    // Monthly revenue: Paid invoices this month
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalMonthlyRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Today revenue
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayPaid = paidInvoices.filter(inv => inv.paidAt && inv.paidAt.startsWith(todayStr));
    const todayRevenue = todayPaid.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue');
    const unpaidInvoicesCount = unpaidInvoices.length;
    const unpaidInvoicesAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const activeSessionsCount = activeSessions.length;
    const totalThroughputMbps = 142.5;

    const totalExpensesMonth = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfitMonth = totalMonthlyRevenue - totalExpensesMonth;

    return {
      totalCustomers,
      activeCustomers,
      dueSoonCustomers,
      overdueCustomers,
      isolatedCustomers,
      totalMonthlyRevenue,
      todayRevenue,
      unpaidInvoicesCount,
      unpaidInvoicesAmount,
      activeSessionsCount,
      totalThroughputMbps,
      totalExpensesMonth,
      netProfitMonth,
    };
  }, [customers, invoices, activeSessions, expenses]);

  // Authentication Actions
  const login = (identifier: string, password?: string): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    if (!cleanId) {
      return { success: false, message: 'Harap masukkan email login Anda!' };
    }

    if (!cleanPass) {
      return { success: false, message: 'Harap masukkan password akun Anda!' };
    }

    // STRICT MATCH: Matches against exact email or username in accounts or tenant owners
    let matchedAccount = accounts.find(a => {
      const e = (a.email || '').trim().toLowerCase();
      const u = (a.username || '').trim().toLowerCase();
      return e === cleanId || u === cleanId;
    });

    if (!matchedAccount) {
      const matchedTenant = tenants.find(t => 
        (t.ownerEmail || '').trim().toLowerCase() === cleanId ||
        (t.subdomain || '').trim().toLowerCase() === cleanId
      );
      if (matchedTenant) {
        const defaultPassword = matchedTenant.slug ? `${matchedTenant.slug}123` : 'admin123';
        matchedAccount = {
          id: `ACC-TENANT-${matchedTenant.id}`,
          username: matchedTenant.ownerEmail,
          password: defaultPassword,
          name: matchedTenant.ownerName || matchedTenant.name,
          email: matchedTenant.ownerEmail,
          phone: matchedTenant.ownerPhone || matchedTenant.phone || '',
          role: 'admin',
          tenantId: matchedTenant.id,
          tenantName: matchedTenant.name,
          status: matchedTenant.status === 'active' ? 'active' : 'inactive',
          lastLogin: 'Baru saja',
          permissions: ['billing', 'radius', 'ftth', 'reports', 'settings'],
          createdAt: matchedTenant.createdAt || new Date().toISOString().slice(0, 10),
        };
        setAccounts(prev => [...prev.filter(a => a.id !== matchedAccount!.id), matchedAccount!]);
      }
    }

    if (!matchedAccount) {
      return { 
        success: false, 
        message: 'Akun dengan email tersebut tidak ditemukan di Manajemen Akun!' 
      };
    }

    if (matchedAccount.status === 'inactive') {
      return { 
        success: false, 
        message: 'Akun Anda sedang dinonaktifkan oleh Administrator.' 
      };
    }

    // STRICT PASSWORD VERIFICATION: Must exactly match the password saved in Manajemen Akun
    const expectedPassword = matchedAccount.password || 'admin123';
    if (cleanPass !== expectedPassword) {
      return { 
        success: false, 
        message: 'Password salah! Pastikan password sesuai dengan data di Manajemen Akun.' 
      };
    }

    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const loggedInAcc: AdminAccount = {
      ...matchedAccount,
      lastLogin: dateStr,
    };

    setCurrentUser(loggedInAcc);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(loggedInAcc));

    // If the account belongs to a specific tenant/ISP branch, auto-switch to that branch
    if (loggedInAcc.tenantId) {
      setSelectedTenantId(loggedInAcc.tenantId);
      localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT, loggedInAcc.tenantId);
    }

    // Update lastLogin in accounts list
    setAccounts(prev => prev.map(a => (a.id === loggedInAcc.id ? loggedInAcc : a)));

    // Route to appropriate view based on role
    if (loggedInAcc.role === 'teknisi') {
      setActiveTab('ftth');
    } else if (loggedInAcc.role === 'kasir') {
      setActiveTab('billing-transaction');
    } else if (loggedInAcc.role === 'operator') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }

    return { success: true };
  };

  const activateAccount = (identifier: string, code?: string): { success: boolean; message: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanCode = code ? code.trim() : '';

    const matchedAccount = accounts.find(a => {
      const e = (a.email || '').trim().toLowerCase();
      const u = (a.username || '').trim().toLowerCase();
      return e === cleanId || u === cleanId;
    });

    if (!matchedAccount) {
      return {
        success: false,
        message: 'Akun tidak ditemukan di sistem.',
      };
    }

    // If code is provided and account has an activation code, verify it
    if (cleanCode && matchedAccount.activationCode && matchedAccount.activationCode !== cleanCode) {
      return {
        success: false,
        message: 'Kode aktivasi / OTP yang dimasukkan tidak sesuai. Silakan periksa email Anda kembali.',
      };
    }

    const updatedAccount: AdminAccount = {
      ...matchedAccount,
      status: 'active',
      isEmailVerified: true,
      activatedAt: new Date().toISOString(),
    };

    setAccounts(prev => prev.map(a => (a.id === matchedAccount.id ? updatedAccount : a)));

    return {
      success: true,
      message: `Akun "${matchedAccount.username}" berhasil diaktivasi! Anda sekarang dapat masuk ke sistem.`,
    };
  };

  const resendActivationCode = (identifier: string): { success: boolean; message: string; code?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const matchedAccount = accounts.find(a => {
      const e = (a.email || '').trim().toLowerCase();
      const u = (a.username || '').trim().toLowerCase();
      return e === cleanId || u === cleanId;
    });

    if (!matchedAccount) {
      return {
        success: false,
        message: 'Akun tidak ditemukan.',
      };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const updatedAccount: AdminAccount = {
      ...matchedAccount,
      activationCode: newCode,
    };

    setAccounts(prev => prev.map(a => (a.id === matchedAccount.id ? updatedAccount : a)));

    return {
      success: true,
      message: `Kode aktivasi baru berhasil dibuat untuk ${matchedAccount.email}.`,
      code: newCode,
    };
  };

  const loginAsRole = (role: 'superadmin' | 'admin' | 'teknisi' | 'kasir' | 'operator') => {
    const targetRole = role === 'admin' ? 'superadmin' : role;
    let targetAcc = accounts.find(a => a.role === targetRole);
    
    // Fallback if not found
    if (!targetAcc) {
      targetAcc = {
        id: `ACC-DEMO-${Date.now()}`,
        username: role,
        password: `${role}123`,
        name: role === 'superadmin' || role === 'admin'
          ? 'Admin Masmedia'
          : role === 'teknisi'
          ? 'Teknisi Lapangan'
          : role === 'kasir'
          ? 'Kasir Billing'
          : 'Operator NOC',
        email: `${role}@rtrw.net`,
        phone: '081234567890',
        role: targetRole,
        status: 'active',
        lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
        permissions: ['all'],
        createdAt: '2025-01-01',
      };
    }

    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const loggedInAcc = { ...targetAcc, lastLogin: dateStr };

    setCurrentUser(loggedInAcc);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(loggedInAcc));

    if (loggedInAcc.role === 'teknisi') {
      setActiveTab('ftth');
    } else if (loggedInAcc.role === 'kasir') {
      setActiveTab('billing-transaction');
    } else if (loggedInAcc.role === 'operator') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  // Account actions
  const addAccount = (acc: Omit<AdminAccount, 'id' | 'createdAt'>) => {
    const newAcc: AdminAccount = {
      ...acc,
      id: `ACC-${String(accounts.length + 1).padStart(2, '0')}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAccounts(prev => [newAcc, ...prev]);
  };

  const updateAccount = (id: string, updates: Partial<AdminAccount>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // FTTH Actions
  const addOLT = (olt: Omit<FTTH_OLT, 'id'>) => {
    const newOLT: FTTH_OLT = {
      ...olt,
      tenantId: olt.tenantId || currentTenantId,
      id: `OLT-${String(allFtthOLTs.length + 1).padStart(2, '0')}`,
    };
    setAllFtthOLTs(prev => [...prev, newOLT]);
  };

  const updateOLT = (id: string, updates: Partial<FTTH_OLT>) => {
    setAllFtthOLTs(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOLT = (id: string) => {
    setAllFtthOLTs(prev => prev.filter(o => o.id !== id));
  };

  const addODP = (odp: Omit<FTTH_ODP, 'id'>) => {
    const newODP: FTTH_ODP = {
      ...odp,
      tenantId: odp.tenantId || currentTenantId,
      id: `ODP-RW0${allFtthODPs.length + 1}-${String.fromCharCode(65 + (allFtthODPs.length % 26))}`,
    };
    setAllFtthODPs(prev => [...prev, newODP]);
  };

  const updateODP = (id: string, updates: Partial<FTTH_ODP>) => {
    setAllFtthODPs(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteODP = (id: string) => {
    setAllFtthODPs(prev => prev.filter(o => o.id !== id));
  };

  const addONU = (onu: Omit<FTTH_ONU, 'id'>) => {
    const newONU: FTTH_ONU = {
      ...onu,
      tenantId: onu.tenantId || currentTenantId,
      id: `ONU-${String(allFtthONUs.length + 1).padStart(2, '0')}`,
    };
    setAllFtthONUs(prev => [...prev, newONU]);
  };

  const updateONU = (id: string, updates: Partial<FTTH_ONU>) => {
    setAllFtthONUs(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteONU = (id: string) => {
    setAllFtthONUs(prev => prev.filter(o => o.id !== id));
  };

  // TR-069 & GenieACS actions
  const updateGenieACSConfig = (updates: Partial<GenieACSConfig>) => {
    setGenieACSConfig(prev => ({ ...prev, ...updates }));
  };

  const testGenieACSConnection = async (): Promise<boolean> => {
    setGenieACSConfig(prev => ({ ...prev, status: 'connecting' }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setGenieACSConfig(prev => ({
      ...prev,
      status: 'connected',
      lastSyncTime: new Date().toLocaleString('id-ID'),
    }));
    return true;
  };

  const rebootTR069Device = (id: string) => {
    setAllTr069Devices(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, uptimeSeconds: 5, lastInform: new Date().toLocaleString('id-ID') };
      }
      return d;
    }));
  };

  const updateTR069WiFi = (id: string, ssid: string, password?: string) => {
    setAllTr069Devices(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          wifiSsid: ssid,
          wifiPassword: password || d.wifiPassword,
          lastInform: new Date().toLocaleString('id-ID'),
        };
      }
      return d;
    }));
  };

  // Hotspot actions
  const addHotspotProfile = (prof: Omit<HotspotProfile, 'id'>) => {
    const newProf: HotspotProfile = {
      ...prof,
      id: `HSP-${String(hotspotProfiles.length + 1).padStart(2, '0')}`,
    };
    setHotspotProfiles(prev => [...prev, newProf]);
  };

  const updateHotspotProfile = (id: string, updates: Partial<HotspotProfile>) => {
    setHotspotProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteHotspotProfile = (id: string) => {
    setHotspotProfiles(prev => prev.filter(p => p.id !== id));
  };

  const generateVoucherBatch = (
    profileId: string,
    count: number,
    price?: number,
    prefix: string = 'MM-',
    charType: 'num' | 'alphanumeric' | 'uppercase' | 'lowercase' | 'uppercase_only' = 'alphanumeric',
    codeLength: number = 6,
    loginMode: 'same' | 'distinct' = 'same',
    customValidity?: string
  ): HotspotVoucher[] => {
    const prof = hotspotProfiles.find(p => p.id === profileId) || hotspotProfiles[0];
    const finalPrice = price !== undefined ? price : (prof?.price || 5000);
    const finalValidity = customValidity || (prof?.validity || '1 Hari');
    const batchCode = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newVouchers: HotspotVoucher[] = [];

    const getChars = () => {
      if (charType === 'num') return '0123456789';
      if (charType === 'lowercase') return 'abcdefghjkmnpqrstuvwxyz';
      if (charType === 'uppercase') return 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      if (charType === 'uppercase_only') return 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      return '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    };

    const chars = getChars();

    for (let i = 0; i < count; i++) {
      let codePart = '';
      for (let c = 0; c < codeLength; c++) {
        codePart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const code = prefix ? `${prefix}${codePart}` : codePart;
      const password = loginMode === 'same' ? code : String(Math.floor(100000 + Math.random() * 900000));

      newVouchers.push({
        id: `VOU-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        tenantId: currentTenantId,
        code,
        password,
        profileId: prof?.id || 'HSP-01',
        profileName: prof?.name || 'Voucher Hotspot',
        price: finalPrice,
        timeLimit: finalValidity,
        status: 'active',
        batchCode,
        createdAt: new Date().toLocaleString('id-ID'),
      });
    }
    setAllHotspotVouchers(prev => [...newVouchers, ...prev]);
    return newVouchers;
  };

  const deleteVoucher = (id: string) => {
    setAllHotspotVouchers(prev => prev.filter(v => v.id !== id));
  };

  const markVoucherUsed = (id: string, username: string) => {
    setAllHotspotVouchers(prev => prev.map(v => v.id === id ? {
      ...v,
      status: 'used',
      usedBy: username,
      usedAt: new Date().toLocaleString('id-ID'),
    } : v));
  };

  const addHotspotTemplate = (tpl: Omit<HotspotTemplate, 'id'>): HotspotTemplate => {
    const existingIndex = hotspotTemplates.findIndex(
      t => t.name.trim().toLowerCase() === tpl.name.trim().toLowerCase()
    );
    if (existingIndex >= 0) {
      const updatedItem: HotspotTemplate = {
        ...hotspotTemplates[existingIndex],
        ...tpl,
      };
      const updatedList = [...hotspotTemplates];
      updatedList[existingIndex] = updatedItem;
      setHotspotTemplates(updatedList);
      return updatedItem;
    } else {
      const newTpl: HotspotTemplate = {
        ...tpl,
        id: `TPL-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toLocaleDateString('id-ID'),
      };
      setHotspotTemplates(prev => [newTpl, ...prev]);
      return newTpl;
    }
  };

  const updateHotspotTemplate = (id: string, updates: Partial<HotspotTemplate>) => {
    setHotspotTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteHotspotTemplate = (id: string) => {
    setHotspotTemplates(prev => prev.filter(t => t.id !== id));
  };

  // VPN & Radius Settings
  const addVPN = (vpn: Omit<VPNConfig, 'id' | 'uptime' | 'rxBytes' | 'txBytes'>) => {
    const newVPN: VPNConfig = {
      ...vpn,
      tenantId: vpn.tenantId || currentTenantId,
      id: `VPN-${String(allVpnConfigs.length + 1).padStart(2, '0')}`,
      uptime: '0m',
      rxBytes: 0,
      txBytes: 0,
    };
    setAllVpnConfigs(prev => [...prev, newVPN]);
  };

  const toggleVPN = (id: string) => {
    setAllVpnConfigs(prev => prev.map(v => {
      if (v.id === id) {
        const nextStatus = v.status === 'connected' ? 'disconnected' : 'connected';
        return { ...v, status: nextStatus, uptime: nextStatus === 'connected' ? '1m' : '0m' };
      }
      return v;
    }));
  };

  const deleteVPN = (id: string) => {
    setAllVpnConfigs(prev => prev.filter(v => v.id !== id));
  };

  const updateRadiusServerConfig = (updates: Partial<RadiusServerConfig>) => {
    setRadiusServerConfig(prev => ({ ...prev, ...updates }));
  };

  // Expenses actions
  const addExpense = (exp: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...exp,
      tenantId: exp.tenantId || currentTenantId,
      id: `EXP-${String(allExpenses.length + 1).padStart(2, '0')}`,
    };
    setAllExpenses(prev => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setAllExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Bank Accounts actions
  const addBankAccount = (acc: Omit<BankRekening, 'id'>) => {
    const newBank: BankRekening = {
      ...acc,
      tenantId: acc.tenantId || currentTenantId,
      id: `BANK-${String(allBankAccounts.length + 1).padStart(2, '0')}`,
    };
    setAllBankAccounts(prev => [...prev, newBank]);
  };

  const updateBankAccount = (id: string, updates: Partial<BankRekening>) => {
    setAllBankAccounts(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBankAccount = (id: string) => {
    setAllBankAccounts(prev => prev.filter(b => b.id !== id));
  };

  const toggleBankAccount = (id: string) => {
    setAllBankAccounts(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
  };

  const updateQRISConfig = (updates: Partial<QRISConfig>) => {
    setQrisConfig(prev => ({ ...prev, ...updates }));
  };

  const updatePaymentGatewayConfig = (updates: Partial<PaymentGatewayConfig>) => {
    setPaymentGatewayConfig(prev => ({ ...prev, ...updates }));
  };

  // Customer Management
  const addCustomer = (data: Partial<Customer>): Customer => {
    const nextNum = allCustomers.length + 1;
    const newId = `CUST-${String(nextNum).padStart(3, '0')}`;
    const pkg = packages.find(p => p.id === data.packageId) || packages[0];
    const cleanUsername = (data.username || `user${nextNum}`).trim();
    
    const newCustomer: Customer = {
      id: newId,
      tenantId: data.tenantId || currentTenantId,
      name: data.name || 'Pelanggan Baru',
      phone: data.phone || '081234567890',
      address: data.address || 'Jl. Mawar RT 01 / RW 04',
      rtRw: data.rtRw || 'RT 01 / RW 04',
      username: cleanUsername,
      password: data.password || 'netpass123',
      packageId: pkg.id,
      ipAddress: data.ipAddress || `10.20.1.${100 + nextNum}`,
      macAddress: data.macAddress || `48:8A:D2:77:88:${String(nextNum).padStart(2, '0')}`,
      connectionType: data.connectionType || 'pppoe',
      installDate: data.installDate || new Date().toISOString().slice(0, 10),
      dueDateDay: data.dueDateDay || isolirConfig.defaultDueDateDay,
      status: (data.status as any) || 'active',
      autoIsolate: data.autoIsolate ?? true,
      notes: data.notes || '',
      nasId: data.nasId || nasList[0]?.id || 'NAS-01',
      onuSerial: data.onuSerial || `ZTEGC${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      coordinates: data.coordinates || { lat: -6.9175 + (Math.random() - 0.5) * 0.01, lng: 107.6191 + (Math.random() - 0.5) * 0.01 },
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setAllCustomers(prev => [newCustomer, ...prev]);

    // Pelanggan baru terdaftar di database & secret MikroTik dengan status koneksi awal: OFFLINE
    // Sesi aktif HANYA akan tercipta ketika modem/ONT pelanggan dial-in ke router MikroTik fisik yang online
    // Bersihkan sesi aktif hantu jika ada sesi lama dengan username yang sama
    setAllActiveSessions(prev => 
      prev.filter(s => (s.username || '').toLowerCase().trim() !== cleanUsername.toLowerCase())
    );

    return newCustomer;
  };

  const bulkImportCustomers = (newCusts: Customer[]): number => {
    if (!newCusts || newCusts.length === 0) return 0;
    
    setAllCustomers(prev => {
      // Merge by username, stamp tenantId
      const existingUsernames = new Set(prev.map(c => c.username.toLowerCase()));
      const preparedNew = newCusts.map(c => ({
        ...c,
        tenantId: c.tenantId || currentTenantId,
      }));
      const filteredNew = preparedNew.filter(c => !existingUsernames.has(c.username.toLowerCase()));
      const updatedExisting = prev.map(c => {
        const found = preparedNew.find(nc => nc.username.toLowerCase() === c.username.toLowerCase());
        return found ? { ...c, ...found, id: c.id } : c;
      });
      return [...filteredNew, ...updatedExisting];
    });

    // Catatan: Pelanggan yang diimpor tidak otomatis diberikan sesi online palsu.
    return newCusts.length;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setAllCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCustomer = (id: string) => {
    setAllCustomers(prev => prev.filter(c => c.id !== id));
    setAllActiveSessions(prev => {
      const cust = allCustomers.find(c => c.id === id);
      return cust ? prev.filter(s => s.username !== cust.username) : prev;
    });
  };

  // Poin 5: Offline Command Queue & Router Spooler Methods
  const enqueueCommand = (
    item: Omit<RouterCommandQueueItem, 'id' | 'createdAt' | 'status' | 'retryCount' | 'executionLogs' | 'maxRetries'> & { maxRetries?: number }
  ): RouterCommandQueueItem => {
    const targetNas = allNasList.find(n => n.id === item.nasId) || nasList[0];
    const isNasOnline = targetNas ? targetNas.status === 'online' : true;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newCmd: RouterCommandQueueItem = {
      ...item,
      id: `CMD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      tenantId: item.tenantId || currentTenantId,
      status: isNasOnline ? 'completed' : 'pending',
      retryCount: 0,
      maxRetries: item.maxRetries || 5,
      createdAt: now,
      lastAttemptAt: now,
      completedAt: isNasOnline ? now : undefined,
      errorMessage: isNasOnline
        ? undefined
        : `Router "${targetNas?.name || item.nasName}" sedang offline / tidak terjangkau. Perintah otomatis masuk antrean spooler retry.`,
      executionLogs: [
        `[${now}] Perintah dibuat oleh sistem: ${item.title}`,
        isNasOnline
          ? `[${now}] Terhubung ke ${targetNas?.name || 'Router'} (${targetNas?.ipAddress || '192.168.88.1'}:8728). Perintah berhasil dieksekusi (Response: =!done).`
          : `[${now}] PERINGATAN: Router ${targetNas?.name || 'Router'} offline. Disimpan di antrean untuk auto-retry saat router kembali online.`,
      ],
    };

    setAllCommandQueue(prev => [newCmd, ...prev]);
    logActivity('queue', `Antrean: ${item.action}`, `${item.title} -> ${targetNas?.name || item.nasName} (${newCmd.status})`);
    return newCmd;
  };

  const processQueue = async (nasId?: string): Promise<{ executed: number; succeeded: number; failed: number }> => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let executed = 0;
    let succeeded = 0;
    let failed = 0;

    setAllCommandQueue(prev => {
      return prev.map(cmd => {
        if (cmd.status !== 'pending' && cmd.status !== 'failed') return cmd;
        if (nasId && cmd.nasId !== nasId) return cmd;

        executed++;
        const targetNas = allNasList.find(n => n.id === cmd.nasId);
        const isOnline = targetNas?.status === 'online';

        if (isOnline) {
          succeeded++;
          return {
            ...cmd,
            status: 'completed',
            completedAt: now,
            lastAttemptAt: now,
            errorMessage: undefined,
            executionLogs: [
              ...cmd.executionLogs,
              `[${now}] Auto-Sync Berhasil: Router ${targetNas?.name || 'Router'} online. Skrip dieksekusi: ${cmd.commandSnippet.slice(0, 60)}... Selesai.`,
            ],
          };
        } else {
          failed++;
          const nextRetry = cmd.retryCount + 1;
          const isMaxExceeded = nextRetry >= cmd.maxRetries;
          return {
            ...cmd,
            status: isMaxExceeded ? 'failed' : 'pending',
            retryCount: nextRetry,
            lastAttemptAt: now,
            errorMessage: `Attempt ${nextRetry}/${cmd.maxRetries} gagal: Router "${targetNas?.name || 'Router'}" masih offline.`,
            executionLogs: [
              ...cmd.executionLogs,
              `[${now}] Attempt ${nextRetry}/${cmd.maxRetries} gagal: Router unreachable. ${isMaxExceeded ? 'Batas retry tercapai.' : 'Menunggu siklus berikutnya.'}`,
            ],
          };
        }
      });
    });

    logActivity('queue', 'Proses Antrean Router', `Memproses antrean (${executed} dieksekusi, ${succeeded} sukses, ${failed} gagal/menunggu)`);
    return { executed, succeeded, failed };
  };

  const retryCommand = async (commandId: string): Promise<{ success: boolean; message: string }> => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const target = allCommandQueue.find(q => q.id === commandId);
    if (!target) return { success: false, message: 'Perintah antrean tidak ditemukan.' };

    const targetNas = allNasList.find(n => n.id === target.nasId);
    const isOnline = targetNas?.status === 'online';

    if (isOnline) {
      setAllCommandQueue(prev =>
        prev.map(q =>
          q.id === commandId
            ? {
                ...q,
                status: 'completed',
                completedAt: now,
                lastAttemptAt: now,
                errorMessage: undefined,
                executionLogs: [
                  ...q.executionLogs,
                  `[${now}] Manual Retry Sukses: Dieksekusi ke ${targetNas?.name || 'Router'} (${targetNas?.ipAddress || '192.168.88.1'}). Response =!done`,
                ],
              }
            : q
        )
      );
      logActivity('queue', 'Manual Retry Sukses', `Perintah ${target.title} berhasil dieksekusi ke ${targetNas?.name}`);
      return { success: true, message: `Perintah "${target.title}" berhasil dieksekusi ke router ${targetNas?.name}!` };
    } else {
      setAllCommandQueue(prev =>
        prev.map(q =>
          q.id === commandId
            ? {
                ...q,
                retryCount: q.retryCount + 1,
                lastAttemptAt: now,
                errorMessage: `Koneksi gagal ke ${targetNas?.name || 'Router'} (${targetNas?.ipAddress || '192.168.88.1'}). Router Offline / Mati Lampu.`,
                executionLogs: [
                  ...q.executionLogs,
                  `[${now}] Manual Retry Gagal: Router ${targetNas?.name || 'Router'} tidak merespon (Host Unreachable).`,
                ],
              }
            : q
        )
      );
      return {
        success: false,
        message: `Gagal: Router "${targetNas?.name || 'Router'}" sedang Offline. Perintah tetap tersimpan di antrean spooler untuk dieksekusi otomatis saat router online.`,
      };
    }
  };

  const cancelCommand = (commandId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setAllCommandQueue(prev =>
      prev.map(q =>
        q.id === commandId
          ? {
              ...q,
              status: 'cancelled',
              executionLogs: [...q.executionLogs, `[${now}] Perintah dibatalkan secara manual oleh operator (${currentUser?.name || 'Admin'}).`],
            }
          : q
      )
    );
    logActivity('queue', 'Batalkan Perintah', `Perintah antrean ID ${commandId} dibatalkan`);
  };

  const clearCompletedCommands = () => {
    setAllCommandQueue(prev => prev.filter(q => q.status === 'pending' || q.status === 'executing'));
    logActivity('queue', 'Bersihkan Riwayat', 'Menghapus riwayat antrean selesai dan dibatalkan');
  };

  const toggleRouterStatus = (nasId: string, forcedStatus?: 'online' | 'offline') => {
    let targetOnline = false;
    let routerName = 'Router';
    setAllNasList(prev =>
      prev.map(n => {
        if (n.id === nasId) {
          routerName = n.name;
          const nextStatus = forcedStatus || (n.status === 'online' ? 'offline' : 'online');
          targetOnline = nextStatus === 'online';
          return {
            ...n,
            status: nextStatus,
            lastPing: nextStatus === 'online' ? 'Baru saja online (Koneksi Pulih)' : 'Router Mati / Link Putus',
          };
        }
        return n;
      })
    );

    if (targetOnline) {
      logActivity('mikrotik', 'Router Pulih Online', `Router ${routerName} (${nasId}) kembali online. Menjalankan auto-drain antrean spooler...`);
      // Auto-drain pending commands for this router!
      setTimeout(() => {
        processQueue(nasId);
      }, 500);
    } else {
      logActivity('mikrotik', 'Router Offline', `Router ${routerName} (${nasId}) berstatus offline (Simulasi Mati Lampu / Gangguan)`);
    }
  };

  const isolateCustomer = (id: string) => {
    setAllCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'isolated' } : c))
    );
    const cust = allCustomers.find(c => c.id === id);
    if (cust) {
      const nas = allNasList.find(n => n.id === cust.nasId) || nasList[0];
      setAllActiveSessions(prev =>
        prev.map(s =>
          s.username === cust.username
            ? { ...s, rxRate: '64 kbps (Isolir)', txRate: '64 kbps (Isolir)' }
            : s
        )
      );

      // Auto-enqueue MikroTik isolation command
      enqueueCommand({
        nasId: nas?.id || 'NAS-01',
        nasName: nas?.name || 'Router MikroTik Utama',
        action: 'isolate_customer',
        title: `Isolir Pelanggan: ${cust.name} (${cust.username})`,
        description: `Alihkan profile PPPoE ke "${isolirConfig.isolirProfileName}" dan masukkan IP ${cust.ipAddress} ke Address List "${isolirConfig.isolirAddressList}".`,
        commandSnippet: `/ppp secret set [find name="${cust.username}"] profile="${isolirConfig.isolirProfileName}" comment="ISOLIR_OVERDUE"\n/ppp active remove [find name="${cust.username}"]`,
        targetUsername: cust.username,
        customerId: cust.id,
      });
    }
  };

  const unIsolateCustomer = (id: string) => {
    setAllCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'active' } : c))
    );
    const cust = allCustomers.find(c => c.id === id);
    const pkg = packages.find(p => p.id === cust?.packageId) || packages[0];
    const nas = allNasList.find(n => n.id === cust?.nasId) || nasList[0];
    if (cust) {
      setAllActiveSessions(prev =>
        prev.map(s =>
          s.username === cust.username
            ? { ...s, rxRate: `${pkg.downloadSpeed} Mbps`, txRate: `${pkg.uploadSpeed} Mbps` }
            : s
        )
      );

      // Auto-enqueue MikroTik restore command
      enqueueCommand({
        nasId: nas?.id || 'NAS-01',
        nasName: nas?.name || 'Router MikroTik Utama',
        action: 'restore_customer',
        title: `Buka Isolir Pelanggan: ${cust.name} (${cust.username})`,
        description: `Kembalikan profile PPPoE ke "${pkg.profileName || pkg.name}" dan hapus dari daftar isolir.`,
        commandSnippet: `/ppp secret set [find name="${cust.username}"] profile="${pkg.profileName || 'default'}" comment="NORMAL"\n/ppp active remove [find name="${cust.username}"]`,
        targetUsername: cust.username,
        customerId: cust.id,
      });
    }
  };

  // Package Management
  const addPackage = (pkg: Omit<InternetPackage, 'id'>) => {
    const newId = `PKG-${String(packages.length + 1).padStart(2, '0')}`;
    const normalized: InternetPackage = {
      ...pkg,
      id: newId,
      isActive: pkg.isActive !== false,
      category: pkg.category || 'pppoe',
      rateLimit: pkg.rateLimit || `${pkg.uploadSpeed || 2}M/${pkg.downloadSpeed || 5}M`,
    };
    setPackages(prev => [...prev, normalized]);
  };

  const updatePackage = (id: string, updates: Partial<InternetPackage>) => {
    setPackages(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  // MikroTik NAS & Sessions
  const addNAS = (nas: Omit<MikroTikNAS, 'id' | 'lastPing'>) => {
    const newId = `NAS-${String(allNasList.length + 1).padStart(2, '0')}`;
    const initialStatus = nas.status || 'offline';
    setAllNasList(prev => [
      ...prev,
      {
        ...nas,
        id: newId,
        tenantId: nas.tenantId || currentTenantId,
        status: initialStatus,
        lastPing: initialStatus === 'online' ? 'Baru saja' : 'Belum Terhubung (Menunggu Skrip Winbox)',
        cpuLoad: initialStatus === 'online' ? (nas.cpuLoad || Math.floor(Math.random() * 20) + 10) : 0,
        freeMemoryMB: nas.freeMemoryMB || 256,
        totalMemoryMB: nas.totalMemoryMB || 1024,
        uptime: initialStatus === 'online' ? (nas.uptime || '1d 04:20:00') : '0s (Menunggu Konfigurasi Winbox)',
        activePppoeCount: nas.activePppoeCount || 0,
        activeHotspotCount: nas.activeHotspotCount || 0,
      },
    ]);
  };

  const updateNAS = (id: string, updates: Partial<MikroTikNAS>) => {
    setAllNasList(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
  };

  const deleteNAS = (id: string) => {
    setAllNasList(prev => prev.filter(n => n.id !== id));
  };

  const disconnectSession = (sessionId: string) => {
    setAllActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const disconnectCustomerSession = (identifier: string) => {
    const cust = allCustomers.find(c => c.id === identifier || c.username === identifier);
    const targetUsername = cust ? cust.username : identifier;
    setAllActiveSessions(prev => prev.filter(s => s.username !== targetUsername && s.id !== identifier));
  };

  const connectCustomerSession = (identifier: string): boolean => {
    const cust = allCustomers.find(c => c.id === identifier || c.username === identifier);
    if (!cust) return false;

    // Cek status router NAS: Router HARUS terdaftar dan berstatus 'online'
    const nas = allNasList.find(n => n.id === cust.nasId) || nasList.find(n => n.id === cust.nasId);
    if (!nas || nas.status !== 'online') {
      return false; // Router MikroTik belum terhubung atau sedang offline, tidak bisa dial-in!
    }

    const pkg = packages.find(p => p.id === cust.packageId) || packages[0];
    const lowerUser = (cust.username || '').toLowerCase().trim();
    const exists = allActiveSessions.some(s => (s.username || '').toLowerCase().trim() === lowerUser);
    if (exists) return true;

    const newSession: ActiveSession = {
      id: `sess-${Date.now()}-${cust.username}`,
      tenantId: cust.tenantId || currentTenantId,
      username: cust.username,
      customerName: cust.name,
      ipAddress: cust.ipAddress,
      macAddress: cust.macAddress || '',
      nasId: cust.nasId || nas.id,
      nasName: nas.name || 'Router MikroTik Utama',
      service: cust.connectionType || 'pppoe',
      uptime: '00:00:15',
      uptimeSeconds: 15,
      bytesIn: 1048576,
      bytesOut: 524288,
      rxRate: `${(pkg.downloadSpeed * 0.4).toFixed(1)} Mbps`,
      txRate: `${(pkg.uploadSpeed * 0.2).toFixed(1)} Mbps`,
      callerId: cust.macAddress || '',
      loginTime: new Date().toISOString(),
    };

    setAllActiveSessions(prev => [newSession, ...prev]);
    return true;
  };

  const pingRouter = (nasId: string) => {
    setAllNasList(prev =>
      prev.map(n =>
        n.id === nasId
          ? {
              ...n,
              lastPing: 'Koneksi Sukses (1.2 ms)',
              status: 'online',
              cpuLoad: Math.floor(Math.random() * 25) + 8,
            }
          : n
      )
    );
    // When router is pinged online, auto-process pending queue for this NAS
    setTimeout(() => {
      processQueue(nasId);
    }, 400);
  };

  // Billing Actions
  const generateMonthlyInvoices = (month: number, year: number): number => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const periodName = `${monthNames[month - 1]} ${year}`;

    let createdCount = 0;
    const newInvoices: Invoice[] = [];

    customers.forEach(cust => {
      const alreadyHas = allInvoices.some(
        inv => inv.customerId === cust.id && inv.periodMonth === month && inv.periodYear === year
      );
      if (!alreadyHas) {
        const pkg = packages.find(p => p.id === cust.packageId) || packages[0];
        const invoiceNum = generateInvoiceNumber(allInvoices.length + createdCount + 1, month, year);
        
        const dueDay = cust.dueDateDay || isolirConfig.defaultDueDateDay;
        const dueDateFormatted = `${year}-${String(month).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;

        newInvoices.push({
          id: invoiceNum,
          tenantId: cust.tenantId || currentTenantId,
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          packageName: pkg.name,
          packagePrice: pkg.price,
          period: periodName,
          periodMonth: month,
          periodYear: year,
          lateFee: 0,
          discount: 0,
          totalAmount: pkg.price,
          createdAt: `${year}-${String(month).padStart(2, '0')}-01`,
          dueDate: dueDateFormatted,
          status: 'unpaid',
        });
        createdCount++;
      }
    });

    if (newInvoices.length > 0) {
      setAllInvoices(prev => [...newInvoices, ...prev]);
    }
    return createdCount;
  };

  const payInvoice = (
    invoiceId: string,
    method: PaymentMethod,
    transactionRef?: string,
    receivedBy: string = 'Admin Billing'
  ) => {
    const nowStr = new Date().toISOString();
    let affectedCustomerId: string | null = null;

    setAllInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          affectedCustomerId = inv.customerId;
          return {
            ...inv,
            status: 'paid',
            paidAt: nowStr,
            paymentMethod: method,
            transactionRef: transactionRef || `TRX-${Date.now().toString().slice(-6)}`,
            receivedBy,
          };
        }
        return inv;
      })
    );

    if (affectedCustomerId) {
      const custId = affectedCustomerId;
      setAllCustomers(prev =>
        prev.map(c => {
          if (c.id === custId) {
            const hasOtherOverdue = allInvoices.some(
              i => i.customerId === custId && i.id !== invoiceId && (i.status === 'overdue' || i.status === 'unpaid')
            );
            return {
              ...c,
              status: hasOtherOverdue ? c.status : 'active',
              lastPaymentDate: nowStr.slice(0, 10),
            };
          }
          return c;
        })
      );
    }
  };

  const deleteInvoice = (id: string) => {
    setAllInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const createManualInvoice = (data: Partial<Invoice>): Invoice => {
    const nextNum = allInvoices.length + 1;
    const invId = data.id || `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(nextNum).padStart(4, '0')}`;
    const newInv: Invoice = {
      id: invId,
      tenantId: data.tenantId || currentTenantId,
      customerId: data.customerId || 'CUST-001',
      customerName: data.customerName || 'Pelanggan',
      customerPhone: data.customerPhone || '081234567890',
      packageName: data.packageName || '10 Mbps',
      packagePrice: data.packagePrice || 150000,
      period: data.period || 'Agustus 2026',
      periodMonth: data.periodMonth || 8,
      periodYear: data.periodYear || 2026,
      lateFee: data.lateFee || 0,
      discount: data.discount || 0,
      totalAmount: (data.packagePrice || 150000) + (data.lateFee || 0) - (data.discount || 0),
      createdAt: data.createdAt || new Date().toISOString().slice(0, 10),
      dueDate: data.dueDate || new Date().toISOString().slice(0, 10),
      status: data.status || 'unpaid',
      notes: data.notes || '',
    };
    setAllInvoices(prev => [newInv, ...prev]);
    return newInv;
  };

  // Isolir Automation Scanner
  const runAutoIsolirScan = (): { isolatedCount: number; checkedCount: number } => {
    const today = new Date();
    let isolatedCount = 0;
    let checkedCount = 0;

    const overdueCustomerIds = new Set<string>();

    invoices.forEach(inv => {
      if (inv.status === 'unpaid') {
        const dueDate = new Date(inv.dueDate);
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > isolirConfig.gracePeriodDays) {
          overdueCustomerIds.add(inv.customerId);
        }
      }
    });

    checkedCount = customers.length;

    setAllCustomers(prev =>
      prev.map(c => {
        if (c.autoIsolate && overdueCustomerIds.has(c.id) && c.status !== 'isolated') {
          isolatedCount++;
          return { ...c, status: 'isolated' };
        }
        return c;
      })
    );

    return { isolatedCount, checkedCount };
  };

  const updateIsolirConfig = (updates: Partial<IsolirRuleConfig>) => {
    setIsolirConfig(prev => ({ ...prev, ...updates }));
  };

  // WhatsApp Gateway
  const updateTemplate = (id: string, newContent: string) => {
    setTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, content: newContent } : t))
    );
  };

  const sendWhatsAppMessage = (phone: string, text: string) => {
    const link = getWhatsAppLink(phone, text);
    window.open(link, '_blank');
  };

  const getFormattedMessage = (customerId: string, templateCode: string, invoiceId?: string): string => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return '';

    const pkg = packages.find(p => p.id === cust.packageId) || packages[0];
    const inv = invoiceId
      ? invoices.find(i => i.id === invoiceId)
      : invoices.find(i => i.customerId === cust.id && i.status !== 'paid') || invoices[0];
    
    const tpl = templates.find(t => t.code === templateCode) || templates[0];

    const vars: Record<string, string | number | undefined> = {
      nama: cust.name,
      id_pelanggan: cust.id,
      username: cust.username,
      paket: pkg.name,
      kecepatan: `${pkg.downloadSpeed} Mbps`,
      periode: inv?.period || 'Bulan Ini',
      tagihan: `Rp ${(inv?.packagePrice || pkg.price).toLocaleString('id-ID')}`,
      denda: `Rp ${(inv?.lateFee || 0).toLocaleString('id-ID')}`,
      total_bayar: `Rp ${(inv?.totalAmount || pkg.price).toLocaleString('id-ID')}`,
      jatuh_tempo: inv?.dueDate || `Tanggal ${cust.dueDateDay} tiap bulan`,
      jatuh_tempo_tgl: cust.dueDateDay,
      no_hp: cust.phone,
      metode_bayar: 'Transfer Bank / QRIS / Payment Gateway',
      link_pembayaran: typeof window !== 'undefined' ? `${window.location.origin}/?tab=portal-pelanggan&cust=${cust.id}` : `/?tab=portal-pelanggan&cust=${cust.id}`,
      nama_isp: ispProfile?.brandName || 'Masmedia Network',
      no_rekening: paymentChannels.bcaAccount?.number
        ? `${paymentChannels.bcaAccount.number} (BCA a/n ${paymentChannels.bcaAccount.name})`
        : 'Bank BCA / Mandiri / BRI / QRIS',
    };

    return replaceWhatsAppPlaceholders(tpl.content, vars);
  };

  // Payment Channels Config
  const updatePaymentChannels = (updates: Partial<PaymentChannelConfig>) => {
    setPaymentChannels(prev => ({ ...prev, ...updates }));
  };

  // Auto-Mutation Processor (Moota, Cekmutasi, Custom Webhooks)
  const processIncomingAutoMutation = (payload: {
    provider: 'moota' | 'cekmutasi' | 'hijrahpay' | 'android_forwarder' | 'midtrans' | 'tripay';
    bank: string;
    amount: number;
    description?: string;
    txId?: string;
  }): { success: boolean; message: string; invoiceId?: string; customerName?: string } => {
    const targetAmount = Number(payload.amount);
    if (!targetAmount || targetAmount <= 0) {
      return { success: false, message: 'Nominal mutasi tidak valid' };
    }

    // Match unpaid / overdue invoice by amountWithCode or totalAmount
    const matched = invoices.find(inv => {
      if (inv.status === 'paid') return false;
      const withCode = inv.amountWithCode || (inv.totalAmount + (inv.uniqueCode || 0));
      return withCode === targetAmount || inv.totalAmount === targetAmount;
    });

    const nowIso = new Date().toISOString();
    const logId = `LOG-MUT-${Date.now()}`;
    const txRef = payload.txId || `MUT-${payload.provider.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    if (matched) {
      payInvoice(matched.id, 'qris', txRef, `Auto-Mutasi ${payload.provider.toUpperCase()} (${payload.bank})`);

      const newLog: AutoMutationWebhookLog = {
        id: logId,
        timestamp: nowIso,
        provider: payload.provider,
        bank: payload.bank,
        amount: targetAmount,
        matchedInvoiceId: matched.id,
        matchedCustomerName: matched.customerName,
        status: 'success',
        message: `Auto-Settlement Sukses: Nominal ${formatRupiah(targetAmount)} cocok dengan Invoice ${matched.id} (${matched.customerName})`,
        rawPayload: JSON.stringify(payload),
      };

      setPaymentChannels(prev => {
        const existingLogs = prev.autoMutationConfig?.webhookLogs || [];
        return {
          ...prev,
          autoMutationConfig: {
            ...prev.autoMutationConfig!,
            webhookLogs: [newLog, ...existingLogs.slice(0, 49)],
          },
        };
      });

      logActivity(
        'billing',
        'Auto-Mutasi Webhook Lunas',
        `Invoice ${matched.id} (${matched.customerName}) lunas otomatis via Webhook ${payload.provider.toUpperCase()} [${payload.bank}] senilai ${formatRupiah(targetAmount)}.`
      );

      return {
        success: true,
        message: `Invoice ${matched.id} atas nama ${matched.customerName} berhasil dilunasi secara otomatis!`,
        invoiceId: matched.id,
        customerName: matched.customerName,
      };
    } else {
      const newLog: AutoMutationWebhookLog = {
        id: logId,
        timestamp: nowIso,
        provider: payload.provider,
        bank: payload.bank,
        amount: targetAmount,
        status: 'not_found',
        message: `Nominal ${formatRupiah(targetAmount)} (${payload.bank}) tidak cocok dengan invoice tagihan manapun yang belum lunas.`,
        rawPayload: JSON.stringify(payload),
      };

      setPaymentChannels(prev => {
        const existingLogs = prev.autoMutationConfig?.webhookLogs || [];
        return {
          ...prev,
          autoMutationConfig: {
            ...prev.autoMutationConfig!,
            webhookLogs: [newLog, ...existingLogs.slice(0, 49)],
          },
        };
      });

      return {
        success: false,
        message: `Nominal ${formatRupiah(targetAmount)} tidak cocok dengan tagihan manapun.`,
      };
    }
  };

  // Support Tickets Actions
  const addTicket = (data: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'logs'>): SupportTicket => {
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = String(Math.floor(100 + Math.random() * 900));
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newId = `TIKET-${Date.now()}`;
    const newTicketNumber = `TKT-${dateCode}-${randomSeq}`;

    const newTicket: SupportTicket = {
      ...data,
      id: newId,
      tenantId: data.tenantId || currentTenantId,
      ticketNumber: newTicketNumber,
      createdAt: now,
      updatedAt: now,
      logs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: now,
          author: data.reportedVia === 'portal_pelanggan' ? `${data.customerName} (Pelanggan)` : 'Admin Sistem',
          message: `Tiket pengaduan diterbitkan: "${data.subject}"`,
          statusChange: data.status,
        },
      ],
    };

    setAllTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicket = (id: string, updates: Partial<SupportTicket>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setAllTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
    );
  };

  const deleteTicket = (id: string) => {
    setAllTickets(prev => prev.filter(t => t.id !== id));
  };

  const addTicketLog = (ticketId: string, author: string, message: string, statusChange?: TicketStatus) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setAllTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        const newLog = {
          id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          author,
          message,
          statusChange,
        };
        return {
          ...t,
          updatedAt: now,
          status: statusChange || t.status,
          resolvedAt: statusChange === 'resolved' || statusChange === 'closed' ? now : t.resolvedAt,
          logs: [...t.logs, newLog],
        };
      })
    );
  };

  // GIS Fiber Cables Actions
  const addFiberCable = (cable: Omit<GISFiberCable, 'id'>) => {
    const newCable: GISFiberCable = {
      ...cable,
      tenantId: cable.tenantId || currentTenantId,
      id: `CBL-${Date.now()}`,
    };
    setAllFiberCables(prev => [...prev, newCable]);
  };

  const updateFiberCable = (id: string, updates: Partial<GISFiberCable>) => {
    setAllFiberCables(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteFiberCable = (id: string) => {
    setAllFiberCables(prev => prev.filter(c => c.id !== id));
  };

  const resetAllData = () => {
    localStorage.clear();
    setAllCustomers(initialCustomers);
    setPackages(initialPackages);
    setAllInvoices(initialInvoices);
    setAllNasList(initialNAS);
    setTenants(initialTenants);
    setAllActiveSessions(initialActiveSessions);
    setTemplates(initialWhatsAppTemplates);
    setIsolirConfig(initialIsolirConfig);
    setPaymentChannels(initialPaymentChannels);
    setAccounts(initialAccounts);
    setAllFtthOLTs(initialFTTH_OLT);
    setAllFtthODPs(initialFTTH_ODP);
    setAllFtthONUs(initialFTTH_ONU);
    setGenieACSConfig(initialGenieACSConfig);
    setAllTr069Devices(initialTR069Devices);
    setHotspotProfiles(initialHotspotProfiles);
    setAllHotspotVouchers(initialHotspotVouchers);
    setHotspotTemplates(initialHotspotTemplates);
    setAllVpnConfigs(initialVPNConfigs);
    setRadiusServerConfig(initialRadiusServerConfig);
    setAllExpenses(initialExpenses);
    setAllBankAccounts(initialBankRekening);
    setQrisConfig(initialQRISConfig);
    setPaymentGatewayConfig(initialPaymentGatewayConfig);
    setAllTickets(initialTickets);
    setAllFiberCables(initialFiberCables);
    setAllActivityLogs(initialActivityLogs);
    setAllCommandQueue(initialCommandQueue);
  };

  const importFullDatabase = (payload: DatabaseBackupPayload): number => {
    if (!payload || !payload.data) return 0;
    const { data } = payload;
    let count = 0;
    if (Array.isArray(data.customers)) { setAllCustomers(data.customers); count += data.customers.length; }
    if (Array.isArray(data.packages)) { setPackages(data.packages); count += data.packages.length; }
    if (Array.isArray(data.invoices)) { setAllInvoices(data.invoices); count += data.invoices.length; }
    if (Array.isArray(data.nasList)) { setAllNasList(data.nasList); count += data.nasList.length; }
    if (Array.isArray(data.accounts)) { setAccounts(data.accounts); count += data.accounts.length; }
    if (Array.isArray(data.ftthOLTs)) { setAllFtthOLTs(data.ftthOLTs); count += data.ftthOLTs.length; }
    if (Array.isArray(data.ftthODPs)) { setAllFtthODPs(data.ftthODPs); count += data.ftthODPs.length; }
    if (Array.isArray(data.ftthONUs)) { setAllFtthONUs(data.ftthONUs); count += data.ftthONUs.length; }
    if (data.genieACSConfig) setGenieACSConfig(data.genieACSConfig);
    if (Array.isArray(data.tr069Devices)) { setAllTr069Devices(data.tr069Devices); count += data.tr069Devices.length; }
    if (Array.isArray(data.hotspotProfiles)) { setHotspotProfiles(data.hotspotProfiles); count += data.hotspotProfiles.length; }
    if (Array.isArray(data.hotspotVouchers)) { setAllHotspotVouchers(data.hotspotVouchers); count += data.hotspotVouchers.length; }
    if (Array.isArray(data.hotspotTemplates)) { setHotspotTemplates(data.hotspotTemplates); count += data.hotspotTemplates.length; }
    if (Array.isArray(data.vpnConfigs)) { setAllVpnConfigs(data.vpnConfigs); count += data.vpnConfigs.length; }
    if (data.radiusServerConfig) setRadiusServerConfig(data.radiusServerConfig);
    if (Array.isArray(data.expenses)) { setAllExpenses(data.expenses); count += data.expenses.length; }
    if (Array.isArray(data.bankAccounts)) { setAllBankAccounts(data.bankAccounts); count += data.bankAccounts.length; }
    if (data.qrisConfig) setQrisConfig(data.qrisConfig);
    if (data.paymentGatewayConfig) setPaymentGatewayConfig(data.paymentGatewayConfig);
    if (Array.isArray(data.tickets)) { setAllTickets(data.tickets); count += data.tickets.length; }
    if (Array.isArray(data.fiberCables)) { setAllFiberCables(data.fiberCables); count += data.fiberCables.length; }
    if (Array.isArray(data.activityLogs)) { setAllActivityLogs(data.activityLogs); count += data.activityLogs.length; }
    if (Array.isArray(data.commandQueue)) { setAllCommandQueue(data.commandQueue); count += data.commandQueue.length; }
    if (Array.isArray(data.templates)) setTemplates(data.templates);
    if (data.isolirConfig) setIsolirConfig(data.isolirConfig);
    if (data.paymentChannels) setPaymentChannels(data.paymentChannels);
    if (data.ispProfile) {
      setIspProfile(data.ispProfile);
      localStorage.setItem(STORAGE_KEYS.ISP_PROFILE, JSON.stringify(data.ispProfile));
    }
    if (Array.isArray(data.tenants) && data.tenants.length > 0) {
      setTenants(data.tenants);
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(data.tenants));
    }
    return count;
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        packages,
        invoices,
        nasList,
        activeSessions,
        templates,
        isolirConfig,
        paymentChannels,
        stats,
        
        theme,
        setTheme,
        toggleTheme,

        activeCategory,
        activeSubMenu,
        activeSubTab,
        setActiveSubTab,
        setNavigation,
        activeTab,
        setActiveTab,
        
        searchQuery,
        setSearchQuery,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedInvoiceId,
        setSelectedInvoiceId,

        currentUser,
        login,
        activateAccount,
        resendActivationCode,
        loginAsRole,
        logout,

        // Multi-Tenant / Cabang ISP
        tenants,
        currentTenant,
        currentTenantId,
        switchTenant,
        addTenant,
        updateTenant,
        upgradeTenantPlan,
        deleteTenant,
        allCustomers,
        allInvoices,
        allNasList,

        accounts,
        addAccount,
        updateAccount,
        deleteAccount,

        ftthOLTs,
        ftthODPs,
        ftthONUs,
        addOLT,
        updateOLT,
        deleteOLT,
        addODP,
        updateODP,
        deleteODP,
        addONU,
        updateONU,
        deleteONU,

        genieACSConfig,
        updateGenieACSConfig,
        testGenieACSConnection,
        tr069Devices,
        rebootTR069Device,
        updateTR069WiFi,

        hotspotProfiles,
        hotspotVouchers,
        hotspotTemplates,
        addHotspotProfile,
        updateHotspotProfile,
        deleteHotspotProfile,
        generateVoucherBatch,
        deleteVoucher,
        markVoucherUsed,
        addHotspotTemplate,
        updateHotspotTemplate,
        deleteHotspotTemplate,

        vpnConfigs,
        addVPN,
        toggleVPN,
        deleteVPN,
        radiusServerConfig,
        updateRadiusServerConfig,
        radiusServer,
        setRadiusServer,

        expenses,
        addExpense,
        deleteExpense,

        bankAccounts,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        toggleBankAccount,
        qrisConfig,
        updateQRISConfig,
        paymentGatewayConfig,
        updatePaymentGatewayConfig,

        tickets,
        addTicket,
        updateTicket,
        deleteTicket,
        addTicketLog,

        fiberCables,
        addFiberCable,
        updateFiberCable,
        deleteFiberCable,

        addCustomer,
        bulkImportCustomers,
        updateCustomer,
        deleteCustomer,
        isolateCustomer,
        unIsolateCustomer,

        addPackage,
        updatePackage,
        deletePackage,

        addNAS,
        updateNAS,
        deleteNAS,
        disconnectSession,
        disconnectCustomerSession,
        connectCustomerSession,
        pingRouter,

        generateMonthlyInvoices,
        payInvoice,
        deleteInvoice,
        createManualInvoice,

        runAutoIsolirScan,
        updateIsolirConfig,

        updateTemplate,
        sendWhatsAppMessage,
        getFormattedMessage,

        updatePaymentChannels,
        processIncomingAutoMutation,
        ispProfile,
        updateISPProfile,
        resetAllData,
        importFullDatabase,

        activityLogs,
        logActivity,
        clearActivityLogs,

        // Poin 5: MikroTik Offline Command Retry Queue & Spooler
        commandQueue,
        allCommandQueue,
        enqueueCommand,
        processQueue,
        retryCommand,
        cancelCommand,
        clearCompletedCommands,
        toggleRouterStatus,

        // Firebase Cloud Persistence
        cloudSyncStatus,
        lastCloudSync,
        isCloudReady,
        syncNowToCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

