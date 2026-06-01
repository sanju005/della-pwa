import { NextResponse } from "next/server";
import { getProviderCatalog } from "@/lib/provider-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service");
  const data = await getProviderCatalog(service);

  return NextResponse.json(data);
}
