export type CustomerProfile = {
  firstName: string;
  lastName: string;
  sex: "" | "Male" | "Female";
  dateOfBirth: string;
  avatarUrl?: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  city: string;
  region: string;
  verified: boolean;
  completion: number;
};

export type FavoriteProvider = {
  id: string;
  name: string;
  role: string;
  initials: string;
  accent: string;
  serviceKey?: string;
  rating?: number;
  priceLabel?: string;
  portraitSrc?: string;
  bookHref?: string;
};

export type PaymentMethod = {
  id: string;
  label: string;
  type: string;
  isDefault?: boolean;
  disabled?: boolean;
};

export type PaymentHistoryItem = {
  id: string;
  serviceCategory: string;
  serviceTitle: string;
  provider: string;
  amount: number;
  paidAt: string;
  paymentMethod: string;
  status: "paid" | "refunded";
};

export type NotificationItem = {
  id: string;
  bookingId?: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type Address = {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  isDefault?: boolean;
  kind: "home" | "office" | "other";
};

export type BookingStatus = "pending" | "ongoing" | "completed" | "cancelled";

export type Booking = {
  id: string;
  service: string;
  provider: string;
  schedule: string;
  location: string;
  status: BookingStatus;
  workflowStatus:
    | "pending"
    | "accepted"
    | "on_the_way"
    | "arrived"
    | "completed"
    | "paid"
    | "review_requested"
    | "reviewed"
    | "declined"
    | "cancelled";
  statusLabel: string;
  badgeTone: "green" | "amber" | "slate";
  thumbnail: string;
  imageSrc?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  paymentOption?: "cash" | "online";
  paymentStatus?: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  companyCommissionAmount?: number;
  providerNetAmount?: number;
  companyPaymentStatus?: "pending" | "paid";
  customerPaymentProofDataUrl?: string;
  customerPaymentProofFileName?: string;
  customerPaymentProofMimeType?: string;
  providerCompanyPaymentProofDataUrl?: string;
  providerCompanyPaymentProofFileName?: string;
  providerCompanyPaymentProofMimeType?: string;
  baseAmount?: number;
  additionalCharge?: number;
  additionalChargeDescription?: string;
  paymentNote?: string;
  notes?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  activitySteps?: Array<{
    label: string;
    status: "done" | "current" | "pending";
  }>;
};

export type SettingItem = {
  id: string;
  label: string;
  tone?: "default" | "danger";
  icon: "user" | "lock" | "bell" | "help" | "alert" | "privacy" | "terms" | "trash" | "logout";
};

export type SettingGroup = {
  title: string;
  items: SettingItem[];
};

export type ProfileOverviewData = {
  profile: CustomerProfile;
  favoriteProviders: FavoriteProvider[];
  paymentMethods: PaymentMethod[];
  paymentSummary: {
    totalPaid: number;
    lastPaymentLabel: string;
  };
  bookingSummary: {
    pending: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
};
