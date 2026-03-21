import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';

const ACTIVE_STATUSES = ['PENDING', 'SEARCHING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'];

interface DeliveryHistoryItem {
  id: string;
  orderNumber: string;
  status: 'DELIVERED' | 'CANCELLED' | 'PENDING' | 'SEARCHING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT';
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
  const [filter, setFilter] = useState<'active' | 'all' | 'delivered' | 'cancelled'>('active');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockHistory: DeliveryHistoryItem[] = [
        {
          id: 'PKG1773635247769',
          orderNumber: 'PKG1773635247769',
          status: 'IN_TRANSIT',
          pickupAddress: 'Victoria Island, Lagos',
          dropoffAddress: 'Lekki Phase 1, Lagos',
          packageSize: 'medium',
          totalAmount: 2500,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          courier: { name: 'David Okafor', rating: 4.9 },
        },
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
          courier: { name: 'John Doe', rating: 4.8 },
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
          courier: { name: 'Jane Smith', rating: 4.9 },
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
          courier: { name: 'Mike Johnson', rating: 4.7 },
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
      case 'DELIVERED': return ACCENT;
      case 'CANCELLED': return '#ef4444';
      case 'IN_TRANSIT': return '#06b6d4';
      case 'PICKED_UP': return '#8b5cf6';
      case 'ACCEPTED': return '#3b82f6';
      case 'SEARCHING': return '#f59e0b';
      case 'PENDING': return '#f59e0b';
      default: return TEXT_DIM;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'checkmark-done-circle';
      case 'CANCELLED': return 'close-circle';
      case 'IN_TRANSIT': return 'bicycle-outline';
      case 'PICKED_UP': return 'cube-outline';
      case 'ACCEPTED': return 'checkmark-circle-outline';
      case 'SEARCHING': return 'search-outline';
      case 'PENDING': return 'time-outline';
      default: return 'time';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    if (filter === 'active') return ACTIVE_STATUSES.includes(delivery.status);
    if (filter === 'delivered') return delivery.status === 'DELIVERED';
    if (filter === 'cancelled') return delivery.status === 'CANCELLED';
    return true;
  });

  const handleViewDetails = (delivery: DeliveryHistoryItem) => {
    (navigation as any).navigate('TrackDelivery', { orderId: delivery.id });
  };

  const activeCount = deliveries.filter(d => ACTIVE_STATUSES.includes(d.status)).length;
  const completedCount = deliveries.filter(d => d.status === 'DELIVERED').length;
  const totalSpent = deliveries.reduce((sum, d) => d.status === 'DELIVERED' ? sum + d.totalAmount : sum, 0);

  const renderDeliveryItem = ({ item }: { item: DeliveryHistoryItem }) => (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'DELIVERED' ? 'rgba(20,184,166,0.12)' : 'rgba(239,68,68,0.12)' },
        ]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <View style={styles.route}>
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: ACCENT }]} />
          <Text style={styles.routeAddress} numberOfLines={1}>{item.pickupAddress}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeItem}>
          <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.routeAddress} numberOfLines={1}>{item.dropoffAddress}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.packageInfo}>
          <Ionicons name="cube-outline" size={15} color={TEXT_DIM} />
          <Text style={styles.packageSize}>{item.packageSize}</Text>
        </View>
        <Text style={styles.amount}>{'\u20A6'}{item.totalAmount.toLocaleString()}</Text>
      </View>

      {item.courier && (
        <View style={styles.courierInfo}>
          <Ionicons name="person-circle-outline" size={15} color={ACCENT} />
          <Text style={styles.courierName}>{item.courier.name}</Text>
          <Ionicons name="star" size={13} color="#f59e0b" />
          <Text style={styles.courierRating}>{item.courier.rating}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="cube-outline" size={48} color={TEXT_DIM} />
      </View>
      <Text style={styles.emptyTitle}>No Deliveries Yet</Text>
      <Text style={styles.emptyText}>Your delivery history will appear here</Text>
      <TouchableOpacity
        style={styles.sendBtn}
        onPress={() => (navigation as any).navigate('SendPackageHome')}
      >
        <Text style={styles.sendBtnText}>Send a Package</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={ACCENT} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardAccent]}>
          <Text style={[styles.statNum, { color: '#fff' }]}>{deliveries.length}</Text>
          <Text style={[styles.statLabel, { color: '#fff', opacity: 0.7 }]}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{'\u20A6'}{totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {([
          { key: 'active', label: `Active (${activeCount})` },
          { key: 'all', label: `All (${deliveries.length})` },
          { key: 'delivered', label: `Delivered (${completedCount})` },
          { key: 'cancelled', label: `Cancelled (${deliveries.filter(d => d.status === 'CANCELLED').length})` },
        ] as const).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredDeliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: TEXT_DIM,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_DARK,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  statCardAccent: {
    backgroundColor: ACCENT,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_DIM,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: CARD_DARK,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTabActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(20,184,166,0.08)',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DIM,
  },
  filterTextActive: {
    color: ACCENT,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deliveryCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderDate: {
    fontSize: 13,
    color: TEXT_DIM,
  },
  route: {
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: '#353A4A',
    marginLeft: 3,
    marginVertical: 1,
  },
  routeAddress: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#353A4A',
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  packageSize: {
    fontSize: 13,
    color: TEXT_DIM,
    textTransform: 'capitalize',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: ACCENT,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#353A4A',
    gap: 4,
  },
  courierName: {
    fontSize: 13,
    color: '#94a3b8',
    flex: 1,
  },
  courierRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_DIM,
    textAlign: 'center',
    marginBottom: 24,
  },
  sendBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PackageHistoryScreen;
