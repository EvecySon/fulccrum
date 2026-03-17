import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { reviewsAPI, ordersAPI } from '../../services/api';

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';

const feedbackTags = ['Fast Delivery', 'Great Food', 'Good Packaging', 'Friendly Courier', 'Hot & Fresh', 'Accurate Order'];

const getRatingLabel = (r: number) =>
  r === 5 ? 'Excellent!' : r === 4 ? 'Great!' : r === 3 ? 'Good' : r === 2 ? 'Fair' : 'Poor';

export default function FeedbackScreen({ navigation, route }: any) {
  const order = route?.params?.order;
  const orderId = order?.id || route?.params?.orderId;

  const [orderData, setOrderData] = useState<any>(order || null);
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(!order);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  useEffect(() => {
    if (order) { setLoadingOrder(false); return; }
    if (orderId) {
      (async () => {
        try {
          const res = await ordersAPI.getOrder(orderId);
          if (res) setOrderData(res);
        } catch { /* ignore */ }
        setLoadingOrder(false);
      })();
    } else {
      // Opened from Account tab without a specific order — fetch last delivered
      (async () => {
        try {
          const res = await ordersAPI.getMyOrders(1, 20);
          const orders = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          const lastDelivered = orders.find((o: any) => o.status === 'delivered');
          if (lastDelivered) setOrderData(lastDelivered);
        } catch { /* ignore */ }
        setLoadingOrder(false);
      })();
    }
  }, [orderId]);

  const restaurantName = orderData?.business?.businessName || orderData?.restaurantName || orderData?.businessName || 'Restaurant';
  const orderNumber = orderData?.orderNumber || orderId?.slice(-6) || '';
  const orderDate = orderData?.deliveredAt || orderData?.createdAt;
  const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const driverName = orderData?.driver?.firstName || orderData?.driverName || '';

  const handleSubmit = async () => {
    if (foodRating === 0) {
      Alert.alert('Rating Required', 'Please rate the food before submitting.');
      return;
    }
    const resolvedOrderId = orderId || orderData?.id;
    if (!resolvedOrderId) {
      Alert.alert('Error', 'No order to review.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsAPI.create({
        orderId: resolvedOrderId,
        rating: foodRating,
        foodQuality: foodRating,
        deliverySpeed: deliveryRating || undefined,
        serviceQuality: deliveryRating || undefined,
        comment: comment || undefined,
        images: photos.length > 0 ? photos : undefined,
      });
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Could not submit review';
      Alert.alert('Error', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const renderStars = (rating: number, setRating: (n: number) => void) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={36}
            color={star <= rating ? '#f59e0b' : '#353A4A'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Order</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {loadingOrder ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color={ACCENT} />
            <Text style={{ color: TEXT_DIM, marginTop: 12, fontSize: 14 }}>Loading order...</Text>
          </View>
        ) : !orderData ? (
          <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 }}>
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(20,184,166,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="receipt-outline" size={44} color={ACCENT} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 20 }}>No Orders to Rate</Text>
            <Text style={{ fontSize: 14, color: TEXT_DIM, textAlign: 'center', marginTop: 10, lineHeight: 20 }}>
              You don't have any delivered orders yet. Place an order first, and come back to rate it after delivery!
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, marginTop: 28 }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <View>
        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Ionicons name="storefront" size={20} color={ACCENT} />
          <View style={styles.orderDetails}>
            <Text style={styles.orderRestaurant}>{restaurantName}</Text>
            <Text style={styles.orderId}>
              {orderNumber ? `Order #${orderNumber}` : 'Order'}{formattedDate ? ` · ${formattedDate}` : ''}
            </Text>
          </View>
        </View>

        {/* Food Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>How was the food?</Text>
          {renderStars(foodRating, setFoodRating)}
          {foodRating > 0 && (
            <Text style={styles.ratingLabel}>{getRatingLabel(foodRating)}</Text>
          )}
        </View>

        {/* Delivery Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>How was the delivery?</Text>
          {renderStars(deliveryRating, setDeliveryRating)}
          {deliveryRating > 0 && (
            <Text style={styles.ratingLabel}>{getRatingLabel(deliveryRating)}</Text>
          )}
        </View>

        {/* Tags */}
        <View style={styles.tagsCard}>
          <Text style={styles.tagsTitle}>What did you like?</Text>
          <View style={styles.tagsGrid}>
            {feedbackTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                onPress={() => toggleTag(tag)}
              >
                <Ionicons
                  name={selectedTags.includes(tag) ? 'checkmark-circle' : 'add-circle-outline'}
                  size={16}
                  color={selectedTags.includes(tag) ? '#fff' : ACCENT}
                />
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.commentCard}>
          <Text style={styles.commentTitle}>Additional Comments</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us more about your experience..."
            placeholderTextColor={TEXT_DIM}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Photo Upload */}
        {photos.length > 0 && (
          <View style={styles.photosRow}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.photoRemove}
                  onPress={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={22} color={ACCENT} />
          <Text style={styles.photoBtnText}>{photos.length > 0 ? 'Add Another Photo' : 'Add Photo'}</Text>
        </TouchableOpacity>

        {/* Tip Courier */}
        {driverName ? (
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="heart-outline" size={20} color="#ef4444" />
              <Text style={styles.tipTitle}>Tip Your Courier</Text>
            </View>
            <Text style={styles.tipDesc}>{driverName} delivered your order. Show your appreciation!</Text>
            <View style={styles.tipOptions}>
              {[0, 200, 500, 1000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.tipOption, tipAmount === amount && styles.tipOptionActive]}
                  onPress={() => setTipAmount(amount)}
                >
                  <Text style={[styles.tipOptionText, tipAmount === amount && styles.tipOptionTextActive]}>
                    {amount === 0 ? 'No tip' : `₦${amount}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.customTipBtn}>
              <Text style={styles.customTipText}>Custom amount</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
        </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      {orderData && <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Review</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: CARD_DARK,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  orderInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_DARK, borderRadius: 14,
    padding: 14, marginBottom: 12, gap: 12,
  },
  orderDetails: { flex: 1 },
  orderRestaurant: { fontSize: 16, fontWeight: '700', color: '#fff' },
  orderId: { fontSize: 12, color: TEXT_DIM, marginTop: 2 },
  ratingCard: { backgroundColor: CARD_DARK, borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center' },
  ratingTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 14 },
  starsRow: { flexDirection: 'row', gap: 8 },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: ACCENT, marginTop: 8 },
  tagsCard: { backgroundColor: CARD_DARK, borderRadius: 16, padding: 16, marginBottom: 12 },
  tagsTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 12 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, backgroundColor: 'rgba(20,184,166,0.08)', borderWidth: 1, borderColor: 'rgba(20,184,166,0.2)', gap: 6,
  },
  tagActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  tagText: { fontSize: 13, fontWeight: '600', color: ACCENT },
  tagTextActive: { color: '#fff' },
  commentCard: { backgroundColor: CARD_DARK, borderRadius: 16, padding: 16, marginBottom: 12 },
  commentTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 10 },
  commentInput: {
    backgroundColor: BG_DARK, borderRadius: 12, padding: 14, fontSize: 14,
    color: '#fff', minHeight: 100,
  },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(20,184,166,0.08)', borderRadius: 14, padding: 14, marginBottom: 12, gap: 8,
    borderWidth: 1.5, borderColor: 'rgba(20,184,166,0.2)', borderStyle: 'dashed',
  },
  photoBtnText: { fontSize: 15, fontWeight: '600', color: ACCENT },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  photoThumb: { position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden' },
  photoImage: { width: 80, height: 80, borderRadius: 12 },
  photoRemove: { position: 'absolute', top: -4, right: -4, backgroundColor: CARD_DARK, borderRadius: 10 },
  tipCard: { backgroundColor: CARD_DARK, borderRadius: 16, padding: 16, marginBottom: 12 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  tipDesc: { fontSize: 13, color: TEXT_DIM, marginBottom: 12 },
  tipOptions: { flexDirection: 'row', gap: 8 },
  tipOption: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12,
    backgroundColor: BG_DARK,
  },
  tipOptionActive: { backgroundColor: ACCENT },
  tipOptionText: { fontSize: 14, fontWeight: '700', color: TEXT_DIM },
  tipOptionTextActive: { color: '#fff' },
  customTipBtn: { alignItems: 'center', marginTop: 10 },
  customTipText: { fontSize: 13, fontWeight: '600', color: ACCENT },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: CARD_DARK, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 34,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10,
  },
  submitBtn: { backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16, alignItems: 'center', width: '100%', marginBottom: 8 },
  submitText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  skipText: { fontSize: 14, fontWeight: '600', color: TEXT_DIM },
});
