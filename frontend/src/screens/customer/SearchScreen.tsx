import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { mockRestaurants } from '../../data/mockData';
import { searchAPI } from '../../services/api';

const recentSearches = ['Pizza', 'Sushi', 'Burger', 'Thai Food'];
const popularSearches = ['Fried Chicken', 'Tacos', 'Ramen', 'Salad', 'Ice Cream'];

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length === 0) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchAPI.searchBusinesses(text);
        if (res?.length) { setResults(res); return; }
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
      // Fallback to local filter
      setResults(mockRestaurants.filter(
        (r) => r.name.toLowerCase().includes(text.toLowerCase()) || r.cuisine.toLowerCase().includes(text.toLowerCase())
      ));
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, food, cuisines..."
            placeholderTextColor={colors.textLight}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length === 0 ? (
        <View style={styles.content}>
          {/* Recent Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipRow}>
              {recentSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chip}
                  onPress={() => handleSearch(item)}
                >
                  <Ionicons name="time-outline" size={14} color={colors.textLight} />
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.chipRow}>
              {popularSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.chip, styles.popularChip]}
                  onPress={() => handleSearch(item)}
                >
                  <Ionicons name="trending-up" size={14} color={colors.teal} />
                  <Text style={[styles.chipText, { color: colors.teal }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dietary Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Diet</Text>
            <View style={styles.chipRow}>
              {['Vegan', 'Gluten Free', 'Halal', 'Keto', 'Vegetarian'].map(
                (item, index) => (
                  <TouchableOpacity key={index} style={styles.dietChip}>
                    <Text style={styles.dietChipText}>{item}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() =>
                navigation.navigate('Restaurant', { restaurant: item })
              }
            >
              <Image source={{ uri: item.image }} style={styles.resultImage} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultCuisine}>{item.cuisine}</Text>
                <View style={styles.resultMeta}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={styles.resultRating}>{item.rating}</Text>
                  <Text style={styles.resultDot}>·</Text>
                  <Text style={styles.resultTime}>{item.deliveryTime}</Text>
                  <Text style={styles.resultDot}>·</Text>
                  <Text style={styles.resultFee}>{item.deliveryFee}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color={colors.textLight} />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>
                Try a different search term
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    color: colors.teal,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  popularChip: {
    backgroundColor: colors.teal + '10',
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dietChip: {
    backgroundColor: colors.navy + '10',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dietChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  resultsList: {
    padding: 20,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resultCuisine: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  resultRating: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resultDot: {
    fontSize: 13,
    color: colors.textLight,
  },
  resultTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  resultFee: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  noResults: {
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
});
