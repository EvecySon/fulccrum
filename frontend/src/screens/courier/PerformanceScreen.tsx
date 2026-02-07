import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierFleetAPI } from '../../services/api';

const mockPerformance = {
  efficiencyScore: 0.87,
  onTimeRate: 0.94,
  customerRating: 4.8,
  routeOptimization: 0.82,
  earningsPotential: 85000,
  deliveriesToday: 12,
  avgDeliveryTime: '22 min',
  totalDistance: '48 km',
};

const mockPredictions = [
  { id: '1', time: '12:00 PM', area: 'Victoria Island', expectedOrders: 15, surgeMultiplier: 1.3 },
  { id: '2', time: '1:00 PM', area: 'Lekki Phase 1', expectedOrders: 22, surgeMultiplier: 1.5 },
  { id: '3', time: '6:00 PM', area: 'Ikeja GRA', expectedOrders: 18, surgeMultiplier: 1.2 },
  { id: '4', time: '7:30 PM', area: 'Surulere', expectedOrders: 10, surgeMultiplier: 1.0 },
];

const mockWeeklyStats = [
  { day: 'Mon', deliveries: 14, earnings: 12000 },
  { day: 'Tue', deliveries: 11, earnings: 9500 },
  { day: 'Wed', deliveries: 16, earnings: 14200 },
  { day: 'Thu', deliveries: 13, earnings: 11800 },
  { day: 'Fri', deliveries: 19, earnings: 17500 },
  { day: 'Sat', deliveries: 22, earnings: 20100 },
  { day: 'Sun', deliveries: 8, earnings: 7200 },
];

export default function PerformanceScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [performance, setPerformance] = useState(mockPerformance);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await courierFleetAPI.getPerformance();
      if (data) setPerformance(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  const maxDeliveries = Math.max(...mockWeeklyStats.map(s => s.deliveries));

  if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={colors.teal} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance</Text>
        <Ionicons name="analytics" size={22} color={colors.tealLight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}>
        {/* Score Cards */}
        <View style={styles.scoreRow}>
          <View style={styles.mainScore}>
            <Text style={styles.mainScoreValue}>{Math.round(performance.efficiencyScore * 100)}</Text>
            <Text style={styles.mainScoreLabel}>Efficiency Score</Text>
          </View>
          <View style={styles.miniScores}>
            <View style={styles.miniScore}>
              <Text style={styles.miniValue}>{Math.round(performance.onTimeRate * 100)}%</Text>
              <Text style={styles.miniLabel}>On Time</Text>
            </View>
            <View style={styles.miniScore}>
              <Text style={styles.miniValue}>{performance.customerRating}</Text>
              <Text style={styles.miniLabel}>Rating</Text>
            </View>
            <View style={styles.miniScore}>
              <Text style={styles.miniValue}>{Math.round(performance.routeOptimization * 100)}%</Text>
              <Text style={styles.miniLabel}>Route Opt.</Text>
            </View>
          </View>
        </View>

        {/* Today Stats */}
        <View style={styles.todayRow}>
          <View style={styles.todayStat}>
            <Ionicons name="bicycle" size={20} color={colors.teal} />
            <Text style={styles.todayValue}>{performance.deliveriesToday}</Text>
            <Text style={styles.todayLabel}>Deliveries</Text>
          </View>
          <View style={styles.todayStat}>
            <Ionicons name="timer" size={20} color={colors.warning} />
            <Text style={styles.todayValue}>{performance.avgDeliveryTime}</Text>
            <Text style={styles.todayLabel}>Avg Time</Text>
          </View>
          <View style={styles.todayStat}>
            <Ionicons name="navigate" size={20} color={colors.navy} />
            <Text style={styles.todayValue}>{performance.totalDistance}</Text>
            <Text style={styles.todayLabel}>Distance</Text>
          </View>
          <View style={styles.todayStat}>
            <Ionicons name="cash" size={20} color={colors.success} />
            <Text style={styles.todayValue}>₦{(performance.earningsPotential / 1000).toFixed(0)}k</Text>
            <Text style={styles.todayLabel}>Potential</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.chartRow}>
            {mockWeeklyStats.map(stat => (
              <View key={stat.day} style={styles.chartCol}>
                <Text style={styles.chartValue}>{stat.deliveries}</Text>
                <View style={styles.chartBarBg}>
                  <View style={[styles.chartBarFill, { height: `${(stat.deliveries / maxDeliveries) * 100}%` }]} />
                </View>
                <Text style={styles.chartDay}>{stat.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Demand Predictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demand Hotspots</Text>
          <Text style={styles.sectionSub}>AI-predicted high-demand areas</Text>
          {mockPredictions.map(pred => (
            <View key={pred.id} style={styles.predCard}>
              <View style={styles.predTime}>
                <Text style={styles.predTimeText}>{pred.time}</Text>
              </View>
              <View style={styles.predInfo}>
                <Text style={styles.predArea}>{pred.area}</Text>
                <Text style={styles.predOrders}>~{pred.expectedOrders} orders expected</Text>
              </View>
              {pred.surgeMultiplier > 1 && (
                <View style={styles.surgeBadge}>
                  <Ionicons name="trending-up" size={12} color={colors.error} />
                  <Text style={styles.surgeText}>{pred.surgeMultiplier}x</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  scoreRow: { flexDirection: 'row', margin: 16, gap: 12 },
  mainScore: { backgroundColor: colors.teal, borderRadius: 20, padding: 24, justifyContent: 'center', alignItems: 'center', width: 130 },
  mainScoreValue: { fontSize: 40, fontWeight: '800', color: colors.textWhite },
  mainScoreLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  miniScores: { flex: 1, gap: 8 },
  miniScore: { backgroundColor: colors.white, borderRadius: 14, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  miniLabel: { fontSize: 12, color: colors.textLight },
  todayRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  todayStat: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  todayValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 6 },
  todayLabel: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  chartSection: { marginHorizontal: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: colors.textLight, marginBottom: 12 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, marginTop: 12 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartValue: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  chartBarBg: { width: 20, height: 80, backgroundColor: colors.lightGray, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', backgroundColor: colors.teal, borderRadius: 6 },
  chartDay: { fontSize: 11, color: colors.textLight, marginTop: 4 },
  section: { paddingHorizontal: 16 },
  predCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  predTime: { backgroundColor: colors.navy + '10', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  predTimeText: { fontSize: 12, fontWeight: '700', color: colors.navy },
  predInfo: { flex: 1 },
  predArea: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  predOrders: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  surgeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.error + '12', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  surgeText: { fontSize: 13, fontWeight: '700', color: colors.error },
});
