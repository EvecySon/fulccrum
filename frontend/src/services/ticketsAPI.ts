import { apiRequest } from './api';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderId?: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaDeadline?: string;
  firstResponseAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  assignedAgent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  category: string;
  priority: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderId?: string;
}

export interface AssignTicketDto {
  agentId: string;
}

export interface SendMessageDto {
  message: string;
  isInternal?: boolean;
}

export interface UpdateTicketStatusDto {
  status: string;
}

export const ticketsAPI = {
  // Get all tickets with optional filters
  getTickets: async (params?: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    
    const query = queryParams.toString();
    return apiRequest<Ticket[]>(`/tickets${query ? `?${query}` : ''}`);
  },

  // Get single ticket with messages
  getTicket: async (ticketId: string) => {
    return apiRequest<Ticket>(`/tickets/${ticketId}`);
  },

  // Create new ticket
  createTicket: async (data: CreateTicketDto) => {
    return apiRequest<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Assign ticket to agent
  assignTicket: async (ticketId: string, data: AssignTicketDto) => {
    return apiRequest<Ticket>(`/tickets/${ticketId}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Auto-assign ticket
  autoAssignTicket: async (ticketId: string) => {
    return apiRequest<Ticket>(`/tickets/${ticketId}/auto-assign`, {
      method: 'POST',
    });
  },

  // Send message in ticket
  sendMessage: async (ticketId: string, data: SendMessageDto) => {
    return apiRequest<TicketMessage>(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get ticket messages
  getMessages: async (ticketId: string) => {
    return apiRequest<TicketMessage[]>(`/tickets/${ticketId}/messages`);
  },

  // Update ticket status
  updateStatus: async (ticketId: string, data: UpdateTicketStatusDto) => {
    return apiRequest<Ticket>(`/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update ticket priority
  updatePriority: async (ticketId: string, priority: string) => {
    return apiRequest<Ticket>(`/tickets/${ticketId}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority }),
    });
  },

  // Process refund
  processRefund: async (ticketId: string, refundData: {
    amount: number;
    type: 'full' | 'partial';
    destination: 'wallet' | 'original_payment';
    chargedTo: 'merchant' | 'platform' | 'courier';
    reason: string;
    orderId?: string;
  }) => {
    return apiRequest(`/tickets/${ticketId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  },
};
