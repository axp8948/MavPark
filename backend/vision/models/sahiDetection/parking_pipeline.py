"""
Parking Occupancy Pipeline
==========================
Single script that detects vehicles using SAHI + YOLOv8, computes parking
occupancy based on pre-mapped spots, and visualizes the results.

Usage:
    1. First run annotate_spots.py to create parking_spots.json (one-time setup)
    2. Set configuration below
    3. Run: python parking_pipeline.py

Workflow:
    Video/Image → SAHI Detection → Occupancy Check → Visualization
"""

# ============================================================
# CONFIGURATION - EDIT THIS SECTION
# ============================================================

VIDEO_PATH = "IMG_9798.MOV"              # Input video or image file
PARKING_SPOTS_JSON = "parking_spots.json"  # Pre-mapped parking spots

FRAME_NUMBER = None                     # Frame to extract (None = middle frame)
CONFIDENCE = 0.25                       # Detection confidence (0.0 - 1.0)
SLICE_SIZE = 320                        # SAHI slice size (smaller = better for small objects)
IOA_THRESHOLD = 0.2                     # Intersection-over-area threshold (0.15-0.3 typical)

SAVE_OUTPUTS = True                     # Save detection JSON, occupancy JSON, and annotated image
SHOW_VISUALIZATION = True               # Display result window

# ============================================================
# CODE - NO NEED TO EDIT BELOW
# ============================================================

import cv2
import json
import numpy as np
from pathlib import Path
from sahi import AutoDetectionModel
from sahi.predict import get_sliced_prediction
from shapely.geometry import Polygon, Point
from shapely.errors import GEOSException

VEHICLE_CLASSES = {'car', 'motorcycle', 'bus', 'truck'}

# Colors (BGR)
COLOR_FREE = (0, 255, 0)        # Green
COLOR_OCCUPIED = (0, 0, 255)    # Red
COLOR_VEHICLE = (0, 255, 255)   # Yellow
COLOR_CENTER = (255, 0, 0)      # Blue


# ============================================================
# FRAME EXTRACTION
# ============================================================
def extract_frame(video_path, frame_number=None):
    """Extract a single frame from video or load image directly."""
    path = Path(video_path)
    
    # Check if it's an image file
    if path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp']:
        frame = cv2.imread(str(path))
        if frame is None:
            raise ValueError(f"Cannot load image: {path}")
        print(f"Loaded image: {path.name}")
        return frame
    
    # Handle video file
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {path}")
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    if frame_number is None:
        frame_number = total_frames // 2
    
    print(f"Video: {width}x{height} @ {fps}fps, {total_frames} frames")
    print(f"Extracting frame {frame_number}...")
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        raise ValueError(f"Cannot read frame {frame_number}")
    
    return frame


# ============================================================
# SAHI VEHICLE DETECTION
# ============================================================
def detect_vehicles(frame, confidence=0.25, slice_size=320):
    """Detect vehicles in frame using SAHI + YOLOv8."""
    
    temp_path = "temp_detection_frame.jpg"
    cv2.imwrite(temp_path, frame)
    
    print("Loading SAHI + YOLOv8 model...")
    model = AutoDetectionModel.from_pretrained(
        model_type='yolov8',
        model_path='yolov8n.pt',
        confidence_threshold=confidence,
        device='cpu'
    )
    
    print(f"Running SAHI detection (slice size: {slice_size})...")
    result = get_sliced_prediction(
        temp_path,
        model,
        slice_height=slice_size,
        slice_width=slice_size,
        overlap_height_ratio=0.2,
        overlap_width_ratio=0.2,
    )
    
    Path(temp_path).unlink(missing_ok=True)
    
    vehicles = []
    for pred in result.object_prediction_list:
        if pred.category.name in VEHICLE_CLASSES:
            vehicles.append({
                'class': pred.category.name,
                'confidence': round(pred.score.value, 3),
                'bbox': {
                    'x1': int(pred.bbox.minx),
                    'y1': int(pred.bbox.miny),
                    'x2': int(pred.bbox.maxx),
                    'y2': int(pred.bbox.maxy)
                }
            })
    
    print(f"Detected {len(vehicles)} vehicles")
    return vehicles


