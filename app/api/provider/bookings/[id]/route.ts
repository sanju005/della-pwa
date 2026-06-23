import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendPushNotificationToUser } from "@/lib/push-notifications";
import { buildPaymentAdjustmentNote } from "@/lib/payment-adjustment";
import {
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/supabase-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isProviderRole(role: string | null | undefined) {
  return role === "provider" || role === "service_provider";
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
};

type BookingStatus =
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

type UpdatePayload = {
  status?: BookingStatus;
  note?: string;
  finalAmount?: number;
  additionalCharge?: number;
  chargeDescription?: string;
};

type BookingOwnerRow = {
  id: string;
  customer_id: string;
  provider_id: string;
  booking_status: BookingStatus;
  service_label: string;
  quoted_amount: number | null;
};

function isUnknownColumnError(message?: string | null) {
  const normalized = message?.trim().toLowerCase() ?? "";
  return normalized.includes("column") && (
    normalized.includes("accepted_at") ||
    normalized.includes("provider_response_note") ||
    normalized.includes("decline_reason") ||
    normalized.includes("on_the_way_at") ||
    normalized.includes("arrived_at") ||
    normalized.includes("completed_at") ||
    normalized.includes("paid_at") ||
    normalized.includes("review_requested_at") ||
    normalized.includes("cancelled_at")
  );
}

function mapBookingUpdateError(message?: string | null) {
  const normalized = message?.trim().toLowerCase() ?? "";

  if (
    normalized.includes("invalid input value for enum booking_status") ||
    normalized.includes("invalid input value for enum") && normalized.includes("booking_status")
  ) {
    return "The live booking workflow database migration is missing. Apply the latest Supabase migration for booking status values, then try again.";
  }

  return message || "Unable to update booking.";
}

function buildFallbackUpdatePayload(
  nextStatus: BookingStatus,
  current: BookingOwnerRow,
  finalAmount: number | null,
) {
  const payload: Record<string, string | number | BookingStatus> = {
    booking_status: nextStatus,
  };

  if (nextStatus === "paid") {
    payload.quoted_amount = finalAmount ?? Number(current.quoted_amount ?? 0);
  }

  return payload;
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
      error: NextResponse.json(
        { error: "Supabase is not configured yet." },
        { status: 500 }
      ),
    };
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Missing auth token." },
        { status: 401 }
      ),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      error: NextResponse.json(
        { error: "Provider profile was not found." },
        { status: 404 }
      ),
    };
  }

  if (!isProviderRole((profile as ProfileRow).role)) {
    return {
      error: NextResponse.json(
        { error: "This account is not a provider account." },
        { status: 403 }
      ),
    };
  }

  return {
    adminClient,
    authUser: user,
    profile: profile as ProfileRow,
  };
}

const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending: ["accepted", "declined", "cancelled"],
  accepted: ["on_the_way", "cancelled"],
  on_the_way: ["arrived", "cancelled"],
  arrived: ["completed", "cancelled"],
  completed: ["paid"],
  paid: ["review_requested"],
  review_requested: [],
  reviewed: [],
  declined: [],
  cancelled: [],
};

function notificationTypeForStatus(status: BookingStatus) {
  switch (status) {
    case "accepted":
      return "booking_accepted";
    case "declined":
      return "booking_declined";
    case "on_the_way":
      return "provider_on_the_way";
    case "arrived":
      return "provider_arrived";
    case "completed":
      return "task_completed";
    case "paid":
      return "payment_done";
    case "review_requested":
      return "review_requested";
    case "cancelled":
      return "booking_cancelled";
    default:
      return null;
  }
}

