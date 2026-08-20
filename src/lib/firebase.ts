import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  getDocFromServer,
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';

// Default config matching provisioned Firebase Project
let firebaseConfig = {
  projectId: "gen-lang-client-0256570898",
  appId: "1:880656371189:web:078a01a5126ba1b4b6e4bc",
  apiKey: "AIzaSyAnkRrgssua26ujJsOYoC3oRrOYclacS00",
  authDomain: "gen-lang-client-0256570898.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-restobotiaautoma-7e372b32-b9e2-4338-89b4-17a16eb25f25",
  storageBucket: "gen-lang-client-0256570898.firebasestorage.app",
  messagingSenderId: "880656371189",
  oAuthClientId: "880656371189-fklfaepbqte1hp70bld31ik4neij1f56.apps.googleusercontent.com"
};

try {
  // @ts-ignore
  import('../../firebase-applet-config.json').then((module) => {
    if (module.default) {
      firebaseConfig = { ...firebaseConfig, ...module.default };
    }
  }).catch(() => {});
} catch {
  // fallback is ok
}

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Connectivity check test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is in offline cache mode.");
    }
    return false;
  }
}

// ----------------------------------------------------
// PERSISTENT API KEYS & SYSTEM SETTINGS STORAGE
// ----------------------------------------------------
const LOCAL_STORAGE_SETTINGS_KEY = 'resto_bot_app_settings_vault';

export interface PersistentAppSettings {
  geminiApiKey?: string;
  geminiModel?: string;
  metaVerifyToken?: string;
  metaAccessToken?: string;
  metaPhoneNumberId?: string;
  wompiPublicKey?: string;
  wompiPrivateKey?: string;
  stripePublishableKey?: string;
  googleOAuthClientId?: string;
  n8nWebhookBaseUrl?: string;
  lastUpdated?: string;
  [key: string]: any;
}

export async function saveAppSettingToFirestore(key: string, value: any): Promise<void> {
  try {
    // 1. Local storage instant cache
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    existing[key] = value;
    existing.lastUpdated = new Date().toISOString();
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(existing));

    // 2. Cloud Firestore storage for long-term safety
    await setDoc(doc(db, 'app_settings', key), {
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not save setting to Firestore, saved to localStorage cache:', err);
  }
}

export async function loadAppSettingsFromFirestore(): Promise<PersistentAppSettings> {
  const settings: PersistentAppSettings = {};
  
  // First load from localStorage cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (cached) {
      Object.assign(settings, JSON.parse(cached));
    }
  } catch (e) {
    console.warn('Error reading localStorage settings:', e);
  }

  // Then try to hydrate latest from Firestore
  try {
    const snap = await getDocs(collection(db, 'app_settings'));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      try {
        settings[docSnap.id] = JSON.parse(data.value);
      } catch {
        settings[docSnap.id] = data.value;
      }
    });
    // Update local cache
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Firestore settings fetch fallback to cached state:', err);
  }

  return settings;
}

// ----------------------------------------------------
// FIRESTORE ORDERS SYNC
// ----------------------------------------------------
export async function saveOrderToFirestore(order: any): Promise<void> {
  try {
    await setDoc(doc(db, 'orders', order.pedido_id || order.id), {
      ...order,
      syncedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error syncing order to Firestore:', err);
  }
}

export async function loadOrdersFromFirestore(): Promise<any[]> {
  try {
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(100));
    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach(d => results.push(d.data()));
    return results;
  } catch (err) {
    console.warn('Fallback loading orders from Firestore:', err);
    return [];
  }
}

// ----------------------------------------------------
// FIRESTORE CUSTOMERS CRM SYNC
// ----------------------------------------------------
export async function saveCustomerToFirestore(customer: any): Promise<void> {
  try {
    await setDoc(doc(db, 'customers', customer.id), {
      ...customer,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error syncing customer to Firestore:', err);
  }
}

export async function loadCustomersFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'customers'));
    const results: any[] = [];
    snap.forEach(d => results.push(d.data()));
    return results;
  } catch (err) {
    console.warn('Error loading customers from Firestore:', err);
    return [];
  }
}

// ----------------------------------------------------
// FIRESTORE CALENDAR EVENTS SYNC
// ----------------------------------------------------
export async function saveCalendarEventToFirestore(event: any): Promise<void> {
  try {
    await setDoc(doc(db, 'calendar_events', event.id), {
      ...event,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving calendar event to Firestore:', err);
  }
}

export async function loadCalendarEventsFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'calendar_events'));
    const results: any[] = [];
    snap.forEach(d => results.push(d.data()));
    return results;
  } catch (err) {
    console.warn('Error loading calendar events from Firestore:', err);
    return [];
  }
}
