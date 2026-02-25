import { api } from './api';

export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  description?: string;
  title: string;
  body: string;
  type: string;
  category: string;
  isScheduled: boolean;
  scheduleTime?: string;
  targetRole: string[];
  conditions?: any;
  isActive: boolean;
  isDefault: boolean;
  variant?: string;
  variantGroup?: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export interface CreateTemplateRequest {
  key: string;
  name: string;
  description?: string;
  title: string;
  body: string;
  type: string;
  category: string;
  isScheduled?: boolean;
  scheduleTime?: string;
  targetRole: string[];
  conditions?: any;
  isActive?: boolean;
  variant?: string;
  variantGroup?: string;
}

export const notificationTemplatesAPI = {
  // Get all templates
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await api.get('/notifications/templates');
    return response.data;
  },

  // Get single template
  getTemplate: async (id: string): Promise<NotificationTemplate> => {
    const response = await api.get(`/notifications/templates/${id}`);
    return response.data;
  },

  // Create template
  createTemplate: async (data: CreateTemplateRequest): Promise<NotificationTemplate> => {
    const response = await api.post('/notifications/templates', data);
    return response.data;
  },

  // Update template
  updateTemplate: async (id: string, data: Partial<CreateTemplateRequest>): Promise<NotificationTemplate> => {
    const response = await api.put(`/notifications/templates/${id}`, data);
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/notifications/templates/${id}`);
  },

  // Toggle template active status
  toggleActive: async (id: string, isActive: boolean): Promise<void> => {
    await api.put(`/notifications/templates/${id}`, { isActive });
  },

  // Get template analytics
  getAnalytics: async (id: string): Promise<{
    sentCount: number;
    openCount: number;
    clickCount: number;
    openRate: number;
    clickRate: number;
  }> => {
    const response = await api.get(`/notifications/templates/${id}/analytics`);
    return response.data;
  },
};
