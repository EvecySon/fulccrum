import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

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
    id: 'bills',
    title: 'Bills',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=500&fit=crop',
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
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#F97316" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hi {user?.firstName || 'Guest'}</Text>
        <TouchableOpacity style={styles.headphoneButton}>
          <Ionicons name="headset-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Service Cards Grid */}
      <View style={styles.gridContainer}>
        {SERVICES.map((service, index) => (
          <Animated.View
            key={service.id}
            style={[
              styles.cardWrapper,
              { transform: [{ scale: scaleAnims[index] }] },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleServicePress(service.route)}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              activeOpacity={1}
            >
              <ImageBackground
                source={{ uri: service.imageUrl }}
                style={styles.serviceCard}
                imageStyle={styles.cardImage}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.cardGradient}
                >
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Brand Name */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandName}>FULCCRUM</Text>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  menuButton: {
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
  headphoneButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48.5%',
    aspectRatio: 0.8,
    marginBottom: 12,
  },
  serviceCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 20,
  },
  cardGradient: {
    padding: 16,
    paddingBottom: 20,
  },
  serviceTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 3,
  },
});

export default ServiceSelectionScreen;
