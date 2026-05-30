import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[linear-gradient(180deg,#fbfffc_0%,#f3fbf4_100%)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-3 py-3 sm:justify-center">
        <div className="safe-top safe-bottom relative">
          <Image
            src="/auth/signup-choice-ref.png"
            alt="DELLA create account selection screen"
            width={554}
            height={1347}
            unoptimized
            priority
            className="h-auto w-full"
          />

          <Link
            href="/onboarding/ready"
            aria-label="Back"
            className="absolute left-[3.2%] top-[2.8%] h-[5.8%] w-[9%] rounded-full"
          />
          <Link
            href="/signup/user"
            aria-label="I'm a User"
            className="absolute left-[5.4%] top-[29.4%] h-[22.2%] w-[83.8%] rounded-[28px]"
          />
          <Link
            href="/provider/register"
            aria-label="I'm a Service Provider"
            className="absolute left-[5.4%] top-[54.4%] h-[22.2%] w-[83.8%] rounded-[28px]"
          />
          <Link
            href="/login"
            aria-label="Log in"
            className="absolute left-[56%] top-[94.6%] h-[2.8%] w-[14%] rounded-lg"
          />
        </div>
      </div>
    </main>
  );
}
