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
import { useNavigation, useRoute } from '@react-navigation/native';
import { servicesAPI } from '../../services/servicesAPI';
import { resolveMediaUrl } from '../../services/api';

const { width } = Dimensions.get('window');

const ServiceProviderScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { providerId, category } = (route.params as any) || {};

  const [provider, setProvider] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'about' | 'reviews'>('about');

  useEffect(() => {
    loadProviderDetails();
  }, [providerId]);

  const loadProviderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await servicesAPI.getProviderDetails(providerId);
      if (response.success) {
        setProvider(response.data);
      }
    } catch (error) {
      console.error('Load provider details error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    (navigation as any).navigate('Booking', {
      providerId,
      provider,
      category,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>Provider not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Provider Header */}
        <View style={styles.providerHeader}>
          <View style={styles.providerImageContainer}>
            {resolveMediaUrl(provider.avatarUrl) ? (
              <Image source={{ uri: resolveMediaUrl(provider.avatarUrl)! }} style={styles.providerImage} />
            ) : (
              <View style={styles.providerImagePlaceholder}>
                <Ionicons name="person" size={48} color="#999" />
              </View>
            )}
            {provider.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
              </View>
            )}
          </View>

          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerSpecialty}>{provider.serviceType}</Text>

          <View style={styles.providerStats}>
            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color="#f39c12" />
                <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>{provider.reviewCount} reviews</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.yearsExperience}</Text>
              <Text style={styles.statLabel}>Years Experience</Text>
            </View>

            {provider.responseTime && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{provider.responseTime}</Text>
                  <Text style={styles.statLabel}>Response Time</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfoSection}>
          <View style={styles.quickInfoCard}>
            <Ionicons name="location" size={20} color="#3498db" />
            <View style={styles.quickInfoContent}>
              <Text style={styles.quickInfoLabel}>Location</Text>
              <Text style={styles.quickInfoValue}>{provider.location.city}</Text>
            </View>
          </View>

          <View style={styles.quickInfoCard}>
            <Ionicons name="cash" size={20} color="#2ecc71" />
            <View style={styles.quickInfoContent}>
              <Text style={styles.quickInfoLabel}>Starting Price</Text>
              <Text style={styles.quickInfoValue}>
                ₦{provider.pricing.basePrice.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.quickInfoCard}>
            <Ionicons name="calendar" size={20} color="#f39c12" />
            <View style={styles.quickInfoContent}>
              <Text style={styles.quickInfoLabel}>Next Available</Text>
              <Text style={styles.quickInfoValue}>
                {provider.availability.nextAvailable
                  ? new Date(provider.availability.nextAvailable).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Check availability'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'about' && styles.tabActive]}
            onPress={() => setSelectedTab('about')}
          >
            <Text style={[styles.tabText, selectedTab === 'about' && styles.tabTextActive]}>
              About
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'reviews' && styles.tabActive]}
            onPress={() => setSelectedTab('reviews')}
          >
            <Text style={[styles.tabText, selectedTab === 'reviews' && styles.tabTextActive]}>
              Reviews ({provider.reviewCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'about' ? (
          <View style={styles.tabContent}>
            {/* Bio */}
            {provider.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bioText}>{provider.bio}</Text>
              </View>
            )}

            {/* Specializations */}
            {provider.specializations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Specializations</Text>
                <View style={styles.specializationsContainer}>
                  {provider.specializations.map((spec: string, index: number) => (
                    <View key={index} style={styles.specializationTag}>
                      <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                      <Text style={styles.specializationText}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications */}
            {provider.certifications?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                {provider.certifications.map((cert: any, index: number) => (
                  <View key={index} style={styles.certificationCard}>
                    <Ionicons name="ribbon" size={20} color="#3498db" />
                    <View style={styles.certificationContent}>
                      <Text style={styles.certificationName}>{cert.name}</Text>
                      <Text style={styles.certificationIssuer}>
                        {cert.issuedBy} • {cert.year}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Gallery */}
            {provider.gallery?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gallery</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.galleryContainer}>
                    {provider.gallery.map((image: string, index: number) => (
                      <Image key={index} source={{ uri: image }} style={styles.galleryImage} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.tabContent}>
            {/* Reviews */}
            {provider.reviews?.length > 0 ? (
              provider.reviews.map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Ionicons name="person" size={20} color="#999" />
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.customerName}</Text>
                      <View style={styles.reviewRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= review.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#f39c12"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>₦{provider.pricing.basePrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  providerHeader: {
    alignItems: 'center',
    paddingTop: 120,
    paddingBottom: 24,
    backgroundColor: '#f8f9fa',
  },
  providerImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  providerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  providerImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  providerName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  providerSpecialty: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quickInfoContent: {
    marginLeft: 16,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#3498db',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  bioText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  specializationsContainer: {
    gap: 12,
  },
  specializationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specializationText: {
    fontSize: 15,
    color: '#000',
  },
  certificationCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  certificationContent: {
    marginLeft: 16,
    flex: 1,
  },
  certificationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  certificationIssuer: {
    fontSize: 13,
    color: '#666',
  },
  galleryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyReviews: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  bottomPadding: {
    height: 120,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3498db',
  },
  bookButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ServiceProviderScreen;
