import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { packageDeliveryAPI, PriceCalculation } from '../../services/packageDeliveryAPI';

const PriceEstimateScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    packageSize,
    pickupLocation,
    dropoffLocation,
    deliverySpeed,
    packageDescription,
    packageWeight,
    specialInstructions,
    packagePhoto,
  } = (route.params as any) || {};

  const [pricing, setPricing] = useState<PriceCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('PriceEstimateScreen mounted with params:', {
      packageSize,
      pickupLocation,
      dropoffLocation,
      deliverySpeed,
    });
    calculatePrice();
  }, []);

  const calculatePrice = async () => {
    try {
      setIsLoading(true);
      
      // Validate location data
      if (!pickupLocation?.lat || !pickupLocation?.lng || !dropoffLocation?.lat || !dropoffLocation?.lng) {
        console.error('Missing location data:', { pickupLocation, dropoffLocation });
        Alert.alert('Error', 'Location data is missing. Please go back and select locations again.');
        setIsLoading(false);
        return;
      }
      
      const response = await packageDeliveryAPI.calculatePrice({
        pickup: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        dropoff: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
        size: packageSize,
        speed: deliverySpeed,
      });

      setPricing(response);
    } catch (error) {
      console.error('Price calculation error:', error);
      Alert.alert('Error', 'Failed to calculate price. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      setIsSubmitting(true);

      const response = await packageDeliveryAPI.requestDelivery({
        pickupLocation,
        dropoffLocation,
        packageSize,
        deliverySpeed,
        packageDescription,
        packageWeight,
        specialInstructions,
      });

      (navigation as any).navigate('FindingCourier', {
        orderId: response.orderId,
        requestId: response.requestId,
        estimatedPrice: response.estimatedPrice,
        expiresAt: response.expiresAt,
      });
    } catch (error: any) {
      console.error('Request delivery error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to request delivery. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Calculating price...</Text>
      </View>
    );
  }

  if (!pricing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>Failed to calculate price</Text>
        <TouchableOpacity style={styles.retryButton} onPress={calculatePrice}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Estimate</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Price Card */}
        <View style={styles.totalPriceCard}>
          <Text style={styles.totalPriceLabel}>Total Delivery Cost</Text>
          <Text style={styles.totalPrice}>₦{pricing.totalPrice.toLocaleString()}</Text>
          <Text style={styles.totalPriceSubtitle}>
            {pricing.distance.toFixed(1)} km • {deliverySpeed === 'express' ? '30-60 min' : '2-4 hours'}
          </Text>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Base Fee</Text>
              <Text style={styles.breakdownValue}>₦{pricing.breakdown.base.toLocaleString()}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Distance ({pricing.distance.toFixed(1)} km)
              </Text>
              <Text style={styles.breakdownValue}>₦{pricing.breakdown.distance.toLocaleString()}</Text>
            </View>

            {pricing.breakdown.sizeAdjustment > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Package Size (+{pricing.breakdown.sizeAdjustment.toFixed(0)}%)
                </Text>
                <Text style={styles.breakdownValue}>
                  ₦{((pricing.totalPrice / (1 + pricing.breakdown.sizeAdjustment / 100)) * (pricing.breakdown.sizeAdjustment / 100)).toFixed(0)}
                </Text>
              </View>
            )}

            {pricing.breakdown.speedAdjustment > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  Express Delivery (+{pricing.breakdown.speedAdjustment.toFixed(0)}%)
                </Text>
                <Text style={styles.breakdownValue}>
                  ₦{((pricing.totalPrice / (1 + pricing.breakdown.speedAdjustment / 100)) * (pricing.breakdown.speedAdjustment / 100)).toFixed(0)}
                </Text>
              </View>
            )}

            {pricing.breakdown.surgeAdjustment > 0 && (
              <View style={[styles.breakdownRow, styles.surgeRow]}>
                <View style={styles.surgeLabel}>
                  <Ionicons name="flash" size={16} color="#f39c12" />
                  <Text style={[styles.breakdownLabel, { color: '#f39c12', marginLeft: 4 }]}>
                    Surge Pricing (+{pricing.breakdown.surgeAdjustment.toFixed(0)}%)
                  </Text>
                </View>
                <Text style={[styles.breakdownValue, { color: '#f39c12' }]}>
                  ₦{((pricing.totalPrice / (1 + pricing.breakdown.surgeAdjustment / 100)) * (pricing.breakdown.surgeAdjustment / 100)).toFixed(0)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelTotal}>Total</Text>
              <Text style={styles.breakdownValueTotal}>₦{pricing.totalPrice.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Route Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Summary</Text>
          
          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <View style={styles.routeIconContainer}>
                <Ionicons name="location" size={20} color="#3498db" />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeAddress}>{pickupLocation.address}</Text>
                <Text style={styles.routeContact}>
                  {pickupLocation.contactName} • {pickupLocation.contactPhone}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeItem}>
              <View style={styles.routeIconContainer}>
                <Ionicons name="flag" size={20} color="#e74c3c" />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Dropoff</Text>
                <Text style={styles.routeAddress}>{dropoffLocation.address}</Text>
                <Text style={styles.routeContact}>
                  {dropoffLocation.contactName} • {dropoffLocation.contactPhone}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Package Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="cube" size={20} color="#666" />
              <Text style={styles.infoLabel}>Size:</Text>
              <Text style={styles.infoValue}>{packageSize.charAt(0).toUpperCase() + packageSize.slice(1)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={20} color="#666" />
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>{packageDescription}</Text>
            </View>

            {packageWeight && (
              <View style={styles.infoRow}>
                <Ionicons name="barbell" size={20} color="#666" />
                <Text style={styles.infoLabel}>Weight:</Text>
                <Text style={styles.infoValue}>{packageWeight} kg</Text>
              </View>
            )}

            {specialInstructions && (
              <View style={styles.infoRow}>
                <Ionicons name="information-circle" size={20} color="#666" />
                <Text style={styles.infoLabel}>Instructions:</Text>
                <Text style={styles.infoValue}>{specialInstructions}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#2ecc71" />
          <Text style={styles.infoBannerText}>
            Your package is insured up to ₦50,000
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
          onPress={handleConfirmOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirm & Find Courier</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  scrollView: {
    flex: 1,
  },
  totalPriceCard: {
    backgroundColor: '#14b8a6',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  totalPriceSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  surgeRow: {
    backgroundColor: '#fff3e0',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  surgeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  breakdownLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  breakdownValueTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14b8a6',
  },
  routeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  routeItem: {
    flexDirection: 'row',
  },
  routeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  routeContact: {
    fontSize: 12,
    color: '#666',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#e0e0e0',
    marginLeft: 19,
    marginVertical: 8,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 12,
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
    marginLeft: 12,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
});

export default PriceEstimateScreen;
