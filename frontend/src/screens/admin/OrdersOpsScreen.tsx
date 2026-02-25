import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const statusFilters = ['All', 'New', 'Preparing', 'In Transit', 'Delivered', 'Cancelled'];

const mockOrders = [
  { id: '#3252', customer: 'John S.', restaurant: 'Burger House', courier: 'Mike J.', total: 29.49, status: 'in_transit', time: '3 min ago', items: 3 },
  { id: '#3251', customer: 'Anna D.', restaurant: 'Sushi Palace', courier: 'Sarah L.', total: 45.98, status: 'preparing', time: '8 min ago', items: 4 },
  { id: '#3250', customer: 'David W.', restaurant: 'Pizza Roma', courier: null, total: 18.99, status: 'new', time: '2 min ago', items: 2 },
  { id: '#3249', customer: 'Emily R.', restaurant: 'Thai Garden', courier: 'Tom W.', total: 32.50, status: 'delivered', time: '15 min ago', items: 3 },
  { id: '#3248', customer: 'Mike L.', restaurant: 'Taco Fiesta', courier: null, total: 12.99, status: 'cancelled', time: '20 min ago', items: 1 },
  { id: '#3247', customer: 'Sarah K.', restaurant: 'Urban Spoon', courier: 'Lisa W.', total: 68.00, status: 'in_transit', time: '12 min ago', items: 5 },
  { id: '#3246', customer: 'Tom B.', restaurant: 'Burger House', courier: 'Mike J.', total: 22.50, status: 'delivered', time: '25 min ago', items: 2 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return colors.info;
    case 'preparing': return colors.warning;
    case 'in_transit': return colors.teal;
    case 'delivered': return colors.success;
    case 'cancelled': return colors.error;
    default: return colors.textLight;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'new': return 'New';
    case 'preparing': return 'Preparing';
    case 'in_transit': return 'In Transit';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

export default function OrdersOpsScreen({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [orders, setOrders] = useState(mockOrders);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getOrders();
        if (res?.data?.length) setOrders(res.data);
      } catch (e: any) { showAlert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'All') return true;
    return getStatusLabel(o.status) === activeFilter;
  });

  const statusCounts = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    in_transit: orders.filter(o => o.status === 'in_transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders & Operations</Text>
        <TouchableOpacity 
          style={styles.refreshBtn}
          onPress={() => {
            showAlert('Refreshing', 'Orders refreshed');
          }}
        >
          <Ionicons name="refresh" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Pipeline */}
        <View style={styles.pipeline}>
          {[
            { label: 'New', count: statusCounts.new, color: colors.info },
            { label: 'Prep', count: statusCounts.preparing, color: colors.warning },
            { label: 'Transit', count: statusCounts.in_transit, color: colors.teal },
            { label: 'Done', count: statusCounts.delivered, color: colors.success },
            { label: 'Cancel', count: statusCounts.cancelled, color: colors.error },
          ].map((stage, index) => (
            <View key={index} style={styles.pipelineItem}>
              <View style={[styles.pipelineCount, { backgroundColor: stage.color + '15' }]}>
                <Text style={[styles.pipelineCountText, { color: stage.color }]}>{stage.count}</Text>
              </View>
              <Text style={styles.pipelineLabel}>{stage.label}</Text>
              {index < 4 && <Ionicons name="chevron-forward" size={14} color={colors.border} style={styles.pipelineArrow} />}
            </View>
          ))}
        </View>

        {/* Operational Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Ionicons name="time-outline" size={18} color={colors.warning} />
            <Text style={styles.metricValue}>24m</Text>
            <Text style={styles.metricLabel}>Avg Delivery</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-done" size={18} color={colors.success} />
            <Text style={styles.metricValue}>96.2%</Text>
            <Text style={styles.metricLabel}>Success Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>Issues</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {statusFilters.map((filter) => (
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

        {/* Orders List */}
        <View style={styles.ordersList}>
          {filteredOrders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View style={styles.orderIdRow}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                    <View style={[styles.statusDotSmall, { backgroundColor: getStatusColor(order.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderTime}>{order.time}</Text>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.orderDetailRow}>
                  <Ionicons name="person-outline" size={14} color={colors.textLight} />
                  <Text style={styles.orderDetailText}>{order.customer}</Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Ionicons name="storefront-outline" size={14} color={colors.textLight} />
                  <Text style={styles.orderDetailText}>{order.restaurant}</Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Ionicons name="bicycle-outline" size={14} color={colors.textLight} />
                  <Text style={styles.orderDetailText}>{order.courier || 'Unassigned'}</Text>
                </View>
              </View>

              <View style={styles.orderBottom}>
                <Text style={styles.orderTotal}>₦{order.total.toFixed(2)}</Text>
                <Text style={styles.orderItems}>{order.items} items</Text>
                <View style={styles.orderActions}>
                  <TouchableOpacity 
                    style={styles.orderActionBtn}
                    onPress={() => {
                      showAlert('Order Details', `Order ${order.id}\n\nCustomer: ${order.customer}\nRestaurant: ${order.restaurant}\nCourier: ${order.courier || 'Unassigned'}\nStatus: ${getStatusLabel(order.status)}\nTotal: ₦${order.total.toFixed(2)}\nItems: ${order.items}`);
                    }}
                  >
                    <Ionicons name="eye-outline" size={16} color={colors.navy} />
                  </TouchableOpacity>
                  {order.status === 'new' && !order.courier && (
                    <TouchableOpacity 
                      style={[styles.orderActionBtn, styles.assignBtn]}
                      onPress={() => {
                        showAlert('Assign Courier', `Assign courier to order ${order.id}?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Assign', 
                            onPress: () => {
                              setOrders(orders.map(o => o.id === order.id ? { ...o, courier: 'Auto-assigned', status: 'preparing' } : o));
                              showAlert('Success', `Courier assigned to order ${order.id}`);
                            }
                          }
                        ]);
                      }}
                    >
                      <Ionicons name="person-add-outline" size={16} color={colors.textWhite} />
                    </TouchableOpacity>
                  )}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <TouchableOpacity 
                      style={[styles.orderActionBtn, styles.cancelBtn]}
                      onPress={() => {
                        showAlert('Cancel Order', `Cancel order ${order.id}?`, [
                          { text: 'No', style: 'cancel' },
                          { 
                            text: 'Cancel Order', 
                            style: 'destructive',
                            onPress: () => {
                              setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                              showAlert('Success', `Order ${order.id} has been cancelled`);
                            }
                          }
                        ]);
                      }}
                    >
                      <Ionicons name="close" size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dispatch Map Placeholder */}
        <View style={styles.mapSection}>
          <Text style={styles.mapTitle}>Live Dispatch Map</Text>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color={colors.textLight} />
            <Text style={styles.mapText}>Real-time courier & order tracking</Text>
            <Text style={styles.mapSubtext}>{statusCounts.in_transit} orders in transit · {orders.filter(o => o.courier).length} couriers active</Text>
          </View>
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
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  refreshBtn: { padding: 4 },
  pipeline: {
    flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10,
    borderRadius: 16, padding: 14, justifyContent: 'space-around', alignItems: 'center',
  },
  pipelineItem: { alignItems: 'center', position: 'relative' },
  pipelineCount: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  pipelineCountText: { fontSize: 16, fontWeight: '800' },
  pipelineLabel: { fontSize: 10, color: colors.textLight, marginTop: 4 },
  pipelineArrow: { position: 'absolute', right: -18, top: 10 },
  metricsRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 8, marginTop: 10 },
  metricCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4,
  },
  metricValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  metricLabel: { fontSize: 11, color: colors.textLight },
  filterWrapper: { height: 50, marginTop: 6 },
  filterRow: { paddingHorizontal: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignSelf: 'center',
  },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  ordersList: { paddingHorizontal: 10 },
  orderCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderTime: { fontSize: 12, color: colors.textLight },
  orderDetails: { gap: 4, marginBottom: 10 },
  orderDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderDetailText: { fontSize: 13, color: colors.textSecondary },
  orderBottom: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  orderTotal: { fontSize: 16, fontWeight: '700', color: colors.teal },
  orderItems: { fontSize: 12, color: colors.textLight, marginLeft: 8 },
  orderActions: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  orderActionBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  assignBtn: { backgroundColor: colors.teal },
  cancelBtn: { backgroundColor: colors.error + '10' },
  mapSection: { paddingHorizontal: 10, marginTop: 16 },
  mapTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  mapPlaceholder: {
    height: 180, backgroundColor: colors.white, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  mapText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  mapSubtext: { fontSize: 12, color: colors.textLight },
});
