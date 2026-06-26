"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircleMore,
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
  formatCurrency,
  formatDateLabel,
  formatTimeLabel,
  getTodayKey,
  providerStatusTone,
  ProviderBottomNav,
  type ProviderBookingItem,
  useProviderAppData,
} from "../_components/provider-app";

type BookingTab = "all" | "ongoing" | "pending" | "canceled" | "completes";

function isCompletedStatus(status: ProviderBookingItem["bookingStatus"]) {
  return ["completed", "paid", "review_requested", "reviewed"].includes(status);
}

function isCanceledStatus(status: ProviderBookingItem["bookingStatus"]) {
  return status === "declined" || status === "cancelled";
}

function isOngoingStatus(status: ProviderBookingItem["bookingStatus"]) {
  return ["accepted", "on_the_way", "arrived"].includes(status);
}

function getTaskSteps(status: ProviderBookingItem["bookingStatus"]) {
  const order = ["accepted", "on_the_way", "arrived", "completed", "paid", "reviewed"];
  const currentIndex =
    status === "review_requested"
      ? order.indexOf("paid")
      : order.includes(status)
        ? order.indexOf(status)
        : -1;

  return [
    { label: "Accepted", status: currentIndex >= 0 ? "done" : "current" },
    {
      label: "On The Way",
      status: currentIndex >= 1 ? "done" : currentIndex === 0 ? "current" : "pending",
    },
    {
      label: "Arrived",
      status: currentIndex >= 2 ? "done" : currentIndex === 1 ? "current" : "pending",
    },
    {
      label: "Final Amount",
      status: currentIndex >= 3 ? "done" : currentIndex === 2 ? "current" : "pending",
    },
    {
      label: "Cash Confirmed",
      status: currentIndex >= 4 ? "done" : currentIndex === 3 ? "current" : "pending",
    },
    {
      label: "Review",
      status: currentIndex >= 5 ? "done" : currentIndex === 4 ? "current" : "pending",
    },
  ] as Array<{ label: string; status: "done" | "current" | "pending" }>;
}

