export const CAR_COLORS = {
  slate: "#94a3b8",
  blue: "#3B82F6",
  orange: "#F58025",
  graphite: "#334155",
};

const COLOR_CYCLE = [
  CAR_COLORS.slate,
  CAR_COLORS.blue,
  CAR_COLORS.orange,
  CAR_COLORS.graphite,
];

/**
 * Deterministic color-from-id so each spot keeps the same car color across
 * renders (stable visual lot).
 */
export function getCarColor(spotId) {
  const key = String(spotId ?? "");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return COLOR_CYCLE[Math.abs(hash) % COLOR_CYCLE.length];
}
