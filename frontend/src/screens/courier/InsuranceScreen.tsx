import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierInsuranceAPI } from '../../services/api';

interface InsurancePlan {
  id: string;
  name: string;
  type: 'basic' | 'standard' | 'premium';
  monthlyPremium: number;
  coverage: string[];
  maxCoverage: number;
  active: boolean;
}

interface Claim {
  id: string;
  type: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  description: string;
}

const mockCurrentPlan: InsurancePlan = {
  id: '2',
  name: 'Standard Protection',
  type: 'standard',
  monthlyPremium: 3500,
  coverage: [
    'Accident coverage up to ₦500,000',
    'Third-party liability',
    'Medical expenses up to ₦200,000',
    'Lost/damaged goods up to ₦50,000',
    'Legal assistance',
  ],
  maxCoverage: 500000,
  active: true,
};

const mockPlans: InsurancePlan[] = [
  {
    id: '1', name: 'Basic Protection', type: 'basic', monthlyPremium: 1500,
    coverage: ['Accident coverage up to ₦200,000', 'Third-party liability', 'Medical expenses up to ₦50,000'],
    maxCoverage: 200000, active: false,
  },
  mockCurrentPlan,
  {
    id: '3', name: 'Premium Protection', type: 'premium', monthlyPremium: 6000,
    coverage: [
      'Accident coverage up to ₦1,000,000', 'Third-party liability', 'Medical expenses up to ₦500,000',
      'Lost/damaged goods up to ₦150,000', 'Legal assistance', 'Income protection (7 days)',
      'Vehicle replacement coverage', '24/7 roadside assistance',
    ],
    maxCoverage: 1000000, active: false,
  },
];

const mockClaims: Claim[] = [
  { id: '1', type: 'Accident', date: 'Jan 15, 2026', amount: 45000, status: 'paid', description: 'Minor collision at Lekki roundabout' },
  { id: '2', type: 'Medical', date: 'Dec 20, 2025', amount: 12000, status: 'approved', description: 'Hospital visit after fall' },
  { id: '3', type: 'Lost Goods', date: 'Nov 5, 2025', amount: 8500, status: 'rejected', description: 'Package damaged during delivery' },
];

