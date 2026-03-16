import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { packageDeliveryAPI } from '../../services/packageDeliveryAPI';
import { mockFindCourier } from '../../services/mockPackageDelivery';

const { width } = Dimensions.get('window');

const FindingCourierScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, requestId, estimatedPrice, expiresAt } = (route.params as any) || {};

  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [courierFound, setCourierFound] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('FindingCourierScreen mounted with params:', {
      orderId,
      requestId,
      estimatedPrice,
      expiresAt,
    });

    if (!orderId) {
      console.error('No orderId provided to FindingCourierScreen!');
      Alert.alert('Error', 'Missing order information. Please try again.');
      navigation.goBack();
      return;
    }

    startAnimations();
    startPolling();
    startCountdown();

    return () => {
      // Cleanup
    };
  }, []);

  const startAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startPolling = async () => {
    try {
      console.log('Starting courier search for orderId:', orderId);
      
      // Use mock service to find courier
      const response = await mockFindCourier(orderId);
      
      console.log('Courier search response:', response);
      
      if (response.success) {
        setCourierFound(true);
        
        setTimeout(() => {
          console.log('Navigating to TrackDelivery with:', {
            orderId,
            courier: response.courier,
          });
          
          (navigation as any).replace('TrackDelivery', {
            orderId,
            courier: response.courier,
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Finding courier error:', error);
      handleTimeout();
    }
  };

  const startCountdown = () => {
    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    Alert.alert(
      'No Courier Available',
      'Sorry, we couldn\'t find a courier at this time. Please try again later.',
      [
        {
          text: 'OK',
          onPress: () => (navigation as any).navigate('HomeTabs'),
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this delivery request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await packageDeliveryAPI.cancelDelivery(orderId);
              (navigation as any).navigate('HomeTabs');
            } catch (error) {
              console.error('Cancel error:', error);
              Alert.alert('Error', 'Failed to cancel delivery');
            }
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (courierFound) {
    return (
      <View
        style={[styles.container, { backgroundColor: '#1A1D2E' }]}
      >
        <View style={styles.content}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={100} color="#14b8a6" />
            </View>
          </Animated.View>
          <Text style={styles.successTitle}>Courier Found! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Connecting you to your courier...
          </Text>
          <View style={styles.loadingDots}>
            <View style={[styles.loadingDot, { backgroundColor: '#fff' }]} />
            <View style={[styles.loadingDot, { backgroundColor: '#fff' }]} />
            <View style={[styles.loadingDot, { backgroundColor: '#fff' }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Background Circles */}
      <Animated.View style={[styles.bgCircle, styles.bgCircle1, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.bgCircle, styles.bgCircle2, { transform: [{ scale: pulseAnim }] }]} />
      <Animated.View style={[styles.bgCircle, styles.bgCircle3, { transform: [{ rotate: spin }] }]} />

      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View
            style={[styles.iconGradient, { backgroundColor: '#14b8a6' }]}
          >
            <Ionicons name="bicycle" size={72} color="#fff" />
          </View>
        </Animated.View>

        {/* Animated Radar Rings */}
        <Animated.View style={[styles.radarRing, styles.radarRing1, { transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[styles.radarRing, styles.radarRing2, { transform: [{ scale: pulseAnim }] }]} />

        {/* Title */}
        <Text style={styles.title}>Finding Your Courier</Text>
        <Text style={styles.subtitle}>
          🔍 Searching for the best courier nearby
        </Text>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color="#14b8a6" />
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        </View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="cash-outline" size={24} color="#14b8a6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Estimated Cost</Text>
              <Text style={styles.infoValue}>₦{estimatedPrice?.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="people-outline" size={24} color="#14b8a6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Searching</Text>
              <Text style={styles.infoValue}>Nearby Couriers</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 While you wait</Text>
          <Text style={styles.tipText}>• Make sure your package is ready</Text>
          <Text style={styles.tipText}>• Keep your phone nearby</Text>
          <Text style={styles.tipText}>• You'll be notified when a courier accepts</Text>
        </View>
      </View>

      {/* Cancel Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.04,
  },
  bgCircle1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: ACCENT,
    top: -width * 0.5,
    left: -width * 0.25,
  },
  bgCircle2: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: ACCENT,
    bottom: -width * 0.4,
    right: -width * 0.3,
  },
  bgCircle3: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: ACCENT,
    top: '40%',
    right: -width * 0.2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 40,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: ACCENT,
    borderRadius: 1000,
    opacity: 0.15,
  },
  radarRing1: {
    width: 200,
    height: 200,
    top: '50%',
    left: '50%',
    marginTop: -100,
    marginLeft: -100,
  },
  radarRing2: {
    width: 260,
    height: 260,
    top: '50%',
    left: '50%',
    marginTop: -130,
    marginLeft: -130,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_DIM,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 24,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.7,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCENT,
    marginLeft: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#353A4A',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: ACCENT,
    width: 24,
  },
  infoSection: {
    width: '100%',
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    padding: 20,
    borderRadius: 14,
    marginBottom: 10,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: TEXT_DIM,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: 'rgba(20,184,166,0.06)',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.12)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCENT,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 36,
  },
  cancelButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
});

export default FindingCourierScreen;
