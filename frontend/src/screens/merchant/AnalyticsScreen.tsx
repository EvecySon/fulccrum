import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');

const periods = ['Today', 'This Week', 'This Month', 'This Year'];

const revenueData = {
  today: { total: 1890.75, change: '+12.5%', positive: true },
  orders: { total: 47, change: '+8.2%', positive: true },
  avgOrder: { total: 40.23, change: '-2.1%', positive: false },
  cancelRate: { total: 3.2, change: '-0.5%', positive: true },
};

const hourlyOrders = [
  { hour: '8AM', orders: 3 }, { hour: '9AM', orders: 5 }, { hour: '10AM', orders: 8 },
  { hour: '11AM', orders: 15 }, { hour: '12PM', orders: 28 }, { hour: '1PM', orders: 22 },
  { hour: '2PM', orders: 14 }, { hour: '3PM', orders: 9 }, { hour: '4PM', orders: 12 },
  { hour: '5PM', orders: 18 }, { hour: '6PM', orders: 32 }, { hour: '7PM', orders: 27 },
  { hour: '8PM', orders: 20 }, { hour: '9PM', orders: 15 }, { hour: '10PM', orders: 8 },
];

const topItems = [
  { name: 'Classic Fries', orders: 210, revenue: 1047.90, change: '+15%' },
  { name: 'Gourmet Cheeseburger', orders: 156, revenue: 2338.44, change: '+8%' },
  { name: 'Chicken Wings', orders: 134, revenue: 1740.66, change: '+22%' },
  { name: 'Milkshake', orders: 92, revenue: 643.08, change: '-3%' },
  { name: 'Caesar Salad', orders: 78, revenue: 779.22, change: '+5%' },
];

const customerInsights = {
  newCustomers: 23,
  returning: 68,
  avgRating: 4.7,
  totalReviews: 342,
  responseRate: 94,
  avgResponseTime: '12 min',
};

const peakHours = [
  { time: '12:00 - 1:00 PM', label: 'Lunch Rush', intensity: 95 },
  { time: '6:00 - 7:00 PM', label: 'Dinner Rush', intensity: 100 },
  { time: '7:00 - 8:00 PM', label: 'Late Dinner', intensity: 80 },
];