function TaskPath({
  steps,
}: {
  steps: Array<{ label: string; status: "done" | "current" | "pending" }>;
}) {
  return (
    <div className="rounded-[18px] border border-[#eee5f7] bg-white px-4 py-4">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#8E5EB5]">
        Task Path
      </p>
      <div className="mt-4 space-y-4">
        {steps.map((step, index, allSteps) => (
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
                  <span className="text-[11px] font-bold">OK</span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </span>
              {index < allSteps.length - 1 ? (
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
                  step.status === "pending" ? "text-[#98a2b3]" : "text-[#1f1630]"
                }`}
              >
                {step.label}
              </p>
              <p className="mt-1 text-[12px] text-[#7b728a]">
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
  );
}

function BookingDetails({
  booking,
  actionBookingId,
  onClose,
  onAccept,
  onDecline,
  onOnTheWay,
  onArrived,
}: {
  booking: ProviderBookingItem;
  actionBookingId: string;
  onClose: () => void;
  onAccept: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
  onOnTheWay: (bookingId: string) => void;
  onArrived: (bookingId: string) => void;
}) {
  return (
    <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8E5EB5]">
            {booking.bookingStatus === "pending" ? "Booking Request" : "Booking Details"}
          </p>
          <h2 className="mt-2 text-[1.35rem] font-black tracking-[-0.05em] text-[#0f172a]">
            {booking.serviceLabel}
          </h2>
          <p className="mt-1 text-[13px] text-[#64748b]">{booking.customerName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f7f6] text-[#64748b]"
          aria-label="Close booking details"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[18px] border border-[#eee5f7] bg-[#fcfaff] p-4">
          <CalendarDays className="h-4 w-4 text-[#8E5EB5]" />
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
            Date
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[#1f1630]">
            {formatDateLabel(booking.scheduledDate)}
          </p>
        </div>
        <div className="rounded-[18px] border border-[#eee5f7] bg-[#fcfaff] p-4">
          <Clock3 className="h-4 w-4 text-[#8E5EB5]" />
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
            Time
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[#1f1630]">
            {formatTimeLabel(booking.scheduledDate, booking.scheduledStartTime)} -{" "}
            {formatTimeLabel(booking.scheduledDate, booking.scheduledEndTime)}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="rounded-[18px] border border-[#eee5f7] bg-[#fcfaff] px-4 py-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8E5EB5]" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
                Location
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[#1f1630]">{booking.location}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[18px] border border-[#eee5f7] bg-[#fcfaff] px-4 py-3">
          <div className="flex items-start gap-3">
            <MessageCircleMore className="mt-0.5 h-4 w-4 shrink-0 text-[#8E5EB5]" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
                Customer Note
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[#1f1630]">
                {booking.customerNote || "No extra details from the customer."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isCanceledStatus(booking.bookingStatus) && (
        <div className="mt-4">
          <TaskPath steps={getTaskSteps(booking.bookingStatus)} />
        </div>
      )}

      {booking.bookingStatus === "pending" ? (
        <div className="mt-4 flex gap-3">
          <AppButton
            className="flex-1"
            tone="danger"
            disabled={actionBookingId === booking.id}
            onClick={() => onDecline(booking.id)}
          >
            Decline
          </AppButton>
          <AppButton
            className="flex-1"
            disabled={actionBookingId === booking.id}
            onClick={() => onAccept(booking.id)}
          >
            Accept
          </AppButton>
        </div>
      ) : null}

      {booking.bookingStatus === "accepted" ? (
        <div className="mt-4">
          <AppButton
            className="w-full"
            disabled={actionBookingId === booking.id}
            onClick={() => onOnTheWay(booking.id)}
          >
            Mark On The Way
          </AppButton>
        </div>
      ) : null}

      {booking.bookingStatus === "on_the_way" ? (
        <div className="mt-4">
          <AppButton
            className="w-full"
            disabled={actionBookingId === booking.id}
            onClick={() => onArrived(booking.id)}
          >
            Mark Arrived
          </AppButton>
        </div>
      ) : null}
    </section>
  );
}

export function ProviderBookingsScreen({
  initialBookingId = "",
}: {
  initialBookingId?: string;
}) {
  const router = useRouter();
  const state = useProviderAppData();
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookingId);
  const [tab, setTab] = useState<BookingTab>("all");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    setSelectedBookingId(initialBookingId);
  }, [initialBookingId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const queryBookingId = params.get("booking");
    const queryTab = params.get("tab");

    if (queryBookingId) {
      setSelectedBookingId(queryBookingId);
    }

    if (
      queryTab === "all" ||
      queryTab === "ongoing" ||
      queryTab === "pending" ||
      queryTab === "canceled" ||
      queryTab === "completes"
    ) {
      setTab(queryTab);
    }
  }, []);

  const todayKey = getTodayKey();
  const selectedBooking =
    state.bookings.find((booking) => booking.id === selectedBookingId) ?? null;
  const monthLabel = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const cells: Array<{ label: number | null; key: string | null }> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({ label: null, key: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    cells.push({ label: day, key });
  }

  const dateContext =
    selectedDate < todayKey ? "past" : selectedDate > todayKey ? "future" : "current";

  const tabOptions = (() => {
    if (dateContext === "past") {
      return [
        ["all", "All"],
        ["completes", "Completed"],
        ["canceled", "Canceled"],
      ] as Array<[BookingTab, string]>;
    }

    if (dateContext === "future") {
      return [
        ["pending", "Pending"],
        ["canceled", "Canceled"],
        ["all", "All"],
      ] as Array<[BookingTab, string]>;
    }

    return [
      ["ongoing", "On Going"],
      ["pending", "Pending"],
      ["canceled", "Canceled"],
      ["completes", "Completed"],
    ] as Array<[BookingTab, string]>;
  })();
  const activeTab = tabOptions.some(([value]) => value === tab) ? tab : tabOptions[0][0];

  const items = state.bookings.filter((booking) => {
    if (booking.scheduledDate !== selectedDate) {
      return false;
    }

    if (activeTab === "pending") {
      return booking.bucket === "requests" || booking.bookingStatus === "pending";
    }

    if (activeTab === "ongoing") {
      return isOngoingStatus(booking.bookingStatus);
    }

    if (activeTab === "canceled") {
      return isCanceledStatus(booking.bookingStatus);
    }

    if (activeTab === "completes") {
      return isCompletedStatus(booking.bookingStatus);
    }

    return true;
  });

  const pendingCount = state.bookings.filter(
    (booking) => booking.bucket === "requests" || booking.bookingStatus === "pending",
  ).length;

  function openBooking(bookingId: string) {
    setSelectedBookingId(bookingId);
    router.push(`/provider/bookings/${bookingId}`, { scroll: false });
  }

  function closeBooking() {
    setSelectedBookingId("");
    router.push("/provider/bookings", { scroll: false });
  }

  function handleAccept(bookingId: string) {
    state.handleBookingAction(bookingId, "accepted", "Provider accepted booking");
  }

  function handleDecline(bookingId: string) {
    state.handleBookingAction(bookingId, "declined", "Provider declined booking");
  }

  function handleOnTheWay(bookingId: string) {
    state.handleBookingAction(bookingId, "on_the_way", "Provider started travel to customer");
  }

  function handleArrived(bookingId: string) {
    state.handleBookingAction(bookingId, "arrived", "Provider arrived at customer location");
  }

  if (state.loading) {
    return (
      <MobilePage className="pb-28">
        <LoadingState
          title="Loading bookings"
          description="We are preparing your provider booking workspace."
        />
        <ProviderBottomNav />
      </MobilePage>
    );
  }

  if (!state.data) {
    return (
      <MobilePage className="pb-28">
        <section className="rounded-[28px] border border-[#dbe8df] bg-white p-5 shadow-[0_20px_60px_rgba(22,163,74,0.08)]">
          <h1 className="text-[28px] font-extrabold tracking-[-0.05em] text-[#16a34a]">
            Provider Bookings
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[#6b7280]">
            {state.error || "We couldn't load your bookings right now."}
          </p>
          <AppButton className="mt-6" href="/provider/profile">
            Back to profile
          </AppButton>
        </section>
        <ProviderBottomNav />
      </MobilePage>
    );
  }

  return (
    <MobilePage className="pb-28">
      <section className="space-y-4">
        <header className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(86,38,135,0.08)] ring-1 ring-[#eee5f7]">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#8E5EB5]">
            Provider App
          </p>
          <h1 className="mt-2 text-[1.9rem] font-black tracking-[-0.06em] text-[#1f1630]">
            Bookings
          </h1>
          <p className="mt-1 text-[13px] leading-6 text-[#7b728a]">
            Select a date, review request cards, and open full booking details.
          </p>
        </header>

        <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className="flex w-full items-start justify-between gap-3 text-left"
          >
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#8E5EB5]">
                Provider Flow
              </p>
              <h2 className="mt-2 text-[1.35rem] font-black tracking-[-0.05em] text-[#1f1630]">
                New Task Requests
              </h2>
              <p className="mt-1 text-[13px] leading-6 text-[#7b728a]">
                Open request cards and accept or decline from the details panel.
              </p>
            </div>
            <div className="rounded-[18px] bg-[#f7f1fc] px-4 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8E5EB5]">
                Pending
              </p>
              <p className="mt-1 text-[1.5rem] font-black text-[#1f1630]">{pendingCount}</p>
            </div>
          </button>
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

        {selectedBooking ? (
          <BookingDetails
            booking={selectedBooking}
            actionBookingId={state.actionBookingId}
            onClose={closeBooking}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onOnTheWay={handleOnTheWay}
            onArrived={handleArrived}
          />
        ) : null}

        <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
          <div className="rounded-[20px] border border-[#eee5f7] bg-[#fcfaff] p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8E5EB5]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-center">
                <p className="text-[15px] font-black text-[#1f1630]">{monthLabel}</p>
                <p className="mt-1 text-[12px] text-[#7b728a]">
                  Select a date to load booking cards below.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8E5EB5]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-[#94a3b8]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-2">
              {cells.map((cell, index) => {
                const count = cell.key
                  ? state.bookings.filter((booking) => booking.scheduledDate === cell.key).length
                  : 0;
                const isActive = cell.key === selectedDate;

                return (
                  <button
                    key={cell.key ?? `provider-bookings-calendar-${index}`}
                    type="button"
                    disabled={!cell.key}
                    onClick={() => {
                      if (cell.key) {
                        setSelectedDate(cell.key);
                      }
                    }}
                    className={`flex h-14 flex-col items-center justify-center rounded-[14px] text-[12px] font-bold ${
                      isActive
                        ? "bg-[#8E5EB5] text-white"
                        : "bg-white text-[#1f1630] disabled:bg-transparent disabled:text-transparent"
                    }`}
                  >
                    <span>{cell.label}</span>
                    {cell.key ? (
                      <span
                        className={`mt-1 text-[10px] ${
                          isActive ? "text-white/85" : count > 0 ? "text-[#8E5EB5]" : "text-[#c4b7d8]"
                        }`}
                      >
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tabOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`inline-flex min-h-[44px] items-center justify-center rounded-[14px] px-5 py-2.5 text-[13px] font-medium transition ${
                  activeTab === value
                    ? "border border-[#e8d9fb] bg-white text-[#8E5EB5] shadow-[0_10px_20px_rgba(142,94,181,0.10)]"
                    : "bg-[#f7f1fc] text-[#746b88]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <EmptyState
                title="No bookings found"
                description="No bookings match the selected date and status."
                icon={<CalendarDays className="h-6 w-6" />}
              />
            ) : (
              items.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-[22px] border border-[#eee5f7] bg-[#fcfaff] p-4 shadow-[0_10px_24px_rgba(86,38,135,0.05)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                      <p className="mt-1 text-[13px] text-[#475569]">{booking.customerName}</p>
                    </div>
                    <StatusBadge
                      label={booking.statusLabel}
                      tone={providerStatusTone(booking.bookingStatus)}
                    />
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
                  </div>

                  <div className="mt-4 flex gap-3">
                    <AppButton className="flex-1" tone="secondary" onClick={() => openBooking(booking.id)}>
                      View Details
                    </AppButton>

                    {booking.bookingStatus === "pending" ? (
                      <>
                        <AppButton
                          className="flex-1"
                          tone="danger"
                          disabled={state.actionBookingId === booking.id}
                          onClick={() => handleDecline(booking.id)}
                        >
                          Decline
                        </AppButton>
                        <AppButton
                          className="flex-1"
                          disabled={state.actionBookingId === booking.id}
                          onClick={() => handleAccept(booking.id)}
                        >
                          Accept
                        </AppButton>
                      </>
                    ) : booking.bookingStatus === "accepted" ? (
                      <AppButton
                        className="flex-1"
                        disabled={state.actionBookingId === booking.id}
                        onClick={() => handleOnTheWay(booking.id)}
                      >
                        On The Way
                      </AppButton>
                    ) : booking.bookingStatus === "on_the_way" ? (
                      <AppButton
                        className="flex-1"
                        disabled={state.actionBookingId === booking.id}
                        onClick={() => handleArrived(booking.id)}
                      >
                        Arrived
                      </AppButton>
                    ) : (
                      <div className="flex flex-1 items-center rounded-[14px] bg-white px-4 text-[13px] font-semibold text-[#64748b]">
                        {booking.bookingStatus === "arrived"
                          ? "Waiting final amount step"
                          : isCompletedStatus(booking.bookingStatus)
                            ? "Completed flow"
                            : isCanceledStatus(booking.bookingStatus)
                              ? "Canceled flow"
                              : "Live task"}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
      <ProviderBottomNav />
    </MobilePage>
  );
}
