import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { packageDeliveryAPI } from '../../services/packageDeliveryAPI';

const FindingCourierScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, requestId, estimatedPrice, expiresAt } = (route.params as any) || {};

  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [courierFound, setCourierFound] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await packageDeliveryAPI.getDeliveryStatus(orderId);
        
        if (response.success && response.data.order.status === 'accepted') {
          setCourierFound(true);
          clearInterval(pollInterval);
          
          setTimeout(() => {
            (navigation as any).replace('TrackDelivery', {
              orderId,
              courier: response.data.order.courier,
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (!courierFound) {
        handleTimeout();
      }
    }, 300000); // 5 minutes
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
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#2ecc71" />
          </View>
          <Text style={styles.successTitle}>Courier Found!</Text>
          <Text style={styles.successSubtitle}>
            Connecting you to your courier...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: pulseAnim }, { rotate: spin }],
            },
          ]}
        >
          <Ionicons name="bicycle" size={64} color="#ff6b35" />
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Finding Courier...</Text>
        <Text style={styles.subtitle}>
          We're matching you with the nearest available courier
        </Text>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color="#666" />
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
            <Ionicons name="cash-outline" size={24} color="#ff6b35" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Estimated Cost</Text>
              <Text style={styles.infoValue}>₦{estimatedPrice?.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="people-outline" size={24} color="#3498db" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff5f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successIcon: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2ecc71',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
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
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#ff6b35',
    width: 24,
  },
  infoSection: {
    width: '100%',
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e74c3c',
  },
});

export default FindingCourierScreen;
