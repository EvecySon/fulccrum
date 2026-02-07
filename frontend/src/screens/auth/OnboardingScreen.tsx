import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'restaurant-outline',
    iconBg: colors.teal,
    title: 'Discover Local Flavors',
    description: 'Browse hundreds of restaurants and vendors near you. From local favorites to new cuisines — it\'s all here.',
  },
  {
    id: '2',
    icon: 'flash-outline',
    iconBg: colors.navy,
    title: 'Lightning Fast Delivery',
    description: 'Track your order in real-time from kitchen to doorstep. Average delivery in under 30 minutes.',
  },
  {
    id: '3',
    icon: 'wallet-outline',
    iconBg: colors.warning,
    title: 'Easy & Secure Payments',
    description: 'Pay with cards, bank transfer, or your Fulccrum wallet. Every transaction is safe and encrypted.',
  },
  {
    id: '4',
    icon: 'gift-outline',
    iconBg: colors.error,
    title: 'Earn Rewards',
    description: 'Collect loyalty points on every order. Unlock exclusive discounts, free deliveries, and more.',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const renderSlide = ({ item }: any) => (
    <View style={styles.slide}>
      <View style={styles.illustrationArea}>
        <View style={[styles.iconCircleOuter, { backgroundColor: item.iconBg + '12' }]}>
          <View style={[styles.iconCircleInner, { backgroundColor: item.iconBg + '25' }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={48} color={colors.textWhite} />
            </View>
          </View>
        </View>
        {/* Decorative dots */}
        <View style={[styles.decorDot, styles.decorDot1, { backgroundColor: item.iconBg + '30' }]} />
        <View style={[styles.decorDot, styles.decorDot2, { backgroundColor: item.iconBg + '20' }]} />
        <View style={[styles.decorDot, styles.decorDot3, { backgroundColor: item.iconBg + '15' }]} />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip */}
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : null,
                currentIndex === index ? { backgroundColor: slides[currentIndex].iconBg } : null,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          {currentIndex < slides.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: slides[currentIndex].iconBg }]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, styles.getStartedBtn]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>Get Started</Text>
              <Ionicons name="rocket-outline" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sign in link */}
        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.signinLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 24,
  },
  skipText: { fontSize: 16, fontWeight: '600', color: colors.textLight },
  slide: { width, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center' },
  illustrationArea: {
    width: 200, height: 200, justifyContent: 'center', alignItems: 'center',
    marginBottom: 40, position: 'relative',
  },
  iconCircleOuter: {
    width: 180, height: 180, borderRadius: 90, justifyContent: 'center', alignItems: 'center',
  },
  iconCircleInner: {
    width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center',
  },
  iconCircle: {
    width: 96, height: 96, borderRadius: 32, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  decorDot: { position: 'absolute', borderRadius: 50 },
  decorDot1: { width: 16, height: 16, top: 10, right: 20 },
  decorDot2: { width: 10, height: 10, bottom: 20, left: 10 },
  decorDot3: { width: 24, height: 24, top: 50, left: 0 },
  slideTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  slideDesc: {
    fontSize: 16, color: colors.textSecondary, textAlign: 'center',
    marginTop: 12, lineHeight: 24, paddingHorizontal: 8,
  },
  bottomSection: { paddingHorizontal: 24, paddingBottom: 40 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 28, borderRadius: 4 },
  buttonsRow: { marginBottom: 16 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 14, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  getStartedBtn: { backgroundColor: colors.navy },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  signinRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  signinText: { fontSize: 15, color: colors.textSecondary },
  signinLink: { fontSize: 15, fontWeight: '700', color: colors.navy },
});
