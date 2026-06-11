"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Heart,
  IdCard,
  MapPin,
  Phone,
  Star,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";

import type { ProviderDetail } from "@/lib/provider-detail";
import { getSupabaseClient } from "@/lib/supabase";

type BookingMode = "hourly" | "daily";
type BookingFlow = "instant" | "scheduled";

const startTimeOptions = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];
const instantHourOptions = [1, 2, 3, 4, 5, 6, 7, 8];

function timeToMinutes(label: string) {
  const [time, period] = label.split(" ");
  const [rawHour, rawMinute] = time.split(":").map(Number);
  let hour = rawHour % 12;
  if (period === "PM") {
    hour += 12;
  }
  return hour * 60 + rawMinute;
}

function minutesToTimeLabel(totalMinutes: number) {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function addHours(label: string, hours: number) {
  return minutesToTimeLabel(timeToMinutes(label) + hours * 60);
}

function hoursBetween(start: string, end: string) {
  const difference = timeToMinutes(end) - timeToMinutes(start);
  return Math.max(1, Math.round(difference / 60));
}

function toDateLabel(dayLabel: string, dateLabel: string) {
  return `${dayLabel}, ${dateLabel}`;
}

export function BookingFormScreen({
  detail,
  serviceQuery,
  initialDateQuery,
}: {
  detail: ProviderDetail;
  serviceQuery: string | null;
  initialDateQuery: string | null;
}) {
  const router = useRouter();
  const availableSlots = detail.availability.filter((slot) => slot.state === "available");
  const defaultSlot = availableSlots[0] ?? detail.availability[0];
  const queriedCalendarDate = initialDateQuery
    ? detail.calendarDates.find((date) => date.isoDate === initialDateQuery)
    : null;
  const defaultDateLabel = queriedCalendarDate
    ? `${queriedCalendarDate.weekdayShort}, ${new Date(
        `${queriedCalendarDate.isoDate}T00:00:00`
      ).toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`
    : initialDateQuery ?? toDateLabel(defaultSlot.dayLabel, defaultSlot.dateLabel);

  const [bookingMode, setBookingMode] = useState<BookingMode>("hourly");
  const [bookingFlow, setBookingFlow] = useState<BookingFlow>(
    initialDateQuery ? "scheduled" : "instant"
  );
  const [instantHours, setInstantHours] = useState(1);
  const [selectedDate, setSelectedDate] = useState(defaultDateLabel);
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("01:00 PM");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endTimeOptions = useMemo(() => {
    const startMinutes = timeToMinutes(startTime);
    return startTimeOptions
      .map((option) => ({ label: option, minutes: timeToMinutes(option) }))
      .filter((option) => option.minutes > startMinutes);
  }, [startTime]);

  const computedEndTime = bookingMode === "daily" ? addHours(startTime, 9) : endTime;
  const durationHours =
    bookingFlow === "instant"
      ? bookingMode === "daily"
        ? 1
        : instantHours
      : bookingMode === "daily"
        ? 9
        : hoursBetween(startTime, computedEndTime);
  const totalAmount =
    bookingMode === "daily"
      ? detail.dailyRate * durationHours
      : detail.hourlyRate * durationHours;
  const bookingDateLabel = bookingFlow === "scheduled" ? selectedDate : "Today";
  const bookingStartLabel = bookingFlow === "scheduled" ? startTime : "ASAP";
  const bookingEndLabel =
    bookingFlow === "scheduled"
      ? computedEndTime
      : bookingMode === "daily"
        ? `${durationHours} day booking`
        : `${durationHours} hour service`;
  const bookingTimeLabel =
    bookingFlow === "scheduled"
      ? `${startTime} - ${computedEndTime}`
      : bookingMode === "daily"
        ? `ASAP start • ${durationHours} day${durationHours === 1 ? "" : "s"}`
        : `ASAP • ${durationHours} hour${durationHours === 1 ? "" : "s"}`;

  async function handleBooking() {
    try {
      setPending(true);
      setError(null);
      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase is not configured yet.");
      }

      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          providerId: detail.id,
          providerName: detail.name,
          serviceKey: detail.serviceKey,
          serviceLabel: detail.serviceLabel,
          location: detail.location,
          bookingMode,
          dateLabel: bookingDateLabel,
          startTimeLabel: bookingStartLabel,
          endTimeLabel: bookingEndLabel,
          timeLabel: bookingTimeLabel,
          durationHours,
          notes,
          hourlyRate: detail.hourlyRate,
          dailyRate: detail.dailyRate,
          totalAmount,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Unable to create booking right now.");
      }

      router.push("/profile/bookings?created=1");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create booking right now."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#faf7fd]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-white px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="py-4 pb-34">
          <header className="flex items-center justify-between">
            <Link
              href={
                serviceQuery
                  ? `/providers/${encodeURIComponent(detail.id)}?service=${encodeURIComponent(serviceQuery)}`
                  : `/providers/${encodeURIComponent(detail.id)}`
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#0F172A]"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-[15px] font-extrabold text-[#0F172A]">
              Book {detail.name}
            </h1>
            <button
              type="button"
              aria-label="Save provider"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#0F172A]"
            >
              <Heart className="h-5 w-5" />
            </button>
          </header>

          <section className="mt-4 rounded-[22px] border border-[#E7ECE8] bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.045)]">
            <div className="flex gap-3">
              <div className="relative h-[9rem] w-[7.4rem] shrink-0 overflow-hidden rounded-[18px]">
                <Image
                  src={detail.profileImage}
                  alt={detail.name}
                  width={280}
                  height={336}
                  unoptimized
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 rounded-full bg-[#8E5EB5] px-2.5 py-1 text-[11px] font-bold text-white">
                  {detail.availabilityLabel}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <h2 className="truncate text-[15px] font-extrabold text-[#0F172A]">
                    {detail.name}
                  </h2>
                  <BadgeCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 fill-[#8E5EB5] text-[#8E5EB5]" />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#475467]">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="font-semibold text-[#0F172A]">{detail.reviewsLabel}</span>
                  </span>
                  <span className="text-[#D0D5DD]">|</span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5 fill-[#8E5EB5] text-[#8E5EB5]" />
                    <span className="font-semibold text-[#0F172A]">98%</span>
                    <span>(On-time)</span>
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[13px] text-[#475467]">
                  <MapPin className="h-3.5 w-3.5 text-[#8E5EB5]" />
                  <span>{detail.distanceKm} km away</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#F5F1FA] px-3 py-1.5 text-[12px] font-semibold text-[#8E5EB5]">
                    {detail.yearsExperience} Experience
                  </span>
                  <span className="rounded-full bg-[#F4F5F7] px-3 py-1.5 text-[12px] font-semibold text-[#667085]">
                    {detail.specialties[0] ?? detail.serviceLabel}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-[16px] bg-[#FAF7FD] px-2.5 py-2.5">
                  <div className="flex items-center gap-2 border-r border-[#E8DFF1] pr-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F1FA] text-[#8E5EB5]">
                      <IdCard className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-[#0F172A]">
                        ID verified
                      </p>
                    </div>
                    <BadgeCheck className="ml-auto h-4 w-4 shrink-0 fill-[#8E5EB5] text-[#8E5EB5]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F1FA] text-[#8E5EB5]">
                      <Phone className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-[#0F172A]">
                        Phone verified
                      </p>
                    </div>
                    <BadgeCheck className="ml-auto h-4 w-4 shrink-0 fill-[#8E5EB5] text-[#8E5EB5]" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[20px] border border-[#E7ECE8] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-[15px] font-extrabold text-[#0F172A]">
              1. Service Type
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingMode("hourly")}
                className={`rounded-[16px] border px-4 py-3.5 text-left ${
                  bookingMode === "hourly"
                    ? "border-[#8E5EB5] shadow-[0_0_0_1px_rgba(142,94,181,0.16)]"
                    : "border-[#E5ECE7]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F1FA] text-[#8E5EB5]">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <span
                    className={`h-6 w-6 rounded-full border-2 ${
                      bookingMode === "hourly"
                        ? "border-[#8E5EB5] bg-[#8E5EB5] shadow-[inset_0_0_0_3px_white]"
                        : "border-[#D0D5DD]"
                    }`}
                  />
                </div>
                <p className="mt-3 text-[14px] font-extrabold text-[#0F172A]">Hourly</p>
                <p className="mt-1 text-[13px] font-semibold text-[#8E5EB5]">RM{detail.hourlyRate} / hr</p>
              </button>

              <button
                type="button"
                onClick={() => setBookingMode("daily")}
                className={`rounded-[16px] border px-4 py-3.5 text-left ${
                  bookingMode === "daily"
                    ? "border-[#8E5EB5] shadow-[0_0_0_1px_rgba(142,94,181,0.16)]"
                    : "border-[#E5ECE7]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F6] text-[#667085]">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <span
                    className={`h-6 w-6 rounded-full border-2 ${
                      bookingMode === "daily"
                        ? "border-[#8E5EB5] bg-[#8E5EB5] shadow-[inset_0_0_0_3px_white]"
                        : "border-[#D0D5DD]"
                    }`}
                  />
                </div>
                <p className="mt-3 text-[14px] font-extrabold text-[#0F172A]">Daily</p>
                <p className="mt-1 text-[13px] font-semibold text-[#667085]">RM{detail.dailyRate} / day</p>
              </button>
            </div>

            <div className="mt-3 rounded-[14px] border border-[#E8ECE8] bg-[#FBFCFC] px-3.5 py-2.5 text-[12px] leading-5 text-[#475467]">
              {bookingMode === "hourly"
                ? `Hourly booking lets you choose date, start time, and end time.`
                : `Daily booking uses one date and start time only. End time is automatically set to 9 hours later.`}
            </div>
          </section>

          <section className="mt-5 rounded-[20px] border border-[#E7ECE8] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-[15px] font-extrabold text-[#0F172A]">
              2. Booking Option
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingFlow("instant")}
                className={`rounded-[16px] border px-4 py-3.5 text-left ${
                  bookingFlow === "instant"
                    ? "border-[#8E5EB5] bg-[#F8F4FC] shadow-[0_0_0_1px_rgba(142,94,181,0.16)]"
                    : "border-[#E5ECE7] bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F1FA] text-[#8E5EB5]">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                  <span
                    className={`h-6 w-6 rounded-full border-2 ${
                      bookingFlow === "instant"
                        ? "border-[#8E5EB5] bg-[#8E5EB5] shadow-[inset_0_0_0_3px_white]"
                        : "border-[#D0D5DD]"
                    }`}
                  />
                </div>
                <p className="mt-3 text-[14px] font-extrabold text-[#0F172A]">Book Now</p>
                <p className="mt-1 text-[13px] text-[#667085]">
                  Book directly with price and service details.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBookingFlow("scheduled")}
                className={`rounded-[16px] border px-4 py-3.5 text-left ${
                  bookingFlow === "scheduled"
                    ? "border-[#8E5EB5] bg-[#F8F4FC] shadow-[0_0_0_1px_rgba(142,94,181,0.16)]"
                    : "border-[#E5ECE7] bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F1FA] text-[#8E5EB5]">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <span
                    className={`h-6 w-6 rounded-full border-2 ${
                      bookingFlow === "scheduled"
                        ? "border-[#8E5EB5] bg-[#8E5EB5] shadow-[inset_0_0_0_3px_white]"
                        : "border-[#D0D5DD]"
                    }`}
                  />
                </div>
                <p className="mt-3 text-[14px] font-extrabold text-[#0F172A]">Schedule Booking</p>
                <p className="mt-1 text-[13px] text-[#667085]">
                  Choose your preferred date and time first.
                </p>
              </button>
            </div>

            <div className="mt-3 rounded-[14px] border border-[#E8ECE8] bg-[#FBFCFC] px-3.5 py-2.5 text-[12px] leading-5 text-[#475467]">
              {bookingFlow === "scheduled"
                ? "Schedule booking shows the calendar and time slots below."
                : "Book now will create the booking instantly with the duration and pricing you choose below."}
            </div>
          </section>

          {bookingFlow === "instant" ? (
            <section className="mt-5 rounded-[20px] border border-[#E7ECE8] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <h2 className="text-[15px] font-extrabold text-[#0F172A]">
                3. Duration
              </h2>

              {bookingMode === "hourly" ? (
                <>
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {instantHourOptions.map((hours) => {
                      const active = instantHours === hours;
                      return (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => setInstantHours(hours)}
                          className={`min-w-[4.8rem] rounded-[16px] border px-3 py-3 text-center ${
                            active
                              ? "border-[#8E5EB5] bg-[#F5F1FA] text-[#8E5EB5]"
                              : "border-[#E5ECE7] bg-white text-[#0F172A]"
                          }`}
                        >
                          <p className="text-[16px] font-extrabold">{hours}</p>
                          <p className="mt-1 text-[12px] font-semibold">
                            {hours === 1 ? "Hour" : "Hours"}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-[16px] bg-[#F8F4FC] px-4 py-3.5">
                    <p className="text-[13px] text-[#667085]">Instant Service</p>
                    <p className="mt-1 text-[18px] font-extrabold text-[#8E5EB5]">
                      {instantHours} {instantHours === 1 ? "Hour" : "Hours"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {[1, 2, 3].map((days) => {
                      const active = instantHours === days;
                      return (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setInstantHours(days)}
                          className={`min-w-[5.4rem] rounded-[16px] border px-3 py-3 text-center ${
                            active
                              ? "border-[#8E5EB5] bg-[#F5F1FA] text-[#8E5EB5]"
                              : "border-[#E5ECE7] bg-white text-[#0F172A]"
                          }`}
                        >
                          <p className="text-[16px] font-extrabold">{days}</p>
                          <p className="mt-1 text-[12px] font-semibold">
                            {days === 1 ? "Day" : "Days"}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-[16px] bg-[#F8F4FC] px-4 py-3.5">
                    <p className="text-[13px] text-[#667085]">Instant Service</p>
                    <p className="mt-1 text-[18px] font-extrabold text-[#8E5EB5]">
                      {durationHours} {durationHours === 1 ? "Day" : "Days"}
                    </p>
                  </div>
                </>
              )}
            </section>
          ) : null}

          {bookingFlow === "scheduled" ? (
            <section className="mt-5 rounded-[20px] border border-[#E7ECE8] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <h2 className="text-[15px] font-extrabold text-[#0F172A]">
                3. Date & Time
              </h2>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {detail.availability.map((slot) => {
                  const slotValue = toDateLabel(slot.dayLabel, slot.dateLabel);
                  const active = selectedDate === slotValue;
                  return (
                    <button
                      key={slotValue}
                      type="button"
                      disabled={slot.state !== "available"}
                      onClick={() => setSelectedDate(slotValue)}
                      className={`min-w-[4.6rem] rounded-[16px] border px-3 py-3 text-center ${
                        active
                          ? "border-[#8E5EB5] bg-[#F5F1FA] text-[#8E5EB5]"
                          : slot.state === "available"
                            ? "border-[#E5ECE7] bg-white text-[#0F172A]"
                            : "border-[#ECEFEC] bg-[#F8F9F8] text-[#98A2B3]"
                      }`}
                    >
                      <p className="text-[14px] font-semibold">{slot.dayLabel}</p>
                      <p className="mt-1 text-[13px]">{slot.dateLabel}</p>
                    </button>
                  );
                })}
              </div>

              <div className={`mt-5 grid gap-3 ${bookingMode === "hourly" ? "grid-cols-2" : "grid-cols-1"}`}>
                <label className="block">
                  <span className="mb-2 block text-[14px] font-semibold text-[#344054]">
                    Start time
                  </span>
                  <span className="relative block">
                    <select
                      value={startTime}
                      onChange={(event) => {
                        const nextStart = event.target.value;
                        setStartTime(nextStart);
                        if (bookingMode === "hourly") {
                          const nextEnd = endTimeOptions.find(
                            (option) => option.minutes > timeToMinutes(nextStart) + 60
                          );
                          setEndTime(nextEnd?.label ?? addHours(nextStart, 1));
                        }
                      }}
                      className="h-12 w-full appearance-none rounded-[14px] border border-[#E5ECE7] bg-white px-4 pr-10 text-[14px] font-semibold text-[#0F172A] outline-none"
                    >
                      {startTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
                  </span>
                </label>

                {bookingMode === "hourly" ? (
                  <label className="block">
                    <span className="mb-2 block text-[14px] font-semibold text-[#344054]">
                      End time
                    </span>
                    <span className="relative block">
                      <select
                        value={endTime}
                        onChange={(event) => setEndTime(event.target.value)}
                        className="h-12 w-full appearance-none rounded-[14px] border border-[#E5ECE7] bg-white px-4 pr-10 text-[14px] font-semibold text-[#0F172A] outline-none"
                      >
                        {endTimeOptions.map((time) => (
                          <option key={time.label} value={time.label}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#667085]" />
                    </span>
                  </label>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[16px] bg-[#F8F4FC] px-4 py-3.5">
                  <p className="text-[13px] text-[#667085]">Estimated End Time</p>
                  <p className="mt-1 text-[18px] font-extrabold text-[#8E5EB5]">
                    {computedEndTime}
                  </p>
                </div>
                <div className="rounded-[16px] bg-[#F8F4FC] px-4 py-3.5">
                  <p className="text-[13px] text-[#667085]">Duration</p>
                  <p className="mt-1 text-[18px] font-extrabold text-[#0F172A]">
                    {durationHours} {durationHours === 1 ? "Hour" : "Hours"}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="mt-5 rounded-[20px] border border-[#E7ECE8] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-[15px] font-extrabold text-[#0F172A]">
              {bookingFlow === "scheduled" ? "4. Additional Notes (Optional)" : "4. Additional Notes (Optional)"}
            </h2>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value.slice(0, 200))}
              placeholder="Add any special instructions or notes..."
              className="mt-3 min-h-[7rem] w-full rounded-[16px] border border-[#E5ECE7] px-4 py-3.5 text-[14px] text-[#0F172A] outline-none placeholder:text-[#98A2B3]"
            />
            <p className="mt-2 text-right text-[13px] text-[#667085]">{notes.length}/200</p>
          </section>

          <section className="mt-5 rounded-[20px] border border-[#E7ECE8] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8F4FC_100%)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-[15px] font-extrabold text-[#0F172A]">
              Booking Summary
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-[14px] text-[#475467]">
              <div>
                <p className="text-[13px] text-[#667085]">Service Type</p>
                <p className="mt-2 font-semibold text-[#0F172A]">
                  {bookingMode === "hourly" ? "Hourly" : "Daily"}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-[#667085]">Date & Time</p>
                <p className="mt-2 font-semibold text-[#0F172A]">
                  {bookingDateLabel}
                  <br />
                  {bookingFlow === "scheduled" ? startTime : bookingTimeLabel}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-[#667085]">Duration</p>
                <p className="mt-2 font-semibold text-[#0F172A]">
                  {bookingMode === "daily"
                    ? `${durationHours} ${durationHours === 1 ? "Day" : "Days"}`
                    : `${durationHours} ${durationHours === 1 ? "Hour" : "Hours"}`}
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-dashed border-[#D9E3DC] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#0F172A]">Total</span>
                <span className="text-[23px] font-extrabold text-[#8E5EB5]">
                  RM{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-[#E8ECE8] bg-white px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3.5">
          {error ? (
            <p className="mb-3 text-[13px] font-semibold text-[#B42318]">{error}</p>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-[#667085]">Total</p>
              <p className="mt-1 text-[20px] font-extrabold text-[#8E5EB5]">
                RM{totalAmount.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBooking}
              disabled={pending}
              className="inline-flex h-12 min-w-[11.5rem] items-center justify-center gap-2 rounded-[14px] bg-[#8E5EB5] px-5 text-[16px] font-extrabold text-white disabled:opacity-70"
            >
              {pending ? "Booking..." : bookingFlow === "scheduled" ? "Schedule Booking" : "Book Now"}
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-2 text-[12px] text-[#667085]">
            <ShieldCheck className="h-4 w-4 text-[#8E5EB5]" />
            <span>You won&apos;t be charged yet</span>
          </div>
        </div>
      </div>
    </main>
  );
}
