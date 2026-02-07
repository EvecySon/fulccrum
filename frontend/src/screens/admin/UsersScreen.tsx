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

const users = [
  { id: '1', name: 'John Smith', email: 'john@example.com', role: 'customer', status: 'active', orders: 23, joined: 'Jan 15, 2026', spent: 456 },
  { id: '2', name: 'Sarah Lee', email: 'sarah@example.com', role: 'courier', status: 'active', deliveries: 342, joined: 'Dec 3, 2025', rating: 4.9 },
  { id: '3', name: 'Mike Chen', email: 'mike@burgerhouse.com', role: 'merchant', status: 'active', restaurant: 'Burger House', joined: 'Nov 20, 2025', revenue: 12500 },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', role: 'customer', status: 'suspended', orders: 5, joined: 'Feb 1, 2026', spent: 89 },
  { id: '5', name: 'Tom Wilson', email: 'tom@example.com', role: 'courier', status: 'pending', deliveries: 0, joined: 'Feb 5, 2026', rating: 0 },
  { id: '6', name: 'Anna Park', email: 'anna@sushipalace.com', role: 'merchant', status: 'pending', restaurant: 'Sushi Palace', joined: 'Feb 4, 2026', revenue: 0 },
  { id: '7', name: 'David Brown', email: 'david@example.com', role: 'customer', status: 'active', orders: 67, joined: 'Oct 10, 2025', spent: 1234 },
  { id: '8', name: 'Lisa Wang', email: 'lisa@example.com', role: 'admin', status: 'active', joined: 'Sep 1, 2025' },
];

const roleFilters = ['All', 'Customers', 'Couriers', 'Merchants', 'Admins'];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'customer': return colors.teal;
    case 'courier': return colors.warning;
    case 'merchant': return colors.navy;
    case 'admin': return colors.error;
    default: return colors.textLight;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return colors.success;
    case 'suspended': return colors.error;
    case 'pending': return colors.warning;
    default: return colors.textLight;
  }
};

export default function UsersScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'Customers' && u.role === 'customer') ||
      (activeFilter === 'Couriers' && u.role === 'courier') ||
      (activeFilter === 'Merchants' && u.role === 'merchant') ||
      (activeFilter === 'Admins' && u.role === 'admin');
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{users.length} total</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {roleFilters.map((filter) => (
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

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statMini}>
          <Text style={styles.statMiniValue}>{users.filter(u => u.status === 'active').length}</Text>
          <Text style={styles.statMiniLabel}>Active</Text>
        </View>
        <View style={styles.statMini}>
          <Text style={[styles.statMiniValue, { color: colors.warning }]}>{users.filter(u => u.status === 'pending').length}</Text>
          <Text style={styles.statMiniLabel}>Pending</Text>
        </View>
        <View style={styles.statMini}>
          <Text style={[styles.statMiniValue, { color: colors.error }]}>{users.filter(u => u.status === 'suspended').length}</Text>
          <Text style={styles.statMiniLabel}>Suspended</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredUsers.map((user) => (
          <TouchableOpacity key={user.id} style={styles.userCard}>
            <View style={styles.userTop}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '15' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>{user.role}</Text>
                  </View>
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(user.status) }]} />
            </View>

            <View style={styles.userMeta}>
              <Text style={styles.userMetaText}>Joined {user.joined}</Text>
              {user.role === 'customer' && <Text style={styles.userMetaText}>{user.orders} orders · ₦{user.spent}</Text>}
              {user.role === 'courier' && <Text style={styles.userMetaText}>{user.deliveries} deliveries · ★{user.rating}</Text>}
              {user.role === 'merchant' && <Text style={styles.userMetaText}>{user.restaurant} · ₦{user.revenue?.toLocaleString()}</Text>}
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity style={styles.userActionBtn}>
                <Ionicons name="eye-outline" size={16} color={colors.navy} />
                <Text style={styles.userActionText}>View</Text>
              </TouchableOpacity>
              {user.status === 'pending' && (
                <TouchableOpacity style={[styles.userActionBtn, styles.approveBtn]}>
                  <Ionicons name="checkmark" size={16} color={colors.textWhite} />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
              )}
              {user.status === 'active' && (
                <TouchableOpacity style={[styles.userActionBtn, styles.suspendBtn]}>
                  <Ionicons name="ban-outline" size={16} color={colors.error} />
                  <Text style={styles.suspendBtnText}>Suspend</Text>
                </TouchableOpacity>
              )}
              {user.status === 'suspended' && (
                <TouchableOpacity style={[styles.userActionBtn, styles.reactivateBtn]}>
                  <Ionicons name="refresh" size={16} color={colors.success} />
                  <Text style={styles.reactivateBtnText}>Reactivate</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  headerBadge: { backgroundColor: colors.navy + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  headerBadgeText: { fontSize: 13, fontWeight: '600', color: colors.navy },
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
  statsRow: {
    flexDirection: 'row', marginHorizontal: 10, backgroundColor: colors.white,
    borderRadius: 14, padding: 14, justifyContent: 'space-around',
  },
  statMini: { alignItems: 'center' },
  statMiniValue: { fontSize: 20, fontWeight: '800', color: colors.success },
  statMiniLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 8 },
  userCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  userTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: colors.navy + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 17, fontWeight: '700', color: colors.navy },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  userEmail: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  userMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  userMetaText: { fontSize: 12, color: colors.textSecondary },
  userActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  userActionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: colors.lightGray, gap: 4,
  },
  userActionText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  approveBtn: { backgroundColor: colors.teal },
  approveBtnText: { fontSize: 13, fontWeight: '600', color: colors.textWhite },
  suspendBtn: { backgroundColor: colors.error + '10' },
  suspendBtnText: { fontSize: 13, fontWeight: '600', color: colors.error },
  reactivateBtn: { backgroundColor: colors.success + '10' },
  reactivateBtnText: { fontSize: 13, fontWeight: '600', color: colors.success },
});
