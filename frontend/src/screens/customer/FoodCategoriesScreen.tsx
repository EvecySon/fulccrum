import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FOOD_CATEGORIES = [
  { id: 'restaurant', name: 'Restaurants', icon: 'restaurant', color: '#FF6B6B' },
  { id: 'grocery', name: 'Grocery', icon: 'cart', color: '#4ECDC4' },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'medical', color: '#45B7D1' },
  { id: 'bakery', name: 'Bakery', icon: 'cafe', color: '#FFA07A' },
  { id: 'drinks', name: 'Drinks', icon: 'beer', color: '#98D8C8' },
  { id: 'meat', name: 'Meat & Fish', icon: 'fish', color: '#E74C3C' },
  { id: 'vegetables', name: 'Vegetables', icon: 'leaf', color: '#2ECC71' },
  { id: 'desserts', name: 'Desserts', icon: 'ice-cream', color: '#F39C12' },
];

const QUICK_FILTERS = [
  { id: 'open_now', label: 'Open Now', icon: 'time' },
  { id: 'free_delivery', label: 'Free Delivery', icon: 'bicycle' },
  { id: 'top_rated', label: 'Top Rated', icon: 'star' },
  { id: 'fast_delivery', label: 'Fast Delivery', icon: 'flash' },
];

const FoodCategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleCategoryPress = (categoryId: string) => {
    (navigation as any).navigate('CategoryBrowse', { category: categoryId });
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      (navigation as any).navigate('Search', { query: searchQuery.trim() });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food & Essentials</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, groceries, pharmacy..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Quick Filters</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              {QUICK_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    selectedFilters.includes(filter.id) && styles.filterChipActive,
                  ]}
                  onPress={() => toggleFilter(filter.id)}
                >
                  <Ionicons
                    name={filter.icon as any}
                    size={16}
                    color={selectedFilters.includes(filter.id) ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilters.includes(filter.id) && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <View style={styles.categoriesGrid}>
            {FOOD_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIconContainer,
                    { backgroundColor: `${category.color}15` },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={32}
                    color={category.color}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryArrow}>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular This Week */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular This Week</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.popularCard}>
            <View style={styles.popularIcon}>
              <Ionicons name="flame" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.popularContent}>
              <Text style={styles.popularTitle}>Trending Restaurants</Text>
              <Text style={styles.popularSubtitle}>
                Discover the most ordered restaurants this week
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>

          <View style={styles.popularCard}>
            <View style={styles.popularIcon}>
              <Ionicons name="star" size={24} color="#F39C12" />
            </View>
            <View style={styles.popularContent}>
              <Text style={styles.popularTitle}>Top Rated</Text>
              <Text style={styles.popularSubtitle}>
                Highest rated merchants near you
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>

          <View style={styles.popularCard}>
            <View style={styles.popularIcon}>
              <Ionicons name="pricetag" size={24} color="#2ECC71" />
            </View>
            <View style={styles.popularContent}>
              <Text style={styles.popularTitle}>Deals & Offers</Text>
              <Text style={styles.popularSubtitle}>
                Save more with exclusive discounts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    marginLeft: 12,
  },
  filtersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  categoryArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  popularSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  popularIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  popularContent: {
    flex: 1,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  popularSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});

export default FoodCategoriesScreen;
