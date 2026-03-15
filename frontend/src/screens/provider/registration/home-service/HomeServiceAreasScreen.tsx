import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  'Lekki Phase 2',
  'Ikeja',
  'Surulere',
  'Yaba',
  'Ajah',
  'Ikoyi',
  'Maryland',
  'Gbagada',
  'Festac',
  'Apapa',
  'Magodo',
  'Ogba',
  'Isolo',
];

const HomeServiceAreasScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, serviceType, pricing } = (route.params as any) || {};

  const [serviceAreas, setServiceAreas] = useState<string[]>([]);

  const toggleServiceArea = (area: string) => {
    setServiceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = () => {
    if (serviceAreas.length === 0) {
      Alert.alert('Required', 'Please select at least one service area');
      return;
    }

    Alert.alert(
      'Submit Registration',
      'Your home service registration will be submitted for approval. This usually takes 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            console.log('Registration data:', {
              selectedTypes,
              serviceType,
              pricing,
              serviceAreas,
            });

            (navigation as any).navigate('PendingApproval', {
              providerType: 'HOME_SERVICE',
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
        <Text style={styles.headerTitle}>Service Areas</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Where do you provide services?</Text>
        <Text style={styles.subtitle}>
          Select all areas where you can provide {serviceType?.name || 'your services'}
        </Text>

        <View style={styles.statsCard}>
          <Ionicons name="location" size={24} color="#8b5cf6" />
          <View style={styles.statsContent}>
            <Text style={styles.statsNumber}>{serviceAreas.length}</Text>
            <Text style={styles.statsLabel}>
              {serviceAreas.length === 1 ? 'area' : 'areas'} selected
            </Text>
          </View>
        </View>

        <View style={styles.areasGrid}>
          {SERVICE_AREAS.map((area) => {
            const isSelected = serviceAreas.includes(area);

            return (
              <TouchableOpacity
                key={area}
                style={[
                  styles.areaCard,
                  isSelected && styles.areaCardSelected,
                ]}
                onPress={() => toggleServiceArea(area)}
                activeOpacity={0.7}
              >
                <View style={styles.areaContent}>
                  <Ionicons
                    name="location"
                    size={20}
                    color={isSelected ? '#8b5cf6' : '#6b7280'}
                  />
                  <Text
                    style={[
                      styles.areaText,
                      isSelected && styles.areaTextSelected,
                    ]}
                  >
                    {area}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.infoText}>
            You can update your service areas anytime from your dashboard. Choose areas
            where you can reliably provide quality service.
          </Text>
        </View>
      </ScrollView>

      {serviceAreas.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.submitGradient}>
              <Text style={styles.submitButtonText}>Submit for Approval</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
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
  progressFill: { height: '100%', backgroundColor: '#8b5cf6' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24, lineHeight: 24 },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  statsContent: { marginLeft: 16 },
  statsNumber: { fontSize: 32, fontWeight: '800', color: '#8b5cf6' },
  statsLabel: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  areasGrid: { gap: 12, marginBottom: 24 },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  areaCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  areaContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  areaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  areaTextSelected: { color: '#8b5cf6' },
  checkmark: { marginLeft: 12 },
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

export default HomeServiceAreasScreen;
