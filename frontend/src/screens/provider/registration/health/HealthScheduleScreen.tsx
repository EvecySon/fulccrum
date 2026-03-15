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

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

const HealthScheduleScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, profession, credentials } = (route.params as any) || {};

  const [consultationFee, setConsultationFee] = useState('');
  const [homeVisitFee, setHomeVisitFee] = useState('');
  const [availableForHomeVisit, setAvailableForHomeVisit] = useState(false);
  const [availableForTelemedicine, setAvailableForTelemedicine] = useState(true);
  const [workingHours, setWorkingHours] = useState({
    mon: { available: true, start: '09:00', end: '17:00' },
    tue: { available: true, start: '09:00', end: '17:00' },
    wed: { available: true, start: '09:00', end: '17:00' },
    thu: { available: true, start: '09:00', end: '17:00' },
    fri: { available: true, start: '09:00', end: '17:00' },
    sat: { available: false, start: '09:00', end: '17:00' },
    sun: { available: false, start: '09:00', end: '17:00' },
  });

  const toggleDayAvailability = (day: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], available: !prev[day as keyof typeof prev].available },
    }));
  };

  const handleSubmit = () => {
    if (!consultationFee.trim()) {
      Alert.alert('Required', 'Please enter your consultation fee');
      return;
    }

    if (availableForHomeVisit && !homeVisitFee.trim()) {
      Alert.alert('Required', 'Please enter your home visit fee');
      return;
    }

    Alert.alert(
      'Submit Registration',
      'Your health service registration will be submitted for approval. This usually takes 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            console.log('Registration data:', {
              selectedTypes,
              profession,
              credentials,
              schedule: {
                consultationFee: parseFloat(consultationFee),
                homeVisitFee: homeVisitFee ? parseFloat(homeVisitFee) : null,
                availableForHomeVisit,
                availableForTelemedicine,
                workingHours,
              },
            });

            (navigation as any).navigate('PendingApproval', {
              providerType: 'HEALTH_SERVICE',
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
        <Text style={styles.headerTitle}>Schedule & Fees</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Consultation Fees</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Consultation Fee <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="10,000"
              value={consultationFee}
              onChangeText={setConsultationFee}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Service Options</Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setAvailableForTelemedicine(!availableForTelemedicine)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="videocam" size={24} color="#10b981" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Telemedicine</Text>
              <Text style={styles.optionDesc}>Offer virtual consultations</Text>
            </View>
          </View>
          <View style={[styles.toggle, availableForTelemedicine && styles.toggleActive]}>
            {availableForTelemedicine && <View style={styles.toggleDot} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setAvailableForHomeVisit(!availableForHomeVisit)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="home" size={24} color="#10b981" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Home Visits</Text>
              <Text style={styles.optionDesc}>Visit patients at their homes</Text>
            </View>
          </View>
          <View style={[styles.toggle, availableForHomeVisit && styles.toggleActive]}>
            {availableForHomeVisit && <View style={styles.toggleDot} />}
          </View>
        </TouchableOpacity>

        {availableForHomeVisit && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Home Visit Fee <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="15,000"
                value={homeVisitFee}
                onChangeText={setHomeVisitFee}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Working Hours</Text>
        <Text style={styles.hint}>Set your availability for each day</Text>

        {DAYS_OF_WEEK.map((day) => (
          <View key={day.key} style={styles.dayRow}>
            <TouchableOpacity
              style={styles.dayCheckbox}
              onPress={() => toggleDayAvailability(day.key)}
            >
              <View
                style={[
                  styles.checkbox,
                  workingHours[day.key as keyof typeof workingHours].available && styles.checkboxActive,
                ]}
              >
                {workingHours[day.key as keyof typeof workingHours].available && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.dayLabel}>{day.label}</Text>
            </TouchableOpacity>
            {workingHours[day.key as keyof typeof workingHours].available && (
              <View style={styles.timeInputs}>
                <TextInput
                  style={styles.timeInput}
                  value={workingHours[day.key as keyof typeof workingHours].start}
                  placeholder="09:00"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.timeSeparator}>-</Text>
                <TextInput
                  style={styles.timeInput}
                  value={workingHours[day.key as keyof typeof workingHours].end}
                  placeholder="17:00"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            )}
          </View>
        ))}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#10b981" />
          <Text style={styles.infoText}>
            You can update your fees and availability anytime from your dashboard after approval.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.submitGradient}>
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
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#000', marginBottom: 16 },
  hint: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  required: { color: '#ef4444' },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
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
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  optionInfo: { marginLeft: 12, flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 2 },
  optionDesc: { fontSize: 13, color: '#6b7280' },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: '#10b981', alignItems: 'flex-end' },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dayCheckbox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  dayLabel: { fontSize: 15, fontWeight: '600', color: '#000' },
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 8,
  },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#065f46', lineHeight: 20 },
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

export default HealthScheduleScreen;
