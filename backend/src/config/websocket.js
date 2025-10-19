import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './database.js';

let io;

/**
 * Initialize Socket.IO server
 * @param {import('http').Server} httpServer - HTTP server instance
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        // Allow connection without auth for public features
        socket.userId = null;
        socket.userRole = null;
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return next(new Error('Authentication failed'));
      }

      // Attach user info to socket
      socket.userId = user.id;
      socket.userName = user.name;
      socket.userRole = user.role;

      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      // Allow connection but without auth
      socket.userId = null;
      socket.userRole = null;
      next();
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`, socket.userId ? `(User: ${socket.userName})` : '(Guest)');

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join product-specific room
    socket.on('track:product', (productId) => {
      console.log(`Client ${socket.id} tracking product: ${productId}`);
      socket.join(`product:${productId}`);
      socket.emit('track:product:success', { productId });
    });

    // Leave product-specific room
    socket.on('untrack:product', (productId) => {
      console.log(`Client ${socket.id} stopped tracking product: ${productId}`);
      socket.leave(`product:${productId}`);
      socket.emit('untrack:product:success', { productId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  console.log('✅ WebSocket server initialized');

  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit event to specific product watchers
 * @param {string} productId - Product ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToProduct = (productId, event, data) => {
  if (!io) return;
  io.to(`product:${productId}`).emit(event, data);
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit event to all users with specific role
 * @param {string} role - User role
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToRole = (role, event, data) => {
  if (!io) return;

  // Get all connected sockets
  const sockets = Array.from(io.sockets.sockets.values());

  // Filter by role and emit
  sockets.forEach((socket) => {
    if (socket.userRole === role) {
      socket.emit(event, data);
    }
  });
};

/**
 * Broadcast event to all connected clients
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const broadcastEvent = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};
