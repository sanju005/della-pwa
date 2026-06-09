import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/supabase-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type ProviderProfileRow = {
  id: string;
  role: string | null;
};

type AvailabilityRow = {
  id: string;
  day_of_week: string;
  time_mode: string | null;
  start_time: string | null;
  end_time: string | null;
};

type AvailabilityPayload = {
  enabled?: boolean;
  days?: string[];
  startTime?: string;
  endTime?: string;
  timeMode?: string;
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

  if (profileError || !profile || !isProviderRole((profile as ProviderProfileRow).role)) {
    return {
      error: NextResponse.json({ error: "This account is not a provider." }, { status: 403 }),
    };
  }

  return {
    adminClient,
    profile: profile as ProviderProfileRow,
  };
}

function normalizeDay(value: string) {
  return value.trim().toLowerCase();
}

function labelDay(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function sortRows(rows: AvailabilityRow[]) {
  return [...rows].sort(
    (left, right) =>
      DAY_ORDER.indexOf(normalizeDay(left.day_of_week) as (typeof DAY_ORDER)[number]) -
      DAY_ORDER.indexOf(normalizeDay(right.day_of_week) as (typeof DAY_ORDER)[number]),
  );
}

export async function GET(request: Request) {
  const verified = await verifyProviderRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const [{ data: rows, error }, { data: listing }] = await Promise.all([
    verified.adminClient
      .from("provider_availability")
      .select("id, day_of_week, time_mode, start_time, end_time")
      .eq("provider_id", verified.profile.id),
    verified.adminClient
      .from("provider_profiles")
      .select("is_visible")
      .eq("id", verified.profile.id)
      .maybeSingle(),
  ]);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Unable to load provider availability." },
      { status: 500 },
    );
  }

  const orderedRows = sortRows((rows ?? []) as AvailabilityRow[]);

  return NextResponse.json({
    enabled: Boolean(listing?.is_visible ?? true),
    entries: orderedRows.map((row) => ({
      id: row.id,
      day: labelDay(row.day_of_week),
      dayKey: normalizeDay(row.day_of_week),
      timeMode: row.time_mode ?? "custom",
      startTime: row.start_time?.slice(0, 5) ?? "08:00",
      endTime: row.end_time?.slice(0, 5) ?? "20:00",
    })),
  });
}

export async function PUT(request: Request) {
  const verified = await verifyProviderRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const payload = (await request.json()) as AvailabilityPayload;
  const enabled = Boolean(payload.enabled);
  const selectedDays = [...new Set((payload.days ?? []).map(normalizeDay))]
    .filter((day): day is (typeof DAY_ORDER)[number] => DAY_ORDER.includes(day as (typeof DAY_ORDER)[number]));
  const startTime = payload.startTime?.trim() || "08:00";
  const endTime = payload.endTime?.trim() || "20:00";
  const timeMode = payload.timeMode?.trim() || "custom";

  if (enabled && selectedDays.length === 0) {
    return NextResponse.json(
      { error: "Select at least one day before saving availability." },
      { status: 400 },
    );
  }

  const deleteExisting = await verified.adminClient
    .from("provider_availability")
    .delete()
    .eq("provider_id", verified.profile.id);

  if (deleteExisting.error) {
    return NextResponse.json(
      { error: deleteExisting.error.message || "Unable to clear previous availability." },
      { status: 500 },
    );
  }

  if (enabled && selectedDays.length > 0) {
    const insertRows = selectedDays.map((day) => ({
      provider_id: verified.profile.id,
      day_of_week: day,
      time_mode: timeMode,
      start_time: startTime,
      end_time: endTime,
    }));

    const insertResult = await verified.adminClient
      .from("provider_availability")
      .insert(insertRows);

    if (insertResult.error) {
      return NextResponse.json(
        { error: insertResult.error.message || "Unable to save availability." },
        { status: 500 },
      );
    }
  }

  const visibilityResult = await verified.adminClient
    .from("provider_profiles")
    .update({
      is_visible: enabled,
    })
    .eq("id", verified.profile.id);

  if (visibilityResult.error) {
    return NextResponse.json(
      { error: visibilityResult.error.message || "Availability saved, but visibility update failed." },
      { status: 500 },
    );
  }

  return GET(request);
}
