import Image from "next/image";
import Link from "next/link";
import heroLogo from "../../../Logo/Verticle Logo.png";
import panelLogo from "../../../Logo/Horozondal Logo.png";
import { PwaInstallPrompt } from "@/app/_components/pwa-install";
import {
  BackIcon,
  PrimaryButton,
  RoundArrowButton,
  SecondaryButton,
  UserIcon,
  UserPlusIcon,
} from "../_components/onboarding-ui";

export default function ReadyPage() {
  return (
    <>
      <main className="min-h-[100dvh] overflow-x-hidden bg-[linear-gradient(180deg,#5e3c84_0%,#8e5eb5_60%,#a679cf_100%)]">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-0 pt-[env(safe-area-inset-top)]">
          <section className="relative h-[65dvh] min-h-[620px] overflow-hidden px-5 pt-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_52%_54%,rgba(195,163,230,0.28),transparent_26%)]" />

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-[22px] bg-white/12 p-2.5 ring-1 ring-white/18 backdrop-blur-sm">
                  <Image src={heroLogo} alt="SWIPER" priority className="h-auto w-[50px]" />
                </div>
                <div className="pt-1">
                  <p className="text-[13px] font-semibold tracking-[0.18em] text-white/72">
                    SWIPER
                  </p>
                  <p className="mt-1 text-[14px] font-medium text-white/88">
                    Home and lifestyle marketplace
                  </p>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/36" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/36" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/92" />
              </div>
            </div>

            <div className="relative z-10 mt-6 max-w-[15.5rem]">
              <h1 className="text-[2.8rem] font-extrabold leading-[0.96] tracking-[-0.06em] text-white">
                Everything you need,
              </h1>
              <h2 className="mt-1 text-[2.8rem] font-extrabold leading-[0.96] tracking-[-0.06em] text-[#d8b7ff]">
                just a tap away
              </h2>
              <p className="mt-5 text-[15px] leading-8 text-white/88">
                Book trusted services for your home and lifestyle. Anytime, anywhere.
              </p>
            </div>

            <div className="relative z-10 mt-5 overflow-hidden rounded-[34px]">
              <Image
                src="/swiper/hero-collage.png"
                alt="SWIPER premium service collage"
                width={941}
                height={1135}
                priority
                className="h-[430px] w-full object-cover object-top"
              />
            </div>
          </section>

          <section className="relative z-20 -mt-10 flex flex-1 flex-col rounded-t-[40px] bg-[linear-gradient(180deg,#ffffff_0%,#fbf8fe_100%)] px-6 pb-6 pt-6 shadow-[0_-16px_40px_rgba(44,20,77,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[16px] font-medium text-[#8e5eb5]">Welcome to</p>
                <Image
                  src={panelLogo}
                  alt="SWIPER"
                  priority
                  className="mt-2 h-auto w-[208px]"
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#dbc8ed]" />
                <span className="h-2.5 w-8 rounded-full bg-[#8e5eb5]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#dbc8ed]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#dbc8ed]" />
              </div>
            </div>

            <p className="mt-5 max-w-[19rem] text-[16px] leading-8 text-[#374151]">
              Log in to continue, or sign up to create a new SWIPER account.
            </p>

            <div className="mt-8 space-y-4">
              <PrimaryButton href="/login" className="min-h-[56px] w-full justify-center">
                <UserIcon className="h-5 w-5" />
                Log in
              </PrimaryButton>
              <SecondaryButton href="/signup" className="min-h-[56px] w-full justify-center border-[#b993da] text-[#24183b]">
                <UserPlusIcon className="h-5 w-5 text-[#8e5eb5]" />
                Sign up
              </SecondaryButton>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Link
                href="/onboarding/why-della"
                className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-[18px] border border-[#b993da] bg-white text-[#8e5eb5] shadow-[0_10px_24px_rgba(90,57,128,0.06)]"
                aria-label="Back"
              >
                <BackIcon className="h-6 w-6" />
              </Link>
              <span className="ml-4 mr-auto text-[15px] font-semibold text-[#1f2a44]">Back</span>
              <RoundArrowButton href="/login" />
            </div>
          </section>
        </div>
      </main>
      <PwaInstallPrompt />
    </>
  );
}
