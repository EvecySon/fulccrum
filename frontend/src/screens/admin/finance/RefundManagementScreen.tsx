import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { colors } from '../../../theme/colors';
import { financeAPI } from '../../../services/api';

export default function RefundManagementScreen() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadRefunds();
  }, [filter]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getRefunds(filter === 'all' ? undefined : filter);
      setRefunds(response.data.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (refundId: string) => {
    Alert.alert(
      'Approve Refund',
      'Are you sure you want to approve this refund?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await financeAPI.approveRefund(refundId);
              Alert.alert('Success', 'Refund approved successfully');
              loadRefunds();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to approve refund');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      await financeAPI.rejectRefund(selectedRefund.id, rejectReason);
      Alert.alert('Success', 'Refund rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRefund(null);
      loadRefunds();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject refund');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Refund Management</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.filterButtonActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.refundsList}>
        {refunds.map((refund) => (
          <View key={refund.id} style={styles.refundCard}>
            <View style={styles.refundHeader}>
              <View>
                <Text style={styles.refundOrderNumber}>{refund.order.orderNumber}</Text>
                <Text style={styles.refundCustomer}>
                  {refund.order.customer.firstName} {refund.order.customer.lastName}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(refund.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(refund.status) }]}>
                  {refund.status}
                </Text>
              </View>
            </View>

            <View style={styles.refundDetails}>
              <View style={styles.refundDetail}>
                <Text style={styles.refundDetailLabel}>Amount:</Text>
                <Text style={styles.refundDetailValue}>₦{refund.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.refundDetail}>
                <Text style={styles.refundDetailLabel}>Type:</Text>
                <Text style={styles.refundDetailValue}>{refund.type}</Text>
              </View>
              <View style={styles.refundDetail}>
                <Text style={styles.refundDetailLabel}>Business:</Text>
                <Text style={styles.refundDetailValue}>{refund.order.business.businessName}</Text>
              </View>
            </View>

            <Text style={styles.refundReason}>Reason: {refund.reason}</Text>

            {refund.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(refund.id)}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => {
                    setSelectedRefund(refund);
                    setShowRejectModal(true);
                  }}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {refund.rejectionReason && (
              <Text style={styles.rejectionReason}>Rejection Reason: {refund.rejectionReason}</Text>
            )}
          </View>
        ))}

        {refunds.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No refunds found</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showRejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Refund</Text>
            <Text style={styles.modalSubtitle}>Please provide a reason for rejection:</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter rejection reason"
              multiline
              numberOfLines={4}
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRefund(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleReject}
              >
                <Text style={styles.modalConfirmButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  filterText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
  },
  refundsList: {
    flex: 1,
    padding: 16,
  },
  refundCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  refundOrderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  refundCustomer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  refundDetails: {
    marginBottom: 12,
  },
  refundDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refundDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  refundDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  refundReason: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  rejectionReason: {
    fontSize: 12,
    color: colors.error,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.gray,
  },
  modalConfirmButton: {
    backgroundColor: colors.error,
  },
  modalCancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
