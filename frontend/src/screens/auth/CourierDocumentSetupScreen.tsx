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
import { getCourierDocuments } from '../../config/documentRequirements';

const vehicleTypes = [
  { key: 'bicycle', label: 'Bicycle', icon: 'bicycle' },
  { key: 'motorcycle', label: 'Motorcycle', icon: 'speedometer' },
  { key: 'car', label: 'Car', icon: 'car' },
  { key: 'van', label: 'Van', icon: 'bus' },
];

export default function CourierDocumentSetupScreen({ navigation, route }: any) {
  const { email, role } = route?.params || {};
  const [vehicleType, setVehicleType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDoc = (key: string) => {
    setUploadedDocs((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const handleContinue = () => {
    if (!vehicleType) {
      setError('Please select your vehicle type');
      return;
    }
    if (!guarantorName.trim()) {
      setError('Please enter your guarantor name');
      return;
    }
    if (!guarantorPhone.trim()) {
      setError('Please enter your guarantor phone number');
      return;
    }
    setError('');
    navigation.navigate('CourierPaymentSetup', {
      email,
      role,
      vehicleType,
      plateNumber,
      guarantorName,
      guarantorPhone,
      uploadedDocs,
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
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <View style={styles.iconCircle}>
          <Ionicons name="document-text" size={32} color={colors.teal} />
        </View>
        <Text style={styles.title}>Courier Verification</Text>
        <Text style={styles.subtitle}>Provide your vehicle and guarantor details to get started</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Vehicle Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Vehicle Type *</Text>
        <View style={styles.vehicleGrid}>
          {vehicleTypes.map((v) => (
            <TouchableOpacity
              key={v.key}
              style={[styles.vehicleCard, vehicleType === v.key && styles.vehicleCardActive]}
              onPress={() => setVehicleType(v.key)}
            >
              <Ionicons
                name={v.icon as any}
                size={28}
                color={vehicleType === v.key ? colors.teal : colors.textLight}
              />
              <Text style={[styles.vehicleLabel, vehicleType === v.key && styles.vehicleLabelActive]}>
                {v.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Plate Number */}
      {(vehicleType === 'motorcycle' || vehicleType === 'car' || vehicleType === 'van') && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Plate Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="pricetag-outline" size={20} color={colors.textLight} />
            <TextInput
              style={styles.input}
              placeholder="e.g. LAG-123-AB"
              placeholderTextColor={colors.textLight}
              value={plateNumber}
              onChangeText={setPlateNumber}
              autoCapitalize="characters"
            />
          </View>
        </View>
      )}

      {/* Documents */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Documents</Text>
        <Text style={styles.inputHint}>Tap to mark documents you have ready to upload</Text>
        {getCourierDocuments(vehicleType || 'motorcycle').map((doc) => (
          <TouchableOpacity
            key={doc.key}
            style={[styles.docRow, uploadedDocs.includes(doc.key) && styles.docRowActive]}
            onPress={() => toggleDoc(doc.key)}
          >
            <View style={[styles.docIcon, uploadedDocs.includes(doc.key) && styles.docIconActive]}>
              <Ionicons
                name={uploadedDocs.includes(doc.key) ? 'checkmark' : (doc.icon as any)}
                size={20}
                color={uploadedDocs.includes(doc.key) ? colors.textWhite : colors.textLight}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docLabel}>{doc.label}</Text>
              <Text style={styles.docStatus}>
                {doc.required ? 'Required' : 'Optional'}
              </Text>
            </View>
            <Ionicons
              name={uploadedDocs.includes(doc.key) ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={uploadedDocs.includes(doc.key) ? colors.success : colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Guarantor */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Guarantor Name *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="people-outline" size={20} color={colors.textLight} />
          <TextInput
            style={styles.input}
            placeholder="Full name of your guarantor"
            placeholderTextColor={colors.textLight}
            value={guarantorName}
            onChangeText={setGuarantorName}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Guarantor Phone *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color={colors.textLight} />
          <Text style={styles.phonePrefix}>+234</Text>
          <TextInput
            style={styles.input}
            placeholder="8012345678"
            placeholderTextColor={colors.textLight}
            value={guarantorPhone}
            onChangeText={setGuarantorPhone}
            keyboardType="phone-pad"
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
            <Text style={styles.primaryBtnText}>Continue to Payment</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
          </>
        )}
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
  stepDotActive: { backgroundColor: colors.teal, width: 24, borderRadius: 5 },
  stepLine: { width: 20, height: 2, backgroundColor: colors.border },
  titleSection: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: colors.teal + '10',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 6 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  inputHint: { fontSize: 12, color: colors.textLight, marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  phonePrefix: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vehicleCard: {
    width: '47%', alignItems: 'center', gap: 8,
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 18,
    borderWidth: 1.5, borderColor: colors.borderLight,
  },
  vehicleCardActive: { borderColor: colors.teal, backgroundColor: colors.teal + '08' },
  vehicleLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  vehicleLabelActive: { color: colors.teal },
  docRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  docRowActive: { borderColor: colors.success + '40', backgroundColor: colors.success + '06' },
  docIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.border + '40',
    justifyContent: 'center', alignItems: 'center',
  },
  docIconActive: { backgroundColor: colors.success },
  docLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  docStatus: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  primaryBtn: {
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8,
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
});
