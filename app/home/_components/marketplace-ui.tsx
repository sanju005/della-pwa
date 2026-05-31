import Link from "next/link";

import type { MarketplaceProvider } from "@/lib/provider-marketplace";

type MarketplaceShellProps = {
  providers: MarketplaceProvider[];
  totalProviders: number;
  services: string[];
  errorMessage: string | null;
  title?: string;
  subtitle?: string;
};

export function MarketplaceScreen({
  providers,
  totalProviders,
  services,
  errorMessage,
  title = "Find trusted services near you",
  subtitle = "Browse approved DELLA providers for home and lifestyle needs.",
}: MarketplaceShellProps) {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f6fff8]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f7fdf8_100%)] px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="relative min-h-[100dvh] overflow-hidden">
          <div className="pointer-events-none absolute right-[-18%] top-[-10%] h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(187,247,208,0.9),_transparent_70%)]" />
          <div className="pointer-events-none absolute inset-x-[-10%] bottom-[-12%] h-40 rounded-full bg-[radial-gradient(circle,_rgba(22,163,74,0.12),_transparent_68%)]" />

          <div className="relative z-10 flex h-full min-h-[100dvh] flex-col py-5">
            <header className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[20px] font-extrabold tracking-[-0.05em] text-[#16a34a]">
                  DELLA
                </p>
                <p className="mt-1 text-[13px] leading-5 text-[#475569]">
                  Home and lifestyle marketplace
                </p>
              </div>
              <Link
                href="/profile"
                className="inline-flex h-11 items-center rounded-full border border-[#dce8df] bg-white px-4 text-[13px] font-bold text-[#111827] shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
              >
                Profile
              </Link>
            </header>

            <section className="rounded-[28px] bg-[linear-gradient(135deg,#0f7b32_0%,#16a34a_48%,#1cab54_100%)] p-5 text-white shadow-[0_22px_40px_rgba(22,163,74,0.24)]">
              <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-white/70">
                Live Marketplace
              </p>
              <h1 className="mt-3 max-w-[16rem] text-[34px] font-extrabold leading-[1.02] tracking-[-0.06em]">
                {title}
              </h1>
              <p className="mt-4 max-w-[18rem] text-[14px] leading-7 text-white/84">
                {subtitle}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[22px] bg-white/12 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                    Approved Providers
                  </p>
                  <p className="mt-2 text-[24px] font-extrabold">{totalProviders}</p>
                </div>
                <div className="rounded-[22px] bg-white/12 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                    Service Types
                  </p>
                  <p className="mt-2 text-[24px] font-extrabold">{services.length}</p>
                </div>
              </div>
            </section>

            <section className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-extrabold text-[#111827]">
                  Popular Services
                </h2>
                <Link
                  href="/providers"
                  className="text-[13px] font-bold text-[#16a34a]"
                >
                  View all
                </Link>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {services.map((service) => (
                  <div
                    key={service}
                    className="shrink-0 rounded-full border border-[#dce8df] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] shadow-[0_6px_12px_rgba(15,23,42,0.03)]"
                  >
                    {service}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 flex-1">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-extrabold text-[#111827]">
                  Top Providers
                </h2>
                <Link
                  href="/profile/bookings"
                  className="text-[13px] font-bold text-[#16a34a]"
                >
                  My bookings
                </Link>
              </div>

              {errorMessage ? (
                <div className="rounded-[20px] border border-[#f1d2d2] bg-[#fff6f6] px-4 py-4 text-[13px] leading-6 text-[#991b1b]">
                  {errorMessage}
                </div>
              ) : null}

              <div className="space-y-4">
                {providers.map((provider) => (
                  <article
                    key={provider.id}
                    className="rounded-[22px] border border-[#e3ece6] bg-white p-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex items-start gap-3">
                      <AvatarTile label={provider.serviceLabel} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-[17px] font-extrabold tracking-[-0.03em] text-[#111827]">
                              {provider.name}
                            </h3>
                            <p className="mt-1 text-[14px] font-semibold text-[#16a34a]">
                              {provider.serviceLabel}
                            </p>
                          </div>
                          <div className="rounded-full bg-[#f4fbf5] px-2.5 py-1 text-[12px] font-bold text-[#15803d]">
                            {provider.rating.toFixed(1)}
                          </div>
                        </div>

                        <p className="mt-3 text-[13px] leading-6 text-[#475569]">
                          {provider.bio}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[#64748b]">
                          <MetaPill>{provider.location}</MetaPill>
                          <MetaPill>{provider.radiusKm} KM radius</MetaPill>
                          <MetaPill>{provider.yearsExperience}</MetaPill>
                          <MetaPill>{provider.reviews} reviews</MetaPill>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {provider.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="rounded-full bg-[#eff9f0] px-3 py-1 text-[12px] font-semibold text-[#15803d]"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[12px] text-[#64748b]">Rates</p>
                            <p className="mt-1 text-[15px] font-extrabold text-[#111827]">
                              RM{provider.hourlyRate}/hr
                            </p>
                            <p className="text-[12px] text-[#64748b]">
                              RM{provider.dailyRate}/day
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {provider.phoneVerified ? (
                              <VerificationBadge label="Phone verified" />
                            ) : null}
                            {provider.identityVerified ? (
                              <VerificationBadge label="ID verified" />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <nav className="mt-5 flex items-center justify-between border-t border-[#e5ebe7] pt-3 text-[11px] font-medium text-[#6b7280]">
              <BottomNavLink href="/home" label="Home" active />
              <BottomNavLink href="/providers" label="Providers" />
              <BottomNavLink href="/profile/bookings" label="Bookings" />
              <BottomNavLink href="/profile" label="Profile" />
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}

function AvatarTile({ label }: { label: string }) {
  const letter = label.charAt(0);

  return (
    <div className="inline-flex h-[4.4rem] w-[4.4rem] shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#16a34a_0%,#0f7b32_100%)] text-[28px] font-extrabold text-white shadow-[0_12px_22px_rgba(22,163,74,0.25)]">
      {letter}
    </div>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#e1ebe4] bg-[#fbfffb] px-2.5 py-1">
      {children}
    </span>
  );
}

function VerificationBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f9ec] px-2.5 py-1 text-[11px] font-bold text-[#15803d]">
      <CheckIcon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function BottomNavLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-14 flex-col items-center gap-1 ${active ? "text-[#16a34a]" : ""}`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-[#16a34a]" : "bg-[#cfd8d1]"}`} />
      <span>{label}</span>
    </Link>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
