import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface ProviderType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
}

const PROVIDER_TYPES: ProviderType[] = [
  {
    id: 'RESTAURANT',
    title: 'Restaurant/Food Service',
    description: 'Sell food, drinks, and meals to customers',
    icon: 'restaurant',
    color: '#ef4444',
    gradient: ['#ef4444', '#dc2626'],
  },
  {
    id: 'PROFESSIONAL_SERVICE',
    title: 'Professional Services',
    description: 'Plumbing, electrical, carpentry, and more',
    icon: 'construct',
    color: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
  },
  {
    id: 'HEALTH_SERVICE',
    title: 'Health Services',
    description: 'Medical, therapy, wellness services',
    icon: 'medical',
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
  },
  {
    id: 'GADGET_SELLER',
    title: 'Gadgets & Electronics',
    description: 'Sell phones, laptops, accessories, and more',
    icon: 'phone-portrait',
    color: '#3b82f6',
    gradient: ['#3b82f6', '#2563eb'],
  },
  {
    id: 'HOME_SERVICE',
    title: 'Home Services',
    description: 'Cleaning, laundry, moving, and home care',
    icon: 'home',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
  },
];

const ProviderTypeSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleContinue = () => {
    if (selectedTypes.length === 0) return;

    // Navigate to first selected type's registration flow
    const firstType = selectedTypes[0];
    
    switch (firstType) {
      case 'RESTAURANT':
        (navigation as any).navigate('RestaurantRegistration', { 
          selectedTypes 
        });
        break;
      case 'PROFESSIONAL_SERVICE':
        (navigation as any).navigate('ServiceRegistration', { 
          selectedTypes 
        });
        break;
      case 'HEALTH_SERVICE':
        (navigation as any).navigate('HealthRegistration', { 
          selectedTypes 
        });
        break;
      case 'GADGET_SELLER':
        (navigation as any).navigate('SellerRegistration', { 
          selectedTypes 
        });
        break;
      case 'HOME_SERVICE':
        (navigation as any).navigate('HomeServiceRegistration', { 
          selectedTypes 
        });
        break;
    }
  };

  const renderProviderCard = (type: ProviderType) => {
    const isSelected = selectedTypes.includes(type.id);

    return (
      <TouchableOpacity
        key={type.id}
        style={[
          styles.providerCard,
          isSelected && styles.providerCardSelected,
        ]}
        onPress={() => toggleType(type.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: type.color + '15' },
            ]}
          >
            <Ionicons name={type.icon as any} size={32} color={type.color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>{type.title}</Text>
            <Text style={styles.cardDescription}>{type.description}</Text>
          </View>
          <View
            style={[
              styles.checkbox,
              isSelected && { backgroundColor: type.color },
            ]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>What do you provide?</Text>
          <Text style={styles.subtitle}>
            Select all services you want to offer. You can add more later.
          </Text>
        </View>

        {/* Provider Cards */}
        <View style={styles.cardsContainer}>
          {PROVIDER_TYPES.map(renderProviderCard)}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#14b8a6" />
          <Text style={styles.infoText}>
            You can offer multiple services from one account. Each service type
            has its own dashboard and settings.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      {selectedTypes.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#14b8a6', '#0d9488']}
              style={styles.continueGradient}
            >
              <Text style={styles.continueButtonText}>
                Continue with {selectedTypes.length}{' '}
                {selectedTypes.length === 1 ? 'service' : 'services'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  providerCardSelected: {
    borderColor: '#14b8a6',
    backgroundColor: '#f0fdfa',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdfa',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14b8a6',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#0f766e',
    lineHeight: 20,
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
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
});

export default ProviderTypeSelectionScreen;
