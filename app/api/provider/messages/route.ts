import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/supabase-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
};

type BookingRow = {
  id: string;
  customer_id: string;
  service_label: string;
  location_text: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  customer_note: string | null;
  provider_response_note: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  booking_id: string;
  sender_role: "customer" | "provider" | "admin" | "system";
  message_text: string;
  created_at: string;
};

type NotificationRow = {
  booking_id: string | null;
  is_read: boolean;
};

function isProviderRole(role: string | null | undefined) {
  return role === "provider" || role === "service_provider";
}

function getAdminSupabaseClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceKey();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function verifyProviderRequest(request: Request) {
  const adminClient = getAdminSupabaseClient();

  if (!adminClient) {
    return {
      error: NextResponse.json({ error: "Supabase is not configured yet." }, { status: 500 }),
    };
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    return {
      error: NextResponse.json({ error: "Missing auth token." }, { status: 401 }),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  if (userError || !user) {
    return {
      error: NextResponse.json({ error: "Invalid session." }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !isProviderRole((profile as ProfileRow).role)) {
    return {
      error: NextResponse.json({ error: "This account is not a provider." }, { status: 403 }),
    };
  }

  return {
    adminClient,
    profile: profile as ProfileRow,
  };
}

function formatSchedule(date: string, startTime: string, endTime: string) {
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);

  const dateLabel = new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(start);

  const formatTime = (value: Date) =>
    new Intl.DateTimeFormat("en-MY", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(value);

  return `${dateLabel}, ${formatTime(start)} - ${formatTime(end)}`;
}

export async function GET(request: Request) {
  const verified = await verifyProviderRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const { data: bookings, error: bookingsError } = await verified.adminClient
    .from("bookings")
    .select(`
      id,
      customer_id,
      service_label,
      location_text,
      scheduled_date,
      scheduled_start_time,
      scheduled_end_time,
      customer_note,
      provider_response_note,
      created_at
    `)
    .eq("provider_id", verified.profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (bookingsError) {
    return NextResponse.json(
      { error: bookingsError.message || "Unable to load booking conversations." },
      { status: 500 },
    );
  }

  const bookingRows = (bookings ?? []) as BookingRow[];
  const bookingIds = bookingRows.map((row) => row.id);
  const customerIds = [...new Set(bookingRows.map((row) => row.customer_id))];

  const [{ data: customerProfiles }, { data: messages }, { data: notifications }] = await Promise.all([
    customerIds.length > 0
      ? verified.adminClient
          .from("profiles")
          .select("id, full_name")
          .in("id", customerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> }),
    bookingIds.length > 0
      ? verified.adminClient
          .from("booking_messages")
          .select("id, booking_id, sender_role, message_text, created_at")
          .in("booking_id", bookingIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as MessageRow[] }),
    bookingIds.length > 0
      ? verified.adminClient
          .from("notifications")
          .select("booking_id, is_read")
          .eq("user_id", verified.profile.id)
          .in("booking_id", bookingIds)
      : Promise.resolve({ data: [] as NotificationRow[] }),
  ]);

  const customerNameMap = new Map(
    ((customerProfiles ?? []) as Array<{ id: string; full_name: string | null }>).map((row) => [
      row.id,
      row.full_name?.trim() || "Customer",
    ]),
  );

  const latestMessageByBooking = new Map<string, MessageRow>();
  for (const message of (messages ?? []) as MessageRow[]) {
    if (!latestMessageByBooking.has(message.booking_id)) {
      latestMessageByBooking.set(message.booking_id, message);
    }
  }

  const unreadCountByBooking = new Map<string, number>();
  for (const notification of (notifications ?? []) as NotificationRow[]) {
    if (!notification.booking_id || notification.is_read) {
      continue;
    }

    unreadCountByBooking.set(
      notification.booking_id,
      (unreadCountByBooking.get(notification.booking_id) ?? 0) + 1,
    );
  }

  const threads = bookingRows.map((booking) => {
    const latestMessage = latestMessageByBooking.get(booking.id);
    const fallbackText =
      booking.customer_note?.trim() ||
      booking.provider_response_note?.trim() ||
      "Booking created.";

    return {
      bookingId: booking.id,
      customerId: booking.customer_id,
      customerName: customerNameMap.get(booking.customer_id) || "Customer",
      serviceLabel: booking.service_label,
      location: booking.location_text,
      schedule: formatSchedule(
        booking.scheduled_date,
        booking.scheduled_start_time,
        booking.scheduled_end_time,
      ),
      preview: latestMessage?.message_text?.trim() || fallbackText,
      lastMessageAt: latestMessage?.created_at || booking.created_at,
      lastSenderRole: latestMessage?.sender_role || (booking.customer_note?.trim() ? "customer" : "system"),
      unreadCount: unreadCountByBooking.get(booking.id) ?? 0,
    };
  });

  return NextResponse.json({ threads });
}
