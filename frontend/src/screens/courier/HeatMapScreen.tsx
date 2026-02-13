import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { analyticsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

interface SurgeZone {
  id: string;
  area: string;
  multiplier: number;
  estimatedOrders: number;
  distance: number;
  expiresIn: number; // minutes
  level: 'low' | 'medium' | 'high' | 'extreme';
}

interface HourlyDemand {
  hour: string;
  demand: number;
  surge: number;
}

const mockSurgeZones: SurgeZone[] = [
  { id: '1', area: 'Victoria Island', multiplier: 2.0, estimatedOrders: 35, distance: 1.2, expiresIn: 25, level: 'extreme' },
  { id: '2', area: 'Lekki Phase 1', multiplier: 1.8, estimatedOrders: 28, distance: 2.5, expiresIn: 18, level: 'high' },
  { id: '3', area: 'Ikeja GRA', multiplier: 1.5, estimatedOrders: 22, distance: 4.8, expiresIn: 30, level: 'high' },
  { id: '4', area: 'Surulere', multiplier: 1.3, estimatedOrders: 15, distance: 6.1, expiresIn: 45, level: 'medium' },
  { id: '5', area: 'Yaba', multiplier: 1.2, estimatedOrders: 12, distance: 3.4, expiresIn: 20, level: 'medium' },
  { id: '6', area: 'Ajah', multiplier: 1.0, estimatedOrders: 8, distance: 8.2, expiresIn: 60, level: 'low' },
];

const mockHourlyDemand: HourlyDemand[] = [
  { hour: '9AM', demand: 20, surge: 1.0 },
  { hour: '10AM', demand: 35, surge: 1.0 },
  { hour: '11AM', demand: 55, surge: 1.2 },
  { hour: '12PM', demand: 85, surge: 1.5 },
  { hour: '1PM', demand: 95, surge: 1.8 },
  { hour: '2PM', demand: 60, surge: 1.3 },
  { hour: '3PM', demand: 40, surge: 1.0 },
  { hour: '4PM', demand: 30, surge: 1.0 },
  { hour: '5PM', demand: 50, surge: 1.2 },
  { hour: '6PM', demand: 80, surge: 1.5 },
  { hour: '7PM', demand: 100, surge: 2.0 },
  { hour: '8PM', demand: 90, surge: 1.8 },
  { hour: '9PM', demand: 65, surge: 1.3 },
  { hour: '10PM', demand: 35, surge: 1.0 },
];

const mockStats = {
  currentSurge: 1.5,
  activeZones: 4,
  avgBonus: 350,
  peakTime: '7:00 PM',
};

export default function HeatMapScreen({ navigation }: any) {
  const [zones, setZones] = useState<SurgeZone[]>([]);
  const [hourly, setHourly] = useState<HourlyDemand[]>([]);
  const [stats, setStats] = useState(mockStats);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await analyticsAPI.dashboard();
      if (res?.surgeZones) setZones(res.surgeZones);
      else setZones(mockSurgeZones);
      if (res?.hourlyDemand) setHourly(res.hourlyDemand);
      else setHourly(mockHourlyDemand);
    } catch {
      setZones(mockSurgeZones);
      setHourly(mockHourlyDemand);
    }
    setRefreshing(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'extreme': return '#dc2626';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return colors.teal;
      default: return colors.textLight;
    }
  };

  const getLevelBg = (level: string) => getLevelColor(level) + '12';

  const maxDemand = Math.max(...hourly.map(h => h.demand));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Surge & Heat Map</Text>
        <TouchableOpacity onPress={() => loadData()}>
          <Ionicons name="refresh" size={22} color={colors.tealLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}
      >
        {/* Map Placeholder */}
        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={colors.teal} />
            <Text style={styles.mapText}>Live Surge Map</Text>
            <Text style={styles.mapSubtext}>Showing {zones.filter(z => z.multiplier > 1).length} active surge zones</Text>
            {/* Heat indicators */}
            <View style={styles.heatLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
                <Text style={styles.legendText}>2x+</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f97316' }]} />
                <Text style={styles.legendText}>1.5x</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
                <Text style={styles.legendText}>1.2x</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.teal }]} />
                <Text style={styles.legendText}>Normal</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="trending-up" size={18} color={colors.error} />
            </View>
            <Text style={styles.statValue}>{stats.currentSurge}x</Text>
            <Text style={styles.statLabel}>Current Surge</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="flame" size={18} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.activeZones}</Text>
            <Text style={styles.statLabel}>Active Zones</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="cash" size={18} color={colors.teal} />
            </View>
            <Text style={styles.statValue}>₦{stats.avgBonus}</Text>
            <Text style={styles.statLabel}>Avg Bonus</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="time" size={18} color={colors.navy} />
            </View>
            <Text style={styles.statValue}>{stats.peakTime}</Text>
            <Text style={styles.statLabel}>Next Peak</Text>
          </View>
        </View>

        {/* Surge Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Surge Zones</Text>
          <Text style={styles.sectionSub}>Head to these areas for higher earnings</Text>

          {zones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              style={[styles.zoneCard, selectedZone === zone.id && { borderColor: getLevelColor(zone.level), borderWidth: 2 }]}
              onPress={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
            >
              <View style={styles.zoneHeader}>
                <View style={styles.zoneLeft}>
                  <View style={[styles.zoneLevelDot, { backgroundColor: getLevelColor(zone.level) }]} />
                  <View>
                    <Text style={styles.zoneName}>{zone.area}</Text>
                    <Text style={styles.zoneDistance}>{zone.distance} km away</Text>
                  </View>
                </View>
                <View style={[styles.surgeMultiplier, { backgroundColor: getLevelBg(zone.level) }]}>
                  <Ionicons name="trending-up" size={14} color={getLevelColor(zone.level)} />
                  <Text style={[styles.surgeMultiplierText, { color: getLevelColor(zone.level) }]}>
                    {zone.multiplier}x
                  </Text>
                </View>
              </View>

              <View style={styles.zoneMeta}>
                <View style={styles.zoneMetaItem}>
                  <Ionicons name="bag-outline" size={14} color={colors.textLight} />
                  <Text style={styles.zoneMetaText}>~{zone.estimatedOrders} orders</Text>
                </View>
                <View style={styles.zoneMetaItem}>
                  <Ionicons name="timer-outline" size={14} color={colors.textLight} />
                  <Text style={styles.zoneMetaText}>Expires in {zone.expiresIn}m</Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: getLevelBg(zone.level) }]}>
                  <Text style={[styles.levelBadgeText, { color: getLevelColor(zone.level) }]}>
                    {zone.level.toUpperCase()}
                  </Text>
                </View>
              </View>

              {selectedZone === zone.id && (
                <View style={styles.zoneExpanded}>
                  <Text style={styles.zoneExpandedText}>
                    Earn up to ₦{Math.round(zone.multiplier * 1500).toLocaleString()} per delivery in this zone.
                    {zone.multiplier >= 1.5 ? ' High demand — get there fast!' : ' Moderate demand.'}
                  </Text>
                  <TouchableOpacity style={[styles.navigateBtn, { backgroundColor: getLevelColor(zone.level) }]}>
                    <Ionicons name="navigate" size={16} color={colors.textWhite} />
                    <Text style={styles.navigateBtnText}>Navigate Here</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Hourly Demand Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Today's Demand Forecast</Text>
          <Text style={styles.sectionSub}>Plan your day around peak hours</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            <View style={styles.chartContainer}>
              {hourly.map((item, index) => {
                const barHeight = (item.demand / maxDemand) * 100;
                const barColor = item.surge >= 1.8 ? '#dc2626' : item.surge >= 1.3 ? '#f97316' : item.surge > 1 ? '#eab308' : colors.teal;
                return (
                  <View key={index} style={styles.chartBarWrapper}>
                    {item.surge > 1 && (
                      <Text style={[styles.chartSurge, { color: barColor }]}>{item.surge}x</Text>
                    )}
                    <View style={styles.chartBarBg}>
                      <View style={[styles.chartBar, { height: `${barHeight}%`, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.chartLabel}>{item.hour}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>Surge Tips</Text>
          <View style={styles.tipRow}>
            <Ionicons name="bulb" size={18} color={colors.warning} />
            <Text style={styles.tipText}>Position yourself near surge zones before peak hours</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="bulb" size={18} color={colors.warning} />
            <Text style={styles.tipText}>Lunch (12-2 PM) and dinner (6-9 PM) have the highest demand</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="bulb" size={18} color={colors.warning} />
            <Text style={styles.tipText}>Rainy days often trigger 1.5-2x surge across all zones</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  mapCard: { marginHorizontal: 10, marginTop: 10 },
  mapPlaceholder: {
    height: 200, backgroundColor: colors.navy + '08', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.navy + '15',
  },
  mapText: { fontSize: 16, fontWeight: '700', color: colors.navy, marginTop: 8 },
  mapSubtext: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  heatLegend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 10, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 10, alignItems: 'center' },
  statIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textLight, marginTop: 1 },
  section: { paddingHorizontal: 10, marginTop: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  sectionSub: { fontSize: 12, color: colors.textLight, marginBottom: 10 },
  zoneCard: { backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'transparent' },
  zoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zoneLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  zoneLevelDot: { width: 10, height: 10, borderRadius: 5 },
  zoneName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  zoneDistance: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  surgeMultiplier: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  surgeMultiplierText: { fontSize: 16, fontWeight: '800' },
  zoneMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  zoneMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  zoneMetaText: { fontSize: 12, color: colors.textLight },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 'auto' },
  levelBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  zoneExpanded: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  zoneExpandedText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  navigateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  navigateBtnText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  chartCard: { marginHorizontal: 10, marginTop: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  chartScroll: { marginTop: 8 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 4 },
  chartBarWrapper: { alignItems: 'center', width: 44 },
  chartSurge: { fontSize: 9, fontWeight: '800', marginBottom: 2 },
  chartBarBg: { width: 22, height: 100, backgroundColor: colors.lightGray, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  chartBar: { width: '100%', borderRadius: 6 },
  chartLabel: { fontSize: 10, color: colors.textLight, marginTop: 4 },
  tipsCard: { marginHorizontal: 10, marginTop: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 10 },
  tipText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
