import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminWalletAPI } from '../../services/adminWalletAPI';

export default function AdminCreditWalletScreen({ route, navigation }: any) {
  const { userId, userName, currentBalance, isDebit = false } = route.params;
  
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for this transaction');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `${isDebit ? 'Debit' : 'Credit'} ₦${parseFloat(amount).toLocaleString()} ${isDebit ? 'from' : 'to'} ${userName}?\n\nReason: ${reason}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              const data = {
                userId,
                amount: parseFloat(amount),
                reason,
                reference: reference || undefined,
              };

              const response = isDebit
                ? await adminWalletAPI.debitWallet(data)
                : await adminWalletAPI.creditWallet(data);

              if (response.requiresApproval) {
                Alert.alert(
                  'Approval Required',
                  `This transaction exceeds your credit limit and requires approval from a higher authority.\n\nRequest ID: ${response.approvalRequest?.id}`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert(
                  'Success',
                  `Successfully ${isDebit ? 'debited' : 'credited'} ₦${parseFloat(amount).toLocaleString()} ${isDebit ? 'from' : 'to'} ${userName}`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to process transaction');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const quickAmounts = [1000, 5000, 10000, 20000, 50000];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isDebit ? 'Debit' : 'Credit'} Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.userIcon}>
            <Ionicons name="person" size={32} color={colors.teal} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.currentBalance}>
              Current Balance: ₦{parseFloat(currentBalance || '0').toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount (₦)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
          />
          
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>₦{quickAmount.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reason *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={reason}
            onChangeText={setReason}
            placeholder="e.g., Compensation for late delivery - Order #FUL-2026-123"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reference (Optional)</Text>
          <TextInput
            style={styles.input}
            value={reference}
            onChangeText={setReference}
            placeholder="e.g., COMP-2026-001"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {amount && parseFloat(amount) > 0 && (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Transaction Preview</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>Type:</Text>
              <Text style={[styles.previewValue, { color: isDebit ? colors.error : colors.success }]}>
                {isDebit ? 'Debit' : 'Credit'}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>Amount:</Text>
              <Text style={[styles.previewValue, { color: isDebit ? colors.error : colors.success }]}>
                {isDebit ? '-' : '+'}₦{parseFloat(amount).toLocaleString()}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>Current Balance:</Text>
              <Text style={styles.previewValue}>₦{parseFloat(currentBalance || '0').toLocaleString()}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewKey}>New Balance:</Text>
              <Text style={[styles.previewValue, styles.newBalance]}>
                ₦{(parseFloat(currentBalance || '0') + (isDebit ? -1 : 1) * parseFloat(amount)).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name={isDebit ? 'remove-circle' : 'add-circle'} size={20} color={colors.white} />
              <Text style={styles.submitButtonText}>
                {isDebit ? 'Debit' : 'Credit'} Wallet
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            Transactions exceeding your credit limit will require approval from a higher authority.
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  currentBalance: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
  previewCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  previewKey: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  newBalance: {
    fontSize: 16,
    color: colors.teal,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
    lineHeight: 18,
  },
});
