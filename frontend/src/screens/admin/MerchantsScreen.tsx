import { showAlert } from '../../utils/alert';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const mockMerchants = [
  { id: '1', name: 'Chicken Republic - Lekki', owner: 'Adewale Johnson', email: 'adewale@chickenrep.ng', status: 'active', rating: 4.7, orders: 1842, revenue: 2450000, commission: 8, joined: 'Sep 15, 2025', category: 'Fast Food' },
  { id: '2', name: 'The Place - Victoria Island', owner: 'Funke Adeyemi', email: 'funke@theplace.ng', status: 'active', rating: 4.5, orders: 1230, revenue: 1890000, commission: 8, joined: 'Oct 1, 2025', category: 'Nigerian' },
  { id: '3', name: 'Mama Put Kitchen - Surulere', owner: 'Ngozi Okafor', email: 'ngozi@mamaput.ng', status: 'active', rating: 4.8, orders: 956, revenue: 780000, commission: 10, joined: 'Nov 20, 2025', category: 'Local Cuisine' },
  { id: '4', name: 'Dominos Pizza - Ikeja', owner: 'Chidi Nnamdi', email: 'chidi@dominos.ng', status: 'active', rating: 4.3, orders: 2100, revenue: 3200000, commission: 7, joined: 'Aug 5, 2025', category: 'Pizza' },
  { id: '5', name: 'Seoul Kitchen - Lekki Phase 2', owner: 'Jin Kim', email: 'jin@seoulkitchen.ng', status: 'pending', rating: 0, orders: 0, revenue: 0, commission: 10, joined: 'Feb 8, 2026', category: 'Korean' },
  { id: '6', name: 'Kilimanjaro - Ajah', owner: 'Yusuf Mohammed', email: 'yusuf@kilimanjaro.ng', status: 'pending', rating: 0, orders: 0, revenue: 0, commission: 10, joined: 'Feb 10, 2026', category: 'Fast Food' },
  { id: '7', name: 'Buka Hut - Ikoyi', owner: 'Bola Akinwale', email: 'bola@bukahut.ng', status: 'suspended', rating: 3.1, orders: 312, revenue: 245000, commission: 10, joined: 'Dec 1, 2025', category: 'Local Cuisine' },
  { id: '8', name: 'Tantalizers - Festac', owner: 'Emeka Obi', email: 'emeka@tantalizers.ng', status: 'suspended', rating: 3.4, orders: 187, revenue: 156000, commission: 10, joined: 'Jan 5, 2026', category: 'Fast Food' },
  { id: '9', name: 'KFC - Surulere', owner: 'Amara Eze', email: 'amara@kfc.ng', status: 'active', rating: 4.4, orders: 1567, revenue: 2100000, commission: 7, joined: 'Jul 20, 2025', category: 'Fast Food' },
  { id: '10', name: 'Sweet Sensation - Ikeja', owner: 'Tunde Bakare', email: 'tunde@sweetsensation.ng', status: 'active', rating: 4.6, orders: 890, revenue: 1120000, commission: 8, joined: 'Oct 10, 2025', category: 'Bakery & Fast Food' },
];

const filters = ['All', 'Active', 'Pending', 'Suspended'];

export default function MerchantsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [merchants, setMerchants] = useState(mockMerchants);

  const filtered = merchants.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.owner.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || m.status === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{merchants.filter(m => m.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{merchants.filter(m => m.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.error }]}>{merchants.filter(m => m.status === 'suspended').length}</Text>
            <Text style={styles.statLabel}>Suspended</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.teal }]}>₦{(merchants.reduce((s, m) => s + m.revenue, 0) / 1000).toFixed(0)}K</Text>
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
                    <Text style={styles.merchantName}>{merchant.name}</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: merchant.status === 'active' ? colors.success + '15' :
                        merchant.status === 'pending' ? colors.warning + '15' : colors.error + '15'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: merchant.status === 'active' ? colors.success :
                          merchant.status === 'pending' ? colors.warning : colors.error
                      }]}>{merchant.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.merchantOwner}>{merchant.owner} · {merchant.category}</Text>
                </View>
              </View>

              {merchant.status === 'active' && (
                <View style={styles.merchantStats}>
                  <View style={styles.merchantStat}>
                    <Ionicons name="star" size={12} color={colors.warning} />
                    <Text style={styles.merchantStatText}>{merchant.rating}</Text>
                  </View>
                  <View style={styles.merchantStat}>
                    <Ionicons name="receipt-outline" size={12} color={colors.textLight} />
                    <Text style={styles.merchantStatText}>{merchant.orders} orders</Text>
                  </View>
                  <View style={styles.merchantStat}>
                    <Ionicons name="cash-outline" size={12} color={colors.textLight} />
                    <Text style={styles.merchantStatText}>₦{merchant.revenue.toLocaleString()}</Text>
                  </View>
                  <View style={styles.merchantStat}>
                    <Ionicons name="pricetag-outline" size={12} color={colors.textLight} />
                    <Text style={styles.merchantStatText}>{merchant.commission}%</Text>
                  </View>
                </View>
              )}

              <View style={styles.merchantActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => showAlert('Merchant Details', `${merchant.name}\nOwner: ${merchant.owner}\nEmail: ${merchant.email}\nJoined: ${merchant.joined}`)}>
                  <Ionicons name="eye-outline" size={16} color={colors.navy} />
                  <Text style={styles.actionBtnText}>View</Text>
                </TouchableOpacity>
                {merchant.status === 'pending' && (
                  <>
                    <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => { setMerchants(prev => prev.map(m => m.id === merchant.id ? { ...m, status: 'active' } : m)); showAlert('Success', `${merchant.name} approved`); }}>
                      <Ionicons name="checkmark" size={16} color={colors.textWhite} />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => { setMerchants(prev => prev.filter(m => m.id !== merchant.id)); showAlert('Done', `${merchant.name} rejected and removed`); }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
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
});
