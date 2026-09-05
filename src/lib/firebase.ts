import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Fallback Default Environment Config
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigType = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

/**
 * Resolves active Firebase config:
 * 1. Checks localStorage for custom client configuration (White-Label)
 * 2. Falls back to .env variables
 */
export function getActiveFirebaseConfig(): { config: FirebaseConfigType; isCustom: boolean } {
  try {
    const saved = localStorage.getItem("CUSTOM_FIREBASE_CONFIG");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.projectId && parsed.apiKey) {
        return { config: parsed, isCustom: true };
      }
    }
  } catch (e) {
    console.warn("Failed to read custom Firebase config from storage:", e);
  }
  return { config: DEFAULT_FIREBASE_CONFIG, isCustom: false };
}

/**
 * Save custom client configuration and returns true if saved
 */
export function saveCustomFirebaseConfig(config: FirebaseConfigType): void {
  localStorage.setItem("CUSTOM_FIREBASE_CONFIG", JSON.stringify(config));
}

/**
 * Remove custom client config and revert to default env
 */
export function resetCustomFirebaseConfig(): void {
  localStorage.removeItem("CUSTOM_FIREBASE_CONFIG");
}

// Initialize active Firebase App
const { config: activeConfig } = getActiveFirebaseConfig();

const app = getApps().length === 0 
  ? initializeApp(activeConfig.apiKey ? activeConfig : DEFAULT_FIREBASE_CONFIG)
  : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Upload a File or Blob directly to Firebase Cloud Storage
 * Returns the public downloadable HTTPS URL
 */
export async function uploadFile(file: File | Blob, folderPath: string = 'uploads'): Promise<string> {
  const fileName = `${Date.now()}_${(file as File).name || 'file'}`;
  const fileRef = ref(storage, `${folderPath}/${fileName}`);
  const snapshot = await uploadBytes(fileRef, file);
  return await getDownloadURL(snapshot.ref);
}
