import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const PRODUCT_CATEGORIES: Category[] = [
  { id: 'phones', name: 'Phones & Tablets', icon: 'phone-portrait', color: '#3b82f6' },
  { id: 'laptops', name: 'Laptops & Computers', icon: 'laptop', color: '#8b5cf6' },
  { id: 'accessories', name: 'Accessories', icon: 'headset', color: '#ec4899' },
  { id: 'watches', name: 'Smart Watches', icon: 'watch', color: '#f59e0b' },
  { id: 'gaming', name: 'Gaming', icon: 'game-controller', color: '#ef4444' },
  { id: 'audio', name: 'Audio & Sound', icon: 'musical-notes', color: '#10b981' },
  { id: 'cameras', name: 'Cameras', icon: 'camera', color: '#06b6d4' },
  { id: 'tv', name: 'TVs & Displays', icon: 'tv', color: '#f97316' },
  { id: 'home', name: 'Home Appliances', icon: 'home', color: '#14b8a6' },
  { id: 'office', name: 'Office Equipment', icon: 'briefcase', color: '#6366f1' },
];

const ProductCategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, storeInfo } = (route.params as any) || {};

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleContinue = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Required', 'Please select at least one product category');
      return;
    }

    (navigation as any).navigate('AddProducts', {
      selectedTypes,
      storeInfo,
      productCategories: selectedCategories,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Categories</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.progressText}>Step 2 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What do you sell?</Text>
        <Text style={styles.subtitle}>
          Select all product categories you want to sell
        </Text>

        <View style={styles.categoriesGrid}>
          {PRODUCT_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isSelected && { borderColor: category.color },
                ]}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: category.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={32}
                    color={category.color}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                {isSelected && (
                  <View
                    style={[styles.checkmark, { backgroundColor: category.color }]}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedCategories.length > 0 && (
          <View style={styles.selectedBox}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.selectedText}>
              {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
            </Text>
          </View>
        )}
      </ScrollView>

      {selectedCategories.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.continueGradient}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  title: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24, lineHeight: 24 },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 24,
  },
  selectedText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#065f46',
  },
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
  continueButton: { borderRadius: 12, overflow: 'hidden' },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: { fontSize: 16, fontWeight: '700', color: '#fff', marginRight: 8 },
});

export default ProductCategoriesScreen;
