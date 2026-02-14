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
import { mockAvailableDeliveries } from '../../data/mockData';
import { courierOrdersAPI } from '../../services/api';

const filters = ['All', 'Nearby', 'High Pay', 'Quick'];

export default function DeliveriesScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [deliveries, setDeliveries] = useState(mockAvailableDeliveries);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeliveries = useCallback(async () => {
    try {
      const res = await courierOrdersAPI.getAvailable(activeFilter !== 'All' ? activeFilter.toLowerCase() : undefined);
      const data = res?.data ?? res;
      if (Array.isArray(data) && data.length) setDeliveries(data);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeliveries();
    setRefreshing(false);
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (activeFilter === 'Nearby') return d.distance <= 2;
    if (activeFilter === 'High Pay') return d.pay >= 10;
    if (activeFilter === 'Quick') return d.estimatedTime <= 20;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Deliveries</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{deliveries.length} nearby</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((filter) => (
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

      {/* Map Placeholder */}
      <View style={styles.mapCard}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={36} color={colors.textLight} />
          <Text style={styles.mapText}>Live Map View</Text>
          <Text style={styles.mapSubtext}>Showing {filteredDeliveries.length} deliveries nearby</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
      >
        {filteredDeliveries.map((delivery) => (
          <View key={delivery.id} style={styles.deliveryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.restaurantRow}>
                <View style={styles.restaurantIcon}>
                  <Ionicons name="storefront" size={18} color={colors.navy} />
                </View>
                <View>
                  <Text style={styles.restaurantName}>{delivery.restaurant}</Text>
                  <Text style={styles.itemsText}>{delivery.items}</Text>
                </View>
              </View>
              <View style={styles.payBadge}>
                <Text style={styles.payText}>₦{delivery.pay.toFixed(2)}</Text>
              </View>
            </View>

            {/* Route */}
            <View style={styles.routeSection}>
              <View style={styles.routePoint}>
                <View style={styles.routeDotPickup} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>Pickup</Text>
                  <Text style={styles.routeAddress}>{delivery.pickupAddress}</Text>
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={styles.routeDotDrop} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>Drop-off</Text>
                  <Text style={styles.routeAddress}>{delivery.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            {/* Meta */}
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="navigate-outline" size={14} color={colors.textLight} />
                <Text style={styles.metaText}>{delivery.distance} km</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textLight} />
                <Text style={styles.metaText}>~{delivery.estimatedTime} min</Text>
              </View>
              {delivery.fitsRoute && (
                <View style={styles.fitsRouteBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                  <Text style={styles.fitsRouteText}>Fits your route</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.declineBtn}>
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn}>
                <Ionicons name="checkmark" size={18} color={colors.textWhite} />
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredDeliveries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No deliveries match</Text>
            <Text style={styles.emptySubtext}>Try a different filter or check back soon</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  headerBadge: { backgroundColor: colors.teal + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  headerBadgeText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  filterWrapper: { height: 50, marginTop: 8 },
  filterRow: { paddingHorizontal: 10, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignSelf: 'center',
  },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  mapCard: { marginHorizontal: 10, marginBottom: 8 },
  mapPlaceholder: {
    height: 140, backgroundColor: colors.white, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  mapText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  mapSubtext: { fontSize: 12, color: colors.textLight },
  content: { flex: 1, paddingHorizontal: 10 },
  deliveryCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  restaurantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  restaurantIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  restaurantName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  itemsText: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  payBadge: { backgroundColor: colors.teal, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  payText: { fontSize: 18, fontWeight: '800', color: colors.textWhite },
  routeSection: { marginBottom: 14 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDotPickup: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal },
  routeDotDrop: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  routeLine: { width: 2, height: 20, backgroundColor: colors.border, marginLeft: 4 },
  routeInfo: {},
  routeLabel: { fontSize: 11, fontWeight: '600', color: colors.textLight },
  routeAddress: { fontSize: 14, color: colors.textPrimary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: colors.textSecondary },
  fitsRouteBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  fitsRouteText: { fontSize: 12, fontWeight: '600', color: colors.success },
  cardActions: { flexDirection: 'row', gap: 10 },
  declineBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12,
    backgroundColor: colors.lightGray,
  },
  declineText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  acceptBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, backgroundColor: colors.teal, gap: 6,
  },
  acceptText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textSecondary },
  emptySubtext: { fontSize: 13, color: colors.textLight },
});
