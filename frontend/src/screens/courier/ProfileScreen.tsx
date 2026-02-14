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
  Modal,
  TextInput,
  ActivityIndicator,
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

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);

  const handleExportData = () => setShowExportModal(true);

  const confirmExportData = async () => {
    setExporting(true);
    try {
      await usersAPI.exportData();
      setShowExportModal(false);
      Alert.alert('Data Export', 'Your data export has been prepared. Check your email for the download link.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not export data.');
    } finally { setExporting(false); }
  };

  const handleDeleteAccount = () => {
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword.trim()) return;
    setDeleting(true);
    try {
      await usersAPI.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
        { text: 'OK', onPress: () => logout() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not delete account. Check your password.');
    } finally { setDeleting(false); }
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
            { icon: 'map-outline', label: 'Surge & Heat Map', color: '#dc2626', screen: 'HeatMap' },
            { icon: 'calendar-outline', label: 'Schedule Shifts', color: '#0ea5e9', screen: 'Scheduling' },
            { icon: 'flame-outline', label: 'Quests & Bonuses', color: '#f97316', screen: 'Quests' },
            { icon: 'options-outline', label: 'Delivery Preferences', color: '#6366f1', screen: 'DeliveryPreferences' },
            { icon: 'school-outline', label: 'Training Center', color: '#10b981', screen: 'Training' },
            { icon: 'shield-outline', label: 'Insurance', color: '#0891b2', screen: 'Insurance' },
            { icon: 'build-outline', label: 'Maintenance & Docs', color: '#78716c', screen: 'MaintenanceReminders' },
          ].map((item, index, arr) => (
            <React.Fragment key={'adv-' + index}>
              <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate(item.screen)}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={styles.actionLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
              {index < arr.length - 1 && <View style={styles.settingDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Account Actions */}
        <View style={styles.actionsCard}>
          {[
            { icon: 'wallet-outline', label: 'Wallet & Withdrawals', color: colors.navy, screen: 'Wallet' },
            { icon: 'receipt-outline', label: 'Order History', color: colors.navy, screen: 'OrderHistory' },
            { icon: 'notifications-outline', label: 'Notifications', color: colors.navy, screen: 'Notifications' },
            { icon: 'document-text-outline', label: 'Tax & Earnings', color: colors.navy, screen: 'TaxSummary' },
            { icon: 'help-circle-outline', label: 'Help & Support', color: colors.navy, screen: null },
            { icon: 'star-outline', label: 'Refer a Friend', color: colors.teal, screen: 'Referral' },
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

        {/* Settings */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Settings</Text>
          {[
            { icon: 'moon-outline', label: 'Appearance', color: '#6366f1', screen: 'ThemeSettings' },
            { icon: 'language-outline', label: 'Language', color: '#0ea5e9', screen: 'LanguageSettings' },
          ].map((item, index, arr) => (
            <React.Fragment key={'set-' + index}>
              <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate(item.screen)}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={styles.actionLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
              {index < arr.length - 1 && <View style={styles.settingDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Account Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Account</Text>
          <TouchableOpacity activeOpacity={0.6} style={styles.accountActionRow} onPress={handleExportData}>
            <View style={styles.accountActionLeft}>
              <View style={[styles.accountActionIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="download-outline" size={18} color={colors.navy} />
              </View>
              <View>
                <Text style={styles.actionLabel}>Export My Data</Text>
                <Text style={styles.accountActionDesc}>Download a copy of your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <View style={styles.settingDivider} />
          <TouchableOpacity activeOpacity={0.6} style={styles.accountActionRow} onPress={handleLogout}>
            <View style={styles.accountActionLeft}>
              <View style={[styles.accountActionIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.error} />
              </View>
              <View>
                <Text style={[styles.actionLabel, { color: colors.error }]}>Log Out</Text>
                <Text style={styles.accountActionDesc}>Sign out of your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <View style={styles.settingDivider} />
          <TouchableOpacity activeOpacity={0.6} style={styles.accountActionRow} onPress={handleDeleteAccount}>
            <View style={styles.accountActionLeft}>
              <View style={[styles.accountActionIcon, { backgroundColor: colors.textLight + '20' }]}>
                <Ionicons name="trash-outline" size={18} color={colors.textLight} />
              </View>
              <View>
                <Text style={[styles.actionLabel, { color: colors.textLight }]}>Delete Account</Text>
                <Text style={styles.accountActionDesc}>Permanently delete your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Fulccrum Courier v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowLogoutModal(false)} />
          <View style={styles.modalContent}>
            <View style={[styles.modalIconCircle, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="log-out-outline" size={28} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to log out of your courier account?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} onPress={() => { setShowLogoutModal(false); logout(); }}>
                <Text style={styles.modalDeleteText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Export Data Modal */}
      <Modal visible={showExportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !exporting && setShowExportModal(false)} />
          <View style={styles.modalContent}>
            <View style={[styles.modalIconCircle, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="download-outline" size={28} color={colors.navy} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.navy }]}>Export My Data</Text>
            <Text style={styles.modalSubtitle}>We'll prepare a copy of your data and send a download link to your email.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowExportModal(false)} disabled={exporting}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, exporting && { opacity: 0.6 }]}
                onPress={confirmExportData}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator color={colors.textWhite} size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>Export</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !deleting && setShowDeleteModal(false)} />
          <View style={styles.modalContent}>
            <View style={[styles.modalIconCircle, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="trash-outline" size={28} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalSubtitle}>This will permanently delete your courier account and all data. Enter your password to confirm.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.textLight}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDeleteModal(false)} disabled={deleting}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteBtn, deleting && { opacity: 0.6 }]}
                onPress={confirmDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color={colors.textWhite} size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>Delete Forever</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  accountActionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12,
  },
  accountActionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  accountActionIcon: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  accountActionDesc: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  versionText: { textAlign: 'center', fontSize: 12, color: colors.textLight, marginTop: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center',
  },
  modalIconCircle: {
    width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.error, marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  modalInput: {
    width: '100%', backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: colors.textPrimary, marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  modalDeleteBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.error, alignItems: 'center',
  },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.teal, alignItems: 'center',
  },
  modalDeleteText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
});
