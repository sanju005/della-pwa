import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getAppBaseUrl, getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase-env";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: string | null;
  email: string | null;
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
  quoted_amount: number | null;
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
    .select("id, full_name, role, email")
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
    authUser: user,
    profile: profile as ProfileRow,
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const verified = await verifyCustomerRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const stripe = getStripeClient();
  const appBaseUrl = getAppBaseUrl();

  if (!stripe || !appBaseUrl) {
    return NextResponse.json(
      { error: "Stripe payment is not configured yet." },
      { status: 500 },
    );
  }

  const params = await context.params;
  const { data: booking, error: bookingError } = await verified.adminClient
    .from("bookings")
    .select("id, customer_id, provider_id, service_label, booking_status, quoted_amount")
    .eq("id", params.id)
    .eq("customer_id", verified.profile.id)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking was not found." }, { status: 404 });
  }

  const bookingRow = booking as BookingRow;

  if (bookingRow.booking_status === "paid" || bookingRow.booking_status === "review_requested" || bookingRow.booking_status === "reviewed") {
    return NextResponse.json({ error: "This booking has already been paid." }, { status: 400 });
  }

  if (bookingRow.booking_status !== "completed") {
    return NextResponse.json(
      { error: "Payment is only available after the provider completes the task." },
      { status: 400 },
    );
  }

  const amount = Math.round(Number(bookingRow.quoted_amount ?? 0) * 100);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "This booking does not have a valid final amount yet." },
      { status: 400 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appBaseUrl}/profile/bookings/${bookingRow.id}?stripe_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appBaseUrl}/profile/bookings/${bookingRow.id}?payment=cancelled`,
    client_reference_id: bookingRow.id,
    customer_email: verified.profile.email ?? verified.authUser.email ?? undefined,
    payment_method_types: ["card", "fpx"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "myr",
          unit_amount: amount,
          product_data: {
            name: `${bookingRow.service_label} Service`,
          },
        },
      },
    ],
    metadata: {
      booking_id: bookingRow.id,
      customer_id: bookingRow.customer_id,
      provider_id: bookingRow.provider_id,
    },
  });

  const { error: paymentWriteError } = await verified.adminClient
    .from("payments")
    .upsert(
      {
        booking_id: bookingRow.id,
        customer_id: bookingRow.customer_id,
        provider_id: bookingRow.provider_id,
        service_title: `${bookingRow.service_label} Service`,
        currency: "myr",
        amount: Number(bookingRow.quoted_amount ?? 0),
        payment_provider: "stripe",
        payment_method: "Card / FPX",
        status: "pending",
        stripe_checkout_session_id: session.id,
        checkout_url: session.url,
      },
      { onConflict: "booking_id" },
    );

  if (paymentWriteError) {
    console.error("[Booking checkout] Failed to store pending payment:", paymentWriteError);
    return NextResponse.json(
      { error: paymentWriteError.message || "Unable to prepare the payment checkout." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    checkoutUrl: session.url,
  });
}
