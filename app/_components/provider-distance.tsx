"use client";

import { useEffect, useState } from "react";

import { loadCurrentLiveLocation, resolveCurrentLiveLocation } from "@/lib/live-location";
import { calculateDistanceKm, formatDistanceKm } from "@/lib/provider-distance";

export function ProviderDistanceText({
  providerLatitude,
  providerLongitude,
  fallbackDistanceKm,
  suffix = "",
}: {
  providerLatitude: number | null;
  providerLongitude: number | null;
  fallbackDistanceKm?: number | null;
  suffix?: string;
}) {
  const [distanceKm, setDistanceKm] = useState<number | null>(() => {
    const currentLocation = loadCurrentLiveLocation();

    if (
      currentLocation &&
      typeof providerLatitude === "number" &&
      typeof providerLongitude === "number"
    ) {
      return calculateDistanceKm(
        currentLocation.latitude,
        currentLocation.longitude,
        providerLatitude,
        providerLongitude
      );
    }

    return fallbackDistanceKm ?? null;
  });

  useEffect(() => {
    if (
      typeof providerLatitude !== "number" ||
      typeof providerLongitude !== "number"
    ) {
      setDistanceKm(fallbackDistanceKm ?? null);
      return;
    }

    const storedLocation = loadCurrentLiveLocation();

    if (storedLocation) {
      setDistanceKm(
        calculateDistanceKm(
          storedLocation.latitude,
          storedLocation.longitude,
          providerLatitude,
          providerLongitude
        )
      );
      return;
    }

    let active = true;

    void resolveCurrentLiveLocation("Current location", { persist: "current" })
      .then((currentLocation) => {
        if (!active || !currentLocation) {
          return;
        }

        setDistanceKm(
          calculateDistanceKm(
            currentLocation.latitude,
            currentLocation.longitude,
            providerLatitude,
            providerLongitude
          )
        );
      })
      .catch(() => {
        setDistanceKm(fallbackDistanceKm ?? null);
      });

    return () => {
      active = false;
    };
  }, [fallbackDistanceKm, providerLatitude, providerLongitude]);

  if (distanceKm === null) {
    return <>{fallbackDistanceKm !== null && fallbackDistanceKm !== undefined ? formatDistanceKm(fallbackDistanceKm) : "Distance unavailable"}{suffix}</>;
  }

  return <>{formatDistanceKm(distanceKm)}{suffix}</>;
}
