export function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    null
  );
}

export function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    null
  );
}

export function getSupabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    null
  );
}

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    null
  );
}

export function getFirebaseProjectId() {
  return process.env.FIREBASE_PROJECT_ID ?? null;
}

export function getFirebaseClientEmail() {
  return process.env.FIREBASE_CLIENT_EMAIL ?? null;
}

export function getFirebasePrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY ?? null;
}

export function getPublicFirebaseApiKey() {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? null;
}

export function getPublicFirebaseAuthDomain() {
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? null;
}

export function getPublicFirebaseProjectId() {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null;
}

export function getPublicFirebaseStorageBucket() {
  return process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? null;
}

export function getPublicFirebaseMessagingSenderId() {
  return process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? null;
}

export function getPublicFirebaseAppId() {
  return process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? null;
}

export function getPublicFirebaseVapidKey() {
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? null;
}
