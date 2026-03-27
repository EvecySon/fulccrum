import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '../../theme/ThemeContext';
import { analyticsAPI } from '../../services/api';

const { width } = Dimensions.get('window');


export default function EarningsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [earnings, setEarnings] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<{day: string; amount: number; deliveries: number}[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await analyticsAPI.revenue(30);
        if (res) setEarnings(res);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  const maxAmount = Math.max(...weeklyData.map(d => d.amount));

  const todayEarnings = 148.73;
  const weekEarnings = 998.00;
  const monthEarnings = 3842.50;
  const todayTips = 10.00;
  const weekTips = 68.50;
  const monthTips = 285.00;

  const getEarnings = () => {
    switch (period) {
      case 'today': return todayEarnings;
      case 'week': return weekEarnings;
      case 'month': return monthEarnings;
    }
  };

  const getTips = () => {
    switch (period) {
      case 'today': return todayTips;
      case 'week': return weekTips;
      case 'month': return monthTips;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Tabs */}
        <View style={styles.periodTabs}>
          {(['today', 'week', 'month'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodTab, period === p && styles.periodTabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Earnings Summary */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsMain}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsValue}>₦{getEarnings().toFixed(2)}</Text>
          </View>
          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: colors.teal }]} />
              <Text style={styles.breakdownLabel}>Delivery Fees</Text>
              <Text style={styles.breakdownValue}>₦{(getEarnings() - getTips()).toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: colors.success }]} />
              <Text style={styles.breakdownLabel}>Tips</Text>
              <Text style={[styles.breakdownValue, { color: colors.success }]}>₦{getTips().toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>This Week</Text>
          <View style={styles.chartContainer}>
            {weeklyData.map((item, index) => {
              const isToday = index === 3;
              return (
                <View key={index} style={styles.chartBarWrapper}>
                  <Text style={styles.chartAmount}>₦{item.amount}</Text>
                  <View style={styles.chartBarBg}>
                    <View
                      style={[
                        styles.chartBar,
                        { height: `${(item.amount / maxAmount) * 100}%` },
                        isToday && styles.chartBarToday,
                      ]}
                    />
                  </View>
                  <Text style={[styles.chartDay, isToday && styles.chartDayToday]}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="bicycle" size={20} color={colors.navy} />
            <Text style={styles.statValue}>92</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={20} color={colors.warning} />
            <Text style={styles.statValue}>42h</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="speedometer" size={20} color={colors.teal} />
            <Text style={styles.statValue}>22m</Text>
            <Text style={styles.statLabel}>Avg Time</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="navigate" size={20} color={colors.error} />
            <Text style={styles.statValue}>186km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        </View>

        {/* Delivery History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery History</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {deliveryHistory.map((delivery) => (
            <View key={delivery.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                  <Ionicons name="storefront" size={16} color={colors.navy} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyRestaurant}>{delivery.restaurant}</Text>
                  <Text style={styles.historyCustomer}>To: {delivery.customer}</Text>
                  <View style={styles.historyMeta}>
                    <Text style={styles.historyMetaText}>{delivery.distance} km</Text>
                    <Text style={styles.historyMetaDot}>·</Text>
                    <Text style={styles.historyMetaText}>{delivery.time} min</Text>
                    <Text style={styles.historyMetaDot}>·</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={10} color={colors.warning} />
                      <Text style={styles.ratingText}>{delivery.rating}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyPay}>₦{delivery.pay.toFixed(2)}</Text>
                {delivery.tip > 0 && (
                  <Text style={styles.historyTip}>+₦{delivery.tip.toFixed(2)}</Text>
                )}
                <Text style={styles.historyDate}>{delivery.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payout Info */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Ionicons name="wallet-outline" size={22} color={colors.teal} />
            <View style={styles.payoutInfo}>
              <Text style={styles.payoutTitle}>Next Payout</Text>
              <Text style={styles.payoutDate}>Friday, Feb 7</Text>
            </View>
            <Text style={styles.payoutAmount}>₦{weekEarnings.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.instantPayBtn}>
            <Ionicons name="flash" size={16} color={colors.textWhite} />
            <Text style={styles.instantPayText}>Instant Payout (₦250 fee)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textWhite },
  periodTabs: {
    flexDirection: 'row', marginHorizontal: 10, marginTop: 12,
    backgroundColor: colors.white, borderRadius: 14, padding: 4,
  },
  periodTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  periodTabActive: { backgroundColor: colors.navy },
  periodText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  periodTextActive: { color: colors.textWhite },
  earningsCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  earningsMain: { alignItems: 'center', marginBottom: 16 },
  earningsLabel: { fontSize: 13, color: colors.textLight },
  earningsValue: { fontSize: 40, fontWeight: '800', color: colors.textPrimary },
  earningsBreakdown: { flexDirection: 'row', justifyContent: 'space-around' },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 13, color: colors.textSecondary },
  breakdownValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  chartCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 18,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  chartAmount: { fontSize: 10, color: colors.textLight, marginBottom: 4 },
  chartBarBg: { width: 24, height: 80, justifyContent: 'flex-end', borderRadius: 8, overflow: 'hidden', backgroundColor: colors.lightGray },
  chartBar: { width: '100%', backgroundColor: colors.teal + '60', borderRadius: 8 },
  chartBarToday: { backgroundColor: colors.teal },
  chartDay: { fontSize: 12, color: colors.textLight, marginTop: 6 },
  chartDayToday: { fontWeight: '700', color: colors.teal },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginTop: 10, gap: 10 },
  statCard: {
    width: (width - 30) / 2 - 5, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textLight },
  section: { paddingHorizontal: 10, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.teal },
  historyCard: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white,
    borderRadius: 14, padding: 14, marginBottom: 8,
  },
  historyLeft: { flexDirection: 'row', gap: 10, flex: 1 },
  historyIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  historyInfo: { flex: 1 },
  historyRestaurant: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  historyCustomer: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  historyMetaText: { fontSize: 11, color: colors.textLight },
  historyMetaDot: { fontSize: 11, color: colors.textLight },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, fontWeight: '600', color: colors.warning },
  historyRight: { alignItems: 'flex-end' },
  historyPay: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  historyTip: { fontSize: 12, fontWeight: '600', color: colors.success, marginTop: 1 },
  historyDate: { fontSize: 10, color: colors.textLight, marginTop: 4 },
  payoutCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 16, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: colors.teal + '25',
  },
  payoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  payoutInfo: { flex: 1 },
  payoutTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  payoutDate: { fontSize: 13, color: colors.textLight },
  payoutAmount: { fontSize: 22, fontWeight: '800', color: colors.teal },
  instantPayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.navy, borderRadius: 12, paddingVertical: 12, gap: 6,
  },
  instantPayText: { fontSize: 14, fontWeight: '600', color: colors.textWhite },
});
