import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ordersAPI } from '../../services/api';


type OrderStatus = 'all' | 'new' | 'preparing' | 'ready' | 'picked_up' | 'completed';

export default function MerchantOrdersScreen({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await ordersAPI.getMyOrders();
      if (res?.data) setAllOrders(res.data);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filters: { key: OrderStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allOrders.length },
    { key: 'new', label: 'New', count: allOrders.filter(o => o.status === 'new').length },
    { key: 'preparing', label: 'Preparing', count: allOrders.filter(o => o.status === 'preparing').length },
    { key: 'ready', label: 'Ready', count: allOrders.filter(o => o.status === 'ready').length },
    { key: 'picked_up', label: 'Picked Up', count: allOrders.filter(o => o.status === 'picked_up').length },
    { key: 'completed', label: 'Done', count: allOrders.filter(o => o.status === 'completed').length },
  ];

  const filteredOrders = activeFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return colors.info;
      case 'preparing': return colors.warning;
      case 'ready': return colors.teal;
      case 'picked_up': return colors.navy;
      case 'completed': return colors.success;
      default: return colors.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'New Order';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getActionButton = (status: string) => {
    switch (status) {
      case 'new': return { label: 'Accept Order', color: colors.teal };
      case 'preparing': return { label: 'Mark Ready', color: colors.warning };
      case 'ready': return { label: 'Awaiting Courier', color: colors.navy };
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

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
        {filteredOrders.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textLight, marginTop: 12 }}>No orders yet</Text>
            <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 4 }}>Orders will appear here when customers place them</Text>
          </View>
        )}
        {filteredOrders.map((order) => {
          const action = getActionButton(order.status);
          return (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.orderCustomer}>{order.customerName}</Text>
                  <Text style={styles.orderId}>{order.id} · {order.timeAgo}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
                  <Text style={[styles.statusLabel, { color: getStatusColor(order.status) }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              {/* Items */}
              <View style={styles.orderItems}>
                {order.items.map((item: any, idx: number) => (
                  <Text key={idx} style={styles.orderItemText}>• {item}</Text>
                ))}
              </View>

              {/* Special Notes */}
              {order.notes ? (
                <View style={styles.notesBar}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.warning} />
                  <Text style={styles.notesText}>{order.notes}</Text>
                </View>
              ) : null}

              {/* Prep Progress */}
              {order.status === 'preparing' && (order as any).prepProgress && (
                <View style={styles.prepBar}>
                  <View style={styles.prepTrack}>
                    <View style={[styles.prepFill, { width: `${(order as any).prepProgress}%` }]} />
                  </View>
                  <Text style={styles.prepText}>{(order as any).prepProgress}% done</Text>
                </View>
              )}

              {/* Footer */}
              <View style={styles.orderBottom}>
                <Text style={styles.orderTotal}>₦{order.total.toFixed(2)}</Text>
                <View style={styles.orderActions}>
                  {order.status === 'new' && (
                    <TouchableOpacity style={styles.rejectBtn}>
                      <Ionicons name="close" size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                  {action && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: action.color }]}>
                      <Text style={styles.actionText}>{action.label}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.printBtn}>
                    <Ionicons name="print-outline" size={18} color={colors.navy} />
                  </TouchableOpacity>
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
