import cv2
import json
import cvzone
import numpy as np
import time
from send_data import send_to_backend

# =========================
# CONFIG
# =========================
VIDEO_PATH = "carPark.MOV"
SPOTS_JSON = "parking_spots1.json"
LOT_NAME = "Lot A"
SEND_INTERVAL = 3  # seconds

# =========================
# VIDEO SOURCE
# =========================
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    raise RuntimeError("Could not open video")

VIDEO_W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
VIDEO_H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Video resolution: {VIDEO_W} x {VIDEO_H}")

# =========================
# LOAD & SCALE JSON POLYGONS
# =========================
with open(SPOTS_JSON, "r") as f:
    data = json.load(f)

spots_raw = data["spots"]
IMG_W = data["image_width"]
IMG_H = data["image_height"]

scale_x = VIDEO_W / IMG_W
scale_y = VIDEO_H / IMG_H

spots = []
for spot in spots_raw:
    scaled_pts = []
    for (x, y) in spot["points"]:
        sx = int(x * scale_x)
        sy = int(y * scale_y)

        sx = max(0, min(VIDEO_W - 1, sx))
        sy = max(0, min(VIDEO_H - 1, sy))

        scaled_pts.append([sx, sy])

    spots.append({
        "id": spot["id"],
        "points": scaled_pts
    })

print(f"Loaded & scaled {len(spots)} polygon parking spots")

# =========================
# UI TRACKBARS
# =========================
def empty(a): pass

cv2.namedWindow("Vals")
cv2.resizeWindow("Vals", 640, 400)

cv2.createTrackbar("BlockSize", "Vals", 7, 51, empty)
cv2.createTrackbar("C", "Vals", 7, 50, empty)
cv2.createTrackbar("Median", "Vals", 5, 51, empty)

cv2.createTrackbar("CannyLow", "Vals", 117, 255, empty)
cv2.createTrackbar("CannyHigh", "Vals", 167, 255, empty)

cv2.createTrackbar("Near%", "Vals", 6, 40, empty)
cv2.createTrackbar("Mid%",  "Vals", 8, 40, empty)
cv2.createTrackbar("Far%",  "Vals", 15, 40, empty)

# =========================
# ROW-BASED THRESHOLDING
# =========================
def get_row_threshold(cy):
    near_th = cv2.getTrackbarPos("Near%", "Vals") / 100
    mid_th  = cv2.getTrackbarPos("Mid%",  "Vals") / 100
    far_th  = cv2.getTrackbarPos("Far%",  "Vals") / 100

    if cy < VIDEO_H * 0.33:
        return far_th
    elif cy < VIDEO_H * 0.66:
        return mid_th
    else:
        return near_th

# =========================
# PARKING CHECK FUNCTION
# =========================
def checkSpaces(img, imgThres):
    spaces = 0
    spot_status_list = []

    for idx, spot in enumerate(spots):
        pts = np.array(spot["points"], dtype=np.int32)
        spot_id = spot["id"]

        mask = np.zeros(imgThres.shape, dtype=np.uint8)
        cv2.fillPoly(mask, [pts], 255)

        imgCrop = cv2.bitwise_and(imgThres, mask)

        roi_area = max(cv2.contourArea(pts), 1)
        white_pixels = cv2.countNonZero(imgCrop)
        white_ratio = white_pixels / roi_area

        cy = int(pts[:, 1].mean())
        TH = get_row_threshold(cy)

        if white_ratio > TH:
            status = "occupied"
            color = (0, 0, 200)
            thickness = 2
        else:
            status = "free"
            color = (0, 200, 0)
            thickness = 4
            spaces += 1

        spot_status_list.append({
            "spotId": spot_id,
            "status": status
        })

        # Draw polygon
        cv2.polylines(img, [pts], True, color, thickness)

        # Draw white ratio
        center = pts.mean(axis=0).astype(int)
        cv2.putText(
            img,
            f"{white_ratio:.2f}",
            tuple(center),
            cv2.FONT_HERSHEY_PLAIN,
            1.2,
            color,
            2
        )

    total = len(spots)
    occupied = total - spaces

    cvzone.putTextRect(
        img,
        f"Free: {spaces}/{total}",
        (50, 60),
        thickness=3,
        offset=20,
        colorR=(0, 200, 0)
    )

    return total, spaces, occupied, spot_status_list

# =========================
# BACKEND THROTTLING
# =========================
last_sent = 0

# =========================
# MAIN LOOP
# =========================
while True:
    success, img = cap.read()
    if not success:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        continue

    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgBlur = cv2.GaussianBlur(imgGray, (3, 3), 1)

    blockSize = cv2.getTrackbarPos("BlockSize", "Vals")
    C = cv2.getTrackbarPos("C", "Vals")
    median_k = cv2.getTrackbarPos("Median", "Vals")

    cannyLow = cv2.getTrackbarPos("CannyLow", "Vals")
    cannyHigh = cv2.getTrackbarPos("CannyHigh", "Vals")

    if blockSize % 2 == 0: blockSize += 1
    if median_k % 2 == 0: median_k += 1

    imgAdaptive = cv2.adaptiveThreshold(
        imgBlur,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize,
        C
    )

    imgAdaptive = cv2.medianBlur(imgAdaptive, median_k)
    imgCanny = cv2.Canny(imgBlur, cannyLow, cannyHigh)

    imgThres = cv2.addWeighted(imgAdaptive, 1, imgCanny, 1, 0)

    total, free, occupied, spot_status_list = checkSpaces(img, imgThres)

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

    cv2.imshow("Image", img)
    cv2.imshow("Threshold Fusion", imgThres)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
