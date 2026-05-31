import Link from "next/link";

import {
  Field,
  Icons,
  PrimaryLinkButton,
  RegisterHeader,
  RegisterShell,
  RegisterTitle,
} from "../register/_components/register-ui";

export default function LoginPage() {
  return (
    <RegisterShell>
      <RegisterHeader showBack backHref="/signup" />
      <RegisterTitle title="Welcome back!" subtitle="Sign in to continue" />

      <div className="mt-10 space-y-4">
        <Field
          label="Email or Phone"
          placeholder="Enter email or phone number"
          icon={<Icons.User className="h-5 w-5" />}
        />
        <Field
          label="Password"
          placeholder="Enter password"
          icon={<Icons.Lock className="h-5 w-5" />}
          rightIcon={<Icons.EyeOff className="h-5 w-5" />}
          type="password"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <Link href="/login" className="text-[14px] font-bold text-[#16a34a]">
          Forgot password?
        </Link>
      </div>

      <div className="mt-7">
        <PrimaryLinkButton href="/home">Log in</PrimaryLinkButton>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#e5ece6]" />
        <p className="text-[14px] text-[#6b7280]">or continue with</p>
        <div className="h-px flex-1 bg-[#e5ece6]" />
      </div>

      <div className="mt-5 space-y-3">
        <SocialButton href="/home" label="Continue with Google" brand="G" />
        <SocialButton href="/home" label="Continue with Facebook" brand="f" />
        <SocialButton href="/home" label="Continue with Apple" brand="A" />
      </div>

      <p className="mt-7 text-center text-[15px] text-[#4b5563]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-extrabold text-[#16a34a]">
          Create account
        </Link>
      </p>
    </RegisterShell>
  );
}

function SocialButton({
  href,
  label,
  brand,
}: {
  href: string;
  label: string;
  brand: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-13 items-center justify-center gap-4 rounded-[16px] border border-[#d9e2dd] bg-white px-5 text-[15px] font-bold text-[#111827] shadow-[0_8px_20px_rgba(15,23,42,0.03)]"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f7f4] text-[18px] font-extrabold text-[#111827]">
        {brand}
      </span>
      <span>{label}</span>
    </Link>
  );
}
