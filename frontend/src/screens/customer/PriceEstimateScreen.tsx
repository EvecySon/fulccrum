import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { packageDeliveryAPI, PriceCalculation } from '../../services/packageDeliveryAPI';
import { showAlert } from '../../utils/alert';

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';
const STEPS = ['Route', 'Details', 'Confirm'];

const PriceEstimateScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    packageSize,
    pickupLocation,
    dropoffLocation,
    additionalStops,
    deliverySpeed,
    scheduledTime,
    packageDescription,
    packageWeight,
    dimensions,
    specialInstructions,
    packagePhoto,
    insuranceTier,
  } = (route.params as any) || {};

  const [pricing, setPricing] = useState<PriceCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'cash'>('wallet');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

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
      if (!pickupLocation?.lat || !pickupLocation?.lng || !dropoffLocation?.lat || !dropoffLocation?.lng) {
        console.error('Missing location data:', { pickupLocation, dropoffLocation });
        showAlert('Error', 'Location data is missing. Please go back and select locations again.');
        setIsLoading(false);
        return;
      }
      const response = await packageDeliveryAPI.calculatePrice({
        pickup: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        dropoff: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
        size: packageSize,
        speed: deliverySpeed,
        additionalStops: additionalStops?.map((s: any) => ({ lat: s.lat, lng: s.lng })),
        insuranceTier,
      });
      setPricing(response?.data || response);
    } catch (error) {
      console.error('Price calculation error:', error);
      showAlert('Error', 'Failed to calculate price. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    try {
      setIsValidatingPromo(true);
      const res: any = await packageDeliveryAPI.validatePromo(promoCode.trim());
      const data = res?.data || res;
      setPromoResult(data);
    } catch {
      setPromoResult({ valid: false, discount: 0, message: 'Could not validate promo code' });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const promoDiscount = promoResult?.valid && pricing
    ? parseFloat(((pricing.totalPrice * promoResult.discount) / 100).toFixed(2))
    : 0;
  const finalTotal = pricing ? parseFloat((pricing.totalPrice - promoDiscount).toFixed(2)) : 0;

  const handleConfirmOrder = async () => {
    try {
      setIsSubmitting(true);
      const response = await packageDeliveryAPI.requestDelivery({
        pickupLocation,
        dropoffLocation,
        additionalStops,
        packageSize,
        deliverySpeed,
        scheduledTime,
        packageDescription,
        packageWeight,
        dimensions,
        specialInstructions,
        paymentMethod,
        promoCode: promoResult?.valid ? promoCode.trim() : undefined,
        insuranceTier,
      });
      const result = response?.data || response;
      (navigation as any).navigate('FindingCourier', {
        orderId: result.orderId,
        requestId: result.requestId,
        estimatedPrice: result.estimatedPrice,
        expiresAt: result.expiresAt,
      });
    } catch (error: any) {
      console.error('Request delivery error:', error);
      showAlert(
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
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Calculating price...</Text>
      </View>
    );
  }

  if (!pricing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleDone]}>
                {i < 2 ? (
                  <Ionicons name="checkmark" size={14} color={BG_DARK} />
                ) : (
                  <Text style={styles.stepNumDone}>{i + 1}</Text>
                )}
              </View>
              <Text style={styles.stepLabelActive}>{step}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, styles.stepLineDone]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Price Card */}
        <View style={styles.totalPriceCard}>
          <Text style={styles.totalPriceLabel}>Total Delivery Cost</Text>
          <Text style={styles.totalPrice}>{'\u20A6'}{finalTotal.toLocaleString()}</Text>
          <Text style={styles.totalPriceSub}>
            {pricing.distance.toFixed(1)} km{pricing.stopCount > 0 ? ` • ${pricing.stopCount} stop${pricing.stopCount > 1 ? 's' : ''}` : ''} • {deliverySpeed === 'express' ? '30-60 min' : '2-4 hours'}
          </Text>
          {promoDiscount > 0 && (
            <View style={styles.promoBadge}>
              <Ionicons name="pricetag" size={12} color="#22c55e" />
              <Text style={styles.promoBadgeText}>You save {'\u20A6'}{promoDiscount.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Base Fee</Text>
              <Text style={styles.breakdownValue}>{'\u20A6'}{pricing.breakdown.base.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Distance ({pricing.distance.toFixed(1)} km)</Text>
              <Text style={styles.breakdownValue}>{'\u20A6'}{pricing.breakdown.distance.toLocaleString()}</Text>
            </View>
            {pricing.breakdown.sizeAdjustment > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Package Size (+{pricing.breakdown.sizeAdjustment.toFixed(0)}%)</Text>
                <Text style={styles.breakdownValue}>
                  {'\u20A6'}{((pricing.totalPrice / (1 + pricing.breakdown.sizeAdjustment / 100)) * (pricing.breakdown.sizeAdjustment / 100)).toFixed(0)}
                </Text>
              </View>
            )}
            {pricing.breakdown.speedAdjustment > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Express (+{pricing.breakdown.speedAdjustment.toFixed(0)}%)</Text>
                <Text style={styles.breakdownValue}>
                  {'\u20A6'}{((pricing.totalPrice / (1 + pricing.breakdown.speedAdjustment / 100)) * (pricing.breakdown.speedAdjustment / 100)).toFixed(0)}
                </Text>
              </View>
            )}
            {pricing.breakdown.surgeAdjustment > 0 && (
              <View style={[styles.breakdownRow, styles.surgeRow]}>
                <View style={styles.surgeLabel}>
                  <Ionicons name="flash" size={14} color="#f59e0b" />
                  <Text style={[styles.breakdownLabel, { color: '#f59e0b', marginLeft: 4 }]}>
                    Surge (+{pricing.breakdown.surgeAdjustment.toFixed(0)}%)
                  </Text>
                </View>
                <Text style={[styles.breakdownValue, { color: '#f59e0b' }]}>
                  {'\u20A6'}{((pricing.totalPrice / (1 + pricing.breakdown.surgeAdjustment / 100)) * (pricing.breakdown.surgeAdjustment / 100)).toFixed(0)}
                </Text>
              </View>
            )}
            {(pricing.breakdown.stops || 0) > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Additional Stops ({pricing.stopCount})</Text>
                <Text style={styles.breakdownValue}>{'\u20A6'}{pricing.breakdown.stops.toLocaleString()}</Text>
              </View>
            )}
            {(pricing.breakdown.insurance || 0) > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Insurance ({pricing.insuranceTier})</Text>
                <Text style={styles.breakdownValue}>{'\u20A6'}{pricing.breakdown.insurance.toLocaleString()}</Text>
              </View>
            )}
            {promoDiscount > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: '#22c55e' }]}>Promo Discount (-{promoResult!.discount}%)</Text>
                <Text style={[styles.breakdownValue, { color: '#22c55e' }]}>-{'\u20A6'}{promoDiscount.toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelTotal}>Total</Text>
              <Text style={styles.breakdownValueTotal}>{'\u20A6'}{finalTotal.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Route Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <View style={[styles.routeIconWrap, { backgroundColor: 'rgba(20,184,166,0.12)' }]}>
                <Ionicons name="location" size={18} color={ACCENT} />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Collect from</Text>
                <Text style={styles.routeAddress}>{pickupLocation.address}</Text>
                <Text style={styles.routeContact}>
                  {pickupLocation.contactName} • {pickupLocation.contactPhone}
                </Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeItem}>
              <View style={[styles.routeIconWrap, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                <Ionicons name="flag" size={18} color="#ef4444" />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Delivery to</Text>
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
          <Text style={styles.sectionTitle}>Package Info</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={18} color={ACCENT} />
              <Text style={styles.infoLabel}>Size</Text>
              <Text style={styles.infoValue}>{packageSize.charAt(0).toUpperCase() + packageSize.slice(1)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={18} color={ACCENT} />
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{packageDescription}</Text>
            </View>
            {packageWeight && (
              <View style={styles.infoRow}>
                <Ionicons name="barbell-outline" size={18} color={ACCENT} />
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{packageWeight} kg</Text>
              </View>
            )}
            {dimensions && (dimensions.length || dimensions.width || dimensions.height) && (
              <View style={styles.infoRow}>
                <Ionicons name="resize-outline" size={18} color={ACCENT} />
                <Text style={styles.infoLabel}>Dimensions</Text>
                <Text style={styles.infoValue}>
                  {[dimensions.length && `L${dimensions.length}`, dimensions.width && `W${dimensions.width}`, dimensions.height && `H${dimensions.height}`].filter(Boolean).join(' × ')} cm
                </Text>
              </View>
            )}
            {scheduledTime && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color={ACCENT} />
                <Text style={styles.infoLabel}>Scheduled</Text>
                <Text style={styles.infoValue}>
                  {new Date(scheduledTime).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
            {specialInstructions && (
              <View style={styles.infoRow}>
                <Ionicons name="chatbubble-outline" size={18} color={ACCENT} />
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.infoValue}>{specialInstructions}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              placeholderTextColor={TEXT_DIM}
              value={promoCode}
              onChangeText={(t) => { setPromoCode(t); setPromoResult(null); }}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.promoBtn, (!promoCode.trim() || isValidatingPromo) && styles.promoBtnDisabled]}
              onPress={handleValidatePromo}
              disabled={!promoCode.trim() || isValidatingPromo}
            >
              {isValidatingPromo ? (
                <ActivityIndicator size="small" color={BG_DARK} />
              ) : (
                <Text style={styles.promoBtnText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
          {promoResult && (
            <View style={[styles.promoFeedback, promoResult.valid ? styles.promoFeedbackValid : styles.promoFeedbackInvalid]}>
              <Ionicons name={promoResult.valid ? 'checkmark-circle' : 'close-circle'} size={16} color={promoResult.valid ? '#22c55e' : '#ef4444'} />
              <Text style={[styles.promoFeedbackText, { color: promoResult.valid ? '#22c55e' : '#ef4444' }]}>{promoResult.message}</Text>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            {[
              { id: 'wallet' as const, icon: 'wallet-outline', label: 'Wallet', sub: 'Pay from balance' },
              { id: 'card' as const, icon: 'card-outline', label: 'Card', sub: 'Debit/Credit card' },
              { id: 'cash' as const, icon: 'cash-outline', label: 'Cash', sub: 'Pay on delivery' },
            ].map(pm => (
              <TouchableOpacity
                key={pm.id}
                style={[styles.paymentCard, paymentMethod === pm.id && styles.paymentCardSelected]}
                onPress={() => setPaymentMethod(pm.id)}
              >
                <View style={[styles.paymentIcon, paymentMethod === pm.id && styles.paymentIconSelected]}>
                  <Ionicons name={pm.icon as any} size={20} color={paymentMethod === pm.id ? BG_DARK : ACCENT} />
                </View>
                <Text style={[styles.paymentTitle, paymentMethod === pm.id && styles.paymentTitleSelected]}>{pm.label}</Text>
                <Text style={styles.paymentSub}>{pm.sub}</Text>
                {paymentMethod === pm.id && (
                  <View style={styles.paymentCheck}>
                    <Ionicons name="checkmark" size={12} color={BG_DARK} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Insurance Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={18} color={ACCENT} />
          <Text style={styles.infoBannerText}>
            {insuranceTier ? `${insuranceTier.charAt(0).toUpperCase() + insuranceTier.slice(1)} insurance — up to ${pricing.insuranceCoverage ? '\u20A6' + pricing.insuranceCoverage.toLocaleString() : '\u20A650,000'}` : 'Insured up to \u20A650,000'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && styles.confirmBtnDisabled]}
          onPress={handleConfirmOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={BG_DARK} />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Confirm & Find Courier</Text>
              <Ionicons name="arrow-forward" size={20} color={BG_DARK} />
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
    backgroundColor: BG_DARK,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_DARK,
  },
  loadingText: {
    fontSize: 16,
    color: TEXT_DIM,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_DARK,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: ACCENT,
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
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#353A4A',
    marginBottom: 6,
  },
  stepCircleDone: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  stepNumDone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  stepLabelActive: {
    fontSize: 11,
    fontWeight: '600',
    color: ACCENT,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#353A4A',
    marginBottom: 20,
    marginHorizontal: 8,
  },
  stepLineDone: {
    backgroundColor: ACCENT,
  },
  scrollView: {
    flex: 1,
  },
  totalPriceCard: {
    backgroundColor: CARD_DARK,
    marginHorizontal: 20,
    marginBottom: 22,
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.2)',
  },
  totalPriceLabel: {
    fontSize: 13,
    color: TEXT_DIM,
    fontWeight: '600',
    marginBottom: 6,
  },
  totalPrice: {
    fontSize: 44,
    fontWeight: '800',
    color: ACCENT,
    marginBottom: 6,
  },
  totalPriceSub: {
    fontSize: 14,
    color: TEXT_DIM,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  breakdownCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  breakdownLabel: {
    fontSize: 14,
    color: TEXT_DIM,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  surgeRow: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
  },
  surgeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#353A4A',
    marginVertical: 8,
  },
  breakdownLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  breakdownValueTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: ACCENT,
  },
  routeCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 16,
  },
  routeItem: {
    flexDirection: 'row',
  },
  routeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_DIM,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  routeContact: {
    fontSize: 12,
    color: TEXT_DIM,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#353A4A',
    marginLeft: 18,
    marginVertical: 6,
  },
  infoCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DIM,
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  paymentCardSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(20,184,166,0.06)',
  },
  paymentIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(20,184,166,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentIconSelected: {
    backgroundColor: ACCENT,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  paymentTitleSelected: {
    color: ACCENT,
  },
  paymentSub: {
    fontSize: 12,
    color: TEXT_DIM,
    textAlign: 'center',
  },
  paymentCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,184,166,0.06)',
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.15)',
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: ACCENT,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    backgroundColor: BG_DARK,
  },
  confirmBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnDisabled: {
    backgroundColor: CARD_DARK,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 6,
  },
  promoBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#22c55e',
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    height: 48,
    backgroundColor: CARD_DARK,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
  },
  promoBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBtnDisabled: {
    backgroundColor: CARD_DARK,
  },
  promoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: BG_DARK,
  },
  promoFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  promoFeedbackValid: {
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  promoFeedbackInvalid: {
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  promoFeedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PriceEstimateScreen;
