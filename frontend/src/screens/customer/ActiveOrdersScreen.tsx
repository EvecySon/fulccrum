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

interface ActiveOrder {
  id: string;
  orderNumber: string;
  status: 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT';
  pickupAddress: string;
  dropoffAddress: string;
  packageSize: string;
  totalAmount: number;
  createdAt: string;
  eta?: number;
  courier: {
    name: string;
    phone: string;
    rating: number;
    avatarUrl?: string;
  };
}

const ActiveOrdersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);

  useEffect(() => {
    loadActiveOrders();
  }, []);

  const loadActiveOrders = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockActiveOrders: ActiveOrder[] = [
        {
          id: 'PKG1773535247769',
          orderNumber: 'PKG1773535247769',
          status: 'IN_TRANSIT',
          pickupAddress: 'Victoria Island, Lagos',
          dropoffAddress: 'Lekki Phase 1, Lagos',
          packageSize: 'medium',
          totalAmount: 2500,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          eta: 12,
          courier: {
            name: 'John Doe',
            phone: '+234 801 234 5678',
            rating: 4.8,
          },
        },
        {
          id: 'PKG1773535247770',
          orderNumber: 'PKG1773535247770',
          status: 'ACCEPTED',
          pickupAddress: 'Ikeja GRA, Lagos',
          dropoffAddress: 'Surulere, Lagos',
          packageSize: 'small',
          totalAmount: 1800,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          eta: 25,
          courier: {
            name: 'Jane Smith',
            phone: '+234 802 345 6789',
            rating: 4.9,
          },
        },
      ];
      
      setActiveOrders(mockActiveOrders);
    } catch (error) {
      console.error('Load active orders error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActiveOrders();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          label: 'Courier on the way',
          color: '#14b8a6',
          icon: 'bicycle',
          bgColor: '#f0fdfa',
        };
      case 'PICKED_UP':
        return {
          label: 'Package picked up',
          color: '#8b5cf6',
          icon: 'cube',
          bgColor: '#f5f3ff',
        };
      case 'IN_TRANSIT':
        return {
          label: 'In transit',
          color: '#3b82f6',
          icon: 'navigate',
          bgColor: '#eff6ff',
        };
      default:
        return {
          label: 'Processing',
          color: '#6b7280',
          icon: 'time',
          bgColor: '#f9fafb',
        };
    }
  };

  const handleTrackOrder = (order: ActiveOrder) => {
    (navigation as any).navigate('TrackDelivery', {
      orderId: order.id,
      courier: order.courier,
    });
  };

  const renderOrderCard = ({ item }: { item: ActiveOrder }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleTrackOrder(item)}
        activeOpacity={0.7}
      >
        {/* Status Header */}
        <LinearGradient
          colors={[statusInfo.color, statusInfo.color + 'CC']}
          style={styles.statusHeader}
        >
          <View style={styles.statusLeft}>
            <Ionicons name={statusInfo.icon as any} size={24} color="#fff" />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>{statusInfo.label}</Text>
              <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            </View>
          </View>
          {item.eta && (
            <View style={styles.etaBadge}>
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={styles.etaText}>{item.eta} min</Text>
            </View>
          )}
        </LinearGradient>

        {/* Route */}
        <View style={styles.routeContainer}>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>PICKUP</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>
                {item.pickupAddress}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>DROPOFF</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>
                {item.dropoffAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Courier Info */}
        <View style={styles.courierSection}>
          <View style={styles.courierInfo}>
            <View style={styles.courierAvatar}>
              <Ionicons name="person" size={20} color="#14b8a6" />
            </View>
            <View style={styles.courierDetails}>
              <Text style={styles.courierName}>{item.courier.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.rating}>{item.courier.rating}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.packageInfo}>
            <Ionicons name="cube-outline" size={16} color="#6b7280" />
            <Text style={styles.packageSize}>{item.packageSize}</Text>
          </View>
          <Text style={styles.amount}>₦{item.totalAmount.toLocaleString()}</Text>
        </View>

        {/* Track Button */}
        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Track Live</Text>
          <Ionicons name="arrow-forward" size={18} color="#14b8a6" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-done-circle-outline" size={80} color="#e5e7eb" />
      <Text style={styles.emptyTitle}>No Active Deliveries</Text>
      <Text style={styles.emptyText}>
        You don't have any packages in transit right now
      </Text>
      <TouchableOpacity
        style={styles.sendPackageButton}
        onPress={() => (navigation as any).navigate('SendPackageHome')}
      >
        <Text style={styles.sendPackageButtonText}>Send a Package</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => (navigation as any).navigate('PackageHistory')}
      >
        <Text style={styles.historyButtonText}>View History</Text>
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
          <Text style={styles.headerTitle}>Active Orders</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14b8a6" />
          <Text style={styles.loadingText}>Loading active orders...</Text>
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
        <Text style={styles.headerTitle}>Active Orders</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#14b8a6" />
        </TouchableOpacity>
      </View>

      {/* Active Count Badge */}
      {activeOrders.length > 0 && (
        <View style={styles.countBadge}>
          <LinearGradient colors={['#14b8a6', '#0d9488']} style={styles.countGradient}>
            <Ionicons name="bicycle" size={24} color="#fff" />
            <Text style={styles.countText}>
              {activeOrders.length} {activeOrders.length === 1 ? 'delivery' : 'deliveries'} in progress
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Orders List */}
      <FlatList
        data={activeOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14b8a6" />
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
  countBadge: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  countGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusInfo: {
    marginLeft: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  orderNumber: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
  },
  routeContainer: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginLeft: 5,
    marginVertical: 4,
  },
  courierSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#14b8a6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#f0fdfa',
    borderTopWidth: 1,
    borderTopColor: '#14b8a6',
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14b8a6',
    marginRight: 8,
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
    marginBottom: 12,
  },
  sendPackageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  historyButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#14b8a6',
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14b8a6',
  },
});

export default ActiveOrdersScreen;
