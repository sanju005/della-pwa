"use client";

export type StoredLiveLocation = {
  latitude: number;
  longitude: number;
  label: string;
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
    return JSON.parse(raw) as StoredLiveLocation;
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

type ReverseGeocodeResponse = {
  label: string;
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
    }
  } catch {
    label = fallbackLabel;
  }

  const nextLocation = {
    latitude,
    longitude,
    label,
    updatedAt: new Date().toISOString(),
  };

  saveStoredLiveLocation(nextLocation);
  return nextLocation;
}
