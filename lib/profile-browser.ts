"use client";

import { getSupabaseClient } from "./supabase";
import type { CustomerProfile } from "./profile-types";

const PROFILE_STORAGE_KEY = "della.customer.profile";

export function loadStoredCustomerProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CustomerProfile;
  } catch {
    return null;
  }
}

export async function saveCustomerProfile(profile: CustomerProfile) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }

  const client = getSupabaseClient();
  if (!client) {
    return { mode: "local" as const };
  }

  try {
    await client.from("customer_profiles").upsert({
      id: "demo-customer",
      first_name: profile.firstName,
      last_name: profile.lastName,
      date_of_birth: profile.dateOfBirth,
      email: profile.email,
      phone_number: profile.phoneNumber,
      country_code: profile.countryCode,
      city: profile.city,
      region: profile.region,
      verified: profile.verified,
      completion: profile.completion,
      updated_at: new Date().toISOString(),
    });

    return { mode: "supabase" as const };
  } catch {
    return { mode: "local" as const };
  }
}
