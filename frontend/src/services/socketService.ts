import { getAccessToken } from './api';

/**
 * Socket.io real-time service for order tracking, notifications, and chat.
 * Uses dynamic import so the app doesn't crash if socket.io-client isn't installed.
 */

let socket: any = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const SOCKET_URL = 'http://localhost:3001';

type EventHandler = (...args: any[]) => void;
const eventHandlers: Map<string, Set<EventHandler>> = new Map();

/**
 * Connect to the Socket.io server with JWT auth.
 */
export async function connectSocket(): Promise<boolean> {
  if (socket?.connected) return true;

  try {
    const { io } = require('socket.io-client');
    const token = getAccessToken();

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error: any) => {
      console.warn('[Socket] Connection error:', error.message);
    });

    // Re-register all event handlers on reconnect
    socket.on('reconnect', () => {
      eventHandlers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          socket.on(event, handler);
        });
      });
    });

    return true;
  } catch (error) {
    console.error('[Socket] Failed to connect:', error);
    return false;
  }
}

/**
 * Disconnect from the Socket.io server.
 */
export function disconnectSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  eventHandlers.clear();
}

/**
 * Subscribe to a socket event.
 */
export function onSocketEvent(event: string, handler: EventHandler) {
  if (!eventHandlers.has(event)) {
    eventHandlers.set(event, new Set());
  }
  eventHandlers.get(event)!.add(handler);

  if (socket?.connected) {
    socket.on(event, handler);
  }

  // Return unsubscribe function
  return () => {
    eventHandlers.get(event)?.delete(handler);
    if (socket) {
      socket.off(event, handler);
    }
  };
}

/**
 * Emit a socket event.
 */
export function emitSocketEvent(event: string, data?: any) {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn('[Socket] Cannot emit, not connected');
  }
}

// ─── Typed Event Helpers ───

/** Join an order room for real-time tracking */
export function joinOrderRoom(orderId: string) {
  emitSocketEvent('join:order', { orderId });
}

/** Leave an order room */
export function leaveOrderRoom(orderId: string) {
  emitSocketEvent('leave:order', { orderId });
}

/** Listen for order status changes */
export function onOrderStatusUpdate(handler: (data: { orderId: string; status: string; updatedAt: string }) => void) {
  return onSocketEvent('order:status_updated', handler);
}

/** Listen for driver location updates (customer tracking) */
export function onDriverLocationUpdate(handler: (data: { orderId: string; latitude: number; longitude: number; heading?: number }) => void) {
  return onSocketEvent('driver:location_updated', handler);
}

/** Listen for new order notifications (merchant) */
export function onNewOrder(handler: (data: { orderId: string; items: any[]; total: number }) => void) {
  return onSocketEvent('order:new', handler);
}

/** Listen for delivery assignment (courier) */
export function onDeliveryAssigned(handler: (data: { orderId: string; pickupAddress: string; deliveryAddress: string; pay: number }) => void) {
  return onSocketEvent('delivery:assigned', handler);
}

/** Listen for chat messages */
export function onChatMessage(handler: (data: { ticketId: string; message: string; senderId: string; timestamp: string }) => void) {
  return onSocketEvent('chat:message', handler);
}

/** Send a chat message */
export function sendChatMessage(ticketId: string, message: string) {
  emitSocketEvent('chat:send', { ticketId, message });
}

/** Listen for push notifications */
export function onNotification(handler: (data: { id: string; title: string; body: string; type: string }) => void) {
  return onSocketEvent('notification:new', handler);
}
