import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { gadgetsAPI, Product } from '../../services/gadgetsAPI';
import { resolveMediaUrl } from '../../services/api';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
];

const CONDITIONS = [
  { id: 'all', label: 'All Conditions' },
  { id: 'new', label: 'New' },
  { id: 'like_new', label: 'Like New' },
  { id: 'good', label: 'Good' },
  { id: 'refurbished', label: 'Refurbished' },
];

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, search } = (route.params as any) || {};

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [condition, setCondition] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [category, search, sortBy, condition]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await gadgetsAPI.getProducts({
        category,
        search,
        sortBy,
        condition: condition === 'all' ? undefined : condition,
      });

      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    (navigation as any).navigate('ProductDetails', { productId: product.id });
  };

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const discount = getDiscountPercentage(item.price, item.originalPrice);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductSelect(item)}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: resolveMediaUrl(item.images[0]) || item.images[0] }} style={styles.productImage} />
          {discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
          {item.condition === 'new' && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{item.brand}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{item.condition.replace('_', ' ')}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#f39c12" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>
                  ₦{item.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>

            {item.shippingInfo.freeShipping && (
              <View style={styles.shippingBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#2ecc71" />
                <Text style={styles.shippingText}>Free Ship</Text>
              </View>
            )}
          </View>

          <View style={styles.sellerInfo}>
            <Ionicons name="storefront-outline" size={12} color="#666" />
            <Text style={styles.sellerName}>{item.seller.name}</Text>
            {item.seller.verified && (
              <Ionicons name="checkmark-circle" size={12} color="#2ecc71" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {search ? `"${search}"` : category || 'All Products'}
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Sort By</Text>
          <FlatList
            data={SORT_OPTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  sortBy === item.id && styles.filterChipActive,
                ]}
                onPress={() => setSortBy(item.id as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    sortBy === item.id && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />

          <Text style={styles.filterTitle}>Condition</Text>
          <FlatList
            data={CONDITIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  condition === item.id && styles.filterChipActive,
                ]}
                onPress={() => setCondition(item.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    condition === item.id && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </Text>
      </View>

      {/* Products List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterChips: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#e74c3c',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2ecc71',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    height: 32,
  },
  conditionBadge: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  reviewCount: {
    fontSize: 10,
    color: '#999',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  shippingText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2ecc71',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
});

export default ProductListScreen;
