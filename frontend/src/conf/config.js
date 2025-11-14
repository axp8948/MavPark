// API Configuration
const config = {
  // Backend API base URL - Spring Boot backend on port 8080
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  
  // WebSocket configuration for real-time parking updates
  websocket: {
    // WebSocket endpoint (matches Spring's /ws endpoint)
    url: import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws',
    // Reconnection delay in milliseconds
    reconnectDelay: 5000,
    // Heartbeat settings (keep connection alive)
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  },
  
  // API endpoints
  endpoints: {
    parkingStats: '/parking/stats',
    parkingSpots: '/parking/spots',
    parkingStatus: '/parking/status',      // GET current parking status
    parkingUpdate: '/parking/update',      // POST to update parking data
  },
};

export default config;

