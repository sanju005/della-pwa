"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  LogOut,
  MapPin,
  Menu,
  MessageCircleMore,
  ShieldCheck,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  AppButton,
  BottomNav,
  EmptyState,
  LoadingState,
  MobilePage,
  StatusBadge,
} from "@/app/_components/della-ui";
import { getSupabaseClient } from "@/lib/supabase";

type ProviderDashboardData = {
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
  }>;
};

type ProviderBookingItem = {
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
  createdAt: string;
};

type ProviderNotificationItem = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

function formatCurrency(value: number) {
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCompactCurrency(value: number) {
  if (value === 0) {
    return "RM 0";
  }

  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatServiceLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatTimeLabel(date: string, time: string) {
  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`${date}T${time}`));
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMinutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes || 1} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function statusTone(status: ProviderBookingItem["bookingStatus"]) {
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning,";
  }

  if (hour < 18) {
    return "Good Afternoon,";
  }

  return "Good Evening,";
}

export function ProviderDashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<ProviderDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [bookings, setBookings] = useState<ProviderBookingItem[]>([]);
  const [notifications, setNotifications] = useState<ProviderNotificationItem[]>([]);
  const [actionBookingId, setActionBookingId] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();

    async function loadDashboard() {
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

      const [profileResponse, bookingsResponse, notificationsResponse] = await Promise.all([
        fetch("/api/provider/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }),
        fetch("/api/provider/bookings", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }),
        fetch("/api/notifications", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
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

      if (!active) {
        return;
      }

      if (!profileResponse.ok || !("providerId" in profileResult)) {
        setError(
          "error" in profileResult && profileResult.error
            ? profileResult.error
            : "Unable to load provider dashboard.",
        );
        setLoading(false);
        return;
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
      setLoading(false);
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    const client = getSupabaseClient();

    if (!client || !data?.providerId) {
      return;
    }

    let active = true;
    let sessionToken = "";

    const channel = client
      .channel(`provider-dashboard-${data.providerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${data.providerId}`,
        },
        async () => {
          if (!active || !sessionToken) {
            return;
          }

          const [bookingsResponse, notificationsResponse] = await Promise.all([
            fetch("/api/provider/bookings", {
              headers: { Authorization: `Bearer ${sessionToken}` },
            }),
            fetch("/api/notifications", {
              headers: { Authorization: `Bearer ${sessionToken}` },
            }),
          ]);

          const bookingsResult = (await bookingsResponse.json()) as
            | { bookings: ProviderBookingItem[] }
            | { error?: string };
          const notificationsResult = (await notificationsResponse.json()) as
            | { notifications: ProviderNotificationItem[] }
            | { error?: string };

          if (active && bookingsResponse.ok && "bookings" in bookingsResult) {
            setBookings(bookingsResult.bookings);
          }

          if (active && notificationsResponse.ok && "notifications" in notificationsResult) {
            setNotifications(notificationsResult.notifications);
          }
        },
      )
      .subscribe();

    void client.auth.getSession().then(({ data: authData }) => {
      if (active) {
        sessionToken = authData.session?.access_token ?? "";
      }
    });

    return () => {
      active = false;
      client.removeChannel(channel);
    };
  }, [data?.providerId]);

  async function handleSignOut() {
    const client = getSupabaseClient();

    if (!client) {
      router.replace("/login");
      return;
    }

    await client.auth.signOut();
    router.replace("/login");
  }

  function handleBookingAction(bookingId: string, status: ProviderBookingItem["bookingStatus"], note = "") {
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
        }),
      });

      const result = (await response.json()) as { success?: true; error?: string };

      if (!response.ok || !result.success) {
        setError(result.error || "Unable to update booking.");
        setActionBookingId("");
        return;
      }

      const refreshResponse = await fetch("/api/provider/bookings", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const refreshResult = (await refreshResponse.json()) as
        | { bookings: ProviderBookingItem[] }
        | { error?: string };

      if (refreshResponse.ok && "bookings" in refreshResult) {
        setBookings(refreshResult.bookings);
      }

      setNotice(status === "accepted" ? "Booking accepted." : "Booking updated.");
      setActionBookingId("");
    });
  }

  const serviceSummary = useMemo(() => {
    return (data?.services ?? []).map((service) => ({
      ...service,
      label: formatServiceLabel(service.serviceType),
    }));
  }, [data?.services]);

  const pendingRequest = useMemo(
    () => bookings.find((booking) => booking.bucket === "requests") ?? null,
    [bookings],
  );

  const todayKey = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
      }).format(new Date()),
    [],
  );

  const todayBookings = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.scheduledDate === todayKey &&
            booking.bookingStatus !== "declined" &&
            booking.bookingStatus !== "cancelled",
        )
        .sort((left, right) =>
          `${left.scheduledDate}T${left.scheduledStartTime}`.localeCompare(
            `${right.scheduledDate}T${right.scheduledStartTime}`,
          ),
        ),
    [bookings, todayKey],
  );

  const walletBalance = useMemo(
    () =>
      bookings
        .filter((booking) =>
          ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
        )
        .reduce((sum, booking) => sum + booking.quotedAmount, 0),
    [bookings],
  );

  const todayEarnings = useMemo(
    () =>
      todayBookings
        .filter((booking) =>
          ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
        )
        .reduce((sum, booking) => sum + booking.quotedAmount, 0),
    [todayBookings],
  );

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  if (loading) {
    return (
      <MobilePage>
        <LoadingState
          title="Loading provider dashboard"
          description="We are preparing your bookings, earnings, and schedule."
        />
      </MobilePage>
    );
  }

  if (!data) {
    return (
      <MobilePage>
        <section className="rounded-[28px] border border-[#dbe8df] bg-white p-5 shadow-[0_20px_60px_rgba(22,163,74,0.08)]">
          <h1 className="text-[28px] font-extrabold tracking-[-0.05em] text-[#16a34a]">
            Provider Dashboard
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[#6b7280]">
            {error || "We couldn't load your provider account right now."}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-[12px] bg-[#16a34a] px-4 text-[14px] font-extrabold text-white"
          >
            Back to login
          </Link>
        </section>
      </MobilePage>
    );
  }

  const displayName = data.marketingName || data.fullName || "Provider";
  const availableNow = data.isVisible && data.accountStatus !== "Suspended";

  return (
    <MobilePage className="pb-28">
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <Link
            href="#profile"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f4faf5] text-[#334155]"
            aria-label="Open profile shortcuts"
          >
            <Menu className="h-5 w-5" />
          </Link>
          <div className="text-[2rem] font-black tracking-[-0.08em] text-[#16a34a]">
            della
          </div>
          <Link
            href="#messages"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f4faf5] text-[#334155]"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-2 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#16a34a] px-1 text-[10px] font-extrabold text-white">
                {unreadCount}
              </span>
            ) : null}
          </Link>
        </header>

        <section className="rounded-[30px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#ebf7ef] ring-4 ring-white shadow-[0_16px_30px_rgba(22,163,74,0.18)]">
                {data.avatarUrl ? (
                  <Image
                    src={data.avatarUrl}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-[1.4rem] font-black text-[#16a34a]">
                    {getInitials(displayName)}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#16a34a] shadow-[0_10px_24px_rgba(22,163,74,0.15)] ring-1 ring-[#e3eee6]">
                <span className={`h-2.5 w-2.5 rounded-full ${availableNow ? "bg-[#16a34a]" : "bg-[#f59e0b]"}`} />
                {availableNow ? "Available" : "Pending"}
              </span>
            </div>

            <p className="mt-6 text-[14px] text-[#64748b]">{getGreeting()}</p>
            <h1 className="mt-1 text-[2rem] font-black tracking-[-0.06em] text-[#0f172a]">
              {displayName}
            </h1>
            <div className="mt-2 flex items-center gap-1 text-[13px] text-[#475569]">
              <Star className="h-4 w-4 fill-[#f5b301] text-[#f5b301]" />
              <span className="font-bold">
                {data.averageRating > 0 ? data.averageRating.toFixed(1) : "0.0"}
              </span>
              <span>
                ({data.totalReviews} review{data.totalReviews === 1 ? "" : "s"})
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-center text-[13px] text-[#64748b]">
              <MapPin className="h-4 w-4 text-[#16a34a]" />
              <span>{data.serviceLocation || "Location will appear here"}</span>
            </div>
          </div>

          <div id="wallet" className="mt-5 rounded-[22px] border border-[#e5eee8] bg-[#fbfffc] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
                  Wallet Balance
                </p>
                <p className="mt-2 text-[1.85rem] font-black tracking-[-0.06em] text-[#0f172a]">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eef9f1] text-[#16a34a]">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <MetricCard
              icon={<BriefcaseBusiness className="h-4 w-4 text-[#7c3aed]" />}
              label="Bookings"
              value={String(todayBookings.length)}
              meta="Today"
            />
            <MetricCard
              icon={<CreditCard className="h-4 w-4 text-[#16a34a]" />}
              label="Earnings"
              value={formatCompactCurrency(todayEarnings)}
              meta="Today"
            />
            <MetricCard
              icon={<Star className="h-4 w-4 fill-[#f5b301] text-[#f5b301]" />}
              label="Rating"
              value={data.averageRating > 0 ? data.averageRating.toFixed(1) : "0.0"}
              meta={`From ${data.totalReviews || 0}`}
            />
          </div>
        </section>

        {error ? (
          <p className="rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="rounded-[18px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[13px] font-semibold text-[#15803d]">
            {notice}
          </p>
        ) : null}

        <section
          id="messages"
          className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                New Booking Request
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Latest request that needs your action.
              </p>
            </div>
            {pendingRequest ? (
              <span className="text-[12px] font-semibold text-[#94a3b8]">
                {formatRelativeDate(pendingRequest.createdAt)}
              </span>
            ) : null}
          </div>

          {pendingRequest ? (
            <div className="mt-4 rounded-[22px] border border-[#e7eee8] bg-[#fbfffc] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-black text-[#0f172a]">
                    {pendingRequest.serviceLabel}
                  </p>
                  <p className="mt-1 text-[13px] text-[#475569]">
                    {pendingRequest.customerName}
                  </p>
                </div>
                <p className="text-[1.15rem] font-black text-[#16a34a]">
                  {formatCompactCurrency(pendingRequest.quotedAmount)}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-[13px] text-[#475569]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#16a34a]" />
                  <span>{pendingRequest.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#16a34a]" />
                  <span>{pendingRequest.location}</span>
                </div>
                {pendingRequest.customerNote ? (
                  <div className="flex items-start gap-2">
                    <MessageCircleMore className="mt-0.5 h-4 w-4 text-[#16a34a]" />
                    <span>{pendingRequest.customerNote}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex gap-3">
                <AppButton
                  className="flex-1"
                  disabled={actionBookingId === pendingRequest.id}
                  onClick={() =>
                    handleBookingAction(
                      pendingRequest.id,
                      "declined",
                      "Provider declined booking",
                    )
                  }
                  tone="danger"
                >
                  Decline
                </AppButton>
                <AppButton
                  className="flex-1"
                  disabled={actionBookingId === pendingRequest.id}
                  onClick={() =>
                    handleBookingAction(
                      pendingRequest.id,
                      "accepted",
                      "Provider accepted booking",
                    )
                  }
                >
                  Accept
                </AppButton>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No new booking requests"
                description="When customers book you, new requests will appear here for quick action."
                icon={<Bell className="h-6 w-6" />}
              />
            </div>
          )}
        </section>

        <section
          id="bookings"
          className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                Today&apos;s Schedule
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Your jobs lined up for today.
              </p>
            </div>
            <Link href="#services" className="text-[13px] font-bold text-[#16a34a]">
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {todayBookings.length === 0 ? (
              <EmptyState
                title="No jobs scheduled today"
                description="Your accepted and upcoming bookings for today will appear here."
                icon={<CalendarDays className="h-6 w-6" />}
              />
            ) : (
              todayBookings.slice(0, 4).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] px-3 py-3"
                >
                  <div className="w-16 shrink-0 text-center">
                    <p className="text-[12px] font-black text-[#7c3aed]">
                      {formatTimeLabel(booking.scheduledDate, booking.scheduledStartTime)}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-black text-[#0f172a]">
                      {booking.serviceLabel}
                    </p>
                    <p className="truncate text-[12px] text-[#64748b]">{booking.location}</p>
                  </div>
                  <StatusBadge label={booking.statusLabel} tone={statusTone(booking.bookingStatus)} />
                </div>
              ))
            )}
          </div>
        </section>

        <section
          id="services"
          className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                My Services
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Service cards generated from your real provider profile.
              </p>
            </div>
            <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
              {serviceSummary.length} live
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {serviceSummary.length === 0 ? (
              <EmptyState
                title="No services added yet"
                description="Your registered services will appear here after setup."
                icon={<BriefcaseBusiness className="h-6 w-6" />}
              />
            ) : (
              serviceSummary.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-3 rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-black text-[#0f172a]">
                      {service.label}
                    </p>
                    <p className="mt-1 text-[12px] text-[#64748b]">
                      RM{service.hourlyRate}/hr • RM{service.dailyRate}/day
                    </p>
                  </div>
                  <div className="text-right text-[12px] text-[#64748b]">
                    <p>{service.yearsExperience || "Experience not set"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section
          id="profile"
          className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                Profile Snapshot
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Quick account and verification overview.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e5ece7] bg-white text-[#dc2626]"
              aria-label="Log out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <InfoRow
              icon={<ShieldCheck className="h-4.5 w-4.5 text-[#16a34a]" />}
              label="Account Status"
              value={data.accountStatus}
            />
            <InfoRow
              icon={<CreditCard className="h-4.5 w-4.5 text-[#16a34a]" />}
              label="Approval"
              value={data.approvalStatus}
            />
            <InfoRow
              icon={<UserRound className="h-4.5 w-4.5 text-[#16a34a]" />}
              label="Visibility"
              value={data.isVisible ? "Visible to customers" : "Hidden"}
            />
            <InfoRow
              icon={<MapPin className="h-4.5 w-4.5 text-[#16a34a]" />}
              label="Service Radius"
              value={`${data.serviceRadiusKm} KM`}
            />
          </div>
        </section>
      </section>

      <BottomNav
        items={[
          {
            href: "/provider/dashboard",
            label: "Home",
            icon: <BriefcaseBusiness className="h-5 w-5" />,
            active: true,
          },
          {
            href: "#bookings",
            label: "Bookings",
            icon: <CalendarDays className="h-5 w-5" />,
          },
          {
            href: "#messages",
            label: "Messages",
            icon: <MessageCircleMore className="h-5 w-5" />,
          },
          {
            href: "#wallet",
            label: "Wallet",
            icon: <Wallet className="h-5 w-5" />,
          },
          {
            href: "#profile",
            label: "Profile",
            icon: <UserRound className="h-5 w-5" />,
          },
        ]}
      />
    </MobilePage>
  );
}

function MetricCard({
  icon,
  label,
  value,
  meta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef9f1]">
        {icon}
      </span>
      <p className="mt-3 text-[1.15rem] font-black tracking-[-0.05em] text-[#0f172a]">
        {value}
      </p>
      <p className="mt-1 text-[12px] font-semibold text-[#475569]">{label}</p>
      <p className="mt-0.5 text-[11px] text-[#94a3b8]">{meta}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#e7eee8] bg-[#fbfffc] px-4 py-3">
      <div className="flex items-center gap-3 text-[14px] text-[#0f172a]">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      <span className="text-right text-[13px] font-bold text-[#16a34a]">{value}</span>
    </div>
  );
}
