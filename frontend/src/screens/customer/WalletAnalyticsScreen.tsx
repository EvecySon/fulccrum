import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';

interface AnalyticsData {
  period: string;
  summary: {
    totalSpending: number;
    totalWithdrawals: number;
    totalReferralEarnings: number;
    netChange: number;
  };
  breakdown: {
    orderCount: number;
    withdrawalCount: number;
    referralCount: number;
  };
  dailyData: Array<{
    date: string;
    spending: number;
    withdrawals: number;
  }>;
}

export default function WalletAnalyticsScreen() {
  const navigation = useNavigation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get<AnalyticsData>(`/wallet/analytics?period=${selectedPeriod}`);
      setAnalytics(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get<{ format: string; content: string; filename: string }>(
        '/wallet/export?format=csv'
      );
      
      Alert.alert(
        'Export Ready',
        `Your statement has been prepared as ${response.filename}. In a production app, this would be downloaded or shared.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export statement');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const SimpleBarChart = ({ data }: { data: Array<{ date: string; spending: number; withdrawals: number }> }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.spending, d.withdrawals)));
    const chartHeight = 180;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.slice(-7).map((item, index) => {
            const spendingHeight = maxValue > 0 ? (item.spending / maxValue) * chartHeight : 0;
            const withdrawalHeight = maxValue > 0 ? (item.withdrawals / maxValue) * chartHeight : 0;

            return (
              <View key={index} style={styles.barGroup}>
                <View style={styles.barPair}>
                  <View style={[styles.bar, { height: spendingHeight, backgroundColor: '#ef4444' }]} />
                  <View style={[styles.bar, { height: withdrawalHeight, backgroundColor: '#3b82f6' }]} />
                </View>
                <Text style={styles.barLabel}>
                  {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Spending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.legendText}>Withdrawals</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Wallet Analytics</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No analytics data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Wallet Analytics</Text>
        <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
          <Ionicons name="download-outline" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'Year'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="trending-down" size={24} color={colors.error} />
            <Text style={styles.summaryLabel}>Total Spending</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              {formatCurrency(analytics.summary.totalSpending)}
            </Text>
            <Text style={styles.summaryCount}>{analytics.breakdown.orderCount} orders</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="arrow-down-circle" size={24} color={colors.info} />
            <Text style={styles.summaryLabel}>Withdrawals</Text>
            <Text style={[styles.summaryValue, { color: colors.info }]}>
              {formatCurrency(analytics.summary.totalWithdrawals)}
            </Text>
            <Text style={styles.summaryCount}>{analytics.breakdown.withdrawalCount} requests</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="gift" size={24} color={colors.success} />
            <Text style={styles.summaryLabel}>Referral Earnings</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatCurrency(analytics.summary.totalReferralEarnings)}
            </Text>
            <Text style={styles.summaryCount}>{analytics.breakdown.referralCount} referrals</Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  analytics.summary.netChange >= 0 ? '#dcfce7' : '#fee2e2',
              },
            ]}
          >
            <Ionicons
              name={analytics.summary.netChange >= 0 ? 'trending-up' : 'trending-down'}
              size={24}
              color={analytics.summary.netChange >= 0 ? colors.success : colors.error}
            />
            <Text style={styles.summaryLabel}>Net Change</Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: analytics.summary.netChange >= 0 ? colors.success : colors.error,
                },
              ]}
            >
              {analytics.summary.netChange >= 0 ? '+' : ''}
              {formatCurrency(analytics.summary.netChange)}
            </Text>
            <Text style={styles.summaryCount}>This {selectedPeriod}</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Spending Trend (Last 7 Days)</Text>
          <SimpleBarChart data={analytics.dailyData} />
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>

          {analytics.summary.totalSpending > 0 && (
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Ionicons name="restaurant" size={20} color={colors.error} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Food Spending</Text>
                <Text style={styles.insightText}>
                  You've spent {formatCurrency(analytics.summary.totalSpending)} on {analytics.breakdown.orderCount} orders this {selectedPeriod}
                </Text>
              </View>
            </View>
          )}

          {analytics.summary.totalReferralEarnings > 0 && (
            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="people" size={20} color={colors.success} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Referral Success</Text>
                <Text style={styles.insightText}>
                  You've earned {formatCurrency(analytics.summary.totalReferralEarnings)} from {analytics.breakdown.referralCount} successful referrals
                </Text>
              </View>
            </View>
          )}

          {analytics.summary.netChange < 0 && (
            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="bulb" size={20} color={colors.warning} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Spending Tip</Text>
                <Text style={styles.insightText}>
                  Your spending exceeded earnings by {formatCurrency(Math.abs(analytics.summary.netChange))}. Consider using vouchers to save more!
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: colors.teal,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  chartSection: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    marginBottom: 16,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 180,
  },
  bar: {
    width: 12,
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
