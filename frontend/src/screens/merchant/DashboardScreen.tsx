import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { analyticsAPI, ordersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function MerchantDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayEarnings: 0, todayOrders: 0, avgOrderValue: 0, rating: 0,
    weeklyEarnings: [{ day: 'Mon', amount: 0 }, { day: 'Tue', amount: 0 }, { day: 'Wed', amount: 0 }, { day: 'Thu', amount: 0 }, { day: 'Fri', amount: 0 }, { day: 'Sat', amount: 0 }, { day: 'Sun', amount: 0 }],
  });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          analyticsAPI.dashboard().catch(() => null),
          ordersAPI.getMyOrders().catch(() => null),
        ]);
        if (statsRes) setStats(prev => ({ ...prev, ...statsRes }));
        if (ordersRes?.data) setOrders(ordersRes.data);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return colors.info;
      case 'preparing': return colors.warning;
      case 'ready': return colors.teal;
      case 'completed': return colors.success;
      default: return colors.textLight;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.storeName}>{user?.firstName || 'My Store'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Open</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textWhite} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="cash-outline" size={22} color={colors.teal} />
            </View>
            <Text style={styles.statValue}>₦{stats.todayEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="receipt-outline" size={22} color={colors.navy} />
            </View>
            <Text style={styles.statValue}>{stats.todayOrders}</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="trending-up-outline" size={22} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>₦{stats.avgOrderValue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Order Value</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="star-outline" size={22} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Weekly Earnings Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Earnings</Text>
            <TouchableOpacity>
              <Text style={styles.chartLink}>View Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartBars}>
            {stats.weeklyEarnings.map((item, index) => {
              const maxAmount = Math.max(...stats.weeklyEarnings.map(e => e.amount));
              const barHeight = (item.amount / maxAmount) * 100;
              const isToday = index === 1;
              return (
                <View key={item.day} style={styles.barContainer}>
                  <Text style={styles.barValue}>₦{(item.amount / 1000).toFixed(1)}k</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeight}%`,
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
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="pause-circle-outline" size={24} color={colors.teal} />
            </View>
            <Text style={styles.actionText}>Pause Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="time-outline" size={24} color={colors.navy} />
            </View>
            <Text style={styles.actionText}>Set Prep Time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="megaphone-outline" size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionText}>Run Promo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            </View>
            <Text style={styles.actionText}>86 an Item</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MerchantOrders')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {orders.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Ionicons name="receipt-outline" size={40} color={colors.textLight} />
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8 }}>No orders yet</Text>
            </View>
          )}
          {orders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.orderCustomer}>{order.customerName}</Text>
                  <Text style={styles.orderId}>{order.id} · {order.timeAgo}</Text>
                </View>
                <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                  <View style={[styles.orderStatusDot, { backgroundColor: getStatusColor(order.status) }]} />
                  <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderItems}>
                {order.items.map((item: any, idx: number) => (
                  <Text key={idx} style={styles.orderItemText}>• {item}</Text>
                ))}
              </View>
              <View style={styles.orderBottom}>
                <Text style={styles.orderTotal}>₦{order.total.toFixed(2)}</Text>
                {order.status === 'new' && (
                  <View style={styles.orderActions}>
                    <TouchableOpacity style={styles.rejectBtn}>
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptBtn}>
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {order.status === 'preparing' && order.eta && (
                  <View style={styles.etaBadge}>
                    <Ionicons name="time" size={14} color={colors.warning} />
                    <Text style={styles.etaText}>{order.eta} left</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Items Today */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Sellers Today</Text>
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Ionicons name="trophy-outline" size={36} color={colors.textLight} />
            <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8 }}>Top sellers will appear here</Text>
          </View>
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

        {/* Customer Feedback Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Ionicons name="chatbubbles-outline" size={36} color={colors.textLight} />
            <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8 }}>No reviews yet</Text>
          </View>
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
