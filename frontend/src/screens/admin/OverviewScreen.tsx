import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

const { width } = Dimensions.get('window');

export default function OverviewScreen({ navigation }: any) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getMetrics();
      if (res) {
        // Provide default values for missing properties
        const statsWithDefaults = {
          totalOrders: res.totalOrders || 0,
          monthlyRevenue: res.monthlyRevenue || 0,
          customersOnline: res.customersOnline || 0,
          totalMerchants: res.totalMerchants || 0,
          activeCouriers: res.activeCouriers || 0,
          openKitchens: res.openKitchens || 0,
          avgDeliveryTime: res.avgDeliveryTime || 0,
          dailyOrders: res.dailyOrders || [],
          // Growth percentages from API
          ordersGrowth: res.ordersGrowth || 0,
          revenueGrowth: res.revenueGrowth || 0,
          usersGrowth: res.usersGrowth || 0,
          merchantsGrowth: res.merchantsGrowth || 0,
          // Peak time from API
          peakTime: res.peakTime || null,
          ...res
        };
        setStats(statsWithDefaults);
      }
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  if (loading || !stats) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const maxOrders = stats.dailyOrders?.length > 0 ? Math.max(...stats.dailyOrders.map((d: any) => d.orders)) : 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Platform overview</Text>
        </View>
        <TouchableOpacity 
          style={styles.notifBtn}
          onPress={() => navigation.navigate('NotificationCenter')}
        >
          <Ionicons name="notifications" size={22} color={colors.textWhite} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* KPI Cards Row 1 */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="receipt" size={20} color={colors.teal} />
            </View>
            <Text style={styles.kpiValue}>{stats.totalOrders.toLocaleString()}</Text>
            <Text style={styles.kpiLabel}>Total Orders</Text>
            {stats.ordersGrowth !== 0 && (
              <View style={styles.kpiTrend}>
                <Ionicons name={stats.ordersGrowth > 0 ? "trending-up" : "trending-down"} size={12} color={stats.ordersGrowth > 0 ? colors.success : colors.error} />
                <Text style={styles.kpiTrendText}>{stats.ordersGrowth > 0 ? '+' : ''}{stats.ordersGrowth.toFixed(1)}%</Text>
              </View>
            )}
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="cash" size={20} color={colors.navy} />
            </View>
            <Text style={styles.kpiValue}>₦{(stats.monthlyRevenue / 1000).toFixed(1)}K</Text>
            <Text style={styles.kpiLabel}>Monthly Revenue</Text>
            {stats.revenueGrowth !== 0 && (
              <View style={styles.kpiTrend}>
                <Ionicons name={stats.revenueGrowth > 0 ? "trending-up" : "trending-down"} size={12} color={stats.revenueGrowth > 0 ? colors.success : colors.error} />
                <Text style={styles.kpiTrendText}>{stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="people" size={20} color={colors.warning} />
            </View>
            <Text style={styles.kpiValue}>{(stats.customersOnline / 1000).toFixed(0)}K</Text>
            <Text style={styles.kpiLabel}>Active Users</Text>
            {stats.usersGrowth !== 0 && (
              <View style={styles.kpiTrend}>
                <Ionicons name={stats.usersGrowth > 0 ? "trending-up" : "trending-down"} size={12} color={stats.usersGrowth > 0 ? colors.success : colors.error} />
                <Text style={styles.kpiTrendText}>{stats.usersGrowth > 0 ? '+' : ''}{stats.usersGrowth.toFixed(1)}%</Text>
              </View>
            )}
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="storefront" size={20} color={colors.error} />
            </View>
            <Text style={styles.kpiValue}>{stats.totalMerchants}</Text>
            <Text style={styles.kpiLabel}>Merchants</Text>
            {stats.merchantsGrowth !== 0 && (
              <View style={styles.kpiTrend}>
                <Ionicons name={stats.merchantsGrowth > 0 ? "trending-up" : "trending-down"} size={12} color={stats.merchantsGrowth > 0 ? colors.success : colors.error} />
                <Text style={styles.kpiTrendText}>{stats.merchantsGrowth > 0 ? '+' : ''}{stats.merchantsGrowth.toFixed(1)}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* Live Stats Bar */}
        <View style={styles.liveBar}>
          <View style={styles.liveItem}>
            <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
            <Text style={styles.liveValue}>{stats.activeCouriers}</Text>
            <Text style={styles.liveLabel}>Couriers Online</Text>
          </View>
          <View style={styles.liveDivider} />
          <View style={styles.liveItem}>
            <View style={[styles.liveDot, { backgroundColor: colors.teal }]} />
            <Text style={styles.liveValue}>{stats.openKitchens.toLocaleString()}</Text>
            <Text style={styles.liveLabel}>Open Kitchens</Text>
          </View>
          <View style={styles.liveDivider} />
          <View style={styles.liveItem}>
            <View style={[styles.liveDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.liveValue}>{stats.avgDeliveryTime}m</Text>
            <Text style={styles.liveLabel}>Avg Delivery</Text>
          </View>
        </View>

        {/* Orders Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Orders Today</Text>
            {stats.peakTime && <Text style={styles.chartSubtitle}>Peak at {stats.peakTime}</Text>}
          </View>
          <View style={styles.chartContainer}>
            {stats.dailyOrders?.map((item: any, index: number) => (
              <View key={index} style={styles.chartBarWrapper}>
                <View style={styles.chartBarBg}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${(item.orders / maxOrders) * 100}%` },
                      item.orders === maxOrders && styles.chartBarPeak,
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Alerts - From Backend */}
        {stats.alerts && stats.alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {stats.alerts.map((alert: any) => (
              <TouchableOpacity 
                key={alert.id}
                style={styles.alertCard}
                onPress={() => {
                  if (alert.type === 'merchant_pending') navigation.navigate('MerchantApplicationReview');
                  else if (alert.type === 'system') navigation.navigate('LiveOperationsMap');
                }}
              >
                <View style={[styles.alertIcon, { backgroundColor: (alert.severity === 'high' ? colors.error : alert.severity === 'medium' ? colors.warning : colors.info) + '15' }]}>
                  <Ionicons name={alert.severity === 'high' ? 'alert-circle' : alert.severity === 'medium' ? 'warning' : 'information-circle'} size={20} color={alert.severity === 'high' ? colors.error : alert.severity === 'medium' ? colors.warning : colors.info} />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Top Restaurants */}
        {stats.topRestaurants && stats.topRestaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Restaurants</Text>
            {stats.topRestaurants.map((r: any, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={styles.topCard}
              onPress={() => navigation.navigate('Merchants')}
            >
              <View style={styles.topRank}>
                <Text style={styles.topRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.topInfo}>
                <Text style={styles.topName}>{r.name}</Text>
                <Text style={styles.topMeta}>{r.orders} orders today</Text>
              </View>
              <View style={styles.topBadge}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={styles.topRating}>{r.rating || r.avgTime}{'avgTime' in r ? 'm' : ''}</Text>
              </View>
            </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Activity - From Backend */}
        {stats.recentActivity && stats.recentActivity.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AuditLogs')}>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {stats.recentActivity.map((activity: any) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: (activity.color || colors.teal) + '15' }]}>
                  <Ionicons name={(activity.icon || 'information-circle') as any} size={18} color={activity.color || colors.teal} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityDetail}>{activity.detail}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Registration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Register New</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AddMerchant')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="storefront" size={24} color={colors.navy} />
              </View>
              <Text style={styles.actionLabel}>{'Add\nMerchant'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AddCourier')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.teal + '15' }]}>
                <Ionicons name="bicycle" size={24} color={colors.teal} />
              </View>
              <Text style={styles.actionLabel}>{'Add\nCourier'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ApprovePending')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="checkmark-done" size={24} color={colors.warning} />
              </View>
              <Text style={styles.actionLabel}>{'Approve\nPending'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('PushNotifications')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="megaphone" size={24} color={colors.error} />
              </View>
              <Text style={styles.actionLabel}>{'Push\nNotification'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textLight },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 20,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { fontSize: 20, fontWeight: '800', color: colors.textWhite },
  subtitle: { fontSize: 13, color: colors.tealLight, marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navy, justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  notifBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: colors.error, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  notifBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textWhite },
  kpiRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 10, marginTop: 10 },
  kpiCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  kpiIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  kpiLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  kpiTrend: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  kpiTrendText: { fontSize: 12, fontWeight: '600', color: colors.success },
  liveBar: {
    flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10,
    borderRadius: 16, padding: 16, justifyContent: 'space-around', alignItems: 'center',
  },
  liveItem: { alignItems: 'center', gap: 2 },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  liveValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  liveLabel: { fontSize: 11, color: colors.textLight },
  liveDivider: { width: 1, height: 30, backgroundColor: colors.borderLight },
  chartCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 18,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  chartSubtitle: { fontSize: 12, color: colors.textLight },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  chartBarBg: { width: 20, height: 80, justifyContent: 'flex-end', borderRadius: 6, overflow: 'hidden', backgroundColor: colors.lightGray },
  chartBar: { width: '100%', backgroundColor: colors.teal + '60', borderRadius: 6 },
  chartBarPeak: { backgroundColor: colors.teal },
  chartLabel: { fontSize: 9, color: colors.textLight, marginTop: 6 },
  section: { paddingHorizontal: 10, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.teal },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
  },
  alertIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  alertTime: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  topCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
  },
  topRank: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  topRankText: { fontSize: 14, fontWeight: '800', color: colors.navy },
  topInfo: { flex: 1 },
  topName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  topMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  topBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  topRating: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  activityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 12, marginBottom: 6, gap: 10,
  },
  activityIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1 },
  activityAction: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  activityDetail: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  activityTime: { fontSize: 11, color: colors.textLight },
  actionsGrid: { flexDirection: 'row', gap: 10 },
  actionCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center' },
  actionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textAlign: 'center', lineHeight: 16 },
});
