import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { searchAPI, analyticsAPI, addressesAPI, notificationsAPI } from '../../services/api';
import { withMock, mockSearchBusinesses, mockGetTrending, mockGetNotifications, normalizeRestaurants } from '../../services/mockApi';
import { mockAddresses } from '../../services/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getActiveCategories } from '../../config/businessCategories';

const categories = getActiveCategories().map((c, i) => ({
  id: String(i + 1),
  name: c.label,
  icon: c.icon,
}));

const moods = [
  { id: '1', name: 'Craving Pizza?', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', color: '#ff6b35' },
  { id: '2', name: 'Healthy Lunch', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', color: '#2ecc71' },
  { id: '3', name: 'Date Night', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop', color: '#e74c3c' },
  { id: '4', name: 'Comfort Food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', color: '#f39c12' },
];

const { width } = Dimensions.get('window');

// Helper: check if a business is currently open
const isBusinessOpen = (restaurant: any) => {
  if (restaurant.isOpen === false) return false;
  if (restaurant.isOpen === true) return true;
  // Check business hours if available
  if (restaurant.businessHours) {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' as any }).toLowerCase();
    const hours = restaurant.businessHours[day] || restaurant.businessHours;
    if (hours?.open && hours?.close) {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const openTime = parseInt(hours.open.replace(':', ''));
      const closeTime = parseInt(hours.close.replace(':', ''));
      return currentTime >= openTime && currentTime <= closeTime;
    }
  }
  return true; // Default to open if no hours data
};

// Helper: price range indicator
const getPriceRange = (restaurant: any) => {
  if (restaurant.priceRange) return restaurant.priceRange;
  const avg = restaurant.averagePrice || restaurant.avgPrice || 0;
  if (avg >= 5000) return '₦₦₦';
  if (avg >= 2000) return '₦₦';
  return '₦';
};

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [defaultAddress, setDefaultAddress] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRestaurants();
    loadTrending();
    loadAddress();
    loadNotifCount();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadRestaurants(), loadTrending(), loadAddress(), loadNotifCount()]);
    setRefreshing(false);
  }, []);

  const loadAddress = async () => {
    try {
      const res = await withMock(
        () => addressesAPI.getAll(),
        () => mockAddresses
      );
      const addrs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const def = addrs.find((a: any) => a.isDefault) || addrs[0];
      if (def) setDefaultAddress(`${def.streetAddress}${def.city ? `, ${def.city}` : ''}`);
    } catch {}
  };

  const loadNotifCount = async () => {
    try {
      const res = await withMock(
        () => notificationsAPI.getAll(),
        () => mockGetNotifications()
      );
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNotifCount(data.filter((n: any) => !n.isRead).length);
    } catch {}
  };

  const loadRestaurants = async () => {
    try {
      const res = await withMock(
        () => searchAPI.searchBusinesses(''),
        () => mockSearchBusinesses('')
      );
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRestaurants(normalizeRestaurants(data));
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not load restaurants'); }
  };

  const loadTrending = async () => {
    try {
      const res = await withMock(
        () => analyticsAPI.topPerformers('menu_items', 5),
        () => mockGetTrending()
      );
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setTrendingItems(data);
    } catch { /* trending is optional */ }
  };

  const renderMoodCard = ({ item }: any) => (
    <TouchableOpacity style={styles.moodCard} onPress={() => navigation.navigate('Search', { query: item.name })}>
      <Image source={{ uri: item.image }} style={styles.moodImage} />
      <View style={[styles.moodOverlay, { backgroundColor: item.color + '99' }]}>
        <Text style={styles.moodText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('CategoryBrowse', { category: item.name })}>
      <View style={styles.categoryIcon}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color={colors.teal}
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderRestaurant = ({ item }: any) => {
    const open = isBusinessOpen(item);
    const priceRange = getPriceRange(item);
    return (
      <TouchableOpacity
        style={[styles.restaurantCard, !open && styles.restaurantCardClosed]}
        onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
      >
        <View>
          <Image source={{ uri: item.image }} style={[styles.restaurantImage, !open && { opacity: 0.5 }]} />
          {!open && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
          {open && item.deliveryTime && (
            <View style={styles.etaChip}>
              <Ionicons name="time" size={12} color={colors.textWhite} />
              <Text style={styles.etaChipText}>{item.deliveryTime}</Text>
            </View>
          )}
        </View>
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
                {open ? (
                  <View style={styles.openBadge}><Text style={styles.openBadgeText}>Open</Text></View>
                ) : (
                  <View style={styles.closedBadge}><Text style={styles.closedBadgeText}>Closed</Text></View>
                )}
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          {item.cuisine ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Text style={styles.cuisineText}>{item.cuisine}</Text>
              <Text style={styles.priceRangeText}>{priceRange}</Text>
            </View>
          ) : null}
          <View style={styles.restaurantMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textLight} />
              <Text style={styles.metaText}>{item.deliveryTime || '25-35 min'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={14} color={colors.textLight} />
              <Text style={styles.metaText}>{item.deliveryFee || 'Free'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textLight} />
              <Text style={styles.metaText}>{item.distance || '—'}</Text>
            </View>
            {item.minimumOrder ? (
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>Min ₦{Number(item.minimumOrder).toLocaleString()}</Text>
              </View>
            ) : null}
          </View>
          {(item.tags?.length ?? 0) > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTrending = ({ item }: any) => (
    <TouchableOpacity style={styles.trendingCard}>
      <Image source={{ uri: item.image }} style={styles.trendingImage} />
      <Text style={styles.trendingName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.trendingRestaurant}>{item.restaurant}</Text>
      <Text style={styles.trendingOrders}>{item.ordersToday} orders today</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName || 'there'}!</Text>
            <TouchableOpacity style={styles.addressRow} onPress={() => navigation.navigate('Address')}>
              <Ionicons name="location" size={16} color={colors.tealLight} />
              <Text style={styles.addressText} numberOfLines={1}>{defaultAddress || 'Set delivery address'}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.tealLight} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {itemCount > 0 && (
              <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Cart')}>
                <Ionicons name="cart" size={24} color={colors.textWhite} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={24} color={colors.textWhite} />
              {notifCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for stores or items"
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onFocus={() => { navigation.navigate('Search'); }}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color={colors.teal} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
      >
        {/* Categories */}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Mood Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you in the mood for?</Text>
          <FlatList
            data={moods}
            renderItem={renderMoodCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodList}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Orders')}>
            <Ionicons name="refresh" size={20} color={colors.teal} />
            <Text style={styles.quickActionText}>Reorder Last Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('GroupOrder')}>
            <Ionicons name="people" size={20} color={colors.teal} />
            <Text style={styles.quickActionText}>Group Order</Text>
          </TouchableOpacity>
        </View>

        {/* Advanced Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover More</Text>
          <View style={styles.advGrid}>
            <TouchableOpacity style={styles.advCard} onPress={() => navigation.navigate('AIRecommendations')}>
              <View style={[styles.advIcon, { backgroundColor: '#8b5cf615' }]}>
                <Ionicons name="sparkles" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.advLabel}>AI For You</Text>
              <Text style={styles.advDesc}>Personalized picks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.advCard} onPress={() => navigation.navigate('VoiceOrdering')}>
              <View style={[styles.advIcon, { backgroundColor: '#ec489915' }]}>
                <Ionicons name="mic" size={24} color="#ec4899" />
              </View>
              <Text style={styles.advLabel}>Voice Order</Text>
              <Text style={styles.advDesc}>Order by speaking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.advCard} onPress={() => navigation.navigate('ARFoodPreview')}>
              <View style={[styles.advIcon, { backgroundColor: '#f59e0b15' }]}>
                <Ionicons name="cube" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.advLabel}>AR Preview</Text>
              <Text style={styles.advDesc}>See your food in 3D</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.advCard} onPress={() => navigation.navigate('SocialFeed')}>
              <View style={[styles.advIcon, { backgroundColor: '#3b82f615' }]}>
                <Ionicons name="people-circle" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.advLabel}>Community</Text>
              <Text style={styles.advDesc}>Food posts & tips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.advCard} onPress={() => navigation.navigate('Sustainability')}>
              <View style={[styles.advIcon, { backgroundColor: '#10b98115' }]}>
                <Ionicons name="leaf" size={24} color="#10b981" />
              </View>
              <Text style={styles.advLabel}>Eco Impact</Text>
              <Text style={styles.advDesc}>Track your footprint</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <FlatList
            data={trendingItems}
            renderItem={renderTrending}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
          />
        </View>

        {/* Popular Near You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Near You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          {restaurants.map((restaurant) => (
            <View key={restaurant.id}>
              {renderRestaurant({ item: restaurant })}
            </View>
          ))}
        </View>

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
    backgroundColor: colors.navy,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    color: colors.tealLight,
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
  moodList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  moodCard: {
    width: 160,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  moodImage: {
    width: '100%',
    height: '100%',
  },
  moodOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 12,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  trendingList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  trendingCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingImage: {
    width: '100%',
    height: 100,
  },
  trendingName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  trendingRestaurant: {
    fontSize: 11,
    color: colors.textLight,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  trendingOrders: {
    fontSize: 11,
    color: colors.teal,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingBottom: 8,
    marginTop: 4,
  },
  restaurantCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantCardClosed: {
    opacity: 0.75,
  },
  restaurantImage: {
    width: '100%',
    height: 160,
  },
  closedOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textWhite,
  },
  etaChip: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  etaChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textWhite,
  },
  openBadge: {
    backgroundColor: colors.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  closedBadge: {
    backgroundColor: colors.error + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.error,
  },
  priceRangeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal,
  },
  restaurantInfo: {
    padding: 14,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cuisineText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textLight,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.teal + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.teal,
  },
  advGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  advCard: {
    width: '31%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    flexGrow: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  advIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  advLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  advDesc: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
});
