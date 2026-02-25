import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface PaymentMethodSelectorProps {
  selectedMethod: 'card' | 'wallet';
  onSelectMethod: (method: 'card' | 'wallet') => void;
  walletBalance?: number;
  orderTotal: number;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  walletBalance = 0,
  orderTotal,
}: PaymentMethodSelectorProps) {
  const hasInsufficientBalance = walletBalance < orderTotal;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method</Text>

      <TouchableOpacity
        style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
        onPress={() => onSelectMethod('card')}
      >
        <View style={styles.methodIcon}>
          <Ionicons name="card" size={24} color={selectedMethod === 'card' ? colors.teal : colors.textSecondary} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodTitle, selectedMethod === 'card' && styles.methodTitleActive]}>
            Pay with Card
          </Text>
          <Text style={styles.methodDescription}>Secure payment via Paystack</Text>
        </View>
        {selectedMethod === 'card' && (
          <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.methodCard,
          selectedMethod === 'wallet' && styles.methodCardActive,
          hasInsufficientBalance && styles.methodCardDisabled,
        ]}
        onPress={() => !hasInsufficientBalance && onSelectMethod('wallet')}
        disabled={hasInsufficientBalance}
      >
        <View style={styles.methodIcon}>
          <Ionicons
            name="wallet"
            size={24}
            color={hasInsufficientBalance ? colors.textLight : selectedMethod === 'wallet' ? colors.teal : colors.textSecondary}
          />
        </View>
        <View style={styles.methodInfo}>
          <View style={styles.methodTitleRow}>
            <Text style={[styles.methodTitle, selectedMethod === 'wallet' && styles.methodTitleActive]}>
              Pay with Wallet
            </Text>
            {!hasInsufficientBalance && (
              <View style={styles.instantBadge}>
                <Ionicons name="flash" size={12} color={colors.success} />
                <Text style={styles.instantText}>Instant</Text>
              </View>
            )}
          </View>
          <Text style={styles.methodDescription}>
            Balance: ₦{walletBalance.toLocaleString()}
          </Text>
          {hasInsufficientBalance && (
            <Text style={styles.insufficientText}>
              Insufficient balance (Need ₦{(orderTotal - walletBalance).toLocaleString()} more)
            </Text>
          )}
        </View>
        {selectedMethod === 'wallet' && !hasInsufficientBalance && (
          <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
        )}
      </TouchableOpacity>

      {hasInsufficientBalance && (
        <View style={styles.topUpHint}>
          <Ionicons name="information-circle" size={16} color={colors.info} />
          <Text style={styles.topUpText}>
            Top up your wallet to use wallet payment
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  methodCardActive: {
    borderColor: colors.teal,
    backgroundColor: colors.tealLight,
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  methodTitleActive: {
    color: colors.teal,
  },
  methodDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  instantText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  insufficientText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  topUpHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  topUpText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
  },
});
