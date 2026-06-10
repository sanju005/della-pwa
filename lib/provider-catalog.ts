import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "./supabase-env";
import { serviceOrder, type ProviderCategoryKey } from "./provider-catalog-shared";
export {
  buildCategoryBannerSrc,
  buildProviderDetailHref,
  buildProviderPortraitSrc,
  serviceOrder,
} from "./provider-catalog-shared";
export type { ProviderCategoryKey } from "./provider-catalog-shared";

type ProviderServiceSpecialtyRow = {
  specialty: string | null;
};

type ProviderVerificationRow = {
  email_verified: boolean | null;
};

type ProviderCatalogRow = {
  id: string;
  marketing_name: string | null;
  service_location: string | null;
  average_rating: number | null;
  total_reviews: number | null;
  bio: string | null;
  approval_status: string | null;
  provider_verifications: ProviderVerificationRow | ProviderVerificationRow[] | null;
  provider_services:
    | Array<{
        service_type: string;
        hourly_rate: number | null;
        daily_rate: number | null;
        years_experience: string | null;
        provider_service_specialties: ProviderServiceSpecialtyRow[] | null;
      }>
    | null;
};

export type ProviderListing = {
  id: string;
  name: string;
  providerName?: string;
  serviceKey: ProviderCategoryKey;
  serviceLabel: string;
  title: string;
  workMode: "Live-in" | "Part-time" | "Full-time";
  location: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  hourlyRate: number;
  dailyRate: number;
  yearsExperience: string;
  specialties: string[];
  bio: string;
  availabilityLabel: string;
  imageTone: string;
  isApproved: boolean;
};

export type ProviderCatalogData = {
  service: ProviderCategoryKey | null;
  serviceLabel: string;
  listings: ProviderListing[];
  errorMessage: string | null;
};

const serviceLabels: Record<ProviderCategoryKey, string> = {
  chef: "Chef",
  maid: "Maid",
  babysitter: "Babysitter",
  driver: "Driver",
  cleaner: "Cleaner",
  tutor: "Tutor",
  plumber: "Plumber",
  electrician: "Electrician",
};

const imageTones = [
  "bg-[linear-gradient(135deg,#3a2417_0%,#8f5a35_40%,#d6b089_100%)]",
  "bg-[linear-gradient(135deg,#d7c0a9_0%,#f2e7d9_45%,#8cb39a_100%)]",
  "bg-[linear-gradient(135deg,#d6c7b2_0%,#f0e3d7_45%,#9e8a72_100%)]",
  "bg-[linear-gradient(135deg,#d8e6db_0%,#f0f6ef_45%,#7aa884_100%)]",
  "bg-[linear-gradient(135deg,#20352b_0%,#2f7d4e_45%,#a7d7a9_100%)]",
];

function buildSupabasePublicClient() {
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

function isProviderCategoryKey(value: string): value is ProviderCategoryKey {
  return serviceOrder.includes(value as ProviderCategoryKey);
}

function humanizeService(serviceKey: ProviderCategoryKey) {
  return serviceLabels[serviceKey];
}

export const getProviderCatalog = cache(
  async (service: string | null): Promise<ProviderCatalogData> => {
    const serviceKey = service && isProviderCategoryKey(service) ? service : null;
    const supabase = buildSupabasePublicClient();

    if (!supabase) {
      return {
        service: serviceKey,
        serviceLabel: serviceKey ? humanizeService(serviceKey) : "All Providers",
        listings: [],
        errorMessage: "Supabase keys are not configured for provider listings yet.",
      };
    }

    const { data, error } = await supabase
      .from("provider_profiles")
      .select(
        `
          id,
          marketing_name,
          service_location,
          average_rating,
          total_reviews,
          bio,
          approval_status,
          provider_verifications (
            email_verified
          ),
          provider_services (
            service_type,
            hourly_rate,
            daily_rate,
            years_experience,
            provider_service_specialties (
              specialty
            )
          )
        `
      )
      .eq("is_visible", true)
      .order("average_rating", { ascending: false });

    const rows = (data ?? []) as ProviderCatalogRow[];

    const realListings = rows
      .flatMap((row, rowIndex) =>
        (row.provider_services ?? []).flatMap((serviceRow) => {
          if (!isProviderCategoryKey(serviceRow.service_type)) {
            return [];
          }

          if (serviceKey && serviceRow.service_type !== serviceKey) {
            return [];
          }

          const verificationRow = Array.isArray(row.provider_verifications)
            ? row.provider_verifications[0]
            : row.provider_verifications;

          return [
            {
              id: row.id,
              name: row.marketing_name ?? "DELLA Provider",
              serviceKey: serviceRow.service_type,
              serviceLabel: humanizeService(serviceRow.service_type),
              title: humanizeService(serviceRow.service_type),
              workMode: (["Live-in", "Part-time", "Full-time"][rowIndex % 3] ??
                "Full-time") as "Live-in" | "Part-time" | "Full-time",
              location: row.service_location ?? "Kuala Lumpur",
              distanceKm: [2.4, 1.8, 3.1, 2.7, 2.2, 4.0, 3.6, 2.9][rowIndex] ?? 2.5,
              rating: Number(row.average_rating ?? 4.8),
              reviews: row.total_reviews ?? 0,
              hourlyRate: Number(serviceRow.hourly_rate ?? 25),
              dailyRate: Number(serviceRow.daily_rate ?? 180),
              yearsExperience: serviceRow.years_experience ?? "New",
              specialties:
                serviceRow.provider_service_specialties
                  ?.map((item) => item.specialty)
                  .filter((item): item is string => Boolean(item))
                  .slice(0, 2) ?? [],
              bio: row.bio ?? "Trusted services available through DELLA.",
              availabilityLabel: "Available Today",
              imageTone: imageTones[rowIndex % imageTones.length],
              isApproved:
                row.approval_status === "approved" &&
                Boolean(verificationRow?.email_verified),
            } satisfies ProviderListing,
          ];
        })
      );

    if (!serviceKey) {
      return {
        service: null,
        serviceLabel: "All Providers",
        listings: realListings.slice(0, 24),
        errorMessage: error?.message ?? null,
      };
    }

    return {
      service: serviceKey,
      serviceLabel: humanizeService(serviceKey),
      listings: realListings,
      errorMessage: error?.message ?? null,
    };
  }
);
