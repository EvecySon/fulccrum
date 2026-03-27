import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { servicesAPI, Booking } from '../../services/servicesAPI';
import { resolveMediaUrl } from '../../services/api';

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const AppointmentTrackingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'upcoming' ? 'confirmed' : activeTab;
      const response = await servicesAPI.getBookings({ status: status as any });

      if (response.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await servicesAPI.cancelBooking(bookingId);
              Alert.alert('Success', 'Appointment cancelled successfully');
              loadBookings();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const handleReschedule = (booking: Booking) => {
    (navigation as any).navigate('Booking', {
      providerId: booking.providerId,
      provider: booking.provider,
      category: booking.provider.category,
      isRescheduling: true,
      bookingId: booking.id,
    });
  };

  const handleViewDetails = (booking: Booking) => {
    (navigation as any).navigate('ServiceProvider', {
      providerId: booking.providerId,
      category: booking.provider.category,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(`2000-01-01T${timeStr}`);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#2ecc71';
      case 'pending':
        return '#f39c12';
      case 'completed':
        return '#3498db';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3498db" />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No appointments</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? "You don't have any upcoming appointments"
                : activeTab === 'completed'
                ? "You don't have any completed appointments"
                : "You don't have any cancelled appointments"}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => (navigation as any).navigate('ServicesHome')}
              >
                <Text style={styles.bookButtonText}>Book an Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
                <Ionicons
                  name={getStatusIcon(booking.status) as any}
                  size={16}
                  color={getStatusColor(booking.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Text>
              </View>

              {/* Provider Info */}
              <View style={styles.providerSection}>
                <View style={styles.providerImageContainer}>
                  {resolveMediaUrl(booking.provider.avatarUrl) ? (
                    <Image
                      source={{ uri: resolveMediaUrl(booking.provider.avatarUrl)! }}
                      style={styles.providerImage}
                    />
                  ) : (
                    <View style={styles.providerImagePlaceholder}>
                      <Ionicons name="person" size={24} color="#999" />
                    </View>
                  )}
                </View>

                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{booking.provider.name}</Text>
                  <Text style={styles.serviceType}>{booking.serviceType}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#f39c12" />
                    <Text style={styles.ratingText}>{booking.provider.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>

              {/* Appointment Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={18} color="#666" />
                  <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={18} color="#666" />
                  <Text style={styles.detailText}>
                    {formatTime(booking.timeSlot.startTime)} - {formatTime(booking.timeSlot.endTime)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={18} color="#666" />
                  <Text style={styles.detailText}>{booking.provider.location.city}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={18} color="#666" />
                  <Text style={styles.detailText}>₦{booking.totalAmount.toLocaleString()}</Text>
                </View>
              </View>

              {/* Actions */}
              {booking.status === 'confirmed' && (
                <View style={styles.actionsSection}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewDetails(booking)}
                  >
                    <Ionicons name="information-circle-outline" size={18} color="#3498db" />
                    <Text style={styles.actionButtonText}>Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleReschedule(booking)}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#f39c12" />
                    <Text style={styles.actionButtonText}>Reschedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelBooking(booking.id)}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#e74c3c" />
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.status === 'completed' && (
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={() => {
                    // Navigate to rating screen or show rating modal
                    Alert.alert('Rate Service', 'Rating feature coming soon!');
                  }}
                >
                  <Ionicons name="star-outline" size={18} color="#f39c12" />
                  <Text style={styles.rateButtonText}>Rate this service</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#3498db',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  bookButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  bookingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  providerSection: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  providerImageContainer: {
    marginRight: 12,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  providerImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3498db',
  },
  cancelButton: {
    backgroundColor: '#fff5f5',
  },
  cancelButtonText: {
    color: '#e74c3c',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fff9e6',
    gap: 8,
    marginTop: 16,
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f39c12',
  },
  bottomPadding: {
    height: 40,
  },
});

export default AppointmentTrackingScreen;
