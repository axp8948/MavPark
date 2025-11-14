import { useEffect, useState, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

/**
 * React Hook for WebSocket Integration with Spring Backend
 * 
 * Automatically connects to Spring Boot WebSocket server and subscribes to parking updates.
 * 
 * @param {Object} options - Configuration
 * @param {boolean} options.autoConnect - Auto-connect on mount (default: true)
 * @param {boolean} options.autoSubscribe - Auto-subscribe to parking updates (default: true)
 * 
 * @returns {Object} WebSocket state and methods
 * - isConnected: boolean - Connection status
 * - parkingData: object - Latest parking data from Spring backend
 *     {parkingLotName, totalSpots, freeSpots, occupiedSpots}
 * - error: string - Error message if any
 * - connect: function - Manually connect
 * - disconnect: function - Manually disconnect
 * - subscribe: function - Manually subscribe to parking updates
 * 
 * @example
 * const { isConnected, parkingData, error } = useWebSocket();
 * 
 * useEffect(() => {
 *   if (parkingData) {
 *     console.log('Lot:', parkingData.parkingLotName);
 *     console.log('Free:', parkingData.freeSpots);
 *   }
 * }, [parkingData]);
 */
export const useWebSocket = (options = {}) => {
  const {
    autoConnect = true,
    autoSubscribe = true,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [parkingData, setParkingData] = useState(null);
  const [error, setError] = useState(null);

  // Refs
  const subscriptionIdRef = useRef(null);
  const isConnectingRef = useRef(false);

  /**
   * Handle parking data from Spring backend
   */
  const handleParkingUpdate = useCallback((data) => {
    console.log('[useWebSocket] Received from Spring:', data);
    setParkingData(data);
    setError(null);
  }, []);

  /**
   * Handle connection status changes
   */
  const handleConnectionStatusChange = useCallback((status) => {
    console.log('[useWebSocket] Connection status:', status);
    setIsConnected(status);
    
    if (!status) {
      setError('Disconnected from Spring backend');
    } else {
      setError(null);
    }
  }, []);

  /**
   * Connect to Spring WebSocket server
   */
  const connect = useCallback(async () => {
    if (isConnectingRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;
      console.log('[useWebSocket] Connecting to Spring backend...');
      
      await websocketService.connect();
      setIsConnected(true);
      setError(null);
      
      console.log('[useWebSocket] ✅ Connected to Spring backend');
    } catch (err) {
      console.error('[useWebSocket] ❌ Connection failed:', err);
      setError(err.message || 'Failed to connect to Spring backend');
      setIsConnected(false);
    } finally {
      isConnectingRef.current = false;
    }
  }, []);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    console.log('[useWebSocket] Disconnecting...');
    
    if (subscriptionIdRef.current) {
      websocketService.unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
    }
    
    websocketService.disconnect();
    setIsConnected(false);
  }, []);

  /**
   * Subscribe to parking updates from /topic/parking
   */
  const subscribe = useCallback(() => {
    if (subscriptionIdRef.current) {
      console.log('[useWebSocket] Already subscribed');
      return;
    }

    console.log('[useWebSocket] Subscribing to /topic/parking...');
    const subId = websocketService.subscribeToParkingUpdates(handleParkingUpdate);
    subscriptionIdRef.current = subId;
  }, [handleParkingUpdate]);

  /**
   * Initialize WebSocket connection on mount
   */
  useEffect(() => {
    // Register connection status callback
    websocketService.onConnectionStatusChange(handleConnectionStatusChange);

    // Auto-connect if enabled
    if (autoConnect) {
      connect().then(() => {
        // Auto-subscribe if enabled and connected
        if (autoSubscribe) {
          subscribe();
        }
      });
    }

    // Cleanup on unmount
    return () => {
      console.log('[useWebSocket] Cleaning up...');
      
      if (subscriptionIdRef.current) {
        websocketService.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
      
      // Note: Don't disconnect the service as other components might be using it
    };
  }, [autoConnect, autoSubscribe, connect, subscribe, handleConnectionStatusChange]);

  return {
    // State
    isConnected,
    parkingData,
    error,
    
    // Methods
    connect,
    disconnect,
    subscribe,
  };
};

export default useWebSocket;

