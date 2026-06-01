import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  CookingPot,
  House,
  MapPin,
  MessageCircleMore,
  Search,
  SprayCan,
  Star,
  UserRound,
  WalletCards,
  Wrench,
  Baby,
  CarFront,
  Bolt,
  Heart,
  CalendarDays,
} from "lucide-react";

import type { HomeFeedData, HomeServiceCategory } from "@/lib/home-feed";
import { buildProviderDetailHref } from "@/lib/provider-catalog";

export function MarketplaceScreen({
  greetingName,
  locationLabel,
  categories,
  popularProviders,
  upcomingBooking,
  errorMessage,
}: HomeFeedData) {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f6fff8]">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-white px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="relative min-h-[100dvh] bg-white py-5 pb-28">
          <div className="pointer-events-none absolute right-[-12%] top-[-2%] h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(187,247,208,0.7),_transparent_68%)]" />

          <header className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[28px] font-extrabold leading-none tracking-[-0.06em] text-[#16A34A]">
                  DELLA
                </p>
                <h1 className="mt-7 text-[28px] font-extrabold leading-[1.12] tracking-[-0.05em] text-[#0F172A]">
                  {timePrefix()}{" "}
                  <span className="inline-flex items-center gap-1">
                    {greetingName} <span aria-hidden>👋</span>
                  </span>
                </h1>
                <div className="mt-3 flex items-center gap-2 text-[15px] font-semibold text-[#0F172A]">
                  <MapPin className="h-5 w-5 text-[#16A34A]" />
                  <span>{locationLabel}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              <button
                type="button"
                aria-label="Notifications"
                className="relative mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0F172A]"
              >
                <Bell className="h-7 w-7 stroke-[2.2]" />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
              </button>
            </div>

            <div className="mt-6 flex h-[58px] items-center rounded-[20px] border border-[#DFE7E2] bg-white px-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
              <Search className="h-6 w-6 text-[#0F172A]" />
              <input
                type="text"
                placeholder="What service do you need today?"
                className="ml-4 h-full flex-1 border-0 bg-transparent text-[16px] text-[#0F172A] outline-none placeholder:text-[#667085]"
              />
            </div>
          </header>

          <section className="mt-8 rounded-[26px] border border-[#E8EEE9] bg-white px-4 py-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
            <div className="grid grid-cols-4 gap-y-6">
                {categories.map((category) => (
                  <CategoryItem key={category.key} category={category} />
                ))}
              </div>
            </section>

          <section className="mt-6 overflow-hidden rounded-[24px] bg-[#16A34A] px-4 py-6 text-white shadow-[0_18px_36px_rgba(22,163,74,0.18)]">
            <div className="relative">
              <div className="max-w-[12.5rem]">
                <h2 className="text-[24px] font-extrabold leading-[1.08] tracking-[-0.05em]">
                  Book trusted home services near you
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-white/88">
                  Verified providers, clear prices, easy booking
                </p>
                <Link
                  href="/providers"
                  className="mt-6 inline-flex h-14 items-center gap-3 rounded-[16px] bg-white px-6 text-[16px] font-extrabold text-[#16A34A]"
                >
                  Book Now
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="pointer-events-none absolute bottom-[-2.5rem] right-[-0.5rem] h-52 w-44">
                <div className="absolute right-2 top-3 h-44 w-32 rounded-t-[90px] rounded-b-[18px] bg-[#1AA84C]" />
                <div className="absolute right-0 top-10 h-36 w-24 rotate-[18deg] rounded-[14px] bg-[#1C8E46]" />
                <div className="absolute bottom-0 right-4 h-42 w-20 rounded-t-[48px] bg-[#0F7F38]" />
                <div className="absolute right-12 top-2 h-11 w-11 rounded-full bg-[#F3D7C1]" />
                <div className="absolute right-10 top-16 h-18 w-15 rounded-[18px] bg-[#1E5F35]" />
                <div className="absolute right-9 top-23 h-14 w-17 rounded-[16px] bg-[#145B2E]" />
                <div className="absolute right-[5.25rem] top-[4.85rem] h-12 w-1.5 rounded-full bg-[#F3D7C1]" />
                <div className="absolute right-[4.65rem] top-[5.65rem] h-12 w-1.5 rounded-full bg-[#F3D7C1]" />
                <div className="absolute right-[3.2rem] top-[5.8rem] h-12 w-1.5 rounded-full bg-[#F3D7C1]" />
                <div className="absolute right-[2.6rem] top-[6.2rem] h-12 w-1.5 rounded-full bg-[#F3D7C1]" />
                <div className="absolute right-[4.2rem] top-[4.4rem] h-2.5 w-6 rounded-full bg-[#ffffff] text-center text-[7px] font-extrabold leading-[10px] text-[#0F7F38]">
                  DELLA
                </div>
                <div className="absolute bottom-6 right-0 h-20 w-10">
                  <div className="absolute bottom-0 left-3 h-11 w-4 rounded-t-full bg-[#3CA452]" />
                  <div className="absolute bottom-7 left-0 h-7 w-4 rotate-[-28deg] rounded-full bg-[#67C66E]" />
                  <div className="absolute bottom-9 left-4 h-7 w-4 rotate-[24deg] rounded-full bg-[#58B85F]" />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
                Popular near you
              </h2>
              <Link href="/providers" className="text-[14px] font-extrabold text-[#16A34A]">
                See all
              </Link>
            </div>

            {errorMessage ? (
              <div className="mb-4 rounded-[18px] border border-[#F3C7C7] bg-[#FFF4F4] px-4 py-3 text-[13px] font-semibold text-[#B42318]">
                {errorMessage}
              </div>
            ) : null}

            <div className="-mx-5 overflow-x-auto px-5 pb-2">
              <div className="flex gap-4">
                {popularProviders.map((provider, index) => (
                  <article
                    key={provider.id}
                    className="w-[15.8rem] shrink-0 overflow-hidden rounded-[20px] border border-[#E5EBE6] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                  >
                    <div className={`relative h-36 ${cardPhotoTone(index)}`}>
                      <div className="absolute left-3 top-3 rounded-[8px] bg-[#16A34A] px-2.5 py-1 text-[11px] font-bold text-white">
                        {provider.statusLabel}
                      </div>
                      <button
                        type="button"
                        aria-label="Save provider"
                        className="absolute right-3 top-3 text-white"
                      >
                        <Heart className="h-7 w-7" />
                      </button>
                      <div className="absolute bottom-0 right-2 h-32 w-24 rounded-t-[30px] bg-white/14" />
                    </div>

                    <div className="px-4 py-3">
                      <h3 className="text-[16px] font-extrabold tracking-[-0.03em] text-[#0F172A]">
                        {provider.name}
                      </h3>
                      <p className="mt-1 text-[14px] text-[#0F172A]">{provider.service}</p>

                      <div className="mt-2 flex items-center gap-1 text-[14px] text-[#0F172A]">
                        <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                        <span className="text-[#475467]">({provider.reviews})</span>
                      </div>

                      <div className="mt-2 flex items-center gap-1 text-[14px] text-[#475467]">
                        <MapPin className="h-4 w-4 text-[#16A34A]" />
                        <span>{provider.distanceKm} km away</span>
                      </div>

                      <div className="mt-3 border-t border-[#E8ECE8] pt-3">
                        <p className="text-[14px] text-[#475467]">From</p>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <p className="text-[18px] font-extrabold text-[#16A34A]">
                            {provider.priceLabel}
                          </p>
                          <Link
                            href={buildProviderDetailHref({
                              id: provider.id,
                              serviceKey: provider.serviceKey,
                            })}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#16A34A] text-white"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
                Upcoming booking
              </h2>
              <Link
                href="/profile/bookings"
                className="text-[14px] font-extrabold text-[#16A34A]"
              >
                See all bookings
              </Link>
            </div>

            <div className="rounded-[22px] border border-[#E5EBE6] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
              {upcomingBooking ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-[18px] bg-[#EEF9F1] text-[#0F172A]">
                    <House className="h-12 w-12 stroke-[1.6]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-extrabold tracking-[-0.03em] text-[#0F172A]">
                      {upcomingBooking.title}
                    </h3>
                    <p className="mt-1 text-[15px] font-semibold text-[#0F172A]">
                      {upcomingBooking.provider}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-[14px] text-[#475467]">
                      <CalendarDays className="h-4 w-4 text-[#16A34A]" />
                      <span>{upcomingBooking.scheduleLabel}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[14px] text-[#475467]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#86EFAC]" />
                      <span>
                        Status:{" "}
                        <span className="font-bold text-[#F59E0B]">
                          {upcomingBooking.statusLabel}
                        </span>
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/profile/bookings"
                    className="inline-flex h-13 shrink-0 items-center gap-3 rounded-[16px] border border-[#16A34A] px-6 text-[15px] font-extrabold text-[#16A34A]"
                  >
                    View Details
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <div className="text-[14px] leading-7 text-[#475467]">
                  No upcoming booking yet.
                </div>
              )}
            </div>
          </section>

          <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-[#E8ECE8] bg-white/97 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur">
            <div className="flex items-center justify-between gap-1">
              <BottomNavLink href="/home" label="Home" active icon={<House className="h-5 w-5 stroke-[1.9]" />} />
              <BottomNavLink href="/profile/bookings" label="Bookings" icon={<BookOpen className="h-5 w-5 stroke-[1.9]" />} />
              <BottomNavLink href="/profile/messages" label="Messages" icon={<MessageCircleMore className="h-5 w-5 stroke-[1.9]" />} />
              <BottomNavLink href="/profile/wallet" label="Wallet" icon={<WalletCards className="h-5 w-5 stroke-[1.9]" />} />
              <BottomNavLink href="/profile" label="Profile" icon={<CircleUserRound className="h-5 w-5 stroke-[1.9]" />} />
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}

function CategoryItem({ category }: { category: HomeServiceCategory }) {
  return (
    <Link
      href={`/providers?service=${category.key}`}
      className="flex flex-col items-center text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF9F1] text-[#0F172A]">
        <CategoryIcon kind={category.key} />
      </div>
      <p className="mt-3 text-[14px] font-bold tracking-[-0.03em] text-[#0F172A]">
        {category.label}
      </p>
    </Link>
  );
}

function CategoryIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "chef":
      return <CookingPot className="h-8 w-8 stroke-[2]" />;
    case "maid":
      return <BriefcaseBusiness className="h-8 w-8 stroke-[2]" />;
    case "babysitter":
      return <Baby className="h-8 w-8 stroke-[2]" />;
    case "driver":
      return <CarFront className="h-8 w-8 stroke-[2]" />;
    case "cleaner":
      return <SprayCan className="h-8 w-8 stroke-[2]" />;
    case "tutor":
      return <BookOpen className="h-8 w-8 stroke-[2]" />;
    case "plumber":
      return <Wrench className="h-8 w-8 stroke-[2]" />;
    case "electrician":
      return <Bolt className="h-8 w-8 stroke-[2]" />;
    default:
      return <UserRound className="h-8 w-8 stroke-[2]" />;
  }
}

function BottomNavLink({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-[3.1rem] flex-col items-center gap-1 text-[10.5px] font-medium ${
        active ? "text-[#16A34A]" : "text-[#8A94A6]"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className="flex h-3 items-end">
        <span
          className={`rounded-full transition-all ${
            active ? "h-[3px] w-10 bg-[#16A34A]" : "h-[3px] w-6 bg-transparent"
          }`}
        />
      </span>
    </Link>
  );
}

function timePrefix() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning,";
  }

  if (hour < 18) {
    return "Good afternoon,";
  }

  return "Good evening,";
}

function cardPhotoTone(index: number) {
  const tones = [
    "bg-[linear-gradient(135deg,#3a2417_0%,#8f5a35_40%,#d6b089_100%)]",
    "bg-[linear-gradient(135deg,#d7c0a9_0%,#f2e7d9_45%,#8cb39a_100%)]",
    "bg-[linear-gradient(135deg,#d6c7b2_0%,#f0e3d7_45%,#9e8a72_100%)]",
    "bg-[linear-gradient(135deg,#d8e6db_0%,#f0f6ef_45%,#7aa884_100%)]",
  ];

  return tones[index % tones.length];
}
