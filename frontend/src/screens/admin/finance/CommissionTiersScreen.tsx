import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { financeAPI } from '../../../services/api';

export default function CommissionTiersScreen({ navigation }: any) {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessType: 'restaurant',
    minOrders: '',
    maxOrders: '',
    percentage: '',
    flatFee: '',
    description: '',
  });

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getCommissionTiers();
      setTiers(response.data || []);
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to load commission tiers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.percentage) {
      showAlert('Error', 'Please fill in required fields');
      return;
    }

    try {
      await financeAPI.createCommissionTier({
        name: formData.name,
        businessType: formData.businessType,
        minOrders: parseInt(formData.minOrders) || 0,
        maxOrders: formData.maxOrders ? parseInt(formData.maxOrders) : null,
        percentage: parseFloat(formData.percentage),
        flatFee: formData.flatFee ? parseFloat(formData.flatFee) : null,
        description: formData.description,
      });
      showAlert('Success', 'Commission tier created successfully');
      setShowCreateForm(false);
      setFormData({
        name: '',
        businessType: 'restaurant',
        minOrders: '',
        maxOrders: '',
        percentage: '',
        flatFee: '',
        description: '',
      });
      loadTiers();
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to create tier');
    }
  };

  const toggleTierStatus = async (tierId: string, currentStatus: boolean) => {
    try {
      await financeAPI.updateCommissionTier(tierId, { isActive: !currentStatus });
      showAlert('Success', 'Tier status updated');
      loadTiers();
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to update tier');
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
        <Text style={styles.title}>Commission Tiers</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.createButtonText}>{showCreateForm ? 'Cancel' : '+ New Tier'}</Text>
        </TouchableOpacity>
      </View>

      {showCreateForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Create New Commission Tier</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Tier Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Business Type</Text>
            <View style={styles.pickerButtons}>
              {['restaurant', 'grocery', 'pharmacy', 'convenience'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerButton,
                    formData.businessType === type && styles.pickerButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, businessType: type })}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      formData.businessType === type && styles.pickerButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Min Orders *"
              keyboardType="numeric"
              value={formData.minOrders}
              onChangeText={(text) => setFormData({ ...formData, minOrders: text })}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Max Orders (optional)"
              keyboardType="numeric"
              value={formData.maxOrders}
              onChangeText={(text) => setFormData({ ...formData, maxOrders: text })}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Percentage % *"
              keyboardType="numeric"
              value={formData.percentage}
              onChangeText={(text) => setFormData({ ...formData, percentage: text })}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Flat Fee (optional)"
              keyboardType="numeric"
              value={formData.flatFee}
              onChangeText={(text) => setFormData({ ...formData, flatFee: text })}
            />
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
            <Text style={styles.submitButtonText}>Create Tier</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.tiersList}>
        {tiers.map((tier) => (
          <View key={tier.id} style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <View>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierType}>{tier.businessType}</Text>
              </View>
              <TouchableOpacity
                style={[styles.statusBadge, tier.isActive ? styles.statusActive : styles.statusInactive]}
                onPress={() => toggleTierStatus(tier.id, tier.isActive)}
              >
                <Text style={styles.statusText}>{tier.isActive ? 'Active' : 'Inactive'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tierDetails}>
              <View style={styles.tierDetail}>
                <Text style={styles.tierDetailLabel}>Order Range:</Text>
                <Text style={styles.tierDetailValue}>
                  {tier.minOrders} - {tier.maxOrders || '∞'}
                </Text>
              </View>
              <View style={styles.tierDetail}>
                <Text style={styles.tierDetailLabel}>Commission:</Text>
                <Text style={styles.tierDetailValue}>
                  {tier.percentage}%{tier.flatFee ? ` + ₦${tier.flatFee}` : ''}
                </Text>
              </View>
            </View>

            {tier.description && (
              <Text style={styles.tierDescription}>{tier.description}</Text>
            )}
          </View>
        ))}
      </ScrollView>
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
  form: {
    backgroundColor: colors.white,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  pickerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pickerButtonActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  pickerButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  pickerButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.navy,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tiersList: {
    padding: 16,
  },
  tierCard: {
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
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  tierType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
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
  tierDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierDetail: {
    flex: 1,
  },
  tierDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tierDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tierDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
