import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { parsePaymentAdjustmentNote } from "@/lib/payment-adjustment";
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

type BookingRow = {
  id: string;
  customer_id: string;
  service_label: string;
  service_key: string;
  location_text: string;
  booking_mode: "hourly" | "daily";
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
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  customer_note: string | null;
  provider_response_note: string | null;
  decline_reason: string | null;
  quoted_amount: number | null;
  created_at: string;
  accepted_at?: string | null;
  on_the_way_at?: string | null;
  arrived_at?: string | null;
  completed_at?: string | null;
  paid_at?: string | null;
  review_requested_at?: string | null;
  reviewed_at?: string | null;
  payment_records?: Array<{
    amount: number | null;
    payment_method: string | null;
    payment_option: "cash" | "online" | null;
    status: string | null;
    paid_at: string | null;
    company_commission_amount: number | null;
    provider_net_amount: number | null;
    company_payment_status: "pending" | "paid" | null;
    customer_payment_proof_data_url: string | null;
    customer_payment_proof_file_name: string | null;
    customer_payment_proof_mime_type: string | null;
    provider_company_payment_proof_data_url: string | null;
    provider_company_payment_proof_file_name: string | null;
    provider_company_payment_proof_mime_type: string | null;
    created_at: string;
  }> | null;
  provider_review_records?: Array<{
    rating: number | null;
    comment: string | null;
    created_at: string | null;
  }> | null;
};

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

function isMissingProviderReviewTableError(message?: string | null) {
  const normalized = message?.trim().toLowerCase() ?? "";
  return normalized.includes("provider_customer_reviews");
}

