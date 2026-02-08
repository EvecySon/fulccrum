import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierGamificationAPI } from '../../services/api';

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  bonus: number;
  unlocked: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isMe: boolean;
}

const mockTier = {
  level: 'Gold',
  progress: 72,
  nextTier: 'Platinum',
  benefits: ['Priority orders', '10% bonus rate', 'Free insurance'],
};

const mockAchievements: Achievement[] = [
  { id: '1', type: 'speed', title: 'Speed Demon', description: 'Complete 50 deliveries under 20 min', icon: 'flash', progress: 38, total: 50, bonus: 5000, unlocked: false },
  { id: '2', type: 'reliability', title: 'Iron Streak', description: '30-day perfect attendance', icon: 'calendar', progress: 22, total: 30, bonus: 10000, unlocked: false },
  { id: '3', type: 'customer_service', title: '5-Star Hero', description: 'Get 100 five-star ratings', icon: 'star', progress: 100, total: 100, bonus: 8000, unlocked: true },
  { id: '4', type: 'eco_driver', title: 'Green Rider', description: '200 deliveries by bike or e-scooter', icon: 'leaf', progress: 145, total: 200, bonus: 6000, unlocked: false },
  { id: '5', type: 'speed', title: 'Century Club', description: 'Complete 100 deliveries in one week', icon: 'trophy', progress: 67, total: 100, bonus: 15000, unlocked: false },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Tunde A.', score: 2450, isMe: false },
  { rank: 2, name: 'Blessing O.', score: 2380, isMe: false },
  { rank: 3, name: 'Chidi E.', score: 2210, isMe: false },
  { rank: 4, name: 'You', score: 2150, isMe: true },
  { rank: 5, name: 'Kemi B.', score: 2080, isMe: false },
];

export default function GamificationScreen({ navigation }: any) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ach, lb] = await Promise.all([
        courierGamificationAPI.getAchievements(),
        courierGamificationAPI.getLeaderboard(period),
      ]);
      setAchievements(Array.isArray(ach) ? ach : mockAchievements);
      setLeaderboard(Array.isArray(lb) ? lb : mockLeaderboard);
    } catch {
      setAchievements(mockAchievements);
      setLeaderboard(mockLeaderboard);
    } finally { setLoading(false); setRefreshing(false); }
  };

  const handleClaim = async (id: string) => {
    try { await courierGamificationAPI.claimReward(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, unlocked: true } : a));
  };

  const tierColors: Record<string, string> = { Bronze: '#CD7F32', Silver: '#C0C0C0', Gold: '#FFD700', Platinum: '#E5E4E2', Diamond: '#B9F2FF' };

  if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={colors.teal} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <Ionicons name="trophy" size={22} color={colors.warning} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}>
        {/* Tier Card */}
        <View style={[styles.tierCard, { borderColor: tierColors[mockTier.level] || colors.teal }]}>
          <View style={styles.tierHeader}>
            <Ionicons name="shield-checkmark" size={28} color={tierColors[mockTier.level]} />
            <View style={styles.tierInfo}>
              <Text style={styles.tierLevel}>{mockTier.level} Tier</Text>
              <Text style={styles.tierNext}>{mockTier.progress}% to {mockTier.nextTier}</Text>
            </View>
          </View>
          <View style={styles.tierProgress}>
            <View style={[styles.tierProgressFill, { width: `${mockTier.progress}%`, backgroundColor: tierColors[mockTier.level] }]} />
          </View>
          <View style={styles.tierBenefits}>
            {mockTier.benefits.map((b, i) => (
              <View key={i} style={styles.benefitChip}>
                <Ionicons name="checkmark" size={12} color={colors.success} />
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <View style={styles.periodTabs}>
              {(['weekly', 'monthly', 'all'] as const).map(p => (
                <TouchableOpacity key={p} style={[styles.periodTab, period === p && styles.periodTabActive]} onPress={() => setPeriod(p)}>
                  <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {leaderboard.map(entry => (
            <View key={entry.rank} style={[styles.lbRow, entry.isMe && styles.lbRowMe]}>
              <Text style={[styles.lbRank, entry.rank <= 3 && { color: colors.warning }]}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
              </Text>
              <Text style={[styles.lbName, entry.isMe && styles.lbNameMe]}>{entry.name}</Text>
              <Text style={styles.lbScore}>{entry.score.toLocaleString()} pts</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges & Achievements</Text>
          {achievements.map(ach => (
            <View key={ach.id} style={[styles.achCard, ach.unlocked && styles.achUnlocked]}>
              <View style={[styles.achIcon, ach.unlocked && styles.achIconUnlocked]}>
                <Ionicons name={ach.icon as any} size={24} color={ach.unlocked ? colors.textWhite : colors.textLight} />
              </View>
              <View style={styles.achInfo}>
                <Text style={styles.achTitle}>{ach.title}</Text>
                <Text style={styles.achDesc}>{ach.description}</Text>
                {!ach.unlocked && (
                  <View style={styles.achProgressBar}>
                    <View style={[styles.achProgressFill, { width: `${(ach.progress / ach.total) * 100}%` }]} />
                  </View>
                )}
                <Text style={styles.achProgress}>
                  {ach.unlocked ? 'Completed!' : `${ach.progress}/${ach.total}`} · ₦{ach.bonus.toLocaleString()} bonus
                </Text>
              </View>
              {ach.unlocked && ach.progress >= ach.total && (
                <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(ach.id)}>
                  <Text style={styles.claimText}>Claim</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  tierCard: { margin: 16, backgroundColor: colors.white, borderRadius: 20, padding: 20, borderWidth: 2 },
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tierInfo: { flex: 1 },
  tierLevel: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  tierNext: { fontSize: 13, color: colors.textLight },
  tierProgress: { height: 8, backgroundColor: colors.lightGray, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  tierProgressFill: { height: '100%', borderRadius: 4 },
  tierBenefits: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  benefitChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success + '10', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  benefitText: { fontSize: 11, fontWeight: '600', color: colors.success },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  periodTabs: { flexDirection: 'row', gap: 4 },
  periodTab: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.white },
  periodTabActive: { backgroundColor: colors.navy },
  periodText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  periodTextActive: { color: colors.textWhite },
  lbRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 6, gap: 12 },
  lbRowMe: { backgroundColor: colors.teal + '10', borderWidth: 1, borderColor: colors.teal + '30' },
  lbRank: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, width: 30 },
  lbName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  lbNameMe: { fontWeight: '800', color: colors.teal },
  lbScore: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  achCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  achUnlocked: { backgroundColor: colors.success + '08' },
  achIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  achIconUnlocked: { backgroundColor: colors.success },
  achInfo: { flex: 1 },
  achTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  achDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  achProgressBar: { height: 4, backgroundColor: colors.lightGray, borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  achProgressFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 2 },
  achProgress: { fontSize: 11, color: colors.textLight, marginTop: 4 },
  claimBtn: { backgroundColor: colors.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  claimText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
});
