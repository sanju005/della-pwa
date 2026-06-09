"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Globe,
  HelpCircle,
  Landmark,
  LogOut,
  MapPin,
  Menu,
  MessageCircleMore,
  PencilLine,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  AppButton,
  EmptyState,
  LoadingState,
  MobilePage,
  StatusBadge,
} from "@/app/_components/della-ui";

import {
  formatCompactCurrency,
  formatCurrency,
  formatDateLabel,
  formatRelativeDate,
  formatServiceLabel,
  formatTimeLabel,
  getGreeting,
  getInitials,
  getTodayKey,
  providerStatusTone,
  ProviderBottomNav,
  useProviderAppData,
} from "./provider-app";

function LoadingOrError(state: ReturnType<typeof useProviderAppData>) {
  if (state.loading) {
    return (
      <MobilePage className="pb-28">
        <LoadingState
          title="Loading provider app"
          description="We are preparing your provider workspace."
        />
      </MobilePage>
    );
  }

  if (!state.data) {
    return (
      <MobilePage className="pb-28">
        <section className="rounded-[28px] border border-[#dbe8df] bg-white p-5 shadow-[0_20px_60px_rgba(22,163,74,0.08)]">
          <h1 className="text-[28px] font-extrabold tracking-[-0.05em] text-[#16a34a]">
            Provider App
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[#6b7280]">
            {state.error || "We couldn't load your provider account right now."}
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

  return null;
}

function PageShell({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <MobilePage className="pb-28">
      <section className="space-y-4">
        <header className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#16a34a]">
                Provider App
              </p>
              <h1 className="mt-2 text-[1.9rem] font-black tracking-[-0.06em] text-[#0f172a]">
                {title}
              </h1>
              <p className="mt-1 text-[13px] leading-6 text-[#64748b]">{subtitle}</p>
            </div>
            {action}
          </div>
        </header>
        {children}
      </section>
      <ProviderBottomNav />
    </MobilePage>
  );
}

function MetricCard({
  label,
  value,
  meta,
  accent = "text-[#16a34a]",
}: {
  label: string;
  value: string;
  meta: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4">
      <p className={`text-[1.2rem] font-black tracking-[-0.05em] ${accent}`}>{value}</p>
      <p className="mt-1 text-[12px] font-semibold text-[#475569]">{label}</p>
      <p className="mt-1 text-[11px] text-[#94a3b8]">{meta}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#e7eee8] bg-[#fbfffc] px-4 py-3">
      <div className="flex items-center gap-3 text-[14px] text-[#0f172a]">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-right text-[13px] font-bold text-[#16a34a]">{value}</span>
        {href ? <ChevronRight className="h-4 w-4 text-[#94a3b8]" /> : null}
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}

function ServiceCard({
  name,
  hourly,
  daily,
  experience,
}: {
  name: string;
  hourly: number;
  daily: number;
  experience: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-black text-[#0f172a]">{name}</p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            {`RM${hourly}/hr • RM${daily}/day`}
          </p>
        </div>
        <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[11px] font-bold text-[#16a34a]">
          {experience || "Experience not set"}
        </span>
      </div>
    </div>
  );
}

export function DashboardScreen() {
  const state = useProviderAppData();
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const data = state.data!;
  const pendingRequest = state.bookings.find((booking) => booking.bucket === "requests") ?? null;
  const todayKey = getTodayKey();
  const todayBookings = state.bookings
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
    );
  const walletBalance = state.bookings
    .filter((booking) =>
      ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
    )
    .reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const todayEarnings = todayBookings
    .filter((booking) =>
      ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
    )
    .reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const unreadCount = state.notifications.filter((item) => !item.isRead).length;
  const displayName = data.marketingName || data.fullName || "Provider";

  return (
    <MobilePage className="pb-28">
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <Link
            href="/provider/more"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f4faf5] text-[#334155]"
          >
            <Menu className="h-5 w-5" />
          </Link>
          <div className="text-[2rem] font-black tracking-[-0.08em] text-[#16a34a]">
            della
          </div>
          <Link
            href="/provider/messages"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f4faf5] text-[#334155]"
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
                <span className={`h-2.5 w-2.5 rounded-full ${data.isVisible ? "bg-[#16a34a]" : "bg-[#f59e0b]"}`} />
                {data.isVisible ? "Available" : "Pending"}
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
              <span>({data.totalReviews} reviews)</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[13px] text-[#64748b]">
              <MapPin className="h-4 w-4 text-[#16a34a]" />
              <span>{data.serviceLocation || "Location not set yet"}</span>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-[#e5eee8] bg-[#fbfffc] p-4">
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
            <MetricCard label="Bookings" value={String(todayBookings.length)} meta="Today" />
            <MetricCard label="Earnings" value={formatCompactCurrency(todayEarnings)} meta="Today" />
            <MetricCard
              label="Rating"
              value={data.averageRating > 0 ? data.averageRating.toFixed(1) : "0.0"}
              meta={`From ${data.totalReviews}`}
            />
          </div>
        </section>

        {state.error ? (
          <p className="rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
            {state.error}
          </p>
        ) : null}

        {state.notice ? (
          <p className="rounded-[18px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[13px] font-semibold text-[#15803d]">
            {state.notice}
          </p>
        ) : null}

        <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                New Booking Request
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Latest request that needs your action.
              </p>
            </div>
            <Link href="/provider/bookings" className="text-[13px] font-bold text-[#16a34a]">
              View all
            </Link>
          </div>

          {pendingRequest ? (
            <div className="mt-4 rounded-[22px] border border-[#e7eee8] bg-[#fbfffc] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-black text-[#0f172a]">{pendingRequest.serviceLabel}</p>
                  <p className="mt-1 text-[13px] text-[#475569]">{pendingRequest.customerName}</p>
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
              </div>
              <div className="mt-4 flex gap-3">
                <AppButton
                  className="flex-1"
                  tone="danger"
                  disabled={state.actionBookingId === pendingRequest.id}
                  onClick={() =>
                    state.handleBookingAction(
                      pendingRequest.id,
                      "declined",
                      "Provider declined booking",
                    )
                  }
                >
                  Decline
                </AppButton>
                <AppButton
                  className="flex-1"
                  disabled={state.actionBookingId === pendingRequest.id}
                  onClick={() =>
                    state.handleBookingAction(
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

        <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                Today&apos;s Schedule
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">Your jobs lined up for today.</p>
            </div>
            <Link href="/provider/calendar" className="text-[13px] font-bold text-[#16a34a]">
              Calendar
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
                    <p className="truncate text-[14px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                    <p className="truncate text-[12px] text-[#64748b]">{booking.location}</p>
                  </div>
                  <StatusBadge label={booking.statusLabel} tone={providerStatusTone(booking.bookingStatus)} />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                My Services
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Service cards from your real provider profile.
              </p>
            </div>
            <Link href="/provider/services" className="text-[13px] font-bold text-[#16a34a]">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.services.length === 0 ? (
              <EmptyState
                title="No services added yet"
                description="Your registered services will appear here after setup."
                icon={<BriefcaseBusiness className="h-6 w-6" />}
              />
            ) : (
              data.services.slice(0, 3).map((service) => (
                <ServiceCard
                  key={service.id}
                  name={formatServiceLabel(service.serviceType)}
                  hourly={service.hourlyRate}
                  daily={service.dailyRate}
                  experience={service.yearsExperience}
                />
              ))
            )}
          </div>
        </section>
      </section>
      <ProviderBottomNav />
    </MobilePage>
  );
}

export function BookingsScreen() {
  const state = useProviderAppData();
  const [tab, setTab] = useState<"pending" | "accepted" | "upcoming" | "completed">("pending");
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const items = state.bookings.filter((booking) => {
    if (tab === "pending") return booking.bucket === "requests";
    if (tab === "accepted") return booking.bookingStatus === "accepted";
    if (tab === "upcoming") return booking.bucket === "active";
    return booking.bucket === "completed" || booking.bucket === "closed";
  });

  return (
    <PageShell
      title="Bookings"
      subtitle="Manage booking requests, accepted jobs, and completed work."
    >
      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex flex-wrap gap-2">
          {[
            ["pending", "Pending"],
            ["accepted", "Accepted"],
            ["upcoming", "Upcoming"],
            ["completed", "Completed"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as typeof tab)}
              className={`rounded-full px-4 py-2 text-[12px] font-bold ${
                tab === value ? "bg-[#16a34a] text-white" : "bg-[#f3f6f4] text-[#64748b]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <EmptyState
              title={`No ${tab} bookings`}
              description="This list will fill automatically as bookings move through their status."
              icon={<CalendarDays className="h-6 w-6" />}
            />
          ) : (
            items.map((booking) => (
              <div
                key={booking.id}
                className="rounded-[22px] border border-[#e7eee8] bg-[#fbfffc] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                    <p className="mt-1 text-[13px] text-[#475569]">{booking.customerName}</p>
                  </div>
                  <StatusBadge label={booking.statusLabel} tone={providerStatusTone(booking.bookingStatus)} />
                </div>
                <div className="mt-3 space-y-2 text-[13px] text-[#475569]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#16a34a]" />
                    <span>{booking.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#16a34a]" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#16a34a]" />
                    <span>{formatCurrency(booking.quotedAmount)}</span>
                  </div>
                </div>
                {booking.bucket === "requests" ? (
                  <div className="mt-4 flex gap-3">
                    <AppButton
                      className="flex-1"
                      tone="danger"
                      disabled={state.actionBookingId === booking.id}
                      onClick={() =>
                        state.handleBookingAction(booking.id, "declined", "Provider declined booking")
                      }
                    >
                      Decline
                    </AppButton>
                    <AppButton
                      className="flex-1"
                      disabled={state.actionBookingId === booking.id}
                      onClick={() =>
                        state.handleBookingAction(booking.id, "accepted", "Provider accepted booking")
                      }
                    >
                      Accept
                    </AppButton>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}

export function CalendarScreen() {
  const state = useProviderAppData();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const monthLabel = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(month);
  const startDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const firstWeekday = startDay.getDay();
  const daysInMonth = endDay.getDate();
  const cells: Array<{ label: number | null; key: string | null }> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({ label: null, key: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(month.getFullYear(), month.getMonth(), day));
    cells.push({ label: day, key });
  }

  const selectedBookings = state.bookings.filter((booking) => booking.scheduledDate === selectedDate);

  return (
    <PageShell
      title="Calendar"
      subtitle="See provider bookings by date and keep your schedule organised."
    >
      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4faf5]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-[18px] font-black text-[#0f172a]">{monthLabel}</p>
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4faf5]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[12px] font-bold text-[#94a3b8]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {cells.map((cell, index) => {
            const hasBooking = cell.key
              ? state.bookings.some((booking) => booking.scheduledDate === cell.key)
              : false;
            const isActive = cell.key === selectedDate;

            return (
              <button
                key={cell.key ?? `empty-${index}`}
                type="button"
                disabled={!cell.key}
                onClick={() => cell.key && setSelectedDate(cell.key)}
                className={`relative h-11 rounded-[14px] text-[13px] font-bold ${
                  isActive
                    ? "bg-[#16a34a] text-white"
                    : "bg-[#f8fbf9] text-[#0f172a] disabled:bg-transparent"
                }`}
              >
                {cell.label}
                {hasBooking && !isActive ? (
                  <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#16a34a]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#0f172a]">{formatDateLabel(selectedDate)}</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">Jobs scheduled for the selected day.</p>
          </div>
          <Link href="/provider/availability" className="text-[13px] font-bold text-[#16a34a]">
            Availability
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {selectedBookings.length === 0 ? (
            <EmptyState
              title="No bookings on this day"
              description="Pick another date to see scheduled jobs."
              icon={<Calendar className="h-6 w-6" />}
            />
          ) : (
            selectedBookings.map((booking) => (
              <div key={booking.id} className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                    <p className="mt-1 text-[12px] text-[#64748b]">{booking.customerName}</p>
                  </div>
                  <StatusBadge label={booking.statusLabel} tone={providerStatusTone(booking.bookingStatus)} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-[13px] text-[#475569]">
                  <Clock3 className="h-4 w-4 text-[#16a34a]" />
                  <span>{formatTimeLabel(booking.scheduledDate, booking.scheduledStartTime)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}

export function MessagesScreen() {
  const state = useProviderAppData();
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  return (
    <PageShell
      title="Messages"
      subtitle="Live booking updates and provider alerts appear here."
      action={
        <Link
          href="/provider/more"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f4faf5] text-[#334155]"
        >
          <Settings className="h-5 w-5" />
        </Link>
      }
    >
      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="space-y-3">
          {state.notifications.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Booking updates and alerts will appear here once customers start interacting with you."
              icon={<MessageCircleMore className="h-6 w-6" />}
            />
          ) : (
            state.notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-[20px] border p-4 ${
                  item.isRead ? "border-[#e7eee8] bg-[#fbfffc]" : "border-[#bbf7d0] bg-[#f6fff8]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-black text-[#0f172a]">{item.title}</p>
                    <p className="mt-1 text-[13px] leading-6 text-[#64748b]">{item.body}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-[#94a3b8]">
                      {formatRelativeDate(item.createdAt)}
                    </p>
                    {!item.isRead ? (
                      <span className="mt-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#16a34a] px-1 text-[10px] font-extrabold text-white">
                        1
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}

export function EarningsScreen() {
  const state = useProviderAppData();
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const completed = state.bookings.filter((booking) =>
    ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
  );
  const total = completed.reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const thisWeek = completed
    .filter((booking) => {
      const bookingDate = new Date(`${booking.scheduledDate}T00:00:00`);
      const today = new Date();
      const diff = today.getTime() - bookingDate.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const thisMonth = completed
    .filter((booking) => {
      const bookingDate = new Date(`${booking.scheduledDate}T00:00:00`);
      const today = new Date();
      return (
        bookingDate.getMonth() === today.getMonth() &&
        bookingDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, booking) => sum + booking.quotedAmount, 0);

  return (
    <PageShell title="Earnings" subtitle="Wallet balance, earnings summary, and transaction history.">
      <section className="rounded-[26px] bg-[#16a34a] p-5 text-white shadow-[0_22px_52px_rgba(22,163,74,0.22)]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/80">
          Wallet Balance
        </p>
        <p className="mt-2 text-[2rem] font-black tracking-[-0.06em]">{formatCurrency(total)}</p>
        <div className="mt-4">
          <AppButton tone="secondary" className="w-full bg-white text-[#0f172a]">
            Withdraw
          </AppButton>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="This Week" value={formatCurrency(thisWeek)} meta="Recent completed jobs" accent="text-[#0f172a]" />
        <MetricCard label="This Month" value={formatCurrency(thisMonth)} meta="Current month" accent="text-[#0f172a]" />
      </section>

      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#0f172a]">Transactions</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">Derived from completed and paid bookings.</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {completed.length === 0 ? (
            <EmptyState
              title="No earnings yet"
              description="Completed provider jobs will automatically appear here."
              icon={<Wallet className="h-6 w-6" />}
            />
          ) : (
            completed.slice(0, 8).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] px-4 py-3"
              >
                <div>
                  <p className="text-[14px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                  <p className="mt-1 text-[12px] text-[#64748b]">{formatDateLabel(booking.scheduledDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-black text-[#16a34a]">+{formatCurrency(booking.quotedAmount)}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">{booking.statusLabel}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}

export function ServicesScreen() {
  const state = useProviderAppData();
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const data = state.data!;

  return (
    <PageShell title="My Services" subtitle="Manage the services and pricing visible to customers.">
      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="space-y-3">
          {data.services.length === 0 ? (
            <EmptyState
              title="No services added yet"
              description="Your registered provider services will appear here."
              icon={<BriefcaseBusiness className="h-6 w-6" />}
            />
          ) : (
            data.services.map((service) => (
              <div key={service.id} className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-black text-[#0f172a]">
                      {formatServiceLabel(service.serviceType)}
                    </p>
                    <p className="mt-1 text-[12px] text-[#64748b]">
                      {`RM${service.hourlyRate}/hr • RM${service.dailyRate}/day`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eef9f1] text-[#16a34a]"
                  >
                    <PencilLine className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-[12px] text-[#475569]">
                  {service.yearsExperience || "Experience not set"}
                </p>
                <p className="mt-2 text-[12px] text-[#94a3b8]">
                  {service.specialties.length > 0
                    ? service.specialties.join(", ")
                    : "No specialties added yet."}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="mt-5">
          <AppButton className="w-full">Add New Service</AppButton>
        </div>
      </section>
    </PageShell>
  );
}

export function AvailabilityScreen() {
  const state = useProviderAppData();
  const [enabled, setEnabled] = useState(true);
  const [days, setDays] = useState<Record<string, boolean>>({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: true,
  });
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  const [saved, setSaved] = useState("");
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  return (
    <PageShell
      title="Availability"
      subtitle="Set the days and hours when customers can book your services."
    >
      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="rounded-[20px] border border-[#dbeee2] bg-[#f6fff8] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[16px] font-black text-[#0f172a]">
                You are <span className="text-[#16a34a]">{enabled ? "Available" : "Offline"}</span>
              </p>
              <p className="mt-1 text-[12px] text-[#64748b]">
                Customers can book you only when availability is enabled.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled((current) => !current)}
              className={`relative h-8 w-14 rounded-full ${enabled ? "bg-[#16a34a]" : "bg-[#cbd5e1]"}`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                  enabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-black text-[#0f172a]">Select Days</h2>
            <button
              type="button"
              onClick={() =>
                setDays({
                  Monday: true,
                  Tuesday: true,
                  Wednesday: true,
                  Thursday: true,
                  Friday: true,
                  Saturday: true,
                  Sunday: true,
                })
              }
              className="text-[12px] font-bold text-[#16a34a]"
            >
              Select all
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {Object.entries(days).map(([day, checked]) => (
              <label
                key={day}
                className="flex items-center justify-between rounded-[18px] border border-[#e7eee8] bg-[#fbfffc] px-4 py-3"
              >
                <span className="text-[14px] font-semibold text-[#0f172a]">{day}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    setDays((current) => ({ ...current, [day]: event.target.checked }))
                  }
                  className="h-4 w-4 accent-[#16a34a]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="rounded-[18px] border border-[#e7eee8] bg-[#fbfffc] p-4">
            <span className="text-[12px] font-bold text-[#64748b]">Start Time</span>
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
            />
          </label>
          <label className="rounded-[18px] border border-[#e7eee8] bg-[#fbfffc] p-4">
            <span className="text-[12px] font-bold text-[#64748b]">End Time</span>
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
            />
          </label>
        </div>

        {saved ? (
          <p className="mt-4 rounded-[16px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[13px] font-semibold text-[#15803d]">
            {saved}
          </p>
        ) : null}

        <div className="mt-5">
          <AppButton
            className="w-full"
            onClick={() => setSaved("Availability saved on this device for testing.")}
          >
            Save Availability
          </AppButton>
        </div>
      </section>
    </PageShell>
  );
}

export function ReviewsScreen() {
  const state = useProviderAppData();
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const data = state.data!;
  const completedJobs = state.bookings.filter((booking) =>
    ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
  );

  return (
    <PageShell title="Reviews" subtitle="Provider rating overview and recent completed job feedback area.">
      <section className="rounded-[26px] bg-white p-5 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <p className="text-[2.5rem] font-black tracking-[-0.06em] text-[#0f172a]">
          {data.averageRating > 0 ? data.averageRating.toFixed(1) : "0.0"}
        </p>
        <div className="mt-2 flex items-center justify-center gap-1 text-[#f5b301]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-5 w-5 fill-current" />
          ))}
        </div>
        <p className="mt-2 text-[13px] text-[#64748b]">({data.totalReviews} reviews)</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
          <MetricCard label="Completed Jobs" value={String(completedJobs.length)} meta="Provider history" accent="text-[#0f172a]" />
          <MetricCard label="Visible Rating" value={data.approvalStatus} meta="Current listing state" accent="text-[#0f172a]" />
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <h2 className="text-[17px] font-black text-[#0f172a]">Review Feed</h2>
        <p className="mt-1 text-[13px] text-[#64748b]">
          Detailed review records will appear here when the review table is connected.
        </p>
        <div className="mt-4">
          <EmptyState
            title="Detailed reviews are not connected yet"
            description="Your rating summary is live, and this screen is ready for the review table once it is added."
            icon={<Star className="h-6 w-6" />}
          />
        </div>
      </section>
    </PageShell>
  );
}

export function ProfileScreen() {
  const state = useProviderAppData();
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const data = state.data!;
  const displayName = data.marketingName || data.fullName || "Provider";

  return (
    <PageShell
      title="Profile"
      subtitle="Your provider identity, verification, and public listing information."
      action={
        <button
          type="button"
          onClick={() => void state.handleSignOut()}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1f2] text-[#dc2626]"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      }
    >
      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#ebf7ef]">
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
              <span className="text-[1.4rem] font-black text-[#16a34a]">{getInitials(displayName)}</span>
            )}
          </div>
          <h2 className="mt-4 text-[1.7rem] font-black tracking-[-0.05em] text-[#0f172a]">
            {displayName}
          </h2>
          <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#eef9f1] px-4 py-2 text-[12px] font-bold text-[#16a34a]">
            <ShieldCheck className="h-4 w-4" />
            Verified Provider
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <InfoRow icon={<UserRound className="h-4.5 w-4.5 text-[#16a34a]" />} label="Full Name" value={data.fullName} />
          <InfoRow icon={<MessageCircleMore className="h-4.5 w-4.5 text-[#16a34a]" />} label="Email" value={data.email} />
          <InfoRow icon={<CreditCard className="h-4.5 w-4.5 text-[#16a34a]" />} label="Phone" value={data.phone || "Not set"} />
          <InfoRow icon={<MapPin className="h-4.5 w-4.5 text-[#16a34a]" />} label="Service Radius" value={`${data.serviceRadiusKm} KM`} />
          <InfoRow icon={<Globe className="h-4.5 w-4.5 text-[#16a34a]" />} label="Location" value={data.serviceLocation || "Not set"} />
          <InfoRow icon={<Star className="h-4.5 w-4.5 text-[#16a34a]" />} label="Rating" value={`${data.averageRating.toFixed(1)} (${data.totalReviews})`} />
          <InfoRow icon={<ShieldCheck className="h-4.5 w-4.5 text-[#16a34a]" />} label="Email Verified" value={data.emailVerified ? "Yes" : "No"} />
          <InfoRow icon={<ShieldCheck className="h-4.5 w-4.5 text-[#16a34a]" />} label="Phone Verified" value={data.phoneVerified ? "Yes" : "No"} />
          <InfoRow icon={<ShieldCheck className="h-4.5 w-4.5 text-[#16a34a]" />} label="Identity Verified" value={data.identityVerified ? "Yes" : "No"} />
        </div>
      </section>
    </PageShell>
  );
}

export function MoreScreen() {
  const state = useProviderAppData();
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  return (
    <PageShell title="More" subtitle="Provider settings, support, and quick links to the rest of the app.">
      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="space-y-3">
          <InfoRow icon={<UserRound className="h-4.5 w-4.5 text-[#16a34a]" />} label="Personal Information" value="Open" href="/provider/profile" />
          <InfoRow icon={<Landmark className="h-4.5 w-4.5 text-[#16a34a]" />} label="Bank Details" value="Wallet" href="/provider/earnings" />
          <InfoRow icon={<BriefcaseBusiness className="h-4.5 w-4.5 text-[#16a34a]" />} label="My Services" value="Manage" href="/provider/services" />
          <InfoRow icon={<CalendarDays className="h-4.5 w-4.5 text-[#16a34a]" />} label="Availability" value="Edit" href="/provider/availability" />
          <InfoRow icon={<Star className="h-4.5 w-4.5 text-[#16a34a]" />} label="Reviews" value="View" href="/provider/reviews" />
          <InfoRow icon={<HelpCircle className="h-4.5 w-4.5 text-[#16a34a]" />} label="Help & Support" value="Soon" />
        </div>
        <div className="mt-5">
          <AppButton className="w-full" tone="danger" onClick={() => void state.handleSignOut()}>
            Log Out
          </AppButton>
        </div>
      </section>
    </PageShell>
  );
}
