import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ordersAPI, feesAPI, promosAPI } from '../../services/api';

const cartItems = [
  {
    id: '1',
    name: 'Gourmet Cheeseburger',
    price: 4500,
    quantity: 1,
    customizations: ['Extra Cheese', 'Bacon'],
    customizationPrice: 800,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'Classic Fries',
    price: 1500,
    quantity: 2,
    customizations: ['Cheese Sauce'],
    customizationPrice: 200,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop',
  },
];

export default function CartScreen({ navigation }: any) {
  const [promoCode, setPromoCode] = useState('');
  const [tipPercent, setTipPercent] = useState(15);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price + item.customizationPrice) * item.quantity,
    0
  );
  const deliveryFee = 500;
  const serviceFee = 250;
  const tip = subtotal * (tipPercent / 100);
  const total = subtotal + deliveryFee + serviceFee + tip;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Restaurant Info */}
        <View style={styles.restaurantBar}>
          <Ionicons name="restaurant" size={20} color={colors.teal} />
          <Text style={styles.restaurantName}>Burger House</Text>
          <TouchableOpacity>
            <Text style={styles.addMoreText}>Add more</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCustom}>
                {item.customizations.join(', ')}
              </Text>
              <View style={styles.itemBottom}>
                <Text style={styles.itemPrice}>
                  ₦{((item.price + item.customizationPrice) * item.quantity).toLocaleString()}
                </Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity style={styles.qtyBtn}>
                    <Ionicons name="remove" size={16} color={colors.navy} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn}>
                    <Ionicons name="add" size={16} color={colors.navy} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Group Order Toggle */}
        <View style={styles.groupOrder}>
          <View style={styles.groupOrderLeft}>
            <Ionicons name="people" size={20} color={colors.teal} />
            <Text style={styles.groupOrderText}>Group Order</Text>
          </View>
          <View style={styles.toggle}>
            <View style={styles.toggleKnob} />
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              placeholderTextColor={colors.textLight}
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip */}
        <View style={styles.tipSection}>
          <Text style={styles.sectionTitle}>Tip Suggestion</Text>
          <View style={styles.tipRow}>
            {[10, 15, 20, 25].map((percent) => (
              <TouchableOpacity
                key={percent}
                style={[
                  styles.tipBtn,
                  tipPercent === percent && styles.tipBtnActive,
                ]}
                onPress={() => setTipPercent(percent)}
              >
                <Text
                  style={[
                    styles.tipBtnText,
                    tipPercent === percent && styles.tipBtnTextActive,
                  ]}
                >
                  {percent}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delivery Preferences */}
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Delivery Preferences</Text>
          <TouchableOpacity style={styles.prefItem}>
            <Ionicons name="home-outline" size={20} color={colors.navy} />
            <Text style={styles.prefText}>Leave at door</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.prefItem}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.navy} />
            <Text style={styles.prefText}>Add delivery instructions</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₦{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₦{deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>₦{serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tip ({tipPercent}%)</Text>
            <Text style={styles.summaryValue}>₦{tip.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('OrderTracking')}
        >
          <Text style={styles.checkoutText}>Confirm & Pay · ₦{total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  restaurantBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 8,
    gap: 10,
  },
  restaurantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 1,
    gap: 12,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemCustom: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.teal,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 8,
  },
  groupOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 8,
  },
  groupOrderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupOrderText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  promoSection: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  promoBtn: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  promoBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textWhite,
  },
  tipSection: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 8,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tipBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
  },
  tipBtnActive: {
    backgroundColor: colors.teal,
  },
  tipBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tipBtnTextActive: {
    color: colors.textWhite,
  },
  deliverySection: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 8,
  },
  prefItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  prefText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  summarySection: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.teal,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  checkoutBtn: {
    backgroundColor: colors.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
