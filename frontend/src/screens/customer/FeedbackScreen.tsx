import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { reviewsAPI } from '../../services/api';

const feedbackTags = ['Fast Delivery', 'Great Food', 'Good Packaging', 'Friendly Courier', 'Hot & Fresh', 'Accurate Order'];

export default function FeedbackScreen({ navigation, route }: any) {
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (foodRating === 0) return;
    setSubmitting(true);
    try {
      await reviewsAPI.create({
        orderId: route?.params?.orderId,
        rating: foodRating,
        deliveryRating,
        comment,
        tags: selectedTags,
      });
      navigation.goBack();
    } catch {
      navigation.goBack();
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
            color={star <= rating ? colors.warning : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Ionicons name="storefront" size={20} color={colors.navy} />
          <View style={styles.orderDetails}>
            <Text style={styles.orderRestaurant}>Burger House</Text>
            <Text style={styles.orderId}>Order #3242 · Feb 6, 2026</Text>
          </View>
        </View>

        {/* Food Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>How was the food?</Text>
          {renderStars(foodRating, setFoodRating)}
          {foodRating > 0 && (
            <Text style={styles.ratingLabel}>
              {foodRating === 5 ? 'Excellent!' : foodRating === 4 ? 'Great!' : foodRating === 3 ? 'Good' : foodRating === 2 ? 'Fair' : 'Poor'}
            </Text>
          )}
        </View>

        {/* Delivery Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>How was the delivery?</Text>
          {renderStars(deliveryRating, setDeliveryRating)}
          {deliveryRating > 0 && (
            <Text style={styles.ratingLabel}>
              {deliveryRating === 5 ? 'Excellent!' : deliveryRating === 4 ? 'Great!' : deliveryRating === 3 ? 'Good' : deliveryRating === 2 ? 'Fair' : 'Poor'}
            </Text>
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
                  color={selectedTags.includes(tag) ? colors.textWhite : colors.teal}
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
            placeholderTextColor={colors.textLight}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Photo Upload */}
        <TouchableOpacity style={styles.photoBtn}>
          <Ionicons name="camera-outline" size={22} color={colors.teal} />
          <Text style={styles.photoBtnText}>Add Photo</Text>
        </TouchableOpacity>

        {/* Tip Courier */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="heart-outline" size={20} color={colors.error} />
            <Text style={styles.tipTitle}>Tip Your Courier</Text>
          </View>
          <Text style={styles.tipDesc}>Mike delivered your order. Show your appreciation!</Text>
          <View style={styles.tipOptions}>
            {[0, 2, 3, 5].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.tipOption, tipAmount === amount && styles.tipOptionActive]}
                onPress={() => setTipAmount(amount)}
              >
                <Text style={[styles.tipOptionText, tipAmount === amount && styles.tipOptionTextActive]}>
                  {amount === 0 ? 'No tip' : `$${amount}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.customTipBtn}>
            <Text style={styles.customTipText}>Custom amount</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitText}>Submit Review</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  orderInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 12, gap: 12,
  },
  orderDetails: { flex: 1 },
  orderRestaurant: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  orderId: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  ratingCard: { backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 12, alignItems: 'center' },
  ratingTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  starsRow: { flexDirection: 'row', gap: 8 },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: colors.teal, marginTop: 8 },
  tagsCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  tagsTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, backgroundColor: colors.teal + '08', borderWidth: 1, borderColor: colors.teal + '25', gap: 6,
  },
  tagActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  tagText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  tagTextActive: { color: colors.textWhite },
  commentCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  commentTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  commentInput: {
    backgroundColor: colors.lightGray, borderRadius: 12, padding: 14, fontSize: 14,
    color: colors.textPrimary, minHeight: 100,
  },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.teal + '08', borderRadius: 14, padding: 14, marginBottom: 12, gap: 8,
    borderWidth: 1.5, borderColor: colors.teal + '25', borderStyle: 'dashed',
  },
  photoBtnText: { fontSize: 15, fontWeight: '600', color: colors.teal },
  tipCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  tipDesc: { fontSize: 13, color: colors.textLight, marginBottom: 12 },
  tipOptions: { flexDirection: 'row', gap: 8 },
  tipOption: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12,
    backgroundColor: colors.lightGray,
  },
  tipOptionActive: { backgroundColor: colors.teal },
  tipOptionText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  tipOptionTextActive: { color: colors.textWhite },
  customTipBtn: { alignItems: 'center', marginTop: 10 },
  customTipText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 34,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  submitBtn: { backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center', width: '100%', marginBottom: 8 },
  submitText: { fontSize: 17, fontWeight: '700', color: colors.textWhite },
  skipText: { fontSize: 14, fontWeight: '600', color: colors.textLight },
});
