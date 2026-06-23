import { getBookings } from "@/lib/profile-service";
import type { BookingStatus } from "@/lib/profile-types";

import { BookingsScreen } from "../_components/profile-ui";

export default async function ProfileBookingsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const bookings = await getBookings();
  const requestedTab = searchParams.tab;
  const initialTab: BookingStatus =
    requestedTab === "pending" ||
    requestedTab === "ongoing" ||
    requestedTab === "completed" ||
    requestedTab === "cancelled"
      ? requestedTab
      : "pending";

  return <BookingsScreen bookings={bookings} initialTab={initialTab} />;
}
