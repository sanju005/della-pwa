import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, MapPin, Star } from "lucide-react";

import { getProviderCatalog } from "@/lib/provider-catalog";

export const dynamic = "force-dynamic";

export default async function ProvidersPage(props: {
  searchParams: Promise<{ service?: string }>;
}) {
  const searchParams = await props.searchParams;
  const data = await getProviderCatalog(searchParams.service ?? null);

  return (
    <main className="min-h-[100dvh] bg-[#f6fff8]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-white px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="py-5">
          <header className="flex items-center gap-4">
            <Link
              href="/home"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DFE7E2] bg-white text-[#0F172A]"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#16A34A]">
                DELLA Providers
              </p>
              <h1 className="mt-1 text-[26px] font-extrabold tracking-[-0.05em] text-[#0F172A]">
                {data.service ? `${data.serviceLabel} listings` : "All providers"}
              </h1>
            </div>
          </header>

          <p className="mt-4 text-[15px] leading-7 text-[#475467]">
            {data.service
              ? `Showing ${data.listings.length} ${data.serviceLabel.toLowerCase()} listings with prices, ratings, and booking details.`
              : `Showing ${data.listings.length} approved DELLA providers.`}
          </p>

          {data.errorMessage ? (
            <div className="mt-4 rounded-[18px] border border-[#F3C7C7] bg-[#FFF4F4] px-4 py-3 text-[13px] font-semibold text-[#B42318]">
              {data.errorMessage}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {data.listings.map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-[22px] border border-[#E5EBE6] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
              >
                <div className={`relative h-48 ${listing.imageTone}`}>
                  <div className="absolute left-4 top-4 rounded-[8px] bg-[#16A34A] px-3 py-1 text-[12px] font-bold text-white">
                    {listing.availabilityLabel}
                  </div>
                  <button
                    type="button"
                    aria-label="Save provider"
                    className="absolute right-4 top-4 text-white"
                  >
                    <Heart className="h-8 w-8" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.18)_100%)]" />
                  <div className="absolute bottom-0 right-3 h-40 w-28 rounded-t-[36px] bg-white/12" />
                  <div className="absolute bottom-6 left-4 rounded-[12px] bg-white/88 px-3 py-2 text-[12px] font-bold text-[#0F172A] shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                    {listing.yearsExperience}
                  </div>
                </div>

                <div className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
                        {listing.name}
                      </h2>
                      <p className="mt-1 text-[15px] text-[#0F172A]">
                        {listing.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-[#F8FBF8] px-3 py-1.5 text-[14px] font-bold text-[#0F172A]">
                      <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                      {listing.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[14px] text-[#475467]">
                    <MapPin className="h-4 w-4 text-[#16A34A]" />
                    <span>{listing.location}</span>
                    <span>•</span>
                    <span>{listing.distanceKm} km away</span>
                  </div>

                  <p className="mt-4 text-[14px] leading-7 text-[#475467]">
                    {listing.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {listing.specialties.map((specialty) => (
                      <span
                        key={`${listing.id}-${specialty}`}
                        className="rounded-full bg-[#EEF9F1] px-3 py-1 text-[12px] font-semibold text-[#16A34A]"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#E8ECE8] pt-4">
                    <div>
                      <p className="text-[14px] text-[#475467]">From</p>
                      <p className="mt-1 text-[24px] font-extrabold tracking-[-0.04em] text-[#16A34A]">
                        RM{listing.hourlyRate}/hr
                      </p>
                      <p className="text-[13px] text-[#475467]">
                        RM{listing.dailyRate}/day
                      </p>
                    </div>

                    <Link
                      href="/home"
                      className="inline-flex h-12 items-center gap-3 rounded-[16px] bg-[#16A34A] px-5 text-[15px] font-extrabold text-white"
                    >
                      Book now
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
