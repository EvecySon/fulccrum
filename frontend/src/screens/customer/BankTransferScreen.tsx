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

export default function BankTransferScreen({ route, navigation }: any) {
  const { amount, reference } = route.params;
  const [loading, setLoading] = useState(true);
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: '',
    bankName: '',
    accountName: '',
  });
  // Phase-based state management
  type Phase = 'idle' | 'checking' | 'timeout' | 'success' | 'failed';
  const [phase, setPhase] = useState<Phase>('idle');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef<Phase>('idle');
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [retryCount, setRetryCount] = useState(0);
  const POLL_INTERVAL = 5000; // 5 seconds
  const INITIAL_COUNTDOWN = 180; // 3 minutes

  // Keep phaseRef in sync with phase state
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    fetchAccountDetails();
    
    // Cleanup on unmount
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const fetchAccountDetails = async () => {
    try {
      console.log('[BankTransfer] Fetching virtual account details...');
      const account = await paymentAPI.getVirtualAccount();
      
      setAccountDetails({
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        accountName: account.accountName,
      });
      setLoading(false);
      console.log('[BankTransfer] Virtual account loaded:', account.accountNumber);
    } catch (error: any) {
      console.error('[BankTransfer] Error fetching account details:', error);
      showAlert('Error', 'Failed to load account details. Please try again.');
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    showAlert('Copied!', `${label} copied to clipboard`);
  };

  // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkPaymentStatus = async () => {
    // Safeguard: Don't poll if not in checking phase (use ref for current value)
    if (phaseRef.current !== 'checking') {
      return;
    }

    try {
      console.log('[BankTransfer] Checking payment status...');
      const result = await paymentAPI.checkPaymentStatus(reference);
      
      console.log('[BankTransfer] Payment status:', result.status);
      
      if (result.status === 'success') {
        // Payment confirmed!
        stopAllTimers();
        setPhase('success');
        
        // Show success briefly then navigate
        setTimeout(() => {
          showAlert(
            'Payment Confirmed! 🎉',
            `₦${result.amount.toLocaleString()} has been added to your wallet.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }, 500);
      } else if (result.status === 'failed') {
        // Payment failed
        stopAllTimers();
        setPhase('failed');
      }
      // If pending, continue polling (timer will handle timeout)
    } catch (error: any) {
      console.error('[BankTransfer] Error checking payment status:', error);
      // Don't stop on error, continue polling
    }
  };

  const startCountdown = () => {
    setTimeRemaining(INITIAL_COUNTDOWN);
    
    const countdown = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Countdown finished — clear everything using refs
          clearInterval(countdown);
          countdownRef.current = null;
          
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          
          console.log('[BankTransfer] Timeout reached, all timers stopped');
          setPhase('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownRef.current = countdown;
  };

  const startPolling = () => {
    console.log('[BankTransfer] Starting payment verification...');
    
    // Clear any leftover timers first
    stopAllTimers();
    
    setPhase('checking');
    setRetryCount(prev => prev + 1);
    
    // Start countdown timer
    startCountdown();
    
    // Check immediately
    checkPaymentStatus();
    
    // Then check every 5 seconds
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
    console.log('[BankTransfer] User clicked Check Again');
    startPolling();
  };

  const handleIllWait = () => {
    console.log('[BankTransfer] User chose to wait for webhook');
    showAlert(
      'Got it!',
      'Your wallet will be credited automatically once we receive your transfer. This usually takes 5-10 minutes.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleComplete = () => {
    console.log('[BankTransfer] User confirmed transfer');
    startPolling();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Getting your account details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Bank Transfer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Transfer</Text>
          <Text style={styles.amountValue}>₦{amount.toLocaleString()}</Text>
          <Text style={styles.amountNote}>
            Transfer exactly this amount for automatic credit
          </Text>
        </View>

        <View style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <Text style={styles.instructionTitle}>How to Complete Payment</Text>
          </View>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Open your bank app or use USSD
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Transfer to the account details below
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Your wallet will be credited automatically
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Transfer To:</Text>

          {/* Account Number */}
          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Account Number</Text>
              <Text style={styles.detailValue}>{accountDetails.accountNumber}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(accountDetails.accountNumber, 'Account number')}
            >
              <Ionicons name="copy-outline" size={20} color={colors.teal} />
            </TouchableOpacity>
          </View>

          {/* Bank Name */}
          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Bank Name</Text>
              <Text style={styles.detailValue}>{accountDetails.bankName}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(accountDetails.bankName, 'Bank name')}
            >
              <Ionicons name="copy-outline" size={20} color={colors.teal} />
            </TouchableOpacity>
          </View>

          {/* Account Name */}
          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Account Name</Text>
              <Text style={styles.detailValue}>{accountDetails.accountName}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(accountDetails.accountName, 'Account name')}
            >
              <Ionicons name="copy-outline" size={20} color={colors.teal} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#F57C00" />
          <Text style={styles.warningText}>
            This account is unique to you. Only transfer from your own bank account.
          </Text>
        </View>

        {/* Phase: Checking */}
        {phase === 'checking' && (
          <View style={styles.checkingCard}>
            <View style={styles.checkingHeader}>
              <ActivityIndicator size="small" color={colors.teal} />
              <Text style={styles.checkingTitle}>Checking for payment...</Text>
            </View>
            <Text style={styles.checkingText}>
              We're checking if your transfer has been received. This usually takes a few seconds.
            </Text>
            <View style={styles.countdownContainer}>
              <Ionicons name="time-outline" size={20} color={colors.teal} />
              <Text style={styles.countdownText}>
                ⏱️ {formatTime(timeRemaining)} remaining
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
              The transfer was not successful. Please try again or contact support.
            </Text>
          </View>
        )}

        {/* Phase: Timeout */}
        {phase === 'timeout' && (
          <View style={styles.timeoutCard}>
            <Ionicons name="information-circle" size={48} color={colors.info} />
            <Text style={styles.timeoutTitle}>Payment Not Detected Yet</Text>
            <Text style={styles.timeoutText}>
              Bank transfers can take 5-10 minutes to process. Your wallet will be credited automatically once we receive the payment.
            </Text>
            <Text style={styles.timeoutSubtext}>
              You can check again or wait for automatic crediting via webhook.
            </Text>
          </View>
        )}

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Why Bank Transfer?</Text>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.benefitText}>No card details needed</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.benefitText}>Automatic wallet credit</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.benefitText}>Works with any Nigerian bank</Text>
          </View>
          <View style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.benefitText}>Usually credited within 5 minutes</Text>
          </View>
        </View>

        {/* Buttons based on phase */}
        {phase === 'idle' && (
          <>
            <TouchableOpacity 
              style={styles.completeButton} 
              onPress={handleComplete}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.completeButtonText}>I've Made the Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancel</Text>
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
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={handleCheckAgain}
            >
              <Ionicons name="refresh" size={20} color={colors.white} />
              <Text style={styles.retryButtonText}>Check Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.waitButton} 
              onPress={handleIllWait}
            >
              <Ionicons name="time-outline" size={20} color={colors.teal} />
              <Text style={styles.waitButtonText}>I'll Wait</Text>
            </TouchableOpacity>
          </View>
        )}

        {(phase === 'failed' || phase === 'success') && (
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.completeButtonText}>Close</Text>
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
    backgroundColor: colors.teal,
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
    marginBottom: 8,
  },
  amountNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: '#E3F2FD',
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
    backgroundColor: colors.info,
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
  detailsCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  copyButton: {
    padding: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
  },
  // Checking phase styles
  checkingCard: {
    backgroundColor: '#E0F2F1',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  checkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkingText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.teal,
  },
  retryText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  // Success phase styles
  successCard: {
    backgroundColor: '#E8F5E9',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
    marginTop: 12,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Failed phase styles
  failedCard: {
    backgroundColor: '#FFEBEE',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  failedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.error,
    marginTop: 12,
    marginBottom: 8,
  },
  failedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Timeout phase styles
  timeoutCard: {
    backgroundColor: '#E3F2FD',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  timeoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.info,
    marginTop: 12,
    marginBottom: 8,
  },
  timeoutText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  timeoutSubtext: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
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
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  completeButtonDisabled: {
    backgroundColor: colors.gray,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.error,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
  },
  timeoutButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  waitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.teal,
  },
  waitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.teal,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
