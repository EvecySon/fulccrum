import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from '../../components/MapView';
import * as Location from 'expo-location';
import { useTheme } from '../../theme/ThemeContext';
import { locationAPI } from '../../services/api';
import SwipeToConfirm from '../../components/courier/SwipeToConfirm';
import DeliveryProofModal from '../../components/courier/DeliveryProofModal';
import RateCustomerModal from '../../components/courier/RateCustomerModal';
import StackedOrdersBanner, { StackedOrder } from '../../components/courier/StackedOrdersBanner';

const { width } = Dimensions.get('window');

type DeliveryStep = 'heading_to_pickup' | 'at_pickup' | 'picked_up' | 'heading_to_dropoff' | 'arrived';

const steps: { key: DeliveryStep; label: string; icon: string }[] = [
  { key: 'heading_to_pickup', label: 'Heading to pickup', icon: 'navigate' },
  { key: 'at_pickup', label: 'At restaurant', icon: 'storefront' },
  { key: 'picked_up', label: 'Order picked up', icon: 'bag-check' },
  { key: 'heading_to_dropoff', label: 'Heading to customer', icon: 'bicycle' },
  { key: 'arrived', label: 'Arrived', icon: 'checkmark-circle' },
];

// Default coordinates (Lagos, Nigeria)
const PICKUP_COORDS = { latitude: 6.5244, longitude: 3.3792 };
const DROPOFF_COORDS = { latitude: 6.5344, longitude: 3.3892 };

