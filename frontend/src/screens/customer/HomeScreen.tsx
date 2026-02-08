import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import {
  mockUser,
  mockCategories,
  mockMoods,
  mockRestaurants,
  mockTrendingItems,
} from '../../data/mockData';
import { searchAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState(mockRestaurants);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const res = await searchAPI.searchBusinesses('');
      if (res?.data?.length) setRestaurants(res.data);
    } catch {}
  };

  const renderMoodCard = ({ item }: any) => (
    <TouchableOpacity style={styles.moodCard}>
      <Image source={{ uri: item.image }} style={styles.moodImage} />
      <View style={[styles.moodOverlay, { backgroundColor: item.color + '99' }]}>
        <Text style={styles.moodText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity style={styles.categoryItem}>
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

  const renderRestaurant = ({ item }: any) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
    >
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.cuisineText}>{item.cuisine}</Text>
        <View style={styles.restaurantMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} />
            <Text style={styles.metaText}>{item.deliveryTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={14} color={colors.textLight} />
            <Text style={styles.metaText}>{item.deliveryFee}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.textLight} />
            <Text style={styles.metaText}>{item.distance}</Text>
          </View>
        </View>
        {item.tags.length > 0 && (
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
            <Text style={styles.greeting}>Hello, {user?.firstName || mockUser.firstName}!</Text>
            <TouchableOpacity style={styles.addressRow}>
              <Ionicons name="location" size={16} color={colors.tealLight} />
              <Text style={styles.addressText}>Delivering to: {mockUser.address}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.tealLight} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.textWhite} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for stores or items"
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color={colors.teal} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <FlatList
          data={mockCategories}
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
            data={mockMoods}
            renderItem={renderMoodCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodList}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn}>
            <Ionicons name="refresh" size={20} color={colors.teal} />
            <Text style={styles.quickActionText}>Reorder Last Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
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
            data={mockTrendingItems}
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
  restaurantImage: {
    width: '100%',
    height: 160,
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
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
});
