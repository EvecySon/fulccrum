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
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ordersAPI, feesAPI, promosAPI, addressesAPI, walletAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { withMock, mockGetAddresses, mockValidatePromo, mockCreateOrder } from '../../services/mockApi';
import { mockFees } from '../../services/mockData';
import PaymentMethodSelector from '../../components/PaymentMethodSelector';

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
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('card');
  const [walletBalance, setWalletBalance] = useState(0);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Scheduled order state
  const [orderType, setOrderType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  // Pickup vs Delivery
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');

  // Delivery instructions
  const [deliveryOption, setDeliveryOption] = useState<'hand_to_customer' | 'leave_at_door' | 'meet_outside'>('hand_to_customer');
  const [deliveryNote, setDeliveryNote] = useState('');
  
  // Payment confirmation modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const tip = Math.round(subtotal * (tipPercent / 100));
  const effectiveDeliveryFee = fulfillmentType === 'pickup' ? 0 : deliveryFee;
  const total = subtotal + effectiveDeliveryFee + serviceFee + taxAmount + tip - promoDiscount;

  // Load all addresses and wallet balance
  useEffect(() => {
    (async () => {
      try {
        const [addressRes, walletRes] = await Promise.all([
          withMock(
            () => addressesAPI.getAll(),
            () => mockGetAddresses()
          ),
          walletAPI.getBalance().catch(() => ({ balance: 0 }))
        ]);
        const addrs = Array.isArray(addressRes?.data) ? addressRes.data : Array.isArray(addressRes) ? addressRes : [];
        setAddresses(addrs);
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
        if (def) setSelectedAddress(def);
        if (walletRes?.balance != null) setWalletBalance(Number(walletRes.balance));
      } catch {}
    })();
  }, []);

  // Generate schedule date options (next 7 days)
  const getScheduleDates = () => {
    const dates: { label: string; value: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const value = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ label, value });
    }
    return dates;
  };

  // Generate time slots (every 30 min from now + 1hr to 10pm)
  const getTimeSlots = () => {
    const slots: { label: string; value: string }[] = [];
    const now = new Date();
    const isToday = scheduledDate === now.toISOString().split('T')[0];
    const startHour = isToday ? now.getHours() + 1 : 8;
    for (let h = startHour; h <= 22; h++) {
      for (const m of [0, 30]) {
        if (h === 22 && m === 30) continue;
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        slots.push({ label: `${h12}:${mm} ${ampm}`, value: `${hh}:${mm}` });
      }
    }
    return slots;
  };

  // Load fees when we have restaurant (address needed only for delivery)
  useEffect(() => {
    if (!restaurant || subtotal === 0) return;
    if (fulfillmentType === 'delivery' && !selectedAddress) return;
    (async () => {
      try {
        const fees = await withMock(
          () => feesAPI.calculate({ businessId: restaurant.id, customerAddressId: selectedAddress?.id, subtotal }),
          () => ({ deliveryFee: fulfillmentType === 'pickup' ? 0 : mockFees.deliveryFee, serviceFee: Math.round(subtotal * 0.05), taxAmount: Math.round(subtotal * mockFees.taxRate) })
        );
        setDeliveryFee(fees?.deliveryFee || 0);
        setServiceFee(fees?.serviceFee || 0);
        setTaxAmount(fees?.taxAmount || 0);
        setFeesLoaded(true);
      } catch {
        setDeliveryFee(500);
        setServiceFee(Math.round(subtotal * 0.05));
        setTaxAmount(Math.round(subtotal * 0.075));
        setFeesLoaded(true);
      }
    })();
  }, [restaurant, selectedAddress, subtotal, fulfillmentType]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await withMock(
        () => promosAPI.validate(promoCode.trim(), subtotal),
        () => mockValidatePromo(promoCode.trim(), subtotal)
      );
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

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (fulfillmentType === 'delivery' && !selectedAddress) {
      Alert.alert('No Address', 'Please add a delivery address first.', [
        { text: 'Add Address', onPress: () => navigation.navigate('Addresses') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (orderType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      Alert.alert('Schedule Required', 'Please select a date and time for your scheduled order.');
      return;
    }

    // Show payment confirmation modal
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    setShowPaymentModal(false);
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

      const orderData: any = {
        businessId: restaurant!.id,
        items: orderItems,
        subtotal,
        deliveryFee: effectiveDeliveryFee,
        serviceFee,
        taxAmount,
        tipAmount: tip,
        discountAmount: promoDiscount,
        totalAmount: total,
        paymentMethod,
        specialInstructions: specialInstructions || undefined,
        deliveryAddressId: fulfillmentType === 'pickup' ? undefined : selectedAddress.id,
        promoCode: promoApplied || undefined,
        fulfillmentType,
        deliveryOption: fulfillmentType === 'delivery' ? deliveryOption : undefined,
        deliveryNote: deliveryNote || undefined,
      };
      if (orderType === 'scheduled') {
        orderData.scheduledFor = `${scheduledDate}T${scheduledTime}:00`;
      }

      const order = await withMock(
        () => ordersAPI.create(orderData),
        () => mockCreateOrder(orderData)
      );
      
      // If wallet payment, pay immediately
      if (paymentMethod === 'wallet') {
        try {
          await ordersAPI.payWithWallet(order.id);
          clearCart();
          navigation.replace('OrderTracking', { orderId: order?.id, order });
        } catch (walletError: any) {
          Alert.alert('Payment Failed', walletError?.message || 'Could not process wallet payment. Please try another payment method.');
          return;
        }
      } else {
        // Card payment - will be handled via Paystack
        clearCart();
        navigation.replace('OrderTracking', { orderId: order?.id, order });
      }
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

        {/* Pickup vs Delivery */}
        <View style={styles.fulfillmentSection}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.fulfillmentRow}>
            <TouchableOpacity
              style={[styles.fulfillmentOption, fulfillmentType === 'delivery' && styles.fulfillmentOptionActive]}
              onPress={() => setFulfillmentType('delivery')}
            >
              <Ionicons name="bicycle" size={20} color={fulfillmentType === 'delivery' ? colors.teal : colors.textLight} />
              <Text style={[styles.fulfillmentText, fulfillmentType === 'delivery' && styles.fulfillmentTextActive]}>Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fulfillmentOption, fulfillmentType === 'pickup' && styles.fulfillmentOptionActive]}
              onPress={() => setFulfillmentType('pickup')}
            >
              <Ionicons name="storefront" size={20} color={fulfillmentType === 'pickup' ? colors.teal : colors.textLight} />
              <Text style={[styles.fulfillmentText, fulfillmentType === 'pickup' && styles.fulfillmentTextActive]}>Pickup</Text>
            </TouchableOpacity>
          </View>
          {fulfillmentType === 'pickup' && (
            <View style={styles.pickupNote}>
              <Ionicons name="information-circle" size={16} color={colors.info} />
              <Text style={styles.pickupNoteText}>Pick up your order at {restaurant?.name || 'the restaurant'}. No delivery fee!</Text>
            </View>
          )}
        </View>

        {/* Order Type: Now or Scheduled */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Delivery Time</Text>
          <View style={styles.scheduleRow}>
            <TouchableOpacity
              style={[styles.scheduleOption, orderType === 'now' && styles.scheduleOptionActive]}
              onPress={() => { setOrderType('now'); setScheduledDate(''); setScheduledTime(''); }}
            >
              <Ionicons name="flash" size={18} color={orderType === 'now' ? colors.teal : colors.textLight} />
              <Text style={[styles.scheduleOptionText, orderType === 'now' && styles.scheduleOptionTextActive]}>Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scheduleOption, orderType === 'scheduled' && styles.scheduleOptionActive]}
              onPress={() => { setOrderType('scheduled'); setShowSchedulePicker(true); }}
            >
              <Ionicons name="calendar" size={18} color={orderType === 'scheduled' ? colors.teal : colors.textLight} />
              <Text style={[styles.scheduleOptionText, orderType === 'scheduled' && styles.scheduleOptionTextActive]}>
                {scheduledDate && scheduledTime ? `${getScheduleDates().find(d => d.value === scheduledDate)?.label || scheduledDate}, ${getTimeSlots().find(t => t.value === scheduledTime)?.label || scheduledTime}` : 'Schedule'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address Picker (only for delivery) */}
        {fulfillmentType === 'delivery' && <TouchableOpacity style={styles.addressSection} onPress={() => setShowAddressPicker(true)}>
          <Ionicons name="location" size={20} color={colors.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>Deliver to</Text>
            <Text style={styles.addressText}>{selectedAddress ? `${selectedAddress.streetAddress}${selectedAddress.city ? `, ${selectedAddress.city}` : ''}` : 'Select delivery address'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>}

        {/* Delivery Instructions (only for delivery) */}
        {fulfillmentType === 'delivery' && (
        <View style={styles.deliveryInstructionsSection}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <View style={styles.deliveryOptionsRow}>
            {([
              { key: 'hand_to_customer', icon: 'hand-left', label: 'Hand it to me' },
              { key: 'leave_at_door', icon: 'home', label: 'Leave at door' },
              { key: 'meet_outside', icon: 'walk', label: 'Meet outside' },
            ] as const).map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.deliveryOptBtn, deliveryOption === opt.key && styles.deliveryOptBtnActive]}
                onPress={() => setDeliveryOption(opt.key)}
              >
                <Ionicons name={opt.icon as any} size={18} color={deliveryOption === opt.key ? colors.teal : colors.textLight} />
                <Text style={[styles.deliveryOptText, deliveryOption === opt.key && styles.deliveryOptTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.deliveryNoteInput}
            placeholder="Add a note for the driver (e.g., gate code, floor)..."
            placeholderTextColor={colors.textLight}
            value={deliveryNote}
            onChangeText={setDeliveryNote}
            multiline
          />
        </View>
        )}

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            walletBalance={walletBalance}
            orderTotal={total}
          />
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
          {fulfillmentType === 'delivery' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}</Text>
            </View>
          )}
          {fulfillmentType === 'pickup' && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>Pickup (No delivery fee)</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>Free</Text>
            </View>
          )}
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

      {/* Schedule Picker Modal */}
      <Modal visible={showSchedulePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Delivery</Text>
              <TouchableOpacity onPress={() => setShowSchedulePicker(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.pickerLabel}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.dateRow}>
                {getScheduleDates().map(d => (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.dateChip, scheduledDate === d.value && styles.dateChipActive]}
                    onPress={() => setScheduledDate(d.value)}
                  >
                    <Text style={[styles.dateChipText, scheduledDate === d.value && styles.dateChipTextActive]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {scheduledDate ? (
              <>
                <Text style={styles.pickerLabel}>Select Time</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  <View style={styles.timeGrid}>
                    {getTimeSlots().map(t => (
                      <TouchableOpacity
                        key={t.value}
                        style={[styles.timeChip, scheduledTime === t.value && styles.timeChipActive]}
                        onPress={() => setScheduledTime(t.value)}
                      >
                        <Text style={[styles.timeChipText, scheduledTime === t.value && styles.timeChipTextActive]}>{t.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : null}
            <TouchableOpacity
              style={[styles.scheduleConfirmBtn, (!scheduledDate || !scheduledTime) && { opacity: 0.5 }]}
              onPress={() => { if (scheduledDate && scheduledTime) setShowSchedulePicker(false); }}
              disabled={!scheduledDate || !scheduledTime}
            >
              <Text style={styles.scheduleConfirmText}>Confirm Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Address Picker Modal */}
      <Modal visible={showAddressPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Address</Text>
              <TouchableOpacity onPress={() => setShowAddressPicker(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {addresses.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Ionicons name="location-outline" size={40} color={colors.textLight} />
                <Text style={{ color: colors.textLight, marginTop: 8 }}>No saved addresses</Text>
              </View>
            ) : (
              addresses.map((addr: any) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addressPickerItem, selectedAddress?.id === addr.id && styles.addressPickerItemActive]}
                  onPress={() => { setSelectedAddress(addr); setShowAddressPicker(false); }}
                >
                  <Ionicons name={selectedAddress?.id === addr.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={selectedAddress?.id === addr.id ? colors.teal : colors.textLight} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressPickerLabel}>{addr.label || addr.type || 'Address'}</Text>
                    <Text style={styles.addressPickerText}>{addr.streetAddress}{addr.city ? `, ${addr.city}` : ''}</Text>
                  </View>
                  {addr.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>Default</Text></View>}
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity style={styles.addAddressBtn} onPress={() => { setShowAddressPicker(false); navigation.navigate('Addresses'); }}>
              <Ionicons name="add-circle-outline" size={20} color={colors.teal} />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <View style={{ backgroundColor: colors.lightGray, padding: 16, borderRadius: 12 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Payment Method</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons 
                    name={paymentMethod === 'wallet' ? 'wallet' : 'card'} 
                    size={24} 
                    color={colors.teal} 
                  />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    {paymentMethod === 'wallet' ? 'Wallet' : 'Card'}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: colors.lightGray, padding: 16, borderRadius: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Subtotal</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>₦{subtotal.toLocaleString()}</Text>
                </View>
                {effectiveDeliveryFee > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>Delivery Fee</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>₦{effectiveDeliveryFee.toLocaleString()}</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Service Fee</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>₦{serviceFee.toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Tax</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>₦{taxAmount.toLocaleString()}</Text>
                </View>
                {tip > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>Tip ({tipPercent}%)</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>₦{tip.toLocaleString()}</Text>
                  </View>
                )}
                {promoDiscount > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: colors.success }}>Discount</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.success }}>-₦{promoDiscount.toLocaleString()}</Text>
                  </View>
                )}
                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>Total</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.teal }}>₦{Math.max(0, total).toLocaleString()}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.scheduleConfirmBtn, placing && { opacity: 0.7 }]} 
                onPress={confirmPayment}
                disabled={placing}
              >
                {placing ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <Text style={styles.scheduleConfirmText}>
                    Pay ₦{Math.max(0, total).toLocaleString()}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <Text style={styles.checkoutText}>Place Order · ₦{Math.max(0, total).toLocaleString()}</Text>
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
  fulfillmentSection: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  fulfillmentRow: { flexDirection: 'row', gap: 10 },
  fulfillmentOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12, backgroundColor: colors.lightGray },
  fulfillmentOptionActive: { backgroundColor: colors.teal + '12', borderWidth: 1.5, borderColor: colors.teal },
  fulfillmentText: { fontSize: 15, fontWeight: '600', color: colors.textLight },
  fulfillmentTextActive: { color: colors.teal },
  pickupNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, padding: 10, backgroundColor: colors.info + '10', borderRadius: 8 },
  pickupNoteText: { flex: 1, fontSize: 12, color: colors.info },
  scheduleSection: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  scheduleRow: { flexDirection: 'row', gap: 10 },
  scheduleOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray },
  scheduleOptionActive: { backgroundColor: colors.teal + '12', borderWidth: 1.5, borderColor: colors.teal },
  scheduleOptionText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  scheduleOptionTextActive: { color: colors.teal },
  deliveryInstructionsSection: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  deliveryOptionsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  deliveryOptBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: colors.lightGray, gap: 4 },
  deliveryOptBtnActive: { backgroundColor: colors.teal + '12', borderWidth: 1.5, borderColor: colors.teal },
  deliveryOptText: { fontSize: 11, fontWeight: '600', color: colors.textLight, textAlign: 'center' },
  deliveryOptTextActive: { color: colors.teal },
  deliveryNoteInput: { backgroundColor: colors.lightGray, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: colors.textPrimary, minHeight: 44 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  pickerLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.lightGray },
  dateChipActive: { backgroundColor: colors.teal },
  dateChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  dateChipTextActive: { color: colors.textWhite },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.lightGray },
  timeChipActive: { backgroundColor: colors.teal },
  timeChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  timeChipTextActive: { color: colors.textWhite },
  scheduleConfirmBtn: { backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  scheduleConfirmText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  addressPickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  addressPickerItemActive: { backgroundColor: colors.teal + '08' },
  addressPickerLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  addressPickerText: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  defaultBadge: { backgroundColor: colors.teal + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  defaultBadgeText: { fontSize: 11, fontWeight: '600', color: colors.teal },
  addAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, justifyContent: 'center' },
  addAddressText: { fontSize: 15, fontWeight: '600', color: colors.teal },
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
