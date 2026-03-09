import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { adminAPI } from '../../../services/api';

const PERMISSION_MATRIX: Record<string, string[]> = {
  users: ['read', 'create', 'update', 'delete'],
  orders: ['read', 'update', 'cancel', 'refund'],
  finance: ['read', 'create', 'approve', 'export'],
  operations: ['read', 'manage', 'resolve'],
  marketing: ['read', 'create', 'update', 'delete'],
  analytics: ['read', 'export'],
};

const MOCK_ROLES_REMOVED = [
  {
    id: '1', name: 'super_admin', displayName: 'Super Admin', isActive: true,
    description: 'Full platform access. Can manage all settings, users, finances, and system configuration.',
    permissions: { users: ['read', 'create', 'update', 'delete'], orders: ['read', 'update', 'cancel'], finance: ['read', 'create', 'approve'], operations: ['read', 'manage'], marketing: ['read', 'create', 'update'], analytics: ['read', 'export'] },
    adminUsers: [{ id: '1' }, { id: '2' }],
  },
  {
    id: '2', name: 'finance_manager', displayName: 'Finance Manager', isActive: true,
    description: 'Manages payouts, refunds, commission tiers, and revenue analytics.',
    permissions: { users: ['read'], orders: ['read'], finance: ['read', 'create', 'approve', 'export'], operations: [], marketing: [], analytics: ['read', 'export'] },
    adminUsers: [{ id: '3' }],
  },
  {
    id: '3', name: 'operations_lead', displayName: 'Operations Lead', isActive: true,
    description: 'Monitors live operations, manages incidents, and tracks SLA compliance.',
    permissions: { users: ['read'], orders: ['read', 'update'], finance: ['read'], operations: ['read', 'manage', 'resolve'], marketing: [], analytics: ['read'] },
    adminUsers: [{ id: '4' }, { id: '5' }, { id: '6' }],
  },
  {
    id: '4', name: 'content_moderator', displayName: 'Content Moderator', isActive: true,
    description: 'Reviews flagged content, manages merchant compliance, and handles user reports.',
    permissions: { users: ['read'], orders: ['read'], finance: [], operations: [], marketing: ['read'], analytics: [] },
    adminUsers: [{ id: '7' }],
  },
  {
    id: '5', name: 'marketing_specialist', displayName: 'Marketing Specialist', isActive: false,
    description: 'Creates campaigns, manages promo codes, and sends push notifications.',
    permissions: { users: ['read'], orders: [], finance: [], operations: [], marketing: ['read', 'create', 'update'], analytics: ['read'] },
    adminUsers: [],
  },
  {
    id: '6', name: 'support_agent', displayName: 'Support Agent', isActive: true,
    description: 'Handles customer support tickets, dispute resolution, and basic order inquiries.',
    permissions: { users: ['read'], orders: ['read', 'update'], finance: [], operations: ['read'], marketing: [], analytics: [] },
    adminUsers: [{ id: '8' }, { id: '9' }],
  },
];

