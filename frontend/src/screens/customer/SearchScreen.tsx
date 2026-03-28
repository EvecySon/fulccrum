import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { searchAPI, analyticsAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Relevance', icon: 'sparkles' },
  { key: 'rating', label: 'Rating', icon: 'star' },
  { key: 'distance', label: 'Nearest', icon: 'location' },
  { key: 'delivery_time', label: 'Fastest', icon: 'time' },
  { key: 'price_low', label: 'Price: Low', icon: 'arrow-down' },
  { key: 'price_high', label: 'Price: High', icon: 'arrow-up' },
];

const DIETARY_FILTERS = ['Vegan', 'Vegetarian', 'Halal', 'Gluten Free', 'Keto', 'Dairy Free'];

export default function SearchScreen({ navigation }: any) {
  const route = useRoute();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [activeDietary, setActiveDietary] = useState<string[]>([]);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRecentSearches();
    loadPopularSearches();
    const initialQuery = (route.params as any)?.query;
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  };

  const loadPopularSearches = async () => {
    try {
      const res = await analyticsAPI.topPerformers('items', 10);
      const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      if (typeof data[0] === 'string') { setPopularSearches(data.slice(0, 8)); return; }
      const names = data.map((item: any) => item.name || item.menuItem?.name || item.itemName).filter(Boolean).slice(0, 5);
      if (names.length > 0) setPopularSearches(names);
      else setPopularSearches(['Jollof Rice', 'Suya', 'Shawarma', 'Pizza', 'Amala']);
    } catch {
      setPopularSearches(['Jollof Rice', 'Suya', 'Shawarma', 'Pizza', 'Amala']);
    }
  };

  const saveRecentSearch = async (searchTerm: string) => {
    try {
      const trimmed = searchTerm.trim();
      if (!trimmed) return;
      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem('recentSearches');
    } catch {}
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length === 0) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchAPI.searchBusinesses(text);
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setResults(Array.isArray(data) ? data : []);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Something went wrong');
        setResults([]);
      }
    }, 300);
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    handleSearch(term);
    saveRecentSearch(term);
  };

  const toggleDietary = (diet: string) => {
    setActiveDietary(prev => prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]);
  };

  const sortResults = (data: any[]) => {
    let sorted = [...data];
    switch (sortBy) {
      case 'rating': sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'distance': sorted.sort((a, b) => parseFloat(a.distance || '999') - parseFloat(b.distance || '999')); break;
      case 'delivery_time': sorted.sort((a, b) => parseInt(a.deliveryTime || '999') - parseInt(b.deliveryTime || '999')); break;
      case 'price_low': sorted.sort((a, b) => (a.averagePrice || 0) - (b.averagePrice || 0)); break;
      case 'price_high': sorted.sort((a, b) => (b.averagePrice || 0) - (a.averagePrice || 0)); break;
    }
    if (freeDeliveryOnly) {
      sorted = sorted.filter(r => !r.deliveryFee || r.deliveryFee === 'Free' || r.deliveryFee === '₦0' || r.deliveryFee === 0);
    }
    if (activeDietary.length > 0) {
      sorted = sorted.filter(r => {
        const tags = [...(r.tags || []), ...(r.dietaryOptions || [])].map((t: string) => t.toLowerCase());
        return activeDietary.some(d => tags.includes(d.toLowerCase()));
      });
    }
    return sorted;
  };

  const handleSelectResult = (business: any) => {
    saveRecentSearch(query);
    navigation.navigate('Restaurant', { restaurant: business });
  };

  const activeFilterCount = activeDietary.length + (freeDeliveryOnly ? 1 : 0) + (sortBy !== 'relevance' ? 1 : 0);

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

      {/* Filter Bar */}
      {(query.length > 0 || showFilters) && (
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            <TouchableOpacity
              style={[styles.filterChip, showFilters && styles.filterChipActive]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options" size={14} color={showFilters ? colors.textWhite : colors.textSecondary} />
              <Text style={[styles.filterChipText, showFilters && styles.filterChipTextActive]}>
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, freeDeliveryOnly && styles.filterChipActive]}
              onPress={() => setFreeDeliveryOnly(!freeDeliveryOnly)}
            >
              <Text style={[styles.filterChipText, freeDeliveryOnly && styles.filterChipTextActive]}>Free Delivery</Text>
            </TouchableOpacity>
            {DIETARY_FILTERS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.filterChip, activeDietary.includes(d) && styles.filterChipActive]}
                onPress={() => toggleDietary(d)}
              >
                <Text style={[styles.filterChipText, activeDietary.includes(d) && styles.filterChipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Sort Bar */}
      {showFilters && (
        <View style={styles.sortBar}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
                onPress={() => setSortBy(opt.key)}
              >
                <Ionicons name={opt.icon as any} size={12} color={sortBy === opt.key ? colors.textWhite : colors.textSecondary} />
                <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {query.length === 0 && !showFilters ? (
        <View style={styles.content}>
          {/* Recent Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.length > 0 ? (
            <View style={styles.chipRow}>
              {recentSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chip}
                  onPress={() => handleQuickSearch(item)}
                >
                  <Ionicons name="time-outline" size={14} color={colors.textLight} />
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            ) : (
              <Text style={styles.emptyText}>No recent searches</Text>
            )}
          </View>

          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.chipRow}>
              {popularSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.chip, styles.popularChip]}
                  onPress={() => handleQuickSearch(item)}
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
              {DIETARY_FILTERS.map(
                (item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.dietChip}
                    onPress={() => handleQuickSearch(item)}
                  >
                    <Text style={styles.dietChipText}>{item}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={sortResults(results)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelectResult(item)}
            >
              <Image source={{ uri: item.image }} style={styles.resultImage} />
              <View style={styles.resultInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  {item.isOpen === false && <View style={styles.closedTag}><Text style={styles.closedTagText}>Closed</Text></View>}
                </View>
                <Text style={styles.resultCuisine}>{item.cuisine}</Text>
                <View style={styles.resultMeta}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={styles.resultRating}>{item.rating}</Text>
                  <Text style={styles.resultDot}>·</Text>
                  <Text style={styles.resultTime}>{item.deliveryTime}</Text>
                  <Text style={styles.resultDot}>·</Text>
                  <Text style={styles.resultFee}>{item.deliveryFee === 'Free' || item.deliveryFee === 0 ? 'Free delivery' : item.deliveryFee}</Text>
                  {item.minimumOrder ? <><Text style={styles.resultDot}>·</Text><Text style={styles.resultFee}>Min ₦{Number(item.minimumOrder).toLocaleString()}</Text></> : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color={colors.textLight} />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>
                Try a different search term or adjust filters
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
  emptyText: {
    fontSize: 13,
    color: colors.textLight,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  filterBar: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textWhite,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  sortChipActive: {
    backgroundColor: colors.teal,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortChipTextActive: {
    color: colors.textWhite,
  },
  closedTag: {
    backgroundColor: colors.error + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  closedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.error,
  },
});
