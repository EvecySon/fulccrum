import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import CourierDashboardScreen from '../screens/courier/DashboardScreen';
import DeliveriesScreen from '../screens/courier/DeliveriesScreen';
import ActiveDeliveryScreen from '../screens/courier/ActiveDeliveryScreen';
import EarningsScreen from '../screens/courier/EarningsScreen';
import CourierProfileScreen from '../screens/courier/ProfileScreen';
import CourierWalletScreen from '../screens/courier/WalletScreen';
import DocumentVerificationScreen from '../screens/courier/DocumentVerificationScreen';
import CourierPaymentScreen from '../screens/courier/PaymentScreen';
import PerformanceScreen from '../screens/courier/PerformanceScreen';
import GamificationScreen from '../screens/courier/GamificationScreen';
import SafetyScreen from '../screens/courier/SafetyScreen';
import VehicleManagementScreen from '../screens/courier/VehicleManagementScreen';
import OrderChatScreen from '../screens/shared/ChatScreen';
import CallScreen from '../screens/shared/CallScreen';
import OrderDetailsScreen from '../screens/courier/OrderDetailsScreen';
import HeatMapScreen from '../screens/courier/HeatMapScreen';
import SchedulingScreen from '../screens/courier/SchedulingScreen';
import QuestsScreen from '../screens/courier/QuestsScreen';
import DeliveryPreferencesScreen from '../screens/courier/DeliveryPreferencesScreen';
import ReferralScreen from '../screens/courier/ReferralScreen';
import TaxSummaryScreen from '../screens/courier/TaxSummaryScreen';
import MaintenanceRemindersScreen from '../screens/courier/MaintenanceRemindersScreen';
import TrainingScreen from '../screens/courier/TrainingScreen';
import InsuranceScreen from '../screens/courier/InsuranceScreen';
import LanguageSettingsScreen from '../screens/courier/LanguageSettingsScreen';
import ThemeSettingsScreen from '../screens/courier/ThemeSettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name="CourierTabs" component={CourierTabs} />
      <Stack.Screen name="Wallet" component={CourierWalletScreen} />
      <Stack.Screen name="DocumentVerification" component={DocumentVerificationScreen} />
      <Stack.Screen name="CourierPayment" component={CourierPaymentScreen} />
      <Stack.Screen name="Performance" component={PerformanceScreen} />
      <Stack.Screen name="Gamification" component={GamificationScreen} />
      <Stack.Screen name="Safety" component={SafetyScreen} />
      <Stack.Screen name="VehicleManagement" component={VehicleManagementScreen} />
      <Stack.Screen name="OrderChat" component={OrderChatScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="HeatMap" component={HeatMapScreen} />
      <Stack.Screen name="Scheduling" component={SchedulingScreen} />
      <Stack.Screen name="Quests" component={QuestsScreen} />
      <Stack.Screen name="DeliveryPreferences" component={DeliveryPreferencesScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="TaxSummary" component={TaxSummaryScreen} />
      <Stack.Screen name="MaintenanceReminders" component={MaintenanceRemindersScreen} />
      <Stack.Screen name="Training" component={TrainingScreen} />
      <Stack.Screen name="Insurance" component={InsuranceScreen} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
    </Stack.Navigator>
  );
}
