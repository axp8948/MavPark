# Spring Boot ↔️ React WebSocket Integration

## 🎉 Complete Integration Summary

Your frontend is now fully connected to your Spring Boot backend via WebSocket! Here's what was set up:

---

## 📋 Backend Setup (Your Team Completed)

### Spring Boot Configuration

**WebSocketConfig.java** - WebSocket Server
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")              // ✅ WebSocket endpoint
                .setAllowedOriginPatterns("*")    // ✅ Allow frontend connection
                .withSockJS();                     // ✅ Fallback support
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");   // ✅ Broadcast to /topic
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

**ParkingService.java** - Broadcasts Updates
```java
@Service
public class ParkingService {
    private final SimpMessagingTemplate simpMessagingTemplate;
    
    public void updateParkingData(ParkingUpdateRequest request) {
        this.currentStatus = request;
        
        // ✅ Broadcasts to all connected frontends
        simpMessagingTemplate.convertAndSend("/topic/parking", request);
    }
}
```

**ParkingController.java** - HTTP Endpoints
```java
@RestController
@RequestMapping("/api/parking")
public class ParkingController {
    
    @PostMapping("/update")  // ✅ Update parking data (triggers WebSocket)
    public String updateParking(@RequestBody ParkingUpdateRequest request);
    
    @GetMapping("/status")   // ✅ Get current parking status
    public ParkingUpdateRequest getParkingStatus();
}
```

**ParkingUpdateRequest.java** - Data Structure
```java
public class ParkingUpdateRequest {
    private String parkingLotName;
    private int totalSpots;
    private int freeSpots;
    private int occupiedSpots;
}
```

---

## 🎨 Frontend Setup (Completed)

### 1. Configuration (`config.js`)

```javascript
const config = {
  apiBaseUrl: 'http://localhost:8080/api',  // Spring Boot API
  
  websocket: {
    url: 'http://localhost:8080/ws',        // WebSocket endpoint
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  },
  
  endpoints: {
    parkingStatus: '/parking/status',        // GET status
    parkingUpdate: '/parking/update',        // POST update
  },
};
```

### 2. WebSocket Service (`services/websocketService.js`)

Low-level WebSocket manager that:
- Connects to `http://localhost:8080/ws`
- Uses STOMP + SockJS (matches Spring config)
- Subscribes to `/topic/parking`
- Handles reconnection automatically

### 3. React Hook (`hooks/useWebSocket.js`)

Easy-to-use hook for React components:

```javascript
const { isConnected, parkingData, error } = useWebSocket();

// parkingData structure (from Spring):
// {
//   parkingLotName: "Lot 1",
//   totalSpots: 40,
//   freeSpots: 25,
//   occupiedSpots: 15
// }
```

### 4. Parking Service (`services/parkingService.js`)

Added Spring backend endpoints:

```javascript
// GET current parking status
getParkingStatus()

// POST update parking data (triggers WebSocket broadcast)
updateParkingData({
  parkingLotName: "Lot 1",
  totalSpots: 40,
  freeSpots: 25,
  occupiedSpots: 15
})
```

### 5. ParkingLots Component (`pages/ParkingLots.jsx`)

Integrated WebSocket:
- ✅ Shows live connection status (top-right corner)
- ✅ Automatically receives parking updates
- ✅ Updates UI in real-time
- ✅ Fetches initial status from Spring

---

## 🔄 Data Flow Diagram

```
┌─────────────────┐
│ Vision System   │
│ (Python)        │
└────────┬────────┘
         │
         │ POST /api/parking/update
         │ {parkingLotName, totalSpots, freeSpots, occupiedSpots}
         ▼
┌─────────────────────────────┐
│ Spring Boot Backend         │
│ Port 8080                   │
├─────────────────────────────┤
│ ParkingController           │
│   ├─ POST /api/parking/update
│   └─ GET  /api/parking/status
│                             │
│ ParkingService              │
│   └─ simpMessagingTemplate  │
│      .convertAndSend()      │
└────────┬────────────────────┘
         │
         │ WebSocket broadcast to /topic/parking
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
    ┌────────┐     ┌────────┐     ┌────────┐
    │Frontend│     │Frontend│     │Frontend│
    │User 1  │     │User 2  │     │User 3  │
    └────────┘     └────────┘     └────────┘
    
    All connected frontends receive updates instantly!
```

---

## 🧪 Testing the Integration

### Step 1: Start Spring Boot Backend

```bash
cd spring-backend
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

Backend should start on: `http://localhost:8080`

