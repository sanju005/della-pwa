import { getBookings } from "@/lib/profile-service";

import { BookingsScreen } from "../_components/profile-ui";

export default async function ProfileBookingsPage() {
  const bookings = await getBookings();
  return <BookingsScreen bookings={bookings} />;
}
