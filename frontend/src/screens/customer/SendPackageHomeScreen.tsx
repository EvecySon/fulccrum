import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { getApiBaseUrl, resolveMediaUrl } from '../../services/api';

const { width } = Dimensions.get('window');
const ACCENT = '#14b8a6';
const BG_DARK = '#1A1D2E';
const CARD_DARK = '#262B3C';
const TEXT_DIM = '#7B8494';

const QUICK_ACTIONS = [
  { id: 'send', icon: 'cube-outline', label: 'Send\nParcel', screen: 'LocationPicker' },
  { id: 'track', icon: 'locate-outline', label: 'Track\nParcel', screen: 'PackageHistory' },
  { id: 'history', icon: 'time-outline', label: 'My\nOrders', screen: 'PackageHistory' },
  { id: 'support', icon: 'headset-outline', label: 'Support', screen: 'Support' },
];

const PACKAGE_SIZES = [
  {
    id: 'small' as const,
    title: 'Small',
    subtitle: 'Documents, phone, wallet',
    weight: 'Up to 5kg',
    icon: 'document-text-outline' as const,
  },
  {
    id: 'medium' as const,
    title: 'Medium',
    subtitle: 'Laptop, clothes, small box',
    weight: '5-15kg',
    icon: 'cube-outline' as const,
  },
  {
    id: 'large' as const,
    title: 'Large',
    subtitle: 'Large box, multiple items',
    weight: '15-30kg',
    icon: 'cube' as const,
  },
];

const SendPackageHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | null>(null);
  const [searchCode, setSearchCode] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Use shared resolveMediaUrl from api.ts

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleContinue = () => {
    if (!selectedSize) return;
    (navigation as any).navigate('LocationPicker', { packageSize: selectedSize });
  };

  const handleSendNow = () => {
    if (selectedSize) {
      (navigation as any).navigate('LocationPicker', { packageSize: selectedSize });
    } else {
      // Default to small but make user aware
      setSelectedSize('small');
      scrollRef.current?.scrollToEnd({ animated: true });
      Alert.alert(
        'Package size selected',
        'We\'ve defaulted to "Small" for you. You can change it in the list below, then tap Continue.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleQuickAction = (screen: string) => {
    if (screen === 'LocationPicker') {
      const size = selectedSize || 'small';
      (navigation as any).navigate('LocationPicker', { packageSize: size });
    } else {
      (navigation as any).navigate(screen);
    }
  };

  const handleTrackSearch = () => {
    if (searchCode.trim()) {
      (navigation as any).navigate('TrackDelivery', { trackingCode: searchCode.trim() });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.userAvatar}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: resolveMediaUrl(user.avatarUrl) || '' }}
                style={styles.avatarImg}
                onError={() => {}}
              />
            ) : (
              <Text style={styles.avatarInitial}>
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.headerGreeting}>Hello,</Text>
            <Text style={styles.headerName}>{user?.firstName || 'Guest'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => (navigation as any).navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={TEXT_DIM} />
            <TextInput
              style={styles.searchInput}
              placeholder="Track parcel code..."
              placeholderTextColor={TEXT_DIM}
              value={searchCode}
              onChangeText={setSearchCode}
              onSubmitEditing={handleTrackSearch}
              returnKeyType="search"
            />
            {searchCode.length > 0 && (
              <TouchableOpacity onPress={handleTrackSearch}>
                <Ionicons name="arrow-forward-circle" size={28} color={ACCENT} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <Animated.View style={[styles.quickActions, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionItem}
              onPress={() => handleQuickAction(action.screen)}
            >
              <View style={[
                styles.quickActionIcon,
                action.id === 'send' && styles.quickActionIconAccent,
              ]}>
                <Ionicons
                  name={action.icon as any}
                  size={24}
                  color={action.id === 'send' ? BG_DARK : ACCENT}
                />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Promo Banner */}
        <Animated.View style={[styles.promoBanner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Get ready{'\n'}Move on!</Text>
            <Text style={styles.promoSubtitle}>Fast & secure delivery across the city</Text>
            <TouchableOpacity
              style={styles.promoBtn}
              onPress={handleSendNow}
            >
              <Text style={styles.promoBtnText}>Send Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoGraphic}>
            <Ionicons name="bicycle" size={60} color={ACCENT} />
          </View>
        </Animated.View>

        {/* Select Package Size */}
        <Animated.View style={[styles.sizeSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Select Package Size</Text>

          {PACKAGE_SIZES.map((size) => (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.sizeCard,
                selectedSize === size.id && styles.sizeCardSelected,
              ]}
              onPress={() => setSelectedSize(size.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.sizeIconWrap,
                selectedSize === size.id && styles.sizeIconWrapSelected,
              ]}>
                <Ionicons
                  name={size.icon}
                  size={22}
                  color={selectedSize === size.id ? BG_DARK : ACCENT}
                />
              </View>
              <View style={styles.sizeTextWrap}>
                <Text style={styles.sizeTitle}>{size.title}</Text>
                <Text style={styles.sizeSubtitle}>{size.subtitle}</Text>
              </View>
              <View style={styles.sizeRight}>
                <Text style={styles.sizeWeight}>{size.weight}</Text>
                <View style={[
                  styles.sizeCheck,
                  selectedSize === size.id && styles.sizeCheckSelected,
                ]}>
                  {selectedSize === size.id && (
                    <Ionicons name="checkmark" size={14} color={BG_DARK} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Features */}
        <View style={styles.featuresRow}>
          <View style={styles.featurePill}>
            <Ionicons name="flash" size={14} color={ACCENT} />
            <Text style={styles.featurePillText}>30-60 min</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="shield-checkmark" size={14} color={ACCENT} />
            <Text style={styles.featurePillText}>Insured</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="locate" size={14} color={ACCENT} />
            <Text style={styles.featurePillText}>Live tracking</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Continue Button */}
      {selectedSize && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={BG_DARK} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    gap: 10,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerGreeting: {
    fontSize: 12,
    color: TEXT_DIM,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionItem: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: CARD_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIconAccent: {
    backgroundColor: ACCENT,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  promoBanner: {
    marginHorizontal: 20,
    backgroundColor: CARD_DARK,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 28,
  },
  promoSubtitle: {
    fontSize: 13,
    color: TEXT_DIM,
    marginBottom: 14,
  },
  promoBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  promoGraphic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sizeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },
  sizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  sizeCardSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(20, 184, 166, 0.06)',
  },
  sizeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sizeIconWrapSelected: {
    backgroundColor: ACCENT,
  },
  sizeTextWrap: {
    flex: 1,
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  sizeSubtitle: {
    fontSize: 13,
    color: TEXT_DIM,
  },
  sizeRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  sizeWeight: {
    fontSize: 12,
    color: TEXT_DIM,
    fontWeight: '500',
  },
  sizeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#353A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeCheckSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  featurePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: BG_DARK,
  },
  continueBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});

export default SendPackageHomeScreen;
