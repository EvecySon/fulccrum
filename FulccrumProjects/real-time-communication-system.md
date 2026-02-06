# Real-time Communication System Design

## Overview

A comprehensive real-time communication system that enables instant messaging, order tracking, notifications, and live updates across all platform components.

## Architecture Components

### 1. WebSocket Infrastructure
```javascript
// WebSocket Server Configuration
const socketConfig = {
  protocol: 'wss://',
  port: 8080,
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8, // 100 MB
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || "*",
    methods: ["GET", "POST"]
  }
};

// Socket.io Server Setup
const io = require('socket.io')(server, socketConfig);

// Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await verifyJWT(token);
    socket.userId = user.id;
    socket.userRole = user.role;
    socket.businessId = user.businessId;
    socket.driverId = user.driverId;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});
```

### 2. Room Management System
```javascript
// Room Management
class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.userRooms = new Map(); // userId -> Set of rooms
  }

  // Join room with permissions
  joinRoom(socket, roomName, permissions = []) {
    if (!this.hasPermission(socket, roomName, permissions)) {
      throw new Error('Insufficient permissions');
    }
    
    socket.join(roomName);
    
    if (!this.userRooms.has(socket.userId)) {
      this.userRooms.set(socket.userId, new Set());
    }
    this.userRooms.get(socket.userId).add(roomName);
    
    // Store room metadata
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, {
        name: roomName,
        users: new Set(),
        type: this.getRoomType(roomName),
        permissions: permissions
      });
    }
    this.rooms.get(roomName).users.add(socket.userId);
  }

  // Leave room
  leaveRoom(socket, roomName) {
    socket.leave(roomName);
    
    if (this.userRooms.has(socket.userId)) {
      this.userRooms.get(socket.userId).delete(roomName);
    }
    
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).users.delete(socket.userId);
    }
  }

  // Get room types
  getRoomType(roomName) {
    if (roomName.startsWith('order:')) return 'order';
    if (roomName.startsWith('business:')) return 'business';
    if (roomName.startsWith('driver:')) return 'driver';
    if (roomName.startsWith('support:')) return 'support';
    return 'general';
  }

  // Permission checking
  hasPermission(socket, roomName, requiredPermissions) {
    const roomType = this.getRoomType(roomName);
    const userRole = socket.userRole;
    
    const permissions = {
      order: {
        customer: ['read'],
        business_owner: ['read', 'write'],
        driver: ['read', 'write'],
        admin: ['read', 'write', 'admin']
      },
      business: {
        customer: [],
        business_owner: ['read', 'write'],
        driver: [],
        admin: ['read', 'write', 'admin']
      },
      driver: {
        customer: [],
        business_owner: [],
        driver: ['read', 'write'],
        admin: ['read', 'write', 'admin']
      },
      support: {
        customer: ['read', 'write'],
        business_owner: ['read', 'write'],
        driver: ['read', 'write'],
        admin: ['read', 'write', 'admin']
      }
    };

    const userPermissions = permissions[roomType]?.[userRole] || [];
    return requiredPermissions.every(perm => userPermissions.includes(perm));
  }
}
```

