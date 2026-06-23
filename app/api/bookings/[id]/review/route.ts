import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendPushNotificationToUser } from "@/lib/push-notifications";
import {
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/supabase-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReviewPayload = {
  rating?: number;
  comment?: string;
  photos?: string[];
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
};

type BookingRow = {
  id: string;
  customer_id: string;
  provider_id: string;
  service_label: string;
  booking_status:
    | "pending"
    | "accepted"
    | "on_the_way"
    | "arrived"
    | "completed"
    | "paid"
    | "review_requested"
    | "reviewed"
    | "declined"
    | "cancelled";
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

async function verifyCustomerRequest(request: Request) {
  const adminClient = getAdminSupabaseClient();

  if (!adminClient) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured yet." },
        { status: 500 },
      ),
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

  if (profileError || !profile || isProviderRole((profile as ProfileRow).role)) {
    return {
      error: NextResponse.json(
        { error: "This account is not a customer account." },
        { status: 403 },
      ),
    };
  }

  return {
    adminClient,
    profile: profile as ProfileRow,
  };
}

function isMissingReviewedAtColumnError(message?: string | null) {
  const normalized = message?.trim().toLowerCase() ?? "";
  return normalized.includes("column") && normalized.includes("reviewed_at");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const verified = await verifyCustomerRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const params = await context.params;
  const payload = (await request.json()) as ReviewPayload;
  const rating = Math.max(1, Math.min(5, Math.round(Number(payload.rating ?? 0))));
  const comment = payload.comment?.trim() ?? "";

  if (!rating || !Number.isFinite(rating)) {
    return NextResponse.json(
      { error: "A rating from 1 to 5 is required." },
      { status: 400 },
    );
  }

  const { data: booking, error: bookingError } = await verified.adminClient
    .from("bookings")
    .select("id, customer_id, provider_id, service_label, booking_status")
    .eq("id", params.id)
    .eq("customer_id", verified.profile.id)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: "Booking was not found." },
      { status: 404 },
    );
  }

  const bookingRow = booking as BookingRow;

  if (
    bookingRow.booking_status !== "completed" &&
    bookingRow.booking_status !== "paid" &&
    bookingRow.booking_status !== "review_requested" &&
    bookingRow.booking_status !== "reviewed"
  ) {
    return NextResponse.json(
      { error: "This booking is not ready for review yet." },
      { status: 400 },
    );
  }

  const { data: existingReview } = await verified.adminClient
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingRow.id)
    .eq("customer_id", verified.profile.id)
    .maybeSingle();

  const reviewPayload = {
    booking_id: bookingRow.id,
    provider_id: bookingRow.provider_id,
    customer_id: verified.profile.id,
    rating,
    comment,
  };

  if (existingReview?.id) {
    const { error: updateReviewError } = await verified.adminClient
      .from("reviews")
      .update(reviewPayload)
      .eq("id", existingReview.id);

    if (updateReviewError) {
      return NextResponse.json(
        { error: updateReviewError.message || "Unable to update review." },
        { status: 500 },
      );
    }
  } else {
    const { error: insertReviewError } = await verified.adminClient
      .from("reviews")
      .insert(reviewPayload);

    if (insertReviewError) {
      return NextResponse.json(
        { error: insertReviewError.message || "Unable to submit review." },
        { status: 500 },
      );
    }
  }

  let { error: bookingUpdateError } = await verified.adminClient
    .from("bookings")
    .update({
      booking_status: "reviewed",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", bookingRow.id)
    .eq("customer_id", verified.profile.id);

  if (bookingUpdateError && isMissingReviewedAtColumnError(bookingUpdateError.message)) {
    const fallbackWrite = await verified.adminClient
      .from("bookings")
      .update({
        booking_status: "reviewed",
      })
      .eq("id", bookingRow.id)
      .eq("customer_id", verified.profile.id);

    bookingUpdateError = fallbackWrite.error;
  }

  if (bookingUpdateError) {
    return NextResponse.json(
      { error: bookingUpdateError.message || "Unable to update booking review status." },
      { status: 500 },
    );
  }

  await verified.adminClient.from("notifications").insert({
    user_id: bookingRow.provider_id,
    booking_id: bookingRow.id,
    notification_type: "review_submitted",
    title: "New customer review",
    body: `${verified.profile.full_name?.trim() || "A customer"} reviewed your ${bookingRow.service_label} booking.`,
  });

  await sendPushNotificationToUser(bookingRow.provider_id, {
    title: "New customer review",
    body: `${verified.profile.full_name?.trim() || "A customer"} reviewed your ${bookingRow.service_label} booking.`,
    bookingId: bookingRow.id,
    path: `/provider/reviews`,
  });

  return NextResponse.json({ success: true });
}
