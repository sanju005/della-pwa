import Link from "next/link";
import { notFound } from "next/navigation";

import { getProviderRegistration } from "@/lib/provider-registration-storage";

export default async function ProviderDashboardDetailPage(
  props: PageProps<"/provider/dashboard/[id]">
) {
  const { id } = await props.params;
  const record = await getProviderRegistration(id);

  if (!record) {
    notFound();
  }

  return (
    <main className="min-h-[100dvh] bg-[#f6fff8] px-4 py-6">
      <div className="mx-auto max-w-[430px] rounded-[28px] border border-[#dbe8df] bg-white p-5 shadow-[0_20px_60px_rgba(22,163,74,0.08)]">
        <Link
          href="/provider/dashboard"
          className="inline-flex text-[13px] font-bold text-[#16a34a]"
        >
          Back to dashboard
        </Link>

        <h1 className="mt-4 text-[28px] font-extrabold tracking-[-0.05em] text-[#16a34a]">
          {record.data.basicProfile.marketingName}
        </h1>
        <p className="mt-1 text-[15px] text-[#111827]">
          {record.data.basicProfile.fullName}
        </p>
        <p className="mt-2 text-[13px] text-[#6b7280]">
          Status: {record.status.replaceAll("_", " ")}
        </p>

        <div className="mt-6 space-y-4">
          <DashboardCard title="Contact">
            <p>{record.data.account.email}</p>
            <p>
              {record.data.account.phoneCountryCode} {record.data.account.phoneNumber}
            </p>
          </DashboardCard>

          <DashboardCard title="Services">
            {record.data.selectedServices.map((service) => {
              const details = record.data.serviceDetails[service];
              return (
                <div key={service} className="border-t border-[#edf1ef] py-3 first:border-t-0 first:pt-0 last:pb-0">
                  <p className="font-bold text-[#111827]">{service}</p>
                  <p className="text-[13px] text-[#4b5563]">
                    {details.yearsExperience} - RM{details.hourlyRate}/hr - RM{details.dailyRate}/day
                  </p>
                  <p className="mt-1 text-[13px] text-[#6b7280]">
                    {details.specialties.join(", ")}
                  </p>
                </div>
              );
            })}
          </DashboardCard>

          <DashboardCard title="Verification">
            <p>Phone verified: {record.phoneVerified ? "Yes" : "No"}</p>
            <p>Email verified: {record.emailVerified ? "Yes" : "No"}</p>
            <p>Identity verified: {record.identityVerified ? "Yes" : "No"}</p>
          </DashboardCard>

          <DashboardCard title="Availability">
            <p>{record.data.availability.days.join(", ")}</p>
            <p>
              {record.data.availability.timePreset === "Custom Time"
                ? `${record.data.availability.startTime} - ${record.data.availability.endTime}`
                : record.data.availability.timePreset}
            </p>
          </DashboardCard>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-[#e4ece7] bg-[#fbfffc] p-4 text-[14px] leading-6 text-[#374151]">
      <h2 className="mb-2 text-[14px] font-extrabold text-[#111827]">{title}</h2>
      {children}
    </section>
  );
}
