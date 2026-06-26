"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  MessageCircleMore,
  UserRound,
  Wallet,
} from "lucide-react";

import { BottomNav } from "@/app/_components/della-ui";
import { subscribeToForegroundPush } from "@/lib/notifications";
import { getSupabaseClient } from "@/lib/supabase";

export type ProviderDashboardData = {
  providerId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  accountStatus: string;
  marketingName: string;
  serviceLocation: string;
  serviceRadiusKm: number;
  bio: string;
  averageRating: number;
  totalReviews: number;
  approvalStatus: string;
  isVisible: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  kycVerified: boolean;
  backgroundCheckVerified: boolean;
  services: Array<{
    id: string;
    serviceType: string;
    yearsExperience: string;
    hourlyRate: number;
    dailyRate: number;
    specialties: string[];
    imageDataUrls: string[];
    imageCaptions: string[];
    certificateDataUrls: string[];
    certificateCaptions: string[];
  }>;
};

export type ProviderBookingItem = {
  id: string;
  customerId: string;
  customerName: string;
  serviceLabel: string;
  serviceKey: string;
  location: string;
  bookingMode: "hourly" | "daily";
  bookingStatus:
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
  bucket: "requests" | "active" | "completed" | "closed";
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  schedule: string;
  customerNote: string;
  providerResponseNote: string;
  declineReason: string;
  quotedAmount: number;
  baseAmount: number;
  paymentStatus?: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  paymentOption?: "cash" | "online";
  companyCommissionAmount: number;
  companyPaymentStatus: "pending" | "paid";
  providerNetAmount: number;
  customerPaymentProofDataUrl?: string;
  customerPaymentProofFileName?: string;
  customerPaymentProofMimeType?: string;
  providerCompanyPaymentProofDataUrl?: string;
  providerCompanyPaymentProofFileName?: string;
  providerCompanyPaymentProofMimeType?: string;
  additionalCharge: number;
  additionalChargeDescription: string;
  paymentNote: string;
  createdAt: string;
  customerStatusLabel: string;
};

export type ProviderNotificationItem = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type ProviderAvailabilityItem = {
  id: string;
  day: string;
  dayKey: string;
  timeMode: string;
  startTime: string;
  endTime: string;
};

export type ProviderMessageThread = {
  bookingId: string;
  customerId: string;
  customerName: string;
  serviceLabel: string;
  location: string;
  schedule: string;
  preview: string;
  lastMessageAt: string;
  lastSenderRole: "customer" | "provider" | "admin" | "system";
  unreadCount: number;
};

export type ProviderReviewItem = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  createdLabel: string;
};

