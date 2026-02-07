import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { supportAPI, ordersAPI } from '../../services/api';

type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

interface Dispute {
  id: string;
  orderId: string;
  customerName: string;
  merchantName: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  amount: number;
  createdAt: string;
}

const statusColors: Record<DisputeStatus, string> = {
  open: colors.error,
  investigating: colors.warning,
  resolved: colors.success,
  closed: colors.textLight,
};

const statusLabels: Record<DisputeStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function DisputeResolutionScreen({ navigation }: any) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DisputeStatus | 'all'>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const response = await supportAPI.getTickets({ type: 'dispute' });
      const items = response.data || response.tickets || response || [];
      setDisputes(Array.isArray(items) ? items : []);
    } catch (err) {
      // Fallback to mock data if API not available
      setDisputes([
        {
          id: 'DSP-001', orderId: 'ORD-3421', customerName: 'Adebayo Johnson',
          merchantName: 'Mama\'s Kitchen', reason: 'Missing items',
          description: 'Customer reports 2 items missing from order. Jollof rice and plantain were not included.',
          status: 'open', amount: 4500, createdAt: '2026-02-07T10:30:00Z',
        },
        {
          id: 'DSP-002', orderId: 'ORD-3398', customerName: 'Chioma Okafor',
          merchantName: 'Burger House', reason: 'Wrong order',
          description: 'Customer received completely wrong order. Got chicken burger instead of veggie burger.',
          status: 'investigating', amount: 3200, createdAt: '2026-02-06T15:45:00Z',
        },
        {
          id: 'DSP-003', orderId: 'ORD-3350', customerName: 'Emeka Nwosu',
          merchantName: 'Pizza Palace', reason: 'Late delivery',
          description: 'Order arrived 45 minutes late. Food was cold.',
          status: 'resolved', amount: 2800, createdAt: '2026-02-05T12:00:00Z',
        },
        {
          id: 'DSP-004', orderId: 'ORD-3290', customerName: 'Fatima Bello',
          merchantName: 'Suya Spot', reason: 'Quality issue',
          description: 'Food quality was poor. Suya was undercooked.',
          status: 'closed', amount: 1500, createdAt: '2026-02-04T18:20:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = filter === 'all'
    ? disputes
    : disputes.filter(d => d.status === filter);

  const openResolveModal = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setRefundAmount(dispute.amount.toString());
    setResolution('');
    setModalVisible(true);
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution.trim()) {
      Alert.alert('Error', 'Please enter a resolution note');
      return;
    }
    setResolving(true);
    try {
      await supportAPI.updateStatus(selectedDispute.id, 'resolved', {
        resolution,
        refundAmount: parseFloat(refundAmount) || 0,
      });
      setDisputes(prev =>
        prev.map(d => d.id === selectedDispute.id ? { ...d, status: 'resolved' as DisputeStatus } : d)
      );
      setModalVisible(false);
      Alert.alert('Success', 'Dispute resolved successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderDispute = ({ item }: { item: Dispute }) => (
    <TouchableOpacity
      style={styles.disputeCard}
      onPress={() => openResolveModal(item)}
    >
      <View style={styles.disputeHeader}>
        <View style={styles.disputeIdRow}>
          <Text style={styles.disputeId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] }]} />
            <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
              {statusLabels[item.status]}
            </Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
      </View>

      <Text style={styles.disputeReason}>{item.reason}</Text>
      <Text style={styles.disputeDesc} numberOfLines={2}>{item.description}</Text>

      <View style={styles.disputeFooter}>
        <View style={styles.disputeParty}>
          <Ionicons name="person-outline" size={14} color={colors.textLight} />
          <Text style={styles.partyText}>{item.customerName}</Text>
        </View>
        <View style={styles.disputeParty}>
          <Ionicons name="storefront-outline" size={14} color={colors.textLight} />
          <Text style={styles.partyText}>{item.merchantName}</Text>
        </View>
        <Text style={styles.disputeAmount}>₦{item.amount.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const filters: { key: DisputeStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'investigating', label: 'Investigating' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Resolution</Text>
        <TouchableOpacity onPress={loadDisputes}>
          <Ionicons name="refresh" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.error + '10' }]}>
          <Text style={[styles.statNum, { color: colors.error }]}>
            {disputes.filter(d => d.status === 'open').length}
          </Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.warning + '10' }]}>
          <Text style={[styles.statNum, { color: colors.warning }]}>
            {disputes.filter(d => d.status === 'investigating').length}
          </Text>
          <Text style={styles.statLabel}>Investigating</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.success + '10' }]}>
          <Text style={[styles.statNum, { color: colors.success }]}>
            {disputes.filter(d => d.status === 'resolved').length}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <FlatList
          data={filteredDisputes}
          keyExtractor={(item) => item.id}
          renderItem={renderDispute}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No disputes found</Text>
            </View>
          }
        />
      )}

      {/* Resolve Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Resolve Dispute</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedDispute && (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Dispute: {selectedDispute.id}</Text>
                  <Text style={styles.modalInfoLabel}>Order: {selectedDispute.orderId}</Text>
                  <Text style={styles.modalInfoLabel}>Reason: {selectedDispute.reason}</Text>
                </View>

                <Text style={styles.inputLabel}>Refund Amount (₦)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={refundAmount}
                  onChangeText={setRefundAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                />

                <Text style={styles.inputLabel}>Resolution Notes *</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={resolution}
                  onChangeText={setResolution}
                  placeholder="Describe the resolution..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.resolveBtn, resolving && { opacity: 0.7 }]}
                    onPress={handleResolve}
                    disabled={resolving}
                  >
                    {resolving ? (
                      <ActivityIndicator color={colors.textWhite} size="small" />
                    ) : (
                      <Text style={styles.resolveBtnText}>Resolve & Refund</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.white,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  statsRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: colors.white,
  },
  statCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center',
  },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.textLight, marginTop: 2 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  disputeCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  disputeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  disputeIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  disputeId: { fontSize: 14, fontWeight: '700', color: colors.navy },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  timeAgo: { fontSize: 12, color: colors.textLight },
  disputeReason: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  disputeDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  disputeFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  disputeParty: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  partyText: { fontSize: 12, color: colors.textLight },
  disputeAmount: { marginLeft: 'auto', fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: colors.textLight, marginTop: 12 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  modalInfo: {
    backgroundColor: colors.lightGray, borderRadius: 12, padding: 14, marginBottom: 20, gap: 4,
  },
  modalInfoLabel: { fontSize: 13, color: colors.textSecondary },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  modalInput: {
    backgroundColor: colors.lightGray, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight,
    marginBottom: 16,
  },
  textArea: { minHeight: 100, paddingTop: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  resolveBtn: {
    flex: 2, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    backgroundColor: colors.teal,
  },
  resolveBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
});
