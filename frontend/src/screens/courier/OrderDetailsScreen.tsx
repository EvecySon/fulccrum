import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierOrdersAPI } from '../../services/api';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  specialInstructions?: string;
  allergens?: string[];
}

const mockOrder = {
  id: '#3242',
  status: 'picked_up',
  restaurant: 'Burger House',
  restaurantAddress: '456 Restaurant Ave, Victoria Island',
  restaurantPhone: '+2348012345678',
  customer: 'John Smith',
  customerAddress: '123 Main St, Apt 4B, Lekki Phase 1',
  customerPhone: '+2348098765432',
  deliveryType: 'leave_at_door' as const,
  deliveryInstructions: 'Please ring the doorbell. Leave at door if no answer. Gate code: 4521',
  floor: '4th Floor',
  apartmentNumber: '4B',
  items: [
    { id: '1', name: 'Gourmet Cheeseburger', quantity: 1, price: 4500, modifiers: ['Extra cheese', 'No onions'], specialInstructions: 'Well done patty', allergens: ['Dairy', 'Gluten'] },
    { id: '2', name: 'Classic Fries (Large)', quantity: 1, price: 1800, modifiers: ['Extra salt'], allergens: ['Gluten'] },
    { id: '3', name: 'Chocolate Milkshake', quantity: 1, price: 2500, modifiers: ['Extra thick'], allergens: ['Dairy'] },
    { id: '4', name: 'Chicken Wings (6pc)', quantity: 2, price: 3200, modifiers: ['BBQ sauce'], specialInstructions: 'Extra napkins please' },
  ] as OrderItem[],
  subtotal: 15200,
  deliveryFee: 1500,
  serviceFee: 450,
  tip: 3000,
  total: 20150,
  basePay: 1500,
  distanceBonus: 300,
  surgeBonus: 500,
  tipAmount: 3000,
  totalEarnings: 5300,
  distance: 3.2,
  estimatedTime: 25,
  placedAt: '2:15 PM',
  pickedUpAt: '2:28 PM',
  estimatedDelivery: '2:43 PM',
};

