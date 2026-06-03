import { notFound } from "next/navigation";

import { getBookingById } from "@/lib/profile-service";

import { BookingReviewScreen } from "../../../_components/profile-ui";

export default async function ProfileBookingReviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const booking = await getBookingById(params.id);

  if (!booking) {
    notFound();
  }

  return <BookingReviewScreen booking={booking} />;
}
