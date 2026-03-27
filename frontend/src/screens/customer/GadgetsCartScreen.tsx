import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { gadgetsAPI, CartItem } from '../../services/gadgetsAPI';
import { resolveMediaUrl } from '../../services/api';

const GadgetsCartScreen: React.FC = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await gadgetsAPI.getCart();
      if (response.success) {
        setCartItems(response.data.items);
        setSubtotal(response.data.subtotal);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Load cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await gadgetsAPI.updateCartItem(itemId, newQuantity);
      loadCart();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await gadgetsAPI.removeFromCart(itemId);
            loadCart();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to remove item');
          }
        },
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await gadgetsAPI.clearCart();
            loadCart();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to clear cart');
          }
        },
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }
    (navigation as any).navigate('GadgetsCheckout');
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
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some products to get started</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => (navigation as any).navigate('GadgetsHome')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: resolveMediaUrl(item.product.images[0]) || item.product.images[0] }} style={styles.productImage} />

                <View style={styles.productInfo}>
                  <Text style={styles.productBrand}>{item.product.brand}</Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.product.name}
                  </Text>

                  <View style={styles.conditionBadge}>
                    <Text style={styles.conditionText}>
                      {item.product.condition.replace('_', ' ')}
                    </Text>
                  </View>

                  <Text style={styles.productPrice}>
                    ₦{item.product.price.toLocaleString()}
                  </Text>

                  <View style={styles.quantityRow}>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color="#000" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color="#000" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₦{subtotal.toLocaleString()}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Calculated at checkout</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  clearText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productBrand: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  conditionBadge: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'capitalize',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 20,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3498db',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default GadgetsCartScreen;
