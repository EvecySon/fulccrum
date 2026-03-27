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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierSurgeAPI } from '../../services/api';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from '../../components/MapView';

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


export default function HeatMapScreen({ navigation }: any) {
  const [zones, setZones] = useState<SurgeZone[]>([]);
  const [hourly, setHourly] = useState<HourlyDemand[]>([]);
  const [stats, setStats] = useState({ currentSurge: 0, activeZones: 0, avgBonus: 0, peakTime: '--' });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [zonesRes, hourlyRes, statsRes] = await Promise.all([
        courierSurgeAPI.getZones().catch(() => null),
        courierSurgeAPI.getHourlyDemand().catch(() => null),
        courierSurgeAPI.getStats().catch(() => null),
      ]);
      if (Array.isArray(zonesRes)) setZones(zonesRes);
      if (Array.isArray(hourlyRes)) setHourly(hourlyRes);
      if (statsRes) setStats(prev => ({ ...prev, ...statsRes }));
    } catch {}
    setRefreshing(false);
  };

  // Map zone IDs to coordinates around Lagos
  const getZoneCoords = (zoneId: string) => {
    const coordsMap: Record<string, { latitude: number; longitude: number }> = {
      '1': { latitude: 6.4281, longitude: 3.4219 }, // Victoria Island
      '2': { latitude: 6.4541, longitude: 3.3947 }, // Ikoyi
      '3': { latitude: 6.5244, longitude: 3.3792 }, // Lekki Phase 1
      '4': { latitude: 6.5820, longitude: 3.3515 }, // Ikeja GRA
      '5': { latitude: 6.4400, longitude: 3.4100 }, // Lagos Island
    };
    return coordsMap[zoneId] || { latitude: 6.5244, longitude: 3.3792 };
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
        {/* Live Surge Map */}
        <View style={styles.mapCard}>
          <MapView
            style={styles.mapView}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{ latitude: 6.5244, longitude: 3.3792, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
            showsUserLocation
          >
            {zones.map((zone) => {
              const coords = getZoneCoords(zone.id);
              const color = getLevelColor(zone.level);
              return (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={coords}
                    radius={zone.multiplier * 600}
                    fillColor={color + '25'}
                    strokeColor={color + '60'}
                    strokeWidth={2}
                  />
                  <Marker coordinate={coords} onPress={() => setSelectedZone(zone.id === selectedZone ? null : zone.id)}>
                    <View style={[styles.surgeMarker, { backgroundColor: color }]}>
                      <Text style={styles.surgeMarkerText}>{zone.multiplier}x</Text>
                    </View>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapView>
          {/* Legend overlay */}
          <View style={styles.legendOverlay}>
            {[
              { color: '#dc2626', label: '2x+' },
              { color: '#f97316', label: '1.5x' },
              { color: '#eab308', label: '1.2x' },
              { color: colors.teal, label: 'Normal' },
            ].map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
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
  mapCard: { marginHorizontal: 10, marginTop: 10, borderRadius: 20, overflow: 'hidden', position: 'relative' as const },
  mapView: { height: 260, borderRadius: 20 },
  surgeMarker: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  surgeMarkerText: { fontSize: 12, fontWeight: '800', color: colors.white },
  legendOverlay: {
    position: 'absolute' as const, bottom: 10, left: 10, right: 10,
    flexDirection: 'row', justifyContent: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10,
  },
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
