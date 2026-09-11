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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Test connectivity to Firestore server
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system_tenants', 'connection_test'));
    return true;
  } catch (error) {
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
  const targetTenant = tenantId || 'tenant-masmedia';
  try {
    // Sanitize payload to prevent Firestore 1MB limits
    const sanitizedData = {
      ...data,
      activityLogs: Array.isArray(data.activityLogs) ? data.activityLogs.slice(-200) : [],
      commandQueue: Array.isArray(data.commandQueue) ? data.commandQueue.slice(-100) : [],
    };

    const payloadToSave = {
      payload: {
        ...sanitizedData,
        // Wrap with standard data container if needed
        data: sanitizedData.data ? sanitizedData.data : sanitizedData
      },
      lastSyncedAt: new Date().toISOString(),
      tenantId: targetTenant,
    };

    // Primary save: master production document
    const masterDocRef = doc(db, 'system_tenants', 'master_masmedia_production');
    await setDoc(masterDocRef, payloadToSave, { merge: true });

    // Secondary save: tenant-specific document
    if (targetTenant !== 'master_masmedia_production') {
      const tenantDocRef = doc(db, 'system_tenants', targetTenant);
      await setDoc(tenantDocRef, payloadToSave, { merge: true });
    }

    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `system_tenants/${targetTenant}`);
    return false;
  }
}

/**
 * Load app data snapshot from Cloud Firestore with fallback keys
 */
export async function loadFromCloudFirestore(tenantId?: string): Promise<any | null> {
  const candidateKeys = [
    tenantId,
    'master_masmedia_production',
    'tenant-masmedia',
    'default'
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
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `system_tenants/${key}`);
    }
  }

  return null;
}
