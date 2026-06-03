"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";

import type { ProviderCalendarDate } from "@/lib/provider-detail";

type AvailabilityCalendarProps = {
  providerId: string;
  serviceQuery: string | null;
  monthLabel: string;
  dates: ProviderCalendarDate[];
};

export function AvailabilityCalendar({
  providerId,
  serviceQuery,
  monthLabel,
  dates,
}: AvailabilityCalendarProps) {
  const firstAvailable = useMemo(
    () => dates.find((date) => date.state === "available")?.isoDate ?? dates[0]?.isoDate ?? "",
    [dates]
  );
  const [selectedDate, setSelectedDate] = useState(firstAvailable);

  const weeks = useMemo(() => {
    const chunks: ProviderCalendarDate[][] = [];
    for (let index = 0; index < dates.length; index += 7) {
      chunks.push(dates.slice(index, index + 7));
    }
    return chunks;
  }, [dates]);

  const bookHref = serviceQuery
    ? `/providers/${encodeURIComponent(providerId)}/book?service=${encodeURIComponent(serviceQuery)}&date=${encodeURIComponent(selectedDate)}`
    : `/providers/${encodeURIComponent(providerId)}/book?date=${encodeURIComponent(selectedDate)}`;

  return (
    <section className="mt-5 rounded-[20px] border border-[#E6ECE7] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-extrabold text-[#0F172A]">
            Availability Calendar
          </h2>
          <p className="mt-1 text-[12px] text-[#667085]">{monthLabel}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF9F1] px-2.5 py-1 text-[11px] font-bold text-[#16A34A]">
          <CalendarDays className="h-3.5 w-3.5" />
          Choose a date
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[16px] border border-[#E7ECE7]">
        <div className="grid grid-cols-7 border-b border-[#E7ECE7] bg-[#F8FBF9]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
            <div
              key={label}
              className="px-1 py-2 text-center text-[10px] font-bold uppercase tracking-[0.05em] text-[#98A2B3]"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="space-y-px bg-[#E7ECE7]">
          {weeks.map((week, index) => (
            <div key={index} className="grid grid-cols-7 gap-px bg-[#E7ECE7]">
              {week.map((date) => {
                const isSelected = selectedDate === date.isoDate;
                const isBooked = date.state === "booked";

                return (
                  <button
                    key={date.isoDate}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedDate(date.isoDate)}
                    className={`min-h-[4.2rem] bg-white px-1.5 py-2 text-center ${
                      isBooked ? "opacity-55" : ""
                    } ${isSelected ? "bg-[#F3FFF5]" : ""}`}
                  >
                    <p className="text-[10px] font-semibold text-[#98A2B3]">
                      {date.weekdayShort}
                    </p>
                    <p
                      className={`mt-1 text-[14px] font-extrabold ${
                        isSelected ? "text-[#16A34A]" : "text-[#0F172A]"
                      }`}
                    >
                      {date.dayNumber}
                    </p>
                    <p
                      className={`mt-1 text-[10px] font-semibold ${
                        isBooked ? "text-[#B42318]" : "text-[#16A34A]"
                      }`}
                    >
                      {isBooked ? "Booked" : "Open"}
                    </p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[16px] bg-[#F8FBF9] px-3.5 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#98A2B3]">
            Selected Date
          </p>
          <p className="mt-1 text-[13px] font-bold text-[#0F172A]">
            {selectedDate || "Choose a date"}
          </p>
        </div>
        <Link
          href={bookHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-[#16A34A] px-4 text-[13px] font-extrabold text-white"
        >
          Book Date
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
