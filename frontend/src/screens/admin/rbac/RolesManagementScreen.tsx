import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { colors } from '../../../theme/colors';
import { rbacAPI } from '../../../services/api';

export default function RolesManagementScreen() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rbacAPI.getRoles();
      setRoles(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.displayName) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      await rbacAPI.createRole({
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: formData.displayName,
        description: formData.description,
        permissions: {
          users: ['read'],
          orders: ['read'],
          finance: [],
          operations: [],
          marketing: [],
          analytics: ['read'],
        },
      });
      Alert.alert('Success', 'Role created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', displayName: '', description: '' });
      loadRoles();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create role');
    }
  };

  const toggleRoleStatus = async (roleId: string, currentStatus: boolean) => {
    try {
      await rbacAPI.updateRole(roleId, { isActive: !currentStatus });
      Alert.alert('Success', 'Role status updated');
      loadRoles();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Roles Management</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ New Role</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.rolesList}>
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
              <Text style={styles.roleUsers}>{role.adminUsers?.length || 0} users assigned</Text>
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
          <View style={styles.modalContent}>
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', displayName: '', description: '' });
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
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
