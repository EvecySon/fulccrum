import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { reviewsAPI, resolveMediaUrl } from '../../services/api';


export default function ReviewModerationScreen({ navigation }: any) {
  const [filter, setFilter] = useState<'all' | 'flagged'>('flagged');
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewsAPI.getBusinessReviews('all');
      if (res?.data?.length) setReviews(res.data);
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const filtered = filter === 'flagged' ? reviews.filter(r => r.flagged) : reviews;
  const flaggedCount = reviews.filter(r => r.flagged).length;

  const renderStars = (rating: number) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={12} color={colors.warning} />
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Moderation</Text>
        <View style={styles.flagCount}>
          <Ionicons name="flag" size={14} color={colors.error} />
          <Text style={styles.flagCountText}>{flaggedCount}</Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />
        }
      >
        {/* Filter */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, filter === 'flagged' && styles.filterChipActive]} onPress={() => setFilter('flagged')}>
            <Ionicons name="flag" size={14} color={filter === 'flagged' ? colors.textWhite : colors.error} />
            <Text style={[styles.filterText, filter === 'flagged' && styles.filterTextActive]}>Flagged ({flaggedCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, filter === 'all' && styles.filterChipActive]} onPress={() => setFilter('all')}>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        {filtered.map(review => (
          <View key={review.id} style={[styles.reviewCard, review.flagged && styles.reviewCardFlagged]}>
            {review.flagged && (
              <View style={styles.flagBanner}>
                <Ionicons name="flag" size={12} color={colors.error} />
                <Text style={styles.flagText}>{review.flagReason}</Text>
              </View>
            )}

            <View style={styles.reviewTop}>
              <Image source={{ uri: resolveMediaUrl(review.avatar) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(review.customer || '') + '&background=0D1B2A&color=fff&size=80' }} style={styles.avatar} />
              <View style={styles.reviewInfo}>
                <Text style={styles.customerName}>{review.customer}</Text>
                <View style={styles.reviewMeta}>
                  {renderStars(review.rating)}
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              </View>
            </View>

            <View style={styles.businessRow}>
              <Ionicons name="storefront-outline" size={14} color={colors.textLight} />
              <Text style={styles.businessName}>{review.business}</Text>
              <Text style={styles.orderId}>{review.orderId}</Text>
            </View>

            <Text style={styles.reviewComment}>{review.comment}</Text>

            {/* Moderation Actions */}
            {moderatingId === review.id ? (
              <View style={styles.moderationForm}>
                <TextInput
                  style={styles.moderationInput}
                  placeholder="Add moderation notes..."
                  placeholderTextColor={colors.textLight}
                  value={moderationNote}
                  onChangeText={setModerationNote}
                  multiline
                />
                <View style={styles.moderationActions}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => { setModeratingId(null); setModerationNote(''); }}>
                    <Ionicons name="checkmark" size={16} color={colors.textWhite} />
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.hideBtn} onPress={() => { setModeratingId(null); setModerationNote(''); }}>
                    <Ionicons name="eye-off" size={16} color={colors.textWhite} />
                    <Text style={styles.hideBtnText}>Hide</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelModBtn} onPress={() => { setModeratingId(null); setModerationNote(''); }}>
                    <Text style={styles.cancelModText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.reviewActions}>
                <TouchableOpacity style={styles.moderateBtn} onPress={() => setModeratingId(review.id)}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.navy} />
                  <Text style={styles.moderateBtnText}>Moderate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewOrderBtn}>
                  <Ionicons name="receipt-outline" size={16} color={colors.teal} />
                  <Text style={styles.viewOrderBtnText}>View Order</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  flagCount: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.error + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  flagCountText: { fontSize: 14, fontWeight: '700', color: colors.error },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 8, marginBottom: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  reviewCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14 },
  reviewCardFlagged: { borderLeftWidth: 3, borderLeftColor: colors.error },
  flagBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.error + '10', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 10 },
  flagText: { fontSize: 12, fontWeight: '600', color: colors.error },
  reviewTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  reviewInfo: { flex: 1, marginLeft: 10 },
  customerName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  reviewDate: { fontSize: 12, color: colors.textLight },
  businessRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  businessName: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  orderId: { fontSize: 12, color: colors.teal, fontWeight: '600', marginLeft: 'auto' },
  reviewComment: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 12 },
  reviewActions: { flexDirection: 'row', gap: 8 },
  moderateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.navy + '10' },
  moderateBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  viewOrderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.teal + '10' },
  viewOrderBtnText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  moderationForm: { backgroundColor: colors.lightGray, borderRadius: 12, padding: 12 },
  moderationInput: { fontSize: 14, color: colors.textPrimary, minHeight: 60, textAlignVertical: 'top', marginBottom: 10 },
  moderationActions: { flexDirection: 'row', gap: 8 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.success },
  approveBtnText: { fontSize: 13, fontWeight: '600', color: colors.textWhite },
  hideBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.error },
  hideBtnText: { fontSize: 13, fontWeight: '600', color: colors.textWhite },
  cancelModBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.white },
  cancelModText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
});
