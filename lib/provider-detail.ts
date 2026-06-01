import "server-only";

import { cache } from "react";
import {
  buildProviderDetailHref,
  getProviderCatalog,
  type ProviderCategoryKey,
  type ProviderListing,
} from "./provider-catalog";

type ProviderGalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

type ProviderAvailabilitySlot = {
  dayLabel: string;
  dateLabel: string;
  timeLabel: string;
  state: "available" | "booked";
};

export type ProviderDetail = ProviderListing & {
  href: string;
  profileImage: string;
  title: string;
  reviewsLabel: string;
  jobsCompleted: number;
  locationFull: string;
  online: boolean;
  verified: boolean;
  backgroundChecked: boolean;
  about: string;
  gallery: ProviderGalleryImage[];
  availability: ProviderAvailabilitySlot[];
};

const providerDescriptions: Record<ProviderCategoryKey, string> = {
  chef:
    "Passionate chef with years of experience preparing fresh meals for daily dining, special family gatherings, and private events. DELLA customers book this chef for trusted home cooking, flexible menus, and warm service.",
  maid:
    "Reliable maid focused on keeping homes comfortable, clean, and well-organized. Suitable for regular cleaning routines, laundry support, and calm day-to-day household care.",
  babysitter:
    "Caring babysitter experienced with babies, toddlers, and school-age children. Families choose this provider for safe routines, patient supervision, and dependable support.",
  driver:
    "Professional driver for airport transfers, city trips, school runs, and planned daily schedules. Known for punctual service, safe driving, and clear communication.",
  cleaner:
    "Detail-oriented cleaner for apartments, homes, and deeper weekend resets. DELLA users book this provider for neat results, flexible hours, and consistent service quality.",
  tutor:
    "Friendly tutor offering structured learning support, patient explanations, and practical study routines. Suitable for one-to-one sessions and steady weekly improvement.",
  plumber:
    "Experienced plumber available for urgent leaks, installation work, and repair visits. Chosen for responsive communication, practical solutions, and reliable workmanship.",
  electrician:
    "Certified electrician for home maintenance, new installations, and troubleshooting. DELLA customers use this provider for clear pricing, safe fixes, and careful service.",
};

const galleryCaptions: Record<ProviderCategoryKey, [string, string, string]> = {
  chef: [
    "Homemade with fresh ingredients",
    "Authentic flavors, made with love",
    "Perfect for every occasion",
  ],
  maid: [
    "Fresh spaces, carefully maintained",
    "Detailed cleaning for busy homes",
    "Comfort and order every visit",
  ],
  babysitter: [
    "Warm care in a safe routine",
    "Play, support, and attention",
    "Trusted help for family schedules",
  ],
  driver: [
    "Comfortable rides across the city",
    "Reliable transport for daily plans",
    "Safe and punctual travel support",
  ],
  cleaner: [
    "Spotless rooms, refreshed daily",
    "Deep cleaning with care",
    "Bright results you can feel",
  ],
  tutor: [
    "Focused lessons that build confidence",
    "Learning plans made simple",
    "Steady progress for every student",
  ],
  plumber: [
    "Fast fixes for urgent repairs",
    "Clean installation and maintenance",
    "Solutions that keep homes running",
  ],
  electrician: [
    "Safe electrical work for the home",
    "Lighting, sockets, and upgrades",
    "Professional service you can trust",
  ],
};

const specialtyDefaults: Record<ProviderCategoryKey, string[]> = {
  chef: ["Malay", "Arabic", "Western", "Indian", "Asian", "Healthy Meals"],
  maid: ["Cleaning", "Laundry", "Ironing", "Deep Cleaning", "Kitchen Care", "Weekly Service"],
  babysitter: ["Toddler Care", "Newborn Care", "Night Care", "Homework Help", "Meal Support", "School Pickup"],
  driver: ["Airport Pickup", "Hourly Driver", "Outstation", "School Runs", "Event Trips", "Errands"],
  cleaner: ["Deep Cleaning", "Vacuum", "Kitchen Cleaning", "Bathroom Care", "Move-in Reset", "Weekly Service"],
  tutor: ["Mathematics", "English", "Science", "Reading", "Homework Help", "Exam Prep"],
  plumber: ["Pipe Repair", "Leak Fix", "Installation", "Toilet Repair", "Kitchen Plumbing", "Emergency Callout"],
  electrician: ["Wiring", "Lighting", "Socket Repair", "Fan Installation", "Troubleshooting", "Home Upgrades"],
};

function titleForService(serviceKey: ProviderCategoryKey) {
  switch (serviceKey) {
    case "chef":
      return "Professional Chef";
    case "maid":
      return "Professional Maid";
    case "babysitter":
      return "Trusted Babysitter";
    case "driver":
      return "Personal Driver";
    case "cleaner":
      return "Home Cleaner";
    case "tutor":
      return "Private Tutor";
    case "plumber":
      return "Licensed Plumber";
    case "electrician":
      return "Certified Electrician";
  }
}

