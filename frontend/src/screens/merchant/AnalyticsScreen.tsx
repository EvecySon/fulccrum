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
import { analyticsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const periods = ['Today', 'This Week', 'This Month', 'This Year'];

const emptyRevenueData = {
  today: { total: 0, change: '0%', positive: true },
  orders: { total: 0, change: '0%', positive: true },
  avgOrder: { total: 0, change: '0%', positive: true },
  cancelRate: { total: 0, change: '0%', positive: true },
};

export default function MerchantAnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [revenueData, setRevenueData] = useState(emptyRevenueData);
  const [hourlyOrders, setHourlyOrders] = useState<{hour: string; orders: number}[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [customerInsights, setCustomerInsights] = useState({ newCustomers: 0, returning: 0, avgRating: 0, totalReviews: 0, responseRate: 0, avgResponseTime: '—' });
  const [peakHours, setPeakHours] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await analyticsAPI.dashboard();
        if (res) setRevenueData(prev => ({ ...prev, ...res }));
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

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
