import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { colors } from '../../../theme/colors';
import { operationsAPI } from '../../../services/api';

export default function LiveOperationsMapScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const response = await operationsAPI.getLiveMap();
      setData(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load live operations data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
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
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
