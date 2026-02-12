import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { analyticsAPI, ordersAPI, reviewsAPI, menuAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function MerchantDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [rating, setRating] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState<{day: string; amount: number}[]>(
    DAY_NAMES.map(d => ({ day: d, amount: 0 }))
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [businessName, setBusinessName] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      const [dashRes, ordersRes, weekRes, reviewsRes, hoursRes] = await Promise.all([
        analyticsAPI.dashboard().catch(() => null),
        ordersAPI.getBusinessOrders('me', 1, 5).catch(() => null),
        analyticsAPI.merchantAnalytics('week').catch(() => null),
        reviewsAPI.getBusinessReviews('me', 1).catch(() => null),
        menuAPI.getBusinessHours('me').catch(() => null),
      ]);

      // Dashboard stats
      if (dashRes) {
        setTodayRevenue(Number(dashRes.todayRevenue || 0));
        setTodayOrders(dashRes.todayOrders || 0);
        setRating(dashRes.rating || 0);
        setPendingOrders(dashRes.pendingOrders || 0);
        const totalRev = Number(dashRes.totalRevenue || 0);
        const totalOrd = dashRes.totalOrders || 0;
        setAvgOrderValue(totalOrd > 0 ? totalRev / totalOrd : 0);
      }

      // Recent orders
      if (ordersRes?.data) setOrders(ordersRes.data);
      else if (Array.isArray(ordersRes)) setOrders(ordersRes.slice(0, 5));

      // Weekly analytics
      if (weekRes?.kpis) {
        // Build weekly earnings from hourly data or use kpis
        if (weekRes.topItems) setTopItems(weekRes.topItems.slice(0, 5));
      }

      // Reviews
      if (reviewsRes?.data) setReviews(reviewsRes.data.slice(0, 3));
      else if (Array.isArray(reviewsRes)) setReviews(reviewsRes.slice(0, 3));

      // Business hours - check if currently open
      if (Array.isArray(hoursRes)) {
        const today = new Date().getDay();
        const todayHours = hoursRes.find((h: any) => h.dayOfWeek === today);
        if (todayHours) {
          if (todayHours.isClosed) {
            setIsOpen(false);
          } else {
            const now = new Date();
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const [openH, openM] = (todayHours.openingTime || '0:0').split(':').map(Number);
            const [closeH, closeM] = (todayHours.closingTime || '23:59').split(':').map(Number);
            setIsOpen(nowMins >= openH * 60 + openM && nowMins <= closeH * 60 + closeM);
          }
        }
      }

      // Business name from user profile
      if ((user as any)?.businessProfile?.businessName) {
        setBusinessName((user as any).businessProfile.businessName);
      } else if (user?.firstName) {
        setBusinessName(user.firstName + "'s Store");
      }
    } catch (e: any) {
      console.log('Dashboard load error:', e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { loadDashboard(); }, [loadDashboard]));

  const onRefresh = () => { setRefreshing(true); loadDashboard(); };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await ordersAPI.updateStatus(orderId, 'accepted');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o));
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not accept order'); }
  };

  const handleRejectOrder = (orderId: string) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await ordersAPI.updateStatus(orderId, 'rejected');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o));
          } catch (e: any) { Alert.alert('Error', e?.message || 'Could not reject order'); }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.info;
      case 'accepted': return colors.teal;
      case 'preparing': return colors.warning;
      case 'ready': return '#22c55e';
      case 'picked_up': return colors.navy;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      case 'rejected': return colors.error;
      default: return colors.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'New';
      case 'accepted': return 'Accepted';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'picked_up': return 'Picked Up';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.storeName}>{businessName || user?.firstName || 'My Store'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusBadge}>
            <View style={[styles.onlineDot, { backgroundColor: isOpen ? colors.success : colors.error }]} />
            <Text style={styles.statusText}>{isOpen ? 'Open' : 'Closed'}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.textWhite} />
            {pendingOrders > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
      >
        {loading && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={colors.navy} />
          </View>
        )}

        {/* Pending Orders Alert */}
        {pendingOrders > 0 && (
          <TouchableOpacity style={styles.pendingAlert} onPress={() => navigation.navigate('Orders')}>
            <View style={styles.pendingIcon}>
              <Ionicons name="alert-circle" size={22} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingTitle}>{pendingOrders} Pending Order{pendingOrders > 1 ? 's' : ''}</Text>
              <Text style={styles.pendingSubtitle}>Tap to review and accept</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="cash-outline" size={22} color={colors.teal} />
            </View>
            <Text style={styles.statValue}>₦{todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="receipt-outline" size={22} color={colors.navy} />
            </View>
            <Text style={styles.statValue}>{todayOrders}</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="trending-up-outline" size={22} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>₦{avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.statLabel}>Avg Order Value</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="star-outline" size={22} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{rating > 0 ? rating.toFixed(1) : '—'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Weekly Earnings Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Earnings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
              <Text style={styles.chartLink}>View Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartBars}>
            {weeklyEarnings.map((item, index) => {
              const maxAmount = Math.max(...weeklyEarnings.map(e => e.amount), 1);
              const barHeight = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 5;
              const todayIdx = new Date().getDay();
              const isToday = index === todayIdx;
              return (
                <View key={item.day} style={styles.barContainer}>
                  <Text style={styles.barValue}>
                    {item.amount >= 1000 ? `₦${(item.amount / 1000).toFixed(1)}k` : `₦${item.amount}`}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(barHeight, 5)}%`,
                          backgroundColor: isToday ? colors.teal : colors.navy + '40',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isToday && { color: colors.teal, fontWeight: '700' }]}>
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Orders')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="receipt-outline" size={24} color={colors.teal} />
            </View>
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Menu')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="restaurant-outline" size={24} color={colors.navy} />
            </View>
            <Text style={styles.actionText}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Analytics')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="bar-chart-outline" size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Settings')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="settings-outline" size={24} color={colors.error} />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {orders.length === 0 && !loading && (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Ionicons name="receipt-outline" size={40} color={colors.textLight} />
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8 }}>No orders yet</Text>
            </View>
          )}
          {orders.slice(0, 5).map((order) => {
            const customerName = order.customer
              ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
              : 'Customer';
            const orderItems = (order.items || []).map((oi: any) =>
              `${oi.quantity > 1 ? oi.quantity + 'x ' : ''}${oi.menuItem?.name || 'Item'}`
            );
            const total = Number(order.totalAmount || 0);
            return (
            <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => navigation.navigate('Orders')}>
              <View style={styles.orderTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderCustomer}>{customerName}</Text>
                  <Text style={styles.orderId}>#{order.orderNumber} · {timeAgo(order.placedAt || order.createdAt)}</Text>
                </View>
                <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                  <View style={[styles.orderStatusDot, { backgroundColor: getStatusColor(order.status) }]} />
                  <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>
              {orderItems.length > 0 && (
              <View style={styles.orderItems}>
                {orderItems.map((item: string, idx: number) => (
                  <Text key={idx} style={styles.orderItemText}>• {item}</Text>
                ))}
              </View>
              )}
              <View style={styles.orderBottom}>
                <Text style={styles.orderTotal}>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                {order.status === 'pending' && (
                  <View style={styles.orderActions}>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectOrder(order.id)}>
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptOrder(order.id)}>
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            );
          })}
        </View>

        {/* Top Sellers Today */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Sellers Today</Text>
          {topItems.length === 0 && !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="trophy-outline" size={36} color={colors.textLight} />
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8 }}>Top sellers will appear as orders come in</Text>
            </View>
          ) : (
            topItems.map((item: any, idx: number) => (
              <View key={idx} style={styles.topSellerRow}>
                <View style={styles.topSellerRank}>
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                </View>
                <View style={styles.topSellerInfo}>
                  <Text style={styles.topSellerName}>{item.name || item.menuItem?.name || 'Item'}</Text>
                  <Text style={styles.topSellerMeta}>{item.count || item.quantity || 0} orders · ₦{Number(item.revenue || 0).toLocaleString()}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Advanced Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Tools</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SmartKitchen')}>
              <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' + '15' }]}>
                <Ionicons name="restaurant-outline" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.actionText}>Kitchen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AIInsights')}>
              <View style={[styles.actionIcon, { backgroundColor: '#ec4899' + '15' }]}>
                <Ionicons name="sparkles-outline" size={24} color="#ec4899" />
              </View>
              <Text style={styles.actionText}>AI Insights</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CRM')}>
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                <Ionicons name="people-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionText}>CRM</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('DynamicPricing')}>
              <View style={[styles.actionIcon, { backgroundColor: '#10b981' + '15' }]}>
                <Ionicons name="pricetags-outline" size={24} color="#10b981" />
              </View>
              <Text style={styles.actionText}>Pricing</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 8, gap: 4 }} onPress={() => navigation.navigate('MultiChannel')}>
            <Ionicons name="grid-outline" size={16} color={colors.teal} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.teal }}>Sales Channels & Subscriptions</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.teal} />
          </TouchableOpacity>
        </View>

        {/* Recent Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.length === 0 && !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="chatbubbles-outline" size={36} color={colors.textLight} />
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8 }}>No reviews yet</Text>
            </View>
          ) : (
            reviews.map((review: any) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>
                    {review.customer?.firstName || review.reviewer?.firstName || 'Customer'}
                  </Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Ionicons key={s} name={s <= (review.rating || 0) ? 'star' : 'star-outline'} size={14} color={colors.warning} />
                    ))}
                  </View>
                  <Text style={styles.reviewTime}>{timeAgo(review.createdAt)}</Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewText} numberOfLines={2}>{review.comment}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.warning,
  },
  pendingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  header: {
    backgroundColor: colors.navy,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: colors.tealLight,
  },
  storeName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textWhite,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textWhite,
  },
  notifBtn: {
    position: 'relative',
    padding: 4,
  },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.navy,
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingTop: 16,
    gap: 10,
  },
  statCard: {
    width: (width - 40) / 2 - 5,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chartLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 10,
    color: colors.textLight,
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: 100,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 16,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderId: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  orderStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 10,
  },
  orderItemText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  orderTotal: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.teal,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.error + '12',
  },
  rejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  acceptBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.teal,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textWhite,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
  },
  topSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  topSellerRank: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.navy + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
  },
  topSellerInfo: {
    flex: 1,
  },
  topSellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  topSellerMeta: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTime: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 'auto',
  },
  reviewText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.teal,
  },
});
