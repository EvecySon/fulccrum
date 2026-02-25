# Backend Requirements for Real-Time Notification System

## Overview
This document outlines the backend implementation requirements for the real-time notification and WebSocket system for agent support tickets.

---

## 1. Dependencies to Install

```bash
npm install socket.io firebase-admin
npm install --save-dev @types/socket.io
```

---

## 2. Firebase Cloud Messaging Setup

### 2.1 Initialize Firebase Admin SDK

```typescript
// src/config/firebase.ts
import * as admin from 'firebase-admin';

const serviceAccount = require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const messaging = admin.messaging();
```

### 2.2 Store FCM Tokens

Add to your User/Agent model:

```prisma
// prisma/schema.prisma
model User {
  id          String   @id @default(uuid())
  // ... existing fields
  fcmTokens   String[] // Array of FCM tokens for multiple devices
  deviceInfo  Json[]   // Store device metadata
}
```

### 2.3 API Endpoint to Update FCM Token

```typescript
// src/controllers/agent.controller.ts
async updateFCMToken(req: Request, res: Response) {
  const { fcmToken, deviceId, platform } = req.body;
  const agentId = req.user.id;

  await prisma.user.update({
    where: { id: agentId },
    data: {
      fcmTokens: {
        push: fcmToken,
      },
      deviceInfo: {
        push: {
          deviceId,
          platform,
          fcmToken,
          lastUpdated: new Date(),
        },
      },
    },
  });

  res.json({ success: true });
}
```

---

## 3. WebSocket Server Setup

### 3.1 Initialize Socket.IO Server

```typescript
// src/server.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:19006',
    credentials: true,
  },
});

// WebSocket authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const agentId = socket.handshake.auth.agentId;

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.agentId = agentId;
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  const agentId = socket.data.agentId;
  console.log(`Agent ${agentId} connected`);

  // Join agent's personal room
  socket.join(`agent-${agentId}`);

  // Update agent status to online
  updateAgentStatus(agentId, 'online');

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Agent ${agentId} disconnected`);
    updateAgentStatus(agentId, 'offline');
  });

  // Handle agent status updates
  socket.on('agent_status', (data) => {
    updateAgentStatus(agentId, data.status);
  });

  // Handle ticket room joins
  socket.on('join_ticket', (data) => {
    socket.join(`ticket-${data.ticketId}`);
  });

  socket.on('leave_ticket', (data) => {
    socket.leave(`ticket-${data.ticketId}`);
  });

  // Handle messages
  socket.on('send_message', async (data) => {
    const message = await saveMessage(data);
    io.to(`ticket-${data.ticketId}`).emit('new_message', {
      type: 'new_message',
      ticketId: data.ticketId,
      message,
    });
  });

  // Handle ticket acknowledgment
  socket.on('acknowledge_ticket', async (data) => {
    await acknowledgeTicket(data.ticketId, agentId);
  });
});

export { io };
```

### 3.2 Helper Functions

```typescript
// src/services/websocket.service.ts
import { io } from '../server';

export async function updateAgentStatus(agentId: string, status: string) {
  await prisma.user.update({
    where: { id: agentId },
    data: { status, lastSeen: new Date() },
  });
}

export async function saveMessage(data: any) {
  return await prisma.message.create({
    data: {
      ticketId: data.ticketId,
      sender: data.sender,
      message: data.message,
      timestamp: new Date(data.timestamp),
    },
  });
}

export async function acknowledgeTicket(ticketId: string, agentId: string) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      acknowledgedAt: new Date(),
      acknowledgedBy: agentId,
    },
  });
}
```

---

## 4. Push Notification Functions

### 4.1 Send Notification to Agent

```typescript
// src/services/notification.service.ts
import { messaging } from '../config/firebase';

