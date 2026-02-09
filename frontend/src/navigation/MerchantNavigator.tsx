import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import MerchantDashboardScreen from '../screens/merchant/DashboardScreen';
import MerchantOrdersScreen from '../screens/merchant/OrdersScreen';
import MerchantMenuScreen from '../screens/merchant/MenuScreen';
import MerchantAnalyticsScreen from '../screens/merchant/AnalyticsScreen';
import MerchantSettingsScreen from '../screens/merchant/SettingsScreen';
import ReviewsScreen from '../screens/merchant/ReviewsScreen';
import InventoryScreen from '../screens/merchant/InventoryScreen';
import BusinessHoursScreen from '../screens/merchant/BusinessHoursScreen';
import DeliveryZonesScreen from '../screens/merchant/DeliveryZonesScreen';
import PromotionsScreen from '../screens/merchant/PromotionsScreen';
import WalletScreen from '../screens/merchant/WalletScreen';
import BusinessVerificationScreen from '../screens/merchant/BusinessVerificationScreen';
import MerchantPaymentScreen from '../screens/merchant/PaymentScreen';
import SmartKitchenScreen from '../screens/merchant/SmartKitchenScreen';
import AIInsightsScreen from '../screens/merchant/AIInsightsScreen';
import CRMScreen from '../screens/merchant/CRMScreen';
import MultiChannelScreen from '../screens/merchant/MultiChannelScreen';
import DynamicPricingScreen from '../screens/merchant/DynamicPricingScreen';
import OrderChatScreen from '../screens/shared/ChatScreen';
import CallScreen from '../screens/shared/CallScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MerchantTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Menu':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
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
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={MerchantDashboardScreen} />
      <Tab.Screen name="Orders" component={MerchantOrdersScreen} />
      <Tab.Screen name="Menu" component={MerchantMenuScreen} />
      <Tab.Screen name="Analytics" component={MerchantAnalyticsScreen} />
      <Tab.Screen name="Settings" component={MerchantSettingsScreen} />
    </Tab.Navigator>
  );
}

export default function MerchantNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name="MerchantTabs" component={MerchantTabs} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="BusinessHours" component={BusinessHoursScreen} />
      <Stack.Screen name="DeliveryZones" component={DeliveryZonesScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="BusinessVerification" component={BusinessVerificationScreen} />
      <Stack.Screen name="MerchantPayment" component={MerchantPaymentScreen} />
      <Stack.Screen name="SmartKitchen" component={SmartKitchenScreen} />
      <Stack.Screen name="AIInsights" component={AIInsightsScreen} />
      <Stack.Screen name="CRM" component={CRMScreen} />
      <Stack.Screen name="MultiChannel" component={MultiChannelScreen} />
      <Stack.Screen name="DynamicPricing" component={DynamicPricingScreen} />
      <Stack.Screen name="OrderChat" component={OrderChatScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
    </Stack.Navigator>
  );
}
