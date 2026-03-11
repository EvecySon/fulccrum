import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { gadgetsAPI, Order } from '../../services/gadgetsAPI';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
];

const GadgetsOrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await gadgetsAPI.getOrders({
        status: activeTab === 'all' ? undefined : activeTab,
      });

      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await gadgetsAPI.cancelOrder(orderId);
            Alert.alert('Success', 'Order cancelled successfully');
            loadOrders();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'confirmed':
        return '#3498db';
      case 'processing':
        return '#9b59b6';
      case 'shipped':
        return '#1abc9c';
      case 'delivered':
        return '#2ecc71';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time';
      case 'confirmed':
        return 'checkmark-circle';
      case 'processing':
        return 'construct';
      case 'shipped':
        return 'airplane';
      case 'delivered':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3498db" />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all'
                ? "You haven't placed any orders yet"
                : `No ${activeTab} orders`}
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => (navigation as any).navigate('GadgetsHome')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View
                  style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}
                >
                  <Ionicons
                    name={getStatusIcon(order.status) as any}
                    size={16}
                    color={getStatusColor(order.status)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.itemsSection}>
                {order.items.slice(0, 2).map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Image source={{ uri: item.product.images[0] }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                      <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
                {order.items.length > 2 && (
                  <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
                )}
              </View>

              {/* Order Summary */}
              <View style={styles.orderSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={styles.summaryValue}>₦{order.total.toLocaleString()}</Text>
                </View>

                {order.trackingNumber && (
                  <View style={styles.trackingInfo}>
                    <Ionicons name="location" size={16} color="#3498db" />
                    <Text style={styles.trackingText}>Tracking: {order.trackingNumber}</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // Navigate to order details
                    Alert.alert('Order Details', 'Order details screen coming soon!');
                  }}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#3498db" />
                  <Text style={styles.actionButtonText}>Details</Text>
                </TouchableOpacity>

                {order.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelOrder(order.id)}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#e74c3c" />
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'delivered' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      // Navigate to review screen
                      Alert.alert('Review', 'Review feature coming soon!');
                    }}
                  >
                    <Ionicons name="star-outline" size={18} color="#f39c12" />
                    <Text style={styles.actionButtonText}>Review</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#3498db',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemsSection: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3498db',
  },
  moreItems: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3498db',
    marginTop: 4,
  },
  orderSummary: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3498db',
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  trackingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3498db',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3498db',
  },
  cancelButton: {
    backgroundColor: '#fff5f5',
  },
  cancelButtonText: {
    color: '#e74c3c',
  },
  bottomPadding: {
    height: 40,
  },
});

export default GadgetsOrderTrackingScreen;
