import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  contactName: string;
  contactPhone: string;
}

const LocationPickerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { packageSize } = (route.params as any) || {};
  
  const [pickupLocation, setPickupLocation] = useState<LocationData>({
    lat: 6.5244,
    lng: 3.3792,
    address: '',
    contactName: '',
    contactPhone: '',
  });

  const [dropoffLocation, setDropoffLocation] = useState<LocationData>({
    lat: 6.4281,
    lng: 3.4219,
    address: '',
    contactName: '',
    contactPhone: '',
  });

  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff'>('pickup');

  const handleContinue = () => {
    if (!pickupLocation.address || !dropoffLocation.address) {
      Alert.alert('Error', 'Please enter both pickup and dropoff addresses');
      return;
    }

    if (!pickupLocation.contactName || !pickupLocation.contactPhone) {
      Alert.alert('Error', 'Please enter pickup contact details');
      return;
    }

    if (!dropoffLocation.contactName || !dropoffLocation.contactPhone) {
      Alert.alert('Error', 'Please enter dropoff contact details');
      return;
    }

    navigation.navigate('PriceEstimate' as never, {
      packageSize,
      pickupLocation: pickupLocation,
      dropoffLocation: dropoffLocation,
      deliverySpeed: 'same_day',
      packageDescription: 'Package',
    } as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Locations</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.webNotice}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.webNoticeText}>
            Map view is only available on mobile. Please enter addresses manually.
          </Text>
        </View>

        {/* Pickup Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pickup address"
              value={pickupLocation.address}
              onChangeText={(text) => setPickupLocation({ ...pickupLocation, address: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              value={pickupLocation.contactName}
              onChangeText={(text) => setPickupLocation({ ...pickupLocation, contactName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={pickupLocation.contactPhone}
              onChangeText={(text) => setPickupLocation({ ...pickupLocation, contactPhone: text })}
            />
          </View>
        </View>

        {/* Dropoff Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dropoff Location</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter dropoff address"
              value={dropoffLocation.address}
              onChangeText={(text) => setDropoffLocation({ ...dropoffLocation, address: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              value={dropoffLocation.contactName}
              onChangeText={(text) => setDropoffLocation({ ...dropoffLocation, contactName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={dropoffLocation.contactPhone}
              onChangeText={(text) => setDropoffLocation({ ...dropoffLocation, contactPhone: text })}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  webNoticeText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1e40af',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default LocationPickerScreen;
