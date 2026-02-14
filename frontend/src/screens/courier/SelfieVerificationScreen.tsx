import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierVerificationAPI } from '../../services/api';

type VerificationStatus = 'idle' | 'capturing' | 'uploading' | 'verifying' | 'success' | 'failed';

export default function SelfieVerificationScreen({ navigation, route }: any) {
  const reason = route?.params?.reason || 'periodic';
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the capture ring
  useState(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  });

  const handleCapture = async () => {
    setStatus('capturing');
    // In production, this would use expo-camera
    // For now, simulate a capture with a placeholder
    setTimeout(() => {
      setPhotoUri('https://via.placeholder.com/300x300.png?text=Selfie');
      setStatus('idle');
    }, 800);
  };

  const handleSubmit = async () => {
    if (!photoUri) {
      Alert.alert('Photo Required', 'Please take a selfie first.');
      return;
    }
    setStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('selfie', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as any);

      setStatus('verifying');
      const res = await courierVerificationAPI.submitSelfie(formData);

      if (res?.verified) {
        setStatus('success');
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        setStatus('failed');
        setAttempts(prev => prev + 1);
      }
    } catch {
      setStatus('failed');
      setAttempts(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setPhotoUri(null);
    setStatus('idle');
  };

  const getReasonText = () => {
    switch (reason) {
      case 'periodic': return 'Periodic identity check to keep your account secure.';
      case 'login': return 'Please verify your identity to continue.';
      case 'suspicious': return 'Unusual activity detected. Please verify your identity.';
      default: return 'Quick identity verification required.';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {/* Status Messages */}
        {status === 'success' ? (
          <View style={styles.resultContainer}>
            <View style={[styles.resultIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>
            <Text style={styles.resultTitle}>Verified!</Text>
            <Text style={styles.resultSubtitle}>Your identity has been confirmed. You can continue delivering.</Text>
          </View>
        ) : status === 'failed' ? (
          <View style={styles.resultContainer}>
            <View style={[styles.resultIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="close-circle" size={80} color={colors.error} />
            </View>
            <Text style={styles.resultTitle}>Verification Failed</Text>
            <Text style={styles.resultSubtitle}>
              We couldn't match your selfie. Please try again in good lighting.
              {attempts >= 3 && '\n\nToo many attempts. Contact support if this continues.'}
            </Text>
            {attempts < 5 && (
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Ionicons name="refresh" size={20} color={colors.white} />
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Instructions */}
            <View style={styles.instructions}>
              <Ionicons name="shield-checkmark" size={28} color={colors.teal} />
              <Text style={styles.instructionTitle}>Take a Selfie</Text>
              <Text style={styles.instructionText}>{getReasonText()}</Text>
            </View>

            {/* Camera Preview Area */}
            <View style={styles.cameraArea}>
              <Animated.View style={[styles.cameraRing, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.cameraCircle}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.selfieImage} />
                ) : (
                  <View style={styles.cameraPlaceholder}>
                    <Ionicons name="person" size={64} color={colors.textLight} />
                    <Text style={styles.cameraHint}>Position your face here</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsRow}>
              {[
                { icon: 'sunny-outline', text: 'Good lighting' },
                { icon: 'glasses-outline', text: 'Remove sunglasses' },
                { icon: 'happy-outline', text: 'Face the camera' },
              ].map((tip, i) => (
                <View key={i} style={styles.tipChip}>
                  <Ionicons name={tip.icon as any} size={16} color={colors.teal} />
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {!photoUri ? (
                <TouchableOpacity
                  style={styles.captureBtn}
                  onPress={handleCapture}
                  disabled={status === 'capturing'}
                >
                  {status === 'capturing' ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={24} color={colors.white} />
                      <Text style={styles.captureBtnText}>Take Selfie</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.retakeBtn} onPress={handleRetry}>
                    <Ionicons name="refresh" size={20} color={colors.textSecondary} />
                    <Text style={styles.retakeBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={status === 'uploading' || status === 'verifying'}
                  >
                    {(status === 'uploading' || status === 'verifying') ? (
                      <>
                        <ActivityIndicator color={colors.white} size="small" />
                        <Text style={styles.submitBtnText}>
                          {status === 'uploading' ? 'Uploading...' : 'Verifying...'}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color={colors.white} />
                        <Text style={styles.submitBtnText}>Submit</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Attempt counter */}
            {attempts > 0 && (
              <Text style={styles.attemptText}>Attempt {attempts + 1} of 5</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.navy, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  instructions: { alignItems: 'center', marginBottom: 24 },
  instructionTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 10 },
  instructionText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  cameraArea: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  cameraRing: {
    position: 'absolute', width: 230, height: 230, borderRadius: 115,
    borderWidth: 3, borderColor: colors.teal + '40',
  },
  cameraCircle: {
    width: 220, height: 220, borderRadius: 110, overflow: 'hidden',
    backgroundColor: colors.white, borderWidth: 3, borderColor: colors.teal,
    justifyContent: 'center', alignItems: 'center',
  },
  selfieImage: { width: '100%', height: '100%' },
  cameraPlaceholder: { alignItems: 'center', gap: 8 },
  cameraHint: { fontSize: 12, color: colors.textLight },
  tipsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 30 },
  tipChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.teal + '10', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
  },
  tipText: { fontSize: 11, fontWeight: '600', color: colors.teal },
  actions: { alignItems: 'center' },
  captureBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.teal, paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30,
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  captureBtnText: { fontSize: 17, fontWeight: '700', color: colors.white },
  actionRow: { flexDirection: 'row', gap: 16 },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.white, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24,
    borderWidth: 1, borderColor: colors.border,
  },
  retakeBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.teal, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  attemptText: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 16 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  resultIcon: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  resultSubtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.teal, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 24, marginTop: 24,
  },
  retryText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
