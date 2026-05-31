import {
  PrimaryLinkButton,
  RegisterShell,
  SuccessCard,
  SuccessHero,
} from "../_components/register-ui";

export default function RegisterSuccessPage() {
  return (
    <RegisterShell>
      <div className="flex min-h-full flex-col">
        <div className="flex-1 pt-10">
          <SuccessHero />

          <div className="text-center">
            <h1 className="text-[23px] font-extrabold leading-[1.2] tracking-[-0.04em] text-[#111827]">
              Account Created!
            </h1>
            <p className="mt-2 text-[16px] font-extrabold text-[#16a34a]">
              Welcome to DELLA
            </p>
            <p className="mx-auto mt-3 max-w-[17rem] text-[15px] leading-7 text-[#4b5563]">
              You can now search and book trusted services near you.
            </p>
          </div>

          <div className="mt-7">
            <SuccessCard />
          </div>
        </div>

        <div className="safe-bottom-lg pt-7">
          <PrimaryLinkButton href="/home">Go to Home</PrimaryLinkButton>
        </div>
      </div>
    </RegisterShell>
  );
}
