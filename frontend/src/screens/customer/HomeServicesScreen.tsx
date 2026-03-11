import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { servicesAPI, ServiceProvider } from '../../services/servicesAPI';

const SERVICE_TYPES = [
  { id: 'all', label: 'All Services' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'carpentry', label: 'Carpentry' },
  { id: 'painting', label: 'Painting' },
  { id: 'gardening', label: 'Gardening' },
  { id: 'hvac', label: 'HVAC' },
  { id: 'appliance_repair', label: 'Appliance Repair' },
];

const SORT_OPTIONS = [
  { id: 'rating', label: 'Highest Rated' },
  { id: 'price', label: 'Lowest Price' },
  { id: 'distance', label: 'Nearest' },
  { id: 'availability', label: 'Soonest Available' },
];

const HomeServicesScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceType } = (route.params as any) || {};

  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>(serviceType || 'all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance' | 'availability'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProviders();
  }, [selectedType, sortBy]);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const response = await servicesAPI.getProviders({
        category: 'home',
        serviceType: selectedType === 'all' ? undefined : selectedType,
        sortBy,
      });

      if (response.success) {
        setProviders(response.data.providers);
      }
    } catch (error) {
      console.error('Load providers error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (provider: ServiceProvider) => {
    (navigation as any).navigate('ServiceProvider', {
      providerId: provider.id,
      category: 'home',
    });
  };

  const getServiceTypeTitle = () => {
    const type = SERVICE_TYPES.find((t) => t.id === selectedType);
    return type?.label || 'Home Services';
  };

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
        <Text style={styles.headerTitle}>{getServiceTypeTitle()}</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by service or provider name"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Service Types */}
          <Text style={styles.filterTitle}>Service Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {SERVICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.filterChip,
                    selectedType === type.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedType === type.id && styles.filterChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Sort By */}
          <Text style={styles.filterTitle}>Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterChip,
                    sortBy === option.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSortBy(option.id as any)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      sortBy === option.id && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {providers.length} {providers.length === 1 ? 'provider' : 'providers'} found
        </Text>
      </View>

      {/* Providers List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Finding providers...</Text>
          </View>
        ) : providers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="construct" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No providers found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
          </View>
        ) : (
          providers.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() => handleProviderSelect(provider)}
            >
              <View style={styles.providerHeader}>
                <View style={styles.providerImageContainer}>
                  {provider.avatarUrl ? (
                    <Image
                      source={{ uri: provider.avatarUrl }}
                      style={styles.providerImage}
                    />
                  ) : (
                    <View style={styles.providerImagePlaceholder}>
                      <Ionicons name="person" size={32} color="#999" />
                    </View>
                  )}
                  {provider.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                    </View>
                  )}
                </View>

                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerSpecialty}>{provider.serviceType}</Text>

                  <View style={styles.providerMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#f39c12" />
                      <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({provider.reviewCount})</Text>
                    </View>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.experienceText}>
                      {provider.yearsExperience} years exp.
                    </Text>
                  </View>

                  {provider.specializations.length > 0 && (
                    <View style={styles.specializationsContainer}>
                      {provider.specializations.slice(0, 3).map((spec, index) => (
                        <View key={index} style={styles.specializationTag}>
                          <Text style={styles.specializationText}>{spec}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.providerFooter}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {provider.location.city}
                    {provider.location.distance && ` • ${provider.location.distance}km away`}
                  </Text>
                </View>

                {provider.responseTime && (
                  <View style={styles.responseContainer}>
                    <Ionicons name="time-outline" size={14} color="#2ecc71" />
                    <Text style={styles.responseText}>
                      Responds in {provider.responseTime}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.bookingSection}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Starting from</Text>
                  <Text style={styles.priceText}>
                    ₦{provider.pricing.basePrice.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleProviderSelect(provider)}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    marginLeft: 12,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  providerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  providerImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  providerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  providerSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  metaDivider: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 8,
  },
  experienceText: {
    fontSize: 12,
    color: '#666',
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specializationTag: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  specializationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1976d2',
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  responseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responseText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2ecc71',
  },
  bookingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3498db',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});

export default HomeServicesScreen;
