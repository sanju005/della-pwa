"use client";

import { useEffect, useRef, useState } from "react";
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
  ImageCropModal,
  cropImageFromSelection,
  type CropSelection,
} from "@/app/_components/image-crop-modal";
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
import { getSupabaseClient } from "@/lib/supabase";

type BookingTab = "all" | "ongoing" | "pending" | "canceled" | "completes";

type TimelineState = "done" | "current" | "waiting";

const WORK_FINISHED_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const WORK_FINISHED_IMAGE_MAX_COUNT = 3;

async function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read this image."));
    reader.readAsDataURL(file);
  });
}

function isCompletedStatus(status: ProviderBookingItem["bookingStatus"]) {
  return ["completed", "paid", "review_requested", "reviewed"].includes(status);
}

function isCanceledStatus(status: ProviderBookingItem["bookingStatus"]) {
  return status === "declined_by_provider" || status === "declined" || status === "cancelled";
}

function isOngoingStatus(status: ProviderBookingItem["bookingStatus"]) {
  return [
    "accepted",
    "on_the_way",
    "arrived",
    "work_finished_by_provider",
    "work_confirmed_by_user",
    "final_payment_sent",
    "cash_paid_by_user",
    "payment_received_by_provider",
  ].includes(status);
}

function formatStepDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStepTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
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
    { label: "Confirmed", status: currentIndex >= 0 ? "done" : "current" },
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
      label: "Payment Done",
      status: currentIndex >= 4 ? "done" : currentIndex === 3 ? "current" : "pending",
    },
    {
      label: "Completed",
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

function TimelineCard({
  number,
  title,
  state,
  dateLabel,
  timeLabel,
  expanded = false,
  children,
}: {
  number: number;
  title: string;
  state: TimelineState;
  dateLabel?: string;
  timeLabel?: string;
  expanded?: boolean;
  children?: React.ReactNode;
}) {
  const done = state === "done";
  const current = state === "current";

  return (
    <div className="relative flex gap-4">
      <div className="flex w-14 flex-col items-center">
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-4 text-lg font-black ${
            done || current
              ? "border-[#8E5EB5] bg-[#8E5EB5] text-white"
              : "border-[#d1d5db] bg-white text-[#94a3b8]"
          }`}
        >
          {done ? "OK" : number}
        </span>
        <span className={`mt-2 h-full min-h-16 w-[2px] ${done || current ? "bg-[#8E5EB5]" : "bg-[#e5e7eb]"}`} />
      </div>
      <div className={`flex-1 rounded-[24px] border p-5 shadow-[0_14px_32px_rgba(86,38,135,0.08)] ${current ? "border-[#dcc7f7] bg-[linear-gradient(180deg,#fcf7ff_0%,#fffefe_100%)]" : "border-[#eee5f7] bg-white"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[0.95rem] font-black tracking-[-0.035em] text-[#0f172a]">
              {number}. {title}
            </h3>
            {(dateLabel || timeLabel) ? (
              <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-[#64748b]">
                {dateLabel ? <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{dateLabel}</span> : null}
                {timeLabel ? <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{timeLabel}</span> : null}
              </div>
            ) : null}
          </div>
          <span className={`inline-flex rounded-full px-4 py-2 text-[12px] font-bold ${done ? "bg-[#eef9f0] text-[#16a34a]" : current ? "bg-[#f3e8ff] text-[#8E5EB5]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
            {done ? "Done" : current ? "Current Step" : "Waiting"}
          </span>
        </div>
        {expanded ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}

function BookingInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-[#eee5f7] bg-[#fbf8ff] px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#8E5EB5] shadow-[0_8px_18px_rgba(86,38,135,0.08)]">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8E5EB5]">
            {label}
          </p>
          <div className="mt-1 text-[13px] font-semibold leading-5 text-[#1f1630]">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderBookingSummary({ booking }: { booking: ProviderBookingItem }) {
  const modeLabel = booking.bookingMode === "daily" ? "Daily booking" : "Hourly booking";
  const paymentLabel = booking.paymentOption === "online" ? "Online payment" : "Cash payment";
  const scheduleLabel = [
    formatDateLabel(booking.scheduledDate),
    formatTimeLabel(booking.scheduledDate, booking.scheduledStartTime),
    booking.scheduledEndTime ? `to ${formatTimeLabel(booking.scheduledDate, booking.scheduledEndTime)}` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="mt-5 rounded-[24px] border border-[#eee5f7] bg-white p-4 shadow-[0_14px_32px_rgba(86,38,135,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#8E5EB5]">
            Task Details
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            Review the request before following the task path.
          </p>
        </div>
        <StatusBadge label={booking.statusLabel} tone={providerStatusTone(booking.bookingStatus)} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <BookingInfoRow
          icon={<BriefcaseBusiness className="h-4.5 w-4.5" />}
          label="User Detail"
          value={
            <>
              <span className="block">{booking.customerName || "Customer"}</span>
              <span className="mt-0.5 block text-[12px] font-medium text-[#64748b]">
                Booking ID: {booking.id}
              </span>
            </>
          }
        />
        <BookingInfoRow
          icon={<MapPin className="h-4.5 w-4.5" />}
          label="Location"
          value={booking.location || "Location not provided"}
        />
        <div className="grid grid-cols-2 gap-3">
          <BookingInfoRow
            icon={<CalendarDays className="h-4.5 w-4.5" />}
            label="Date & Time"
            value={scheduleLabel || booking.schedule || "Schedule not provided"}
          />
          <BookingInfoRow
            icon={<Wallet className="h-4.5 w-4.5" />}
            label="Rates"
            value={
              <>
                <span className="block">{modeLabel}</span>
                <span className="mt-0.5 block text-[12px] font-medium text-[#64748b]">
                  Base {formatCurrency(booking.baseAmount)} · Total {formatCurrency(booking.quotedAmount)}
                </span>
              </>
            }
          />
        </div>
        <BookingInfoRow
          icon={<Wallet className="h-4.5 w-4.5" />}
          label="Payment"
          value={
            <>
              <span className="block">{paymentLabel}</span>
              <span className="mt-0.5 block text-[12px] font-medium text-[#64748b]">
                Provider net {formatCurrency(booking.providerNetAmount)} · Commission {formatCurrency(booking.companyCommissionAmount)}
              </span>
            </>
          }
        />
        <BookingInfoRow
          icon={<MessageCircleMore className="h-4.5 w-4.5" />}
          label="User Notes"
          value={booking.customerNote?.trim() || "No notes from user."}
        />
      </div>
    </div>
  );
}

function ProviderBookingSummaryWithActions({
  booking,
  actionBookingId,
  onAccept,
  onDecline,
}: {
  booking: ProviderBookingItem;
  actionBookingId: string;
  onAccept: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
}) {
  const modeLabel = booking.bookingMode === "daily" ? "Daily booking" : "Hourly booking";
  const paymentLabel = booking.paymentOption === "online" ? "Online payment" : "Cash payment";
  const canRespondToRequest =
    booking.bookingStatus === "pending" || booking.bookingStatus === "pending_provider_response";
  const scheduleLabel = [
    formatDateLabel(booking.scheduledDate),
    formatTimeLabel(booking.scheduledDate, booking.scheduledStartTime),
    booking.scheduledEndTime ? `to ${formatTimeLabel(booking.scheduledDate, booking.scheduledEndTime)}` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="mt-5 rounded-[24px] border border-[#eee5f7] bg-white p-4 shadow-[0_14px_32px_rgba(86,38,135,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#8E5EB5]">
            Task Details
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            Review the request before following the task path.
          </p>
        </div>
        <StatusBadge label={booking.statusLabel} tone={providerStatusTone(booking.bookingStatus)} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <BookingInfoRow
          icon={<BriefcaseBusiness className="h-4.5 w-4.5" />}
          label="User Detail"
          value={
            <>
              <span className="block">{booking.customerName || "Customer"}</span>
              <span className="mt-0.5 block text-[12px] font-medium text-[#64748b]">
                Booking ID: {booking.id}
              </span>
            </>
          }
        />
        <BookingInfoRow
          icon={<MapPin className="h-4.5 w-4.5" />}
          label="Location"
          value={booking.location || "Location not provided"}
        />
        <div className="grid grid-cols-2 gap-3">
          <BookingInfoRow
            icon={<CalendarDays className="h-4.5 w-4.5" />}
            label="Date & Time"
            value={scheduleLabel || booking.schedule || "Schedule not provided"}
          />
          <BookingInfoRow
            icon={<Wallet className="h-4.5 w-4.5" />}
            label="Rates"
            value={
              <>
                <span className="block">{modeLabel}</span>
                <span className="mt-0.5 block text-[12px] font-medium text-[#64748b]">
                  Base {formatCurrency(booking.baseAmount)} / Total {formatCurrency(booking.quotedAmount)}
                </span>
              </>
            }
          />
        </div>
        <BookingInfoRow
          icon={<Wallet className="h-4.5 w-4.5" />}
          label="Payment"
          value={
            <>
              <span className="block">{paymentLabel}</span>
              <span className="mt-0.5 block text-[12px] font-medium text-[#64748b]">
                Provider net {formatCurrency(booking.providerNetAmount)} / Commission {formatCurrency(booking.companyCommissionAmount)}
              </span>
            </>
          }
        />
        <BookingInfoRow
          icon={<MessageCircleMore className="h-4.5 w-4.5" />}
          label="User Notes"
          value={booking.customerNote?.trim() || "No notes from user."}
        />
        <AppButton
          href={`/provider/messages?booking=${booking.id}`}
          tone="secondary"
          className="w-full !rounded-[14px] !border-[#d9c5f1] !bg-white !text-[#8E5EB5] !shadow-none"
        >
          Message Customer
        </AppButton>
        {canRespondToRequest ? (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <AppButton
              className="w-full"
              tone="danger"
              disabled={actionBookingId === booking.id}
              onClick={() => onDecline(booking.id)}
            >
              Decline
            </AppButton>
            <AppButton
              className="w-full"
              disabled={actionBookingId === booking.id}
              onClick={() => onAccept(booking.id)}
            >
              Accept
            </AppButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProviderReviewModal({
  customerName,
  rating,
  comment,
  photos,
  loading,
  onRatingChange,
  onCommentChange,
  onPhotosChange,
  onClose,
  onSubmit,
}: {
  customerName: string;
  rating: number;
  comment: string;
  photos: string[];
  loading: boolean;
  onRatingChange: (value: number) => void;
  onCommentChange: (value: string) => void;
  onPhotosChange: (value: string[]) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  async function handleReviewPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 4);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const images = await Promise.all(files.map((file) => readImageAsDataUrl(file)));
    onPhotosChange(images);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#8E5EB5]">
          Provider Review
        </p>
        <h3 className="mt-2 text-[1.35rem] font-black tracking-[-0.05em] text-[#0f172a]">
          Review {customerName}
        </h3>
        <p className="mt-1 text-[13px] leading-6 text-[#64748b]">
          Share your experience with this customer after the task is completed.
        </p>

        <div className="mt-5 flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            return (
              <button
                key={`provider-review-star-${value}`}
                type="button"
                onClick={() => onRatingChange(value)}
                className={`text-[28px] leading-none ${value <= rating ? "text-[#8E5EB5]" : "text-[#d1d5db]"}`}
                aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
              >
                ★
              </button>
            );
          })}
        </div>

        <label className="mt-5 block">
          <span className="text-[13px] font-semibold text-[#1f1630]">Comment</span>
          <textarea
            value={comment}
            onChange={(event) => onCommentChange(event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-[18px] border border-[#e7dff2] px-4 py-3 text-[14px] text-[#1f1630] outline-none focus:border-[#8E5EB5]"
            placeholder="Write your feedback about this customer."
          />
        </label>

        <div className="mt-5">
          <label className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-[#cdb3eb] bg-[#fcfaff] text-[13px] font-extrabold text-[#8E5EB5]">
            Add Review Photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => void handleReviewPhotoChange(event)} />
          </label>
          {photos.length > 0 ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <div key={`provider-review-photo-${index}`} className="aspect-square overflow-hidden rounded-[10px] border border-[#e7dff2]">
                  <img src={photo} alt={`Review photo ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex gap-3">
          <AppButton className="flex-1" tone="secondary" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton className="flex-1" disabled={loading} onClick={onSubmit}>
            {loading ? "Submitting..." : "Submit Review"}
          </AppButton>
        </div>
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
  onWorkFinished,
  onSendPaymentRequest,
  onConfirmPaymentReceived,
  onCompleteProviderJob,
  onOpenReview,
}: {
  booking: ProviderBookingItem;
  actionBookingId: string;
  onClose: () => void;
  onAccept: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
  onOnTheWay: (bookingId: string) => void;
  onArrived: (bookingId: string) => void;
  onWorkFinished: (bookingId: string, images: string[], finalAmount: number) => void;
  onSendPaymentRequest: (booking: ProviderBookingItem, finalAmount: number) => void;
  onConfirmPaymentReceived: (bookingId: string) => void;
  onCompleteProviderJob: (bookingId: string) => void;
  onOpenReview: (booking: ProviderBookingItem) => void;
}) {
  const workFinishedInputRef = useRef<HTMLInputElement>(null);
  const [workFinishedImages, setWorkFinishedImages] = useState<string[]>(booking.workFinishedImages ?? []);
  const [workFinishedImageError, setWorkFinishedImageError] = useState("");
  const [workImageCropSource, setWorkImageCropSource] = useState("");
  const [workImageCropQueue, setWorkImageCropQueue] = useState<string[]>([]);
  const [finalPaymentAmount, setFinalPaymentAmount] = useState(
    String(booking.quotedAmount || booking.baseAmount || 0),
  );
  const stepState = {
    confirmed: ["accepted", "on_the_way", "arrived", "work_finished_by_provider", "work_confirmed_by_user", "final_payment_sent", "cash_paid_by_user", "payment_received_by_provider", "completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus) ? "done" : booking.bookingStatus === "pending_provider_response" || booking.bookingStatus === "pending" ? "current" : "waiting",
    onTheWay: ["on_the_way", "arrived", "work_finished_by_provider", "work_confirmed_by_user", "final_payment_sent", "cash_paid_by_user", "payment_received_by_provider", "completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus) ? "done" : booking.bookingStatus === "accepted" ? "current" : "waiting",
    arrived: ["arrived", "work_finished_by_provider", "work_confirmed_by_user", "final_payment_sent", "cash_paid_by_user", "payment_received_by_provider", "completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus) ? "done" : booking.bookingStatus === "on_the_way" ? "current" : "waiting",
    jobDone: ["work_finished_by_provider", "work_confirmed_by_user", "final_payment_sent", "cash_paid_by_user", "payment_received_by_provider", "completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus) ? "done" : booking.bookingStatus === "arrived" ? "current" : "waiting",
    finalizePayment: booking.bookingStatus === "work_confirmed_by_user" ? "current" : ["final_payment_sent", "cash_paid_by_user", "payment_received_by_provider", "completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus) ? "done" : "waiting",
    paymentWaiting: booking.bookingStatus === "final_payment_sent" ? "current" : ["cash_paid_by_user", "payment_received_by_provider", "completed", "paid", "review_requested", "reviewed"].includes(booking.bookingStatus) ? "done" : "waiting",
    userCompleted: booking.bookingStatus === "cash_paid_by_user" ? "current" : ["payment_received_by_provider", "completed", "review_requested", "reviewed"].includes(booking.bookingStatus) ? "done" : "waiting",
    review: booking.providerReviewedAt ? "done" : booking.bookingStatus === "completed" || booking.bookingStatus === "review_requested" || booking.bookingStatus === "reviewed" ? "current" : "waiting",
  } as const;

  useEffect(() => {
    setWorkFinishedImages(booking.workFinishedImages ?? []);
    setWorkFinishedImageError("");
    setWorkImageCropSource("");
    setWorkImageCropQueue([]);
    setFinalPaymentAmount(String(booking.quotedAmount || booking.baseAmount || 0));
  }, [booking.id, booking.workFinishedImages, booking.quotedAmount, booking.baseAmount]);

  const openNextWorkImageCrop = (queue: string[]) => {
    const [nextImage, ...remainingImages] = queue;
    setWorkImageCropQueue(remainingImages);
    setWorkImageCropSource(nextImage ?? "");
  };

  const handleWorkFinishedImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = WORK_FINISHED_IMAGE_MAX_COUNT - workFinishedImages.length;
    const files = selectedFiles.slice(0, Math.max(0, remainingSlots));

    if (files.length === 0) {
      setWorkFinishedImageError(`You can attach up to ${WORK_FINISHED_IMAGE_MAX_COUNT} images.`);
      return;
    }

    try {
      const images = await Promise.all(
        files.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            throw new Error("Only image files are allowed.");
          }

          if (file.size > WORK_FINISHED_IMAGE_MAX_BYTES) {
            throw new Error("Each image must be 5MB or smaller.");
          }

          return readImageAsDataUrl(file);
        }),
      );

      setWorkFinishedImageError("");
      openNextWorkImageCrop(images);
    } catch (error) {
      setWorkFinishedImageError(error instanceof Error ? error.message : "Unable to attach image.");
    }
  };

  const handleWorkImageCropApply = async (selection: CropSelection) => {
    if (!workImageCropSource) {
      return;
    }

    try {
      const croppedImage = await cropImageFromSelection(workImageCropSource, selection);
      setWorkFinishedImages((current) => [...current, croppedImage].slice(0, WORK_FINISHED_IMAGE_MAX_COUNT));
      setWorkFinishedImageError("");
      openNextWorkImageCrop(workImageCropQueue);
    } catch (error) {
      setWorkFinishedImageError(error instanceof Error ? error.message : "Unable to crop image.");
    }
  };

  const handleWorkImageCropClose = () => {
    setWorkImageCropSource("");
    setWorkImageCropQueue([]);
  };

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

      <ProviderBookingSummaryWithActions
        booking={booking}
        actionBookingId={actionBookingId}
        onAccept={onAccept}
        onDecline={onDecline}
      />

      {!isCanceledStatus(booking.bookingStatus) ? (
        <div className="mt-4 space-y-4">
          <TimelineCard
            number={1}
            title="Confirmed"
            state={stepState.confirmed}
            dateLabel={formatStepDate(booking.acceptedAt || booking.createdAt)}
            timeLabel={formatStepTime(booking.acceptedAt || booking.createdAt)}
          />
          <TimelineCard
            number={2}
            title="On The Way"
            state={stepState.onTheWay}
            dateLabel={formatStepDate(booking.onTheWayAt)}
            timeLabel={formatStepTime(booking.onTheWayAt)}
            expanded={booking.bookingStatus === "accepted"}
          >
            <AppButton
              className="w-full"
              disabled={actionBookingId === booking.id}
              onClick={() => onOnTheWay(booking.id)}
            >
              Mark As On The Way
            </AppButton>
          </TimelineCard>
          <TimelineCard
            number={3}
            title="Arrived"
            state={stepState.arrived}
            dateLabel={formatStepDate(booking.arrivedAt)}
            timeLabel={formatStepTime(booking.arrivedAt)}
            expanded={booking.bookingStatus === "on_the_way"}
          >
            <AppButton
              className="w-full"
              disabled={actionBookingId === booking.id}
              onClick={() => onArrived(booking.id)}
            >
              Mark As Arrived
            </AppButton>
          </TimelineCard>
          <TimelineCard
            number={4}
            title="Job Completed"
            state={stepState.jobDone}
            dateLabel={formatStepDate(booking.completedAt)}
            timeLabel={formatStepTime(booking.completedAt)}
            expanded={booking.bookingStatus === "arrived"}
          >
            <input
              ref={workFinishedInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleWorkFinishedImageChange}
              className="hidden"
            />
            <div className="mb-3 rounded-[18px] border border-[#eee5f7] bg-white p-3">
              <label className="mb-3 block">
                <span className="text-[13px] font-extrabold text-[#1f1630]">Final Payment Amount (RM)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={finalPaymentAmount}
                  onChange={(event) => setFinalPaymentAmount(event.target.value)}
                  className="mt-2 h-11 w-full rounded-[14px] border border-[#e7dff2] px-4 text-[14px] font-semibold text-[#1f1630] outline-none focus:border-[#8E5EB5]"
                />
              </label>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-extrabold text-[#1f1630]">Completion Images</p>
                  <p className="mt-1 text-[12px] text-[#64748b]">
                    Attach job proof before sending the payment request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => workFinishedInputRef.current?.click()}
                  className="shrink-0 rounded-[12px] border border-[#dcc7f7] bg-[#fbf8ff] px-3 py-2 text-[12px] font-extrabold text-[#8E5EB5]"
                >
                  Add Images
                </button>
              </div>
              {workFinishedImages.length > 0 ? (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {workFinishedImages.map((image, index) => (
                    <div key={`${booking.id}-work-image-${index}`} className="relative aspect-square overflow-hidden rounded-[12px] border border-[#eee5f7]">
                      <img src={image} alt={`Completion proof ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setWorkFinishedImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[12px] font-black text-white"
                        aria-label={`Remove completion proof ${index + 1}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              {workFinishedImageError ? (
                <p className="mt-2 text-[12px] font-semibold text-[#dc2626]">{workFinishedImageError}</p>
              ) : null}
            </div>
            <AppButton
              className="w-full"
              disabled={actionBookingId === booking.id}
              onClick={() => onWorkFinished(booking.id, workFinishedImages, Number(finalPaymentAmount))}
            >
              Mark Job Completed & Send Payment Request
            </AppButton>
          </TimelineCard>
          <TimelineCard number={5} title="Finalize Payment" state={stepState.finalizePayment} expanded={stepState.finalizePayment === "current" || stepState.finalizePayment === "done"}>
            <div className="rounded-[20px] border border-[#eee5f7] bg-white p-4">
              <div className="space-y-3 text-[14px] text-[#1f1630]">
                <div className="flex items-center justify-between gap-3"><span>Booking Price</span><span className="font-semibold">RM {booking.baseAmount}</span></div>
                {booking.additionalCharge > 0 ? (
                  <div className="flex items-center justify-between gap-3"><div><p>{booking.additionalChargeDescription || "Additional Charges"}</p><p className="text-[12px] text-[#64748b]">{booking.paymentNote || "Additional service time / travel."}</p></div><span className="font-semibold">RM {booking.additionalCharge}</span></div>
                ) : null}
                <div className="border-t border-dashed border-[#ddd4ea] pt-3"><div className="flex items-center justify-between gap-3"><span className="text-[1rem] font-black text-[#8E5EB5]">Total Amount</span><span className="text-[1.6rem] font-black text-[#8E5EB5]">RM {booking.quotedAmount}</span></div></div>
              </div>
              {booking.bookingStatus === "work_confirmed_by_user" ? (
                <label className="mt-4 block">
                  <span className="text-[13px] font-extrabold text-[#1f1630]">Final Payment Amount (RM)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={finalPaymentAmount}
                    onChange={(event) => setFinalPaymentAmount(event.target.value)}
                    className="mt-2 h-11 w-full rounded-[14px] border border-[#e7dff2] px-4 text-[14px] font-semibold text-[#1f1630] outline-none focus:border-[#8E5EB5]"
                  />
                </label>
              ) : null}
              {booking.bookingStatus === "work_confirmed_by_user" ? (
                <button type="button" onClick={() => onSendPaymentRequest(booking, Number(finalPaymentAmount))} className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-[#8E5EB5] text-[16px] font-extrabold text-white shadow-[0_16px_30px_rgba(142,94,181,0.24)]">
                  Send Payment Request
                </button>
              ) : null}
            </div>
          </TimelineCard>
          <TimelineCard
            number={6}
            title="Payment Waiting"
            state={stepState.paymentWaiting}
            dateLabel={formatStepDate(booking.paidAt || booking.completedAt)}
            timeLabel={formatStepTime(booking.paidAt || booking.completedAt)}
            expanded={stepState.paymentWaiting === "current" || stepState.paymentWaiting === "done"}
          >
            {booking.customerPaymentProofDataUrl ? (
              <a
                href={booking.customerPaymentProofDataUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[18px] border border-[#eee5f7] bg-white px-4 py-3 text-[13px] font-semibold text-[#8E5EB5]"
              >
                View customer payment proof
              </a>
            ) : null}
            {booking.bookingStatus === "cash_paid_by_user" ? (
              <button
                type="button"
                onClick={() => onConfirmPaymentReceived(booking.id)}
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-[#8E5EB5] text-[16px] font-extrabold text-white shadow-[0_16px_30px_rgba(142,94,181,0.24)]"
              >
                Payment Received
              </button>
            ) : null}
          </TimelineCard>
          <TimelineCard
            number={7}
            title="Provider Job Completed"
            state={stepState.userCompleted}
            dateLabel={formatStepDate(booking.reviewRequestedAt || booking.paidAt)}
            timeLabel={formatStepTime(booking.reviewRequestedAt || booking.paidAt)}
            expanded={stepState.userCompleted === "current" || stepState.userCompleted === "done"}
          >
            {booking.bookingStatus === "payment_received_by_provider" ? (
              <button
                type="button"
                onClick={() => onCompleteProviderJob(booking.id)}
                className="inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-[#8E5EB5] text-[16px] font-extrabold text-white shadow-[0_16px_30px_rgba(142,94,181,0.24)]"
              >
                Complete Job
              </button>
            ) : (
              <p className="text-[13px] leading-6 text-[#64748b]">
                The provider completion step is finished.
              </p>
            )}
          </TimelineCard>
          <TimelineCard
            number={8}
            title="Review"
            state={stepState.review}
            dateLabel={formatStepDate(booking.providerReviewedAt || booking.reviewedAt)}
            timeLabel={formatStepTime(booking.providerReviewedAt || booking.reviewedAt)}
            expanded={stepState.review === "current" || stepState.review === "done"}
          >
            {stepState.review === "current" ? (
              <button
                type="button"
                onClick={() => onOpenReview(booking)}
                className="inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-[#8E5EB5] text-[16px] font-extrabold text-white shadow-[0_16px_30px_rgba(142,94,181,0.24)]"
              >
                Review User
              </button>
            ) : null}
            {booking.providerReviewedAt ? (
              <div className="rounded-[18px] border border-[#eee5f7] bg-white px-4 py-3">
                <p className="text-[13px] font-semibold text-[#1f1630]">
                  Your rating: {booking.providerReviewRating ?? 0}/5
                </p>
                {booking.providerReviewComment ? (
                  <p className="mt-2 text-[13px] leading-6 text-[#64748b]">{booking.providerReviewComment}</p>
                ) : null}
              </div>
            ) : null}
          </TimelineCard>
        </div>
      ) : (
        <div className="mt-4 rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[#be123c]">
          This booking is closed.
        </div>
      )}

      {workImageCropSource ? (
        <ImageCropModal
          imageDataUrl={workImageCropSource}
          tone="work"
          onClose={handleWorkImageCropClose}
          onApply={handleWorkImageCropApply}
        />
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
  const [reviewBookingId, setReviewBookingId] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [autoReviewOpenedFor, setAutoReviewOpenedFor] = useState("");
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

  useEffect(() => {
    if (
      selectedBooking &&
      selectedBooking.bookingStatus === "completed" &&
      selectedBooking.providerReviewStatus !== "submitted" &&
      autoReviewOpenedFor !== selectedBooking.id &&
      !reviewBookingId
    ) {
      setAutoReviewOpenedFor(selectedBooking.id);
      openReviewModal(selectedBooking);
    }
  }, [autoReviewOpenedFor, reviewBookingId, selectedBooking]);
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
    const reason = window.prompt("Please enter the reason for declining this booking.");

    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      state.setError("Decline reason is required.");
      return;
    }

    state.handleBookingAction(bookingId, "declined_by_provider", trimmedReason);
  }

  function handleOnTheWay(bookingId: string) {
    state.handleBookingAction(bookingId, "on_the_way", "Provider started travel to customer");
  }

  function handleArrived(bookingId: string) {
    state.handleBookingAction(bookingId, "arrived", "Provider arrived at customer location");
  }

  function handleWorkFinished(bookingId: string, images: string[] = [], finalAmount = 0) {
    if (images.length < 1) {
      state.setError("Please attach at least 1 job image before sending the payment request.");
      return;
    }

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      state.setError("Final amount must be a valid number.");
      return;
    }

    state.handleBookingAction(
      bookingId,
      "final_payment_sent",
      "Provider marked work as finished and sent the final cash payment request.",
      {
        finalAmount,
        workFinishedImages: images,
      },
    );
  }

  function handleSendPaymentRequest(booking: ProviderBookingItem, finalAmount: number) {
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      state.setError("Final amount must be a valid number.");
      return;
    }

    state.handleBookingAction(
      booking.id,
      "final_payment_sent",
      booking.paymentNote || "Please review and confirm the final cash amount.",
      { finalAmount },
    );
  }

  function handleConfirmPaymentReceived(bookingId: string) {
    state.handleBookingAction(bookingId, "completed", "Provider confirmed payment received and completed the task.");
  }

  function handleCompleteProviderJob(bookingId: string) {
    state.handleBookingAction(bookingId, "completed", "Provider completed the booking and opened reviews.");
  }

  function openReviewModal(booking: ProviderBookingItem) {
    setReviewBookingId(booking.id);
    setReviewRating(booking.providerReviewRating ?? 0);
    setReviewComment(booking.providerReviewComment ?? "");
    setReviewPhotos([]);
  }

  async function handleSubmitProviderReview() {
    const client = getSupabaseClient();
    const bookingId = reviewBookingId;

    if (!bookingId) {
      return;
    }

    if (reviewRating < 1) {
      state.setError("Please choose a rating before submitting the provider review.");
      return;
    }

    if (!client) {
      state.setError("Supabase is not configured yet.");
      return;
    }

    setReviewLoading(true);
    state.setError("");
    state.setNotice("");

    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session) {
      state.setError("Your session expired. Please log in again.");
      setReviewLoading(false);
      return;
    }

    const response = await fetch(`/api/provider/bookings/${bookingId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
          photos: reviewPhotos,
        }),
    }).catch(() => null);

    const result = response
      ? ((await response.json().catch(() => ({}))) as { success?: boolean; error?: string })
      : null;

    if (!response || !response.ok || !result?.success) {
      state.setError(result?.error || "Unable to submit provider review.");
      setReviewLoading(false);
      return;
    }

    await state.reloadWorkspace();
    state.setNotice("Provider review submitted successfully.");
    setReviewBookingId("");
    setReviewRating(0);
    setReviewComment("");
    setReviewLoading(false);
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
            onWorkFinished={handleWorkFinished}
            onSendPaymentRequest={handleSendPaymentRequest}
            onConfirmPaymentReceived={handleConfirmPaymentReceived}
            onCompleteProviderJob={handleCompleteProviderJob}
            onOpenReview={openReviewModal}
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

                    {booking.bookingStatus === "pending_provider_response" || booking.bookingStatus === "pending" ? (
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
                    ) : booking.bookingStatus === "arrived" ? (
                      <AppButton
                        className="flex-1"
                        disabled={state.actionBookingId === booking.id}
                        onClick={() => handleWorkFinished(booking.id)}
                      >
                        Work Finished
                      </AppButton>
                    ) : (
                      <div className="flex flex-1 items-center rounded-[14px] bg-white px-4 text-[13px] font-semibold text-[#64748b]">
                        {isCompletedStatus(booking.bookingStatus)
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
      {reviewBookingId ? (
        <ProviderReviewModal
          customerName={state.bookings.find((booking) => booking.id === reviewBookingId)?.customerName || "Customer"}
          rating={reviewRating}
          comment={reviewComment}
          photos={reviewPhotos}
          loading={reviewLoading}
          onRatingChange={setReviewRating}
          onCommentChange={setReviewComment}
          onPhotosChange={setReviewPhotos}
          onClose={() => {
            if (!reviewLoading) {
              setReviewBookingId("");
            }
          }}
          onSubmit={handleSubmitProviderReview}
        />
      ) : null}
      <ProviderBottomNav />
    </MobilePage>
  );
}
