

"""
Real-Time Parking Occupancy (CENTER-ONLY LOGIC)
==============================================
A parking spot is occupied IF AND ONLY IF
a vehicle center (blue dot) lies inside the polygon ROI.

- SAHI + YOLOv8 detection
- Center-based occupancy
- Live visualization
- Backend updates
- Rolling occupancy_live.json
"""

# ============================================================
# CONFIGURATION
# ============================================================


TEMP_IMAGE_PATH = "../cameraCapture/temp_frames/frame_1771619669.jpg"

VIDEO_PATH = "IMG_9798.MOV"
PARKING_SPOTS_JSON = "parking_spots_9798.json"
LOT_NAME = "Lot A"

CONFIDENCE = 0.25
SLICE_SIZE = 320

SEND_INTERVAL = 20          # seconds
WRITE_JSON = True
SHOW_VISUALIZATION = True

OCCUPANCY_JSON = "occupancy_IMG_9798.json"

# ============================================================
# IMPORTS
# ============================================================

import cv2
import json
import time
import numpy as np
from pathlib import Path
from shapely.geometry import Polygon, Point
from shapely.errors import GEOSException
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction
from send_data import send_to_backend

VEHICLE_CLASSES = {"car", "motorcycle", "bus", "truck"}

COLOR_FREE = (0, 255, 0)
COLOR_OCCUPIED = (0, 0, 255)
COLOR_VEHICLE = (0, 255, 255)
COLOR_CENTER = (255, 0, 0)

# ============================================================
# UTILITIES
# ============================================================

def safe_polygon(points):
    try:
        poly = Polygon(points)
        if not poly.is_valid:
            poly = poly.buffer(0)
        if poly.is_empty or poly.area == 0:
            return None
        return poly
    except GEOSException:
        return None


def load_and_scale_spots(json_path, frame_w, frame_h):
    with open(json_path, "r") as f:
        data = json.load(f)

    img_w = data["image_width"]
    img_h = data["image_height"]

    sx = frame_w / img_w
    sy = frame_h / img_h

    spots = []
    for s in data["spots"]:
        scaled = [(x * sx, y * sy) for x, y in s["points"]]
        poly = safe_polygon(scaled)
        if poly:
            spots.append({
                "id": s["id"],
                "polygon": poly
            })

    print(f"Loaded {len(spots)} spots | scaled {img_w}x{img_h} → {frame_w}x{frame_h}")
    return spots


# ============================================================
# SAHI VEHICLE DETECTION
# ============================================================

def detect_vehicles(frame, model):
    h, w = frame.shape[:2]

    temp_img = "temp_sahi_frame.jpg"
    cv2.imwrite(temp_img, frame)

    result = get_sliced_prediction(
        temp_img,
        model,
        slice_height=SLICE_SIZE,
        slice_width=SLICE_SIZE,
        overlap_height_ratio=0.2,
        overlap_width_ratio=0.2
    )

    Path(temp_img).unlink(missing_ok=True)

    vehicles = []
    for pred in result.object_prediction_list:
        if pred.category.name not in VEHICLE_CLASSES:
            continue

        x1, y1, x2, y2 = map(int, [
            pred.bbox.minx,
            pred.bbox.miny,
            pred.bbox.maxx,
            pred.bbox.maxy
        ])

        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2

        vehicles.append({
            "bbox": (x1, y1, x2, y2),
            "center": (cx, cy)
        })

    return vehicles


# ============================================================
# OCCUPANCY (CENTER-ONLY)
# ============================================================

def compute_occupancy(spots, vehicles):
    status = {s["id"]: "free" for s in spots}

    for v in vehicles:
        pt = Point(v["center"])

        for s in spots:
            # covers() handles boundary cases better than contains()
            if s["polygon"].covers(pt):
                status[s["id"]] = "occupied"
                break

    spot_status_list = [
        {"spotId": str(int(k.split("_")[1])), "status": v}
        for k, v in status.items()
    ]

    total = len(spot_status_list)
    free = sum(1 for s in spot_status_list if s["status"] == "free")
    occupied = total - free

    return total, free, occupied, spot_status_list


# ============================================================
# VISUALIZATION
# ============================================================

def visualize(frame, spots, vehicles, spot_status_list):
    img = frame.copy()
    occ_map = {s["spotId"]: s["status"] for s in spot_status_list}

    for s in spots:
        pts = np.array(s["polygon"].exterior.coords, dtype=np.int32)
        key = str(int(s["id"].split("_")[1]))
        color = COLOR_OCCUPIED if occ_map.get(key) == "occupied" else COLOR_FREE
        cv2.polylines(img, [pts], True, color, 2)

    # Draw vehicles
    for v in vehicles:
        x1,y1,x2,y2 = v["bbox"]
        cx,cy = map(int, v["center"])
        cv2.rectangle(img, (x1,y1), (x2,y2), COLOR_VEHICLE, 2)
        cv2.circle(img, (cx,cy), 4, COLOR_CENTER, -1)

    return img


# ============================================================
# MAIN LOOP
# ============================================================

def main():
    print("=" * 60)
    print("REAL-TIME SAHI PARKING (CENTER-ONLY)")
    print("=" * 60)

    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        raise RuntimeError("Cannot open video")

    ret, first_frame = cap.read()
    if not ret:
        raise RuntimeError("Cannot read video")

    h, w = first_frame.shape[:2]
    spots = load_and_scale_spots(PARKING_SPOTS_JSON, w, h)

    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    print("Loading YOLOv8 model...")
    model = AutoDetectionModel.from_pretrained(
        model_type="yolov8",
        model_path="yolov8n.pt",
        confidence_threshold=CONFIDENCE,
        device="cpu"   # change to "cuda" if available
    )

    last_sent = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        now = time.time()
        if now - last_sent < SEND_INTERVAL:
            if SHOW_VISUALIZATION:
                cv2.imshow("Parking (SAHI Center-Only)", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
            continue

        vehicles = detect_vehicles(frame, model)

        total, free, occupied, spot_status_list = compute_occupancy(
            spots, vehicles
        )

        # --- BACKEND UPDATE ---
        send_to_backend(
            LOT_NAME,
            total,
            free,
            occupied,
            spot_status_list
        )

        # --- WRITE LIVE OCCUPANCY JSON ---
        if WRITE_JSON:
            with open(OCCUPANCY_JSON, "w") as f:
                json.dump({
                    "parkingLotName": LOT_NAME,
                    "totalSpots": total,
                    "freeSpots": free,
                    "occupiedSpots": occupied,
                    "spots": spot_status_list,
                    "timestamp": now
                }, f, indent=2)

        print(f"Update → Free: {free}, Occupied: {occupied}")

        last_sent = now

        if SHOW_VISUALIZATION:
            vis = visualize(frame, spots, vehicles, spot_status_list)
            cv2.imshow("Parking (SAHI Center-Only)", vis)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
