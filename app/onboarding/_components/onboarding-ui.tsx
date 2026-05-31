import type { ReactNode, SVGProps } from "react";
import Link from "next/link";

type ShellProps = {
  step: 1 | 2 | 3;
  children: ReactNode;
  accentBlob?: boolean;
};

type ButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

type Service = {
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

export const services: Service[] = [
  { label: "Chef", Icon: ChefIcon },
  { label: "Tutor", Icon: BookIcon },
  { label: "Plumber", Icon: WrenchIcon },
  { label: "Electrician", Icon: BoltIcon },
  { label: "Driver", Icon: CarIcon },
  { label: "Maid", Icon: BroomIcon },
];

export function OnboardingShell({
  step,
  children,
  accentBlob = true,
}: ShellProps) {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(190,242,198,0.4),_transparent_36%),linear-gradient(180deg,#fbfffb_0%,#eef8ef_100%)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fcf8_100%)] px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <section className="relative flex min-h-[100dvh] flex-1 flex-col overflow-hidden">
          {accentBlob ? (
            <>
              <div className="pointer-events-none absolute right-[-10%] top-[-4%] h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(220,252,231,0.95),_rgba(220,252,231,0.4)_58%,_transparent_72%)]" />
              <div className="pointer-events-none absolute inset-x-[-18%] bottom-[-10%] h-[26%] rounded-full bg-[radial-gradient(circle,_rgba(22,163,74,0.06),_transparent_72%)]" />
            </>
          ) : null}

          <div className="relative z-10 flex h-full flex-1 flex-col py-5">
            <Header step={step} />
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Header({ step }: { step: 1 | 2 | 3 }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <Link
          href="/onboarding"
          className="text-[20px] font-extrabold tracking-[-0.05em] text-[#16a34a]"
        >
          DELLA
        </Link>
        <p className="mt-1 text-[13px] leading-5 text-[#3f3f46]">
          Home and lifestyle marketplace
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        {[1, 2, 3].map((item) => (
          <span
            key={item}
            className={`h-2.5 w-2.5 rounded-full ${
              step === item ? "bg-[#16a34a]" : "bg-[#d8ddd8]"
            }`}
          />
        ))}
      </div>
    </header>
  );
}

export function ScreenTitle({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <h1 className="text-balance text-[clamp(2rem,6vw,2.72rem)] font-extrabold leading-[1.04] tracking-[-0.075em] text-[#101827]">
        {title}
      </h1>
      <p className="mt-4 max-w-[19.5rem] text-[15px] leading-8 text-[#4b5563]">
        {subtitle}
      </p>
    </div>
  );
}

export function HeroFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[30px] border border-[#e1eee3] bg-white p-2 shadow-[0_18px_32px_rgba(15,23,42,0.07)]">
      <div className="overflow-hidden rounded-[26px] bg-[#f5fbf6]">{children}</div>
    </div>
  );
}

export function ServiceChips() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {services.map(({ label, Icon }) => (
        <div
          key={label}
          className="flex items-center justify-center gap-2 rounded-[18px] border border-[#e0eee3] bg-[linear-gradient(180deg,#f8fff9_0%,#eef8ef_100%)] px-2 py-4 text-[13px] font-semibold text-[#111827] shadow-[0_8px_16px_rgba(15,23,42,0.035)]"
        >
          <span className="text-[#16a34a]">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function FeatureCards() {
  const items = [
    {
      title: "Trusted providers",
      body: "Verified, rated, and reviewed professionals you can count on for every job.",
      Icon: ShieldCheckIcon,
    },
    {
      title: "Fast marketplace flow",
      body: "Search, compare, chat, and confirm jobs with fewer steps and better clarity.",
      Icon: BoltIcon,
    },
    {
      title: "One app, many services",
      body: "From urgent repairs to daily care, DELLA keeps everything you need in one place.",
      Icon: SparklesIcon,
    },
  ];

  return (
    <div className="space-y-3">
      {items.map(({ title, body, Icon }) => (
        <div
          key={title}
          className="flex items-start gap-3 rounded-[24px] border border-[#e5efe7] bg-white p-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f2fcf4] text-[#16a34a] shadow-[inset_0_-6px_12px_rgba(22,163,74,0.08)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-extrabold text-[#111827]">{title}</h3>
            <p className="mt-1 text-[13px] leading-6 text-[#4b5563]">{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PrimaryButton({ href, children, className = "" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full bg-[linear-gradient(180deg,#12a63f_0%,#07862f_100%)] px-7 text-[16px] font-extrabold text-white shadow-[0_16px_30px_rgba(22,163,74,0.26)] ${className}`}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  className = "",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full border border-[#cfd8d1] bg-white px-7 text-[16px] font-bold text-[#111827] shadow-[0_8px_16px_rgba(15,23,42,0.035)] ${className}`}
    >
      {children}
    </Link>
  );
}

export function RoundArrowButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Next"
      className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#12a63f_0%,#07862f_100%)] text-white shadow-[0_16px_30px_rgba(22,163,74,0.26)]"
    >
      <ArrowRightIcon className="h-5 w-5" />
    </Link>
  );
}

export function BackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function UserPlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 20a7 7 0 0 1 14 0" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  );
}

export function AuthPlaceholder({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,_rgba(190,242,198,0.5),_transparent_36%),linear-gradient(180deg,#fbfffb_0%,#effaf0_100%)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-3 py-3 sm:py-4">
        <section className="safe-top safe-bottom relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[34px] border border-[#dcecdf] bg-[linear-gradient(180deg,#fcfffc_0%,#f4fcf5_100%)] px-8 text-center shadow-[0_24px_60px_rgba(15,139,61,0.12)]">
          <div className="pointer-events-none absolute inset-x-[-18%] bottom-[-12%] h-[36%] rounded-full bg-[radial-gradient(circle,_rgba(22,163,74,0.14),_transparent_68%)]" />
          <div className="relative z-10">
            <p className="text-[18px] font-extrabold tracking-[-0.04em] text-[#16a34a]">
              DELLA
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.06em] text-[#0b1220]">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-[18rem] text-[15px] leading-7 text-[#334155]">
              {subtitle}
            </p>
            <PrimaryButton href={href} className="mt-8 w-full">
              Back to onboarding
            </PrimaryButton>
          </div>
        </section>
      </div>
    </main>
  );
}

function ChefIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M7 10a4 4 0 1 1 10 0" />
      <path d="M5 10h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M9 15v3M15 15v3" />
    </svg>
  );
}

function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14.5A1.5 1.5 0 0 0 18.5 17H6a2 2 0 0 1-2-2z" />
      <path d="M8 8h7M8 12h7" />
    </svg>
  );
}

function WrenchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 7.5a4.5 4.5 0 0 1-6.9 3.8l-7.6 7.6a2 2 0 1 1-2.8-2.8l7.6-7.6A4.5 4.5 0 0 1 16.5 3l-2.2 2.2 2.5 2.5z" />
    </svg>
  );
}

function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  );
}

function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 16V9l2-4h10l2 4v7" />
      <path d="M3 13h18" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  );
}

function BroomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M13 4 8 9" />
      <path d="M8 9 4 18h10L10 9" />
      <path d="M13 4 20 11" />
    </svg>
  );
}

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
      <path d="m5 18 .8 1.7L7.5 21l-1.7.8L5 23l-.8-1.2L2.5 21l1.7-.3z" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
