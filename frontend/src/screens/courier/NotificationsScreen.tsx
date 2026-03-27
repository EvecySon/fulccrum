import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { notificationsAPI } from '../../services/api';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'earnings' | 'system' | 'quest' | 'safety' | 'document';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: {
    orderId?: string;
    screen?: string;
    params?: Record<string, any>;
  };
}


const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  order: { icon: 'bag-handle', color: colors.teal },
  promo: { icon: 'megaphone', color: '#f97316' },
  earnings: { icon: 'cash', color: colors.success },
  system: { icon: 'settings', color: colors.navy },
  quest: { icon: 'trophy', color: '#8b5cf6' },
  safety: { icon: 'shield-checkmark', color: colors.error },
  document: { icon: 'document-text', color: colors.warning },
};

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await notificationsAPI.getAll(filter === 'unread', pageNum);
      const data = res?.data ?? res;
      if (Array.isArray(data)) {
        if (append) setNotifications(prev => [...prev, ...data]);
        else setNotifications(data);
        setHasMore(data.length >= 20);
      }
    } catch {
      // Keep empty on error
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadNotifications(1);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await loadNotifications(nextPage, true);
    setLoading(false);
  };

  const handlePress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      notificationsAPI.markRead(notification.id).catch(() => {});
    }
    // Navigate if applicable
    if (notification.data?.screen) {
      navigation.navigate(notification.data.screen, notification.data.params);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notificationsAPI.markAllRead().catch(() => {});
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Notification', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setNotifications(prev => prev.filter(n => n.id !== id));
          notificationsAPI.delete(id).catch(() => {});
        },
      },
    ]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifUnread]}
        onPress={() => handlePress(item)}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.notifIcon, { backgroundColor: config.color + '15' }]}>
          <Ionicons name={config.icon as any} size={22} color={config.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>{item.createdAt}</Text>
        </View>
        {item.data?.screen && (
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} style={styles.chevron} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done" size={24} color={colors.textWhite} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 16 }} color={colors.teal} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread'
                ? 'You\'ve read all your notifications.'
                : 'You\'ll receive notifications about orders, earnings, and more.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.navy, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: colors.white, gap: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  filterActive: { backgroundColor: colors.teal + '15' },
  filterText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.teal },
  list: { padding: 16, paddingBottom: 100 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14,
    backgroundColor: colors.white, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  notifUnread: { backgroundColor: colors.teal + '05', borderColor: colors.teal + '20' },
  notifIcon: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  notifTitleUnread: { fontWeight: '700', color: colors.navy },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.teal },
  notifBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: colors.textLight },
  chevron: { marginLeft: 4, marginTop: 12 },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
