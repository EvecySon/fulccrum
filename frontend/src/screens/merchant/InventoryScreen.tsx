import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { menuAPI } from '../../services/api';


export default function InventoryScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await menuAPI.getInventory();
        if (res?.length) setInventory(res);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  const filtered = inventory
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .filter(i => {
      if (filter === 'low') return i.currentStock <= i.minimumStock && i.currentStock > 0;
      if (filter === 'out') return i.currentStock === 0;
      return true;
    });

  const lowStockCount = inventory.filter(i => i.currentStock <= i.minimumStock && i.currentStock > 0).length;
  const outOfStockCount = inventory.filter(i => i.currentStock === 0).length;
  const totalValue = inventory.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

  const [showRestock, setShowRestock] = useState<any>(null);
  const [restockQty, setRestockQty] = useState('');

  const handleRestock = async () => {
    if (!showRestock || !restockQty) return;
    const qty = parseInt(restockQty);
    if (isNaN(qty) || qty <= 0) { Alert.alert('Invalid', 'Enter a valid quantity.'); return; }
    try {
      await menuAPI.updateInventory(showRestock.id, { currentStock: showRestock.currentStock + qty });
      setInventory(prev => prev.map(i => i.id === showRestock.id ? { ...i, currentStock: i.currentStock + qty } : i));
      setShowRestock(null);
      setRestockQty('');
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not restock'); }
  };

  const handleEditStock = (item: any) => {
    Alert.prompt('Edit Stock', `Current stock: ${item.currentStock} ${item.unit}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async (val?: string) => {
          if (!val) return;
          const newStock = parseInt(val);
          if (isNaN(newStock)) return;
          try {
            await menuAPI.updateInventory(item.id, { currentStock: newStock });
            setInventory(prev => prev.map(i => i.id === item.id ? { ...i, currentStock: newStock } : i));
          } catch (e: any) { Alert.alert('Error', e?.message || 'Could not update stock'); }
        },
      },
    ], 'plain-text', String(item.currentStock));
  };

  const handleAddInventory = () => {
    Alert.alert('Add Inventory', 'To add inventory items, first add menu items from the Menu screen. Inventory is automatically tracked for all menu items.');
  };

  const getStockStatus = (item: any) => {
    if (item.currentStock === 0) return { label: 'Out of Stock', color: colors.error };
    if (item.currentStock <= item.minimumStock) return { label: 'Low Stock', color: colors.warning };
    return { label: 'In Stock', color: colors.success };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity onPress={handleAddInventory}>
          <Ionicons name="add-circle-outline" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="cube-outline" size={20} color={colors.navy} />
            <Text style={styles.summaryValue}>{inventory.length}</Text>
            <Text style={styles.summaryLabel}>Items</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
            <Text style={[styles.summaryValue, { color: colors.warning }]}>{lowStockCount}</Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="wallet-outline" size={20} color={colors.teal} />
            <Text style={styles.summaryValue}>₦{(totalValue / 1000).toFixed(0)}K</Text>
            <Text style={styles.summaryLabel}>Total Value</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'All Items' },
            { key: 'low', label: `Low Stock (${lowStockCount})` },
            { key: 'out', label: `Out of Stock (${outOfStockCount})` },
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key as any)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Inventory List */}
        {filtered.map(item => {
          const status = getStockStatus(item);
          return (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <View style={styles.stockRow}>
                  <Text style={styles.stockText}>
                    <Text style={styles.stockValue}>{item.currentStock}</Text> / {item.minimumStock} {item.unit}
                  </Text>
                  <Text style={styles.costText}>₦{item.costPerUnit.toLocaleString()}/{item.unit.slice(0, -1) || item.unit}</Text>
                </View>
                <View style={styles.stockBar}>
                  <View style={[styles.stockFill, {
                    width: `${Math.min((item.currentStock / (item.minimumStock * 2)) * 100, 100)}%`,
                    backgroundColor: status.color,
                  }]} />
                </View>
                <View style={styles.itemBottom}>
                  <Text style={styles.supplierText}>{item.supplier}</Text>
                  <Text style={styles.restockedText}>Restocked {item.lastRestocked}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.restockBtn} onPress={() => { setShowRestock(item); setRestockQty(''); }}>
                    <Ionicons name="add" size={16} color={colors.textWhite} />
                    <Text style={styles.restockBtnText}>Restock</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEditStock(item)}>
                    <Ionicons name="create-outline" size={16} color={colors.navy} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Restock Modal */}
      <Modal visible={!!showRestock} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>Restock {showRestock?.name}</Text>
            <Text style={{ fontSize: 13, color: colors.textLight, marginBottom: 16 }}>Current: {showRestock?.currentStock} {showRestock?.unit}</Text>
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, marginBottom: 16 }}
              placeholder="Quantity to add"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={restockQty}
              onChangeText={setRestockQty}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' }} onPress={() => setShowRestock(null)}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.teal, alignItems: 'center' }} onPress={handleRestock}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>Restock</Text>
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
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  summaryLabel: { fontSize: 11, color: colors.textLight },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, borderRadius: 12, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.textPrimary },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  itemCard: { flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, gap: 14 },
  itemImage: { width: 60, height: 60, borderRadius: 12 },
  itemInfo: { flex: 1 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  stockText: { fontSize: 13, color: colors.textSecondary },
  stockValue: { fontWeight: '700', color: colors.textPrimary },
  costText: { fontSize: 12, color: colors.textLight },
  stockBar: { height: 4, backgroundColor: colors.lightGray, borderRadius: 2, marginBottom: 8 },
  stockFill: { height: 4, borderRadius: 2 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  supplierText: { fontSize: 12, color: colors.textLight },
  restockedText: { fontSize: 12, color: colors.textLight },
  itemActions: { flexDirection: 'row', gap: 8 },
  restockBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.teal, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  restockBtnText: { fontSize: 12, fontWeight: '600', color: colors.textWhite },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.navy + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { fontSize: 12, fontWeight: '600', color: colors.navy },
});
