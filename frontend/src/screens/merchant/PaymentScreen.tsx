import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function MerchantPaymentScreen({ navigation }: any) {
  const [feePaid, setFeePaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayFee = async () => {
    setProcessing(true);
    setError('');
    try {
      // In production: call payment API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFeePaid(true);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submitted!',
      'Your business verification and payment have been received. We\'ll review your application and notify you once approved.',
      [{ text: 'OK', onPress: () => navigation.popToTop() }],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registration Fee</Text>
        <View style={{ width: 24 }} />
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Registration Fee</Text>
        <Text style={styles.subtitle}>A one-time fee to activate your merchant account</Text>

        {/* Fee Card */}
        <View style={styles.feeCard}>
          <View style={styles.feeHeader}>
            <Ionicons name="shield-checkmark" size={28} color={colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.feeTitle}>Merchant Registration</Text>
              <Text style={styles.feeDesc}>One-time activation fee</Text>
            </View>
            <Text style={styles.feeAmount}>₦25,000</Text>
          </View>
          <View style={styles.feeBenefits}>
            {[
              'Full access to merchant dashboard',
              'Unlimited menu items & categories',
              'Real-time order management',
              'Analytics & business insights',
              'Priority customer support',
            ].map((b, i) => (
              <View key={i} style={styles.feeBenefitRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.feeBenefitText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <Text style={styles.payMethodLabel}>Payment Method</Text>
        {[
          { key: 'card' as const, label: 'Debit/Credit Card', icon: 'card', desc: 'Visa, Mastercard, Verve' },
          { key: 'transfer' as const, label: 'Bank Transfer', icon: 'swap-horizontal', desc: 'Direct bank transfer' },
          { key: 'wallet' as const, label: 'Fulccrum Wallet', icon: 'wallet', desc: 'Pay from your wallet balance' },
        ].map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.payMethodCard, paymentMethod === m.key && styles.payMethodCardActive]}
            onPress={() => setPaymentMethod(m.key)}
          >
            <View style={[styles.payMethodIcon, paymentMethod === m.key && styles.payMethodIconActive]}>
              <Ionicons name={m.icon as any} size={20} color={paymentMethod === m.key ? colors.textWhite : colors.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payMethodName}>{m.label}</Text>
              <Text style={styles.payMethodDesc}>{m.desc}</Text>
            </View>
            <View style={[styles.radioOuter, paymentMethod === m.key && styles.radioOuterActive]}>
              {paymentMethod === m.key && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Pay / Success */}
        {feePaid ? (
          <View style={styles.paidBanner}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={styles.paidText}>Payment successful!</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.payBtn, processing && styles.payBtnDisabled]}
            onPress={handlePayFee}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color={colors.textWhite} />
                <Text style={styles.payBtnText}>Pay ₦25,000</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Submit */}
        {feePaid && (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name="shield-checkmark" size={20} color={colors.textWhite} />
            <Text style={styles.payBtnText}>Submit for Verification</Text>
          </TouchableOpacity>
        )}

        <View style={styles.secureNote}>
          <Ionicons name="shield" size={14} color={colors.textLight} />
          <Text style={styles.secureNoteText}>Payments are securely processed. Your card details are encrypted.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 12,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textLight, marginTop: 4, marginBottom: 24 },
  feeCard: {
    backgroundColor: colors.navy + '06', borderRadius: 16, padding: 18,
    marginBottom: 24, borderWidth: 1, borderColor: colors.navy + '15',
  },
  feeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14,
    paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.navy + '10',
  },
  feeTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  feeDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  feeAmount: { fontSize: 22, fontWeight: '800', color: colors.navy },
  feeBenefits: { gap: 8 },
  feeBenefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feeBenefitText: { fontSize: 13, color: colors.textSecondary },
  payMethodLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  payMethodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 2, borderColor: 'transparent',
  },
  payMethodCardActive: { borderColor: colors.navy, backgroundColor: colors.navy + '06' },
  payMethodIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.navy + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  payMethodIconActive: { backgroundColor: colors.navy },
  payMethodName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  payMethodDesc: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterActive: { borderColor: colors.navy },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.navy },
  payBtn: {
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    marginTop: 14,
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  paidBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.success + '10', borderRadius: 14, padding: 16, marginTop: 14,
  },
  paidText: { fontSize: 16, fontWeight: '700', color: colors.success },
  submitBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    marginTop: 14,
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  secureNote: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 16, marginBottom: 8,
  },
  secureNoteText: { fontSize: 11, color: colors.textLight },
});