function providerMediaUrl(serviceKey: ProviderCategoryKey, kind: string) {
  return `/api/provider-media/${serviceKey}/${kind}`;
}

function buildAvailability(serviceKey: ProviderCategoryKey): ProviderAvailabilitySlot[] {
  const defaults: Record<ProviderCategoryKey, string[]> = {
    chef: ["10:00 AM - 8:00 PM", "10:00 AM - 8:00 PM", "10:00 AM - 6:00 PM", "Full Day Booked", "10:00 AM - 8:00 PM"],
    maid: ["9:00 AM - 6:00 PM", "9:00 AM - 6:00 PM", "8:00 AM - 5:00 PM", "Half Day Booked", "9:00 AM - 6:00 PM"],
    babysitter: ["8:00 AM - 5:00 PM", "10:00 AM - 8:00 PM", "10:00 AM - 6:00 PM", "Evening Booked", "8:00 AM - 6:00 PM"],
    driver: ["7:00 AM - 7:00 PM", "8:00 AM - 8:00 PM", "8:00 AM - 5:00 PM", "Full Day Booked", "7:00 AM - 7:00 PM"],
    cleaner: ["9:00 AM - 6:00 PM", "9:00 AM - 6:00 PM", "8:00 AM - 5:00 PM", "11:00 AM - 4:00 PM", "9:00 AM - 6:00 PM"],
    tutor: ["3:00 PM - 8:00 PM", "3:00 PM - 8:00 PM", "4:00 PM - 7:00 PM", "5:00 PM - 7:00 PM", "3:00 PM - 8:00 PM"],
    plumber: ["9:00 AM - 8:00 PM", "9:00 AM - 8:00 PM", "9:00 AM - 6:00 PM", "Emergency Only", "9:00 AM - 8:00 PM"],
    electrician: ["9:00 AM - 8:00 PM", "9:00 AM - 8:00 PM", "9:00 AM - 6:00 PM", "Half Day Booked", "9:00 AM - 8:00 PM"],
  };

  const days = [
    ["Today", "Jun 1"],
    ["Mon", "Jun 2"],
    ["Tue", "Jun 3"],
    ["Wed", "Jun 4"],
    ["Thu", "Jun 5"],
  ] as const;

  return days.map(([dayLabel, dateLabel], index) => {
    const timeLabel = defaults[serviceKey][index] ?? "10:00 AM - 6:00 PM";
    return {
      dayLabel,
      dateLabel,
      timeLabel,
      state: timeLabel.toLowerCase().includes("booked") ? "booked" : "available",
    };
  });
}

function mergeSpecialties(listing: ProviderListing) {
  const combined = [...listing.specialties, ...specialtyDefaults[listing.serviceKey]];
  return [...new Set(combined)].slice(0, 6);
}

function buildDetailFromListing(listing: ProviderListing): ProviderDetail {
  const captions = galleryCaptions[listing.serviceKey];

  return {
    ...listing,
    href: buildProviderDetailHref(listing),
    title: titleForService(listing.serviceKey),
    profileImage: providerMediaUrl(listing.serviceKey, "portrait"),
    reviewsLabel: `${listing.rating.toFixed(1)} (${listing.reviews} reviews)`,
    jobsCompleted: Math.max(listing.reviews, 12),
    locationFull: `${listing.location}, Malaysia`,
    online: true,
    verified: true,
    backgroundChecked: true,
    about: providerDescriptions[listing.serviceKey],
    specialties: mergeSpecialties(listing),
    gallery: [
      {
        src: providerMediaUrl(listing.serviceKey, "gallery-1"),
        alt: `${listing.name} gallery image 1`,
        caption: captions[0],
      },
      {
        src: providerMediaUrl(listing.serviceKey, "gallery-2"),
        alt: `${listing.name} gallery image 2`,
        caption: captions[1],
      },
      {
        src: providerMediaUrl(listing.serviceKey, "gallery-3"),
        alt: `${listing.name} gallery image 3`,
        caption: captions[2],
      },
    ],
    availability: buildAvailability(listing.serviceKey),
  };
}

export const getProviderDetail = cache(
  async (id: string, service: string | null): Promise<ProviderDetail | null> => {
    const scopedCatalog = await getProviderCatalog(service);
    const scopedMatch = scopedCatalog.listings.find((listing) => listing.id === id);

    if (scopedMatch) {
      return buildDetailFromListing(scopedMatch);
    }

    const allCatalog = await getProviderCatalog(null);
    const fallbackMatch = allCatalog.listings.find((listing) => listing.id === id);

    if (!fallbackMatch) {
      return null;
    }

    return buildDetailFromListing(fallbackMatch);
  }
);
