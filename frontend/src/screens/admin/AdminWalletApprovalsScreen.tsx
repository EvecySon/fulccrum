import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminWalletAPI, PendingApproval } from '../../services/adminWalletAPI';

export default function AdminWalletApprovalsScreen({ navigation }: any) {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const data = await adminWalletAPI.getPendingApprovals();
      setApprovals(data);
    } catch (error) {
      console.error('Error loading approvals:', error);
      Alert.alert('Error', 'Failed to load pending approvals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadApprovals();
  };

  const handleApprove = (approval: PendingApproval) => {
    Alert.alert(
      'Approve Transaction',
      `Approve ₦${approval.amount.toLocaleString()} credit to ${approval.userName}?\n\nRequested by: ${approval.requestedByName}\nReason: ${approval.reason}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await adminWalletAPI.approveCredit(approval.id);
              Alert.alert('Success', 'Transaction approved successfully');
              loadApprovals();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve transaction');
            }
          },
        },
      ]
    );
  };

  const handleReject = (approval: PendingApproval) => {
    Alert.prompt(
      'Reject Transaction',
      `Reject ₦${approval.amount.toLocaleString()} credit to ${approval.userName}?\n\nPlease provide a reason:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason?: string) => {
            if (!reason?.trim()) {
              Alert.alert('Error', 'Please provide a reason for rejection');
              return;
            }
            try {
              await adminWalletAPI.rejectCredit(approval.id, reason);
              Alert.alert('Success', 'Transaction rejected');
              loadApprovals();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject transaction');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Pending Approvals</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Loading approvals...</Text>
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
        <Text style={styles.title}>Pending Approvals</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{approvals.length}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {approvals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={64} color={colors.success} />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptyText}>No pending approvals at this time</Text>
          </View>
        ) : (
          approvals.map((approval) => (
            <View key={approval.id} style={styles.approvalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.userIcon}>
                  <Ionicons name="person" size={24} color={colors.teal} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.userName}>{approval.userName}</Text>
                  <Text style={styles.requestedBy}>
                    Requested by {approval.requestedByName}
                  </Text>
                </View>
                <View style={styles.amountBadge}>
                  <Text style={styles.amountText}>₦{approval.amount.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="document-text" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Reason:</Text>
                  <Text style={styles.infoValue}>{approval.reason}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Requested:</Text>
                  <Text style={styles.infoValue}>{formatDate(approval.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(approval)}
                >
                  <Ionicons name="close-circle" size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(approval)}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  approvalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  requestedBy: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amountBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  cardBody: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
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
  rejectButton: {
    backgroundColor: colors.error,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
