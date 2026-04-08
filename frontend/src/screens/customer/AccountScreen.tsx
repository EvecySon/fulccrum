import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, loyaltyAPI, resolveMediaUrl } from '../../services/api';
import { showAlert } from '../../utils/alert';

const menuItems = [
  { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile' },
  { icon: 'location-outline', label: 'Saved Addresses', screen: 'Addresses' },
  { icon: 'card-outline', label: 'Payment Methods', screen: 'PaymentMethods' },
  { icon: 'gift-outline', label: 'Vouchers & Promos', screen: 'Vouchers' },
  { icon: 'trophy-outline', label: 'Loyalty Rewards', screen: 'Loyalty' },
  { icon: 'heart-outline', label: 'Favorites', screen: 'Favorites' },
  { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
  { icon: 'chatbubbles-outline', label: 'Live Chat Support', screen: 'Chat' },
  { icon: 'people-outline', label: 'Group Order', screen: 'GroupOrder' },
  { icon: 'star-outline', label: 'Rate Last Order', screen: 'Feedback' },
];

const advancedItems = [
  { icon: 'sparkles-outline', label: 'AI Recommendations', screen: 'AIRecommendations', color: '#8b5cf6' },
  { icon: 'mic-outline', label: 'Voice Ordering', screen: 'VoiceOrdering', color: '#ec4899' },
  { icon: 'cube-outline', label: 'AR Food Preview', screen: 'ARFoodPreview', color: '#f59e0b' },
  { icon: 'people-circle-outline', label: 'Community Feed', screen: 'SocialFeed', color: '#3b82f6' },
  { icon: 'leaf-outline', label: 'Eco Impact', screen: 'Sustainability', color: '#10b981' },
];

const getAvatarUri = (u: any) => {
  const resolved = resolveMediaUrl(u?.avatarUrl);
  if (resolved) return resolved;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent((u?.firstName || '') + ' ' + (u?.lastName || ''))}&background=0D1B2A&color=fff&size=128`;
};

export default function AccountScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loyaltyProfile, setLoyaltyProfile] = useState<any>(null);
  const [avatarUri, setAvatarUri] = useState(getAvatarUri(user));

  // Update avatar when user changes
  useEffect(() => {
    setAvatarUri(getAvatarUri(user));
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const profile = await loyaltyAPI.getProfile();
        setLoyaltyProfile(profile);
      } catch {
        // Loyalty profile may not exist yet — that's fine
      }
    })();
  }, []);

  const handleLogout = () => setShowLogoutModal(true);

  const handleExportData = () => setShowExportModal(true);

  const confirmExportData = async () => {
    setExporting(true);
    try {
      await usersAPI.exportData();
      setShowExportModal(false);
      showAlert('Data Export', 'Your data export has been prepared. Check your email for the download link.');
    } catch (e: any) {
      showAlert('Error', e?.message || 'Could not export data.');
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
      showAlert('Account Deleted', 'Your account has been permanently deleted.', [
        { text: 'OK', onPress: () => logout() },
      ]);
    } catch (e: any) {
      showAlert('Error', e?.message || 'Could not delete account. Check your password.');
    } finally { setDeleting(false); }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.firstName || ''} {user?.lastName || ''}
            </Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            {user?.phone ? <Text style={styles.profilePhone}>{user.phone}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Loyalty Card */}
        <TouchableOpacity style={styles.loyaltyCard} onPress={() => navigation.navigate('Loyalty')} activeOpacity={0.85}>
          <View style={styles.loyaltyHeader}>
            <Ionicons name="trophy" size={24} color={colors.warning} />
            <Text style={styles.loyaltyTitle}>
              {loyaltyProfile?.tier || 'Member'}
            </Text>
          </View>
          <View style={styles.loyaltyProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(((loyaltyProfile?.totalPoints || 0) / Math.max(loyaltyProfile?.nextTierPoints || 1000, 1)) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.loyaltyPoints}>
              {loyaltyProfile?.totalPoints?.toLocaleString() || '0'} / {(loyaltyProfile?.nextTierPoints || 1000).toLocaleString()} points to next tier
            </Text>
          </View>
          <View style={styles.loyaltyStats}>
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyStatValue}>{loyaltyProfile?.totalOrders || 0}</Text>
              <Text style={styles.loyaltyStatLabel}>Orders</Text>
            </View>
            <View style={styles.loyaltyDivider} />
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyStatValue}>₦{(loyaltyProfile?.totalSpent || 0).toLocaleString()}</Text>
              <Text style={styles.loyaltyStatLabel}>Total Spent</Text>
            </View>
            <View style={styles.loyaltyDivider} />
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyStatValue}>{(loyaltyProfile?.totalPoints || 0).toLocaleString()}</Text>
              <Text style={styles.loyaltyStatLabel}>Points</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Advanced Features */}
        <View style={styles.advancedSection}>
          <Text style={styles.advancedTitle}>Explore</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.advancedRow}>
            {advancedItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.advancedCard} onPress={() => navigation.navigate(item.screen)}>
                <View style={[styles.advancedIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.advancedLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => {
              navigation.navigate(item.screen);
            }}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={colors.navy}
                  />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textLight}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support & Legal */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL('https://fulccrum.com/help')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color={colors.navy} />
              <Text style={styles.menuItemLabel}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL('https://fulccrum.com/terms')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL('https://fulccrum.com/privacy')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity activeOpacity={0.6} style={styles.actionBtn} onPress={handleExportData}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.actionIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="download-outline" size={18} color={colors.navy} />
              </View>
              <View>
                <Text style={styles.menuItemLabel}>Export My Data</Text>
                <Text style={styles.actionDesc}>Download a copy of your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={styles.actionBtn} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.actionIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.error} />
              </View>
              <View>
                <Text style={[styles.menuItemLabel, { color: colors.error }]}>Log Out</Text>
                <Text style={styles.actionDesc}>Sign out of your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.actionIcon, { backgroundColor: colors.textLight + '20' }]}>
                <Ionicons name="trash-outline" size={18} color={colors.textLight} />
              </View>
              <View>
                <Text style={[styles.menuItemLabel, { color: colors.textLight }]}>Delete Account</Text>
                <Text style={styles.actionDesc}>Permanently delete your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Fulccrum v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowLogoutModal(false)} />
          <View style={styles.modalContent}>
            <View style={[styles.modalIconCircle, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="log-out-outline" size={28} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to log out of your account?</Text>
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
            <Text style={styles.modalSubtitle}>This will permanently delete your account and all data. Enter your password to confirm.</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.white,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    marginTop: 8,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 1,
  },
  loyaltyCard: {
    backgroundColor: colors.navy,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  loyaltyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
  },
  loyaltyProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 4,
  },
  loyaltyPoints: {
    fontSize: 12,
    color: colors.tealLight,
  },
  loyaltyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loyaltyStat: {
    alignItems: 'center',
  },
  loyaltyStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
  },
  loyaltyStatLabel: {
    fontSize: 12,
    color: colors.tealLight,
    marginTop: 2,
  },
  loyaltyDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuSection: {
    backgroundColor: colors.white,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  supportSection: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  accountSection: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDesc: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: 'center',
  },
  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textWhite,
  },
  advancedSection: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  advancedTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  advancedRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  advancedCard: {
    alignItems: 'center',
    width: 80,
  },
  advancedIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  advancedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
