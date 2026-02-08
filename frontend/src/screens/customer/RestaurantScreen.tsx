import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { mockMenuItems } from '../../data/mockData';
import { menuAPI } from '../../services/api';

export default function RestaurantScreen({ route, navigation }: any) {
  const { restaurant } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState(mockMenuItems);

  useEffect(() => {
    (async () => {
      try {
        const res = await menuAPI.getItems(restaurant.id);
        if (res?.length) setMenuItems(res);
      } catch {}
    })();
  }, [restaurant.id]);

  const categories = ['All', ...new Set(menuItems.map((item: any) => item.category))];

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item: any) => item.category === selectedCategory);

  const renderMenuItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate('MenuItem', { item, restaurant })}
    >
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.menuItemMeta}>
          <Text style={styles.menuItemPrice}>₦{item.price.toFixed(2)}</Text>
          <View style={styles.caloriesBadge}>
            <Ionicons name="flame-outline" size={12} color={colors.warning} />
            <Text style={styles.caloriesText}>{item.calories} cal</Text>
          </View>
        </View>
        {item.isPopular && (
          <View style={styles.popularBadge}>
            <Ionicons name="trending-up" size={12} color={colors.teal} />
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Restaurant Header Image */}
        <View style={styles.headerImage}>
          <Image source={{ uri: restaurant.image }} style={styles.coverImage} />
          <View style={styles.headerOverlay} />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={24} color={colors.textWhite} />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color={colors.warning} />
              <Text style={styles.statValue}>{restaurant.rating}</Text>
              <Text style={styles.statLabel}>({restaurant.reviewCount})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={colors.teal} />
              <Text style={styles.statValue}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="bicycle-outline" size={18} color={colors.teal} />
              <Text style={styles.statValue}>{restaurant.deliveryFee}</Text>
            </View>
          </View>

          {/* Visual Stories */}
          <TouchableOpacity style={styles.storiesBar}>
            <View style={styles.storyDots}>
              <View style={[styles.storyDot, { backgroundColor: colors.teal }]} />
              <View style={[styles.storyDot, { backgroundColor: colors.navy }]} />
              <View style={[styles.storyDot, { backgroundColor: colors.warning }]} />
            </View>
            <Text style={styles.storiesText}>View Stories</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.teal} />
          </TouchableOpacity>

          {/* Dietary Badges */}
          <View style={styles.dietaryRow}>
            <View style={styles.dietaryBadge}>
              <Text style={styles.dietaryText}>Gluten Free</Text>
            </View>
            <View style={styles.dietaryBadge}>
              <Text style={styles.dietaryText}>Halal</Text>
            </View>
            <View style={styles.dietaryBadge}>
              <Text style={styles.dietaryText}>Vegan Options</Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilter}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {filteredItems.map((item) => (
            <View key={item.id}>{renderMenuItem({ item })}</View>
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
  headerImage: {
    height: 220,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cuisineText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textLight,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  storiesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  storyDots: {
    flexDirection: 'row',
    gap: 4,
  },
  storyDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  storiesText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dietaryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dietaryBadge: {
    backgroundColor: colors.teal + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dietaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textWhite,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
    marginBottom: 8,
  },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.teal,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  caloriesText: {
    fontSize: 12,
    color: colors.textLight,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
});
