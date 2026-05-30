import Image from "next/image";
import Link from "next/link";

export default function SignupUserPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[linear-gradient(180deg,#fbfffc_0%,#f3fbf4_100%)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-3 py-3 sm:justify-center">
        <div className="safe-top safe-bottom relative">
          <Image
            src="/auth/signup-user-ref.png"
            alt="DELLA create account as user screen"
            width={554}
            height={1347}
            unoptimized
            priority
            className="h-auto w-full"
          />

          <Link
            href="/signup"
            aria-label="Back"
            className="absolute left-[3.2%] top-[2.8%] h-[5.8%] w-[9%] rounded-full"
          />
          <Link
            href="/home"
            aria-label="Create account"
            className="absolute left-[5.8%] top-[68.3%] h-[6.3%] w-[88%] rounded-[18px]"
          />
          <Link
            href="/home"
            aria-label="Continue with Google"
            className="absolute left-[5.8%] top-[80.2%] h-[4.2%] w-[88%] rounded-[18px]"
          />
          <Link
            href="/home"
            aria-label="Continue with Facebook"
            className="absolute left-[5.8%] top-[86.2%] h-[4.2%] w-[88%] rounded-[18px]"
          />
          <Link
            href="/home"
            aria-label="Continue with Apple"
            className="absolute left-[5.8%] top-[92.1%] h-[4.2%] w-[88%] rounded-[18px]"
          />
          <Link
            href="/login"
            aria-label="Log in"
            className="absolute left-[55.5%] top-[96.6%] h-[2.6%] w-[13%] rounded-lg"
          />
        </div>
      </div>
    </main>
  );
}
