/**
 * WebSocket Service Layer
 * Real-time communication using Socket.io
 */

import io from 'socket.io-client';
import { WS_EVENTS } from '@/utils/constants';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to WebSocket server
   * @returns {Socket} Socket instance
   */
  connect() {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3000';

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventHandlers();

    return this.socket;
  }

  /**
   * Setup default event handlers
   */
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('✓ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('✗ WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('WebSocket disconnected manually');
    }
  }

  /**
   * Subscribe to product updates
   * @param {string} productId - Product ID to subscribe to
   */
  subscribeToProduct(productId) {
    if (this.socket?.connected) {
      this.socket.emit(WS_EVENTS.SUBSCRIBE_PRODUCT, productId);
      console.log(`Subscribed to product: ${productId}`);
    }
  }

  /**
   * Listen to specific event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove listener for specific event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function (optional)
   */
  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  /**
   * Emit event to server
   * @param {string} event - Event name
   * @param {any} data - Data to send
   */
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit: WebSocket not connected');
    }
  }

  /**
   * Listen for product registered events
   * @param {Function} callback - Callback with product data
   */
  onProductRegistered(callback) {
    this.on(WS_EVENTS.PRODUCT_REGISTERED, callback);
  }

  /**
   * Listen for checkpoint added events
   * @param {Function} callback - Callback with checkpoint data
   */
  onCheckpointAdded(callback) {
    this.on(WS_EVENTS.CHECKPOINT_ADDED, callback);
  }

  /**
   * Listen for status update events
   * @param {Function} callback - Callback with status data
   */
  onStatusUpdated(callback) {
    this.on(WS_EVENTS.STATUS_UPDATED, callback);
  }

  /**
   * Listen for temperature alert events
   * @param {Function} callback - Callback with alert data
   */
  onTemperatureAlert(callback) {
    this.on(WS_EVENTS.TEMPERATURE_ALERT, callback);
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected && this.socket?.connected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
