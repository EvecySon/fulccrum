import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { paymentAPI, walletAPI } from '../../services/api';

export default function WalletTopUpScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount);
    
    if (!topUpAmount || topUpAmount < 100) {
      Alert.alert('Invalid Amount', 'Please enter an amount of at least ₦100');
      return;
    }

    if (topUpAmount > 1000000) {
      Alert.alert('Amount Too Large', 'Maximum top-up amount is ₦1,000,000');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentAPI.initializeWalletTopUp(topUpAmount);
      
      if (response.authorizationUrl) {
        // Open Paystack payment page
        const supported = await Linking.canOpenURL(response.authorizationUrl);
        if (supported) {
          await Linking.openURL(response.authorizationUrl);
          
          // Show instructions
          Alert.alert(
            'Complete Payment',
            'You will be redirected to Paystack to complete your payment. After payment, your wallet will be credited automatically.',
            [
              {
                text: 'I\'ve Completed Payment',
                onPress: async () => {
                  // Verify payment
                  try {
                    const verifyResult = await paymentAPI.verifyWalletTopUp(response.reference);
                    if (verifyResult.success) {
                      Alert.alert(
                        'Success!',
                        `₦${topUpAmount.toLocaleString()} has been added to your wallet`,
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                      );
                    } else {
                      Alert.alert('Payment Pending', 'Your payment is being processed. Please check back shortly.');
                    }
                  } catch (error: any) {
                    Alert.alert('Verification Failed', error.message || 'Could not verify payment. Please contact support if money was deducted.');
                  }
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
        } else {
          Alert.alert('Error', 'Cannot open payment page');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
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
          onPress={handleTopUp}
          disabled={loading || !amount || parseFloat(amount) < 100}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color={colors.white} />
              <Text style={styles.topUpButtonText}>
                Top Up {amount ? `₦${parseFloat(amount).toLocaleString()}` : 'Wallet'}
              </Text>
            </>
          )}
        </TouchableOpacity>

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
