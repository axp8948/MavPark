"""
Live Parking Occupancy Visualization
====================================
Continuously plays video and overlays the latest
parking occupancy state from a rolling JSON file.
"""

# ============================================================
# CONFIG
# ============================================================

VIDEO_PATH = "IMG_9798.MOV"
PARKING_SPOTS_JSON = "parking_spots_9798.json"
OCCUPANCY_JSON = "occupancy_IMG_9798.json"

REFRESH_JSON_EVERY = 1.0   # seconds
WINDOW_NAME = "Live Parking Occupancy"

# ============================================================
# IMPORTS
# ============================================================

import cv2
import json
import time
import numpy as np
from shapely.geometry import Polygon

COLOR_FREE = (0, 255, 0)
COLOR_OCCUPIED = (0, 0, 255)

# ============================================================
# LOAD PARKING SPOTS (POLYGONS)
# ============================================================

def load_spots(json_path):
    with open(json_path, "r") as f:
        data = json.load(f)

    spots = []
    for s in data["spots"]:
        spots.append({
            "id": s["id"],
            "polygon": Polygon(s["points"])
        })

    return spots

# ============================================================
# LOAD OCCUPANCY STATE
# ============================================================

def load_occupancy(json_path):
    try:
        with open(json_path, "r") as f:
            data = json.load(f)
        return {s["spotId"]: s["status"] for s in data["spots"]}
    except Exception:
        return None

# ============================================================
# MAIN VISUALIZATION LOOP
# ============================================================

def main():
    print("=" * 50)
    print("LIVE PARKING VISUALIZATION")
    print("=" * 50)

    spots = load_spots(PARKING_SPOTS_JSON)
    cap = cv2.VideoCapture(VIDEO_PATH)

    if not cap.isOpened():
        raise RuntimeError("Cannot open video")

    last_json_load = 0
    occupancy_map = {}

    cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)

    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        now = time.time()

        # Reload occupancy JSON periodically
        if now - last_json_load >= REFRESH_JSON_EVERY:
            occ = load_occupancy(OCCUPANCY_JSON)
            if occ is not None:
                occupancy_map = occ
            last_json_load = now

        vis = frame.copy()

        # Draw parking spots
        for spot in spots:
            pts = np.array(spot["polygon"].exterior.coords, dtype=np.int32)

            status = occupancy_map.get(spot["id"], "free")
            color = COLOR_OCCUPIED if status == "occupied" else COLOR_FREE

            cv2.polylines(vis, [pts], True, color, 2)

        cv2.imshow(WINDOW_NAME, vis)

        if cv2.waitKey(30) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
