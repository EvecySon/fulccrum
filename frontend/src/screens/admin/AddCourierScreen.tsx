import { showAlert } from '../../utils/alert';
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

const vehicleTypes = [
  { key: 'bicycle', label: 'Bicycle', icon: 'bicycle' },
  { key: 'motorcycle', label: 'Motorcycle', icon: 'speedometer' },
  { key: 'car', label: 'Car', icon: 'car' },
  { key: 'van', label: 'Van', icon: 'bus' },
];

export default function AddCourierScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('motorcycle');
  const [zone, setZone] = useState('');
  const [notes, setNotes] = useState('');
  const [waiveFee, setWaiveFee] = useState(false);

  const handleInvite = async () => {
    if (!fullName.trim()) { setError('Full name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    setError('');
    setLoading(true);
    try {
      await adminAPI.inviteCourier({ email, fullName, phone: phone || undefined, vehicleType });
      showAlert(
        'Invitation Sent!',
        `An invite has been sent to ${email}. ${fullName} will receive instructions to complete registration and document verification${waiveFee ? ' (registration fee waived)' : ''}.`,
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
        <Text style={styles.headerTitle}>Add Courier</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={colors.teal} />
          <Text style={styles.infoText}>
            The courier will receive an email invitation to download the app, upload required documents, and pay the registration fee.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Mike Johnson"
                placeholderTextColor={colors.textLight}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="courier@email.com"
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

        {/* Vehicle & Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle & Zone</Text>

          <Text style={styles.inputLabel}>Preferred Vehicle Type</Text>
          <View style={styles.vehicleRow}>
            {vehicleTypes.map((v) => (
              <TouchableOpacity
                key={v.key}
                style={[styles.vehicleCard, vehicleType === v.key && styles.vehicleCardActive]}
                onPress={() => setVehicleType(v.key)}
              >
                <Ionicons name={v.icon as any} size={24} color={vehicleType === v.key ? colors.textWhite : colors.teal} />
                <Text style={[styles.vehicleLabel, vehicleType === v.key && styles.vehicleLabelActive]}>{v.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Delivery Zone</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="map-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Lagos Island, Victoria Island"
                placeholderTextColor={colors.textLight}
                value={zone}
                onChangeText={setZone}
              />
            </View>
          </View>
        </View>

        {/* Fee */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Fee</Text>
          <TouchableOpacity style={styles.waiveFeeRow} onPress={() => setWaiveFee(!waiveFee)}>
            <View style={[styles.checkbox, waiveFee && styles.checkboxChecked]}>
              {waiveFee && <Ionicons name="checkmark" size={14} color={colors.textWhite} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.waiveFeeLabel}>Waive Registration Fee</Text>
              <Text style={styles.waiveFeeDesc}>Skip the ₦10,000 one-time registration fee for this courier</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Internal Notes</Text>
          <TextInput
            style={[styles.inputSmall, styles.textArea]}
            placeholder="Add any internal notes about this courier..."
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
            <Text style={styles.summaryLabel}>Name</Text>
            <Text style={styles.summaryValue}>{fullName || '—'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vehicle</Text>
            <Text style={styles.summaryValue}>{vehicleTypes.find(v => v.key === vehicleType)?.label || '—'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Registration Fee</Text>
            <Text style={[styles.summaryValue, waiveFee && { color: colors.success }]}>
              {waiveFee ? 'Waived' : '₦10,000'}
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
    backgroundColor: colors.teal + '08', borderRadius: 14, padding: 14,
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
  vehicleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  vehicleCard: {
    flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray,
    alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: 'transparent',
  },
  vehicleCardActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  vehicleLabel: { fontSize: 11, fontWeight: '600', color: colors.textPrimary },
  vehicleLabelActive: { color: colors.textWhite },
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
    marginHorizontal: 20, backgroundColor: colors.teal + '06', borderRadius: 14,
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.teal + '15',
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.teal, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, color: colors.textLight },
  summaryValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  primaryBtn: {
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, marginHorizontal: 20,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  secondaryBtn: {
    marginHorizontal: 20, marginTop: 12, paddingVertical: 14,
    alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: colors.border,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
});
