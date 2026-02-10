import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, menuAPI, promosAPI, flashSalesAPI, walletAPI } from '../../services/api';

export default function MerchantSettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const [promoCount, setPromoCount] = useState({ active: 0, total: 0 });
  const [flashCount, setFlashCount] = useState({ active: 0, total: 0 });
  const [bankAccount, setBankAccount] = useState<any>(null);

  const refreshData = async () => {
    try {
      const res = await promosAPI.getAll(1, false);
      const all = res?.data || [];
      const active = all.filter((p: any) => p.isActive).length;
      setPromoCount({ active, total: all.length });
    } catch {}
    try {
      const res = await flashSalesAPI.getAll();
      const all = Array.isArray(res?.data) ? res.data : [];
      const active = all.filter((s: any) => s.isActive && new Date(s.endsAt) > new Date()).length;
      setFlashCount({ active, total: all.length });
    } catch {}
    try {
      const banks = await walletAPI.getBankAccounts();
      if (banks?.length) {
        const defaultBank = banks.find((b: any) => b.isDefault) || banks[0];
        setBankAccount(defaultBank);
      } else {
        setBankAccount(null);
      }
    } catch {}
  };

  useEffect(() => {
    refreshData();
    // Re-fetch when this tab gains focus (switching tabs)
    const unsubTab = navigation.addListener('focus', refreshData);
    // Re-fetch when any stack navigation happens (e.g. popping back from BankAccounts)
    const parent = navigation.getParent?.();
    const unsubState = parent?.addListener?.('state', refreshData);
    return () => { unsubTab(); unsubState?.(); };
  }, [navigation]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);

  const handleDeleteAccount = () => {
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    try {
      await usersAPI.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      logout();
    } catch (e: any) {
      setShowDeleteModal(false);
      Alert.alert('Error', e?.message || 'Could not delete account. Check your password.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportData = () => setShowExportModal(true);

  const confirmExportData = async () => {
    setExporting(true);
    try {
      await usersAPI.exportData();
      setShowExportModal(false);
      Alert.alert('Success', 'Your data export has been prepared. Check your email.');
    } catch (e: any) {
      setShowExportModal(false);
      Alert.alert('Error', e?.message || 'Could not export data.');
    } finally {
      setExporting(false);
    }
  };
  const [autoAccept, setAutoAccept] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [businessHours, setBusinessHours] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, hoursRes] = await Promise.all([
          usersAPI.getProfile().catch(() => null),
          menuAPI.getBusinessHours('me').catch(() => null),
        ]);
        if (profileRes) setBusinessProfile(profileRes);
        if (Array.isArray(hoursRes)) setBusinessHours(hoursRes);
        else if (hoursRes?.data) setBusinessHours(hoursRes.data);
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Store Profile */}
        <View style={styles.profileCard}>
          <View style={[styles.storeImage, { backgroundColor: colors.navy + '15', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="storefront" size={28} color={colors.navy} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.storeName}>{businessProfile?.businessProfile?.businessName || user?.firstName || 'My Store'}</Text>
            <Text style={styles.storeAddress}>{user?.email || 'No email set'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>{businessProfile?.businessProfile?.averageRating ? `${businessProfile.businessProfile.averageRating} rating` : 'No reviews yet'}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Store Hours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Store Hours</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BusinessHours')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          {businessHours.length > 0 ? businessHours.map((h: any, i: number) => (
            <View key={i} style={styles.scheduleRow}>
              <Text style={styles.scheduleDay}>{h.dayOfWeek || h.day}</Text>
              <Text style={styles.scheduleHours}>{h.openTime} - {h.closeTime}</Text>
            </View>
          )) : (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Ionicons name="time-outline" size={28} color={colors.textLight} />
              <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 6 }}>No store hours set yet</Text>
            </View>
          )}
        </View>

        {/* Order Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Accept Orders</Text>
              <Text style={styles.settingDesc}>Automatically accept incoming orders</Text>
            </View>
            <Switch
              value={autoAccept}
              onValueChange={setAutoAccept}
              trackColor={{ false: colors.border, true: colors.teal + '60' }}
              thumbColor={autoAccept ? colors.teal : colors.darkGray}
            />
          </View>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Default Prep Time</Text>
              <Text style={styles.settingDesc}>15 minutes</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Max Concurrent Orders</Text>
              <Text style={styles.settingDesc}>10 orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Delivery Radius</Text>
              <Text style={styles.settingDesc}>5 km</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Minimum Order Amount</Text>
              <Text style={styles.settingDesc}>₦3,000</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound Alerts</Text>
              <Text style={styles.settingDesc}>Play sound for new orders</Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: colors.border, true: colors.teal + '60' }}
              thumbColor={soundAlerts ? colors.teal : colors.darkGray}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Order updates, reviews, promos</Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: colors.border, true: colors.teal + '60' }}
              thumbColor={pushNotifs ? colors.teal : colors.darkGray}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDesc}>Daily reports, weekly summaries</Text>
            </View>
            <Switch
              value={emailNotifs}
              onValueChange={setEmailNotifs}
              trackColor={{ false: colors.border, true: colors.teal + '60' }}
              thumbColor={emailNotifs ? colors.teal : colors.darkGray}
            />
          </View>
        </View>

        {/* Payments & Payouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments & Payouts</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Wallet')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.teal + '15' }]}>
                <Ionicons name="wallet-outline" size={18} color={colors.teal} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Wallet & Withdrawals</Text>
                <Text style={styles.settingDesc}>View balance, earnings & withdraw</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('BankAccounts')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="card-outline" size={18} color={colors.navy} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Bank Account</Text>
                <Text style={styles.settingDesc}>
                  {bankAccount
                    ? `****${bankAccount.accountNumber.slice(-4)} · ${bankAccount.bankName}`
                    : 'No bank account added'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Store Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Management</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('BusinessHours')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="time-outline" size={18} color={colors.navy} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Business Hours</Text>
                <Text style={styles.settingDesc}>Set opening & closing times</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('DeliveryZones')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="map-outline" size={18} color={colors.info} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Delivery Zones</Text>
                <Text style={styles.settingDesc}>Manage delivery areas & fees</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Inventory')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="cube-outline" size={18} color={colors.warning} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Inventory</Text>
                <Text style={styles.settingDesc}>Stock levels & availability</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Reviews')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="star-outline" size={18} color={colors.success} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reviews</Text>
                <Text style={styles.settingDesc}>View & respond to reviews</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotions & Vouchers</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Promotions')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="pricetag-outline" size={18} color={colors.success} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Active Promotions</Text>
                <Text style={styles.settingDesc}>{promoCount.active} active, {promoCount.total} total</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('FlashSales')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.teal + '15' }]}>
                <Ionicons name="flash-outline" size={18} color={colors.teal} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Flash Sales</Text>
                <Text style={styles.settingDesc}>{flashCount.active} active, {flashCount.total} total</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Advanced Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Tools</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('SmartKitchen')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#8b5cf6' + '15' }]}>
                <Ionicons name="restaurant-outline" size={18} color="#8b5cf6" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Smart Kitchen</Text>
                <Text style={styles.settingDesc}>Kitchen ops, inventory & prep predictions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('AIInsights')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ec4899' + '15' }]}>
                <Ionicons name="sparkles-outline" size={18} color="#ec4899" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>AI Business Insights</Text>
                <Text style={styles.settingDesc}>Demand forecast, pricing & menu optimization</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('CRM')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#3b82f6' + '15' }]}>
                <Ionicons name="people-outline" size={18} color="#3b82f6" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Customer CRM</Text>
                <Text style={styles.settingDesc}>Profiles, loyalty & campaigns</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('MultiChannel')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#f59e0b' + '15' }]}>
                <Ionicons name="grid-outline" size={18} color="#f59e0b" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sales Channels</Text>
                <Text style={styles.settingDesc}>Multi-channel selling & subscriptions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('DynamicPricing')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#10b981' + '15' }]}>
                <Ionicons name="pricetags-outline" size={18} color="#10b981" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Dynamic Pricing</Text>
                <Text style={styles.settingDesc}>Automated pricing rules & surge</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://fulccrum.com/help')}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={20} color={colors.navy} />
              <Text style={styles.settingLabel}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('mailto:support@fulccrum.com?subject=Merchant%20Support%20Request')}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.teal} />
              <Text style={styles.settingLabel}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://fulccrum.com/terms')}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL('https://fulccrum.com/privacy')}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity activeOpacity={0.6} style={styles.actionBtn} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="download-outline" size={18} color={colors.navy} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Export My Data</Text>
                <Text style={styles.settingDesc}>Download a copy of your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={styles.actionBtn} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.error} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>Log Out</Text>
                <Text style={styles.settingDesc}>Sign out of your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.textLight + '20' }]}>
                <Ionicons name="trash-outline" size={18} color={colors.textLight} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.textLight }]}>Delete Account</Text>
                <Text style={styles.settingDesc}>Permanently delete your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Fulccrum Merchant v1.0.0</Text>
        <View style={{ height: 120 }} />
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
            <Text style={styles.modalSubtitle}>Are you sure you want to log out of your merchant account?</Text>
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

      {/* Export Data Confirmation Modal */}
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

      {/* Delete Account Password Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !deleting && setShowDeleteModal(false)} />
          <View style={styles.modalContent}>
            <View style={[styles.modalIconCircle, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="trash-outline" size={28} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalSubtitle}>This will permanently delete your merchant account and all data. Enter your password to confirm.</Text>
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
    backgroundColor: colors.navy,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textWhite,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  profileInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  storeAddress: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  scheduleDay: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  scheduleHours: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
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
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: 'center',
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
});
