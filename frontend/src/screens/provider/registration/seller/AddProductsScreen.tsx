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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
}

const AddProductsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, storeInfo, productCategories } = (route.params as any) || {};

  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productDescription, setProductDescription] = useState('');

  const handleAddProduct = () => {
    if (!productName.trim() || !productPrice.trim() || !productStock.trim()) {
      Alert.alert('Required', 'Please fill in all required fields');
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName,
      category: productCategory || productCategories[0],
      price: productPrice,
      stock: productStock,
      description: productDescription,
    };

    setProducts([...products, newProduct]);
    setProductName('');
    setProductPrice('');
    setProductStock('');
    setProductDescription('');
    setShowAddForm(false);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    if (products.length === 0) {
      Alert.alert('Required', 'Please add at least one product');
      return;
    }

    Alert.alert(
      'Submit Registration',
      'Your seller registration will be submitted for approval. This usually takes 24-48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            console.log('Registration data:', {
              selectedTypes,
              storeInfo,
              productCategories,
              products,
            });

            (navigation as any).navigate('PendingApproval', {
              providerType: 'GADGET_SELLER',
            });
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
        <Text style={styles.headerTitle}>Add Products</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Add Your Products</Text>
        <Text style={styles.hint}>Add at least 3-5 products to get started</Text>

        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productStock}>Stock: {product.stock} units</Text>
              </View>
              <View style={styles.productRight}>
                <Text style={styles.productPrice}>₦{product.price}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveProduct(product.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {showAddForm ? (
          <View style={styles.addForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., iPhone 15 Pro Max"
                value={productName}
                onChangeText={setProductName}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Price (₦) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="450000"
                  value={productPrice}
                  onChangeText={setProductPrice}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  value={productStock}
                  onChangeText={setProductStock}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Product description..."
                value={productDescription}
                onChangeText={setProductDescription}
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
                onPress={handleAddProduct}
              >
                <Text style={styles.addButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
            <Text style={styles.addNewButtonText}>Add Product</Text>
          </TouchableOpacity>
        )}

        {products.length > 0 && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#10b981" />
            <Text style={styles.infoText}>
              You've added {products.length} product{products.length !== 1 ? 's' : ''}. You can add more products later from your dashboard.
            </Text>
          </View>
        )}
      </ScrollView>

      {products.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.submitGradient}>
              <Text style={styles.submitButtonText}>Submit for Approval</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
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
  progressFill: { height: '100%', backgroundColor: '#3b82f6' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#000', marginBottom: 8 },
  hint: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 },
  productCategory: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  productStock: { fontSize: 13, color: '#374151' },
  productRight: { alignItems: 'flex-end' },
  productPrice: { fontSize: 18, fontWeight: '800', color: '#3b82f6', marginBottom: 8 },
  removeButton: { padding: 4 },
  addForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
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
  row: { flexDirection: 'row', gap: 12 },
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
    backgroundColor: '#3b82f6',
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
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
  },
  addNewButtonText: { fontSize: 16, fontWeight: '600', color: '#3b82f6', marginLeft: 8 },
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

export default AddProductsScreen;
