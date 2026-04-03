import React, { useState } from 'react';
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

export default function SendMoneyScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recipientType, setRecipientType] = useState<'phone' | 'email'>('phone');

  const quickAmounts = [1000, 2000, 5000, 10000];

  React.useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ availableBalance: number }>('/wallet/balance');
      setAvailableBalance(response.availableBalance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      Alert.alert('Error', 'Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };

  const validateRecipient = () => {
    if (!recipient.trim()) {
      Alert.alert('Required', 'Please enter recipient phone or email');
      return false;
    }

    if (recipientType === 'phone') {
      // Nigerian phone number validation (10 digits without country code)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(recipient.trim())) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
        return false;
      }
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleSendMoney = async () => {
    const sendAmount = parseFloat(amount);

    if (!sendAmount || sendAmount < 100) {
      Alert.alert('Invalid Amount', 'Minimum transfer amount is ₦100');
      return;
    }

    if (sendAmount > availableBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance to send this amount');
      return;
    }

    if (!validateRecipient()) {
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Send ₦${sendAmount.toLocaleString()} to ${recipient}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSubmitting(true);
            try {
              await api.post('/wallet/transfer', {
                amount: sendAmount,
                recipientIdentifier: recipient.trim(),
                recipientType,
                note: note.trim() || undefined,
              });

              Alert.alert(
                'Transfer Successful',
                `₦${sendAmount.toLocaleString()} has been sent to ${recipient}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error: any) {
              Alert.alert('Transfer Failed', error.message || 'Could not complete transfer');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Send Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(availableBalance)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Recipient</Text>
          <View style={styles.recipientTypeToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, recipientType === 'phone' && styles.toggleButtonActive]}
              onPress={() => setRecipientType('phone')}
            >
              <Ionicons
                name="call"
                size={18}
                color={recipientType === 'phone' ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  recipientType === 'phone' && styles.toggleTextActive,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, recipientType === 'email' && styles.toggleButtonActive]}
              onPress={() => setRecipientType('email')}
            >
              <Ionicons
                name="mail"
                size={18}
                color={recipientType === 'email' ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  recipientType === 'email' && styles.toggleTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder={
              recipientType === 'phone' ? 'Enter phone number (e.g., 0801234567)' : 'Enter email address'
            }
            placeholderTextColor={colors.textLight}
            keyboardType={recipientType === 'phone' ? 'phone-pad' : 'email-address'}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currency}>₦</Text>
            <TextInput
              style={styles.amountInput}
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
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note for the recipient"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            • Minimum transfer: ₦100{'\n'}
            • Instant transfer{'\n'}
            • No transfer fees{'\n'}
            • Recipient must have a Fulccrum account
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, submitting && styles.sendButtonDisabled]}
          onPress={handleSendMoney}
          disabled={submitting || !amount || parseFloat(amount) < 100 || !recipient}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="arrow-up-circle" size={20} color={colors.white} />
              <Text style={styles.sendButtonText}>
                Send {amount ? formatCurrency(parseFloat(amount)) : 'Money'}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  recipientTypeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.teal,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  noteInput: {
    minHeight: 80,
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
  amountInput: {
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
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
