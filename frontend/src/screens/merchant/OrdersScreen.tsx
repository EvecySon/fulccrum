import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { ordersAPI } from '../../services/api';

type OrderStatus = 'all' | 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function MerchantOrdersScreen({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getBusinessOrders('me');
      if (res?.data) setAllOrders(res.data);
      else if (Array.isArray(res)) setAllOrders(res);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filters: { key: OrderStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allOrders.length },
    { key: 'pending', label: 'New', count: allOrders.filter(o => o.status === 'pending').length },
    { key: 'accepted', label: 'Accepted', count: allOrders.filter(o => o.status === 'accepted').length },
    { key: 'preparing', label: 'Preparing', count: allOrders.filter(o => o.status === 'preparing').length },
    { key: 'ready', label: 'Ready', count: allOrders.filter(o => o.status === 'ready').length },
    { key: 'picked_up', label: 'Picked Up', count: allOrders.filter(o => o.status === 'picked_up').length },
    { key: 'delivered', label: 'Done', count: allOrders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: allOrders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = activeFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === activeFilter);

  const displayOrders = searchQuery
    ? filteredOrders.filter(o => {
        const q = searchQuery.toLowerCase();
        const name = `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.toLowerCase();
        const num = (o.orderNumber || '').toLowerCase();
        return name.includes(q) || num.includes(q);
      })
    : filteredOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.info;
      case 'accepted': return colors.teal;
      case 'preparing': return colors.warning;
      case 'ready': return '#22c55e';
      case 'picked_up': return colors.navy;
      case 'in_transit': return colors.navy;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      case 'rejected': return colors.error;
      default: return colors.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'New Order';
      case 'accepted': return 'Accepted';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getActionButton = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Accept Order', color: colors.teal, nextStatus: 'accepted' };
      case 'accepted': return { label: 'Start Preparing', color: colors.warning, nextStatus: 'preparing' };
      case 'preparing': return { label: 'Mark Ready', color: '#22c55e', nextStatus: 'ready' };
      case 'ready': return { label: 'Awaiting Courier', color: colors.navy, nextStatus: null };
      default: return null;
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not update order'); }
  };

  const handleRejectOrder = (orderId: string) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await ordersAPI.updateStatus(orderId, 'rejected');
            setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o));
          } catch (e: any) { Alert.alert('Error', e?.message || 'Could not reject order'); }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity style={[styles.searchBtn, showSearch && { backgroundColor: colors.teal }]} onPress={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}>
          <Ionicons name={showSearch ? 'close' : 'search'} size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer or order #..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
              {filter.label}
            </Text>
            <View style={[styles.filterCount, activeFilter === filter.key && styles.filterCountActive]}>
              <Text style={[styles.filterCountText, activeFilter === filter.key && styles.filterCountTextActive]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
      >
        {loading && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={colors.navy} />
          </View>
        )}
        {!loading && displayOrders.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textLight, marginTop: 12 }}>
              {searchQuery ? 'No matching orders' : 'No orders yet'}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 4 }}>
              {searchQuery ? 'Try a different search' : 'Orders will appear here when customers place them'}
            </Text>
          </View>
        )}
        {displayOrders.map((order) => {
          const action = getActionButton(order.status);
          const customerName = order.customer
            ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
            : 'Customer';
          const orderItems = (order.items || []).map((oi: any) =>
            `${oi.quantity > 1 ? oi.quantity + 'x ' : ''}${oi.menuItem?.name || 'Item'}`
          );
          const total = Number(order.totalAmount || 0);
          return (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderCustomer}>{customerName}</Text>
                  <Text style={styles.orderId}>#{order.orderNumber} · {timeAgo(order.placedAt || order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                  <Text style={[styles.statusLabel, { color: getStatusColor(order.status) }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              {/* Items */}
              {orderItems.length > 0 && (
              <View style={styles.orderItems}>
                {orderItems.map((item: string, idx: number) => (
                  <Text key={idx} style={styles.orderItemText}>• {item}</Text>
                ))}
              </View>
              )}

              {/* Special Notes */}
              {order.specialInstructions ? (
                <View style={styles.notesBar}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.warning} />
                  <Text style={styles.notesText}>{order.specialInstructions}</Text>
                </View>
              ) : null}

              {/* Footer */}
              <View style={styles.orderBottom}>
                <View>
                  <Text style={styles.orderTotal}>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                  {order.paymentStatus && (
                    <Text style={{ fontSize: 11, color: order.paymentStatus === 'completed' ? colors.success : colors.warning, fontWeight: '600', marginTop: 2 }}>
                      {order.paymentStatus === 'completed' ? 'Paid' : order.paymentStatus}
                    </Text>
                  )}
                </View>
                <View style={styles.orderActions}>
                  {order.status === 'pending' && (
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectOrder(order.id)}>
                      <Ionicons name="close" size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                  {action && action.nextStatus && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: action.color }]} onPress={() => handleUpdateStatus(order.id, action.nextStatus!)}>
                      <Text style={styles.actionText}>{action.label}</Text>
                    </TouchableOpacity>
                  )}
                  {action && !action.nextStatus && (
                    <View style={[styles.actionBtn, { backgroundColor: action.color + '20' }]}>
                      <Text style={[styles.actionText, { color: action.color }]}>{action.label}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 110 }} />
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
    backgroundColor: colors.navy,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textWhite,
  },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  filterWrapper: {
    height: 50,
  },
  filterRow: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textWhite,
  },
  filterCount: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterCountTextActive: {
    color: colors.textWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderId: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 8,
  },
  orderItemText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  notesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500',
    flex: 1,
  },
  prepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  prepTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  prepFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  prepText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.teal,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.error + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textWhite,
  },
  printBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
