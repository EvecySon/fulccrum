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
  Modal,
  ActivityIndicator,
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
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFee, setNewZoneFee] = useState('');
  const [editedZones, setEditedZones] = useState<Record<string, any>>({});

  const toggleZone = async (id: string) => {
    const zone = zones.find(z => z.id === id);
    if (!zone) return;
    setZones(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));
    try {
      await zonesAPI.update(id, { isActive: !zone.isActive });
    } catch (e: any) {
      setZones(prev => prev.map(z => z.id === id ? { ...z, isActive: zone.isActive } : z));
      Alert.alert('Error', e?.message || 'Could not toggle zone');
    }
  };

  const handleAddZone = async () => {
    if (!newZoneName.trim()) { Alert.alert('Missing Info', 'Enter a zone name.'); return; }
    try {
      const created = await zonesAPI.create({
        name: newZoneName.trim(),
        deliveryFee: parseFloat(newZoneFee) || 500,
        isActive: true,
        estimatedDeliveryTime: 30,
        maxOrders: 10,
        minimumOrder: 1000,
      });
      setZones(prev => [...prev, { ...created, orderCount: 0 }]);
      setShowAddZone(false);
      setNewZoneName(''); setNewZoneFee('');
      Alert.alert('Success', 'Delivery zone created!');
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not create zone'); }
  };

  const handleSaveZone = async (zone: any) => {
    const edits = editedZones[zone.id];
    if (!edits) { Alert.alert('No Changes', 'No changes to save.'); return; }
    try {
      await zonesAPI.update(zone.id, edits);
      setZones(prev => prev.map(z => z.id === zone.id ? { ...z, ...edits } : z));
      setEditedZones(prev => { const n = { ...prev }; delete n[zone.id]; return n; });
      Alert.alert('Saved', 'Zone updated successfully.');
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not save zone'); }
  };

  // ─── Delete Modal ───
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteZoneTarget, setDeleteZoneTarget] = useState<any>(null);
  const [deletingZone, setDeletingZone] = useState(false);

  const handleDeleteZone = (id: string, name: string) => {
    setDeleteZoneTarget({ id, name });
    setShowDeleteZone(true);
  };

  const confirmDeleteZone = async () => {
    if (!deleteZoneTarget) return;
    setDeletingZone(true);
    try {
      await zonesAPI.delete(deleteZoneTarget.id);
      setZones(prev => prev.filter(z => z.id !== deleteZoneTarget.id));
      setShowDeleteZone(false);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not delete zone'); }
    finally { setDeletingZone(false); }
  };

  const updateZoneField = (zoneId: string, field: string, value: any) => {
    setEditedZones(prev => ({
      ...prev,
      [zoneId]: { ...(prev[zoneId] || {}), [field]: value },
    }));
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
        <TouchableOpacity onPress={() => setShowAddZone(true)}>
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
                      defaultValue={zone.deliveryFee.toString()}
                      keyboardType="numeric"
                      onChangeText={(v) => updateZoneField(zone.id, 'deliveryFee', parseFloat(v) || 0)}
                    />
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Minimum Order</Text>
                  <View style={styles.detailInput}>
                    <Text style={styles.detailPrefix}>₦</Text>
                    <TextInput
                      style={styles.detailValue}
                      defaultValue={zone.minimumOrder.toString()}
                      keyboardType="numeric"
                      onChangeText={(v) => updateZoneField(zone.id, 'minimumOrder', parseFloat(v) || 0)}
                    />
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Est. Delivery Time</Text>
                  <View style={styles.detailInput}>
                    <TextInput
                      style={styles.detailValue}
                      defaultValue={zone.estimatedDeliveryTime.toString()}
                      keyboardType="numeric"
                      onChangeText={(v) => updateZoneField(zone.id, 'estimatedDeliveryTime', parseInt(v) || 0)}
                    />
                    <Text style={styles.detailSuffix}>min</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Max Concurrent Orders</Text>
                  <View style={styles.detailInput}>
                    <TextInput
                      style={styles.detailValue}
                      defaultValue={zone.maxOrders.toString()}
                      keyboardType="numeric"
                      onChangeText={(v) => updateZoneField(zone.id, 'maxOrders', parseInt(v) || 0)}
                    />
                  </View>
                </View>
                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.saveZoneBtn} onPress={() => handleSaveZone(zone)}>
                    <Text style={styles.saveZoneBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteZoneBtn} onPress={() => handleDeleteZone(zone.id, zone.name)}>
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

      {/* Add Zone Modal */}
      <Modal visible={showAddZone} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowAddZone(false)} />
          <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>Add Delivery Zone</Text>
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, marginBottom: 12 }}
              placeholder="Zone name (e.g. Downtown)"
              placeholderTextColor={colors.textLight}
              value={newZoneName}
              onChangeText={setNewZoneName}
            />
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, marginBottom: 16 }}
              placeholder="Delivery fee (₦)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={newZoneFee}
              onChangeText={setNewZoneFee}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' }} onPress={() => setShowAddZone(false)}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.teal, alignItems: 'center' }} onPress={handleAddZone}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>Add Zone</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Zone Modal */}
      <Modal visible={showDeleteZone} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !deletingZone && setShowDeleteZone(false)} />
          <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>Delete Zone</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>Are you sure you want to delete "{deleteZoneTarget?.name}"?</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' }} onPress={() => setShowDeleteZone(false)}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.error, alignItems: 'center', opacity: deletingZone ? 0.6 : 1 }} onPress={confirmDeleteZone} disabled={deletingZone}>
                {deletingZone ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
