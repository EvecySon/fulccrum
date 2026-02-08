import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { promosAPI } from '../../services/api';

const mockPromos = [
  { id: '1', code: 'WELCOME20', type: 'percentage', value: 20, maxDiscount: 3000, minOrder: 5000, used: 1450, limit: 5000, validUntil: 'Mar 31, 2026', isActive: true, scope: 'platform', createdBy: 'Admin' },
  { id: '2', code: 'FREEDELIVERY', type: 'fixed', value: 700, maxDiscount: null, minOrder: 3000, used: 890, limit: 2000, validUntil: 'Feb 28, 2026', isActive: true, scope: 'platform', createdBy: 'Admin' },
  { id: '3', code: 'WEEKEND15', type: 'percentage', value: 15, maxDiscount: 2000, minOrder: 4000, used: 560, limit: 3000, validUntil: 'Apr 1, 2026', isActive: true, scope: 'platform', createdBy: 'Admin' },
  { id: '4', code: 'BURGER50', type: 'percentage', value: 50, maxDiscount: 5000, minOrder: 3000, used: 200, limit: 200, validUntil: 'Feb 15, 2026', isActive: false, scope: 'merchant', createdBy: 'Burger House' },
  { id: '5', code: 'NEWUSER500', type: 'fixed', value: 500, maxDiscount: null, minOrder: 2000, used: 3200, limit: 10000, validUntil: 'Dec 31, 2026', isActive: true, scope: 'platform', createdBy: 'Admin' },
];

export default function PromoManagementScreen({ navigation }: any) {
  const [promos, setPromos] = useState(mockPromos);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'merchant'>('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await promosAPI.getAll(1, false);
        if (res?.data?.length) setPromos(res.data);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  const togglePromo = async (id: string) => {
    try { await promosAPI.toggle(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setPromos(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const filtered = promos
    .filter(p => p.code.toLowerCase().includes(search.toLowerCase()))
    .filter(p => {
      if (filter === 'active') return p.isActive;
      if (filter === 'expired') return !p.isActive;
      if (filter === 'merchant') return p.scope === 'merchant';
      return true;
    });

  const totalRedemptions = promos.reduce((s, p) => s + p.used, 0);
  const activeCount = promos.filter(p => p.isActive).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promo Management</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{promos.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalRedemptions.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Redemptions</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput style={styles.searchInput} placeholder="Search promo codes..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 'active', 'expired', 'merchant'] as const).map(f => (
            <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo List */}
        {filtered.map(promo => {
          const usagePct = (promo.used / promo.limit) * 100;
          return (
            <View key={promo.id} style={styles.promoCard}>
              <View style={styles.promoTop}>
                <View style={styles.promoCodeBadge}>
                  <Ionicons name="pricetag" size={14} color={colors.teal} />
                  <Text style={styles.promoCode}>{promo.code}</Text>
                </View>
                <Switch
                  value={promo.isActive}
                  onValueChange={() => togglePromo(promo.id)}
                  trackColor={{ false: colors.border, true: colors.teal + '40' }}
                  thumbColor={promo.isActive ? colors.teal : colors.darkGray}
                />
              </View>

              <Text style={styles.discountText}>
                {promo.type === 'percentage' ? `${promo.value}% OFF` : `₦${promo.value.toLocaleString()} OFF`}
                {promo.maxDiscount ? ` (max ₦${promo.maxDiscount.toLocaleString()})` : ''}
              </Text>

              <View style={styles.promoMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="cart-outline" size={13} color={colors.textLight} />
                  <Text style={styles.metaText}>Min ₦{promo.minOrder.toLocaleString()}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textLight} />
                  <Text style={styles.metaText}>{promo.validUntil}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name={promo.scope === 'platform' ? 'globe-outline' : 'storefront-outline'} size={13} color={colors.textLight} />
                  <Text style={styles.metaText}>{promo.createdBy}</Text>
                </View>
              </View>

              <View style={styles.usageRow}>
                <Text style={styles.usageLabel}>{promo.used.toLocaleString()} / {promo.limit.toLocaleString()} used</Text>
                <Text style={styles.usagePct}>{usagePct.toFixed(0)}%</Text>
              </View>
              <View style={styles.usageBar}>
                <View style={[styles.usageFill, { width: `${Math.min(usagePct, 100)}%`, backgroundColor: usagePct >= 90 ? colors.error : usagePct >= 70 ? colors.warning : colors.teal }]} />
              </View>

              <View style={styles.promoActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.navy} />
                  <Text style={[styles.actionText, { color: colors.navy }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="stats-chart-outline" size={16} color={colors.teal} />
                  <Text style={[styles.actionText, { color: colors.teal }]}>Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, borderRadius: 12, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.textPrimary },
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  promoCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  promoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  promoCodeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.teal + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  promoCode: { fontSize: 14, fontWeight: '800', color: colors.teal, letterSpacing: 1 },
  discountText: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  promoMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  usageLabel: { fontSize: 12, color: colors.textLight },
  usagePct: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  usageBar: { height: 6, backgroundColor: colors.lightGray, borderRadius: 3, marginBottom: 14 },
  usageFill: { height: 6, borderRadius: 3 },
  promoActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.lightGray },
  actionText: { fontSize: 13, fontWeight: '600' },
});
