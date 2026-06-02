"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LoaderCircle, MapPin } from "lucide-react";

import {
  buildMapsHref,
  loadStoredLiveLocation,
  resolveCurrentLiveLocation,
  type StoredLiveLocation,
} from "@/lib/live-location";

type LiveLocationChipProps = {
  fallbackLabel: string;
  className?: string;
};

export function LiveLocationChip({
  fallbackLabel,
  className = "",
}: LiveLocationChipProps) {
  const [location, setLocation] = useState<StoredLiveLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedLocation = loadStoredLiveLocation();
    if (storedLocation) {
      setLocation(storedLocation);
    }

    void refreshLocation();
  }, []);

  async function refreshLocation() {
    setIsLoading(true);

    try {
      const nextLocation = await resolveCurrentLiveLocation(fallbackLabel);
      if (nextLocation) {
        setLocation(nextLocation);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const activeLabel = location?.label ?? fallbackLabel;
  const mapsHref = useMemo(() => {
    if (!location) {
      return null;
    }

    return buildMapsHref(location.latitude, location.longitude);
  }, [location]);

  const locationTitle = location
    ? `Open map at ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
    : "Use live device location";

  if (mapsHref) {
    return (
      <a
        href={mapsHref}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => {
          if (isLoading) {
            event.preventDefault();
          }
        }}
        className={`flex items-center gap-2 text-[15px] font-semibold text-[#0F172A] ${className}`.trim()}
        title={locationTitle}
      >
        <MapPin className="h-5 w-5 shrink-0 fill-[#16A34A] text-[#16A34A]" />
        <span className="truncate">{activeLabel}</span>
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-[#16A34A]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" />
        )}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void refreshLocation()}
      className={`flex items-center gap-2 text-[15px] font-semibold text-[#0F172A] ${className}`.trim()}
      title={locationTitle}
    >
      <MapPin className="h-5 w-5 shrink-0 fill-[#16A34A] text-[#16A34A]" />
      <span className="truncate">{activeLabel}</span>
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-[#16A34A]" />
      ) : (
        <ChevronDown className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
}
