import React, { useState, useRef, useEffect } from 'react';
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

export default function OTPVerificationScreen({ navigation, route }: any) {
  const { email, phone, mode, role } = route?.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) text = text[text.length - 1];
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyOTP(code, email);
      // Route based on mode and role
      if (mode === 'reset') {
        navigation.navigate('ResetPassword', { email, resetToken: code });
      } else if (role === 'business_owner') {
        navigation.navigate('MerchantBusinessSetup', { role, email });
      } else if (role === 'driver') {
        navigation.navigate('CourierDocumentSetup', { role, email });
      } else {
        navigation.navigate('Login');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    try {
      await authAPI.resendOTP(email);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  const destination = email || phone || 'your account';

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

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={36} color={colors.teal} />
          </View>
        </View>

        <Text style={styles.title}>Verify Your Account</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.destination}>{destination}</Text>
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <Text style={styles.primaryBtnText}>Verify</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendSection}>
          {countdown > 0 ? (
            <Text style={styles.resendTimer}>
              Resend code in <Text style={styles.resendTimerBold}>{countdown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Help */}
        <View style={styles.helpSection}>
          <View style={styles.helpCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={styles.helpText}>
              Check your {email ? 'inbox and spam folder' : 'messages'} for the verification code.
              The code expires in 10 minutes.
            </Text>
          </View>
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
    width: 80, height: 80, borderRadius: 24, backgroundColor: colors.teal + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  subtitle: {
    fontSize: 15, color: colors.textLight, textAlign: 'center',
    marginTop: 8, marginBottom: 32, lineHeight: 22,
  },
  destination: { fontWeight: '700', color: colors.textPrimary },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  otpRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 32,
  },
  otpInput: {
    width: 50, height: 56, borderRadius: 14, backgroundColor: colors.lightGray,
    borderWidth: 2, borderColor: colors.border,
    fontSize: 22, fontWeight: '700', color: colors.textPrimary, textAlign: 'center',
  },
  otpInputFilled: { borderColor: colors.navy, backgroundColor: colors.navy + '08' },
  primaryBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  resendSection: { alignItems: 'center', marginTop: 24 },
  resendTimer: { fontSize: 14, color: colors.textLight },
  resendTimerBold: { fontWeight: '700', color: colors.textPrimary },
  resendLink: { fontSize: 15, fontWeight: '700', color: colors.navy },
  helpSection: { marginTop: 32 },
  helpCard: {
    flexDirection: 'row', gap: 10, backgroundColor: colors.info + '08',
    borderRadius: 14, padding: 14,
  },
  helpText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});
