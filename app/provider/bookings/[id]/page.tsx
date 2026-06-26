import { ProviderBookingsScreen } from "../provider-bookings-screen";

export default async function ProviderBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProviderBookingsScreen initialBookingId={id} />;
}
