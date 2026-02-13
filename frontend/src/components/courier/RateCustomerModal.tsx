import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { reviewsAPI } from '../../services/api';

const FEEDBACK_TAGS = [
  { key: 'friendly', label: 'Friendly', icon: 'happy-outline' },
  { key: 'clear_instructions', label: 'Clear instructions', icon: 'document-text-outline' },
  { key: 'easy_to_find', label: 'Easy to find', icon: 'location-outline' },
  { key: 'generous_tip', label: 'Generous tip', icon: 'heart-outline' },
  { key: 'rude', label: 'Rude', icon: 'sad-outline' },
  { key: 'hard_to_find', label: 'Hard to find', icon: 'help-circle-outline' },
  { key: 'no_show', label: 'No show', icon: 'close-circle-outline' },
  { key: 'unsafe_area', label: 'Unsafe area', icon: 'warning-outline' },
];

interface Props {
  visible: boolean;
  orderId: string;
  customerName: string;
  onSubmit: () => void;
  onSkip: () => void;
}

export default function RateCustomerModal({ visible, orderId, customerName, onSubmit, onSkip }: Props) {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const toggleTag = (key: string) => {
    setSelectedTags(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    try {
      await reviewsAPI.create({
        orderId,
        rating,
        tags: selectedTags,
        comment: comment.trim() || undefined,
        type: 'customer_rating',
      });
    } catch {}
    onSubmit();
  };

  const isPositive = rating >= 4;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate Your Customer</Text>
            <TouchableOpacity onPress={onSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Customer */}
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customerName.charAt(0)}</Text>
            </View>
            <Text style={styles.customerName}>{customerName}</Text>
          </View>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? colors.warning : colors.borderLight}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap to rate' : rating <= 2 ? 'Poor experience' : rating === 3 ? 'Average' : rating === 4 ? 'Good' : 'Excellent!'}
          </Text>

          {/* Feedback Tags */}
          {rating > 0 && (
            <>
              <Text style={styles.tagsLabel}>
                {isPositive ? 'What went well?' : 'What went wrong?'}
              </Text>
              <View style={styles.tagsGrid}>
                {FEEDBACK_TAGS
                  .filter(tag => isPositive ? !['rude', 'no_show', 'unsafe_area', 'hard_to_find'].includes(tag.key) : !['friendly', 'generous_tip', 'clear_instructions', 'easy_to_find'].includes(tag.key))
                  .map((tag) => (
                    <TouchableOpacity
                      key={tag.key}
                      style={[styles.tagChip, selectedTags.includes(tag.key) && styles.tagChipActive]}
                      onPress={() => toggleTag(tag.key)}
                    >
                      <Ionicons
                        name={tag.icon as any}
                        size={16}
                        color={selectedTags.includes(tag.key) ? colors.teal : colors.textSecondary}
                      />
                      <Text style={[styles.tagText, selectedTags.includes(tag.key) && styles.tagTextActive]}>
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {/* Comment */}
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment (optional)..."
                placeholderTextColor={colors.textLight}
                value={comment}
                onChangeText={setComment}
                multiline
              />
            </>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text style={styles.submitText}>Submit Rating</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 40, maxHeight: '85%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderLight, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  skipText: { fontSize: 14, fontWeight: '600', color: colors.textLight },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.navy + '15', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.navy },
  customerName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starBtn: { padding: 4 },
  ratingLabel: { textAlign: 'center', fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  tagsLabel: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.lightGray, borderWidth: 1, borderColor: 'transparent',
  },
  tagChipActive: { backgroundColor: colors.teal + '10', borderColor: colors.teal + '30' },
  tagText: { fontSize: 13, color: colors.textSecondary },
  tagTextActive: { color: colors.teal, fontWeight: '600' },
  commentInput: {
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 14,
    fontSize: 14, color: colors.textPrimary, marginBottom: 16, minHeight: 60, textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.teal, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  submitText: { fontSize: 17, fontWeight: '700', color: colors.textWhite },
});