# ============================================================
# PARKING SPOT UTILITIES
# ============================================================
def safe_polygon(points):
    """Safely create a valid Shapely polygon."""
    try:
        poly = Polygon(points)
        if not poly.is_valid:
            poly = poly.buffer(0)
        if poly.is_empty or poly.area == 0:
            return None
        return poly
    except GEOSException:
        return None


def load_parking_spots(json_path):
    """Load parking spots from JSON file."""
    with open(json_path, "r") as f:
        data = json.load(f)
    
    spots = []
    skipped = 0
    
    for spot in data["spots"]:
        poly = safe_polygon(spot["points"])
        if poly is None:
            skipped += 1
            continue
        spots.append({
            "id": spot["id"],
            "points": spot["points"],
            "polygon": poly
        })
    
    print(f"Loaded {len(spots)} parking spots (skipped {skipped} invalid)")
    return spots, data


# ============================================================
# OCCUPANCY DETECTION
# ============================================================
def compute_occupancy(parking_spots, vehicles, ioa_threshold=0.2):
    """
    Determine which spots are occupied.
    A spot is occupied if:
      - Vehicle center point is inside the spot, OR
      - Intersection-over-area >= threshold
    """
    # Convert vehicle bboxes to polygons
    vehicle_data = []
    for v in vehicles:
        bbox = v["bbox"]
        x1, y1, x2, y2 = bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]
        
        vehicle_poly = safe_polygon([
            (x1, y1), (x2, y1), (x2, y2), (x1, y2)
        ])
        if vehicle_poly is None:
            continue
        
        vehicle_data.append({
            "class": v.get("class", "unknown"),
            "confidence": v.get("confidence"),
            "center": ((x1 + x2) / 2, (y1 + y2) / 2),
            "polygon": vehicle_poly
        })
    
    # Check each spot
    occupancy = []
    occupied_count = 0
    
    for spot in parking_spots:
        spot_poly = spot["polygon"]
        spot_area = spot_poly.area
        is_occupied = False
        
        for v in vehicle_data:
            # Rule 1: center point inside polygon
            if spot_poly.contains(Point(v["center"])):
                is_occupied = True
                break
            
            # Rule 2: IoA check
            try:
                inter = spot_poly.intersection(v["polygon"])
                if not inter.is_empty:
                    ioa = inter.area / spot_area
                    if ioa >= ioa_threshold:
                        is_occupied = True
                        break
            except GEOSException:
                continue
        
        if is_occupied:
            occupied_count += 1
        
        occupancy.append({
            "spot_id": spot["id"],
            "occupied": is_occupied
        })
    
    print(f"Occupancy: {occupied_count}/{len(parking_spots)} spots occupied")
    return occupancy, occupied_count


