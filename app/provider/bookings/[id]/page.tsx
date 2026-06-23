import { BookingsScreen } from "../../_components/provider-screens";

export default async function ProviderBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BookingsScreen initialBookingId={id} />;
}
