import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, memoryLocalCache, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database with memoryLocalCache to prevent write queue overflow across reloads
let dbInstance: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId) {
    dbInstance = initializeFirestore(app, {
      localCache: memoryLocalCache(),
    }, firebaseConfig.firestoreDatabaseId);
  } else {
    dbInstance = initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });
  }
} catch {
  // If already initialized, fallback gracefully
  try {
    if (firebaseConfig.firestoreDatabaseId) {
      dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      dbInstance = getFirestore(app);
    }
  } catch {
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export { app };

