# send_data.py
import requests
import json

def send_to_backend(lot_name, total, free, occupied):
    """Send parking data to backend API"""
    url = "http://localhost:8080/api/parking/update"  # Backend Endpoint
    data = {
        "parkingLotName": lot_name,
        "totalSpots": total,
        "freeSpots": free,
        "occupiedSpots": occupied
    }
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, data=json.dumps(data), headers=headers, timeout=1)
        print(f" Data sent ({response.status_code}):", data)
    except requests.exceptions.RequestException as e:
        print(" Error sending data:", e)
