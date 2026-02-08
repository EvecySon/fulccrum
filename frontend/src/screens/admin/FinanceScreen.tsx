import React, { useState, useEffect } from 'react';
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
import { adminAPI, analyticsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const mockMonthlyRevenue = [
  { month: 'Sep', amount: 32000 },
  { month: 'Oct', amount: 38000 },
  { month: 'Nov', amount: 41000 },
  { month: 'Dec', amount: 52000 },
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 48000 },
];

const mockTransactions = [
  { id: '1', type: 'commission', desc: 'Burger House commission', amount: 245.80, date: 'Today, 3:00 PM' },
  { id: '2', type: 'payout', desc: 'Courier payouts batch', amount: -1850.00, date: 'Today, 2:00 PM' },
  { id: '3', type: 'commission', desc: 'Sushi Palace commission', amount: 312.50, date: 'Today, 1:30 PM' },
  { id: '4', type: 'refund', desc: 'Refund - Order #3198', amount: -24.50, date: 'Today, 12:00 PM' },
  { id: '5', type: 'subscription', desc: 'Premium merchant fee', amount: 99.00, date: 'Yesterday' },
  { id: '6', type: 'payout', desc: 'Merchant payouts batch', amount: -8420.00, date: 'Yesterday' },
  { id: '7', type: 'commission', desc: 'Thai Garden commission', amount: 178.30, date: 'Yesterday' },
];

const getTxIcon = (type: string) => {
  switch (type) {
    case 'commission': return { name: 'trending-up', color: colors.teal };
    case 'payout': return { name: 'arrow-down-circle', color: colors.navy };
    case 'refund': return { name: 'refresh-circle', color: colors.error };
    case 'subscription': return { name: 'diamond', color: colors.warning };
    default: return { name: 'cash', color: colors.textLight };
  }
};

