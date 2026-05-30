import { NextResponse } from "next/server";

import { getProviderRegistration } from "@/lib/provider-registration-storage";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/provider/register/[id]">
) {
  const { id } = await context.params;
  const record = await getProviderRegistration(id);

  if (!record) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}
