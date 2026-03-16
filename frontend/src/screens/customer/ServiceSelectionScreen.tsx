import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import DrawerMenu from '../../components/DrawerMenu';

const { width } = Dimensions.get('window');
const SIDE_PADDING = 16;
const CARD_GAP = 14;
const CARD_WIDTH = (width - SIDE_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

interface ServiceCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  imageUrl: string;
  route: string;
}

const SERVICES: ServiceCard[] = [
  {
    id: 'foods',
    title: 'Foods',
    subtitle: 'Restaurants & more',
    icon: 'restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=500&fit=crop',
    route: 'HomeTabs',
  },
  {
    id: 'send-package',
    title: 'Send Package',
    subtitle: 'Fast delivery',
    icon: 'cube',
    imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=500&fit=crop',
    route: 'SendPackageHome',
  },
  {
    id: 'services',
    title: 'Services',
    subtitle: 'Home & professional',
    icon: 'construct',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=500&fit=crop',
    route: 'ServicesHome',
  },
  {
    id: 'gadgets',
    title: 'Gadgets',
    subtitle: 'Tech & electronics',
    icon: 'headset',
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=500&fit=crop',
    route: 'GadgetsHome',
  },
];

const ServiceSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const scaleAnims = useRef(SERVICES.map(() => new Animated.Value(1))).current;
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleServicePress = (route: string) => {
    (navigation as any).navigate(route);
  };

  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header - Navy */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingSmall}>Welcome back</Text>
          <Text style={styles.greetingName}>{user?.firstName || 'Guest'}</Text>
        </View>
        <TouchableOpacity style={styles.supportBtn} onPress={() => (navigation as any).navigate('Feedback')}>
          <Ionicons name="headset-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Title */}
        <Text style={styles.sectionTitle}>What do you need?</Text>

        {/* Service Cards Grid */}
        <View style={styles.gridContainer}>
          {SERVICES.map((service, index) => (
            <Animated.View
              key={service.id}
              style={{ transform: [{ scale: scaleAnims[index] }] }}
            >
              <TouchableOpacity
                onPress={() => handleServicePress(service.route)}
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                activeOpacity={1}
              >
                <ImageBackground
                  source={{ uri: service.imageUrl }}
                  style={styles.card}
                  imageStyle={styles.cardImage}
                >
                  <LinearGradient
                    colors={['rgba(23,37,84,0.1)', 'rgba(23,37,84,0.85)']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardIconWrap}>
                      <Ionicons name={service.icon as any} size={20} color="#fff" />
                    </View>
                    <Text style={styles.cardTitle}>{service.title}</Text>
                    <Text style={styles.cardSubtitle}>{service.subtitle}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Brand Footer */}
      <View style={styles.brandContainer}>
        <View style={styles.brandDot} />
        <Text style={styles.brandName}>FULCCRUM</Text>
        <View style={styles.brandDot} />
      </View>

      {/* Drawer Menu */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={(screen) => (navigation as any).navigate(screen)}
      />
    </View>
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
    backgroundColor: '#172554',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 20,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingWrap: {
    flex: 1,
    marginLeft: 14,
  },
  greetingSmall: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 1,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  supportBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 20,
    paddingBottom: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIDE_PADDING,
    justifyContent: 'space-between',
    rowGap: CARD_GAP,
    columnGap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardImage: {
    borderRadius: 20,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  brandContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#14b8a6',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e3a8a',
    letterSpacing: 4,
  },
});

export default ServiceSelectionScreen;
