import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { menuAPI } from '../../services/api';
import ReportContentModal from '../../components/ReportContentModal';
import { useCart } from '../../contexts/CartContext';
import { hapticImpact } from '../../utils/haptics';
import { normalizeMenuItems } from '../../services/mockApi';

export default function RestaurantScreen({ route, navigation }: any) {
  const { restaurant } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { addItem, items, updateQuantity, removeItem, itemCount, subtotal } = useCart();

  const getItemQty = (menuItemId: string) => {
    const found = items.find(i => i.menuItemId === menuItemId);
    return found?.quantity || 0;
  };

  const handleQuickAdd = (item: any) => {
    hapticImpact('light');
    addItem(
      { id: restaurant.id, name: restaurant.name, image: restaurant.image },
      { menuItemId: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 }
    );
  };

  const handleQuickRemove = (item: any) => {
    hapticImpact('light');
    const qty = getItemQty(item.id);
    if (qty <= 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, qty - 1);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await menuAPI.getItems(restaurant.id);
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMenuItems(normalizeMenuItems(data));
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
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
      <View>
        <Image source={{ uri: item.image }} style={styles.menuItemImage} />
        {getItemQty(item.id) === 0 ? (
          <TouchableOpacity style={styles.quickAddBtn} onPress={() => handleQuickAdd(item)}>
            <Ionicons name="add" size={18} color={colors.textWhite} />
          </TouchableOpacity>
        ) : (
          <View style={styles.quickQtyRow}>
            <TouchableOpacity style={styles.quickQtyBtn} onPress={() => handleQuickRemove(item)}>
              <Ionicons name={getItemQty(item.id) <= 1 ? 'trash-outline' : 'remove'} size={14} color={colors.textWhite} />
            </TouchableOpacity>
            <Text style={styles.quickQtyText}>{getItemQty(item.id)}</Text>
            <TouchableOpacity style={styles.quickQtyBtn} onPress={() => handleQuickAdd(item)}>
              <Ionicons name="add" size={14} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        )}
      </View>
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
          <TouchableOpacity style={styles.shareBtn} onPress={() => Share.share({ message: `Check out ${restaurant.name} on Fulccrum!`, title: restaurant.name })}>
            <Ionicons name="share-outline" size={24} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareBtn, { right: 60 }]} onPress={() => setShowReport(true)}>
            <Ionicons name="flag-outline" size={22} color={colors.textWhite} />
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
            {(restaurant.dietaryOptions || ['Gluten Free', 'Halal', 'Vegan Options']).map((d: string, i: number) => (
              <View key={i} style={styles.dietaryBadge}>
                <Text style={styles.dietaryText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Restaurant Info Toggle */}
          <TouchableOpacity style={styles.infoToggle} onPress={() => setShowInfo(!showInfo)}>
            <Ionicons name="information-circle-outline" size={18} color={colors.teal} />
            <Text style={styles.infoToggleText}>{showInfo ? 'Hide Info' : 'Restaurant Info'}</Text>
            <Ionicons name={showInfo ? 'chevron-up' : 'chevron-down'} size={16} color={colors.teal} />
          </TouchableOpacity>

          {showInfo && (
            <View style={styles.infoPanel}>
              {restaurant.address && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color={colors.textLight} />
                  <Text style={styles.infoText}>{restaurant.address}</Text>
                </View>
              )}
              {restaurant.phone && (
                <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${restaurant.phone}`)}>
                  <Ionicons name="call-outline" size={18} color={colors.textLight} />
                  <Text style={[styles.infoText, { color: colors.teal }]}>{restaurant.phone}</Text>
                </TouchableOpacity>
              )}
              {(restaurant.businessHours || restaurant.hours) && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={18} color={colors.textLight} />
                  <Text style={styles.infoText}>
                    {typeof (restaurant.businessHours || restaurant.hours) === 'string'
                      ? (restaurant.businessHours || restaurant.hours)
                      : 'Mon-Sun: 8:00 AM - 10:00 PM'}
                  </Text>
                </View>
              )}
              {restaurant.minimumOrder && (
                <View style={styles.infoRow}>
                  <Ionicons name="cart-outline" size={18} color={colors.textLight} />
                  <Text style={styles.infoText}>Min. order: ₦{Number(restaurant.minimumOrder).toLocaleString()}</Text>
                </View>
              )}
              {!restaurant.address && !restaurant.phone && !restaurant.businessHours && !restaurant.hours && !restaurant.minimumOrder && (
                <Text style={styles.infoText}>No additional info available</Text>
              )}
            </View>
          )}
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

        {/* Popular Items */}
        {menuItems.filter((i: any) => i.isPopular).length > 0 && selectedCategory === 'All' && (
          <View style={styles.popularSection}>
            <Text style={styles.popularSectionTitle}>🔥 Most Popular</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {menuItems.filter((i: any) => i.isPopular).slice(0, 5).map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.popularCard}
                  onPress={() => navigation.navigate('MenuItem', { item, restaurant })}
                >
                  <Image source={{ uri: item.image }} style={styles.popularCardImage} />
                  <Text style={styles.popularCardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.popularCardPrice}>₦{item.price?.toFixed(0)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {filteredItems.map((item) => (
            <View key={item.id}>{renderMenuItem({ item })}</View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <ReportContentModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        contentType="business_profile"
        resourceId={restaurant.id}
        resourceName={restaurant.name}
      />

      {/* Floating Cart Bar */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCartBar}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{itemCount}</Text>
          </View>
          <Text style={styles.cartBarText}>View Cart</Text>
          <Text style={styles.cartBarPrice}>₦{subtotal.toLocaleString()}</Text>
        </TouchableOpacity>
      )}
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
  quickAddBtn: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickQtyRow: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: 16,
    paddingHorizontal: 2,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickQtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickQtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textWhite,
    minWidth: 16,
    textAlign: 'center',
  },
  infoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.teal + '08',
    borderRadius: 10,
  },
  infoToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
  infoPanel: {
    marginTop: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  popularSection: {
    marginBottom: 12,
  },
  popularSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  popularCard: {
    width: 120,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  popularCardImage: {
    width: '100%',
    height: 80,
  },
  popularCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  popularCardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal,
    paddingHorizontal: 8,
    paddingBottom: 8,
    marginTop: 2,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: colors.teal,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  cartBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cartBarText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cartBarPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
