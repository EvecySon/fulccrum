import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const achievements = [
  { id: '1', name: '100 Deliveries', icon: 'bicycle', earned: true, color: colors.teal },
  { id: '2', name: '5-Star Streak', icon: 'star', earned: true, color: colors.warning },
  { id: '3', name: 'Speed Demon', icon: 'flash', earned: true, color: colors.error },
  { id: '4', name: 'Night Owl', icon: 'moon', earned: false, color: colors.navy },
  { id: '5', name: '500 Deliveries', icon: 'trophy', earned: false, color: '#CD7F32' },
  { id: '6', name: 'Rain Warrior', icon: 'rainy', earned: false, color: colors.info },
];

export default function CourierProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your courier account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt('Confirm Password', 'Enter your password to confirm deletion:', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete Forever',
                style: 'destructive',
                onPress: async (password?: string) => {
                  if (!password) return;
                  try {
                    await usersAPI.deleteAccount(password);
                    Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
                      { text: 'OK', onPress: () => logout() },
                    ]);
                  } catch (e: any) {
                    Alert.alert('Error', e?.message || 'Could not delete account. Check your password.');
                  }
                },
              },
            ], 'secure-text');
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    try {
      await usersAPI.exportData();
      Alert.alert('Data Export', 'Your data export has been prepared. Check your email for the download link.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not export data.');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await usersAPI.getProfile();
        if (res) setProfile(res);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.avatar}
          />
          <Text style={styles.profileName}>Mike Johnson</Text>
          <Text style={styles.profileEmail}>mike.j@example.com</Text>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>4.9</Text>
              <Text style={styles.profileStatLabel}>Rating</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>342</Text>
              <Text style={styles.profileStatLabel}>Deliveries</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>98%</Text>
              <Text style={styles.profileStatLabel}>Acceptance</Text>
            </View>
          </View>
        </View>

        {/* Rating Breakdown */}
        <View style={styles.ratingCard}>
          <Text style={styles.cardTitle}>Rating Breakdown</Text>
          {[
            { stars: 5, count: 298, pct: 87 },
            { stars: 4, count: 32, pct: 9 },
            { stars: 3, count: 8, pct: 2 },
            { stars: 2, count: 3, pct: 1 },
            { stars: 1, count: 1, pct: 0.3 },
          ].map((row) => (
            <View key={row.stars} style={styles.ratingRow}>
              <Text style={styles.ratingStars}>{row.stars}★</Text>
              <View style={styles.ratingBar}>
                <View style={[styles.ratingFill, { width: `${row.pct}%` }]} />
              </View>
              <Text style={styles.ratingCount}>{row.count}</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((a) => (
              <View key={a.id} style={[styles.achievementCard, !a.earned && styles.achievementLocked]}>
                <View style={[styles.achievementIcon, { backgroundColor: a.earned ? a.color + '15' : colors.lightGray }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.earned ? a.color : colors.textLight} />
                </View>
                <Text style={[styles.achievementName, !a.earned && { color: colors.textLight }]}>{a.name}</Text>
                {!a.earned && (
                  <Ionicons name="lock-closed" size={10} color={colors.textLight} style={{ marginTop: 2 }} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleCard}>
          <Text style={styles.cardTitle}>Vehicle Information</Text>
          <View style={styles.vehicleRow}>
            <Ionicons name="car-outline" size={20} color={colors.navy} />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>Vehicle</Text>
              <Text style={styles.vehicleValue}>Toyota Corolla 2022</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          <View style={styles.vehicleDivider} />
          <View style={styles.vehicleRow}>
            <Ionicons name="document-text-outline" size={20} color={colors.navy} />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>License Plate</Text>
              <Text style={styles.vehicleValue}>ABC 1234</Text>
            </View>
          </View>
          <View style={styles.vehicleDivider} />
          <View style={styles.vehicleRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>Insurance</Text>
              <Text style={styles.vehicleValue}>Valid until Dec 2026</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <View style={styles.vehicleDivider} />
          <View style={styles.vehicleRow}>
            <Ionicons name="card-outline" size={20} color={colors.navy} />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>Driver's License</Text>
              <Text style={styles.vehicleValue}>Expires Mar 2028</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color={colors.navy} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={pushNotifs ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.settingDivider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high-outline" size={20} color={colors.navy} />
              <Text style={styles.settingLabel}>Sound Alerts</Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={soundAlerts ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.settingDivider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="flash-outline" size={20} color={colors.navy} />
              <Text style={styles.settingLabel}>Auto-Accept Orders</Text>
            </View>
            <Switch
              value={autoAccept}
              onValueChange={setAutoAccept}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={autoAccept ? colors.teal : colors.textLight}
            />
          </View>
        </View>

        {/* Advanced Tools */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Advanced Tools</Text>
          {[
            { icon: 'analytics-outline', label: 'Performance & AI', color: '#8b5cf6', screen: 'Performance' },
            { icon: 'trophy-outline', label: 'Achievements & Rewards', color: '#f59e0b', screen: 'Gamification' },
            { icon: 'shield-checkmark-outline', label: 'Safety Center', color: '#ef4444', screen: 'Safety' },
            { icon: 'car-outline', label: 'Vehicle & Delivery', color: '#3b82f6', screen: 'VehicleManagement' },
          ].map((item, index) => (
            <React.Fragment key={'adv-' + index}>
              <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate(item.screen)}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={styles.actionLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
              {index < 3 && <View style={styles.settingDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Account Actions */}
        <View style={styles.actionsCard}>
          {[
            { icon: 'wallet-outline', label: 'Wallet & Withdrawals', color: colors.navy, screen: 'Wallet' },
            { icon: 'document-text-outline', label: 'Tax Documents', color: colors.navy, screen: null },
            { icon: 'help-circle-outline', label: 'Help & Support', color: colors.navy, screen: null },
            { icon: 'star-outline', label: 'Refer a Friend', color: colors.teal, screen: null },
          ].map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.actionRow} onPress={() => item.screen && navigation.navigate(item.screen)}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={styles.actionLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
              {index < 4 && <View style={styles.settingDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Export Data */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleExportData}>
          <Ionicons name="download-outline" size={20} color={colors.navy} />
          <Text style={[styles.logoutText, { color: colors.navy }]}>Export My Data</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color={colors.textLight} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Fulccrum Courier v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textWhite },
  profileCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 12, borderRadius: 20,
    padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  avatar: { width: 90, height: 90, borderRadius: 28 },
  profileName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
  profileEmail: { fontSize: 14, color: colors.textLight, marginTop: 2 },
  profileStats: { flexDirection: 'row', marginTop: 20, gap: 0 },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  profileStatLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  profileStatDivider: { width: 1, backgroundColor: colors.borderLight },
  ratingCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ratingStars: { fontSize: 13, fontWeight: '600', color: colors.warning, width: 28 },
  ratingBar: { flex: 1, height: 6, backgroundColor: colors.lightGray, borderRadius: 3, overflow: 'hidden' },
  ratingFill: { height: '100%', backgroundColor: colors.warning, borderRadius: 3 },
  ratingCount: { fontSize: 12, color: colors.textLight, width: 30, textAlign: 'right' },
  section: { paddingHorizontal: 10, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: {
    width: '31%', backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center',
  },
  achievementLocked: { opacity: 0.5 },
  achievementIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  achievementName: { fontSize: 11, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  vehicleCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 16, borderRadius: 16, padding: 16,
  },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  vehicleInfo: { flex: 1 },
  vehicleLabel: { fontSize: 12, color: colors.textLight },
  vehicleValue: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginTop: 1 },
  vehicleDivider: { height: 1, backgroundColor: colors.borderLight },
  verifiedBadge: { backgroundColor: colors.success + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: colors.success },
  settingsCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 16,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, color: colors.textPrimary },
  settingDivider: { height: 1, backgroundColor: colors.borderLight },
  actionsCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 16,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  actionLabel: { flex: 1, fontSize: 15, color: colors.textPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 20, paddingVertical: 14, gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.error },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 8, paddingVertical: 12,
  },
  deleteText: { fontSize: 14, color: colors.textLight },
  versionText: { textAlign: 'center', fontSize: 12, color: colors.textLight, marginTop: 8 },
});
