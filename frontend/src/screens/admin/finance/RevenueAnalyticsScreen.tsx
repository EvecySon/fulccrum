import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { financeAPI } from '../../../services/api';

export default function RevenueAnalyticsScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      if (dateRange === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate.setMonth(endDate.getMonth() - 3);
      }

      const [analyticsRes, forecastRes] = await Promise.all([
        financeAPI.getRevenueAnalytics(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          'day'
        ),
        financeAPI.getRevenueForecast(30),
      ]);

      setAnalytics(analyticsRes.data);
      setForecast(forecastRes.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Revenue Analytics</Text>
      </View>

      <View style={styles.dateRangeSelector}>
        {['week', 'month', 'quarter'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.dateRangeButton, dateRange === range && styles.dateRangeButtonActive]}
            onPress={() => setDateRange(range)}
          >
            <Text style={[styles.dateRangeText, dateRange === range && styles.dateRangeTextActive]}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {analytics && (
        <>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={styles.summaryValue}>₦{analytics.summary.totalRevenue.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Platform Fee</Text>
              <Text style={styles.summaryValue}>₦{analytics.summary.platformFee.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Net Revenue</Text>
              <Text style={styles.summaryValue}>₦{analytics.summary.netRevenue.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Orders</Text>
              <Text style={styles.summaryValue}>{analytics.summary.totalOrders}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Avg Order Value</Text>
              <Text style={styles.summaryValue}>₦{analytics.summary.avgOrderValue.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Merchant Revenue</Text>
              <Text style={styles.summaryValue}>₦{analytics.summary.merchantRevenue.toLocaleString()}</Text>
            </View>
          </View>

          {forecast && (
            <View style={styles.forecastCard}>
              <Text style={styles.sectionTitle}>30-Day Forecast</Text>
              <View style={styles.forecastRow}>
                <View style={styles.forecastItem}>
                  <Text style={styles.forecastLabel}>Avg Daily Revenue</Text>
                  <Text style={styles.forecastValue}>₦{forecast.avgDailyRevenue.toLocaleString()}</Text>
                </View>
                <View style={styles.forecastItem}>
                  <Text style={styles.forecastLabel}>Projected Monthly</Text>
                  <Text style={styles.forecastValue}>₦{forecast.projectedMonthlyRevenue.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {analytics.details.slice(0, 10).map((detail: any, index: number) => (
              <View key={index} style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailOrderNumber}>{detail.orderNumber}</Text>
                  <Text style={styles.detailAmount}>₦{detail.orderTotal.toLocaleString()}</Text>
                </View>
                <Text style={styles.detailBusiness}>{detail.businessName}</Text>
                <View style={styles.detailBreakdown}>
                  <Text style={styles.detailBreakdownText}>
                    Platform: ₦{detail.platformFee.toFixed(0)} | 
                    Merchant: ₦{detail.merchantRevenue.toFixed(0)} | 
                    Courier: ₦{detail.courierRevenue.toFixed(0)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
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
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dateRangeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  dateRangeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  dateRangeButtonActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  dateRangeText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dateRangeTextActive: {
    color: colors.white,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  forecastCard: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 16,
  },
  forecastItem: {
    flex: 1,
  },
  forecastLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  forecastValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.navy,
  },
  detailsSection: {
    padding: 16,
  },
  detailCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailOrderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.navy,
  },
  detailBusiness: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  detailBreakdown: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  detailBreakdownText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
