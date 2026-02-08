import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { mockUser } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

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

export default function AccountScreen({ navigation }: any) {
  const { user } = useAuth();
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
            source={{ uri: mockUser.avatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.firstName || mockUser.firstName} {user?.lastName || mockUser.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user?.email || mockUser.email}</Text>
            <Text style={styles.profilePhone}>{user?.phone || mockUser.phone}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Loyalty Card */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <Ionicons name="trophy" size={24} color={colors.warning} />
            <Text style={styles.loyaltyTitle}>Bronze Member</Text>
          </View>
          <View style={styles.loyaltyProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '35%' }]} />
            </View>
            <Text style={styles.loyaltyPoints}>350 / 1000 points to Silver</Text>
          </View>
          <View style={styles.loyaltyStats}>
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyStatValue}>23</Text>
              <Text style={styles.loyaltyStatLabel}>Orders</Text>
            </View>
            <View style={styles.loyaltyDivider} />
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyStatValue}>₦68,400</Text>
              <Text style={styles.loyaltyStatLabel}>Total Spent</Text>
            </View>
            <View style={styles.loyaltyDivider} />
            <View style={styles.loyaltyStat}>
              <Text style={styles.loyaltyStatValue}>350</Text>
              <Text style={styles.loyaltyStatLabel}>Points</Text>
            </View>
          </View>
        </View>

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
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
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

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Fulccrum v1.0.0</Text>

        <View style={{ height: 100 }} />
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
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
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
