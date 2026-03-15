import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const OPERATING_HOURS = [
  { day: 'Monday', key: 'mon' },
  { day: 'Tuesday', key: 'tue' },
  { day: 'Wednesday', key: 'wed' },
  { day: 'Thursday', key: 'thu' },
  { day: 'Friday', key: 'fri' },
  { day: 'Saturday', key: 'sat' },
  { day: 'Sunday', key: 'sun' },
];

const RestaurantLocationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, basicInfo } = (route.params as any) || {};

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos');
  const [deliveryRadius, setDeliveryRadius] = useState('5');
  const [operatingHours, setOperatingHours] = useState({
    mon: { open: '09:00', close: '22:00', closed: false },
    tue: { open: '09:00', close: '22:00', closed: false },
    wed: { open: '09:00', close: '22:00', closed: false },
    thu: { open: '09:00', close: '22:00', closed: false },
    fri: { open: '09:00', close: '22:00', closed: false },
    sat: { open: '09:00', close: '22:00', closed: false },
    sun: { open: '09:00', close: '22:00', closed: false },
  });

  const handleContinue = () => {
    if (!address.trim()) {
      Alert.alert('Required', 'Please enter your restaurant address');
      return;
    }

    (navigation as any).navigate('RestaurantDocuments', {
      selectedTypes,
      basicInfo,
      locationInfo: {
        address,
        city,
        state,
        deliveryRadius: parseInt(deliveryRadius),
        operatingHours,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location & Hours</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>Step 2 of 4</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Location Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Restaurant Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main Street, Victoria Island"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Radius (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            value={deliveryRadius}
            onChangeText={setDeliveryRadius}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <Text style={styles.sectionTitle}>Operating Hours</Text>
        <Text style={styles.hint}>Set your restaurant's opening hours</Text>

        {OPERATING_HOURS.map((day) => (
          <View key={day.key} style={styles.dayRow}>
            <Text style={styles.dayLabel}>{day.day}</Text>
            <View style={styles.timeInputs}>
              <TextInput
                style={styles.timeInput}
                value={operatingHours[day.key as keyof typeof operatingHours].open}
                placeholder="09:00"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.timeSeparator}>-</Text>
              <TextInput
                style={styles.timeInput}
                value={operatingHours[day.key as keyof typeof operatingHours].close}
                placeholder="22:00"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.continueGradient}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
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
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  progressContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  progressBar: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ef4444' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#000', marginBottom: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
  hint: { fontSize: 12, color: '#6b7280', marginBottom: 16 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  row: { flexDirection: 'row', gap: 12 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dayLabel: { fontSize: 15, fontWeight: '600', color: '#000', width: 100 },
  timeInputs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000',
    width: 70,
    textAlign: 'center',
  },
  timeSeparator: { fontSize: 16, color: '#6b7280' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: { borderRadius: 12, overflow: 'hidden' },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: { fontSize: 16, fontWeight: '700', color: '#fff', marginRight: 8 },
});

export default RestaurantLocationScreen;
