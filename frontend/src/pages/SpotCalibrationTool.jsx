import React, { useState, useRef, useCallback, useEffect } from 'react';
import lotConfigs from '../data/lotConfigs';

// Overlay bounds and image dimensions per lot
const LOT_META = {
  1: {
    label: 'F-12 (Lot A)',
    image: '/f12-overlay.png',
    bounds: { north: 32.733611, south: 32.732686, east: -97.111062, west: -97.112063 },
    imgW: 733,
    imgH: 731,
    idOffset: 400,
    totalSpots: 273,
  },
  2: {
    label: 'F-10 (Lot B)',
    image: '/f10-overlay.png',
    bounds: { north: 32.728389, south: 32.727119, east: -97.109986, west: -97.110986 },
    imgW: 1196,
    imgH: 1674,
    idOffset: 700,
    totalSpots: 0, // will grow as user clicks
  },
};

// Convert pixel (x, y) relative to image top-left to lat/lng
function pixelToLatLng(px, py, imgW, imgH, bounds) {
  const lat = bounds.north - (py / imgH) * (bounds.north - bounds.south);
  const lng = bounds.west + (px / imgW) * (bounds.east - bounds.west);
  return { lat: parseFloat(lat.toFixed(10)), lng: parseFloat(lng.toFixed(10)) };
}

// Generate JS output for spotCoordinates
function generateOutput(spots, idOffset) {
  if (spots.length === 0) return '// No spots calibrated yet';
  const lines = spots.map(({ spotId, lat, lng }) =>
    `  "${spotId}": { lat: ${lat}, lng: ${lng} },`
  );
  return `export const spotCoordinates = {\n${lines.join('\n')}\n};`;
}

