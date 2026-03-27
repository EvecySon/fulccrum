import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { gadgetsAPI, Product } from '../../services/gadgetsAPI';
import { resolveMediaUrl } from '../../services/api';

const SellerDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, productsResponse] = await Promise.all([
        gadgetsAPI.getSellerStats(),
        gadgetsAPI.getSellerProducts(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      if (productsResponse.success) {
        setProducts(productsResponse.data);
      }
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="cube" size={24} color="#3498db" />
              </View>
              <Text style={styles.statValue}>{stats?.totalProducts || 0}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="cart" size={24} color="#2ecc71" />
              </View>
              <Text style={styles.statValue}>{stats?.totalSales || 0}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fff9e6' }]}>
                <Ionicons name="cash" size={24} color="#f39c12" />
              </View>
              <Text style={styles.statValue}>₦{(stats?.totalRevenue || 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fff5f2' }]}>
                <Ionicons name="star" size={24} color="#ff6b35" />
              </View>
              <Text style={styles.statValue}>{stats?.averageRating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle" size={24} color="#3498db" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add New Product</Text>
              <Text style={styles.actionSubtitle}>List a new item for sale</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="notifications" size={24} color="#f39c12" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Pending Orders</Text>
              <Text style={styles.actionSubtitle}>{stats?.pendingOrders || 0} orders to process</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="analytics" size={24} color="#9b59b6" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Analytics</Text>
              <Text style={styles.actionSubtitle}>Track your performance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* My Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Ionicons name="cube-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No products listed yet</Text>
              <TouchableOpacity style={styles.addProductButton}>
                <Text style={styles.addProductButtonText}>Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Image source={{ uri: resolveMediaUrl(product.images[0]) || product.images[0] }} style={styles.productImage} />

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>

                  <View style={styles.productMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#f39c12" />
                      <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.stockText}>Stock: {product.stock}</Text>
                  </View>

                  <Text style={styles.productPrice}>₦{product.price.toLocaleString()}</Text>
                </View>

                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={20} color="#3498db" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Seller Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Tips</Text>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color="#f39c12" />
            <Text style={styles.tipText}>
              Add clear photos and detailed descriptions to increase sales
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color="#f39c12" />
            <Text style={styles.tipText}>
              Respond to customer inquiries within 24 hours
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={20} color="#f39c12" />
            <Text style={styles.tipText}>
              Offer competitive pricing and free shipping when possible
            </Text>
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  emptyProducts: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  addProductButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  addProductButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  metaDivider: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 8,
  },
  stockText: {
    fontSize: 12,
    color: '#666',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3498db',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff9e6',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default SellerDashboardScreen;
