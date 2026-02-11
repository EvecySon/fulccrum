import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { blockchainAPI, menuAPI } from '../../services/api';

interface SupplyChainItem {
  itemId: string;
  itemName: string;
  origin?: { farm?: string; region?: string; country?: string };
  certifications?: string[];
  carbonFootprint?: number;
  transportSteps?: { step: string; date: string; location: string }[];
}

export default function SupplyChainScreen({ navigation }: any) {
  const [items, setItems] = useState<SupplyChainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const menuRes = await menuAPI.getItems('me');
      const menuItems = Array.isArray(menuRes?.data || menuRes) ? (menuRes?.data || menuRes) : [];

      const chainData: SupplyChainItem[] = [];
      for (const item of menuItems.slice(0, 15)) {
        try {
          const chain = await blockchainAPI.getSupplyChain(item.id);
          chainData.push({
            itemId: item.id,
            itemName: item.name || 'Unknown Item',
            origin: chain?.origin || chain?.farmOrigin || {},
            certifications: chain?.certifications || [],
            carbonFootprint: chain?.carbonFootprint || 0,
            transportSteps: chain?.transportSteps || chain?.steps || [],
          });
        } catch {
          chainData.push({
            itemId: item.id,
            itemName: item.name || 'Unknown Item',
            origin: {},
            certifications: [],
            carbonFootprint: 0,
            transportSteps: [],
          });
        }
      }
      setItems(chainData);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load supply chain data');
    } finally { setLoading(false); setRefreshing(false); }
  };

  const getCarbonColor = (co2: number) => {
    if (co2 <= 1) return colors.success;
    if (co2 <= 3) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supply Chain</Text>
        <Ionicons name="leaf-outline" size={22} color={colors.tealLight} />
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cube-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>No Supply Chain Data</Text>
          <Text style={styles.emptySubtitle}>Supply chain tracking will appear here once menu items have sourcing data</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}
        >
          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{items.length}</Text>
              <Text style={styles.summaryLabel}>Tracked Items</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {items.filter(i => (i.certifications?.length || 0) > 0).length}
              </Text>
              <Text style={styles.summaryLabel}>Certified</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: colors.teal }]}>
                {items.length > 0 ? (items.reduce((s, i) => s + (i.carbonFootprint || 0), 0) / items.length).toFixed(1) : '0'}
              </Text>
              <Text style={styles.summaryLabel}>Avg CO₂ (kg)</Text>
            </View>
          </View>

          {items.map((item) => {
            const isExpanded = expandedId === item.itemId;
            return (
              <TouchableOpacity
                key={item.itemId}
                style={styles.itemCard}
                onPress={() => setExpandedId(isExpanded ? null : item.itemId)}
                activeOpacity={0.7}
              >
                <View style={styles.itemTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    {item.origin?.farm || item.origin?.region ? (
                      <Text style={styles.itemOrigin}>
                        {[item.origin.farm, item.origin.region, item.origin.country].filter(Boolean).join(', ')}
                      </Text>
                    ) : (
                      <Text style={styles.itemOrigin}>Origin not tracked</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    {item.carbonFootprint ? (
                      <View style={[styles.co2Badge, { backgroundColor: getCarbonColor(item.carbonFootprint) + '15' }]}>
                        <Text style={[styles.co2Text, { color: getCarbonColor(item.carbonFootprint) }]}>
                          {item.carbonFootprint.toFixed(1)} kg CO₂
                        </Text>
                      </View>
                    ) : null}
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textLight} style={{ marginTop: 4 }} />
                  </View>
                </View>

                {(item.certifications?.length || 0) > 0 && (
                  <View style={styles.certRow}>
                    {item.certifications!.map((cert, i) => (
                      <View key={i} style={styles.certBadge}>
                        <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                        <Text style={styles.certText}>{cert}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {isExpanded && (item.transportSteps?.length || 0) > 0 && (
                  <View style={styles.stepsContainer}>
                    <Text style={styles.stepsTitle}>Transport History</Text>
                    {item.transportSteps!.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepDot} />
                        {i < item.transportSteps!.length - 1 && <View style={styles.stepLine} />}
                        <View style={styles.stepInfo}>
                          <Text style={styles.stepName}>{step.step}</Text>
                          <Text style={styles.stepMeta}>{step.location} · {step.date}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textLight, marginTop: 6, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  summaryLabel: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  itemCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  itemOrigin: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  co2Badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  co2Text: { fontSize: 11, fontWeight: '700' },
  certRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  certBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  certText: { fontSize: 11, fontWeight: '600', color: colors.success },
  stepsContainer: { marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  stepsTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, position: 'relative' },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal, marginTop: 4, marginRight: 10 },
  stepLine: { position: 'absolute', left: 4, top: 14, width: 2, height: 24, backgroundColor: colors.border },
  stepInfo: { flex: 1 },
  stepName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  stepMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
});
