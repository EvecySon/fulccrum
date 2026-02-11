import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { notificationsAPI } from '../../services/api';

const PREFS_KEY = 'notification_preferences';

const NOTIFICATION_PREFS = [
  { key: 'order_updates', icon: 'receipt-outline', label: 'Order Updates', desc: 'Status changes, confirmations, and delivery updates' },
  { key: 'promotions', icon: 'pricetag-outline', label: 'Promotions & Offers', desc: 'Discounts, flash sales, and special deals' },
  { key: 'delivery_updates', icon: 'bicycle-outline', label: 'Delivery Tracking', desc: 'Real-time driver location and ETA updates' },
  { key: 'payment_alerts', icon: 'card-outline', label: 'Payment Alerts', desc: 'Payment confirmations, refunds, and wallet activity' },
  { key: 'loyalty_rewards', icon: 'trophy-outline', label: 'Loyalty & Rewards', desc: 'Points earned, tier upgrades, and reward reminders' },
  { key: 'new_restaurants', icon: 'restaurant-outline', label: 'New Restaurants', desc: 'When new restaurants open near you' },
  { key: 'review_reminders', icon: 'star-outline', label: 'Review Reminders', desc: 'Reminders to rate your recent orders' },
  { key: 'support_messages', icon: 'chatbubble-outline', label: 'Support Messages', desc: 'Replies from customer support' },
  { key: 'system_alerts', icon: 'information-circle-outline', label: 'System Alerts', desc: 'App updates, maintenance, and important notices' },
  { key: 'push_notifications', icon: 'phone-portrait-outline', label: 'Push Notifications', desc: 'Show notifications on your device lock screen' },
  { key: 'email_notifications', icon: 'mail-outline', label: 'Email Notifications', desc: 'Receive order summaries and receipts via email' },
  { key: 'sms_notifications', icon: 'chatbox-outline', label: 'SMS Notifications', desc: 'Text messages for critical order updates' },
];

