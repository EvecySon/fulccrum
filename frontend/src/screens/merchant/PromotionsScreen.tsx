import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { promosAPI } from '../../services/api';


export default function PromotionsScreen({ navigation }: any) {
  const [promos, setPromos] = useState<any[]>([]);
  const [tab, setTab] = useState<'active' | 'expired'>('active');

  useEffect(() => {
    (async () => {
      try {
        const res = await promosAPI.getAll(1, false);
        if (res?.data?.length) setPromos(res.data);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('');
  const [creating, setCreating] = useState(false);

  const getDefaultFrom = () => new Date().toISOString().split('T')[0];
  const getDefaultUntil = () => {
    const d = new Date(); d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  };
  const [validFrom, setValidFrom] = useState(getDefaultFrom());
  const [validUntil, setValidUntil] = useState(getDefaultUntil());

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  const openCreateModal = () => {
    setNewCode(''); setNewDiscount(''); setNewMinOrder('');
    setValidFrom(getDefaultFrom());
    setValidUntil(getDefaultUntil());
    setShowCreate(true);
  };

  const handleCreatePromo = async () => {
    if (!newCode.trim() || !newDiscount.trim()) {
      Alert.alert('Missing Info', 'Please enter promo code and discount value.');
      return;
    }
    if (!validFrom || !validUntil) {
      Alert.alert('Missing Dates', 'Please set start and end dates.');
      return;
    }
    setCreating(true);
    try {
      const created = await promosAPI.create({
        code: newCode.trim().toUpperCase(),
        discountType: 'percentage',
        discountValue: parseFloat(newDiscount),
        minimumOrder: parseFloat(newMinOrder) || 0,
        validFrom: new Date(validFrom + 'T00:00:00').toISOString(),
        validUntil: new Date(validUntil + 'T23:59:59').toISOString(),
        applicableTo: 'all',
      });
      setPromos(prev => [created, ...prev]);
      setShowCreate(false);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not create promo'); }
    finally { setCreating(false); }
  };

  const handleDeletePromo = (id: string, code: string) => {
    Alert.alert('Delete Promo', `Delete promotion "${code}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await promosAPI.delete(id);
            setPromos(prev => prev.filter(p => p.id !== id));
          } catch (e: any) { Alert.alert('Error', e?.message || 'Could not delete promo'); }
        },
      },
    ]);
  };

  const handleViewStats = async (id: string) => {
    try {
      const stats = await promosAPI.getStats(id);
      Alert.alert('Promo Stats', `Total uses: ${stats?.totalUses || 0}\nTotal discount given: ₦${stats?.totalDiscount?.toLocaleString() || 0}`);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not load stats'); }
  };

  const handleEditPromo = (promo: any) => {
    Alert.prompt('Edit Discount', `Current: ${promo.discountValue}%`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async (val?: string) => {
          if (!val) return;
          try {
            await promosAPI.update(promo.id, { discountValue: parseFloat(val) });
            setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, discountValue: parseFloat(val) } : p));
          } catch (e: any) { Alert.alert('Error', e?.message || 'Could not update promo'); }
        },
      },
    ], 'plain-text', String(promo.discountValue));
  };

  const togglePromo = async (id: string) => {
    try { await promosAPI.toggle(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setPromos(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const activePromos = promos.filter(p => p.isActive);
  const expiredPromos = promos.filter(p => !p.isActive);
  const totalRedemptions = promos.reduce((s, p) => s + p.usedCount, 0);
  const displayed = tab === 'active' ? activePromos : expiredPromos;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
          <Ionicons name="add" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activePromos.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalRedemptions}</Text>
            <Text style={styles.statLabel}>Redemptions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{expiredPromos.length}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, tab === 'active' && styles.tabActive]} onPress={() => setTab('active')}>
            <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active ({activePromos.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'expired' && styles.tabActive]} onPress={() => setTab('expired')}>
            <Text style={[styles.tabText, tab === 'expired' && styles.tabTextActive]}>Expired ({expiredPromos.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Promo List */}
        {displayed.map(promo => {
          const usagePercent = promo.usageLimit ? (promo.usedCount / promo.usageLimit) * 100 : 0;
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

              <View style={styles.promoDiscount}>
                <Text style={styles.discountValue}>
                  {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₦${promo.discountValue.toLocaleString()} OFF`}
                </Text>
                {promo.maxDiscount && (
                  <Text style={styles.maxDiscount}>Max ₦{promo.maxDiscount.toLocaleString()}</Text>
                )}
              </View>

              <View style={styles.promoDetails}>
                <View style={styles.promoDetail}>
                  <Ionicons name="cart-outline" size={14} color={colors.textLight} />
                  <Text style={styles.promoDetailText}>Min order ₦{promo.minimumOrder.toLocaleString()}</Text>
                </View>
                <View style={styles.promoDetail}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
                  <Text style={styles.promoDetailText}>{promo.validFrom} — {promo.validUntil}</Text>
                </View>
                <View style={styles.promoDetail}>
                  <Ionicons name="people-outline" size={14} color={colors.textLight} />
                  <Text style={styles.promoDetailText}>
                    {promo.applicableTo === 'first_order' ? 'First orders only' : 'All customers'}
                  </Text>
                </View>
              </View>

              {/* Usage Bar */}
              <View style={styles.usageSection}>
                <View style={styles.usageHeader}>
                  <Text style={styles.usageLabel}>Usage</Text>
                  <Text style={styles.usageCount}>{promo.usedCount} / {promo.usageLimit || '∞'}</Text>
                </View>
                {promo.usageLimit && (
                  <View style={styles.usageBar}>
                    <View style={[styles.usageFill, {
                      width: `${Math.min(usagePercent, 100)}%`,
                      backgroundColor: usagePercent >= 90 ? colors.error : usagePercent >= 70 ? colors.warning : colors.teal,
                    }]} />
                  </View>
                )}
              </View>

              <View style={styles.promoActions}>
                <TouchableOpacity style={styles.editPromoBtn} onPress={() => handleEditPromo(promo)}>
                  <Ionicons name="create-outline" size={16} color={colors.navy} />
                  <Text style={styles.editPromoBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statsPromoBtn} onPress={() => handleViewStats(promo.id)}>
                  <Ionicons name="stats-chart-outline" size={16} color={colors.teal} />
                  <Text style={styles.statsPromoBtnText}>Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deletePromoBtn} onPress={() => handleDeletePromo(promo.id, promo.code)}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Promo Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !creating && setShowCreate(false)} />
          <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 }}>Create Promotion</Text>
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, marginBottom: 12 }}
              placeholder="Promo code (e.g. SAVE20)"
              placeholderTextColor={colors.textLight}
              autoCapitalize="characters"
              value={newCode}
              onChangeText={setNewCode}
            />
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, marginBottom: 12 }}
              placeholder="Discount % (e.g. 20)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={newDiscount}
              onChangeText={setNewDiscount}
            />
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, marginBottom: 12 }}
              placeholder="Min order amount (₦) (optional)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={newMinOrder}
              onChangeText={setNewMinOrder}
            />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>Validity Period</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textLight, marginBottom: 4 }}>Start Date</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e: any) => setValidFrom(e.target.value)}
                    style={{ backgroundColor: colors.lightGray, borderRadius: 12, padding: '14px 12px', fontSize: 14, color: colors.textPrimary, border: 'none', width: '100%', boxSizing: 'border-box' } as any}
                  />
                ) : (
                  <TextInput
                    style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, fontSize: 14, color: colors.textPrimary }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textLight}
                    value={validFrom}
                    onChangeText={setValidFrom}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textLight, marginBottom: 4 }}>End Date</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e: any) => setValidUntil(e.target.value)}
                    style={{ backgroundColor: colors.lightGray, borderRadius: 12, padding: '14px 12px', fontSize: 14, color: colors.textPrimary, border: 'none', width: '100%', boxSizing: 'border-box' } as any}
                  />
                ) : (
                  <TextInput
                    style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, fontSize: 14, color: colors.textPrimary }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textLight}
                    value={validUntil}
                    onChangeText={setValidUntil}
                  />
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' }} onPress={() => setShowCreate(false)}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.teal, alignItems: 'center', opacity: creating ? 0.6 : 1 }}
                onPress={handleCreatePromo}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={colors.textWhite} size="small" />
                ) : (
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tabRow: { flexDirection: 'row', margin: 16, backgroundColor: colors.white, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  promoCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  promoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  promoCodeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.teal + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  promoCode: { fontSize: 15, fontWeight: '800', color: colors.teal, letterSpacing: 1 },
  promoDiscount: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  discountValue: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  maxDiscount: { fontSize: 13, color: colors.textLight },
  promoDetails: { gap: 6, marginBottom: 14 },
  promoDetail: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoDetailText: { fontSize: 13, color: colors.textSecondary },
  usageSection: { marginBottom: 14 },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  usageLabel: { fontSize: 12, fontWeight: '600', color: colors.textLight },
  usageCount: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  usageBar: { height: 6, backgroundColor: colors.lightGray, borderRadius: 3 },
  usageFill: { height: 6, borderRadius: 3 },
  promoActions: { flexDirection: 'row', gap: 8 },
  editPromoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.navy + '10', paddingVertical: 10, borderRadius: 10 },
  editPromoBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  statsPromoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.teal + '10', paddingVertical: 10, borderRadius: 10 },
  statsPromoBtnText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  deletePromoBtn: { width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error + '10', borderRadius: 10 },
});
