// Location Picker component for selecting property location
"use client";

import * as React from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number } | null) => void;
  className?: string;
}

// Nairobi coordinates
const NAIROBI_CENTER: [number, number] = [-1.2921, 36.8219];

export function LocationPicker({
  value,
  onChange,
  className,
}: LocationPickerProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [MapComponents, setMapComponents] = React.useState<{
    MapContainer: React.ComponentType<Record<string, unknown>>;
    TileLayer: React.ComponentType<Record<string, unknown>>;
    Marker: React.ComponentType<Record<string, unknown>>;
    useMapEvents: (handlers: Record<string, unknown>) => unknown;
  } | null>(null);
  const [position, setPosition] = React.useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState("");

  React.useEffect(() => {
    setIsMounted(true);

    // Dynamically import Leaflet components
    Promise.all([import("react-leaflet"), import("leaflet")]).then(
      ([reactLeaflet, L]) => {
        // Fix Leaflet icon issue
        delete (
          L.default.Icon.Default.prototype as { _getIconUrl?: () => string }
        )._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        setMapComponents({
          MapContainer:
            reactLeaflet.MapContainer as unknown as React.ComponentType<
              Record<string, unknown>
            >,
          TileLayer: reactLeaflet.TileLayer as unknown as React.ComponentType<
            Record<string, unknown>
          >,
          Marker: reactLeaflet.Marker as unknown as React.ComponentType<
            Record<string, unknown>
          >,
          useMapEvents: reactLeaflet.useMapEvents,
        });
      }
    );

    // Import CSS dynamically
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  const handlePositionChange = (pos: [number, number]) => {
    setPosition(pos);
    onChange({ lat: pos[0], lng: pos[1] });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const query = `${searchQuery}, Kenya`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );

      if (!res.ok) throw new Error("Search failed");

      const results = await res.json();

      if (results.length === 0) {
        setSearchError("Location not found. Try a different search term.");
        return;
      }

      const { lat, lon } = results[0];
      const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
      handlePositionChange(newPos);
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearLocation = () => {
    setPosition(null);
    onChange(null);
  };

  if (!isMounted || !MapComponents) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ minHeight: "300px" }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker } = MapComponents;

  // Inner component for map click handling
  function LocationMarkerInner() {
    MapComponents?.useMapEvents({
      click(e: { latlng: { lat: number; lng: number } }) {
        handlePositionChange([e.latlng.lat, e.latlng.lng]);
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="mb-3 flex gap-2">
        <Input
          placeholder="Search location (e.g., Westlands, Nairobi)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button type="button" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {searchError && (
        <p className="mb-2 text-sm text-red-600">{searchError}</p>
      )}

      {/* Map */}
      <div
        className="relative overflow-hidden rounded-lg border border-gray-200"
        style={{ height: "300px" }}
      >
        <MapContainer
          center={position || NAIROBI_CENTER}
          zoom={position ? 15 : 12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarkerInner />
        </MapContainer>
      </div>

      {/* Instructions and Clear */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <MapPin className="mr-1 inline h-3 w-3" />
          Click on the map to set the exact location
        </p>
        {position && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearLocation}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Selected Coordinates */}
      {position && (
        <p className="mt-1 text-xs text-gray-400">
          Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}
    </div>
  );
}

