import Link from "next/link";

import {
  Field,
  PhoneField,
  PrimaryLinkButton,
  RegisterHeader,
  RegisterShell,
  RegisterTitle,
  Icons,
} from "../../register/_components/register-ui";

export default function SignupUserPage() {
  return (
    <RegisterShell>
      <RegisterHeader showBack backHref="/signup" />
      <RegisterTitle
        title="Create account as User"
        subtitle="Fill in the details below to create your DELLA account."
      />

      <div className="mt-8 space-y-4">
        <Field
          label="Full Name"
          placeholder="Enter your full name"
          icon={<Icons.User className="h-5 w-5" />}
        />
        <Field
          label="Email"
          placeholder="Enter email address"
          icon={<Icons.Mail className="h-5 w-5" />}
          type="email"
        />
        <PhoneField />
        <Field
          label="Password"
          placeholder="Create a password"
          icon={<Icons.Lock className="h-5 w-5" />}
          rightIcon={<Icons.EyeOff className="h-5 w-5" />}
          type="password"
        />
        <div className="rounded-[18px] bg-[#f7fbf7] px-4 py-3 text-[13px] leading-6 text-[#4b5563]">
          <p>At least 8 characters</p>
          <p>One uppercase letter</p>
          <p>One number</p>
          <p>One special character</p>
        </div>
        <Field
          label="Confirm Password"
          placeholder="Confirm your password"
          icon={<Icons.Lock className="h-5 w-5" />}
          rightIcon={<Icons.EyeOff className="h-5 w-5" />}
          type="password"
        />
      </div>

      <label className="mt-5 flex items-start gap-3 text-[14px] leading-6 text-[#4b5563]">
        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-[#cfd8d1]" />
        <span>
          I agree to the{" "}
          <Link href="/signup/user" className="font-bold text-[#16a34a]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/signup/user" className="font-bold text-[#16a34a]">
            Privacy Policy
          </Link>
        </span>
      </label>

      <div className="mt-6">
        <PrimaryLinkButton href="/home">Create account</PrimaryLinkButton>
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
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-[#16a34a]">
          Log in
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
