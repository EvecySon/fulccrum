import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import OverviewScreen from '../screens/admin/OverviewScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import OrdersOpsScreen from '../screens/admin/OrdersOpsScreen';
import FinanceScreen from '../screens/admin/FinanceScreen';
import MerchantsScreen from '../screens/admin/MerchantsScreen';
import AdminSettingsScreen from '../screens/admin/SettingsScreen';
import MoreScreen from '../screens/admin/MoreScreen';
import PayoutsScreen from '../screens/admin/PayoutsScreen';
import PromoManagementScreen from '../screens/admin/PromoManagementScreen';
import SupportTicketsScreen from '../screens/admin/SupportTicketsScreen';
import ReviewModerationScreen from '../screens/admin/ReviewModerationScreen';
import DeliveryZonesManagementScreen from '../screens/admin/DeliveryZonesManagementScreen';
import PushNotificationScreen from '../screens/admin/PushNotificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          switch (route.name) {
            case 'Overview':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Finance':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'More':
              iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
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
      <Tab.Screen name="Overview" component={OverviewScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Orders" component={OrdersOpsScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="Merchants" component={MerchantsScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="Payouts" component={PayoutsScreen} />
      <Stack.Screen name="PromoManagement" component={PromoManagementScreen} />
      <Stack.Screen name="SupportTickets" component={SupportTicketsScreen} />
      <Stack.Screen name="ReviewModeration" component={ReviewModerationScreen} />
      <Stack.Screen name="DeliveryZones" component={DeliveryZonesManagementScreen} />
      <Stack.Screen name="PushNotifications" component={PushNotificationScreen} />
    </Stack.Navigator>
  );
}
