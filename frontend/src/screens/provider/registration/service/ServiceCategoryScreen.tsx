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

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  examples: string[];
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'PLUMBING',
    name: 'Plumbing',
    icon: 'water',
    color: '#3b82f6',
    examples: ['Pipe repair', 'Leak fixing', 'Installation'],
  },
  {
    id: 'ELECTRICAL',
    name: 'Electrical',
    icon: 'flash',
    color: '#f59e0b',
    examples: ['Wiring', 'Installation', 'Repairs'],
  },
  {
    id: 'CARPENTRY',
    name: 'Carpentry',
    icon: 'hammer',
    color: '#8b5cf6',
    examples: ['Furniture', 'Doors', 'Cabinets'],
  },
  {
    id: 'PAINTING',
    name: 'Painting',
    icon: 'color-palette',
    color: '#ec4899',
    examples: ['Interior', 'Exterior', 'Decorative'],
  },
  {
    id: 'AC_REPAIR',
    name: 'AC Repair',
    icon: 'snow',
    color: '#06b6d4',
    examples: ['Servicing', 'Installation', 'Repairs'],
  },
  {
    id: 'GENERATOR',
    name: 'Generator Repair',
    icon: 'settings',
    color: '#ef4444',
    examples: ['Servicing', 'Installation', 'Repairs'],
  },
  {
    id: 'APPLIANCE',
    name: 'Appliance Repair',
    icon: 'desktop',
    color: '#10b981',
    examples: ['Fridge', 'Washing machine', 'Microwave'],
  },
  {
    id: 'ROOFING',
    name: 'Roofing',
    icon: 'home',
    color: '#f97316',
    examples: ['Installation', 'Repairs', 'Waterproofing'],
  },
  {
    id: 'WELDING',
    name: 'Welding',
    icon: 'construct',
    color: '#78716c',
    examples: ['Metal work', 'Gates', 'Railings'],
  },
  {
    id: 'TILING',
    name: 'Tiling',
    icon: 'grid',
    color: '#0ea5e9',
    examples: ['Floor', 'Wall', 'Bathroom'],
  },
  {
    id: 'GARDENING',
    name: 'Gardening',
    icon: 'leaf',
    color: '#22c55e',
    examples: ['Landscaping', 'Maintenance', 'Design'],
  },
  {
    id: 'OTHER',
    name: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#6b7280',
    examples: ['Specify your service'],
  },
];

const ServiceCategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes } = (route.params as any) || {};

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleContinue = () => {
    if (!selectedCategory) {
      Alert.alert('Required', 'Please select a service category');
      return;
    }

    const category = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);

    (navigation as any).navigate('ServiceDetails', {
      selectedTypes,
      category,
    });
  };

  const renderCategoryCard = (category: ServiceCategory) => {
    const isSelected = selectedCategory === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          isSelected && { borderColor: category.color },
        ]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: category.color + '15' },
          ]}
        >
          <Ionicons name={category.icon as any} size={32} color={category.color} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryExamples}>
          {category.examples.join(' • ')}
        </Text>
        {isSelected && (
          <View
            style={[styles.checkmark, { backgroundColor: category.color }]}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Category</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <Text style={styles.progressText}>Step 1 of 3</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>What service do you provide?</Text>
        <Text style={styles.subtitle}>
          Select the category that best describes your professional service
        </Text>

        <View style={styles.categoriesGrid}>
          {SERVICE_CATEGORIES.map(renderCategoryCard)}
        </View>
      </ScrollView>

      {/* Continue Button */}
      {selectedCategory && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.continueGradient}
            >
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
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
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  categoryExamples: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
});

export default ServiceCategoryScreen;
