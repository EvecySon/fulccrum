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
const CARD_GAP = 12;
const CARD_WIDTH = (width - SIDE_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.35;

interface ServiceCard {
  id: string;
  title: string;
  imageUrl: string;
  route: string;
}

const SERVICES: ServiceCard[] = [
  {
    id: 'foods',
    title: 'Foods',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=500&fit=crop',
    route: 'HomeTabs',
  },
  {
    id: 'send-package',
    title: 'Send Package',
    imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=500&fit=crop',
    route: 'SendPackageHome',
  },
  {
    id: 'services',
    title: 'Services',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=500&fit=crop',
    route: 'ServicesHome',
  },
  {
    id: 'gadgets',
    title: 'Gadgets',
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
      toValue: 0.95,
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
    <LinearGradient
      colors={['#E9D5FF', '#FECACA', '#FDE68A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu" size={24} color="#F97316" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hi {user?.firstName || 'Ada'}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => (navigation as any).navigate('Feedback')}>
          <Ionicons name="headset-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Service Cards Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                    colors={['transparent', 'rgba(0,0,0,0.72)']}
                    style={styles.cardGradient}
                  >
                    <Text style={styles.cardTitle}>{service.title}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Brand Name */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandName}>FULCCRUM</Text>
      </View>

      {/* Drawer Menu */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={(screen) => (navigation as any).navigate(screen)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 58 : 36,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 8,
    justifyContent: 'space-between',
    rowGap: CARD_GAP,
    columnGap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'flex-end',
  },
  cardImage: {
    borderRadius: 18,
  },
  cardGradient: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingHorizontal: 14,
    paddingBottom: 18,
    paddingTop: 40,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  brandContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 4,
  },
});

export default ServiceSelectionScreen;
