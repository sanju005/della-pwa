"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserPlus,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { requestNotificationPermission, saveFCMToken } from "@/lib/notifications";

function isProviderRole(role: string | null | undefined) {
  return role === "provider" || role === "service_provider";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, startTransition] = useTransition();

  function getNextPath() {
    if (typeof window === "undefined") {
      return "/home";
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("next") ?? "/home";
  }

  useEffect(() => {
    let active = true;

    async function continueSession() {
      const supabase = getSupabaseClient();

      if (!supabase) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active || !session) {
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (isProviderRole(profile?.role)) {
        router.replace("/provider/dashboard");
        return;
      }

      router.replace(getNextPath());
    }

    void continueSession();

    return () => {
      active = false;
    };
  }, [router]);

  function handleSubmit() {
    startTransition(async () => {
      setError("");
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError("Supabase is not configured yet.");
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError(signInError?.message || "Unable to sign in.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message || "Unable to load your account.");
        return;
      }

      try {
        const fcmToken = await requestNotificationPermission();

        if (fcmToken) {
          const saveResult = await saveFCMToken(fcmToken);

          if (!saveResult.success) {
            console.error("[FCM] Failed to persist token:", saveResult.error);
          }
        }
      } catch (notificationError) {
        console.error("[FCM] Notification setup failed after login:", notificationError);
      }

      if (isProviderRole(profile?.role)) {
        router.replace("/provider/dashboard");
        return;
      }

      router.replace(getNextPath());
    });
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[linear-gradient(180deg,#5e3c84_0%,#8e5eb5_60%,#a679cf_100%)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col">
        <section className="relative h-[65dvh] min-h-[560px] overflow-hidden">
          <Image
            src="/swiper/hero-collage.png"
            alt="SWIPER premium service collage"
            fill
            priority
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover object-top"
          />
          <div className="pointer-events-none absolute left-1/2 top-[54%] h-[53%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-[46%] bg-[radial-gradient(circle_at_50%_45%,rgba(195,163,230,0.95)_0%,rgba(142,94,181,0.92)_46%,rgba(110,72,160,0.86)_100%)]" />
          <div className="pointer-events-none absolute left-1/2 top-[54%] h-[67%] w-[67%] -translate-x-1/2 -translate-y-1/2 rounded-[48%] border border-white/10 bg-[radial-gradient(circle_at_50%_40%,rgba(178,145,219,0.16)_0%,rgba(178,145,219,0.04)_58%,rgba(178,145,219,0)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_52%,rgba(178,145,219,0.55)_0%,rgba(142,94,181,0.2)_32%,rgba(94,60,132,0)_62%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(166,121,207,0)_0%,rgba(166,121,207,0.78)_100%)]" />
        </section>

        <section className="relative -mt-10 flex flex-1 flex-col rounded-t-[40px] bg-white px-6 pb-6 pt-6 shadow-[0_-14px_40px_rgba(44,20,77,0.16)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[16px] font-medium text-[#8e5eb5]">Welcome to</p>
              <Image
                src="/swiper/logo-purple.png"
                alt="SWIPER"
                width={210}
                height={68}
                priority
                className="mt-2 h-auto w-[170px]"
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#dbc8ed]" />
              <span className="h-2.5 w-8 rounded-full bg-[#8e5eb5]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#dbc8ed]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#dbc8ed]" />
            </div>
          </div>

          <p className="mt-4 max-w-[19rem] text-[16px] leading-7 text-[#45556f]">
            Log in to continue, or sign up to create a new SWIPER account.
          </p>

          <div className="mt-6 space-y-4">
            <FieldLabel label="Email" />
            <InputShell icon={<Mail className="h-5 w-5" />}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-full flex-1 border-0 bg-transparent text-[16px] text-[#111827] outline-none placeholder:text-[#93a1b5]"
              />
            </InputShell>

            <FieldLabel label="Password" />
            <InputShell icon={<Lock className="h-5 w-5" />}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-full flex-1 border-0 bg-transparent text-[16px] text-[#111827] outline-none placeholder:text-[#93a1b5]"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
                className="ml-3 text-[#8e5eb5]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </InputShell>
          </div>

          <div className="mt-3 flex justify-end">
            <Link href="/forgot-password" className="text-[14px] font-bold text-[#8e5eb5]">
              Forgot Password
            </Link>
          </div>

          {error ? (
            <p className="mt-4 rounded-[18px] border border-[#f1d1d7] bg-[#fff5f7] px-4 py-3 text-[13px] font-semibold text-[#c2415b]">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-5 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#8e5eb5] px-6 text-[18px] font-extrabold text-white shadow-[0_16px_30px_rgba(142,94,181,0.32)] transition hover:bg-[#7b4ea1] disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>

          <Link
            href="/signup"
            className="mt-3 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border border-[#b993da] bg-white px-6 text-[18px] font-extrabold text-[#8e5eb5] shadow-[0_10px_24px_rgba(90,57,128,0.06)]"
          >
            <UserPlus className="h-5 w-5" />
            Sign up
          </Link>

          <div className="mt-auto flex items-center justify-between pt-5">
            <Link
              href="/"
              className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#b993da] bg-white text-[#8e5eb5] shadow-[0_10px_24px_rgba(90,57,128,0.06)]"
              aria-label="Back"
            >
              <ArrowLeft className="h-7 w-7" />
            </Link>
            <span className="ml-4 mr-auto text-[15px] font-semibold text-[#1f2a44]">Back</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#8e5eb5] text-white shadow-[0_16px_30px_rgba(142,94,181,0.28)] transition hover:bg-[#7b4ea1] disabled:opacity-60"
              aria-label="Continue"
            >
              <ArrowRight className="h-7 w-7" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <p className="text-[14px] font-bold text-[#1f2a44]">{label}</p>;
}

function InputShell({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="flex h-14 items-center rounded-[20px] border border-[#eadff4] bg-[#fbf8fe] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <span className="mr-3 text-[#8e5eb5]">{icon}</span>
      {children}
    </div>
  );
}
