import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const paymentMethods = [
  { id: '1', type: 'visa', last4: '4242', expiry: '12/27', isDefault: true, label: 'Personal Visa' },
  { id: '2', type: 'mastercard', last4: '8888', expiry: '06/26', isDefault: false, label: 'Work Card' },
  { id: '3', type: 'apple_pay', last4: '', expiry: '', isDefault: false, label: 'Apple Pay' },
];

const getCardIcon = (type: string) => {
  switch (type) {
    case 'visa': return 'card';
    case 'mastercard': return 'card';
    case 'apple_pay': return 'logo-apple';
    default: return 'card-outline';
  }
};

const getCardColor = (type: string) => {
  switch (type) {
    case 'visa': return '#1A1F71';
    case 'mastercard': return '#EB001B';
    case 'apple_pay': return '#000000';
    default: return colors.navy;
  }
};

export default function PaymentMethodsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Wallet Balance */}
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={24} color={colors.textWhite} />
            </View>
            <View>
              <Text style={styles.walletLabel}>Fulccrum Wallet</Text>
              <Text style={styles.walletBalance}>₦12,500</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.topUpBtn}>
            <Ionicons name="add" size={18} color={colors.teal} />
            <Text style={styles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <Text style={styles.sectionTitle}>Cards & Wallets</Text>
        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.cardItem}>
            <View style={[styles.cardIcon, { backgroundColor: getCardColor(method.type) + '15' }]}>
              <Ionicons name={getCardIcon(method.type) as any} size={22} color={getCardColor(method.type)} />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardLabelRow}>
                <Text style={styles.cardLabel}>{method.label}</Text>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              {method.last4 ? (
                <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
              ) : (
                <Text style={styles.cardNumber}>Connected</Text>
              )}
              {method.expiry ? <Text style={styles.cardExpiry}>Expires {method.expiry}</Text> : null}
            </View>
            <View style={styles.cardActions}>
              {!method.isDefault && (
                <TouchableOpacity style={styles.setDefaultBtn}>
                  <Text style={styles.setDefaultText}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Payment Method */}
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={22} color={colors.teal} />
          <Text style={styles.addText}>Add Payment Method</Text>
        </TouchableOpacity>

        {/* Transaction History */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Transactions</Text>
        {[
          { id: '1', desc: 'Burger House Order', amount: -22.50, date: 'Today, 2:30 PM', type: 'order' },
          { id: '2', desc: 'Wallet Top Up', amount: 50.00, date: 'Yesterday', type: 'topup' },
          { id: '3', desc: 'Sushi Palace Order', amount: -35.98, date: 'Feb 3, 2026', type: 'order' },
          { id: '4', desc: 'Refund - Pizza Roma', amount: 16.99, date: 'Feb 1, 2026', type: 'refund' },
        ].map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={[styles.txIcon, {
              backgroundColor: tx.type === 'order' ? colors.navy + '10' : tx.type === 'topup' ? colors.teal + '10' : colors.success + '10'
            }]}>
              <Ionicons
                name={tx.type === 'order' ? 'receipt-outline' : tx.type === 'topup' ? 'arrow-down' : 'refresh-outline'}
                size={18}
                color={tx.type === 'order' ? colors.navy : tx.type === 'topup' ? colors.teal : colors.success}
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txDesc}>{tx.desc}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.success : colors.textPrimary }]}>
              {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}₦{Math.abs(tx.amount).toLocaleString()}
            </Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  walletCard: {
    backgroundColor: colors.navy, borderRadius: 20, padding: 20, marginBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  walletTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  walletIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  walletLabel: { fontSize: 13, color: colors.tealLight },
  walletBalance: { fontSize: 26, fontWeight: '800', color: colors.textWhite },
  topUpBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 4,
  },
  topUpText: { fontSize: 14, fontWeight: '700', color: colors.teal },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  cardItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16,
    padding: 16, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  defaultBadge: { backgroundColor: colors.teal + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultText: { fontSize: 11, fontWeight: '700', color: colors.teal },
  cardNumber: { fontSize: 13, color: colors.textSecondary, marginTop: 2, letterSpacing: 1 },
  cardExpiry: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setDefaultBtn: { backgroundColor: colors.lightGray, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  setDefaultText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.teal + '08', borderRadius: 16, padding: 16, marginTop: 4, gap: 8,
    borderWidth: 1.5, borderColor: colors.teal + '25', borderStyle: 'dashed',
  },
  addText: { fontSize: 15, fontWeight: '600', color: colors.teal },
  txRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
  },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  txDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '700' },
});