export default function RolesManagementScreen({ navigation }: any) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getRoles();
      if (res?.data) {
        setRoles(res.data);
      } else if (Array.isArray(res)) {
        setRoles(res);
      }
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoles();
    setRefreshing(false);
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [editingPerms, setEditingPerms] = useState<Record<string, string[]>>({});
  const [newPerms, setNewPerms] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
  });

  const emptyPerms = (): Record<string, string[]> => {
    const p: Record<string, string[]> = {};
    for (const key of Object.keys(PERMISSION_MATRIX)) p[key] = [];
    return p;
  };

  const toggleNewPerm = (resource: string, action: string) => {
    setNewPerms(prev => {
      const current = prev[resource] || [];
      const has = current.includes(action);
      return { ...prev, [resource]: has ? current.filter(a => a !== action) : [...current, action] };
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.displayName) {
      showAlert('Error', 'Please fill in required fields');
      return;
    }
    const newRole = {
      id: String(roles.length + 1),
      name: formData.name.toLowerCase().replace(/\s+/g, '_'),
      displayName: formData.displayName,
      description: formData.description,
      isActive: true,
      permissions: { ...newPerms },
      adminUsers: [],
    };
    setRoles(prev => [...prev, newRole]);
    showAlert('Success', 'Role created successfully');
    setShowCreateModal(false);
    setFormData({ name: '', displayName: '', description: '' });
    setNewPerms(emptyPerms());
  };

  const toggleRoleStatus = (roleId: string, currentStatus: boolean) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, isActive: !currentStatus } : r));
    showAlert('Success', 'Role status updated');
  };

  const openPermEditor = (role: any) => {
    setEditingRole(role);
    const copy: Record<string, string[]> = {};
    for (const key of Object.keys(PERMISSION_MATRIX)) {
      copy[key] = [...(role.permissions[key] || [])];
    }
    setEditingPerms(copy);
    setShowPermModal(true);
  };

  const togglePerm = (resource: string, action: string) => {
    setEditingPerms(prev => {
      const current = prev[resource] || [];
      const has = current.includes(action);
      return { ...prev, [resource]: has ? current.filter(a => a !== action) : [...current, action] };
    });
  };

  const savePerms = () => {
    setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, permissions: editingPerms } : r));
    showAlert('Success', `Permissions updated for ${editingRole.displayName}`);
    setShowPermModal(false);
    setEditingRole(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading roles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Roles Management</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => { setNewPerms(emptyPerms()); setShowCreateModal(true); }}
        >
          <Text style={styles.createButtonText}>+ New Role</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.rolesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />
        }
      >
        {roles.map((role) => (
          <View key={role.id} style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View>
                <Text style={styles.roleName}>{role.displayName}</Text>
                <Text style={styles.roleCode}>{role.name}</Text>
              </View>
              <TouchableOpacity
                style={[styles.statusBadge, role.isActive ? styles.statusActive : styles.statusInactive]}
                onPress={() => toggleRoleStatus(role.id, role.isActive)}
              >
                <Text style={styles.statusText}>{role.isActive ? 'Active' : 'Inactive'}</Text>
              </TouchableOpacity>
            </View>

            {role.description && (
              <Text style={styles.roleDescription}>{role.description}</Text>
            )}

            <View style={styles.permissionsSection}>
              <Text style={styles.permissionsTitle}>Permissions:</Text>
              <View style={styles.permissionsList}>
                {Object.entries(role.permissions as Record<string, string[]>).map(([resource, actions]) => (
                  <View key={resource} style={styles.permissionItem}>
                    <Text style={styles.permissionResource}>{resource}:</Text>
                    <Text style={styles.permissionActions}>
                      {(actions as string[]).length > 0 ? (actions as string[]).join(', ') : 'none'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.roleFooter}>
              <View style={styles.footerRow}>
                <Text style={styles.roleUsers}>{role.adminUsers?.length || 0} users assigned</Text>
                <TouchableOpacity style={styles.editPermBtn} onPress={() => openPermEditor(role)}>
                  <Ionicons name="create-outline" size={14} color={colors.white} />
                  <Text style={styles.editPermBtnText}>Edit Permissions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>Create New Role</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Role Name (e.g., finance_manager) *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Display Name (e.g., Finance Manager) *"
              value={formData.displayName}
              onChangeText={(text) => setFormData({ ...formData, displayName: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <Text style={styles.permSectionLabel}>Permissions</Text>
            <ScrollView style={styles.permScrollArea} showsVerticalScrollIndicator={false}>
              {Object.entries(PERMISSION_MATRIX).map(([resource, actions]) => (
                <View key={resource} style={styles.permResourceBlock}>
                  <Text style={styles.permResourceTitle}>{resource.charAt(0).toUpperCase() + resource.slice(1)}</Text>
                  <View style={styles.permActionsRow}>
                    {actions.map((action) => {
                      const active = (newPerms[resource] || []).includes(action);
                      return (
                        <TouchableOpacity
                          key={action}
                          style={[styles.permChip, active && styles.permChipActive]}
                          onPress={() => toggleNewPerm(resource, action)}
                        >
                          <Ionicons name={active ? 'checkbox' : 'square-outline'} size={18} color={active ? colors.white : colors.textSecondary} />
                          <Text style={[styles.permChipText, active && styles.permChipTextActive]}>{action}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', displayName: '', description: '' });
                  setNewPerms(emptyPerms());
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleCreate}
              >
                <Text style={styles.modalConfirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Permission Editor Modal */}
      <Modal visible={showPermModal} transparent animationType="slide" onRequestClose={() => setShowPermModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>Edit Permissions</Text>
            {editingRole && <Text style={styles.permModalSubtitle}>{editingRole.displayName}</Text>}

            <ScrollView style={styles.permScrollArea} showsVerticalScrollIndicator={false}>
              {Object.entries(PERMISSION_MATRIX).map(([resource, actions]) => (
                <View key={resource} style={styles.permResourceBlock}>
                  <Text style={styles.permResourceTitle}>{resource.charAt(0).toUpperCase() + resource.slice(1)}</Text>
                  <View style={styles.permActionsRow}>
                    {actions.map((action) => {
                      const active = (editingPerms[resource] || []).includes(action);
                      return (
                        <TouchableOpacity
                          key={action}
                          style={[styles.permChip, active && styles.permChipActive]}
                          onPress={() => togglePerm(resource, action)}
                        >
                          <Ionicons name={active ? 'checkbox' : 'square-outline'} size={18} color={active ? colors.white : colors.textSecondary} />
                          <Text style={[styles.permChipText, active && styles.permChipTextActive]}>{action}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => { setShowPermModal(false); setEditingRole(null); }}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]} onPress={savePerms}>
                <Text style={styles.modalConfirmButtonText}>Save</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: colors.white, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    gap: 12 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: colors.lightGray, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.textPrimary, 
    flex: 1 
  },
  createButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  rolesList: {
    flex: 1,
    padding: 16,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  roleCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusInactive: {
    backgroundColor: colors.textSecondary + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  permissionsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  permissionsList: {
    gap: 6,
  },
  permissionItem: {
    flexDirection: 'row',
    gap: 8,
  },
  permissionResource: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
    minWidth: 80,
  },
  permissionActions: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  roleFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  roleUsers: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editPermBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  editPermBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  permSectionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  permModalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  permScrollArea: {
    maxHeight: 400,
    marginBottom: 16,
  },
  permResourceBlock: {
    marginBottom: 16,
  },
  permResourceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  permActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: 6,
  },
  permChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  permChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  permChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.gray,
  },
  modalConfirmButton: {
    backgroundColor: colors.navy,
  },
  modalCancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
