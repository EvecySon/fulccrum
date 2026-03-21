import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from './api';

interface TicketUpdate {
  type: 'ticket_assigned' | 'ticket_updated' | 'new_message' | 'status_changed';
  ticketId: string;
  ticket?: any;
  message?: any;
  agentId?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Connect to WebSocket server
   * Call this when agent logs in
   */
  connect(agentId: string, token: string) {
    // Use the same base URL as the REST API (handles localhost vs network IP automatically)
    const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || getApiBaseUrl();

    this.socket = io(SOCKET_URL, {
      path: '/ws',
      auth: {
        token,
        agentId,
        role: 'agent',
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  /**
   * Set up socket event handlers
   */
  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
    });
  }

  /**
   * Listen for ticket assignments
   */
  onTicketAssigned(callback: (data: TicketUpdate) => void) {
    if (!this.socket) return;
    this.socket.on('ticket_assigned', callback);
  }

  /**
   * Listen for ticket updates
   */
  onTicketUpdated(callback: (data: TicketUpdate) => void) {
    if (!this.socket) return;
    this.socket.on('ticket_updated', callback);
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (data: TicketUpdate) => void) {
    if (!this.socket) return;
    this.socket.on('new_message', callback);
  }

  /**
   * Listen for status changes
   */
  onStatusChanged(callback: (data: TicketUpdate) => void) {
    if (!this.socket) return;
    this.socket.on('status_changed', callback);
  }

  /**
   * Join a ticket room for real-time updates
   */
  joinTicket(ticketId: string) {
    if (!this.socket) return;
    this.socket.emit('join_ticket', { ticketId });
  }

  /**
   * Leave a ticket room
   */
  leaveTicket(ticketId: string) {
    if (!this.socket) return;
    this.socket.emit('leave_ticket', { ticketId });
  }

  /**
   * Send a message
   */
  sendMessage(ticketId: string, message: string, sender: string) {
    if (!this.socket) return;
    this.socket.emit('send_message', {
      ticketId,
      message,
      sender,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update agent status
   */
  updateStatus(status: 'online' | 'offline' | 'busy' | 'break') {
    if (!this.socket) return;
    this.socket.emit('agent_status', { status });
  }

  /**
   * Acknowledge ticket assignment
   */
  acknowledgeTicket(ticketId: string) {
    if (!this.socket) return;
    this.socket.emit('acknowledge_ticket', { ticketId });
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    if (!this.socket) return;
    this.socket.off('ticket_assigned');
    this.socket.off('ticket_updated');
    this.socket.off('new_message');
    this.socket.off('status_changed');
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new WebSocketService();
