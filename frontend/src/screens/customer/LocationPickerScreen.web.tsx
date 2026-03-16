import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Locations</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleDone]}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelDone]}>Route</Text>
        </View>
        <View style={[styles.stepLine, styles.stepLineActive]} />
        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Details</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Confirm</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Web Notice */}
        <View style={styles.webNotice}>
          <Ionicons name="information-circle" size={20} color={ACCENT} />
          <Text style={styles.webNoticeText}>
            Map view is available on mobile. Enter addresses manually below.
          </Text>
        </View>

        {/* Pickup Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot}>
              <Ionicons name="location" size={16} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pickup address"
              placeholderTextColor={TEXT_DIM}
              value={pickupLocation.address}
              onChangeText={(text) => setPickupLocation({ ...pickupLocation, address: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              placeholderTextColor={TEXT_DIM}
              value={pickupLocation.contactName}
              onChangeText={(text) => setPickupLocation({ ...pickupLocation, contactName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={TEXT_DIM}
              keyboardType="phone-pad"
              value={pickupLocation.contactPhone}
              onChangeText={(text) => setPickupLocation({ ...pickupLocation, contactPhone: text })}
            />
          </View>
        </View>

        {/* Dropoff Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="flag" size={14} color="#fff" />
            </View>
            <Text style={styles.sectionTitle}>Dropoff Location</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter dropoff address"
              placeholderTextColor={TEXT_DIM}
              value={dropoffLocation.address}
              onChangeText={(text) => setDropoffLocation({ ...dropoffLocation, address: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              placeholderTextColor={TEXT_DIM}
              value={dropoffLocation.contactName}
              onChangeText={(text) => setDropoffLocation({ ...dropoffLocation, contactName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={TEXT_DIM}
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
    backgroundColor: BG_DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 16,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#353A4A',
    borderWidth: 1.5,
    borderColor: '#353A4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleDone: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_DIM,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_DIM,
  },
  stepLabelDone: {
    color: ACCENT,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#353A4A',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: ACCENT,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.06)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.12)',
    gap: 10,
  },
  webNoticeText: {
    flex: 1,
    fontSize: 13,
    color: ACCENT,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionDot: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: CARD_DARK,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
  },
  continueButton: {
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LocationPickerScreen;
