import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { providerAPI } from '../../../../services/api';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
}

const MENU_CATEGORIES = [
  'Appetizers',
  'Main Course',
  'Sides',
  'Desserts',
  'Beverages',
  'Specials',
];

const RestaurantMenuScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, basicInfo, locationInfo, documents } = (route.params as any) || {};

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Main Course');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');

  const handleAddItem = () => {
    if (!itemName.trim() || !itemPrice.trim()) {
      Alert.alert('Required', 'Please enter item name and price');
      return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: itemName,
      category: itemCategory,
      price: itemPrice,
      description: itemDescription,
    };

    setMenuItems([...menuItems, newItem]);
    setItemName('');
    setItemPrice('');
    setItemDescription('');
    setShowAddForm(false);
  };

  const handleRemoveItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
    if (menuItems.length === 0) {
      Alert.alert('Required', 'Please add at least one menu item');
      return;
    }

    Alert.alert(
      'Submit Registration',
      'Your restaurant registration will be submitted for approval. This usually takes 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSubmitting(true);

              const registrationData = {
                businessName: basicInfo?.businessName || '',
                restaurantType: selectedTypes?.[0] || 'RESTAURANT',
                cuisineTypes: basicInfo?.cuisineTypes || [],
                description: basicInfo?.description || '',
                businessEmail: basicInfo?.businessEmail || '',
                businessPhone: basicInfo?.businessPhone || '',
                address: locationInfo?.address || '',
                city: locationInfo?.city || '',
                state: locationInfo?.state || '',
                latitude: locationInfo?.latitude || 0,
                longitude: locationInfo?.longitude || 0,
                deliveryRadius: locationInfo?.deliveryRadius || 5,
                operatingHours: basicInfo?.operatingHours || {},
                foodLicense: documents?.foodLicense || '',
                businessRegNumber: documents?.businessRegNumber || '',
                kitchenPhotos: documents?.kitchenPhotos || [],
                menuItems: menuItems.map(item => ({
                  name: item.name,
                  category: item.category,
                  price: item.price,
                  description: item.description || '',
                })),
              };

              const response = await providerAPI.registerRestaurant(registrationData);

              setSubmitting(false);

              if (response.success) {
                Alert.alert(
                  'Success!',
                  response.message || 'Your restaurant registration has been submitted successfully.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        (navigation as any).navigate('PendingApproval', {
                          providerType: 'RESTAURANT',
                        });
                      },
                    },
                  ]
                );
              }
            } catch (error: any) {
              setSubmitting(false);
              Alert.alert(
                'Submission Failed',
                error?.response?.data?.message || error?.message || 'Failed to submit registration. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Items</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Step 4 of 4</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Add Menu Items</Text>
        <Text style={styles.hint}>Add at least 3-5 popular items to get started</Text>

        {/* Menu Items List */}
        {menuItems.map((item) => (
          <View key={item.id} style={styles.menuItemCard}>
            <View style={styles.menuItemHeader}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemCategory}>{item.category}</Text>
                {item.description ? (
                  <Text style={styles.menuItemDesc}>{item.description}</Text>
                ) : null}
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemPrice}>₦{item.price}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Add Item Form */}
        {showAddForm ? (
          <View style={styles.addForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Jollof Rice with Chicken"
                value={itemName}
                onChangeText={setItemName}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryChips}>
                {MENU_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      itemCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setItemCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        itemCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (₦) *</Text>
              <TextInput
                style={styles.input}
                placeholder="2500"
                value={itemPrice}
                onChangeText={setItemPrice}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description of the dish..."
                value={itemDescription}
                onChangeText={setItemDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddItem}
              >
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#ef4444" />
            <Text style={styles.addNewButtonText}>Add Menu Item</Text>
          </TouchableOpacity>
        )}

        {menuItems.length > 0 && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#10b981" />
            <Text style={styles.infoText}>
              You've added {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}. You can add more items later from your dashboard.
            </Text>
          </View>
        )}
      </ScrollView>

      {menuItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.submitGradient}>
              {submitting ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Submitting...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Submit for Approval</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  progressContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  progressBar: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ef4444' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#000', marginBottom: 8 },
  hint: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 },
  menuItemCategory: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  menuItemDesc: { fontSize: 14, color: '#374151', marginTop: 4 },
  menuItemRight: { alignItems: 'flex-end' },
  menuItemPrice: { fontSize: 18, fontWeight: '800', color: '#ef4444', marginBottom: 8 },
  removeButton: { padding: 4 },
  addForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: { height: 80, paddingTop: 12 },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  categoryChipActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  categoryChipTextActive: { color: '#fff' },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 15, fontWeight: '700', color: '#6b7280' },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  addButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
  },
  addNewButtonText: { fontSize: 16, fontWeight: '600', color: '#ef4444', marginLeft: 8 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 16,
  },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#065f46', lineHeight: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: { borderRadius: 12, overflow: 'hidden' },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#fff', marginRight: 8 },
});

export default RestaurantMenuScreen;
