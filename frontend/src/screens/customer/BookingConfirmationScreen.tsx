import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { servicesAPI } from '../../services/servicesAPI';

const BookingConfirmationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    providerId,
    provider,
    category,
    date,
    timeSlot,
    notes,
    patientName,
    patientAge,
    symptoms,
  } = (route.params as any) || {};

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);

      const bookingData: any = {
        providerId,
        serviceType: provider.serviceType,
        date,
        timeSlotId: timeSlot.id,
        notes,
      };

      if (category === 'health') {
        bookingData.patientName = patientName;
        if (patientAge) bookingData.patientAge = patientAge;
        if (symptoms) bookingData.symptoms = symptoms;
      }

      const response = await servicesAPI.createBooking(bookingData);

      if (response.success) {
        Alert.alert(
          'Booking Confirmed!',
          'Your appointment has been successfully booked',
          [
            {
              text: 'View Appointments',
              onPress: () => (navigation as any).navigate('AppointmentTracking'),
            },
            {
              text: 'Done',
              onPress: () => (navigation as any).navigate('HomeTabs'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'Failed to create booking. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const dateObj = new Date(`2000-01-01T${time}`);
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const bookingDate = new Date(date);
  const totalAmount = timeSlot.price || provider.pricing.basePrice;

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
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar" size={48} color="#3498db" />
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="person" size={20} color="#666" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Provider</Text>
                <Text style={styles.summaryValue}>{provider.name}</Text>
                <Text style={styles.summarySubValue}>{provider.serviceType}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Date & Time</Text>
                <Text style={styles.summaryValue}>
                  {bookingDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.summarySubValue}>
                  {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>{provider.location.address}</Text>
                <Text style={styles.summarySubValue}>{provider.location.city}</Text>
              </View>
            </View>

            {category === 'health' && patientName && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Ionicons name="medical-outline" size={20} color="#666" />
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Patient</Text>
                    <Text style={styles.summaryValue}>{patientName}</Text>
                    {patientAge && (
                      <Text style={styles.summarySubValue}>{patientAge} years old</Text>
                    )}
                  </View>
                </View>
              </>
            )}

            {symptoms && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Ionicons name="document-text-outline" size={20} color="#666" />
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Reason for Visit</Text>
                    <Text style={styles.summaryValue}>{symptoms}</Text>
                  </View>
                </View>
              </>
            )}

            {notes && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Ionicons name="chatbubble-outline" size={20} color="#666" />
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Additional Notes</Text>
                    <Text style={styles.summaryValue}>{notes}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Consultation Fee</Text>
              <Text style={styles.priceValue}>₦{totalAmount.toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabelTotal}>Total Amount</Text>
              <Text style={styles.priceValueTotal}>₦{totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Ionicons name="information-circle" size={20} color="#3498db" />
            <Text style={styles.policyTitle}>Cancellation Policy</Text>
          </View>
          <Text style={styles.policyText}>
            • Free cancellation up to 24 hours before appointment{'\n'}
            • 50% refund for cancellations within 24 hours{'\n'}
            • No refund for no-shows
          </Text>
        </View>

        {/* What to Expect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Expect</Text>

          <View style={styles.expectationCard}>
            <View style={styles.expectationIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
            </View>
            <View style={styles.expectationContent}>
              <Text style={styles.expectationTitle}>Confirmation</Text>
              <Text style={styles.expectationText}>
                You'll receive a confirmation email and SMS
              </Text>
            </View>
          </View>

          <View style={styles.expectationCard}>
            <View style={styles.expectationIcon}>
              <Ionicons name="notifications" size={24} color="#f39c12" />
            </View>
            <View style={styles.expectationContent}>
              <Text style={styles.expectationTitle}>Reminder</Text>
              <Text style={styles.expectationText}>
                We'll send you a reminder 24 hours before
              </Text>
            </View>
          </View>

          <View style={styles.expectationCard}>
            <View style={styles.expectationIcon}>
              <Ionicons name="time" size={24} color="#3498db" />
            </View>
            <View style={styles.expectationContent}>
              <Text style={styles.expectationTitle}>Arrive Early</Text>
              <Text style={styles.expectationText}>
                Please arrive 10 minutes before your appointment
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirm & Pay ₦{totalAmount.toLocaleString()}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  scrollView: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  summaryContent: {
    marginLeft: 16,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  summarySubValue: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  priceCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 15,
    color: '#666',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  priceLabelTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  priceValueTotal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3498db',
  },
  policyCard: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976d2',
    marginLeft: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 22,
  },
  expectationCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  expectationIcon: {
    marginRight: 16,
  },
  expectationContent: {
    flex: 1,
  },
  expectationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  expectationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default BookingConfirmationScreen;
