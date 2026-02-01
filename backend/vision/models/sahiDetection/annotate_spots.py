"""
Parking Spot Annotation Tool
Click to define parking spot boundaries, save to JSON for occupancy detection.

Controls:
- Left Click: Add point to current spot polygon
- Right Click: Complete current spot and start new one
- 'u': Undo last point
- 'd': Delete last completed spot
- 's': Save spots to JSON
- 'r': Reset all spots
- 'q' or ESC: Quit (will prompt to save)
"""

import cv2
import json
import numpy as np
from pathlib import Path

# =========================================================
# CONFIGURATION (EDIT ONLY THIS SECTION)
# =========================================================
IMAGE_PATH = "carPark.jpg"          # Image to annotate
OUTPUT_JSON = "parking_spots1.json"       # Output annotation file

USE_RECTANGLE_MODE = False               # True = rectangle mode, False = polygon mode
# =========================================================


class ParkingSpotAnnotator:
    def __init__(self, image_path, output_json):
        self.image_path = Path(image_path)
        self.output_json = Path(output_json)
        self.original_image = cv2.imread(str(self.image_path))

        if self.original_image is None:
            raise ValueError(f"Could not load image: {image_path}")

        self.image = self.original_image.copy()
        self.spots = []
        self.current_spot = []
        self.spot_counter = 1

        # Load existing spots if file exists
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
        data = {
            "image_path": str(self.image_path),
            "image_width": self.original_image.shape[1],
            "image_height": self.original_image.shape[0],
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
            else:
                print("Need at least 3 points to create a spot")

    def update_display(self):
        self.image = self.original_image.copy()

        # Draw completed spots
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

        # Draw current spot
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
            "U: Undo | D: Delete last",
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
        print("=" * 50)
        print("PARKING SPOT ANNOTATOR")
        print("=" * 50)
        self.update_display()

        while True:
            cv2.imshow(self.window_name, self.image)
            key = cv2.waitKey(1) & 0xFF

            if key == ord("q") or key == 27:
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
                print("Reset all spots? (y/n)")
                if cv2.waitKey(0) & 0xFF == ord("y"):
                    self.spots = []
                    self.current_spot = []
                    self.spot_counter = 1
                    self.update_display()

        cv2.destroyAllWindows()
        print(f"Final count: {len(self.spots)} spots")


# =========================================================
# QUICK RECTANGLE MODE
# =========================================================
def quick_rectangle_mode(image_path, output_json):
    image = cv2.imread(str(image_path))
    spots = []
    points = []
    counter = 1

    def mouse(event, x, y, flags, param):
        nonlocal points, spots, counter
        if event == cv2.EVENT_LBUTTONDOWN:
            points.append([x, y])
            if len(points) == 2:
                x1, y1 = points[0]
                x2, y2 = points[1]
                spots.append({
                    "id": f"spot_{counter:03d}",
                    "points": [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
                })
                print(f"Added spot_{counter:03d}")
                counter += 1
                points = []

    cv2.namedWindow("Rectangle Mode", cv2.WINDOW_NORMAL)
    cv2.setMouseCallback("Rectangle Mode", mouse)

    while True:
        img = image.copy()
        for s in spots:
            pts = np.array(s["points"], dtype=np.int32)
            cv2.polylines(img, [pts], True, (0, 255, 0), 2)

        cv2.imshow("Rectangle Mode", img)
        key = cv2.waitKey(1) & 0xFF

        if key == ord("q"):
            break
        elif key == ord("s"):
            json.dump({
                "image_path": str(image_path),
                "total_spots": len(spots),
                "spots": spots
            }, open(output_json, "w"), indent=2)
            print(f"Saved {len(spots)} spots")

    cv2.destroyAllWindows()


# =========================================================
# ENTRY POINT
# =========================================================
if __name__ == "__main__":
    if USE_RECTANGLE_MODE:
        quick_rectangle_mode(IMAGE_PATH, OUTPUT_JSON)
    else:
        ParkingSpotAnnotator(IMAGE_PATH, OUTPUT_JSON).run()