const getNotifIcon = (type: string) => {
  switch (type) {
    case 'order_update': return { name: 'receipt', color: colors.teal };
    case 'delivery_update': return { name: 'bicycle', color: colors.navy };
    case 'payment_update': return { name: 'card', color: colors.success };
    case 'promotion': return { name: 'pricetag', color: colors.warning };
    case 'system_alert': return { name: 'information-circle', color: colors.info };
    case 'support_message': return { name: 'chatbubble', color: colors.teal };
    case 'review_request': return { name: 'star', color: '#CD7F32' };
    default: return { name: 'notifications', color: colors.navy };
  }
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

type TabType = 'preferences' | 'inbox';

export default function NotificationsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>('preferences');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load preferences from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PREFS_KEY);
        if (stored) {
          setPrefs(JSON.parse(stored));
        } else {
          // Default: all ON
          const defaults: Record<string, boolean> = {};
          NOTIFICATION_PREFS.forEach(p => { defaults[p.key] = true; });
          setPrefs(defaults);
        }
      } catch {
        const defaults: Record<string, boolean> = {};
        NOTIFICATION_PREFS.forEach(p => { defaults[p.key] = true; });
        setPrefs(defaults);
      }
    })();
  }, []);

  const togglePref = async (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const loadNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNotifications(data);
    } catch (e: any) {
      if (!isRefresh) Alert.alert('Error', e?.message || 'Could not load notifications');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleTapNotification = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await notificationsAPI.markRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch { /* ignore */ }
    }
    if (notif.type === 'order_update' && notif.data?.orderId) {
      navigation.navigate('OrderTracking', { orderId: notif.data.orderId });
    } else if (notif.type === 'support_message') {
      navigation.navigate('Chat');
    } else if (notif.type === 'review_request' && notif.data?.orderId) {
      navigation.navigate('Feedback', { orderId: notif.data.orderId });
    }
  };

  const handleDeleteNotification = (notif: any) => {
    Alert.alert('Delete Notification', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await notificationsAPI.delete(notif.id);
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not delete notification');
          }
        },
      },
    ]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {activeTab === 'inbox' && unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preferences' && styles.tabActive]}
          onPress={() => setActiveTab('preferences')}
        >
          <Ionicons name="settings-outline" size={16} color={activeTab === 'preferences' ? colors.teal : colors.textLight} />
          <Text style={[styles.tabText, activeTab === 'preferences' && styles.tabTextActive]}>Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inbox' && styles.tabActive]}
          onPress={() => setActiveTab('inbox')}
        >
          <Ionicons name="mail-outline" size={16} color={activeTab === 'inbox' ? colors.teal : colors.textLight} />
          <Text style={[styles.tabText, activeTab === 'inbox' && styles.tabTextActive]}>
            Inbox{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'preferences' ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          <View style={styles.prefSummary}>
            <Ionicons name="notifications" size={20} color={colors.teal} />
            <Text style={styles.prefSummaryText}>
              {enabledCount} of {NOTIFICATION_PREFS.length} notifications enabled
            </Text>
          </View>

          {NOTIFICATION_PREFS.map((pref, idx) => (
            <View key={pref.key} style={[styles.prefRow, idx === NOTIFICATION_PREFS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[styles.prefIcon, { backgroundColor: (prefs[pref.key] ? colors.teal : colors.textLight) + '12' }]}>
                <Ionicons name={pref.icon as any} size={20} color={prefs[pref.key] ? colors.teal : colors.textLight} />
              </View>
              <View style={styles.prefInfo}>
                <Text style={styles.prefLabel}>{pref.label}</Text>
                <Text style={styles.prefDesc}>{pref.desc}</Text>
              </View>
              <Switch
                value={prefs[pref.key] ?? true}
                onValueChange={() => togglePref(pref.key)}
                trackColor={{ false: colors.border, true: colors.teal + '50' }}
                thumbColor={prefs[pref.key] ? colors.teal : colors.textLight}
              />
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="checkmark-circle-outline" size={56} color={colors.teal} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 }}>All Caught Up!</Text>
          <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8 }}>
            No new notifications. Order updates, promotions, and alerts will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} tintColor={colors.teal} />}
        >
          {unreadCount > 0 && (
            <View style={styles.unreadBanner}>
              <Ionicons name="mail-unread-outline" size={18} color={colors.teal} />
              <Text style={styles.unreadText}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</Text>
            </View>
          )}
          {notifications.map((notif) => {
            const icon = getNotifIcon(notif.type);
            return (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, !notif.isRead && styles.notifUnread]}
                onPress={() => handleTapNotification(notif)}
                onLongPress={() => handleDeleteNotification(notif)}
              >
                <View style={[styles.notifIcon, { backgroundColor: icon.color + '15' }]}>
                  <Ionicons name={icon.name as any} size={20} color={icon.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, !notif.isRead && styles.notifTitleUnread]} numberOfLines={1}>{notif.title}</Text>
                    {!notif.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
                  <Text style={styles.notifTime}>{formatTimeAgo(notif.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  markAll: { fontSize: 13, fontWeight: '600', color: colors.teal },
  unreadBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.teal + '10',
    marginHorizontal: 10, marginTop: 10, borderRadius: 12, padding: 12, gap: 8,
  },
  unreadText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  notifCard: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, padding: 14,
    marginBottom: 8, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  notifUnread: { backgroundColor: colors.teal + '06', borderWidth: 1, borderColor: colors.teal + '15' },
  notifIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  notifTitleUnread: { fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.teal },
  notifMessage: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginTop: 4 },
  notifTime: { fontSize: 11, color: colors.textLight, marginTop: 6 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: 10, marginTop: 10, backgroundColor: colors.white,
    borderRadius: 14, padding: 4, gap: 4,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 10, gap: 6,
  },
  tabActive: { backgroundColor: colors.teal + '10' },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textLight },
  tabTextActive: { color: colors.teal },
  prefSummary: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.teal + '08',
    borderRadius: 12, padding: 14, gap: 10, marginBottom: 10,
  },
  prefSummaryText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  prefRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    paddingVertical: 14, paddingHorizontal: 16, gap: 12,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  prefIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  prefInfo: { flex: 1 },
  prefLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  prefDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
});
