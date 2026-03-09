import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';


const vehicleIcons: Record<string, string> = {
  bicycle: 'bicycle',
  motorcycle: 'speedometer',
  car: 'car',
  van: 'bus',
};

const getStatusColor = (s: string) => {
  switch (s) {
    case 'active': return colors.success;
    case 'pending': return colors.warning;
    case 'suspended': return colors.error;
    default: return colors.textLight;
  }
};

const getDocStatusColor = (s: string) => {
  switch (s) {
    case 'verified': return colors.success;
    case 'uploaded': return colors.info;
    case 'missing': return colors.error;
    case 'expired': return colors.warning;
    default: return colors.textLight;
  }
};

export default function CourierManagementScreen({ navigation }: any) {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCouriers();
  }, []);

  const loadCouriers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCouriers();
      if (res?.data) {
        setCouriers(res.data);
      } else if (Array.isArray(res)) {
        setCouriers(res);
      }
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to load couriers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCouriers();
    setRefreshing(false);
  };

  const filtered = couriers.filter(c => {
    const matchSearch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading couriers...</Text>
      </View>
    );
  }

  const openDetail = (c: any) => { setSelectedCourier(c); setShowDetail(true); };

  const handleApprove = () => {
    if (!selectedCourier) return;
    setCouriers(prev => prev.map(c =>
      c.id === selectedCourier.id
        ? { ...c, status: 'active', documents: c.documents.map((d: any) => d.status === 'uploaded' ? { ...d, status: 'verified' } : d) }
        : c
    ));
    showAlert('Success', `${selectedCourier.firstName} ${selectedCourier.lastName} approved as courier!`);
    setShowDetail(false);
  };

  const handleReject = () => {
    if (!selectedCourier || !rejectReason.trim()) return;
    setCouriers(prev => prev.filter(c => c.id !== selectedCourier.id));
    showAlert('Done', `${selectedCourier.firstName} ${selectedCourier.lastName}'s application rejected.`);
    setShowRejectModal(false);
    setShowDetail(false);
  };

  const handleSuspend = () => {
    if (!selectedCourier) return;
    setCouriers(prev => prev.map(c => c.id === selectedCourier.id ? { ...c, status: 'suspended' } : c));
    showAlert('Done', `${selectedCourier.firstName} ${selectedCourier.lastName} suspended.`);
    setShowDetail(false);
  };

  const handleReactivate = () => {
    if (!selectedCourier) return;
    setCouriers(prev => prev.map(c => c.id === selectedCourier.id ? { ...c, status: 'active' } : c));
    showAlert('Success', `${selectedCourier.firstName} ${selectedCourier.lastName} reactivated.`);
    setShowDetail(false);
  };

  const verifyDoc = (docId: string) => {
    if (!selectedCourier || !selectedCourier.documents) return;
    const updated = { ...selectedCourier, documents: selectedCourier.documents.map((d: any) => d.id === docId ? { ...d, status: 'verified' } : d) };
    setSelectedCourier(updated);
    setCouriers(prev => prev.map(c => c.id === selectedCourier.id ? updated : c));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Couriers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddCourier')}>
          <Ionicons name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{couriers.filter(c => c.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{couriers.filter(c => c.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.error }]}>{couriers.filter(c => c.status === 'suspended').length}</Text>
          <Text style={styles.statLabel}>Suspended</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.teal }]}>{couriers.reduce((s, c) => s + (c.deliveries || 0), 0)}</Text>
          <Text style={styles.statLabel}>Deliveries</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textLight} />
        <TextInput style={styles.searchInput} placeholder="Search couriers..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {['all', 'active', 'pending', 'suspended'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.list} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />
        }
      >
        {filtered.map(courier => (
          <TouchableOpacity key={courier.id} style={styles.courierCard} onPress={() => openDetail(courier)}>
            <View style={styles.courierTop}>
              <View style={styles.courierAvatar}>
                <Ionicons name={(vehicleIcons[courier.vehicleType] || 'bicycle') as any} size={20} color={colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.courierNameRow}>
                  <Text style={styles.courierName}>{courier.firstName} {courier.lastName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(courier.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(courier.status) }]}>{courier.status}</Text>
                  </View>
                </View>
                <Text style={styles.courierMeta}>{courier.vehicleType} · {courier.zone} · {courier.licensePlate}</Text>
              </View>
            </View>

            {courier.status === 'active' && (
              <View style={styles.courierStats}>
                <View style={styles.courierStat}><Ionicons name="star" size={12} color={colors.warning} /><Text style={styles.courierStatText}>{courier.rating || 0}</Text></View>
                <View style={styles.courierStat}><Ionicons name="bicycle" size={12} color={colors.textLight} /><Text style={styles.courierStatText}>{courier.deliveries || 0} trips</Text></View>
                <View style={styles.courierStat}><Ionicons name="cash-outline" size={12} color={colors.textLight} /><Text style={styles.courierStatText}>₦{(courier.earnings || 0).toLocaleString()}</Text></View>
              </View>
            )}

            {courier.status === 'pending' && courier.documents && (
              <View style={styles.pendingInfo}>
                <Ionicons name="document-outline" size={14} color={colors.warning} />
                <Text style={styles.pendingText}>{courier.documents.filter((d: any) => d.status === 'uploaded' || d.status === 'verified').length}/{courier.documents.length} documents submitted</Text>
              </View>
            )}

            <View style={styles.cardFooter}>
              <Text style={styles.joinDate}>Joined {new Date(courier.joined).toLocaleDateString()}</Text>
              <Text style={styles.reviewLink}>{courier.status === 'pending' ? 'Review →' : 'Details →'}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}><Ionicons name="bicycle-outline" size={48} color={colors.textLight} /><Text style={styles.emptyText}>No {filter} couriers</Text></View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={showDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Courier Details</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}><Ionicons name="close" size={24} color={colors.textPrimary} /></TouchableOpacity>
            </View>

            {selectedCourier && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.statusBanner, { backgroundColor: getStatusColor(selectedCourier.status) + '15' }]}>
                  <Ionicons name={(vehicleIcons[selectedCourier.vehicleType] || 'bicycle') as any} size={20} color={getStatusColor(selectedCourier.status)} />
                  <Text style={[styles.statusBannerText, { color: getStatusColor(selectedCourier.status) }]}>
                    {selectedCourier.status === 'active' ? 'Active Courier' : selectedCourier.status === 'pending' ? 'Pending Approval' : 'Suspended'}
                  </Text>
                </View>

                {selectedCourier.suspensionReason && (
                  <View style={styles.suspensionBanner}>
                    <Text style={styles.suspensionLabel}>Suspension Reason:</Text>
                    <Text style={styles.suspensionText}>{selectedCourier.suspensionReason}</Text>
                  </View>
                )}

                {(!selectedCourier.documents || selectedCourier.documents.length === 0) && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoValue}>No documents uploaded yet</Text>
                  </View>
                )}

                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{selectedCourier.firstName} {selectedCourier.lastName}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{selectedCourier.email}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{selectedCourier.phone}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Vehicle</Text><Text style={styles.infoValue}>{selectedCourier.vehicleType}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Plate</Text><Text style={styles.infoValue}>{selectedCourier.licensePlate}</Text></View>
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.infoLabel}>Zone</Text><Text style={styles.infoValue}>{selectedCourier.zone}</Text></View>
                </View>

                {selectedCourier.status === 'active' && (
                  <>
                    <Text style={styles.sectionTitle}>Performance</Text>
                    <View style={styles.perfRow}>
                      <View style={styles.perfCard}><Text style={styles.perfValue}>★ {selectedCourier.rating}</Text><Text style={styles.perfLabel}>Rating</Text></View>
                      <View style={styles.perfCard}><Text style={styles.perfValue}>{selectedCourier.deliveries}</Text><Text style={styles.perfLabel}>Deliveries</Text></View>
                      <View style={styles.perfCard}><Text style={styles.perfValue}>₦{((selectedCourier.earnings || 0) / 1000).toFixed(0)}K</Text><Text style={styles.perfLabel}>Earnings</Text></View>
                    </View>
                  </>
                )}

                {selectedCourier.documents && selectedCourier.documents.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Documents ({selectedCourier.documents.filter((d: any) => d.status === 'verified').length}/{selectedCourier.documents.length} verified)</Text>
                    {selectedCourier.documents.map((doc: any) => (
                      <View key={doc.id} style={styles.docRow}>
                        <View style={[styles.docDot, { backgroundColor: getDocStatusColor(doc.status) }]} />
                        <Text style={styles.docName}>{doc.name}</Text>
                        <View style={[styles.docBadge, { backgroundColor: getDocStatusColor(doc.status) + '15' }]}>
                          <Text style={[styles.docBadgeText, { color: getDocStatusColor(doc.status) }]}>{doc.status}</Text>
                        </View>
                        {doc.status === 'uploaded' && selectedCourier.status === 'pending' && (
                          <TouchableOpacity style={styles.verifyBtn} onPress={() => verifyDoc(doc.id)}>
                            <Text style={styles.verifyBtnText}>Verify</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </>
                )}

                {/* Actions */}
                {selectedCourier.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error }]} onPress={() => { setRejectReason(''); setShowRejectModal(true); }}>
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={handleApprove}>
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedCourier.status === 'active' && (
                  <TouchableOpacity style={[styles.fullActionBtn, { backgroundColor: colors.error + '15' }]} onPress={handleSuspend}>
                    <Ionicons name="ban-outline" size={16} color={colors.error} />
                    <Text style={[styles.fullActionText, { color: colors.error }]}>Suspend Courier</Text>
                  </TouchableOpacity>
                )}
                {selectedCourier.status === 'suspended' && (
                  <TouchableOpacity style={[styles.fullActionBtn, { backgroundColor: colors.success + '15' }]} onPress={handleReactivate}>
                    <Ionicons name="refresh" size={16} color={colors.success} />
                    <Text style={[styles.fullActionText, { color: colors.success }]}>Reactivate Courier</Text>
                  </TouchableOpacity>
                )}

                <View style={{ height: 30 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={showRejectModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '45%' }]}>
            <Text style={styles.modalTitle}>Reject Application</Text>
            <TextInput style={[styles.notesInput, { minHeight: 80 }]} placeholder="Reason for rejection..." placeholderTextColor={colors.textLight} value={rejectReason} onChangeText={setRejectReason} multiline />
            <View style={styles.rejectActions}>
              <TouchableOpacity style={[styles.rejectBtn, { backgroundColor: colors.lightGray }]} onPress={() => setShowRejectModal(false)}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.rejectBtn, { backgroundColor: colors.error, opacity: rejectReason.trim() ? 1 : 0.5 }]} onPress={handleReject} disabled={!rejectReason.trim()}>
                <Text style={{ color: colors.white, fontWeight: '600' }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textLight },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 8, marginTop: 10 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  filterRow: { flexDirection: 'row' as const, paddingHorizontal: 10, gap: 8, paddingVertical: 8 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  list: { flex: 1, paddingHorizontal: 10 },
  courierCard: { backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  courierTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courierAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.navy + '10', justifyContent: 'center', alignItems: 'center' },
  courierNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courierName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' as const },
  courierMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  courierStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  courierStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  courierStatText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  pendingInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  pendingText: { fontSize: 12, color: colors.warning, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  joinDate: { fontSize: 12, color: colors.textLight },
  reviewLink: { fontSize: 13, fontWeight: '600', color: colors.navy },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 16 },
  statusBannerText: { fontSize: 14, fontWeight: '600' },
  suspensionBanner: { backgroundColor: colors.error + '10', padding: 12, borderRadius: 12, marginBottom: 16 },
  suspensionLabel: { fontSize: 12, fontWeight: '700', color: colors.error, marginBottom: 4 },
  suspensionText: { fontSize: 13, color: colors.error, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 16, marginBottom: 8 },
  infoCard: { backgroundColor: colors.lightGray, borderRadius: 12, padding: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.textLight },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  perfRow: { flexDirection: 'row', gap: 8 },
  perfCard: { flex: 1, backgroundColor: colors.lightGray, borderRadius: 12, padding: 12, alignItems: 'center' },
  perfValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  perfLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  docDot: { width: 8, height: 8, borderRadius: 4 },
  docName: { flex: 1, fontSize: 14, color: colors.textPrimary },
  docBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  docBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' as const },
  verifyBtn: { backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  verifyBtnText: { fontSize: 12, fontWeight: '600', color: colors.white },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: colors.white },
  fullActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  fullActionText: { fontSize: 14, fontWeight: '600' },
  notesInput: { backgroundColor: colors.lightGray, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, textAlignVertical: 'top', marginTop: 12 },
  rejectActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  rejectBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});
