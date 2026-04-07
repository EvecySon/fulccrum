import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export type PaymentMethod = 'card' | 'bank_transfer' | 'ussd';

interface PaymentMethodSelectorProps {
  visible: boolean;
  amount: number;
  onSelectMethod: (method: PaymentMethod) => void;
  onClose: () => void;
}

export default function WalletPaymentMethodSelector({
  visible,
  amount,
  onSelectMethod,
  onClose,
}: PaymentMethodSelectorProps) {
  const slideAnim = React.useRef(new Animated.Value(500)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSelectMethod = (method: PaymentMethod) => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onSelectMethod(method);
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View
          style={[
            styles.modal,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <Text style={styles.title}>Choose Payment Method</Text>
            <Text style={styles.subtitle}>
              Top up ₦{amount.toLocaleString()} to your wallet
            </Text>
          </View>

          <View style={styles.methods}>
            {/* Card Payment */}
            <TouchableOpacity
              style={styles.methodCard}
              onPress={() => handleSelectMethod('card')}
            >
              <View style={[styles.methodIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="card" size={28} color="#4CAF50" />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>Card Payment</Text>
                <Text style={styles.methodDescription}>
                  Pay instantly with debit or credit card
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Instant</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
            </TouchableOpacity>

            {/* Bank Transfer */}
            <TouchableOpacity
              style={styles.methodCard}
              onPress={() => handleSelectMethod('bank_transfer')}
            >
              <View style={[styles.methodIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="business" size={28} color="#2196F3" />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>Bank Transfer</Text>
                <Text style={styles.methodDescription}>
                  Transfer to your dedicated account number
                </Text>
                <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={[styles.badgeText, { color: '#F57C00' }]}>
                    Most Popular
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
            </TouchableOpacity>

            {/* USSD */}
            <TouchableOpacity
              style={styles.methodCard}
              onPress={() => handleSelectMethod('ussd')}
            >
              <View style={[styles.methodIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="phone-portrait" size={28} color="#9C27B0" />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>USSD Code</Text>
                <Text style={styles.methodDescription}>
                  Dial code from your phone (no internet needed)
                </Text>
                <View style={[styles.badge, { backgroundColor: '#E8EAF6' }]}>
                  <Text style={[styles.badgeText, { color: '#3F51B5' }]}>
                    No Card Needed
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  methods: {
    padding: 20,
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cancelButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
