import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { marketingAPI } from '../../../services/api';

export default function PromoCodeManagerScreen({ navigation }: any) {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await marketingAPI.getPromoCodes();
      console.log('Promo codes response:', response);
      console.log('Response data:', response.data);
      
      // Handle different response structures
      const codes = response.data?.data || response.data?.codes || response.data || [];
      console.log('Extracted promo codes:', codes);
      setPromoCodes(Array.isArray(codes) ? codes : []);
    } catch (error: any) {
      console.error('Load promo codes error:', error);
      console.error('Error response:', error?.response?.data);
      showAlert('Error', error.response?.data?.message || 'Failed to load promo codes');
      setPromoCodes([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.value) {
      showAlert('Error', 'Please fill in required fields');
      return;
    }

    try {
      console.log('Creating promo code with data:', formData);
      
      const payload = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: 1,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        applicableTo: {},
      };
      
      console.log('Payload to send:', payload);
      
      const result = await marketingAPI.createPromoCode(payload);
      console.log('Promo code created:', result);
      
      showAlert('Success', 'Promo code created successfully');
      setShowCreateModal(false);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      loadPromoCodes();
    } catch (error: any) {
      console.error('Promo code creation error:', error);
      console.error('Error response:', error?.response?.data);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create promo code';
      showAlert('Error', errorMsg);
    }
  };

  const togglePromoStatus = async (promoId: string, currentStatus: boolean) => {
    try {
      await marketingAPI.updatePromoCode(promoId, { isActive: !currentStatus });
      showAlert('Success', 'Promo code status updated');
      loadPromoCodes();
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to update promo code');
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
        <Text style={styles.title}>Promo Code Manager</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createButtonText}>+ New Code</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.promoList}>
        {promoCodes.map((promo) => (
          <View key={promo.id} style={styles.promoCard}>
            <View style={styles.promoHeader}>
              <View>
                <Text style={styles.promoCode}>{promo.code}</Text>
                <Text style={styles.promoType}>{promo.type}</Text>
              </View>
              <TouchableOpacity
                style={[styles.statusBadge, promo.isActive ? styles.statusActive : styles.statusInactive]}
                onPress={() => togglePromoStatus(promo.id, promo.isActive)}
              >
                <Text style={styles.statusText}>{promo.isActive ? 'Active' : 'Inactive'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.promoDetails}>
              <View style={styles.promoDetail}>
                <Text style={styles.promoDetailLabel}>Value:</Text>
                <Text style={styles.promoDetailValue}>
                  {promo.type === 'percentage' ? `${promo.value}%` : `₦${promo.value}`}
                </Text>
              </View>
              {promo.minOrderValue > 0 && (
                <View style={styles.promoDetail}>
                  <Text style={styles.promoDetailLabel}>Min Order:</Text>
                  <Text style={styles.promoDetailValue}>₦{promo.minOrderValue}</Text>
                </View>
              )}
              {promo.usageLimit && (
                <View style={styles.promoDetail}>
                  <Text style={styles.promoDetailLabel}>Usage:</Text>
                  <Text style={styles.promoDetailValue}>
                    {promo.usageCount} / {promo.usageLimit}
                  </Text>
                </View>
              )}
              <View style={styles.promoDetail}>
                <Text style={styles.promoDetailLabel}>Valid:</Text>
                <Text style={styles.promoDetailValue}>
                  {new Date(promo.validFrom).toLocaleDateString()} - {new Date(promo.validUntil).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {promoCodes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No promo codes found</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Promo Code</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Code (e.g., SAVE20) *"
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
              autoCapitalize="characters"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerButtons}>
                {['percentage', 'fixed_amount', 'free_delivery'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.pickerButton, formData.type === type && styles.pickerButtonActive]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text style={[styles.pickerButtonText, formData.type === type && styles.pickerButtonTextActive]}>
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Value *"
                keyboardType="numeric"
                value={formData.value}
                onChangeText={(text) => setFormData({ ...formData, value: text })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Min Order"
                keyboardType="numeric"
                value={formData.minOrderValue}
                onChangeText={(text) => setFormData({ ...formData, minOrderValue: text })}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Max Discount"
                keyboardType="numeric"
                value={formData.maxDiscount}
                onChangeText={(text) => setFormData({ ...formData, maxDiscount: text })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Usage Limit"
                keyboardType="numeric"
                value={formData.usageLimit}
                onChangeText={(text) => setFormData({ ...formData, usageLimit: text })}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setFormData({
                    code: '',
                    type: 'percentage',
                    value: '',
                    minOrderValue: '',
                    maxDiscount: '',
                    usageLimit: '',
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  });
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
  promoList: { flex: 1, padding: 16 },
  promoCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  promoCode: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, fontFamily: 'monospace' },
  promoType: { fontSize: 12, color: colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusActive: { backgroundColor: colors.success + '20' },
  statusInactive: { backgroundColor: colors.textSecondary + '20' },
  statusText: { fontSize: 12, fontWeight: '600' },
  promoDetails: { gap: 8 },
  promoDetail: { flexDirection: 'row', justifyContent: 'space-between' },
  promoDetailLabel: { fontSize: 14, color: colors.textSecondary },
  promoDetailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 16, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.white, borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  pickerContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.textPrimary },
  pickerButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  pickerButtonActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  pickerButtonText: { color: colors.textPrimary, fontSize: 12, textTransform: 'capitalize' },
  pickerButtonTextActive: { color: colors.white, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  modalCancelButton: { backgroundColor: colors.gray },
  modalConfirmButton: { backgroundColor: colors.navy },
  modalCancelButtonText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  modalConfirmButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
