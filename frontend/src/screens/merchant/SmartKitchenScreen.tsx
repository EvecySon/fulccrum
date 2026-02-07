import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { kitchenAPI } from '../../services/api';

interface KitchenOrder {
  id: string;
  orderId: string;
  items: string[];
  station: string;
  status: 'queued' | 'prepping' | 'ready';
  estimatedTime: number;
  actualTime?: number;
  priority: 'normal' | 'rush';
}

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  unit: string;
  autoReorder: boolean;
}

const mockOrders: KitchenOrder[] = [
  { id: 'k1', orderId: '#3250', items: ['Cheeseburger x2', 'Fries x2'], station: 'Grill', status: 'prepping', estimatedTime: 12, actualTime: 8, priority: 'rush' },
  { id: 'k2', orderId: '#3251', items: ['Caesar Salad', 'Lemonade'], station: 'Cold', status: 'queued', estimatedTime: 5, priority: 'normal' },
  { id: 'k3', orderId: '#3252', items: ['Chicken Wings x3', 'Onion Rings'], station: 'Fryer', status: 'prepping', estimatedTime: 15, actualTime: 10, priority: 'normal' },
  { id: 'k4', orderId: '#3249', items: ['Milkshake x2'], station: 'Drinks', status: 'ready', estimatedTime: 3, actualTime: 2, priority: 'normal' },
];

const mockInventory: InventoryItem[] = [
  { id: 'i1', name: 'Beef Patties', stock: 24, reorderPoint: 20, unit: 'pcs', autoReorder: true },
  { id: 'i2', name: 'Burger Buns', stock: 18, reorderPoint: 25, unit: 'pcs', autoReorder: true },
  { id: 'i3', name: 'Lettuce', stock: 5, reorderPoint: 10, unit: 'heads', autoReorder: false },
  { id: 'i4', name: 'Frying Oil', stock: 8, reorderPoint: 5, unit: 'liters', autoReorder: true },
];

const mockPredictions = {
  peakHour: '12:00 PM - 1:30 PM',
  expectedOrders: 45,
  avgPrepTime: '14 min',
  staffRecommendation: '3 cooks needed',
};