function notificationContent(
  status: BookingStatus,
  serviceLabel: string,
  note: string,
  finalAmount?: number
) {
  switch (status) {
    case "accepted":
      return {
        title: "Booking confirmed",
        body: `Your ${serviceLabel} booking was accepted.${note ? ` Note: ${note}` : ""}`,
      };
    case "declined":
      return {
        title: "Booking declined",
        body: `Your ${serviceLabel} booking was declined.${note ? ` Reason: ${note}` : ""}`,
      };
    case "on_the_way":
      return {
        title: "Provider on the way",
        body: `Your ${serviceLabel} provider is on the way.`,
      };
    case "arrived":
      return {
        title: "Provider arrived",
        body: `Your ${serviceLabel} provider has arrived.`,
      };
    case "completed":
      return {
        title: "Task completed",
        body: `Your ${serviceLabel} task was marked completed.`,
      };
    case "paid":
      return {
        title: "Payment done",
        body: `Payment was marked complete for your ${serviceLabel} booking${typeof finalAmount === "number" ? ` (RM ${finalAmount.toFixed(2)})` : ""}.`,
      };
    case "review_requested":
      return {
        title: "Review requested",
        body: `Please review your ${serviceLabel} booking.`,
      };
    case "cancelled":
      return {
        title: "Booking cancelled",
        body: `Your ${serviceLabel} booking was cancelled.`,
      };
    default:
      return null;
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const verified = await verifyProviderRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const params = await context.params;
  const payload = (await request.json()) as UpdatePayload;
  const nextStatus = payload.status;
  const note = payload.note?.trim() ?? "";
  const additionalCharge =
    typeof payload.additionalCharge === "number" && Number.isFinite(payload.additionalCharge)
      ? Math.max(0, payload.additionalCharge)
      : 0;
  const finalAmount =
    typeof payload.finalAmount === "number" && Number.isFinite(payload.finalAmount)
      ? Math.max(0, payload.finalAmount)
      : null;
  const chargeDescription = payload.chargeDescription?.trim() ?? "";

  if (!nextStatus) {
    return NextResponse.json(
      { error: "Booking status is required." },
      { status: 400 }
    );
  }

  const { data: booking, error: bookingError } = await verified.adminClient
    .from("bookings")
    .select("id, customer_id, provider_id, booking_status, service_label, quoted_amount")
    .eq("id", params.id)
    .eq("provider_id", verified.profile.id)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: "Booking was not found." },
      { status: 404 }
    );
  }

  const current = booking as BookingOwnerRow;

  if (!allowedTransitions[current.booking_status].includes(nextStatus)) {
    return NextResponse.json(
      { error: `Cannot move booking from ${current.booking_status} to ${nextStatus}.` },
      { status: 400 }
    );
  }

  if (nextStatus === "paid" && finalAmount === null) {
    return NextResponse.json(
      { error: "Final payment amount is required." },
      { status: 400 }
    );
  }

  const updatePayload: Record<string, string | number | BookingStatus> = {
    booking_status: nextStatus,
  };

  if (nextStatus === "accepted") {
    updatePayload.accepted_at = new Date().toISOString();
    updatePayload.provider_response_note = note;
  }

  if (nextStatus === "declined") {
    updatePayload.decline_reason = note || "Provider declined booking.";
  }

  if (nextStatus === "on_the_way") {
    updatePayload.on_the_way_at = new Date().toISOString();
  }

  if (nextStatus === "arrived") {
    updatePayload.arrived_at = new Date().toISOString();
  }

  if (nextStatus === "completed") {
    updatePayload.completed_at = new Date().toISOString();
  }

  if (nextStatus === "paid") {
    updatePayload.paid_at = new Date().toISOString();
    updatePayload.provider_response_note = buildPaymentAdjustmentNote({
      baseAmount: Number(current.quoted_amount ?? 0),
      finalAmount: finalAmount ?? Number(current.quoted_amount ?? 0),
      additionalCharge,
      chargeDescription,
      note,
    });
    updatePayload.quoted_amount = finalAmount ?? Number(current.quoted_amount ?? 0);
  }

  if (nextStatus === "review_requested") {
    updatePayload.review_requested_at = new Date().toISOString();
  }

  if (nextStatus === "cancelled") {
    updatePayload.cancelled_at = new Date().toISOString();
  }

  let { error: updateError } = await verified.adminClient
    .from("bookings")
    .update(updatePayload)
    .eq("id", current.id)
    .eq("provider_id", verified.profile.id);

  if (updateError && isUnknownColumnError(updateError.message)) {
    const fallbackPayload = buildFallbackUpdatePayload(
      nextStatus,
      current,
      finalAmount,
    );

    const fallbackWrite = await verified.adminClient
      .from("bookings")
      .update(fallbackPayload)
      .eq("id", current.id)
      .eq("provider_id", verified.profile.id);

    updateError = fallbackWrite.error;
  }

  if (updateError) {
    console.error("[Provider booking update] Failed to update booking:", updateError);
    return NextResponse.json(
      { error: mapBookingUpdateError(updateError.message) },
      { status: 500 }
    );
  }

  const nextNotificationType = notificationTypeForStatus(nextStatus);
  const nextNotificationContent = notificationContent(
    nextStatus,
    current.service_label,
    note,
    finalAmount ?? undefined
  );

  if (nextNotificationType && nextNotificationContent) {
    const { error: notificationError } = await verified.adminClient
      .from("notifications")
      .insert({
        user_id: current.customer_id,
        booking_id: current.id,
        notification_type: nextNotificationType,
        title: nextNotificationContent.title,
        body: nextNotificationContent.body,
      });

    if (notificationError) {
      console.error("[Provider booking update] Failed to store notification:", notificationError);
    }

    try {
      await sendPushNotificationToUser(current.customer_id, {
        title: nextNotificationContent.title,
        body: nextNotificationContent.body,
        bookingId: current.id,
        path: `/profile/notifications?booking=${current.id}`,
      });
    } catch (pushError) {
      console.error("[Provider booking update] Failed to send push notification:", pushError);
    }
  }

  return NextResponse.json({ success: true });
}
