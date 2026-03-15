import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mockGetDeliveryStatus } from '../../services/mockPackageDelivery';

const TrackDeliveryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, deliveryId, courier } = (route.params as any) || {};
  const actualOrderId = orderId || deliveryId;

  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<any>(null);
  const [error, setError] = useState('');
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    console.log('TrackDeliveryScreen.web mounted with:', { orderId, deliveryId, courier });
    
    if (!actualOrderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    loadDeliveryStatus();
    const interval = setInterval(loadDeliveryStatus, 10000);
    return () => clearInterval(interval);
  }, [actualOrderId]);

  const loadDeliveryStatus = async () => {
    try {
      console.log('Loading delivery status for:', actualOrderId);
      const response = await mockGetDeliveryStatus(actualOrderId);
      
      if (response.success) {
        console.log('Delivery status loaded:', response.data);
        setDelivery({
          status: response.data.order.status,
          deliveryNumber: response.data.order.id,
          courier: response.data.order.courier ? {
            name: `${response.data.order.courier.firstName} ${response.data.order.courier.lastName}`,
            phone: response.data.order.courier.phoneNumber,
            rating: response.data.order.courier.rating,
            totalDeliveries: response.data.order.courier.totalDeliveries,
            avatarUrl: response.data.order.courier.avatarUrl,
          } : null,
          courierLocation: response.data.courierLocation,
          pickupAddress: response.data.order.pickupLocation.address,
          pickupContact: 'Pickup Contact',
          dropoffAddress: response.data.order.dropoffLocation.address,
          dropoffContact: 'Dropoff Contact',
          packageSize: response.data.order.packageSize,
          deliverySpeed: response.data.order.deliverySpeed,
          price: response.data.order.totalAmount,
          timeline: [
            response.data.order.createdAt && {
              title: 'Order Created',
              timestamp: response.data.order.createdAt,
            },
            response.data.order.acceptedAt && {
              title: 'Courier Assigned',
              timestamp: response.data.order.acceptedAt,
            },
            response.data.order.pickedUpAt && {
              title: 'Package Picked Up',
              timestamp: response.data.order.pickedUpAt,
            },
            response.data.order.deliveredAt && {
              title: 'Package Delivered',
              timestamp: response.data.order.deliveredAt,
            },
          ].filter(Boolean),
        });
        setEta(response.data.eta);
      } else {
        setError('Failed to load delivery status');
      }
    } catch (err: any) {
      console.error('Load delivery status error:', err);
      setError(err.message || 'Failed to load delivery status');
    } finally {
      setLoading(false);
    }
  };

  const handleCallCourier = () => {
    if (delivery?.courier?.phone) {
      Linking.openURL(`tel:${delivery.courier.phone}`);
    }
  };

  const handleMessageCourier = () => {
    if (delivery?.courier?.phone) {
      Linking.openURL(`sms:${delivery.courier.phone}`);
    }
  };

  const handleShareTracking = () => {
    Alert.alert('Share Tracking', `Share this link: https://fulccrum.com/track/${actualOrderId}`);
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
          onPress: () => {
            Alert.alert('Success', 'Delivery cancelled successfully');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'SEARCHING': return '#3b82f6';
      case 'ACCEPTED': return '#14b8a6';
      case 'PICKED_UP': return '#8b5cf6';
      case 'IN_TRANSIT': return '#06b6d4';
      case 'DELIVERED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'time-outline';
      case 'SEARCHING': return 'search-outline';
      case 'ACCEPTED': return 'checkmark-circle-outline';
      case 'PICKED_UP': return 'cube-outline';
      case 'IN_TRANSIT': return 'bicycle-outline';
      case 'DELIVERED': return 'checkmark-done-circle';
      case 'CANCELLED': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Delivery</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14b8a6" />
          <Text style={styles.loadingText}>Loading delivery status...</Text>
        </View>
      </View>
    );
  }

  if (error || !delivery) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Delivery</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Unable to Load</Text>
          <Text style={styles.errorText}>{error || 'Delivery not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDeliveryStatus}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Delivery</Text>
        <TouchableOpacity onPress={handleShareTracking} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#14b8a6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <LinearGradient
          colors={[getStatusColor(delivery.status), getStatusColor(delivery.status) + 'CC']}
          style={styles.statusBanner}
        >
          <Ionicons name={getStatusIcon(delivery.status) as any} size={40} color="#fff" />
          <View style={styles.statusInfo}>
            <Text style={styles.statusText}>{delivery.status.replace('_', ' ')}</Text>
            <Text style={styles.orderNumber}>Order #{delivery.deliveryNumber}</Text>
          </View>
          {eta && (
            <View style={styles.etaBadge}>
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={styles.etaText}>{eta} min</Text>
            </View>
          )}
        </LinearGradient>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="#14b8a6" />
          <Text style={styles.mapText}>Live map tracking available on mobile app</Text>
          {delivery.courierLocation && (
            <Text style={styles.mapSubtext}>
              Courier at: {delivery.courierLocation.latitude.toFixed(4)}, {delivery.courierLocation.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Courier Info */}
        {delivery.courier && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Courier</Text>
            <View style={styles.courierInfo}>
              <View style={styles.courierAvatar}>
                <Ionicons name="person" size={32} color="#14b8a6" />
              </View>
              <View style={styles.courierDetails}>
                <Text style={styles.courierName}>{delivery.courier.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.rating}>{delivery.courier.rating.toFixed(1)}</Text>
                  <Text style={styles.deliveries}>• {delivery.courier.totalDeliveries} deliveries</Text>
                </View>
              </View>
            </View>
            <View style={styles.courierActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCallCourier}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={handleMessageCourier}>
                <Ionicons name="chatbubble" size={20} color="#14b8a6" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Route Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Route</Text>
          
          <View style={styles.routeItem}>
            <View style={styles.routeIcon}>
              <Ionicons name="location" size={20} color="#10b981" />
            </View>
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddress}>{delivery.pickupAddress}</Text>
              <Text style={styles.routeContact}>{delivery.pickupContact}</Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeItem}>
            <View style={styles.routeIcon}>
              <Ionicons name="location" size={20} color="#ef4444" />
            </View>
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>Dropoff</Text>
              <Text style={styles.routeAddress}>{delivery.dropoffAddress}</Text>
              <Text style={styles.routeContact}>{delivery.dropoffContact}</Text>
            </View>
          </View>
        </View>

        {/* Package Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Package Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="cube-outline" size={24} color="#14b8a6" />
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>{delivery.packageSize}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="flash-outline" size={24} color="#14b8a6" />
              <Text style={styles.detailLabel}>Speed</Text>
              <Text style={styles.detailValue}>{delivery.deliverySpeed}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={24} color="#14b8a6" />
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>₦{delivery.price.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Timeline</Text>
          {delivery.timeline?.map((event: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index < delivery.timeline.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{event.title}</Text>
                <Text style={styles.timelineTime}>{new Date(event.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Cancel Button */}
        {delivery.status !== 'DELIVERED' && delivery.status !== 'CANCELLED' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelDelivery}>
            <Text style={styles.cancelButtonText}>Cancel Delivery</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },
  orderNumber: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
  },
  mapPlaceholder: {
    backgroundColor: '#f0fdfa',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#14b8a6',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6',
    marginTop: 12,
    textAlign: 'center',
  },
  mapSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  courierAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  deliveries: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  courierActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14b8a6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#14b8a6',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  actionButtonTextSecondary: {
    color: '#14b8a6',
  },
  routeItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  routeContact: {
    fontSize: 14,
    color: '#6b7280',
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#14b8a6',
    marginTop: 4,
    marginRight: 12,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: -8,
    width: 2,
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 13,
    color: '#6b7280',
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  bottomPadding: {
    height: 40,
  },
});

export default TrackDeliveryScreen;
