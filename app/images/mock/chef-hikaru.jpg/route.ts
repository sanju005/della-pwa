import { NextResponse } from "next/server";

import { portraitSvg } from "../_shared";

export async function GET() {
  return new NextResponse(portraitSvg("chef-hikaru"), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
