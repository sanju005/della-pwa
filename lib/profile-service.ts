import "server-only";

import type {
  Address,
  Booking,
  CustomerProfile,
  ProfileOverviewData,
  SettingGroup,
} from "./profile-types";

const mockProfile: CustomerProfile = {
  firstName: "Sanju",
  lastName: "Kumar",
  dateOfBirth: "15/04/1995",
  email: "sanju@gmail.com",
  phoneNumber: "12-345 6789",
  countryCode: "+60",
  city: "Kuala Lumpur",
  region: "Malaysia",
  verified: true,
  completion: 80,
};

const favoriteProviders = [
  {
    id: "chef-amina",
    name: "Chef Amina",
    role: "Chef",
    initials: "CA",
    accent: "from-emerald-500 to-green-700",
  },
  {
    id: "maid-siti",
    name: "Maid Siti",
    role: "Cleaning",
    initials: "MS",
    accent: "from-teal-500 to-emerald-700",
  },
  {
    id: "driver-kumar",
    name: "Driver Kumar",
    role: "Driver",
    initials: "DK",
    accent: "from-sky-500 to-slate-700",
  },
];

const paymentMethods = [
  { id: "cash", label: "Cash", type: "Cash", isDefault: true },
  { id: "fpx", label: "Online Payment", type: "Card / FPX" },
];

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

const bookings: Booking[] = [
  {
    id: "booking-1",
    service: "Chef Service",
    provider: "Ex Chef Amina",
    schedule: "20 May 2024, 10:00 AM",
    location: "Kajang, Selangor",
    status: "upcoming",
    statusLabel: "Confirmed",
    badgeTone: "green",
    thumbnail: "food",
  },
  {
    id: "booking-2",
    service: "Maid Service",
    provider: "Maid Siti",
    schedule: "22 May 2024, 02:00 PM",
    location: "Kuala Lumpur",
    status: "upcoming",
    statusLabel: "Pending",
    badgeTone: "amber",
    thumbnail: "cleaning",
  },
  {
    id: "booking-3",
    service: "Driver Service",
    provider: "Driver Kumar",
    schedule: "25 May 2024, 09:00 AM",
    location: "Kuala Lumpur",
    status: "completed",
    statusLabel: "Confirmed",
    badgeTone: "green",
    thumbnail: "car",
  },
];

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
  return {
    profile: structuredClone(mockProfile),
    favoriteProviders: structuredClone(favoriteProviders),
    paymentMethods: structuredClone(paymentMethods),
    bookingSummary: {
      upcoming: 3,
      completed: 12,
      cancelled: 2,
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

export async function getProfileSettings(): Promise<SettingGroup[]> {
  return structuredClone(settings);
}
