import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

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
  
  const mapRef = useRef<MapView>(null);
  
  const [currentStep, setCurrentStep] = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(null);
  
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 9.0820,
    longitude: 8.6753,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need location permission to show your current location'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setSelectedLocation(newLocation);
      
      mapRef.current?.animateToRegion({
        ...newLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirmLocation = async () => {
    if (!contactName.trim()) {
      Alert.alert('Missing Information', 'Please enter contact name');
      return;
    }
    
    if (!contactPhone.trim()) {
      Alert.alert('Missing Information', 'Please enter contact phone number');
      return;
    }

    const address = searchQuery || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`;
    
    const locationData: LocationData = {
      lat: selectedLocation.latitude,
      lng: selectedLocation.longitude,
      address,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
    };

    if (currentStep === 'pickup') {
      setPickupLocation(locationData);
      setCurrentStep('dropoff');
      setSearchQuery('');
      setContactName('');
      setContactPhone('');
    } else {
      setDropoffLocation(locationData);
      
      (navigation as any).navigate('PackageDetails', {
        packageSize,
        pickupLocation,
        dropoffLocation: locationData,
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 'dropoff') {
      setCurrentStep('pickup');
      setDropoffLocation(null);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {currentStep === 'pickup' ? 'Pickup Location' : 'Dropoff Location'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentStep === 'pickup' 
              ? 'Where should we pick up the package?' 
              : 'Where should we deliver the package?'}
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, styles.progressStepActive]}>
            <Text style={styles.progressStepText}>1</Text>
          </View>
          <View style={[styles.progressLine, currentStep === 'dropoff' && styles.progressLineActive]} />
          <View style={[styles.progressStep, currentStep === 'dropoff' && styles.progressStepActive]}>
            <Text style={[styles.progressStepText, currentStep === 'dropoff' && styles.progressStepTextActive]}>2</Text>
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Pickup</Text>
          <Text style={styles.progressLabel}>Dropoff</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={selectedLocation}
            draggable
            onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
          >
            <View style={styles.markerContainer}>
              <Ionicons 
                name={currentStep === 'pickup' ? 'location' : 'flag'} 
                size={32} 
                color={currentStep === 'pickup' ? '#3498db' : '#e74c3c'} 
              />
            </View>
          </Marker>
        </MapView>

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        
        <ScrollView 
          style={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Search Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for an address or landmark"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.inputHint}>
              Or drag the pin on the map to select location
            </Text>
          </View>

          {/* Contact Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {currentStep === 'pickup' ? 'Sender Name' : 'Receiver Name'} *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={contactName}
              onChangeText={setContactName}
              placeholderTextColor="#999"
            />
          </View>

          {/* Contact Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {currentStep === 'pickup' ? 'Sender Phone' : 'Receiver Phone'} *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Selected Location Preview */}
          {pickupLocation && currentStep === 'dropoff' && (
            <View style={styles.locationPreview}>
              <View style={styles.locationPreviewHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                <Text style={styles.locationPreviewTitle}>Pickup Location Set</Text>
              </View>
              <Text style={styles.locationPreviewAddress}>{pickupLocation.address}</Text>
              <Text style={styles.locationPreviewContact}>
                {pickupLocation.contactName} • {pickupLocation.contactPhone}
              </Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!contactName.trim() || !contactPhone.trim()) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmLocation}
            disabled={!contactName.trim() || !contactPhone.trim()}
          >
            <Text style={styles.confirmButtonText}>
              {currentStep === 'pickup' ? 'Continue to Dropoff' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: '#ff6b35',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
  },
  progressStepTextActive: {
    color: '#fff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#ff6b35',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: '50%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#000',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  locationPreview: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  locationPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
    marginLeft: 8,
  },
  locationPreviewAddress: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  locationPreviewContact: {
    fontSize: 12,
    color: '#666',
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
});

export default LocationPickerScreen;
