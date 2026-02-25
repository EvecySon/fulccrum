# Frontend Notification System - Setup Guide

## Overview
Complete real-time notification system for admin agents with push notifications, WebSocket updates, and in-app alerts.

---

## 1. Dependencies to Install

```bash
cd frontend
npm install expo-notifications expo-device expo-constants socket.io-client
```

---

## 2. Files Created

### Services
- ✅ `src/services/notificationService.ts` - Push notification handling
- ✅ `src/services/websocketService.ts` - Real-time WebSocket connection

### Components
- ✅ `src/components/InAppNotification.tsx` - Toast-style notifications
- ✅ `src/components/RefundActionSheet.tsx` - Enhanced refund UI

### Contexts
- ✅ `src/contexts/NotificationContext.tsx` - Global notification state

### Screens
- ✅ `src/screens/admin/NotificationCenterScreen.tsx` - Notification inbox
- ✅ `src/screens/admin/TicketDetailScreen.tsx` - Enhanced with real-time updates
- ✅ `src/screens/admin/SupportTicketsScreen.tsx` - Live ticket list

---

## 3. App Configuration

### 3.1 Update app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#1E3A8A",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

### 3.2 Add Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## 4. Wrap App with NotificationProvider

```typescript
// App.tsx
import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationContainer>
          {/* Your navigation */}
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  );
}
```

---

## 5. Add Notification Bell to Header

```typescript
// In your admin screens header
import { useNotifications } from '../contexts/NotificationContext';

function Header({ navigation }) {
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('NotificationCenter')}>
      <Ionicons name="notifications-outline" size={24} color={colors.navy} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
```

---

## 6. Usage Examples

### 6.1 Show In-App Notification

```typescript
import { useNotifications } from '../contexts/NotificationContext';

function MyComponent() {
  const { showInAppNotification } = useNotifications();

  const handleAction = () => {
    showInAppNotification({
      type: 'ticket_assigned',
      title: 'New Ticket Assigned',
      message: 'Customer complaint about missing item',
      ticketId: '123',
    });
  };
}
```

### 6.2 Listen for Real-Time Updates

```typescript
import websocketService from '../services/websocketService';

useEffect(() => {
  // Listen for new tickets
  websocketService.onTicketAssigned((data) => {
    console.log('New ticket:', data);
    // Update UI automatically
  });

  return () => {
    websocketService.removeAllListeners();
  };
}, []);
```

### 6.3 Send Message with Real-Time Sync

```typescript
const sendMessage = (ticketId: string, message: string) => {
  // Send via WebSocket for instant delivery
  websocketService.sendMessage(ticketId, message, 'agent');
  
  // Also save to backend
  await supportAPI.sendMessage(ticketId, { message });
};
```

---

## 7. Testing

### 7.1 Test Push Notifications

```typescript
// Add test button in dev mode
import notificationService from './services/notificationService';

<Button
  title="Test Notification"
  onPress={() => {
    notificationService.scheduleLocalNotification({
      type: 'ticket_assigned',
      ticketId: '123',
      title: 'Test Notification',
      body: 'This is a test',
    });
  }}
/>
```

### 7.2 Test WebSocket Connection

```typescript
// Check connection status
const isConnected = websocketService.isConnected();
console.log('WebSocket connected:', isConnected);
```

---

## 8. Features Implemented

### ✅ Push Notifications
- FCM token registration
- Multi-device support
- Badge count management
- Notification channels (Android)
- Sound & vibration
- Background notifications

### ✅ WebSocket Real-Time Updates
- Automatic reconnection
- Ticket assignment events
- New message events
- Status change events
- Typing indicators (ready)
- Presence system (ready)

### ✅ In-App Notifications
- Toast-style alerts
- Auto-dismiss (5 seconds)
- Tap to navigate
- Swipe to dismiss
- Color-coded by type
- Icon indicators

### ✅ Notification Center
- Inbox-style list
- Read/unread status
- Filter by status
- Mark all as read
- Delete notifications
- Time formatting
- Empty states

### ✅ Badge Counts
- iOS badge support
- Tab bar badges
- Header badges
- Real-time updates
- Sync across devices

---

## 9. Agent Status Management

Agents can set their status:

```typescript
// Update agent status
websocketService.updateStatus('online');  // online, offline, busy, break

// Status affects:
// - Auto-assignment eligibility
// - Notification delivery
// - Presence indicators
```

---

## 10. Notification Types

### ticket_assigned
- Agent gets assigned a new ticket
- Shows customer name and issue
- High priority notification

### ticket_updated
- Ticket status or priority changed
- Medium priority notification

### new_message
- Customer or another agent sent a message
- Shows message preview
- High priority if urgent

### escalation
- Ticket escalated to senior support
- Critical priority notification

---

## 11. Performance Optimization

### Implemented:
- Lazy loading of notifications
- Debounced WebSocket events
- Memoized components
- Efficient re-renders
- Background task handling

### Best Practices:
- Limit notification history (keep last 100)
- Clear old notifications automatically
- Batch WebSocket events
- Use pagination for large lists

---

## 12. Troubleshooting

### No Push Notifications Received
1. Check FCM token is registered: `notificationService.getPushToken()`
2. Verify backend is sending to correct token
3. Check notification permissions: Settings > App > Notifications
4. Ensure app is in foreground or background (not killed)

### WebSocket Not Connecting
1. Check `EXPO_PUBLIC_SOCKET_URL` is correct
2. Verify backend WebSocket server is running
3. Check authentication token is valid
4. Look for CORS errors in console

### Badge Count Not Updating
1. iOS only - check permissions
2. Verify `setBadgeCount()` is being called
3. Check notification context is properly wrapped

---

## 13. Next Steps (Optional Enhancements)

### Short-term:
- [ ] Add notification sound customization
- [ ] Implement quiet hours
- [ ] Add notification grouping
- [ ] Rich notifications with images

### Medium-term:
- [ ] Voice notifications
- [ ] Smart notification scheduling
- [ ] Notification analytics
- [ ] A/B testing for notification copy

### Long-term:
- [ ] AI-powered notification prioritization
- [ ] Predictive notifications
- [ ] Cross-platform sync (web dashboard)
- [ ] Notification templates

---

## 14. Security Considerations

- ✅ FCM tokens encrypted in transit
- ✅ WebSocket authentication required
- ✅ JWT token validation
- ✅ Rate limiting on notifications
- ✅ No sensitive data in notification body
- ✅ Secure token storage

---

## 15. Monitoring

Track these metrics in your analytics:

```typescript
// Log notification events
analytics.logEvent('notification_received', {
  type: notification.type,
  ticketId: notification.ticketId,
});

analytics.logEvent('notification_tapped', {
  type: notification.type,
  timeToTap: Date.now() - notification.timestamp,
});
```

---

## Support

For issues or questions:
1. Check backend requirements: `BACKEND_NOTIFICATION_REQUIREMENTS.md`
2. Review WebSocket events in browser console
3. Test with local notifications first
4. Verify FCM configuration in Firebase Console
