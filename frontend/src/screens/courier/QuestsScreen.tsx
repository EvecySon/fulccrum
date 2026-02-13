import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierGamificationAPI } from '../../services/api';

interface Quest {
  id: string;
  type: 'daily' | 'weekly' | 'special';
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  target: number;
  reward: number;
  expiresIn: string;
  completed: boolean;
  claimed: boolean;
}

const mockQuests: Quest[] = [
  { id: '1', type: 'daily', title: 'Lunch Rush', description: 'Complete 5 deliveries between 11 AM – 2 PM', icon: 'sunny', color: '#f97316', progress: 3, target: 5, reward: 2000, expiresIn: '3h left', completed: false, claimed: false },
  { id: '2', type: 'daily', title: 'Speed Demon', description: 'Complete 3 deliveries under 20 minutes each', icon: 'flash', color: '#8b5cf6', progress: 2, target: 3, reward: 1500, expiresIn: '6h left', completed: false, claimed: false },
  { id: '3', type: 'daily', title: 'Perfect Ratings', description: 'Get 5 five-star ratings today', icon: 'star', color: '#eab308', progress: 5, target: 5, reward: 1000, expiresIn: '8h left', completed: true, claimed: false },
  { id: '4', type: 'daily', title: 'Night Owl', description: 'Complete 4 deliveries after 8 PM', icon: 'moon', color: '#6366f1', progress: 0, target: 4, reward: 2500, expiresIn: '12h left', completed: false, claimed: false },
  { id: '5', type: 'weekly', title: 'Marathon Runner', description: 'Complete 50 deliveries this week', icon: 'trophy', color: '#dc2626', progress: 32, target: 50, reward: 10000, expiresIn: '4 days', completed: false, claimed: false },
  { id: '6', type: 'weekly', title: 'Distance King', description: 'Cover 200 km in deliveries this week', icon: 'navigate', color: '#0ea5e9', progress: 142, target: 200, reward: 8000, expiresIn: '4 days', completed: false, claimed: false },
  { id: '7', type: 'weekly', title: 'Consistency Streak', description: 'Go online every day this week', icon: 'calendar', color: colors.teal, progress: 3, target: 7, reward: 5000, expiresIn: '4 days', completed: false, claimed: false },
  { id: '8', type: 'special', title: 'Valentine\'s Rush', description: 'Complete 20 deliveries on Feb 14', icon: 'heart', color: '#ec4899', progress: 0, target: 20, reward: 15000, expiresIn: '2 days', completed: false, claimed: false },
  { id: '9', type: 'special', title: 'Rainy Day Hero', description: 'Complete 10 deliveries during rain', icon: 'rainy', color: '#3b82f6', progress: 7, target: 10, reward: 5000, expiresIn: '5 days', completed: false, claimed: false },
];

const mockSummary = {
  totalEarned: 28500,
  questsCompleted: 12,
  activeQuests: 9,
  streakDays: 5,
};

