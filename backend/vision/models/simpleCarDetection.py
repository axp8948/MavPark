import os
from dotenv import load_dotenv
import cv2

load_dotenv()

CAMERA_URL = os.getenv("CAMERA_URL")
CAR_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_car.xml"

car_cascade = cv2.CascadeClassifier(CAR_CASCADE_PATH)
cap = cv2.VideoCapture(CAMERA_URL)

if not cap.isOpened():
    print("Error: Could not open RTSP stream.")
    exit()

print("Connected to camera stream. Press 'q' to quit.")

# ==== MAIN LOOP ====
while True:
    ret, frame = cap.read()
    if not ret:
        print("Frame not received.")
        break

    # Convert frame to grayscale for detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect cars (tune scaleFactor and minNeighbors as needed)
    cars = car_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(60, 60))

    # Draw boxes
    for (x, y, w, h) in cars:
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

    # Display detection count
    cv2.putText(frame, f"Cars detected: {len(cars)}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    cv2.imshow("MavPark - Car Detection Test", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