export default function MerchantAnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.exportBtn}>
          <Ionicons name="download-outline" size={18} color={colors.textWhite} />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Period Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodChip, selectedPeriod === period && styles.periodChipActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIcon, { backgroundColor: colors.teal + '15' }]}>
                <Ionicons name="cash-outline" size={18} color={colors.teal} />
              </View>
              <View style={[styles.changeBadge, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="trending-up" size={12} color={colors.success} />
                <Text style={[styles.changeText, { color: colors.success }]}>{revenueData.today.change}</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>₦{revenueData.today.total.toFixed(2)}</Text>
            <Text style={styles.kpiLabel}>Revenue</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="receipt-outline" size={18} color={colors.navy} />
              </View>
              <View style={[styles.changeBadge, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="trending-up" size={12} color={colors.success} />
                <Text style={[styles.changeText, { color: colors.success }]}>{revenueData.orders.change}</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>{revenueData.orders.total}</Text>
            <Text style={styles.kpiLabel}>Orders</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="trending-up-outline" size={18} color={colors.warning} />
              </View>
              <View style={[styles.changeBadge, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="trending-down" size={12} color={colors.error} />
                <Text style={[styles.changeText, { color: colors.error }]}>{revenueData.avgOrder.change}</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>₦{revenueData.avgOrder.total.toFixed(2)}</Text>
            <Text style={styles.kpiLabel}>Avg Order</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
              </View>
              <View style={[styles.changeBadge, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="trending-down" size={12} color={colors.success} />
                <Text style={[styles.changeText, { color: colors.success }]}>{revenueData.cancelRate.change}</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>{revenueData.cancelRate.total}%</Text>
            <Text style={styles.kpiLabel}>Cancel Rate</Text>
          </View>
        </View>

        {/* Hourly Orders Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Orders by Hour</Text>
          <View style={styles.hourlyChart}>
            {hourlyOrders.map((item, index) => {
              const maxOrders = Math.max(...hourlyOrders.map(h => h.orders));
              const barHeight = (item.orders / maxOrders) * 80;
              const isPeak = item.orders >= 25;
              return (
                <View key={index} style={styles.hourBar}>
                  <Text style={styles.hourValue}>{item.orders}</Text>
                  <View style={styles.hourTrack}>
                    <View
                      style={[
                        styles.hourFill,
                        { height: barHeight, backgroundColor: isPeak ? colors.teal : colors.navy + '30' },
                      ]}
                    />
                  </View>
                  <Text style={[styles.hourLabel, index % 3 === 0 ? {} : { color: 'transparent' }]}>
                    {item.hour}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Peak Hours */}
        <View style={styles.peakCard}>
          <Text style={styles.chartTitle}>Peak Hours</Text>
          {peakHours.map((peak, index) => (
            <View key={index} style={styles.peakRow}>
              <View style={styles.peakInfo}>
                <Text style={styles.peakTime}>{peak.time}</Text>
                <Text style={styles.peakLabel}>{peak.label}</Text>
              </View>
              <View style={styles.peakBar}>
                <View style={[styles.peakFill, { width: `${peak.intensity}%` }]} />
              </View>
              <Text style={styles.peakPercent}>{peak.intensity}%</Text>
            </View>
          ))}
        </View>

        {/* Top Items */}
        <View style={styles.topItemsCard}>
          <Text style={styles.chartTitle}>Top Selling Items</Text>
          {topItems.map((item, index) => (
            <View key={index} style={styles.topItemRow}>
              <View style={styles.topItemRank}>
                <Text style={styles.rankNum}>#{index + 1}</Text>
              </View>
              <View style={styles.topItemInfo}>
                <Text style={styles.topItemName}>{item.name}</Text>
                <Text style={styles.topItemMeta}>{item.orders} orders · ₦{item.revenue.toFixed(2)}</Text>
              </View>
              <Text style={[styles.topItemChange, { color: item.change.startsWith('+') ? colors.success : colors.error }]}>
                {item.change}
              </Text>
            </View>
          ))}
        </View>

        {/* Customer Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.chartTitle}>Customer Insights</Text>
          <View style={styles.insightsGrid}>
            <View style={styles.insightItem}>
              <Ionicons name="person-add-outline" size={20} color={colors.teal} />
              <Text style={styles.insightValue}>{customerInsights.newCustomers}</Text>
              <Text style={styles.insightLabel}>New Customers</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="refresh-outline" size={20} color={colors.navy} />
              <Text style={styles.insightValue}>{customerInsights.returning}%</Text>
              <Text style={styles.insightLabel}>Returning</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="star-outline" size={20} color={colors.warning} />
              <Text style={styles.insightValue}>{customerInsights.avgRating}</Text>
              <Text style={styles.insightLabel}>Avg Rating</Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.info} />
              <Text style={styles.insightValue}>{customerInsights.responseRate}%</Text>
              <Text style={styles.insightLabel}>Response Rate</Text>
            </View>
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
    paddingBottom: 20,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textWhite,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  exportText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textWhite,
  },
  content: {
    flex: 1,
  },
  periodRow: {
    paddingHorizontal: 10,
    paddingVertical: 14,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.textWhite,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 10,
  },
  kpiCard: {
    width: (width - 40) / 2 - 5,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  hourlyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  hourBar: {
    alignItems: 'center',
    flex: 1,
  },
  hourValue: {
    fontSize: 8,
    color: colors.textLight,
    marginBottom: 2,
  },
  hourTrack: {
    width: 12,
    height: 80,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hourFill: {
    width: '100%',
    borderRadius: 6,
  },
  hourLabel: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 4,
  },
  peakCard: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 16,
    padding: 18,
  },
  peakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  peakInfo: {
    width: 120,
  },
  peakTime: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  peakLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  peakBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  peakFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 4,
  },
  peakPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    width: 40,
    textAlign: 'right',
  },
  topItemsCard: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 16,
    padding: 18,
  },
  topItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 10,
  },
  topItemRank: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.navy + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  topItemMeta: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },
  topItemChange: {
    fontSize: 13,
    fontWeight: '700',
  },
  insightsCard: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 16,
    padding: 18,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightItem: {
    width: (width - 60) / 2 - 6,
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  insightLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
});
