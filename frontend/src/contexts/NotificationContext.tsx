import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import websocketService from '../services/websocketService';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

interface Notification {
  id: string;
  type: 'ticket_assigned' | 'ticket_updated' | 'new_message' | 'escalation';
  title: string;
  message: string;
  ticketId: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showInAppNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentInAppNotification, setCurrentInAppNotification] = useState<Notification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize notification services
  useEffect(() => {
    if (user && user.role === 'admin') {
      initializeServices();
    }

    return () => {
      notificationService.removeListeners();
      websocketService.disconnect();
    };
  }, [user]);

  const initializeServices = async () => {
    // Get push token and send to backend
    const token = await notificationService.initialize(user!.id);
    if (token) {
      // TODO: Send token to backend
      console.log('Push token:', token);
      // await adminAPI.updatePushToken(token);
    }

    // Configure notification channels
    await notificationService.configureChannels();

    // Set up notification listeners
    notificationService.setupListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );

    // Connect to WebSocket
    const authToken = ''; // TODO: Get from auth context
    websocketService.connect(user!.id, authToken);

    // Listen for ticket assignments
    websocketService.onTicketAssigned(handleTicketAssigned);
    websocketService.onTicketUpdated(handleTicketUpdated);
    websocketService.onNewMessage(handleNewMessage);
  };

  const handleNotificationReceived = (notification: Notifications.Notification) => {
    const data = notification.request.content.data as any;
    addNotification({
      type: (data?.type as any) || 'ticket_assigned',
      title: notification.request.content.title || 'New Notification',
      message: notification.request.content.body || '',
      ticketId: (data?.ticketId as string) || '',
      data,
    });
  };

  const handleNotificationTapped = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    // TODO: Navigate to ticket detail
    console.log('Notification tapped:', data);
  };

  const handleTicketAssigned = useCallback((data: any) => {
    addNotification({
      type: 'ticket_assigned',
      title: 'New Ticket Assigned',
      message: `${data.ticket?.subject || 'New support ticket'}`,
      ticketId: data.ticketId,
      data: data.ticket,
    });
  }, []);

  const handleTicketUpdated = useCallback((data: any) => {
    addNotification({
      type: 'ticket_updated',
      title: 'Ticket Updated',
      message: `Ticket #${data.ticketId} has been updated`,
      ticketId: data.ticketId,
      data,
    });
  }, []);

  const handleNewMessage = useCallback((data: any) => {
    addNotification({
      type: 'new_message',
      title: 'New Message',
      message: data.message?.message || 'You have a new message',
      ticketId: data.ticketId,
      data,
    });
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setCurrentInAppNotification(newNotification);
    
    // Update badge count
    notificationService.setBadgeCount(unreadCount + 1);

    // Auto-hide in-app notification after 5 seconds
    setTimeout(() => {
      setCurrentInAppNotification(null);
    }, 5000);
  };

  const showInAppNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    addNotification(notification);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    const newUnreadCount = notifications.filter(n => !n.read && n.id !== notificationId).length;
    notificationService.setBadgeCount(newUnreadCount);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notificationService.setBadgeCount(0);
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const newUnreadCount = notifications.filter(n => !n.read && n.id !== notificationId).length;
    notificationService.setBadgeCount(newUnreadCount);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    notificationService.clearAllNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showInAppNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
