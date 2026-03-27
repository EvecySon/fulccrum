import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { courierOrdersAPI } from '../../services/api';

interface PastOrder {
  id: string;
  restaurant: string;
  customer: string;
  status: 'delivered' | 'cancelled' | 'returned';
  date: string;
  time: string;
  basePay: number;
  tip: number;
  bonus: number;
  total: number;
  distance: string;
  duration: string;
  items: number;
  rating?: number;
  pickupAddress: string;
  dropoffAddress: string;
}


const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrderHistoryScreen({ navigation }: any) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [orders, setOrders] = useState<PastOrder[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadHistory = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await courierOrdersAPI.getHistory(filter !== 'all' ? filter : undefined, pageNum);
      const data = res?.data ?? res;
      if (Array.isArray(data) && data.length) {
        if (append) setOrders(prev => [...prev, ...data]);
        else setOrders(data);
      }
    } catch {
      // Keep empty on error
    }
  }, [filter]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadHistory(1);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    const next = page + 1;
    setPage(next);
    await loadHistory(next, true);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      case 'returned': return colors.warning;
      default: return colors.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      case 'returned': return 'arrow-undo-circle';
      default: return 'ellipse';
    }
  };

  const filtered = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = !search || o.restaurant.toLowerCase().includes(search.toLowerCase())
      || o.customer.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Summary stats
  const todayOrders = orders.filter(o => o.date === 'Today');
  const todayEarnings = todayOrders.reduce((s, o) => s + o.total, 0);
  const todayDelivered = todayOrders.filter(o => o.status === 'delivered').length;

  const renderOrder = ({ item }: { item: PastOrder }) => {
    const isExpanded = expanded === item.id;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => setExpanded(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        {/* Main Row */}
        <View style={styles.orderRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={20} color={colors.white} />
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderRestaurant}>{item.restaurant}</Text>
            <Text style={styles.orderMeta}>
              {item.date} · {item.time} · {item.items} item{item.items > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>₦{item.total.toLocaleString()}</Text>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={10} color="#eab308" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />

            {/* Route */}
            <View style={styles.routeRow}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: colors.teal }]} />
                <Text style={styles.routeText} numberOfLines={1}>{item.pickupAddress}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
                <Text style={styles.routeText} numberOfLines={1}>{item.dropoffAddress}</Text>
              </View>
            </View>

            {/* Earnings Breakdown */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Base Pay</Text>
                <Text style={styles.breakdownValue}>₦{item.basePay.toLocaleString()}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Tip</Text>
                <Text style={[styles.breakdownValue, item.tip > 0 && { color: colors.success }]}>
                  ₦{item.tip.toLocaleString()}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Bonus</Text>
                <Text style={[styles.breakdownValue, item.bonus > 0 && { color: '#8b5cf6' }]}>
                  ₦{item.bonus.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Ionicons name="navigate-outline" size={14} color={colors.teal} />
                <Text style={styles.statText}>{item.distance}</Text>
              </View>
              <View style={styles.statChip}>
                <Ionicons name="time-outline" size={14} color={colors.teal} />
                <Text style={styles.statText}>{item.duration}</Text>
              </View>
              <View style={styles.statChip}>
                <Ionicons name="person-outline" size={14} color={colors.teal} />
                <Text style={styles.statText}>{item.customer}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
              >
                <Ionicons name="receipt-outline" size={16} color={colors.teal} />
                <Text style={styles.actionText}>Full Details</Text>
              </TouchableOpacity>
              {item.status === 'delivered' && (
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="flag-outline" size={16} color={colors.error} />
                  <Text style={[styles.actionText, { color: colors.error }]}>Report Issue</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Today Summary */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>₦{todayEarnings.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Today's Earnings</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{todayDelivered}</Text>
          <Text style={styles.summaryLabel}>Deliveries</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by restaurant or customer..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 16 }} color={colors.teal} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {search ? 'Try a different search term.' : 'Your completed deliveries will appear here.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.navy, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  summaryBar: {
    flexDirection: 'row', backgroundColor: colors.white, paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: colors.navy },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.teal + '15', borderColor: colors.teal + '40' },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.teal },
  list: { padding: 16, paddingBottom: 100 },
  orderCard: {
    backgroundColor: colors.white, borderRadius: 14, marginBottom: 10,
    padding: 14, borderWidth: 1, borderColor: colors.border,
  },
  orderRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: { flex: 1 },
  orderRestaurant: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  orderMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  orderRight: { alignItems: 'flex-end' },
  orderTotal: { fontSize: 16, fontWeight: '800', color: colors.navy },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4,
    backgroundColor: '#fef9c3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#a16207' },
  expandedSection: { marginTop: 10 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
  routeRow: { marginBottom: 12 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  routeLine: { width: 1, height: 12, backgroundColor: colors.border, marginLeft: 4.5 },
  breakdownRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  breakdownItem: {
    flex: 1, backgroundColor: colors.lightGray, borderRadius: 10, padding: 10, alignItems: 'center',
  },
  breakdownLabel: { fontSize: 11, color: colors.textSecondary },
  breakdownValue: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.teal + '10', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  statText: { fontSize: 12, fontWeight: '600', color: colors.teal },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
});