export async function notifyAgent(
  agentId: string,
  notification: {
    title: string;
    body: string;
    data: any;
  }
) {
  // Get agent's FCM tokens
  const agent = await prisma.user.findUnique({
    where: { id: agentId },
    select: { fcmTokens: true },
  });

  if (!agent || !agent.fcmTokens.length) {
    console.log('No FCM tokens found for agent:', agentId);
    return;
  }

  // Send to all agent's devices
  const messages = agent.fcmTokens.map(token => ({
    token,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data,
    android: {
      priority: 'high' as const,
      notification: {
        sound: 'default',
        channelId: 'support_tickets',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  }));

  try {
    const response = await messaging.sendEach(messages);
    console.log('Notifications sent:', response.successCount);
    
    // Remove invalid tokens
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(agent.fcmTokens[idx]);
      }
    });

    if (failedTokens.length > 0) {
      await prisma.user.update({
        where: { id: agentId },
        data: {
          fcmTokens: {
            set: agent.fcmTokens.filter(t => !failedTokens.includes(t)),
          },
        },
      });
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}
```

### 4.2 Send WebSocket Event

```typescript
// src/services/notification.service.ts
import { io } from '../server';

export function broadcastToAgent(agentId: string, event: string, data: any) {
  io.to(`agent-${agentId}`).emit(event, data);
}

export function broadcastToTicket(ticketId: string, event: string, data: any) {
  io.to(`ticket-${ticketId}`).emit(event, data);
}
```

---

## 5. Ticket Assignment Flow

### 5.1 When Ticket is Assigned

```typescript
// src/services/ticket.service.ts
export async function assignTicket(ticketId: string, agentId: string) {
  // Update ticket in database
  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      assignedTo: agentId,
      status: 'in_progress',
      assignedAt: new Date(),
    },
    include: {
      customer: true,
      order: true,
    },
  });

  // Send push notification
  await notifyAgent(agentId, {
    title: 'New Ticket Assigned',
    body: `${ticket.customer.name} - ${ticket.subject}`,
    data: {
      type: 'ticket_assigned',
      ticketId: ticket.id,
      priority: ticket.priority,
    },
  });

  // Send WebSocket event
  broadcastToAgent(agentId, 'ticket_assigned', {
    type: 'ticket_assigned',
    ticketId: ticket.id,
    ticket,
  });

  return ticket;
}
```

### 5.2 When Message is Sent

```typescript
// src/services/message.service.ts
export async function sendMessage(ticketId: string, senderId: string, message: string) {
  const msg = await prisma.message.create({
    data: {
      ticketId,
      senderId,
      message,
      timestamp: new Date(),
    },
    include: {
      sender: true,
      ticket: {
        include: {
          assignedAgent: true,
        },
      },
    },
  });

  // Notify assigned agent
  if (msg.ticket.assignedAgent) {
    await notifyAgent(msg.ticket.assignedAgent.id, {
      title: 'New Message',
      body: msg.sender.name + ': ' + message.substring(0, 50),
      data: {
        type: 'new_message',
        ticketId,
      },
    });

    broadcastToAgent(msg.ticket.assignedAgent.id, 'new_message', {
      type: 'new_message',
      ticketId,
      message: msg,
    });
  }

  // Broadcast to ticket room
  broadcastToTicket(ticketId, 'new_message', {
    type: 'new_message',
    ticketId,
    message: msg,
  });

  return msg;
}
```

---

## 6. Auto-Assignment Logic (Optional)

### 6.1 Smart Ticket Routing

```typescript
// src/services/ticket-routing.service.ts
export async function autoAssignTicket(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  // Get available agents
  const availableAgents = await prisma.user.findMany({
    where: {
      role: 'admin',
      status: 'online',
    },
    include: {
      _count: {
        select: {
          assignedTickets: {
            where: {
              status: { in: ['open', 'in_progress'] },
            },
          },
        },
      },
    },
  });

  if (availableAgents.length === 0) {
    console.log('No available agents');
    return null;
  }

  // Find agent with least active tickets
  const agent = availableAgents.reduce((prev, current) =>
    prev._count.assignedTickets < current._count.assignedTickets ? prev : current
  );

  // Assign ticket
  await assignTicket(ticketId, agent.id);

  return agent;
}
```

---

## 7. Database Schema Updates

**IMPORTANT:** See `BACKEND_AGENT_ROLE_SYSTEM.md` for complete agent role system implementation.

```prisma
// prisma/schema.prisma

