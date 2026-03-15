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

interface Profession {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const HEALTH_PROFESSIONS: Profession[] = [
  { id: 'DOCTOR', name: 'Doctor', icon: 'medical', color: '#ef4444' },
  { id: 'NURSE', name: 'Nurse', icon: 'heart', color: '#ec4899' },
  { id: 'PHYSIOTHERAPIST', name: 'Physiotherapist', icon: 'fitness', color: '#8b5cf6' },
  { id: 'THERAPIST', name: 'Therapist', icon: 'happy', color: '#10b981' },
  { id: 'NUTRITIONIST', name: 'Nutritionist', icon: 'nutrition', color: '#f59e0b' },
  { id: 'PHARMACIST', name: 'Pharmacist', icon: 'flask', color: '#3b82f6' },
  { id: 'DENTIST', name: 'Dentist', icon: 'tooth', color: '#06b6d4' },
  { id: 'OPTOMETRIST', name: 'Optometrist', icon: 'eye', color: '#14b8a6' },
];

const SPECIALIZATIONS = [
  'General Practice',
  'Pediatrics',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Gynecology',
  'Surgery',
  'Internal Medicine',
];

const HealthProfessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes } = (route.params as any) || {};

  const [selectedProfession, setSelectedProfession] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  const toggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleContinue = () => {
    if (!selectedProfession) {
      Alert.alert('Required', 'Please select your profession');
      return;
    }
    if (!licenseNumber.trim()) {
      Alert.alert('Required', 'Please enter your license number');
      return;
    }
    if (!yearsOfExperience.trim()) {
      Alert.alert('Required', 'Please enter years of experience');
      return;
    }

    const profession = HEALTH_PROFESSIONS.find(p => p.id === selectedProfession);

    (navigation as any).navigate('HealthCredentials', {
      selectedTypes,
      profession: {
        type: selectedProfession,
        specializations,
        licenseNumber,
        yearsOfExperience: parseInt(yearsOfExperience),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Profession</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <Text style={styles.progressText}>Step 1 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Select Your Profession</Text>
        <Text style={styles.subtitle}>Choose your primary healthcare profession</Text>

        <View style={styles.professionsGrid}>
          {HEALTH_PROFESSIONS.map((profession) => {
            const isSelected = selectedProfession === profession.id;

            return (
              <TouchableOpacity
                key={profession.id}
                style={[
                  styles.professionCard,
                  isSelected && { borderColor: profession.color },
                ]}
                onPress={() => setSelectedProfession(profession.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: profession.color + '15' },
                  ]}
                >
                  <Ionicons name={profession.icon as any} size={28} color={profession.color} />
                </View>
                <Text style={styles.professionName}>{profession.name}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: profession.color }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedProfession && (
          <>
            <Text style={styles.sectionTitle}>Specializations (Optional)</Text>
            <View style={styles.chipsContainer}>
              {SPECIALIZATIONS.map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={[
                    styles.chip,
                    specializations.includes(spec) && styles.chipSelected,
                  ]}
                  onPress={() => toggleSpecialization(spec)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      specializations.includes(spec) && styles.chipTextSelected,
                    ]}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                License Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., MD123456"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
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
          </>
        )}
      </ScrollView>

      {selectedProfession && licenseNumber && yearsOfExperience && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.continueGradient}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  professionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  professionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  professionName: { fontSize: 14, fontWeight: '700', color: '#000', textAlign: 'center' },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 16 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipSelected: { backgroundColor: '#10b981', borderColor: '#10b981' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  chipTextSelected: { color: '#fff' },
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

export default HealthProfessionScreen;
