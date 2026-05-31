import { NextResponse } from "next/server";

import { createProviderRegistration } from "@/lib/provider-registration-storage";
import type { ProviderRegistrationData } from "@/lib/provider-registration-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ProviderRegistrationData;

    if (!payload.basicProfile.fullName || !payload.account.email) {
      return NextResponse.json(
        { error: "Missing required registration fields." },
        { status: 400 }
      );
    }

    if (payload.selectedServices.length === 0) {
      return NextResponse.json(
        { error: "Select at least one service." },
        { status: 400 }
      );
    }

    const record = await createProviderRegistration(payload);

    return NextResponse.json({
      id: record.id,
      status: record.status,
      phoneVerified: record.phoneVerified,
      emailVerified: record.emailVerified,
      identityVerified: record.identityVerified,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to submit provider registration.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}