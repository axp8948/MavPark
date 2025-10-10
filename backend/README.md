# 🚗 MavPark Backend

The backend of **MavPark** powers the system's computer vision and IoT components. It uses **OpenCV** for vehicle detection and provides backend logic for real-time parking availability data.

---

## ⚙️ Backend Setup Instructions

### 🧩 1. Navigate to Backend Directory

Clone the repository (if you haven't yet) and move into the backend folder:

```bash
git clone https://github.com/anmolpandey/MavPark.git
cd MavPark/backend
```

### 🐍 2. Set Up Python Environment

Recommended: Create a virtual environment to keep dependencies isolated.

```bash
python3 -m venv venv
source venv/bin/activate   # For Linux/Mac
# or
venv\Scripts\activate      # For Windows
```

### 📦 3. Install Required Dependencies

Install all necessary Python packages:

```bash
pip install -r requirements.txt
```

If running on a Raspberry Pi, also ensure system dependencies are installed:

```bash
sudo apt update
sudo apt install python3-opencv ffmpeg -y
```

### 🔐 4. Configure Environment Variables

Create a `.env` file inside `backend/vision/` to securely store your camera URL:

```bash
# backend/vision/.env
CAMERA_URL=rtsp://admin:Mavpark17@<CAM_IP>:8554/Streaming/Channels/102
```

⚠️ **Never commit `.env` to GitHub.** Your credentials (username, password, and camera IP) must stay private.

### 🚗 5. Run the Car Detection Test

Navigate to the vision directory and start the test script:

```bash
cd vision
python3 car_detection_test.py
```

You should see:
- Connected to camera stream. Press 'q' to quit.
- A video window will open showing live frames with car detections.

---
