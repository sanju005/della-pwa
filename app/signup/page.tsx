import Image from "next/image";
import Link from "next/link";

import { RegisterHeader, RegisterShell, RegisterTitle } from "../register/_components/register-ui";

export default function SignupPage() {
  return (
    <RegisterShell>
      <RegisterHeader showBack backHref="/" />
      <RegisterTitle
        title="Create your account"
        subtitle="Join as a User or Service Provider and get started with DELLA."
      />

      <div className="mt-8 space-y-5">
        <ChoiceCard
          href="/signup/user"
          title="I’m a User"
          description="Book trusted services for your home and lifestyle needs."
          features={["Book Services", "Secure Payments", "Track Bookings", "24/7 Support"]}
          accent="U"
        />
        <ChoiceCard
          href="/provider/register"
          title="I’m a Service Provider"
          description="Offer your services, grow your business, and reach more customers."
          features={["Manage Jobs", "Grow Business", "Secure Earnings", "Flexible Schedule"]}
          accent="P"
        />
      </div>

      <div className="mt-8 rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(190,242,198,0.55),_transparent_48%),linear-gradient(180deg,#fbfffc_0%,#f2fbf4_100%)] px-6 py-8 text-center">
        <Image
          src="/brand/main-logo.png"
          alt="DELLA"
          width={300}
          height={96}
          priority
          className="mx-auto h-auto w-[180px]"
        />
        <p className="mt-4 text-[14px] leading-7 text-[#4b5563]">
          DELLA connects people with trusted home and lifestyle services across one simple app.
        </p>
      </div>

      <p className="mt-7 text-center text-[15px] text-[#4b5563]">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-[#16a34a]">
          Log in
        </Link>
      </p>
    </RegisterShell>
  );
}

function ChoiceCard({
  href,
  title,
  description,
  features,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  features: string[];
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-[24px] border border-[#dbe8df] bg-white p-5 shadow-[0_16px_30px_rgba(15,23,42,0.05)]"
    >
      <div className="flex items-start gap-4">
        <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#eefbef_0%,#dff6e2_100%)] text-[28px] font-extrabold text-[#16a34a]">
          {accent}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-extrabold tracking-[-0.04em] text-[#111827]">
                {title}
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-[#4b5563]">
                {description}
              </p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eefbef] text-[22px] font-bold text-[#16a34a]">
              →
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {features.map((feature) => (
          <div
            key={feature}
            className="rounded-[14px] bg-[#f7fbf7] px-3 py-2 text-[12px] font-semibold text-[#3f4b47]"
          >
            {feature}
          </div>
        ))}
      </div>
    </Link>
  );
}
