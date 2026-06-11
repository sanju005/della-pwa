import Image from "next/image";
import { PwaInstallPrompt } from "@/app/_components/pwa-install";
import {
  OnboardingShell,
  PrimaryButton,
  SecondaryButton,
  UserIcon,
  UserPlusIcon,
} from "../_components/onboarding-ui";

export default function ReadyPage() {
  return (
    <>
      <OnboardingShell step={3} accentBlob={false}>
        <div className="overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#7560ab_0%,#4f4275_100%)] shadow-[0_20px_36px_rgba(79,66,117,0.22)]">
          <Image
            src="/onboarding/intro-3.png"
            alt="Premium DELLA living room hero"
            width={1024}
            height={1536}
            unoptimized
            priority
            className="h-[296px] w-full object-cover object-top"
          />
        </div>

        <div className="-mt-11 rounded-[32px] border border-[#e0ebe2] bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
          <p className="text-[15px] text-[#645394]">
            Welcome to
          </p>
          <Image
            src="/brand/main-logo.png"
            alt="DELLA"
            width={270}
            height={86}
            priority
            className="mt-1 h-auto w-[170px]"
          />
          <p className="mt-3 max-w-[18rem] text-[15px] leading-7 text-[#4b5563]">
            Log in to continue, or sign up to create a new DELLA account.
          </p>

          <div className="mt-6 space-y-3">
            <PrimaryButton href="/login" className="w-full">
              <UserIcon className="h-5 w-5" />
              Log in
            </PrimaryButton>
            <SecondaryButton href="/signup" className="w-full">
              <UserPlusIcon className="h-5 w-5 text-[#645394]" />
              Sign up
            </SecondaryButton>
          </div>
        </div>
      </OnboardingShell>
      <PwaInstallPrompt />
    </>
  );
}
