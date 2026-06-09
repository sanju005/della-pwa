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
  role: string | null;
};

type ReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  customer_id: string | null;
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
    .select("id, role")
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

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export async function GET(request: Request) {
  const verified = await verifyProviderRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const { data, error } = await verified.adminClient
    .from("reviews")
    .select("id, rating, comment, created_at, customer_id")
    .eq("provider_id", verified.profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to load provider reviews." },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as ReviewRow[];
  const customerIds = [...new Set(rows.map((row) => row.customer_id).filter((value): value is string => Boolean(value)))];
  const { data: customerProfiles } = customerIds.length > 0
    ? await verified.adminClient
        .from("profiles")
        .select("id, full_name")
        .in("id", customerIds)
    : { data: [] as Array<{ id: string; full_name: string | null }> };

  const customerNameMap = new Map(
    ((customerProfiles ?? []) as Array<{ id: string; full_name: string | null }>).map((row) => [
      row.id,
      row.full_name?.trim() || "Customer",
    ]),
  );

  return NextResponse.json({
    reviews: rows.map((row) => ({
      id: row.id,
      customerName: row.customer_id ? customerNameMap.get(row.customer_id) || "Customer" : "Customer",
      rating: Math.max(1, Math.min(5, Math.round(row.rating ?? 5))),
      comment: row.comment?.trim() || "Shared feedback",
      createdAt: row.created_at,
      createdLabel: formatDateLabel(row.created_at),
    })),
  });
}
