import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || 'John');
  const [lastName, setLastName] = useState(user?.lastName || 'Doe');
  const [email, setEmail] = useState(user?.email || 'john@example.com');
  const [phone, setPhone] = useState(user?.phone || '+1234567890');
  const [dob, setDob] = useState('1990-05-15');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await usersAPI.updateProfile({ firstName, lastName, email, phone });
      if (updated) setUser(updated);
      navigation.goBack();
    } catch {
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtn}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={colors.textLight}
            />
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={colors.textLight}
            />
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.fieldWithBadge}>
              <TextInput
                style={[styles.fieldInput, { flex: 1 }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <View style={styles.fieldWithBadge}>
              <TextInput
                style={[styles.fieldInput, { flex: 1 }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <TouchableOpacity style={styles.dateField}>
              <Text style={styles.dateText}>{dob}</Text>
              <Ionicons name="calendar-outline" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={styles.prefCard}>
          <Text style={styles.prefTitle}>Dietary Preferences</Text>
          <View style={styles.prefGrid}>
            {['Vegetarian', 'Vegan', 'Gluten Free', 'Halal', 'Keto', 'Dairy Free'].map((pref) => {
              const isSelected = pref === 'Halal';
              return (
                <TouchableOpacity key={pref} style={[styles.prefChip, isSelected && styles.prefChipActive]}>
                  <Text style={[styles.prefChipText, isSelected && styles.prefChipTextActive]}>{pref}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Allergy Info */}
        <View style={styles.prefCard}>
          <Text style={styles.prefTitle}>Allergies</Text>
          <View style={styles.prefGrid}>
            {['Nuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Fish'].map((allergy) => {
              const isSelected = allergy === 'Nuts';
              return (
                <TouchableOpacity key={allergy} style={[styles.allergyChip, isSelected && styles.allergyChipActive]}>
                  <Ionicons
                    name={isSelected ? 'alert-circle' : 'add-circle-outline'}
                    size={14}
                    color={isSelected ? colors.textWhite : colors.error}
                  />
                  <Text style={[styles.allergyChipText, isSelected && styles.allergyChipTextActive]}>{allergy}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.navy} />
            <Text style={styles.actionText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <View style={styles.fieldDivider} />
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="language-outline" size={20} color={colors.navy} />
            <Text style={styles.actionText}>Language</Text>
            <Text style={styles.actionValue}>English</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <View style={styles.fieldDivider} />
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="notifications-outline" size={20} color={colors.navy} />
            <Text style={styles.actionText}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  saveBtn: { fontSize: 16, fontWeight: '700', color: colors.teal },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 30 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: colors.lightGray,
  },
  changePhotoText: { fontSize: 14, fontWeight: '600', color: colors.teal, marginTop: 8 },
  formCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  fieldRow: { paddingVertical: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textLight, marginBottom: 4 },
  fieldInput: { fontSize: 16, color: colors.textPrimary, paddingVertical: 4 },
  fieldWithBadge: { flexDirection: 'row', alignItems: 'center' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontSize: 11, fontWeight: '600', color: colors.success },
  dateField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  dateText: { fontSize: 16, color: colors.textPrimary },
  fieldDivider: { height: 1, backgroundColor: colors.borderLight },
  prefCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  prefTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prefChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: colors.lightGray, borderWidth: 1, borderColor: colors.border,
  },
  prefChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  prefChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  prefChipTextActive: { color: colors.textWhite },
  allergyChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, backgroundColor: colors.error + '08', borderWidth: 1, borderColor: colors.error + '25', gap: 4,
  },
  allergyChipActive: { backgroundColor: colors.error, borderColor: colors.error },
  allergyChipText: { fontSize: 13, fontWeight: '600', color: colors.error },
  allergyChipTextActive: { color: colors.textWhite },
  actionsCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  actionText: { flex: 1, fontSize: 15, color: colors.textPrimary },
  actionValue: { fontSize: 14, color: colors.textLight },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
  },
  deleteText: { fontSize: 15, fontWeight: '600', color: colors.error },
});
