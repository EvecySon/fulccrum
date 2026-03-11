import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { servicesAPI, TimeSlot } from '../../services/servicesAPI';

const DAYS_TO_SHOW = 14;

const BookingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { providerId, provider, category } = (route.params as any) || {};

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await servicesAPI.getAvailability(providerId, dateStr);
      
      if (response.success) {
        setAvailableSlots(response.data.slots);
      }
    } catch (error) {
      console.error('Load slots error:', error);
      Alert.alert('Error', 'Failed to load available time slots');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please select a time slot');
      return;
    }

    if (category === 'health' && !patientName.trim()) {
      Alert.alert('Patient Name Required', 'Please enter patient name');
      return;
    }

    (navigation as any).navigate('BookingConfirmation', {
      providerId,
      provider,
      category,
      date: selectedDate.toISOString(),
      timeSlot: selectedSlot,
      notes: notes.trim(),
      patientName: patientName.trim(),
      patientAge: patientAge ? parseInt(patientAge) : undefined,
      symptoms: symptoms.trim(),
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatTime = (time: string) => {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
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
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Provider Info */}
        <View style={styles.providerCard}>
          <Text style={styles.providerName}>{provider?.name}</Text>
          <Text style={styles.providerType}>{provider?.serviceType}</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesContainer}>
              {dates.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                      {formatDate(date)}
                    </Text>
                    <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                      {date.getDate()}
                    </Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateMonthSelected]}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          
          {isLoadingSlots ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={styles.loadingText}>Loading slots...</Text>
            </View>
          ) : availableSlots.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No slots available for this date</Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      !slot.available && styles.slotCardDisabled,
                      isSelected && styles.slotCardSelected,
                    ]}
                    onPress={() => slot.available && setSelectedSlot(slot)}
                    disabled={!slot.available}
                  >
                    <Text style={[
                      styles.slotTime,
                      !slot.available && styles.slotTimeDisabled,
                      isSelected && styles.slotTimeSelected,
                    ]}>
                      {formatTime(slot.startTime)}
                    </Text>
                    {slot.price && (
                      <Text style={[styles.slotPrice, isSelected && styles.slotPriceSelected]}>
                        ₦{slot.price.toLocaleString()}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Health-specific fields */}
        {category === 'health' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Patient Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Patient Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter patient name"
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter age"
                  value={patientAge}
                  onChangeText={setPatientAge}
                  keyboardType="number-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Symptoms/Reason for Visit (Optional)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe symptoms or reason for appointment"
                  value={symptoms}
                  onChangeText={setSymptoms}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </>
        )}

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any special requests or information..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#3498db" />
          <Text style={styles.infoBannerText}>
            You can cancel or reschedule up to 24 hours before your appointment
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Continue Button */}
      {selectedSlot && (
        <View style={styles.footer}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>Selected Time</Text>
            <Text style={styles.summaryValue}>
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric' 
              })} • {formatTime(selectedSlot.startTime)}
            </Text>
          </View>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
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
  providerCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  providerType: {
    fontSize: 14,
    color: '#666',
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
  datesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  dateCard: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dateDaySelected: {
    color: '#fff',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 2,
  },
  dateNumberSelected: {
    color: '#fff',
  },
  dateMonth: {
    fontSize: 11,
    color: '#999',
  },
  dateMonthSelected: {
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  slotCard: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  slotCardDisabled: {
    opacity: 0.4,
  },
  slotCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  slotTimeDisabled: {
    color: '#999',
  },
  slotTimeSelected: {
    color: '#3498db',
  },
  slotPrice: {
    fontSize: 11,
    color: '#666',
  },
  slotPriceSelected: {
    color: '#3498db',
  },
  inputGroup: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
  },
  textArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000',
    minHeight: 100,
    textAlignVertical: 'top',
    marginHorizontal: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
    marginLeft: 12,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 120,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default BookingScreen;
