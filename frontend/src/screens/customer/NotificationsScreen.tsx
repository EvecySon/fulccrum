import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const notifications = [
  { id: '1', type: 'order', title: 'Order Delivered!', message: 'Your order from Burger House has been delivered. Enjoy your meal!', time: '5 min ago', read: false },
  { id: '2', type: 'promo', title: '20% Off This Weekend!', message: 'Use code WEEKEND20 for 20% off all orders this Saturday & Sunday.', time: '1 hr ago', read: false },
  { id: '3', type: 'order', title: 'Order On The Way', message: 'Your courier Mike is heading to you. ETA: 8 minutes.', time: '2 hrs ago', read: true },
  { id: '4', type: 'loyalty', title: 'Points Earned! +35', message: 'You earned 35 loyalty points from your last order.', time: '3 hrs ago', read: true },
  { id: '5', type: 'system', title: 'New Restaurant Near You', message: 'Sushi Palace just joined Fulccrum! Check out their menu.', time: 'Yesterday', read: true },
  { id: '6', type: 'promo', title: 'Free Delivery Today!', message: 'All orders over ₦5,000 get free delivery. Limited time only!', time: 'Yesterday', read: true },
  { id: '7', type: 'order', title: 'Rate Your Order', message: 'How was your order from Pizza Roma? Leave a review to earn bonus points.', time: '2 days ago', read: true },
  { id: '8', type: 'loyalty', title: 'Tier Upgrade Coming!', message: 'You\'re only 650 points away from Silver tier. Keep ordering!', time: '3 days ago', read: true },
];

const getNotifIcon = (type: string) => {
  switch (type) {
    case 'order': return { name: 'receipt', color: colors.teal };
    case 'promo': return { name: 'pricetag', color: colors.warning };
    case 'loyalty': return { name: 'trophy', color: '#CD7F32' };
    case 'system': return { name: 'information-circle', color: colors.info };
    default: return { name: 'notifications', color: colors.navy };
  }
};

export default function NotificationsScreen({ navigation }: any) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="mail-unread-outline" size={18} color={colors.teal} />
          <Text style={styles.unreadText}>{unreadCount} unread notifications</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {notifications.map((notif) => {
          const icon = getNotifIcon(notif.type);
          return (
            <TouchableOpacity key={notif.id} style={[styles.notifCard, !notif.read && styles.notifUnread]}>
              <View style={[styles.notifIcon, { backgroundColor: icon.color + '15' }]}>
                <Ionicons name={icon.name as any} size={20} color={icon.color} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTitleRow}>
                  <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>{notif.title}</Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
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
});