export default function ActiveDeliveryScreen({ navigation }: any) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const mapRef = useRef<MapView>(null);
  const [driverCoords, setDriverCoords] = useState({
    latitude: 6.5220,
    longitude: 3.3770,
  });
  const [showDeliveryProof, setShowDeliveryProof] = useState(false);
  const [showRateCustomer, setShowRateCustomer] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [deliveryCountdown, setDeliveryCountdown] = useState(0);
  const [stackedOrders, setStackedOrders] = useState<StackedOrder[]>([
    { id: '#3242', restaurant: 'Burger House', customer: 'John Smith', status: 'delivering', estimatedTime: '12 min', pay: 1700, items: 3, isActive: true },
  ]);
  const [activeOrderId, setActiveOrderId] = useState('#3242');

  // Delivery countdown timer
  useEffect(() => {
    if (currentStep < 2) return; // only after pickup
    setDeliveryCountdown(order.estimatedTime * 60);
    const interval = setInterval(() => {
      setDeliveryCountdown(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep]);

  // Waiting time at restaurant
  useEffect(() => {
    if (steps[currentStep]?.key === 'at_pickup') {
      setIsWaiting(true);
      setWaitingSeconds(0);
      const interval = setInterval(() => setWaitingSeconds(prev => prev + 1), 1000);
      return () => clearInterval(interval);
    } else {
      setIsWaiting(false);
    }
  }, [currentStep]);

  useEffect(() => {
    let locationSub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
        (loc) => {
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setDriverCoords(coords);
          // Send location to backend
          locationAPI.updateDriverLocation({ latitude: coords.latitude, longitude: coords.longitude }).catch(() => {});
        },
      );
    })();

    return () => { locationSub?.remove(); };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      const target = currentStep < 2 ? PICKUP_COORDS : DROPOFF_COORDS;
      mapRef.current.fitToCoordinates(
        [driverCoords, target],
        { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
      );
    }
  }, [driverCoords, currentStep]);

  const openNavigation = (lat: number, lng: number) => {
    const url = Platform.select({
      ios: `maps:0,0?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  const order = {
    id: '#3242',
    restaurant: 'Burger House',
    restaurantAddress: '456 Restaurant Ave',
    customer: 'John Smith',
    customerAddress: '123 Main St, Apt 4B',
    customerPhone: '+1234567890',
    items: ['Gourmet Cheeseburger x1', 'Classic Fries x1', 'Milkshake x1'],
    total: 29.49,
    pay: 8.65,
    tip: 3.00,
    distance: 1.5,
    estimatedTime: 18,
    specialInstructions: 'Please ring the doorbell. Leave at door if no answer.',
  };

  const advanceStep = () => {
    if (steps[currentStep].key === 'arrived') {
      // Show delivery proof modal before completing
      setShowDeliveryProof(true);
      return;
    }
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleDeliveryComplete = () => {
    setShowDeliveryProof(false);
    setShowRateCustomer(true);
  };

  const handleRateComplete = () => {
    setShowRateCustomer(false);
    navigation.goBack();
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const waitingMinutes = Math.floor(waitingSeconds / 60);
  const waitingCompensation = waitingMinutes >= 10 ? Math.floor((waitingMinutes - 10) * 50) : 0;

  const getActionLabel = () => {
    switch (steps[currentStep].key) {
      case 'heading_to_pickup': return 'Arrived at Restaurant';
      case 'at_pickup': return 'Picked Up Order';
      case 'picked_up': return 'Start Delivery';
      case 'heading_to_dropoff': return 'Arrived at Customer';
      case 'arrived': return 'Complete Delivery';
      default: return 'Next';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Active Delivery</Text>
            <Text style={styles.headerOrder}>Order {order.id}</Text>
          </View>
          <View style={styles.etaBadge}>
            <Ionicons name="time" size={16} color={colors.textWhite} />
            <Text style={styles.etaText}>{order.estimatedTime} min</Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsRow}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={[
                styles.stepDot,
                index <= currentStep ? styles.stepDotActive : styles.stepDotInactive,
                index === currentStep && styles.stepDotCurrent,
              ]}>
                {index < currentStep ? (
                  <Ionicons name="checkmark" size={12} color={colors.textWhite} />
                ) : index === currentStep ? (
                  <View style={styles.stepPulse} />
                ) : null}
              </View>
              {index < steps.length - 1 && (
                <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.stepLabel}>{steps[currentStep].label}</Text>
      </View>

      {/* Live Map */}
      <View style={styles.mapCard}>
        <MapView
          ref={mapRef}
          style={styles.mapView}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: driverCoords.latitude,
            longitude: driverCoords.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          }}
          showsUserLocation={false}
        >
          {/* Driver (you) */}
          <Marker coordinate={driverCoords} title="You">
            <View style={[styles.mapMarker, { backgroundColor: colors.teal }]}>
              <Ionicons name="bicycle" size={16} color={colors.textWhite} />
            </View>
          </Marker>

          {/* Pickup */}
          <Marker coordinate={PICKUP_COORDS} title={order.restaurant}>
            <View style={[styles.mapMarker, { backgroundColor: colors.warning }]}>
              <Ionicons name="storefront" size={16} color={colors.textWhite} />
            </View>
          </Marker>

          {/* Drop-off */}
          <Marker coordinate={DROPOFF_COORDS} title={order.customer}>
            <View style={[styles.mapMarker, { backgroundColor: colors.error }]}>
              <Ionicons name="location" size={16} color={colors.textWhite} />
            </View>
          </Marker>
        </MapView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Stacked Orders */}
        <StackedOrdersBanner
          orders={stackedOrders}
          activeOrderId={activeOrderId}
          onSwitchOrder={(id) => setActiveOrderId(id)}
        />

        {/* Waiting Time Compensation */}
        {isWaiting && waitingSeconds > 0 && (
          <View style={styles.waitingBanner}>
            <View style={styles.waitingInfo}>
              <Ionicons name="timer" size={18} color={waitingMinutes >= 10 ? colors.error : colors.warning} />
              <Text style={styles.waitingTime}>
                Waiting: {waitingMinutes}m {waitingSeconds % 60}s
              </Text>
            </View>
            {waitingCompensation > 0 && (
              <Text style={styles.waitingComp}>+₦{waitingCompensation} compensation</Text>
            )}
            {waitingMinutes < 10 && (
              <Text style={styles.waitingNote}>Extra pay starts after 10 min wait</Text>
            )}
          </View>
        )}

        {/* Delivery Countdown */}
        {currentStep >= 2 && deliveryCountdown > 0 && (
          <View style={[styles.countdownBanner, deliveryCountdown < 300 && { backgroundColor: colors.error + '10', borderColor: colors.error + '25' }]}>
            <Ionicons name="time" size={16} color={deliveryCountdown < 300 ? colors.error : colors.teal} />
            <Text style={[styles.countdownText, deliveryCountdown < 300 && { color: colors.error }]}>
              ETA: {formatCountdown(deliveryCountdown)}
            </Text>
          </View>
        )}

        {/* Route Details */}
        <View style={styles.routeCard}>
          <View style={styles.routePoint}>
            <View style={styles.routeDotPickup} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>PICKUP</Text>
              <Text style={styles.routeName}>{order.restaurant}</Text>
              <Text style={styles.routeAddress}>{order.restaurantAddress}</Text>
            </View>
            <TouchableOpacity style={styles.navBtn} onPress={() => openNavigation(PICKUP_COORDS.latitude, PICKUP_COORDS.longitude)}>
              <Ionicons name="navigate" size={18} color={colors.teal} />
            </TouchableOpacity>
          </View>

          <View style={styles.routeDivider}>
            <View style={styles.routeDividerLine} />
            <View style={styles.routeDistanceBadge}>
              <Text style={styles.routeDistanceText}>{order.distance} km</Text>
            </View>
            <View style={styles.routeDividerLine} />
          </View>

          <View style={styles.routePoint}>
            <View style={styles.routeDotDrop} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>DROP-OFF</Text>
              <Text style={styles.routeName}>{order.customer}</Text>
              <Text style={styles.routeAddress}>{order.customerAddress}</Text>
            </View>
            <TouchableOpacity style={styles.navBtn} onPress={() => openNavigation(DROPOFF_COORDS.latitude, DROPOFF_COORDS.longitude)}>
              <Ionicons name="navigate" size={18} color={colors.teal} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.orderCard}>
          <Text style={styles.cardTitle}>Order Details</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Ionicons name="ellipse" size={6} color={colors.textLight} />
              <Text style={styles.orderItemText}>{item}</Text>
            </View>
          ))}
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Order Total</Text>
            <Text style={styles.orderTotalValue}>₦{order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
              <Text style={styles.instructionsTitle}>Special Instructions</Text>
            </View>
            <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
          </View>
        )}

        {/* Contact Customer */}
        <View style={styles.contactCard}>
          <View style={styles.contactInfo}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactInitial}>{order.customer.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.contactName}>{order.customer}</Text>
              <Text style={styles.contactPhone}>{order.customerPhone}</Text>
            </View>
          </View>
          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('OrderChat', {
              orderId: order.id,
              recipientName: order.customer,
              recipientRole: 'customer',
            })}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.navy} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={() => navigation.navigate('Call', {
              orderId: order.id,
              recipientName: order.customer,
              recipientRole: 'customer',
              callType: 'voice',
            })}>
              <Ionicons name="call" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.earningsCard}>
          <Text style={styles.cardTitle}>Your Earnings</Text>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Delivery Fee</Text>
            <Text style={styles.earningsValue}>₦{order.pay.toFixed(2)}</Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Tip</Text>
            <Text style={[styles.earningsValue, { color: colors.success }]}>₦{order.tip.toFixed(2)}</Text>
          </View>
          <View style={[styles.earningsRow, styles.earningsTotalRow]}>
            <Text style={styles.earningsTotalLabel}>Total</Text>
            <Text style={styles.earningsTotalValue}>₦{(order.pay + order.tip).toFixed(2)}</Text>
          </View>
        </View>

        {/* Report Issue */}
        <TouchableOpacity style={styles.reportBtn}>
          <Ionicons name="flag-outline" size={18} color={colors.error} />
          <Text style={styles.reportText}>Report an Issue</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Action — Swipe to Confirm */}
      <View style={styles.bottomBar}>
        <SwipeToConfirm
          label={getActionLabel()}
          icon={steps[currentStep].key === 'arrived' ? 'camera' : 'checkmark'}
          color={steps[currentStep].key === 'arrived' ? colors.success : colors.teal}
          onConfirm={advanceStep}
        />
      </View>

      {/* Delivery Proof Modal */}
      <DeliveryProofModal
        visible={showDeliveryProof}
        orderId={order.id}
        customerName={order.customer}
        deliveryType="leave_at_door"
        onComplete={handleDeliveryComplete}
        onClose={() => setShowDeliveryProof(false)}
      />

      {/* Rate Customer Modal */}
      <RateCustomerModal
        visible={showRateCustomer}
        orderId={order.id}
        customerName={order.customer}
        onSubmit={handleRateComplete}
        onSkip={handleRateComplete}
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  headerOrder: { fontSize: 13, color: colors.tealLight, marginTop: 2 },
  etaBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.teal,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4,
  },
  etaText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: colors.teal },
  stepDotInactive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  stepDotCurrent: { backgroundColor: colors.teal, borderWidth: 3, borderColor: colors.teal + '50' },
  stepPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textWhite },
  stepLine: { width: 30, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 2 },
  stepLineActive: { backgroundColor: colors.teal },
  stepLabel: { fontSize: 13, color: colors.tealLight, textAlign: 'center' },
  mapCard: { marginHorizontal: 10, marginTop: 10 },
  mapView: {
    height: 180, borderRadius: 16, overflow: 'hidden',
  },
  mapMarker: {
    width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  routeCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDotPickup: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.teal },
  routeDotDrop: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.error },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 10, fontWeight: '700', color: colors.textLight, letterSpacing: 1 },
  routeName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  routeAddress: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  navBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.teal + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  routeDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, paddingLeft: 5 },
  routeDividerLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },
  routeDistanceBadge: { backgroundColor: colors.lightGray, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginHorizontal: 8 },
  routeDistanceText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  orderCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  orderItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  orderItemText: { fontSize: 14, color: colors.textSecondary },
  orderTotal: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  orderTotalLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  orderTotalValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  instructionsCard: {
    backgroundColor: colors.warning + '08', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: colors.warning + '25',
  },
  instructionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  instructionsTitle: { fontSize: 14, fontWeight: '700', color: colors.warning },
  instructionsText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  contactCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
  },
  contactInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactAvatar: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.navy + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  contactInitial: { fontSize: 18, fontWeight: '700', color: colors.navy },
  contactName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  contactPhone: { fontSize: 13, color: colors.textLight, marginTop: 1 },
  contactActions: { flexDirection: 'row', gap: 8 },
  contactBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  callBtn: { backgroundColor: colors.teal },
  earningsCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  earningsLabel: { fontSize: 14, color: colors.textSecondary },
  earningsValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  earningsTotalRow: { borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: 6, paddingTop: 10 },
  earningsTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  earningsTotalValue: { fontSize: 18, fontWeight: '800', color: colors.teal },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
  },
  reportText: { fontSize: 14, fontWeight: '600', color: colors.error },
  bottomBar: {
    backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 10,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, gap: 8,
  },
  actionText: { fontSize: 17, fontWeight: '700', color: colors.textWhite },
  waitingBanner: {
    backgroundColor: colors.warning + '10', borderRadius: 12, padding: 10, marginBottom: 10,
    borderWidth: 1, borderColor: colors.warning + '25',
  },
  waitingInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  waitingTime: { fontSize: 14, fontWeight: '700', color: colors.warning },
  waitingComp: { fontSize: 13, fontWeight: '700', color: colors.success, marginTop: 4 },
  waitingNote: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  countdownBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end',
    backgroundColor: colors.teal + '10', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10,
    borderWidth: 1, borderColor: colors.teal + '20',
  },
  countdownText: { fontSize: 14, fontWeight: '700', color: colors.teal },
});
