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
  bookingMode?: "hourly" | "daily";
  dateLabel?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  timeLabel?: string;
  durationHours?: number;
  notes?: string;
  hourlyRate?: number;
  dailyRate?: number;
  totalAmount?: number;
};

type CompleteBookingBody = {
  providerId: string;
  providerName: string;
  serviceKey: string;
  serviceLabel: string;
  location: string;
  bookingMode: "hourly" | "daily";
  dateLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  timeLabel: string;
  durationHours: number;
  notes: string;
  hourlyRate: number;
  dailyRate: number;
  totalAmount: number;
};

function isValidBody(value: BookingBody): value is CompleteBookingBody {
  return (
    typeof value.providerId === "string" &&
    typeof value.providerName === "string" &&
    typeof value.serviceKey === "string" &&
    typeof value.serviceLabel === "string" &&
    typeof value.location === "string" &&
    (value.bookingMode === "hourly" || value.bookingMode === "daily") &&
    typeof value.dateLabel === "string" &&
    typeof value.startTimeLabel === "string" &&
    typeof value.endTimeLabel === "string" &&
    typeof value.timeLabel === "string" &&
    typeof value.durationHours === "number" &&
    typeof value.notes === "string" &&
    typeof value.hourlyRate === "number" &&
    typeof value.dailyRate === "number" &&
    typeof value.totalAmount === "number"
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
    bookingMode: payload.bookingMode,
    dateLabel: payload.dateLabel,
    startTimeLabel: payload.startTimeLabel,
    endTimeLabel: payload.endTimeLabel,
    timeLabel: payload.timeLabel,
    durationHours: payload.durationHours,
    notes: payload.notes,
    status: "pending",
    hourlyRate: payload.hourlyRate,
    dailyRate: payload.dailyRate,
    totalAmount: payload.totalAmount,
  });

  return NextResponse.json({ booking }, { status: 201 });
}
