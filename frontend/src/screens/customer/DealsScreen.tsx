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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { promosAPI, searchAPI, resolveMediaUrl } from '../../services/api';
import { normalizeRestaurants } from '../../services/mockApi';

type Deal = {
  id: string;
  title: string;
  description: string;
  code?: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrder?: number;
  expiresAt?: string;
  image?: string;
  restaurant?: { id: string; name: string; image?: string };
};

export default function DealsScreen({ navigation }: any) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [freeDeliveryRestaurants, setFreeDeliveryRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'deals' | 'free_delivery'>('deals');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dealsRes, restaurantsRes] = await Promise.allSettled([
        promosAPI.getActive(),
        searchAPI.searchBusinesses(''),
      ]);

      if (dealsRes.status === 'fulfilled') {
        const data = Array.isArray(dealsRes.value?.data) ? dealsRes.value.data : Array.isArray(dealsRes.value) ? dealsRes.value : [];
        setDeals(data);
      }
      if (restaurantsRes.status === 'fulfilled') {
        const raw = Array.isArray(restaurantsRes.value?.data) ? restaurantsRes.value.data : Array.isArray(restaurantsRes.value) ? restaurantsRes.value : [];
        const data = normalizeRestaurants(raw);
        setFreeDeliveryRestaurants(data.filter((r: any) => !r.deliveryFee || r.deliveryFee === 'Free' || r.deliveryFee === 0 || r.deliveryFee === '₦0'));
      }
    } catch {}
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDaysLeft = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deals & Offers</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'deals' && styles.tabActive]}
          onPress={() => setActiveTab('deals')}
        >
          <Ionicons name="pricetag" size={16} color={activeTab === 'deals' ? colors.textWhite : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'deals' && styles.tabTextActive]}>Promos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'free_delivery' && styles.tabActive]}
          onPress={() => setActiveTab('free_delivery')}
        >
          <Ionicons name="bicycle" size={16} color={activeTab === 'free_delivery' ? colors.textWhite : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'free_delivery' && styles.tabTextActive]}>Free Delivery</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
      >
        {activeTab === 'deals' ? (
          <>
            {deals.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="pricetag-outline" size={60} color={colors.textLight} />
                <Text style={styles.emptyTitle}>No deals right now</Text>
                <Text style={styles.emptySubtext}>Check back later for new offers!</Text>
              </View>
            ) : (
              deals.map((deal) => (
                <TouchableOpacity
                  key={deal.id}
                  style={styles.dealCard}
                  onPress={() => deal.restaurant && navigation.navigate('Restaurant', { restaurant: deal.restaurant })}
                >
                  {deal.image && <Image source={{ uri: resolveMediaUrl(deal.image) || deal.image }} style={styles.dealImage} />}
                  <View style={styles.dealInfo}>
                    <View style={styles.dealBadge}>
                      <Text style={styles.dealBadgeText}>
                        {deal.discountPercent ? `${deal.discountPercent}% OFF` : deal.discountAmount ? `₦${deal.discountAmount} OFF` : 'DEAL'}
                      </Text>
                    </View>
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                    <Text style={styles.dealDesc}>{deal.description}</Text>
                    {deal.code && (
                      <View style={styles.codeRow}>
                        <Ionicons name="ticket" size={14} color={colors.teal} />
                        <Text style={styles.codeText}>Code: {deal.code}</Text>
                      </View>
                    )}
                    <View style={styles.dealMeta}>
                      {deal.minOrder ? <Text style={styles.dealMetaText}>Min. ₦{deal.minOrder.toLocaleString()}</Text> : null}
                      {getDaysLeft(deal.expiresAt) && (
                        <Text style={[styles.dealMetaText, getDaysLeft(deal.expiresAt) === 'Expired' && { color: colors.error }]}>
                          {getDaysLeft(deal.expiresAt)}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <>
            {freeDeliveryRestaurants.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bicycle-outline" size={60} color={colors.textLight} />
                <Text style={styles.emptyTitle}>No free delivery offers</Text>
                <Text style={styles.emptySubtext}>Check back later!</Text>
              </View>
            ) : (
              freeDeliveryRestaurants.map((r: any) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.freeDeliveryCard}
                  onPress={() => navigation.navigate('Restaurant', { restaurant: r })}
                >
                  <Image source={{ uri: r.image }} style={styles.freeDeliveryImage} />
                  <View style={styles.freeDeliveryInfo}>
                    <Text style={styles.freeDeliveryName}>{r.name}</Text>
                    <Text style={styles.freeDeliveryCuisine}>{r.cuisine}</Text>
                    <View style={styles.freeDeliveryBadge}>
                      <Ionicons name="bicycle" size={14} color={colors.success} />
                      <Text style={styles.freeDeliveryBadgeText}>Free Delivery</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 64, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.white },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  dealCard: { backgroundColor: colors.white, marginHorizontal: 20, marginBottom: 12, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  dealImage: { width: '100%', height: 140 },
  dealInfo: { padding: 16 },
  dealBadge: { backgroundColor: colors.error, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  dealBadgeText: { fontSize: 12, fontWeight: '700', color: colors.textWhite },
  dealTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  dealDesc: { fontSize: 13, color: colors.textLight, marginBottom: 8 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.teal + '10', padding: 8, borderRadius: 8, marginBottom: 8 },
  codeText: { fontSize: 14, fontWeight: '700', color: colors.teal },
  dealMeta: { flexDirection: 'row', gap: 12 },
  dealMetaText: { fontSize: 12, color: colors.textLight },
  freeDeliveryCard: { flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 12, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  freeDeliveryImage: { width: 80, height: 80, borderRadius: 10 },
  freeDeliveryInfo: { flex: 1, justifyContent: 'center' },
  freeDeliveryName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  freeDeliveryCuisine: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  freeDeliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  freeDeliveryBadgeText: { fontSize: 12, fontWeight: '600', color: colors.success },
});
