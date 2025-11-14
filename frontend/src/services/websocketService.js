import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import config from '../conf/config';

/**
 * WebSocket Service for Real-time Parking Updates
 * 
 * Connects to Spring Boot backend WebSocket server
 * - Backend endpoint: http://localhost:8080/ws
 * - Subscription topic: /topic/parking
 * - Protocol: STOMP over SockJS
 * 
 * Data Format (from ParkingUpdateRequest.java):
 * {
 *   parkingLotName: string,
 *   totalSpots: number,
 *   freeSpots: number,
 *   occupiedSpots: number
 * }
 */

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.isConnected = false;
    this.connectionStatusCallbacks = [];
  }

  /**
   * Connect to Spring Boot WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.client) {
        console.log('[WebSocket] Already connected');
        resolve();
        return;
      }

      console.log('[WebSocket] Connecting to:', config.websocket.url);

      // Create STOMP client with SockJS (matches Spring's withSockJS())
      this.client = new Client({
        // SockJS factory - matches Spring's .withSockJS()
        webSocketFactory: () => new SockJS(config.websocket.url),

        // Connection settings
        connectionTimeout: 5000,
        
        // Heartbeat (keep-alive)
        heartbeatIncoming: config.websocket.heartbeatIncoming,
        heartbeatOutgoing: config.websocket.heartbeatOutgoing,

        // Auto-reconnect
        reconnectDelay: config.websocket.reconnectDelay,

        // Debug mode (only in development)
        debug: (str) => {
          if (import.meta.env.DEV) {
            console.log('[WebSocket Debug]', str);
          }
        },

        // Connected successfully
        onConnect: () => {
          console.log('[WebSocket] ✅ Connected to Spring backend');
          this.isConnected = true;
          this.notifyConnectionStatus(true);
          resolve();
        },

        // STOMP protocol error
        onStompError: (frame) => {
          console.error('[WebSocket] ❌ STOMP error:', frame.headers['message']);
          console.error('[WebSocket] Details:', frame.body);
          this.isConnected = false;
          this.notifyConnectionStatus(false);
          reject(new Error(frame.headers['message']));
        },

        // WebSocket error
        onWebSocketError: (error) => {
          console.error('[WebSocket] ❌ Connection error:', error);
          this.isConnected = false;
          this.notifyConnectionStatus(false);
        },

        // Disconnected
        onDisconnect: () => {
          console.log('[WebSocket] 🔌 Disconnected from Spring backend');
          this.isConnected = false;
          this.notifyConnectionStatus(false);
        },
      });

      // Start connection
      try {
        this.client.activate();
      } catch (error) {
        console.error('[WebSocket] Failed to activate:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      console.log('[WebSocket] Disconnecting...');
      this.subscriptions.clear();
      this.client.deactivate();
      this.isConnected = false;
      this.notifyConnectionStatus(false);
    }
  }

  /**
   * Subscribe to parking updates from Spring backend
   * 
   * Subscribes to: /topic/parking
   * This matches ParkingService.java:
   *   simpMessagingTemplate.convertAndSend("/topic/parking", request);
   * 
   * @param {Function} callback - Called when parking data is received
   * @returns {string} Subscription ID
   */
  subscribeToParkingUpdates(callback) {
    if (!this.isConnected || !this.client) {
      console.warn('[WebSocket] Not connected. Attempting to connect...');
      
      this.connect()
        .then(() => this.subscribeToParkingUpdates(callback))
        .catch((error) => {
          console.error('[WebSocket] Failed to connect:', error);
        });
      return null;
    }

    try {
      // Subscribe to /topic/parking (matches Spring's broadcast topic)
      const subscription = this.client.subscribe('/topic/parking', (message) => {
        try {
          // Parse the parking data from Spring backend
          const parkingData = JSON.parse(message.body);
          console.log('[WebSocket] 📦 Received parking update:', parkingData);
          
          // Call the callback with the data
          callback(parkingData);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      });

      // Store subscription
      const subscriptionId = `parking-${Date.now()}`;
      this.subscriptions.set(subscriptionId, subscription);

      console.log('[WebSocket] ✅ Subscribed to /topic/parking');
      return subscriptionId;
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from a subscription
   */
  unsubscribe(subscriptionId) {
    if (this.subscriptions.has(subscriptionId)) {
      const subscription = this.subscriptions.get(subscriptionId);
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      console.log('[WebSocket] Unsubscribed:', subscriptionId);
    }
  }

  /**
   * Send message to Spring backend (if needed in the future)
   * Uses /app prefix (matches Spring's setApplicationDestinationPrefixes("/app"))
   */
  send(destination, body) {
    if (!this.isConnected || !this.client) {
      console.error('[WebSocket] Cannot send: Not connected');
      return;
    }

    try {
      this.client.publish({
        destination: `/app${destination}`,
        body: JSON.stringify(body),
      });
      console.log('[WebSocket] 📤 Sent to', destination);
    } catch (error) {
      console.error('[WebSocket] Failed to send:', error);
    }
  }

  /**
   * Register callback for connection status changes
   */
  onConnectionStatusChange(callback) {
    this.connectionStatusCallbacks.push(callback);
  }

  /**
   * Notify all callbacks of connection status change
   */
  notifyConnectionStatus(status) {
    this.connectionStatusCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('[WebSocket] Error in callback:', error);
      }
    });
  }

  /**
   * Get current connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;

