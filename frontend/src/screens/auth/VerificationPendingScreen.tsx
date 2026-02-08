import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function VerificationPendingScreen({ navigation, route }: any) {
  const { role, email } = route?.params || {};
  const isMerchant = role === 'business_owner';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={isMerchant ? 'storefront' : 'bicycle'}
            size={48}
            color={isMerchant ? colors.navy : colors.teal}
          />
        </View>

        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.subtitle}>
          Your {isMerchant ? 'merchant' : 'courier'} account has been created successfully.
          {'\n\n'}To start {isMerchant ? 'selling on Fulccrum' : 'delivering with Fulccrum'}, you need to:
        </Text>

        <View style={styles.stepsCard}>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, styles.stepComplete]}>
              <Ionicons name="checkmark" size={16} color={colors.textWhite} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Create Account</Text>
              <Text style={styles.stepDesc}>Email & password set up</Text>
            </View>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, styles.stepComplete]}>
              <Ionicons name="checkmark" size={16} color={colors.textWhite} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Verify Email</Text>
              <Text style={styles.stepDesc}>OTP verification complete</Text>
            </View>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, styles.stepPending]}>
              <Text style={styles.stepBadgeNum}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>
                {isMerchant ? 'Business Verification' : 'Document Upload'}
              </Text>
              <Text style={styles.stepDesc}>
                {isMerchant ? 'Upload business documents' : 'Upload required documents'}
              </Text>
            </View>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, styles.stepPending]}>
              <Text style={styles.stepBadgeNum}>4</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>Registration Fee</Text>
              <Text style={styles.stepDesc}>
                One-time payment of {isMerchant ? '₦25,000' : '₦10,000'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: isMerchant ? colors.navy : colors.teal }]}
          onPress={() => {
            // In dev mode, navigate directly to the verification screen
            // In production, user would log in and be routed from their dashboard
            navigation.navigate('Login');
          }}
        >
          <Text style={styles.primaryBtnText}>
            Continue to Login
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
        </TouchableOpacity>

        <Text style={styles.hint}>
          Log in to access your {isMerchant ? 'merchant' : 'courier'} dashboard and complete verification.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 100, alignItems: 'center' },
  iconCircle: {
    width: 96, height: 96, borderRadius: 28, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  subtitle: {
    fontSize: 15, color: colors.textLight, textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  stepsCard: {
    width: '100%', backgroundColor: colors.lightGray, borderRadius: 18,
    padding: 20, marginBottom: 28,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBadge: {
    width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  stepComplete: { backgroundColor: colors.success },
  stepPending: { backgroundColor: colors.navy + '15' },
  stepBadgeNum: { fontSize: 14, fontWeight: '700', color: colors.navy },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  stepDesc: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  stepDivider: {
    width: 2, height: 16, backgroundColor: colors.border, marginLeft: 15, marginVertical: 4,
  },
  primaryBtn: {
    width: '100%', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  hint: {
    fontSize: 13, color: colors.textLight, textAlign: 'center', marginTop: 16, lineHeight: 18,
  },
});
