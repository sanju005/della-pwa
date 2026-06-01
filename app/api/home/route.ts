import { NextResponse } from "next/server";
import { getHomeFeedData } from "@/lib/home-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getHomeFeedData();

  return NextResponse.json(data);
}
