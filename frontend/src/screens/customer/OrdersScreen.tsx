import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ordersAPI } from '../../services/api';
import { withMock, mockGetOrders } from '../../services/mockApi';

export default function OrdersScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadOrders = useCallback(async (pageNum = 1, append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await withMock(
        () => ordersAPI.getMyOrders(pageNum, 20),
        () => mockGetOrders(pageNum, 20)
      );
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const meta = res?.meta;
      
      if (append) {
        setAllOrders(prev => [...prev, ...data]);
      } else {
        setAllOrders(data);
      }
      
      setHasMore(meta ? pageNum < meta.totalPages : false);
      setPage(pageNum);
    } catch (e: any) { 
      Alert.alert('Error', e?.message || 'Something went wrong'); 
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadOrders(1, false);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadOrders(page + 1, true);
    }
  };

  const handleReorder = async (order: any) => {
    try {
      await ordersAPI.reorder(order.id);
      Alert.alert('Success', 'Order added to cart!');
      navigation.navigate('Cart');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not reorder');
    }
  };

  const formatETA = (estimatedTime: string | null) => {
    if (!estimatedTime) return null;
    const eta = new Date(estimatedTime);
    const now = new Date();
    const diffMs = eta.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins <= 0) return 'Soon';
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const activeOrders = allOrders.filter(
    (o: any) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const pastOrders = allOrders.filter(
    (o: any) => o.status === 'delivered' || o.status === 'cancelled'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return colors.info;
      case 'preparing':
      case 'ready':
        return colors.warning;
      case 'picked_up':
      case 'in_transit':
        return colors.teal;
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'picked_up':
        return 'Picked Up';
      case 'in_transit':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const orders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.tabTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.tabTextActive,
            ]}
          >
            Past Orders
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Your {activeTab} orders will appear here
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => {
                if (order.status !== 'delivered' && order.status !== 'cancelled') {
                  navigation.navigate('OrderTracking', { orderId: order.id });
                }
              }}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderRestaurant}>
                    {order.business?.businessName || 'Unknown Restaurant'}
                  </Text>
                  <Text style={styles.orderId}>#{order.orderNumber || order.id.slice(0, 8)}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + '15' },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(order.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderItems}>
                {(order.items || []).slice(0, 3).map((item: any, index: number) => (
                  <Text key={index} style={styles.orderItemText}>
                    • {item.quantity}x {item.menuItem?.name || 'Item'}
                  </Text>
                ))}
                {(order.items?.length || 0) > 3 && (
                  <Text style={styles.orderItemText}>• +{order.items.length - 3} more items</Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>
                  ₦{(order.totalAmount || 0).toLocaleString()}
                </Text>
                {(order.status === 'in_transit' || order.status === 'picked_up') && formatETA(order.estimatedDeliveryTime) && (
                  <View style={styles.etaBadge}>
                    <Ionicons name="time" size={14} color={colors.teal} />
                    <Text style={styles.etaText}>ETA: {formatETA(order.estimatedDeliveryTime)}</Text>
                  </View>
                )}
                {order.status === 'delivered' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.reorderBtn} onPress={() => handleReorder(order)}>
                      <Ionicons name="refresh" size={16} color={colors.teal} />
                      <Text style={styles.reorderText}>Reorder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reviewBtn} onPress={() => navigation.navigate('Feedback', { orderId: order.id })}>
                      <Ionicons name="star-outline" size={16} color={colors.navy} />
                      <Text style={styles.reviewText}>Review</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
        {orders.length > 0 && hasMore && (
          <TouchableOpacity 
            style={styles.loadMoreBtn} 
            onPress={loadMore}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.teal} />
            ) : (
              <>
                <Text style={styles.loadMoreText}>Load More</Text>
                <Ionicons name="chevron-down" size={16} color={colors.teal} />
              </>
            )}
          </TouchableOpacity>
        )}
        <View style={{ height: 100 }} />
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
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 0,
    backgroundColor: colors.white,
    marginTop: 10,
    marginHorizontal: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginHorizontal: 10,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  tabActive: {
    backgroundColor: colors.navy,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textWhite,
  },
  content: {
    flex: 1,
    paddingTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderId: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  orderFooter: {
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
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.teal,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.teal + '15',
  },
  reorderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.teal,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  reviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
});
