import { NextResponse } from "next/server";

import {
  loadConversationDetail,
  markConversationRead,
  sendConversationMessage,
  verifyAuthenticatedUser,
} from "@/lib/booking-messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  const verified = await verifyAuthenticatedUser(request, "customer");

  if ("error" in verified) {
    const errorResponse = verified.error!;
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }

  const params = await context.params;

  try {
    const thread = await loadConversationDetail(
      verified.adminClient,
      verified.profile,
      "customer",
      params.bookingId,
    );

    return NextResponse.json({ thread });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load conversation." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  const verified = await verifyAuthenticatedUser(request, "customer");

  if ("error" in verified) {
    const errorResponse = verified.error!;
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }

  const params = await context.params;
  const payload = (await request.json().catch(() => ({}))) as { messageText?: string };

  try {
    await sendConversationMessage(
      verified.adminClient,
      verified.profile,
      "customer",
      params.bookingId,
      payload.messageText ?? "",
    );

    const thread = await loadConversationDetail(
      verified.adminClient,
      verified.profile,
      "customer",
      params.bookingId,
    );

    return NextResponse.json({ thread });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send message." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingId: string }> },
) {
  const verified = await verifyAuthenticatedUser(request, "customer");

  if ("error" in verified) {
    const errorResponse = verified.error!;
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  }

  const params = await context.params;

  try {
    await markConversationRead(
      verified.adminClient,
      verified.profile.id,
      params.bookingId,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to mark conversation as read." },
      { status: 500 },
    );
  }
}