export default function SmartKitchenScreen({ navigation }: any) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'predictions'>('orders');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ops, inv] = await Promise.all([kitchenAPI.getOperations(), kitchenAPI.getInventory()]);
      if (Array.isArray(ops)) setOrders(ops);
      else setOrders(mockOrders);
      if (Array.isArray(inv)) setInventory(inv);
      else setInventory(mockInventory);
    } catch {
      setOrders(mockOrders);
      setInventory(mockInventory);
    } finally { setLoading(false); setRefreshing(false); }
  };

  const handleCompletePrep = async (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'ready' as const } : o));
    try { await kitchenAPI.completePrep(id); } catch {}
  };

  const handleStartPrep = async (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'prepping' as const } : o));
    try { const order = orders.find(o => o.id === id); if (order) await kitchenAPI.startPrep(order.orderId, id); } catch {}
  };

  const statusColor = (s: string) => s === 'ready' ? colors.success : s === 'prepping' ? colors.warning : colors.textLight;

  const lowStockItems = inventory.filter(i => i.stock <= i.reorderPoint);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Kitchen</Text>
        <TouchableOpacity onPress={loadData}>
          <Ionicons name="refresh" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{orders.filter(o => o.status === 'queued').length}</Text>
          <Text style={styles.statLabel}>Queued</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.warning }]}>{orders.filter(o => o.status === 'prepping').length}</Text>
          <Text style={styles.statLabel}>Prepping</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.success }]}>{orders.filter(o => o.status === 'ready').length}</Text>
          <Text style={styles.statLabel}>Ready</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.error }]}>{lowStockItems.length}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['orders', 'inventory', 'predictions'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}>
          {activeTab === 'orders' && orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderId}>{order.orderId}</Text>
                    {order.priority === 'rush' && <View style={styles.rushBadge}><Text style={styles.rushText}>RUSH</Text></View>}
                  </View>
                  <Text style={styles.orderStation}>Station: {order.station}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(order.status) + '18' }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(order.status) }]} />
                  <Text style={[styles.statusText, { color: statusColor(order.status) }]}>{order.status}</Text>
                </View>
              </View>
              <View style={styles.orderItems}>
                {order.items.map((item, i) => <Text key={i} style={styles.orderItem}>• {item}</Text>)}
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.timeText}>Est: {order.estimatedTime}m{order.actualTime ? ` · Actual: ${order.actualTime}m` : ''}</Text>
                {order.status === 'queued' && (
                  <TouchableOpacity style={styles.startBtn} onPress={() => handleStartPrep(order.id)}>
                    <Text style={styles.startBtnText}>Start Prep</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'prepping' && (
                  <TouchableOpacity style={styles.doneBtn} onPress={() => handleCompletePrep(order.id)}>
                    <Text style={styles.doneBtnText}>Mark Ready</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {activeTab === 'inventory' && inventory.map(item => (
            <View key={item.id} style={[styles.invCard, item.stock <= item.reorderPoint && styles.invCardLow]}>
              <View style={styles.invInfo}>
                <Text style={styles.invName}>{item.name}</Text>
                <Text style={styles.invStock}>{item.stock} {item.unit} {item.autoReorder ? '· Auto-reorder' : ''}</Text>
              </View>
              <View style={styles.invRight}>
                <View style={styles.stockBar}>
                  <View style={[styles.stockFill, { width: `${Math.min((item.stock / (item.reorderPoint * 2)) * 100, 100)}%`, backgroundColor: item.stock <= item.reorderPoint ? colors.error : colors.teal }]} />
                </View>
                {item.stock <= item.reorderPoint && <Text style={styles.lowStockText}>Low Stock</Text>}
              </View>
            </View>
          ))}

          {activeTab === 'predictions' && (
            <View style={styles.predictionsSection}>
              <View style={styles.predCard}>
                <Ionicons name="time" size={28} color={colors.warning} />
                <Text style={styles.predTitle}>Peak Hour</Text>
                <Text style={styles.predValue}>{mockPredictions.peakHour}</Text>
              </View>
              <View style={styles.predCard}>
                <Ionicons name="receipt" size={28} color={colors.teal} />
                <Text style={styles.predTitle}>Expected Orders</Text>
                <Text style={styles.predValue}>{mockPredictions.expectedOrders}</Text>
              </View>
              <View style={styles.predCard}>
                <Ionicons name="timer" size={28} color={colors.navy} />
                <Text style={styles.predTitle}>Avg Prep Time</Text>
                <Text style={styles.predValue}>{mockPredictions.avgPrepTime}</Text>
              </View>
              <View style={styles.predCard}>
                <Ionicons name="people" size={28} color={colors.success} />
                <Text style={styles.predTitle}>Staff Needed</Text>
                <Text style={styles.predValue}>{mockPredictions.staffRecommendation}</Text>
              </View>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsBar: { flexDirection: 'row', backgroundColor: colors.white, paddingVertical: 14, paddingHorizontal: 10, justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center' },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  orderCard: { marginHorizontal: 12, marginBottom: 10, backgroundColor: colors.white, borderRadius: 16, padding: 14 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 16, fontWeight: '700', color: colors.navy },
  rushBadge: { backgroundColor: colors.error + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  rushText: { fontSize: 10, fontWeight: '800', color: colors.error },
  orderStation: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  orderItems: { marginBottom: 10 },
  orderItem: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeText: { fontSize: 12, color: colors.textLight },
  startBtn: { backgroundColor: colors.teal, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  startBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  doneBtn: { backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  doneBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  invCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 8, backgroundColor: colors.white, borderRadius: 14, padding: 14 },
  invCardLow: { borderLeftWidth: 3, borderLeftColor: colors.error },
  invInfo: { flex: 1 },
  invName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  invStock: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  invRight: { width: 80, alignItems: 'flex-end' },
  stockBar: { width: '100%', height: 6, backgroundColor: colors.lightGray, borderRadius: 3, overflow: 'hidden' },
  stockFill: { height: '100%', borderRadius: 3 },
  lowStockText: { fontSize: 10, fontWeight: '700', color: colors.error, marginTop: 4 },
  predictionsSection: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8 },
  predCard: { width: '47%', backgroundColor: colors.white, borderRadius: 16, padding: 20, alignItems: 'center', flexGrow: 1 },
  predTitle: { fontSize: 12, color: colors.textLight, marginTop: 8 },
  predValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 4, textAlign: 'center' },
});
