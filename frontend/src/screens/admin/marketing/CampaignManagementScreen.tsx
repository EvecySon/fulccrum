import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { marketingAPI } from '../../../services/api';

export default function CampaignManagementScreen({ navigation }: any) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await marketingAPI.getCampaigns();
      setCampaigns(response.data.data || []);
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      showAlert('Error', 'Please enter campaign name');
      return;
    }

    try {
      await marketingAPI.createCampaign({
        name: formData.name,
        type: formData.type,
        startDate: new Date(formData.startDate),
        budget: formData.budget ? parseFloat(formData.budget) : null,
        targetAudience: {},
        config: {},
      });
      showAlert('Success', 'Campaign created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', type: 'email', budget: '', startDate: new Date().toISOString().split('T')[0] });
      loadCampaigns();
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to create campaign');
    }
  };

  const handleLaunch = async (campaignId: string) => {
    showAlert(
      'Launch Campaign',
      'Are you sure you want to launch this campaign?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Launch',
          onPress: async () => {
            try {
              await marketingAPI.launchCampaign(campaignId);
              showAlert('Success', 'Campaign launched');
              loadCampaigns();
            } catch (error: any) {
              showAlert('Error', error.response?.data?.message || 'Failed to launch campaign');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'paused': return colors.warning;
      case 'completed': return colors.info;
      case 'draft': return colors.textSecondary;
      default: return colors.textSecondary;
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Campaign Management</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createButtonText}>+ New Campaign</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.campaignsList}>
        {campaigns.map((campaign) => (
          <View key={campaign.id} style={styles.campaignCard}>
            <View style={styles.campaignHeader}>
              <View>
                <Text style={styles.campaignName}>{campaign.name}</Text>
                <Text style={styles.campaignType}>{campaign.type}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(campaign.status) }]}>
                  {campaign.status}
                </Text>
              </View>
            </View>

            <View style={styles.campaignDetails}>
              {campaign.budget && (
                <View style={styles.campaignDetail}>
                  <Text style={styles.campaignDetailLabel}>Budget:</Text>
                  <Text style={styles.campaignDetailValue}>₦{campaign.budget.toLocaleString()}</Text>
                </View>
              )}
              <View style={styles.campaignDetail}>
                <Text style={styles.campaignDetailLabel}>Start Date:</Text>
                <Text style={styles.campaignDetailValue}>
                  {new Date(campaign.startDate).toLocaleDateString()}
                </Text>
              </View>
              {campaign.endDate && (
                <View style={styles.campaignDetail}>
                  <Text style={styles.campaignDetailLabel}>End Date:</Text>
                  <Text style={styles.campaignDetailValue}>
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {campaign.status === 'draft' && (
              <TouchableOpacity
                style={styles.launchButton}
                onPress={() => handleLaunch(campaign.id)}
              >
                <Text style={styles.launchButtonText}>Launch Campaign</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {campaigns.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No campaigns found</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Campaign</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Campaign Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Campaign Type</Text>
              <View style={styles.pickerButtons}>
                {['email', 'push', 'sms', 'banner'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.pickerButton, formData.type === type && styles.pickerButtonActive]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text style={[styles.pickerButtonText, formData.type === type && styles.pickerButtonTextActive]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Budget (optional)"
              keyboardType="numeric"
              value={formData.budget}
              onChangeText={(text) => setFormData({ ...formData, budget: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', type: 'email', budget: '', startDate: new Date().toISOString().split('T')[0] });
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]} onPress={handleCreate}>
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
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 },
  createButton: { backgroundColor: colors.navy, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  createButtonText: { color: colors.white, fontWeight: '600' },
  campaignsList: { flex: 1, padding: 16 },
  campaignCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  campaignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  campaignName: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  campaignType: { fontSize: 14, color: colors.textSecondary, marginTop: 4, textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  campaignDetails: { gap: 8 },
  campaignDetail: { flexDirection: 'row', justifyContent: 'space-between' },
  campaignDetailLabel: { fontSize: 14, color: colors.textSecondary },
  campaignDetailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  launchButton: { backgroundColor: colors.success, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  launchButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 16, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.white, borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  pickerContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.textPrimary },
  pickerButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  pickerButtonActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  pickerButtonText: { color: colors.textPrimary, fontSize: 12 },
  pickerButtonTextActive: { color: colors.white, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  modalCancelButton: { backgroundColor: colors.gray },
  modalConfirmButton: { backgroundColor: colors.navy },
  modalCancelButtonText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  modalConfirmButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
