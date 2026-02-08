import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { menuAPI } from '../../services/api';

// Modifier groups matching backend ItemModifier + ModifierOption structure
const mockModifierGroups = [
  {
    id: 'm1',
    name: 'Size',
    type: 'single',
    isRequired: true,
    options: [
      { id: 'o1', name: 'Regular', priceAdjustment: 0 },
      { id: 'o2', name: 'Large', priceAdjustment: 500 },
      { id: 'o3', name: 'Extra Large', priceAdjustment: 1000 },
    ],
  },
  {
    id: 'm2',
    name: 'Toppings',
    type: 'multiple',
    isRequired: false,
    options: [
      { id: 'o4', name: 'Extra Cheese', priceAdjustment: 300 },
      { id: 'o5', name: 'Bacon', priceAdjustment: 500 },
      { id: 'o6', name: 'Avocado', priceAdjustment: 400 },
      { id: 'o7', name: 'Jalapeños', priceAdjustment: 200 },
      { id: 'o8', name: 'Caramelized Onions', priceAdjustment: 250 },
    ],
  },
  {
    id: 'm3',
    name: 'Sauce',
    type: 'single',
    isRequired: false,
    options: [
      { id: 'o9', name: 'Ketchup', priceAdjustment: 0 },
      { id: 'o10', name: 'Mayo', priceAdjustment: 0 },
      { id: 'o11', name: 'BBQ Sauce', priceAdjustment: 0 },
      { id: 'o12', name: 'Spicy Sauce', priceAdjustment: 100 },
    ],
  },
];

