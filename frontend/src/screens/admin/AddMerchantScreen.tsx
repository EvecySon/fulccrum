import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';

const commissionOptions = [8, 10, 12, 15, 20];

export default function AddMerchantScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [commission, setCommission] = useState(10);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [notes, setNotes] = useState('');
  const [waiveFee, setWaiveFee] = useState(false);

  const businessTypes = [
    { key: 'restaurant', label: 'Restaurant', icon: 'restaurant' },
    { key: 'grocery', label: 'Grocery', icon: 'cart' },
    { key: 'pharmacy', label: 'Pharmacy', icon: 'medkit' },
    { key: 'other', label: 'Other', icon: 'storefront' },
  ];

  const handleInvite = async () => {
    if (!ownerName.trim()) { setError('Owner name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!businessName.trim()) { setError('Business name is required'); return; }
    setError('');
    setLoading(true);
    try {
      await adminAPI.inviteMerchant({ email, businessName, ownerName, phone: phone || undefined, commission });
      Alert.alert(
        'Invitation Sent!',
        `An invite has been sent to ${email}. ${ownerName} will receive an email with instructions to complete registration${waiveFee ? ' (registration fee waived)' : ''}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Merchant</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={colors.navy} />
          <Text style={styles.infoText}>
            The merchant will receive an email invitation to download the app, complete verification, and pay the registration fee.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Owner Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor={colors.textLight}
                value={ownerName}
                onChangeText={setOwnerName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="owner@business.com"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.phonePrefix}>+234</Text>
              <View style={styles.phoneDivider} />
              <TextInput
                style={styles.input}
                placeholder="812 345 6789"
                placeholderTextColor={colors.textLight}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Business Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="storefront-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Mama's Kitchen"
                placeholderTextColor={colors.textLight}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Business Type</Text>
          <View style={styles.typeRow}>
            {businessTypes.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeChip, businessType === t.key && styles.typeChipActive]}
                onPress={() => setBusinessType(t.key)}
              >
                <Ionicons name={t.icon as any} size={16} color={businessType === t.key ? colors.textWhite : colors.navy} />
                <Text style={[styles.typeChipText, businessType === t.key && styles.typeChipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Street address"
                placeholderTextColor={colors.textLight}
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput style={styles.inputSmall} placeholder="City" placeholderTextColor={colors.textLight} value={city} onChangeText={setCity} />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>State</Text>
              <TextInput style={styles.inputSmall} placeholder="State" placeholderTextColor={colors.textLight} value={state} onChangeText={setState} />
            </View>
          </View>
        </View>

        {/* Commission & Fees */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commission & Fees</Text>

          <Text style={styles.inputLabel}>Commission Rate</Text>
          <View style={styles.commissionRow}>
            {commissionOptions.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.commissionChip, commission === c && styles.commissionChipActive]}
                onPress={() => setCommission(c)}
              >
                <Text style={[styles.commissionText, commission === c && styles.commissionTextActive]}>{c}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.waiveFeeRow} onPress={() => setWaiveFee(!waiveFee)}>
            <View style={[styles.checkbox, waiveFee && styles.checkboxChecked]}>
              {waiveFee && <Ionicons name="checkmark" size={14} color={colors.textWhite} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.waiveFeeLabel}>Waive Registration Fee</Text>
              <Text style={styles.waiveFeeDesc}>Skip the ₦25,000 one-time registration fee for this merchant</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Internal Notes</Text>
          <TextInput
            style={[styles.inputSmall, styles.textArea]}
            placeholder="Add any internal notes about this merchant..."
            placeholderTextColor={colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Invitation Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Invite to</Text>
            <Text style={styles.summaryValue}>{email || '—'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Business</Text>
            <Text style={styles.summaryValue}>{businessName || '—'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Commission</Text>
            <Text style={styles.summaryValue}>{commission}%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Registration Fee</Text>
            <Text style={[styles.summaryValue, waiveFee && { color: colors.success }]}>
              {waiveFee ? 'Waived' : '₦25,000'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          onPress={handleInvite}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={colors.textWhite} />
              <Text style={styles.primaryBtnText}>Send Invitation</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  infoBanner: {
    flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16,
    backgroundColor: colors.navy + '08', borderRadius: 14, padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 12,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 8,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  inputSmall: {
    backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight,
  },
  textArea: { minHeight: 80, paddingTop: 12 },
  phonePrefix: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  phoneDivider: { width: 1, height: 18, backgroundColor: colors.border },
  row: { flexDirection: 'row', gap: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.lightGray, borderWidth: 1.5, borderColor: 'transparent',
  },
  typeChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  typeChipText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  typeChipTextActive: { color: colors.textWhite },
  commissionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  commissionChip: {
    flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.lightGray,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent',
  },
  commissionChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  commissionText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  commissionTextActive: { color: colors.textWhite },
  waiveFeeRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.lightGray, borderRadius: 12, padding: 14,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.teal, borderColor: colors.teal },
  waiveFeeLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  waiveFeeDesc: { fontSize: 12, color: colors.textLight, marginTop: 2, lineHeight: 16 },
  summaryCard: {
    marginHorizontal: 20, backgroundColor: colors.navy + '06', borderRadius: 14,
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.navy + '15',
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, color: colors.textLight },
  summaryValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  primaryBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16, marginHorizontal: 20,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  secondaryBtn: {
    marginHorizontal: 20, marginTop: 12, paddingVertical: 14,
    alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: colors.border,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
});
