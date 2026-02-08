import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { arAPI } from '../../services/api';

interface TourHotspot {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface RestaurantTour {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisine: string;
  duration: string;
  hotspots: TourHotspot[];
  description: string;
}

const mockTours: RestaurantTour[] = [
  {
    id: '1',
    name: 'Mama\'s Kitchen',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    rating: 4.8,
    cuisine: 'Nigerian',
    duration: '2:30',
    description: 'Experience the warm, vibrant atmosphere of Mama\'s Kitchen. See the open kitchen where traditional Nigerian dishes are prepared with love.',
    hotspots: [
      { id: 'h1', label: 'Main Dining', icon: 'restaurant', description: 'Spacious dining area with traditional decor' },
      { id: 'h2', label: 'Open Kitchen', icon: 'flame', description: 'Watch chefs prepare your meal in real-time' },
      { id: 'h3', label: 'Outdoor Patio', icon: 'sunny', description: 'Al fresco dining under string lights' },
    ],
  },
  {
    id: '2',
    name: 'Sushi Palace',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
    rating: 4.6,
    cuisine: 'Japanese',
    duration: '3:00',
    description: 'Step into the serene world of Sushi Palace. From the conveyor belt to the private tatami rooms, experience authentic Japanese dining.',
    hotspots: [
      { id: 'h1', label: 'Sushi Bar', icon: 'fish', description: 'Watch master chefs craft sushi before your eyes' },
      { id: 'h2', label: 'Tatami Room', icon: 'bed', description: 'Private traditional Japanese dining rooms' },
      { id: 'h3', label: 'Sake Lounge', icon: 'wine', description: 'Curated selection of premium sake' },
    ],
  },
  {
    id: '3',
    name: 'The Urban Spoon',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    rating: 4.9,
    cuisine: 'Fine Dining',
    duration: '4:00',
    description: 'Tour the award-winning Urban Spoon. Elegant interiors, a world-class wine cellar, and the chef\'s table experience await.',
    hotspots: [
      { id: 'h1', label: 'Wine Cellar', icon: 'wine', description: 'Over 500 bottles from around the world' },
      { id: 'h2', label: 'Chef\'s Table', icon: 'star', description: 'Exclusive 8-seat dining with the head chef' },
      { id: 'h3', label: 'Rooftop Bar', icon: 'moon', description: 'Cocktails with panoramic city views' },
      { id: 'h4', label: 'Garden Terrace', icon: 'leaf', description: 'Farm-to-table herb garden on site' },
    ],
  },
  {
    id: '4',
    name: 'Pizza Roma',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
    rating: 4.5,
    cuisine: 'Italian',
    duration: '2:00',
    description: 'A rustic Italian trattoria with a wood-fired oven imported from Naples. See where the magic happens.',
    hotspots: [
      { id: 'h1', label: 'Wood-Fire Oven', icon: 'flame', description: 'Authentic Neapolitan pizza oven at 450°C' },
      { id: 'h2', label: 'Pasta Station', icon: 'restaurant', description: 'Fresh pasta made daily by hand' },
    ],
  },
];

export default function VRRestaurantTourScreen({ navigation, route }: any) {
  const businessId = route?.params?.businessId;
  const [selectedTour, setSelectedTour] = useState<RestaurantTour | null>(null);
  const [vrActive, setVrActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<TourHotspot | null>(null);

  const handleStartTour = async (tour: RestaurantTour) => {
    setSelectedTour(tour);
    setLoading(true);
    try {
      await arAPI.getRestaurantTour(tour.id);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setTimeout(() => {
      setLoading(false);
      setVrActive(true);
    }, 1500);
  };

  const handleExitTour = () => {
    setVrActive(false);
    setActiveHotspot(null);
  };

  // VR Active View
  if (vrActive && selectedTour) {
    return (
      <View style={styles.container}>
        {/* Simulated VR viewport */}
        <Image source={{ uri: selectedTour.image }} style={styles.vrViewport} blurRadius={1} />
        <View style={styles.vrOverlay}>
          {/* Top bar */}
          <View style={styles.vrTopBar}>
            <TouchableOpacity style={styles.vrExitBtn} onPress={handleExitTour}>
              <Ionicons name="close" size={22} color={colors.textWhite} />
            </TouchableOpacity>
            <View style={styles.vrTitlePill}>
              <Ionicons name="videocam" size={14} color={colors.teal} />
              <Text style={styles.vrTitleText}>{selectedTour.name}</Text>
            </View>
            <View style={styles.vrLiveBadge}>
              <View style={styles.vrLiveDot} />
              <Text style={styles.vrLiveText}>VR</Text>
            </View>
          </View>

          {/* Hotspot info */}
          {activeHotspot && (
            <View style={styles.hotspotInfo}>
              <Ionicons name={activeHotspot.icon as any} size={22} color={colors.teal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.hotspotInfoTitle}>{activeHotspot.label}</Text>
                <Text style={styles.hotspotInfoDesc}>{activeHotspot.description}</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveHotspot(null)}>
                <Ionicons name="close-circle" size={22} color={colors.textWhite + '80'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Hotspot buttons */}
          <View style={styles.vrHotspotsRow}>
            {selectedTour.hotspots.map((h) => (
              <TouchableOpacity
                key={h.id}
                style={[styles.vrHotspotBtn, activeHotspot?.id === h.id && styles.vrHotspotBtnActive]}
                onPress={() => setActiveHotspot(h)}
              >
                <Ionicons name={h.icon as any} size={18} color={colors.textWhite} />
                <Text style={styles.vrHotspotLabel}>{h.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom controls */}
          <View style={styles.vrBottomBar}>
            <TouchableOpacity style={styles.vrControlBtn}>
              <Ionicons name="expand" size={20} color={colors.textWhite} />
              <Text style={styles.vrControlText}>360°</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vrControlBtn}>
              <Ionicons name="volume-high" size={20} color={colors.textWhite} />
              <Text style={styles.vrControlText}>Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.vrControlBtn, styles.vrOrderBtn]} onPress={() => {
              handleExitTour();
              navigation.navigate('Restaurant', { businessId: selectedTour.id });
            }}>
              <Ionicons name="cart" size={20} color={colors.textWhite} />
              <Text style={styles.vrControlText}>Order Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vrControlBtn}>
              <Ionicons name="share-social" size={20} color={colors.textWhite} />
              <Text style={styles.vrControlText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Loading
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Loading VR Tour...</Text>
        <Text style={styles.loadingSubtext}>Preparing immersive experience</Text>
      </View>
    );
  }

  // Tour List
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VR Restaurant Tours</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Explore Restaurants</Text>
        <Text style={styles.subtitle}>Take a virtual tour before you order</Text>

        {/* Feature banner */}
        <View style={styles.featureBanner}>
          <View style={styles.featureIconWrap}>
            <Ionicons name="glasses" size={28} color={colors.textWhite} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Immersive VR Tours</Text>
            <Text style={styles.featureDesc}>
              Walk through restaurants virtually. See the ambiance, kitchen, and seating before visiting.
            </Text>
          </View>
        </View>

        {/* Tour cards */}
        {mockTours.map((tour) => (
          <TouchableOpacity
            key={tour.id}
            style={styles.tourCard}
            onPress={() => handleStartTour(tour)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: tour.image }} style={styles.tourImage} />
            <View style={styles.tourDurationBadge}>
              <Ionicons name="time" size={12} color={colors.textWhite} />
              <Text style={styles.tourDurationText}>{tour.duration} min</Text>
            </View>
            <View style={styles.tourInfo}>
              <View style={styles.tourTitleRow}>
                <Text style={styles.tourName}>{tour.name}</Text>
                <View style={styles.tourRating}>
                  <Ionicons name="star" size={13} color={colors.warning} />
                  <Text style={styles.tourRatingText}>{tour.rating}</Text>
                </View>
              </View>
              <Text style={styles.tourCuisine}>{tour.cuisine}</Text>
              <Text style={styles.tourDesc} numberOfLines={2}>{tour.description}</Text>
              <View style={styles.tourHotspotsPreview}>
                {tour.hotspots.map((h) => (
                  <View key={h.id} style={styles.tourHotspotChip}>
                    <Ionicons name={h.icon as any} size={12} color={colors.teal} />
                    <Text style={styles.tourHotspotChipText}>{h.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.tourStartRow}>
                <Ionicons name="videocam" size={16} color={colors.teal} />
                <Text style={styles.tourStartText}>Start VR Tour</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.teal} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textLight, marginTop: 4, marginBottom: 20 },

  // Feature banner
  featureBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.navy, borderRadius: 18, padding: 18, marginBottom: 24,
  },
  featureIconWrap: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: colors.teal,
    justifyContent: 'center', alignItems: 'center',
  },
  featureTitle: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  featureDesc: { fontSize: 12, color: colors.textWhite + 'AA', marginTop: 3, lineHeight: 17 },

  // Tour card
  tourCard: {
    backgroundColor: colors.lightGray, borderRadius: 18, marginBottom: 16, overflow: 'hidden',
  },
  tourImage: { width: '100%', height: 180, resizeMode: 'cover' },
  tourDurationBadge: {
    position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  tourDurationText: { fontSize: 11, fontWeight: '700', color: colors.textWhite },
  tourInfo: { padding: 16 },
  tourTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tourName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  tourRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tourRatingText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  tourCuisine: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  tourDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },
  tourHotspotsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tourHotspotChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.teal + '12', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  tourHotspotChipText: { fontSize: 11, fontWeight: '600', color: colors.teal },
  tourStartRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border,
  },
  tourStartText: { fontSize: 14, fontWeight: '700', color: colors.teal, flex: 1 },

  // Loading
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 20 },
  loadingSubtext: { fontSize: 14, color: colors.textLight, marginTop: 4 },

  // VR Active
  vrViewport: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  vrOverlay: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  vrTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20,
  },
  vrExitBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  vrTitlePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  vrTitleText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  vrLiveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.teal, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  vrLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textWhite },
  vrLiveText: { fontSize: 11, fontWeight: '800', color: colors.textWhite },

  // Hotspot info
  hotspotInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 16,
  },
  hotspotInfoTitle: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  hotspotInfoDesc: { fontSize: 12, color: colors.textWhite + 'BB', marginTop: 2 },

  // Hotspot buttons
  vrHotspotsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    paddingHorizontal: 20, flexWrap: 'wrap',
  },
  vrHotspotBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  vrHotspotBtnActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  vrHotspotLabel: { fontSize: 12, fontWeight: '600', color: colors.textWhite },

  // Bottom controls
  vrBottomBar: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingBottom: 40, paddingHorizontal: 20,
  },
  vrControlBtn: { alignItems: 'center', gap: 4 },
  vrControlText: { fontSize: 10, fontWeight: '600', color: colors.textWhite },
  vrOrderBtn: {
    backgroundColor: colors.teal, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10,
  },
});
