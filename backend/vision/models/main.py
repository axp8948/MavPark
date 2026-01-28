import cv2
import pickle
import cvzone
import numpy as np
import time
from send_data import send_to_backend

# =========================
# VIDEO SOURCE
# =========================
cap = cv2.VideoCapture('carPark.MOV')

# =========================
# LOAD & SCALE SPOT COORDINATES
# =========================
with open('CarParkPos', 'rb') as f:
    posList = pickle.load(f)

PHOTO_W, PHOTO_H = 3520, 1980
VIDEO_W, VIDEO_H = 1920, 1080

scale_x = VIDEO_W / PHOTO_W
scale_y = VIDEO_H / PHOTO_H

posList = [
    (
        int(round(cx * scale_x)),
        int(round(cy * scale_y)),
        angle,
        int(round(w * scale_x)),
        int(round(h * scale_y))
    )
    for (cx, cy, angle, w, h) in posList
]

# =========================
# UI TRACKBARS
# =========================
def empty(a): pass

cv2.namedWindow("Vals")
cv2.resizeWindow("Vals", 640, 400)

cv2.createTrackbar("BlockSize", "Vals", 6, 50, empty)
cv2.createTrackbar("C", "Vals", 7, 50, empty)
cv2.createTrackbar("Median", "Vals", 5, 50, empty)

cv2.createTrackbar("CannyLow", "Vals", 117, 255, empty)
cv2.createTrackbar("CannyHigh", "Vals", 167, 255, empty)

cv2.createTrackbar("Near%", "Vals", 6, 40, empty)
cv2.createTrackbar("Mid%", "Vals", 8, 40, empty)
cv2.createTrackbar("Far%", "Vals", 15, 40, empty)

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

    for idx, (cx, cy, angle, w, h) in enumerate(posList):
        spot_id = 401 + idx

        rect = ((cx, cy), (w, h), angle)
        box = np.intp(cv2.boxPoints(rect))

        mask = np.zeros(imgThres.shape, dtype=np.uint8)
        cv2.drawContours(mask, [box], 0, 255, -1)

        imgCrop = cv2.bitwise_and(imgThres, mask)

        roi_area = max(w * h, 1)
        white_pixels = cv2.countNonZero(imgCrop)
        white_ratio = white_pixels / roi_area

        TH = get_row_threshold(cy)

        if white_ratio > TH:
            status = "occupied"
            color = (0, 0, 200)
            thickness = 2
        else:
            status = "free"
            color = (0, 200, 0)
            thic = 2
            spaces += 1

        spot_status_list.append({
            "spotId": spot_id,
            "status": status
        })

        # Draw bounding box
        cv2.drawContours(img, [box], 0, color, thic)

        # ============================
        # Show Spot Number + Threshold
        # ============================
        text_x, text_y = int(cx - w / 3), int(cy - 5)

        # cv2.putText(img, f"{spot_id}", (text_x, text_y),
        #             cv2.FONT_HERSHEY_PLAIN, 1.2, (255,255,255), 2)

        cv2.putText(img, f"{count}", (text_x, text_y + 20),
                    cv2.FONT_HERSHEY_PLAIN, 1.2, color, 2)

    total = len(posList)
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
interval = 3  # seconds

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

    current_time = time.time()
    if current_time - last_sent >= interval:
        send_to_backend("Lot A", total, free, occupied, spot_status_list)
        last_sent = current_time

    cv2.imshow("Image", img)
    cv2.imshow("Threshold Fusion", imgThres)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()
