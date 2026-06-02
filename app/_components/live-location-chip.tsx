"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  LoaderCircle,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";

import {
  loadStoredLiveLocation,
  resolveCurrentLiveLocation,
  saveStoredLiveLocation,
  type StoredLiveLocation,
} from "@/lib/live-location";

type SearchResult = {
  id: number;
  label: string;
  latitude: number;
  longitude: number;
};

type ReverseGeocodeResponse = {
  label: string;
};

type SearchResponse = {
  results: SearchResult[];
};

type LiveLocationChipProps = {
  fallbackLabel: string;
  className?: string;
  onLocationChange?: (location: StoredLiveLocation) => void;
};

const DynamicLocationPickerMap = dynamic(
  () =>
    import("./location-picker-map").then((module) => ({
      default: module.LocationPickerMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#eef9f0] text-[13px] font-semibold text-[#4b5563]">
        Loading map...
      </div>
    ),
  }
);

export function LiveLocationChip({
  fallbackLabel,
  className = "",
  onLocationChange,
}: LiveLocationChipProps) {
  const [location, setLocation] = useState<StoredLiveLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
        onLocationChange?.(nextLocation);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const activeLabel = location?.label ?? fallbackLabel;
  const locationTitle = location
    ? `Saved at ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
    : "Pick your location on the map";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
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

      {isPickerOpen ? (
        <LocationPickerModal
          fallbackLabel={fallbackLabel}
          initialLocation={location}
          onClose={() => setIsPickerOpen(false)}
          onSave={(nextLocation) => {
            setLocation(nextLocation);
            onLocationChange?.(nextLocation);
            setIsPickerOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function LocationPickerModal({
  fallbackLabel,
  initialLocation,
  onClose,
  onSave,
}: {
  fallbackLabel: string;
  initialLocation: StoredLiveLocation | null;
  onClose: () => void;
  onSave: (location: StoredLiveLocation) => void;
}) {
  const [query, setQuery] = useState(initialLocation?.label ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [coords, setCoords] = useState(() => ({
    latitude: initialLocation?.latitude ?? 3.1274,
    longitude: initialLocation?.longitude ?? 101.7452,
  }));
  const [selectedLabel, setSelectedLabel] = useState(
    initialLocation?.label ?? fallbackLabel
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);

      void fetch(`/api/location/search?q=${encodeURIComponent(trimmedQuery)}`, {
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Search failed");
          }

          return (await response.json()) as SearchResponse;
        })
        .then((data) => {
          setResults(data.results);
        })
        .catch(() => {
          setResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  async function updateLabelFromCoords(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `/api/location/reverse?lat=${latitude}&lng=${longitude}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Reverse geocode failed");
      }

      const data = (await response.json()) as ReverseGeocodeResponse;
      const nextLabel = data.label || fallbackLabel;
      setSelectedLabel(nextLabel);
      setQuery(nextLabel);
    } catch {
      setSelectedLabel(fallbackLabel);
    }
  }

  const handleMapChange = (nextCoords: {
    latitude: number;
    longitude: number;
  }) => {
    setCoords(nextCoords);
    void updateLabelFromCoords(nextCoords.latitude, nextCoords.longitude);
  };

  const handlePickCurrentLocation = () => {
    setIsSaving(true);

    void resolveCurrentLiveLocation(fallbackLabel)
      .then((nextLocation) => {
        if (!nextLocation) {
          return;
        }

        setCoords({
          latitude: nextLocation.latitude,
          longitude: nextLocation.longitude,
        });
        setSelectedLabel(nextLocation.label);
        setQuery(nextLocation.label);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleSave = () => {
    const nextLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      label: selectedLabel || fallbackLabel,
      updatedAt: new Date().toISOString(),
    };

    saveStoredLiveLocation(nextLocation);
    onSave(nextLocation);
  };

  const helperText = useMemo(
    () =>
      `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
    [coords.latitude, coords.longitude]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-[#0f172a]/50 sm:items-center sm:justify-center">
      <div className="flex h-[88dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-10px_30px_rgba(15,23,42,0.2)] sm:h-[46rem] sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-[#edf1ef] px-5 py-4">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#111827]">
              Choose your location
            </h2>
            <p className="mt-1 text-[13px] text-[#4b5563]">
              Search, tap the map, or drag the pin to adjust.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f7f6] text-[#475467]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center gap-3 rounded-[18px] border border-[#dfe7e2] px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <Search className="h-5 w-5 shrink-0 text-[#16A34A]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search area, street, or address"
              className="w-full border-0 bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#667085]"
            />
            {isSearching ? (
              <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-[#16A34A]" />
            ) : null}
          </div>

          {results.length > 0 ? (
            <div className="mt-3 overflow-hidden rounded-[18px] border border-[#e4ece7] bg-white">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => {
                    setCoords({
                      latitude: result.latitude,
                      longitude: result.longitude,
                    });
                    setSelectedLabel(result.label);
                    setQuery(result.label);
                    setResults([]);
                  }}
                  className={`w-full px-4 py-3 text-left ${
                    index > 0 ? "border-t border-[#edf1ef]" : ""
                  }`}
                >
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {result.label}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="px-5">
          <div className="overflow-hidden rounded-[24px] border border-[#dcecdf]">
            <div className="h-[22rem] w-full bg-[#eef9f0]">
              <DynamicLocationPickerMap
                latitude={coords.latitude}
                longitude={coords.longitude}
                onChange={handleMapChange}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 px-5 pb-5">
          <div className="rounded-[18px] bg-[#f8fcf9] p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f9ec] text-[#16a34a]">
                <Navigation className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-extrabold text-[#111827]">
                  {selectedLabel || fallbackLabel}
                </p>
                <p className="mt-1 text-[12px] text-[#6b7280]">{helperText}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handlePickCurrentLocation}
                disabled={isSaving}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[12px] border border-[#dcecdf] bg-white px-4 text-[14px] font-extrabold text-[#111827] disabled:opacity-70"
              >
                {isSaving ? "Locating..." : "Use Current Location"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[12px] bg-[#16a34a] px-4 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(22,163,74,0.18)]"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
