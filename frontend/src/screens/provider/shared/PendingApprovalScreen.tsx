import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const PROVIDER_TYPE_INFO = {
  RESTAURANT: {
    title: 'Restaurant Registration Submitted',
    icon: 'restaurant',
    color: '#ef4444',
  },
  PROFESSIONAL_SERVICE: {
    title: 'Service Provider Registration Submitted',
    icon: 'construct',
    color: '#f59e0b',
  },
  HEALTH_SERVICE: {
    title: 'Health Service Registration Submitted',
    icon: 'medical',
    color: '#10b981',
  },
  GADGET_SELLER: {
    title: 'Seller Registration Submitted',
    icon: 'phone-portrait',
    color: '#3b82f6',
  },
  HOME_SERVICE: {
    title: 'Home Service Registration Submitted',
    icon: 'home',
    color: '#8b5cf6',
  },
};

const PendingApprovalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { providerType } = (route.params as any) || { providerType: 'RESTAURANT' };

  const info = PROVIDER_TYPE_INFO[providerType as keyof typeof PROVIDER_TYPE_INFO];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={[styles.iconContainer, { backgroundColor: info.color + '15' }]}>
          <Ionicons name="checkmark-circle" size={80} color={info.color} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{info.title}</Text>
        <Text style={styles.subtitle}>
          Your registration has been submitted successfully!
        </Text>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={24} color="#6b7280" />
            <Text style={styles.infoCardTitle}>Review Time</Text>
            <Text style={styles.infoCardText}>24-48 hours</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="mail-outline" size={24} color="#6b7280" />
            <Text style={styles.infoCardTitle}>Notification</Text>
            <Text style={styles.infoCardText}>Via email & SMS</Text>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Our team will review your documents and information
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              You'll receive an email and SMS notification once approved
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Start receiving orders and earning immediately
            </Text>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.supportBox}>
          <Ionicons name="help-circle-outline" size={24} color="#14b8a6" />
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportText}>
              Contact our support team if you have any questions
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            // Navigate to support/help
            console.log('Contact support');
          }}
        >
          <Text style={styles.secondaryButtonText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // Navigate to login or home
            (navigation as any).navigate('Login');
          }}
        >
          <LinearGradient colors={[info.color, info.color + 'CC']} style={styles.primaryGradient}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoCardTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  nextSteps: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#14b8a6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingTop: 4,
  },
  supportBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdfa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14b8a6',
  },
  supportContent: {
    flex: 1,
    marginLeft: 12,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 14,
    color: '#0f766e',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PendingApprovalScreen;
