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


export default function MerchantMenuScreen({ navigation }: any) {
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [itemAvailability, setItemAvailability] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    (async () => {
      try {
        const res = await menuAPI.getCategories('me');
        if (res?.categories?.length) {
          setMenuCategories(res.categories);
          setSelectedCategory(res.categories[0].id);
          setItemAvailability(
            Object.fromEntries(
              res.categories.flatMap((c: any) => c.items.map((i: any) => [i.id, i.available]))
            )
          );
        } else if (res?.length) {
          setMenuCategories(res);
          setSelectedCategory(res[0].id);
          setItemAvailability(
            Object.fromEntries(
              res.flatMap((c: any) => (c.items || []).map((i: any) => [i.id, i.available !== false]))
            )
          );
        }
      } catch {}
    })();
  }, []);

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
          <Text style={styles.statValue}>{menuCategories.reduce((sum, c) => sum + c.items.filter((i: any) => i.available).length, 0)}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {menuCategories.reduce((sum, c) => sum + c.items.filter((i: any) => !i.available).length, 0)}
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
        {menuCategories.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textLight} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textLight, marginTop: 12 }}>No menu items yet</Text>
            <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 4 }}>Add items to your menu to get started</Text>
          </View>
        )}
        {/* Category Header */}
        {currentCategory && (
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryName}>{currentCategory?.name}</Text>
          <TouchableOpacity style={styles.editCategoryBtn}>
            <Ionicons name="create-outline" size={16} color={colors.teal} />
            <Text style={styles.editCategoryText}>Edit Category</Text>
          </TouchableOpacity>
        </View>
        )}

        {currentCategory?.items?.map((item: any) => (
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
