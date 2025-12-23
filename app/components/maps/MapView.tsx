/**
 * Map View Component
 * 
 * A reusable map component using Leaflet to display property locations on a map.
 * Supports both single marker display and multiple markers with click handlers.
 * 
 * NOTE: This component uses dynamic imports with `next/dynamic` to avoid SSR 
 * issues since Leaflet requires the browser's window object. The map will
 * show a loading state during server-side rendering.
 * 
 * @example Single marker (property detail page)
 * <MapView center={[-1.29, 36.82]} singleMarker />
 * 
 * @example Multiple markers (search results)
 * <MapView markers={properties} onMarkerClick={(id) => selectProperty(id)} />
 */
"use client";

import * as React from "react";
import dynamic from "next/dynamic";

/**
 * Dynamic imports for Leaflet components
 * SSR is disabled because Leaflet requires the window object
 */
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Import Leaflet CSS for proper map styling
import "leaflet/dist/leaflet.css";

/** Map marker data structure */
interface MapMarker {
  /** Unique identifier for the marker */
  id: string;
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
  /** Display title in popup */
  title: string;
  /** Optional price to display in popup (in KES) */
  price?: number;
}

interface MapViewProps {
  /** Map center coordinates [lat, lng]. Defaults to Nairobi center. */
  center?: [number, number];
  /** Initial zoom level (1-18). Defaults to 12. */
  zoom?: number;
  /** Array of markers to display on the map */
  markers?: MapMarker[];
  /** Callback when a marker is clicked */
  onMarkerClick?: (id: string) => void;
  /** Additional CSS classes for the map container */
  className?: string;
  /** If true, shows a single marker at the center position (for property details) */
  singleMarker?: boolean;
}

// Default center: Nairobi Central Business District
const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219];
const DEFAULT_ZOOM = 12;

export function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  onMarkerClick,
  className,
  singleMarker = false,
}: MapViewProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);

    /**
     * Fix Leaflet default icon issue
     * Leaflet's default icon URLs are broken when bundled with webpack.
     * We need to manually configure the icon URLs.
     */
    import("leaflet").then((L) => {
      delete (L.default.Icon.Default.prototype as { _getIconUrl?: () => string })
        ._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    });
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`h-full w-full min-h-[300px] ${className || ""}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {singleMarker && center[0] !== DEFAULT_CENTER[0] && (
        <Marker position={center}>
          <Popup>Property Location</Popup>
        </Marker>
      )}

      {!singleMarker &&
        markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            eventHandlers={{
              click: () => onMarkerClick?.(marker.id),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{marker.title}</p>
                {marker.price && (
                  <p className="text-teal-600">
                    KES {marker.price.toLocaleString()}/mo
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}



