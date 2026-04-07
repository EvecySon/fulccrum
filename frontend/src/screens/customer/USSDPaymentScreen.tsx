import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { showAlert } from '../../utils/alert';
import { paymentAPI } from '../../services/api';

export default function USSDPaymentScreen({ route, navigation }: any) {
  const { amount, reference } = route.params;
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  // Phase-based state management
  type Phase = 'idle' | 'checking' | 'timeout' | 'success' | 'failed';
  const [phase, setPhase] = useState<Phase>('idle');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef<Phase>('idle');
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [retryCount, setRetryCount] = useState(0);
  const POLL_INTERVAL = 5000;
  const INITIAL_COUNTDOWN = 180;

  const ussdCodes = [
    { bank: 'GTBank', code: '*737*000*amount#', icon: '🏦', color: '#FF6B00' },
    { bank: 'Access Bank', code: '*901*000*amount#', icon: '🏦', color: '#F37021' },
    { bank: 'Zenith Bank', code: '*966*000*amount#', icon: '🏦', color: '#E2001A' },
    { bank: 'UBA', code: '*919*000*amount#', icon: '🏦', color: '#D4002A' },
    { bank: 'First Bank', code: '*894*000*amount#', icon: '🏦', color: '#003366' },
    { bank: 'Stanbic IBTC', code: '*909*000*amount#', icon: '🏦', color: '#0033A1' },
  ];

  // Keep phaseRef in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    console.log('[USSD] Screen loaded with amount:', amount, 'reference:', reference);
    setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const getUSSDCode = (baseCode: string) => {
    return baseCode.replace('amount', amount.toString());
  };

  const copyCode = (code: string, bankName: string) => {
    console.log('[USSD] Copying code:', code, 'for bank:', bankName);
    Clipboard.setString(code);
    showAlert('Copied!', `${bankName} USSD code copied. Dial it from your phone.`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkPaymentStatus = async () => {
    if (phaseRef.current !== 'checking') return;

    try {
      console.log('[USSD] Checking payment status...');
      const result = await paymentAPI.checkPaymentStatus(reference);
      console.log('[USSD] Payment status:', result.status);

      if (result.status === 'success') {
        stopAllTimers();
        setPhase('success');
        setTimeout(() => {
          showAlert(
            'Payment Confirmed! \uD83C\uDF89',
            `\u20A6${result.amount.toLocaleString()} has been added to your wallet.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }, 500);
      } else if (result.status === 'failed') {
        stopAllTimers();
        setPhase('failed');
      }
    } catch (error: any) {
      console.error('[USSD] Error checking payment status:', error);
    }
  };

  const startCountdown = () => {
    setTimeRemaining(INITIAL_COUNTDOWN);
    const countdown = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          countdownRef.current = null;
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          console.log('[USSD] Timeout reached, all timers stopped');
          setPhase('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    countdownRef.current = countdown;
  };

  const startPolling = () => {
    console.log('[USSD] Starting payment verification...');
    stopAllTimers();
    setPhase('checking');
    setRetryCount(prev => prev + 1);
    startCountdown();
    checkPaymentStatus();
    const interval = setInterval(checkPaymentStatus, POLL_INTERVAL);
    pollingRef.current = interval;
  };

  const stopAllTimers = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const handleCheckAgain = () => {
    console.log('[USSD] User clicked Check Again');
    startPolling();
  };

  const handleIllWait = () => {
    console.log('[USSD] User chose to wait for webhook');
    showAlert(
      'Got it!',
      'Your wallet will be credited automatically once we receive your payment. This usually takes 5-10 minutes.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleComplete = () => {
    console.log('[USSD] User confirmed USSD payment');
    startPolling();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Generating USSD codes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>USSD Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₦{amount.toLocaleString()}</Text>
        </View>

        <View style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <Text style={styles.instructionTitle}>How USSD Payment Works</Text>
          </View>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Select your bank below</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Dial the USSD code from your phone</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Follow prompts and enter your PIN</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Wallet credited instantly!</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Your Bank</Text>

        <View style={styles.banksList}>
          {ussdCodes.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.bankCard,
                selectedBank === item.bank && styles.bankCardSelected,
              ]}
              onPress={() => setSelectedBank(item.bank)}
            >
              <View style={styles.bankHeader}>
                <View style={[styles.bankIcon, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.bankIconText}>{item.icon}</Text>
                </View>
                <View style={styles.bankInfo}>
                  <Text style={styles.bankName}>{item.bank}</Text>
                  <Text style={styles.ussdCode}>{getUSSDCode(item.code)}</Text>
                </View>
              </View>

              {selectedBank === item.bank && (
                <View style={styles.bankActions}>
                  <TouchableOpacity
                    style={styles.copyCodeButton}
                    onPress={() => copyCode(getUSSDCode(item.code), item.bank)}
                  >
                    <Ionicons name="copy-outline" size={18} color={colors.white} />
                    <Text style={styles.copyCodeText}>Copy Code</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Phase: Checking */}
        {phase === 'checking' && (
          <View style={styles.checkingCard}>
            <View style={styles.checkingHeader}>
              <ActivityIndicator size="small" color={colors.teal} />
              <Text style={styles.checkingTitle}>Checking for payment...</Text>
            </View>
            <Text style={styles.checkingText}>
              We're checking if your USSD payment has been received.
            </Text>
            <View style={styles.countdownContainer}>
              <Ionicons name="time-outline" size={20} color={colors.teal} />
              <Text style={styles.countdownText}>
                {formatTime(timeRemaining)} remaining
              </Text>
            </View>
            {retryCount > 1 && (
              <Text style={styles.retryText}>Retry attempt {retryCount}</Text>
            )}
          </View>
        )}

        {/* Phase: Success */}
        {phase === 'success' && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.successTitle}>Payment Confirmed!</Text>
            <Text style={styles.successText}>
              Your wallet is being credited now...
            </Text>
          </View>
        )}

        {/* Phase: Failed */}
        {phase === 'failed' && (
          <View style={styles.failedCard}>
            <Ionicons name="close-circle" size={48} color={colors.error} />
            <Text style={styles.failedTitle}>Payment Not Found</Text>
            <Text style={styles.failedText}>
              The USSD payment was not successful. Please try again or contact support.
            </Text>
          </View>
        )}

        {/* Phase: Timeout */}
        {phase === 'timeout' && (
          <View style={styles.timeoutCard}>
            <Ionicons name="information-circle" size={48} color={colors.info} />
            <Text style={styles.timeoutTitle}>Payment Not Detected Yet</Text>
            <Text style={styles.timeoutText}>
              USSD payments can take a few minutes to process. Your wallet will be credited automatically once we receive the payment.
            </Text>
          </View>
        )}

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Why Use USSD?</Text>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.benefitText}>No internet connection needed</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.benefitText}>No card details required</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.benefitText}>Instant wallet credit</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.benefitText}>Works on any phone</Text>
          </View>
        </View>

        {/* Buttons based on phase */}
        {phase === 'idle' && selectedBank && (
          <>
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.completeButtonText}>I've Completed Payment</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'checking' && (
          <TouchableOpacity 
            style={styles.stopButton} 
            onPress={() => {
              stopAllTimers();
              setPhase('idle');
            }}
          >
            <Ionicons name="stop-circle-outline" size={20} color={colors.error} />
            <Text style={styles.stopButtonText}>Stop Checking</Text>
          </TouchableOpacity>
        )}

        {phase === 'timeout' && (
          <View style={styles.timeoutButtons}>
            <TouchableOpacity style={styles.retryButton} onPress={handleCheckAgain}>
              <Ionicons name="refresh" size={20} color={colors.white} />
              <Text style={styles.retryButtonText}>Check Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waitButton} onPress={handleIllWait}>
              <Ionicons name="time-outline" size={20} color={colors.teal} />
              <Text style={styles.waitButtonText}>I'll Wait</Text>
            </TouchableOpacity>
          </View>
        )}

        {(phase === 'failed' || phase === 'success') && (
          <TouchableOpacity style={styles.completeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.completeButtonText}>Close</Text>
          </TouchableOpacity>
        )}

        {phase === 'idle' && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountCard: {
    backgroundColor: '#9C27B0',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
  },
  instructionsCard: {
    backgroundColor: '#F3E5F5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  steps: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  banksList: {
    gap: 12,
    marginBottom: 20,
  },
  bankCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  bankCardSelected: {
    borderColor: colors.teal,
    backgroundColor: '#f0fdfa',
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankIconText: {
    fontSize: 24,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ussdCode: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
    fontFamily: 'monospace',
  },
  bankActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  copyCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  copyCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  benefitsCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkingCard: { backgroundColor: '#E0F2F1', padding: 20, borderRadius: 16, marginBottom: 20 },
  checkingHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  checkingTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  checkingText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  countdownContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, padding: 12, borderRadius: 8, marginBottom: 8 },
  countdownText: { fontSize: 16, fontWeight: '700', color: colors.teal },
  retryText: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
  successCard: { backgroundColor: '#E8F5E9', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 20, fontWeight: '700', color: colors.success, marginTop: 12, marginBottom: 8 },
  successText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  failedCard: { backgroundColor: '#FFEBEE', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  failedTitle: { fontSize: 20, fontWeight: '700', color: colors.error, marginTop: 12, marginBottom: 8 },
  failedText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  timeoutCard: { backgroundColor: '#E3F2FD', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  timeoutTitle: { fontSize: 18, fontWeight: '700', color: colors.info, marginTop: 12, marginBottom: 8 },
  timeoutText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  completeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.teal, paddingVertical: 16, borderRadius: 12, gap: 8, marginBottom: 12 },
  completeButtonText: { fontSize: 16, fontWeight: '700', color: colors.white },
  stopButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, paddingVertical: 16, borderRadius: 12, gap: 8, marginBottom: 12, borderWidth: 2, borderColor: colors.error },
  stopButtonText: { fontSize: 16, fontWeight: '700', color: colors.error },
  timeoutButtons: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  retryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.teal, paddingVertical: 16, borderRadius: 12, gap: 8 },
  retryButtonText: { fontSize: 16, fontWeight: '700', color: colors.white },
  waitButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, paddingVertical: 16, borderRadius: 12, gap: 8, borderWidth: 2, borderColor: colors.teal },
  waitButtonText: { fontSize: 16, fontWeight: '700', color: colors.teal },
  cancelButton: { paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  cancelText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
});
