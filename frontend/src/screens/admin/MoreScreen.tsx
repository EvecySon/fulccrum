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

const menuItems = [
  { icon: 'shield-outline', label: 'Admin Users', desc: 'Create & manage admin accounts', screen: 'AdminUsers', color: colors.navy },
  { icon: 'storefront-outline', label: 'Merchants', desc: 'Manage restaurants & stores', screen: 'Merchants', color: colors.teal },
  { icon: 'construct-outline', label: 'Settings & Config', desc: 'Platform settings, integrations', screen: 'AdminSettings', color: colors.teal },
  { icon: 'wallet-outline', label: 'Payouts', desc: 'Pay merchants & couriers', screen: 'Payouts', color: colors.success },
  { icon: 'megaphone-outline', label: 'Promotions', desc: 'Manage campaigns & vouchers', screen: null, color: colors.warning },
  { icon: 'document-text-outline', label: 'Reports', desc: 'Generate & export reports', screen: null, color: colors.info },
  { icon: 'chatbubbles-outline', label: 'Support Tickets', desc: 'Customer & merchant issues', screen: null, color: colors.error },
  { icon: 'notifications-outline', label: 'Push Notifications', desc: 'Send announcements', screen: null, color: colors.navy },
  { icon: 'shield-checkmark-outline', label: 'Compliance', desc: 'Legal & regulatory', screen: null, color: colors.success },
  { icon: 'code-slash-outline', label: 'Developer Tools', desc: 'API docs, webhooks, logs', screen: null, color: colors.textSecondary },
];

export default function MoreScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
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
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
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
