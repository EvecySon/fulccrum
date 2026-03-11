import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface PackageSize {
  id: 'small' | 'medium' | 'large';
  title: string;
  subtitle: string;
  weight: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  multiplier: number;
}

const PACKAGE_SIZES: PackageSize[] = [
  {
    id: 'small',
    title: 'Small',
    subtitle: 'Documents, phone, wallet',
    weight: 'Up to 5kg',
    icon: 'document-text',
    color: '#3498db',
    multiplier: 1.0,
  },
  {
    id: 'medium',
    title: 'Medium',
    subtitle: 'Laptop, clothes, small box',
    weight: '5-15kg',
    icon: 'cube',
    color: '#f39c12',
    multiplier: 1.5,
  },
  {
    id: 'large',
    title: 'Large',
    subtitle: 'Large box, multiple items',
    weight: '15-30kg',
    icon: 'cube-outline',
    color: '#e74c3c',
    multiplier: 2.0,
  },
];

const SendPackageHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | null>(null);

  const handleContinue = () => {
    if (!selectedSize) return;
    
    (navigation as any).navigate('LocationPicker', {
      packageSize: selectedSize,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Package</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="cube" size={48} color="#ff6b35" />
          </View>
          <Text style={styles.title}>What are you sending?</Text>
          <Text style={styles.subtitle}>
            Select your package size to get started
          </Text>
        </View>

        {/* Package Size Cards */}
        <View style={styles.sizesContainer}>
          {PACKAGE_SIZES.map((size) => (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.sizeCard,
                selectedSize === size.id && styles.sizeCardSelected,
              ]}
              onPress={() => setSelectedSize(size.id)}
              activeOpacity={0.7}
            >
              <View style={styles.sizeCardContent}>
                <View style={[styles.sizeIcon, { backgroundColor: `${size.color}15` }]}>
                  <Ionicons name={size.icon} size={32} color={size.color} />
                </View>
                
                <View style={styles.sizeInfo}>
                  <Text style={styles.sizeTitle}>{size.title}</Text>
                  <Text style={styles.sizeSubtitle}>{size.subtitle}</Text>
                  <Text style={styles.sizeWeight}>{size.weight}</Text>
                </View>

                {selectedSize === size.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
                  </View>
                )}
              </View>

              {size.multiplier > 1 && (
                <View style={styles.multiplierBadge}>
                  <Text style={styles.multiplierText}>
                    {size.multiplier}x base price
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="flash" size={20} color="#f39c12" />
            <Text style={styles.infoText}>Fast delivery in 30-60 minutes</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={20} color="#2ecc71" />
            <Text style={styles.infoText}>Insured up to ₦50,000</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="location" size={20} color="#3498db" />
            <Text style={styles.infoText}>Real-time tracking</Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How it works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Select package size</Text>
              <Text style={styles.stepDescription}>
                Choose the size that best fits your item
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Set pickup & dropoff</Text>
              <Text style={styles.stepDescription}>
                Enter sender and receiver locations
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get matched with courier</Text>
              <Text style={styles.stepDescription}>
                We'll find the nearest available courier
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Track in real-time</Text>
              <Text style={styles.stepDescription}>
                Follow your package every step of the way
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Continue Button */}
      {selectedSize && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
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
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff5f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sizesContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sizeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sizeCardSelected: {
    borderColor: '#2ecc71',
    backgroundColor: '#f0fdf4',
  },
  sizeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sizeInfo: {
    flex: 1,
  },
  sizeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  sizeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sizeWeight: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  checkmark: {
    marginLeft: 12,
  },
  multiplierBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  multiplierText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
});

export default SendPackageHomeScreen;
