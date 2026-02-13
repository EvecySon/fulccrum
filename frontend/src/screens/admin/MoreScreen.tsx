import { showAlert } from '../../utils/alert';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';

const menuSections = [
  {
    title: 'Finance',
    items: [
      { icon: 'cash-outline', label: 'Commission Tiers', desc: 'Manage commission structures', screen: 'CommissionTiers', color: colors.success },
      { icon: 'trending-up-outline', label: 'Revenue Analytics', desc: 'View revenue & forecasts', screen: 'RevenueAnalytics', color: colors.info },
      { icon: 'return-down-back-outline', label: 'Refund Management', desc: 'Approve/reject refunds', screen: 'RefundManagement', color: colors.warning },
      { icon: 'wallet-outline', label: 'Payouts', desc: 'Pay merchants & couriers', screen: 'Payouts', color: colors.success },
    ],
  },
  {
    title: 'Operations',
    items: [
      { icon: 'map-outline', label: 'Live Operations', desc: 'Real-time order tracking', screen: 'LiveOperationsMap', color: colors.navy },
      { icon: 'alert-circle-outline', label: 'Incident Management', desc: 'Track & resolve incidents', screen: 'IncidentManagement', color: colors.error },
      { icon: 'time-outline', label: 'SLA Monitoring', desc: 'Monitor service levels', screen: 'SLAMonitoring', color: colors.warning },
    ],
  },
  {
    title: 'Security & Access',
    items: [
      { icon: 'key-outline', label: 'Roles Management', desc: 'Manage admin roles', screen: 'RolesManagement', color: colors.navy },
      { icon: 'document-text-outline', label: 'Audit Logs', desc: 'View system audit trail', screen: 'AuditLogs', color: colors.textSecondary },
      { icon: 'shield-outline', label: 'Admin Users', desc: 'Create & manage admins', screen: 'AdminUsers', color: colors.navy },
    ],
  },
  {
    title: 'Content & Compliance',
    items: [
      { icon: 'flag-outline', label: 'Content Moderation', desc: 'Review flagged content', screen: 'ContentModeration', color: colors.warning },
      { icon: 'shield-checkmark-outline', label: 'Merchant Compliance', desc: 'Track licenses & permits', screen: 'MerchantCompliance', color: colors.success },
      { icon: 'storefront-outline', label: 'Merchants', desc: 'Manage restaurants & stores', screen: 'Merchants', color: colors.teal },
      { icon: 'document-text-outline', label: 'Merchant Applications', desc: 'Review & approve merchant apps', screen: 'MerchantApplicationReview', color: colors.navy },
      { icon: 'bicycle-outline', label: 'Courier Management', desc: 'Review & manage couriers', screen: 'CourierManagement', color: colors.teal },
      { icon: 'clipboard-outline', label: 'Courier Applications', desc: 'Review & approve courier apps', screen: 'CourierApplicationReview', color: colors.navy },
      { icon: 'grid-outline', label: 'Business Categories', desc: 'Manage business categories', screen: 'CategoryManagement', color: colors.warning },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { icon: 'megaphone-outline', label: 'Campaign Management', desc: 'Create & launch campaigns', screen: 'CampaignManagement', color: colors.warning },
      { icon: 'pricetag-outline', label: 'Promo Code Manager', desc: 'Manage promo codes', screen: 'PromoCodeManager', color: colors.info },
      { icon: 'notifications-outline', label: 'Push Notifications', desc: 'Send announcements', screen: 'PushNotifications', color: colors.navy },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { icon: 'bar-chart-outline', label: 'Custom Reports', desc: 'Build custom reports', screen: 'CustomReports', color: colors.info },
      { icon: 'people-outline', label: 'Cohort Analysis', desc: 'User retention analysis', screen: 'CohortAnalysis', color: colors.teal },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: 'construct-outline', label: 'Settings & Config', desc: 'Platform settings', screen: 'AdminSettings', color: colors.teal },
    ],
  },
];

export default function MoreScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    showAlert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={() => item.screen && navigation.navigate(item.screen)}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Admin Info */}
        <View style={styles.adminCard}>
          <View style={styles.adminAvatar}>
            <Ionicons name="shield" size={24} color={colors.navy} />
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.adminRole}>Admin</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Fulccrum Admin v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16,
    padding: 16, marginBottom: 8, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  menuIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  menuDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  adminCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navy, borderRadius: 16,
    padding: 18, marginTop: 12, gap: 14,
  },
  adminAvatar: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  adminInfo: { flex: 1 },
  adminName: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  adminRole: { fontSize: 13, color: colors.tealLight, marginTop: 1 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  versionText: { textAlign: 'center', fontSize: 12, color: colors.textLight, marginTop: 16 },
});
