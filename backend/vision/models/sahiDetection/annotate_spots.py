"""
Parking Spot Annotation Tool (Video Snapshot Version)

Controls (Preview Mode):
- SPACE: Capture current frame for annotation
- F: Jump forward 30 frames
- B: Jump backward 30 frames
- Q / ESC: Quit

Controls (Annotation Mode):
- Left Click: Add point
- Right Click: Complete spot
- U: Undo last point
- D: Delete last spot
- S: Save
- R: Reset
- Q / ESC: Quit
"""

import cv2
import json
import numpy as np
from pathlib import Path

# =========================================================
# CONFIGURATION
# =========================================================
VIDEO_PATH = "IMG_9798.MOV"
OUTPUT_JSON = "parking_spots_9798.json"
USE_RECTANGLE_MODE = True
# =========================================================


class ParkingSpotAnnotator:
    def __init__(self, frame, output_json):
        self.original_image = frame
        self.image = frame.copy()
        self.output_json = Path(output_json)

        self.spots = []
        self.current_spot = []
        self.spot_counter = 1

        if self.output_json.exists():
            self.load_spots()

        self.window_name = "Parking Spot Annotator"
        cv2.namedWindow(self.window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(self.window_name, 1400, 800)
        cv2.setMouseCallback(self.window_name, self.mouse_callback)

    def load_spots(self):
        with open(self.output_json, "r") as f:
            data = json.load(f)
            self.spots = data.get("spots", [])
            self.spot_counter = len(self.spots) + 1
            print(f"Loaded {len(self.spots)} existing spots")

    def save_spots(self):
        h, w = self.original_image.shape[:2]
        data = {
            "image_width": w,
            "image_height": h,
            "total_spots": len(self.spots),
            "spots": self.spots,
        }
        with open(self.output_json, "w") as f:
            json.dump(data, f, indent=2)
        print(f"Saved {len(self.spots)} spots → {self.output_json}")

    def mouse_callback(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            self.current_spot.append([x, y])
            self.update_display()

        elif event == cv2.EVENT_RBUTTONDOWN:
            if len(self.current_spot) >= 3:
                self.spots.append({
                    "id": f"spot_{self.spot_counter:03d}",
                    "points": self.current_spot.copy()
                })
                print(f"Added spot_{self.spot_counter:03d}")
                self.spot_counter += 1
                self.current_spot = []
                self.update_display()

    def update_display(self):
        self.image = self.original_image.copy()

        for spot in self.spots:
            pts = np.array(spot["points"], dtype=np.int32)
            overlay = self.image.copy()
            cv2.fillPoly(overlay, [pts], (0, 255, 0))
            cv2.addWeighted(overlay, 0.3, self.image, 0.7, 0, self.image)
            cv2.polylines(self.image, [pts], True, (0, 255, 0), 2)

            center = pts.mean(axis=0).astype(int)
            cv2.putText(
                self.image,
                spot["id"].replace("spot_", ""),
                tuple(center),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                2
            )

        if self.current_spot:
            pts = np.array(self.current_spot, dtype=np.int32)
            for pt in self.current_spot:
                cv2.circle(self.image, tuple(pt), 5, (0, 0, 255), -1)
            if len(self.current_spot) > 1:
                cv2.polylines(self.image, [pts], False, (0, 0, 255), 2)

        self.draw_info_panel()

    def draw_info_panel(self):
        info = [
            f"Total spots: {len(self.spots)}",
            f"Current points: {len(self.current_spot)}",
            "",
            "Controls:",
            "Left Click: Add point",
            "Right Click: Complete spot",
            "U: Undo | D: Delete",
            "S: Save | R: Reset | Q: Quit"
        ]

        y = 30
        for line in info:
            cv2.putText(self.image, line, (10, y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 3)
            cv2.putText(self.image, line, (10, y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            y += 25

    def run(self):
        self.update_display()
        while True:
            cv2.imshow(self.window_name, self.image)
            key = cv2.waitKey(1) & 0xFF

            if key in (ord("q"), 27):
                if self.spots:
                    print("Save before quitting? (y/n)")
                    if cv2.waitKey(0) & 0xFF == ord("y"):
                        self.save_spots()
                break

            elif key == ord("s"):
                self.save_spots()

            elif key == ord("u") and self.current_spot:
                self.current_spot.pop()
                self.update_display()

            elif key == ord("d") and self.spots:
                removed = self.spots.pop()
                print(f"Deleted {removed['id']}")
                self.update_display()

            elif key == ord("r"):
                self.spots = []
                self.current_spot = []
                self.spot_counter = 1
                self.update_display()

        cv2.destroyAllWindows()


# =========================================================
# VIDEO SNAPSHOT PICKER
# =========================================================
def capture_frame_from_video(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Could not open video")

    frame_idx = 0

    while True:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break

        display = frame.copy()
        cv2.putText(display, "SPACE: Capture | F/B: Seek | Q: Quit",
                    (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 255, 0), 2)

        cv2.imshow("Video Preview", display)
        key = cv2.waitKey(30) & 0xFF

        if key == ord(" "):
            cap.release()
            cv2.destroyWindow("Video Preview")
            return frame

        elif key == ord("f"):
            frame_idx += 30

        elif key == ord("b"):
            frame_idx = max(0, frame_idx - 30)

        elif key in (ord("q"), 27):
            break

    cap.release()
    cv2.destroyAllWindows()
    return None


# =========================================================
# ENTRY POINT
# =========================================================
if __name__ == "__main__":
    frame = capture_frame_from_video(VIDEO_PATH)
    if frame is not None:
        ParkingSpotAnnotator(frame, OUTPUT_JSON).run()
