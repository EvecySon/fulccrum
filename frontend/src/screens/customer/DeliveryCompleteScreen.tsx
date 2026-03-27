import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { packageDeliveryAPI } from '../../services/packageDeliveryAPI';

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';

const DeliveryCompleteScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = (route.params as any) || {};

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }
    try {
      setIsSubmitting(true);
      await packageDeliveryAPI.rateDelivery(orderId, rating, feedback.trim() || undefined);
      Alert.alert('Thank You!', 'Your feedback helps us improve our service', [
        { text: 'OK', onPress: () => (navigation as any).navigate('PackageHistory') },
      ]);
    } catch (error) {
      console.error('Rating error:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    (navigation as any).navigate('PackageHistory');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successSection}>
          <Animated.View
            style={[
              styles.successIconContainer,
              { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={80} color={ACCENT} />
            </View>
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.successTitle}>Delivery Complete!</Text>
            <Text style={styles.successSubtitle}>
              Your package has been successfully delivered
            </Text>
          </Animated.View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <Text style={styles.sectionSubtitle}>Rate your courier to help us improve</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={44}
                  color={star <= rating ? '#f59e0b' : '#353A4A'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Great!'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </Text>
          )}
        </View>

        {/* Feedback */}
        {rating > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Feedback</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              placeholderTextColor={TEXT_DIM}
            />
          </View>
        )}

        {/* Quick Feedback Tags */}
        {rating > 0 && rating <= 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What went wrong?</Text>
            <View style={styles.tagsContainer}>
              {['Late delivery', 'Poor communication', 'Package damaged', 'Unprofessional'].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => setFeedback((prev) => (prev ? `${prev}, ${tag}` : tag))}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {rating >= 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What did you like?</Text>
            <View style={styles.tagsContainer}>
              {['Fast delivery', 'Friendly courier', 'Great communication', 'Professional'].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => setFeedback((prev) => (prev ? `${prev}, ${tag}` : tag))}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Order Again CTA */}
        <View style={styles.ctaCard}>
          <Ionicons name="cube-outline" size={30} color={ACCENT} />
          <Text style={styles.ctaTitle}>Need to send another package?</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => (navigation as any).navigate('SendPackageHome')}
          >
            <Text style={styles.ctaButtonText}>Send Package</Text>
            <Ionicons name="arrow-forward" size={16} color={BG_DARK} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {rating > 0 ? (
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleRatingSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.doneButton} onPress={handleSkip}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  scrollView: {
    flex: 1,
  },
  successSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(20,184,166,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: TEXT_DIM,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: TEXT_DIM,
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 14,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: ACCENT,
    textAlign: 'center',
  },
  feedbackInput: {
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    minHeight: 110,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  tag: {
    backgroundColor: CARD_DARK,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#353A4A',
  },
  tagText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  ctaCard: {
    backgroundColor: CARD_DARK,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.15)',
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginTop: 14,
    marginBottom: 14,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 6,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    backgroundColor: BG_DARK,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: CARD_DARK,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#353A4A',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DIM,
  },
  submitButton: {
    flex: 2,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: CARD_DARK,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  doneButton: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default DeliveryCompleteScreen;
