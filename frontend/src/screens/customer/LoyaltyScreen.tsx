import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { loyaltyAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const TIER_META: Record<string, { color: string; perks: string[] }> = {
  Bronze: { color: '#CD7F32', perks: ['1x points on orders', 'Birthday reward'] },
  Silver: { color: '#C0C0C0', perks: ['1.5x points', 'Free delivery monthly', 'Birthday reward'] },
  Gold: { color: '#FFD700', perks: ['2x points', 'Free delivery', 'Priority support', 'Exclusive deals'] },
  Platinum: { color: '#E5E4E2', perks: ['3x points', 'Free delivery', 'VIP support', 'Early access', 'Special gifts'] },
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function LoyaltyScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [profileRes, rewardsRes, historyRes] = await Promise.all([
        loyaltyAPI.getProfile(),
        loyaltyAPI.getRewards(),
        loyaltyAPI.getHistory(),
      ]);
      setProfile(profileRes);
      setRewards(Array.isArray(rewardsRes) ? rewardsRes : []);
      const histData = Array.isArray(historyRes?.data) ? historyRes.data : Array.isArray(historyRes) ? historyRes : [];
      setHistory(histData);
    } catch (e: any) {
      if (!isRefresh) Alert.alert('Error', e?.message || 'Could not load loyalty data');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleRedeem = (reward: any) => {
    if (!profile || profile.points < reward.pointsCost) {
      Alert.alert('Not Enough Points', `You need ${reward.pointsCost} points but have ${profile?.points || 0}.`);
      return;
    }
    Alert.alert('Redeem Reward', `Spend ${reward.pointsCost} points for "${reward.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem', onPress: async () => {
          setRedeeming(reward.id);
          try {
            const res = await loyaltyAPI.redeem(reward.id);
            Alert.alert('Redeemed!', `You redeemed "${res.reward || reward.name}". Remaining: ${res.remainingPoints} points.`);
            loadData(true);
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not redeem reward');
          }
          setRedeeming(null);
        },
      },
    ]);
  };

  const currentPoints = profile?.points || 0;
  const currentTier = profile?.tier || 'Bronze';
  const tierColor = TIER_META[currentTier]?.color || '#CD7F32';
  const tiers = profile?.tiers || [
    { name: 'Bronze', minPoints: 0 },
    { name: 'Silver', minPoints: 1000 },
    { name: 'Gold', minPoints: 3000 },
    { name: 'Platinum', minPoints: 7000 },
  ];
  const nextTier = tiers.find((t: any) => t.minPoints > (profile?.lifetimePoints || 0)) || tiers[tiers.length - 1];
  const progress = nextTier.minPoints > 0 ? ((profile?.lifetimePoints || 0) / nextTier.minPoints) * 100 : 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading rewards...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.teal} />}
        >
          {/* Points Card */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsTop}>
              <View>
                <Text style={styles.pointsLabel}>Your Points</Text>
                <Text style={styles.pointsValue}>{currentPoints.toLocaleString()}</Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: tierColor + '15' }]}>
                <Ionicons name="trophy" size={20} color={tierColor} />
                <Text style={[styles.tierText, { color: tierColor }]}>{currentTier}</Text>
              </View>
            </View>
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {profile?.pointsToNextTier > 0
                  ? `${profile.pointsToNextTier.toLocaleString()} points to ${profile.nextTier}`
                  : 'Max tier reached!'}
              </Text>
            </View>
          </View>

          {/* Tier Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership Tiers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tierRow}>
              {tiers.map((tier: any, index: number) => {
                const meta = TIER_META[tier.name] || { color: '#999', perks: [] };
                const isActive = tier.name === currentTier;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tierCard, isActive && styles.tierCardActive]}
                    onPress={() => setSelectedTier(tier.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.tierIcon, { backgroundColor: meta.color + '20' }]}>
                      <Ionicons name="trophy" size={22} color={meta.color} />
                    </View>
                    <Text style={[styles.tierName, isActive && { color: colors.teal }]}>{tier.name}</Text>
                    <Text style={styles.tierPoints}>{tier.minPoints.toLocaleString()}+ pts</Text>
                    {meta.perks.slice(0, 2).map((perk: string, i: number) => (
                      <View key={i} style={styles.perkRow}>
                        <Ionicons name="checkmark" size={12} color={colors.teal} />
                        <Text style={styles.perkText}>{perk}</Text>
                      </View>
                    ))}
                    {meta.perks.length > 2 && (
                      <Text style={styles.morePerkText}>+{meta.perks.length - 2} more</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Redeem Points */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Redeem Points</Text>
            {rewards.length === 0 ? (
              <View style={{ backgroundColor: colors.white, borderRadius: 14, padding: 20, alignItems: 'center' }}>
                <Ionicons name="gift-outline" size={32} color={colors.textLight} />
                <Text style={{ color: colors.textLight, marginTop: 8, fontSize: 13 }}>No rewards available yet</Text>
              </View>
            ) : (
              <View style={styles.redeemGrid}>
                {rewards.map((reward: any) => {
                  const canRedeem = currentPoints >= reward.pointsCost;
                  const isRedeeming = redeeming === reward.id;
                  return (
                    <TouchableOpacity
                      key={reward.id}
                      style={[styles.redeemCard, !canRedeem && styles.redeemCardDisabled]}
                      onPress={() => handleRedeem(reward)}
                      disabled={!canRedeem || isRedeeming}
                    >
                      <View style={[styles.redeemIcon, { backgroundColor: canRedeem ? colors.teal + '15' : colors.lightGray }]}>
                        {isRedeeming ? (
                          <ActivityIndicator size="small" color={colors.teal} />
                        ) : (
                          <Ionicons name={(reward.icon || 'gift-outline') as any} size={22} color={canRedeem ? colors.teal : colors.textLight} />
                        )}
                      </View>
                      <Text style={[styles.redeemName, !canRedeem && { color: colors.textLight }]}>{reward.name}</Text>
                      <View style={styles.redeemPoints}>
                        <Ionicons name="star" size={12} color={canRedeem ? colors.warning : colors.textLight} />
                        <Text style={[styles.redeemPointsText, !canRedeem && { color: colors.textLight }]}>{reward.pointsCost}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Points History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Points History</Text>
            {history.length === 0 ? (
              <View style={{ backgroundColor: colors.white, borderRadius: 14, padding: 20, alignItems: 'center' }}>
                <Ionicons name="time-outline" size={32} color={colors.textLight} />
                <Text style={{ color: colors.textLight, marginTop: 8, fontSize: 13 }}>No activity yet. Place an order to earn points!</Text>
              </View>
            ) : (
              history.map((item: any) => (
                <View key={item.id} style={styles.historyRow}>
                  <View style={[styles.historyIcon, {
                    backgroundColor: item.type === 'earned' ? colors.teal + '10' : item.type === 'bonus' ? colors.warning + '10' : colors.navy + '10'
                  }]}>
                    <Ionicons
                      name={item.type === 'earned' ? 'arrow-up' : item.type === 'bonus' ? 'flash' : 'arrow-down'}
                      size={16}
                      color={item.type === 'earned' ? colors.teal : item.type === 'bonus' ? colors.warning : colors.navy}
                    />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyAction}>{item.description}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <Text style={[styles.historyPoints, { color: item.points > 0 ? colors.teal : colors.navy }]}>
                    {item.points > 0 ? '+' : ''}{item.points} pts
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Tier Detail Modal */}
      <Modal visible={!!selectedTier} transparent animationType="fade" onRequestClose={() => setSelectedTier(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedTier(null)}>
          <View style={styles.modalContent}>
            {selectedTier && (() => {
              const meta = TIER_META[selectedTier] || { color: '#999', perks: [] };
              const tierDef = tiers.find((t: any) => t.name === selectedTier);
              const isCurrentTier = selectedTier === currentTier;
              return (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                    <View style={[styles.tierIcon, { backgroundColor: meta.color + '20' }]}>
                      <Ionicons name="trophy" size={26} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{selectedTier}</Text>
                      <Text style={{ fontSize: 13, color: colors.textLight }}>
                        {tierDef ? `${tierDef.minPoints.toLocaleString()}+ points required` : ''}
                      </Text>
                    </View>
                    {isCurrentTier && (
                      <View style={{ backgroundColor: colors.teal + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.teal }}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 }}>All Benefits</Text>
                  {meta.perks.map((perk: string, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: i < meta.perks.length - 1 ? 1 : 0, borderBottomColor: colors.lightGray }}>
                      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: colors.teal + '12', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="checkmark" size={16} color={colors.teal} />
                      </View>
                      <Text style={{ fontSize: 14, color: colors.textPrimary, flex: 1 }}>{perk}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={{ backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 14, marginTop: 20, alignItems: 'center' }}
                    onPress={() => setSelectedTier(null)}
                  >
                    <Text style={{ color: colors.textWhite, fontWeight: '700', fontSize: 15 }}>Got it</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 20,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  pointsCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 12, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  pointsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pointsLabel: { fontSize: 13, color: colors.textLight },
  pointsValue: { fontSize: 40, fontWeight: '800', color: colors.textPrimary },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#CD7F32' + '15',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, gap: 6,
  },
  tierText: { fontSize: 15, fontWeight: '700', color: '#CD7F32' },
  progressSection: {},
  progressBar: { height: 8, backgroundColor: colors.lightGray, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 4 },
  progressText: { fontSize: 12, color: colors.textLight, marginTop: 6, textAlign: 'center' },
  section: { marginTop: 20, paddingHorizontal: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  tierRow: { gap: 10, paddingRight: 10 },
  tierCard: {
    width: 140, backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: colors.border,
  },
  tierCardActive: { borderColor: colors.teal },
  tierIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  tierName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  tierPoints: { fontSize: 12, color: colors.textLight, marginBottom: 8 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  perkText: { fontSize: 11, color: colors.textSecondary },
  morePerkText: { fontSize: 11, color: colors.teal, fontWeight: '600', marginTop: 4 },
  redeemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  redeemCard: {
    width: (width - 40) / 3 - 7, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center',
  },
  redeemCardDisabled: { opacity: 0.5 },
  redeemIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  redeemName: { fontSize: 12, fontWeight: '600', color: colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  redeemPoints: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  redeemPointsText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
  },
  historyIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  historyInfo: { flex: 1 },
  historyAction: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  historyDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  historyPoints: { fontSize: 15, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 380,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 15,
  },
});
