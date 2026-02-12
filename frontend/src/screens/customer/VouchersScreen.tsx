import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../theme/colors';
import { promosAPI } from '../../services/api';

const formatDiscount = (v: any) => {
  if (!v) return '';
  const val = Number(v.discountValue);
  if (v.discountType === 'percentage') return `${val}%\nOFF`;
  return `₦${val.toLocaleString()}\nOFF`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isExpiringSoon = (dateStr: string) => {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
};

export default function VouchersScreen({ navigation }: any) {
  const [tab, setTab] = useState<'available' | 'used'>('available');
  const [promoCode, setPromoCode] = useState('');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [usedVouchers, setUsedVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [promosRes, usageRes] = await Promise.all([
        promosAPI.getAll(1, true),
        promosAPI.myUsage(1),
      ]);
      const promos = Array.isArray(promosRes?.data) ? promosRes.data : Array.isArray(promosRes) ? promosRes : [];
      // Filter to only currently valid promos
      const now = Date.now();
      setVouchers(promos.filter((v: any) => v.isActive && new Date(v.validUntil).getTime() > now));
      const usages = Array.isArray(usageRes?.data) ? usageRes.data : Array.isArray(usageRes) ? usageRes : [];
      setUsedVouchers(usages);
    } catch (e: any) {
      if (!isRefresh) Alert.alert('Error', e?.message || 'Could not load vouchers');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleApplyCode = async () => {
    const code = promoCode.trim();
    if (!code) { Alert.alert('Enter Code', 'Please enter a promo code.'); return; }
    setApplying(true);
    try {
      const res = await promosAPI.validate(code, 0);
      Alert.alert(
        'Valid Code!',
        `"${res.promoCode?.code}" — ${res.promoCode?.description || 'Discount applied'}.\nThis code will be applied at checkout.`,
      );
      setPromoCode('');
      loadData(true);
    } catch (e: any) {
      Alert.alert('Invalid Code', e?.message || 'This promo code is not valid.');
    }
    setApplying(false);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('Copied!', `Code "${code}" copied to clipboard. Apply it at checkout.`);
    } catch {
      Alert.alert('Code', code);
    }
  };

  const totalSavings = usedVouchers.reduce((sum: number, u: any) => sum + Number(u.discountAmount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vouchers & Promos</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading vouchers...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.teal} />}
        >
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
              <TouchableOpacity
                style={[styles.applyBtn, applying && { opacity: 0.5 }]}
                onPress={handleApplyCode}
                disabled={applying}
              >
                {applying ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <Text style={styles.applyText}>Apply</Text>
                )}
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
            vouchers.length === 0 ? (
              <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 30, alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="pricetag-outline" size={40} color={colors.textLight} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 12 }}>No Promos Available</Text>
                <Text style={{ fontSize: 13, color: colors.textLight, textAlign: 'center', marginTop: 6 }}>
                  Check back later or enter a promo code above.
                </Text>
              </View>
            ) : (
              vouchers.map((v: any) => {
                const expiring = isExpiringSoon(v.validUntil);
                return (
                  <View key={v.id} style={styles.voucherCard}>
                    <View style={styles.voucherLeft}>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{formatDiscount(v)}</Text>
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
                        {expiring && (
                          <View style={styles.newBadge}>
                            <Text style={styles.newText}>EXPIRING</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.voucherDesc}>{v.description || 'Discount on your order'}</Text>
                      <Text style={styles.voucherMeta}>
                        {Number(v.minimumOrder) > 0 ? `Min. ₦${Number(v.minimumOrder).toLocaleString()}` : 'No minimum'}
                        {' · Expires '}
                        {formatDate(v.validUntil)}
                      </Text>
                      {v.maxDiscount && v.discountType === 'percentage' && (
                        <Text style={styles.voucherMeta}>Max discount: ₦{Number(v.maxDiscount).toLocaleString()}</Text>
                      )}
                      <TouchableOpacity style={styles.useBtn} onPress={() => handleCopyCode(v.code)}>
                        <Ionicons name="copy-outline" size={14} color={colors.teal} />
                        <Text style={styles.useText}>Copy Code</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )
          ) : (
            usedVouchers.length === 0 ? (
              <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 30, alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="receipt-outline" size={40} color={colors.textLight} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 12 }}>No Used Promos</Text>
                <Text style={{ fontSize: 13, color: colors.textLight, textAlign: 'center', marginTop: 6 }}>
                  Your promo usage history will appear here.
                </Text>
              </View>
            ) : (
              usedVouchers.map((u: any) => (
                <View key={u.id} style={[styles.voucherCard, styles.usedCard]}>
                  <View style={styles.voucherLeft}>
                    <View style={[styles.discountBadge, styles.usedBadge]}>
                      <Text style={[styles.discountText, styles.usedDiscountText]}>
                        ₦{Number(u.discountAmount).toLocaleString()}
                      </Text>
                      <Text style={[styles.usedDiscountText, { fontSize: 10 }]}>SAVED</Text>
                    </View>
                  </View>
                  <View style={styles.voucherDivider}>
                    <View style={styles.dividerDotTop} />
                    <View style={styles.dividerLine} />
                    <View style={styles.dividerDotBottom} />
                  </View>
                  <View style={styles.voucherRight}>
                    <Text style={[styles.voucherCode, { color: colors.textLight }]}>
                      {u.promoCode?.code || 'PROMO'}
                    </Text>
                    <Text style={styles.voucherDesc}>
                      {u.promoCode?.description || 'Discount applied'}
                    </Text>
                    <Text style={styles.voucherMeta}>
                      Used on {formatDate(u.usedAt)}
                    </Text>
                  </View>
                </View>
              ))
            )
          )}

          {/* Total Savings */}
          {usedVouchers.length > 0 && (
            <View style={styles.savingsCard}>
              <Ionicons name="wallet-outline" size={24} color={colors.teal} />
              <View style={styles.savingsInfo}>
                <Text style={styles.savingsLabel}>Total Savings</Text>
                <Text style={styles.savingsValue}>₦{totalSavings.toLocaleString()}</Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  useBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.teal + '12', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  useText: { fontSize: 13, fontWeight: '700', color: colors.teal },
  savingsCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.teal + '10', borderRadius: 16,
    padding: 18, marginTop: 8, gap: 14, borderWidth: 1.5, borderColor: colors.teal + '25',
  },
  savingsInfo: { flex: 1 },
  savingsLabel: { fontSize: 13, color: colors.teal },
  savingsValue: { fontSize: 24, fontWeight: '800', color: colors.teal },
});
