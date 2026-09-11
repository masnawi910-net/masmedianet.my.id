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
    errMsg.includes('resource-exhausted');

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
    if ((error as any)?.code === 'resource-exhausted' || errMsg.includes('Quota limit exceeded') || errMsg.includes('resource-exhausted')) {
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

/**
 * Persist app data snapshot to Cloud Firestore (with redundant fallback keys)
 */
export async function syncToCloudFirestore(tenantId: string, data: any): Promise<boolean> {
  if (isFirestoreQuotaExceeded()) {
    return false;
  }

  const targetTenant = tenantId || 'tenant-masmedia';
  try {
    // Sanitize payload to prevent Firestore 1MB limits
    const sanitizedData = {
      ...data,
      activityLogs: Array.isArray(data.activityLogs) ? data.activityLogs.slice(-100) : [],
      commandQueue: Array.isArray(data.commandQueue) ? data.commandQueue.slice(-50) : [],
      // Strip high-frequency volatile active sessions from cloud snapshots to save write quota
      activeSessions: [],
    };

    const payloadToSave = {
      payload: {
        ...sanitizedData,
        // Wrap with standard data container if needed
        data: sanitizedData.data ? sanitizedData.data : sanitizedData,
      },
      lastSyncedAt: new Date().toISOString(),
      tenantId: targetTenant,
    };

    // Save to target tenant document without duplicate double-writes
    const docKey = targetTenant === 'master_masmedia_production' ? 'master_masmedia_production' : targetTenant;
    const docRef = doc(db, 'system_tenants', docKey);
    await setDoc(docRef, payloadToSave, { merge: true });

    return true;
  } catch (err: any) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (err?.code === 'resource-exhausted' || errMsg.includes('Quota limit exceeded') || errMsg.includes('resource-exhausted')) {
      markFirestoreQuotaExceeded();
      return false;
    }
    handleFirestoreError(err, OperationType.WRITE, `system_tenants/${targetTenant}`);
    return false;
  }
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
          return payload;
        }
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (err?.code === 'resource-exhausted' || errMsg.includes('Quota limit exceeded') || errMsg.includes('resource-exhausted')) {
        markFirestoreQuotaExceeded();
        return null;
      }
      handleFirestoreError(err, OperationType.GET, `system_tenants/${key}`);
    }
  }

  return null;
}
