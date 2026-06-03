import { notFound } from "next/navigation";

import { getBookingById } from "@/lib/profile-service";

import { BookingDetailScreen } from "../../_components/profile-ui";

export default async function ProfileBookingDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const booking = await getBookingById(params.id);

  if (!booking) {
    notFound();
  }

  return <BookingDetailScreen booking={booking} />;
}