export default function FinanceScreen({ navigation }: any) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [monthlyRevenue, setMonthlyRevenue] = useState(mockMonthlyRevenue);
  const [transactions, setTransactions] = useState(mockTransactions);

  useEffect(() => {
    (async () => {
      try {
        const [revRes, txRes] = await Promise.all([
          analyticsAPI.revenue(180).catch(() => null),
          adminAPI.getPendingWithdrawals().catch(() => null),
        ]);
        if (revRes?.length) setMonthlyRevenue(revRes);
        if (txRes?.data?.length) setTransactions(txRes.data);
      } catch {}
    })();
  }, []);

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.amount));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance & Revenue</Text>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Period Tabs */}
        <View style={styles.periodTabs}>
          {(['week', 'month', 'quarter'] as const).map((p) => (
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

        {/* Revenue Overview */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueMain}>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueValue}>₦13.8M</Text>
            <View style={styles.revenueTrend}>
              <Ionicons name="trending-up" size={14} color={colors.success} />
              <Text style={styles.revenueTrendText}>+8.3% vs last month</Text>
            </View>
          </View>
        </View>

        {/* Revenue Breakdown */}
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownCard}>
            <View style={[styles.breakdownDot, { backgroundColor: colors.teal }]} />
            <Text style={styles.breakdownLabel}>Commissions</Text>
            <Text style={styles.breakdownValue}>₦9.6M</Text>
            <Text style={styles.breakdownPct}>70%</Text>
          </View>
          <View style={styles.breakdownCard}>
            <View style={[styles.breakdownDot, { backgroundColor: colors.navy }]} />
            <Text style={styles.breakdownLabel}>Delivery Fees</Text>
            <Text style={styles.breakdownValue}>₦2.8M</Text>
            <Text style={styles.breakdownPct}>20%</Text>
          </View>
          <View style={styles.breakdownCard}>
            <View style={[styles.breakdownDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.breakdownLabel}>Subscriptions</Text>
            <Text style={styles.breakdownValue}>₦1.4M</Text>
            <Text style={styles.breakdownPct}>10%</Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Revenue</Text>
          <View style={styles.chartContainer}>
            {monthlyRevenue.map((item, index) => (
              <View key={index} style={styles.chartBarWrapper}>
                <Text style={styles.chartAmount}>₦{(item.amount / 1000).toFixed(0)}K</Text>
                <View style={styles.chartBarBg}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${(item.amount / maxRevenue) * 100}%` },
                      index === monthlyRevenue.length - 1 && styles.chartBarCurrent,
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Financial KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Ionicons name="wallet" size={20} color={colors.teal} />
            <Text style={styles.kpiValue}>₦11,550</Text>
            <Text style={styles.kpiLabel}>Avg Order Value</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="card" size={20} color={colors.navy} />
            <Text style={styles.kpiValue}>₦1,155</Text>
            <Text style={styles.kpiLabel}>Avg Commission</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="refresh" size={20} color={colors.error} />
            <Text style={styles.kpiValue}>₦372,000</Text>
            <Text style={styles.kpiLabel}>Refunds</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="trending-up" size={20} color={colors.success} />
            <Text style={styles.kpiValue}>72%</Text>
            <Text style={styles.kpiLabel}>Profit Margin</Text>
          </View>
        </View>

        {/* Pending Payouts */}
        <View style={styles.payoutsCard}>
          <View style={styles.payoutsHeader}>
            <Text style={styles.payoutsTitle}>Pending Payouts</Text>
            <TouchableOpacity style={styles.processBtn} onPress={() => navigation.navigate('Payouts')}>
              <Text style={styles.processBtnText}>Manage Payouts</Text>
            </TouchableOpacity>
          </View>
          {[
            { label: 'Merchant Payouts', amount: 12450, count: 28 },
            { label: 'Courier Payouts', amount: 8920, count: 64 },
            { label: 'Refunds Pending', amount: 340, count: 5 },
          ].map((payout, index) => (
            <View key={index} style={styles.payoutRow}>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutLabel}>{payout.label}</Text>
                <Text style={styles.payoutCount}>{payout.count} pending</Text>
              </View>
              <Text style={styles.payoutAmount}>₦{payout.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Export</Text>
            </TouchableOpacity>
          </View>
          {transactions.map((tx) => {
            const icon = getTxIcon(tx.type);
            return (
              <View key={tx.id} style={styles.txCard}>
                <View style={[styles.txIcon, { backgroundColor: icon.color + '15' }]}>
                  <Ionicons name={icon.name as any} size={18} color={icon.color} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>{tx.desc}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.success : colors.textPrimary }]}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}₦{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  periodTabs: {
    flexDirection: 'row', marginHorizontal: 10, marginTop: 12,
    backgroundColor: colors.white, borderRadius: 14, padding: 4,
  },
  periodTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  periodTabActive: { backgroundColor: colors.navy },
  periodText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  periodTextActive: { color: colors.textWhite },
  revenueCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  revenueMain: { alignItems: 'center' },
  revenueLabel: { fontSize: 13, color: colors.textLight },
  revenueValue: { fontSize: 42, fontWeight: '800', color: colors.textPrimary },
  revenueTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  revenueTrendText: { fontSize: 13, fontWeight: '600', color: colors.success },
  breakdownRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 8, marginTop: 10 },
  breakdownCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, gap: 2 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  breakdownLabel: { fontSize: 11, color: colors.textLight },
  breakdownValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  breakdownPct: { fontSize: 11, color: colors.textLight },
  chartCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 18,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  chartAmount: { fontSize: 10, color: colors.textLight, marginBottom: 4 },
  chartBarBg: { width: 28, height: 90, justifyContent: 'flex-end', borderRadius: 8, overflow: 'hidden', backgroundColor: colors.lightGray },
  chartBar: { width: '100%', backgroundColor: colors.teal + '50', borderRadius: 8 },
  chartBarCurrent: { backgroundColor: colors.teal },
  chartLabel: { fontSize: 12, color: colors.textLight, marginTop: 6 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginTop: 10, gap: 8 },
  kpiCard: {
    width: (width - 28) / 2 - 4, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
  },
  kpiValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  kpiLabel: { fontSize: 11, color: colors.textLight },
  payoutsCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 16,
  },
  payoutsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  payoutsTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  processBtn: { backgroundColor: colors.teal, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  processBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  payoutRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  payoutInfo: {},
  payoutLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  payoutCount: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  payoutAmount: { fontSize: 17, fontWeight: '700', color: colors.navy },
  section: { paddingHorizontal: 10, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.teal },
  txCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 12, marginBottom: 6, gap: 10,
  },
  txIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  txDate: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
});
