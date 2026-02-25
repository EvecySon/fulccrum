# Backend Implementation: Agent Role & Permission System

## Overview
Implement a tiered agent support system with role-based permissions, similar to Uber Eats/Glovo. This allows granular control over what support agents can do based on their level and department.

---

## 1. Database Schema Updates

### 1.1 Update Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  phone           String?   @unique
  name            String
  role            Role
  
  // Agent-specific fields
  agentLevel      AgentLevel?
  department      Department?
  permissions     Permission[]
  maxRefundAmount Float?     @default(0)
  
  // Agent metrics
  agentMetrics    AgentMetrics?
  
  // Existing fields...
  avatarUrl       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  assignedTickets Ticket[]  @relation("AssignedAgent")
  ticketMessages  Message[]
  fcmTokens       String[]
  deviceInfo      Json[]
  status          String    @default("offline")
  lastSeen        DateTime  @default(now())
}

enum Role {
  CUSTOMER
  MERCHANT
  COURIER
  ADMIN
}

enum AgentLevel {
  TIER1           // Basic support, limited refund authority
  TIER2           // Advanced support, full refund authority
  TIER3           // Senior support, handles escalations
  SPECIALIST      // Specialized agents (VIP, fraud, etc.)
  MANAGER         // Team lead, can assign tickets
  SUPER_ADMIN     // Full platform access
}

enum Department {
  CUSTOMER_SUPPORT
  MERCHANT_SUPPORT
  COURIER_SUPPORT
  GENERAL
  VIP_SUPPORT
  FRAUD_PREVENTION
}

enum Permission {
  VIEW_TICKETS
  CREATE_TICKETS
  ASSIGN_TICKETS
  CLOSE_TICKETS
  REOPEN_TICKETS
  ISSUE_REFUNDS
  ISSUE_LARGE_REFUNDS
  ESCALATE_TICKETS
  VIEW_ANALYTICS
  MANAGE_AGENTS
  ACCESS_ADMIN_PANEL
  EDIT_ORDERS
  BAN_USERS
  APPROVE_MERCHANTS
  MANAGE_PROMOTIONS
  VIEW_FINANCIAL_DATA
  EXPORT_DATA
}

model AgentMetrics {
  id                      String   @id @default(uuid())
  userId                  String   @unique
  user                    User     @relation(fields: [userId], references: [id])
  
  // Performance metrics
  totalTicketsHandled     Int      @default(0)
  ticketsHandledToday     Int      @default(0)
  ticketsHandledThisWeek  Int      @default(0)
  ticketsHandledThisMonth Int      @default(0)
  
  // Response metrics
  avgResponseTime         Float    @default(0) // in minutes
  avgResolutionTime       Float    @default(0) // in minutes
  firstContactResolution  Float    @default(0) // percentage
  
  // Quality metrics
  customerSatisfaction    Float    @default(0) // 0-5 rating
  totalRatings            Int      @default(0)
  slaCompliance           Float    @default(0) // percentage
  
  // Activity
  activeTickets           Int      @default(0)
  hoursWorkedToday        Float    @default(0)
  hoursWorkedThisWeek     Float    @default(0)
  hoursWorkedThisMonth    Float    @default(0)
  
  // Timestamps
  lastTicketAt            DateTime?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}

