import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { packageDeliveryAPI } from '../../services/packageDeliveryAPI';
import { mockGetDeliveryStatus } from '../../services/mockPackageDelivery';
import { resolveMediaUrl } from '../../services/api';

const TrackDeliveryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, courier } = (route.params as any) || {};

  const mapRef = useRef<MapView>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
  const [courierLocation, setCourierLocation] = useState<any>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setIsLoading(false);
      return;
    }

    fetchDeliveryStatus();
    const interval = setInterval(fetchDeliveryStatus, 5000); // Poll every 5 seconds

    startPulseAnimation();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (deliveryStatus?.order?.status === 'delivered') {
      setTimeout(() => {
        (navigation as any).replace('DeliveryComplete', { orderId });
      }, 2000);
    }
  }, [deliveryStatus]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchDeliveryStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await mockGetDeliveryStatus(orderId);
      
      if (response.success) {
        setDeliveryStatus(response.data);
        setCourierLocation(response.data.courierLocation);
        setEta(response.data.eta || null);

        // Update map to show courier location
        if (response.data.courierLocation && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: response.data.courierLocation.latitude,
            longitude: response.data.courierLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }, 1000);
        }
      } else {
        setError('Failed to load delivery status');
      }
    } catch (error) {
      console.error('Fetch delivery status error:', error);
      setError('Failed to load delivery status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallCourier = () => {
    if (courier?.phoneNumber) {
      Linking.openURL(`tel:${courier.phoneNumber}`);
    }
  };

  const handleCancelDelivery = () => {
    Alert.alert(
      'Cancel Delivery',
      'Are you sure you want to cancel this delivery?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await packageDeliveryAPI.cancelDelivery(orderId);
              (navigation as any).navigate('HomeTabs');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel delivery');
            }
          },
        },
      ]
    );
  };

  const getStatusInfo = () => {
    const status = deliveryStatus?.order?.status;
    switch (status) {
      case 'accepted':
        return {
          title: 'Courier on the way to pickup',
          icon: 'bicycle',
          color: '#14b8a6',
        };
      case 'picked_up':
        return {
          title: 'Package picked up',
          icon: 'checkmark-circle',
          color: '#14b8a6',
        };
      case 'delivered':
        return {
          title: 'Package delivered',
          icon: 'checkmark-done-circle',
          color: '#14b8a6',
        };
      default:
        return {
          title: 'Tracking delivery',
          icon: 'location',
          color: '#14b8a6',
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Internal server error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchDeliveryStatus}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && !deliveryStatus) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading delivery status...</Text>
      </View>
    );
  }

  if (!deliveryStatus) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>No delivery data</Text>
        <Text style={styles.errorText}>Unable to load delivery information</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: courierLocation?.latitude || 9.0820,
          longitude: courierLocation?.longitude || 8.6753,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
      >
        {/* Courier Location Marker */}
        {courierLocation && (
          <Marker
            coordinate={{
              latitude: courierLocation.latitude,
              longitude: courierLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Animated.View style={[styles.courierMarker, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="bicycle" size={24} color="#fff" />
            </Animated.View>
          </Marker>
        )}

        {/* Pickup Location Marker */}
        {deliveryStatus.order.pickupLocation && (
          <Marker
            coordinate={{
              latitude: deliveryStatus.order.pickupLocation.lat,
              longitude: deliveryStatus.order.pickupLocation.lng,
            }}
          >
            <View style={styles.locationMarker}>
              <Ionicons name="location" size={28} color="#3498db" />
            </View>
          </Marker>
        )}

        {/* Dropoff Location Marker */}
        {deliveryStatus.order.dropoffLocation && (
          <Marker
            coordinate={{
              latitude: deliveryStatus.order.dropoffLocation.lat,
              longitude: deliveryStatus.order.dropoffLocation.lng,
            }}
          >
            <View style={styles.locationMarker}>
              <Ionicons name="flag" size={28} color="#e74c3c" />
            </View>
          </Marker>
        )}

        {/* Route Line */}
        {courierLocation && deliveryStatus.order.dropoffLocation && (
          <Polyline
            coordinates={[
              {
                latitude: courierLocation.latitude,
                longitude: courierLocation.longitude,
              },
              {
                latitude: deliveryStatus.order.dropoffLocation.lat,
                longitude: deliveryStatus.order.dropoffLocation.lng,
              },
            ]}
            strokeColor="#14b8a6"
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).navigate('HomeTabs')}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={[styles.statusIcon, { backgroundColor: `${statusInfo.color}15` }]}>
          <Ionicons name={statusInfo.icon as any} size={32} color={statusInfo.color} />
        </View>
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>{statusInfo.title}</Text>
          {eta && (
            <Text style={styles.statusSubtitle}>ETA: {eta} minutes</Text>
          )}
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        {/* Courier Info */}
        <View style={styles.courierInfo}>
          <View style={styles.courierAvatar}>
            {resolveMediaUrl(courier?.avatarUrl) ? (
              <Image source={{ uri: resolveMediaUrl(courier.avatarUrl)! }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={32} color="#7B8494" />
            )}
          </View>
          <View style={styles.courierDetails}>
            <Text style={styles.courierName}>
              {courier?.firstName} {courier?.lastName}
            </Text>
            <Text style={styles.courierRole}>Your Courier</Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCallCourier}>
            <Ionicons name="call" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Delivery Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, deliveryStatus.order.acceptedAt && styles.timelineDotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Courier Assigned</Text>
              {deliveryStatus.order.acceptedAt && (
                <Text style={styles.timelineTime}>
                  {new Date(deliveryStatus.order.acceptedAt).toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, deliveryStatus.order.pickedUpAt && styles.timelineDotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Package Picked Up</Text>
              {deliveryStatus.order.pickedUpAt && (
                <Text style={styles.timelineTime}>
                  {new Date(deliveryStatus.order.pickedUpAt).toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, deliveryStatus.order.deliveredAt && styles.timelineDotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Package Delivered</Text>
              {deliveryStatus.order.deliveredAt && (
                <Text style={styles.timelineTime}>
                  {new Date(deliveryStatus.order.deliveredAt).toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {deliveryStatus.order.status !== 'delivered' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelDelivery}>
            <Text style={styles.cancelButtonText}>Cancel Delivery</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_DARK,
  },
  loadingText: {
    fontSize: 16,
    color: TEXT_DIM,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_DARK,
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: TEXT_DIM,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DIM,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: BG_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusCard: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: '600',
  },
  courierMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: BG_DARK,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BG_DARK,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#353A4A',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  courierAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: CARD_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  courierRole: {
    fontSize: 13,
    color: TEXT_DIM,
  },
  callButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#353A4A',
    marginRight: 14,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: ACCENT,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  timelineTime: {
    fontSize: 13,
    color: TEXT_DIM,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#353A4A',
    marginLeft: 7,
    marginVertical: 4,
  },
  cancelButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
});

export default TrackDeliveryScreen;
