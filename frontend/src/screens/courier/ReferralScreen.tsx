import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { usersAPI } from '../../services/api';

interface Referral {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'active' | 'completed';
  deliveries: number;
  requiredDeliveries: number;
  earned: number;
}

const mockReferralCode = 'MIKE2026';
const mockReferralLink = 'https://fulccrum.com/join?ref=MIKE2026';

const mockReferrals: Referral[] = [
  { id: '1', name: 'Tunde A.', date: 'Feb 10, 2026', status: 'completed', deliveries: 25, requiredDeliveries: 25, earned: 5000 },
  { id: '2', name: 'Blessing O.', date: 'Feb 8, 2026', status: 'active', deliveries: 18, requiredDeliveries: 25, earned: 0 },
  { id: '3', name: 'Chidi E.', date: 'Feb 5, 2026', status: 'active', deliveries: 7, requiredDeliveries: 25, earned: 0 },
  { id: '4', name: 'Kemi B.', date: 'Jan 28, 2026', status: 'pending', deliveries: 0, requiredDeliveries: 25, earned: 0 },
];

const mockStats = {
  totalReferred: 12,
  totalEarned: 45000,
  pendingEarnings: 10000,
  activeReferrals: 3,
};

const REWARD_TIERS = [
  { referrals: 5, bonus: 10000, label: 'Bronze Referrer' },
  { referrals: 15, bonus: 30000, label: 'Silver Referrer' },
  { referrals: 30, bonus: 75000, label: 'Gold Referrer' },
  { referrals: 50, bonus: 150000, label: 'Platinum Referrer' },
];

