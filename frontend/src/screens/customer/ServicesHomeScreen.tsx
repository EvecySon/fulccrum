import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { servicesAPI, ServiceProvider } from '../../services/servicesAPI';
import { resolveMediaUrl } from '../../services/api';

const { width } = Dimensions.get('window');

const HOME_SERVICES = [
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles', color: '#3498db' },
  { id: 'plumbing', name: 'Plumbing', icon: 'water', color: '#e74c3c' },
  { id: 'electrical', name: 'Electrical', icon: 'flash', color: '#f39c12' },
  { id: 'carpentry', name: 'Carpentry', icon: 'hammer', color: '#8b4513' },
  { id: 'painting', name: 'Painting', icon: 'color-palette', color: '#9b59b6' },
  { id: 'gardening', name: 'Gardening', icon: 'leaf', color: '#2ecc71' },
];

const HEALTH_SERVICES = [
  { id: 'doctor', name: 'Doctors', icon: 'medical', color: '#3498db' },
  { id: 'dentist', name: 'Dentists', icon: 'fitness', color: '#1abc9c' },
  { id: 'lab', name: 'Lab Tests', icon: 'flask', color: '#e74c3c' },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'medkit', color: '#f39c12' },
  { id: 'physiotherapy', name: 'Physiotherapy', icon: 'body', color: '#9b59b6' },
  { id: 'mental_health', name: 'Mental Health', icon: 'heart', color: '#e91e63' },
];

const ServicesHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'home' | 'health'>('home');
  const [featuredProviders, setFeaturedProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProviders();
  }, [activeTab]);

  const loadFeaturedProviders = async () => {
    try {
      setIsLoading(true);
      const response = await servicesAPI.getFeaturedProviders(activeTab);
      if (response.success) {
        setFeaturedProviders(response.data);
      }
    } catch (error) {
      console.error('Load featured providers error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (serviceType: string) => {
    if (activeTab === 'home') {
      (navigation as any).navigate('HomeServices', { serviceType });
    } else {
      (navigation as any).navigate('HealthServices', { serviceType });
    }
  };

  const handleProviderSelect = (provider: ServiceProvider) => {
    (navigation as any).navigate('ServiceProvider', { providerId: provider.id });
  };

  const services = activeTab === 'home' ? HOME_SERVICES : HEALTH_SERVICES;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => (navigation as any).navigate('Search')}
        >
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.tabActive]}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons
            name="home"
            size={20}
            color={activeTab === 'home' ? '#fff' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>
            Home Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'health' && styles.tabActive]}
          onPress={() => setActiveTab('health')}
        >
          <Ionicons
            name="medical"
            size={20}
            color={activeTab === 'health' ? '#fff' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'health' && styles.tabTextActive]}>
            Health Services
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {activeTab === 'home' ? 'Home Services' : 'Health Services'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {activeTab === 'home'
              ? 'Professional services for your home'
              : 'Book appointments with verified healthcare providers'}
          </Text>
        </View>

        {/* Service Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServiceSelect(service.id)}
              >
                <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
                  <Ionicons name={service.icon as any} size={32} color={service.color} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Providers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={styles.providerCard}
                  onPress={() => handleProviderSelect(provider)}
                >
                  <View style={styles.providerImageContainer}>
                    {resolveMediaUrl(provider.avatarUrl) ? (
                      <Image
                        source={{ uri: resolveMediaUrl(provider.avatarUrl)! }}
                        style={styles.providerImage}
                      />
                    ) : (
                      <View style={styles.providerImagePlaceholder}>
                        <Ionicons name="person" size={32} color="#999" />
                      </View>
                    )}
                    {provider.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                      </View>
                    )}
                  </View>

                  <Text style={styles.providerName} numberOfLines={1}>
                    {provider.name}
                  </Text>
                  <Text style={styles.providerType} numberOfLines={1}>
                    {provider.serviceType}
                  </Text>

                  <View style={styles.providerMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#f39c12" />
                      <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({provider.reviewCount})</Text>
                    </View>
                  </View>

                  <Text style={styles.providerPrice}>
                    From {provider.pricing.currency}{provider.pricing.basePrice.toLocaleString()}
                  </Text>

                  {provider.availability.nextAvailable && (
                    <View style={styles.availabilityBadge}>
                      <Ionicons name="time" size={12} color="#2ecc71" />
                      <Text style={styles.availabilityText}>
                        Next: {new Date(provider.availability.nextAvailable).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Fulccrum Services?</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#2ecc71" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Verified Professionals</Text>
              <Text style={styles.featureDescription}>
                All service providers are background-checked and verified
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="calendar" size={24} color="#3498db" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Easy Booking</Text>
              <Text style={styles.featureDescription}>
                Book appointments in seconds with real-time availability
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="cash" size={24} color="#f39c12" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Transparent Pricing</Text>
              <Text style={styles.featureDescription}>
                No hidden fees. See exact prices before booking
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  serviceCard: {
    width: (width - 52) / 3,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  providerCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginLeft: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  providerImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  providerImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  providerImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  providerType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  providerMeta: {
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  providerPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3498db',
    marginBottom: 8,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2ecc71',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default ServicesHomeScreen;
