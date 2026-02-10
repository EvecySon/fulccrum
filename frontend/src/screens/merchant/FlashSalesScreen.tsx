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
import { flashSalesAPI } from '../../services/api';

interface FlashSale {
  id: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  itemsSold: number;
  maxQuantity?: number;
}

export default function FlashSalesScreen({ navigation }: any) {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await flashSalesAPI.getAll();
      setSales(Array.isArray(res?.data) ? res.data : []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load flash sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ─── Create Modal ───
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discountValue: '', startsAt: '', endsAt: '', maxQuantity: '' });

  const getDefaultStart = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };
  const getDefaultEnd = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const openCreate = () => {
    setForm({ title: '', description: '', discountValue: '', startsAt: getDefaultStart(), endsAt: getDefaultEnd(), maxQuantity: '' });
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.discountValue.trim()) {
      Alert.alert('Missing Info', 'Please enter title and discount value.');
      return;
    }
    setCreating(true);
    try {
      const created = await flashSalesAPI.create({
        title: form.title.trim(),
        description: form.description.trim() || null,
        discountType: 'percentage',
        discountValue: parseFloat(form.discountValue),
        startsAt: new Date(form.startsAt + 'T00:00:00').toISOString(),
        endsAt: new Date(form.endsAt + 'T23:59:59').toISOString(),
        maxQuantity: form.maxQuantity ? parseInt(form.maxQuantity) : null,
      });
      setSales(prev => [created, ...prev]);
      setShowCreate(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not create flash sale');
    } finally {
      setCreating(false);
    }
  };

  // ─── Edit Modal ───
  const [showEdit, setShowEdit] = useState(false);
  const [editSale, setEditSale] = useState<FlashSale | null>(null);
  const [editDiscount, setEditDiscount] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (sale: FlashSale) => {
    setEditSale(sale);
    setEditDiscount(String(sale.discountValue));
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editDiscount.trim() || !editSale) return;
    setEditSaving(true);
    try {
      await flashSalesAPI.update(editSale.id, { discountValue: parseFloat(editDiscount) });
      setSales(prev => prev.map(s => s.id === editSale.id ? { ...s, discountValue: parseFloat(editDiscount) } : s));
      setShowEdit(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update flash sale');
    } finally {
      setEditSaving(false);
    }
  };

  // ─── Delete Modal ───
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FlashSale | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDelete = (sale: FlashSale) => {
    setDeleteTarget(sale);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await flashSalesAPI.delete(deleteTarget.id);
      setSales(prev => prev.filter(s => s.id !== deleteTarget.id));
      setShowDelete(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not delete flash sale');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Toggle ───
  const toggleSale = async (id: string) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    try {
      await flashSalesAPI.toggle(id);
    } catch (e: any) {
      setSales(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
      Alert.alert('Error', e?.message || 'Could not toggle flash sale');
    }
  };

  // ─── Helpers ───
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  const getStatus = (sale: FlashSale) => {
    const now = new Date();
    const start = new Date(sale.startsAt);
    const end = new Date(sale.endsAt);
    if (!sale.isActive) return { label: 'Paused', color: colors.textLight };
    if (now < start) return { label: 'Scheduled', color: colors.warning };
    if (now > end) return { label: 'Ended', color: colors.error };
    return { label: 'Live', color: colors.success };
  };

  const getTimeRemaining = (sale: FlashSale) => {
    const now = new Date();
    const end = new Date(sale.endsAt);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
    return `${hours}h ${mins}m left`;
  };

  const activeSales = sales.filter(s => s.isActive && new Date(s.endsAt) > new Date());
  const endedSales = sales.filter(s => !s.isActive || new Date(s.endsAt) <= new Date());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flash Sales</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={20} color={colors.warning} />
            <Text style={styles.statValue}>{activeSales.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cart" size={20} color={colors.teal} />
            <Text style={styles.statValue}>{sales.reduce((s, x) => s + x.itemsSold, 0)}</Text>
            <Text style={styles.statLabel}>Items Sold</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={20} color={colors.error} />
            <Text style={styles.statValue}>{endedSales.length}</Text>
            <Text style={styles.statLabel}>Ended</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.teal} size="large" style={{ marginTop: 40 }} />
        ) : sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flash-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No Flash Sales Yet</Text>
            <Text style={styles.emptyDesc}>Create a time-limited deal to boost sales</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
              <Text style={styles.emptyBtnText}>Create Flash Sale</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sales.map(sale => {
            const status = getStatus(sale);
            return (
              <View key={sale.id} style={styles.saleCard}>
                <View style={styles.saleTop}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Ionicons name="flash" size={16} color={colors.warning} />
                      <Text style={styles.saleTitle}>{sale.title}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                      </View>
                      <Text style={styles.timeLeft}>{getTimeRemaining(sale)}</Text>
                    </View>
                  </View>
                  <Switch
                    value={sale.isActive}
                    onValueChange={() => toggleSale(sale.id)}
                    trackColor={{ false: colors.border, true: colors.teal + '40' }}
                    thumbColor={sale.isActive ? colors.teal : colors.darkGray}
                  />
                </View>

                <View style={styles.discountRow}>
                  <Text style={styles.discountValue}>
                    {sale.discountType === 'percentage' ? `${sale.discountValue}% OFF` : `₦${sale.discountValue.toLocaleString()} OFF`}
                  </Text>
                  {sale.maxQuantity && (
                    <Text style={styles.maxQty}>Max {sale.maxQuantity} items</Text>
                  )}
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>{formatDate(sale.startsAt)} — {formatDate(sale.endsAt)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cart-outline" size={14} color={colors.textLight} />
                    <Text style={styles.detailText}>{sale.itemsSold} sold</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(sale)}>
                    <Ionicons name="create-outline" size={16} color={colors.navy} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => openDelete(sale)}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Flash Sale Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !creating && setShowCreate(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Flash Sale</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Sale title (e.g. Weekend Blitz)"
              placeholderTextColor={colors.textLight}
              value={form.title}
              onChangeText={v => setForm(f => ({ ...f, title: v }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textLight}
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Discount % (e.g. 30)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={form.discountValue}
              onChangeText={v => setForm(f => ({ ...f, discountValue: v }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Max quantity (optional)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={form.maxQuantity}
              onChangeText={v => setForm(f => ({ ...f, maxQuantity: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>Sale Period</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textLight, marginBottom: 4 }}>Start</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={form.startsAt}
                    onChange={(e: any) => setForm(f => ({ ...f, startsAt: e.target.value }))}
                    style={{ backgroundColor: colors.lightGray, borderRadius: 12, padding: '14px 12px', fontSize: 14, color: colors.textPrimary, border: 'none', width: '100%', boxSizing: 'border-box' } as any}
                  />
                ) : (
                  <TextInput
                    style={styles.modalInputSmall}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textLight}
                    value={form.startsAt}
                    onChangeText={v => setForm(f => ({ ...f, startsAt: v }))}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textLight, marginBottom: 4 }}>End</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={form.endsAt}
                    onChange={(e: any) => setForm(f => ({ ...f, endsAt: e.target.value }))}
                    style={{ backgroundColor: colors.lightGray, borderRadius: 12, padding: '14px 12px', fontSize: 14, color: colors.textPrimary, border: 'none', width: '100%', boxSizing: 'border-box' } as any}
                  />
                ) : (
                  <TextInput
                    style={styles.modalInputSmall}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textLight}
                    value={form.endsAt}
                    onChangeText={v => setForm(f => ({ ...f, endsAt: v }))}
                  />
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, creating && { opacity: 0.6 }]} onPress={handleCreate} disabled={creating}>
                {creating ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.primaryBtnText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEdit} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !editSaving && setShowEdit(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Flash Sale</Text>
            <Text style={{ fontSize: 13, color: colors.textLight, marginBottom: 16 }}>{editSale?.title} — Current: {editSale?.discountValue}%</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="New discount %"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={editDiscount}
              onChangeText={setEditDiscount}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEdit(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, editSaving && { opacity: 0.6 }]} onPress={handleSaveEdit} disabled={editSaving}>
                {editSaving ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.primaryBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal visible={showDelete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !deleting && setShowDelete(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Flash Sale</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
              Are you sure you want to delete "{deleteTarget?.title}"? This cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDelete(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteConfirmBtn, deleting && { opacity: 0.6 }]} onPress={confirmDelete} disabled={deleting}>
                {deleting ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.primaryBtnText}>Delete</Text>}
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
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textLight },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptyDesc: { fontSize: 14, color: colors.textLight },
  emptyBtn: { marginTop: 16, backgroundColor: colors.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  saleCard: { backgroundColor: colors.white, marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16 },
  saleTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  saleTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  timeLeft: { fontSize: 11, color: colors.textLight },
  discountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  discountValue: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  maxQty: { fontSize: 13, color: colors.textLight },
  detailsRow: { gap: 6, marginBottom: 14 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: colors.textSecondary },
  actionsRow: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.navy + '10', paddingVertical: 10, borderRadius: 10 },
  editBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  deleteBtn: { width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error + '10', borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  modalInput: { backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, marginBottom: 12 },
  modalInputSmall: { backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, fontSize: 14, color: colors.textPrimary },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  primaryBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.teal, alignItems: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  deleteConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.error, alignItems: 'center' },
});
