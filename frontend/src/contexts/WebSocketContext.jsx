'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import websocketService from '@/services/websocket';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket on mount
    const socketInstance = websocketService.connect();
    setSocket(socketInstance);

    // Update connection status
    const checkConnection = setInterval(() => {
      setIsConnected(websocketService.getConnectionStatus());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      websocketService.disconnect();
    };
  }, []);

  /**
   * Subscribe to product updates
   * @param {string} productId - Product ID
   */
  const subscribeToProduct = useCallback((productId) => {
    websocketService.subscribeToProduct(productId);
  }, []);

  /**
   * Listen to event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  const on = useCallback((event, callback) => {
    websocketService.on(event, callback);
  }, []);

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  const off = useCallback((event, callback) => {
    websocketService.off(event, callback);
  }, []);

  /**
   * Emit event to server
   * @param {string} event - Event name
   * @param {any} data - Data to send
   */
  const emit = useCallback((event, data) => {
    websocketService.emit(event, data);
  }, []);

  /**
   * Listen for product registered events
   * @param {Function} callback - Callback function
   */
  const onProductRegistered = useCallback((callback) => {
    websocketService.onProductRegistered(callback);
  }, []);

  /**
   * Listen for checkpoint added events
   * @param {Function} callback - Callback function
   */
  const onCheckpointAdded = useCallback((callback) => {
    websocketService.onCheckpointAdded(callback);
  }, []);

  /**
   * Listen for status updated events
   * @param {Function} callback - Callback function
   */
  const onStatusUpdated = useCallback((callback) => {
    websocketService.onStatusUpdated(callback);
  }, []);

  /**
   * Listen for temperature alert events
   * @param {Function} callback - Callback function
   */
  const onTemperatureAlert = useCallback((callback) => {
    websocketService.onTemperatureAlert(callback);
  }, []);

  const value = {
    socket,
    isConnected,
    subscribeToProduct,
    on,
    off,
    emit,
    onProductRegistered,
    onCheckpointAdded,
    onStatusUpdated,
    onTemperatureAlert
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Custom hook to use WebSocket context
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}

export default WebSocketContext;