function formatDateTimeLabel(date: string, startTime: string, endTime: string) {
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

function providerStatusLabel(status: BookingRow["booking_status"]) {
  switch (status) {
    case "pending":
      return "Awaiting Action";
    case "accepted":
      return "Confirmed";
    case "on_the_way":
      return "On the Way";
    case "arrived":
      return "Arrived";
    case "completed":
      return "Job Done";
    case "paid":
      return "Payment Done";
    case "review_requested":
      return "Completed";
    case "reviewed":
      return "Reviewed";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
  }
}

function customerStatusLabel(status: BookingRow["booking_status"]) {
  switch (status) {
    case "pending":
      return "Request Sent";
    case "accepted":
      return "Confirmed";
    case "on_the_way":
      return "On the Way";
    case "arrived":
      return "Arrived";
    case "completed":
      return "Job Done";
    case "paid":
      return "Payment Done";
    case "review_requested":
      return "Completed";
    case "reviewed":
      return "Reviewed";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
  }
}

function toBucket(status: BookingRow["booking_status"]) {
  if (status === "pending") {
    return "requests";
  }

  if (status === "declined" || status === "cancelled") {
    return "closed";
  }

  if (status === "reviewed") {
    return "closed";
  }

  if (
    status === "completed" ||
    status === "paid" ||
    status === "review_requested"
  ) {
    return "completed";
  }

  return "active";
}

async function loadCustomerNames(
  adminClient: NonNullable<ReturnType<typeof getAdminSupabaseClient>>,
  customerIds: string[]
) {
  if (customerIds.length === 0) {
    return new Map<string, string>();
  }

  const { data } = await adminClient
    .from("profiles")
    .select("id, full_name")
    .in("id", customerIds);

  return new Map(
    ((data ?? []) as Array<{ id: string; full_name: string | null }>).map((row) => [
      row.id,
      row.full_name?.trim() || "Customer",
    ])
  );
}

export async function GET(request: Request) {
  const verified = await verifyProviderRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  let { data, error } = await verified.adminClient
    .from("bookings")
    .select(`
      id,
      customer_id,
      service_label,
      service_key,
      location_text,
      booking_mode,
      booking_status,
      scheduled_date,
      scheduled_start_time,
      scheduled_end_time,
      customer_note,
      provider_response_note,
      decline_reason,
      quoted_amount,
      created_at,
      accepted_at,
      on_the_way_at,
      arrived_at,
      completed_at,
      paid_at,
      review_requested_at,
      reviewed_at,
      payment_records:payments(amount, payment_method, payment_option, status, paid_at, company_commission_amount, provider_net_amount, company_payment_status, customer_payment_proof_data_url, customer_payment_proof_file_name, customer_payment_proof_mime_type, provider_company_payment_proof_data_url, provider_company_payment_proof_file_name, provider_company_payment_proof_mime_type, created_at),
      provider_review_records:provider_customer_reviews(rating, comment, created_at)
    `)
    .eq("provider_id", verified.profile.id)
    .order("created_at", { ascending: false });

  if (error && isMissingProviderReviewTableError(error.message)) {
    const fallbackRead = await verified.adminClient
      .from("bookings")
      .select(`
        id,
        customer_id,
        service_label,
        service_key,
        location_text,
        booking_mode,
        booking_status,
        scheduled_date,
        scheduled_start_time,
        scheduled_end_time,
        customer_note,
        provider_response_note,
        decline_reason,
        quoted_amount,
        created_at,
        accepted_at,
        on_the_way_at,
        arrived_at,
        completed_at,
        paid_at,
        review_requested_at,
        reviewed_at,
        payment_records:payments(amount, payment_method, payment_option, status, paid_at, company_commission_amount, provider_net_amount, company_payment_status, customer_payment_proof_data_url, customer_payment_proof_file_name, customer_payment_proof_mime_type, provider_company_payment_proof_data_url, provider_company_payment_proof_file_name, provider_company_payment_proof_mime_type, created_at)
      `)
      .eq("provider_id", verified.profile.id)
      .order("created_at", { ascending: false });

    data = fallbackRead.data as typeof data;
    error = fallbackRead.error;
  }

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to load provider bookings." },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as BookingRow[];
  const customerNames = await loadCustomerNames(
    verified.adminClient,
    [...new Set(rows.map((row) => row.customer_id))]
  );

  return NextResponse.json({
    bookings: rows.map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      customerName: customerNames.get(row.customer_id) || "Customer",
      serviceLabel: row.service_label,
      serviceKey: row.service_key,
      location: row.location_text,
      bookingMode: row.booking_mode,
      bookingStatus: row.booking_status,
      statusLabel: providerStatusLabel(row.booking_status),
      customerStatusLabel: customerStatusLabel(row.booking_status),
      bucket: toBucket(row.booking_status),
      scheduledDate: row.scheduled_date,
      scheduledStartTime: row.scheduled_start_time,
      scheduledEndTime: row.scheduled_end_time,
      schedule: formatDateTimeLabel(
        row.scheduled_date,
        row.scheduled_start_time,
        row.scheduled_end_time
      ),
      customerNote: row.customer_note ?? "",
      providerResponseNote: row.provider_response_note ?? "",
      declineReason: row.decline_reason ?? "",
      quotedAmount:
        typeof row.payment_records?.[0]?.amount === "number"
          ? Number(row.payment_records[0]?.amount ?? 0)
          : parsePaymentAdjustmentNote(row.provider_response_note)?.finalAmount ??
            Number(row.quoted_amount ?? 0),
      baseAmount:
        parsePaymentAdjustmentNote(row.provider_response_note)?.baseAmount ??
        Number(row.quoted_amount ?? 0),
      paymentStatus:
        row.payment_records?.[0]?.status === "paid" ||
        row.payment_records?.[0]?.status === "failed" ||
        row.payment_records?.[0]?.status === "cancelled" ||
        row.payment_records?.[0]?.status === "refunded"
          ? row.payment_records[0].status
          : "pending",
      paymentOption: row.payment_records?.[0]?.payment_option === "online" ? "online" : "cash",
      companyCommissionAmount:
        typeof row.payment_records?.[0]?.company_commission_amount === "number"
          ? Number(row.payment_records[0]?.company_commission_amount ?? 0)
          : 0,
      companyPaymentStatus:
        row.payment_records?.[0]?.company_payment_status === "paid" ? "paid" : "pending",
      providerNetAmount:
        typeof row.payment_records?.[0]?.provider_net_amount === "number"
          ? Number(row.payment_records[0]?.provider_net_amount ?? 0)
          : Number(row.quoted_amount ?? 0),
      customerPaymentProofDataUrl: row.payment_records?.[0]?.customer_payment_proof_data_url ?? "",
      customerPaymentProofFileName: row.payment_records?.[0]?.customer_payment_proof_file_name ?? "",
      customerPaymentProofMimeType: row.payment_records?.[0]?.customer_payment_proof_mime_type ?? "",
      providerCompanyPaymentProofDataUrl: row.payment_records?.[0]?.provider_company_payment_proof_data_url ?? "",
      providerCompanyPaymentProofFileName: row.payment_records?.[0]?.provider_company_payment_proof_file_name ?? "",
      providerCompanyPaymentProofMimeType: row.payment_records?.[0]?.provider_company_payment_proof_mime_type ?? "",
      additionalCharge:
        parsePaymentAdjustmentNote(row.provider_response_note)?.additionalCharge ?? 0,
      additionalChargeDescription:
        parsePaymentAdjustmentNote(row.provider_response_note)?.chargeDescription ?? "",
      paymentNote:
        row.payment_records?.[0]?.status === "paid"
          ? `Customer paid via ${row.payment_records?.[0]?.payment_method ?? "Cash"}.`
          : parsePaymentAdjustmentNote(row.provider_response_note)?.note ?? "",
      createdAt: row.created_at,
      acceptedAt: row.accepted_at ?? "",
      onTheWayAt: row.on_the_way_at ?? "",
      arrivedAt: row.arrived_at ?? "",
      completedAt: row.completed_at ?? "",
      paidAt: row.paid_at ?? row.payment_records?.[0]?.paid_at ?? "",
      reviewRequestedAt: row.review_requested_at ?? "",
      reviewedAt: row.reviewed_at ?? "",
      providerReviewRating:
        typeof row.provider_review_records?.[0]?.rating === "number"
          ? Number(row.provider_review_records[0].rating ?? 0)
          : undefined,
      providerReviewComment: row.provider_review_records?.[0]?.comment ?? "",
      providerReviewedAt: row.provider_review_records?.[0]?.created_at ?? "",
    })),
  });
}
