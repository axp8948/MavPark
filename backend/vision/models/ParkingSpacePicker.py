import cv2
import pickle
import numpy as np

width, height = 120, 60

try:
    with open('CarParkPos', 'rb') as f:
        posList = pickle.load(f)
except:
    posList = []  # each entry: (cx, cy, angle, width, height)

# Upgrade old format if needed
for i in range(len(posList)):
    if len(posList[i]) == 3:
        cx, cy, angle = posList[i]
        posList[i] = (cx, cy, angle, width, height)

selected_index = -1


def mouseClick(events, x, y, flags, params):
    global posList, selected_index

    if events == cv2.EVENT_LBUTTONDOWN:
        posList.append((x, y, 0, width, height))
        selected_index = len(posList) - 1

    elif events == cv2.EVENT_RBUTTONDOWN:
        for i, (cx, cy, angle, w, h) in enumerate(posList):
            if abs(x - cx) < w // 2 and abs(y - cy) < h // 2:
                posList.pop(i)
                selected_index = -1
                break

    elif events == cv2.EVENT_MBUTTONDOWN:
        for i, (cx, cy, angle, w, h) in enumerate(posList):
            if abs(x - cx) < w // 2 and abs(y - cy) < h // 2:
                selected_index = i
                print(f"Selected box {i} at ({cx}, {cy}) angle={angle} size=({w}x{h})")
                break

    with open('CarParkPos', 'wb') as f:
        pickle.dump(posList, f)


while True:
    img = cv2.imread('carPark.jpg')

    for i, (cx, cy, angle, w, h) in enumerate(posList):
        rect = ((cx, cy), (w, h), angle)
        box = np.intp(cv2.boxPoints(rect))
        color = (0, 255, 0) if i == selected_index else (255, 0, 255)
        cv2.drawContours(img, [box], 0, color, 2)
        cv2.putText(img, f"{i}:{int(angle)}° {int(w)}x{int(h)}", (cx - 30, cy - 10),
                    cv2.FONT_HERSHEY_PLAIN, 1, color, 1)

    cv2.imshow("Parking Selector", img)
    cv2.setMouseCallback("Parking Selector", mouseClick)

    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        break

    if selected_index != -1:
        cx, cy, angle, w, h = posList[selected_index]
        move_step = 5
        size_step = 5

        # macOS-specific arrow key codes
        if key == 2:       # Left arrow
            cx -= move_step
        elif key == 0:     # Up arrow
            cy -= move_step
        elif key == 3:     # Right arrow
            cx += move_step
        elif key == 1:     # Down arrow
            cy += move_step

        # Rotation
        elif key == ord('['):
            angle -= 5
        elif key == ord(']'):
            angle += 5

        # Width adjustments
        elif key == ord('d'):  # Increase width
            w += size_step
        elif key == ord('a') and w > 30:
            w -= size_step

        # Height adjustments
        elif key == ord('w'):  # Increase height
            h += size_step
        elif key == ord('s') and h > 15:
            h -= size_step

        posList[selected_index] = (cx, cy, angle, w, h)

    with open('CarParkPos', 'wb') as f:
        pickle.dump(posList, f)

cv2.destroyAllWindows()
