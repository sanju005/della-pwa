import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendPushNotificationToUser } from "@/lib/push-notifications";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase-env";
import { getStripeClient } from "@/lib/stripe";

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

export async function POST(request: Request) {
  const verified = await verifyCustomerRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe payment is not configured yet." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    bookingId?: string;
    stripeSessionId?: string;
  };

  if (!body.bookingId || !body.stripeSessionId) {
    return NextResponse.json(
      { error: "Booking ID and Stripe session ID are required." },
      { status: 400 },
    );
  }

  const { data: booking, error: bookingError } = await verified.adminClient
    .from("bookings")
    .select("id, customer_id, provider_id, service_label, booking_status")
    .eq("id", body.bookingId)
    .eq("customer_id", verified.profile.id)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking was not found." }, { status: 404 });
  }

  const bookingRow = booking as BookingRow;
  const session = await stripe.checkout.sessions.retrieve(body.stripeSessionId, {
    expand: ["payment_intent.payment_method"],
  });

  if (session.client_reference_id !== bookingRow.id) {
    return NextResponse.json({ error: "This payment session does not match the booking." }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment is still pending or was not completed." },
      { status: 400 },
    );
  }

  const paymentMethod =
    typeof session.payment_method_types?.[0] === "string"
      ? session.payment_method_types[0].toUpperCase()
      : "Stripe";
  const amountPaid = Number((session.amount_total ?? 0) / 100);
  const paidAt = new Date().toISOString();

  const { error: paymentError } = await verified.adminClient
    .from("payments")
    .upsert(
      {
        booking_id: bookingRow.id,
        customer_id: bookingRow.customer_id,
        provider_id: bookingRow.provider_id,
        service_title: `${bookingRow.service_label} Service`,
        currency: session.currency ?? "myr",
        amount: amountPaid,
        payment_provider: "stripe",
        payment_method: paymentMethod,
        status: "paid",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        checkout_url: session.url,
        paid_at: paidAt,
      },
      { onConflict: "booking_id" },
    );

  if (paymentError) {
    return NextResponse.json(
      { error: paymentError.message || "Unable to save payment." },
      { status: 500 },
    );
  }

  if (bookingRow.booking_status !== "paid" && bookingRow.booking_status !== "review_requested" && bookingRow.booking_status !== "reviewed") {
    const { error: bookingUpdateError } = await verified.adminClient
      .from("bookings")
      .update({
        booking_status: "paid",
        paid_at: paidAt,
      })
      .eq("id", bookingRow.id)
      .eq("customer_id", verified.profile.id);

    if (bookingUpdateError) {
      return NextResponse.json(
        { error: bookingUpdateError.message || "Unable to update booking payment status." },
        { status: 500 },
      );
    }

    await verified.adminClient.from("notifications").insert({
      user_id: bookingRow.provider_id,
      booking_id: bookingRow.id,
      notification_type: "payment_done",
      title: "Customer payment received",
      body: `${verified.profile.full_name?.trim() || "A customer"} paid for the ${bookingRow.service_label} booking.`,
    });

    try {
      await sendPushNotificationToUser(bookingRow.provider_id, {
        title: "Customer payment received",
        body: `${verified.profile.full_name?.trim() || "A customer"} paid for the ${bookingRow.service_label} booking.`,
        bookingId: bookingRow.id,
        path: `/provider/bookings/${bookingRow.id}`,
      });
    } catch (pushError) {
      console.error("[Payment verify] Failed to send provider push notification:", pushError);
    }
  }

  return NextResponse.json({ success: true });
}