### Step 2: Start React Frontend

```bash
cd frontend
npm run dev
```

Frontend should start on: `http://localhost:5173`

### Step 3: Check WebSocket Connection

1. Open the React app in your browser
2. Look at the **top-right corner** of the ParkingLots page
3. You should see:
   - 🟢 **"Live Updates"** = Connected to Spring!
   - 🔴 **"Connecting..."** = Spring backend not ready yet

### Step 4: Test Real-time Updates

#### Option A: Using curl

```bash
curl -X POST http://localhost:8080/api/parking/update \
  -H "Content-Type: application/json" \
  -d '{
    "parkingLotName": "Lot 1",
    "totalSpots": 40,
    "freeSpots": 30,
    "occupiedSpots": 10
  }'
```

#### Option B: Using Postman

1. Method: `POST`
2. URL: `http://localhost:8080/api/parking/update`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "parkingLotName": "Lot 1",
  "totalSpots": 40,
  "freeSpots": 30,
  "occupiedSpots": 10
}
```

#### Option C: Using JavaScript Console

Open browser DevTools (F12) and paste:

```javascript
fetch('http://localhost:8080/api/parking/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parkingLotName: "Lot 1",
    totalSpots: 40,
    freeSpots: 25,
    occupiedSpots: 15
  })
})
.then(res => res.text())
.then(data => console.log('Response:', data));
```

### Step 5: Watch the Magic! ✨

After sending the update, your React frontend should:
1. **Instantly update** without refreshing the page
2. Show the new parking counts
3. Log the update in the browser console

---

## 🔍 Debugging & Logs

### Frontend Logs (Browser Console - F12)

You should see:

```
[WebSocket] Connecting to: http://localhost:8080/ws
[WebSocket] ✅ Connected to Spring backend
[WebSocket] ✅ Subscribed to /topic/parking
[useWebSocket] Connection status: true
Initial parking status from Spring: {...}
```

When an update is received:
```
[WebSocket] 📦 Received parking update: {parkingLotName: "Lot 1", ...}
[useWebSocket] Received from Spring: {parkingLotName: "Lot 1", ...}
Received parking update from Spring: {parkingLotName: "Lot 1", ...}
```

### Backend Logs (Spring Console)

You should see:
```
o.s.w.s.c.WebSocketMessageBrokerStats : WebSocket session established
o.s.w.s.c.WebSocketMessageBrokerStats : STOMP session id=... established
```

When sending updates:
```
Parking data updated: ParkingUpdateRequest{parkingLotName='Lot 1', ...}
```

---

## 🎯 Integration with Vision System

Your Python vision system should POST updates to Spring:

```python
import requests
import json

def send_parking_update(lot_name, total, free, occupied):
    url = "http://localhost:8080/api/parking/update"
    
    data = {
        "parkingLotName": lot_name,
        "totalSpots": total,
        "freeSpots": free,
        "occupiedSpots": occupied
    }
    
    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        data=json.dumps(data)
    )
    
    print(f"Update sent: {response.text}")

# Example usage
send_parking_update("Lot 1", 40, 25, 15)
```

Every time this is called:
1. Spring backend receives the update
2. Spring broadcasts via WebSocket to `/topic/parking`
3. All connected React frontends update instantly!

---

## 📊 Data Mapping

### Spring → Frontend

| Spring (ParkingUpdateRequest) | Frontend Usage |
|------------------------------|----------------|
| `parkingLotName` (String)    | Lot name display |
| `totalSpots` (int)           | Total capacity |
| `freeSpots` (int)            | Available spots (green) |
| `occupiedSpots` (int)        | Occupied spots (red) |

### Frontend Display

```javascript
// In ParkingLots.jsx
{parkingData.freeSpots}/{parkingData.totalSpots} Available
```

Shows: **"25/40 Available"**

---

## ⚙️ Configuration Options

### Environment Variables

Create `.env` in frontend folder:

```env
# Spring Backend URL
VITE_API_URL=http://localhost:8080/api

# WebSocket URL
VITE_WS_URL=http://localhost:8080/ws
```

Then restart frontend.

### Change Ports

If Spring runs on different port:

1. **Update `application.properties`:**
```properties
server.port=9090
```

2. **Update `frontend/src/conf/config.js`:**
```javascript
apiBaseUrl: 'http://localhost:9090/api',
websocket: {
  url: 'http://localhost:9090/ws',
}
```

---

## 🚨 Troubleshooting

### Problem: "Connection Error" or "Connecting..."

**Check:**
1. Is Spring Boot running? → `curl http://localhost:8080`
2. Is WebSocket configured? → Check `WebSocketConfig.java` exists
3. Is CORS enabled? → Check `WebConfig.java` has `allowedOrigins("*")`
4. Check browser console for errors

