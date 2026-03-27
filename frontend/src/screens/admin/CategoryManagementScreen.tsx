import { showAlert } from '../../utils/alert';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { BUSINESS_CATEGORIES, BusinessCategory } from '../../config/businessCategories';

const ICON_OPTIONS = [
  'restaurant', 'fast-food', 'cart', 'cafe', 'medkit', 'storefront',
  'wine', 'flame', 'grid', 'pizza', 'ice-cream', 'beer', 'nutrition',
  'leaf', 'fish', 'paw', 'shirt', 'gift', 'book', 'hardware-chip',
];

const COLOR_OPTIONS = [
  '#ff6b35', '#e74c3c', '#2ecc71', '#f39c12', '#3498db',
  '#9b59b6', '#1abc9c', '#d35400', '#7f8c8d', '#e91e63',
  '#00bcd4', '#4caf50', '#ff9800', '#795548', '#607d8b',
];

export default function CategoryManagementScreen({ navigation }: any) {
  const [categories, setCategories] = useState<BusinessCategory[]>([...BUSINESS_CATEGORIES]);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<BusinessCategory | null>(null);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formIcon, setFormIcon] = useState('restaurant');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#ff6b35');
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState('');

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const openCreate = () => {
    setEditingCat(null);
    setFormKey('');
    setFormLabel('');
    setFormIcon('restaurant');
    setFormDescription('');
    setFormColor('#ff6b35');
    setFormActive(true);
    setFormSortOrder(String(categories.length + 1));
    setShowModal(true);
  };

  const openEdit = (cat: BusinessCategory) => {
    setEditingCat(cat);
    setFormKey(cat.key);
    setFormLabel(cat.label);
    setFormIcon(cat.icon);
    setFormDescription(cat.description);
    setFormColor(cat.color);
    setFormActive(cat.active ?? false);
    setFormSortOrder(String(cat.sortOrder));
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formLabel.trim()) {
      showAlert('Error', 'Category name is required');
      return;
    }

    const key = formKey.trim() || formLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    if (!editingCat && categories.some(c => c.key === key)) {
      showAlert('Error', 'A category with this key already exists');
      return;
    }

    const newCat: BusinessCategory = {
      key,
      label: formLabel.trim(),
      icon: formIcon,
      description: formDescription.trim(),
      color: formColor,
      active: formActive,
      sortOrder: parseInt(formSortOrder) || categories.length + 1,
    };

    if (editingCat) {
      setCategories(prev => prev.map(c => c.key === editingCat.key ? newCat : c));
      showAlert('Updated', `"${newCat.label}" category updated`);
    } else {
      setCategories(prev => [...prev, newCat]);
      showAlert('Created', `"${newCat.label}" category created`);
    }
    setShowModal(false);
  };

  const handleDelete = (cat: BusinessCategory) => {
    showAlert(
      'Delete Category',
      `Are you sure you want to delete "${cat.label}"? Merchants using this category will need to be reassigned.`,
    );
    setCategories(prev => prev.filter(c => c.key !== cat.key));
  };

  const toggleActive = (key: string) => {
    setCategories(prev => prev.map(c =>
      c.key === key ? { ...c, active: !c.active } : c
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Categories</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.teal }]}>{categories.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{categories.filter(c => c.active).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.textLight }]}>{categories.filter(c => !c.active).length}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      <Text style={styles.sectionHint}>Tap a category to edit. Toggle the switch to activate/deactivate.</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sortedCategories.map((cat) => (
          <View key={cat.key} style={[styles.catCard, !cat.active && styles.catCardInactive]}>
            <TouchableOpacity style={styles.catCardContent} onPress={() => openEdit(cat)}>
              <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon as any} size={22} color={cat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.catNameRow}>
                  <Text style={[styles.catLabel, !cat.active && { color: colors.textLight }]}>{cat.label}</Text>
                  <Text style={styles.catKey}>{cat.key}</Text>
                </View>
                <Text style={styles.catDesc} numberOfLines={1}>{cat.description}</Text>
                <Text style={styles.catOrder}>Order: {cat.sortOrder}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.catActions}>
              <Switch
                value={cat.active}
                onValueChange={() => toggleActive(cat.key)}
                trackColor={{ false: colors.border, true: colors.teal + '60' }}
                thumbColor={cat.active ? colors.teal : colors.textLight}
              />
              <TouchableOpacity onPress={() => handleDelete(cat)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create / Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCat ? 'Edit Category' : 'New Category'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <Text style={styles.fieldLabel}>Category Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Shawarma Spots"
                placeholderTextColor={colors.textLight}
                value={formLabel}
                onChangeText={setFormLabel}
              />

              {/* Key */}
              <Text style={styles.fieldLabel}>Key (auto-generated)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.lightGray }]}
                placeholder="auto_generated_from_name"
                placeholderTextColor={colors.textLight}
                value={formKey || formLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}
                onChangeText={setFormKey}
                editable={!editingCat}
              />

              {/* Description */}
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                placeholder="Brief description of this category"
                placeholderTextColor={colors.textLight}
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
              />

              {/* Sort Order */}
              <Text style={styles.fieldLabel}>Sort Order</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.textLight}
                value={formSortOrder}
                onChangeText={setFormSortOrder}
                keyboardType="number-pad"
              />

              {/* Icon Picker */}
              <Text style={styles.fieldLabel}>Icon</Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconOption, formIcon === icon && { backgroundColor: formColor + '20', borderColor: formColor }]}
                    onPress={() => setFormIcon(icon)}
                  >
                    <Ionicons name={icon as any} size={22} color={formIcon === icon ? formColor : colors.textLight} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Color Picker */}
              <Text style={styles.fieldLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorOption, { backgroundColor: c }, formColor === c && styles.colorOptionActive]}
                    onPress={() => setFormColor(c)}
                  >
                    {formColor === c && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Active Toggle */}
              <View style={styles.activeRow}>
                <Text style={styles.fieldLabel}>Active</Text>
                <Switch
                  value={formActive}
                  onValueChange={setFormActive}
                  trackColor={{ false: colors.border, true: colors.teal + '60' }}
                  thumbColor={formActive ? colors.teal : colors.textLight}
                />
              </View>

              {/* Preview */}
              <Text style={styles.fieldLabel}>Preview</Text>
              <View style={styles.previewCard}>
                <View style={[styles.previewIcon, { backgroundColor: formColor + '20' }]}>
                  <Ionicons name={formIcon as any} size={28} color={formColor} />
                </View>
                <Text style={styles.previewLabel}>{formLabel || 'Category Name'}</Text>
              </View>

              {/* Save */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editingCat ? 'Update Category' : 'Create Category'}</Text>
              </TouchableOpacity>

              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 8, marginTop: 10 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  sectionHint: { fontSize: 12, color: colors.textLight, paddingHorizontal: 16, marginTop: 10, marginBottom: 4 },
  list: { flex: 1, paddingHorizontal: 10, marginTop: 6 },
  catCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  catCardInactive: { opacity: 0.5 },
  catCardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  catNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  catKey: { fontSize: 11, color: colors.textLight, backgroundColor: colors.lightGray, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  catDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  catOrder: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  catActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  deleteBtn: { padding: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 15, color: colors.textPrimary },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOption: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorOption: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  colorOptionActive: { borderColor: colors.textPrimary },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  previewCard: { alignItems: 'center', gap: 8, padding: 20, backgroundColor: colors.lightGray, borderRadius: 16 },
  previewIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  previewLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