model User {
  id              String   @id @default(uuid())
  // ... existing fields
  fcmTokens       String[] // FCM tokens for push notifications
  deviceInfo      Json[]   // Device metadata
  status          String   @default("offline") // online, offline, busy, break
  lastSeen        DateTime @default(now())
  assignedTickets Ticket[] @relation("AssignedAgent")
  
  // Agent role system (see BACKEND_AGENT_ROLE_SYSTEM.md)
  agentLevel      AgentLevel?
  department      Department?
  permissions     Permission[]
  maxRefundAmount Float?   @default(0)
  agentMetrics    AgentMetrics?
}

model Ticket {
  id              String    @id @default(uuid())
  // ... existing fields
  assignedTo      String?
  assignedAgent   User?     @relation("AssignedAgent", fields: [assignedTo], references: [id])
  assignedAt      DateTime?
  acknowledgedAt  DateTime?
  acknowledgedBy  String?
  messages        Message[]
}

model Message {
  id        String   @id @default(uuid())
  ticketId  String
  ticket    Ticket   @relation(fields: [ticketId], references: [id])
  senderId  String
  sender    User     @relation(fields: [senderId], references: [id])
  message   String
  timestamp DateTime @default(now())
  read      Boolean  @default(false)
}
```

---

## 8. API Endpoints to Create

### 8.1 Agent Endpoints

```typescript
// POST /api/agent/fcm-token
// Update FCM token for push notifications
{
  fcmToken: string;
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
}

// PUT /api/agent/status
// Update agent status
{
  status: 'online' | 'offline' | 'busy' | 'break';
}

// GET /api/agent/tickets
// Get assigned tickets
// Returns: Ticket[]

// POST /api/agent/acknowledge/:ticketId
// Acknowledge ticket receipt
```

### 8.2 Ticket Endpoints

```typescript
// POST /api/tickets/:ticketId/assign
// Assign ticket to agent
{
  agentId: string;
}

// POST /api/tickets/:ticketId/messages
// Send message in ticket
{
  message: string;
  sender: string;
}

// GET /api/tickets/:ticketId/messages
// Get ticket messages
// Returns: Message[]
```

---

## 9. Environment Variables

Add to `.env`:

```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# WebSocket
SOCKET_PORT=3001
FRONTEND_URL=http://localhost:19006

# JWT
JWT_SECRET=your-jwt-secret
```

---

## 10. Testing

### 10.1 Test Push Notifications

```bash
curl -X POST http://localhost:3000/api/test/notification \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-id",
    "title": "Test Notification",
    "body": "This is a test"
  }'
```

### 10.2 Test WebSocket Connection

```javascript
// Test client
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token',
    agentId: 'agent-id',
  },
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('ticket_assigned', (data) => {
  console.log('Ticket assigned:', data);
});
```

---

## 11. Deployment Checklist

- [ ] Install dependencies (`socket.io`, `firebase-admin`)
- [ ] Set up Firebase project and download service account key
- [ ] Add environment variables
- [ ] Run database migrations (`npx prisma migrate dev`)
- [ ] Update CORS settings for WebSocket
- [ ] Configure Firebase Cloud Messaging
- [ ] Test push notifications
- [ ] Test WebSocket connections
- [ ] Set up monitoring for notification delivery
- [ ] Configure notification channels (Android)

---

## 12. Monitoring & Analytics

Track these metrics:

- Notification delivery rate
- WebSocket connection stability
- Average response time to ticket assignment
- Agent availability
- Failed notification tokens
- Message delivery latency

---

## Questions?

Contact frontend team if you need clarification on:
- Expected data formats
- WebSocket event names
- Notification payload structure
