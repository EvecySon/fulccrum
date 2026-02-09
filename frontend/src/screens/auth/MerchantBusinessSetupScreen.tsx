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

const businessCategories = [
  { key: 'restaurant', label: 'Restaurant', icon: 'restaurant' },
  { key: 'fast_food', label: 'Fast Food', icon: 'fast-food' },
  { key: 'grocery', label: 'Grocery Store', icon: 'cart' },
  { key: 'bakery', label: 'Bakery & Pastry', icon: 'cafe' },
  { key: 'pharmacy', label: 'Pharmacy', icon: 'medkit' },
  { key: 'other', label: 'Other', icon: 'storefront' },
];

export default function MerchantBusinessSetupScreen({ navigation, route }: any) {
  const { email, role } = route?.params || {};
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!businessName.trim()) {
      setError('Please enter your business name');
      return;
    }
    if (!category) {
      setError('Please select a business category');
      return;
    }
    if (!businessAddress.trim()) {
      setError('Please enter your business address');
      return;
    }
    if (!businessPhone.trim()) {
      setError('Please enter your business phone number');
      return;
    }
    setError('');
    navigation.navigate('MerchantPaymentSetup', {
      email,
      role,
      businessName,
      businessAddress,
      businessPhone,
      category,
      description,
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
          <Ionicons name="storefront" size={32} color={colors.navy} />
        </View>
        <Text style={styles.title}>Set Up Your Business</Text>
        <Text style={styles.subtitle}>Tell us about your business so customers can find you</Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Business Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Name *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color={colors.textLight} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Mama's Kitchen"
            placeholderTextColor={colors.textLight}
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Category *</Text>
        <View style={styles.categoryGrid}>
          {businessCategories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryCard, category === cat.key && styles.categoryCardActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={24}
                color={category === cat.key ? colors.navy : colors.textLight}
              />
              <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
              {category === cat.key && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color={colors.textWhite} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Business Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Address *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="location-outline" size={20} color={colors.textLight} />
          <TextInput
            style={styles.input}
            placeholder="Enter your business address"
            placeholderTextColor={colors.textLight}
            value={businessAddress}
            onChangeText={setBusinessAddress}
          />
        </View>
      </View>

      {/* Business Phone */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Phone *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color={colors.textLight} />
          <Text style={styles.phonePrefix}>+234</Text>
          <TextInput
            style={styles.input}
            placeholder="8012345678"
            placeholderTextColor={colors.textLight}
            value={businessPhone}
            onChangeText={setBusinessPhone}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description (optional)</Text>
        <View style={[styles.inputWrapper, { alignItems: 'flex-start', minHeight: 80 }]}>
          <Ionicons name="document-text-outline" size={20} color={colors.textLight} style={{ marginTop: 2 }} />
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="Briefly describe what you sell..."
            placeholderTextColor={colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
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
  stepDotActive: { backgroundColor: colors.navy, width: 24, borderRadius: 5 },
  stepLine: { width: 20, height: 2, backgroundColor: colors.border },
  titleSection: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: colors.navy + '10',
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
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  phonePrefix: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: colors.borderLight,
  },
  categoryCardActive: { borderColor: colors.navy, backgroundColor: colors.navy + '08' },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, flex: 1 },
  categoryLabelActive: { color: colors.navy },
  checkBadge: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: colors.navy,
    justifyContent: 'center', alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8,
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
});