export default function OrderDetailsScreen({ navigation, route }: any) {
  const orderId = route?.params?.orderId || mockOrder.id;
  const [order, setOrder] = useState(mockOrder);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const res = await courierOrdersAPI.getDetails(orderId);
      if (res) setOrder(prev => ({ ...prev, ...res }));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'preparing': return colors.info;
      case 'ready': return colors.teal;
      case 'picked_up': return colors.navy;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textLight;
    }
  };

  const deliveryTypeIcons: Record<string, { icon: string; label: string }> = {
    hand_to_customer: { icon: 'hand-left', label: 'Hand to Customer' },
    leave_at_door: { icon: 'home', label: 'Leave at Door' },
    meet_outside: { icon: 'walk', label: 'Meet Outside' },
  };

  const dtInfo = deliveryTypeIcons[order.deliveryType] || deliveryTypeIcons.hand_to_customer;

  if (loading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.teal} /></View>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order {order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Timeline */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
            <View style={styles.timelineInfo}>
              <Text style={styles.timelineLabel}>Order Placed</Text>
              <Text style={styles.timelineTime}>{order.placedAt}</Text>
            </View>
          </View>
          <View style={styles.timelineConnector} />
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: order.pickedUpAt ? colors.success : colors.borderLight }]} />
            <View style={styles.timelineInfo}>
              <Text style={styles.timelineLabel}>Picked Up</Text>
              <Text style={styles.timelineTime}>{order.pickedUpAt || 'Pending'}</Text>
            </View>
          </View>
          <View style={styles.timelineConnector} />
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: colors.borderLight }]} />
            <View style={styles.timelineInfo}>
              <Text style={styles.timelineLabel}>Estimated Delivery</Text>
              <Text style={styles.timelineTime}>{order.estimatedDelivery}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Instructions */}
        {order.deliveryInstructions && (
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <View style={styles.instructionsIconRow}>
                <Ionicons name="alert-circle" size={20} color={colors.warning} />
                <Text style={styles.instructionsTitle}>Delivery Instructions</Text>
              </View>
              <View style={[styles.deliveryTypeBadge, { backgroundColor: colors.teal + '12' }]}>
                <Ionicons name={dtInfo.icon as any} size={14} color={colors.teal} />
                <Text style={styles.deliveryTypeText}>{dtInfo.label}</Text>
              </View>
            </View>
            <Text style={styles.instructionsText}>{order.deliveryInstructions}</Text>
            {(order.floor || order.apartmentNumber) && (
              <View style={styles.locationDetails}>
                {order.floor && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="layers-outline" size={14} color={colors.navy} />
                    <Text style={styles.locationBadgeText}>{order.floor}</Text>
                  </View>
                )}
                {order.apartmentNumber && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="home-outline" size={14} color={colors.navy} />
                    <Text style={styles.locationBadgeText}>Apt {order.apartmentNumber}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.cardTitle}>Order Items ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <View key={item.id} style={[styles.itemRow, idx < order.items.length - 1 && styles.itemBorder]}>
              <View style={styles.itemQty}>
                <Text style={styles.itemQtyText}>{item.quantity}x</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.modifiers && item.modifiers.length > 0 && (
                  <Text style={styles.itemModifiers}>{item.modifiers.join(' · ')}</Text>
                )}
                {item.specialInstructions && (
                  <View style={styles.itemNote}>
                    <Ionicons name="chatbubble-outline" size={12} color={colors.warning} />
                    <Text style={styles.itemNoteText}>{item.specialInstructions}</Text>
                  </View>
                )}
                {item.allergens && item.allergens.length > 0 && (
                  <View style={styles.allergenRow}>
                    <Ionicons name="warning-outline" size={12} color={colors.error} />
                    <Text style={styles.allergenText}>{item.allergens.join(', ')}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.itemPrice}>₦{(item.price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}

          {/* Order Total */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₦{order.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalValue}>₦{order.deliveryFee.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Service Fee</Text>
              <Text style={styles.totalValue}>₦{order.serviceFee.toLocaleString()}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Order Total</Text>
              <Text style={styles.grandTotalValue}>₦{order.total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Your Earnings Breakdown */}
        <View style={styles.earningsCard}>
          <Text style={styles.cardTitle}>Your Earnings Breakdown</Text>
          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Ionicons name="bicycle-outline" size={16} color={colors.teal} />
              <Text style={styles.earningsLabel}>Base Pay</Text>
            </View>
            <Text style={styles.earningsValue}>₦{order.basePay.toLocaleString()}</Text>
          </View>
          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Ionicons name="navigate-outline" size={16} color={colors.navy} />
              <Text style={styles.earningsLabel}>Distance Bonus</Text>
            </View>
            <Text style={styles.earningsValue}>₦{order.distanceBonus.toLocaleString()}</Text>
          </View>
          {order.surgeBonus > 0 && (
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Ionicons name="trending-up" size={16} color={colors.error} />
                <Text style={styles.earningsLabel}>Surge Bonus</Text>
              </View>
              <Text style={[styles.earningsValue, { color: colors.error }]}>₦{order.surgeBonus.toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Ionicons name="heart-outline" size={16} color={colors.success} />
              <Text style={styles.earningsLabel}>Tip</Text>
            </View>
            <Text style={[styles.earningsValue, { color: colors.success }]}>₦{order.tipAmount.toLocaleString()}</Text>
          </View>
          <View style={[styles.earningsRow, styles.earningsTotalRow]}>
            <Text style={styles.earningsTotalLabel}>Total Earnings</Text>
            <Text style={styles.earningsTotalValue}>₦{order.totalEarnings.toLocaleString()}</Text>
          </View>
        </View>

        {/* Contact Cards */}
        <View style={styles.contactSection}>
          <Text style={styles.cardTitle}>Contact</Text>
          {/* Restaurant */}
          <View style={styles.contactCard}>
            <View style={[styles.contactIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="storefront" size={18} color={colors.warning} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{order.restaurant}</Text>
              <Text style={styles.contactAddress} numberOfLines={1}>{order.restaurantAddress}</Text>
            </View>
            <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('OrderChat', { orderId: order.id, recipientName: order.restaurant, recipientRole: 'merchant' })}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.navy} />
            </TouchableOpacity>
          </View>
          {/* Customer */}
          <View style={styles.contactCard}>
            <View style={[styles.contactIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="person" size={18} color={colors.teal} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{order.customer}</Text>
              <Text style={styles.contactAddress} numberOfLines={1}>{order.customerAddress}</Text>
            </View>
            <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('OrderChat', { orderId: order.id, recipientName: order.customer, recipientRole: 'customer' })}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.navy} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.teal }]} onPress={() => navigation.navigate('Call', { orderId: order.id, recipientName: order.customer, recipientRole: 'customer', callType: 'voice' })}>
              <Ionicons name="call" size={18} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Report Issue */}
        <TouchableOpacity style={styles.reportBtn}>
          <Ionicons name="flag-outline" size={18} color={colors.error} />
          <Text style={styles.reportText}>Report an Issue with this Order</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  timelineCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineInfo: { flex: 1 },
  timelineLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  timelineTime: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  timelineConnector: { width: 2, height: 16, backgroundColor: colors.borderLight, marginLeft: 5, marginVertical: 2 },
  instructionsCard: {
    backgroundColor: colors.warning + '08', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: colors.warning + '25',
  },
  instructionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  instructionsIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  instructionsTitle: { fontSize: 15, fontWeight: '700', color: colors.warning },
  deliveryTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  deliveryTypeText: { fontSize: 12, fontWeight: '600', color: colors.teal },
  instructionsText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  locationDetails: { flexDirection: 'row', gap: 8, marginTop: 10 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.navy + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  locationBadgeText: { fontSize: 12, fontWeight: '600', color: colors.navy },
  itemsCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  itemQty: { backgroundColor: colors.teal + '12', width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  itemQtyText: { fontSize: 13, fontWeight: '700', color: colors.teal },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  itemModifiers: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  itemNote: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: colors.warning + '08', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  itemNoteText: { fontSize: 12, color: colors.warning, fontWeight: '500' },
  allergenRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  allergenText: { fontSize: 11, color: colors.error, fontWeight: '600' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  totalSection: { borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: 8, paddingTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 13, color: colors.textSecondary },
  totalValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  grandTotal: { borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: 6, paddingTop: 8 },
  grandTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  grandTotalValue: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  earningsCard: { backgroundColor: colors.teal + '06', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.teal + '15' },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  earningsItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  earningsLabel: { fontSize: 14, color: colors.textSecondary },
  earningsValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  earningsTotalRow: { borderTopWidth: 1, borderTopColor: colors.teal + '20', marginTop: 6, paddingTop: 10 },
  earningsTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.teal },
  earningsTotalValue: { fontSize: 20, fontWeight: '800', color: colors.teal },
  contactSection: { marginBottom: 10 },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  contactIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  contactAddress: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  contactBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.navy + '10', justifyContent: 'center', alignItems: 'center' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  reportText: { fontSize: 14, fontWeight: '600', color: colors.error },
});