export default function QuestsScreen({ navigation }: any) {
  const [quests, setQuests] = useState<Quest[]>(mockQuests);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'special'>('all');
  const [summary, setSummary] = useState(mockSummary);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadQuests(); }, []);

  const loadQuests = async () => {
    try {
      const res = await courierGamificationAPI.getAchievements();
      const data = res?.data ?? res;
      if (Array.isArray(data) && data.length && data[0]?.type) {
        setQuests(data);
      }
    } catch {
      // Keep existing mock data
    }
    setRefreshing(false);
  };

  const handleClaim = async (questId: string) => {
    try {
      await courierGamificationAPI.claimReward(questId);
    } catch {}
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
    Alert.alert('Reward Claimed!', 'The bonus has been added to your wallet.');
  };

  const filtered = filter === 'all' ? quests : quests.filter(q => q.type === filter);
  const filters: { key: typeof filter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'daily', label: 'Daily', icon: 'today' },
    { key: 'weekly', label: 'Weekly', icon: 'calendar' },
    { key: 'special', label: 'Special', icon: 'sparkles' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quests & Bonuses</Text>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={14} color="#f97316" />
          <Text style={styles.streakText}>{summary.streakDays} day streak</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadQuests(); }} tintColor={colors.teal} />}
      >
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₦{(summary.totalEarned / 1000).toFixed(0)}k</Text>
            <Text style={styles.summaryLabel}>Earned from Quests</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.questsCompleted}</Text>
            <Text style={styles.summaryLabel}>Quests Completed</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.activeQuests}</Text>
            <Text style={styles.summaryLabel}>Active Quests</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Ionicons name={f.icon as any} size={16} color={filter === f.key ? colors.textWhite : colors.textSecondary} />
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quest Cards */}
        <View style={styles.questsList}>
          {filtered.map((quest) => {
            if (!quest || !quest.type) return null;
            const pct = Math.min((quest.progress / quest.target) * 100, 100);
            return (
              <View key={quest.id} style={[styles.questCard, quest.claimed && { opacity: 0.5 }]}>
                {/* Quest Header */}
                <View style={styles.questHeader}>
                  <View style={[styles.questIcon, { backgroundColor: quest.color + '15' }]}>
                    <Ionicons name={quest.icon as any} size={22} color={quest.color} />
                  </View>
                  <View style={styles.questInfo}>
                    <View style={styles.questTitleRow}>
                      <Text style={styles.questTitle}>{quest.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: quest.type === 'special' ? '#ec4899' + '15' : quest.type === 'weekly' ? colors.navy + '10' : colors.teal + '10' }]}>
                        <Text style={[styles.typeBadgeText, { color: quest.type === 'special' ? '#ec4899' : quest.type === 'weekly' ? colors.navy : colors.teal }]}>
                          {quest.type.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.questDesc}>{quest.description}</Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: quest.completed ? colors.success : quest.color }]} />
                  </View>
                  <View style={styles.progressMeta}>
                    <Text style={styles.progressText}>
                      {quest.progress}/{quest.target} {quest.completed ? '✓ Complete' : ''}
                    </Text>
                    <Text style={styles.expiresText}>{quest.expiresIn}</Text>
                  </View>
                </View>

                {/* Reward */}
                <View style={styles.rewardRow}>
                  <View style={styles.rewardInfo}>
                    <Ionicons name="gift" size={16} color={colors.teal} />
                    <Text style={styles.rewardText}>₦{quest.reward.toLocaleString()} bonus</Text>
                  </View>
                  {quest.completed && !quest.claimed ? (
                    <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(quest.id)}>
                      <Ionicons name="sparkles" size={16} color={colors.textWhite} />
                      <Text style={styles.claimBtnText}>Claim Reward</Text>
                    </TouchableOpacity>
                  ) : quest.claimed ? (
                    <View style={styles.claimedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.claimedText}>Claimed</Text>
                    </View>
                  ) : (
                    <Text style={[styles.progressPct, { color: quest.color }]}>{Math.round(pct)}%</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No quests available</Text>
            <Text style={styles.emptySubtext}>Check back soon for new challenges</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f97316' + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  streakText: { fontSize: 12, fontWeight: '700', color: '#f97316' },
  summaryRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 10, marginTop: 10 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  summaryLabel: { fontSize: 10, color: colors.textLight, marginTop: 2, textAlign: 'center' },
  filterRow: { paddingHorizontal: 10, paddingVertical: 12, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.white,
  },
  filterChipActive: { backgroundColor: colors.teal },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  questsList: { paddingHorizontal: 10 },
  questCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  questHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  questIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  questInfo: { flex: 1 },
  questTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  questTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  questDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  progressSection: { marginBottom: 10 },
  progressBarBg: { height: 8, backgroundColor: colors.lightGray, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  progressText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  expiresText: { fontSize: 11, color: colors.textLight },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewardInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rewardText: { fontSize: 14, fontWeight: '700', color: colors.teal },
  claimBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.teal, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  claimBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  claimedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  claimedText: { fontSize: 13, fontWeight: '600', color: colors.success },
  progressPct: { fontSize: 16, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: colors.textLight, marginTop: 4 },
});
