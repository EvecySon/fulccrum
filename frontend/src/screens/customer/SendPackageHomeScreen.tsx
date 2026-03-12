import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface PackageSize {
  id: 'small' | 'medium' | 'large';
  title: string;
  subtitle: string;
  weight: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  accentColor: string;
  gradientColors: string[];
  multiplier: number;
  priceLabel: string;
}

const PACKAGE_SIZES: PackageSize[] = [
  {
    id: 'small',
    title: 'Small',
    subtitle: 'Documents, phone, wallet',
    weight: 'Up to 5kg',
    icon: 'document-text-outline',
    color: '#007AFF',
    accentColor: '#007AFF',
    gradientColors: ['#007AFF', '#5856D6'],
    multiplier: 1.0,
    priceLabel: 'Base Price',
  },
  {
    id: 'medium',
    title: 'Medium',
    subtitle: 'Laptop, clothes, small box',
    weight: '5-15kg',
    icon: 'cube-outline',
    color: '#F59E0B',
    accentColor: '#F59E0B',
    gradientColors: ['#F59E0B', '#D97706'],
    multiplier: 1.5,
    priceLabel: '1.5x Base Price',
  },
  {
    id: 'large',
    title: 'Large',
    subtitle: 'Large box, multiple items',
    weight: '15-30kg',
    icon: 'cube',
    color: '#F43F5E',
    accentColor: '#F43F5E',
    gradientColors: ['#F43F5E', '#E11D48'],
    multiplier: 2.0,
    priceLabel: '2x Base Price',
  },
];

const SendPackageHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonSlideAnim = useRef(new Animated.Value(20)).current;
  const buttonOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate button when package is selected
    if (selectedSize) {
      Animated.parallel([
        Animated.timing(buttonSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(buttonSlideAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedSize]);

  const handleContinue = () => {
    if (!selectedSize) return;
    
    (navigation as any).navigate('LocationPicker', {
      packageSize: selectedSize,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <BlurView intensity={95} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Package</Text>
          <View style={styles.placeholder} />
        </View>
      </BlurView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#007AFF', '#5856D6']}
            style={styles.heroIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="cube" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>What are you sending?</Text>
          <Text style={styles.subtitle}>
            Select your package size to get started
          </Text>
        </Animated.View>

        {/* Package Selection List */}
        <Animated.View 
          style={[
            styles.listContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iosList}>
            {PACKAGE_SIZES.map((size, index) => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.iosListItem,
                  selectedSize === size.id && styles.iosListItemSelected,
                  index < PACKAGE_SIZES.length - 1 && styles.iosListItemBorder,
                ]}
                onPress={() => setSelectedSize(size.id)}
                activeOpacity={0.8}
              >
                <View style={styles.listItemLeft}>
                  <View style={[
                    styles.iconBox,
                    { backgroundColor: size.id === 'small' ? '#EBF5FF' : size.id === 'medium' ? '#FFF7ED' : '#FFF1F2' }
                  ]}>
                    <Ionicons 
                      name={size.icon} 
                      size={20} 
                      color={size.color} 
                    />
                  </View>
                  <View style={styles.listItemText}>
                    <Text style={styles.listItemTitle}>{size.title}</Text>
                    <Text style={styles.listItemSubtitle}>{size.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.weightText}>{size.weight}</Text>
                  <View style={[
                    styles.selectionRing,
                    selectedSize === size.id && styles.selectionRingSelected
                  ]}>
                    {selectedSize === size.id && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Features Pills */}
        <Animated.View 
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.featurePill}>
            <Ionicons name="flash" size={12} color="#007AFF" />
            <Text style={styles.featurePillText}>30-60 min</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="shield-checkmark" size={12} color="#007AFF" />
            <Text style={styles.featurePillText}>Insured ₦50k</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="location" size={12} color="#007AFF" />
            <Text style={styles.featurePillText}>Live tracking</Text>
          </View>
        </Animated.View>

        {/* How It Works */}
        <Animated.View 
          style={[
            styles.howItWorksSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Select package size</Text>
                <Text style={styles.stepDescription}>Choose what fits your item</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Set pickup & dropoff</Text>
                <Text style={styles.stepDescription}>Enter both locations</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get matched</Text>
                <Text style={styles.stepDescription}>Nearest courier assigned</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Track in real-time</Text>
                <Text style={styles.stepDescription}>Follow every step</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Continue Button */}
      {selectedSize && (
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: buttonOpacityAnim,
              transform: [{ translateY: buttonSlideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(198, 198, 200, 0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  iosList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 1,
  },
  iosListItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iosListItemSelected: {
    backgroundColor: '#F2F2F7',
  },
  iosListItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  selectionRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionRingSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  featurePill: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featurePillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
  howItWorksSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  stepsContainer: {
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SendPackageHomeScreen;
