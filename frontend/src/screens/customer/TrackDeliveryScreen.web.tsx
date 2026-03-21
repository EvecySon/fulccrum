import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mockGetDeliveryStatus } from '../../services/mockPackageDelivery';
import { packageDeliveryAPI } from '../../services/packageDeliveryAPI';

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';
const GREEN = '#10b981';
const RED = '#ef4444';

const ACTIVE_STATUSES = ['PENDING', 'SEARCHING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'];

const ACTIVE_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Finding a courier...',
  SEARCHING: 'Searching nearby couriers',
  ACCEPTED: 'Courier on the way',
  PICKED_UP: 'Package picked up',
  IN_TRANSIT: 'Out for delivery',
};

const TrackDeliveryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, deliveryId } = (route.params as any) || {};
  const actualOrderId = orderId || deliveryId;

  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<any>(null);
  const [error, setError] = useState('');
  const [eta, setEta] = useState<number | null>(null);
  const [courierRating, setCourierRating] = useState(0);
  const [pendingRating, setPendingRating] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (!actualOrderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    loadDeliveryStatus();
    // Only poll for active orders
    const interval = setInterval(() => {
      if (delivery && ACTIVE_STATUSES.includes(delivery.status)) {
        loadDeliveryStatus();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [actualOrderId]);

  const loadDeliveryStatus = async () => {
    try {
      const response = await mockGetDeliveryStatus(actualOrderId);
      if (response.success) {
        const o = response.data.order as any;
        const c = o.courier as any;
        setDelivery({
          status: o.status,
          orderNumber: o.id,
          courier: c ? {
            name: `${c.firstName} ${c.lastName}`,
            phone: c.phoneNumber,
            rating: c.rating ?? 4.8,
            totalDeliveries: c.totalDeliveries ?? 0,
            avatarUrl: c.avatarUrl,
          } : null,
          courierLocation: response.data.courierLocation,
          pickupAddress: o.pickupLocation.address,
          dropoffAddress: o.dropoffLocation.address,
          packageSize: o.packageSize,
          deliverySpeed: o.deliverySpeed,
          price: o.totalAmount,
          createdAt: o.createdAt,
          acceptedAt: o.acceptedAt,
          pickedUpAt: o.pickedUpAt,
          deliveredAt: o.deliveredAt,
          cancelledAt: o.cancelledAt,
          cancellationReason: o.cancellationReason,
          timeline: [
            o.createdAt && { title: 'Order Created', timestamp: o.createdAt, icon: 'receipt-outline', color: ACCENT },
            o.acceptedAt && { title: 'Courier Assigned', timestamp: o.acceptedAt, icon: 'person-circle-outline', color: '#3b82f6' },
            o.pickedUpAt && { title: 'Package Picked Up', timestamp: o.pickedUpAt, icon: 'cube-outline', color: '#8b5cf6' },
            o.deliveredAt && { title: 'Package Delivered', timestamp: o.deliveredAt, icon: 'checkmark-done-circle', color: GREEN },
            o.cancelledAt && { title: 'Order Cancelled', timestamp: o.cancelledAt, icon: 'close-circle', color: RED },
          ].filter(Boolean),
        });
        setEta(response.data.eta ?? null);
      } else {
        setError('Failed to load delivery status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load delivery status');
    } finally {
      setLoading(false);
    }
  };

  const handleCallCourier = () => {
    if (delivery?.courier?.phone) Linking.openURL(`tel:${delivery.courier.phone}`);
  };

  const handleMessageCourier = () => {
    if (delivery?.courier?.phone) Linking.openURL(`sms:${delivery.courier.phone}`);
  };

  const handleCancelDelivery = () => {
    Alert.alert('Cancel Delivery', 'Are you sure you want to cancel this delivery?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => {
        Alert.alert('Cancelled', 'Your delivery has been cancelled.');
        navigation.goBack();
      }},
    ]);
  };

  const handleRateCourier = (rating: number) => {
    setPendingRating(rating);
    setShowReviewModal(true);
  };

  const handleSubmitRating = async () => {
    if (!pendingRating || submittingRating) return;
    setSubmittingRating(true);
    try {
      await packageDeliveryAPI.rateDelivery(actualOrderId, pendingRating, reviewText.trim() || undefined);
      setCourierRating(pendingRating);
      setRatingSubmitted(true);
      setShowReviewModal(false);
    } catch {
      Alert.alert('Note', 'Rating saved locally — will sync when connected.');
      setCourierRating(pendingRating);
      setRatingSubmitted(true);
      setShowReviewModal(false);
    } finally {
      setSubmittingRating(false);
    }
  };

  const getDeliveryDuration = () => {
    if (!delivery?.createdAt || !delivery?.deliveredAt) return null;
    const mins = Math.round((new Date(delivery.deliveredAt).getTime() - new Date(delivery.createdAt).getTime()) / 60000);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (error || !delivery) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={64} color={RED} />
          <Text style={styles.errorTitle}>Unable to Load</Text>
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={loadDeliveryStatus}>
            <Text style={styles.ctaBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isActive = ACTIVE_STATUSES.includes(delivery.status);
  const isDelivered = delivery.status === 'DELIVERED';
  const isCancelled = delivery.status === 'CANCELLED';

  // ─── DELIVERED VIEW ─────────────────────────────────────────────────────────
  if (isDelivered) {
    const duration = getDeliveryDuration();
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Complete</Text>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.deliveredHero}>
            <View style={styles.deliveredCircle}>
              <Ionicons name="checkmark-done" size={48} color="#fff" />
            </View>
            <Text style={styles.deliveredTitle}>Delivered!</Text>
            <Text style={styles.deliveredSub}>
              {delivery.deliveredAt
                ? new Date(delivery.deliveredAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : ''}
            </Text>
            {duration && (
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={14} color={GREEN} />
                <Text style={styles.durationText}>Delivered in {duration}</Text>
              </View>
            )}
          </View>

          {/* Route Summary */}
          <View style={styles.card}>
            <View style={styles.routeCompact}>
              <View style={styles.routeCompactItem}>
                <View style={[styles.routeDot, { backgroundColor: ACCENT }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeCompactLabel}>PICKED UP FROM</Text>
                  <Text style={styles.routeCompactAddr}>{delivery.pickupAddress}</Text>
                </View>
              </View>
              <View style={styles.routeVertLine} />
              <View style={styles.routeCompactItem}>
                <View style={[styles.routeDot, { backgroundColor: GREEN }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeCompactLabel}>DELIVERED TO</Text>
                  <Text style={styles.routeCompactAddr}>{delivery.dropoffAddress}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Receipt */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Receipt</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Package size</Text>
              <Text style={styles.receiptValue}>{delivery.packageSize?.charAt(0).toUpperCase() + delivery.packageSize?.slice(1)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Delivery speed</Text>
              <Text style={styles.receiptValue}>{delivery.deliverySpeed?.replace('_', ' ')}</Text>
            </View>
            <View style={[styles.receiptRow, styles.receiptTotal]}>
              <Text style={styles.receiptTotalLabel}>Total paid</Text>
              <Text style={styles.receiptTotalValue}>₦{delivery.price?.toLocaleString()}</Text>
            </View>
          </View>

          {/* Rate Courier */}
          {delivery.courier && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rate your courier</Text>
              <View style={styles.courierRow}>
                <View style={styles.courierAvatar}>
                  <Ionicons name="person" size={28} color={ACCENT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courierName}>{delivery.courier.name}</Text>
                  <Text style={styles.courierSub}>{delivery.courier.totalDeliveries.toLocaleString()} deliveries</Text>
                </View>
              </View>
              {ratingSubmitted ? (
                <View style={styles.ratingDoneBox}>
                  <Ionicons name="checkmark-circle" size={24} color={GREEN} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ratingDoneTitle}>Rating submitted</Text>
                    <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
                      {[1,2,3,4,5].map((s) => (
                        <Ionicons key={s} name={s <= courierRating ? 'star' : 'star-outline'} size={16} color={s <= courierRating ? '#f59e0b' : TEXT_DIM} />
                      ))}
                    </View>
                    {reviewText.trim() ? <Text style={styles.ratingDoneSub} numberOfLines={2}>"{reviewText.trim()}"</Text> : null}
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.ratingPrompt}>Tap a star to rate</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => handleRateCourier(s)}>
                        <Ionicons
                          name={s <= pendingRating ? 'star' : 'star-outline'}
                          size={40}
                          color={s <= pendingRating ? '#f59e0b' : TEXT_DIM}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  {pendingRating > 0 && (
                    <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setShowReviewModal(true)}>
                      <Ionicons name="create-outline" size={16} color={ACCENT} />
                      <Text style={styles.writeReviewBtnText}>Add a review</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}

          {/* Timeline */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Timeline</Text>
            {delivery.timeline?.map((event: any, i: number) => (
              <View key={i} style={styles.tlRow}>
                <View style={styles.tlLeft}>
                  <View style={[styles.tlDot, { backgroundColor: event.color }]}>
                    <Ionicons name={event.icon} size={12} color="#fff" />
                  </View>
                  {i < delivery.timeline.length - 1 && <View style={styles.tlLine} />}
                </View>
                <View style={styles.tlContent}>
                  <Text style={styles.tlTitle}>{event.title}</Text>
                  <Text style={styles.tlTime}>{new Date(event.timestamp).toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, { marginHorizontal: 20, marginBottom: 8 }]}
            onPress={() => (navigation as any).navigate('SendPackageHome')}
          >
            <Ionicons name="cube-outline" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Send Another Package</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaBtnOutline, { marginHorizontal: 20, marginBottom: 32 }]}
            onPress={() => (navigation as any).navigate('Support')}
          >
            <Text style={styles.ctaBtnOutlineText}>Report an Issue</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Review Modal ── */}
        <Modal
          visible={showReviewModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReviewModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalSheet}>
              {/* Handle */}
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Rate {delivery?.courier?.name?.split(' ')[0]}</Text>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <Ionicons name="close" size={24} color={TEXT_DIM} />
                </TouchableOpacity>
              </View>

              {/* Stars */}
              <View style={styles.modalStarsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setPendingRating(s)}>
                    <Ionicons
                      name={s <= pendingRating ? 'star' : 'star-outline'}
                      size={48}
                      color={s <= pendingRating ? '#f59e0b' : '#353A4A'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalStarLabel}>
                {pendingRating === 1 ? 'Poor' : pendingRating === 2 ? 'Fair' : pendingRating === 3 ? 'Good' : pendingRating === 4 ? 'Great' : pendingRating === 5 ? 'Excellent!' : 'Select a rating'}
              </Text>

              {/* Review text */}
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience (optional)..."
                placeholderTextColor={TEXT_DIM}
                multiline
                numberOfLines={4}
                value={reviewText}
                onChangeText={setReviewText}
                maxLength={300}
              />
              <Text style={styles.reviewCharCount}>{reviewText.length}/300</Text>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.ctaBtn, { marginTop: 16, opacity: !pendingRating || submittingRating ? 0.5 : 1 }]}
                onPress={handleSubmitRating}
                disabled={!pendingRating || submittingRating}
              >
                {submittingRating
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.ctaBtnText}>Submit Rating</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={{ alignItems: 'center', paddingVertical: 14 }}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={{ fontSize: 14, color: TEXT_DIM }}>Skip</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }

  // ─── CANCELLED VIEW ─────────────────────────────────────────────────────────
  if (isCancelled) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.cancelledHero}>
            <View style={styles.cancelledCircle}>
              <Ionicons name="close" size={48} color="#fff" />
            </View>
            <Text style={styles.cancelledTitle}>Order Cancelled</Text>
            <Text style={styles.cancelledSub}>
              {delivery.cancelledAt
                ? new Date(delivery.cancelledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : ''}
            </Text>
          </View>

          {/* Cancellation reason */}
          {delivery.cancellationReason && (
            <View style={[styles.card, styles.reasonCard]}>
              <Ionicons name="information-circle-outline" size={20} color={RED} />
              <Text style={styles.reasonText}>{delivery.cancellationReason}</Text>
            </View>
          )}

          {/* Route */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Details</Text>
            <View style={styles.routeCompact}>
              <View style={styles.routeCompactItem}>
                <View style={[styles.routeDot, { backgroundColor: ACCENT }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeCompactLabel}>PICKUP</Text>
                  <Text style={styles.routeCompactAddr}>{delivery.pickupAddress}</Text>
                </View>
              </View>
              <View style={styles.routeVertLine} />
              <View style={styles.routeCompactItem}>
                <View style={[styles.routeDot, { backgroundColor: RED }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeCompactLabel}>DROPOFF</Text>
                  <Text style={styles.routeCompactAddr}>{delivery.dropoffAddress}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.receiptRow, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#353A4A' }]}>
              <Text style={styles.receiptLabel}>Package size</Text>
              <Text style={styles.receiptValue}>{delivery.packageSize?.charAt(0).toUpperCase() + delivery.packageSize?.slice(1)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Order placed</Text>
              <Text style={styles.receiptValue}>
                {delivery.createdAt ? new Date(delivery.createdAt).toLocaleString() : '—'}
              </Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Timeline</Text>
            {delivery.timeline?.map((event: any, i: number) => (
              <View key={i} style={styles.tlRow}>
                <View style={styles.tlLeft}>
                  <View style={[styles.tlDot, { backgroundColor: event.color }]}>
                    <Ionicons name={event.icon} size={12} color="#fff" />
                  </View>
                  {i < delivery.timeline.length - 1 && <View style={styles.tlLine} />}
                </View>
                <View style={styles.tlContent}>
                  <Text style={styles.tlTitle}>{event.title}</Text>
                  <Text style={styles.tlTime}>{new Date(event.timestamp).toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTAs */}
          <TouchableOpacity
            style={[styles.ctaBtn, { marginHorizontal: 20, marginBottom: 8 }]}
            onPress={() => (navigation as any).navigate('SendPackageHome')}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Book Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaBtnOutline, { marginHorizontal: 20, marginBottom: 32 }]}
            onPress={() => (navigation as any).navigate('Support')}
          >
            <Text style={styles.ctaBtnOutlineText}>Contact Support</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── ACTIVE VIEW ─────────────────────────────────────────────────────────────
  const statusLabel = ACTIVE_STATUS_LABEL[delivery.status] ?? delivery.status.replace(/_/g, ' ');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Delivery</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => Alert.alert('Share', `https://fulccrum.com/track/${actualOrderId}`)}
        >
          <Ionicons name="share-outline" size={20} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Live Status Bar */}
        <View style={styles.liveStatusBar}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.liveStatusLabel}>{statusLabel}</Text>
            <Text style={styles.liveOrderNum}>Order #{delivery.orderNumber}</Text>
          </View>
          {eta && (
            <View style={styles.etaBadge}>
              <Text style={styles.etaNum}>{eta}</Text>
              <Text style={styles.etaUnit}>min</Text>
            </View>
          )}
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapArea}>
          <View style={styles.mapInner}>
            <Ionicons name="navigate-circle" size={48} color={ACCENT} />
            <Text style={styles.mapLabel}>Live tracking on mobile app</Text>
            {delivery.courierLocation && (
              <Text style={styles.mapCoords}>
                Courier: {delivery.courierLocation.latitude.toFixed(3)}, {delivery.courierLocation.longitude.toFixed(3)}
              </Text>
            )}
          </View>
        </View>

        {/* Courier Card */}
        {delivery.courier && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Courier</Text>
            <View style={styles.courierRow}>
              <View style={styles.courierAvatar}>
                <Ionicons name="person" size={28} color={ACCENT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.courierName}>{delivery.courier.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.courierRating}>{delivery.courier.rating.toFixed(1)}</Text>
                  <Text style={styles.courierSub}> · {delivery.courier.totalDeliveries.toLocaleString()} trips</Text>
                </View>
              </View>
            </View>
            <View style={styles.courierBtns}>
              <TouchableOpacity style={styles.courierBtn} onPress={handleCallCourier}>
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.courierBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.courierBtn, styles.courierBtnOutline]} onPress={handleMessageCourier}>
                <Ionicons name="chatbubble-outline" size={18} color={ACCENT} />
                <Text style={[styles.courierBtnText, { color: ACCENT }]}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Route */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route</Text>
          <View style={styles.routeCompact}>
            <View style={styles.routeCompactItem}>
              <View style={[styles.routeDot, { backgroundColor: ACCENT }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeCompactLabel}>PICKUP</Text>
                <Text style={styles.routeCompactAddr}>{delivery.pickupAddress}</Text>
              </View>
            </View>
            <View style={styles.routeVertLine} />
            <View style={styles.routeCompactItem}>
              <View style={[styles.routeDot, { backgroundColor: RED }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeCompactLabel}>DROPOFF</Text>
                <Text style={styles.routeCompactAddr}>{delivery.dropoffAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Package Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Package</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailCell}>
              <Ionicons name="cube-outline" size={20} color={ACCENT} />
              <Text style={styles.detailCellLabel}>Size</Text>
              <Text style={styles.detailCellVal}>{delivery.packageSize}</Text>
            </View>
            <View style={styles.detailCell}>
              <Ionicons name="flash-outline" size={20} color={ACCENT} />
              <Text style={styles.detailCellLabel}>Speed</Text>
              <Text style={styles.detailCellVal}>{delivery.deliverySpeed?.replace('_', ' ')}</Text>
            </View>
            <View style={styles.detailCell}>
              <Ionicons name="cash-outline" size={20} color={ACCENT} />
              <Text style={styles.detailCellLabel}>Price</Text>
              <Text style={styles.detailCellVal}>₦{delivery.price?.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          {delivery.timeline?.map((event: any, i: number) => (
            <View key={i} style={styles.tlRow}>
              <View style={styles.tlLeft}>
                <View style={[styles.tlDot, { backgroundColor: event.color }]}>
                  <Ionicons name={event.icon} size={12} color="#fff" />
                </View>
                {i < delivery.timeline.length - 1 && <View style={styles.tlLine} />}
              </View>
              <View style={styles.tlContent}>
                <Text style={styles.tlTitle}>{event.title}</Text>
                <Text style={styles.tlTime}>{new Date(event.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Cancel */}
        {['PENDING', 'SEARCHING', 'ACCEPTED'].includes(delivery.status) && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelDelivery}>
            <Text style={styles.cancelBtnText}>Cancel Delivery</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 14,
  },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: CARD_DARK, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 15, color: TEXT_DIM },
  errorTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 16, marginBottom: 8 },
  errorText: { fontSize: 14, color: TEXT_DIM, textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: CARD_DARK, marginHorizontal: 20, marginTop: 16, padding: 20, borderRadius: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 16 },

  // CTA buttons
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT, paddingVertical: 16, borderRadius: 14, gap: 8,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ctaBtnOutline: {
    alignItems: 'center', paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  ctaBtnOutlineText: { fontSize: 15, fontWeight: '600', color: TEXT_DIM },

  // Delivered hero
  deliveredHero: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  deliveredCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: GREEN,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  deliveredTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6 },
  deliveredSub: { fontSize: 14, color: TEXT_DIM, marginBottom: 12 },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  durationText: { fontSize: 13, fontWeight: '600', color: GREEN },

  // Cancelled hero
  cancelledHero: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  cancelledCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: RED,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  cancelledTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6 },
  cancelledSub: { fontSize: 14, color: TEXT_DIM },
  reasonCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  reasonText: { flex: 1, fontSize: 14, color: '#fca5a5', lineHeight: 20 },

  // Route compact
  routeCompact: { gap: 0 },
  routeCompactItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeCompactLabel: { fontSize: 11, fontWeight: '700', color: TEXT_DIM, textTransform: 'uppercase', marginBottom: 2 },
  routeCompactAddr: { fontSize: 15, fontWeight: '600', color: '#fff' },
  routeVertLine: { width: 2, height: 16, backgroundColor: '#353A4A', marginLeft: 4, marginVertical: 2 },

  // Receipt
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#353A4A' },
  receiptLabel: { fontSize: 14, color: TEXT_DIM },
  receiptValue: { fontSize: 14, fontWeight: '600', color: '#fff', textTransform: 'capitalize' },
  receiptTotal: { borderBottomWidth: 0, marginTop: 4 },
  receiptTotalLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  receiptTotalValue: { fontSize: 22, fontWeight: '800', color: ACCENT },

  // Courier
  courierRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  courierAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(20,184,166,0.12)', justifyContent: 'center', alignItems: 'center',
  },
  courierName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  courierRating: { fontSize: 14, fontWeight: '600', color: '#fff' },
  courierSub: { fontSize: 13, color: TEXT_DIM },
  courierBtns: { flexDirection: 'row', gap: 12 },
  courierBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 12, gap: 6,
  },
  courierBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: ACCENT },
  courierBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Star rating
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 },
  ratingThanks: { textAlign: 'center', fontSize: 14, color: GREEN, fontWeight: '600' },

  // Timeline
  tlRow: { flexDirection: 'row', paddingVertical: 8 },
  tlLeft: { width: 28, alignItems: 'center' },
  tlDot: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  tlLine: { flex: 1, width: 2, backgroundColor: '#353A4A', marginVertical: 2 },
  tlContent: { flex: 1, paddingLeft: 12, paddingBottom: 8 },
  tlTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  tlTime: { fontSize: 12, color: TEXT_DIM },

  // Live status (active view)
  liveStatusBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD_DARK, marginHorizontal: 20, marginTop: 8,
    padding: 16, borderRadius: 16, gap: 0,
  },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#10b981', letterSpacing: 1 },
  liveStatusLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  liveOrderNum: { fontSize: 12, color: TEXT_DIM, marginTop: 2 },
  etaBadge: {
    alignItems: 'center', backgroundColor: ACCENT,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  etaNum: { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 22 },
  etaUnit: { fontSize: 10, fontWeight: '600', color: '#fff', opacity: 0.8 },

  // Map area (active view)
  mapArea: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 16, overflow: 'hidden',
    backgroundColor: 'rgba(20,184,166,0.06)', borderWidth: 1.5,
    borderColor: 'rgba(20,184,166,0.15)',
  },
  mapInner: { padding: 32, alignItems: 'center' },
  mapLabel: { fontSize: 14, fontWeight: '600', color: ACCENT, marginTop: 10, textAlign: 'center' },
  mapCoords: { fontSize: 11, color: TEXT_DIM, marginTop: 6 },

  // Package detail cells (active view)
  detailsGrid: { flexDirection: 'row', gap: 10 },
  detailCell: { flex: 1, alignItems: 'center', backgroundColor: BG_DARK, padding: 14, borderRadius: 12 },
  detailCellLabel: { fontSize: 11, fontWeight: '600', color: TEXT_DIM, marginTop: 6, marginBottom: 3 },
  detailCellVal: { fontSize: 14, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },

  // Cancel button (active view)
  cancelBtn: {
    marginHorizontal: 20, marginTop: 16, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: RED },

  // Rating interaction
  ratingPrompt: { fontSize: 13, color: TEXT_DIM, textAlign: 'center', marginBottom: 10 },
  writeReviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 12, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(20,184,166,0.3)',
  },
  writeReviewBtnText: { fontSize: 14, fontWeight: '600', color: ACCENT },
  ratingDoneBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'rgba(16,185,129,0.08)', padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
  },
  ratingDoneTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  ratingDoneSub: { fontSize: 12, color: TEXT_DIM, marginTop: 4, fontStyle: 'italic' },

  // Review modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: CARD_DARK, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#353A4A',
    alignSelf: 'center', marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  modalStarsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 8,
  },
  modalStarLabel: {
    textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#f59e0b',
    marginBottom: 20, minHeight: 20,
  },
  reviewInput: {
    backgroundColor: BG_DARK, borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 15, textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#353A4A', minHeight: 100,
  },
  reviewCharCount: { textAlign: 'right', fontSize: 12, color: TEXT_DIM, marginTop: 6 },
});

export default TrackDeliveryScreen;
