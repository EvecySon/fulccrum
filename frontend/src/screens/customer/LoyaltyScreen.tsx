import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { promosAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const tiers = [
  { name: 'Bronze', minPoints: 0, color: '#CD7F32', perks: ['1x points on orders', 'Birthday reward'] },
  { name: 'Silver', minPoints: 1000, color: '#C0C0C0', perks: ['1.5x points', 'Free delivery monthly', 'Birthday reward'] },
  { name: 'Gold', minPoints: 3000, color: '#FFD700', perks: ['2x points', 'Free delivery', 'Priority support', 'Exclusive deals'] },
  { name: 'Platinum', minPoints: 7000, color: '#E5E4E2', perks: ['3x points', 'Free delivery', 'VIP support', 'Early access', 'Special gifts'] },
];

const rewardHistory = [
  { id: '1', action: 'Order from Burger House', points: 35, date: 'Today', type: 'earned' },
  { id: '2', action: 'Redeemed: Free Fries', points: -100, date: 'Yesterday', type: 'redeemed' },
  { id: '3', action: 'Order from Sushi Palace', points: 72, date: 'Feb 3', type: 'earned' },
  { id: '4', action: 'Bonus: 5th order this week', points: 50, date: 'Feb 2', type: 'bonus' },
  { id: '5', action: 'Order from Pizza Roma', points: 34, date: 'Feb 1', type: 'earned' },
];

const redeemOptions = [
  { id: '1', name: 'Free Delivery', points: 50, icon: 'bicycle-outline' },
  { id: '2', name: '₦1,500 Off Order', points: 200, icon: 'pricetag-outline' },
  { id: '3', name: 'Free Side Dish', points: 100, icon: 'fast-food-outline' },
  { id: '4', name: '₦3,000 Off Order', points: 350, icon: 'gift-outline' },
  { id: '5', name: 'Free Dessert', points: 150, icon: 'ice-cream-outline' },
  { id: '6', name: 'Mystery Reward', points: 500, icon: 'help-circle-outline' },
];

export default function LoyaltyScreen({ navigation }: any) {
  const [currentPoints, setCurrentPoints] = useState(350);
  const [currentTier, setCurrentTier] = useState('Bronze');

  useEffect(() => {
    (async () => {
      try {
        const res = await promosAPI.myUsage();
        if (res?.points != null) setCurrentPoints(res.points);
        if (res?.tier) setCurrentTier(res.tier);
      } catch {}
    })();
  }, []);

  const nextTier = tiers.find(t => t.minPoints > currentPoints) || tiers[tiers.length - 1];
  const progress = (currentPoints / nextTier.minPoints) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty Rewards</Text>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsTop}>
            <View>
              <Text style={styles.pointsLabel}>Your Points</Text>
              <Text style={styles.pointsValue}>{currentPoints}</Text>
            </View>
            <View style={styles.tierBadge}>
              <Ionicons name="trophy" size={20} color="#CD7F32" />
              <Text style={styles.tierText}>{currentTier}</Text>
            </View>
          </View>
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {nextTier.minPoints - currentPoints} points to {nextTier.name}
            </Text>
          </View>
        </View>

        {/* Tier Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Tiers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tierRow}>
            {tiers.map((tier, index) => {
              const isActive = tier.name === currentTier;
              return (
                <View key={index} style={[styles.tierCard, isActive && styles.tierCardActive]}>
                  <View style={[styles.tierIcon, { backgroundColor: tier.color + '20' }]}>
                    <Ionicons name="trophy" size={22} color={tier.color} />
                  </View>
                  <Text style={[styles.tierName, isActive && { color: colors.teal }]}>{tier.name}</Text>
                  <Text style={styles.tierPoints}>{tier.minPoints}+ pts</Text>
                  {tier.perks.slice(0, 2).map((perk, i) => (
                    <View key={i} style={styles.perkRow}>
                      <Ionicons name="checkmark" size={12} color={colors.teal} />
                      <Text style={styles.perkText}>{perk}</Text>
                    </View>
                  ))}
                  {tier.perks.length > 2 && (
                    <Text style={styles.morePerkText}>+{tier.perks.length - 2} more</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Redeem Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redeem Points</Text>
          <View style={styles.redeemGrid}>
            {redeemOptions.map((option) => {
              const canRedeem = currentPoints >= option.points;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.redeemCard, !canRedeem && styles.redeemCardDisabled]}
                >
                  <View style={[styles.redeemIcon, { backgroundColor: canRedeem ? colors.teal + '15' : colors.lightGray }]}>
                    <Ionicons name={option.icon as any} size={22} color={canRedeem ? colors.teal : colors.textLight} />
                  </View>
                  <Text style={[styles.redeemName, !canRedeem && { color: colors.textLight }]}>{option.name}</Text>
                  <View style={styles.redeemPoints}>
                    <Ionicons name="star" size={12} color={canRedeem ? colors.warning : colors.textLight} />
                    <Text style={[styles.redeemPointsText, !canRedeem && { color: colors.textLight }]}>{option.points}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Points History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points History</Text>
          {rewardHistory.map((item) => (
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
                <Text style={styles.historyAction}>{item.action}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              <Text style={[styles.historyPoints, { color: item.points > 0 ? colors.teal : colors.navy }]}>
                {item.points > 0 ? '+' : ''}{item.points} pts
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
});
