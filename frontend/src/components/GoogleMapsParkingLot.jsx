import React, { useCallback, useState, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  GroundOverlay,
  OverlayView,
} from "@react-google-maps/api";
import TopDownCar from "./TopDownCar";
import { getCarColor } from "./carColors";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "12px",
};

const DEFAULT_CENTER = {
  lat: 32.733149,
  lng: -97.111563,
};

const LEGEND_COLORS = {
  available: "#22c55e",
  occupied: "#ef4444",
  reserved: "#a855f7",
  noData: "#F58025",
};

const FORWARD_SHIFT_PX = 12; // tweak until it lines up with the Figma stalls
const centerOffset = (w, h) => ({ x: -w / 2 - FORWARD_SHIFT_PX, y: -h / 2 });

// Pick a size in px for a spot marker based on current map zoom.
// At zoom 19 the overlay reads at roughly a stall-per-spot scale; above that
// the cars grow so they still fill the stall painted by the Figma overlay.
function sizeForZoom(zoom) {
  const raw = 24 + (zoom - 19) * 12;
  return Math.max(12, Math.min(64, raw));
}

const GoogleMapsParkingLot = ({
  spots,
  spotCoordinates,
  lotName,
  onSpotClick,
  center = DEFAULT_CENTER,
  overlayBounds,
  overlayImage,
  zoom = 19,
  carRotation = -125,
}) => {
  const [, setMap] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback(
    (m) => {
      setMap(m);
      setCurrentZoom(m.getZoom() ?? zoom);
    },
    [zoom],
  );

  const onUnmount = useCallback(() => setMap(null), []);
  const onZoomChanged = useCallback(function onZoomChangedHandler() {
    if (this && typeof this.getZoom === "function") {
      setCurrentZoom(this.getZoom() ?? 19);
    }
  }, []);

  const stats = useMemo(
    () =>
      (spots || []).reduce(
        (acc, spot) => {
          if (spot.status === "available" || spot.status === "free")
            acc.available++;
          else if (spot.status === "occupied") acc.occupied++;
          else if (spot.status === "reserved") acc.reserved++;
          else acc.noData++;
          return acc;
        },
        { available: 0, occupied: 0, reserved: 0, noData: 0 },
      ),
    [spots],
  );

  if (loadError) {
    return <div className="text-red-400">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 rounded-xl border border-white/10 bg-[#0B1A2E]/70 text-white/80">
        Loading Map...
      </div>
    );
  }

  const carSize = sizeForZoom(currentZoom);
  // const slotSize = Math.max(8, Math.round(carSize * 0.65));

  const slotWidth  = Math.round(carSize * 0.45);
  const slotHeight = Math.round(carSize * 0.9);

  return (
    <div className="relative">
      {/* Legend — dark UTA card */}
      <div className="absolute top-4 right-4 z-10 min-w-[220px] rounded-xl border border-white/10 bg-[#0B1A2E]/90 p-4 text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur">
        <h3 className="text-base font-bold">{lotName || "Parking Lot"}</h3>
        <p className="mt-0.5 text-xs italic text-[color:var(--uta-orange-soft)]">
          This lot requires a permit
        </p>

        <div className="mt-3 space-y-2 text-sm">
          <LegendRow color={LEGEND_COLORS.available} label="Available" value={stats.available} />
          <LegendRow color={LEGEND_COLORS.occupied} label="Occupied" value={stats.occupied} />
          <LegendRow color={LEGEND_COLORS.reserved} label="Reserved" value={stats.reserved} />
          <LegendRow color={LEGEND_COLORS.noData} label="No Data" value={stats.noData} />
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onZoomChanged={onZoomChanged}
        mapTypeId="hybrid"
        options={{
          mapTypeControl: true,
          mapTypeControlOptions: {
            mapTypeIds: ["roadmap", "satellite", "hybrid"],
          },
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          tilt: 0,
        }}
      >
        {overlayImage && overlayBounds && (
          <GroundOverlay
            url={overlayImage}
            bounds={overlayBounds}
            opacity={0.85}
          />
        )}

        {(spots || []).map((spot) => {
          const coords =
            spotCoordinates[spot.id] || spotCoordinates[spot.number];
          if (!coords) return null;

          let position;
          if (Array.isArray(coords)) {
            const avgLat =
              coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
            const avgLng =
              coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
            position = { lat: avgLat, lng: avgLng };
          } else if (coords.lat !== undefined && coords.lng !== undefined) {
            position = { lat: coords.lat, lng: coords.lng };
          } else {
            return null;
          }

          return (
            <OverlayView
              key={spot.id || spot.number}
              position={position}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={centerOffset}
            >
              <SpotMarker
                spot={spot}
                carSize={carSize}
                slotWidth={slotWidth}
                slotHeight={slotHeight}
                rotation={carRotation}
                onClick={() => onSpotClick && onSpotClick(spot)}
              />
            </OverlayView>
          );
        })}
      </GoogleMap>
    </div>
  );
};

function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block h-3.5 w-3.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-white/85">
        {label}: <span className="text-white">{value}</span>
      </span>
    </div>
  );
}

function SpotMarker({ spot, carSize, slotWidth, slotHeight, rotation, onClick }) {
  const status = spot.status;
  const label = `Spot ${spot.number ?? spot.id} — ${status}`;

  if (status === "occupied") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className="block cursor-pointer border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--uta-orange)] rounded-md"
        style={{ width: carSize, height: carSize, lineHeight: 0 }}
      >
        <TopDownCar
          color={getCarColor(spot.id || spot.number)}
          size={carSize}
          rotation={rotation}
          ariaLabel={label}
        />
      </button>
    );
  }

  // Non-car statuses: render a small colored slot chip
  const tint =
    status === "available" || status === "free"
      ? LEGEND_COLORS.available
      : status === "reserved"
        ? LEGEND_COLORS.reserved
        : LEGEND_COLORS.noData;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="block cursor-pointer rounded-[3px] border p-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      style={{
        width: slotWidth,
        height: slotHeight,
        backgroundColor: `${tint}33`, // ~20% fill
        borderColor: tint,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
      }}
    />
  );
}

export default GoogleMapsParkingLot;
