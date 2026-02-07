import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const mockReviews = [
  {
    id: '1', customerName: 'Adaeze O.', avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 5, foodQuality: 5, serviceQuality: 5, deliverySpeed: 4, valueForMoney: 5,
    comment: 'Best burger in Lagos! The patty was juicy and perfectly seasoned. Will definitely order again.',
    date: '2 hours ago', orderId: '#3242', helpful: 12, responded: false,
  },
  {
    id: '2', customerName: 'Chidi K.', avatar: 'https://i.pravatar.cc/100?img=3',
    rating: 4, foodQuality: 4, serviceQuality: 4, deliverySpeed: 3, valueForMoney: 4,
    comment: 'Food was great but delivery took a bit longer than expected. The fries were still crispy though!',
    date: '1 day ago', orderId: '#3238', helpful: 5, responded: true,
    businessResponse: 'Thank you for your feedback! We\'re working on improving delivery times.',
  },
  {
    id: '3', customerName: 'Funke A.', avatar: 'https://i.pravatar.cc/100?img=5',
    rating: 3, foodQuality: 3, serviceQuality: 3, deliverySpeed: 2, valueForMoney: 3,
    comment: 'The chicken wings were cold when they arrived. Sauce was good though.',
    date: '3 days ago', orderId: '#3229', helpful: 2, responded: false,
  },
  {
    id: '4', customerName: 'Emeka N.', avatar: 'https://i.pravatar.cc/100?img=8',
    rating: 5, foodQuality: 5, serviceQuality: 5, deliverySpeed: 5, valueForMoney: 4,
    comment: 'Absolutely amazing! The BBQ Bacon Burger is a must-try. Packaging was also top-notch.',
    date: '5 days ago', orderId: '#3215', helpful: 18, responded: false,
  },
];

const ratingStats = { avg: 4.3, total: 342, distribution: [180, 95, 42, 18, 7] };

