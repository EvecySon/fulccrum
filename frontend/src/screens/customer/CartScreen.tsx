import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ordersAPI, feesAPI, promosAPI, addressesAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';

export default function CartScreen({ navigation }: any) {
  const { items, restaurant, subtotal, itemCount, updateQuantity, removeItem, clearCart, getItemTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [tipPercent, setTipPercent] = useState(15);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [feesLoaded, setFeesLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'cash'>('wallet');
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [placing, setPlacing] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const tip = Math.round(subtotal * (tipPercent / 100));
  const total = subtotal + deliveryFee + serviceFee + taxAmount + tip - promoDiscount;

  // Load default address
  useEffect(() => {
    (async () => {
      try {
        const res = await addressesAPI.getAll();
        const addrs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        if (def) setDefaultAddress(def);
      } catch {}
    })();
  }, []);

  // Load fees when we have address + restaurant
  useEffect(() => {
    if (!restaurant || !defaultAddress || subtotal === 0) return;
    (async () => {
      try {
        const fees = await feesAPI.calculate({
          businessId: restaurant.id,
          customerAddressId: defaultAddress.id,
          subtotal,
        });
        setDeliveryFee(fees?.deliveryFee || 0);
        setServiceFee(fees?.serviceFee || 0);
        setTaxAmount(fees?.taxAmount || 0);
        setFeesLoaded(true);
      } catch {
        // Fallback fees
        setDeliveryFee(500);
        setServiceFee(Math.round(subtotal * 0.05));
        setTaxAmount(Math.round(subtotal * 0.075));
        setFeesLoaded(true);
      }
    })();
  }, [restaurant, defaultAddress, subtotal]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await promosAPI.validate(promoCode.trim(), subtotal);
      const discount = res?.discountAmount || res?.discount || 0;
      setPromoDiscount(discount);
      setPromoApplied(promoCode.trim());
      Alert.alert('Promo Applied', `You saved ₦${discount.toLocaleString()}!`);
    } catch (e: any) {
      Alert.alert('Invalid Code', e?.message || 'This promo code is not valid.');
      setPromoDiscount(0);
      setPromoApplied('');
    }
    setPromoLoading(false);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!defaultAddress) {
      Alert.alert('No Address', 'Please add a delivery address first.', [
        { text: 'Add Address', onPress: () => navigation.navigate('Address') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    setPlacing(true);
    try {
      const orderItems = items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.price + (item.modifiers?.reduce((s, m) => s + m.priceAdjustment, 0) || 0) + (item.customizations?.reduce((s, c) => s + c.price, 0) || 0),
        totalPrice: getItemTotal(item),
        modifiers: item.modifiers || item.customizations ? {
          modifiers: item.modifiers || [],
          customizations: item.customizations || [],
        } : undefined,
      }));

      const orderData = {
        businessId: restaurant!.id,
        items: orderItems,
        subtotal,
        deliveryFee,
        serviceFee,
        taxAmount,
        tipAmount: tip,
        discountAmount: promoDiscount,
        totalAmount: total,
        paymentMethod,
        specialInstructions: specialInstructions || undefined,
        deliveryAddressId: defaultAddress.id,
        promoCode: promoApplied || undefined,
      };

      const order = await ordersAPI.create(orderData);
      clearCart();
      navigation.replace('OrderTracking', { orderId: order?.id, order });
    } catch (e: any) {
      Alert.alert('Order Failed', e?.message || 'Could not place your order. Please try again.');
    }
    setPlacing(false);
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Browse restaurants and add items to get started</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.browseBtnText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getItemDescription = (item: any) => {
    const parts: string[] = [];
    if (item.modifiers?.length) parts.push(...item.modifiers.map((m: any) => m.optionName));
    if (item.customizations?.length) parts.push(...item.customizations.map((c: any) => c.name));
    return parts.join(', ');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: clearCart }])}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Restaurant Info */}
        <View style={styles.restaurantBar}>
          <Ionicons name="restaurant" size={20} color={colors.teal} />
          <Text style={styles.restaurantName}>{restaurant?.name || 'Restaurant'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.addMoreText}>Add more</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        {items.map((item, index) => (
          <View key={`${item.menuItemId}-${index}`} style={styles.cartItem}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.itemImage} /> : <View style={[styles.itemImage, { backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' }]}><Ionicons name="fast-food" size={24} color={colors.textLight} /></View>}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {getItemDescription(item) !== '' && (
                <Text style={styles.itemCustom}>{getItemDescription(item)}</Text>
              )}
              <View style={styles.itemBottom}>
                <Text style={styles.itemPrice}>
                  ₦{getItemTotal(item).toLocaleString()}
                </Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => {
                    if (item.quantity <= 1) {
                      removeItem(item.menuItemId);
                    } else {
                      updateQuantity(item.menuItemId, item.quantity - 1);
                    }
                  }}>
                    <Ionicons name={item.quantity <= 1 ? 'trash-outline' : 'remove'} size={16} color={item.quantity <= 1 ? colors.error : colors.navy} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.menuItemId, item.quantity + 1)}>
                    <Ionicons name="add" size={16} color={colors.navy} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Delivery Address */}
        <TouchableOpacity style={styles.addressSection} onPress={() => navigation.navigate('Address')}>
          <Ionicons name="location" size={20} color={colors.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>Deliver to</Text>
            <Text style={styles.addressText}>{defaultAddress ? `${defaultAddress.streetAddress}${defaultAddress.city ? `, ${defaultAddress.city}` : ''}` : 'Select delivery address'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            {([
              { key: 'wallet', icon: 'wallet', label: 'Wallet' },
              { key: 'card', icon: 'card', label: 'Card' },
              { key: 'cash', icon: 'cash', label: 'Cash' },
            ] as const).map(pm => (
              <TouchableOpacity
                key={pm.key}
                style={[styles.paymentOption, paymentMethod === pm.key && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod(pm.key)}
              >
                <Ionicons name={pm.icon as any} size={20} color={paymentMethod === pm.key ? colors.teal : colors.textLight} />
                <Text style={[styles.paymentOptionText, paymentMethod === pm.key && styles.paymentOptionTextActive]}>{pm.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          {promoApplied ? (
            <View style={styles.promoAppliedRow}>
              <Ionicons name="pricetag" size={18} color={colors.success} />
              <Text style={styles.promoAppliedText}>{promoApplied} — ₦{promoDiscount.toLocaleString()} off</Text>
              <TouchableOpacity onPress={() => { setPromoDiscount(0); setPromoApplied(''); setPromoCode(''); }}>
                <Ionicons name="close-circle" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor={colors.textLight}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.promoBtn} onPress={handleApplyPromo} disabled={promoLoading}>
                {promoLoading ? <ActivityIndicator size="small" color={colors.textWhite} /> : <Text style={styles.promoBtnText}>Apply</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tip */}
        <View style={styles.tipSection}>
          <Text style={styles.sectionTitle}>Tip Your Courier</Text>
          <View style={styles.tipRow}>
            {[0, 10, 15, 20].map((percent) => (
              <TouchableOpacity
                key={percent}
                style={[styles.tipBtn, tipPercent === percent && styles.tipBtnActive]}
                onPress={() => setTipPercent(percent)}
              >
                <Text style={[styles.tipBtnText, tipPercent === percent && styles.tipBtnTextActive]}>
                  {percent === 0 ? 'None' : `${percent}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Any special requests for the restaurant..."
            placeholderTextColor={colors.textLight}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
            <Text style={styles.summaryValue}>₦{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>₦{serviceFee.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (VAT)</Text>
            <Text style={styles.summaryValue}>₦{taxAmount.toLocaleString()}</Text>
          </View>
          {tip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tip ({tipPercent}%)</Text>
              <Text style={styles.summaryValue}>₦{tip.toLocaleString()}</Text>
            </View>
          )}
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>-₦{promoDiscount.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.checkoutBtn, placing && { opacity: 0.7 }]}
          onPress={handleCheckout}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <Text style={styles.checkoutText}>Place Order · ₦{total.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 64, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: colors.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8 },
  browseBtn: { marginTop: 20, backgroundColor: colors.teal, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  browseBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  restaurantBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 16, marginBottom: 8, gap: 10 },
  restaurantName: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  addMoreText: { fontSize: 14, fontWeight: '600', color: colors.teal },
  cartItem: { flexDirection: 'row', backgroundColor: colors.white, padding: 16, marginBottom: 1, gap: 12 },
  itemImage: { width: 70, height: 70, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
  itemCustom: { fontSize: 12, color: colors.textLight, marginBottom: 8 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: 16, fontWeight: '700', color: colors.teal },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 8 },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, paddingHorizontal: 8 },
  addressSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 16, marginTop: 8, gap: 12 },
  addressLabel: { fontSize: 12, color: colors.textLight },
  addressText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },
  paymentSection: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  paymentRow: { flexDirection: 'row', gap: 10 },
  paymentOption: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, gap: 4 },
  paymentOptionActive: { backgroundColor: colors.teal + '12', borderWidth: 1.5, borderColor: colors.teal },
  paymentOptionText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  paymentOptionTextActive: { color: colors.teal },
  promoSection: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoInput: { flex: 1, backgroundColor: colors.lightGray, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },
  promoBtn: { backgroundColor: colors.navy, borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  promoBtnText: { fontSize: 14, fontWeight: '600', color: colors.textWhite },
  promoAppliedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.success + '10', padding: 12, borderRadius: 10 },
  promoAppliedText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.success },
  tipSection: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  tipRow: { flexDirection: 'row', gap: 10 },
  tipBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.lightGray, alignItems: 'center' },
  tipBtnActive: { backgroundColor: colors.teal },
  tipBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tipBtnTextActive: { color: colors.textWhite },
  instructionsSection: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  instructionsInput: { backgroundColor: colors.lightGray, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textPrimary, minHeight: 60, textAlignVertical: 'top' },
  summarySection: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.teal },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 34, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10 },
  checkoutBtn: { backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  checkoutText: { fontSize: 17, fontWeight: '700', color: colors.textWhite },
});
