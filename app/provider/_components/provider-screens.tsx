"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { getSupabaseClient } from "@/lib/supabase";

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
  type ProviderBookingItem,
  useProviderAppData,
} from "./provider-app";

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

async function getProviderAccessToken() {
  const client = getSupabaseClient();

  if (!client) {
    return null;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  return session?.access_token ?? null;
}

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

function DetailMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e7eee8] bg-white p-4">
      <div className="text-[#8E5EB5]">{icon}</div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold text-[#0f172a]">{value}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e7eee8] bg-white px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
            {label}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[#0f172a]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TaskPath({
  steps,
}: {
  steps: Array<{ label: string; status: "done" | "current" | "pending" }>;
}) {
  return (
    <div className="space-y-4">
      {steps.map((step, index, stepsList) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                step.status === "done"
                  ? "border-[#8E5EB5] bg-[#8E5EB5] text-white"
                  : step.status === "current"
                    ? "border-[#8E5EB5] bg-white text-[#8E5EB5]"
                    : "border-[#d9e2dd] bg-white text-[#98a2b3]"
              }`}
            >
              {step.status === "done" ? (
                <span className="text-[10px] font-bold">OK</span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </span>
            {index < stepsList.length - 1 ? (
              <span
                className={`mt-1 h-8 w-[2px] ${
                  step.status === "done" ? "bg-[#8E5EB5]" : "bg-[#e5e7eb]"
                }`}
              />
            ) : null}
          </div>
          <div className="pt-0.5">
            <p
              className={`text-[14px] font-semibold ${
                step.status === "pending" ? "text-[#98a2b3]" : "text-[#111827]"
              }`}
            >
              {step.label}
            </p>
            <p className="mt-1 text-[12px] text-[#6b7280]">
              {step.status === "done"
                ? "Finished"
                : step.status === "current"
                  ? "Current step"
                  : "Waiting"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingActionBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-[5.5rem] z-20 mt-5 rounded-[22px] border border-[#ebe3f5] bg-white/95 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="flex gap-3">{children}</div>
    </div>
  );
}

function getBookingTab(
  booking: ProviderBookingItem,
): "ongoing" | "upcoming" | "pending" | "canceled" | "completes" {
  const todayKey = getTodayKey();

  if (booking.bucket === "requests" || booking.bookingStatus === "pending") {
    return "pending";
  }

  if (booking.bookingStatus === "declined" || booking.bookingStatus === "cancelled") {
    return "canceled";
  }

  if (["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus)) {
    return "completes";
  }

  if (
    booking.bookingStatus === "on_the_way" ||
    booking.bookingStatus === "arrived" ||
    (booking.bookingStatus === "accepted" && booking.scheduledDate <= todayKey)
  ) {
    return "ongoing";
  }

  return "upcoming";
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
  const acceptedBookings = state.bookings.filter((booking) => booking.bookingStatus === "accepted");
  const ongoingBookings = state.bookings.filter(
    (booking) => booking.bookingStatus === "on_the_way" || booking.bookingStatus === "arrived",
  );
  const confirmedBookings = state.bookings.filter(
    (booking) =>
      booking.customerStatusLabel === "Confirmed" ||
      booking.customerStatusLabel === "On the Way" ||
      booking.customerStatusLabel === "Arrived",
  );
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
                Task Status
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Synced with the same live booking flow used by customer tasks.
              </p>
            </div>
            <Link href="/provider/bookings" className="text-[13px] font-bold text-[#16a34a]">
              Open bookings
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MetricCard
              label="Accepted"
              value={String(acceptedBookings.length)}
              meta="Ready to start"
              accent="text-[#0f172a]"
            />
            <MetricCard
              label="Ongoing Task"
              value={String(ongoingBookings.length)}
              meta="On the way / arrived"
              accent="text-[#0f172a]"
            />
            <MetricCard
              label="Confirmed"
              value={String(confirmedBookings.length)}
              meta="What users see"
              accent="text-[#0f172a]"
            />
          </div>
        </section>

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
                Accepted Tasks
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Accepted by provider. Customers see these as confirmed tasks.
              </p>
            </div>
            <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
              {acceptedBookings.length}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {acceptedBookings.length === 0 ? (
              <EmptyState
                title="No accepted tasks"
                description="Accepted jobs will appear here before you start the trip."
                icon={<BriefcaseBusiness className="h-6 w-6" />}
              />
            ) : (
              acceptedBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                      <p className="mt-1 text-[12px] text-[#64748b]">{booking.customerName}</p>
                    </div>
                    <StatusBadge label={booking.customerStatusLabel} tone="accepted" />
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
                  </div>
                  <div className="mt-4">
                    <AppButton
                      className="w-full"
                      disabled={state.actionBookingId === booking.id}
                      onClick={() =>
                        state.handleBookingAction(
                          booking.id,
                          "on_the_way",
                          "Provider started travel to customer",
                        )
                      }
                    >
                      Start Task
                    </AppButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                Ongoing Tasks
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Active jobs already in progress.
              </p>
            </div>
            <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
              {ongoingBookings.length}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {ongoingBookings.length === 0 ? (
              <EmptyState
                title="No ongoing tasks"
                description="Jobs that are on the way or already arrived will show here."
                icon={<Clock3 className="h-6 w-6" />}
              />
            ) : (
              ongoingBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                      <p className="mt-1 text-[12px] text-[#64748b]">{booking.customerName}</p>
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
                  </div>
                  <div className="mt-4">
                    <AppButton
                      className="w-full"
                      disabled={state.actionBookingId === booking.id}
                      onClick={() =>
                        state.handleBookingAction(
                          booking.id,
                          booking.bookingStatus === "on_the_way" ? "arrived" : "completed",
                          booking.bookingStatus === "on_the_way"
                            ? "Provider arrived at customer location"
                            : "Provider completed task",
                        )
                      }
                    >
                      {booking.bookingStatus === "on_the_way" ? "Mark Arrived" : "Mark Completed"}
                    </AppButton>
                  </div>
                </div>
              ))
            )}
          </div>
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

export function BookingsScreen({
  initialBookingId = "",
}: {
  initialBookingId?: string;
}) {
  const router = useRouter();
  const state = useProviderAppData();
  const [tab, setTab] = useState<"ongoing" | "upcoming" | "pending" | "canceled" | "completes">("pending");
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookingId);

  useEffect(() => {
    setSelectedBookingId(initialBookingId);
  }, [initialBookingId]);

  const selectedBooking =
    state.bookings.find((booking) => booking.id === selectedBookingId) ?? null;

  useEffect(() => {
    if (!selectedBooking) {
      return;
    }

    setTab(getBookingTab(selectedBooking));
  }, [selectedBooking]);

  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  function openBooking(bookingId: string) {
    setSelectedBookingId(bookingId);
    router.push(`/provider/bookings/${bookingId}`, { scroll: false });
  }

  function closeBookingDetails() {
    setSelectedBookingId("");
    router.push("/provider/bookings", { scroll: false });
  }

  async function handleFinalizePayment(booking: ProviderBookingItem) {
    const extraChargeInput = window.prompt(
      "Additional charge amount (RM). Use 0 if none.",
      booking.additionalCharge > 0 ? String(booking.additionalCharge) : "0"
    );

    if (extraChargeInput === null) {
      return;
    }

    const additionalCharge = Number(extraChargeInput);

    if (!Number.isFinite(additionalCharge) || additionalCharge < 0) {
      state.setError("Additional charge must be a valid number.");
      return;
    }

    const chargeDescription = window.prompt(
      "Additional charge description",
      booking.additionalChargeDescription || "Extra hours / extra work"
    );

    if (chargeDescription === null) {
      return;
    }

    const paymentNote = window.prompt(
      "Payment note for customer",
      booking.paymentNote || "Final cash payment confirmed by provider."
    );

    if (paymentNote === null) {
      return;
    }

    const baseAmount = booking.baseAmount || booking.quotedAmount;
    const finalAmount = Math.max(0, baseAmount + additionalCharge);

    state.handleBookingAction(booking.id, "paid", paymentNote, {
      finalAmount,
      additionalCharge,
      chargeDescription: chargeDescription.trim(),
    });
  }

  const todayKey = getTodayKey();
  const items = state.bookings.filter((booking) => {
    if (tab === "pending") {
      return booking.bucket === "requests" || booking.bookingStatus === "pending";
    }

    if (tab === "ongoing") {
      return (
        booking.bookingStatus === "on_the_way" ||
        booking.bookingStatus === "arrived" ||
        (booking.bookingStatus === "accepted" && booking.scheduledDate <= todayKey)
      );
    }

    if (tab === "upcoming") {
      return booking.bookingStatus === "accepted" && booking.scheduledDate > todayKey;
    }

    if (tab === "canceled") {
      return booking.bookingStatus === "declined" || booking.bookingStatus === "cancelled";
    }

    return ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus);
  });

  return (
    <PageShell
      title="Bookings"
      subtitle="Manage pending requests, active jobs, and completed provider work."
    >
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

      {selectedBooking ? (
        <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
                Booking Request
              </p>
              <h2 className="mt-2 text-[1.45rem] font-black tracking-[-0.05em] text-[#0f172a]">
                {selectedBooking.serviceLabel}
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Review the full request before you accept or decline it.
              </p>
            </div>
            <button
              type="button"
              onClick={closeBookingDetails}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f7f6] text-[#64748b]"
              aria-label="Close booking details"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-black text-[#0f172a]">{selectedBooking.customerName}</p>
                <p className="mt-1 text-[12px] text-[#64748b]">
                  Booking ID: {selectedBooking.id}
                </p>
              </div>
              <StatusBadge
                label={selectedBooking.statusLabel}
                tone={providerStatusTone(selectedBooking.bookingStatus)}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <DetailMetric
                label="Date"
                value={formatDateLabel(selectedBooking.scheduledDate)}
                icon={<CalendarDays className="h-4 w-4 text-[#8E5EB5]" />}
              />
              <DetailMetric
                label="Time"
                value={`${formatTimeLabel(selectedBooking.scheduledDate, selectedBooking.scheduledStartTime)} - ${formatTimeLabel(selectedBooking.scheduledDate, selectedBooking.scheduledEndTime)}`}
                icon={<Clock3 className="h-4 w-4 text-[#8E5EB5]" />}
              />
              <DetailMetric
                label="Booking Type"
                value={selectedBooking.bookingMode === "daily" ? "Daily" : "Hourly"}
                icon={<BriefcaseBusiness className="h-4 w-4 text-[#8E5EB5]" />}
              />
              <DetailMetric
                label="Rate"
                value={formatCurrency(selectedBooking.quotedAmount)}
                icon={<Wallet className="h-4 w-4 text-[#8E5EB5]" />}
              />
            </div>

            <div className="mt-3 space-y-3">
              <DetailRow
                icon={<MapPin className="h-4 w-4 text-[#8E5EB5]" />}
                label="Location"
                value={selectedBooking.location}
              />
              <DetailRow
                icon={<Calendar className="h-4 w-4 text-[#8E5EB5]" />}
                label="Schedule"
                value={selectedBooking.schedule}
              />
              <DetailRow
                icon={<MessageCircleMore className="h-4 w-4 text-[#8E5EB5]" />}
                label="Customer Details"
                value={selectedBooking.customerNote || "No extra details from the customer."}
              />
            </div>

            {selectedBooking.declineReason ? (
              <p className="mt-4 rounded-[16px] border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[#be123c]">
                Decline reason: {selectedBooking.declineReason}
              </p>
            ) : null}

            {selectedBooking.providerResponseNote ? (
              <p className="mt-4 rounded-[16px] border border-[#dbeee2] bg-[#f6fff8] px-4 py-3 text-[13px] font-semibold text-[#15803d]">
                Provider note: {selectedBooking.providerResponseNote}
              </p>
            ) : null}

            {selectedBooking.bookingStatus !== "declined" &&
            selectedBooking.bookingStatus !== "cancelled" ? (
              <div className="mt-4 rounded-[18px] border border-[#ebe3f5] bg-white px-4 py-4">
                <p className="text-[14px] font-extrabold text-[#0f172a]">Task Path</p>
                <div className="mt-4">
                  <TaskPath steps={getProviderTaskSteps(selectedBooking.bookingStatus)} />
                </div>
              </div>
            ) : null}

            {selectedBooking.bookingStatus === "pending" ? (
              <BookingActionBar>
                <AppButton
                  className="flex-1"
                  tone="danger"
                  disabled={state.actionBookingId === selectedBooking.id}
                  onClick={() =>
                    state.handleBookingAction(
                      selectedBooking.id,
                      "declined",
                      "Provider declined booking",
                    )
                  }
                >
                  Decline Request
                </AppButton>
                <AppButton
                  className="flex-1"
                  disabled={state.actionBookingId === selectedBooking.id}
                  onClick={() =>
                    state.handleBookingAction(
                      selectedBooking.id,
                      "accepted",
                      "Provider accepted booking",
                    )
                  }
                >
                  Accept Request
                </AppButton>
              </BookingActionBar>
            ) : null}

            {selectedBooking.bookingStatus === "accepted" ? (
              <BookingActionBar>
                <AppButton
                  className="flex-1"
                  disabled={state.actionBookingId === selectedBooking.id}
                  onClick={() =>
                    state.handleBookingAction(
                      selectedBooking.id,
                      "on_the_way",
                      "Provider started travel to customer",
                    )
                  }
                >
                  Update On The Way
                </AppButton>
              </BookingActionBar>
            ) : null}

            {selectedBooking.bookingStatus === "on_the_way" ? (
              <BookingActionBar>
                <AppButton
                  className="flex-1"
                  disabled={state.actionBookingId === selectedBooking.id}
                  onClick={() =>
                    state.handleBookingAction(
                      selectedBooking.id,
                      "arrived",
                      "Provider arrived at customer location",
                    )
                  }
                >
                  Update Arrived
                </AppButton>
              </BookingActionBar>
            ) : null}

            {selectedBooking.bookingStatus === "arrived" ? (
              <BookingActionBar>
                <AppButton
                  className="flex-1"
                  disabled={state.actionBookingId === selectedBooking.id}
                  onClick={() =>
                    state.handleBookingAction(
                      selectedBooking.id,
                      "completed",
                      "Provider completed the full task path",
                    )
                  }
                >
                  Update Task Completed
                </AppButton>
              </BookingActionBar>
            ) : null}

            {selectedBooking.bookingStatus === "completed" ? (
              <BookingActionBar>
                <AppButton
                  className="flex-1"
                  disabled={state.actionBookingId === selectedBooking.id}
                  onClick={() => void handleFinalizePayment(selectedBooking)}
                >
                  Update Paid
                </AppButton>
              </BookingActionBar>
            ) : null}

            {selectedBooking.bookingStatus === "paid" ? (
              <BookingActionBar>
                <AppButton
                  className="flex-1"
                  disabled={state.actionBookingId === selectedBooking.id}
                  onClick={() =>
                    state.handleBookingAction(
                      selectedBooking.id,
                      "review_requested",
                      "Provider requested customer review",
                    )
                  }
                >
                  Request Review
                </AppButton>
              </BookingActionBar>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex flex-wrap gap-2">
          {[
            ["ongoing", "Ongoing"],
            ["upcoming", "Upcoming"],
            ["pending", "Pending"],
            ["canceled", "Canceled"],
            ["completes", "Completes"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as typeof tab)}
              className={`rounded-full px-4 py-2 text-[12px] font-bold ${
                tab === value ? "bg-[#8E5EB5] text-white" : "bg-[#f3f6f4] text-[#64748b]"
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
                    <CalendarDays className="h-4 w-4 text-[#8E5EB5]" />
                    <span>{booking.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#8E5EB5]" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#8E5EB5]" />
                    <span>{formatCurrency(booking.quotedAmount)}</span>
                  </div>
                  {booking.additionalCharge > 0 ? (
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-[#16a34a]" />
                      <span>
                        Additional charge: {formatCurrency(booking.additionalCharge)}
                        {booking.additionalChargeDescription
                          ? ` (${booking.additionalChargeDescription})`
                          : ""}
                      </span>
                    </div>
                  ) : null}
                </div>
                {tab === "ongoing" ? (
                  <div className="mt-4 rounded-[18px] border border-[#ebe3f5] bg-white px-4 py-4">
                    <p className="text-[14px] font-extrabold text-[#0f172a]">Task Path</p>
                    <div className="mt-4 space-y-4">
                      {getProviderTaskSteps(booking.bookingStatus).map((step, index, steps) => (
                        <div key={step.label} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                step.status === "done"
                                  ? "border-[#8E5EB5] bg-[#8E5EB5] text-white"
                                  : step.status === "current"
                                    ? "border-[#8E5EB5] bg-white text-[#8E5EB5]"
                                    : "border-[#d9e2dd] bg-white text-[#98a2b3]"
                              }`}
                            >
                              {step.status === "done" ? (
                                <span className="text-[11px] font-bold">✓</span>
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-current" />
                              )}
                            </span>
                            {index < steps.length - 1 ? (
                              <span
                                className={`mt-1 h-8 w-[2px] ${
                                  step.status === "done" ? "bg-[#8E5EB5]" : "bg-[#e5e7eb]"
                                }`}
                              />
                            ) : null}
                          </div>
                          <div className="pt-0.5">
                            <p
                              className={`text-[14px] font-semibold ${
                                step.status === "pending" ? "text-[#98a2b3]" : "text-[#111827]"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="mt-1 text-[12px] text-[#6b7280]">
                              {step.status === "done"
                                ? "Finished"
                                : step.status === "current"
                                  ? "Current step"
                                  : "Waiting"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {booking.bucket === "requests" ? (
                  <div className="mt-4 flex gap-3">
                    <AppButton
                      className="flex-1"
                      tone="secondary"
                      onClick={() => openBooking(booking.id)}
                    >
                      View Details
                    </AppButton>
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
                {tab === "ongoing" ? (
                  <div className="mt-4 flex gap-3">
                    {booking.bookingStatus === "accepted" ? (
                      <AppButton
                        className="flex-1"
                        disabled={state.actionBookingId === booking.id}
                        onClick={() =>
                          state.handleBookingAction(
                            booking.id,
                            "on_the_way",
                            "Provider started travel to customer",
                          )
                        }
                      >
                        Start Task
                      </AppButton>
                    ) : null}
                    {booking.bookingStatus === "on_the_way" ? (
                      <AppButton
                        className="flex-1"
                        disabled={state.actionBookingId === booking.id}
                        onClick={() =>
                          state.handleBookingAction(
                            booking.id,
                            "arrived",
                            "Provider arrived at customer location",
                          )
                        }
                      >
                        Mark Arrived
                      </AppButton>
                    ) : null}
                    {booking.bookingStatus === "arrived" ? (
                      <AppButton
                        className="flex-1"
                        disabled={state.actionBookingId === booking.id}
                        onClick={() =>
                          state.handleBookingAction(
                            booking.id,
                            "completed",
                            "Provider completed the full task path",
                          )
                        }
                      >
                        Task Finished
                      </AppButton>
                    ) : null}
                    <AppButton
                      tone="secondary"
                      className="flex-1"
                      onClick={() => openBooking(booking.id)}
                    >
                      Open Booking
                    </AppButton>
                  </div>
                ) : null}
                {tab === "completes" && booking.bookingStatus === "completed" ? (
                  <div className="mt-4 flex gap-3">
                    <AppButton
                      className="flex-1"
                      disabled={state.actionBookingId === booking.id}
                      onClick={() => void handleFinalizePayment(booking)}
                    >
                      Finalize Payment
                    </AppButton>
                    <AppButton
                      tone="secondary"
                      className="flex-1"
                      onClick={() => openBooking(booking.id)}
                    >
                      Open Booking
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

function getProviderTaskSteps(status: "accepted" | "on_the_way" | "arrived" | "completed" | "paid" | "review_requested" | "reviewed" | "pending" | "declined" | "cancelled") {
  const labels = [
    "Booking accepted",
    "On the way",
    "Arrived at location",
    "Task completed",
    "Payment confirmed",
    "Review",
  ];

  const currentIndex =
    status === "accepted"
      ? 0
      : status === "on_the_way"
        ? 1
        : status === "arrived"
          ? 2
          : status === "completed"
            ? 3
            : status === "paid"
              ? 4
              : status === "review_requested" || status === "reviewed"
                ? 5
                : -1;

  return labels.map((label, index) => {
    if (currentIndex === -1) {
      return { label, status: "pending" as const };
    }

    if (
      index < currentIndex ||
      (index === currentIndex &&
        (status === "completed" || status === "paid" || status === "reviewed"))
    ) {
      return { label, status: "done" as const };
    }

    if (index === currentIndex) {
      return { label, status: "current" as const };
    }

    return { label, status: "pending" as const };
  });
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#0f172a]">Customer Conversations</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Real booking notes and latest customer messages.
            </p>
          </div>
          <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
            {state.messages.length}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {state.messages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Customer notes and booking conversations will appear here once someone books your service."
              icon={<MessageCircleMore className="h-6 w-6" />}
            />
          ) : (
            state.messages.map((item) => (
              <div
                key={item.bookingId}
                className={`rounded-[20px] border p-4 ${
                  item.unreadCount > 0 ? "border-[#bbf7d0] bg-[#f6fff8]" : "border-[#e7eee8] bg-[#fbfffc]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-black text-[#0f172a]">
                      {item.customerName}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-[#16a34a]">
                      {item.serviceLabel}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#64748b]">{item.preview}</p>
                    <div className="mt-3 space-y-1 text-[12px] text-[#64748b]">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#16a34a]" />
                        <span>{item.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#16a34a]" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-[#94a3b8]">
                      {formatRelativeDate(item.lastMessageAt)}
                    </p>
                    {item.unreadCount > 0 ? (
                      <span className="mt-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#16a34a] px-1 text-[10px] font-extrabold text-white">
                        {item.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4">
                  <AppButton href={`/provider/bookings/${item.bookingId}`} className="w-full" tone="secondary">
                    Open Booking
                  </AppButton>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#0f172a]">System Alerts</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Booking status updates and provider notifications.
            </p>
          </div>
          <span className="rounded-full bg-[#eef9f1] px-3 py-1 text-[12px] font-bold text-[#16a34a]">
            {state.notifications.length}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {state.notifications.length === 0 ? (
            <EmptyState
              title="No alerts yet"
              description="System updates will appear here when bookings change."
              icon={<Bell className="h-6 w-6" />}
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
                  <p className="text-[11px] font-semibold text-[#94a3b8]">
                    {formatRelativeDate(item.createdAt)}
                  </p>
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
          <AppButton
            tone="secondary"
            className="w-full bg-white text-[#0f172a]"
            onClick={() =>
              state.setNotice("Withdrawals are routed through admin during testing. Your earnings total is live.")
            }
          >
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

export function TasksScreen() {
  const state = useProviderAppData();
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const ongoing = state.bookings.filter(
    (booking) => booking.bookingStatus === "accepted" || booking.bookingStatus === "on_the_way" || booking.bookingStatus === "arrived",
  );
  const completedToday = state.bookings.filter(
    (booking) =>
      booking.scheduledDate === getTodayKey() &&
      ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
  );

  return (
    <PageShell title="Tasks" subtitle="Your live ongoing provider tasks and quick actions.">
      <section className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Ongoing"
          value={String(ongoing.length)}
          meta="Accepted and active"
          accent="text-[#0f172a]"
        />
        <MetricCard
          label="Completed Today"
          value={String(completedToday.length)}
          meta="Finished today"
          accent="text-[#0f172a]"
        />
      </section>

      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#0f172a]">Ongoing Tasks</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              These are the jobs you should work on right now.
            </p>
          </div>
          <Link href="/provider/bookings" className="text-[13px] font-bold text-[#16a34a]">
            All bookings
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {ongoing.length === 0 ? (
            <EmptyState
              title="No ongoing tasks"
              description="Accepted or in-progress jobs will show here automatically."
              icon={<BriefcaseBusiness className="h-6 w-6" />}
            />
          ) : (
            ongoing.map((booking) => (
              <div
                key={booking.id}
                className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4"
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
                </div>
                <div className="mt-4 flex gap-3">
                  {booking.bookingStatus === "accepted" ? (
                    <AppButton
                      className="flex-1"
                      disabled={state.actionBookingId === booking.id}
                      onClick={() =>
                        state.handleBookingAction(
                          booking.id,
                          "on_the_way",
                          "Provider started travel to customer",
                        )
                      }
                    >
                      Start Task
                    </AppButton>
                  ) : null}
                  {booking.bookingStatus === "on_the_way" ? (
                    <AppButton
                      className="flex-1"
                      disabled={state.actionBookingId === booking.id}
                      onClick={() =>
                        state.handleBookingAction(
                          booking.id,
                          "arrived",
                          "Provider arrived at customer location",
                        )
                      }
                    >
                      Mark Arrived
                    </AppButton>
                  ) : null}
                  {booking.bookingStatus === "arrived" ? (
                    <AppButton
                      className="flex-1"
                      disabled={state.actionBookingId === booking.id}
                      onClick={() =>
                        state.handleBookingAction(
                          booking.id,
                          "completed",
                          "Provider completed the task",
                        )
                      }
                    >
                      Complete Task
                    </AppButton>
                  ) : null}
                  <AppButton href={`/provider/bookings/${booking.id}`} tone="secondary" className="flex-1">
                    Open Booking
                  </AppButton>
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
  const [editingServiceId, setEditingServiceId] = useState("");
  const [form, setForm] = useState({
    serviceType: "",
    yearsExperience: "",
    hourlyRate: "",
    dailyRate: "",
    specialties: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const data = state.data!;

  async function saveService() {
    const accessToken = await getProviderAccessToken();

    if (!accessToken) {
      state.setError("Your session expired. Please log in again.");
      return;
    }

    if (!form.serviceType.trim() && !editingServiceId) {
      setMessage("Service type is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    state.setError("");

    const endpoint = editingServiceId
      ? `/api/provider/services/${editingServiceId}`
      : "/api/provider/services";
    const method = editingServiceId ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        serviceType: form.serviceType,
        yearsExperience: form.yearsExperience,
        hourlyRate: Number(form.hourlyRate || 0),
        dailyRate: Number(form.dailyRate || 0),
        specialties: form.specialties
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });

    const result = (await response.json()) as { success?: true; error?: string };

    if (!response.ok || !result.success) {
      setMessage(result.error || "Unable to save service.");
      setSaving(false);
      return;
    }

    await state.reloadWorkspace();
    setSaving(false);
    setEditingServiceId("");
    setForm({
      serviceType: "",
      yearsExperience: "",
      hourlyRate: "",
      dailyRate: "",
      specialties: "",
    });
    setMessage(editingServiceId ? "Service updated." : "New service added.");
  }

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
                    onClick={() => {
                      setEditingServiceId(service.id);
                      setForm({
                        serviceType: formatServiceLabel(service.serviceType),
                        yearsExperience: service.yearsExperience,
                        hourlyRate: String(service.hourlyRate),
                        dailyRate: String(service.dailyRate),
                        specialties: service.specialties.join(", "),
                      });
                      setMessage("");
                    }}
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
        <div className="mt-5 rounded-[22px] border border-[#e7eee8] bg-[#fbfffc] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-black text-[#0f172a]">
                {editingServiceId ? "Edit Service" : "Add New Service"}
              </h2>
              <p className="mt-1 text-[12px] text-[#64748b]">
                Save pricing and specialties directly to your provider listing.
              </p>
            </div>
            {editingServiceId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingServiceId("");
                  setForm({
                    serviceType: "",
                    yearsExperience: "",
                    hourlyRate: "",
                    dailyRate: "",
                    specialties: "",
                  });
                  setMessage("");
                }}
                className="text-[12px] font-bold text-[#16a34a]"
              >
                Cancel
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <label className="rounded-[18px] border border-[#e7eee8] bg-white p-4">
              <span className="text-[12px] font-bold text-[#64748b]">Service Type</span>
              <input
                value={form.serviceType}
                onChange={(event) => setForm((current) => ({ ...current, serviceType: event.target.value }))}
                readOnly={Boolean(editingServiceId)}
                className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none read-only:text-[#94a3b8]"
                placeholder="Chef, Maid, Driver"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-[18px] border border-[#e7eee8] bg-white p-4">
                <span className="text-[12px] font-bold text-[#64748b]">Hourly Rate</span>
                <input
                  value={form.hourlyRate}
                  onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))}
                  className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
                  placeholder="40"
                />
              </label>
              <label className="rounded-[18px] border border-[#e7eee8] bg-white p-4">
                <span className="text-[12px] font-bold text-[#64748b]">Daily Rate</span>
                <input
                  value={form.dailyRate}
                  onChange={(event) => setForm((current) => ({ ...current, dailyRate: event.target.value }))}
                  className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
                  placeholder="250"
                />
              </label>
            </div>
            <label className="rounded-[18px] border border-[#e7eee8] bg-white p-4">
              <span className="text-[12px] font-bold text-[#64748b]">Experience</span>
              <input
                value={form.yearsExperience}
                onChange={(event) => setForm((current) => ({ ...current, yearsExperience: event.target.value }))}
                className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
                placeholder="5 Years"
              />
            </label>
            <label className="rounded-[18px] border border-[#e7eee8] bg-white p-4">
              <span className="text-[12px] font-bold text-[#64748b]">Specialties</span>
              <input
                value={form.specialties}
                onChange={(event) => setForm((current) => ({ ...current, specialties: event.target.value }))}
                className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
                placeholder="Malay, Arabic, Event catering"
              />
            </label>
          </div>
          {message ? (
            <p className="mt-4 rounded-[16px] border border-[#dbeee2] bg-[#f6fff8] px-4 py-3 text-[13px] font-semibold text-[#15803d]">
              {message}
            </p>
          ) : null}
          <div className="mt-5">
            <AppButton className="w-full" disabled={saving} onClick={() => void saveService()}>
              {saving ? "Saving..." : editingServiceId ? "Save Changes" : "Add New Service"}
            </AppButton>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function AvailabilityScreen() {
  const state = useProviderAppData();
  const [enabled, setEnabled] = useState(true);
  const [days, setDays] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_DAYS.map((day) => [day, false])) as Record<string, boolean>,
  );
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextDays = Object.fromEntries(ALL_DAYS.map((day) => [day, false])) as Record<string, boolean>;

    state.availability.forEach((entry) => {
      nextDays[entry.day] = true;
    });

    setDays(nextDays);
    setEnabled(state.availabilityEnabled);

    const firstEntry = state.availability[0];
    if (firstEntry) {
      setStartTime(firstEntry.startTime);
      setEndTime(firstEntry.endTime);
    }
  }, [state.availability, state.availabilityEnabled]);

  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  async function saveAvailability() {
    const accessToken = await getProviderAccessToken();

    if (!accessToken) {
      state.setError("Your session expired. Please log in again.");
      return;
    }

    setSaving(true);
    setSaved("");
    state.setError("");

    const response = await fetch("/api/provider/availability", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        enabled,
        days: ALL_DAYS.filter((day) => days[day]),
        startTime,
        endTime,
        timeMode: "custom",
      }),
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      state.setError(result.error || "Unable to save availability.");
      setSaving(false);
      return;
    }

    await state.reloadWorkspace();
    setSaved(enabled ? "Availability saved to your live provider profile." : "Provider visibility is now paused.");
    setSaving(false);
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
                  ...Object.fromEntries(ALL_DAYS.map((day) => [day, true])),
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
            disabled={saving}
            onClick={() => void saveAvailability()}
          >
            {saving ? "Saving..." : "Save Availability"}
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
          Live customer feedback from your Supabase review records.
        </p>
        <div className="mt-4">
          {state.reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Completed bookings will show up here once customers start leaving feedback."
              icon={<Star className="h-6 w-6" />}
            />
          ) : (
            <div className="space-y-3">
              {state.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-[20px] border border-[#e7eee8] bg-[#fbfffc] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-[#0f172a]">{review.customerName}</p>
                      <p className="mt-1 text-[12px] text-[#64748b]">{review.createdLabel}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#f5b301]">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={`${review.id}-${index}`} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-[#475569]">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
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
  const verificationCount = [
    data.emailVerified,
    data.phoneVerified,
    data.identityVerified,
    data.kycVerified,
    data.backgroundCheckVerified,
  ].filter(Boolean).length;
  const providerBadgeLabel =
    verificationCount >= 3 ? "Verified Provider" : `${data.approvalStatus} Provider`;

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
            {providerBadgeLabel}
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
