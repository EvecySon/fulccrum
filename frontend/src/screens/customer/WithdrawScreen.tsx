import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  isDefault: boolean;
}

export default function WithdrawScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const quickAmounts = [5000, 10000, 20000, 50000];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balanceRes, accountsRes] = await Promise.all([
        api.get<{ availableBalance: number }>('/wallet/balance'),
        api.get<BankAccount[]>('/wallet/bank-accounts'),
      ]);

      setAvailableBalance(balanceRes.availableBalance || 0);
      setBankAccounts(accountsRes || []);
      
      // Auto-select default account
      const defaultAccount = (accountsRes || []).find((acc) => acc.isDefault);
      if (defaultAccount) {
        setSelectedAccount(defaultAccount.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load withdrawal data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount < 1000) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal amount is ₦1,000');
      return;
    }

    if (withdrawAmount > availableBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance to withdraw this amount');
      return;
    }

    if (!selectedAccount) {
      Alert.alert('Select Bank Account', 'Please select a bank account to withdraw to');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post<{ requestId: string; message: string }>(
        '/wallet/withdraw/request',
        { amount: withdrawAmount, bankAccountId: selectedAccount }
      );

      setRequestId(response.requestId);
      setShowConfirmation(true);
      Alert.alert(
        'Confirmation Code Sent',
        'A confirmation code has been sent to your email and phone. Please enter it to complete the withdrawal.'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to request withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmWithdrawal = async () => {
    if (!confirmationCode || confirmationCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit confirmation code');
      return;
    }

    if (!requestId) {
      Alert.alert('Error', 'No withdrawal request found');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/wallet/withdraw/confirm', {
        requestId,
        confirmationCode,
      });

      Alert.alert(
        'Withdrawal Successful',
        'Your withdrawal request has been submitted. Funds will be transferred within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to confirm withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (showConfirmation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowConfirmation(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Confirm Withdrawal</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.confirmationCard}>
            <Ionicons name="mail-outline" size={48} color={colors.teal} />
            <Text style={styles.confirmationTitle}>Enter Confirmation Code</Text>
            <Text style={styles.confirmationText}>
              We've sent a 6-digit code to your email and phone number
            </Text>

            <TextInput
              style={styles.codeInput}
              value={confirmationCode}
              onChangeText={setConfirmationCode}
              placeholder="000000"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
              onPress={handleConfirmWithdrawal}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Withdrawal</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowConfirmation(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Withdraw Funds</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(availableBalance)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Withdrawal Amount</Text>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Withdraw To</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('BankAccounts')}>
              <Text style={styles.manageLink}>Manage Accounts</Text>
            </TouchableOpacity>
          </View>

          {bankAccounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No bank accounts added</Text>
              <TouchableOpacity
                style={styles.addAccountButton}
                onPress={() => (navigation as any).navigate('BankAccounts')}
              >
                <Text style={styles.addAccountText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bankAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountCard,
                  selectedAccount === account.id && styles.accountCardSelected,
                ]}
                onPress={() => setSelectedAccount(account.id)}
              >
                <View style={styles.accountIcon}>
                  <Ionicons name="card" size={24} color={colors.teal} />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{account.accountName}</Text>
                  <Text style={styles.accountNumber}>
                    {account.bankName} • {account.accountNumber}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    selectedAccount === account.id && styles.radioOuterSelected,
                  ]}
                >
                  {selectedAccount === account.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            • Minimum withdrawal: ₦1,000{'\n'}
            • Processing time: 24 hours{'\n'}
            • No withdrawal fees
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.withdrawButton, submitting && styles.withdrawButtonDisabled]}
          onPress={handleWithdraw}
          disabled={submitting || !amount || parseFloat(amount) < 1000 || !selectedAccount}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="arrow-down-circle" size={20} color={colors.white} />
              <Text style={styles.withdrawButtonText}>
                Withdraw {amount ? formatCurrency(parseFloat(amount)) : 'Funds'}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  balanceCard: {
    backgroundColor: colors.teal,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  manageLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
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
    minWidth: '45%',
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
  emptyState: {
    backgroundColor: colors.white,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 20,
  },
  addAccountButton: {
    backgroundColor: colors.teal,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addAccountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  accountCardSelected: {
    borderColor: colors.teal,
    backgroundColor: '#f0fdfa',
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.teal,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.teal,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.info,
    lineHeight: 18,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  withdrawButtonDisabled: {
    backgroundColor: colors.gray,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  confirmationCard: {
    backgroundColor: colors.white,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  codeInput: {
    width: '100%',
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: colors.teal,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    letterSpacing: 8,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
