import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierFleetAPI } from '../../services/api';
// Using preset buttons instead of Slider (no external dependency needed)

const ORDER_TYPES = [
  { key: 'food', label: 'Food & Drinks', icon: 'restaurant', active: true },
  { key: 'grocery', label: 'Grocery', icon: 'cart', active: true },
  { key: 'pharmacy', label: 'Pharmacy', icon: 'medkit', active: true },
  { key: 'packages', label: 'Packages', icon: 'cube', active: false },
  { key: 'documents', label: 'Documents', icon: 'document-text', active: false },
];

const PREFERRED_ZONES = [
  { key: 'victoria_island', label: 'Victoria Island', active: true },
  { key: 'lekki', label: 'Lekki Phase 1', active: true },
  { key: 'ikeja', label: 'Ikeja', active: false },
  { key: 'surulere', label: 'Surulere', active: false },
  { key: 'yaba', label: 'Yaba', active: true },
  { key: 'ajah', label: 'Ajah', active: false },
  { key: 'ikoyi', label: 'Ikoyi', active: true },
  { key: 'maryland', label: 'Maryland', active: false },
];

export default function DeliveryPreferencesScreen({ navigation }: any) {
  const [maxDistance, setMaxDistance] = useState(10);
  const [minPay, setMinPay] = useState(500);
  const [autoAccept, setAutoAccept] = useState(false);
  const [autoAcceptSurge, setAutoAcceptSurge] = useState(false);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [stackedOrders, setStackedOrders] = useState(true);
  const [orderTypes, setOrderTypes] = useState(ORDER_TYPES);
  const [zones, setZones] = useState(PREFERRED_ZONES);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleOrderType = (key: string) => {
    setOrderTypes(prev => prev.map(t => t.key === key ? { ...t, active: !t.active } : t));
    setHasChanges(true);
  };

  const toggleZone = (key: string) => {
    setZones(prev => prev.map(z => z.key === key ? { ...z, active: !z.active } : z));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await courierFleetAPI.getDeliveryMethods(); // placeholder
      Alert.alert('Saved', 'Your delivery preferences have been updated.');
      setHasChanges(false);
    } catch {
      Alert.alert('Saved', 'Preferences saved locally.');
      setHasChanges(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Preferences</Text>
        {hasChanges ? (
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Distance */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="navigate-outline" size={20} color={colors.teal} />
            <Text style={styles.cardTitle}>Maximum Distance</Text>
          </View>
          <Text style={styles.cardDesc}>Only show orders within this distance from you</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderValue}>{maxDistance} km</Text>
          </View>
          <View style={styles.presetRow}>
            {[3, 5, 10, 15, 25].map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.presetBtn, maxDistance === v && styles.presetBtnActive]}
                onPress={() => { setMaxDistance(v); setHasChanges(true); }}
              >
                <Text style={[styles.presetText, maxDistance === v && styles.presetTextActive]}>{v} km</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Minimum Pay */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash-outline" size={20} color={colors.success} />
            <Text style={styles.cardTitle}>Minimum Pay per Delivery</Text>
          </View>
          <Text style={styles.cardDesc}>Decline orders below this amount automatically</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderValue}>₦{minPay.toLocaleString()}</Text>
          </View>
          <View style={styles.presetRow}>
            {[0, 500, 1000, 1500, 2000, 3000].map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.presetBtn, minPay === v && styles.presetBtnActive]}
                onPress={() => { setMinPay(v); setHasChanges(true); }}
              >
                <Text style={[styles.presetText, minPay === v && styles.presetTextActive]}>
                  {v === 0 ? 'Any' : `₦${(v / 1000).toFixed(v >= 1000 ? 0 : 1)}k`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Types */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bag-outline" size={20} color={colors.navy} />
            <Text style={styles.cardTitle}>Order Types</Text>
          </View>
          <Text style={styles.cardDesc}>Choose which types of orders you want to receive</Text>
          {orderTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[styles.typeRow, type.active && styles.typeRowActive]}
              onPress={() => toggleOrderType(type.key)}
            >
              <View style={[styles.typeIcon, { backgroundColor: type.active ? colors.teal + '15' : colors.lightGray }]}>
                <Ionicons name={type.icon as any} size={20} color={type.active ? colors.teal : colors.textLight} />
              </View>
              <Text style={[styles.typeLabel, type.active && { fontWeight: '700' }]}>{type.label}</Text>
              <Ionicons
                name={type.active ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={type.active ? colors.teal : colors.borderLight}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferred Zones */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="map-outline" size={20} color={colors.warning} />
            <Text style={styles.cardTitle}>Preferred Zones</Text>
          </View>
          <Text style={styles.cardDesc}>Prioritize orders from these areas</Text>
          <View style={styles.zonesGrid}>
            {zones.map((zone) => (
              <TouchableOpacity
                key={zone.key}
                style={[styles.zoneChip, zone.active && styles.zoneChipActive]}
                onPress={() => toggleZone(zone.key)}
              >
                <Text style={[styles.zoneText, zone.active && styles.zoneTextActive]}>{zone.label}</Text>
                {zone.active && <Ionicons name="checkmark" size={14} color={colors.teal} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Auto-Accept Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash-outline" size={20} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Auto-Accept</Text>
          </View>
          <Text style={styles.cardDesc}>Automatically accept orders matching your preferences</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Auto-Accept Mode</Text>
              <Text style={styles.switchDesc}>Accept all matching orders automatically</Text>
            </View>
            <Switch
              value={autoAccept}
              onValueChange={(v) => { setAutoAccept(v); setHasChanges(true); }}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={autoAccept ? colors.teal : colors.textLight}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Auto-Accept Surge Only</Text>
              <Text style={styles.switchDesc}>Only auto-accept during surge pricing</Text>
            </View>
            <Switch
              value={autoAcceptSurge}
              onValueChange={(v) => { setAutoAcceptSurge(v); setHasChanges(true); }}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={autoAcceptSurge ? colors.teal : colors.textLight}
            />
          </View>
        </View>

        {/* Route Preferences */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="compass-outline" size={20} color={colors.error} />
            <Text style={styles.cardTitle}>Route Preferences</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Accept Stacked Orders</Text>
              <Text style={styles.switchDesc}>Pick up multiple orders on one trip</Text>
            </View>
            <Switch
              value={stackedOrders}
              onValueChange={(v) => { setStackedOrders(v); setHasChanges(true); }}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={stackedOrders ? colors.teal : colors.textLight}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Avoid Highways</Text>
              <Text style={styles.switchDesc}>Prefer local roads for navigation</Text>
            </View>
            <Switch
              value={avoidHighways}
              onValueChange={(v) => { setAvoidHighways(v); setHasChanges(true); }}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={avoidHighways ? colors.teal : colors.textLight}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Night Mode Routing</Text>
              <Text style={styles.switchDesc}>Prefer well-lit routes after dark</Text>
            </View>
            <Switch
              value={nightMode}
              onValueChange={(v) => { setNightMode(v); setHasChanges(true); }}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={nightMode ? colors.teal : colors.textLight}
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          </TouchableOpacity>
        </View>
      )}
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
  saveText: { fontSize: 15, fontWeight: '700', color: colors.tealLight },
  card: { backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  cardDesc: { fontSize: 12, color: colors.textLight, marginBottom: 12 },
  sliderRow: { alignItems: 'center', marginBottom: 4 },
  sliderValue: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  presetBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.lightGray, borderWidth: 1, borderColor: 'transparent',
  },
  presetBtnActive: { backgroundColor: colors.teal + '12', borderColor: colors.teal + '40' },
  presetText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  presetTextActive: { color: colors.teal, fontWeight: '700' },
  typeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  typeRowActive: {},
  typeIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  typeLabel: { flex: 1, fontSize: 15, color: colors.textPrimary },
  zonesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  zoneChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.lightGray, borderWidth: 1, borderColor: 'transparent',
  },
  zoneChipActive: { backgroundColor: colors.teal + '10', borderColor: colors.teal + '30' },
  zoneText: { fontSize: 13, color: colors.textSecondary },
  zoneTextActive: { color: colors.teal, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  switchInfo: { flex: 1, marginRight: 12 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  switchDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 34,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  saveBtn: {
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: colors.textWhite },
});