export default function ReferralScreen({ navigation }: any) {
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await usersAPI.getProfile();
      if (res?.referrals) setReferrals(res.referrals);
      else setReferrals(mockReferrals);
    } catch {
      setReferrals(mockReferrals);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Fulccrum as a delivery courier! Use my referral code ${mockReferralCode} and we both earn ₦5,000 after your first 25 deliveries. Sign up here: ${mockReferralLink}`,
      });
    } catch {}
  };

  const handleCopyCode = () => {
    Clipboard.setString(mockReferralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard.');
  };

  const handleCopyLink = () => {
    Clipboard.setString(mockReferralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'active': return colors.teal;
      case 'pending': return colors.warning;
      default: return colors.textLight;
    }
  };

  const currentTier = REWARD_TIERS.findIndex(t => stats.totalReferred < t.referrals);
  const nextTier = REWARD_TIERS[currentTier] || REWARD_TIERS[REWARD_TIERS.length - 1];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="gift" size={36} color={colors.teal} />
          </View>
          <Text style={styles.heroTitle}>Earn ₦5,000 per referral</Text>
          <Text style={styles.heroDesc}>
            Invite friends to deliver with Fulccrum. You both earn ₦5,000 when they complete 25 deliveries.
          </Text>

          {/* Referral Code */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{mockReferralCode}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={18} color={colors.teal} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Share Buttons */}
          <View style={styles.shareRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social" size={20} color={colors.textWhite} />
              <Text style={styles.shareBtnText}>Share Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkBtn} onPress={handleCopyLink}>
              <Ionicons name="link" size={20} color={colors.teal} />
              <Text style={styles.linkBtnText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalReferred}</Text>
            <Text style={styles.statLabel}>Referred</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>₦{(stats.totalEarned / 1000).toFixed(0)}k</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>₦{(stats.pendingEarnings / 1000).toFixed(0)}k</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.teal }]}>{stats.activeReferrals}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Reward Tiers */}
        <View style={styles.tiersCard}>
          <Text style={styles.sectionTitle}>Referral Milestones</Text>
          {REWARD_TIERS.map((tier, idx) => {
            const reached = stats.totalReferred >= tier.referrals;
            return (
              <View key={idx} style={[styles.tierRow, reached && styles.tierRowReached]}>
                <View style={[styles.tierIcon, reached && { backgroundColor: colors.teal + '15' }]}>
                  <Ionicons
                    name={reached ? 'checkmark-circle' : 'trophy-outline'}
                    size={20}
                    color={reached ? colors.teal : colors.textLight}
                  />
                </View>
                <View style={styles.tierInfo}>
                  <Text style={[styles.tierLabel, reached && { color: colors.teal }]}>{tier.label}</Text>
                  <Text style={styles.tierDesc}>{tier.referrals} referrals</Text>
                </View>
                <Text style={[styles.tierBonus, reached && { color: colors.teal }]}>₦{tier.bonus.toLocaleString()}</Text>
              </View>
            );
          })}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              {stats.totalReferred}/{nextTier.referrals} to {nextTier.label}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min((stats.totalReferred / nextTier.referrals) * 100, 100)}%` }]} />
            </View>
          </View>
        </View>

        {/* Referral History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Your Referrals</Text>
          {referrals.map((ref) => {
            const pct = Math.min((ref.deliveries / ref.requiredDeliveries) * 100, 100);
            return (
              <View key={ref.id} style={styles.referralCard}>
                <View style={styles.referralHeader}>
                  <View style={styles.referralAvatar}>
                    <Text style={styles.referralInitial}>{ref.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralName}>{ref.name}</Text>
                    <Text style={styles.referralDate}>Joined {ref.date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ref.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ref.status) }]}>
                      {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.referralProgress}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: getStatusColor(ref.status) }]} />
                  </View>
                  <Text style={styles.referralProgressText}>
                    {ref.deliveries}/{ref.requiredDeliveries} deliveries
                    {ref.status === 'completed' && ` · ₦${ref.earned.toLocaleString()} earned`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* How It Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            { step: '1', title: 'Share your code', desc: 'Send your referral code or link to friends' },
            { step: '2', title: 'They sign up', desc: 'Your friend registers as a Fulccrum courier' },
            { step: '3', title: 'They deliver', desc: 'Your friend completes 25 deliveries' },
            { step: '4', title: 'You both earn', desc: 'You and your friend each get ₦5,000' },
          ].map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>{item.step}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  heroCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 20,
    padding: 24, alignItems: 'center',
  },
  heroIcon: {
    width: 70, height: 70, borderRadius: 22, backgroundColor: colors.teal + '12',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  heroDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  codeCard: {
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 14, marginTop: 16,
    width: '100%', alignItems: 'center',
  },
  codeLabel: { fontSize: 11, fontWeight: '600', color: colors.textLight, letterSpacing: 1, textTransform: 'uppercase' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  codeText: { fontSize: 28, fontWeight: '900', color: colors.teal, letterSpacing: 3 },
  copyBtn: { padding: 6, backgroundColor: colors.teal + '12', borderRadius: 8 },
  shareRow: { flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' },
  shareBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14,
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  linkBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: colors.teal + '10', borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.teal + '30',
  },
  linkBtnText: { fontSize: 14, fontWeight: '600', color: colors.teal },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 10, marginTop: 10 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  tiersCard: { backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  tierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  tierRowReached: {},
  tierIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  tierInfo: { flex: 1 },
  tierLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  tierDesc: { fontSize: 12, color: colors.textLight },
  tierBonus: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  progressSection: { marginTop: 12 },
  progressLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  progressBar: { height: 8, backgroundColor: colors.lightGray, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 4 },
  historySection: { paddingHorizontal: 10, marginTop: 16 },
  referralCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  referralHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  referralAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.navy + '15', justifyContent: 'center', alignItems: 'center' },
  referralInitial: { fontSize: 16, fontWeight: '700', color: colors.navy },
  referralInfo: { flex: 1 },
  referralName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  referralDate: { fontSize: 12, color: colors.textLight },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  referralProgress: { marginTop: 10 },
  referralProgressText: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  howItWorks: { marginHorizontal: 10, marginTop: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center' },
  stepNumber: { fontSize: 14, fontWeight: '800', color: colors.textWhite },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  stepDesc: { fontSize: 12, color: colors.textLight, marginTop: 1 },
});
