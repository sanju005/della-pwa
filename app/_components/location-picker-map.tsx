"use client";

import { useEffect } from "react";
import { divIcon, type LatLngExpression } from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type LocationPickerMapProps = {
  latitude: number;
  longitude: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
};

const pinIcon = divIcon({
  className: "",
  html: `
    <div style="position: relative; width: 28px; height: 28px;">
      <div style="position:absolute; inset:0; border-radius:9999px; background:#16a34a; border:3px solid white; box-shadow:0 10px 24px rgba(22,163,74,0.28);"></div>
      <div style="position:absolute; left:50%; top:22px; width:2px; height:16px; background:#16a34a; transform:translateX(-50%); border-radius:9999px;"></div>
    </div>
  `,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
});

function RecenterMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom(), 16), {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

function MapEvents({
  onChange,
}: {
  onChange: (coords: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
}: LocationPickerMapProps) {
  const center: LatLngExpression = [latitude, longitude];

  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap latitude={latitude} longitude={longitude} />
      <MapEvents onChange={onChange} />
      <Marker
        draggable
        position={center}
        icon={pinIcon}
        eventHandlers={{
          dragend(event) {
            const marker = event.target;
            const next = marker.getLatLng();
            onChange({
              latitude: next.lat,
              longitude: next.lng,
            });
          },
        }}
      />
    </MapContainer>
  );
}
