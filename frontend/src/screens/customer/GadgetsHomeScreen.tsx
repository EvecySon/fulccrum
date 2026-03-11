import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { gadgetsAPI, Product } from '../../services/gadgetsAPI';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'smartphones', name: 'Smartphones', icon: 'phone-portrait', color: '#3498db' },
  { id: 'laptops', name: 'Laptops', icon: 'laptop', color: '#9b59b6' },
  { id: 'tablets', name: 'Tablets', icon: 'tablet-portrait', color: '#e74c3c' },
  { id: 'smartwatches', name: 'Smartwatches', icon: 'watch', color: '#f39c12' },
  { id: 'headphones', name: 'Headphones', icon: 'headset', color: '#1abc9c' },
  { id: 'cameras', name: 'Cameras', icon: 'camera', color: '#34495e' },
  { id: 'gaming', name: 'Gaming', icon: 'game-controller', color: '#e91e63' },
  { id: 'accessories', name: 'Accessories', icon: 'apps', color: '#16a085' },
];

const GadgetsHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setIsLoading(true);
      const response = await gadgetsAPI.getFeaturedProducts();
      if (response.success) {
        setFeaturedProducts(response.data);
      }
    } catch (error) {
      console.error('Load featured products error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    (navigation as any).navigate('ProductList', { category: categoryId });
  };

  const handleProductSelect = (product: Product) => {
    (navigation as any).navigate('ProductDetails', { productId: product.id });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      (navigation as any).navigate('ProductList', { search: searchQuery.trim() });
    }
  };

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
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
        <Text style={styles.headerTitle}>Gadgets Marketplace</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => (navigation as any).navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for gadgets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Tech Deals</Text>
          <Text style={styles.heroSubtitle}>Up to 50% off on selected items</Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategorySelect(category.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                  <Ionicons name={category.icon as any} size={28} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('ProductList')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.productsRow}>
                {featuredProducts.map((product) => {
                  const discount = getDiscountPercentage(product.price, product.originalPrice);
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.productCard}
                      onPress={() => handleProductSelect(product)}
                    >
                      <View style={styles.productImageContainer}>
                        <Image
                          source={{ uri: product.images[0] }}
                          style={styles.productImage}
                        />
                        {discount && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{discount}%</Text>
                          </View>
                        )}
                        {product.condition === 'new' && (
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.productInfo}>
                        <Text style={styles.productBrand}>{product.brand}</Text>
                        <Text style={styles.productName} numberOfLines={2}>
                          {product.name}
                        </Text>

                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#f39c12" />
                          <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
                        </View>

                        <View style={styles.priceContainer}>
                          <Text style={styles.price}>₦{product.price.toLocaleString()}</Text>
                          {product.originalPrice && (
                            <Text style={styles.originalPrice}>
                              ₦{product.originalPrice.toLocaleString()}
                            </Text>
                          )}
                        </View>

                        {product.shippingInfo.freeShipping && (
                          <View style={styles.shippingBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#2ecc71" />
                            <Text style={styles.shippingText}>Free Shipping</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Selling Section */}
        <View style={styles.sellingSection}>
          <View style={styles.sellingIcon}>
            <Ionicons name="pricetag" size={32} color="#ff6b35" />
          </View>
          <View style={styles.sellingContent}>
            <Text style={styles.sellingTitle}>Have gadgets to sell?</Text>
            <Text style={styles.sellingSubtitle}>
              List your products and reach thousands of buyers
            </Text>
          </View>
          <TouchableOpacity
            style={styles.sellingButton}
            onPress={() => (navigation as any).navigate('SellerDashboard')}
          >
            <Text style={styles.sellingButtonText}>Start Selling</Text>
          </TouchableOpacity>
        </View>

        {/* Why Shop With Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Shop With Us?</Text>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#2ecc71" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Verified Sellers</Text>
              <Text style={styles.featureDescription}>
                All sellers are verified for your safety
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="refresh" size={24} color="#3498db" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Easy Returns</Text>
              <Text style={styles.featureDescription}>
                7-day return policy on most items
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="card" size={24} color="#f39c12" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Secure Payments</Text>
              <Text style={styles.featureDescription}>
                Multiple payment options with buyer protection
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    backgroundColor: '#ff6b35',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ff6b35',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 4,
    alignItems: 'center',
    padding: 12,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  productsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
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
    fontSize: 12,
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
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    height: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  shippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shippingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2ecc71',
  },
  sellingSection: {
    backgroundColor: '#fff5f2',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  sellingIcon: {
    marginBottom: 16,
  },
  sellingContent: {
    marginBottom: 16,
  },
  sellingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  sellingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sellingButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  sellingButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default GadgetsHomeScreen;
