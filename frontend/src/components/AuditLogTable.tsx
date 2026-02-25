import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { WalletTransaction } from '../services/adminWalletAPI';

interface AuditLogTableProps {
  transactions: WalletTransaction[];
  emptyMessage?: string;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  transactions,
  emptyMessage = 'No transactions found',
}) => {
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'credit':
        return { icon: 'arrow-down-circle' as const, color: colors.success, label: 'Credit' };
      case 'debit':
        return { icon: 'arrow-up-circle' as const, color: colors.error, label: 'Debit' };
      case 'order_payment':
        return { icon: 'cart' as const, color: colors.info, label: 'Order Payment' };
      case 'refund':
        return { icon: 'refresh-circle' as const, color: colors.warning, label: 'Refund' };
      case 'withdrawal':
        return { icon: 'cash' as const, color: colors.navy, label: 'Withdrawal' };
      default:
        return { icon: 'help-circle' as const, color: colors.textLight, label: type };
    }
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.dateColumn]}>Date & Time</Text>
          <Text style={[styles.headerCell, styles.typeColumn]}>Type</Text>
          <Text style={[styles.headerCell, styles.amountColumn]}>Amount</Text>
          <Text style={[styles.headerCell, styles.balanceColumn]}>Balance Before</Text>
          <Text style={[styles.headerCell, styles.balanceColumn]}>Balance After</Text>
          <Text style={[styles.headerCell, styles.descriptionColumn]}>Description</Text>
          <Text style={[styles.headerCell, styles.adminColumn]}>Admin</Text>
          <Text style={[styles.headerCell, styles.referenceColumn]}>Reference</Text>
        </View>

        {transactions.map((transaction, index) => {
          const typeConfig = getTypeConfig(transaction.type);
          const isCredit = transaction.type === 'credit' || transaction.type === 'refund';

          return (
            <View
              key={transaction.id}
              style={[styles.row, index % 2 === 0 && styles.rowEven]}
            >
              <Text style={[styles.cell, styles.dateColumn]}>
                {formatDate(transaction.createdAt)}
              </Text>
              
              <View style={[styles.cell, styles.typeColumn, styles.typeCell]}>
                <Ionicons name={typeConfig.icon} size={16} color={typeConfig.color} />
                <Text style={[styles.typeText, { color: typeConfig.color }]}>
                  {typeConfig.label}
                </Text>
              </View>
              
              <Text
                style={[
                  styles.cell,
                  styles.amountColumn,
                  styles.amountText,
                  { color: isCredit ? colors.success : colors.error },
                ]}
              >
                {isCredit ? '+' : '-'}₦{formatAmount(transaction.amount)}
              </Text>
              
              <Text style={[styles.cell, styles.balanceColumn]}>
                ₦{formatAmount(transaction.balanceBefore)}
              </Text>
              
              <Text style={[styles.cell, styles.balanceColumn]}>
                ₦{formatAmount(transaction.balanceAfter)}
              </Text>
              
              <Text style={[styles.cell, styles.descriptionColumn]} numberOfLines={2}>
                {transaction.description}
              </Text>
              
              <Text style={[styles.cell, styles.adminColumn]}>
                {transaction.adminName || '-'}
              </Text>
              
              <Text style={[styles.cell, styles.referenceColumn]} numberOfLines={1}>
                {transaction.reference || '-'}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  table: {
    minWidth: 1200,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowEven: {
    backgroundColor: colors.lightGray,
  },
  cell: {
    fontSize: 13,
    color: colors.textPrimary,
    paddingHorizontal: 8,
  },
  dateColumn: {
    width: 160,
  },
  typeColumn: {
    width: 140,
  },
  typeCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountColumn: {
    width: 120,
  },
  amountText: {
    fontWeight: '700',
  },
  balanceColumn: {
    width: 130,
  },
  descriptionColumn: {
    width: 250,
  },
  adminColumn: {
    width: 150,
  },
  referenceColumn: {
    width: 150,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
  },
});
