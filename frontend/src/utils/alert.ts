import { Alert, Platform } from 'react-native';

// Global toast event system — listeners subscribe to show toasts
type ToastListener = (msg: string) => void;
const listeners: Set<ToastListener> = new Set();

export function onToast(fn: ToastListener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function emitToast(msg: string) {
  if (listeners.size > 0) {
    listeners.forEach(fn => fn(msg));
  }
}

/**
 * Cross-platform alert that works on both web and native.
 * On web: confirm dialogs use window.confirm, success/info messages use auto-dismissing toast.
 * On native: uses React Native Alert.alert.
 */
export function showAlert(title: string, message?: string, buttons?: Array<{ text: string; style?: string; onPress?: () => void }>) {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      // Has cancel + action buttons — use confirm
      const actionBtn = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1];
      if (window.confirm(`${title}${message ? '\n\n' + message : ''}`)) {
        actionBtn?.onPress?.();
      }
    } else {
      // Simple feedback — show as auto-dismissing toast instead of blocking alert
      const text = message ? `${title}: ${message}` : title;
      emitToast(text);
      buttons?.[0]?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons as any);
  }
}
