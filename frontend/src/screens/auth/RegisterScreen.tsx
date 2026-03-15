import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';

const roles = [
  { key: 'customer', label: 'Customer', icon: 'person', desc: 'Order food & groceries' },
  { key: 'business_owner', label: 'Merchant', icon: 'storefront', desc: 'Sell on Fulccrum' },
  { key: 'driver', label: 'Courier', icon: 'bicycle', desc: 'Deliver & earn' },
];

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    if (!firstName || !lastName) {
      setError('Please enter your full name');
      return;
    }
    setError('');
    
    // If merchant/business owner, navigate to Provider Type Selection
    if (selectedRole === 'business_owner') {
      navigation.navigate('ProviderTypeSelection', {
        firstName,
        lastName,
      });
      return;
    }
    
    setStep(2);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phone: phone ? `+234${phone}` : undefined,
        role: selectedRole,
      });
      navigation.navigate('OTPVerification', { email, phone: phone ? `+234${phone}` : undefined, role: selectedRole });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
          </View>
          <View style={{ width: 24 }} />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Step 1: Name + Role */}
        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Create account</Text>
            <Text style={styles.formSubtitle}>Tell us about yourself</Text>

            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor={colors.textLight}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor={colors.textLight}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.roleTitle}>I want to...</Text>
            <View style={styles.roleList}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.key}
                  style={[styles.roleCard, selectedRole === role.key && styles.roleCardActive]}
                  onPress={() => setSelectedRole(role.key)}
                >
                  <View style={[styles.roleIcon, selectedRole === role.key && styles.roleIconActive]}>
                    <Ionicons
                      name={role.icon as any}
                      size={22}
                      color={selectedRole === role.key ? colors.textWhite : colors.navy}
                    />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleLabel, selectedRole === role.key && styles.roleLabelActive]}>
                      {role.label}
                    </Text>
                    <Text style={styles.roleDesc}>{role.desc}</Text>
                  </View>
                  <View style={[styles.radioOuter, selectedRole === role.key && styles.radioOuterActive]}>
                    {selectedRole === role.key && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Contact + Password */}
        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Almost there</Text>
            <Text style={styles.formSubtitle}>Set up your login credentials</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textLight}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            {/* Terms */}
            <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={14} color={colors.textWhite} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.primaryBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, marginBottom: 24,
  },
  backBtn: { width: 24 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.navy },
  stepLine: { width: 40, height: 3, backgroundColor: colors.border, borderRadius: 2 },
  stepLineActive: { backgroundColor: colors.navy },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  formSection: { flex: 1 },
  formTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  formSubtitle: { fontSize: 15, color: colors.textLight, marginTop: 4, marginBottom: 24 },
  nameRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  phonePrefix: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  phoneDivider: { width: 1, height: 20, backgroundColor: colors.border },
  roleTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 8, marginBottom: 12 },
  roleList: { gap: 10, marginBottom: 24 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    backgroundColor: colors.lightGray, borderWidth: 2, borderColor: 'transparent', gap: 14,
  },
  roleCardActive: { borderColor: colors.navy, backgroundColor: colors.navy + '08' },
  roleIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: colors.navy + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  roleIconActive: { backgroundColor: colors.navy },
  roleInfo: { flex: 1 },
  roleLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  roleLabelActive: { color: colors.navy },
  roleDesc: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterActive: { borderColor: colors.navy },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.navy },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 24 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.teal, borderColor: colors.teal },
  termsText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  termsLink: { color: colors.navy, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 32 },
  footerText: { fontSize: 15, color: colors.textSecondary },
  footerLink: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
