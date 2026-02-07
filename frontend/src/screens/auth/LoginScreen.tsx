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

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    // TODO: Replace with real API call
    setTimeout(() => {
      setLoading(false);
      // navigation will be handled by auth context
    }, 1500);
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
        {/* Logo / Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="flash" size={32} color={colors.textWhite} />
            </View>
          </View>
          <Text style={styles.brandName}>Fulccrum</Text>
          <Text style={styles.brandTagline}>Delivery at your fingertips</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Sign in to your account</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email or Phone</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email or phone"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-google" size={22} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-apple" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-facebook" size={22} color="#4267B2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  brandSection: { alignItems: 'center', marginTop: 80, marginBottom: 40 },
  logoContainer: { marginBottom: 16 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: colors.navy,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  brandName: { fontSize: 28, fontWeight: '800', color: colors.navy, letterSpacing: -0.5 },
  brandTagline: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  formSection: { flex: 1 },
  formTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  formSubtitle: { fontSize: 15, color: colors.textLight, marginTop: 4, marginBottom: 24 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: '600', color: colors.teal },
  loginBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.textLight, marginHorizontal: 12 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialBtn: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 32 },
  footerText: { fontSize: 15, color: colors.textSecondary },
  footerLink: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
