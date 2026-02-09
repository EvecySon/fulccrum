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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, menuAPI } from '../../services/api';

export default function MerchantSettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your merchant account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.', [
              { text: 'OK', onPress: () => logout() },
            ]);
          },
        },
      ],
    );
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
            <TouchableOpacity>
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
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.navy + '15' }]}>
                <Ionicons name="card-outline" size={18} color={colors.navy} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Bank Account</Text>
                <Text style={styles.settingDesc}>****4521 · GTBank</Text>
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
                <Text style={styles.settingDesc}>2 running, 1 scheduled</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.teal + '15' }]}>
                <Ionicons name="flash-outline" size={18} color={colors.teal} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Flash Sales</Text>
                <Text style={styles.settingDesc}>Time-limited deals</Text>
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
          {[
            { icon: 'help-circle-outline', label: 'Help Center', color: colors.navy },
            { icon: 'chatbubbles-outline', label: 'Contact Support', color: colors.teal },
            { icon: 'document-outline', label: 'Terms of Service', color: colors.textSecondary },
            { icon: 'shield-outline', label: 'Privacy Policy', color: colors.textSecondary },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={styles.settingLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color={colors.textLight} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Fulccrum Merchant v1.0.0</Text>
        <View style={{ height: 110 }} />
      </ScrollView>
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
  },
  deleteText: {
    fontSize: 14,
    color: colors.textLight,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
  },
});