model Ticket {
  id              String        @id @default(uuid())
  subject         String
  description     String
  status          TicketStatus  @default(OPEN)
  priority        TicketPriority @default(MEDIUM)
  category        TicketCategory
  
  // Assignment
  assignedTo      String?
  assignedAgent   User?         @relation("AssignedAgent", fields: [assignedTo], references: [id])
  assignedAt      DateTime?
  acknowledgedAt  DateTime?
  acknowledgedBy  String?
  
  // Customer info
  customerId      String
  customerName    String
  customerEmail   String
  customerPhone   String?
  
  // Related entities
  orderId         String?
  merchantId      String?
  courierId       String?
  
  // SLA tracking
  slaDeadline     DateTime?
  firstResponseAt DateTime?
  resolvedAt      DateTime?
  
  // Escalation
  escalated       Boolean       @default(false)
  escalatedAt     DateTime?
  escalatedTo     String?
  escalationReason String?
  
  // Messages
  messages        Message[]
  
  // Metadata
  tags            String[]
  attachments     Json[]
  internalNotes   String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_CUSTOMER
  WAITING_INTERNAL
  RESOLVED
  CLOSED
  ESCALATED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketCategory {
  ORDER_ISSUE
  REFUND_REQUEST
  DELIVERY_PROBLEM
  PAYMENT_ISSUE
  ACCOUNT_ISSUE
  MERCHANT_COMPLAINT
  COURIER_COMPLAINT
  TECHNICAL_ISSUE
  GENERAL_INQUIRY
  VIP_REQUEST
  FRAUD_REPORT
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
  internal  Boolean  @default(false) // Internal notes vs customer-facing
  
  attachments Json[]
}

model AgentShift {
  id          String   @id @default(uuid())
  agentId     String
  startTime   DateTime
  endTime     DateTime?
  status      ShiftStatus @default(SCHEDULED)
  breakTime   Int      @default(0) // minutes
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ShiftStatus {
  SCHEDULED
  ACTIVE
  ON_BREAK
  COMPLETED
  MISSED
}
```

### 1.2 Migration Command

```bash
npx prisma migrate dev --name add_agent_role_system
npx prisma generate
```

---

## 2. Permission System Implementation

### 2.1 Permission Guard (Middleware)

Create `src/guards/permissions.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    const hasPermission = requiredPermissions.every((permission) =>
      user.permissions?.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

### 2.2 Permission Decorator

Create `src/decorators/permissions.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';
import { Permission } from '@prisma/client';

export const Permissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);
```

---

## 3. Agent Management API

### 3.1 Agent Controller

Create `src/controllers/agent.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { AgentService } from '../services/agent.service';
import { Permission } from '@prisma/client';

@Controller('agent')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AgentController {
  constructor(private agentService: AgentService) {}

  // Update FCM token for push notifications
  @Post('fcm-token')
  async updateFCMToken(@Req() req: any, @Body() body: any) {
    return this.agentService.updateFCMToken(req.user.id, body);
  }

  // Update agent status (online, offline, busy, break)
  @Put('status')
  async updateStatus(@Req() req: any, @Body() body: { status: string }) {
    return this.agentService.updateStatus(req.user.id, body.status);
  }

  // Get agent's assigned tickets
  @Get('tickets')
  async getAssignedTickets(@Req() req: any) {
    return this.agentService.getAssignedTickets(req.user.id);
  }

  // Acknowledge ticket receipt
  @Post('tickets/:ticketId/acknowledge')
  async acknowledgeTicket(@Req() req: any, @Param('ticketId') ticketId: string) {
    return this.agentService.acknowledgeTicket(ticketId, req.user.id);
  }

  // Get agent performance metrics
  @Get('metrics')
  async getMetrics(@Req() req: any) {
    return this.agentService.getMetrics(req.user.id);
  }

  // Get all agents (managers only)
  @Get('all')
  @Permissions(Permission.MANAGE_AGENTS)
  async getAllAgents() {
    return this.agentService.getAllAgents();
  }

  // Create new agent (managers only)
  @Post('create')
  @Permissions(Permission.MANAGE_AGENTS)
  async createAgent(@Body() body: any) {
    return this.agentService.createAgent(body);
  }

  // Update agent permissions (managers only)
  @Put(':agentId/permissions')
  @Permissions(Permission.MANAGE_AGENTS)
  async updatePermissions(
    @Param('agentId') agentId: string,
    @Body() body: { permissions: Permission[] },
  ) {
    return this.agentService.updatePermissions(agentId, body.permissions);
  }

  // Update agent level (managers only)
  @Put(':agentId/level')
  @Permissions(Permission.MANAGE_AGENTS)
  async updateAgentLevel(
    @Param('agentId') agentId: string,
    @Body() body: { level: string; maxRefundAmount?: number },
  ) {
    return this.agentService.updateAgentLevel(agentId, body);
  }

  // Clock in/out for shift
  @Post('shift/clock-in')
  async clockIn(@Req() req: any) {
    return this.agentService.clockIn(req.user.id);
  }

  @Post('shift/clock-out')
  async clockOut(@Req() req: any) {
    return this.agentService.clockOut(req.user.id);
  }

  // Get agent shift history
  @Get('shifts')
  async getShifts(@Req() req: any) {
    return this.agentService.getShifts(req.user.id);
  }
}
```

### 3.2 Agent Service

Create `src/services/agent.service.ts`:

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Permission, AgentLevel } from '@prisma/client';

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async updateFCMToken(agentId: string, data: any) {
    const { fcmToken, deviceId, platform } = data;

    return this.prisma.user.update({
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
  }

  async updateStatus(agentId: string, status: string) {
    return this.prisma.user.update({
      where: { id: agentId },
      data: {
        status,
        lastSeen: new Date(),
      },
    });
  }

  async getAssignedTickets(agentId: string) {
    return this.prisma.ticket.findMany({
      where: {
        assignedTo: agentId,
        status: {
          in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'],
        },
      },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async acknowledgeTicket(ticketId: string, agentId: string) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedBy: agentId,
      },
    });
  }

  async getMetrics(agentId: string) {
    return this.prisma.agentMetrics.findUnique({
      where: { userId: agentId },
    });
  }

  async getAllAgents() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        agentLevel: true,
        department: true,
        permissions: true,
        maxRefundAmount: true,
        status: true,
        lastSeen: true,
        agentMetrics: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createAgent(data: any) {
    const { email, name, password, agentLevel, department, permissions, maxRefundAmount } = data;

    // Set default permissions based on level
    const defaultPermissions = this.getDefaultPermissions(agentLevel);

    return this.prisma.user.create({
      data: {
        email,
        name,
        password, // Should be hashed
        role: 'ADMIN',
        agentLevel,
        department,
        permissions: permissions || defaultPermissions,
        maxRefundAmount: maxRefundAmount || this.getDefaultRefundLimit(agentLevel),
        agentMetrics: {
          create: {},
        },
      },
    });
  }

  async updatePermissions(agentId: string, permissions: Permission[]) {
    return this.prisma.user.update({
      where: { id: agentId },
      data: { permissions },
    });
  }

  async updateAgentLevel(agentId: string, data: any) {
    const { level, maxRefundAmount } = data;

    return this.prisma.user.update({
      where: { id: agentId },
      data: {
        agentLevel: level,
        maxRefundAmount: maxRefundAmount || this.getDefaultRefundLimit(level),
      },
    });
  }

  async clockIn(agentId: string) {
    const activeShift = await this.prisma.agentShift.findFirst({
      where: {
        agentId,
        status: 'ACTIVE',
      },
    });

    if (activeShift) {
      throw new BadRequestException('Already clocked in');
    }

    return this.prisma.agentShift.create({
      data: {
        agentId,
        startTime: new Date(),
        status: 'ACTIVE',
      },
    });
  }

  async clockOut(agentId: string) {
    const activeShift = await this.prisma.agentShift.findFirst({
      where: {
        agentId,
        status: 'ACTIVE',
      },
    });

    if (!activeShift) {
      throw new BadRequestException('No active shift found');
    }

    return this.prisma.agentShift.update({
      where: { id: activeShift.id },
      data: {
        endTime: new Date(),
        status: 'COMPLETED',
      },
    });
  }

  async getShifts(agentId: string) {
    return this.prisma.agentShift.findMany({
      where: { agentId },
      orderBy: { startTime: 'desc' },
      take: 30,
    });
  }

  // Helper methods
  private getDefaultPermissions(level: AgentLevel): Permission[] {
    switch (level) {
      case 'TIER1':
        return [
          Permission.VIEW_TICKETS,
          Permission.CREATE_TICKETS,
          Permission.CLOSE_TICKETS,
          Permission.ISSUE_REFUNDS,
        ];
      case 'TIER2':
        return [
          Permission.VIEW_TICKETS,
          Permission.CREATE_TICKETS,
          Permission.ASSIGN_TICKETS,
          Permission.CLOSE_TICKETS,
          Permission.REOPEN_TICKETS,
          Permission.ISSUE_REFUNDS,
          Permission.ISSUE_LARGE_REFUNDS,
          Permission.ESCALATE_TICKETS,
        ];
      case 'TIER3':
      case 'SPECIALIST':
        return [
          Permission.VIEW_TICKETS,
          Permission.CREATE_TICKETS,
          Permission.ASSIGN_TICKETS,
          Permission.CLOSE_TICKETS,
          Permission.REOPEN_TICKETS,
          Permission.ISSUE_REFUNDS,
          Permission.ISSUE_LARGE_REFUNDS,
          Permission.ESCALATE_TICKETS,
          Permission.VIEW_ANALYTICS,
          Permission.EDIT_ORDERS,
        ];
      case 'MANAGER':
        return [
          Permission.VIEW_TICKETS,
          Permission.CREATE_TICKETS,
          Permission.ASSIGN_TICKETS,
          Permission.CLOSE_TICKETS,
          Permission.REOPEN_TICKETS,
          Permission.ISSUE_REFUNDS,
          Permission.ISSUE_LARGE_REFUNDS,
          Permission.ESCALATE_TICKETS,
          Permission.VIEW_ANALYTICS,
          Permission.MANAGE_AGENTS,
          Permission.VIEW_FINANCIAL_DATA,
        ];
      case 'SUPER_ADMIN':
        return Object.values(Permission);
      default:
        return [Permission.VIEW_TICKETS];
    }
  }

  private getDefaultRefundLimit(level: AgentLevel): number {
    switch (level) {
      case 'TIER1': return 50; // $50 max
      case 'TIER2': return 500; // $500 max
      case 'TIER3': return 2000; // $2000 max
      case 'SPECIALIST': return 5000; // $5000 max
      case 'MANAGER': return 10000; // $10000 max
      case 'SUPER_ADMIN': return 999999; // Unlimited
      default: return 0;
    }
  }
}
```

---

## 4. Ticket Assignment Logic

### 4.1 Smart Assignment Service

Create `src/services/ticket-assignment.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TicketPriority, TicketCategory, AgentLevel } from '@prisma/client';

@Injectable()
export class TicketAssignmentService {
  constructor(private prisma: PrismaService) {}

  async autoAssignTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Get available agents based on ticket requirements
    const availableAgents = await this.getAvailableAgents(ticket);

    if (availableAgents.length === 0) {
      console.log('No available agents for ticket:', ticketId);
      return null;
    }

    // Select best agent based on workload and expertise
    const selectedAgent = this.selectBestAgent(availableAgents, ticket);

    // Assign ticket
    await this.assignTicket(ticketId, selectedAgent.id);

    return selectedAgent;
  }

  private async getAvailableAgents(ticket: any) {
    // Determine required agent level based on ticket
    const requiredLevel = this.getRequiredAgentLevel(ticket);

    return this.prisma.user.findMany({
      where: {
        role: 'ADMIN',
        status: 'online',
        agentLevel: {
          in: requiredLevel,
        },
        department: {
          in: this.getRelevantDepartments(ticket.category),
        },
      },
      include: {
        agentMetrics: true,
        _count: {
          select: {
            assignedTickets: {
              where: {
                status: {
                  in: ['OPEN', 'IN_PROGRESS'],
                },
              },
            },
          },
        },
      },
    });
  }

  private getRequiredAgentLevel(ticket: any): AgentLevel[] {
    // VIP customers or high-value orders → Tier 3 or Specialist
    if (ticket.category === 'VIP_REQUEST' || ticket.priority === 'URGENT') {
      return ['TIER3', 'SPECIALIST', 'MANAGER', 'SUPER_ADMIN'];
    }

    // Fraud reports → Specialist
    if (ticket.category === 'FRAUD_REPORT') {
      return ['SPECIALIST', 'MANAGER', 'SUPER_ADMIN'];
    }

    // Escalated tickets → Tier 2+
    if (ticket.escalated) {
      return ['TIER2', 'TIER3', 'SPECIALIST', 'MANAGER', 'SUPER_ADMIN'];
    }

    // Regular tickets → Any tier
    return ['TIER1', 'TIER2', 'TIER3', 'SPECIALIST', 'MANAGER', 'SUPER_ADMIN'];
  }

  private getRelevantDepartments(category: TicketCategory): string[] {
    switch (category) {
      case 'MERCHANT_COMPLAINT':
        return ['MERCHANT_SUPPORT', 'GENERAL'];
      case 'COURIER_COMPLAINT':
        return ['COURIER_SUPPORT', 'GENERAL'];
      case 'VIP_REQUEST':
        return ['VIP_SUPPORT', 'GENERAL'];
      case 'FRAUD_REPORT':
        return ['FRAUD_PREVENTION', 'GENERAL'];
      default:
        return ['CUSTOMER_SUPPORT', 'GENERAL'];
    }
  }

  private selectBestAgent(agents: any[], ticket: any) {
    // Sort by active tickets (least busy first)
    return agents.reduce((best, current) => {
      const bestWorkload = best._count.assignedTickets;
      const currentWorkload = current._count.assignedTickets;

      if (currentWorkload < bestWorkload) {
        return current;
      }

      // If same workload, prefer higher satisfaction rating
      if (currentWorkload === bestWorkload) {
        const bestRating = best.agentMetrics?.customerSatisfaction || 0;
        const currentRating = current.agentMetrics?.customerSatisfaction || 0;
        return currentRating > bestRating ? current : best;
      }

      return best;
    });
  }

  async assignTicket(ticketId: string, agentId: string) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedTo: agentId,
        assignedAt: new Date(),
        status: 'IN_PROGRESS',
      },
    });
  }
}
```

---

## 5. Refund Authorization Logic

### 5.1 Update Refund Service

In `src/services/refund.service.ts`:

```typescript
async processRefund(ticketId: string, agentId: string, refundData: any) {
  const agent = await this.prisma.user.findUnique({
    where: { id: agentId },
    select: {
      permissions: true,
      maxRefundAmount: true,
      agentLevel: true,
    },
  });

  const { amount, reason, destination } = refundData;

  // Check if agent has refund permission
  if (!agent.permissions.includes('ISSUE_REFUNDS')) {
    throw new ForbiddenException('You do not have permission to issue refunds');
  }

  // Check refund amount limit
  if (amount > agent.maxRefundAmount) {
    if (!agent.permissions.includes('ISSUE_LARGE_REFUNDS')) {
      throw new ForbiddenException(
        `Refund amount exceeds your limit of $${agent.maxRefundAmount}. Please escalate.`
      );
    }
  }

  // Process refund
  const refund = await this.createRefund({
    ticketId,
    agentId,
    amount,
    reason,
    destination,
  });

  // Update agent metrics
  await this.updateAgentMetrics(agentId, 'refund_issued');

  return refund;
}
```

---

## 6. API Endpoints Summary

### Agent Management
- `POST /agent/fcm-token` - Update FCM token
- `PUT /agent/status` - Update status (online/offline/busy/break)
- `GET /agent/tickets` - Get assigned tickets
- `POST /agent/tickets/:id/acknowledge` - Acknowledge ticket
- `GET /agent/metrics` - Get performance metrics
- `POST /agent/shift/clock-in` - Clock in for shift
- `POST /agent/shift/clock-out` - Clock out from shift
- `GET /agent/shifts` - Get shift history

### Manager-Only Endpoints
- `GET /agent/all` - Get all agents
- `POST /agent/create` - Create new agent
- `PUT /agent/:id/permissions` - Update permissions
- `PUT /agent/:id/level` - Update agent level

### Ticket Management
- `POST /tickets` - Create ticket
- `GET /tickets` - Get all tickets (filtered by permissions)
- `GET /tickets/:id` - Get ticket details
- `PUT /tickets/:id/assign` - Assign ticket to agent
- `PUT /tickets/:id/status` - Update ticket status
- `POST /tickets/:id/escalate` - Escalate ticket
- `POST /tickets/:id/messages` - Send message
- `POST /tickets/:id/refund` - Process refund (permission-checked)

---

## 7. Environment Variables

Add to `.env`:

```env
# Agent System
DEFAULT_TIER1_REFUND_LIMIT=50
DEFAULT_TIER2_REFUND_LIMIT=500
DEFAULT_TIER3_REFUND_LIMIT=2000
AUTO_ASSIGN_TICKETS=true
MAX_TICKETS_PER_AGENT=10
```

---

## 8. Testing Checklist

- [ ] Create agents with different levels
- [ ] Test permission-based access control
- [ ] Verify refund limits enforcement
- [ ] Test auto-assignment logic
- [ ] Verify shift tracking
- [ ] Test agent metrics calculation
- [ ] Verify WebSocket notifications work with agent roles
- [ ] Test escalation workflow
- [ ] Verify manager can manage agents
- [ ] Test department-based routing

---

## 9. Migration Steps

1. Run Prisma migration: `npx prisma migrate dev --name add_agent_role_system`
2. Create initial super admin: Run seed script
3. Update existing admin users with agent levels
4. Test permission system
5. Deploy to production

---

## 10. Seed Script Example

Create `prisma/seed-agents.ts`:

```typescript
import { PrismaClient, Permission, AgentLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create super admin
  await prisma.user.create({
    data: {
      email: 'admin@fulccrum.com',
      name: 'Super Admin',
      role: 'ADMIN',
      agentLevel: 'SUPER_ADMIN',
      department: 'GENERAL',
      permissions: Object.values(Permission),
      maxRefundAmount: 999999,
      agentMetrics: {
        create: {},
      },
    },
  });

  // Create sample agents
  const agents = [
    {
      email: 'tier1@fulccrum.com',
      name: 'John Doe',
      agentLevel: 'TIER1',
      department: 'CUSTOMER_SUPPORT',
    },
    {
      email: 'tier2@fulccrum.com',
      name: 'Jane Smith',
      agentLevel: 'TIER2',
      department: 'CUSTOMER_SUPPORT',
    },
    {
      email: 'manager@fulccrum.com',
      name: 'Mike Manager',
      agentLevel: 'MANAGER',
      department: 'GENERAL',
    },
  ];

  for (const agent of agents) {
    await prisma.user.create({
      data: {
        ...agent,
        role: 'ADMIN',
        permissions: getDefaultPermissions(agent.agentLevel as AgentLevel),
        maxRefundAmount: getDefaultRefundLimit(agent.agentLevel as AgentLevel),
        agentMetrics: {
          create: {},
        },
      },
    });
  }
}

main();
```

---

## Questions?

Contact frontend team if clarification needed on:
- Permission requirements for specific actions
- Agent UI flows
- Notification preferences by agent level
