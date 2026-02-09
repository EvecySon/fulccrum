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


export default function DeliveryZonesScreen({ navigation }: any) {
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await zonesAPI.getBusinessZones('me');
        if (res?.length) setZones(res);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const toggleZone = (id: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
  };

  const activeZones = zones.filter(z => z.isActive).length;
  const totalCapacity = zones.filter(z => z.isActive).reduce((s, z) => s + z.maxOrders, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Zones</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="location-outline" size={20} color={colors.teal} />
            <Text style={styles.summaryValue}>{activeZones}/{zones.length}</Text>
            <Text style={styles.summaryLabel}>Active Zones</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="people-outline" size={20} color={colors.navy} />
            <Text style={styles.summaryValue}>{totalCapacity}</Text>
            <Text style={styles.summaryLabel}>Max Orders</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="receipt-outline" size={20} color={colors.warning} />
            <Text style={styles.summaryValue}>{zones.reduce((s, z) => s + z.orderCount, 0)}</Text>
            <Text style={styles.summaryLabel}>Active Orders</Text>
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={40} color={colors.textLight} />
          <Text style={styles.mapText}>Zone Map View</Text>
          <Text style={styles.mapSubtext}>Interactive map coming soon</Text>
        </View>

        {/* Zones List */}
        {zones.map(zone => (
          <View key={zone.id} style={[styles.zoneCard, !zone.isActive && styles.zoneCardInactive]}>
            <TouchableOpacity
              style={styles.zoneHeader}
              onPress={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
            >
              <View style={styles.zoneInfo}>
                <View style={styles.zoneNameRow}>
                  <View style={[styles.zoneDot, { backgroundColor: zone.isActive ? colors.success : colors.darkGray }]} />
                  <Text style={styles.zoneName}>{zone.name}</Text>
                </View>
                <Text style={styles.zoneDesc}>{zone.description}</Text>
                <View style={styles.zoneMetaRow}>
                  <View style={styles.zoneMeta}>
                    <Ionicons name="bicycle-outline" size={12} color={colors.textLight} />
                    <Text style={styles.zoneMetaText}>₦{zone.deliveryFee.toLocaleString()}</Text>
                  </View>
                  <View style={styles.zoneMeta}>
                    <Ionicons name="time-outline" size={12} color={colors.textLight} />
                    <Text style={styles.zoneMetaText}>{zone.estimatedDeliveryTime} min</Text>
                  </View>
                  <View style={styles.zoneMeta}>
                    <Ionicons name="receipt-outline" size={12} color={colors.textLight} />
                    <Text style={styles.zoneMetaText}>{zone.orderCount} orders</Text>
                  </View>
                </View>
              </View>
              <View style={styles.zoneRight}>
                <Switch
                  value={zone.isActive}
                  onValueChange={() => toggleZone(zone.id)}
                  trackColor={{ false: colors.border, true: colors.teal + '40' }}
                  thumbColor={zone.isActive ? colors.teal : colors.darkGray}
                />
                <Ionicons name={expandedZone === zone.id ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textLight} />
              </View>
            </TouchableOpacity>

            {expandedZone === zone.id && (
              <View style={styles.zoneDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivery Fee</Text>
                  <View style={styles.detailInput}>
                    <Text style={styles.detailPrefix}>₦</Text>
                    <TextInput
                      style={styles.detailValue}
                      value={zone.deliveryFee.toString()}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Minimum Order</Text>
                  <View style={styles.detailInput}>
                    <Text style={styles.detailPrefix}>₦</Text>
                    <TextInput
                      style={styles.detailValue}
                      value={zone.minimumOrder.toString()}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Est. Delivery Time</Text>
                  <View style={styles.detailInput}>
                    <TextInput
                      style={styles.detailValue}
                      value={zone.estimatedDeliveryTime.toString()}
                      keyboardType="numeric"
                    />
                    <Text style={styles.detailSuffix}>min</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Max Concurrent Orders</Text>
                  <View style={styles.detailInput}>
                    <TextInput
                      style={styles.detailValue}
                      value={zone.maxOrders.toString()}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.saveZoneBtn}>
                    <Text style={styles.saveZoneBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteZoneBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={styles.deleteZoneBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
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
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  summaryLabel: { fontSize: 11, color: colors.textLight },
  mapPlaceholder: { backgroundColor: colors.white, margin: 16, borderRadius: 16, padding: 32, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  mapText: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  mapSubtext: { fontSize: 13, color: colors.textLight },
  zoneCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, overflow: 'hidden' },
  zoneCardInactive: { opacity: 0.6 },
  zoneHeader: { flexDirection: 'row', padding: 16 },
  zoneInfo: { flex: 1 },
  zoneNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  zoneDesc: { fontSize: 13, color: colors.textLight, marginBottom: 8 },
  zoneMetaRow: { flexDirection: 'row', gap: 12 },
  zoneMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  zoneMetaText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  zoneRight: { alignItems: 'center', gap: 8 },
  zoneDetails: { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.borderLight },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  detailLabel: { fontSize: 14, color: colors.textSecondary },
  detailInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  detailPrefix: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginRight: 2 },
  detailValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, minWidth: 50, textAlign: 'right' },
  detailSuffix: { fontSize: 13, color: colors.textLight, marginLeft: 4 },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  saveZoneBtn: { flex: 1, backgroundColor: colors.teal, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveZoneBtnText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  deleteZoneBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.error + '10' },
  deleteZoneBtnText: { fontSize: 14, fontWeight: '600', color: colors.error },
});
