import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { channelsAPI } from '../../services/api';

interface CateringOrder {
  id: string;
  orderNumber?: string;
  status: string;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;
  customer?: { firstName?: string; lastName?: string };
}

export default function CateringScreen({ navigation }: any) {
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: '', eventDate: '', guestCount: '', notes: '', budget: '' });

  const loadOrders = useCallback(async () => {
    try {
      const res = await channelsAPI.getCatering();
      const data = Array.isArray(res?.data || res) ? (res?.data || res) : [];
      setOrders(data);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load catering orders');
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleCreate = async () => {
    if (!form.customerName.trim() || !form.eventDate.trim()) {
      Alert.alert('Required', 'Please fill in customer name and event date');
      return;
    }
    setSaving(true);
    try {
      await channelsAPI.createCateringOrder({
        customerName: form.customerName,
        eventDate: form.eventDate,
        guestCount: parseInt(form.guestCount) || 0,
        specialInstructions: `catering | ${form.notes} | Guests: ${form.guestCount} | Budget: ₦${form.budget}`,
        totalAmount: parseFloat(form.budget) || 0,
      });
      setShowCreate(false);
      setForm({ customerName: '', eventDate: '', guestCount: '', notes: '', budget: '' });
      loadOrders();
      Alert.alert('Success', 'Catering order created');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not create order');
    } finally { setSaving(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.info;
      case 'accepted': return colors.teal;
      case 'preparing': return colors.warning;
      case 'ready': return '#22c55e';
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textLight;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catering Orders</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Ionicons name="add-circle-outline" size={24} color={colors.tealLight} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="restaurant-outline" size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>No Catering Orders</Text>
          <Text style={styles.emptySubtitle}>Create your first catering order to get started</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={18} color={colors.textWhite} />
            <Text style={styles.createBtnText}>New Catering Order</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} tintColor={colors.teal} />}
        >
          {orders.map((order) => {
            const customerName = order.customer
              ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
              : 'Customer';
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderCustomer}>{customerName}</Text>
                    <Text style={styles.orderId}>#{order.orderNumber || order.id.slice(0, 8)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                  </View>
                </View>
                {order.specialInstructions ? (
                  <View style={styles.notesRow}>
                    <Ionicons name="document-text-outline" size={14} color={colors.textLight} />
                    <Text style={styles.notesText} numberOfLines={2}>{order.specialInstructions}</Text>
                  </View>
                ) : null}
                <View style={styles.orderBottom}>
                  <Text style={styles.orderTotal}>₦{Number(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                  <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Create Catering Order Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !saving && setShowCreate(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Catering Order</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Customer name *"
              placeholderTextColor={colors.textLight}
              value={form.customerName}
              onChangeText={v => setForm(p => ({ ...p, customerName: v }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Event date (e.g. 2026-03-15) *"
              placeholderTextColor={colors.textLight}
              value={form.eventDate}
              onChangeText={v => setForm(p => ({ ...p, eventDate: v }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Number of guests"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={form.guestCount}
              onChangeText={v => setForm(p => ({ ...p, guestCount: v }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Budget (₦)"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={form.budget}
              onChangeText={v => setForm(p => ({ ...p, budget: v }))}
            />
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Special notes / menu requirements"
              placeholderTextColor={colors.textLight}
              multiline
              value={form.notes}
              onChangeText={v => setForm(p => ({ ...p, notes: v }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.modalSaveText}>Create</Text>}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textLight, marginTop: 6, textAlign: 'center' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.navy, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 20 },
  createBtnText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  orderCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderCustomer: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  orderId: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  notesRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 10, backgroundColor: colors.lightGray, borderRadius: 10, padding: 10 },
  notesText: { flex: 1, fontSize: 13, color: colors.textSecondary },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  orderDate: { fontSize: 12, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, textAlign: 'center', marginBottom: 20 },
  modalInput: { backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  modalSaveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center' },
  modalSaveText: { fontSize: 15, fontWeight: '600', color: colors.textWhite },
});
