import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../../theme/colors';
import { menuAPI, uploadAPI, getApiBaseUrl } from '../../services/api';
import { pickImage } from '../../services/uploadService';


export default function MerchantMenuScreen({ navigation }: any) {
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [itemAvailability, setItemAvailability] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadMenu = useCallback(async () => {
    try {
      setLoading(true);
      const res = await menuAPI.getCategories('me', true);
      const cats = Array.isArray(res) ? res : res?.categories || [];
      setMenuCategories(cats);
      if (cats.length && !selectedCategory) setSelectedCategory(cats[0].id);
      setItemAvailability(
        Object.fromEntries(
          cats.flatMap((c: any) => (c.items || []).map((i: any) => [i.id, i.isAvailable !== false]))
        )
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadMenu(); }, [loadMenu]));

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCatId, setNewItemCatId] = useState('');
  const [showCatPicker, setShowCatPicker] = useState(false);

  // Edit item modal
  const [showEditItem, setShowEditItem] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Edit category modal
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editCatName, setEditCatName] = useState('');

  // Create category modal
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // 3-dot action sheet
  const [showActions, setShowActions] = useState(false);
  const [actionItem, setActionItem] = useState<any>(null);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const toggleAvailability = async (itemId: string) => {
    const newVal = !itemAvailability[itemId];
    setItemAvailability(prev => ({ ...prev, [itemId]: newVal }));
    try {
      await menuAPI.toggleAvailability(itemId);
    } catch (e: any) {
      setItemAvailability(prev => ({ ...prev, [itemId]: !newVal }));
      Alert.alert('Error', e?.message || 'Could not toggle availability');
    }
  };

  const handleAddItem = async () => {
    const catId = newItemCatId || selectedCategory;
    if (!newItemName.trim() || !newItemPrice.trim()) {
      Alert.alert('Missing Info', 'Please enter item name and price.');
      return;
    }
    if (!catId) {
      Alert.alert('Missing Category', 'Please select a category first.');
      return;
    }
    try {
      await menuAPI.createItem({
        name: newItemName.trim(),
        price: parseFloat(newItemPrice),
        description: newItemDesc.trim() || undefined,
        categoryId: catId,
      });
      setShowAddItem(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDesc('');
      setNewItemCatId('');
      await loadMenu();
      Alert.alert('Success', 'Item added to menu!');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not add item');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Missing Info', 'Please enter a category name.');
      return;
    }
    try {
      await menuAPI.createCategory({ name: newCatName.trim() });
      setShowCreateCategory(false);
      setNewCatName('');
      await loadMenu();
      Alert.alert('Success', 'Category created!');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not create category');
    }
  };

  const handleEditItem = (item: any) => {
    setEditItem(item);
    setEditName(item.name);
    setEditPrice(String(Number(item.price)));
    setEditDesc(item.description || '');
    setShowEditItem(true);
  };

  const saveEditItem = async () => {
    if (!editItem || !editName.trim() || !editPrice.trim()) return;
    try {
      await menuAPI.updateItem(editItem.id, {
        name: editName.trim(),
        price: parseFloat(editPrice),
        description: editDesc.trim() || undefined,
      });
      setShowEditItem(false);
      setEditItem(null);
      await loadMenu();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update item');
    }
  };

  const handleDuplicateItem = async (item: any) => {
    try {
      await menuAPI.createItem({
        name: `${item.name} (Copy)`,
        price: Number(item.price),
        categoryId: selectedCategory,
      });
      await loadMenu();
      Alert.alert('Duplicated', `"${item.name}" has been duplicated.`);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not duplicate item'); }
  };

  const handleEditCategory = () => {
    if (!currentCategory) return;
    setEditCatName(currentCategory.name);
    setShowEditCategory(true);
  };

  const saveEditCategory = async () => {
    if (!currentCategory || !editCatName.trim()) return;
    try {
      await menuAPI.updateCategory(currentCategory.id, { name: editCatName.trim() });
      setMenuCategories(prev => prev.map(c => c.id === currentCategory.id ? { ...c, name: editCatName.trim() } : c));
      setShowEditCategory(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not rename category');
    }
  };

  const handleDeleteItem = (item: any) => {
    setDeleteTarget(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await menuAPI.deleteItem(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      await loadMenu();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not delete item');
    }
  };

  const handleToggleFeatured = async (item: any) => {
    try {
      await menuAPI.updateItem(item.id, { isFeatured: !item.isFeatured });
      await loadMenu();
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not update item'); }
  };

  const openActionSheet = (item: any) => {
    setActionItem(item);
    setShowActions(true);
  };

  const handleBulkToggle = async (available: boolean) => {
    if (!currentCategory?.items?.length) return;
    const newAvail: Record<string, boolean> = {};
    currentCategory.items.forEach((i: any) => { newAvail[i.id] = available; });
    setItemAvailability(prev => ({ ...prev, ...newAvail }));
    for (const item of currentCategory.items) {
      try { await menuAPI.toggleAvailability(item.id); } catch {}
    }
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
    try {
      const uri = await pickImage();
      if (!uri) return;
      const formData = new FormData();
      formData.append('file', { uri, name: `menu_item_${itemId}.jpg`, type: 'image/jpeg' } as any);
      try {
        const res = await uploadAPI.uploadImage(formData);
        if (res?.url) {
          const fullUrl = res.url.startsWith('http') ? res.url : `${getApiBaseUrl()}${res.url}`;
          await menuAPI.updateItem(itemId, { images: [fullUrl] });
          await loadMenu();
          Alert.alert('Photo Updated', 'Menu item photo has been updated.');
          return;
        }
      } catch (uploadErr: any) {
        console.log('Upload endpoint failed, saving local URI:', uploadErr?.message);
      }
      // Fallback: save local URI directly
      await menuAPI.updateItem(itemId, { images: [uri] });
      await loadMenu();
      Alert.alert('Photo Saved', 'Photo has been saved locally.');
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.message || 'Could not save photo. Check permissions.');
    }
  };

  const currentCategory = menuCategories.find(c => c.id === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerBtn, showSearch && { backgroundColor: colors.teal }]} onPress={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}>
            <Ionicons name={showSearch ? 'close' : 'search'} size={20} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleBulkCSVUpload}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddItem(true)}>
            <Ionicons name="add" size={20} color={colors.textWhite} />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{menuCategories.reduce((sum, c) => sum + (c.items || []).length, 0)}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Object.values(itemAvailability).filter(Boolean).length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {Object.values(itemAvailability).filter(v => !v).length}
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
              {(cat.items || []).length}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.categoryTab, { borderColor: colors.teal, borderStyle: 'dashed' }]}
          onPress={() => setShowCreateCategory(true)}
        >
          <Ionicons name="add" size={16} color={colors.teal} />
          <Text style={[styles.categoryTabText, { color: colors.teal }]}>Add</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={colors.navy} />
          </View>
        )}
        {!loading && menuCategories.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textLight} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textLight, marginTop: 12 }}>No menu items yet</Text>
            <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 4 }}>Add items to your menu to get started</Text>
          </View>
        )}
        {/* Category Header */}
        {!searchQuery && currentCategory && (
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryName}>{currentCategory?.name}</Text>
          <TouchableOpacity style={styles.editCategoryBtn} onPress={handleEditCategory}>
            <Ionicons name="create-outline" size={16} color={colors.teal} />
            <Text style={styles.editCategoryText}>Edit Category</Text>
          </TouchableOpacity>
        </View>
        )}

        {searchQuery ? (
          <>
            <Text style={{ fontSize: 13, color: colors.textLight, marginBottom: 8 }}>
              Results for "{searchQuery}"
            </Text>
            {menuCategories.flatMap(c => (c.items || []).filter((i: any) =>
              i.name.toLowerCase().includes(searchQuery.toLowerCase())
            )).length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="search-outline" size={40} color={colors.textLight} />
                <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8 }}>No items match your search</Text>
              </View>
            )}
          </>
        ) : null}

        {(searchQuery
          ? menuCategories.flatMap(c => (c.items || []).filter((i: any) =>
              i.name.toLowerCase().includes(searchQuery.toLowerCase())
            ))
          : currentCategory?.items || []
        ).map((item: any) => {
          const imgArr = Array.isArray(item.images) ? item.images : [];
          const imgUri = imgArr[0] || null;
          return (
          <View key={item.id} style={[styles.menuItem, !itemAvailability[item.id] && styles.menuItemDisabled]}>
            <TouchableOpacity onPress={() => handlePickItemPhoto(item.id)}>
              {imgUri ? (
                <Image source={{ uri: imgUri }} style={[styles.itemImage, !itemAvailability[item.id] && styles.itemImageDisabled]} />
              ) : (
                <View style={[styles.itemImage, { backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="image-outline" size={28} color={colors.textLight} />
                </View>
              )}
              <View style={styles.photoOverlay}>
                <Ionicons name="camera" size={14} color={colors.textWhite} />
              </View>
            </TouchableOpacity>
            <View style={styles.itemInfo}>
              <View style={styles.itemNameRow}>
                <Text style={[styles.itemName, !itemAvailability[item.id] && styles.itemNameDisabled]}>{item.name}</Text>
                {item.isFeatured && (
                  <View style={styles.popularBadge}>
                    <Ionicons name="flame" size={10} color={colors.warning} />
                    <Text style={styles.popularText}>Featured</Text>
                  </View>
                )}
              </View>
              <Text style={styles.itemPrice}>₦{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.itemOrders}>Prep: {item.preparationTime || 15} min</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEditItem(item)}>
                  <Ionicons name="create-outline" size={16} color={colors.navy} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dupeBtn} onPress={() => handleDuplicateItem(item)}>
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
              <TouchableOpacity style={styles.moreBtn} onPress={() => openActionSheet(item)}>
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>
          );
        })}

        {/* Add Item to Category */}
        <TouchableOpacity style={styles.addItemCard} onPress={() => setShowAddItem(true)}>
          <Ionicons name="add-circle-outline" size={24} color={colors.teal} />
          <Text style={styles.addItemText}>Add item to {currentCategory?.name}</Text>
        </TouchableOpacity>

        {/* Bulk Actions */}
        <View style={styles.bulkSection}>
          <Text style={styles.bulkTitle}>Bulk Actions</Text>
          <View style={styles.bulkRow}>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkToggle(false)}>
              <Ionicons name="eye-off-outline" size={18} color={colors.warning} />
              <Text style={styles.bulkText}>Hide All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => handleBulkToggle(true)}>
              <Ionicons name="eye-outline" size={18} color={colors.teal} />
              <Text style={styles.bulkText}>Show All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => Alert.alert('Bulk Price', 'Bulk pricing coming soon.')}>
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

      {/* Add Item Modal */}
      <Modal visible={showAddItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Menu Item</Text>

            {/* Category Picker */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12, maxHeight: 40 }} contentContainerStyle={{ gap: 8 }}>
              {menuCategories.map((cat) => {
                const isSelected = (newItemCatId || selectedCategory) === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryTab, isSelected && styles.categoryTabActive, { paddingVertical: 6, paddingHorizontal: 12 }]}
                    onPress={() => setNewItemCatId(cat.id)}
                  >
                    <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive, { fontSize: 13 }]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TextInput
              style={styles.modalInput}
              placeholder="Item name"
              placeholderTextColor={colors.textLight}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Price (₦)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
            />
            <TextInput
              style={[styles.modalInput, { minHeight: 60 }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textLight}
              value={newItemDesc}
              onChangeText={setNewItemDesc}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowAddItem(false); setNewItemName(''); setNewItemPrice(''); setNewItemDesc(''); setNewItemCatId(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleAddItem}>
                <Text style={styles.modalSaveText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal visible={showEditItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Item name"
              placeholderTextColor={colors.textLight}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Price (₦)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={editPrice}
              onChangeText={setEditPrice}
            />
            <TextInput
              style={[styles.modalInput, { minHeight: 60 }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textLight}
              value={editDesc}
              onChangeText={setEditDesc}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowEditItem(false); setEditItem(null); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveEditItem}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal visible={showEditCategory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category name"
              placeholderTextColor={colors.textLight}
              value={editCatName}
              onChangeText={setEditCatName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowEditCategory(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={saveEditCategory}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3-Dot Action Sheet */}
      <Modal visible={showActions} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActions(false)}>
          <View style={[styles.modalContent, { paddingVertical: 8 }]}>
            <Text style={[styles.modalTitle, { paddingHorizontal: 0, paddingTop: 12, paddingBottom: 8 }]}>{actionItem?.name}</Text>
            <TouchableOpacity style={styles.actionRow} onPress={() => { setShowActions(false); setTimeout(() => { if (actionItem) handleEditItem(actionItem); }, 300); }}>
              <Ionicons name="create-outline" size={20} color={colors.navy} />
              <Text style={styles.actionText}>Edit Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} onPress={() => { setShowActions(false); setTimeout(() => { if (actionItem) handleDuplicateItem(actionItem); }, 300); }}>
              <Ionicons name="copy-outline" size={20} color={colors.teal} />
              <Text style={styles.actionText}>Duplicate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} onPress={() => { setShowActions(false); setTimeout(() => { if (actionItem) handlePickItemPhoto(actionItem.id); }, 300); }}>
              <Ionicons name="camera-outline" size={20} color={colors.navy} />
              <Text style={styles.actionText}>Change Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow} onPress={() => { setShowActions(false); setTimeout(() => { if (actionItem) handleToggleFeatured(actionItem); }, 300); }}>
              <Ionicons name={actionItem?.isFeatured ? 'flame' : 'flame-outline'} size={20} color={colors.warning} />
              <Text style={styles.actionText}>{actionItem?.isFeatured ? 'Remove Featured' : 'Mark as Featured'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={() => { setShowActions(false); setTimeout(() => { if (actionItem) handleDeleteItem(actionItem); }, 300); }}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Delete Item</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Create Category Modal */}
      <Modal visible={showCreateCategory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category name (e.g. Soups, Drinks, Sides)"
              placeholderTextColor={colors.textLight}
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowCreateCategory(false); setNewCatName(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleCreateCategory}>
                <Text style={styles.modalSaveText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.error + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="trash-outline" size={28} color={colors.error} />
              </View>
              <Text style={[styles.modalTitle, { marginBottom: 4 }]}>Delete Item</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>Are you sure you want to delete "{deleteTarget?.name}"? This cannot be undone.</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSave, { backgroundColor: colors.error }]} onPress={confirmDelete}>
                <Text style={styles.modalSaveText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.teal,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
