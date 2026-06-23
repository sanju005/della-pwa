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

type AddressRow = {
  id: string;
  label: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  is_default: boolean | null;
};

type AddressPayload = {
  label?: string;
  unitNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  isDefault?: boolean;
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

function isProviderRole(role: string | null | undefined) {
  return role === "provider" || role === "service_provider";
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

function buildAddressLine1(unitNumber: string, addressLine1: string) {
  return [unitNumber.trim(), addressLine1.trim()].filter(Boolean).join(", ");
}

function mapAddress(row: AddressRow) {
  return {
    id: row.id,
    label: row.label?.trim() || "Address",
    line1: row.address_line_1?.trim() || "",
    line2: [row.address_line_2?.trim(), row.postcode?.trim()].filter(Boolean).join(", "),
    city: row.city?.trim() || "",
    state: row.state?.trim() || "",
    isDefault: Boolean(row.is_default),
    kind: "other" as const,
  };
}

export async function GET(request: Request) {
  const verified = await verifyCustomerRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const { data, error } = await verified.adminClient
    .from("addresses")
    .select("id, label, address_line_1, address_line_2, city, state, postcode, country, is_default")
    .eq("user_id", verified.profile.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message || "Unable to load addresses." }, { status: 500 });
  }

  return NextResponse.json({
    addresses: ((data ?? []) as AddressRow[]).map(mapAddress),
  });
}

export async function POST(request: Request) {
  const verified = await verifyCustomerRequest(request);

  if ("error" in verified) {
    return verified.error;
  }

  const payload = (await request.json()) as AddressPayload;
  const label = payload.label?.trim() || "Address";
  const unitNumber = payload.unitNumber?.trim() ?? "";
  const addressLine1 = payload.addressLine1?.trim() ?? "";
  const addressLine2 = payload.addressLine2?.trim() ?? "";
  const postcode = payload.postcode?.trim() ?? "";
  const city = payload.city?.trim() ?? "";
  const state = payload.state?.trim() ?? "";
  const country = payload.country?.trim() || "Malaysia";
  const isDefault = Boolean(payload.isDefault);

  if (!addressLine1 || !postcode || !city || !state) {
    return NextResponse.json({ error: "Please fill in all required address fields." }, { status: 400 });
  }

  if (isDefault) {
    await verified.adminClient
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", verified.profile.id);
  }

  const { data, error } = await verified.adminClient
    .from("addresses")
    .insert({
      user_id: verified.profile.id,
      label,
      address_line_1: buildAddressLine1(unitNumber, addressLine1),
      address_line_2: addressLine2 || null,
      city,
      state,
      postcode,
      country,
      is_default: isDefault,
    })
    .select("id, label, address_line_1, address_line_2, city, state, postcode, country, is_default")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Unable to save address." }, { status: 500 });
  }

  await verified.adminClient
    .from("customer_profiles")
    .upsert(
      {
        id: verified.profile.id,
        city,
        region: state,
        state,
        country,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  return NextResponse.json({ address: mapAddress(data as AddressRow) }, { status: 201 });
}
