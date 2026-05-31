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

      <p className="mt-7 text-center text-[15px] text-[#4b5563]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-extrabold text-[#16a34a]">
          Create account
        </Link>
      </p>
    </RegisterShell>
  );
}
