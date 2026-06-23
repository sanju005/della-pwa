"use client";

import Link from "next/link";

import {
  RegisterHeader,
  RegisterShell,
  RegisterTitle,
} from "../../../register/_components/register-ui";

export default function SignupUserWelcomePage() {
  return (
    <RegisterShell>
      <RegisterHeader showBack={false} />
      <RegisterTitle
        title="Account created"
        subtitle="You can use all customer features right away. Verification can be done later."
      />

      <div className="mt-8 space-y-4">
        <ChoiceCard
          href="/profile"
          title="View Profile"
          description="Check your account, saved details, addresses, and bookings."
          icon={<UserIcon className="h-6 w-6" />}
          primary
        />
        <ChoiceCard
          href="/profile?verify=1"
          title="Verify Account"
          description="Open your profile and continue verification whenever you are ready."
          icon={<ShieldIcon className="h-6 w-6" />}
        />
        <ChoiceCard
          href="/home"
          title="Go to Home"
          description="Start browsing real providers and create bookings now."
          icon={<HomeIcon className="h-6 w-6" />}
        />
      </div>
    </RegisterShell>
  );
}

function ChoiceCard({
  href,
  title,
  description,
  icon,
  primary = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-4 rounded-[22px] border p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] ${
        primary
          ? "border-[#8E5EB5] bg-[#f8f3fc]"
          : "border-[#e7ece8] bg-white"
      }`}
    >
      <span
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          primary ? "bg-[#8E5EB5] text-white" : "bg-[#f5f1fa] text-[#8E5EB5]"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] font-extrabold text-[#111827]">
          {title}
        </span>
        <span className="mt-1 block text-[13px] leading-5 text-[#6b7280]">
          {description}
        </span>
      </span>
    </Link>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.7-3 4.4-4.5 8-4.5s6.3 1.5 8 4.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8L15 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m4 11 8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10.5V20h12v-9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
