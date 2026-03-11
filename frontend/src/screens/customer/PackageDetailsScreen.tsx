import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const DELIVERY_SPEEDS = [
  {
    id: 'express',
    title: 'Express',
    subtitle: '30-60 minutes',
    icon: 'flash',
    color: '#f39c12',
    multiplier: 1.3,
  },
  {
    id: 'same_day',
    title: 'Same Day',
    subtitle: '2-4 hours',
    icon: 'time',
    color: '#3498db',
    multiplier: 1.0,
  },
  {
    id: 'scheduled',
    title: 'Scheduled',
    subtitle: 'Pick a time',
    icon: 'calendar',
    color: '#9b59b6',
    multiplier: 1.0,
  },
];

const PackageDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { packageSize, pickupLocation, dropoffLocation } = (route.params as any) || {};

  const [deliverySpeed, setDeliverySpeed] = useState<'express' | 'same_day' | 'scheduled'>('same_day');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageWeight, setPackageWeight] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [packagePhoto, setPackagePhoto] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permission to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPackagePhoto(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need gallery permission to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPackagePhoto(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (!packageDescription.trim()) {
      Alert.alert('Missing Information', 'Please describe what you\'re sending');
      return;
    }

    (navigation as any).navigate('PriceEstimate', {
      packageSize,
      pickupLocation,
      dropoffLocation,
      deliverySpeed,
      packageDescription: packageDescription.trim(),
      packageWeight: packageWeight ? parseFloat(packageWeight) : undefined,
      specialInstructions: specialInstructions.trim() || undefined,
      packagePhoto,
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
        <Text style={styles.headerTitle}>Package Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Delivery Speed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Speed</Text>
          <View style={styles.speedContainer}>
            {DELIVERY_SPEEDS.map((speed) => (
              <TouchableOpacity
                key={speed.id}
                style={[
                  styles.speedCard,
                  deliverySpeed === speed.id && styles.speedCardSelected,
                ]}
                onPress={() => setDeliverySpeed(speed.id as any)}
              >
                <View style={[styles.speedIcon, { backgroundColor: `${speed.color}15` }]}>
                  <Ionicons name={speed.icon as any} size={24} color={speed.color} />
                </View>
                <Text style={styles.speedTitle}>{speed.title}</Text>
                <Text style={styles.speedSubtitle}>{speed.subtitle}</Text>
                {speed.multiplier > 1 && (
                  <View style={styles.speedBadge}>
                    <Text style={styles.speedBadgeText}>+{((speed.multiplier - 1) * 100).toFixed(0)}%</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Package Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Photo (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Take a photo of your package for reference
          </Text>
          
          {packagePhoto ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: packagePhoto }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPackagePhoto(null)}
              >
                <Ionicons name="close-circle" size={28} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={24} color="#ff6b35" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                <Ionicons name="images" size={24} color="#ff6b35" />
                <Text style={styles.photoButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Package Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you sending? *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., Documents, laptop, clothes, food..."
            value={packageDescription}
            onChangeText={setPackageDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
        </View>

        {/* Package Weight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Weight (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter weight"
              value={packageWeight}
              onChangeText={setPackageWeight}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputSuffix}>kg</Text>
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., Handle with care, fragile items, call on arrival..."
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3498db" />
          <Text style={styles.infoText}>
            All packages are insured up to ₦50,000. For higher value items, please contact support.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !packageDescription.trim() && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!packageDescription.trim()}
        >
          <Text style={styles.continueButtonText}>Get Price Estimate</Text>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  speedContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  speedCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  speedCardSelected: {
    backgroundColor: '#fff5f2',
    borderColor: '#ff6b35',
  },
  speedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  speedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  speedSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  speedBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff3e0',
    borderRadius: 6,
  },
  speedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f39c12',
  },
  photoPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff6b35',
    marginTop: 8,
  },
  textArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  inputSuffix: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
    marginLeft: 12,
    lineHeight: 18,
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
  continueButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
});

export default PackageDetailsScreen;
