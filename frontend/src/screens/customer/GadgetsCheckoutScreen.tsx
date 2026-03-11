import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { gadgetsAPI } from '../../services/gadgetsAPI';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
  { id: 'wallet', name: 'Fulccrum Wallet', icon: 'wallet' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'business' },
];

const GadgetsCheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !address || !city || !state) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await gadgetsAPI.createOrder({
        items: [], // Will be populated from cart on backend
        deliveryAddress: {
          fullName,
          phone,
          address,
          city,
          state,
          postalCode,
        },
        paymentMethod: selectedPayment,
      });

      if (response.success) {
        Alert.alert(
          'Order Placed!',
          'Your order has been placed successfully',
          [
            {
              text: 'Track Order',
              onPress: () => (navigation as any).navigate('GadgetsOrderTracking'),
            },
            {
              text: 'Done',
              onPress: () => (navigation as any).navigate('HomeTabs'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Order Failed', error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your delivery address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={state}
                onChangeText={setState}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Postal Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter postal code"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentIcon}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={selectedPayment === method.id ? '#3498db' : '#666'}
                />
              </View>
              <Text
                style={[
                  styles.paymentName,
                  selectedPayment === method.id && styles.paymentNameActive,
                ]}
              >
                {method.name}
              </Text>
              {selectedPayment === method.id && (
                <Ionicons name="checkmark-circle" size={24} color="#3498db" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₦0</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>₦0</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>₦0</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦0</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Ionicons name="information-circle" size={20} color="#3498db" />
          <Text style={styles.termsText}>
            By placing this order, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isSubmitting && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
  },
  textArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  paymentNameActive: {
    color: '#3498db',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3498db',
  },
  termsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
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
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default GadgetsCheckoutScreen;
