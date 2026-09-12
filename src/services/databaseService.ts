import { doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { db } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Circuit breaker for Firestore free tier quota exhaustion (20,000 writes/day)
const QUOTA_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown
let quotaExhaustedUntil: number = 0;

export function isFirestoreQuotaExceeded(): boolean {
  if (quotaExhaustedUntil > Date.now()) {
    return true;
  }
  try {
    const stored = sessionStorage.getItem('firestore_quota_exhausted_until');
    if (stored) {
      const exp = Number(stored);
      if (exp > Date.now()) {
        quotaExhaustedUntil = exp;
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

export function markFirestoreQuotaExceeded(cooldownMs: number = QUOTA_COOLDOWN_MS): void {
  quotaExhaustedUntil = Date.now() + cooldownMs;
  try {
    sessionStorage.setItem('firestore_quota_exhausted_until', String(quotaExhaustedUntil));
  } catch {
    // ignore
  }
  console.warn(
    `[CloudSync] Kuota Firestore gratis harian (free tier write quota) tercapai. Sinkronisasi cloud ditunda hingga ${new Date(
      quotaExhaustedUntil
    ).toLocaleTimeString('id-ID')}. Aplikasi otomatis beralih menggunakan IndexedDB & LocalStorage lokal dengan aman tanpa kendala.`
  );
}

export function resetFirestoreQuotaCooldown(): void {
  quotaExhaustedUntil = 0;
  try {
    sessionStorage.removeItem('firestore_quota_exhausted_until');
  } catch {
    // ignore
  }
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuota =
    (error as any)?.code === 'resource-exhausted' ||
    errMsg.includes('Quota limit exceeded') ||
    errMsg.includes('resource-exhausted') ||
    errMsg.includes('Write stream exhausted') ||
    errMsg.includes('maximum allowed queued writes') ||
    errMsg.includes('maximum backoff delay');

  if (isQuota) {
    markFirestoreQuotaExceeded();
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };

  if (!isQuota) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  return errInfo;
}

/**
 * Test connectivity to Firestore server
 */
export async function testConnection(): Promise<boolean> {
  if (isFirestoreQuotaExceeded()) {
    return false;
  }
  try {
    await getDocFromServer(doc(db, 'system_tenants', 'connection_test'));
    return true;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (
      (error as any)?.code === 'resource-exhausted' ||
      errMsg.includes('Quota limit exceeded') ||
      errMsg.includes('resource-exhausted') ||
      errMsg.includes('Write stream exhausted') ||
      errMsg.includes('maximum allowed queued writes') ||
      errMsg.includes('maximum backoff delay')
    ) {
      markFirestoreQuotaExceeded();
      return false;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: client is offline");
    }
    return false;
  }
}

/**
 * Database Persistence and Backup Service
 * Manages full database state persistence, JSON import/export, IndexedDB sync, and Firebase Firestore Cloud sync
 */

export interface DatabaseBackupPayload {
  version: string;
  exportedAt: string;
  appName: string;
  data: {
    customers: any[];
    packages: any[];
    invoices: any[];
    nasList: any[];
    activeSessions: any[];
    templates: any[];
    isolirConfig: any;
    paymentChannels: any;
    accounts: any[];
    ftthOLTs: any[];
    ftthODPs: any[];
    ftthONUs: any[];
    genieACSConfig: any;
    tr069Devices: any[];
    hotspotProfiles: any[];
    hotspotVouchers: any[];
    hotspotTemplates: any[];
    vpnConfigs: any[];
    radiusServerConfig: any;
    expenses: any[];
    bankAccounts: any[];
    qrisConfig: any;
    paymentGatewayConfig: any;
    tickets: any[];
    fiberCables: any[];
    activityLogs?: any[];
    commandQueue?: any[];
    ispProfile?: any;
    tenants?: any[];
  };
}

export interface DatabaseMetrics {
  totalRecords: number;
  customersCount: number;
  invoicesCount: number;
  packagesCount: number;
  nasCount: number;
  vouchersCount: number;
  ftthCount: number;
  ticketsCount: number;
  expensesCount: number;
  estimatedSizeKb: number;
  lastSavedAt: string;
  storageType: 'LocalStorage + IndexedDB + Cloud Firestore';
}

const DB_NAME = 'MasmediaMikroTikRadiusDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';

// Helper to open IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => {
      resolve((e.target as IDBOpenDBRequest).result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save snapshot of all state to IndexedDB for high durability
 */
export async function saveToIndexedDB(key: string, data: any): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: key, payload: data, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[DatabaseService] IndexedDB sync skipped or not available:', err);
  }
}

/**
 * Trigger browser download of full JSON database backup
 */
export function downloadDatabaseBackup(payload: DatabaseBackupPayload) {
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  
  a.href = url;
  a.download = `masmedia_database_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read and parse JSON backup file from user input
 */
export function parseDatabaseBackupFile(file: File): Promise<DatabaseBackupPayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.data || typeof parsed.data !== 'object') {
          throw new Error('Format file backup tidak valid. Objek data tidak ditemukan.');
        }
        resolve(parsed as DatabaseBackupPayload);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Gagal membaca file JSON backup'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membuka file backup'));
    reader.readAsText(file);
  });
}

// Rate limiting and in-flight write mutex to prevent write-stream overflow and backend contention
let activeWritePromise: Promise<boolean> | null = null;
let lastWriteTimestamp = 0;
const MIN_WRITE_INTERVAL_MS = 6000; // Minimum 6s between Firestore document writes
let lastPersistedFingerprint = '';

/**
 * Fast deterministic string hashing (djb2)
 */
function fastHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Computes a fingerprint of core business data, stripping volatile runtime values
 * (such as CPU load, router ping, volatile timestamps) to eliminate redundant Firestore writes.
 */
export function computeBusinessDataFingerprint(data: any): string {
  if (!data) return '';
  const core = data.data || data;

  const summary = {
    c: (core.customers || []).map((c: any) => `${c.id}:${c.status}:${c.packageId}:${c.ipAddress}:${c.balance || 0}`).join('|'),
    i: (core.invoices || []).map((i: any) => `${i.id}:${i.status}:${i.totalAmount}:${i.paidAt || ''}`).join('|'),
    p: (core.packages || []).map((p: any) => `${p.id}:${p.name}:${p.price}:${p.speedDown}:${p.speedUp}`).join('|'),
    n: (core.nasList || []).map((n: any) => `${n.id}:${n.name}:${n.ipAddress}:${n.status}:${n.apiPort}`).join('|'),
    f_olt: (core.ftthOLTs || []).length,
    f_odp: (core.ftthODPs || []).length,
    f_onu: (core.ftthONUs || []).length,
    h_prf: (core.hotspotProfiles || []).length,
    h_vch: (core.hotspotVouchers || []).length,
    exp: (core.expenses || []).length,
    tck: (core.tickets || []).length,
    acc: (core.accounts || []).length,
    isp: core.ispProfile ? `${core.ispProfile.companyName}:${core.ispProfile.email}:${core.ispProfile.phone}` : '',
    qris: core.qrisConfig ? `${core.qrisConfig.merchantName}:${core.qrisConfig.isActive}` : '',
    isolir: core.isolirConfig ? `${core.isolirConfig.autoIsolirEnabled}:${core.isolirConfig.isolirProfile}` : '',
  };

  return fastHash(JSON.stringify(summary));
}

export function setLastPersistedFingerprint(data: any): void {
  lastPersistedFingerprint = computeBusinessDataFingerprint(data);
}

/**
 * Persist app data snapshot to Cloud Firestore (with redundant fallback keys and anti-exhaustion safeguards)
 */
export async function syncToCloudFirestore(tenantId: string, data: any, force = false): Promise<boolean> {
  if (isFirestoreQuotaExceeded() && !force) {
    return false;
  }

  // Compute business data fingerprint
  const currentFingerprint = computeBusinessDataFingerprint(data);
  if (!force && lastPersistedFingerprint && currentFingerprint === lastPersistedFingerprint) {
    // Data is identical, skip writing to Firestore to preserve stream queue and daily write limits
    return true;
  }

  // Check rate limit interval
  const now = Date.now();
  if (!force && now - lastWriteTimestamp < MIN_WRITE_INTERVAL_MS) {
    return true;
  }

  // If another write is actively in progress, wait for it before starting
  if (activeWritePromise) {
    try {
      await activeWritePromise;
    } catch {
      // ignore
    }
  }

  const targetTenant = tenantId || 'tenant-masmedia';

  const executeWrite = async (): Promise<boolean> => {
    try {
      // Sanitize payload to prevent Firestore 1MB limits
      const sanitizedData = {
        ...data,
        activityLogs: Array.isArray(data.activityLogs) ? data.activityLogs.slice(-100) : [],
        commandQueue: Array.isArray(data.commandQueue) ? data.commandQueue.slice(-50) : [],
        // Strip volatile active sessions from cloud snapshots
        activeSessions: [],
      };

      const payloadToSave = {
        payload: {
          ...sanitizedData,
          data: sanitizedData.data ? sanitizedData.data : sanitizedData,
        },
        lastSyncedAt: new Date().toISOString(),
        tenantId: targetTenant,
      };

      const docKey = targetTenant === 'master_masmedia_production' ? 'master_masmedia_production' : targetTenant;
      const docRef = doc(db, 'system_tenants', docKey);

      // 12-second timeout to prevent hung write streams from jamming the SDK queue
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore write timeout (12s exceeded)')), 12000)
      );

      await Promise.race([
        setDoc(docRef, payloadToSave, { merge: true }),
        timeoutPromise,
      ]);

      lastWriteTimestamp = Date.now();
      lastPersistedFingerprint = currentFingerprint;
      return true;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isResourceExhausted =
        err?.code === 'resource-exhausted' ||
        errMsg.includes('resource-exhausted') ||
        errMsg.includes('Write stream exhausted') ||
        errMsg.includes('maximum allowed queued writes') ||
        errMsg.includes('Quota limit exceeded') ||
        errMsg.includes('maximum backoff delay');

      if (isResourceExhausted) {
        markFirestoreQuotaExceeded(15 * 60 * 1000); // 15-minute cooldown
        console.warn(
          '[CloudSync] Batas antrean write stream Firestore tercapai (resource-exhausted). Penyimpanan dialihkan ke IndexedDB & LocalStorage lokal.'
        );
        return false;
      }
      handleFirestoreError(err, OperationType.WRITE, `system_tenants/${targetTenant}`);
      return false;
    } finally {
      activeWritePromise = null;
    }
  };

  activeWritePromise = executeWrite();
  return activeWritePromise;
}

/**
 * Load app data snapshot from Cloud Firestore with fallback keys
 */
export async function loadFromCloudFirestore(tenantId?: string): Promise<any | null> {
  if (isFirestoreQuotaExceeded()) {
    return null;
  }

  const candidateKeys = [
    tenantId,
    'master_masmedia_production',
    'tenant-masmedia',
    'default',
  ].filter((k): k is string => Boolean(k));

  // Deduplicate keys
  const uniqueKeys = Array.from(new Set(candidateKeys));

  for (const key of uniqueKeys) {
    try {
      const docRef = doc(db, 'system_tenants', key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        const payload = rawData?.payload;
        if (payload) {
          console.info(`[CloudFirestore] Berhasil memuat data tersimpan dari key: ${key}`);
          setLastPersistedFingerprint(payload);
          return payload;
        }
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isResourceExhausted =
        err?.code === 'resource-exhausted' ||
        errMsg.includes('resource-exhausted') ||
        errMsg.includes('Write stream exhausted') ||
        errMsg.includes('maximum allowed queued writes') ||
        errMsg.includes('Quota limit exceeded') ||
        errMsg.includes('maximum backoff delay');

      if (isResourceExhausted) {
        markFirestoreQuotaExceeded(15 * 60 * 1000);
        return null;
      }
      handleFirestoreError(err, OperationType.GET, `system_tenants/${key}`);
    }
  }

  return null;
}
