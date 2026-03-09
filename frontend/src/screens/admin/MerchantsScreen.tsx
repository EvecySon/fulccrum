import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';

const filters = ['All', 'Active', 'Pending', 'Suspended'];

export default function MerchantsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getMerchants();
      if (res?.data) {
        setMerchants(res.data);
      } else if (Array.isArray(res)) {
        setMerchants(res);
      } else {
        setMerchants([]);
      }
    } catch (e: any) {
      console.error('Failed to load merchants:', e);
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMerchants();
    setRefreshing(false);
  };

  const filtered = merchants.filter((m) => {
    const matchesSearch = m.businessName?.toLowerCase().includes(search.toLowerCase()) || 
                         m.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                         m.user?.email?.toLowerCase().includes(search.toLowerCase());
    
    // Map filter labels to actual verificationStatus values
    let matchesFilter = true;
    if (activeFilter === 'Active') {
      matchesFilter = m.verificationStatus === 'verified' || m.verificationStatus === 'active';
    } else if (activeFilter === 'Pending') {
      matchesFilter = m.verificationStatus === 'pending';
    } else if (activeFilter === 'Suspended') {
      matchesFilter = m.verificationStatus === 'suspended' || m.verificationStatus === 'rejected';
    }
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading merchants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchants</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{merchants.length} total</Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />
        }
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{merchants.filter(m => m.verificationStatus === 'verified' || m.verificationStatus === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{merchants.filter(m => m.verificationStatus === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.error }]}>{merchants.filter(m => m.verificationStatus === 'suspended' || m.verificationStatus === 'rejected').length}</Text>
            <Text style={styles.statLabel}>Suspended</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.teal }]}>₦0K</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search merchants..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Merchant Cards */}
        <View style={styles.list}>
          {filtered.map((merchant) => (
            <TouchableOpacity key={merchant.id} style={styles.merchantCard}>
              <View style={styles.merchantTop}>
                <View style={styles.merchantAvatar}>
                  <Ionicons name="storefront" size={20} color={colors.navy} />
                </View>
                <View style={styles.merchantInfo}>
                  <View style={styles.merchantNameRow}>
                    <Text style={styles.merchantName}>{merchant.businessName}</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: (merchant.verificationStatus === 'verified' || merchant.verificationStatus === 'active') ? colors.success + '15' :
                        merchant.verificationStatus === 'pending' ? colors.warning + '15' : colors.error + '15'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: (merchant.verificationStatus === 'verified' || merchant.verificationStatus === 'active') ? colors.success :
                          merchant.verificationStatus === 'pending' ? colors.warning : colors.error
                      }]}>{merchant.verificationStatus}</Text>
                    </View>
                  </View>
                  <Text style={styles.merchantOwner}>{merchant.user?.firstName} {merchant.user?.lastName} · {merchant.businessType}</Text>
                </View>
              </View>

              {(merchant.verificationStatus === 'verified' || merchant.verificationStatus === 'active') && (
                <View style={styles.merchantStats}>
                  <View style={styles.merchantStat}>
                    <Ionicons name="star" size={12} color={colors.warning} />
                    <Text style={styles.merchantStatText}>{parseFloat(merchant.rating || 0).toFixed(1)}</Text>
                  </View>
                  <View style={styles.merchantStat}>
                    <Ionicons name="location-outline" size={12} color={colors.textLight} />
                    <Text style={styles.merchantStatText}>{merchant.city || 'N/A'}</Text>
                  </View>
                  <View style={styles.merchantStat}>
                    <Ionicons name="call-outline" size={12} color={colors.textLight} />
                    <Text style={styles.merchantStatText}>{merchant.phone || merchant.user?.phone || 'N/A'}</Text>
                  </View>
                </View>
              )}

              <View style={styles.merchantActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedMerchant(merchant); setShowDetail(true); }}>
                  <Ionicons name="eye-outline" size={16} color={colors.navy} />
                  <Text style={styles.actionBtnText}>View</Text>
                </TouchableOpacity>
                {merchant.verificationStatus === 'pending' && (
                  <>
                    <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={async () => { 
                      try {
                        await adminAPI.approveMerchant(merchant.userId);
                        setMerchants(prev => prev.map(m => m.userId === merchant.userId ? { ...m, verificationStatus: 'verified' } : m)); 
                        showAlert('Success', `${merchant.businessName} approved`);
                      } catch (e: any) {
                        showAlert('Error', e?.message || 'Failed to approve merchant');
                      }
                    }}>
                      <Ionicons name="checkmark" size={16} color={colors.textWhite} />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={async () => { 
                      try {
                        await adminAPI.rejectMerchant(merchant.userId);
                        setMerchants(prev => prev.filter(m => m.userId !== merchant.userId)); 
                        showAlert('Done', `${merchant.businessName} rejected and removed`);
                      } catch (e: any) {
                        showAlert('Error', e?.message || 'Failed to reject merchant');
                      }
                    }}>
                      <Ionicons name="close" size={16} color={colors.error} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                {merchant.status === 'active' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => showAlert('Edit', `Editing ${merchant.name} — commission: ${merchant.commission}%`)}>
                    <Ionicons name="create-outline" size={16} color={colors.teal} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                )}
                {merchant.status === 'suspended' && (
                  <TouchableOpacity style={[styles.actionBtn, styles.reactivateBtn]} onPress={() => { setMerchants(prev => prev.map(m => m.id === merchant.id ? { ...m, status: 'active' } : m)); showAlert('Success', `${merchant.name} reactivated`); }}>
                    <Ionicons name="refresh" size={16} color={colors.success} />
                    <Text style={styles.reactivateBtnText}>Reactivate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Merchant Detail Modal */}
      <Modal visible={showDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Merchant Details</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedMerchant && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.statusBanner, { 
                  backgroundColor: (selectedMerchant.verificationStatus === 'verified' || selectedMerchant.verificationStatus === 'active') ? colors.success + '15' :
                    selectedMerchant.verificationStatus === 'pending' ? colors.warning + '15' : colors.error + '15'
                }]}>
                  <Ionicons name="storefront" size={20} color={
                    (selectedMerchant.verificationStatus === 'verified' || selectedMerchant.verificationStatus === 'active') ? colors.success :
                    selectedMerchant.verificationStatus === 'pending' ? colors.warning : colors.error
                  } />
                  <Text style={[styles.statusBannerText, { 
                    color: (selectedMerchant.verificationStatus === 'verified' || selectedMerchant.verificationStatus === 'active') ? colors.success :
                      selectedMerchant.verificationStatus === 'pending' ? colors.warning : colors.error
                  }]}>
                    {selectedMerchant.verificationStatus === 'verified' || selectedMerchant.verificationStatus === 'active' ? 'Verified Merchant' : 
                     selectedMerchant.verificationStatus === 'pending' ? 'Pending Approval' : 'Rejected/Suspended'}
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>Business Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Business Name</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.businessName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Business Type</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.businessType}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Owner</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.user?.firstName} {selectedMerchant.user?.lastName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.user?.email || selectedMerchant.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.phone || selectedMerchant.user?.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.address || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>City</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.city || 'N/A'}</Text>
                  </View>
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.infoLabel}>State</Text>
                    <Text style={styles.infoValue}>{selectedMerchant.state || 'N/A'}</Text>
                  </View>
                </View>

                {(selectedMerchant.verificationStatus === 'verified' || selectedMerchant.verificationStatus === 'active') && (
                  <>
                    <Text style={styles.sectionTitle}>Performance</Text>
                    <View style={styles.perfRow}>
                      <View style={styles.perfCard}>
                        <Text style={styles.perfValue}>★ {parseFloat(selectedMerchant.rating || 0).toFixed(1)}</Text>
                        <Text style={styles.perfLabel}>Rating</Text>
                      </View>
                      <View style={styles.perfCard}>
                        <Text style={styles.perfValue}>{selectedMerchant.deliveryRadius || 5}km</Text>
                        <Text style={styles.perfLabel}>Radius</Text>
                      </View>
                      <View style={styles.perfCard}>
                        <Text style={styles.perfValue}>{selectedMerchant.isOpen ? 'Open' : 'Closed'}</Text>
                        <Text style={styles.perfLabel}>Status</Text>
                      </View>
                    </View>
                  </>
                )}

                {selectedMerchant.description && (
                  <>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoValue}>{selectedMerchant.description}</Text>
                    </View>
                  </>
                )}

                <View style={styles.modalActions}>
                  {selectedMerchant.verificationStatus === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        style={[styles.modalActionBtn, { backgroundColor: colors.error }]} 
                        onPress={async () => {
                          try {
                            await adminAPI.rejectMerchant(selectedMerchant.userId);
                            setMerchants(prev => prev.filter(m => m.userId !== selectedMerchant.userId));
                            setShowDetail(false);
                            showAlert('Done', `${selectedMerchant.businessName} rejected`);
                          } catch (e: any) {
                            showAlert('Error', e?.message || 'Failed to reject merchant');
                          }
                        }}
                      >
                        <Text style={styles.modalActionBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.modalActionBtn, { backgroundColor: colors.success }]} 
                        onPress={async () => {
                          try {
                            await adminAPI.approveMerchant(selectedMerchant.userId);
                            setMerchants(prev => prev.map(m => m.userId === selectedMerchant.userId ? { ...m, verificationStatus: 'verified' } : m));
                            setShowDetail(false);
                            showAlert('Success', `${selectedMerchant.businessName} approved`);
                          } catch (e: any) {
                            showAlert('Error', e?.message || 'Failed to approve merchant');
                          }
                        }}
                      >
                        <Text style={styles.modalActionBtnText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={{ height: 30 }} />
              </ScrollView>
            )}
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  headerBadge: { backgroundColor: colors.navy + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  headerBadgeText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 8, marginTop: 10 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 10,
    marginTop: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  filterWrapper: { height: 50, marginTop: 4 },
  filterRow: { paddingHorizontal: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignSelf: 'center',
  },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  list: { paddingHorizontal: 10 },
  merchantCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  merchantTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  merchantAvatar: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  merchantInfo: { flex: 1 },
  merchantNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  merchantName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  merchantOwner: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  merchantStats: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  merchantStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  merchantStatText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  merchantActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: colors.lightGray, gap: 4,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  approveBtn: { backgroundColor: colors.teal },
  approveBtnText: { fontSize: 13, fontWeight: '600', color: colors.textWhite },
  rejectBtn: { backgroundColor: colors.error + '10' },
  rejectBtnText: { fontSize: 13, fontWeight: '600', color: colors.error },
  editBtn: { backgroundColor: colors.teal + '10' },
  editBtnText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  reactivateBtn: { backgroundColor: colors.success + '10' },
  reactivateBtnText: { fontSize: 13, fontWeight: '600', color: colors.success },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.lightGray,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  perfRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
  },
  perfCard: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  perfValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  perfLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  modalActions: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalActionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
