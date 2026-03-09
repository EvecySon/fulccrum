import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { operationsAPI } from '../../../services/api';

const MOCK_DATA_REMOVED = {
  activeOrders: 24,
  activeDrivers: 18,
  openIncidents: 3,
  orders: [
    {
      id: '1', orderNumber: 'ORD-2026-4821', customer: 'Adebayo Johnson',
      status: 'in_transit', business: 'Chicken Republic - Lekki', driver: 'Emeka Obi',
      estimatedDeliveryTime: new Date(Date.now() + 15 * 60000).toISOString(),
      deliveryAddress: { streetAddress: '14 Admiralty Way', apartment: 'Suite 3B', city: 'Lekki', state: 'Lagos' },
    },
    {
      id: '2', orderNumber: 'ORD-2026-4822', customer: 'Funke Adeyemi',
      status: 'preparing', business: 'The Place - Victoria Island', driver: null,
      estimatedDeliveryTime: new Date(Date.now() + 35 * 60000).toISOString(),
      deliveryAddress: { streetAddress: '25 Adeola Odeku St', apartment: null, city: 'Victoria Island', state: 'Lagos' },
    },
    {
      id: '3', orderNumber: 'ORD-2026-4823', customer: 'Chidi Nwosu',
      status: 'picked_up', business: 'Dominos Pizza - Ikeja', driver: 'Tunde Bakare',
      estimatedDeliveryTime: new Date(Date.now() + 10 * 60000).toISOString(),
      deliveryAddress: { streetAddress: '8 Allen Avenue', apartment: 'Flat 12', city: 'Ikeja', state: 'Lagos' },
    },
    {
      id: '4', orderNumber: 'ORD-2026-4824', customer: 'Ngozi Eze',
      status: 'ready', business: 'KFC - Surulere', driver: 'Ibrahim Musa',
      estimatedDeliveryTime: new Date(Date.now() + 25 * 60000).toISOString(),
      deliveryAddress: { streetAddress: '3 Bode Thomas St', apartment: null, city: 'Surulere', state: 'Lagos' },
    },
    {
      id: '5', orderNumber: 'ORD-2026-4825', customer: 'Yemi Alade',
      status: 'delivered', business: 'Bukka Hut - Ikoyi', driver: 'Segun Adewale',
      estimatedDeliveryTime: null,
      deliveryAddress: { streetAddress: '1 Bourdillon Rd', apartment: 'Penthouse', city: 'Ikoyi', state: 'Lagos' },
    },
  ],
};

export default function LiveOperationsMapScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await operationsAPI.getLiveMap();
      if (res) setData(res);
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to load operations data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return colors.warning;
      case 'ready': return colors.info;
      case 'picked_up': return colors.teal;
      case 'in_transit': return colors.navy;
      case 'delivered': return colors.success;
      default: return colors.textSecondary;
    }
  };

  if (loading || !data) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading live operations...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.title}>Live Operations</Text>
          <Text style={styles.subtitle}>Real-time order tracking</Text>
        </View>

        {data && (
          <>
            <View style={styles.statsCards}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.activeOrders}</Text>
                <Text style={styles.statLabel}>Active Orders</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.activeDrivers}</Text>
                <Text style={styles.statLabel}>Active Drivers</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.error }]}>{data.openIncidents}</Text>
                <Text style={styles.statLabel}>Open Incidents</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              {data.orders.map((order: any) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.orderCustomer}>{order.customer}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {order.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <View style={styles.orderDetail}>
                      <Text style={styles.orderDetailLabel}>Business:</Text>
                      <Text style={styles.orderDetailValue}>{order.business}</Text>
                    </View>
                    {order.driver && (
                      <View style={styles.orderDetail}>
                        <Text style={styles.orderDetailLabel}>Driver:</Text>
                        <Text style={styles.orderDetailValue}>{order.driver}</Text>
                      </View>
                    )}
                    {order.estimatedDeliveryTime && (
                      <View style={styles.orderDetail}>
                        <Text style={styles.orderDetailLabel}>ETA:</Text>
                        <Text style={styles.orderDetailValue}>
                          {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {order.deliveryAddress && (
                    <View style={styles.addressContainer}>
                      <Text style={styles.addressLabel}>Delivery Address:</Text>
                      <Text style={styles.addressText}>
                        {order.deliveryAddress.streetAddress}
                        {order.deliveryAddress.apartment ? `, ${order.deliveryAddress.apartment}` : ''}
                      </Text>
                      <Text style={styles.addressText}>
                        {order.deliveryAddress.city}, {order.deliveryAddress.state}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              {data.orders.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No active orders</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: colors.white, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    gap: 12 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: colors.lightGray, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.textPrimary, 
    flex: 1 
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsCards: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  orderCustomer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addressContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  addressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
