import {
  OtpRow,
  PrimaryLinkButton,
  RegisterHeader,
  RegisterShell,
  RegisterTitle,
  ResendRow,
  VerifyHero,
  VerifyPhoneCard,
} from "../_components/register-ui";

export default function RegisterVerifyPage() {
  return (
    <RegisterShell>
      <RegisterHeader showBack backHref="/register" />
      <VerifyHero />
      <RegisterTitle
        title="Verify Your Account"
        subtitle="We have sent a 6-digit OTP code to your phone number"
      />

      <div className="mt-10">
        <p className="mb-2 text-[15px] font-semibold text-[#111827]">
          Phone Number
        </p>
        <VerifyPhoneCard />
      </div>

      <div className="mt-10">
        <p className="text-[15px] font-semibold text-[#111827]">
          Enter OTP Code
        </p>
        <OtpRow />
        <ResendRow />
      </div>

      <div className="safe-bottom-lg mt-auto pt-16">
        <PrimaryLinkButton href="/register/success">
          Verify & Continue
        </PrimaryLinkButton>
      </div>
    </RegisterShell>
  );
}
