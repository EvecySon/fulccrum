import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const bankOptions = [
  'Access Bank', 'First Bank', 'GTBank', 'UBA', 'Zenith Bank',
  'Stanbic IBTC', 'Fidelity Bank', 'Union Bank', 'Sterling Bank', 'Wema Bank',
];

export default function MerchantPaymentSetupScreen({ navigation, route }: any) {
  const params = route?.params || {};
  const { email, role } = params;
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!bankName) {
      setError('Please select your bank');
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      setError('Please enter a valid 10-digit account number');
      return;
    }
    if (!accountName.trim()) {
      setError('Please enter the account holder name');
      return;
    }
    setError('');
    navigation.navigate('VerificationPending', {
      email,
      role,
      ...params,
      bankName,
      accountNumber,
      accountName,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotComplete]} />
          <View style={[styles.stepLine, styles.stepLineActive]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <View style={styles.iconCircle}>
          <Ionicons name="card" size={32} color={colors.navy} />
        </View>
        <Text style={styles.title}>Payment Setup</Text>
        <Text style={styles.subtitle}>Set up your bank account to receive payments from orders</Text>
      </View>

      {/* Registration Fee Info */}
      <View style={styles.feeCard}>
        <View style={styles.feeHeader}>
          <Ionicons name="information-circle" size={22} color={colors.info} />
          <Text style={styles.feeTitle}>Registration Fee</Text>
        </View>
        <Text style={styles.feeDesc}>
          A one-time registration fee of <Text style={styles.feeBold}>₦25,000</Text> is required to activate your merchant account. This covers platform setup and verification.
        </Text>
        <View style={styles.feeNote}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={styles.feeNoteText}>Payment will be collected after account approval</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Bank Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bank Name *</Text>
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => setShowBankPicker(!showBankPicker)}
        >
          <Ionicons name="business-outline" size={20} color={colors.textLight} />
          <Text style={[styles.pickerText, bankName ? styles.pickerTextSelected : null]}>
            {bankName || 'Select your bank'}
          </Text>
          <Ionicons name={showBankPicker ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textLight} />
        </TouchableOpacity>
        {showBankPicker && (
          <View style={styles.bankList}>
            {bankOptions.map((bank) => (
              <TouchableOpacity
                key={bank}
                style={[styles.bankOption, bankName === bank && styles.bankOptionActive]}
                onPress={() => { setBankName(bank); setShowBankPicker(false); }}
              >
                <Text style={[styles.bankOptionText, bankName === bank && styles.bankOptionTextActive]}>
                  {bank}
                </Text>
                {bankName === bank && <Ionicons name="checkmark" size={18} color={colors.navy} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Account Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Account Number *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="keypad-outline" size={20} color={colors.textLight} />
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit account number"
            placeholderTextColor={colors.textLight}
            value={accountNumber}
            onChangeText={(text) => setAccountNumber(text.replace(/\D/g, '').slice(0, 10))}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
      </View>

      {/* Account Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Account Holder Name *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={colors.textLight} />
          <TextInput
            style={styles.input}
            placeholder="Name on bank account"
            placeholderTextColor={colors.textLight}
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textWhite} />
        ) : (
          <>
            <Text style={styles.primaryBtnText}>Complete Setup</Text>
            <Ionicons name="checkmark-circle" size={20} color={colors.textWhite} />
          </>
        )}
      </TouchableOpacity>

      {/* Skip for now */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => navigation.navigate('VerificationPending', { email, role, ...params })}
      >
        <Text style={styles.skipText}>Skip for now — set up later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { paddingTop: 60, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.navy, width: 24, borderRadius: 5 },
  stepDotComplete: { backgroundColor: colors.success },
  stepLine: { width: 20, height: 2, backgroundColor: colors.border },
  stepLineActive: { backgroundColor: colors.success },
  titleSection: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 6 },
  feeCard: {
    backgroundColor: colors.info + '08', borderRadius: 16, padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: colors.info + '20',
  },
  feeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  feeTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  feeDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  feeBold: { fontWeight: '700', color: colors.textPrimary },
  feeNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  feeNoteText: { fontSize: 12, color: colors.success, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  pickerText: { flex: 1, fontSize: 15, color: colors.textLight },
  pickerTextSelected: { color: colors.textPrimary },
  bankList: {
    backgroundColor: colors.white, borderRadius: 14, marginTop: 8,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  bankOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  bankOptionActive: { backgroundColor: colors.navy + '08' },
  bankOptionText: { fontSize: 14, color: colors.textPrimary },
  bankOptionTextActive: { fontWeight: '700', color: colors.navy },
  primaryBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8,
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  skipBtn: { alignItems: 'center', marginTop: 16 },
  skipText: { fontSize: 14, color: colors.textLight },
});