export default function MenuItemScreen({ route, navigation }: any) {
  const { item, restaurant } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [modifierGroups, setModifierGroups] = useState(mockModifierGroups);

  useEffect(() => {
    (async () => {
      try {
        const res = await menuAPI.getModifiers(restaurant?.id || 'me');
        if (res?.length) setModifierGroups(res);
      } catch {}
    })();
  }, [restaurant?.id]);
  // Modifier selections: { [groupId]: optionId } for single, { [groupId]: optionId[] } for multiple
  const [modifierSelections, setModifierSelections] = useState<Record<string, string | string[]>>({
    m1: 'o1', // Default to Regular size
  });

  const toggleCustomization = (id: string) => {
    setSelectedCustomizations((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectSingleOption = (groupId: string, optionId: string) => {
    setModifierSelections((prev) => ({ ...prev, [groupId]: optionId }));
  };

  const toggleMultiOption = (groupId: string, optionId: string) => {
    setModifierSelections((prev) => {
      const current = (prev[groupId] as string[]) || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [groupId]: updated };
    });
  };

  const customizationTotal = item.customizations
    .filter((c: any) => selectedCustomizations.includes(c.id))
    .reduce((sum: number, c: any) => sum + c.price, 0);

  // Calculate modifier total
  const modifierTotal = modifierGroups.reduce((sum, group) => {
    const selection = modifierSelections[group.id];
    if (!selection) return sum;
    if (group.type === 'single') {
      const opt = group.options.find((o) => o.id === selection);
      return sum + (opt?.priceAdjustment || 0);
    } else {
      const selectedIds = selection as string[];
      return sum + group.options
        .filter((o) => selectedIds.includes(o.id))
        .reduce((s, o) => s + o.priceAdjustment, 0);
    }
  }, 0);

  const totalPrice = (item.price + customizationTotal + modifierTotal) * quantity;

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Item Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
          </TouchableOpacity>
        </View>

        {/* Item Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₦{item.price.toFixed(2)}</Text>
          </View>
          <Text style={styles.itemDesc}>{item.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={16} color={colors.warning} />
              <Text style={styles.metaText}>{item.calories} cal</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.teal} />
              <Text style={styles.metaText}>{item.prepTime}</Text>
            </View>
          </View>
        </View>

        {/* Modifier Groups */}
        {modifierGroups.map((group) => (
          <View key={group.id} style={styles.modifierSection}>
            <View style={styles.modifierHeader}>
              <View>
                <Text style={styles.sectionTitle}>{group.name}</Text>
                <Text style={styles.modifierSubtitle}>
                  {group.type === 'single' ? 'Choose one' : 'Choose any'}
                  {group.isRequired ? ' · Required' : ' · Optional'}
                </Text>
              </View>
              {group.isRequired && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              )}
            </View>

            {group.type === 'single' ? (
              // Radio buttons for single-select
              group.options.map((option) => {
                const isSelected = modifierSelections[group.id] === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.modifierOption, isSelected && styles.modifierOptionActive]}
                    onPress={() => selectSingleOption(group.id, option.id)}
                  >
                    <View style={styles.modifierOptionInfo}>
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.modifierOptionName, isSelected && styles.modifierOptionNameActive]}>
                        {option.name}
                      </Text>
                    </View>
                    <Text style={styles.modifierOptionPrice}>
                      {option.priceAdjustment > 0 ? `+₦${option.priceAdjustment.toLocaleString()}` : 'Included'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              // Checkboxes for multi-select
              group.options.map((option) => {
                const selectedIds = (modifierSelections[group.id] as string[]) || [];
                const isSelected = selectedIds.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.modifierOption, isSelected && styles.modifierOptionActive]}
                    onPress={() => toggleMultiOption(group.id, option.id)}
                  >
                    <View style={styles.modifierOptionInfo}>
                      <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color={colors.textWhite} />}
                      </View>
                      <Text style={[styles.modifierOptionName, isSelected && styles.modifierOptionNameActive]}>
                        {option.name}
                      </Text>
                    </View>
                    <Text style={styles.modifierOptionPrice}>
                      {option.priceAdjustment > 0 ? `+₦${option.priceAdjustment.toLocaleString()}` : 'Free'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ))}

        {/* Legacy Customizations (from menu item data) */}
        {item.customizations && item.customizations.length > 0 && (
          <View style={styles.modifierSection}>
            <Text style={styles.sectionTitle}>Extras</Text>
            <Text style={styles.modifierSubtitle}>Choose any · Optional</Text>
            {item.customizations.map((custom: any) => {
              const isSelected = selectedCustomizations.includes(custom.id);
              return (
                <TouchableOpacity
                  key={custom.id}
                  style={[styles.modifierOption, isSelected && styles.modifierOptionActive]}
                  onPress={() => toggleCustomization(custom.id)}
                >
                  <View style={styles.modifierOptionInfo}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color={colors.textWhite} />}
                    </View>
                    <Text style={[styles.modifierOptionName, isSelected && styles.modifierOptionNameActive]}>
                      {custom.name}
                    </Text>
                  </View>
                  <Text style={styles.modifierOptionPrice}>
                    {custom.price > 0 ? `+₦${custom.price.toLocaleString()}` : 'Free'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Special Instructions */}
        <View style={styles.specialSection}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TouchableOpacity style={styles.instructionInput}>
            <Ionicons name="create-outline" size={20} color={colors.textLight} />
            <Text style={styles.instructionPlaceholder}>
              Add special instructions...
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.voiceBtn}>
            <Ionicons name="mic-outline" size={20} color={colors.teal} />
            <Text style={styles.voiceBtnText}>Voice Note</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color={colors.navy} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.addToCartText}>
            Add to Cart · ₦{totalPrice.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.teal,
  },
  itemDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modifierSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginTop: 8,
  },
  modifierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modifierSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  requiredBadge: {
    backgroundColor: colors.error + '12',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modifierOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modifierOptionActive: {
    backgroundColor: colors.teal + '06',
  },
  modifierOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modifierOptionName: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  modifierOptionNameActive: {
    fontWeight: '600',
    color: colors.teal,
  },
  modifierOptionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: colors.teal,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.teal,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  specialSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginTop: 8,
  },
  instructionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  instructionPlaceholder: {
    fontSize: 14,
    color: colors.textLight,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  voiceBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    gap: 16,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    gap: 12,
  },
  quantityBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
