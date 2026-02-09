import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersScreen({ navigation }: any) {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAdmins();
      setAdmins(res.data || []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    try {
      setCreating(true);
      await adminAPI.createAdmin({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      });
      Alert.alert('Success', 'Admin user created successfully');
      setShowCreateModal(false);
      setForm({ email: '', password: '', firstName: '', lastName: '', phone: '' });
      loadAdmins();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create admin user');
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = (admin: AdminUser) => {
    if (admin.id === user?.id) {
      Alert.alert('Error', 'You cannot remove yourself');
      return;
    }
    Alert.alert(
      'Remove Admin',
      `Are you sure you want to remove admin access for ${admin.firstName} ${admin.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.removeAdmin(admin.id);
              Alert.alert('Done', 'Admin access removed');
              loadAdmins();
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to remove admin');
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Users</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>{admins.length} admin user{admins.length !== 1 ? 's' : ''}</Text>

          {admins.map((admin) => (
            <View key={admin.id} style={styles.adminCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {admin.firstName[0]}{admin.lastName[0]}
                </Text>
              </View>
              <View style={styles.adminInfo}>
                <Text style={styles.adminName}>{admin.firstName} {admin.lastName}</Text>
                <Text style={styles.adminEmail}>{admin.email}</Text>
                <Text style={styles.adminMeta}>
                  Joined {formatDate(admin.createdAt)}
                  {admin.lastLogin ? ` · Last login ${formatDate(admin.lastLogin)}` : ' · Never logged in'}
                </Text>
              </View>
              {admin.id === user?.id ? (
                <View style={styles.youBadge}>
                  <Text style={styles.youText}>You</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleRemove(admin)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {admins.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No admin users found</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Create Admin Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Admin User</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={form.firstName}
                onChangeText={(v) => setForm({ ...form, firstName: v })}
                placeholder="Enter first name"
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={form.lastName}
                onChangeText={(v) => setForm({ ...form, lastName: v })}
                placeholder="Enter last name"
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(v) => setForm({ ...form, email: v })}
                placeholder="admin@fulccrum.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(v) => setForm({ ...form, password: v })}
                placeholder="Min 8 characters"
                placeholderTextColor={colors.textLight}
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Phone (optional)</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
                placeholder="+234..."
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={[styles.createBtn, creating && styles.createBtnDisabled]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.createBtnText}>Create Admin</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 28,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 10,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.navy + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.navy },
  adminInfo: { flex: 1 },
  adminName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  adminEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  adminMeta: { fontSize: 11, color: colors.textLight, marginTop: 4 },
  youBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.teal + '20',
  },
  youText: { fontSize: 12, fontWeight: '700', color: colors.teal },
  removeBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textLight },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  createBtn: {
    backgroundColor: colors.navy,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
