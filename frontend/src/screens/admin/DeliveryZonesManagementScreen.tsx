import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { zonesAPI } from '../../services/api';

const mockZones = [
  { id: '1', name: 'Lekki Phase 1', businesses: 45, activeOrders: 120, baseFee: 500, avgDeliveryTime: 18, isActive: true, couriersAvailable: 15 },
  { id: '2', name: 'Victoria Island', businesses: 62, activeOrders: 95, baseFee: 600, avgDeliveryTime: 22, isActive: true, couriersAvailable: 12 },
  { id: '3', name: 'Ikoyi', businesses: 38, activeOrders: 67, baseFee: 550, avgDeliveryTime: 20, isActive: true, couriersAvailable: 8 },
  { id: '4', name: 'Surulere', businesses: 28, activeOrders: 45, baseFee: 700, avgDeliveryTime: 30, isActive: true, couriersAvailable: 6 },
  { id: '5', name: 'Ajah', businesses: 15, activeOrders: 22, baseFee: 1200, avgDeliveryTime: 45, isActive: false, couriersAvailable: 3 },
  { id: '6', name: 'Ikeja', businesses: 52, activeOrders: 88, baseFee: 800, avgDeliveryTime: 35, isActive: true, couriersAvailable: 10 },
];

export default function DeliveryZonesManagementScreen({ navigation }: any) {
  const [zones, setZones] = useState(mockZones);

  useEffect(() => {
    (async () => {
      try {
        const res = await zonesAPI.getBusinessZones('all');
        if (res?.length) setZones(res);
      } catch (e: any) { showAlert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleZone = (id: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
  };

  const totalBusinesses = zones.filter(z => z.isActive).reduce((s, z) => s + z.businesses, 0);
  const totalOrders = zones.filter(z => z.isActive).reduce((s, z) => s + z.activeOrders, 0);
  const totalCouriers = zones.filter(z => z.isActive).reduce((s, z) => s + z.couriersAvailable, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Zones</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Platform Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="location" size={18} color={colors.teal} />
            <Text style={styles.statValue}>{zones.filter(z => z.isActive).length}/{zones.length}</Text>
            <Text style={styles.statLabel}>Active Zones</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="storefront" size={18} color={colors.navy} />
            <Text style={styles.statValue}>{totalBusinesses}</Text>
            <Text style={styles.statLabel}>Businesses</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bicycle" size={18} color={colors.warning} />
            <Text style={styles.statValue}>{totalCouriers}</Text>
            <Text style={styles.statLabel}>Couriers</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="receipt" size={18} color={colors.success} />
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={36} color={colors.textLight} />
          <Text style={styles.mapText}>Interactive Zone Map</Text>
          <Text style={styles.mapSubtext}>Tap zones to manage coverage areas</Text>
        </View>

        {/* Zones List */}
        {zones.map(zone => (
          <TouchableOpacity
            key={zone.id}
            style={[styles.zoneCard, !zone.isActive && styles.zoneCardInactive]}
            onPress={() => setExpandedId(expandedId === zone.id ? null : zone.id)}
          >
            <View style={styles.zoneTop}>
              <View style={styles.zoneInfo}>
                <View style={styles.zoneNameRow}>
                  <View style={[styles.zoneDot, { backgroundColor: zone.isActive ? colors.success : colors.darkGray }]} />
                  <Text style={styles.zoneName}>{zone.name}</Text>
                </View>
                <View style={styles.zoneMeta}>
                  <Text style={styles.zoneMetaText}>{zone.businesses} businesses</Text>
                  <Text style={styles.zoneMetaDot}>·</Text>
                  <Text style={styles.zoneMetaText}>{zone.activeOrders} orders</Text>
                  <Text style={styles.zoneMetaDot}>·</Text>
                  <Text style={styles.zoneMetaText}>₦{zone.baseFee.toLocaleString()}</Text>
                </View>
              </View>
              <Switch
                value={zone.isActive}
                onValueChange={() => toggleZone(zone.id)}
                trackColor={{ false: colors.border, true: colors.teal + '40' }}
                thumbColor={zone.isActive ? colors.teal : colors.darkGray}
              />
            </View>

            {/* Live Stats */}
            <View style={styles.liveStats}>
              <View style={styles.liveStat}>
                <Ionicons name="time-outline" size={14} color={colors.textLight} />
                <Text style={styles.liveStatText}>Avg {zone.avgDeliveryTime} min</Text>
              </View>
              <View style={styles.liveStat}>
                <Ionicons name="bicycle-outline" size={14} color={colors.textLight} />
                <Text style={styles.liveStatText}>{zone.couriersAvailable} couriers</Text>
              </View>
              <View style={styles.liveStat}>
                <View style={[styles.loadDot, {
                  backgroundColor: zone.activeOrders / zone.couriersAvailable > 10 ? colors.error :
                    zone.activeOrders / zone.couriersAvailable > 5 ? colors.warning : colors.success
                }]} />
                <Text style={styles.liveStatText}>
                  {zone.couriersAvailable > 0 ? (zone.activeOrders / zone.couriersAvailable).toFixed(1) : '0'} orders/courier
                </Text>
              </View>
            </View>

            {expandedId === zone.id && (
              <View style={styles.expandedSection}>
                <View style={styles.editRow}>
                  <Text style={styles.editLabel}>Base Delivery Fee</Text>
                  <View style={styles.editInput}>
                    <Text style={styles.editPrefix}>₦</Text>
                    <TextInput style={styles.editValue} value={zone.baseFee.toString()} keyboardType="numeric" />
                  </View>
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 10, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textLight },
  mapPlaceholder: { backgroundColor: colors.white, margin: 16, borderRadius: 16, padding: 28, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  mapText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  mapSubtext: { fontSize: 12, color: colors.textLight },
  zoneCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14 },
  zoneCardInactive: { opacity: 0.5 },
  zoneTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  zoneInfo: { flex: 1 },
  zoneNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  zoneMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  zoneMetaText: { fontSize: 12, color: colors.textSecondary },
  zoneMetaDot: { fontSize: 12, color: colors.textLight },
  liveStats: { flexDirection: 'row', gap: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  liveStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveStatText: { fontSize: 12, color: colors.textSecondary },
  loadDot: { width: 6, height: 6, borderRadius: 3 },
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  editRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  editLabel: { fontSize: 14, color: colors.textSecondary },
  editInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  editPrefix: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  editValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, minWidth: 50, textAlign: 'right' },
  editActions: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: colors.teal, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  deleteBtn: { width: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error + '10', borderRadius: 10 },
});
