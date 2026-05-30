import Link from "next/link";

import { listProviderRegistrations } from "@/lib/provider-registration-storage";

export default async function ProviderDashboardPage() {
  const registrations = await listProviderRegistrations();
  const latest = registrations[0];

  return (
    <main className="min-h-[100dvh] bg-[#f6fff8] px-4 py-6">
      <div className="mx-auto max-w-[430px] rounded-[28px] border border-[#dbe8df] bg-white p-5 shadow-[0_20px_60px_rgba(22,163,74,0.08)]">
        <h1 className="text-[28px] font-extrabold tracking-[-0.05em] text-[#16a34a]">
          Provider Dashboard
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[#4b5563]">
          Submitted provider registrations are stored locally on this app now.
        </p>

        {latest ? (
          <div className="mt-6 rounded-[18px] border border-[#e4ece7] bg-[#fbfffc] p-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#16a34a]">
              Latest Submission
            </p>
            <h2 className="mt-2 text-[20px] font-extrabold text-[#111827]">
              {latest.data.basicProfile.marketingName}
            </h2>
            <p className="mt-1 text-[14px] text-[#4b5563]">
              {latest.data.selectedServices.join(", ")}
            </p>
            <p className="mt-2 text-[13px] text-[#6b7280]">
              Status: {latest.status.replaceAll("_", " ")}
            </p>
            <Link
              href={`/provider/dashboard/${latest.id}`}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-[12px] bg-[#16a34a] px-4 text-[14px] font-extrabold text-white"
            >
              Open Latest Registration
            </Link>
          </div>
        ) : (
          <p className="mt-6 text-[14px] text-[#6b7280]">
            No provider registrations have been submitted yet.
          </p>
        )}

        <Link
          href="/provider/register"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-[12px] border border-[#16a34a] px-4 text-[14px] font-extrabold text-[#16a34a]"
        >
          Start New Registration
        </Link>
      </div>
    </main>
  );
}