export default function ReviewsScreen({ navigation }: any) {
  const [filter, setFilter] = useState<'all' | number>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = filter === 'all' ? mockReviews : mockReviews.filter(r => r.rating === filter);

  const renderStars = (rating: number, size = 14) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={size} color={colors.warning} />
      ))}
    </View>
  );

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    // TODO: Call reviewsAPI.respond(reviewId, replyText)
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews & Ratings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Rating Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.avgRating}>{ratingStats.avg}</Text>
            {renderStars(Math.round(ratingStats.avg), 18)}
            <Text style={styles.totalReviews}>{ratingStats.total} reviews</Text>
          </View>
          <View style={styles.summaryRight}>
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <View key={star} style={styles.distRow}>
                <Text style={styles.distStar}>{star}</Text>
                <Ionicons name="star" size={10} color={colors.warning} />
                <View style={styles.distBarBg}>
                  <View style={[styles.distBarFill, { width: `${(ratingStats.distribution[idx] / ratingStats.total) * 100}%` }]} />
                </View>
                <Text style={styles.distCount}>{ratingStats.distribution[idx]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity style={[styles.filterChip, filter === 'all' && styles.filterChipActive]} onPress={() => setFilter('all')}>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {[5, 4, 3, 2, 1].map(star => (
            <TouchableOpacity key={star} style={[styles.filterChip, filter === star && styles.filterChipActive]} onPress={() => setFilter(star)}>
              <Ionicons name="star" size={12} color={filter === star ? colors.textWhite : colors.warning} />
              <Text style={[styles.filterText, filter === star && styles.filterTextActive]}>{star}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {filtered.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image source={{ uri: review.avatar }} style={styles.avatar} />
                <View style={styles.reviewHeaderInfo}>
                  <Text style={styles.customerName}>{review.customerName}</Text>
                  <View style={styles.reviewMeta}>
                    {renderStars(review.rating)}
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
                <Text style={styles.orderId}>{review.orderId}</Text>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>

              {/* Detailed Ratings */}
              <View style={styles.detailedRatings}>
                {[
                  { label: 'Food', value: review.foodQuality },
                  { label: 'Service', value: review.serviceQuality },
                  { label: 'Speed', value: review.deliverySpeed },
                  { label: 'Value', value: review.valueForMoney },
                ].map(item => (
                  <View key={item.label} style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <View style={styles.detailBar}>
                      <View style={[styles.detailFill, { width: `${(item.value / 5) * 100}%`, backgroundColor: item.value >= 4 ? colors.success : item.value >= 3 ? colors.warning : colors.error }]} />
                    </View>
                    <Text style={styles.detailValue}>{item.value}</Text>
                  </View>
                ))}
              </View>

              {/* Business Response */}
              {review.responded && review.businessResponse && (
                <View style={styles.responseCard}>
                  <View style={styles.responseHeader}>
                    <Ionicons name="storefront" size={14} color={colors.navy} />
                    <Text style={styles.responseLabel}>Your Response</Text>
                  </View>
                  <Text style={styles.responseText}>{review.businessResponse}</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.reviewActions}>
                <TouchableOpacity style={styles.helpfulBtn}>
                  <Ionicons name="thumbs-up-outline" size={16} color={colors.textLight} />
                  <Text style={styles.helpfulText}>{review.helpful}</Text>
                </TouchableOpacity>
                {!review.responded && (
                  <TouchableOpacity style={styles.replyBtn} onPress={() => setReplyingTo(replyingTo === review.id ? null : review.id)}>
                    <Ionicons name="chatbubble-outline" size={16} color={colors.navy} />
                    <Text style={styles.replyBtnText}>Reply</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Reply Input */}
              {replyingTo === review.id && (
                <View style={styles.replyInput}>
                  <TextInput
                    style={styles.replyTextInput}
                    placeholder="Write a response..."
                    placeholderTextColor={colors.textLight}
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                  />
                  <View style={styles.replyActions}>
                    <TouchableOpacity onPress={() => { setReplyingTo(null); setReplyText(''); }}>
                      <Text style={styles.replyCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.replySendBtn} onPress={() => handleReply(review.id)}>
                      <Text style={styles.replySendText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  summaryCard: { flexDirection: 'row', backgroundColor: colors.white, margin: 16, borderRadius: 16, padding: 20, gap: 24 },
  summaryLeft: { alignItems: 'center', justifyContent: 'center' },
  avgRating: { fontSize: 40, fontWeight: '800', color: colors.textPrimary },
  totalReviews: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  summaryRight: { flex: 1, gap: 6 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distStar: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, width: 12 },
  distBarBg: { flex: 1, height: 6, backgroundColor: colors.lightGray, borderRadius: 3 },
  distBarFill: { height: 6, backgroundColor: colors.warning, borderRadius: 3 },
  distCount: { fontSize: 11, color: colors.textLight, width: 28, textAlign: 'right' },
  filterRow: { marginBottom: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  reviewsList: { paddingHorizontal: 16, gap: 12 },
  reviewCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  reviewHeaderInfo: { flex: 1, marginLeft: 12 },
  customerName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  reviewDate: { fontSize: 12, color: colors.textLight },
  orderId: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  reviewComment: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 12 },
  detailedRatings: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '48%' },
  detailLabel: { fontSize: 11, color: colors.textLight, width: 40 },
  detailBar: { flex: 1, height: 4, backgroundColor: colors.lightGray, borderRadius: 2 },
  detailFill: { height: 4, borderRadius: 2 },
  detailValue: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, width: 14 },
  responseCard: { backgroundColor: colors.navy + '06', borderRadius: 12, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: colors.navy },
  responseHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  responseLabel: { fontSize: 12, fontWeight: '700', color: colors.navy },
  responseText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  reviewActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  helpfulBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  helpfulText: { fontSize: 13, color: colors.textLight },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  replyBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  replyInput: { marginTop: 12, backgroundColor: colors.lightGray, borderRadius: 12, padding: 12 },
  replyTextInput: { fontSize: 14, color: colors.textPrimary, minHeight: 60, textAlignVertical: 'top' },
  replyActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  replyCancelText: { fontSize: 14, color: colors.textLight, fontWeight: '600' },
  replySendBtn: { backgroundColor: colors.navy, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  replySendText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
});
