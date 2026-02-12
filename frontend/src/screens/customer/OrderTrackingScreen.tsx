import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from '../../components/MapView';
import { colors } from '../../theme/colors';
import { ordersAPI, locationAPI } from '../../services/api';
import { joinOrderRoom, leaveOrderRoom, onDriverLocationUpdate } from '../../services/socketService';

// Default coordinates (Lagos, Nigeria)
const RESTAURANT_COORDS = { latitude: 6.5244, longitude: 3.3792 };
const CUSTOMER_COORDS = { latitude: 6.5344, longitude: 3.3892 };

const stages = [
  { key: 'pending', label: 'Order Placed', icon: 'checkmark-circle' },
  { key: 'accepted', label: 'Accepted', icon: 'checkmark-done-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'restaurant' },
  { key: 'ready', label: 'Ready', icon: 'bag-check' },
  { key: 'picked_up', label: 'Picked Up', icon: 'bicycle' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
];

const statusMessages: Record<string, string> = {
  pending: 'Waiting for restaurant to accept',
  accepted: 'Restaurant accepted your order!',
  preparing: 'Your food is being prepared',
  ready: 'Your order is ready for pickup',
  picked_up: 'Your food is on its way!',
  in_transit: 'Your food is on its way!',
  delivered: 'Order delivered!',
  cancelled: 'Order was cancelled',
};

const getStageIndex = (status: string) => {
  const idx = stages.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
};

export default function OrderTrackingScreen({ navigation, route }: any) {
  const orderId = route?.params?.orderId || route?.params?.order?.id || '';
  const [order, setOrder] = useState<any>(route?.params?.order || null);
  const [loading, setLoading] = useState(!route?.params?.order);
  const currentStageIndex = getStageIndex(order?.status || 'pending');
  const mapRef = useRef<MapView>(null);
  const [driverLocation, setDriverLocation] = useState({
    latitude: 6.5294,
    longitude: 3.3842,
  });

  // Derived fields from real order data
  const restaurantName = order?.business?.businessName || 'Restaurant';
  const driverName = order?.driver ? `${order.driver.firstName} ${order.driver.lastName || ''}`.trim() : 'Awaiting driver';
  const driverAvatar = order?.driver?.avatarUrl;
  const totalAmount = order?.totalAmount ? Number(order.totalAmount) : 0;
  const orderItems = order?.items || [];

  useEffect(() => {
    if (!order && orderId) {
      (async () => {
        try {
          const res = await ordersAPI.getOrder(orderId);
          if (res) setOrder(res);
        } catch (e: any) { Alert.alert('Error', e?.message || 'Could not load order'); }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Poll for order updates every 15s
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      try {
        const res = await ordersAPI.getOrder(orderId);
        if (res) setOrder(res);
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    // Join order tracking room
    joinOrderRoom(orderId);

    // Listen for driver location updates
    onDriverLocationUpdate((data: any) => {
      if (data.latitude && data.longitude) {
        setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
      }
    });

    return () => {
      leaveOrderRoom(orderId);
    };
  }, [orderId]);

  useEffect(() => {
    // Fit map to show all markers
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [RESTAURANT_COORDS, CUSTOMER_COORDS, driverLocation],
        { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
      );
    }
  }, [driverLocation]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order?.orderNumber || orderId.slice(0, 8)}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
          <Ionicons name="help-circle-outline" size={24} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {/* ETA Banner */}
      <View style={styles.etaBanner}>
        <Text style={styles.etaLabel}>{order?.status === 'delivered' ? 'Delivered' : 'Order Status'}</Text>
        <Text style={styles.etaTime}>{order?.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</Text>
        <Text style={styles.etaSubtext}>{statusMessages[order?.status] || 'Processing your order'}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
      {/* Live Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* Restaurant Marker */}
          <Marker coordinate={RESTAURANT_COORDS} title={restaurantName}>
            <View style={styles.markerContainer}>
              <Ionicons name="restaurant" size={18} color={colors.textWhite} />
            </View>
          </Marker>

          {/* Customer Marker */}
          <Marker coordinate={CUSTOMER_COORDS} title="Your Location">
            <View style={[styles.markerContainer, { backgroundColor: colors.navy }]}>
              <Ionicons name="location" size={18} color={colors.textWhite} />
            </View>
          </Marker>

          {/* Driver Marker */}
          <Marker coordinate={driverLocation} title={driverName}>
            <View style={[styles.markerContainer, { backgroundColor: colors.warning }]}>
              <Ionicons name="bicycle" size={18} color={colors.textWhite} />
            </View>
          </Marker>
        </MapView>
      </View>

      {/* Progress Stages */}
      <View style={styles.progressSection}>
        {stages.map((stage, index) => (
          <View key={stage.key} style={styles.stageRow}>
            <View style={styles.stageIndicator}>
              <View
                style={[
                  styles.stageDot,
                  index <= currentStageIndex && styles.stageDotActive,
                  index === currentStageIndex && styles.stageDotCurrent,
                ]}
              >
                <Ionicons
                  name={stage.icon as any}
                  size={16}
                  color={
                    index <= currentStageIndex
                      ? colors.textWhite
                      : colors.textLight
                  }
                />
              </View>
              {index < stages.length - 1 && (
                <View
                  style={[
                    styles.stageLine,
                    index < currentStageIndex && styles.stageLineActive,
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.stageLabel,
                index <= currentStageIndex && styles.stageLabelActive,
                index === currentStageIndex && styles.stageLabelCurrent,
              ]}
            >
              {stage.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Contact Restaurant */}
      <View style={styles.contactSection}>
        <Text style={styles.contactLabel}>Restaurant</Text>
        <View style={styles.contactRow}>
          <View style={styles.contactAvatarWrap}>
            <Ionicons name="restaurant" size={20} color={colors.textWhite} />
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{restaurantName}</Text>
            <Text style={styles.contactRoleText}>Preparing your order</Text>
          </View>
          <TouchableOpacity style={styles.driverAction} onPress={() => navigation.navigate('Chat')}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.navy} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.driverAction, styles.callAction]}>
            <Ionicons name="call" size={20} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Driver */}
      {order?.driver && (
      <View style={styles.contactSection}>
        <Text style={styles.contactLabel}>Delivery Driver</Text>
        <View style={styles.contactRow}>
          {driverAvatar ? (
            <Image source={{ uri: driverAvatar }} style={styles.driverAvatar} />
          ) : (
            <View style={[styles.contactAvatarWrap, { backgroundColor: colors.teal }]}>
              <Ionicons name="bicycle" size={20} color={colors.textWhite} />
            </View>
          )}
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driverName}</Text>
            {order.driver.phone && <Text style={styles.contactRoleText}>{order.driver.phone}</Text>}
          </View>
          <TouchableOpacity style={styles.driverAction} onPress={() => navigation.navigate('Chat')}>
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.teal} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.driverAction, styles.callActionTeal]}>
            <Ionicons name="call" size={20} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      </View>
      )}

      {/* Order Details */}
      <View style={styles.orderDetails}>
        <Text style={styles.detailsTitle}>{restaurantName}</Text>
        {orderItems.map((item: any, index: number) => (
          <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.detailsItem}>
              {item.quantity}× {item.menuItem?.name || item.name || 'Item'}
            </Text>
            <Text style={styles.detailsItem}>₦{Number(item.totalPrice || 0).toLocaleString()}</Text>
          </View>
        ))}
        {orderItems.length === 0 && <Text style={styles.detailsItem}>Order details loading...</Text>}
        <View style={styles.detailsTotal}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₦{totalAmount.toLocaleString()}</Text>
        </View>
      </View>
      <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: 16,
    backgroundColor: colors.navy,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
  },
  etaBanner: {
    backgroundColor: colors.navy,
    alignItems: 'center',
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  etaLabel: {
    fontSize: 13,
    color: colors.tealLight,
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textWhite,
  },
  etaSubtext: {
    fontSize: 14,
    color: colors.tealLight,
    marginTop: 4,
  },
  mapContainer: {
    height: 180,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  progressSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stageIndicator: {
    alignItems: 'center',
  },
  stageDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageDotActive: {
    backgroundColor: colors.teal,
  },
  stageDotCurrent: {
    backgroundColor: colors.teal,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  stageLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.lightGray,
    marginVertical: 2,
  },
  stageLineActive: {
    backgroundColor: colors.teal,
  },
  stageLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6,
  },
  stageLabelActive: {
    color: colors.textSecondary,
  },
  stageLabelCurrent: {
    fontWeight: '700',
    color: colors.teal,
  },
  contactSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactRoleText: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  driverRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  driverAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callAction: {
    backgroundColor: colors.navy,
  },
  callActionTeal: {
    backgroundColor: colors.teal,
  },
  orderDetails: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  detailsItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailsTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.teal,
  },
});
