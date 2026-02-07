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
import { authAPI } from '../../services/api';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!value) {
      setError(method === 'email' ? 'Please enter your email' : 'Please enter your phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(method, method === 'phone' ? `+234${value}` : value);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {!sent ? (
          <>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={36} color={colors.navy} />
              </View>
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your {method === 'email' ? 'email address' : 'phone number'} and
              we'll send you a reset code.
            </Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Method Toggle */}
            <View style={styles.methodToggle}>
              <TouchableOpacity
                style={[styles.methodBtn, method === 'email' && styles.methodBtnActive]}
                onPress={() => { setMethod('email'); setValue(''); }}
              >
                <Ionicons name="mail-outline" size={18} color={method === 'email' ? colors.textWhite : colors.textSecondary} />
                <Text style={[styles.methodText, method === 'email' && styles.methodTextActive]}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodBtn, method === 'phone' && styles.methodBtnActive]}
                onPress={() => { setMethod('phone'); setValue(''); }}
              >
                <Ionicons name="call-outline" size={18} color={method === 'phone' ? colors.textWhite : colors.textSecondary} />
                <Text style={[styles.methodText, method === 'phone' && styles.methodTextActive]}>Phone</Text>
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{method === 'email' ? 'Email Address' : 'Phone Number'}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name={method === 'email' ? 'mail-outline' : 'call-outline'}
                  size={20}
                  color={colors.textLight}
                />
                {method === 'phone' && (
                  <>
                    <Text style={styles.phonePrefix}>+234</Text>
                    <View style={styles.phoneDivider} />
                  </>
                )}
                <TextInput
                  style={styles.input}
                  placeholder={method === 'email' ? 'you@example.com' : '812 345 6789'}
                  placeholderTextColor={colors.textLight}
                  value={value}
                  onChangeText={setValue}
                  keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.primaryBtnText}>Send Reset Code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          /* Success State */
          <View style={styles.successSection}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Code Sent!</Text>
            <Text style={styles.successText}>
              We've sent a reset code to{'\n'}
              <Text style={styles.successValue}>{value}</Text>
            </Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('OTPVerification', { email: method === 'email' ? value : '', phone: method === 'phone' ? value : '', mode: 'reset' })}
            >
              <Text style={styles.primaryBtnText}>Enter Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendBtn} onPress={() => setSent(false)}>
              <Text style={styles.resendText}>Didn't receive it? </Text>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { paddingTop: 60, marginBottom: 16 },
  backBtn: { width: 40 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textLight, textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 22 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  methodToggle: {
    flexDirection: 'row', backgroundColor: colors.lightGray, borderRadius: 14, padding: 4, marginBottom: 24,
  },
  methodBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, gap: 6,
  },
  methodBtnActive: { backgroundColor: colors.navy },
  methodText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  methodTextActive: { color: colors.textWhite },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  phonePrefix: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  phoneDivider: { width: 1, height: 20, backgroundColor: colors.border },
  primaryBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  successSection: { alignItems: 'center', marginTop: 40 },
  successIcon: { marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  successText: { fontSize: 15, color: colors.textLight, textAlign: 'center', marginTop: 8, marginBottom: 32, lineHeight: 22 },
  successValue: { fontWeight: '700', color: colors.textPrimary },
  resendBtn: { flexDirection: 'row', marginTop: 20 },
  resendText: { fontSize: 14, color: colors.textSecondary },
  resendLink: { fontSize: 14, fontWeight: '700', color: colors.navy },
  footer: { alignItems: 'center', paddingVertical: 32 },
  footerLink: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
});
