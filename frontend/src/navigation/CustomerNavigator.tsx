import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/customer/HomeScreen';
import SearchScreen from '../screens/customer/SearchScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import AccountScreen from '../screens/customer/AccountScreen';
import RestaurantScreen from '../screens/customer/RestaurantScreen';
import MenuItemScreen from '../screens/customer/MenuItemScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import AddressScreen from '../screens/customer/AddressScreen';
import VouchersScreen from '../screens/customer/VouchersScreen';
import PaymentMethodsScreen from '../screens/customer/PaymentMethodsScreen';
import LoyaltyScreen from '../screens/customer/LoyaltyScreen';
import ChatScreen from '../screens/customer/ChatScreen';
import NotificationsScreen from '../screens/customer/NotificationsScreen';
import GroupOrderScreen from '../screens/customer/GroupOrderScreen';
import FeedbackScreen from '../screens/customer/FeedbackScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import OrderChatScreen from '../screens/shared/ChatScreen';
import CallScreen from '../screens/shared/CallScreen';
import AIRecommendationsScreen from '../screens/customer/AIRecommendationsScreen';
import VoiceOrderingScreen from '../screens/customer/VoiceOrderingScreen';
import ARFoodPreviewScreen from '../screens/customer/ARFoodPreviewScreen';
import SocialFeedScreen from '../screens/customer/SocialFeedScreen';
import SustainabilityScreen from '../screens/customer/SustainabilityScreen';
import VRRestaurantTourScreen from '../screens/customer/VRRestaurantTourScreen';
import BlockchainScreen from '../screens/customer/BlockchainScreen';
import CategoryBrowseScreen from '../screens/customer/CategoryBrowseScreen';
import DealsScreen from '../screens/customer/DealsScreen';
import OnboardingScreen from '../screens/customer/OnboardingScreen';
import WalletTopUpScreen from '../screens/customer/WalletTopUpScreen';
import SendPackageHomeScreen from '../screens/customer/SendPackageHomeScreen';
import LocationPickerScreen from '../screens/customer/LocationPickerScreen';
import PackageDetailsScreen from '../screens/customer/PackageDetailsScreen';
import PriceEstimateScreen from '../screens/customer/PriceEstimateScreen';
import FindingCourierScreen from '../screens/customer/FindingCourierScreen';
import TrackDeliveryScreen from '../screens/customer/TrackDeliveryScreen';
import DeliveryCompleteScreen from '../screens/customer/DeliveryCompleteScreen';
import ServicesHomeScreen from '../screens/customer/ServicesHomeScreen';
import HomeServicesScreen from '../screens/customer/HomeServicesScreen';
import HealthServicesScreen from '../screens/customer/HealthServicesScreen';
import ServiceProviderScreen from '../screens/customer/ServiceProviderScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import BookingConfirmationScreen from '../screens/customer/BookingConfirmationScreen';
import AppointmentTrackingScreen from '../screens/customer/AppointmentTrackingScreen';
import GadgetsHomeScreen from '../screens/customer/GadgetsHomeScreen';
import ProductListScreen from '../screens/customer/ProductListScreen';
import ProductDetailsScreen from '../screens/customer/ProductDetailsScreen';
import GadgetsCartScreen from '../screens/customer/GadgetsCartScreen';
import GadgetsCheckoutScreen from '../screens/customer/GadgetsCheckoutScreen';
import GadgetsOrderTrackingScreen from '../screens/customer/GadgetsOrderTrackingScreen';
import SellerDashboardScreen from '../screens/customer/SellerDashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Wallet':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Account':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: 'transparent',
          borderRadius: 28,
          paddingBottom: 8,
          paddingTop: 12,
          height: 80,
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 14,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={PaymentMethodsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="Restaurant" component={RestaurantScreen} />
      <Stack.Screen name="MenuItem" component={MenuItemScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Addresses" component={AddressScreen} />
      <Stack.Screen name="Vouchers" component={VouchersScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="GroupOrder" component={GroupOrderScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AIRecommendations" component={AIRecommendationsScreen} />
      <Stack.Screen name="VoiceOrdering" component={VoiceOrderingScreen} />
      <Stack.Screen name="ARFoodPreview" component={ARFoodPreviewScreen} />
      <Stack.Screen name="SocialFeed" component={SocialFeedScreen} />
      <Stack.Screen name="Sustainability" component={SustainabilityScreen} />
      <Stack.Screen name="VRRestaurantTour" component={VRRestaurantTourScreen} />
      <Stack.Screen name="Blockchain" component={BlockchainScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CategoryBrowse" component={CategoryBrowseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Deals" component={DealsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderChat" component={OrderChatScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen name="WalletTopUp" component={WalletTopUpScreen} />
      <Stack.Screen name="SendPackageHome" component={SendPackageHomeScreen} />
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
      <Stack.Screen name="PackageDetails" component={PackageDetailsScreen} />
      <Stack.Screen name="PriceEstimate" component={PriceEstimateScreen} />
      <Stack.Screen name="FindingCourier" component={FindingCourierScreen} />
      <Stack.Screen name="TrackDelivery" component={TrackDeliveryScreen} />
      <Stack.Screen name="DeliveryComplete" component={DeliveryCompleteScreen} />
      <Stack.Screen name="ServicesHome" component={ServicesHomeScreen} />
      <Stack.Screen name="HomeServices" component={HomeServicesScreen} />
      <Stack.Screen name="HealthServices" component={HealthServicesScreen} />
      <Stack.Screen name="ServiceProvider" component={ServiceProviderScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="AppointmentTracking" component={AppointmentTrackingScreen} />
      <Stack.Screen name="GadgetsHome" component={GadgetsHomeScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Cart" component={GadgetsCartScreen} />
      <Stack.Screen name="GadgetsCheckout" component={GadgetsCheckoutScreen} />
      <Stack.Screen name="GadgetsOrderTracking" component={GadgetsOrderTrackingScreen} />
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
    </Stack.Navigator>
  );
}