### 3. Event System Architecture
```javascript
// Event Definitions
const EVENTS = {
  // Order Events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_ACCEPTED: 'order:accepted',
  ORDER_READY: 'order:ready',
  ORDER_PICKED_UP: 'order:picked_up',
  ORDER_DELIVERED: 'order:delivered',
  
  // Driver Events
  DRIVER_LOCATION_UPDATE: 'driver:location_update',
  DRIVER_ONLINE: 'driver:online',
  DRIVER_OFFLINE: 'driver:offline',
  DRIVER_ASSIGNED: 'driver:assigned',
  DRIVER_ARRIVED: 'driver:arrived',
  
  // Business Events
  BUSINESS_NEW_ORDER: 'business:new_order',
  BUSINESS_MENU_UPDATED: 'business:menu_updated',
  BUSINESS_STATUS_CHANGED: 'business:status_changed',
  
  // Customer Events
  CUSTOMER_ORDER_UPDATE: 'customer:order_update',
  CUSTOMER_DELIVERY_UPDATE: 'customer:delivery_update',
  CUSTOMER_PROMOTION: 'customer:promotion',
  
  // Chat Events
  MESSAGE_SENT: 'chat:message_sent',
  MESSAGE_RECEIVED: 'chat:message_received',
  TYPING_STARTED: 'chat:typing_started',
  TYPING_STOPPED: 'chat:typing_stopped',
  
  // System Events
  SYSTEM_ANNOUNCEMENT: 'system:announcement',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_ALERT: 'system:alert'
};

// Event Handler System
class EventHandler {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Connection handler
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Join user-specific room
      this.roomManager.joinRoom(socket, `user:${socket.userId}`, ['read', 'write']);
      
      // Join role-specific rooms
      this.roomManager.joinRoom(socket, `role:${socket.userRole}`, ['read']);
      
      // Join business/driver specific rooms
      if (socket.businessId) {
        this.roomManager.joinRoom(socket, `business:${socket.businessId}`, ['read', 'write']);
      }
      if (socket.driverId) {
        this.roomManager.joinRoom(socket, `driver:${socket.driverId}`, ['read', 'write']);
      }
      
      // Setup event listeners
      this.setupSocketEventListeners(socket);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.handleDisconnection(socket);
      });
    });
  }

  setupSocketEventListeners(socket) {
    // Order events
    socket.on('order:join', (orderId) => {
      this.roomManager.joinRoom(socket, `order:${orderId}`, ['read']);
    });

    socket.on('order:leave', (orderId) => {
      this.roomManager.leaveRoom(socket, `order:${orderId}`);
    });

    // Chat events
    socket.on('chat:join', (chatId) => {
      this.roomManager.joinRoom(socket, `chat:${chatId}`, ['read', 'write']);
    });

    socket.on('chat:message', async (data) => {
      await this.handleChatMessage(socket, data);
    });

    socket.on('chat:typing', (data) => {
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // Location updates (drivers only)
    socket.on('driver:location', async (data) => {
      if (socket.userRole === 'driver') {
        await this.handleDriverLocationUpdate(socket, data);
      }
    });
  }

  // Handle chat messages
  async handleChatMessage(socket, data) {
    try {
      const message = await this.saveChatMessage({
        chatId: data.chatId,
        senderId: socket.userId,
        message: data.message,
        type: data.type || 'text',
        attachments: data.attachments || []
      });

      // Broadcast to chat room
      this.io.to(`chat:${data.chatId}`).emit(EVENTS.MESSAGE_RECEIVED, {
        chatId: data.chatId,
        message: message
      });

      // Send push notifications to offline users
      await this.sendChatNotifications(data.chatId, message);

    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  // Handle driver location updates
  async handleDriverLocationUpdate(socket, data) {
    try {
      // Update driver location in database
      await this.updateDriverLocation(socket.driverId, {
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading,
        speed: data.speed,
        timestamp: new Date()
      });

      // Broadcast to relevant order rooms
      const activeOrders = await this.getDriverActiveOrders(socket.driverId);
      
      for (const order of activeOrders) {
        this.io.to(`order:${order.id}`).emit(EVENTS.DRIVER_LOCATION_UPDATE, {
          orderId: order.id,
          driverId: socket.driverId,
          location: {
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date()
          }
        });
      }

    } catch (error) {
      console.error('Failed to update driver location:', error);
    }
  }

  // Handle disconnection
  async handleDisconnection(socket) {
    // Update driver status if applicable
    if (socket.userRole === 'driver') {
      await this.updateDriverStatus(socket.driverId, 'offline');
    }

    // Clean up user rooms
    const userRooms = this.roomManager.userRooms.get(socket.userId);
    if (userRooms) {
      for (const roomName of userRooms) {
        this.roomManager.leaveRoom(socket, roomName);
      }
    }
  }
}
```

