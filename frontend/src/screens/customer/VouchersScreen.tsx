import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const vouchers = [
  { id: '1', code: 'WELCOME20', discount: '20% off', description: 'First order discount', minOrder: 15, expires: 'Mar 15, 2026', isNew: true },
  { id: '2', code: 'FREEDELIVERY', discount: 'Free Delivery', description: 'No delivery fee on your next order', minOrder: 10, expires: 'Feb 28, 2026', isNew: false },
  { id: '3', code: 'LUNCH10', discount: '₦3,000 off', description: 'Lunch special (11AM - 2PM)', minOrder: 5000, expires: 'Feb 20, 2026', isNew: false },
  { id: '4', code: 'WEEKEND15', discount: '15% off', description: 'Weekend orders only', minOrder: 20, expires: 'Apr 1, 2026', isNew: true },
];

const usedVouchers = [
  { id: '5', code: 'NEWYEAR25', discount: '25% off', description: 'New Year special', usedOn: 'Jan 1, 2026', savedAmount: 8.50 },
  { id: '6', code: 'BOGO50', discount: 'Buy 1 Get 1', description: 'BOGO on burgers', usedOn: 'Jan 15, 2026', savedAmount: 14.99 },
];

export default function VouchersScreen({ navigation }: any) {
  const [tab, setTab] = useState<'available' | 'used'>('available');
  const [promoCode, setPromoCode] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vouchers & Promos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Promo Code Input */}
        <View style={styles.promoCard}>
          <Text style={styles.promoLabel}>Have a promo code?</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter code"
              placeholderTextColor={colors.textLight}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'available' && styles.tabActive]}
            onPress={() => setTab('available')}
          >
            <Text style={[styles.tabText, tab === 'available' && styles.tabTextActive]}>
              Available ({vouchers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'used' && styles.tabActive]}
            onPress={() => setTab('used')}
          >
            <Text style={[styles.tabText, tab === 'used' && styles.tabTextActive]}>
              Used ({usedVouchers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'available' ? (
          vouchers.map((v) => (
            <View key={v.id} style={styles.voucherCard}>
              <View style={styles.voucherLeft}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{v.discount}</Text>
                </View>
              </View>
              <View style={styles.voucherDivider}>
                <View style={styles.dividerDotTop} />
                <View style={styles.dividerLine} />
                <View style={styles.dividerDotBottom} />
              </View>
              <View style={styles.voucherRight}>
                <View style={styles.voucherHeader}>
                  <Text style={styles.voucherCode}>{v.code}</Text>
                  {v.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newText}>NEW</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.voucherDesc}>{v.description}</Text>
                <Text style={styles.voucherMeta}>Min. order ${v.minOrder} · Expires {v.expires}</Text>
                <TouchableOpacity style={styles.useBtn}>
                  <Text style={styles.useText}>Use Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          usedVouchers.map((v) => (
            <View key={v.id} style={[styles.voucherCard, styles.usedCard]}>
              <View style={styles.voucherLeft}>
                <View style={[styles.discountBadge, styles.usedBadge]}>
                  <Text style={[styles.discountText, styles.usedDiscountText]}>{v.discount}</Text>
                </View>
              </View>
              <View style={styles.voucherDivider}>
                <View style={styles.dividerDotTop} />
                <View style={styles.dividerLine} />
                <View style={styles.dividerDotBottom} />
              </View>
              <View style={styles.voucherRight}>
                <Text style={[styles.voucherCode, { color: colors.textLight }]}>{v.code}</Text>
                <Text style={styles.voucherDesc}>{v.description}</Text>
                <Text style={styles.voucherMeta}>Used on {v.usedOn} · Saved ₦{v.savedAmount.toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}

        {/* Total Savings */}
        <View style={styles.savingsCard}>
          <Ionicons name="wallet-outline" size={24} color={colors.teal} />
          <View style={styles.savingsInfo}>
            <Text style={styles.savingsLabel}>Total Savings</Text>
            <Text style={styles.savingsValue}>₦7,050</Text>
          </View>
        </View>

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
  promoCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  promoLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoInput: {
    flex: 1, backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: '600', color: colors.textPrimary, letterSpacing: 1,
  },
  applyBtn: { backgroundColor: colors.teal, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  applyText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  tabs: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 14, padding: 4, marginBottom: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  voucherCard: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  usedCard: { opacity: 0.6 },
  voucherLeft: { width: 90, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center', padding: 12 },
  discountBadge: { alignItems: 'center' },
  usedBadge: {},
  discountText: { fontSize: 16, fontWeight: '800', color: colors.textWhite, textAlign: 'center' },
  usedDiscountText: { color: colors.textWhite },
  voucherDivider: { width: 1, justifyContent: 'center', alignItems: 'center' },
  dividerDotTop: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.lightGray, marginTop: -6 },
  dividerLine: { flex: 1, width: 1, borderLeftWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  dividerDotBottom: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.lightGray, marginBottom: -6 },
  voucherRight: { flex: 1, padding: 14 },
  voucherHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voucherCode: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.5 },
  newBadge: { backgroundColor: colors.error, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  newText: { fontSize: 10, fontWeight: '800', color: colors.textWhite },
  voucherDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  voucherMeta: { fontSize: 11, color: colors.textLight, marginTop: 4 },
  useBtn: { alignSelf: 'flex-start', backgroundColor: colors.teal + '12', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  useText: { fontSize: 13, fontWeight: '700', color: colors.teal },
  savingsCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.teal + '10', borderRadius: 16,
    padding: 18, marginTop: 8, gap: 14, borderWidth: 1.5, borderColor: colors.teal + '25',
  },
  savingsInfo: { flex: 1 },
  savingsLabel: { fontSize: 13, color: colors.teal },
  savingsValue: { fontSize: 24, fontWeight: '800', color: colors.teal },
});
