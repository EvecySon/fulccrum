import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface WalletBalanceCardProps {
  balance: string;
  currency?: string;
  userName?: string;
  userId?: string;
  onCreditPress?: () => void;
  onDebitPress?: () => void;
  onViewTransactions?: () => void;
  compact?: boolean;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  balance,
  currency = 'NGN',
  userName,
  userId,
  onCreditPress,
  onDebitPress,
  onViewTransactions,
  compact = false,
}) => {
  const formatBalance = (amount: string) => {
    const num = parseFloat(amount);
    return num.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (compact) {
    return (
      <View style={styles.compactCard}>
        <Ionicons name="wallet" size={20} color={colors.teal} />
        <Text style={styles.compactBalance}>
          ₦{formatBalance(balance)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="wallet" size={32} color={colors.teal} />
        </View>
        <View style={styles.headerText}>
          {userName && <Text style={styles.userName}>{userName}</Text>}
          {userId && <Text style={styles.userId}>ID: {userId.slice(0, 8)}...</Text>}
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balance}>₦{formatBalance(balance)}</Text>
        <Text style={styles.currency}>{currency}</Text>
      </View>

      <View style={styles.actions}>
        {onCreditPress && (
          <TouchableOpacity style={[styles.actionButton, styles.creditButton]} onPress={onCreditPress}>
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Credit</Text>
          </TouchableOpacity>
        )}
        
        {onDebitPress && (
          <TouchableOpacity style={[styles.actionButton, styles.debitButton]} onPress={onDebitPress}>
            <Ionicons name="remove-circle" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Debit</Text>
          </TouchableOpacity>
        )}
        
        {onViewTransactions && (
          <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={onViewTransactions}>
            <Ionicons name="list" size={20} color={colors.teal} />
            <Text style={[styles.actionButtonText, { color: colors.teal }]}>History</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userId: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.teal,
  },
  currency: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  creditButton: {
    backgroundColor: colors.success,
  },
  debitButton: {
    backgroundColor: colors.error,
  },
  viewButton: {
    backgroundColor: colors.tealLight,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  compactBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
