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

interface ServiceType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const HOME_SERVICE_TYPES: ServiceType[] = [
  {
    id: 'CLEANING',
    name: 'Cleaning Services',
    icon: 'sparkles',
    color: '#8b5cf6',
    description: 'Home & office cleaning',
  },
  {
    id: 'LAUNDRY',
    name: 'Laundry Services',
    icon: 'shirt',
    color: '#06b6d4',
    description: 'Wash, iron & dry cleaning',
  },
  {
    id: 'MOVING',
    name: 'Moving Services',
    icon: 'cube',
    color: '#f59e0b',
    description: 'Relocation & packing',
  },
  {
    id: 'PEST_CONTROL',
    name: 'Pest Control',
    icon: 'bug',
    color: '#ef4444',
    description: 'Fumigation & extermination',
  },
  {
    id: 'SECURITY',
    name: 'Security Services',
    icon: 'shield-checkmark',
    color: '#10b981',
    description: 'Guards & surveillance',
  },
  {
    id: 'CATERING',
    name: 'Catering',
    icon: 'restaurant',
    color: '#ec4899',
    description: 'Event catering services',
  },
  {
    id: 'EVENT_PLANNING',
    name: 'Event Planning',
    icon: 'calendar',
    color: '#3b82f6',
    description: 'Party & event organization',
  },
  {
    id: 'OTHER',
    name: 'Other Services',
    icon: 'ellipsis-horizontal',
    color: '#6b7280',
    description: 'Specify your service',
  },
];

const HomeServiceTypeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes } = (route.params as any) || {};

  const [selectedServiceType, setSelectedServiceType] = useState('');

  const handleContinue = () => {
    if (!selectedServiceType) {
      Alert.alert('Required', 'Please select a service type');
      return;
    }

    const serviceType = HOME_SERVICE_TYPES.find((s) => s.id === selectedServiceType);

    (navigation as any).navigate('HomeServicePricing', {
      selectedTypes,
      serviceType,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Type</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <Text style={styles.progressText}>Step 1 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What service do you provide?</Text>
        <Text style={styles.subtitle}>
          Select the home service category that best describes your business
        </Text>

        <View style={styles.servicesGrid}>
          {HOME_SERVICE_TYPES.map((service) => {
            const isSelected = selectedServiceType === service.id;

            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isSelected && { borderColor: service.color },
                ]}
                onPress={() => setSelectedServiceType(service.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: service.color + '15' },
                  ]}
                >
                  <Ionicons name={service.icon as any} size={32} color={service.color} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDesc}>{service.description}</Text>
                {isSelected && (
                  <View
                    style={[styles.checkmark, { backgroundColor: service.color }]}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedServiceType && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.continueGradient}>
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
  progressFill: { height: '100%', backgroundColor: '#8b5cf6' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24, lineHeight: 24 },
  servicesGrid: { gap: 12 },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 4 },
  serviceDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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

export default HomeServiceTypeScreen;