export function formatCurrency(value: number) {
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactCurrency(value: number) {
  return `RM${value.toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatServiceLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function formatTimeLabel(date: string, time: string) {
  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`${date}T${time}`));
}

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMinutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning,";
  }

  if (hour < 18) {
    return "Good Afternoon,";
  }

  return "Good Evening,";
}

export function providerStatusTone(status: ProviderBookingItem["bookingStatus"]) {
  switch (status) {
    case "accepted":
    case "on_the_way":
    case "arrived":
      return "accepted" as const;
    case "completed":
    case "paid":
    case "review_requested":
    case "reviewed":
      return "completed" as const;
    case "declined":
      return "declined" as const;
    case "cancelled":
      return "cancelled" as const;
    default:
      return "pending" as const;
  }
}

export function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date());
}

export function useProviderAppData() {
  const router = useRouter();
  const [data, setData] = useState<ProviderDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [bookings, setBookings] = useState<ProviderBookingItem[]>([]);
  const [notifications, setNotifications] = useState<ProviderNotificationItem[]>([]);
  const [availability, setAvailability] = useState<ProviderAvailabilityItem[]>([]);
  const [availabilityEnabled, setAvailabilityEnabled] = useState(true);
  const [messages, setMessages] = useState<ProviderMessageThread[]>([]);
  const [reviews, setReviews] = useState<ProviderReviewItem[]>([]);
  const [actionBookingId, setActionBookingId] = useState("");
  const [, startTransition] = useTransition();

  async function loadWorkspace(accessToken: string) {
    setError("");

    const [
      profileResponse,
      bookingsResponse,
      notificationsResponse,
      availabilityResponse,
      messagesResponse,
      reviewsResponse,
    ] = await Promise.all([
      fetch("/api/provider/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("/api/provider/bookings", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("/api/provider/availability", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("/api/provider/messages", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("/api/provider/reviews", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const profileResult = (await profileResponse.json()) as
      | ProviderDashboardData
      | { error?: string };
    const bookingsResult = (await bookingsResponse.json()) as
      | { bookings: ProviderBookingItem[] }
      | { error?: string };
    const notificationsResult = (await notificationsResponse.json()) as
      | { notifications: ProviderNotificationItem[] }
      | { error?: string };
    const availabilityResult = (await availabilityResponse.json()) as
      | { enabled: boolean; entries: ProviderAvailabilityItem[] }
      | { error?: string };
    const messagesResult = (await messagesResponse.json()) as
      | { threads: ProviderMessageThread[] }
      | { error?: string };
    const reviewsResult = (await reviewsResponse.json()) as
      | { reviews: ProviderReviewItem[] }
      | { error?: string };

    if (!profileResponse.ok || !("providerId" in profileResult)) {
      setError(
        "error" in profileResult && profileResult.error
          ? profileResult.error
          : "Unable to load provider data.",
      );
      setLoading(false);
      return false;
    }

    setData(profileResult);
    setBookings(
      bookingsResponse.ok && "bookings" in bookingsResult ? bookingsResult.bookings : [],
    );
    setNotifications(
      notificationsResponse.ok && "notifications" in notificationsResult
        ? notificationsResult.notifications
        : [],
    );
    setAvailabilityEnabled(
      availabilityResponse.ok && "enabled" in availabilityResult
        ? availabilityResult.enabled
        : true,
    );
    setAvailability(
      availabilityResponse.ok && "entries" in availabilityResult ? availabilityResult.entries : [],
    );
    setMessages(
      messagesResponse.ok && "threads" in messagesResult ? messagesResult.threads : [],
    );
    setReviews(
      reviewsResponse.ok && "reviews" in reviewsResult ? reviewsResult.reviews : [],
    );
    setLoading(false);
    return true;
  }

  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();
    let unsubscribeForegroundPush: (() => void) | undefined;

    async function load() {
      if (!client) {
        if (active) {
          setError("Supabase is not configured yet.");
          setLoading(false);
        }
        return;
      }

      const {
        data: { session },
      } = await client.auth.getSession();

      if (!active) {
        return;
      }

      if (!session) {
        router.replace("/login");
        return;
      }

      if (!active) {
        return;
      }

      await loadWorkspace(session.access_token);

      unsubscribeForegroundPush = await subscribeToForegroundPush((path) => {
        router.push(path);
      });
    }

    void load();

    return () => {
      active = false;
      unsubscribeForegroundPush?.();
    };
  }, [router]);

  async function reloadWorkspace() {
    const client = getSupabaseClient();

    if (!client) {
      return false;
    }

    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session) {
      return false;
    }

    return loadWorkspace(session.access_token);
  }

  function handleBookingAction(
    bookingId: string,
    status: ProviderBookingItem["bookingStatus"],
    note = "",
    paymentDetails?: {
      finalAmount?: number;
    },
  ) {
    const client = getSupabaseClient();

    startTransition(async () => {
      setError("");
      setNotice("");
      setActionBookingId(bookingId);

      if (!client) {
        setError("Supabase is not configured yet.");
        setActionBookingId("");
        return;
      }

      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) {
        router.replace("/login");
        setActionBookingId("");
        return;
      }

      const response = await fetch(`/api/provider/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          status,
          note,
          finalAmount: paymentDetails?.finalAmount,
        }),
      }).catch((error) => {
        console.error("[Provider app] Booking action request failed:", error);
        return null;
      });

      if (!response) {
        setError("Unable to reach the server. Please try again.");
        setActionBookingId("");
        return;
      }

      const result = (await response.json().catch(() => ({}))) as {
        success?: true;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setError(result.error || "Unable to update booking.");
        setActionBookingId("");
        return;
      }

      await reloadWorkspace();
      setNotice(
        status === "accepted"
          ? "Booking accepted."
          : status === "declined"
            ? "Booking declined."
            : "Booking updated.",
      );
      setActionBookingId("");
    });
  }

  function handleCommissionSettlement(
    bookingId: string,
    proof?: {
      proofDataUrl?: string;
      proofFileName?: string;
      proofMimeType?: string;
    },
  ) {
    const client = getSupabaseClient();

    startTransition(async () => {
      setError("");
      setNotice("");
      setActionBookingId(bookingId);

      if (!client) {
        setError("Supabase is not configured yet.");
        setActionBookingId("");
        return;
      }

      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) {
        router.replace("/login");
        setActionBookingId("");
        return;
      }

      const response = await fetch(`/api/provider/bookings/${bookingId}/settle-commission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(proof ?? {}),
      }).catch(() => null);

      const result = response
        ? ((await response.json().catch(() => ({}))) as { success?: true; error?: string })
        : null;

      if (!response || !response.ok || !result?.success) {
        setError(result?.error || "Unable to settle company commission.");
        setActionBookingId("");
        return;
      }

      await reloadWorkspace();
      setNotice("Company commission marked as paid.");
      setActionBookingId("");
    });
  }

  async function handleSignOut() {
    const client = getSupabaseClient();

    if (!client) {
      router.replace("/login");
      return;
    }

    await client.auth.signOut();
    router.replace("/login");
  }

  return {
    data,
    bookings,
    notifications,
    availability,
    availabilityEnabled,
    messages,
    reviews,
    loading,
    error,
    notice,
    actionBookingId,
    setError,
    setNotice,
    reloadWorkspace,
    handleBookingAction,
    handleCommissionSettlement,
    handleSignOut,
  };
}

export function ProviderBottomNav() {
  const pathname = usePathname();

  return (
    <BottomNav
      items={[
        {
          href: "/provider/dashboard",
          label: "Home",
          icon: <BriefcaseBusiness className="h-5 w-5" />,
          active: pathname === "/provider/dashboard",
          hardNavigate: true,
        },
        {
          href: "/provider/bookings",
          label: "Bookings",
          icon: <CalendarDays className="h-5 w-5" />,
          active: pathname === "/provider/bookings" || pathname === "/provider/calendar",
          hardNavigate: true,
        },
        {
          href: "/provider/messages",
          label: "Messages",
          icon: <MessageCircleMore className="h-5 w-5" />,
          active: pathname === "/provider/messages",
          hardNavigate: true,
        },
        {
          href: "/provider/payments",
          label: "Payments",
          icon: <Wallet className="h-5 w-5" />,
          active:
            pathname === "/provider/payments" ||
            pathname === "/provider/tasks" ||
            pathname === "/provider/earnings",
          hardNavigate: true,
        },
        {
          href: "/provider/profile",
          label: "Profile",
          icon: <UserRound className="h-5 w-5" />,
          active: pathname === "/provider/profile" || pathname === "/provider/more",
          hardNavigate: true,
        },
      ]}
    />
  );
}
