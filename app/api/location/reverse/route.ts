import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  residential?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

type NominatimResponse = {
  address?: NominatimAddress;
  display_name?: string;
};

function firstNonEmpty(values: Array<string | undefined>) {
  return values.find((value) => value && value.trim().length > 0) ?? null;
}

function buildLocationLabel(data: NominatimResponse) {
  const address = data.address;
  if (!address) {
    return data.display_name ?? "Current location";
  }

  const area = firstNonEmpty([
    address.neighbourhood,
    address.suburb,
    address.residential,
    address.quarter,
  ]);
  const city = firstNonEmpty([
    address.city_district,
    address.city,
    address.town,
    address.village,
  ]);
  const state = firstNonEmpty([address.state]);

  return [area, city, state].filter(Boolean).join(", ") || data.display_name || "Current location";
}

function buildAddressParts(data: NominatimResponse) {
  const address = data.address;

  return {
    formattedAddress: data.display_name ?? "Current location",
    road: address?.road ?? "",
    suburb:
      address?.neighbourhood ??
      address?.suburb ??
      address?.residential ??
      address?.quarter ??
      "",
    city:
      address?.city_district ??
      address?.city ??
      address?.town ??
      address?.village ??
      "",
    state: address?.state ?? "",
    postcode: address?.postcode ?? "",
    country: address?.country ?? "",
    houseNumber: address?.house_number ?? "",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      { error: "Valid lat and lng query parameters are required." },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "DELLA PWA Live Location/1.0",
        },
        cache: "no-store",
      }
    );

    if (!upstream.ok) {
      throw new Error(`Reverse geocode failed with status ${upstream.status}`);
    }

    const data = (await upstream.json()) as NominatimResponse;
    const addressParts = buildAddressParts(data);

    return NextResponse.json({
      label: buildLocationLabel(data),
      ...addressParts,
      coordinates: {
        latitude,
        longitude,
      },
    });
  } catch {
    return NextResponse.json({
      label: "Current location",
      formattedAddress: "Current location",
      road: "",
      suburb: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      houseNumber: "",
      coordinates: {
        latitude,
        longitude,
      },
    });
  }
}
