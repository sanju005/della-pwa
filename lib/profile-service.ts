import "server-only";

import type {
  Address,
  Booking,
  CustomerProfile,
  PaymentHistoryItem,
  ProfileOverviewData,
  SettingGroup,
} from "./profile-types";
import {
  buildProviderDetailHref,
  buildProviderPortraitSrc,
  type ProviderCategoryKey,
} from "./provider-catalog";

const mockProfile: CustomerProfile = {
  firstName: "Sanju",
  lastName: "Kumar",
  sex: "Male",
  dateOfBirth: "15/04/1995",
  avatarUrl: "",
  email: "sanju@gmail.com",
  phoneNumber: "12-345 6789",
  countryCode: "+60",
  city: "Kuala Lumpur",
  region: "Malaysia",
  verified: true,
  completion: 80,
};

const paymentMethods = [
  { id: "cash", label: "Cash", type: "Cash", isDefault: true },
  { id: "online", label: "Online Payment", type: "Coming Soon", disabled: true },
];

const paymentHistory: PaymentHistoryItem[] = [];

const addresses: Address[] = [];

const bookings: Booking[] = [];

const settings: SettingGroup[] = [
  {
    title: "Account",
    items: [
      { id: "edit", label: "Edit Personal Information", icon: "user" },
      { id: "password", label: "Change Password", icon: "lock" },
      { id: "notifications", label: "Notification Settings", icon: "bell" },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "help", label: "Help & Support", icon: "help" },
      { id: "report", label: "Report an Issue", icon: "alert" },
      { id: "privacy", label: "Privacy Policy", icon: "privacy" },
      { id: "terms", label: "Terms & Conditions", icon: "terms" },
    ],
  },
  {
    title: "Account Actions",
    items: [
      { id: "delete", label: "Delete Account", icon: "trash", tone: "danger" },
      { id: "logout", label: "Logout", icon: "logout", tone: "danger" },
    ],
  },
];

export async function getProfileOverviewData(): Promise<ProfileOverviewData> {
  const favoriteProviders = await getFavoriteProviders();
  const totalPaid = paymentHistory.reduce((sum, item) => sum + item.amount, 0);
  const latestPayment = paymentHistory[0];

  return {
    profile: structuredClone(mockProfile),
    favoriteProviders,
    paymentMethods: structuredClone(paymentMethods),
    paymentSummary: {
      walletBalance: 120,
      companyPayable: 45,
      totalPaid,
      lastPaymentLabel: latestPayment
        ? `${latestPayment.serviceTitle} on ${new Intl.DateTimeFormat("en-MY", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(latestPayment.paidAt))}`
        : "No payment yet",
    },
    bookingSummary: {
      pending: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
    },
  };
}

export async function getEditableProfileData(): Promise<CustomerProfile> {
  return structuredClone(mockProfile);
}

export async function getSavedAddresses(): Promise<Address[]> {
  return structuredClone(addresses);
}

export async function getBookings(): Promise<Booking[]> {
  return structuredClone(bookings);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const allBookings = await getBookings();
  return allBookings.find((booking) => booking.id === id) ?? null;
}

export async function getProfileSettings(): Promise<SettingGroup[]> {
  return structuredClone(settings);
}

export async function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
  return structuredClone(paymentHistory);
}

export async function getFavoriteProviders() {
  return [];
}
