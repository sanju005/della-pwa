"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";
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
import { BookingMessagesPanel } from "@/app/_components/booking-messages-panel";
import { getFirebaseClientConfig } from "@/lib/firebase";
import {
  disablePushNotifications,
  getLastPushError,
  getPushSetupState,
  getPushSupportDiagnostics,
  requestNotificationPermission,
  saveFCMToken,
  type PushSupportDiagnostics,
  type PushSetupState,
} from "@/lib/notifications";
import { getSupabaseClient } from "@/lib/supabase";
import { serviceSpecialties } from "@/lib/provider-registration-config";
import { isPaymentProofMimeType, PAYMENT_PROOF_MAX_BYTES, readFileAsDataUrl } from "@/lib/upload-proof";

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

const PROVIDER_SERVICE_OPTIONS = Object.keys(serviceSpecialties);

function normalizeServiceFormValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

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

function isPdfProof(mimeType?: string, fileName?: string) {
  return mimeType === "application/pdf" || fileName?.toLowerCase().endsWith(".pdf");
}

function ProofPreviewCard({
  title,
  dataUrl,
  fileName,
  mimeType,
}: {
  title: string;
  dataUrl?: string;
  fileName?: string;
  mimeType?: string;
}) {
  if (!dataUrl) {
    return null;
  }

  return (
    <div className="rounded-[18px] border border-[#eee5f7] bg-[#fcfaff] p-4">
      <p className="text-[13px] font-semibold text-[#111827]">{title}</p>
      {isPdfProof(mimeType, fileName) ? (
        <div className="mt-3 rounded-[14px] border border-dashed border-[#d9c7ef] bg-white px-4 py-4 text-[13px] text-[#6d6480]">
          PDF proof attached: {fileName || "Payment proof.pdf"}
        </div>
      ) : (
        <img
          src={dataUrl}
          alt={fileName || title}
          className="mt-3 h-40 w-full rounded-[14px] object-cover"
        />
      )}
      {fileName ? (
        <p className="mt-2 text-[12px] text-[#6d6480]">{fileName}</p>
      ) : null}
    </div>
  );
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
        <header className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(86,38,135,0.08)] ring-1 ring-[#eee5f7]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#8E5EB5]">
                Provider App
              </p>
              <h1 className="mt-2 text-[1.9rem] font-black tracking-[-0.06em] text-[#1f1630]">
                {title}
              </h1>
              <p className="mt-1 text-[13px] leading-6 text-[#7b728a]">{subtitle}</p>
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
  accent = "text-[#8E5EB5]",
}: {
  label: string;
  value: string;
  meta: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#eee5f7] bg-[#fcfaff] p-4 shadow-[0_10px_20px_rgba(86,38,135,0.05)]">
      <p className={`text-[1.2rem] font-black tracking-[-0.05em] ${accent}`}>{value}</p>
      <p className="mt-1 text-[12px] font-semibold text-[#544b66]">{label}</p>
      <p className="mt-1 text-[11px] text-[#9a90ac]">{meta}</p>
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
    <div className="rounded-[18px] border border-[#eee5f7] bg-white p-4 shadow-[0_8px_18px_rgba(86,38,135,0.04)]">
      <div className="text-[#8E5EB5]">{icon}</div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold text-[#1f1630]">{value}</p>
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
    <div className="rounded-[18px] border border-[#eee5f7] bg-white px-4 py-3 shadow-[0_8px_18px_rgba(86,38,135,0.04)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
            {label}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[#1f1630]">{value}</p>
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
    <div className="rounded-[16px] border border-[#f0e6fb] bg-white px-3 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8E5EB5]">
        Task Path
      </p>
      <div className="mt-3 space-y-4">
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
                  <span className="text-[11px] font-bold">✓</span>
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

function ProviderPushNotificationsCard() {
  const [pushState, setPushState] = useState<PushSetupState>({
    permission: "default",
    hasSavedToken: false,
  });
  const [diagnostics, setDiagnostics] = useState<PushSupportDiagnostics | null>(null);
  const [clientDebug, setClientDebug] = useState<{
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    href: string;
    origin: string;
    isStandalone: boolean;
    userAgent: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    if (typeof window !== "undefined") {
      const media = window.matchMedia("(display-mode: standalone)");
      const isStandalone =
        media.matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

      setClientDebug({
        ...getFirebaseClientConfig(),
        href: window.location.href,
        origin: window.location.origin,
        isStandalone,
        userAgent: window.navigator.userAgent,
      });
    }

    void Promise.all([getPushSetupState(), getPushSupportDiagnostics()]).then(
      ([state, support]) => {
        if (!active) {
          return;
        }

        setPushState(state);
        setDiagnostics(support);
      }
    );

    return () => {
      active = false;
    };
  }, []);

  async function onEnable() {
    setBusy(true);
    setNotice("");

    try {
      const token = await requestNotificationPermission();
      const support = await getPushSupportDiagnostics();
      setDiagnostics(support);

        if (!token) {
          const state = await getPushSetupState();
          setPushState(state);
          setNotice(
            support.permission === "unsupported"
              ? "Push is not supported on this device/browser for the current web environment."
              : support.permission === "denied"
                ? "Push is blocked in this browser. Please allow notifications in browser settings."
                : support.permission === "granted"
                  ? getLastPushError()
                    ? `Browser permission is granted, but Firebase could not create a push token. ${getLastPushError()}`
                    : "Browser permission is granted, but Firebase could not create a push token. Please check the Device Check values below."
                  : "Push permission was dismissed or not granted yet."
          );
          return;
        }

      const result = await saveFCMToken(token);

      if (!result.success) {
        setNotice(result.error || "Unable to save this device for push notifications.");
        return;
      }

      setPushState({
        permission: "granted",
        hasSavedToken: true,
      });
      setNotice("Push notifications enabled on this device.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to enable push notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function onDisable() {
    setBusy(true);
    setNotice("");

    try {
      const result = await disablePushNotifications();

      if (!result.success) {
        setNotice(result.error || "Unable to disable push notifications.");
        return;
      }

      const [state, support] = await Promise.all([
        getPushSetupState(),
        getPushSupportDiagnostics(),
      ]);
      setPushState(state);
      setDiagnostics(support);
      setNotice("Push notifications disabled for this device.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to disable push notifications.");
    } finally {
      setBusy(false);
    }
  }

  const enabled = pushState.permission === "granted" && pushState.hasSavedToken;

  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.1rem] font-black tracking-[-0.04em] text-[#0f172a]">
            Push Notifications
          </h3>
          <p className="mt-1 text-[12px] text-[#64748b]">
            Enable browser alerts for new bookings, payments, and customer updates.
          </p>
        </div>
        <Bell className="h-5 w-5 text-[#16a34a]" />
      </div>

        <div className="mt-4 rounded-[18px] border border-[#e7eee8] bg-[#fbfffc] p-4">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
          Status
        </p>
        <p className="mt-2 text-[14px] font-semibold text-[#0f172a]">
          {enabled ? "Enabled on this device" : "Not enabled on this device"}
        </p>
        <p className="mt-1 text-[12px] text-[#64748b]">
          Browser permission: {pushState.permission}
        </p>
        </div>

        {diagnostics ? (
        <div className="mt-4 rounded-[18px] border border-[#e7eee8] bg-white p-4 text-[12px] text-[#475569]">
          <p className="font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
            Device Check
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <p>Window: {diagnostics.hasWindow ? "yes" : "no"}</p>
            <p>Notification API: {diagnostics.hasNotificationApi ? "yes" : "no"}</p>
            <p>Service Worker: {diagnostics.hasServiceWorkerApi ? "yes" : "no"}</p>
            <p>Push Manager: {diagnostics.hasPushManagerApi ? "yes" : "no"}</p>
            <p>IndexedDB: {diagnostics.hasIndexedDb ? "yes" : "no"}</p>
            <p>Permission: {diagnostics.permission}</p>
          </div>
          </div>
        ) : null}

        {clientDebug ? (
          <div className="mt-4 rounded-[18px] border border-[#e7eee8] bg-[#fffdf7] p-4 text-[12px] text-[#475569]">
            <p className="font-bold uppercase tracking-[0.12em] text-[#b08900]">
              Firebase Debug
            </p>
            <div className="mt-2 space-y-1 break-all">
              <p>projectId: {clientDebug.projectId || "(empty)"}</p>
              <p>authDomain: {clientDebug.authDomain || "(empty)"}</p>
              <p>storageBucket: {clientDebug.storageBucket || "(empty)"}</p>
              <p>messagingSenderId: {clientDebug.messagingSenderId || "(empty)"}</p>
              <p>appId: {clientDebug.appId || "(empty)"}</p>
              <p>apiKey: {clientDebug.apiKey ? `${clientDebug.apiKey.slice(0, 10)}...` : "(empty)"}</p>
              <p>origin: {clientDebug.origin}</p>
              <p>href: {clientDebug.href}</p>
              <p>standalone: {clientDebug.isStandalone ? "yes" : "no"}</p>
              <p>userAgent: {clientDebug.userAgent}</p>
            </div>
          </div>
        ) : null}

        {notice ? (
        <p className="mt-4 rounded-[16px] border border-[#d8ebdf] bg-[#f6fcf7] px-4 py-3 text-[13px] font-semibold text-[#166534]">
          {notice}
        </p>
      ) : null}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onEnable()}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#16a34a] px-4 text-[13px] font-extrabold text-white disabled:opacity-60"
        >
          {busy ? "Updating..." : enabled ? "Enable Again" : "Enable Push"}
        </button>
        <button
          type="button"
          disabled={busy || !enabled}
          onClick={() => void onDisable()}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] border border-[#d8ebdf] bg-white px-4 text-[13px] font-extrabold text-[#166534] disabled:opacity-60"
        >
          Disable Push
        </button>
      </div>
    </section>
  );
}

export function DashboardScreen() {
  const state = useProviderAppData();
  const [taskCalendarMonth, setTaskCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [taskCalendarDate, setTaskCalendarDate] = useState(getTodayKey());
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  async function handleSendFinalAmount(booking: ProviderBookingItem) {
    const input = window.prompt(
      "Enter final amount (RM) to send to the customer.",
      String(booking.quotedAmount || booking.baseAmount || 0),
    );

    if (input === null) {
      return;
    }

    const finalAmount = Number(input);

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      state.setError("Final amount must be a valid number.");
      return;
    }

    const note = window.prompt(
      "Optional payment note for customer",
      booking.providerResponseNote || "Please review and confirm the final cash amount.",
    );

    if (note === null) {
      return;
    }

    state.handleBookingAction(
      booking.id,
      "completed",
      note.trim(),
      { finalAmount },
    );
  }

  const data = state.data!;
  const pendingRequest = state.bookings.find((booking) => booking.bucket === "requests") ?? null;
  const newTasks = state.bookings.filter(
    (booking) => booking.bucket === "requests" || booking.bookingStatus === "pending",
  );
  const acceptedBookings = state.bookings.filter((booking) => booking.bookingStatus === "accepted");
  const ongoingBookings = state.bookings.filter(
    (booking) => booking.bookingStatus === "on_the_way" || booking.bookingStatus === "arrived",
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
  const pendingTodayTasks = state.bookings.filter(
    (booking) =>
      booking.scheduledDate === todayKey &&
      (booking.bucket === "requests" || booking.bookingStatus === "pending"),
  );
  const completedBookings = state.bookings.filter((booking) =>
    ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
  );
  const canceledBookings = state.bookings.filter(
    (booking) => booking.bookingStatus === "declined" || booking.bookingStatus === "cancelled",
  );
  const collectedBookings = state.bookings.filter(
    (booking) =>
      booking.paymentStatus === "paid" ||
      ["paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
  );
  const walletBalance = collectedBookings.reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const companyPayable = collectedBookings
    .filter((booking) => booking.companyPaymentStatus !== "paid")
    .reduce((sum, booking) => sum + booking.companyCommissionAmount, 0);
  const todayEarnings = todayBookings
    .filter((booking) =>
      ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
    )
    .reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const taskCalendarMonthLabel = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(taskCalendarMonth);
  const taskCalendarMonthStart = new Date(taskCalendarMonth.getFullYear(), taskCalendarMonth.getMonth(), 1);
  const taskCalendarMonthEnd = new Date(taskCalendarMonth.getFullYear(), taskCalendarMonth.getMonth() + 1, 0);
  const taskCalendarFirstWeekday = taskCalendarMonthStart.getDay();
  const taskCalendarDaysInMonth = taskCalendarMonthEnd.getDate();
  const taskCalendarCells: Array<{ label: number | null; key: string | null }> = [];

  for (let index = 0; index < taskCalendarFirstWeekday; index += 1) {
    taskCalendarCells.push({ label: null, key: null });
  }

  for (let day = 1; day <= taskCalendarDaysInMonth; day += 1) {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(taskCalendarMonth.getFullYear(), taskCalendarMonth.getMonth(), day));
    taskCalendarCells.push({ label: day, key });
  }

  const taskCalendarBookingCount = (dateKey: string) =>
    state.bookings.filter((booking) => booking.scheduledDate === dateKey).length;

  const selectedDateTaskTime = new Date(`${taskCalendarDate}T00:00:00`).getTime();
  const todayTime = new Date(`${todayKey}T00:00:00`).getTime();
  const selectedDateTaskLabel =
    selectedDateTaskTime < todayTime
      ? "Completed tasks"
      : selectedDateTaskTime > todayTime
        ? "Upcoming tasks"
        : "Tasks for today";
  const selectedDateTasks = state.bookings
    .filter((booking) => {
      if (booking.scheduledDate !== taskCalendarDate) {
        return false;
      }

      if (selectedDateTaskTime < todayTime) {
        return ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus);
      }

      if (selectedDateTaskTime > todayTime) {
        return booking.bookingStatus === "accepted";
      }

      return booking.bookingStatus !== "declined" && booking.bookingStatus !== "cancelled";
    })
    .sort((left, right) =>
      `${left.scheduledDate}T${left.scheduledStartTime}`.localeCompare(
        `${right.scheduledDate}T${right.scheduledStartTime}`,
      ),
    );
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

          <div className="mt-5 overflow-hidden rounded-[22px] border border-[#e7def4] bg-[linear-gradient(135deg,#ffffff_0%,#f8f3fd_100%)] p-4 shadow-[0_16px_36px_rgba(104,63,155,0.1)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#8E5EB5]">
                  Wallet Balance
                </p>
                <p className="mt-2 text-[1.85rem] font-black tracking-[-0.06em] text-[#1f1630]">
                  {formatCurrency(walletBalance)}
                </p>
                <p className="mt-1 text-[12px] text-[#7c728f]">
                  Full amount collected from customers
                </p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#edf7ee] text-[#22c55e]">
                <Wallet className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-4 rounded-[18px] border border-[#ede4f8] bg-white/90 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8E5EB5]">
                    Payable to Company
                  </p>
                  <p className="mt-1 text-[1.3rem] font-black tracking-[-0.05em] text-[#1f1630]">
                    {formatCurrency(companyPayable)}
                  </p>
                </div>
                <span className="rounded-full bg-[#f5f1fa] px-3 py-1 text-[11px] font-bold text-[#8E5EB5]">
                  DELLA
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/provider/payments"
                className="inline-flex h-11 items-center justify-center rounded-[14px] bg-[#8E5EB5] px-4 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(142,94,181,0.18)]"
              >
                Withdraw
              </Link>
              <Link
                href="/provider/payments"
                className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#d9c8ee] bg-white px-4 text-[14px] font-extrabold text-[#8E5EB5]"
              >
                Pay to Company
              </Link>
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
          <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-[#8E5EB5]" />
            <div>
              <h2 className="text-[17px] font-black tracking-[-0.04em] text-[#0f172a]">
                Today&apos;s Task
              </h2>
              <p className="mt-1 text-[12px] text-[#7b728a]">Total task of the day</p>
            </div>
          </div>

            <Link
              href={
                pendingRequest
                  ? `/provider/bookings?tab=pending&booking=${pendingRequest.id}`
                  : "/provider/bookings?tab=pending"
              }
              className="relative mt-5 block overflow-hidden rounded-[22px] border border-[#eadcf7] bg-[linear-gradient(135deg,#ffffff_0%,#fcfaff_72%,#f3eafd_100%)] p-5 shadow-[0_12px_28px_rgba(142,94,181,0.08)]"
            >
            <div className="absolute -bottom-10 -right-6 h-28 w-36 rounded-full bg-[radial-gradient(circle,rgba(179,136,235,0.18)_0%,rgba(179,136,235,0)_72%)]" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-20 w-20 items-center justify-center rounded-[20px] bg-[#f5effd] text-[#7c3aed]">
                  <BriefcaseBusiness className="h-9 w-9" />
                </span>
                <div>
                  <p className="text-[2.2rem] font-black leading-none tracking-[-0.07em] text-[#6d28d9]">
                    {newTasks.length}
                  </p>
                  <p className="mt-2 text-[14px] font-black text-[#1f1630]">New Task</p>
                  <p className="mt-1 text-[13px] leading-6 text-[#7b728a]">
                    Reviewing and accepting new requests
                  </p>
                </div>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f5effd] text-[#7c3aed]">
                <ChevronRight className="h-5 w-5" />
              </span>
            </div>
          </Link>

          <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/provider/bookings?tab=ongoing"
                className="relative overflow-hidden rounded-[20px] border border-[#eadcf7] bg-[linear-gradient(135deg,#ffffff_0%,#fcfaff_72%,#f3eafd_100%)] p-3.5 shadow-[0_10px_20px_rgba(142,94,181,0.05)]"
              >
              <div className="absolute -bottom-8 -right-4 h-20 w-24 rounded-full bg-[radial-gradient(circle,rgba(179,136,235,0.15)_0%,rgba(179,136,235,0)_72%)]" />
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f5effd] text-[#7c3aed]">
                <Clock3 className="h-6 w-6" />
              </span>
              <p className="relative mt-4 text-[1.55rem] font-black leading-none tracking-[-0.06em] text-[#6d28d9]">{ongoingBookings.length}</p>
              <p className="relative mt-2 text-[14px] font-black text-[#1f1630]">On Going</p>
              <p className="relative mt-1 text-[11px] leading-5 text-[#7b728a]">Take live task actions</p>
            </Link>
              <Link
                href="/provider/bookings?tab=pending"
                className="relative overflow-hidden rounded-[20px] border border-[#eadcf7] bg-[linear-gradient(135deg,#ffffff_0%,#fcfaff_72%,#f3eafd_100%)] p-3.5 shadow-[0_10px_20px_rgba(142,94,181,0.05)]"
              >
              <div className="absolute -bottom-8 -right-4 h-20 w-24 rounded-full bg-[radial-gradient(circle,rgba(179,136,235,0.15)_0%,rgba(179,136,235,0)_72%)]" />
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f5effd] text-[#7c3aed]">
                <Bell className="h-6 w-6" />
              </span>
              <p className="relative mt-4 text-[1.55rem] font-black leading-none tracking-[-0.06em] text-[#6d28d9]">{pendingTodayTasks.length}</p>
              <p className="relative mt-2 text-[14px] font-black text-[#1f1630]">Pending Task</p>
              <p className="relative mt-1 text-[11px] leading-5 text-[#7b728a]">Pending for today</p>
            </Link>
              <Link
                href="/provider/bookings?tab=completes"
                className="relative overflow-hidden rounded-[20px] border border-[#eadcf7] bg-[linear-gradient(135deg,#ffffff_0%,#fcfaff_72%,#f3eafd_100%)] p-3.5 shadow-[0_10px_20px_rgba(142,94,181,0.05)]"
              >
              <div className="absolute -bottom-8 -right-4 h-20 w-24 rounded-full bg-[radial-gradient(circle,rgba(179,136,235,0.15)_0%,rgba(179,136,235,0)_72%)]" />
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f5effd] text-[#7c3aed]">
                <CalendarDays className="h-6 w-6" />
              </span>
              <p className="relative mt-4 text-[1.55rem] font-black leading-none tracking-[-0.06em] text-[#6d28d9]">{completedBookings.length}</p>
              <p className="relative mt-2 text-[14px] font-black text-[#1f1630]">Completed</p>
              <p className="relative mt-1 text-[11px] leading-5 text-[#7b728a]">Open finished task details</p>
            </Link>
            <Link
              href="/provider/bookings?tab=canceled"
              className="relative overflow-hidden rounded-[20px] border border-[#eadcf7] bg-[linear-gradient(135deg,#ffffff_0%,#fcfaff_72%,#f3eafd_100%)] p-3.5 shadow-[0_10px_20px_rgba(142,94,181,0.05)]"
            >
              <div className="absolute -bottom-8 -right-4 h-20 w-24 rounded-full bg-[radial-gradient(circle,rgba(179,136,235,0.15)_0%,rgba(179,136,235,0)_72%)]" />
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f5effd] text-[#7c3aed]">
                <Bell className="h-6 w-6" />
              </span>
              <p className="relative mt-4 text-[1.55rem] font-black leading-none tracking-[-0.06em] text-[#6d28d9]">{canceledBookings.length}</p>
              <p className="relative mt-2 text-[14px] font-black text-[#1f1630]">Cancelled</p>
              <p className="relative mt-1 text-[11px] leading-5 text-[#7b728a]">View cancelled tasks</p>
            </Link>
          </div>

          <div className="mt-4 rounded-[20px] border border-[#eee5f7] bg-[#fcfaff] p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setTaskCalendarMonth(new Date(taskCalendarMonth.getFullYear(), taskCalendarMonth.getMonth() - 1, 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8E5EB5]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-center">
                <p className="text-[15px] font-black text-[#1f1630]">{taskCalendarMonthLabel}</p>
                <p className="mt-1 text-[12px] text-[#7b728a]">
                  Select a date to view past or upcoming tasks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTaskCalendarMonth(new Date(taskCalendarMonth.getFullYear(), taskCalendarMonth.getMonth() + 1, 1))}
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
              {taskCalendarCells.map((cell, index) => {
                const count = cell.key ? taskCalendarBookingCount(cell.key) : 0;
                const isActive = cell.key === taskCalendarDate;

                return (
                  <button
                    key={cell.key ?? `task-calendar-${index}`}
                    type="button"
                    disabled={!cell.key}
                    onClick={() => cell.key && setTaskCalendarDate(cell.key)}
                    className={`flex h-14 flex-col items-center justify-center rounded-[14px] text-[12px] font-bold ${
                      isActive
                        ? "bg-[#8E5EB5] text-white"
                        : "bg-white text-[#1f1630] disabled:bg-transparent disabled:text-transparent"
                    }`}
                  >
                    <span>{cell.label}</span>
                    {cell.key ? (
                      <span className={`mt-1 text-[10px] ${isActive ? "text-white/85" : count > 0 ? "text-[#8E5EB5]" : "text-[#c4b7d8]"}`}>
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-[18px] border border-[#e7eee8] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-black text-[#0f172a]">{formatDateLabel(taskCalendarDate)}</h3>
                  <p className="mt-1 text-[12px] text-[#64748b]">{selectedDateTaskLabel}</p>
                </div>
                <span className="rounded-full bg-[#f5f1fa] px-3 py-1 text-[11px] font-bold text-[#8E5EB5]">
                  {selectedDateTasks.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {selectedDateTasks.length === 0 ? (
                  <EmptyState
                    title="No tasks on this date"
                    description="Choose another date to view completed or upcoming tasks."
                    icon={<Calendar className="h-6 w-6" />}
                  />
                ) : (
                  selectedDateTasks.slice(0, 3).map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/provider/bookings/${booking.id}`}
                      className="block rounded-[18px] border border-[#e7eee8] bg-[#fbfffc] p-3 transition hover:border-[#d9c8ee] hover:shadow-[0_10px_24px_rgba(142,94,181,0.06)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                          <p className="mt-1 truncate text-[12px] text-[#64748b]">{booking.customerName}</p>
                        </div>
                        <StatusBadge label={booking.statusLabel} tone={providerStatusTone(booking.bookingStatus)} />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[12px] text-[#475569]">
                        <Clock3 className="h-4 w-4 text-[#8E5EB5]" />
                        <span>{formatTimeLabel(booking.scheduledDate, booking.scheduledStartTime)}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
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
                Recent Reviews
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Latest customer feedback from your completed jobs.
              </p>
            </div>
            <Link href="/provider/reviews" className="text-[13px] font-bold text-[#16a34a]">
              View all
            </Link>
          </div>
          <div className="mt-4">
            {state.reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                description="Customer feedback will appear here once completed bookings are reviewed."
                icon={<Star className="h-6 w-6" />}
              />
            ) : (
              <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
                {state.reviews.slice(0, 8).map((review) => (
                  <div
                    key={review.id}
                    className="min-w-[17rem] snap-start rounded-[22px] border border-[#eee5f7] bg-[linear-gradient(135deg,#ffffff_0%,#fcfaff_72%,#f3eafd_100%)] p-4 shadow-[0_10px_24px_rgba(86,38,135,0.05)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-black text-[#0f172a]">{review.customerName}</p>
                        <p className="mt-1 text-[12px] text-[#64748b]">{review.createdLabel}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[#8E5EB5]">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={`${review.id}-${index}`} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-4 text-[13px] leading-6 text-[#475569]">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
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
  const [tab, setTab] = useState<"all" | "ongoing" | "upcoming" | "pending" | "canceled" | "completes">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "calendar">("all");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [calendarDate, setCalendarDate] = useState(getTodayKey());
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookingId);
  const [commissionProofDataUrl, setCommissionProofDataUrl] = useState("");
  const [commissionProofFileName, setCommissionProofFileName] = useState("");
  const [commissionProofMimeType, setCommissionProofMimeType] = useState("");

  useEffect(() => {
    setSelectedBookingId(initialBookingId);
  }, [initialBookingId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const queryTab = params.get("tab");
    const queryBookingId = params.get("booking");

    if (
      queryTab === "all" ||
      queryTab === "ongoing" ||
      queryTab === "upcoming" ||
      queryTab === "pending" ||
      queryTab === "canceled" ||
      queryTab === "completes"
    ) {
      setTab(queryTab);
    }

    if (queryBookingId) {
      setSelectedBookingId(queryBookingId);
    }
  }, []);

  const selectedBooking =
    state.bookings.find((booking) => booking.id === selectedBookingId) ?? null;
  const selectedBookingReview = selectedBooking
    ? state.reviews.find((review) => review.customerName === selectedBooking.customerName) ?? null
    : null;

  useEffect(() => {
    if (!selectedBooking) {
      return;
    }

    const bookingTab = getBookingTab(selectedBooking);
    setTab(bookingTab);
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

  async function handleSendFinalAmount(booking: ProviderBookingItem) {
    const input = window.prompt(
      "Enter final amount (RM) to send to the customer.",
      String(booking.quotedAmount || booking.baseAmount || 0),
    );

    if (input === null) {
      return;
    }

    const finalAmount = Number(input);

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      state.setError("Final amount must be a valid number.");
      return;
    }

    const note = window.prompt(
      "Optional payment note for customer",
      booking.providerResponseNote || "Please review and confirm the final cash amount.",
    );

    if (note === null) {
      return;
    }

    state.handleBookingAction(
      booking.id,
      "completed",
      note.trim(),
      { finalAmount },
    );
  }

  async function handleCommissionProofChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > PAYMENT_PROOF_MAX_BYTES) {
      state.setError("Commission proof must be 5MB or smaller.");
      return;
    }

    if (!isPaymentProofMimeType(file.type)) {
      state.setError("Commission proof must be JPG, PNG, GIF, WebP, or PDF.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCommissionProofDataUrl(dataUrl);
      setCommissionProofFileName(file.name);
      setCommissionProofMimeType(file.type);
      state.setError("");
    } catch {
      state.setError("Unable to read the commission proof file.");
    }
  }

  const todayKey = getTodayKey();
  const calendarMonthLabel = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const calendarCells: Array<{ label: number | null; key: string | null }> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    calendarCells.push({ label: null, key: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    calendarCells.push({ label: day, key });
  }

  const bookingCountForDate = (dateKey: string) =>
    state.bookings.filter((booking) => booking.scheduledDate === dateKey).length;

  const pendingBookings = state.bookings.filter(
    (booking) => booking.bucket === "requests" || booking.bookingStatus === "pending",
  );

  const activeDateContext =
    dateFilter === "today"
      ? "current"
      : dateFilter === "calendar"
        ? calendarDate < todayKey
          ? "past"
          : calendarDate > todayKey
            ? "future"
            : "current"
        : "all";

  const tabOptions =
    activeDateContext === "past"
      ? [
          ["all", "All"],
          ["completes", "Completed"],
          ["canceled", "Canceled"],
        ]
      : activeDateContext === "future"
        ? [
            ["all", "All"],
            ["upcoming", "Upcoming"],
            ["canceled", "Canceled"],
          ]
        : activeDateContext === "current"
          ? [
              ["all", "All"],
              ["ongoing", "On Going"],
              ["completes", "Completed"],
              ["canceled", "Canceled"],
            ]
          : [
              ["all", "All"],
              ["pending", "Pending"],
              ["upcoming", "Upcoming"],
              ["ongoing", "On Going"],
              ["completes", "Completed"],
              ["canceled", "Canceled"],
            ];

  useEffect(() => {
    if (!tabOptions.some(([value]) => value === tab)) {
      setTab(tabOptions[0][0] as typeof tab);
    }
  }, [tab, tabOptions]);

  const items = state.bookings.filter((booking) => {
    if (tab === "pending") {
      if (!(booking.bucket === "requests" || booking.bookingStatus === "pending")) {
        return false;
      }
    } else if (tab === "upcoming") {
      if (!(booking.bookingStatus === "accepted" && booking.scheduledDate >= todayKey)) {
        return false;
      }
    } else if (tab === "ongoing") {
      if (!["accepted", "on_the_way", "arrived"].includes(booking.bookingStatus)) {
        return false;
      }
    } else if (tab === "canceled") {
      if (!(booking.bookingStatus === "declined" || booking.bookingStatus === "cancelled")) {
        return false;
      }
    } else if (tab === "completes" && !["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus)) {
      return false;
    }

    if (dateFilter === "today") {
      return booking.scheduledDate === todayKey;
    }

    if (dateFilter === "calendar") {
      return booking.scheduledDate === calendarDate;
    }

    return true;
  });

  return (
    <PageShell
      title="Bookings"
      subtitle="Manage upcoming, canceled, and completed provider work."
    >
      <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
        <button
          type="button"
          onClick={() => {
            if (pendingBookings[0]) {
              setSelectedBookingId(pendingBookings[0].id);
              setTab("pending");
              router.push(`/provider/bookings?tab=pending&booking=${pendingBookings[0].id}`);
              return;
            }

            setTab("pending");
            router.push("/provider/bookings?tab=pending");
          }}
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#8E5EB5]">
              Provider Flow
            </p>
            <h2 className="mt-2 text-[1.35rem] font-black tracking-[-0.05em] text-[#1f1630]">
              Incoming Requests
            </h2>
            <p className="mt-1 text-[13px] leading-6 text-[#7b728a]">
              Open the task panel to accept requests and manage the live task process.
            </p>
          </div>
          <div className="rounded-[18px] bg-[#f7f1fc] px-4 py-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8E5EB5]">New Request</p>
            <p className="mt-1 text-[1.5rem] font-black text-[#1f1630]">
              {state.bookings.filter((booking) => booking.bookingStatus === "pending").length}
            </p>
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
        <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8E5EB5]">
                {selectedBooking.bookingStatus === "pending" ? "Booking Request" : "Task Details"}
              </p>
              <h2 className="mt-2 text-[1.45rem] font-black tracking-[-0.05em] text-[#0f172a]">
                {selectedBooking.serviceLabel}
              </h2>
              <p className="mt-1 text-[13px] text-[#64748b]">
                {selectedBooking.bookingStatus === "pending"
                  ? "Review the full request before you accept or decline it."
                  : "See full task details, path, payment proofs, images, review, and completion status."}
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

          <div className="mt-4 rounded-[20px] border border-[#eee5f7] bg-[#fcfaff] p-4">
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
                label="Service"
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
                <p className="text-[14px] font-extrabold text-[#0f172a]">Task Progress</p>
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
                  onClick={() => void handleSendFinalAmount(selectedBooking)}
                >
                  Send Final Amount
                </AppButton>
              </BookingActionBar>
            ) : null}

            {selectedBooking.bookingStatus === "completed" ? (
              <div className="mt-4 space-y-3">
                <p className="rounded-[16px] border border-[#d8f0dc] bg-[#f3fff6] px-4 py-3 text-[13px] font-semibold text-[#166534]">
                  Final cash amount sent to the customer. Waiting for customer cash confirmation.
                </p>
                <div className="rounded-[18px] border border-[#fde7d3] bg-[#fff7ed] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ea580c]">Commission After Payment</p>
                    <p className="text-[20px] font-black text-[#c2410c]">{formatCurrency(selectedBooking.companyCommissionAmount)}</p>
                  </div>
                  <p className="mt-2 text-[13px] text-[#9a3412]">
                    This 5% becomes payable only after the customer confirms the cash payment.
                  </p>
                </div>
              </div>
            ) : null}

            {["paid", "review_requested", "reviewed"].includes(selectedBooking.bookingStatus) ? (
              <div className="mt-4 space-y-3">
                <p className="rounded-[16px] border border-[#d8f0dc] bg-[#f3fff6] px-4 py-3 text-[13px] font-semibold text-[#166534]">
                  {selectedBooking.bookingStatus === "reviewed"
                    ? "Cash payment received and the customer review is completed."
                    : selectedBooking.bookingStatus === "review_requested"
                      ? "Cash payment received. The customer can leave a review now."
                      : "Cash payment received. The customer can now leave a review."}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-[#d8f0dc] bg-[#f3fff6] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#15803d]">Cash Collected</p>
                    <p className="mt-2 text-[22px] font-black text-[#166534]">{formatCurrency(selectedBooking.quotedAmount)}</p>
                  </div>
                  <div className="rounded-[18px] border border-[#fde7d3] bg-[#fff7ed] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ea580c]">Pending to Company</p>
                    <p className="mt-2 text-[22px] font-black text-[#c2410c]">{formatCurrency(selectedBooking.companyCommissionAmount)}</p>
                    <p className="mt-1 text-[12px] text-[#9a3412]">
                      {selectedBooking.companyPaymentStatus === "paid" ? "Commission paid" : "Commission unpaid"}
                    </p>
                  </div>
                </div>
                <ProofPreviewCard
                  title="Customer Payment Proof"
                  dataUrl={selectedBooking.customerPaymentProofDataUrl}
                  fileName={selectedBooking.customerPaymentProofFileName}
                  mimeType={selectedBooking.customerPaymentProofMimeType}
                />
                <ProofPreviewCard
                  title="Company Payment Proof"
                  dataUrl={selectedBooking.providerCompanyPaymentProofDataUrl || commissionProofDataUrl}
                  fileName={selectedBooking.providerCompanyPaymentProofFileName || commissionProofFileName}
                  mimeType={selectedBooking.providerCompanyPaymentProofMimeType || commissionProofMimeType}
                />
                {selectedBooking.companyPaymentStatus !== "paid" ? (
                  <div className="space-y-3">
                    <label className="block rounded-[16px] border border-dashed border-[#d9c7ef] bg-white px-4 py-3 text-[13px] font-semibold text-[#6d6480]">
                      Attach company payment proof (optional): transfer slip or receipt, JPG/PNG/GIF/WebP/PDF up to 5MB.
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,application/pdf,image/jpeg,image/png,image/gif,image/webp"
                        className="mt-3 block w-full text-[12px] text-[#6d6480]"
                        onChange={(event) => void handleCommissionProofChange(event)}
                      />
                    </label>
                    <BookingActionBar>
                      <AppButton
                        className="flex-1"
                        disabled={state.actionBookingId === selectedBooking.id}
                        onClick={() =>
                          void state.handleCommissionSettlement(selectedBooking.id, {
                            proofDataUrl: commissionProofDataUrl,
                            proofFileName: commissionProofFileName,
                            proofMimeType: commissionProofMimeType,
                          })
                        }
                      >
                        Pay / Settle Company Commission
                      </AppButton>
                    </BookingActionBar>
                  </div>
                ) : null}
              </div>
            ) : null}

            {(selectedBooking.paymentStatus || selectedBooking.paymentOption) &&
            !["paid", "review_requested", "reviewed"].includes(selectedBooking.bookingStatus) ? (
              <div className="mt-4 rounded-[18px] border border-[#ebe3f5] bg-white px-4 py-4">
                <p className="text-[14px] font-extrabold text-[#0f172a]">Payment Details</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <DetailMetric
                    label="Payment Status"
                    value={selectedBooking.paymentStatus || "Pending"}
                    icon={<Wallet className="h-4 w-4 text-[#8E5EB5]" />}
                  />
                  <DetailMetric
                    label="Payment Method"
                    value={selectedBooking.paymentOption === "cash" ? "Cash" : selectedBooking.paymentOption === "online" ? "Online" : "Not set"}
                    icon={<CreditCard className="h-4 w-4 text-[#8E5EB5]" />}
                  />
                  <DetailMetric
                    label="Base Amount"
                    value={formatCurrency(selectedBooking.baseAmount || selectedBooking.quotedAmount)}
                    icon={<Wallet className="h-4 w-4 text-[#8E5EB5]" />}
                  />
                  <DetailMetric
                    label="Final Amount"
                    value={formatCurrency(selectedBooking.quotedAmount)}
                    icon={<Wallet className="h-4 w-4 text-[#8E5EB5]" />}
                  />
                </div>
              </div>
            ) : null}

            {selectedBookingReview ? (
              <div className="mt-4 rounded-[18px] border border-[#ebe3f5] bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-extrabold text-[#0f172a]">Customer Review</p>
                    <p className="mt-1 text-[12px] text-[#64748b]">{selectedBookingReview.createdLabel}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#8E5EB5]">
                    {Array.from({ length: selectedBookingReview.rating }).map((_, index) => (
                      <Star key={`${selectedBookingReview.id}-${index}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-6 text-[#475569]">
                  {selectedBookingReview.comment}
                </p>
              </div>
            ) : selectedBooking.bookingStatus === "review_requested" || selectedBooking.bookingStatus === "reviewed" ? (
              <div className="mt-4 rounded-[18px] border border-[#ebe3f5] bg-white px-4 py-4">
                <p className="text-[14px] font-extrabold text-[#0f172a]">Customer Review</p>
                <p className="mt-2 text-[13px] text-[#64748b]">
                  {selectedBooking.bookingStatus === "reviewed"
                    ? "Review status is completed, but the review text is not linked in this task feed yet."
                    : "Waiting for the customer to submit a review for this task."}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["today", "Today"],
            ["calendar", "Calendar"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setDateFilter(value as typeof dateFilter);
                if (value === "today") {
                  setCalendarDate(todayKey);
                }
              }}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-[14px] px-5 py-2.5 text-[13px] font-medium transition ${
                dateFilter === value ? "border border-[#e8d9fb] bg-white text-[#8E5EB5] shadow-[0_10px_20px_rgba(142,94,181,0.10)]" : "bg-[#f7f1fc] text-[#746b88]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {dateFilter === "calendar" ? (
          <div className="mt-4 rounded-[20px] border border-[#eee5f7] bg-[#fcfaff] p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8E5EB5]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-center">
                <p className="text-[15px] font-black text-[#1f1630]">{calendarMonthLabel}</p>
                <p className="mt-1 text-[12px] text-[#7b728a]">Dates show the total number of bookings.</p>
              </div>
              <button
                type="button"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
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
              {calendarCells.map((cell, index) => {
                const count = cell.key ? bookingCountForDate(cell.key) : 0;
                const isActive = cell.key === calendarDate;

                return (
                  <button
                    key={cell.key ?? `bookings-calendar-${index}`}
                    type="button"
                    disabled={!cell.key}
                    onClick={() => cell.key && setCalendarDate(cell.key)}
                    className={`flex h-14 flex-col items-center justify-center rounded-[14px] text-[12px] font-bold ${
                      isActive ? "bg-[#8E5EB5] text-white" : "bg-white text-[#1f1630] disabled:bg-transparent disabled:text-transparent"
                    }`}
                  >
                    <span>{cell.label}</span>
                    {cell.key ? (
                      <span className={`mt-1 text-[10px] ${isActive ? "text-white/85" : count > 0 ? "text-[#8E5EB5]" : "text-[#c4b7d8]"}`}>
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {tabOptions.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as typeof tab)}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-[14px] px-5 py-2.5 text-[13px] font-medium transition ${
                tab === value ? "border border-[#e8d9fb] bg-white text-[#8E5EB5] shadow-[0_10px_20px_rgba(142,94,181,0.10)]" : "bg-[#f7f1fc] text-[#746b88]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <EmptyState
              title={
                tab === "pending"
                  ? "No pending requests"
                  : tab === "upcoming"
                  ? "No upcoming bookings"
                  : tab === "ongoing"
                    ? "No ongoing bookings"
                  : tab === "canceled"
                    ? "No canceled bookings"
                    : tab === "all"
                      ? "No bookings found"
                      : "No completed bookings"
              }
              description={
                dateFilter === "today"
                  ? "No bookings found for today in this section."
                  : dateFilter === "calendar"
                    ? "No bookings found for the selected calendar date."
                    : "This list will fill automatically as bookings move through their status."
              }
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
                    <Wallet className="h-4 w-4 text-[#8E5EB5]" />
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
                    <p className="text-[14px] font-extrabold text-[#0f172a]">Task Progress</p>
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
                {tab === "upcoming" ? (
                  <div className="mt-4 flex gap-3">
                      <AppButton
                        className="flex-1"
                        onClick={() => router.push("/provider/bookings?tab=ongoing")}
                      >
                        Manage In Task Panel
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
                        Mark On the Way
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
                        onClick={() => void handleSendFinalAmount(booking)}
                      >
                        Send Final Amount
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
                    <p className="flex-1 rounded-[14px] border border-[#d8f0dc] bg-[#f3fff6] px-4 py-3 text-[13px] font-semibold leading-5 text-[#166534]">
                      Waiting for customer cash confirmation.
                    </p>
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
            const totalBookings = cell.key
              ? state.bookings.filter((booking) => booking.scheduledDate === cell.key).length
              : 0;
            const isActive = cell.key === selectedDate;

            return (
              <button
                key={cell.key ?? `empty-${index}`}
                type="button"
                disabled={!cell.key}
                onClick={() => cell.key && setSelectedDate(cell.key)}
                className={`flex h-14 flex-col items-center justify-center rounded-[14px] text-[12px] font-bold ${
                  isActive
                    ? "bg-[#16a34a] text-white"
                    : "bg-[#f8fbf9] text-[#0f172a] disabled:bg-transparent"
                }`}
              >
                <span>{cell.label}</span>
                {cell.key ? (
                  <span className={`mt-1 text-[10px] ${isActive ? "text-white/85" : totalBookings > 0 ? "text-[#16a34a]" : "text-[#cbd5e1]"}`}>
                    {totalBookings}
                  </span>
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
      <BookingMessagesPanel
        role="provider"
        basePath="/provider/messages"
        emptyTitle="No messages yet"
        emptyDescription="Customer notes and booking conversations will appear here once someone books your service."
        emptyActionHref="/provider/bookings"
        emptyActionLabel="Open Bookings"
        theme={{
          accentText: "text-[#16a34a]",
          accentBg: "bg-[#16a34a]",
          accentSoftBg: "bg-[#f6fff8]",
          accentBorder: "border-[#bbf7d0]",
          badgeBg: "bg-[#eef9f1]",
          badgeText: "text-[#16a34a]",
          ownBubble: "bg-[#16a34a]",
          ownBubbleText: "text-white",
          otherBubble: "bg-[#f8fcf9]",
          otherBubbleText: "text-[#0f172a]",
          threadUnreadBorder: "border-[#bbf7d0]",
          threadUnreadBg: "bg-[#f6fff8]",
          composerButton: "bg-[#16a34a]",
        }}
      />
    </PageShell>
  );
}

export function EarningsScreen() {
  const state = useProviderAppData();
  const [paymentFilter, setPaymentFilter] = useState<"date" | "week" | "month" | "all">("week");
  const [selectedPaymentDate, setSelectedPaymentDate] = useState(getTodayKey());
  const [dailyAction, setDailyAction] = useState<"" | "withdraw" | "pay-company">("");
  const fallback = LoadingOrError(state);

  if (fallback) {
    return fallback;
  }

  const today = new Date(`${getTodayKey()}T00:00:00`);
  const startOfWeek = new Date(today);
  const currentDay = startOfWeek.getDay();
  const weekOffset = currentDay === 0 ? 6 : currentDay - 1;
  startOfWeek.setDate(startOfWeek.getDate() - weekOffset);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const paymentBookings = [...state.bookings]
    .filter(
      (booking) =>
        Boolean(booking.paymentStatus) ||
        Boolean(booking.paymentOption) ||
        ["completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus),
    )
    .sort(
      (left, right) =>
        new Date(`${right.scheduledDate}T${right.scheduledStartTime}`).getTime() -
        new Date(`${left.scheduledDate}T${left.scheduledStartTime}`).getTime(),
    );

  const filteredPayments = paymentBookings.filter((booking) => {
    const bookingDate = new Date(`${booking.scheduledDate}T00:00:00`);

    if (paymentFilter === "date") {
      return booking.scheduledDate === selectedPaymentDate;
    }

    if (paymentFilter === "week") {
      return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    }

    if (paymentFilter === "month") {
      return (
        bookingDate.getMonth() === today.getMonth() &&
        bookingDate.getFullYear() === today.getFullYear()
      );
    }

    return true;
  });

  const isCollectedPayment = (booking: ProviderBookingItem) =>
    booking.paymentStatus === "paid" ||
    ["paid", "review_requested", "reviewed"].includes(booking.bookingStatus);

  const totalCollected = filteredPayments
    .filter(isCollectedPayment)
    .reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const totalPendingCompany = filteredPayments
    .filter((booking) => isCollectedPayment(booking) && booking.companyPaymentStatus !== "paid")
    .reduce((sum, booking) => sum + booking.companyCommissionAmount, 0);
  const totalNetEarnings = filteredPayments
    .filter(isCollectedPayment)
    .reduce((sum, booking) => sum + booking.providerNetAmount, 0);
  const totalCashCollected = filteredPayments
    .filter((booking) => isCollectedPayment(booking) && (booking.paymentOption ?? "cash") === "cash")
    .reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const totalOnlineCollected = filteredPayments
    .filter((booking) => isCollectedPayment(booking) && booking.paymentOption === "online")
    .reduce((sum, booking) => sum + booking.quotedAmount, 0);
  const leadPayment = filteredPayments[0] ?? null;
  const payableBookings = filteredPayments.filter(
    (booking) => isCollectedPayment(booking) && booking.companyPaymentStatus !== "paid",
  );
  const filterSummary =
    paymentFilter === "date"
      ? `Showing payments for ${formatDateLabel(selectedPaymentDate)}`
      : paymentFilter === "week"
        ? "Showing payments for this week"
        : paymentFilter === "month"
        ? "Showing payments for this month"
          : "Showing all payment records";

  async function handleDailyCompanyPayment() {
    if (payableBookings.length === 0) {
      state.setNotice("No company payment is due for the selected total.");
      return;
    }

    const accessToken = await getProviderAccessToken();

    if (!accessToken) {
      state.setError("Your session expired. Please log in again.");
      return;
    }

    setDailyAction("pay-company");
    state.setError("");
    state.setNotice("");

    try {
      for (const booking of payableBookings) {
        const response = await fetch(`/api/provider/bookings/${booking.id}/settle-commission`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        });

        const result = (await response.json().catch(() => ({}))) as { success?: true; error?: string };

        if (!response.ok || !result?.success) {
          throw new Error(result?.error || `Unable to settle company payment for booking ${booking.id}.`);
        }
      }

      await state.reloadWorkspace();
      state.setNotice("Daily company payment marked as paid for the selected total.");
    } catch (error) {
      state.setError(error instanceof Error ? error.message : "Unable to settle daily company payment.");
    } finally {
      setDailyAction("");
    }
  }

  function handleDailyWithdraw() {
    if (totalNetEarnings <= 0) {
      state.setNotice("No withdrawal amount is available for the selected total.");
      return;
    }

    setDailyAction("withdraw");
    state.setError("");
    state.setNotice("Daily withdrawal is routed through admin during testing.");
    window.setTimeout(() => setDailyAction(""), 600);
  }

  return (
    <PageShell
      title="Payments"
      subtitle="See cash, online, commission, withdrawal totals, and booking-linked payment details."
    >
      <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
        <div className="flex items-start gap-3">
          <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[16px] bg-[linear-gradient(180deg,#8E5EB5_0%,#6F3EA1_100%)] text-white shadow-[0_10px_20px_rgba(142,94,181,0.24)]">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-black text-[#1f1630]">
              {leadPayment?.customerName ?? "Provider Payments"}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-[#7b728a]">
              {leadPayment?.serviceLabel ?? "Full payment summary"}
            </p>
            <p className="mt-1 text-[11px] text-[#8f86a2]">
              {leadPayment
                ? `Booking ID ${leadPayment.id} • ${leadPayment.schedule}`
                : "No payment records found for the selected filter"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Total Earning"
          value={formatCurrency(totalCollected)}
          meta="Full amount collected"
          accent="text-[#166534]"
        />
        <MetricCard
          label="Pending Company"
          value={formatCurrency(totalPendingCompany)}
          meta="5% commission to DELLA"
          accent="text-[#ea580c]"
        />
        <MetricCard
          label="Withdrawal"
          value={formatCurrency(totalNetEarnings)}
          meta="Keep after commission"
          accent="text-[#6F3EA1]"
        />
        <MetricCard
          label="Booking IDs"
          value={String(filteredPayments.length)}
          meta="Payment rows in view"
          accent="text-[#0f172a]"
        />
      </section>

      <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#0f172a]">Filter Payments</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">{filterSummary}</p>
          </div>
          <span className="rounded-full bg-[#f5f1fa] px-3 py-1 text-[11px] font-bold text-[#8E5EB5]">
            {filteredPayments.length}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["date", "Date"],
            ["week", "Week"],
            ["month", "Month"],
            ["all", "All"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPaymentFilter(value as "date" | "week" | "month" | "all")}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
                paymentFilter === value
                  ? "bg-[#8E5EB5] text-white shadow-[0_10px_20px_rgba(142,94,181,0.22)]"
                  : "bg-[#f6f1fb] text-[#6c5d83]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {paymentFilter === "date" ? (
          <label className="mt-4 block">
            <span className="text-[12px] font-semibold text-[#6c5d83]">Select booking date</span>
            <input
              type="date"
              value={selectedPaymentDate}
              onChange={(event) => setSelectedPaymentDate(event.target.value || getTodayKey())}
              className="mt-2 h-11 w-full rounded-[14px] border border-[#ded5eb] bg-white px-4 text-[14px] text-[#1f1630] outline-none"
            />
          </label>
        ) : null}
      </section>

      <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#0f172a]">Daily Total</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Only this total can be used for withdraw and pay to company.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3 text-[13px] text-[#544b66]">
          <SummaryLine label="Cash Payments" value={formatCurrency(totalCashCollected)} />
          <SummaryLine label="Online Payments" value={formatCurrency(totalOnlineCollected)} />
          <SummaryLine label="Total Pending to Company" value={formatCurrency(totalPendingCompany)} />
          <div className="border-t border-[#f0e8f8] pt-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-black text-[#1f1630]">Estimated Withdrawal</p>
              <p className="text-[22px] font-black text-[#6F3EA1]">{formatCurrency(totalNetEarnings)}</p>
            </div>
            <p className="mt-1 text-[11px] text-[#8f86a2]">
              Provider collects full amount first, then settles DELLA commission later.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <AppButton
            className="w-full px-3 text-[13px] sm:text-[14px]"
            disabled={dailyAction !== "" || totalNetEarnings <= 0}
            onClick={handleDailyWithdraw}
          >
            {dailyAction === "withdraw" ? "Processing..." : `Withdraw ${formatCurrency(totalNetEarnings)}`}
          </AppButton>
          <AppButton
            className="w-full px-3 text-[13px] sm:text-[14px]"
            tone="secondary"
            disabled={dailyAction !== "" || totalPendingCompany <= 0}
            onClick={() => void handleDailyCompanyPayment()}
          >
            {dailyAction === "pay-company" ? "Paying..." : `Pay ${formatCurrency(totalPendingCompany)}`}
          </AppButton>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-black text-[#0f172a]">Payment Details</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Each row includes booking ID, date, mode, totals, commission, proof, and link to full detail.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredPayments.length === 0 ? (
            <EmptyState
              title="No payment records"
              description="Change the filter to see other booking payments, commission, and withdrawal data."
              icon={<CreditCard className="h-6 w-6" />}
            />
          ) : (
            filteredPayments.map((booking) => {
              const collected = isCollectedPayment(booking);
              const paymentMode = booking.paymentOption === "online" ? "Online" : "Cash";
              const paymentStatusLabel = booking.paymentStatus
                ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)
                : collected
                  ? "Paid"
                  : "Pending";

              return (
                <div
                  key={booking.id}
                  className="rounded-[22px] border border-[#eee5f7] bg-[#fcfaff] p-4 shadow-[0_10px_24px_rgba(86,38,135,0.05)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-black text-[#0f172a]">{booking.serviceLabel}</p>
                      <p className="mt-1 text-[12px] font-semibold text-[#6F3EA1]">Booking ID: {booking.id}</p>
                      <p className="mt-1 truncate text-[13px] text-[#475569]">{booking.customerName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge label={paymentMode} tone={booking.paymentOption === "online" ? "info" : "accepted"} />
                      <StatusBadge label={paymentStatusLabel} tone={collected ? "completed" : "pending"} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-[12px] text-[#475569] sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#8E5EB5]" />
                      <span>{formatDateLabel(booking.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[#8E5EB5]" />
                      <span>{formatTimeLabel(booking.scheduledDate, booking.scheduledStartTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#8E5EB5]" />
                      <span className="truncate">{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-[#8E5EB5]" />
                      <span>{collected ? "Collected" : "Awaiting payment confirmation"}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-[16px] border border-[#d8f0dc] bg-[#f3fff6] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#15803d]">Amount</p>
                      <p className="mt-1 text-[16px] font-black text-[#166534]">{formatCurrency(booking.quotedAmount)}</p>
                    </div>
                    <div className="rounded-[16px] border border-[#fde7d3] bg-[#fff7ed] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ea580c]">Commission</p>
                      <p className="mt-1 text-[16px] font-black text-[#c2410c]">{formatCurrency(booking.companyCommissionAmount)}</p>
                    </div>
                    <div className="rounded-[16px] border border-[#e9def8] bg-[#f8f3fd] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7c3aed]">Withdrawal</p>
                      <p className="mt-1 text-[16px] font-black text-[#6F3EA1]">{formatCurrency(booking.providerNetAmount)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-[12px] text-[#5b536d] sm:grid-cols-2">
                    <p>Company Status: <span className="font-bold text-[#1f1630]">{booking.companyPaymentStatus === "paid" ? "Paid" : "Pending"}</span></p>
                    <p>Customer Proof: <span className="font-bold text-[#1f1630]">{booking.customerPaymentProofDataUrl ? "Attached" : "No proof"}</span></p>
                    <p>Company Slip: <span className="font-bold text-[#1f1630]">{booking.providerCompanyPaymentProofDataUrl ? "Attached" : "No slip"}</span></p>
                    <p>Review Status: <span className="font-bold text-[#1f1630]">{booking.customerStatusLabel}</span></p>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <AppButton href={`/provider/bookings/${booking.id}`} tone="secondary" className="flex-1">
                      Open Full Details
                    </AppButton>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </PageShell>
  );
}

export function PaymentsScreen() {
  return <EarningsScreen />;
}

export function TasksScreen() {
  return <BookingsScreen />;
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
        <div className="mb-5 rounded-[20px] border border-[#dbeee2] bg-[#f6fff8] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-black text-[#0f172a]">Need to edit days and time?</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#64748b]">
                Booking days and working hours are managed in your availability settings.
              </p>
            </div>
            <Link
              href="/provider/availability"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-[12px] bg-[#16a34a] px-4 text-[12px] font-extrabold text-white"
            >
              Edit Availability
            </Link>
          </div>
        </div>

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
                        serviceType: service.serviceType,
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
              {editingServiceId ? (
                <input
                  value={formatServiceLabel(form.serviceType)}
                  readOnly
                  className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none read-only:text-[#94a3b8]"
                />
              ) : (
                <select
                  value={form.serviceType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      serviceType: normalizeServiceFormValue(event.target.value),
                    }))
                  }
                  className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
                >
                  <option value="">Select service type</option>
                  {PROVIDER_SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={normalizeServiceFormValue(option)}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
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
  const [daySettings, setDaySettings] = useState<Record<string, { selected: boolean; startTime: string; endTime: string }>>(
    Object.fromEntries(
      ALL_DAYS.map((day) => [day, { selected: false, startTime: "08:00", endTime: "20:00" }]),
    ) as Record<string, { selected: boolean; startTime: string; endTime: string }>,
  );
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextDaySettings = Object.fromEntries(
      ALL_DAYS.map((day) => [day, { selected: false, startTime: "08:00", endTime: "20:00" }]),
    ) as Record<string, { selected: boolean; startTime: string; endTime: string }>;

    state.availability.forEach((entry) => {
      nextDaySettings[entry.day] = {
        selected: true,
        startTime: entry.startTime,
        endTime: entry.endTime,
      };
    });

    setDaySettings(nextDaySettings);
    setEnabled(state.availabilityEnabled);
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
        entries: ALL_DAYS.filter((day) => daySettings[day]?.selected).map((day) => ({
          day,
          startTime: daySettings[day].startTime,
          endTime: daySettings[day].endTime,
          timeMode: "custom",
        })),
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
                setDaySettings((current) =>
                  Object.fromEntries(
                    ALL_DAYS.map((day) => [
                      day,
                      {
                        ...current[day],
                        selected: true,
                      },
                    ]),
                  ) as Record<string, { selected: boolean; startTime: string; endTime: string }>,
                )
              }
              className="text-[12px] font-bold text-[#16a34a]"
            >
              Select all
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {ALL_DAYS.map((day) => (
              <div
                key={day}
                className={`rounded-[18px] border px-4 py-3 ${
                  daySettings[day]?.selected
                    ? "border-[#b7e4c4] bg-[#f6fff8]"
                    : "border-[#e7eee8] bg-[#fbfffc]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] font-semibold text-[#0f172a]">{day}</span>
                  <input
                    type="checkbox"
                    checked={daySettings[day]?.selected ?? false}
                    onChange={(event) =>
                      setDaySettings((current) => ({
                        ...current,
                        [day]: {
                          ...current[day],
                          selected: event.target.checked,
                        },
                      }))
                    }
                    className="h-4 w-4 accent-[#16a34a]"
                  />
                </div>
                {daySettings[day]?.selected ? (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="rounded-[16px] border border-[#dbeee2] bg-white p-3">
                      <span className="text-[11px] font-bold text-[#64748b]">Start</span>
                      <input
                        type="time"
                        value={daySettings[day].startTime}
                        onChange={(event) =>
                          setDaySettings((current) => ({
                            ...current,
                            [day]: {
                              ...current[day],
                              startTime: event.target.value,
                            },
                          }))
                        }
                        className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
                      />
                    </label>
                    <label className="rounded-[16px] border border-[#dbeee2] bg-white p-3">
                      <span className="text-[11px] font-bold text-[#64748b]">End</span>
                      <input
                        type="time"
                        value={daySettings[day].endTime}
                        onChange={(event) =>
                          setDaySettings((current) => ({
                            ...current,
                            [day]: {
                              ...current[day],
                              endTime: event.target.value,
                            },
                          }))
                        }
                        className="mt-2 block w-full bg-transparent text-[14px] font-semibold text-[#0f172a] outline-none"
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
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

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p>{label}</p>
      <p className="font-semibold text-[#24193a]">{value}</p>
    </div>
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
    <PageShell title="Reviews" subtitle="Customer ratings, review feed, and overall provider score.">
      <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 text-center shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
        <p className="text-[2.5rem] font-black tracking-[-0.06em] text-[#0f172a]">
          {data.averageRating > 0 ? data.averageRating.toFixed(1) : "0.0"}
        </p>
        <div className="mt-2 flex items-center justify-center gap-1 text-[#8E5EB5]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-5 w-5 fill-current" />
          ))}
        </div>
        <p className="mt-2 text-[13px] text-[#64748b]">({data.totalReviews} reviews)</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
          <MetricCard label="Completed Jobs" value={String(completedJobs.length)} meta="Provider history" accent="text-[#0f172a]" />
          <MetricCard label="Profile Status" value={data.approvalStatus} meta="Current listing state" accent="text-[#0f172a]" />
        </div>
      </section>

      <section className="rounded-[24px] border border-[#eee5f7] bg-white p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)]">
        <h2 className="text-[17px] font-black text-[#0f172a]">Customer Reviews</h2>
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
                  className="rounded-[20px] border border-[#eee5f7] bg-[#fcfaff] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-black text-[#0f172a]">{review.customerName}</p>
                      <p className="mt-1 text-[12px] text-[#64748b]">{review.createdLabel}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#8E5EB5]">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={`${review.id}-${index}`} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-[#475569]">{review.comment}</p>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => state.setNotice("Provider replies to reviews are not wired yet, but the review feed is live.")}
                      className="rounded-[10px] border border-[#e5d5fa] bg-white px-3 py-1.5 text-[12px] font-bold text-[#8E5EB5]"
                    >
                      Reply
                    </button>
                  </div>
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
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/provider/services"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#8E5EB5] px-4 text-[13px] font-extrabold text-white"
          >
            <PencilLine className="h-4 w-4" />
            Edit Services
          </Link>
          <Link
            href="/provider/availability"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#d8ebdf] bg-white px-4 text-[13px] font-extrabold text-[#16a34a]"
          >
            <CalendarDays className="h-4 w-4" />
            Edit Availability
          </Link>
        </div>
      </section>

      <ProviderPushNotificationsCard />

      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[1.1rem] font-black tracking-[-0.04em] text-[#0f172a]">
              Listing Details
            </h3>
            <p className="mt-1 text-[12px] text-[#64748b]">
              Review your public provider details and uploaded work.
            </p>
          </div>
          <Link
            href="/provider/services"
            className="rounded-[12px] border border-[#e5d5fa] bg-[#fbf8ff] px-3 py-2 text-[12px] font-bold text-[#8E5EB5]"
          >
            Edit
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          <DetailRow icon={<MapPin className="h-4.5 w-4.5 text-[#8E5EB5]" />} label="Coverage" value={`${data.serviceRadiusKm} KM from current location`} />
          <DetailRow icon={<BriefcaseBusiness className="h-4.5 w-4.5 text-[#8E5EB5]" />} label="Bio" value={data.bio || "No bio added yet."} />
        </div>
      </section>

      <section className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[1.1rem] font-black tracking-[-0.04em] text-[#0f172a]">
              Verification
            </h3>
            <p className="mt-1 text-[12px] text-[#64748b]">
              Verification status for your provider account.
            </p>
          </div>
          <Link
            href="/provider/more"
            className="rounded-[12px] border border-[#e5d5fa] bg-[#fbf8ff] px-3 py-2 text-[12px] font-bold text-[#8E5EB5]"
          >
            Verify / Help
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricCard label="Email" value={data.emailVerified ? "Verified" : "Pending"} meta="Email status" accent={data.emailVerified ? "text-[#16a34a]" : "text-[#f59e0b]"} />
          <MetricCard label="Phone" value={data.phoneVerified ? "Verified" : "Pending"} meta="Phone status" accent={data.phoneVerified ? "text-[#16a34a]" : "text-[#f59e0b]"} />
          <MetricCard label="Identity" value={data.identityVerified ? "Verified" : "Pending"} meta="ID check" accent={data.identityVerified ? "text-[#16a34a]" : "text-[#f59e0b]"} />
          <MetricCard label="KYC / Background" value={data.backgroundCheckVerified || data.kycVerified ? "Verified" : "Pending"} meta="Trust checks" accent={data.backgroundCheckVerified || data.kycVerified ? "text-[#16a34a]" : "text-[#f59e0b]"} />
        </div>
      </section>

      <section className="space-y-4">
        {data.services.map((service) => (
          <div
            key={service.id}
            className="rounded-[26px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eee8]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[1.1rem] font-black tracking-[-0.04em] text-[#0f172a]">
                  {formatServiceLabel(service.serviceType)}
                </h3>
                <p className="mt-1 text-[12px] text-[#64748b]">
                  {service.yearsExperience || "Experience not added yet"}
                </p>
              </div>
              <Link
                href="/provider/services"
                className="rounded-[12px] border border-[#e5d5fa] bg-[#fbf8ff] px-3 py-2 text-[12px] font-bold text-[#8E5EB5]"
              >
                Edit
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCard label="Hourly" value={formatCompactCurrency(service.hourlyRate)} meta="per hour" />
              <MetricCard label="Daily" value={formatCompactCurrency(service.dailyRate)} meta="per day" />
            </div>

            <div className="mt-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
                Service Types
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {service.specialties.length > 0 ? (
                  service.specialties.map((specialty) => (
                    <span
                      key={`${service.id}-${specialty}`}
                      className="rounded-full bg-[#f5f1fa] px-3 py-1.5 text-[12px] font-semibold text-[#8E5EB5]"
                    >
                      {specialty}
                    </span>
                  ))
                ) : (
                  <p className="text-[13px] text-[#64748b]">No service tags added yet.</p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
                Service Images
              </p>
              {service.imageDataUrls.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {service.imageDataUrls.map((image, index) => (
                    <div key={`${service.id}-image-${index}`} className="space-y-2">
                      <div className="relative aspect-square overflow-hidden rounded-[16px] border border-[#e7eee8] bg-[#f8faf9]">
                        <Image
                          src={image}
                          alt={service.imageCaptions[index] || `${service.serviceType} work ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <p className="text-[11px] leading-4 text-[#64748b]">
                        {service.imageCaptions[index] || `Work ${index + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-[#64748b]">No service images uploaded yet.</p>
              )}
            </div>

            <div className="mt-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9a90ac]">
                Certificates
              </p>
              {service.certificateDataUrls.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {service.certificateDataUrls.map((file, index) => (
                    <a
                      key={`${service.id}-certificate-${index}`}
                      href={file}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-[16px] border border-[#e7eee8] bg-[#fbfffc] px-4 py-3"
                    >
                      <span className="text-[13px] font-semibold text-[#0f172a]">
                        {service.certificateCaptions[index] || `Certificate ${index + 1}`}
                      </span>
                      <span className="text-[12px] font-bold text-[#8E5EB5]">View</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-[#64748b]">No certificates uploaded yet.</p>
              )}
            </div>
          </div>
        ))}
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
          <InfoRow icon={<Landmark className="h-4.5 w-4.5 text-[#16a34a]" />} label="Bank Details" value="Wallet" href="/provider/payments" />
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
