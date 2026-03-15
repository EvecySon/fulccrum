import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { packageDeliveryAPI } from '../../services/packageDeliveryAPI';
import { mockGetDeliveryStatus } from '../../services/mockPackageDelivery';

const TrackDeliveryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, deliveryId, courier } = (route.params as any) || {};
  const actualOrderId = orderId || deliveryId;

  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<any>(null);
  const [error, setError] = useState('');

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
        // Transform mock data to match web UI expectations
        setDelivery({
          status: response.data.order.status,
          deliveryNumber: response.data.order.id,
          courier: response.data.order.courier ? {
            name: `${response.data.order.courier.firstName} ${response.data.order.courier.lastName}`,
            phone: response.data.order.courier.phoneNumber,
            rating: response.data.order.courier.rating,
          } : null,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'picked_up': return '#8b5cf6';
      case 'in_transit': return '#06b6d4';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'accepted': return 'checkmark-circle-outline';
      case 'picked_up': return 'cube-outline';
      case 'in_transit': return 'car-outline';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Delivery</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
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
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Delivery</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Delivery not found'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Delivery</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.webNotice}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.webNoticeText}>
            Live map tracking is only available on mobile. Status updates are shown below.
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
            <Ionicons name={getStatusIcon(delivery.status) as any} size={24} color="#fff" />
            <Text style={styles.statusText}>{delivery.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
          
          <Text style={styles.deliveryNumber}>#{delivery.deliveryNumber}</Text>
        </View>

        {/* Courier Info */}
        {delivery.courier && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Courier Information</Text>
            <View style={styles.courierInfo}>
              <View style={styles.courierAvatar}>
                <Ionicons name="person" size={32} color="#1e3a8a" />
              </View>
              <View style={styles.courierDetails}>
                <Text style={styles.courierName}>{delivery.courier.name}</Text>
                <Text style={styles.courierPhone}>{delivery.courier.phone}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.rating}>{delivery.courier.rating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Pickup Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pickup Location</Text>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color="#10b981" />
            <Text style={styles.locationText}>{delivery.pickupAddress}</Text>
          </View>
          <Text style={styles.contactText}>Contact: {delivery.pickupContact}</Text>
        </View>

        {/* Dropoff Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dropoff Location</Text>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color="#ef4444" />
            <Text style={styles.locationText}>{delivery.dropoffAddress}</Text>
          </View>
          <Text style={styles.contactText}>Contact: {delivery.dropoffContact}</Text>
        </View>

        {/* Package Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Package Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>{delivery.packageSize}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Speed:</Text>
            <Text style={styles.detailValue}>{delivery.deliverySpeed}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>₦{delivery.price.toLocaleString()}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Timeline</Text>
          {delivery.timeline?.map((event: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{event.title}</Text>
                <Text style={styles.timelineTime}>{new Date(event.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    fontWeight: '600',
    color: '#1e3a8a',
  },
  content: {
    flex: 1,
    padding: 16,
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
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  webNoticeText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1e40af',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  deliveryNumber: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  courierPhone: {
    fontSize: 14,
    color: '#6b7280',
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
    color: '#1f2937',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1f2937',
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 28,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default TrackDeliveryScreen;
