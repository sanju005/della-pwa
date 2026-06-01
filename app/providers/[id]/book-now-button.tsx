"use client";

import { useRouter } from "next/navigation";
import { MessageCircleMore } from "lucide-react";
import { useState } from "react";

type BookNowButtonProps = {
  providerId: string;
  providerName: string;
  serviceKey: string;
  serviceLabel: string;
  location: string;
  dateLabel: string;
  timeLabel: string;
  hourlyRate: number;
  dailyRate: number;
};

export function BookNowButton(props: BookNowButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBooking() {
    try {
      setPending(true);
      setError(null);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(props),
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
    <div className="sticky bottom-0 left-0 right-0 mt-7 border-t border-[#E8ECE8] bg-white px-5 py-4">
      {error ? (
        <p className="mb-3 text-[13px] font-semibold text-[#B42318]">{error}</p>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Message provider"
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border border-[#DCE5DE] bg-white text-[#16A34A]"
        >
          <MessageCircleMore className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={handleBooking}
          disabled={pending}
          className="inline-flex h-14 flex-1 items-center justify-center rounded-[16px] bg-[#16A34A] text-[18px] font-extrabold text-white disabled:opacity-70"
        >
          {pending ? "Booking..." : "Book Now"}
        </button>
      </div>
    </div>
  );
}
