import { notFound } from "next/navigation";

import { BookingFormScreen } from "./screen";
import { getProviderDetail } from "@/lib/provider-detail";

export const dynamic = "force-dynamic";

export default async function ProviderBookingPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ service?: string; date?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const detail = await getProviderDetail(params.id, searchParams.service ?? null);

  if (!detail) {
    notFound();
  }

  return (
    <BookingFormScreen
      detail={detail}
      serviceQuery={searchParams.service ?? null}
      initialDateQuery={searchParams.date ?? null}
    />
  );
}
