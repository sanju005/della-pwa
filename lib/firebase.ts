import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  isSupported,
  type Messaging,
} from "firebase/messaging";

declare global {
  interface Window {
    __DELLA_PUBLIC_CONFIG?: {
      supabaseUrl?: string | null;
      supabasePublishableKey?: string | null;
      appBaseUrl?: string | null;
      firebaseApiKey?: string | null;
      firebaseAuthDomain?: string | null;
      firebaseProjectId?: string | null;
      firebaseStorageBucket?: string | null;
      firebaseMessagingSenderId?: string | null;
      firebaseAppId?: string | null;
    };
  }
}

function getRuntimeFirebaseConfig() {
  if (typeof window !== "undefined" && window.__DELLA_PUBLIC_CONFIG) {
    return {
      apiKey: window.__DELLA_PUBLIC_CONFIG.firebaseApiKey ?? "",
      authDomain: window.__DELLA_PUBLIC_CONFIG.firebaseAuthDomain ?? "",
      projectId: window.__DELLA_PUBLIC_CONFIG.firebaseProjectId ?? "",
      storageBucket: window.__DELLA_PUBLIC_CONFIG.firebaseStorageBucket ?? "",
      messagingSenderId:
        window.__DELLA_PUBLIC_CONFIG.firebaseMessagingSenderId ?? "",
      appId: window.__DELLA_PUBLIC_CONFIG.firebaseAppId ?? "",
    };
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

const firebaseConfig = getRuntimeFirebaseConfig();

export function getFirebaseClientConfig() {
  return firebaseConfig;
}

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported().catch((error) => {
    console.error("[FCM] Messaging support check failed:", error);
    return false;
  });

  if (!supported) {
    console.warn("[FCM] Firebase messaging is not supported in this browser.");
    return null;
  }

  return getMessaging(firebaseApp);
}
