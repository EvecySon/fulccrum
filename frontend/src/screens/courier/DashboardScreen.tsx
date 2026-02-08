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
import { mockCourierStats } from '../../data/mockData';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const recentDeliveries = [
  { id: '1', restaurant: 'Burger House', customer: 'John S.', amount: 8.65, time: '18 min', distance: '1.5 km', status: 'completed', tip: 3.00 },
  { id: '2', restaurant: 'Sushi Sushi', customer: 'Anna D.', amount: 12.30, time: '25 min', distance: '2.8 km', status: 'completed', tip: 5.00 },
  { id: '3', restaurant: 'Pizza Roma', customer: 'Mike L.', amount: 7.20, time: '15 min', distance: '1.1 km', status: 'completed', tip: 2.00 },
];

const hourlyEarnings = [
  { hour: '9AM', amount: 12 },
  { hour: '10AM', amount: 24 },
  { hour: '11AM', amount: 18 },
  { hour: '12PM', amount: 35 },
  { hour: '1PM', amount: 28 },
  { hour: '2PM', amount: 15 },
  { hour: '3PM', amount: 22 },
  { hour: '4PM', amount: 30 },
];

export default function CourierDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState(mockCourierStats);

  useEffect(() => {
    (async () => {
      try {
        const res = await analyticsAPI.dashboard();
        if (res) setStats(prev => ({ ...prev, ...res }));
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);
  const maxEarning = Math.max(...hourlyEarnings.map(h => h.amount));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isOnline ? styles.headerOnline : styles.headerOffline]}>
        <View>
          <Text style={styles.greeting}>Hey, Mike! 👋</Text>
          <Text style={styles.subtitle}>{isOnline ? 'You\'re online and ready' : 'You\'re currently offline'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.onlineToggle, isOnline ? styles.toggleOnline : styles.toggleOffline]}
          onPress={() => setIsOnline(!isOnline)}
        >
          <View style={[styles.toggleDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
          <Text style={[styles.toggleText, isOnline ? styles.toggleTextOnline : styles.toggleTextOffline]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Today's Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="cash-outline" size={22} color={colors.teal} />
            </View>
            <Text style={styles.summaryValue}>₦{stats.todayEarnings.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="bicycle-outline" size={22} color={colors.navy} />
            </View>
            <Text style={styles.summaryValue}>{stats.totalDeliveries}</Text>
            <Text style={styles.summaryLabel}>Deliveries</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="time-outline" size={22} color={colors.warning} />
            </View>
            <Text style={styles.summaryValue}>{stats.avgDeliveryTime}m</Text>
            <Text style={styles.summaryLabel}>Avg. Time</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#CD7F32' + '15' }]}>
              <Ionicons name="star" size={22} color="#CD7F32" />
            </View>
            <Text style={styles.summaryValue}>{stats.rating}</Text>
            <Text style={styles.summaryLabel}>Rating</Text>
          </View>
        </View>

        {/* Weekly Goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Weekly Goal</Text>
            <Text style={styles.goalAmount}>₦{stats.weeklyEarnings.toLocaleString()} / ₦180,000</Text>
          </View>
          <View style={styles.goalBar}>
            <View style={[styles.goalFill, { width: `${stats.goalProgress}%` }]} />
          </View>
          <Text style={styles.goalText}>{stats.goalProgress}% complete · ₦{(180000 - stats.weeklyEarnings).toLocaleString()} to go</Text>
        </View>

        {/* Hourly Earnings Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Today's Earnings</Text>
          <View style={styles.chartContainer}>
            {hourlyEarnings.map((item, index) => (
              <View key={index} style={styles.chartBarWrapper}>
                <View style={styles.chartBarBg}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: `${(item.amount / maxEarning) * 100}%` },
                      item.amount === maxEarning && styles.chartBarPeak,
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.hour}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Online Hours */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursRow}>
            <View style={styles.hoursItem}>
              <Ionicons name="time-outline" size={20} color={colors.teal} />
              <View>
                <Text style={styles.hoursValue}>{stats.onlineHours}h</Text>
                <Text style={styles.hoursLabel}>Online Today</Text>
              </View>
            </View>
            <View style={styles.hoursDivider} />
            <View style={styles.hoursItem}>
              <Ionicons name="speedometer-outline" size={20} color={colors.navy} />
              <View>
                <Text style={styles.hoursValue}>{stats.fuelEfficiency} km</Text>
                <Text style={styles.hoursLabel}>Distance</Text>
              </View>
            </View>
            <View style={styles.hoursDivider} />
            <View style={styles.hoursItem}>
              <Ionicons name="trending-up" size={20} color={colors.success} />
              <View>
                <Text style={styles.hoursValue}>₦{(stats.todayEarnings / stats.onlineHours).toFixed(0)}/h</Text>
                <Text style={styles.hoursLabel}>Per Hour</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Deliveries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Deliveries</Text>
          {recentDeliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryIcon}>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryRestaurant}>{delivery.restaurant}</Text>
                <Text style={styles.deliveryCustomer}>To: {delivery.customer}</Text>
                <View style={styles.deliveryMeta}>
                  <Text style={styles.deliveryMetaText}>{delivery.time}</Text>
                  <Text style={styles.deliveryMetaDot}>·</Text>
                  <Text style={styles.deliveryMetaText}>{delivery.distance}</Text>
                </View>
              </View>
              <View style={styles.deliveryEarnings}>
                <Text style={styles.deliveryAmount}>₦{delivery.amount.toLocaleString()}</Text>
                {delivery.tip > 0 && (
                  <Text style={styles.deliveryTip}>+₦{delivery.tip.toLocaleString()} tip</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Advanced Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Tools</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Performance')}>
              <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' + '15' }]}>
                <Ionicons name="analytics-outline" size={22} color="#8b5cf6" />
              </View>
              <Text style={styles.actionLabel}>Performance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Gamification')}>
              <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' + '15' }]}>
                <Ionicons name="trophy-outline" size={22} color="#f59e0b" />
              </View>
              <Text style={styles.actionLabel}>Rewards</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Safety')}>
              <View style={[styles.actionIcon, { backgroundColor: '#ef4444' + '15' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#ef4444" />
              </View>
              <Text style={styles.actionLabel}>Safety</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('VehicleManagement')}>
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                <Ionicons name="car-outline" size={22} color="#3b82f6" />
              </View>
              <Text style={styles.actionLabel}>Vehicle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: colors.teal + '15' }]}>
                <Ionicons name="navigate-outline" size={22} color={colors.teal} />
              </View>
              <Text style={styles.actionLabel}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="chatbubble-outline" size={22} color={colors.navy} />
              </View>
              <Text style={styles.actionLabel}>Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
              </View>
              <Text style={styles.actionLabel}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.error} />
              </View>
              <Text style={styles.actionLabel}>Safety</Text>
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
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 20,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerOnline: { backgroundColor: colors.navy },
  headerOffline: { backgroundColor: '#555' },
  greeting: { fontSize: 20, fontWeight: '800', color: colors.textWhite },
  subtitle: { fontSize: 13, color: colors.tealLight, marginTop: 2 },
  onlineToggle: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, gap: 8,
  },
  toggleOnline: { backgroundColor: colors.success + '25' },
  toggleOffline: { backgroundColor: 'rgba(255,255,255,0.15)' },
  toggleDot: { width: 10, height: 10, borderRadius: 5 },
  dotOnline: { backgroundColor: colors.success },
  dotOffline: { backgroundColor: colors.textLight },
  toggleText: { fontSize: 14, fontWeight: '700' },
  toggleTextOnline: { color: colors.success },
  toggleTextOffline: { color: colors.textLight },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 10, marginTop: 10 },
  summaryCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  summaryIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  summaryLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  goalCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  goalAmount: { fontSize: 14, fontWeight: '600', color: colors.teal },
  goalBar: { height: 10, backgroundColor: colors.lightGray, borderRadius: 5, overflow: 'hidden' },
  goalFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 5 },
  goalText: { fontSize: 12, color: colors.textLight, marginTop: 8 },
  chartCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 18,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  chartBarBg: { width: 20, height: 80, justifyContent: 'flex-end', borderRadius: 6, overflow: 'hidden', backgroundColor: colors.lightGray },
  chartBar: { width: '100%', backgroundColor: colors.teal, borderRadius: 6 },
  chartBarPeak: { backgroundColor: colors.navy },
  chartLabel: { fontSize: 10, color: colors.textLight, marginTop: 6 },
  hoursCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 16,
  },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  hoursItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hoursValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  hoursLabel: { fontSize: 11, color: colors.textLight },
  hoursDivider: { width: 1, height: 30, backgroundColor: colors.borderLight },
  section: { paddingHorizontal: 10, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  deliveryCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  deliveryIcon: {},
  deliveryInfo: { flex: 1 },
  deliveryRestaurant: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  deliveryCustomer: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  deliveryMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  deliveryMetaText: { fontSize: 12, color: colors.textLight },
  deliveryMetaDot: { fontSize: 12, color: colors.textLight },
  deliveryEarnings: { alignItems: 'flex-end' },
  deliveryAmount: { fontSize: 16, fontWeight: '700', color: colors.teal },
  deliveryTip: { fontSize: 12, color: colors.success, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center' },
  actionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
});
