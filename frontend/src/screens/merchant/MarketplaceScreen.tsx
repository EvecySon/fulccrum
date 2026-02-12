import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { marketplaceAPI } from '../../services/api';

interface Listing {
  id: string;
  title: string;
  description?: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  quantitySold: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function MarketplaceScreen({ navigation }: any) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'surplus',
    originalPrice: '', discountedPrice: '', quantity: '1',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await marketplaceAPI.getMyListings();
      setListings(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load listings');
    } finally { setLoading(false); setRefreshing(false); }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await marketplaceAPI.createListing({
        title: form.title,
        description: form.description,
        category: form.category,
        originalPrice: form.originalPrice,
        discountedPrice: form.discountedPrice,
        quantity: form.quantity,
      });
      setShowCreate(false);
      setForm({ title: '', description: '', category: 'surplus', originalPrice: '', discountedPrice: '', quantity: '1' });
      loadData();
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not create listing'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
    try { await marketplaceAPI.toggleListing(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Listing', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setListings(prev => prev.filter(l => l.id !== id));
        try { await marketplaceAPI.deleteListing(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
      }},
    ]);
  };

  const discount = (orig: number, disc: number) => orig > 0 ? Math.round((1 - disc / orig) * 100) : 0;

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'surplus': return 'leaf';
      case 'special': return 'star';
      case 'bundle': return 'gift';
      default: return 'pricetag';
    }
  };

  const activeListings = listings.filter(l => l.isActive);
  const totalSold = listings.reduce((s, l) => s + l.quantitySold, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Marketplace</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Ionicons name="add-circle-outline" size={24} color={colors.tealLight} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{listings.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.success }]}>{activeListings.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.teal }]}>{totalSold}</Text>
          <Text style={styles.statLabel}>Sold</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : listings.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="storefront-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>No Listings Yet</Text>
          <Text style={styles.emptySubtitle}>List surplus food, special deals, or bundles for the community</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={20} color={colors.textWhite} />
            <Text style={styles.createBtnText}>Create Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}
        >
          {listings.map(listing => (
            <View key={listing.id} style={[styles.card, !listing.isActive && styles.cardInactive]}>
              <View style={styles.cardTop}>
                <View style={styles.catBadge}>
                  <Ionicons name={categoryIcon(listing.category) as any} size={14} color={colors.teal} />
                  <Text style={styles.catText}>{listing.category}</Text>
                </View>
                {listing.isActive && discount(listing.originalPrice, listing.discountedPrice) > 0 && (
                  <View style={styles.discBadge}>
                    <Text style={styles.discText}>{discount(listing.originalPrice, listing.discountedPrice)}% OFF</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{listing.title}</Text>
              {listing.description ? <Text style={styles.cardDesc}>{listing.description}</Text> : null}
              <View style={styles.cardPriceRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.cardPrice}>₦{Number(listing.discountedPrice).toLocaleString()}</Text>
                  {Number(listing.originalPrice) > Number(listing.discountedPrice) && (
                    <Text style={styles.cardOrigPrice}>₦{Number(listing.originalPrice).toLocaleString()}</Text>
                  )}
                </View>
                <Text style={styles.cardQty}>{listing.quantity - listing.quantitySold} left · {listing.quantitySold} sold</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.actionBtn, listing.isActive ? styles.actionActive : styles.actionPaused]} onPress={() => handleToggle(listing.id)}>
                  <Ionicons name={listing.isActive ? 'pause' : 'play'} size={14} color={listing.isActive ? colors.warning : colors.success} />
                  <Text style={[styles.actionText, { color: listing.isActive ? colors.warning : colors.success }]}>{listing.isActive ? 'Pause' : 'Activate'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionDelete]} onPress={() => handleDelete(listing.id)}>
                  <Ionicons name="trash-outline" size={14} color={colors.error} />
                  <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !saving && setShowCreate(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Listing</Text>
            <TextInput style={styles.input} placeholder="Title *" placeholderTextColor={colors.textLight} value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} />
            <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor={colors.textLight} multiline value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} />
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.catRow}>
              {['surplus', 'special', 'bundle'].map(c => (
                <TouchableOpacity key={c} style={[styles.catOption, form.category === c && styles.catOptionActive]} onPress={() => setForm(p => ({ ...p, category: c }))}>
                  <Ionicons name={categoryIcon(c) as any} size={14} color={form.category === c ? colors.navy : colors.textSecondary} />
                  <Text style={[styles.catOptionText, form.category === c && { color: colors.navy }]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Original Price" placeholderTextColor={colors.textLight} keyboardType="numeric" value={form.originalPrice} onChangeText={v => setForm(p => ({ ...p, originalPrice: v }))} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Discounted Price" placeholderTextColor={colors.textLight} keyboardType="numeric" value={form.discountedPrice} onChangeText={v => setForm(p => ({ ...p, discountedPrice: v }))} />
            </View>
            <TextInput style={styles.input} placeholder="Quantity" placeholderTextColor={colors.textLight} keyboardType="numeric" value={form.quantity} onChangeText={v => setForm(p => ({ ...p, quantity: v }))} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.submitBtnText}>Create</Text>}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  statsBar: { flexDirection: 'row', backgroundColor: colors.white, paddingVertical: 14, paddingHorizontal: 10, justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textLight, marginTop: 6, textAlign: 'center' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.navy, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  createBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  cardInactive: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.teal + '10', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  catText: { fontSize: 11, fontWeight: '700', color: colors.teal, textTransform: 'capitalize' },
  discBadge: { backgroundColor: colors.error + '12', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  discText: { fontSize: 11, fontWeight: '800', color: colors.error },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  cardDesc: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  cardPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cardPrice: { fontSize: 18, fontWeight: '800', color: colors.navy },
  cardOrigPrice: { fontSize: 14, color: colors.textLight, textDecorationLine: 'line-through' },
  cardQty: { fontSize: 12, color: colors.textLight },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionActive: { backgroundColor: colors.warning + '12' },
  actionPaused: { backgroundColor: colors.success + '12' },
  actionDelete: { backgroundColor: colors.error + '10' },
  actionText: { fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 380 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  catRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  catOption: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.lightGray, borderWidth: 1, borderColor: colors.border },
  catOptionActive: { backgroundColor: colors.navy + '12', borderColor: colors.navy },
  catOptionText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
});
