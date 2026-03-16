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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';

const STEPS = ['Route', 'Details', 'Confirm'];

const DELIVERY_SPEEDS = [
  { id: 'express', title: 'Express', subtitle: '30-60 min', icon: 'flash', multiplier: 1.3 },
  { id: 'same_day', title: 'Same Day', subtitle: '2-4 hours', icon: 'time', multiplier: 1.0 },
  { id: 'scheduled', title: 'Scheduled', subtitle: 'Pick a time', icon: 'calendar', multiplier: 1.0 },
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Details</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                i < 2 && styles.stepCircleDone,
                i === 1 && styles.stepCircleActive,
              ]}>
                {i < 1 ? (
                  <Ionicons name="checkmark" size={14} color={BG_DARK} />
                ) : (
                  <Text style={[styles.stepNum, i <= 1 && styles.stepNumDone]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i <= 1 && styles.stepLabelActive]}>{step}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < 1 && styles.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Delivery Speed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Speed</Text>
          <View style={styles.speedRow}>
            {DELIVERY_SPEEDS.map((speed) => (
              <TouchableOpacity
                key={speed.id}
                style={[
                  styles.speedCard,
                  deliverySpeed === speed.id && styles.speedCardSelected,
                ]}
                onPress={() => setDeliverySpeed(speed.id as any)}
              >
                <View style={[
                  styles.speedIcon,
                  deliverySpeed === speed.id && styles.speedIconSelected,
                ]}>
                  <Ionicons
                    name={speed.icon as any}
                    size={22}
                    color={deliverySpeed === speed.id ? BG_DARK : ACCENT}
                  />
                </View>
                <Text style={[styles.speedTitle, deliverySpeed === speed.id && styles.speedTitleSelected]}>
                  {speed.title}
                </Text>
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
          <Text style={styles.sectionTitle}>Package Photo</Text>
          <Text style={styles.sectionSub}>Optional - helps courier identify your package</Text>
          {packagePhoto ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: packagePhoto }} style={styles.photoImage} />
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setPackagePhoto(null)}>
                <Ionicons name="close-circle" size={28} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
                <Ionicons name="camera-outline" size={24} color={ACCENT} />
                <Text style={styles.photoBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={handlePickImage}>
                <Ionicons name="images-outline" size={24} color={ACCENT} />
                <Text style={styles.photoBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you sending? *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., Documents, laptop, clothes..."
            value={packageDescription}
            onChangeText={setPackageDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor={TEXT_DIM}
          />
        </View>

        {/* Weight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter weight"
              value={packageWeight}
              onChangeText={setPackageWeight}
              keyboardType="decimal-pad"
              placeholderTextColor={TEXT_DIM}
            />
            <Text style={styles.inputSuffix}>kg</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., Handle with care, fragile..."
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            placeholderTextColor={TEXT_DIM}
          />
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={18} color={ACCENT} />
          <Text style={styles.infoText}>
            All packages insured up to ₦50,000. Contact support for higher value items.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !packageDescription.trim() && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!packageDescription.trim()}
        >
          <Text style={[styles.continueBtnText, !packageDescription.trim() && { color: TEXT_DIM }]}>
            Get Price Estimate
          </Text>
          <Ionicons name="arrow-forward" size={20} color={!packageDescription.trim() ? TEXT_DIM : BG_DARK} />
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
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
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
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#353A4A',
    marginBottom: 6,
  },
  stepCircleDone: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  stepCircleActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DIM,
  },
  stepNumDone: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_DIM,
  },
  stepLabelActive: {
    color: ACCENT,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#353A4A',
    marginBottom: 20,
    marginHorizontal: 8,
  },
  stepLineDone: {
    backgroundColor: ACCENT,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13,
    color: TEXT_DIM,
    marginBottom: 12,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  speedCard: {
    flex: 1,
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  speedCardSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(20,184,166,0.06)',
  },
  speedIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(20,184,166,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  speedIconSelected: {
    backgroundColor: ACCENT,
  },
  speedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  speedTitleSelected: {
    color: ACCENT,
  },
  speedSubtitle: {
    fontSize: 11,
    color: TEXT_DIM,
    textAlign: 'center',
  },
  speedBadge: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(20,184,166,0.12)',
    borderRadius: 6,
  },
  speedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT,
  },
  photoPreview: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: BG_DARK,
    borderRadius: 14,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#353A4A',
    borderStyle: 'dashed',
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
    marginTop: 6,
  },
  textArea: {
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    minHeight: 90,
    textAlignVertical: 'top',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  inputSuffix: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DIM,
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20,184,166,0.06)',
    padding: 14,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.15)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    backgroundColor: BG_DARK,
  },
  continueBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnDisabled: {
    backgroundColor: CARD_DARK,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PackageDetailsScreen;
