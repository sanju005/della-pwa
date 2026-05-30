import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(190,242,198,0.42),_transparent_36%),linear-gradient(180deg,#fbfffb_0%,#eef8ef_100%)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-3 py-3 sm:justify-center">
        <div className="safe-top safe-bottom relative">
          <Image
            src="/auth/login-ref.png"
            alt="DELLA login screen"
            width={660}
            height={1085}
            unoptimized
            priority
            className="h-auto w-full"
          />

          <Link
            href="/signup"
            aria-label="Back"
            className="absolute left-[3%] top-[1.2%] h-[7%] w-[9%] rounded-full"
          />
          <Link
            href="/home"
            aria-label="Log in"
            className="absolute left-[5.5%] top-[58%] h-[6.6%] w-[89%] rounded-full"
          />
          <Link
            href="/home"
            aria-label="Continue with Google"
            className="absolute left-[5.5%] top-[74.3%] h-[4.9%] w-[89%] rounded-[18px]"
          />
          <Link
            href="/home"
            aria-label="Continue with Facebook"
            className="absolute left-[5.5%] top-[81%] h-[4.9%] w-[89%] rounded-[18px]"
          />
          <Link
            href="/home"
            aria-label="Continue with Apple"
            className="absolute left-[5.5%] top-[87.8%] h-[4.9%] w-[89%] rounded-[18px]"
          />
          <Link
            href="/signup"
            aria-label="Create account"
            className="absolute left-[49%] top-[95.2%] h-[3.2%] w-[27%] rounded-lg"
          />
        </div>
      </div>
    </main>
  );
}