export default function InsuranceScreen({ navigation }: any) {
  const [currentPlan, setCurrentPlan] = useState(mockCurrentPlan);
  const [showPlans, setShowPlans] = useState(false);
  const [claims, setClaims] = useState(mockClaims);

  useEffect(() => {
    (async () => {
      try {
        const [planRes, claimsRes] = await Promise.all([
          courierInsuranceAPI.getCurrentPlan().catch(() => null),
          courierInsuranceAPI.getClaims().catch(() => null),
        ]);
        if (planRes?.id) setCurrentPlan(planRes);
        if (Array.isArray(claimsRes) && claimsRes.length) setClaims(claimsRes);
      } catch {}
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'approved': return colors.teal;
      case 'pending': return colors.warning;
      case 'rejected': return colors.error;
      default: return colors.textLight;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'basic': return '#6366f1';
      case 'standard': return colors.teal;
      case 'premium': return '#f59e0b';
      default: return colors.textLight;
    }
  };

  const handleFileClaim = () => {
    Alert.alert('File a Claim', 'What type of claim would you like to file?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accident', onPress: () => Alert.alert('Claim Filed', 'Your accident claim has been submitted. We\'ll review it within 48 hours.') },
      { text: 'Medical', onPress: () => Alert.alert('Claim Filed', 'Your medical claim has been submitted. We\'ll review it within 48 hours.') },
      { text: 'Lost/Damaged Goods', onPress: () => Alert.alert('Claim Filed', 'Your goods claim has been submitted. We\'ll review it within 48 hours.') },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insurance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Plan */}
        <View style={[styles.planHero, { borderColor: getPlanColor(currentPlan.type) + '40' }]}>
          <View style={styles.planHeroHeader}>
            <View style={[styles.planBadge, { backgroundColor: getPlanColor(currentPlan.type) + '15' }]}>
              <Ionicons name="shield-checkmark" size={18} color={getPlanColor(currentPlan.type)} />
              <Text style={[styles.planBadgeText, { color: getPlanColor(currentPlan.type) }]}>
                {currentPlan.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>

          <Text style={styles.planName}>{currentPlan.name}</Text>
          <Text style={styles.planPremium}>₦{currentPlan.monthlyPremium.toLocaleString()}/month</Text>

          <View style={styles.coverageList}>
            {currentPlan.coverage.map((item, idx) => (
              <View key={idx} style={styles.coverageItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.coverageText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.planActions}>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => setShowPlans(!showPlans)}>
              <Ionicons name="arrow-up-circle-outline" size={18} color={colors.textWhite} />
              <Text style={styles.upgradeBtnText}>{showPlans ? 'Hide Plans' : 'Change Plan'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.claimBtn} onPress={handleFileClaim}>
              <Ionicons name="document-text-outline" size={18} color={colors.teal} />
              <Text style={styles.claimBtnText}>File Claim</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Plans */}
        {showPlans && (
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            {mockPlans.map((plan) => {
              const planColor = getPlanColor(plan.type);
              const isCurrent = plan.id === currentPlan.id;
              return (
                <View key={plan.id} style={[styles.planCard, isCurrent && { borderColor: planColor + '40', borderWidth: 2 }]}>
                  <View style={styles.planCardHeader}>
                    <View style={[styles.planTypeIcon, { backgroundColor: planColor + '15' }]}>
                      <Ionicons name="shield" size={20} color={planColor} />
                    </View>
                    <View style={styles.planCardInfo}>
                      <Text style={styles.planCardName}>{plan.name}</Text>
                      <Text style={styles.planCardPrice}>₦{plan.monthlyPremium.toLocaleString()}/mo</Text>
                    </View>
                    {isCurrent ? (
                      <View style={[styles.currentBadge, { backgroundColor: planColor + '15' }]}>
                        <Text style={[styles.currentBadgeText, { color: planColor }]}>CURRENT</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.selectBtn, { backgroundColor: planColor }]}
                        onPress={() => {
                          setCurrentPlan(plan);
                          Alert.alert('Plan Changed', `You've switched to ${plan.name}.`);
                        }}
                      >
                        <Text style={styles.selectBtnText}>Select</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.planCoveragePreview}>
                    <Text style={styles.planMaxCoverage}>Up to ₦{plan.maxCoverage.toLocaleString()} coverage</Text>
                    <Text style={styles.planFeatureCount}>{plan.coverage.length} benefits included</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Claims History */}
        <View style={styles.claimsSection}>
          <View style={styles.claimsHeader}>
            <Text style={styles.sectionTitle}>Claims History</Text>
            <TouchableOpacity onPress={handleFileClaim}>
              <Text style={styles.newClaimText}>+ New Claim</Text>
            </TouchableOpacity>
          </View>

          {claims.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No claims yet</Text>
              <Text style={styles.emptyDesc}>Your claims history will appear here</Text>
            </View>
          ) : (
            claims.map((claim) => (
              <View key={claim.id} style={styles.claimCard}>
                <View style={styles.claimHeader}>
                  <View style={styles.claimTypeRow}>
                    <Ionicons name="document-text" size={18} color={colors.navy} />
                    <Text style={styles.claimType}>{claim.type}</Text>
                  </View>
                  <View style={[styles.claimStatus, { backgroundColor: getStatusColor(claim.status) + '12' }]}>
                    <Text style={[styles.claimStatusText, { color: getStatusColor(claim.status) }]}>
                      {claim.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.claimDesc}>{claim.description}</Text>
                <View style={styles.claimMeta}>
                  <Text style={styles.claimDate}>{claim.date}</Text>
                  <Text style={styles.claimAmount}>₦{claim.amount.toLocaleString()}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencyCard}>
          <Ionicons name="call" size={22} color={colors.error} />
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Insurance Emergency Line</Text>
            <Text style={styles.emergencyDesc}>Available 24/7 for accident reporting</Text>
          </View>
          <TouchableOpacity style={styles.emergencyBtn}>
            <Text style={styles.emergencyBtnText}>Call Now</Text>
          </TouchableOpacity>
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
  planHero: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: colors.teal + '30',
  },
  planHeroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  planBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  activeText: { fontSize: 12, fontWeight: '600', color: colors.success },
  planName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  planPremium: { fontSize: 16, color: colors.textSecondary, marginTop: 2 },
  coverageList: { marginTop: 16, gap: 8 },
  coverageItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coverageText: { fontSize: 14, color: colors.textSecondary },
  planActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  upgradeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 12,
  },
  upgradeBtnText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  claimBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.teal + '10', borderRadius: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.teal + '30',
  },
  claimBtnText: { fontSize: 14, fontWeight: '600', color: colors.teal },
  plansSection: { paddingHorizontal: 10, marginTop: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  planCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  planCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planTypeIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  planCardInfo: { flex: 1 },
  planCardName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  planCardPrice: { fontSize: 13, color: colors.textLight, marginTop: 1 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  currentBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  selectBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  selectBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  planCoveragePreview: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  planMaxCoverage: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  planFeatureCount: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  claimsSection: { paddingHorizontal: 10, marginTop: 16 },
  claimsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  newClaimText: { fontSize: 14, fontWeight: '600', color: colors.teal },
  emptyState: { alignItems: 'center', paddingVertical: 30, backgroundColor: colors.white, borderRadius: 14 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginTop: 8 },
  emptyDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  claimCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  claimHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  claimTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  claimType: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  claimStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  claimStatusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  claimDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  claimMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  claimDate: { fontSize: 12, color: colors.textLight },
  claimAmount: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  emergencyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 10, marginTop: 16,
    backgroundColor: colors.error + '08', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.error + '20',
  },
  emergencyInfo: { flex: 1 },
  emergencyTitle: { fontSize: 14, fontWeight: '700', color: colors.error },
  emergencyDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  emergencyBtn: { backgroundColor: colors.error, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  emergencyBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
});
