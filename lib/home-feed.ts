import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "./supabase-env";

type HomeCustomerRow = {
  id: string;
  full_name: string | null;
  customer_profiles:
    | {
        city: string | null;
        state: string | null;
      }
    | Array<{
        city: string | null;
        state: string | null;
      }>
    | null;
};

type ProviderServiceSpecialtyRow = {
  specialty: string | null;
};

type HomeProviderRow = {
  id: string;
  marketing_name: string | null;
  service_location: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  provider_services:
    | Array<{
        service_type: string;
        hourly_rate: number | null;
        provider_service_specialties: ProviderServiceSpecialtyRow[] | null;
      }>
    | null;
};

type UpcomingBookingRow = {
  id: string;
  booking_status: string;
  scheduled_date: string | null;
  scheduled_start_time: string | null;
  provider_profiles:
    | {
        marketing_name: string | null;
      }
    | Array<{
        marketing_name: string | null;
      }>
    | null;
  provider_services:
    | {
        service_type: string;
      }
    | Array<{
        service_type: string;
      }>
    | null;
};

export type HomeServiceCategory = {
  key: string;
  label: string;
};

export type HomeProviderCard = {
  id: string;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  priceLabel: string;
  statusLabel: string;
  specialties: string[];
};

export type HomeUpcomingBooking = {
  id: string;
  title: string;
  provider: string;
  scheduleLabel: string;
  statusLabel: string;
};

export type HomeFeedData = {
  greetingName: string;
  locationLabel: string;
  categories: HomeServiceCategory[];
  popularProviders: HomeProviderCard[];
  upcomingBooking: HomeUpcomingBooking | null;
  errorMessage: string | null;
};

const serviceLabels: Record<string, string> = {
  chef: "Chef",
  maid: "Maid",
  tutor: "Tutor",
  driver: "Driver",
  cleaner: "Cleaner",
  babysitter: "Babysitter",
  plumber: "Plumber",
  electrician: "Electrician",
  other: "Other",
};

const serviceOrder = [
  "chef",
  "maid",
  "babysitter",
  "driver",
  "cleaner",
  "tutor",
  "plumber",
  "electrician",
] as const;

function humanizeService(serviceType: string) {
  return serviceLabels[serviceType] ?? serviceType;
}

function buildAdminSupabaseClient() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function buildPublicSupabaseClient() {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    return null;
  }

  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function formatSchedule(dateValue: string | null, timeValue: string | null) {
  if (!dateValue) {
    return "Upcoming booking";
  }

  const date = new Date(`${dateValue}T${timeValue ?? "09:00:00"}`);

  return new Intl.DateTimeFormat("en-MY", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getProviderNode<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export const getHomeFeedData = cache(async (): Promise<HomeFeedData> => {
  const adminSupabase = buildAdminSupabaseClient();
  const publicSupabase = buildPublicSupabaseClient();

  if (!adminSupabase || !publicSupabase) {
    return {
      greetingName: "Guest",
      locationLabel: "Kuala Lumpur",
      categories: serviceOrder.map((key) => ({
        key,
        label: humanizeService(key),
      })),
      popularProviders: [],
      upcomingBooking: null,
      errorMessage: "Supabase keys are not configured for the home feed yet.",
    };
  }

  const [customerResult, providerResult, bookingResult] = await Promise.all([
    adminSupabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          customer_profiles (
            city,
            state
          )
        `
      )
      .eq("role", "customer")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    publicSupabase
      .from("provider_profiles")
      .select(
        `
          id,
          marketing_name,
          service_location,
          average_rating,
          total_reviews,
          provider_services (
            service_type,
            hourly_rate,
            provider_service_specialties (
              specialty
            )
          )
        `
      )
      .eq("approval_status", "approved")
      .eq("is_visible", true)
      .order("average_rating", { ascending: false })
      .limit(8),
    adminSupabase
      .from("bookings")
      .select(
        `
          id,
          booking_status,
          scheduled_date,
          scheduled_start_time,
          provider_profiles (
            marketing_name
          ),
          provider_services (
            service_type
          )
        `
      )
      .in("booking_status", ["pending", "accepted", "scheduled", "in_progress"])
      .order("scheduled_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const customerRow = customerResult.data as HomeCustomerRow | null;
  const customerProfile = getProviderNode(customerRow?.customer_profiles);

  const providers = ((providerResult.data ?? []) as HomeProviderRow[]).map(
    (provider, index) => {
      const firstService = provider.provider_services?.[0];
      const specialties =
        firstService?.provider_service_specialties
          ?.map((item) => item.specialty)
          .filter((item): item is string => Boolean(item))
          .slice(0, 2) ?? [];

      const distanceKm = [2.4, 1.8, 3.1, 2.7, 2.2, 4.0, 3.6, 2.9][index] ?? 2.5;

      return {
        id: provider.id,
        name: provider.marketing_name ?? "DELLA Provider",
        service: humanizeService(firstService?.service_type ?? "other"),
        rating: Number(provider.average_rating ?? 4.8),
        reviews: provider.total_reviews ?? 0,
        distanceKm,
        priceLabel: `RM${Number(firstService?.hourly_rate ?? 25)}/hr`,
        statusLabel: "Available Today",
        specialties,
      };
    }
  );

  const bookingRow = bookingResult.data as UpcomingBookingRow | null;
  const bookingProvider = getProviderNode(bookingRow?.provider_profiles);
  const bookingService = getProviderNode(bookingRow?.provider_services);

  return {
    greetingName: customerRow?.full_name ?? "Rajeeethan",
    locationLabel:
      [customerProfile?.city, customerProfile?.state]
        .filter(Boolean)
        .join(", ") || "Setapak, Kuala Lumpur",
    categories: serviceOrder.map((key) => ({
      key,
      label: humanizeService(key),
    })),
    popularProviders: providers,
    upcomingBooking: bookingRow
      ? {
          id: bookingRow.id,
          title: humanizeService(bookingService?.service_type ?? "other"),
          provider: bookingProvider?.marketing_name ?? "DELLA Provider",
          scheduleLabel: formatSchedule(
            bookingRow.scheduled_date,
            bookingRow.scheduled_start_time
          ),
          statusLabel:
            bookingRow.booking_status === "pending" ? "Pending" : "Confirmed",
        }
      : null,
    errorMessage:
      customerResult.error?.message ??
      providerResult.error?.message ??
      bookingResult.error?.message ??
      null,
  };
});
