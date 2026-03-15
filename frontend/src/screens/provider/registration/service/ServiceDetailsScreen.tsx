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

const SERVICE_AREAS = [
  'Victoria Island',
  'Lekki Phase 1',
  'Ikeja',
  'Surulere',
  'Yaba',
  'Ajah',
  'Ikoyi',
  'Maryland',
  'Gbagada',
  'Festac',
];

const ServiceDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, category } = (route.params as any) || {};

  const [businessName, setBusinessName] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);

  const toggleServiceArea = (area: string) => {
    setServiceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handlePickCertifications = () => {
    Alert.alert('Coming Soon', 'Document picker will be implemented');
  };

  const handlePickPortfolio = () => {
    Alert.alert('Coming Soon', 'Photo picker will be implemented');
  };

  const handleContinue = () => {
    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your business name');
      return;
    }
    if (!yearsOfExperience.trim()) {
      Alert.alert('Required', 'Please enter years of experience');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Required', 'Please enter phone number');
      return;
    }
    if (serviceAreas.length === 0) {
      Alert.alert('Required', 'Please select at least one service area');
      return;
    }

    (navigation as any).navigate('ServicePricing', {
      selectedTypes,
      category,
      details: {
        businessName,
        yearsOfExperience: parseInt(yearsOfExperience),
        phoneNumber,
        email,
        description,
        serviceAreas,
        certifications,
        portfolioPhotos,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.progressText}>Step 2 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Business Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Business Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Pro Plumbing Services"
            value={businessName}
            onChangeText={setBusinessName}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Years of Experience <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="+234 800 000 0000"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="business@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell customers about your services and expertise..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <Text style={styles.sectionTitle}>Service Areas</Text>
        <Text style={styles.hint}>Select areas where you provide services</Text>

        <View style={styles.chipsContainer}>
          {SERVICE_AREAS.map((area) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.chip,
                serviceAreas.includes(area) && styles.chipSelected,
              ]}
              onPress={() => toggleServiceArea(area)}
            >
              <Text
                style={[
                  styles.chipText,
                  serviceAreas.includes(area) && styles.chipTextSelected,
                ]}
              >
                {area}
              </Text>
              {serviceAreas.includes(area) && (
                <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Certifications (Optional)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handlePickCertifications}>
          <Ionicons name="document-text-outline" size={24} color="#f59e0b" />
          <Text style={styles.uploadButtonText}>
            {certifications.length > 0
              ? `${certifications.length} certificate(s) uploaded`
              : 'Upload Certifications'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Portfolio Photos (Optional)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handlePickPortfolio}>
          <Ionicons name="images-outline" size={24} color="#f59e0b" />
          <Text style={styles.uploadButtonText}>
            {portfolioPhotos.length > 0
              ? `${portfolioPhotos.length} photo(s) uploaded`
              : 'Upload Portfolio Photos'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.continueGradient}>
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
  progressFill: { height: '100%', backgroundColor: '#f59e0b' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#000', marginBottom: 16 },
  hint: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
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
  textArea: { height: 100, paddingTop: 14 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipSelected: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  chipTextSelected: { color: '#fff' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  uploadButtonText: { fontSize: 15, fontWeight: '600', color: '#f59e0b', marginLeft: 8 },
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

export default ServiceDetailsScreen;
