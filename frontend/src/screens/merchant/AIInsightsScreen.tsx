import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { merchantInsightsAPI } from '../../services/api';

interface Insight {
  id: string;
  type: 'demand_forecast' | 'pricing_optimization' | 'menu_optimization';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  implemented: boolean;
}


export default function AIInsightsScreen({ navigation }: any) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await merchantInsightsAPI.getAllInsights();
      setInsights(Array.isArray(data?.insights || data) ? (data?.insights || data) : []);
    } catch {
      // API not available yet
    } finally { setLoading(false); setRefreshing(false); }
  };

  const handleImplement = async (id: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, implemented: true } : i));
    try { await merchantInsightsAPI.implementInsight(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  };

  const handleDismiss = async (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
    try { await merchantInsightsAPI.dismissInsight(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  };

  const typeConfig = (type: string) => {
    switch (type) {
      case 'demand_forecast': return { icon: 'trending-up', color: colors.teal, label: 'Demand Forecast' };
      case 'pricing_optimization': return { icon: 'pricetag', color: colors.warning, label: 'Pricing' };
      case 'menu_optimization': return { icon: 'restaurant', color: colors.navy, label: 'Menu' };
      default: return { icon: 'bulb', color: colors.teal, label: 'Insight' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Insights</Text>
        <Ionicons name="sparkles" size={22} color={colors.tealLight} />
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}>
          {/* Forecast Summary */}
          <View style={styles.forecastCard}>
            <Text style={styles.forecastTitle}>Business Forecast</Text>
            <View style={styles.forecastGrid}>
              <View style={styles.forecastItem}>
                <Text style={styles.forecastValue}>—</Text>
                <Text style={styles.forecastLabel}>Today's Orders</Text>
              </View>
              <View style={styles.forecastItem}>
                <Text style={[styles.forecastValue, { color: colors.teal }]}>—</Text>
                <Text style={styles.forecastLabel}>Tomorrow (Predicted)</Text>
              </View>
              <View style={styles.forecastItem}>
                <Text style={styles.forecastValue}>—</Text>
                <Text style={styles.forecastLabel}>This Week</Text>
              </View>
              <View style={styles.forecastItem}>
                <Text style={styles.forecastValue}>—</Text>
                <Text style={styles.forecastLabel}>Peak Hour</Text>
              </View>
            </View>
          </View>

          {/* Insights */}
          <Text style={styles.sectionTitle}>
            Actionable Insights ({insights.filter(i => !i.implemented).length} new)
          </Text>
          {insights.map(insight => {
            const config = typeConfig(insight.type);
            return (
              <View key={insight.id} style={[styles.insightCard, insight.implemented && styles.insightImplemented]}>
                <View style={styles.insightHeader}>
                  <View style={[styles.insightIcon, { backgroundColor: config.color + '15' }]}>
                    <Ionicons name={config.icon as any} size={20} color={config.color} />
                  </View>
                  <View style={styles.insightMeta}>
                    <Text style={styles.insightType}>{config.label}</Text>
                    <Text style={styles.insightConfidence}>{Math.round(insight.confidence * 100)}% confidence</Text>
                  </View>
                  {insight.implemented && (
                    <View style={styles.implementedBadge}>
                      <Ionicons name="checkmark" size={12} color={colors.success} />
                      <Text style={styles.implementedText}>Done</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDesc}>{insight.description}</Text>
                <View style={styles.impactRow}>
                  <Ionicons name="trending-up" size={14} color={colors.success} />
                  <Text style={styles.impactText}>{insight.impact}</Text>
                </View>
                {!insight.implemented && (
                  <View style={styles.insightActions}>
                    <TouchableOpacity style={styles.dismissBtn} onPress={() => handleDismiss(insight.id)}>
                      <Text style={styles.dismissBtnText}>Dismiss</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.implementBtn} onPress={() => handleImplement(insight.id)}>
                      <Text style={styles.implementBtnText}>Implement</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  forecastCard: { margin: 16, backgroundColor: colors.white, borderRadius: 20, padding: 20 },
  forecastTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  forecastGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  forecastItem: { width: '46%', backgroundColor: colors.lightGray, borderRadius: 14, padding: 14, flexGrow: 1 },
  forecastValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  forecastLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginHorizontal: 16, marginBottom: 12 },
  insightCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  insightImplemented: { opacity: 0.7 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  insightIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  insightMeta: { flex: 1 },
  insightType: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  insightConfidence: { fontSize: 11, color: colors.textLight },
  implementedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  implementedText: { fontSize: 11, fontWeight: '700', color: colors.success },
  insightTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  insightDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 8 },
  impactRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  impactText: { fontSize: 13, fontWeight: '600', color: colors.success },
  insightActions: { flexDirection: 'row', gap: 10 },
  dismissBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: colors.lightGray },
  dismissBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  implementBtn: { flex: 2, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: colors.teal },
  implementBtnText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
});
