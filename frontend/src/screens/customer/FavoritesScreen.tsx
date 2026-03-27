import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { favoritesAPI, resolveMediaUrl } from '../../services/api';

export default function FavoritesScreen({ navigation }: any) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadFavorites = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await favoritesAPI.getAll();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setFavorites(data);
    } catch (e: any) {
      if (!isRefresh) Alert.alert('Error', e?.message || 'Could not load favorites');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadFavorites(); }, []);

  const handleRemoveFavorite = (fav: any) => {
    const businessId = fav.businessId || fav.business?.userId;
    if (!businessId) return;
    Alert.alert('Remove Favorite', `Remove ${fav.business?.businessName || 'this restaurant'} from favorites?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          setRemoving(fav.id);
          try {
            await favoritesAPI.remove(businessId);
            setFavorites(prev => prev.filter(f => f.id !== fav.id));
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not remove favorite');
          }
          setRemoving(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
          <Ionicons name="heart-outline" size={56} color={colors.textLight} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 }}>No Favorites Yet</Text>
          <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8 }}>
            Tap the heart icon on any restaurant to save it here for quick access.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 24 }}
            onPress={() => navigation.navigate('HomeTabs', { screen: 'Search' })}
          >
            <Text style={{ color: colors.textWhite, fontWeight: '700', fontSize: 15 }}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFavorites(true)} tintColor={colors.teal} />}
        >
          {favorites.map((fav) => {
            const biz = fav.business;
            if (!biz) return null;
            const imageUri = resolveMediaUrl(biz.coverImageUrl) || resolveMediaUrl(biz.logoUrl);
            return (
              <TouchableOpacity
                key={fav.id}
                style={styles.restaurantCard}
                onPress={() => navigation.navigate('Restaurant', { businessId: biz.userId })}
                activeOpacity={0.8}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri! }} style={styles.restaurantImage} />
                ) : (
                  <View style={[styles.restaurantImage, { backgroundColor: colors.navy + '15', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="storefront" size={36} color={colors.navy} />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.heartBtn, removing === fav.id && { opacity: 0.4 }]}
                  onPress={() => handleRemoveFavorite(fav)}
                  disabled={removing === fav.id}
                >
                  {removing === fav.id ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Ionicons name="heart" size={20} color={colors.error} />
                  )}
                </TouchableOpacity>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{biz.businessName}</Text>
                  {biz.description ? <Text style={styles.restaurantCuisine} numberOfLines={1}>{biz.description}</Text> : null}
                  <View style={styles.restaurantMeta}>
                    {biz.rating != null && (
                      <View style={styles.metaItem}>
                        <Ionicons name="star" size={14} color={colors.warning} />
                        <Text style={styles.metaText}>{Number(biz.rating).toFixed(1)}</Text>
                      </View>
                    )}
                    {biz.averagePreparationTime != null && (
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textLight} />
                        <Text style={styles.metaText}>{biz.averagePreparationTime} min</Text>
                      </View>
                    )}
                    {biz.deliveryFee != null && (
                      <View style={styles.metaItem}>
                        <Ionicons name="bicycle-outline" size={14} color={colors.textLight} />
                        <Text style={styles.metaText}>₦{Number(biz.deliveryFee).toLocaleString()}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
});