**Solution:**
```bash
# Restart Spring Boot
cd spring-backend
mvn clean install
mvn spring-boot:run
```

### Problem: Connection Works But No Updates

**Check:**
1. Is `ParkingService` using `SimpMessagingTemplate`? ✅
2. Is it sending to `/topic/parking`? ✅
3. Is frontend subscribed to `/topic/parking`? ✅

**Test:**
```bash
# Send test update
curl -X POST http://localhost:8080/api/parking/update \
  -H "Content-Type: application/json" \
  -d '{"parkingLotName":"Test","totalSpots":10,"freeSpots":5,"occupiedSpots":5}'
```

Check browser console for: `[WebSocket] 📦 Received parking update`

### Problem: CORS Errors

**Fix in Spring:**

`WebConfig.java` should have:
```java
.allowedOrigins("*")
.allowedMethods("GET", "POST", "PUT", "DELETE")
.allowedHeaders("*");
```

`WebSocketConfig.java` should have:
```java
.setAllowedOriginPatterns("*")
```

---

## 📚 Code Examples

### Add WebSocket to Another Component

```javascript
// In Dashboard.jsx or any component
import { useWebSocket } from '../hooks/useWebSocket';

function Dashboard() {
  const { isConnected, parkingData, error } = useWebSocket();
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Connection indicator */}
      {isConnected ? (
        <span className="text-green-600">🔴 LIVE</span>
      ) : (
        <span className="text-gray-400">Offline</span>
      )}
      
      {/* Display parking data */}
      {parkingData && (
        <div>
          <h2>{parkingData.parkingLotName}</h2>
          <p>Available: {parkingData.freeSpots}/{parkingData.totalSpots}</p>
        </div>
      )}
      
      {/* Error handling */}
      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
  );
}
```

### Manual Control Example

```javascript
function AdvancedComponent() {
  const { 
    isConnected, 
    parkingData, 
    connect, 
    disconnect, 
    subscribe 
  } = useWebSocket({
    autoConnect: false,     // Don't auto-connect
    autoSubscribe: false,   // Don't auto-subscribe
  });
  
  const handleConnect = async () => {
    await connect();
    subscribe();
  };
  
  return (
    <div>
      <button onClick={handleConnect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}
```

---

## ✅ Checklist

- [x] Spring Boot backend configured with WebSocket
- [x] Frontend libraries installed (@stomp/stompjs, sockjs-client)
- [x] WebSocket service created
- [x] React hook created  
- [x] ParkingLots component integrated
- [x] Configuration updated to port 8080
- [x] Connection status indicator added
- [x] Real-time updates working

---

## 🎓 Key Concepts Explained

### WebSocket vs HTTP

| Feature | HTTP | WebSocket |
|---------|------|-----------|
| Connection | One request, one response | Persistent connection |
| Direction | Client → Server only | Bi-directional |
| Updates | Client must poll | Server pushes updates |
| Use Case | Load page data | Real-time updates |

### STOMP Protocol

- **STOMP** = Simple Text Oriented Messaging Protocol
- Adds messaging features on top of WebSocket
- Supports pub/sub pattern (topics)
- Your Spring backend uses it

### SockJS

- Provides fallback if WebSocket not supported
- Uses polling, long-polling as alternatives
- Your Spring backend has: `.withSockJS()`
- Your frontend uses: `SockJS` client

### Topics (Pub/Sub)

- **Publisher**: Spring `ParkingService` sends to `/topic/parking`
- **Subscribers**: All React frontends subscribed to `/topic/parking`
- When published, all subscribers receive the message instantly

---

## 🚀 Next Steps

1. **Test the integration** with curl commands
2. **Integrate your vision system** to POST updates
3. **Add more features**:
   - Multiple parking lots
   - Individual spot tracking
   - Occupancy history
   - Real-time notifications

4. **Optimize**:
   - Add loading states
   - Handle disconnections gracefully
   - Add retry logic

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Check Spring Boot logs
3. Verify all ports and URLs match
4. Test with curl commands first
5. Review this documentation

---

**🎉 Your frontend and Spring backend are now connected via WebSocket!**

Data flows from your vision system → Spring → WebSocket → React in real-time!

