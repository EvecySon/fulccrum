import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';

const AVAILABLE_ROLES = [
  { id: 'super_admin', displayName: 'Super Admin' },
  { id: 'finance_manager', displayName: 'Finance Manager' },
  { id: 'operations_lead', displayName: 'Operations Lead' },
  { id: 'content_moderator', displayName: 'Content Moderator' },
  { id: 'marketing_specialist', displayName: 'Marketing Specialist' },
  { id: 'support_agent', displayName: 'Support Agent' },
];


export default function AdminUsersScreen({ navigation }: any) {
  const currentUserId = '1';
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: 'support_agent',
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAdmins();
      if (res?.data) {
        setAdmins(res.data);
      } else if (Array.isArray(res)) {
        setAdmins(res);
      }
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdmins();
    setRefreshing(false);
  };

  const handleCreate = () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }
    if (form.password.length < 8) {
      showAlert('Error', 'Password must be at least 8 characters');
      return;
    }
    const role = AVAILABLE_ROLES.find(r => r.id === form.roleId);
    const newAdmin = {
      id: String(admins.length + 1),
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      roleId: form.roleId,
      roleName: role?.displayName || form.roleId,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    setAdmins(prev => [...prev, newAdmin]);
    showAlert('Success', `Admin user created as ${role?.displayName}`);
    setShowCreateModal(false);
    setForm({ email: '', password: '', firstName: '', lastName: '', phone: '', roleId: 'support_agent' });
  };

  const handleRemove = (admin: any) => {
    if (admin.id === currentUserId) {
      showAlert('Error', 'You cannot remove yourself');
      return;
    }
    showAlert(
      'Remove Admin',
      `Are you sure you want to remove admin access for ${admin.firstName} ${admin.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAdmins(prev => prev.filter(a => a.id !== admin.id));
            showAlert('Done', 'Admin access removed');
          },
        },
      ],
    );
  };

  const openRolePicker = (admin: any) => {
    setSelectedAdmin(admin);
    setShowRoleModal(true);
  };

  const assignRole = (roleId: string) => {
    const role = AVAILABLE_ROLES.find(r => r.id === roleId);
    setAdmins(prev => prev.map(a => a.id === selectedAdmin.id ? { ...a, roleId, roleName: role?.displayName || roleId } : a));
    showAlert('Success', `${selectedAdmin.firstName} is now ${role?.displayName}`);
    setShowRoleModal(false);
    setSelectedAdmin(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'super_admin': return colors.error;
      case 'finance_manager': return colors.success;
      case 'operations_lead': return colors.navy;
      case 'content_moderator': return colors.warning;
      case 'marketing_specialist': return colors.info;
      case 'support_agent': return colors.teal;
      default: return colors.textSecondary;
    }
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
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />
          }
        >
          <Text style={styles.sectionLabel}>{admins.length} admin user{admins.length !== 1 ? 's' : ''}</Text>

          {admins.map((admin) => (
            <View key={admin.id} style={styles.adminCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {admin.firstName[0]}{admin.lastName[0]}
                </Text>
              </View>
              <View style={styles.adminInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.adminName}>{admin.firstName} {admin.lastName}</Text>
                  {admin.id === currentUserId && (
                    <View style={styles.youBadge}><Text style={styles.youText}>You</Text></View>
                  )}
                </View>
                <Text style={styles.adminEmail}>{admin.email}</Text>
                <TouchableOpacity style={styles.roleBadge} onPress={() => openRolePicker(admin)}>
                  <View style={[styles.roleDot, { backgroundColor: getRoleColor(admin.roleId) }]} />
                  <Text style={styles.roleLabel}>{admin.roleName}</Text>
                  <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.adminMeta}>
                  Joined {formatDate(admin.createdAt)}
                  {admin.lastLogin ? ` · Last login ${formatDate(admin.lastLogin)}` : ' · Never logged in'}
                </Text>
              </View>
              {admin.id !== currentUserId && (
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

              <Text style={styles.inputLabel}>Role *</Text>
              <View style={styles.rolePickerList}>
                {AVAILABLE_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[styles.rolePickerItem, form.roleId === role.id && styles.rolePickerItemActive]}
                    onPress={() => setForm({ ...form, roleId: role.id })}
                  >
                    <View style={[styles.roleDot, { backgroundColor: getRoleColor(role.id) }]} />
                    <Text style={[styles.rolePickerText, form.roleId === role.id && styles.rolePickerTextActive]}>{role.displayName}</Text>
                    {form.roleId === role.id && <Ionicons name="checkmark-circle" size={18} color={colors.navy} />}
                  </TouchableOpacity>
                ))}
              </View>

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
      {/* Role Assignment Modal */}
      <Modal visible={showRoleModal} transparent animationType="fade" onRequestClose={() => setShowRoleModal(false)}>
        <TouchableOpacity style={styles.roleModalOverlay} activeOpacity={1} onPress={() => setShowRoleModal(false)}>
          <View style={styles.roleModalContent}>
            <Text style={styles.roleModalTitle}>Assign Role</Text>
            {selectedAdmin && (
              <Text style={styles.roleModalSubtitle}>{selectedAdmin.firstName} {selectedAdmin.lastName}</Text>
            )}
            {AVAILABLE_ROLES.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[styles.roleOption, selectedAdmin?.roleId === role.id && styles.roleOptionActive]}
                onPress={() => assignRole(role.id)}
              >
                <View style={[styles.roleDot, { backgroundColor: getRoleColor(role.id) }]} />
                <Text style={[styles.roleOptionText, selectedAdmin?.roleId === role.id && styles.roleOptionTextActive]}>{role.displayName}</Text>
                {selectedAdmin?.roleId === role.id && <Ionicons name="checkmark-circle" size={20} color={colors.navy} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.teal + '20',
  },
  youText: { fontSize: 10, fontWeight: '700', color: colors.teal },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    gap: 6,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  removeBtn: { padding: 4 },
  rolePickerList: {
    gap: 6,
    marginBottom: 4,
  },
  rolePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    gap: 10,
  },
  rolePickerItemActive: {
    backgroundColor: colors.navy + '12',
    borderWidth: 1,
    borderColor: colors.navy,
  },
  rolePickerText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  rolePickerTextActive: {
    fontWeight: '700',
    color: colors.navy,
  },
  roleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 380,
  },
  roleModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roleModalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
    gap: 10,
  },
  roleOptionActive: {
    backgroundColor: colors.navy + '12',
    borderWidth: 1,
    borderColor: colors.navy,
  },
  roleOptionText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  roleOptionTextActive: {
    fontWeight: '700',
    color: colors.navy,
  },
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
