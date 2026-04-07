import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { showAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { paymentAPI, walletAPI } from '../../services/api';
import WalletPaymentMethodSelector, { PaymentMethod } from '../../components/WalletPaymentMethodSelector';

export default function WalletTopUpScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleContinue = async () => {
    console.log('[WalletTopUp] Continue clicked, amount:', amount);
    const topUpAmount = parseFloat(amount);
    console.log('[WalletTopUp] Parsed amount:', topUpAmount);

    if (!amount || isNaN(topUpAmount)) {
      console.log('[WalletTopUp] Validation failed: Invalid amount');
      showAlert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    if (topUpAmount < 100) {
      console.log('[WalletTopUp] Validation failed: Below minimum');
      showAlert('Invalid Amount', 'Please enter an amount of at least ₦100');
      return;
    }

    if (topUpAmount > 1000000) {
      console.log('[WalletTopUp] Validation failed: Above maximum');
      showAlert('Amount Too Large', 'Maximum top-up amount is ₦1,000,000');
      return;
    }

    console.log('[WalletTopUp] All validations passed, initializing payment...');
    setLoading(true);
    
    try {
      const response = await paymentAPI.initializeWalletTopUp(topUpAmount);
      console.log('[WalletTopUp] Payment initialized:', response);
      setPaymentReference(response.reference);
      setAuthorizationUrl(response.authorizationUrl || '');
      setLoading(false);
      setShowMethodSelector(true);
    } catch (error: any) {
      console.error('[WalletTopUp] Error initializing payment:', error);
      showAlert('Error', error.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handlePaymentMethodSelected = (method: PaymentMethod) => {
    console.log('[WalletTopUp] Payment method selected:', method);
    const topUpAmount = parseFloat(amount);
    
    setShowMethodSelector(false);

    switch (method) {
      case 'card':
        // Navigate to real Paystack payment screen
        console.log('[WalletTopUp] Opening Paystack with URL:', authorizationUrl);
        if (!authorizationUrl) {
          showAlert('Error', 'Payment URL not available. Please try again.');
          return;
        }
        (navigation as any).navigate('PaystackPayment', {
          authorizationUrl: authorizationUrl,
          reference: paymentReference,
          onSuccess: async (paymentData: any) => {
            console.log('[WalletTopUp] Card payment successful, verifying...');
            try {
              const verifyResult = await paymentAPI.verifyWalletTopUp(paymentReference);
              if (verifyResult.success) {
                setAmount('');
                showAlert(
                  'Success!',
                  `₦${topUpAmount.toLocaleString()} has been added to your wallet`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (error: any) {
              console.error('[WalletTopUp] Verification failed:', error);
              showAlert('Error', error.message || 'Payment verification failed');
            }
          },
          onClose: () => {
            console.log('[WalletTopUp] Paystack payment closed');
          },
        });
        break;

      case 'bank_transfer':
        // Navigate to bank transfer screen
        (navigation as any).navigate('BankTransfer', {
          amount: topUpAmount,
          reference: paymentReference,
        });
        setAmount(''); // Clear immediately
        break;

      case 'ussd':
        // Navigate to USSD payment screen
        (navigation as any).navigate('USSDPayment', {
          amount: topUpAmount,
          reference: paymentReference,
        });
        setAmount(''); // Clear immediately
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Top Up Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="wallet" size={32} color={colors.teal} />
          </View>
          <Text style={styles.infoTitle}>Add Money to Your Wallet</Text>
          <Text style={styles.infoText}>
            Top up your wallet to pay for orders instantly without entering card details every time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Enter Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currency}>₦</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quick Amounts</Text>
          <View style={styles.quickAmountsGrid}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  parseFloat(amount) === quickAmount && styles.quickAmountButtonActive,
                ]}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    parseFloat(amount) === quickAmount && styles.quickAmountTextActive,
                  ]}
                >
                  ₦{quickAmount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Benefits of Wallet Payment</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="flash" size={20} color={colors.success} />
            <Text style={styles.benefitText}>Instant payment - no redirect needed</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.benefitText}>Secure and encrypted</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="card" size={20} color={colors.success} />
            <Text style={styles.benefitText}>No need to enter card details every time</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="gift" size={20} color={colors.success} />
            <Text style={styles.benefitText}>Eligible for wallet-exclusive offers</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.topUpButton, loading && styles.topUpButtonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
              <Text style={styles.topUpButtonText}>
                Continue {amount ? `with ₦${parseFloat(amount).toLocaleString()}` : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <WalletPaymentMethodSelector
          visible={showMethodSelector}
          amount={parseFloat(amount) || 0}
          onSelectMethod={handlePaymentMethodSelected}
          onClose={() => setShowMethodSelector(false)}
        />

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={16} color={colors.info} />
          <Text style={styles.securityText}>
            Payments are processed securely via Paystack. Your card details are never stored on our servers.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
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
  infoCard: {
    backgroundColor: colors.tealLight,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.teal,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.teal,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingVertical: 16,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  quickAmountButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  quickAmountTextActive: {
    color: colors.white,
  },
  benefitsSection: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  topUpButtonDisabled: {
    backgroundColor: colors.gray,
  },
  topUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: colors.info,
    lineHeight: 16,
  },
});