### 4. Chat System Implementation
```javascript
// Chat Service
class ChatService {
  constructor(database, notificationService) {
    this.db = database;
    this.notifications = notificationService;
  }

  // Create new chat
  async createChat(participants, type = 'order') {
    const chat = await this.db.query(`
      INSERT INTO chats (type, created_at)
      VALUES ($1, NOW())
      RETURNING *
    `, [type]);

    // Add participants
    for (const participant of participants) {
      await this.db.query(`
        INSERT INTO chat_participants (chat_id, user_id, role, joined_at)
        VALUES ($1, $2, $3, NOW())
      `, [chat.id, participant.userId, participant.role]);
    }

    return chat;
  }

  // Send message
  async sendMessage(chatId, senderId, messageData) {
    const message = await this.db.query(`
      INSERT INTO chat_messages (chat_id, sender_id, message, type, attachments, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [chatId, senderId, messageData.message, messageData.type, messageData.attachments]);

    // Update last message timestamp
    await this.db.query(`
      UPDATE chats 
      SET last_message_at = NOW(), last_message = $1
      WHERE id = $2
    `, [messageData.message, chatId]);

    return message;
  }

  // Get chat history
  async getChatHistory(chatId, userId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    // Verify user is participant
    const participant = await this.db.query(`
      SELECT 1 FROM chat_participants 
      WHERE chat_id = $1 AND user_id = $2
    `, [chatId, userId]);

    if (!participant.rows.length) {
      throw new Error('User not authorized for this chat');
    }

    const messages = await this.db.query(`
      SELECT m.*, u.first_name, u.last_name, u.avatar_url
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [chatId, limit, offset]);

    return messages.rows.reverse();
  }

  // Get user chats
  async getUserChats(userId) {
    const chats = await this.db.query(`
      SELECT 
        c.id,
        c.type,
        c.last_message,
        c.last_message_at,
        cp.unread_count,
        json_agg(
          json_build_object(
            'id', u.id,
            'firstName', u.first_name,
            'lastName', u.last_name,
            'avatarUrl', u.avatar_url,
            'role', cp2.role
          )
        ) as participants
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      JOIN chat_participants cp2 ON c.id = cp2.chat_id
      JOIN users u ON cp2.user_id = u.id
      WHERE cp.user_id = $1 AND cp2.user_id != $1
      GROUP BY c.id, cp.unread_count
      ORDER BY c.last_message_at DESC
    `, [userId]);

    return chats.rows;
  }

  // Mark messages as read
  async markAsRead(chatId, userId) {
    await this.db.query(`
      UPDATE chat_participants 
      SET unread_count = 0, last_read_at = NOW()
      WHERE chat_id = $1 AND user_id = $2
    `, [chatId, userId]);

    // Notify other participants
    const participants = await this.db.query(`
      SELECT user_id FROM chat_participants 
      WHERE chat_id = $1 AND user_id != $2
    `, [chatId, userId]);

    return participants.rows.map(p => p.user_id);
  }
}
```

### 5. Notification System
```javascript
// Notification Service
class NotificationService {
  constructor(pushService, emailService, smsService) {
    this.push = pushService;
    this.email = emailService;
    this.sms = smsService;
  }

  // Send notification
  async sendNotification(userId, notificationData) {
    const { type, title, message, data, channels = ['push'] } = notificationData;

    // Get user preferences
    const user = await this.getUserPreferences(userId);
    
    const results = {};

    // Send push notification
    if (channels.includes('push') && user.preferences.pushNotifications) {
      results.push = await this.sendPushNotification(userId, {
        title,
        message,
        data,
        type
      });
    }

    // Send email
    if (channels.includes('email') && user.preferences.emailNotifications) {
      results.email = await this.sendEmailNotification(userId, {
        subject: title,
        message,
        data,
        type
      });
    }

    // Send SMS
    if (channels.includes('sms') && user.preferences.smsNotifications) {
      results.sms = await this.sendSMSNotification(userId, {
        message,
        type
      });
    }

    // Store notification in database
    await this.storeNotification(userId, notificationData, results);

    return results;
  }

  // Push notification
  async sendPushNotification(userId, data) {
    const devices = await this.getUserDevices(userId);
    
    const promises = devices.map(device => 
      this.push.sendToDevice(device.token, {
        title: data.title,
        body: data.message,
        data: data.data,
        sound: 'default',
        badge: await this.getUnreadCount(userId)
      })
    );

    const results = await Promise.allSettled(promises);
    return this.aggregateResults(results);
  }

  // Email notification
  async sendEmailNotification(userId, data) {
    const user = await this.getUser(userId);
    
    const template = this.getEmailTemplate(data.type);
    const html = template.render({
      userName: `${user.first_name} ${user.last_name}`,
      subject: data.subject,
      message: data.message,
      data: data.data
    });

    return await this.email.send({
      to: user.email,
      subject: data.subject,
      html
    });
  }

  // SMS notification
  async sendSMSNotification(userId, data) {
    const user = await this.getUser(userId);
    
    return await this.sms.send({
      to: user.phone,
      message: data.message
    });
  }

  // Get unread count
  async getUnreadCount(userId) {
    const result = await this.db.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = FALSE
    `, [userId]);

    return parseInt(result.rows[0].count);
  }
}
```

### 6. Real-time Order Tracking
```javascript
// Order Tracking Service
class OrderTrackingService {
  constructor(io, database, notificationService) {
    this.io = io;
    this.db = database;
    this.notifications = notificationService;
  }

