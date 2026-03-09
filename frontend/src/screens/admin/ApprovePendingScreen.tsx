import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';

type PendingItem = {
  id: string;
  type: 'merchant' | 'courier';
  name: string;
  owner?: string;
  email: string;
  phone?: string;
  businessType?: string;
  vehicleType?: string;
  appliedDate: string;
  data: any;
};

export default function ApprovePendingScreen({ navigation }: any) {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'merchant' | 'courier'>('all');

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      setLoading(true);
      const [merchantsRes, couriersRes] = await Promise.all([
        adminAPI.getPendingMerchants().catch(() => ({ data: [] })),
        adminAPI.getPendingCouriers().catch(() => ({ data: [] })),
      ]);

      const pendingMerchants: PendingItem[] = (merchantsRes?.data || []).map((m: any) => ({
        id: m.userId,
        type: 'merchant' as const,
        name: m.businessName,
        owner: `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim(),
        email: m.user?.email || m.email,
        phone: m.phone || m.user?.phone,
        businessType: m.businessType,
        appliedDate: new Date(m.createdAt).toLocaleDateString(),
        data: m,
      }));

      const pendingCouriers: PendingItem[] = (couriersRes?.data || []).map((c: any) => ({
        id: c.id,
        type: 'courier' as const,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
        email: c.email,
        phone: c.phone,
        vehicleType: c.driverProfile?.vehicleType,
        appliedDate: new Date(c.createdAt).toLocaleDateString(),
        data: c,
      }));

      setItems([...pendingMerchants, ...pendingCouriers].sort((a, b) => 
        new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
      ));
    } catch (e: any) {
      console.error('Failed to load pending items:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPending();
    setRefreshing(false);
  };

  const handleApprove = async (item: PendingItem) => {
    try {
      if (item.type === 'merchant') {
        await adminAPI.approveMerchant(item.id);
      } else {
        await adminAPI.approveCourier(item.id);
      }
      setItems(prev => prev.filter(i => i.id !== item.id));
      showAlert('Success', `${item.name} approved successfully`);
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to approve');
    }
  };

  const handleReject = async (item: PendingItem) => {
    try {
      if (item.type === 'merchant') {
        await adminAPI.rejectMerchant(item.id);
      } else {
        await adminAPI.rejectCourier(item.id, 'Application rejected');
      }
      setItems(prev => prev.filter(i => i.id !== item.id));
      showAlert('Done', `${item.name} rejected`);
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to reject');
    }
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading pending applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approve Pending</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{items.length} total</Text>
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
            <Text style={[styles.statValue, { color: colors.navy }]}>{items.filter(i => i.type === 'merchant').length}</Text>
            <Text style={styles.statLabel}>Merchants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.teal }]}>{items.filter(i => i.type === 'courier').length}</Text>
            <Text style={styles.statLabel}>Couriers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{items.length}</Text>
            <Text style={styles.statLabel}>Total Pending</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['all', 'merchant', 'courier'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === 'all' ? 'All' : f === 'merchant' ? 'Merchants' : 'Couriers'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pending Items */}
        <View style={styles.list}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View style={[styles.itemAvatar, { backgroundColor: item.type === 'merchant' ? colors.navy + '15' : colors.teal + '15' }]}>
                  <Ionicons 
                    name={item.type === 'merchant' ? 'storefront' : 'bicycle'} 
                    size={20} 
                    color={item.type === 'merchant' ? colors.navy : colors.teal} 
                  />
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemNameRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: item.type === 'merchant' ? colors.navy + '15' : colors.teal + '15' }]}>
                      <Text style={[styles.typeText, { color: item.type === 'merchant' ? colors.navy : colors.teal }]}>
                        {item.type}
                      </Text>
                    </View>
                  </View>
                  {item.owner && <Text style={styles.itemMeta}>Owner: {item.owner}</Text>}
                  <Text style={styles.itemMeta}>
                    {item.type === 'merchant' ? item.businessType : item.vehicleType} · Applied {item.appliedDate}
                  </Text>
                  <Text style={styles.itemContact}>{item.email} · {item.phone || 'No phone'}</Text>
                </View>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => {
                    const details = item.type === 'merchant' 
                      ? `Business: ${item.name}\nOwner: ${item.owner}\nType: ${item.businessType}\nEmail: ${item.email}\nPhone: ${item.phone}\nApplied: ${item.appliedDate}`
                      : `Name: ${item.name}\nVehicle: ${item.vehicleType}\nEmail: ${item.email}\nPhone: ${item.phone}\nApplied: ${item.appliedDate}`;
                    showAlert('Application Details', details);
                  }}
                >
                  <Ionicons name="eye-outline" size={16} color={colors.navy} />
                  <Text style={styles.actionBtnText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.approveBtn]} 
                  onPress={() => handleApprove(item)}
                >
                  <Ionicons name="checkmark" size={16} color={colors.textWhite} />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.rejectBtn]} 
                  onPress={() => handleReject(item)}
                >
                  <Ionicons name="close" size={16} color={colors.error} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredItems.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyText}>No pending applications</Text>
              <Text style={styles.emptySubtext}>All caught up! 🎉</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textLight },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, flex: 1, marginLeft: 12 },
  headerBadge: { backgroundColor: colors.navy + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  headerBadgeText: { fontSize: 12, fontWeight: '700', color: colors.navy },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  filterWrapper: { paddingHorizontal: 16, marginBottom: 8 },
  filterRow: { gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  list: { padding: 16, gap: 12 },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  itemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1 },
  itemNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  itemMeta: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  itemContact: { fontSize: 12, color: colors.textLight },
  itemActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    gap: 4,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  approveBtn: { backgroundColor: colors.success },
  approveBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  rejectBtn: { backgroundColor: colors.error + '15' },
  rejectBtnText: { fontSize: 13, fontWeight: '600', color: colors.error },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: colors.textLight, marginTop: 4 },
});
