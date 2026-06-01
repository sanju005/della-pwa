import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Star,
  Timer,
} from "lucide-react";
import { notFound } from "next/navigation";

import { BookNowButton } from "./book-now-button";
import { getProviderDetail } from "@/lib/provider-detail";

export const dynamic = "force-dynamic";

export default async function ProviderDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const detail = await getProviderDetail(params.id, searchParams.service ?? null);

  if (!detail) {
    notFound();
  }

  const firstAvailableSlot =
    detail.availability.find((slot) => slot.state === "available") ??
    detail.availability[0];

  return (
    <main className="min-h-[100dvh] bg-[#f6fff8]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-white px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="py-5">
          <header className="flex items-center justify-between">
            <Link
              href={searchParams.service ? `/providers?service=${searchParams.service}` : "/providers"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#0F172A]"
            >
              <ArrowLeft className="h-7 w-7" />
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Save provider"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#0F172A]"
              >
                <Heart className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Share provider"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#0F172A]"
              >
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </header>

          <section className="mt-5 flex gap-4">
            <div className="relative h-[13.6rem] w-[10.5rem] shrink-0 overflow-hidden rounded-[26px]">
              <Image
                src={detail.profileImage}
                alt={detail.name}
                width={336}
                height={435}
                unoptimized
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/94 px-3 py-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                <span className="inline-flex items-center gap-2 text-[13px] font-bold text-[#0F172A]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                  Online
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h1 className="text-[26px] font-extrabold tracking-[-0.05em] text-[#0F172A]">
                  {detail.name}
                </h1>
                <BadgeCheck className="mt-1 h-6 w-6 shrink-0 fill-[#16A34A] text-[#16A34A]" />
              </div>
              <p className="mt-1 text-[17px] text-[#475467]">{detail.title}</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] text-[#344054]">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4.5 w-4.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-semibold">{detail.reviewsLabel}</span>
                </span>
                <span className="text-[#98A2B3]">•</span>
                <span>{detail.jobsCompleted} Jobs Completed</span>
              </div>

              <div className="mt-3 flex items-start gap-2 text-[15px] text-[#475467]">
                <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#475467]" />
                <span>{detail.locationFull}</span>
              </div>

              <div className="mt-3 flex items-start gap-2 text-[15px] font-semibold text-[#16A34A]">
                <ChevronRight className="mt-0.5 h-4.5 w-4.5 shrink-0 rotate-[-45deg]" />
                <span>{detail.distanceKm} km away from you</span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-left text-[13px] text-[#344054]">
                <InfoPill icon={<ShieldCheck className="h-5 w-5 text-[#16A34A]" />} label="Verified" />
                <InfoPill icon={<CheckCheck className="h-5 w-5 text-[#16A34A]" />} label="Background Checked" />
                <InfoPill icon={<BadgeCheck className="h-5 w-5 text-[#16A34A]" />} label={detail.yearsExperience} />
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="grid grid-cols-3 gap-2.5">
              {detail.gallery.map((image, index) => (
                <div
                  key={`${detail.id}-${image.src}`}
                  className="relative h-[12.3rem] overflow-hidden rounded-[20px]"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={256}
                    height={296}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.62)_100%)]" />
                  <p className="absolute bottom-4 left-3 right-3 text-[13px] font-medium leading-5 text-white">
                    {image.caption}
                  </p>
                  {index === 2 ? (
                    <div className="absolute bottom-4 right-3 rounded-full bg-black/35 px-2.5 py-1 text-[13px] font-bold text-white">
                      +12
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              {[0, 1, 2, 3].map((dot) => (
                <span
                  key={dot}
                  className={`h-2.5 w-2.5 rounded-full ${
                    dot === 0 ? "bg-[#16A34A]" : "bg-[#D9DDE3]"
                  }`}
                />
              ))}
            </div>
          </section>

          <section className="mt-7 rounded-[24px] border border-[#E6ECE7] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF9F1] text-[#16A34A]">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <h2 className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
                {detail.serviceLabel} Service
              </h2>
            </div>

            <div className="mt-5 rounded-[18px] border border-[#E7ECE7] px-4 py-5">
              <div className="grid grid-cols-2 gap-4">
                <PriceMetric
                  label="Per Hour Price"
                  value={`RM ${detail.hourlyRate}`}
                  suffix="/ hour"
                  icon={<Timer className="h-5 w-5 text-[#475467]" />}
                />
                <div className="border-l border-[#E8ECE8] pl-4">
                  <PriceMetric
                    label="Per Day Price"
                    value={`RM ${detail.dailyRate}`}
                    suffix="/ day"
                    icon={<CalendarDays className="h-5 w-5 text-[#475467]" />}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[16px] font-semibold text-[#0F172A]">Specialities</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {detail.specialties.map((specialty) => (
                  <span
                    key={`${detail.id}-${specialty}`}
                    className="rounded-full bg-[#EEF9F1] px-4 py-2 text-[14px] font-medium text-[#16A34A]"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[24px] border border-[#E6ECE7] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
              About {detail.name}
            </h2>
            <p className="mt-4 text-[16px] leading-8 text-[#344054]">{detail.about}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-[15px] font-bold text-[#16A34A]"
            >
              Read more
              <ChevronDown className="h-4 w-4" />
            </button>
          </section>

          <section className="mt-6 rounded-[24px] border border-[#E6ECE7] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
                Availability
              </h2>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-[15px] font-bold text-[#16A34A]"
              >
                <CalendarDays className="h-5 w-5" />
                View Calendar
              </button>
            </div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
              {detail.availability.map((slot, index) => (
                <div
                  key={`${detail.id}-${slot.dayLabel}-${slot.dateLabel}`}
                  className={`min-w-[7.2rem] rounded-[18px] border px-4 py-4 ${
                    index === 0
                      ? "border-[#B7E7C2] bg-[#F3FFF5]"
                      : "border-[#E7ECE7] bg-white"
                  }`}
                >
                  <p className="text-center text-[15px] font-semibold text-[#0F172A]">
                    {slot.dayLabel}
                  </p>
                  <p className="mt-1 text-center text-[13px] text-[#475467]">
                    {slot.dateLabel}
                  </p>
                  <p className="mt-5 text-center text-[15px] leading-6 text-[#0F172A]">
                    {slot.timeLabel}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                        slot.state === "available"
                          ? "bg-[#16A34A] text-white"
                          : "bg-[#F2F4F7] text-[#667085]"
                      }`}
                    >
                      {slot.state === "available" ? (
                        <CheckCheck className="h-4 w-4" />
                      ) : (
                        <span className="text-[16px]">×</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                aria-label="Next availability"
                className="inline-flex min-w-[3rem] items-center justify-center text-[#16A34A]"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </div>
          </section>

          <BookNowButton
            providerId={detail.id}
            providerName={detail.name}
            serviceKey={detail.serviceKey}
            serviceLabel={detail.serviceLabel}
            location={detail.location}
            dateLabel={`${firstAvailableSlot.dayLabel} ${firstAvailableSlot.dateLabel}`}
            timeLabel={firstAvailableSlot.timeLabel}
            hourlyRate={detail.hourlyRate}
            dailyRate={detail.dailyRate}
          />
        </div>
      </div>
    </main>
  );
}

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="space-y-2">
      <div>{icon}</div>
      <p className="leading-5">{label}</p>
    </div>
  );
}

function PriceMetric({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: string;
  suffix: string;
  icon: ReactNode;
}) {
  return (
    <div>
      <p className="text-[15px] text-[#475467]">{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-[18px] font-extrabold text-[#16A34A]">{value}</p>
        <p className="pb-0.5 text-[15px] text-[#344054]">{suffix}</p>
        <span className="ml-auto">{icon}</span>
      </div>
    </div>
  );
}
