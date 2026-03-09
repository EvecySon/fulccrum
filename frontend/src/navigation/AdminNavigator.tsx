import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import TicketDetailScreen from '../screens/admin/TicketDetailScreen';
import CreateTicketScreen from '../screens/admin/CreateTicketScreen';
import AgentPerformanceScreen from '../screens/admin/AgentPerformanceScreen';
import NotificationCenterScreen from '../screens/admin/NotificationCenterScreen';
import ReviewModerationScreen from '../screens/admin/ReviewModerationScreen';
import DeliveryZonesManagementScreen from '../screens/admin/DeliveryZonesManagementScreen';
import PushNotificationScreen from '../screens/admin/PushNotificationScreen';
import DisputeResolutionScreen from '../screens/admin/DisputeResolutionScreen';
import AddMerchantScreen from '../screens/admin/AddMerchantScreen';
import AddCourierScreen from '../screens/admin/AddCourierScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import MerchantApplicationReviewScreen from '../screens/admin/MerchantApplicationReviewScreen';
import CourierManagementScreen from '../screens/admin/CourierManagementScreen';
import CourierApplicationReviewScreen from '../screens/admin/CourierApplicationReviewScreen';
import CategoryManagementScreen from '../screens/admin/CategoryManagementScreen';
import ApprovePendingScreen from '../screens/admin/ApprovePendingScreen';

// Finance Screens
import CommissionTiersScreen from '../screens/admin/finance/CommissionTiersScreen';
import RevenueAnalyticsScreen from '../screens/admin/finance/RevenueAnalyticsScreen';
import RefundManagementScreen from '../screens/admin/finance/RefundManagementScreen';

// Operations Screens
import LiveOperationsMapScreen from '../screens/admin/operations/LiveOperationsMapScreen';
import IncidentManagementScreen from '../screens/admin/operations/IncidentManagementScreen';
import SLAMonitoringScreen from '../screens/admin/operations/SLAMonitoringScreen';

// RBAC Screens
import RolesManagementScreen from '../screens/admin/rbac/RolesManagementScreen';
import AuditLogsScreen from '../screens/admin/rbac/AuditLogsScreen';

// Content & Compliance Screens
import ContentModerationScreen from '../screens/admin/content/ContentModerationScreen';
import MerchantComplianceScreen from '../screens/admin/content/MerchantComplianceScreen';

// Marketing Screens
import CampaignManagementScreen from '../screens/admin/marketing/CampaignManagementScreen';
import PromoCodeManagerScreen from '../screens/admin/marketing/PromoCodeManagerScreen';

// Analytics Screens
import CustomReportsScreen from '../screens/admin/analytics/CustomReportsScreen';
import CohortAnalysisScreen from '../screens/admin/analytics/CohortAnalysisScreen';

// Schedule Management
import ScheduleManagementScreen from '../screens/admin/ScheduleManagementScreen';

// Wallet Management Screens
import AdminWalletManagementScreen from '../screens/admin/AdminWalletManagementScreen';
import AdminCreditWalletScreen from '../screens/admin/AdminCreditWalletScreen';
import AdminWalletApprovalsScreen from '../screens/admin/AdminWalletApprovalsScreen';
import AdminWalletAuditLogScreen from '../screens/admin/AdminWalletAuditLogScreen';

// Notification Template Screens
import AdminNotificationTemplatesScreen from '../screens/admin/AdminNotificationTemplatesScreen';
import AdminTemplateEditorScreen from '../screens/admin/AdminTemplateEditorScreen';
import AdminTemplateAnalyticsScreen from '../screens/admin/AdminTemplateAnalyticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="Merchants" component={MerchantsScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="Payouts" component={PayoutsScreen} />
      <Stack.Screen name="PromoManagement" component={PromoManagementScreen} />
      <Stack.Screen name="SupportTickets" component={SupportTicketsScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />
      <Stack.Screen name="AgentPerformance" component={AgentPerformanceScreen} />
      <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
      <Stack.Screen name="ReviewModeration" component={ReviewModerationScreen} />
      <Stack.Screen name="DeliveryZones" component={DeliveryZonesManagementScreen} />
      <Stack.Screen name="PushNotifications" component={PushNotificationScreen} />
      <Stack.Screen name="DisputeResolution" component={DisputeResolutionScreen} />
      <Stack.Screen name="AddMerchant" component={AddMerchantScreen} />
      <Stack.Screen name="AddCourier" component={AddCourierScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="MerchantApplicationReview" component={MerchantApplicationReviewScreen} />
      <Stack.Screen name="CourierManagement" component={CourierManagementScreen} />
      <Stack.Screen name="CourierApplicationReview" component={CourierApplicationReviewScreen} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      <Stack.Screen name="ApprovePending" component={ApprovePendingScreen} />
      
      {/* Finance Screens */}
      <Stack.Screen name="CommissionTiers" component={CommissionTiersScreen} />
      <Stack.Screen name="RevenueAnalytics" component={RevenueAnalyticsScreen} />
      <Stack.Screen name="RefundManagement" component={RefundManagementScreen} />
      
      {/* Operations Screens */}
      <Stack.Screen name="LiveOperationsMap" component={LiveOperationsMapScreen} />
      <Stack.Screen name="IncidentManagement" component={IncidentManagementScreen} />
      <Stack.Screen name="SLAMonitoring" component={SLAMonitoringScreen} />
      
      {/* RBAC Screens */}
      <Stack.Screen name="RolesManagement" component={RolesManagementScreen} />
      <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
      
      {/* Content & Compliance Screens */}
      <Stack.Screen name="ContentModeration" component={ContentModerationScreen} />
      <Stack.Screen name="MerchantCompliance" component={MerchantComplianceScreen} />
      
      {/* Marketing Screens */}
      <Stack.Screen name="CampaignManagement" component={CampaignManagementScreen} />
      <Stack.Screen name="PromoCodeManager" component={PromoCodeManagerScreen} />
      
      {/* Analytics Screens */}
      <Stack.Screen name="CustomReports" component={CustomReportsScreen} />
      <Stack.Screen name="CohortAnalysis" component={CohortAnalysisScreen} />

      {/* Schedule Management */}
      <Stack.Screen name="ScheduleManagement" component={ScheduleManagementScreen} />
      
      {/* Wallet Management Screens */}
      <Stack.Screen name="AdminWalletManagement" component={AdminWalletManagementScreen} />
      <Stack.Screen name="AdminCreditWallet" component={AdminCreditWalletScreen} />
      <Stack.Screen name="AdminWalletApprovals" component={AdminWalletApprovalsScreen} />
      <Stack.Screen name="AdminWalletAuditLog" component={AdminWalletAuditLogScreen} />
      
      {/* Notification Template Screens */}
      <Stack.Screen name="AdminNotificationTemplates" component={AdminNotificationTemplatesScreen} />
      <Stack.Screen name="AdminTemplateEditor" component={AdminTemplateEditorScreen} />
      <Stack.Screen name="AdminTemplateAnalytics" component={AdminTemplateAnalyticsScreen} />
    </Stack.Navigator>
  );
}