export default function SpotCalibrationTool() {
  const [lotId, setLotId] = useState(1);
  const [spots, setSpots] = useState([]);
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const meta = LOT_META[lotId];

  // Reset spots when switching lot
  useEffect(() => {
    setSpots([]);
  }, [lotId]);

  // Load saved spots from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`calibration_lot_${lotId}`);
    if (saved) {
      try { setSpots(JSON.parse(saved)); } catch {}
    } else {
      setSpots([]);
    }
  }, [lotId]);

  // Persist to localStorage on every change
  useEffect(() => {
    if (spots.length > 0) {
      localStorage.setItem(`calibration_lot_${lotId}`, JSON.stringify(spots));
    }
  }, [spots, lotId]);

  const handleImageClick = useCallback((e) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();

    // Click position relative to the displayed image
    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;

    // Map back to original image pixel coords
    const pixelX = (displayX / rect.width) * meta.imgW;
    const pixelY = (displayY / rect.height) * meta.imgH;

    const { lat, lng } = pixelToLatLng(pixelX, pixelY, meta.imgW, meta.imgH, meta.bounds);
    const spotId = meta.idOffset + spots.length + 1;

    setSpots((prev) => [
      ...prev,
      { spotId: spotId.toString(), lat, lng, px: displayX, py: displayY, rectW: rect.width, rectH: rect.height },
    ]);
  }, [meta, spots.length]);

  const undoLast = () => setSpots((prev) => prev.slice(0, -1));
  const resetAll = () => {
    if (window.confirm('Clear all calibrated spots for this lot?')) {
      setSpots([]);
      localStorage.removeItem(`calibration_lot_${lotId}`);
    }
  };

  const copyOutput = () => {
    const output = generateOutput(spots, meta.idOffset);
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const nextSpotId = meta.idOffset + spots.length + 1;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="font-bold text-blue-400 text-lg">Spot Calibration Tool</span>

        {/* Lot selector */}
        <select
          value={lotId}
          onChange={(e) => setLotId(Number(e.target.value))}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
        >
          {Object.entries(LOT_META).map(([id, m]) => (
            <option key={id} value={id}>{m.label}</option>
          ))}
        </select>

        {/* Scale */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Zoom:</span>
          {[0.5, 0.75, 1, 1.25, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-2 py-1 rounded ${scale === s ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-400">
            Spots: <span className="text-white font-bold">{spots.length}</span>
            {meta.totalSpots > 0 && <span className="text-gray-500"> / {meta.totalSpots}</span>}
          </span>
          <span className="text-sm text-yellow-400">Next ID: {nextSpotId}</span>
          <button onClick={undoLast} disabled={spots.length === 0}
            className="px-3 py-1 rounded bg-yellow-700 hover:bg-yellow-600 disabled:opacity-40 text-sm">
            Undo
          </button>
          <button onClick={resetAll} disabled={spots.length === 0}
            className="px-3 py-1 rounded bg-red-800 hover:bg-red-700 disabled:opacity-40 text-sm">
            Reset
          </button>
          <button onClick={copyOutput} disabled={spots.length === 0}
            className="px-3 py-1 rounded bg-green-700 hover:bg-green-600 disabled:opacity-40 text-sm">
            {copied ? '✓ Copied!' : 'Copy Output'}
          </button>
          <button onClick={() => setShowHelp((h) => !h)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">
            {showHelp ? 'Hide Help' : 'Help'}
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-blue-950 border-b border-blue-800 px-4 py-3 text-sm text-blue-200 space-y-1">
          <p>1. Select the parking lot above.</p>
          <p>2. Click on each parking spot center in the image below. Spots are numbered automatically starting from ID {meta.idOffset + 1}.</p>
          <p>3. Use <strong>Undo</strong> to remove the last click. Use <strong>Reset</strong> to start over.</p>
          <p>4. When done, click <strong>Copy Output</strong> to copy the generated JS. Paste it into <code>src/data/spotCoordinates.js</code>.</p>
          <p className="text-yellow-300">Progress is saved in browser localStorage — you can refresh and continue.</p>
        </div>
      )}

      <div className="flex gap-0 h-[calc(100vh-60px)]">
        {/* Image panel */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-800 relative" style={{ cursor: 'crosshair' }}>
          <div className="relative inline-block">
            <img
              ref={imgRef}
              src={meta.image}
              alt="Parking lot overlay"
              onClick={handleImageClick}
              style={{
                width: meta.imgW * scale,
                height: meta.imgH * scale,
                display: 'block',
                userSelect: 'none',
              }}
              draggable={false}
            />
            {/* Render placed markers */}
            {spots.map((s, i) => {
              // Rescale stored display coords based on current scale vs stored scale
              const scaledX = (s.px / s.rectW) * (meta.imgW * scale);
              const scaledY = (s.py / s.rectH) * (meta.imgH * scale);
              return (
                <div
                  key={s.spotId}
                  title={`Spot ${s.spotId}: lat=${s.lat}, lng=${s.lng}`}
                  style={{
                    position: 'absolute',
                    left: scaledX,
                    top: scaledY,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: i === spots.length - 1 ? '#facc15' : '#22c55e',
                    border: '1.5px solid white',
                    boxShadow: '0 0 3px rgba(0,0,0,0.8)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 8,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '0 2px',
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                  }}>
                    {s.spotId}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Output panel */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          <div className="px-3 py-2 border-b border-gray-700 text-sm font-semibold text-gray-300">
            Generated Output ({spots.length} spots)
          </div>
          <pre className="flex-1 overflow-auto text-xs text-green-400 p-3 font-mono leading-5 whitespace-pre-wrap break-all">
            {generateOutput(spots, meta.idOffset)}
          </pre>
          <div className="px-3 py-2 border-t border-gray-700">
            <button onClick={copyOutput} disabled={spots.length === 0}
              className="w-full py-2 rounded bg-green-700 hover:bg-green-600 disabled:opacity-40 text-sm font-semibold">
              {copied ? '✓ Copied to Clipboard!' : 'Copy to Clipboard'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Paste into <code className="text-gray-400">src/data/spotCoordinates.js</code> replacing the <code className="text-gray-400">spotCoordinates</code> export.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
