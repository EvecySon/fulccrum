import { apiRequest } from './api';

export interface AgentMetrics {
  totalTicketsHandled: number;
  ticketsHandledToday: number;
  ticketsHandledThisWeek: number;
  ticketsHandledThisMonth: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  firstContactResolution: number;
  customerSatisfaction: number;
  totalRatings: number;
  slaCompliance: number;
  activeTickets: number;
  hoursWorkedToday: number;
  hoursWorkedThisWeek: number;
  hoursWorkedThisMonth: number;
}

export interface UpdateFCMTokenDto {
  fcmToken: string;
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
}

export interface UpdateAgentStatusDto {
  status: 'online' | 'offline' | 'busy' | 'break';
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  agentStatus?: string;
  agentLevel?: string;
  department?: string;
  lastSeen?: string;
}

export const agentAPI = {
  // Register FCM token for push notifications
  updateFCMToken: async (data: UpdateFCMTokenDto) => {
    return apiRequest('/agent/fcm-token', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update agent status
  updateStatus: async (data: UpdateAgentStatusDto) => {
    return apiRequest('/agent/status', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get assigned tickets
  getAssignedTickets: async () => {
    return apiRequest('/agent/tickets');
  },

  // Acknowledge ticket receipt
  acknowledgeTicket: async (ticketId: string) => {
    return apiRequest(`/agent/acknowledge/${ticketId}`, {
      method: 'POST',
    });
  },

  // Get agent performance metrics
  getMetrics: async () => {
    return apiRequest<AgentMetrics>('/agent/metrics');
  },

  // Get list of available agents
  getAgentList: async () => {
    return apiRequest<Agent[]>('/agent/list');
  },
};
