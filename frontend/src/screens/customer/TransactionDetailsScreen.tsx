import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';

interface TransactionDetail {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: string;
  category: string;
  reference: string;
  balanceBefore: number;
  balanceAfter: number;
  recipient?: {
    name: string;
    identifier: string;
  };
  sender?: {
    name: string;
    identifier: string;
  };
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    restaurantName?: string;
    note?: string;
  };
}

export default function TransactionDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionId } = route.params as { transactionId: string };

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionDetails();
  }, []);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get<TransactionDetail>(`/wallet/transactions/${transactionId}`);
      setTransaction(response);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      Alert.alert('Error', 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!transaction) return;

    const message = `
Transaction Receipt
-------------------
Reference: ${transaction.reference}
Type: ${transaction.type === 'credit' ? 'Money Received' : 'Money Sent'}
Amount: ₦${transaction.amount.toLocaleString()}
Date: ${new Date(transaction.date).toLocaleString()}
Status: ${transaction.status}
Description: ${transaction.description}
    `.trim();

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDispute = () => {
    if (!transaction) return;

    Alert.alert(
      'Report Issue',
      'Do you want to report an issue with this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            (navigation as any).navigate('Support', {
              initialTab: 'contact',
              subject: `Transaction Issue - ${transaction.reference}`,
              message: `I have an issue with transaction ${transaction.reference} dated ${new Date(
                transaction.date
              ).toLocaleDateString()}`,
            });
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string, category: string) => {
    if (category === 'order') return 'restaurant';
    if (category === 'topup') return 'add-circle';
    if (category === 'withdrawal') return 'arrow-down-circle';
    if (category === 'transfer') return type === 'credit' ? 'arrow-down' : 'arrow-up';
    if (category === 'refund') return 'refresh';
    if (category === 'referral') return 'gift';
    return 'cash';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Transaction Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Transaction not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  transaction.type === 'credit'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
              },
            ]}
          >
            <Ionicons
              name={getTypeIcon(transaction.type, transaction.category)}
              size={40}
              color={transaction.type === 'credit' ? colors.success : colors.error}
            />
          </View>
          <Text
            style={[
              styles.amount,
              { color: transaction.type === 'credit' ? colors.success : colors.error },
            ]}
          >
            {transaction.type === 'credit' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.description}>{transaction.description}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{transaction.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Transaction Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reference</Text>
            <Text style={styles.infoValue}>{transaction.reference}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoValue}>{formatDate(transaction.date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{transaction.category}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {transaction.type === 'credit' ? 'Money Received' : 'Money Sent'}
            </Text>
          </View>
        </View>

        {/* Recipient/Sender Info */}
        {transaction.recipient && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipient</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{transaction.recipient.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{transaction.recipient.identifier}</Text>
            </View>
          </View>
        )}

        {transaction.sender && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sender</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{transaction.sender.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{transaction.sender.identifier}</Text>
            </View>
          </View>
        )}

        {/* Order Info */}
        {transaction.metadata?.orderId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Number</Text>
              <Text style={styles.infoValue}>{transaction.metadata.orderNumber || 'N/A'}</Text>
            </View>
            {transaction.metadata.restaurantName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Restaurant</Text>
                <Text style={styles.infoValue}>{transaction.metadata.restaurantName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Note */}
        {transaction.metadata?.note && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note</Text>
            <Text style={styles.noteText}>{transaction.metadata.note}</Text>
          </View>
        )}

        {/* Balance Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Before</Text>
            <Text style={styles.infoValue}>{formatCurrency(transaction.balanceBefore)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>After</Text>
            <Text style={styles.infoValue}>{formatCurrency(transaction.balanceAfter)}</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.disputeButton} onPress={handleDispute}>
          <Ionicons name="flag-outline" size={20} color={colors.error} />
          <Text style={styles.disputeButtonText}>Report an Issue</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
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
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountCard: {
    backgroundColor: colors.white,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  section: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  noteText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  disputeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  disputeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});
