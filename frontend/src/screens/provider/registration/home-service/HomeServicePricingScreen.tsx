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

const HomeServicePricingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, serviceType } = (route.params as any) || {};

  const [pricingModel, setPricingModel] = useState<'HOURLY' | 'FIXED' | 'BOTH'>('HOURLY');
  const [hourlyRate, setHourlyRate] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [description, setDescription] = useState('');

  const handleContinue = () => {
    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your business name');
      return;
    }
    if (pricingModel === 'HOURLY' && !hourlyRate.trim()) {
      Alert.alert('Required', 'Please enter your hourly rate');
      return;
    }

    (navigation as any).navigate('HomeServiceAreas', {
      selectedTypes,
      serviceType,
      pricing: {
        businessName,
        pricingModel,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        teamSize: teamSize ? parseInt(teamSize) : null,
        hasInsurance,
        description,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pricing & Details</Text>
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
            placeholder="e.g., Pro Clean Services"
            value={businessName}
            onChangeText={setBusinessName}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Team Size (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            value={teamSize}
            onChangeText={setTeamSize}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell customers about your services..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={styles.insuranceCard}
          onPress={() => setHasInsurance(!hasInsurance)}
        >
          <View style={styles.insuranceLeft}>
            <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
            <View style={styles.insuranceInfo}>
              <Text style={styles.insuranceTitle}>Business Insurance</Text>
              <Text style={styles.insuranceDesc}>Do you have liability insurance?</Text>
            </View>
          </View>
          <View style={[styles.toggle, hasInsurance && styles.toggleActive]}>
            {hasInsurance && <View style={styles.toggleDot} />}
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pricing Model</Text>

        <View style={styles.modelCards}>
          <TouchableOpacity
            style={[styles.modelCard, pricingModel === 'HOURLY' && styles.modelCardActive]}
            onPress={() => setPricingModel('HOURLY')}
          >
            <View style={[styles.modelIcon, pricingModel === 'HOURLY' && styles.modelIconActive]}>
              <Ionicons name="time" size={24} color={pricingModel === 'HOURLY' ? '#fff' : '#8b5cf6'} />
            </View>
            <Text style={[styles.modelTitle, pricingModel === 'HOURLY' && styles.modelTitleActive]}>
              Hourly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modelCard, pricingModel === 'FIXED' && styles.modelCardActive]}
            onPress={() => setPricingModel('FIXED')}
          >
            <View style={[styles.modelIcon, pricingModel === 'FIXED' && styles.modelIconActive]}>
              <Ionicons name="pricetag" size={24} color={pricingModel === 'FIXED' ? '#fff' : '#8b5cf6'} />
            </View>
            <Text style={[styles.modelTitle, pricingModel === 'FIXED' && styles.modelTitleActive]}>
              Fixed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modelCard, pricingModel === 'BOTH' && styles.modelCardActive]}
            onPress={() => setPricingModel('BOTH')}
          >
            <View style={[styles.modelIcon, pricingModel === 'BOTH' && styles.modelIconActive]}>
              <Ionicons name="options" size={24} color={pricingModel === 'BOTH' ? '#fff' : '#8b5cf6'} />
            </View>
            <Text style={[styles.modelTitle, pricingModel === 'BOTH' && styles.modelTitleActive]}>
              Both
            </Text>
          </TouchableOpacity>
        </View>

        {(pricingModel === 'HOURLY' || pricingModel === 'BOTH') && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Hourly Rate <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="3,000"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.perHour}>/hour</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.continueGradient}>
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
  progressFill: { height: '100%', backgroundColor: '#8b5cf6' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#000', marginBottom: 16 },
  required: { color: '#ef4444' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
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
  insuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  insuranceLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  insuranceInfo: { marginLeft: 12, flex: 1 },
  insuranceTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 2 },
  insuranceDesc: { fontSize: 13, color: '#6b7280' },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: '#8b5cf6', alignItems: 'flex-end' },
  toggleDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  modelCards: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modelCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  modelCardActive: { borderColor: '#8b5cf6', backgroundColor: '#f5f3ff' },
  modelIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modelIconActive: { backgroundColor: '#8b5cf6' },
  modelTitle: { fontSize: 15, fontWeight: '700', color: '#000' },
  modelTitleActive: { color: '#8b5cf6' },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencySymbol: { fontSize: 18, fontWeight: '700', color: '#000', marginRight: 8 },
  priceInput: { flex: 1, fontSize: 18, fontWeight: '700', color: '#000' },
  perHour: { fontSize: 14, color: '#6b7280', marginLeft: 8 },
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

export default HomeServicePricingScreen;
