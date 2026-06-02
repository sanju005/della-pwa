import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NominatimSearchResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const upstream = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=my&q=${encodeURIComponent(query)}`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "DELLA PWA Location Search/1.0",
        },
        cache: "no-store",
      }
    );

    if (!upstream.ok) {
      throw new Error(`Location search failed with status ${upstream.status}`);
    }

    const data = (await upstream.json()) as NominatimSearchResult[];

    return NextResponse.json({
      results: data.map((item) => ({
        id: item.place_id,
        label: item.display_name,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
      })),
    });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
