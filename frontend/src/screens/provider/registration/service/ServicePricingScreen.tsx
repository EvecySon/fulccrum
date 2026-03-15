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

const ServicePricingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, category, details } = (route.params as any) || {};

  const [pricingModel, setPricingModel] = useState<'HOURLY' | 'FIXED' | 'BOTH'>('HOURLY');
  const [hourlyRate, setHourlyRate] = useState('');
  const [fixedRates, setFixedRates] = useState({
    basic: '',
    standard: '',
    premium: '',
  });

  const handleSubmit = () => {
    if (pricingModel === 'HOURLY' && !hourlyRate.trim()) {
      Alert.alert('Required', 'Please enter your hourly rate');
      return;
    }

    if (pricingModel === 'FIXED' && !fixedRates.basic.trim()) {
      Alert.alert('Required', 'Please enter at least a basic service rate');
      return;
    }

    Alert.alert(
      'Submit Registration',
      'Your service provider registration will be submitted for approval. This usually takes 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            console.log('Registration data:', {
              selectedTypes,
              category,
              details,
              pricing: {
                pricingModel,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
                fixedRates: pricingModel !== 'HOURLY' ? fixedRates : null,
              },
            });

            (navigation as any).navigate('PendingApproval', {
              providerType: 'PROFESSIONAL_SERVICE',
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pricing</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Set Your Pricing</Text>
        <Text style={styles.subtitle}>Choose how you want to charge for your services</Text>

        {/* Pricing Model Selection */}
        <View style={styles.modelCards}>
          <TouchableOpacity
            style={[styles.modelCard, pricingModel === 'HOURLY' && styles.modelCardActive]}
            onPress={() => setPricingModel('HOURLY')}
          >
            <View style={[styles.modelIcon, pricingModel === 'HOURLY' && styles.modelIconActive]}>
              <Ionicons name="time" size={24} color={pricingModel === 'HOURLY' ? '#fff' : '#f59e0b'} />
            </View>
            <Text style={[styles.modelTitle, pricingModel === 'HOURLY' && styles.modelTitleActive]}>
              Hourly Rate
            </Text>
            <Text style={styles.modelDesc}>Charge by the hour</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modelCard, pricingModel === 'FIXED' && styles.modelCardActive]}
            onPress={() => setPricingModel('FIXED')}
          >
            <View style={[styles.modelIcon, pricingModel === 'FIXED' && styles.modelIconActive]}>
              <Ionicons name="pricetag" size={24} color={pricingModel === 'FIXED' ? '#fff' : '#f59e0b'} />
            </View>
            <Text style={[styles.modelTitle, pricingModel === 'FIXED' && styles.modelTitleActive]}>
              Fixed Price
            </Text>
            <Text style={styles.modelDesc}>Set prices per service</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modelCard, pricingModel === 'BOTH' && styles.modelCardActive]}
            onPress={() => setPricingModel('BOTH')}
          >
            <View style={[styles.modelIcon, pricingModel === 'BOTH' && styles.modelIconActive]}>
              <Ionicons name="options" size={24} color={pricingModel === 'BOTH' ? '#fff' : '#f59e0b'} />
            </View>
            <Text style={[styles.modelTitle, pricingModel === 'BOTH' && styles.modelTitleActive]}>
              Both
            </Text>
            <Text style={styles.modelDesc}>Offer both options</Text>
          </TouchableOpacity>
        </View>

        {/* Hourly Rate */}
        {(pricingModel === 'HOURLY' || pricingModel === 'BOTH') && (
          <View style={styles.pricingSection}>
            <Text style={styles.sectionLabel}>Hourly Rate</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="5,000"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.perHour}>/hour</Text>
            </View>
          </View>
        )}

        {/* Fixed Rates */}
        {(pricingModel === 'FIXED' || pricingModel === 'BOTH') && (
          <View style={styles.pricingSection}>
            <Text style={styles.sectionLabel}>Fixed Service Rates</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Basic Service</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₦</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="3,000"
                  value={fixedRates.basic}
                  onChangeText={(val) => setFixedRates({ ...fixedRates, basic: val })}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Standard Service (Optional)</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₦</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="7,000"
                  value={fixedRates.standard}
                  onChangeText={(val) => setFixedRates({ ...fixedRates, standard: val })}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Premium Service (Optional)</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₦</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="15,000"
                  value={fixedRates.premium}
                  onChangeText={(val) => setFixedRates({ ...fixedRates, premium: val })}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.infoText}>
            You can adjust your pricing anytime from your dashboard. Prices shown to customers will include platform fees.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.submitGradient}>
            <Text style={styles.submitButtonText}>Submit for Approval</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
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
  sectionTitle: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  modelCards: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  modelCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  modelCardActive: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  modelIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modelIconActive: { backgroundColor: '#f59e0b' },
  modelTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 4 },
  modelTitleActive: { color: '#f59e0b' },
  modelDesc: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  pricingSection: { marginBottom: 32 },
  sectionLabel: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 16 },
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
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#1e40af', lineHeight: 20 },
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
  submitButton: { borderRadius: 12, overflow: 'hidden' },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#fff', marginRight: 8 },
});

export default ServicePricingScreen;
