"use client";

export type StoredLiveLocation = {
  latitude: number;
  longitude: number;
  label: string;
  addressLabel?: string;
  formattedAddress?: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  houseNumber?: string;
  buildingName?: string;
  floor?: string;
  unitNumber?: string;
  pickupNote?: string;
  updatedAt: string;
};

const LIVE_LOCATION_STORAGE_KEY = "della.live.location";

export function loadStoredLiveLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LIVE_LOCATION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredLiveLocation;
    return {
      ...parsed,
      addressLabel: parsed.addressLabel ?? "Home",
      formattedAddress: parsed.formattedAddress ?? parsed.label,
      road: parsed.road ?? "",
      suburb: parsed.suburb ?? "",
      city: parsed.city ?? "",
      state: parsed.state ?? "",
      postcode: parsed.postcode ?? "",
      country: parsed.country ?? "",
      houseNumber: parsed.houseNumber ?? "",
      buildingName: parsed.buildingName ?? "",
      floor: parsed.floor ?? "",
      unitNumber: parsed.unitNumber ?? "",
      pickupNote: parsed.pickupNote ?? "",
    };
  } catch {
    return null;
  }
}

export function saveStoredLiveLocation(location: StoredLiveLocation) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    LIVE_LOCATION_STORAGE_KEY,
    JSON.stringify(location)
  );
}

export function buildMapsHref(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export type ReverseGeocodeResponse = {
  label: string;
  formattedAddress?: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  houseNumber?: string;
};

export async function resolveCurrentLiveLocation(fallbackLabel: string) {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 300000,
    });
  });

  const { latitude, longitude } = position.coords;
  let label = fallbackLabel;

  try {
    const response = await fetch(
      `/api/location/reverse?lat=${latitude}&lng=${longitude}`,
      { cache: "no-store" }
    );

    if (response.ok) {
      const data = (await response.json()) as ReverseGeocodeResponse;
      if (data.label) {
        label = data.label;
      }

      const nextLocation = {
        latitude,
        longitude,
        label,
        addressLabel: "Home",
        formattedAddress: data.formattedAddress ?? label,
        road: data.road ?? "",
        suburb: data.suburb ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        postcode: data.postcode ?? "",
        country: data.country ?? "",
        houseNumber: data.houseNumber ?? "",
        buildingName: "",
        floor: "",
        unitNumber: "",
        pickupNote: "",
        updatedAt: new Date().toISOString(),
      };

      saveStoredLiveLocation(nextLocation);
      return nextLocation;
    }
  } catch {
    label = fallbackLabel;
  }

  const nextLocation = {
    latitude,
    longitude,
    label,
    addressLabel: "Home",
    formattedAddress: label,
    road: "",
    suburb: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    houseNumber: "",
    buildingName: "",
    floor: "",
    unitNumber: "",
    pickupNote: "",
    updatedAt: new Date().toISOString(),
  };

  saveStoredLiveLocation(nextLocation);
  return nextLocation;
}
