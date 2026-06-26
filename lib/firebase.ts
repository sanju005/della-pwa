import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  isSupported,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

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
