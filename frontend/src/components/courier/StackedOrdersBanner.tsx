import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export interface StackedOrder {
  id: string;
  restaurant: string;
  customer: string;
  status: 'pickup' | 'delivering';
  estimatedTime: string;
  pay: number;
  items: number;
  isActive: boolean;
}

interface Props {
  orders: StackedOrder[];
  activeOrderId: string;
  onSwitchOrder: (orderId: string) => void;
}

export default function StackedOrdersBanner({ orders, activeOrderId, onSwitchOrder }: Props) {
  if (orders.length <= 1) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="layers" size={14} color={colors.white} />
          <Text style={styles.badgeText}>{orders.length} Orders</Text>
        </View>
        <Text style={styles.hint}>Tap to switch</Text>
      </View>
      <View style={styles.ordersRow}>
        {orders.map((order, index) => {
          const isActive = order.id === activeOrderId;
          return (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderChip, isActive && styles.orderChipActive]}
              onPress={() => onSwitchOrder(order.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.orderNumber, isActive && styles.orderNumberActive]}>
                <Text style={[styles.orderNumberText, isActive && styles.orderNumberTextActive]}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.orderChipInfo}>
                <Text style={[styles.chipRestaurant, isActive && styles.chipRestaurantActive]} numberOfLines={1}>
                  {order.restaurant}
                </Text>
                <Text style={[styles.chipStatus, isActive && styles.chipStatusActive]}>
                  {order.status === 'pickup' ? 'Pick up' : 'Deliver'} · {order.estimatedTime}
                </Text>
              </View>
              {isActive && (
                <View style={styles.activeDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navy, borderRadius: 14, padding: 12, marginBottom: 10,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.teal, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.white },
  hint: { fontSize: 11, color: colors.textLight },
  ordersRow: { gap: 6 },
  orderChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.navyDark, borderRadius: 10, padding: 10,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  orderChipActive: {
    backgroundColor: colors.teal + '15', borderColor: colors.teal,
  },
  orderNumber: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.darkGray,
    justifyContent: 'center', alignItems: 'center',
  },
  orderNumberActive: { backgroundColor: colors.teal },
  orderNumberText: { fontSize: 13, fontWeight: '800', color: colors.textLight },
  orderNumberTextActive: { color: colors.white },
  orderChipInfo: { flex: 1 },
  chipRestaurant: { fontSize: 14, fontWeight: '600', color: colors.textLight },
  chipRestaurantActive: { color: colors.white },
  chipStatus: { fontSize: 12, color: colors.darkGray, marginTop: 1 },
  chipStatusActive: { color: colors.tealLight },
  activeDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.teal,
  },
});
