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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { packageDeliveryAPI } from '../../services/packageDeliveryAPI';

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
    // Celebration animation on mount
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
      
      Alert.alert(
        'Thank You!',
        'Your feedback helps us improve our service',
        [
          {
            text: 'OK',
            onPress: () => (navigation as any).navigate('HomeTabs'),
          },
        ]
      );
    } catch (error) {
      console.error('Rating error:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    (navigation as any).navigate('HomeTabs');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successSection}>
          <Animated.View 
            style={[
              styles.successIconContainer,
              { transform: [{ scale: scaleAnim }], opacity: fadeAnim }
            ]}
          >
            <LinearGradient
              colors={['#2ecc71', '#27ae60']}
              style={styles.iconGradient}
            >
              <Ionicons name="checkmark-circle" size={80} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.successTitle}>🎉 Delivery Complete!</Text>
            <Text style={styles.successSubtitle}>
              Your package has been successfully delivered
            </Text>
          </Animated.View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <Text style={styles.sectionSubtitle}>
            Rate your courier to help us improve
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= rating ? '#f39c12' : '#e0e0e0'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 5 && '⭐ Excellent!'}
              {rating === 4 && '👍 Great!'}
              {rating === 3 && '😊 Good'}
              {rating === 2 && '😐 Fair'}
              {rating === 1 && '😞 Poor'}
            </Text>
          )}
        </View>

        {/* Feedback Section */}
        {rating > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Feedback (Optional)</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
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
                  onPress={() => setFeedback((prev) => prev ? `${prev}, ${tag}` : tag)}
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
                  onPress={() => setFeedback((prev) => prev ? `${prev}, ${tag}` : tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Order Again CTA */}
        <View style={styles.ctaCard}>
          <Ionicons name="cube-outline" size={32} color="#ff6b35" />
          <Text style={styles.ctaTitle}>Need to send another package?</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => (navigation as any).navigate('SendPackageHome')}
          >
            <Text style={styles.ctaButtonText}>Send Package</Text>
            <Ionicons name="arrow-forward" size={16} color="#ff6b35" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {rating > 0 ? (
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
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
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f39c12',
    textAlign: 'center',
  },
  feedbackInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  ctaCard: {
    backgroundColor: '#f0fdfa',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#14b8a6',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14b8a6',
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14b8a6',
    marginRight: 8,
  },
  bottomPadding: {
    height: 120,
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
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#14b8a6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  doneButton: {
    backgroundColor: '#14b8a6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default DeliveryCompleteScreen;
