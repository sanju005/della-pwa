import Link from "next/link";

export default async function SignupCheckEmailPage(props: {
  searchParams: Promise<{ email?: string }>;
}) {
  const searchParams = await props.searchParams;
  const email = searchParams.email;

  return (
    <main className="min-h-[100dvh] bg-[#f6fff8]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-center px-5 py-8">
        <div className="rounded-[28px] bg-white px-6 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eefbef] text-[#16a34a]">
            <MailIcon className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-center text-[28px] font-extrabold tracking-[-0.04em] text-[#111827]">
            Check your email
          </h1>
          <p className="mx-auto mt-3 max-w-[18rem] text-center text-[15px] leading-7 text-[#4b5563]">
            We sent a verification link to{" "}
            <span className="font-bold text-[#111827]">
              {email || "your email address"}
            </span>
            . Verify your email first, then log in to DELLA.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href="/login"
              className="inline-flex h-13 w-full items-center justify-center rounded-[14px] bg-[#16a34a] px-5 text-[15px] font-extrabold text-white shadow-[0_16px_30px_rgba(22,163,74,0.22)]"
            >
              Go to Login
            </Link>
            <Link
              href="/signup/user"
              className="inline-flex h-13 w-full items-center justify-center rounded-[14px] border border-[#d9e2dd] bg-white px-5 text-[15px] font-extrabold text-[#111827]"
            >
              Back to Signup
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
