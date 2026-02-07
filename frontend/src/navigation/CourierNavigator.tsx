import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import CourierDashboardScreen from '../screens/courier/DashboardScreen';
import DeliveriesScreen from '../screens/courier/DeliveriesScreen';
import ActiveDeliveryScreen from '../screens/courier/ActiveDeliveryScreen';
import EarningsScreen from '../screens/courier/EarningsScreen';
import CourierProfileScreen from '../screens/courier/ProfileScreen';
import CourierWalletScreen from '../screens/courier/WalletScreen';
import DocumentVerificationScreen from '../screens/courier/DocumentVerificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CourierTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Deliveries':
              iconName = focused ? 'bicycle' : 'bicycle-outline';
              break;
            case 'Active':
              iconName = focused ? 'navigate' : 'navigate-outline';
              break;
            case 'Earnings':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.teal,
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
      <Tab.Screen name="Dashboard" component={CourierDashboardScreen} />
      <Tab.Screen name="Deliveries" component={DeliveriesScreen} />
      <Tab.Screen name="Active" component={ActiveDeliveryScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={CourierProfileScreen} />
    </Tab.Navigator>
  );
}

export default function CourierNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}>
      <Stack.Screen name="CourierTabs" component={CourierTabs} />
      <Stack.Screen name="Wallet" component={CourierWalletScreen} />
      <Stack.Screen name="DocumentVerification" component={DocumentVerificationScreen} />
    </Stack.Navigator>
  );
}
