import "server-only";

import type {
  Address,
  Booking,
  CustomerProfile,
  PaymentHistoryItem,
  ProfileOverviewData,
  SettingGroup,
} from "./profile-types";
import { listCustomerBookings } from "./customer-booking-storage";
import {
  buildProviderDetailHref,
  buildProviderPortraitSrc,
  getProviderCatalog,
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
];

const paymentHistory: PaymentHistoryItem[] = [];

const addresses: Address[] = [
  {
    id: "home",
    label: "Home",
    line1: "No. 123, Jalan Mutiara 4,",
    line2: "Taman Mutiara, 43000",
    city: "Kajang",
    state: "Selangor",
    isDefault: true,
    kind: "home",
  },
  {
    id: "office",
    label: "Office",
    line1: "Level 10, Menara KL,",
    line2: "Jalan P. Ramlee, 50250",
    city: "Kuala Lumpur",
    state: "",
    kind: "office",
  },
  {
    id: "other",
    label: "Other",
    line1: "No. 45, Jalan 1/2,",
    line2: "Bandar Putra, 81000",
    city: "Johor Bahru",
    state: "Johor",
    kind: "other",
  },
];

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
  const storedBookings = await listCustomerBookings();
  const favoriteProviders = await getFavoriteProviders();
  const totalPaid = paymentHistory.reduce((sum, item) => sum + item.amount, 0);
  const latestPayment = paymentHistory[0];

  return {
    profile: structuredClone(mockProfile),
    favoriteProviders,
    paymentMethods: structuredClone(paymentMethods),
    paymentSummary: {
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
      pending: storedBookings.filter((booking) => booking.status === "pending").length,
      ongoing: storedBookings.filter((booking) => booking.status === "confirmed").length,
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
  const storedBookings = await listCustomerBookings();

  if (storedBookings.length === 0) {
    return structuredClone(bookings);
  }

  return storedBookings.map((booking) => ({
    ...(function () {
      const serviceKey = booking.serviceKey as ProviderCategoryKey;
      return {
        id: booking.id,
        service: `${booking.serviceLabel} Service`,
        provider: booking.providerName,
        schedule: `${booking.dateLabel}, ${booking.timeLabel}`,
        location: booking.location,
        status:
          booking.status === "pending"
            ? "pending"
            : "ongoing",
        statusLabel:
          booking.status === "pending"
            ? "Request Sent"
            : "Confirmed",
        badgeTone:
          booking.status === "pending"
            ? "amber"
            : "green",
        thumbnail:
          serviceKey === "chef"
            ? "food"
            : serviceKey === "driver"
              ? "car"
              : "cleaning",
        imageSrc: buildProviderPortraitSrc({
          name: booking.providerName,
          serviceKey,
        }),
        paymentAmount: booking.totalAmount,
        paymentMethod: "Cash",
        notes: booking.notes,
        activitySteps:
          booking.status === "pending"
            ? [
                { label: "Request Sent", status: "current" },
                { label: "On the way", status: "pending" },
                { label: "Arrived", status: "pending" },
                { label: "Task Completed", status: "pending" },
                { label: "Payment Done", status: "pending" },
              ]
            : [
                { label: "Request Sent", status: "done" },
                { label: "Confirmed", status: "done" },
                { label: "On the way", status: "current" },
                { label: "Arrived", status: "pending" },
                { label: "Task Completed", status: "pending" },
                { label: "Payment Done", status: "pending" },
              ],
      } satisfies Booking;
    })(),
  }));
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
  const catalog = await getProviderCatalog(null);

  return catalog.listings.slice(0, 5).map((provider, index) => ({
    id: provider.id,
    name: provider.name,
    role: provider.serviceLabel,
    initials: provider.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join(""),
    accent:
      [
        "from-emerald-500 to-green-700",
        "from-teal-500 to-emerald-700",
        "from-sky-500 to-slate-700",
        "from-orange-500 to-amber-700",
        "from-violet-500 to-fuchsia-700",
      ][index % 5] ?? "from-emerald-500 to-green-700",
    serviceKey: provider.serviceKey,
    rating: provider.rating,
    priceLabel: `RM${provider.hourlyRate}`,
    portraitSrc: buildProviderPortraitSrc({
      name: provider.name,
      serviceKey: provider.serviceKey,
    }),
    bookHref: `${buildProviderDetailHref({
      id: provider.id,
      serviceKey: provider.serviceKey,
    })}/book?service=${provider.serviceKey}`,
  }));
}
