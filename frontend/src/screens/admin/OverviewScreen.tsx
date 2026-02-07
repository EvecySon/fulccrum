import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { mockAdminStats } from '../../data/mockData';

const { width } = Dimensions.get('window');

const alerts = [
  { id: '1', type: 'warning', title: '3 merchants pending approval', time: '10 min ago' },
  { id: '2', type: 'error', title: 'Payment gateway latency spike', time: '25 min ago' },
  { id: '3', type: 'info', title: 'New app version 1.2.0 ready for release', time: '1 hr ago' },
];

const recentActivity = [
  { id: '1', action: 'New merchant registered', detail: 'Seoul Kitchen', time: '5 min ago', icon: 'storefront', color: colors.teal },
  { id: '2', action: 'Courier flagged', detail: 'Driver #482 - late deliveries', time: '12 min ago', icon: 'flag', color: colors.warning },
  { id: '3', action: 'Refund processed', detail: 'Order #3198 - ₦7,350', time: '18 min ago', icon: 'card', color: colors.error },
  { id: '4', action: 'Promo campaign started', detail: 'WEEKEND20 - 20% off', time: '30 min ago', icon: 'megaphone', color: colors.navy },
  { id: '5', action: 'User complaint resolved', detail: 'Ticket #8821', time: '45 min ago', icon: 'checkmark-circle', color: colors.success },
];

export default function OverviewScreen() {
  const stats = mockAdminStats;
  const maxOrders = Math.max(...stats.dailyOrders.map(d => d.orders));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Platform overview</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications" size={22} color={colors.textWhite} />
          <View style={styles.notifDot} />
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
            <View style={styles.kpiTrend}>
              <Ionicons name="trending-up" size={12} color={colors.success} />
              <Text style={styles.kpiTrendText}>+12.5%</Text>
            </View>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="cash" size={20} color={colors.navy} />
            </View>
            <Text style={styles.kpiValue}>₦{(stats.monthlyRevenue / 1000).toFixed(1)}K</Text>
            <Text style={styles.kpiLabel}>Monthly Revenue</Text>
            <View style={styles.kpiTrend}>
              <Ionicons name="trending-up" size={12} color={colors.success} />
              <Text style={styles.kpiTrendText}>+8.3%</Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="people" size={20} color={colors.warning} />
            </View>
            <Text style={styles.kpiValue}>{(stats.customersOnline / 1000).toFixed(0)}K</Text>
            <Text style={styles.kpiLabel}>Active Users</Text>
            <View style={styles.kpiTrend}>
              <Ionicons name="trending-up" size={12} color={colors.success} />
              <Text style={styles.kpiTrendText}>+5.1%</Text>
            </View>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="storefront" size={20} color={colors.error} />
            </View>
            <Text style={styles.kpiValue}>{stats.totalMerchants}</Text>
            <Text style={styles.kpiLabel}>Merchants</Text>
            <View style={styles.kpiTrend}>
              <Ionicons name="trending-up" size={12} color={colors.success} />
              <Text style={styles.kpiTrendText}>+3.2%</Text>
            </View>
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
            <Text style={styles.chartSubtitle}>Peak at 6PM</Text>
          </View>
          <View style={styles.chartContainer}>
            {stats.dailyOrders.map((item, index) => (
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

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          {alerts.map((alert) => (
            <TouchableOpacity key={alert.id} style={styles.alertCard}>
              <View style={[styles.alertIcon, {
                backgroundColor: alert.type === 'error' ? colors.error + '15' : alert.type === 'warning' ? colors.warning + '15' : colors.info + '15'
              }]}>
                <Ionicons
                  name={alert.type === 'error' ? 'alert-circle' : alert.type === 'warning' ? 'warning' : 'information-circle'}
                  size={20}
                  color={alert.type === 'error' ? colors.error : alert.type === 'warning' ? colors.warning : colors.info}
                />
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Restaurants</Text>
          {stats.topRestaurants.map((r, index) => (
            <View key={index} style={styles.topCard}>
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
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
                <Ionicons name={activity.icon as any} size={18} color={activity.color} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityDetail}>{activity.detail}</Text>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'person-add', label: 'Approve\nMerchants', color: colors.teal },
              { icon: 'megaphone', label: 'Push\nNotification', color: colors.navy },
              { icon: 'analytics', label: 'Generate\nReport', color: colors.warning },
              { icon: 'construct', label: 'System\nConfig', color: colors.error },
            ].map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 20,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { fontSize: 20, fontWeight: '800', color: colors.textWhite },
  subtitle: { fontSize: 13, color: colors.tealLight, marginTop: 2 },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: {
    position: 'absolute', top: 2, right: 2, width: 8, height: 8,
    borderRadius: 4, backgroundColor: colors.error,
  },
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
