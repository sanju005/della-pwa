"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircleMore } from "lucide-react";

type BookNowButtonProps = {
  providerId: string;
};

export function BookNowButton({ providerId }: BookNowButtonProps) {
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const href = service
    ? `/providers/${encodeURIComponent(providerId)}/book?service=${encodeURIComponent(service)}`
    : `/providers/${encodeURIComponent(providerId)}/book`;

  return (
    <div className="sticky bottom-0 left-0 right-0 mt-7 border-t border-[#E8ECE8] bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Message provider"
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border border-[#DCE5DE] bg-white text-[#16A34A]"
        >
          <MessageCircleMore className="h-6 w-6" />
        </button>
        <Link
          href={href}
          className="inline-flex h-14 flex-1 items-center justify-center rounded-[16px] bg-[#16A34A] text-[18px] font-extrabold text-white"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
