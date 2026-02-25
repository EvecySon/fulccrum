import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    // Create notification channel for Android
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Orders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push notification permissions');
      return null;
    }
    
    // Get Expo Push Token
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    
    console.log('Expo Push Token:', token);
  } else {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  return token;
}

export async function registerTokenWithBackend(token: string) {
  try {
    await api.post('/notifications/register-token', {
      token,
      platform: Platform.OS,
      deviceId: Device.deviceName || 'unknown',
    });
    console.log('Token registered with backend');
    return true;
  } catch (error) {
    console.error('Failed to register token with backend:', error);
    return false;
  }
}

export async function unregisterToken(token: string) {
  try {
    await api.delete(`/notifications/remove-token`, {
      data: { token },
    });
    console.log('Token unregistered from backend');
  } catch (error) {
    console.error('Failed to unregister token:', error);
  }
}

export function setupNotificationListeners(navigation: any) {
  // Notification received while app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
    }
  );

  // User tapped on notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      
      // Navigate based on notification type
      if (data.type === 'new_order' && data.orderId) {
        navigation.navigate('OrderDetails', { orderId: data.orderId });
      } else if (data.type === 'timeout' && data.merchantPhone) {
        navigation.navigate('OrderDetails', { 
          orderId: data.orderId,
          showCallMerchant: true,
        });
      } else if (data.type === 'reminder' && data.orderId) {
        navigation.navigate('OrderDetails', { orderId: data.orderId });
      }
    }
  );

  // Cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}
