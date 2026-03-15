import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface DeliveryHistoryItem {
  id: string;
  orderNumber: string;
  status: 'DELIVERED' | 'CANCELLED';
  pickupAddress: string;
  dropoffAddress: string;
  packageSize: string;
  totalAmount: number;
  createdAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  courier?: {
    name: string;
    rating: number;
  };
}

const PackageHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockHistory: DeliveryHistoryItem[] = [
        {
          id: 'PKG1773535247769',
          orderNumber: 'PKG1773535247769',
          status: 'DELIVERED',
          pickupAddress: 'Victoria Island, Lagos',
          dropoffAddress: 'Lekki Phase 1, Lagos',
          packageSize: 'medium',
          totalAmount: 2500,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
          courier: {
            name: 'John Doe',
            rating: 4.8,
          },
        },
        {
          id: 'PKG1773435247769',
          orderNumber: 'PKG1773435247769',
          status: 'DELIVERED',
          pickupAddress: 'Ikeja GRA, Lagos',
          dropoffAddress: 'Surulere, Lagos',
          packageSize: 'small',
          totalAmount: 1800,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          courier: {
            name: 'Jane Smith',
            rating: 4.9,
          },
        },
        {
          id: 'PKG1773335247769',
          orderNumber: 'PKG1773335247769',
          status: 'CANCELLED',
          pickupAddress: 'Yaba, Lagos',
          dropoffAddress: 'Ajah, Lagos',
          packageSize: 'large',
          totalAmount: 3200,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'PKG1773235247769',
          orderNumber: 'PKG1773235247769',
          status: 'DELIVERED',
          pickupAddress: 'Maryland, Lagos',
          dropoffAddress: 'Ikoyi, Lagos',
          packageSize: 'medium',
          totalAmount: 2200,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000).toISOString(),
          courier: {
            name: 'Mike Johnson',
            rating: 4.7,
          },
        },
      ];
      
      setDeliveries(mockHistory);
    } catch (error) {
      console.error('Load history error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      case 'IN_TRANSIT': return '#14b8a6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'checkmark-done-circle';
      case 'CANCELLED': return 'close-circle';
      case 'IN_TRANSIT': return 'bicycle';
      default: return 'time';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    return delivery.status.toLowerCase() === filter;
  });

  const handleViewDetails = (delivery: DeliveryHistoryItem) => {
    (navigation as any).navigate('TrackDelivery', {
      orderId: delivery.id,
    });
  };

  const renderDeliveryItem = ({ item }: { item: DeliveryHistoryItem }) => (
    <TouchableOpacity 
      style={styles.deliveryCard}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Ionicons name={getStatusIcon(item.status) as any} size={16} color="#fff" />
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      {/* Order Info */}
      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Route */}
      <View style={styles.route}>
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.routeAddress} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.routeAddress} numberOfLines={1}>
            {item.dropoffAddress}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.packageInfo}>
          <Ionicons name="cube-outline" size={16} color="#6b7280" />
          <Text style={styles.packageSize}>{item.packageSize}</Text>
        </View>
        <Text style={styles.amount}>₦{item.totalAmount.toLocaleString()}</Text>
      </View>

      {/* Courier Info (if delivered) */}
      {item.courier && (
        <View style={styles.courierInfo}>
          <Ionicons name="person-circle-outline" size={16} color="#14b8a6" />
          <Text style={styles.courierName}>{item.courier.name}</Text>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={styles.courierRating}>{item.courier.rating}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={80} color="#e5e7eb" />
      <Text style={styles.emptyTitle}>No Deliveries Yet</Text>
      <Text style={styles.emptyText}>
        Your package delivery history will appear here
      </Text>
      <TouchableOpacity 
        style={styles.sendPackageButton}
        onPress={() => (navigation as any).navigate('SendPackageHome')}
      >
        <Text style={styles.sendPackageButtonText}>Send a Package</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14b8a6" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery History</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#14b8a6" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['#14b8a6', '#0d9488']}
          style={styles.statsCard}
        >
          <Text style={styles.statsNumber}>{deliveries.length}</Text>
          <Text style={styles.statsLabel}>Total Deliveries</Text>
        </LinearGradient>
        <View style={styles.statsCard}>
          <Text style={[styles.statsNumber, { color: '#10b981' }]}>
            {deliveries.filter(d => d.status === 'DELIVERED').length}
          </Text>
          <Text style={styles.statsLabel}>Completed</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={[styles.statsNumber, { color: '#14b8a6' }]}>
            ₦{deliveries.reduce((sum, d) => sum + d.totalAmount, 0).toLocaleString()}
          </Text>
          <Text style={styles.statsLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({deliveries.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'delivered' && styles.filterTabActive]}
          onPress={() => setFilter('delivered')}
        >
          <Text style={[styles.filterText, filter === 'delivered' && styles.filterTextActive]}>
            Delivered ({deliveries.filter(d => d.status === 'DELIVERED').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'cancelled' && styles.filterTabActive]}
          onPress={() => setFilter('cancelled')}
        >
          <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>
            Cancelled ({deliveries.filter(d => d.status === 'CANCELLED').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delivery List */}
      <FlatList
        data={filteredDeliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14b8a6"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  route: {
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#e5e7eb',
    marginLeft: 3,
    marginVertical: 2,
  },
  routeAddress: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageSize: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14b8a6',
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  courierName: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    marginRight: 8,
  },
  courierRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginLeft: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  sendPackageButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  sendPackageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PackageHistoryScreen;
