import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { PaymentHistoryItem } from "@/lib/profile-types";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  role: string | null;
};

type PaymentRow = {
  id: string;
  provider_id: string | null;
  service_title: string | null;
  amount: number | null;
  payment_method: string | null;
  status: string | null;
  paid_at: string | null;
  created_at: string | null;
};

type ProviderProfileRow = {
  id: string;
  marketing_name: string | null;
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
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      error: NextResponse.json({ error: "Customer profile was not found." }, { status: 404 }),
    };
  }

  if (isProviderRole((profile as ProfileRow).role)) {
    return {
      error: NextResponse.json({ error: "This account is a provider account." }, { status: 403 }),
    };
  }

  return {
    adminClient,
    profile: profile as ProfileRow,
  };
}

async function loadProviderNames(
  adminClient: NonNullable<ReturnType<typeof getAdminSupabaseClient>>,
  providerIds: string[],
) {
  if (providerIds.length === 0) {
    return new Map<string, string>();
  }

  const { data } = await adminClient
    .from("provider_profiles")
    .select("id, marketing_name")
    .in("id", providerIds);

  return new Map(
    ((data ?? []) as ProviderProfileRow[]).map((row) => [
      row.id,
      row.marketing_name?.trim() || "DELLA Provider",
    ]),
  );
}

function toPaymentHistoryItem(
  row: PaymentRow,
  providerName: string,
): PaymentHistoryItem | null {
  const normalizedStatus = row.status?.trim().toLowerCase();
  if (normalizedStatus !== "paid" && normalizedStatus !== "refunded") {
    return null;
  }

  const paidAt = row.paid_at?.trim() || row.created_at?.trim() || null;
  if (!paidAt) {
    return null;
  }

  return {
    id: row.id,
    serviceCategory: "Service",
    serviceTitle: row.service_title?.trim() || "Service Payment",
    provider: providerName,
    amount: typeof row.amount === "number" ? Number(row.amount) : 0,
    paidAt,
    paymentMethod: row.payment_method?.trim() || "Cash",
    status: normalizedStatus,
  };
}

export async function GET(request: Request) {
  const verified = await verifyCustomerRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const { data, error } = await verified.adminClient
    .from("payments")
    .select("id, provider_id, service_title, amount, payment_method, status, paid_at, created_at")
    .eq("customer_id", verified.profile.id)
    .order("paid_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(200);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to load payments." },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as PaymentRow[];
  const providerNames = await loadProviderNames(
    verified.adminClient,
    [...new Set(rows.map((row) => row.provider_id).filter((value): value is string => Boolean(value)))],
  );

  const payments = rows
    .map((row) => toPaymentHistoryItem(row, providerNames.get(row.provider_id ?? "") || "DELLA Provider"))
    .filter((item): item is PaymentHistoryItem => item !== null);

  return NextResponse.json({ payments });
}
