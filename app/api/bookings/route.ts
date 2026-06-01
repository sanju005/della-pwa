import { NextResponse } from "next/server";

import {
  createCustomerBooking,
  listCustomerBookings,
} from "@/lib/customer-booking-storage";

type BookingBody = {
  providerId?: string;
  providerName?: string;
  serviceKey?: string;
  serviceLabel?: string;
  location?: string;
  dateLabel?: string;
  timeLabel?: string;
  hourlyRate?: number;
  dailyRate?: number;
};

type CompleteBookingBody = {
  providerId: string;
  providerName: string;
  serviceKey: string;
  serviceLabel: string;
  location: string;
  dateLabel: string;
  timeLabel: string;
  hourlyRate: number;
  dailyRate: number;
};

function isValidBody(value: BookingBody): value is CompleteBookingBody {
  return (
    typeof value.providerId === "string" &&
    typeof value.providerName === "string" &&
    typeof value.serviceKey === "string" &&
    typeof value.serviceLabel === "string" &&
    typeof value.location === "string" &&
    typeof value.dateLabel === "string" &&
    typeof value.timeLabel === "string" &&
    typeof value.hourlyRate === "number" &&
    typeof value.dailyRate === "number"
  );
}

export async function GET() {
  const bookings = await listCustomerBookings();
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as BookingBody;

  if (!isValidBody(payload)) {
    return NextResponse.json(
      { error: "Booking request is missing required fields." },
      { status: 400 }
    );
  }

  const booking = await createCustomerBooking({
    providerId: payload.providerId,
    providerName: payload.providerName,
    serviceKey: payload.serviceKey,
    serviceLabel: payload.serviceLabel,
    location: payload.location,
    dateLabel: payload.dateLabel,
    timeLabel: payload.timeLabel,
    status: "pending",
    hourlyRate: payload.hourlyRate,
    dailyRate: payload.dailyRate,
  });

  return NextResponse.json({ booking }, { status: 201 });
}
