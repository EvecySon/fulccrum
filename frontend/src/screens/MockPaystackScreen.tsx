import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function MockPaystackScreen({ route, navigation }: any) {
  const { reference, email, amount, onSuccess, onClose } = route.params;
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const slideAnim = new Animated.Value(500);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, []);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const getCardType = () => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    if (firstDigit === '5' && cardNumber.charAt(1) === '0') return 'verve';
    return 'card';
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
      navigation.goBack();
    });
  };

  const handlePay = async () => {
    if (!cardNumber || !expiryDate || !cvv) {
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const mockResponse = {
        status: 'success',
        reference,
        authorization: {
          authorization_code: `AUTH_${Math.random().toString(36).substr(2, 9)}`,
          card_type: getCardType(),
          last4: cardNumber.replace(/\s/g, '').slice(-4),
          exp_month: expiryDate.split('/')[0],
          exp_year: '20' + expiryDate.split('/')[1],
          bank: 'Test Bank',
        },
      };
      
      onSuccess?.(mockResponse);
      handleClose();
    }, 2000);
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />
      
      <Animated.View 
        style={[
          styles.modal,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <View style={styles.headerContent}>
            <Text style={styles.title}>Add Payment Card</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.amountBadge}>
            <Text style={styles.amountLabel}>Authorization Amount</Text>
            <Text style={styles.amountValue}>₦{(amount / 100).toFixed(2)}</Text>
            <Text style={styles.amountNote}>Will be refunded to your wallet</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <Ionicons 
                  name={getCardType() as any} 
                  size={24} 
                  color={cardNumber ? colors.teal : colors.textLight} 
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiry(text))}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <Text style={styles.securityText}>
                Your card details are encrypted and secure
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.payButton,
              (!cardNumber || !expiryDate || !cvv || processing) && styles.payButtonDisabled
            ]}
            onPress={handlePay}
            disabled={!cardNumber || !expiryDate || !cvv || processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="lock-closed" size={20} color={colors.white} />
                <Text style={styles.payButtonText}>
                  Pay ₦{(amount / 100).toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.poweredBy}>
            🔒 Secured by Paystack (Mock Mode)
          </Text>
        </View>
      </Animated.View>
    </View>
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
    maxHeight: '90%',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  amountBadge: {
    backgroundColor: '#f0fdfa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.teal,
    marginBottom: 4,
  },
  amountNote: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: colors.success,
  },
  payButton: {
    backgroundColor: colors.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  poweredBy: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
