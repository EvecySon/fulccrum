import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { searchAPI } from '../../services/api';

export default function CategoryBrowseScreen({ navigation, route }: any) {
  const { category } = route.params;
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'popularity'>('distance');

  useEffect(() => {
    loadBusinesses();
  }, [category]);

  useEffect(() => {
    filterAndSort();
  }, [businesses, searchQuery, sortBy]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const res = await searchAPI.searchBusinesses(category);
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setBusinesses(data);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load businesses');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let filtered = [...businesses];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(query) ||
          b.name?.toLowerCase().includes(query) ||
          b.cuisine?.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === 'distance') {
      filtered.sort((a, b) => {
        const distA = parseFloat(a.distance?.replace(/[^\d.]/g, '') || '999');
        const distB = parseFloat(b.distance?.replace(/[^\d.]/g, '') || '999');
        return distA - distB;
      });
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
    }

    setFilteredBusinesses(filtered);
  };

  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case 'restaurants':
        return 'restaurant';
      case 'grocery':
        return 'cart';
      case 'convenience':
        return 'storefront';
      case 'pharmacy':
        return 'medical';
      default:
        return 'business';
    }
  };

  const renderBusiness = ({ item }: any) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => navigation.navigate('Restaurant', { businessId: item.id })}
    >
      <Image
        source={{ uri: item.image || item.logo || 'https://via.placeholder.com/120' }}
        style={styles.businessImage}
      />
      <View style={styles.businessInfo}>
        <Text style={styles.businessName} numberOfLines={1}>
          {item.businessName || item.name}
        </Text>
        {item.cuisine && <Text style={styles.cuisineText}>{item.cuisine}</Text>}
        <View style={styles.metaRow}>
          {item.rating && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.metaText}>{item.rating}</Text>
            </View>
          )}
          {item.deliveryTime && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textLight} />
              <Text style={styles.metaText}>{item.deliveryTime}</Text>
            </View>
          )}
          {item.distance && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textLight} />
              <Text style={styles.metaText}>{item.distance}</Text>
            </View>
          )}
        </View>
        {item.deliveryFee && (
          <Text style={styles.feeText}>Delivery: {item.deliveryFee}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name={getCategoryIcon() as any} size={24} color={colors.teal} />
          <Text style={styles.title}>{category}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${category.toLowerCase()}...`}
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'distance' && styles.sortBtnActive]}
            onPress={() => setSortBy('distance')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'distance' && styles.sortBtnTextActive]}>
              Distance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'rating' && styles.sortBtnActive]}
            onPress={() => setSortBy('rating')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'rating' && styles.sortBtnTextActive]}>
              Rating
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'popularity' && styles.sortBtnActive]}
            onPress={() => setSortBy('popularity')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'popularity' && styles.sortBtnTextActive]}>
              Popular
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count */}
      {!loading && (
        <Text style={styles.resultsCount}>
          {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'place' : 'places'} found
        </Text>
      )}

      {/* Business List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Loading {category.toLowerCase()}...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBusinesses}
          renderItem={renderBusiness}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No ${category.toLowerCase()} match "${searchQuery}"`
                  : `No ${category.toLowerCase()} available in your area`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortBtnActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  sortBtnTextActive: {
    color: colors.textWhite,
  },
  resultsCount: {
    fontSize: 13,
    color: colors.textLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    padding: 16,
  },
  businessCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  businessImage: {
    width: 120,
    height: 120,
    backgroundColor: colors.border,
  },
  businessInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cuisineText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
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
  feeText: {
    fontSize: 12,
    color: colors.teal,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
