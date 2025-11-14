import cv2
import pickle
import cvzone
import numpy as np
import time
from send_data import send_to_backend   # separate backend module

cap = cv2.VideoCapture('carPark.MOV')

# Load positions from your advanced spot picker
with open('CarParkPos', 'rb') as f:
    posList = pickle.load(f)

# --- SCALE COORDINATES TO MATCH VIDEO DIMENSIONS ---
# Picker image size → 3520x1980
# Video size → 1920x1080
scale_x = 1920 / 3520
scale_y = 1080 / 1980
posList = [(int(cx * scale_x), int(cy * scale_y), angle,
            int(w * scale_x), int(h * scale_y))
           for (cx, cy, angle, w, h) in posList]


def empty(a): pass


cv2.namedWindow("Controls")
cv2.resizeWindow("Controls", 640, 240)
cv2.createTrackbar("Lighting", "Controls", 0, 50, empty)
cv2.createTrackbar("Brightness", "Controls", 0, 50, empty)
cv2.createTrackbar("Smoothing", "Controls", 0, 50, empty)

# Set initial optimized slider values
cv2.setTrackbarPos("Lighting", "Controls", 50)
cv2.setTrackbarPos("Brightness", "Controls", 16)
cv2.setTrackbarPos("Smoothing", "Controls", 5)


def checkSpaces(img, imgThres):
    spaces = 0
    for (cx, cy, angle, w, h) in posList:
        rect = ((cx, cy), (w, h), angle)
        box = np.intp(cv2.boxPoints(rect))

        # Mask each parking ROI
        mask = np.zeros(imgThres.shape, dtype=np.uint8)
        cv2.drawContours(mask, [box], 0, 255, -1)
        imgCrop = cv2.bitwise_and(imgThres, mask)
        count = cv2.countNonZero(imgCrop)

        # Classification by white-pixel count
        if count < 900:
            color = (0, 200, 0)
            thic = 5
            spaces += 1
        else:
            color = (0, 0, 200)
            thic = 2

        # Draw visual overlay
        cv2.drawContours(img, [box], 0, color, thic)
        cx_text, cy_text = int(cx - w / 4), int(cy)
        cv2.putText(img, str(count), (cx_text, cy_text),
                    cv2.FONT_HERSHEY_PLAIN, 1, color, 2)

    total = len(posList)
    occupied = total - spaces
    cvzone.putTextRect(img, f'Free: {spaces}/{total}', (50, 60),
                       thickness=3, offset=20, colorR=(0, 200, 0))
    return total, spaces, occupied


# --- Throttling setup for backend updates ---
last_sent = 0        # timestamp of last update
interval = 3         # seconds between updates

# --- Main loop ---
while True:
    success, img = cap.read()
    if not success:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        continue

    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgBlur = cv2.GaussianBlur(imgGray, (3, 3), 1)

    val1 = cv2.getTrackbarPos("Lighting", "Controls")
    val2 = cv2.getTrackbarPos("Brightness", "Controls")
    val3 = cv2.getTrackbarPos("Smoothing", "Controls")
    if val1 % 2 == 0: val1 += 1
    if val3 % 2 == 0: val3 += 1

    imgThres = cv2.adaptiveThreshold(imgBlur, 255,
                                     cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY_INV, val1, val2)
    imgThres = cv2.medianBlur(imgThres, val3)
    kernel = np.ones((3, 3), np.uint8)
    imgThres = cv2.dilate(imgThres, kernel, iterations=1)

    total, free, occupied = checkSpaces(img, imgThres)

    # --- Send data every 3 seconds ---
    current_time = time.time()
    if current_time - last_sent >= interval:
        send_to_backend("Lot A", total, free, occupied)
        last_sent = current_time

    # --- Display ---
    cv2.imshow("Threshold", imgThres)
    cv2.imshow("Image", img)

    key = cv2.waitKey(10)
    if key == ord('q'):
        break

cv2.destroyAllWindows()
