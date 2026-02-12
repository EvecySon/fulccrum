import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { sustainabilityAPI } from '../../services/api';

interface EcoOption {
  key: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}


const defaultEcoOptions: EcoOption[] = [
  { key: 'no_utensils', label: 'No Plastic Utensils', description: 'Skip disposable cutlery with your orders', icon: 'restaurant-outline', enabled: true },
  { key: 'electric_delivery', label: 'Prefer Electric Delivery', description: 'Prioritize eco-friendly delivery vehicles', icon: 'flash-outline', enabled: false },
  { key: 'local_first', label: 'Local First', description: 'Prefer nearby restaurants to reduce emissions', icon: 'location-outline', enabled: true },
  { key: 'minimal_packaging', label: 'Minimal Packaging', description: 'Request reduced packaging when possible', icon: 'cube-outline', enabled: false },
  { key: 'carbon_offset', label: 'Auto Carbon Offset', description: 'Automatically offset delivery emissions', icon: 'leaf-outline', enabled: false },
];

export default function SustainabilityScreen({ navigation }: any) {
  const [ecoOptions, setEcoOptions] = useState<EcoOption[]>(defaultEcoOptions);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ totalOrders: 0, carbonSaved: 0, treesEquivalent: 0, ecoScore: 0, plasticAvoided: 0, localOrders: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [footprint, options] = await Promise.all([
        sustainabilityAPI.getCarbonFootprint(),
        sustainabilityAPI.getEcoOptions(),
      ]);
      if (footprint) {
        setStats({
          totalOrders: footprint.totalOrders || 0,
          carbonSaved: footprint.totalCO2Saved ?? footprint.carbonSaved ?? 0,
          treesEquivalent: footprint.treesEquivalent || 0,
          ecoScore: footprint.ecoScore ?? Math.min(Math.round((footprint.ecoOrdersPercent || 0) * 100), 100),
          plasticAvoided: footprint.plasticAvoided ?? (footprint.totalOrders || 0) * 2,
          localOrders: footprint.localOrders ?? Math.round((footprint.totalOrders || 0) * 0.6),
        });
      }
      if (Array.isArray(options)) {
        // Map backend eco options to frontend shape
        setEcoOptions(options.map((o: any) => ({
          key: o.key,
          label: o.label,
          description: o.description || o.impact || '',
          icon: defaultEcoOptions.find(d => d.key === o.key)?.icon || 'leaf-outline',
          enabled: o.enabled ?? false,
        })));
      }
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setLoading(false);
  };

  const toggleOption = async (key: string) => {
    setEcoOptions(prev => prev.map(o => o.key === key ? { ...o, enabled: !o.enabled } : o));
    try {
      const updated = ecoOptions.find(o => o.key === key);
      await sustainabilityAPI.updateEcoOptions({ [key]: !updated?.enabled });
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eco Impact</Text>
        <Ionicons name="leaf" size={22} color={colors.success} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Eco Score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{stats.ecoScore}</Text>
            <Text style={styles.scoreLabel}>Eco Score</Text>
          </View>
          <Text style={styles.scoreMessage}>
            {stats.ecoScore >= 80 ? 'Amazing! You\'re an eco champion!' :
             stats.ecoScore >= 60 ? 'Great job! Keep making green choices.' :
             'Small changes make a big difference!'}
          </Text>
        </View>

        {/* Impact Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color={colors.success} />
            <Text style={styles.statValue}>{stats.carbonSaved} kg</Text>
            <Text style={styles.statLabel}>CO₂ Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="leaf-outline" size={24} color={colors.success} />
            <Text style={styles.statValue}>{stats.treesEquivalent}</Text>
            <Text style={styles.statLabel}>Trees Equivalent</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trash-outline" size={24} color={colors.teal} />
            <Text style={styles.statValue}>{stats.plasticAvoided}</Text>
            <Text style={styles.statLabel}>Plastic Items Avoided</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="storefront" size={24} color={colors.navy} />
            <Text style={styles.statValue}>{stats.localOrders}</Text>
            <Text style={styles.statLabel}>Local Orders</Text>
          </View>
        </View>

        {/* Eco Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eco Preferences</Text>
          {ecoOptions.map(opt => (
            <View key={opt.key} style={styles.optionRow}>
              <View style={styles.optionIcon}>
                <Ionicons name={opt.icon as any} size={20} color={colors.teal} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionDesc}>{opt.description}</Text>
              </View>
              <Switch
                value={opt.enabled}
                onValueChange={() => toggleOption(opt.key)}
                trackColor={{ false: colors.border, true: colors.teal + '60' }}
                thumbColor={opt.enabled ? colors.teal : colors.darkGray}
              />
            </View>
          ))}
        </View>

        {/* Carbon Offset */}
        <View style={styles.offsetCard}>
          <Ionicons name="earth" size={32} color={colors.success} />
          <View style={styles.offsetInfo}>
            <Text style={styles.offsetTitle}>Offset Your Carbon</Text>
            <Text style={styles.offsetDesc}>Contribute to reforestation projects to neutralize your delivery emissions</Text>
          </View>
          <TouchableOpacity style={styles.offsetBtn}>
            <Text style={styles.offsetBtnText}>Offset ₦200</Text>
          </TouchableOpacity>
        </View>

        {/* Waste Reduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Surplus Deals</Text>
          <Text style={styles.sectionSubtitle}>Help reduce food waste and save money</Text>
          <View style={styles.surplusCard}>
            <View style={styles.surplusBadge}>
              <Text style={styles.surplusBadgeText}>-40%</Text>
            </View>
            <View style={styles.surplusInfo}>
              <Text style={styles.surplusName}>Mystery Bag - Mama's Kitchen</Text>
              <Text style={styles.surplusDesc}>Assorted dishes worth ₦5,000+</Text>
              <Text style={styles.surplusPrice}>₦3,000</Text>
            </View>
          </View>
          <View style={styles.surplusCard}>
            <View style={styles.surplusBadge}>
              <Text style={styles.surplusBadgeText}>-30%</Text>
            </View>
            <View style={styles.surplusInfo}>
              <Text style={styles.surplusName}>End of Day Bundle - Burger House</Text>
              <Text style={styles.surplusDesc}>2 burgers + sides</Text>
              <Text style={styles.surplusPrice}>₦2,800</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  scoreCard: { margin: 16, backgroundColor: colors.success, borderRadius: 20, padding: 24, alignItems: 'center' },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  scoreValue: { fontSize: 32, fontWeight: '800', color: colors.textWhite },
  scoreLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  scoreMessage: { fontSize: 15, fontWeight: '600', color: colors.textWhite, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  statCard: { width: '48%', backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center', flexGrow: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginTop: 8 },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2, textAlign: 'center' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: colors.textLight, marginBottom: 12 },
  optionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8, gap: 12 },
  optionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.teal + '10', justifyContent: 'center', alignItems: 'center' },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  optionDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  offsetCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 8 },
  offsetInfo: { flex: 1 },
  offsetTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  offsetDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  offsetBtn: { backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  offsetBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  surplusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  surplusBadge: { backgroundColor: colors.error + '15', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  surplusBadgeText: { fontSize: 14, fontWeight: '800', color: colors.error },
  surplusInfo: { flex: 1 },
  surplusName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  surplusDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  surplusPrice: { fontSize: 15, fontWeight: '700', color: colors.teal, marginTop: 4 },
});
