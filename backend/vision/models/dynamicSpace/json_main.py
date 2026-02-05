import cv2
import json
import numpy as np
import time
import cvzone
from send_data import send_to_backend

# ==========================
# CONFIG
# ==========================
VIDEO_PATH = "carPark.MOV"
SPOTS_JSON = "parking_spots1.json"
LOT_NAME = "Lot A"

PIXEL_THRESHOLD = 900
SEND_INTERVAL = 3  # seconds

# ==========================
# LOAD VIDEO
# ==========================
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    raise RuntimeError("Could not open video")

video_width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
video_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Video resolution: {video_width} x {video_height}")

# ==========================
# LOAD & SCALE PARKING SPOTS
# ==========================
with open(SPOTS_JSON, "r") as f:
    data = json.load(f)

spots_raw = data["spots"]
img_w = data["image_width"]
img_h = data["image_height"]

scale_x = video_width / img_w
scale_y = video_height / img_h

print(f"Scaling factors → x: {scale_x:.4f}, y: {scale_y:.4f}")

# --- Scale polygon points ONCE ---
spots = []
for spot in spots_raw:
    scaled_points = []
    for (x, y) in spot["points"]:
        sx = int(x * scale_x)
        sy = int(y * scale_y)

        # Clamp to frame bounds (safety)
        sx = max(0, min(video_width  - 1, sx))
        sy = max(0, min(video_height - 1, sy))

        scaled_points.append([sx, sy])

    spots.append({
        "id": spot["id"],
        "points": scaled_points
    })

print(f"Loaded and scaled {len(spots)} parking spots")

# ==========================
# UI CONTROLS
# ==========================
def empty(a): pass

cv2.namedWindow("Controls")
cv2.resizeWindow("Controls", 640, 240)

cv2.createTrackbar("Lighting", "Controls", 1, 51, empty)
cv2.createTrackbar("Brightness", "Controls", 0, 50, empty)
cv2.createTrackbar("Smoothing", "Controls", 1, 51, empty)

cv2.setTrackbarPos("Lighting", "Controls", 31)
cv2.setTrackbarPos("Brightness", "Controls", 16)
cv2.setTrackbarPos("Smoothing", "Controls", 5)

# ==========================
# DETECTION FUNCTION
# ==========================
def checkSpaces(frame, imgThres):
    free = 0
    spot_status_list = []

    for spot in spots:
        pts = np.array(spot["points"], dtype=np.int32)

        mask = np.zeros(imgThres.shape, dtype=np.uint8)
        cv2.fillPoly(mask, [pts], 255)

        imgCrop = cv2.bitwise_and(imgThres, mask)
        count = cv2.countNonZero(imgCrop)

        if count < PIXEL_THRESHOLD:
            status = "free"
            color = (0, 200, 0)
            free += 1
        else:
            status = "occupied"
            color = (0, 0, 200)

        spot_status_list.append({
            "spotId": spot["id"],
            "status": status
        })

        # Draw ROI
        cv2.polylines(frame, [pts], True, color, 2)

        # Draw pixel count
        center = pts.mean(axis=0).astype(int)
        cv2.putText(frame, str(count),
                    tuple(center),
                    cv2.FONT_HERSHEY_PLAIN,
                    1.1,
                    color,
                    2)

    total = len(spots)
    occupied = total - free

    cvzone.putTextRect(
        frame,
        f"Free: {free}/{total}",
        (50, 60),
        thickness=3,
        offset=20,
        colorR=(0, 200, 0)
    )

    return total, free, occupied, spot_status_list

# ==========================
# MAIN LOOP
# ==========================
last_sent = 0

while True:
    success, frame = cap.read()
    if not success:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        continue

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (3, 3), 1)

    val1 = cv2.getTrackbarPos("Lighting", "Controls")
    val2 = cv2.getTrackbarPos("Brightness", "Controls")
    val3 = cv2.getTrackbarPos("Smoothing", "Controls")

    if val1 % 2 == 0: val1 += 1
    if val3 % 2 == 0: val3 += 1

    imgThres = cv2.adaptiveThreshold(
        blur,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        val1,
        val2
    )

    imgThres = cv2.medianBlur(imgThres, val3)
    kernel = np.ones((3, 3), np.uint8)
    imgThres = cv2.dilate(imgThres, kernel, iterations=1)

    total, free, occupied, spot_status_list = checkSpaces(frame, imgThres)

    now = time.time()
    if now - last_sent >= SEND_INTERVAL:
        send_to_backend(
            LOT_NAME,
            total,
            free,
            occupied,
            spot_status_list
        )
        last_sent = now

    cv2.imshow("Threshold", imgThres)
    cv2.imshow("Image", frame)

    if cv2.waitKey(10) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
