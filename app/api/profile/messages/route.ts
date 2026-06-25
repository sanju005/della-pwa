import { NextResponse } from "next/server";

import {
  loadConversationThreads,
  verifyAuthenticatedUser,
} from "@/lib/booking-messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const verified = await verifyAuthenticatedUser(request, "customer");

  if ("error" in verified) {
    const errorResponse = verified.error!;
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }

  try {
    const threads = await loadConversationThreads(
      verified.adminClient,
      verified.profile,
      "customer",
    );

    return NextResponse.json({ threads });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load booking conversations." },
      { status: 500 },
    );
  }
}
