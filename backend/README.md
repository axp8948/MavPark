# ======================================================
# 🚗 MavPark Backend
# ======================================================
# Backend system for computer vision–based parking
# detection using OpenCV, YOLOv8, and SAHI.
#
# Handles:
# - Vehicle detection
# - Parking spot occupancy
# - Optional IoT / backend communication
#
# ======================================================


# ======================================================
# 📁 Project Structure
# ======================================================
#
# backend/
# ├── vision/
# │   ├── models/
# │   │   └── sahiDetection/
# │   │       ├── parking_pipeline.py
# │   │       ├── annotate_spots.py
# │   │       ├── visualization.py
# │   │       ├── parking_spots_*.json
# │   │       └── yolov8n.pt        # NOT committed
# │   ├── send_data.py
# │   └── .env                     
# ├── main.py
# ├── requirements.txt
# └── README.md
#
# ======================================================


# ======================================================
# ⚙️ Backend Setup Instructions
# ======================================================


# ------------------------------------------------------
# 1. Clone Repository & Navigate
# ------------------------------------------------------
#
# git clone https://github.com/anmolpandey/MavPark.git
# cd MavPark/backend
#
# ------------------------------------------------------


# ------------------------------------------------------
# 2. Set Up Python Virtual Environment
# ------------------------------------------------------
#
# python3 -m venv venv
# source venv/bin/activate     # macOS / Linux
# venv\Scripts\activate        # Windows
#
# ------------------------------------------------------


# ------------------------------------------------------
# 3. Install Python Dependencies
# ------------------------------------------------------
#
# pip install -r requirements.txt
#
# Raspberry Pi only:
# sudo apt update
# sudo apt install python3-opencv ffmpeg -y
#
# ------------------------------------------------------


# ======================================================
# 🤖 YOLOv8 Model Weights (IMPORTANT)
# ======================================================
#
# YOLO model weights are NOT committed to GitHub.
# They must be downloaded manually.
#
# Required file:
# backend/vision/models/sahiDetection/yolov8n.pt
#
# Download commands:
#
# mkdir -p backend/vision/models/sahiDetection
# cd backend/vision/models/sahiDetection
# wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
#
# If this file is missing, vehicle detection will fail.
#
# ======================================================


# ======================================================
# 🔐 Environment Variable Configuration
# ======================================================
#
# Create file:
# backend/vision/.env
#
# Example content:
#
# CAMERA_URL=rtsp://admin:YOUR_PASSWORD@<CAMERA_IP>:8554/Streaming/Channels/102
#
# Notes:
# - Never commit .env
# - Never hard-code credentials
# - .env is ignored via .gitignore
#
# ======================================================


# ======================================================
# 🚗 Running Parking Detection
# ======================================================
#
# Navigate to vision directory:
# cd backend/vision
#
# Run pipeline:
# python3 parking_pipeline.py
#
# Expected behavior:
# - RTSP stream opens
# - Parking spots are annotated
# - Occupancy updates in real time
# - Press 'q' to exit
#
# ======================================================


# ======================================================
# 📡 Sending Occupancy Data (Optional)
# ======================================================
#
# Occupancy data can be sent using:
# send_data.py
#
# Ensure receiving backend endpoint is running.
#
# ======================================================


# ======================================================
# 🧪 Common Issues
# ======================================================
#
# YOLO model not found:
# - Ensure yolov8n.pt exists in correct directory
#
# Camera stream not opening:
# - Check RTSP URL
# - Verify credentials
# - Test stream in VLC
#
# Untracked files in Git:
# - *.pt
# - .env
# - videos
# - temp outputs
# These should NOT be added to Git.
#
# ======================================================


# ======================================================
# 📄 requirements.txt Reference
# ======================================================
#
# opencv-python>=4.8.0
# numpy>=1.24.0
# cvzone>=1.6.1
# ultralytics>=8.0.0
# sahi>=0.11.0
# shapely>=2.0.0
# python-dotenv>=1.0.0
# requests>=2.32.0
#
# ======================================================



