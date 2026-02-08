import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { favoritesAPI } from '../../services/api';

const mockFavoriteRestaurants = [
  { id: '1', name: 'Burger House', cuisine: 'American · Burgers', rating: 4.7, deliveryTime: '20-30 min', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop', lastOrdered: '2 days ago' },
  { id: '2', name: 'Sushi Palace', cuisine: 'Japanese · Sushi', rating: 4.9, deliveryTime: '25-35 min', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=200&fit=crop', lastOrdered: '1 week ago' },
  { id: '3', name: 'Pizza Roma', cuisine: 'Italian · Pizza', rating: 4.5, deliveryTime: '15-25 min', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop', lastOrdered: '3 days ago' },
];

const mockFavoriteItems = [
  { id: '1', name: 'Gourmet Cheeseburger', restaurant: 'Burger House', price: 14.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', orderedCount: 8 },
  { id: '2', name: 'Spicy Tuna Roll', restaurant: 'Sushi Palace', price: 12.99, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop', orderedCount: 5 },
  { id: '3', name: 'Margherita Pizza', restaurant: 'Pizza Roma', price: 16.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop', orderedCount: 12 },
  { id: '4', name: 'Classic Fries', restaurant: 'Burger House', price: 4.99, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop', orderedCount: 15 },
];

export default function FavoritesScreen({ navigation }: any) {
  const [tab, setTab] = useState<'restaurants' | 'items'>('restaurants');
  const [favoriteRestaurants, setFavoriteRestaurants] = useState(mockFavoriteRestaurants);
  const [favoriteItems, setFavoriteItems] = useState(mockFavoriteItems);

  useEffect(() => {
    (async () => {
      try {
        const res = await favoritesAPI.getAll();
        if (res?.restaurants?.length) setFavoriteRestaurants(res.restaurants);
        if (res?.items?.length) setFavoriteItems(res.items);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabsWrapper}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'restaurants' && styles.tabActive]}
            onPress={() => setTab('restaurants')}
          >
            <Ionicons name="storefront-outline" size={16} color={tab === 'restaurants' ? colors.textWhite : colors.textSecondary} />
            <Text style={[styles.tabText, tab === 'restaurants' && styles.tabTextActive]}>Restaurants</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'items' && styles.tabActive]}
            onPress={() => setTab('items')}
          >
            <Ionicons name="fast-food-outline" size={16} color={tab === 'items' ? colors.textWhite : colors.textSecondary} />
            <Text style={[styles.tabText, tab === 'items' && styles.tabTextActive]}>Food Items</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {tab === 'restaurants' ? (
          favoriteRestaurants.map((r) => (
            <TouchableOpacity key={r.id} style={styles.restaurantCard}>
              <Image source={{ uri: r.image }} style={styles.restaurantImage} />
              <TouchableOpacity style={styles.heartBtn}>
                <Ionicons name="heart" size={20} color={colors.error} />
              </TouchableOpacity>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{r.name}</Text>
                <Text style={styles.restaurantCuisine}>{r.cuisine}</Text>
                <View style={styles.restaurantMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={styles.metaText}>{r.rating}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textLight} />
                    <Text style={styles.metaText}>{r.deliveryTime}</Text>
                  </View>
                  <Text style={styles.lastOrdered}>Last ordered {r.lastOrdered}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          favoriteItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemRestaurant}>{item.restaurant}</Text>
                <Text style={styles.itemPrice}>₦{item.price.toFixed(2)}</Text>
                <Text style={styles.itemOrdered}>Ordered {item.orderedCount} times</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.heartBtnSmall}>
                  <Ionicons name="heart" size={18} color={colors.error} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.reorderBtn}>
                  <Ionicons name="add" size={18} color={colors.textWhite} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28,
    backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  tabsWrapper: { paddingHorizontal: 10, paddingTop: 12 },
  tabs: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 14, padding: 4 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, gap: 6,
  },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  restaurantCard: {
    backgroundColor: colors.white, borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  restaurantImage: { width: '100%', height: 140 },
  heartBtn: {
    position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  restaurantInfo: { padding: 14 },
  restaurantName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  restaurantCuisine: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  lastOrdered: { fontSize: 12, color: colors.textLight, marginLeft: 'auto' },
  itemCard: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  itemImage: { width: 70, height: 70, borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  itemRestaurant: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: colors.teal, marginTop: 4 },
  itemOrdered: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  itemActions: { justifyContent: 'space-between', alignItems: 'center' },
  heartBtnSmall: { padding: 4 },
  reorderBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.teal,
    justifyContent: 'center', alignItems: 'center',
  },
});
