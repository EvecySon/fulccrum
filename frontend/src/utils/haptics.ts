import { Platform } from 'react-native';

let Haptics: any = null;

try {
  Haptics = require('expo-haptics');
} catch {}

export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (Platform.OS === 'web' || !Haptics) return;
  try {
    const map = {
      light: Haptics.ImpactFeedbackStyle?.Light,
      medium: Haptics.ImpactFeedbackStyle?.Medium,
      heavy: Haptics.ImpactFeedbackStyle?.Heavy,
    };
    Haptics.impactAsync?.(map[style]);
  } catch {}
};

export const hapticNotification = (type: 'success' | 'warning' | 'error' = 'success') => {
  if (Platform.OS === 'web' || !Haptics) return;
  try {
    const map = {
      success: Haptics.NotificationFeedbackType?.Success,
      warning: Haptics.NotificationFeedbackType?.Warning,
      error: Haptics.NotificationFeedbackType?.Error,
    };
    Haptics.notificationAsync?.(map[type]);
  } catch {}
};

export const hapticSelection = () => {
  if (Platform.OS === 'web' || !Haptics) return;
  try {
    Haptics.selectionAsync?.();
  } catch {}
};