  // Update order status
  async updateOrderStatus(orderId, status, updatedBy, notes = '') {
    // Update database
    const order = await this.db.query(`
      UPDATE orders 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, orderId]);

    // Add to status history
    await this.db.query(`
      INSERT INTO order_status_history (order_id, status, changed_by, notes, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [orderId, status, updatedBy, notes]);

    // Get order participants
    const participants = await this.getOrderParticipants(orderId);

    // Broadcast status update
    this.io.to(`order:${orderId}`).emit(EVENTS.ORDER_UPDATED, {
      orderId,
      status,
      updatedBy,
      notes,
      timestamp: new Date()
    });

    // Send notifications
    await this.sendStatusNotifications(participants, order.rows[0], status);

    return order.rows[0];
  }

  // Update driver location for order
  async updateDriverLocation(orderId, driverId, location) {
    // Update driver location
    await this.db.query(`
      UPDATE driver_profiles 
      SET current_location = POINT($1, $2), last_location_update = NOW()
      WHERE user_id = $3
    `, [location.longitude, location.latitude, driverId]);

    // Broadcast to order room
    this.io.to(`order:${orderId}`).emit(EVENTS.DRIVER_LOCATION_UPDATE, {
      orderId,
      driverId,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date()
      }
    });

    // Update ETA
    const eta = await this.calculateETA(orderId, location);
    if (eta) {
      this.io.to(`order:${orderId}`).emit('order:eta_update', {
        orderId,
        eta,
        timestamp: new Date()
      });
    }
  }

  // Calculate ETA
  async calculateETA(orderId, driverLocation) {
    const order = await this.db.query(`
      SELECT 
        o.delivery_address_id,
        da.latitude as dest_lat,
        da.longitude as dest_lon
      FROM orders o
      JOIN addresses da ON o.delivery_address_id = da.id
      WHERE o.id = $1
    `, [orderId]);

    if (!order.rows.length) return null;

    const destination = {
      latitude: order.rows[0].dest_lat,
      longitude: order.rows[0].dest_lon
    };

    // Use mapping service to calculate ETA
    const eta = await this.mappingService.calculateETA(
      driverLocation,
      destination
    );

    return eta;
  }

  // Get order participants
  async getOrderParticipants(orderId) {
    const result = await this.db.query(`
      SELECT 
        o.customer_id,
        o.business_id,
        o.driver_id,
        c.first_name as customer_name,
        c.email as customer_email,
        b.business_name,
        d.first_name as driver_name,
        d.email as driver_email
      FROM orders o
      LEFT JOIN users c ON o.customer_id = c.id
      LEFT JOIN business_profiles bp ON o.business_id = bp.user_id
      LEFT JOIN users b ON bp.user_id = b.id
      LEFT JOIN users d ON o.driver_id = d.id
      WHERE o.id = $1
    `, [orderId]);

    return result.rows[0];
  }

  // Send status notifications
  async sendStatusNotifications(participants, order, status) {
    const notifications = {
      accepted: {
        customer: {
          title: 'Order Accepted',
          message: `${participants.business_name} has accepted your order!`,
          channels: ['push', 'email']
        }
      },
      preparing: {
        customer: {
          title: 'Order Being Prepared',
          message: `Your order is now being prepared.`,
          channels: ['push']
        }
      },
      ready: {
        customer: {
          title: 'Order Ready for Pickup',
          message: `Your order is ready and waiting for the driver.`,
          channels: ['push']
        },
        driver: {
          title: 'Order Ready for Pickup',
          message: `Order is ready for pickup at ${participants.business_name}.`,
          channels: ['push', 'sms']
        }
      },
      picked_up: {
        customer: {
          title: 'Order Picked Up',
          message: `Your order has been picked up and is on the way!`,
          channels: ['push']
        }
      },
      delivered: {
        customer: {
          title: 'Order Delivered',
          message: `Your order has been delivered. Enjoy!`,
          channels: ['push', 'email']
        }
      }
    };

    const statusNotifications = notifications[status];
    if (!statusNotifications) return;

    // Send customer notification
    if (statusNotifications.customer && participants.customer_id) {
      await this.notifications.sendNotification(
        participants.customer_id,
        {
          ...statusNotifications.customer,
          type: 'order_update',
          data: { orderId: order.id, status }
        }
      );
    }

    // Send driver notification
    if (statusNotifications.driver && participants.driver_id) {
      await this.notifications.sendNotification(
        participants.driver_id,
        {
          ...statusNotifications.driver,
          type: 'order_update',
          data: { orderId: order.id, status }
        }
      );
    }
  }
}
```

### 7. Scaling & Performance

```javascript
// Redis Adapter for Socket.io
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: 'redis', port: 6379 }));

// Load Balancer Configuration
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker processes
  const server = require('http').createServer();
  const io = require('socket.io')(server);
  
  // Setup socket handlers
  setupSocketHandlers(io);
  
  server.listen(8080);
  console.log(`Worker ${process.pid} started`);
}

// Connection Pooling
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Rate Limiting for Socket Events
const rateLimit = require('socket.io-rate-limit');
const limiter = rateLimit({
  event: 'chat:message',
  limit: 10,
  duration: 60000 // 1 minute
});

io.use(limiter);
```

This comprehensive real-time communication system provides instant messaging, order tracking, notifications, and live updates across all platform components with proper scaling, security, and performance considerations.