# ============================================================
# VISUALIZATION
# ============================================================
def visualize_results(frame, parking_spots, vehicles, occupancy):
    """Draw parking spots, vehicles, and occupancy status on frame."""
    result = frame.copy()
    
    # Create occupancy lookup
    occupancy_map = {o["spot_id"]: o["occupied"] for o in occupancy}
    
    # Draw parking spots
    for spot in parking_spots:
        poly = spot["polygon"]
        pts = np.array(
            [(int(x), int(y)) for x, y in poly.exterior.coords],
            dtype=np.int32
        ).reshape((-1, 1, 2))
        
        is_occupied = occupancy_map.get(spot["id"], False)
        color = COLOR_OCCUPIED if is_occupied else COLOR_FREE
        
        cv2.polylines(result, [pts], True, color, 2)
        
        # Spot ID label
        cx, cy = map(int, poly.centroid.coords[0])
        cv2.putText(result, spot["id"].replace("spot_", ""),
                    (cx - 10, cy), cv2.FONT_HERSHEY_SIMPLEX,
                    0.4, color, 1, cv2.LINE_AA)
    
    # Draw vehicle detections
    for v in vehicles:
        bbox = v["bbox"]
        x1, y1 = bbox["x1"], bbox["y1"]
        x2, y2 = bbox["x2"], bbox["y2"]
        
        cv2.rectangle(result, (x1, y1), (x2, y2), COLOR_VEHICLE, 2)
        
        # Center point
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        cv2.circle(result, (cx, cy), 4, COLOR_CENTER, -1)
    
    # Legend
    y = 30
    cv2.putText(result, "Green: Free", (20, y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, COLOR_FREE, 2)
    cv2.putText(result, "Red: Occupied", (20, y + 28),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, COLOR_OCCUPIED, 2)
    cv2.putText(result, "Yellow: Vehicle", (20, y + 56),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, COLOR_VEHICLE, 2)
    
    return result


# ============================================================
# MAIN PIPELINE
# ============================================================
def main():
    print("=" * 60)
    print("PARKING OCCUPANCY PIPELINE")
    print("=" * 60)
    
    # Validate inputs
    video_path = Path(VIDEO_PATH)
    spots_path = Path(PARKING_SPOTS_JSON)
    
    if not video_path.exists():
        print(f"Error: Video/image not found: {VIDEO_PATH}")
        return
    
    if not spots_path.exists():
        print(f"Error: Parking spots JSON not found: {PARKING_SPOTS_JSON}")
        print("Run annotate_spots.py first to create parking spot annotations.")
        return
    
    # Step 1: Extract frame
    print("\n[1/4] Extracting frame...")
    frame = extract_frame(video_path, FRAME_NUMBER)
    
    # Step 2: Detect vehicles
    print("\n[2/4] Detecting vehicles...")
    vehicles = detect_vehicles(frame, CONFIDENCE, SLICE_SIZE)
    
    # Step 3: Load spots and compute occupancy
    print("\n[3/4] Computing occupancy...")
    parking_spots, spots_data = load_parking_spots(PARKING_SPOTS_JSON)
    occupancy, occupied_count = compute_occupancy(parking_spots, vehicles, IOA_THRESHOLD)
    
    # Step 4: Visualize
    print("\n[4/4] Generating visualization...")
    result_image = visualize_results(frame, parking_spots, vehicles, occupancy)
    
    # Save outputs
    if SAVE_OUTPUTS:
        stem = video_path.stem
        
        # Save detection JSON
        detection_output = {
            'source': str(video_path),
            'frame': FRAME_NUMBER or "middle",
            'total_vehicles': len(vehicles),
            'vehicles': vehicles
        }
        with open(f"detections_{stem}.json", 'w') as f:
            json.dump(detection_output, f, indent=2)
        
        # Save occupancy JSON
        occupancy_output = {
            "image_path": spots_data.get("image_path"),
            "image_width": spots_data.get("image_width"),
            "image_height": spots_data.get("image_height"),
            "total_spots": len(parking_spots),
            "occupied_spots": occupied_count,
            "free_spots": len(parking_spots) - occupied_count,
            "occupancy": occupancy
        }
        with open(f"occupancy_{stem}.json", 'w') as f:
            json.dump(occupancy_output, f, indent=2)
        
        # Save annotated image
        cv2.imwrite(f"result_{stem}.jpg", result_image)
        
        print(f"\nSaved: detections_{stem}.json")
        print(f"Saved: occupancy_{stem}.json")
        print(f"Saved: result_{stem}.jpg")
    
    # Print summary
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"Vehicles detected : {len(vehicles)}")
    print(f"Total spots       : {len(parking_spots)}")
    print(f"Occupied spots    : {occupied_count}")
    print(f"Free spots        : {len(parking_spots) - occupied_count}")
    print("=" * 60)
    
    # Show visualization
    if SHOW_VISUALIZATION:
        cv2.namedWindow("Parking Occupancy", cv2.WINDOW_NORMAL)
        cv2.imshow("Parking Occupancy", result_image)
        print("\nPress any key to close...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()


if __name__ == '__main__':
    main()
