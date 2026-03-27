import cv2
from onvif import ONVIFCamera
import os
import time


class RTSPCamera:
    def __init__(self, ip, username, password, port=80):
        self.ip = ip
        self.username = username
        self.password = password
        self.port = port
        self.rtsp_url = None

    # ----------------------------
    # OPTIONAL: Verify via ONVIF
    # ----------------------------
    def initialize_onvif(self):
        try:
            camera = ONVIFCamera(self.ip, self.port, self.username, self.password)
            media_service = camera.create_media_service()
            profiles = media_service.GetProfiles()
            stream_uri = media_service.GetStreamUri({
                'StreamSetup': {
                    'Stream': 'RTP-Unicast',
                    'Transport': {'Protocol': 'RTSP'}
                },
                'ProfileToken': profiles[0].token
            })

            self.rtsp_url = stream_uri.Uri
            print(f"[INFO] RTSP URL obtained via ONVIF: {self.rtsp_url}")

        except Exception as e:
            print(f"[ERROR] ONVIF initialization failed: {e}")
            return False

        return True

    # ----------------------------
    # Direct RTSP connection
    # ----------------------------
    def set_rtsp_manual(self):
        self.rtsp_url = f"rtsp://{self.username}:{self.password}@{self.ip}:8554/Streaming/Channels/102"
        print(f"[INFO] Using manual RTSP URL: {self.rtsp_url}")

    # ----------------------------
    # Capture Single Frame
    # ----------------------------
    def capture_frame(self, save_temp=False):
        if not self.rtsp_url:
            print("[ERROR] RTSP URL not set.")
            return None

        cap = cv2.VideoCapture(self.rtsp_url)

        if not cap.isOpened():
            print("[ERROR] Unable to open RTSP stream.")
            return None

        time.sleep(1)  # allow stream buffer warmup
        ret, frame = cap.read()
        cap.release()

        if not ret:
            print("[ERROR] Failed to capture frame.")
            return None

        print("[INFO] Frame captured successfully.")

        if save_temp:
            os.makedirs("temp_frames", exist_ok=True)
            filename = f"temp_frames/frame_{int(time.time())}.jpg"
            cv2.imwrite(filename, frame)
            print(f"[INFO] Temporary frame saved to {filename}")

        return frame


# ============================
# Standalone Test
# ============================
if __name__ == "__main__":
    cam = RTSPCamera(
        ip="192.168.50.133",
        username="admin",
        password="mavPark17"
    )

    # Try ONVIF first
    if not cam.initialize_onvif():
        cam.set_rtsp_manual()

    frame = cam.capture_frame(save_temp=True)

    if frame is not None:
        print("Frame shape:", frame.shape)