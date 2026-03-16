import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { usersAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten Free', 'Halal', 'Keto', 'Dairy Free'];
const ALLERGY_OPTIONS = ['Nuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Fish'];

const getAvatarUri = (user: any) => {
  if (user?.avatarUrl) return user.avatarUrl;
  const name = encodeURIComponent((user?.firstName || '') + ' ' + (user?.lastName || ''));
  return `https://ui-avatars.com/api/?name=${name}&background=0D1B2A&color=fff&size=200`;
};

export default function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUri, setAvatarUri] = useState(getAvatarUri(user));
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(user?.dietaryPreferences || []);
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || []);
  const [customAllergies, setCustomAllergies] = useState(user?.customAllergies || '');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const togglePref = (pref: string) => {
    setDietaryPrefs((prev) => prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]);
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) => prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]);
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: asset.mimeType || 'image/jpeg',
      } as any);

      const uploaded = await uploadAPI.uploadAvatar(formData);
      if (uploaded?.url) {
        setAvatarUri(uploaded.url);
        
        // Fetch fresh user data from backend to ensure avatar persists
        try {
          const freshUser = await usersAPI.getProfile();
          if (freshUser) {
            setUser(freshUser);
          }
        } catch (err) {
          // Fallback: update local context if fetch fails
          if (user) setUser({ ...user, avatarUrl: uploaded.url });
        }
      }
    } catch (e: any) {
      Alert.alert('Upload Failed', e?.message || 'Could not upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) { Alert.alert('Required', 'First name is required.'); return; }
    if (!lastName.trim()) { Alert.alert('Required', 'Last name is required.'); return; }
    setSaving(true);
    try {
      const updated = await usersAPI.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        dietaryPreferences: dietaryPrefs,
        allergies,
        customAllergies: customAllergies.trim() || undefined,
      });
      if (updated) setUser(updated);
      Alert.alert('Saved', 'Profile updated successfully.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setShowPasswordModal(true);
  };

  const submitChangePassword = async () => {
    if (!currentPw) { Alert.alert('Required', 'Enter your current password.'); return; }
    if (newPw.length < 8) { Alert.alert('Too Short', 'New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { Alert.alert('Mismatch', 'New passwords do not match.'); return; }
    setChangingPw(true);
    try {
      await usersAPI.changePassword(currentPw, newPw);
      setShowPasswordModal(false);
      Alert.alert('Success', 'Your password has been changed.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not change password.');
    }
    setChangingPw(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveBtn, saving && { opacity: 0.5 }]}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickAvatar} disabled={uploadingAvatar}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View style={styles.cameraBtn}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <Ionicons name="camera" size={16} color={colors.textWhite} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</Text>
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
                autoCapitalize="none"
              />
              {user?.email && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
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
              {user?.phone && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={styles.prefCard}>
          <Text style={styles.prefTitle}>Dietary Preferences</Text>
          <View style={styles.prefGrid}>
            {DIETARY_OPTIONS.map((pref) => {
              const isSelected = dietaryPrefs.includes(pref);
              return (
                <TouchableOpacity key={pref} style={[styles.prefChip, isSelected && styles.prefChipActive]} onPress={() => togglePref(pref)}>
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
            {ALLERGY_OPTIONS.map((allergy) => {
              const isSelected = allergies.includes(allergy);
              return (
                <TouchableOpacity key={allergy} style={[styles.allergyChip, isSelected && styles.allergyChipActive]} onPress={() => toggleAllergy(allergy)}>
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

          <Text style={[styles.prefTitle, { fontSize: 13, marginTop: 14, marginBottom: 6, color: colors.textSecondary }]}>
            Other Allergies / Dietary Needs
          </Text>
          <TextInput
            style={styles.customAllergyInput}
            placeholder="e.g. Nightshades, MSG sensitivity, Pescatarian..."
            placeholderTextColor={colors.textLight}
            value={customAllergies}
            onChangeText={setCustomAllergies}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
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
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={20} color={colors.navy} />
            <Text style={styles.actionText}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide" onRequestClose={() => setShowPasswordModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPasswordModal(false)}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Change Password</Text>

              <Text style={styles.modalLabel}>Current Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter current password"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                value={currentPw}
                onChangeText={setCurrentPw}
              />

              <Text style={styles.modalLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Min 8 characters"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                value={newPw}
                onChangeText={setNewPw}
              />

              <Text style={styles.modalLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                value={confirmPw}
                onChangeText={setConfirmPw}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.lightGray, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: changingPw ? 0.5 : 1 }}
                  onPress={submitChangePassword}
                  disabled={changingPw}
                >
                  {changingPw ? (
                    <ActivityIndicator size="small" color={colors.textWhite} />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
  customAllergyInput: {
    backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: colors.textPrimary, minHeight: 50, textAlignVertical: 'top',
  },
  actionsCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  actionText: { flex: 1, fontSize: 15, color: colors.textPrimary },
  actionValue: { fontSize: 14, color: colors.textLight },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 12, marginBottom: 4 },
  modalInput: {
    backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.textPrimary,
  },
});
