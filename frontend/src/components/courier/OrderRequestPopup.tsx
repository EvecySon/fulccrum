import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Vibration,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const TIMER_DURATION = 30; // seconds

export interface IncomingOrder {
  id: string;
  restaurant: string;
  restaurantAddress: string;
  customer: string;
  customerAddress: string;
  items: string[];
  itemCount: number;
  distance: number;
  estimatedTime: number;
  basePay: number;
  estimatedTip: number;
  surgeMultiplier: number;
  deliveryInstructions?: string;
  isStacked?: boolean;
  stackedWith?: string;
}

interface Props {
  visible: boolean;
  order: IncomingOrder | null;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string, reason?: string) => void;
  onTimeout: (orderId: string) => void;
}

export default function OrderRequestPopup({ visible, order, onAccept, onDecline, onTimeout }: Props) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && order) {
      setTimeLeft(TIMER_DURATION);
      progressAnim.setValue(1);
      slideAnim.setValue(0);

      // Vibrate
      Vibration.vibrate([0, 400, 200, 400]);

      // Slide in
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Progress bar countdown
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: TIMER_DURATION * 1000,
        useNativeDriver: false,
      }).start();

      // Pulse animation for pay
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible, order]);

  useEffect(() => {
    if (!visible || !order) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout(order.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, order]);

  if (!visible || !order) return null;

  const totalPay = order.basePay * order.surgeMultiplier + order.estimatedTip;
  const payPerKm = totalPay / Math.max(order.distance, 0.1);
  const isUrgent = timeLeft <= 10;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) },
              ],
            },
          ]}
        >
          {/* Timer Bar */}
          <View style={styles.timerBarBg}>
            <Animated.View
              style={[
                styles.timerBarFill,
                {
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  backgroundColor: isUrgent ? colors.error : colors.teal,
                },
              ]}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.newBadge, order.isStacked && { backgroundColor: colors.warning }]}>
                <Text style={styles.newBadgeText}>
                  {order.isStacked ? 'STACKED ORDER' : 'NEW ORDER'}
                </Text>
              </View>
              {order.surgeMultiplier > 1 && (
                <View style={styles.surgeBadge}>
                  <Ionicons name="trending-up" size={12} color={colors.error} />
                  <Text style={styles.surgeText}>{order.surgeMultiplier}x surge</Text>
                </View>
              )}
            </View>
            <View style={[styles.timerCircle, isUrgent && { borderColor: colors.error }]}>
              <Text style={[styles.timerText, isUrgent && { color: colors.error }]}>{timeLeft}s</Text>
            </View>
          </View>

          {/* Pay Section */}
          <Animated.View style={[styles.paySection, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.payLabel}>Estimated Earnings</Text>
            <Text style={styles.payAmount}>₦{totalPay.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
            <View style={styles.payBreakdown}>
              <Text style={styles.payDetail}>Base: ₦{order.basePay.toLocaleString()}</Text>
              {order.estimatedTip > 0 && (
                <Text style={[styles.payDetail, { color: colors.success }]}>
                  + ₦{order.estimatedTip.toLocaleString()} tip
                </Text>
              )}
              {order.surgeMultiplier > 1 && (
                <Text style={[styles.payDetail, { color: colors.error }]}>
                  {order.surgeMultiplier}x surge
                </Text>
              )}
            </View>
            <View style={styles.payPerKm}>
              <Text style={styles.payPerKmText}>₦{payPerKm.toFixed(0)}/km</Text>
            </View>
          </Animated.View>

          {/* Route */}
          <View style={styles.routeSection}>
            <View style={styles.routePoint}>
              <View style={styles.routeDotPickup} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeName}>{order.restaurant}</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>{order.restaurantAddress}</Text>
              </View>
            </View>
            <View style={styles.routeLine}>
              <View style={styles.routeLineDash} />
            </View>
            <View style={styles.routePoint}>
              <View style={styles.routeDotDrop} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>DROP-OFF</Text>
                <Text style={styles.routeName}>{order.customer}</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>{order.customerAddress}</Text>
              </View>
            </View>
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="navigate-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{order.distance} km</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>~{order.estimatedTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bag-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{order.itemCount} items</Text>
            </View>
          </View>

          {/* Delivery Instructions */}
          {order.deliveryInstructions && (
            <View style={styles.instructionsBanner}>
              <Ionicons name="information-circle" size={16} color={colors.warning} />
              <Text style={styles.instructionsText} numberOfLines={1}>{order.deliveryInstructions}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => onDecline(order.id)}
            >
              <Ionicons name="close" size={24} color={colors.error} />
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => onAccept(order.id)}
            >
              <Ionicons name="checkmark" size={24} color={colors.textWhite} />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  timerBarBg: {
    height: 5,
    backgroundColor: colors.lightGray,
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newBadge: {
    backgroundColor: colors.teal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textWhite,
    letterSpacing: 1,
  },
  surgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.error + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  surgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
  timerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.teal,
  },
  paySection: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    backgroundColor: colors.teal + '08',
    borderRadius: 16,
    marginBottom: 12,
  },
  payLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  payAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.teal,
    marginTop: 2,
  },
  payBreakdown: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  payDetail: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  payPerKm: {
    marginTop: 6,
    backgroundColor: colors.navy + '10',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  payPerKmText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  routeSection: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDotPickup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.teal,
  },
  routeDotDrop: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 1,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  routeAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  routeLine: {
    paddingLeft: 5,
    paddingVertical: 4,
  },
  routeLineDash: {
    width: 2,
    height: 20,
    backgroundColor: colors.borderLight,
    marginLeft: 0,
    borderStyle: 'dashed',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  instructionsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.warning + '10',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.warning + '25',
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.error + '10',
    borderWidth: 1.5,
    borderColor: colors.error + '30',
  },
  declineBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.teal,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
