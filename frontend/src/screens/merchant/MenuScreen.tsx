import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../../theme/colors';
import { menuAPI, uploadAPI } from '../../services/api';
import { pickImage } from '../../services/uploadService';

const menuCategories = [
  {
    id: '1',
    name: 'Burgers',
    items: [
      { id: '1', name: 'Gourmet Cheeseburger', price: 14.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', available: true, popular: true, orders: 156 },
      { id: '2', name: 'BBQ Bacon Burger', price: 16.99, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=200&fit=crop', available: true, popular: false, orders: 89 },
      { id: '3', name: 'Veggie Burger', price: 13.99, image: 'https://images.unsplash.com/photo-1520072959219-c595e6cdc07e?w=200&h=200&fit=crop', available: false, popular: false, orders: 34 },
    ],
  },
  {
    id: '2',
    name: 'Sides',
    items: [
      { id: '4', name: 'Classic Fries', price: 4.99, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop', available: true, popular: true, orders: 210 },
      { id: '5', name: 'Onion Rings', price: 5.99, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=200&h=200&fit=crop', available: true, popular: false, orders: 67 },
    ],
  },
  {
    id: '3',
    name: 'Starters',
    items: [
      { id: '6', name: 'Chicken Wings', price: 12.99, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&h=200&fit=crop', available: true, popular: true, orders: 134 },
      { id: '7', name: 'Mozzarella Sticks', price: 8.99, image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=200&h=200&fit=crop', available: true, popular: false, orders: 45 },
    ],
  },
  {
    id: '4',
    name: 'Salads',
    items: [
      { id: '8', name: 'Caesar Salad', price: 9.99, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=200&fit=crop', available: true, popular: false, orders: 78 },
    ],
  },
  {
    id: '5',
    name: 'Drinks',
    items: [
      { id: '9', name: 'Milkshake', price: 6.99, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop', available: true, popular: false, orders: 92 },
      { id: '10', name: 'Fresh Lemonade', price: 3.99, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200&h=200&fit=crop', available: true, popular: false, orders: 56 },
    ],
  },
];

export default function MerchantMenuScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [itemAvailability, setItemAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(
      menuCategories.flatMap(c => c.items.map(i => [i.id, i.available]))
    )
  );

  const toggleAvailability = (itemId: string) => {
    setItemAvailability(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleBulkCSVUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'text/csv' } as any);
      await uploadAPI.uploadDocument(formData);
      Alert.alert('Upload Successful', 'Your CSV menu has been uploaded. Items will be processed shortly.');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload CSV file.');
    }
  };

  const handlePickItemPhoto = async (itemId: string) => {
    const uri = await pickImage();
    if (!uri) return;
    try {
      const formData = new FormData();
      formData.append('file', { uri, name: `menu_item_${itemId}.jpg`, type: 'image/jpeg' } as any);
      const res = await uploadAPI.uploadImage(formData);
      Alert.alert('Photo Updated', 'Menu item photo has been updated.');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload photo.');
    }
  };

  const currentCategory = menuCategories.find(c => c.id === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="search" size={20} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleBulkCSVUpload}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={20} color={colors.textWhite} />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{menuCategories.reduce((sum, c) => sum + c.items.length, 0)}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{menuCategories.reduce((sum, c) => sum + c.items.filter(i => i.available).length, 0)}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {menuCategories.reduce((sum, c) => sum + c.items.filter(i => !i.available).length, 0)}
          </Text>
          <Text style={styles.statLabel}>Unavailable</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{menuCategories.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        {menuCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryTab, selectedCategory === cat.id && styles.categoryTabActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryTabText, selectedCategory === cat.id && styles.categoryTabTextActive]}>
              {cat.name}
            </Text>
            <Text style={[styles.categoryCount, selectedCategory === cat.id && styles.categoryCountActive]}>
              {cat.items.length}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryName}>{currentCategory?.name}</Text>
          <TouchableOpacity style={styles.editCategoryBtn}>
            <Ionicons name="create-outline" size={16} color={colors.teal} />
            <Text style={styles.editCategoryText}>Edit Category</Text>
          </TouchableOpacity>
        </View>

        {currentCategory?.items.map((item) => (
          <View key={item.id} style={[styles.menuItem, !itemAvailability[item.id] && styles.menuItemDisabled]}>
            <TouchableOpacity onPress={() => handlePickItemPhoto(item.id)}>
              <Image source={{ uri: item.image }} style={[styles.itemImage, !itemAvailability[item.id] && styles.itemImageDisabled]} />
              <View style={styles.photoOverlay}>
                <Ionicons name="camera" size={14} color={colors.textWhite} />
              </View>
            </TouchableOpacity>
            <View style={styles.itemInfo}>
              <View style={styles.itemNameRow}>
                <Text style={[styles.itemName, !itemAvailability[item.id] && styles.itemNameDisabled]}>{item.name}</Text>
                {item.popular && (
                  <View style={styles.popularBadge}>
                    <Ionicons name="flame" size={10} color={colors.warning} />
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
              </View>
              <Text style={styles.itemPrice}>₦{item.price.toFixed(2)}</Text>
              <Text style={styles.itemOrders}>{item.orders} orders this week</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.editBtn}>
                  <Ionicons name="create-outline" size={16} color={colors.navy} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dupeBtn}>
                  <Ionicons name="copy-outline" size={16} color={colors.teal} />
                  <Text style={styles.dupeText}>Duplicate</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Switch
                value={itemAvailability[item.id]}
                onValueChange={() => toggleAvailability(item.id)}
                trackColor={{ false: colors.border, true: colors.teal + '60' }}
                thumbColor={itemAvailability[item.id] ? colors.teal : colors.darkGray}
              />
              <TouchableOpacity style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Item to Category */}
        <TouchableOpacity style={styles.addItemCard}>
          <Ionicons name="add-circle-outline" size={24} color={colors.teal} />
          <Text style={styles.addItemText}>Add item to {currentCategory?.name}</Text>
        </TouchableOpacity>

        {/* Bulk Actions */}
        <View style={styles.bulkSection}>
          <Text style={styles.bulkTitle}>Bulk Actions</Text>
          <View style={styles.bulkRow}>
            <TouchableOpacity style={styles.bulkBtn}>
              <Ionicons name="eye-off-outline" size={18} color={colors.warning} />
              <Text style={styles.bulkText}>Hide All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn}>
              <Ionicons name="eye-outline" size={18} color={colors.teal} />
              <Text style={styles.bulkText}>Show All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn}>
              <Ionicons name="pricetag-outline" size={18} color={colors.navy} />
              <Text style={styles.bulkText}>Bulk Price</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn} onPress={handleBulkCSVUpload}>
              <Ionicons name="document-text-outline" size={18} color={colors.teal} />
              <Text style={styles.bulkText}>CSV Import</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    backgroundColor: colors.navy,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textWhite,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textWhite,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  categoryTabsWrapper: {
    height: 50,
  },
  categoryTabs: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTabTextActive: {
    color: colors.textWhite,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  categoryCountActive: {
    color: colors.tealLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  editCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.teal,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemImageDisabled: {
    opacity: 0.5,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemNameDisabled: {
    color: colors.textLight,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.teal,
    marginBottom: 2,
  },
  itemOrders: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 6,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
  },
  dupeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dupeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
  },
  itemRight: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  moreBtn: {
    padding: 4,
  },
  addItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal + '08',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.teal + '30',
    borderStyle: 'dashed',
  },
  addItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.teal,
  },
  bulkSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bulkTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  bulkRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bulkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  bulkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
