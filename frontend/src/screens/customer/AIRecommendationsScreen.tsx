import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { aiAPI } from '../../services/api';

interface Recommendation {
  id: string;
  type: 'meal' | 'restaurant' | 'reorder';
  title: string;
  subtitle: string;
  image: string;
  confidence: number;
  price?: number;
  reason: string;
}


export default function AIRecommendationsScreen({ navigation }: any) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await aiAPI.getRecommendations();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (id: string) => {
    try { await aiAPI.acceptRecommendation(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const handleDismiss = async (id: string) => {
    try { await aiAPI.dismissRecommendation(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'meal': return 'restaurant';
      case 'restaurant': return 'storefront';
      case 'reorder': return 'refresh';
      default: return 'sparkles';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>For You</Text>
        <Ionicons name="sparkles" size={22} color={colors.teal} />
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}
        >
          {/* Predictive Order */}
          <View style={styles.predictiveCard}>
            <View style={styles.predictiveHeader}>
              <View style={styles.aiChip}>
                <Ionicons name="bulb" size={14} color={colors.warning} />
                <Text style={styles.aiChipText}>AI Prediction</Text>
              </View>
              <Text style={styles.confidenceText}>AI-powered</Text>
            </View>
            <Text style={styles.predictiveTitle}>Your next order</Text>
            <Text style={styles.predictiveSubtitle}>
              Order more to unlock personalized predictions
            </Text>
            <View style={styles.predictiveItems} />
            <TouchableOpacity style={styles.orderNowBtn}>
              <Text style={styles.orderNowText}>Order Now</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
            </TouchableOpacity>
          </View>

          {/* Recommendations */}
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          {recommendations.length === 0 && !loading && (
            <View style={{ alignItems: 'center', padding: 30 }}>
              <Ionicons name="sparkles-outline" size={48} color={colors.textLight} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 14 }}>No Recommendations Yet</Text>
              <Text style={{ fontSize: 13, color: colors.textLight, textAlign: 'center', marginTop: 6 }}>
                Place a few orders and we'll learn your preferences to suggest meals you'll love.
              </Text>
            </View>
          )}
          {recommendations.map(rec => (
            <View key={rec.id} style={styles.recCard}>
              <Image source={{ uri: rec.image }} style={styles.recImage} />
              <View style={styles.recOverlay}>
                <View style={styles.recTypeBadge}>
                  <Ionicons name={typeIcon(rec.type) as any} size={12} color={colors.textWhite} />
                  <Text style={styles.recTypeText}>{rec.type}</Text>
                </View>
                <Text style={styles.recConfidence}>{Math.round(rec.confidence * 100)}%</Text>
              </View>
              <View style={styles.recBody}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recSubtitle}>{rec.subtitle}</Text>
                <Text style={styles.recReason}>{rec.reason}</Text>
                <View style={styles.recActions}>
                  {rec.price && <Text style={styles.recPrice}>₦{rec.price.toLocaleString()}</Text>}
                  <View style={styles.recBtns}>
                    <TouchableOpacity style={styles.dismissBtn} onPress={() => handleDismiss(rec.id)}>
                      <Ionicons name="close" size={18} color={colors.textLight} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(rec.id)}>
                      <Ionicons name="add" size={18} color={colors.textWhite} />
                      <Text style={styles.acceptBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  predictiveCard: { margin: 16, backgroundColor: colors.navy, borderRadius: 20, padding: 20 },
  predictiveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aiChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  aiChipText: { fontSize: 12, fontWeight: '600', color: colors.textWhite },
  confidenceText: { fontSize: 12, color: colors.tealLight, fontWeight: '600' },
  predictiveTitle: { fontSize: 20, fontWeight: '800', color: colors.textWhite, marginBottom: 4 },
  predictiveSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20, marginBottom: 12 },
  predictiveItems: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  predictiveItemChip: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  predictiveItemText: { fontSize: 13, color: colors.textWhite, fontWeight: '600' },
  orderNowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14 },
  orderNowText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  recCard: { marginHorizontal: 16, marginBottom: 14, backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  recImage: { width: '100%', height: 140 },
  recOverlay: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between' },
  recTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  recTypeText: { fontSize: 11, fontWeight: '700', color: colors.textWhite, textTransform: 'capitalize' },
  recConfidence: { backgroundColor: colors.teal, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: '700', color: colors.textWhite, overflow: 'hidden' },
  recBody: { padding: 14 },
  recTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  recSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  recReason: { fontSize: 12, color: colors.teal, fontWeight: '600', marginTop: 6 },
  recActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  recPrice: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  recBtns: { flexDirection: 'row', gap: 8 },
  dismissBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.teal, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  acceptBtnText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
});
