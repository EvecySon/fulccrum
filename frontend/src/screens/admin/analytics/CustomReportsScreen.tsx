import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { colors } from '../../../theme/colors';
import { adminAnalyticsAPI } from '../../../services/api';

export default function CustomReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'revenue',
    schedule: 'manual',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await adminAnalyticsAPI.getCustomReports();
      setReports(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please enter report name');
      return;
    }

    try {
      await adminAnalyticsAPI.createCustomReport({
        name: formData.name,
        type: formData.type,
        filters: {},
        columns: ['date', 'total', 'count'],
        schedule: formData.schedule === 'manual' ? null : formData.schedule,
        recipients: [],
        format: 'csv',
      });
      Alert.alert('Success', 'Report created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', type: 'revenue', schedule: 'manual' });
      loadReports();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create report');
    }
  };

  const handleRunReport = async (reportId: string) => {
    try {
      const response = await adminAnalyticsAPI.runReport(reportId);
      Alert.alert('Success', 'Report generated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to run report');
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
        <Text style={styles.title}>Custom Reports</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createButtonText}>+ New Report</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.reportsList}>
        {reports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View>
                <Text style={styles.reportName}>{report.name}</Text>
                <Text style={styles.reportType}>{report.type}</Text>
              </View>
              {report.isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              )}
            </View>

            <View style={styles.reportDetails}>
              <View style={styles.reportDetail}>
                <Text style={styles.reportDetailLabel}>Schedule:</Text>
                <Text style={styles.reportDetailValue}>{report.schedule || 'Manual'}</Text>
              </View>
              <View style={styles.reportDetail}>
                <Text style={styles.reportDetailLabel}>Format:</Text>
                <Text style={styles.reportDetailValue}>{report.format?.toUpperCase()}</Text>
              </View>
              {report.lastRun && (
                <View style={styles.reportDetail}>
                  <Text style={styles.reportDetailLabel}>Last Run:</Text>
                  <Text style={styles.reportDetailValue}>
                    {new Date(report.lastRun).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.runButton}
              onPress={() => handleRunReport(report.id)}
            >
              <Text style={styles.runButtonText}>Run Report</Text>
            </TouchableOpacity>
          </View>
        ))}

        {reports.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No custom reports found</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Custom Report</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Report Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Report Type</Text>
              <View style={styles.pickerButtons}>
                {['revenue', 'orders', 'users', 'merchants'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.pickerButton, formData.type === type && styles.pickerButtonActive]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text style={[styles.pickerButtonText, formData.type === type && styles.pickerButtonTextActive]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Schedule</Text>
              <View style={styles.pickerButtons}>
                {['manual', 'daily', 'weekly', 'monthly'].map((schedule) => (
                  <TouchableOpacity
                    key={schedule}
                    style={[styles.pickerButton, formData.schedule === schedule && styles.pickerButtonActive]}
                    onPress={() => setFormData({ ...formData, schedule })}
                  >
                    <Text style={[styles.pickerButtonText, formData.schedule === schedule && styles.pickerButtonTextActive]}>
                      {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', type: 'revenue', schedule: 'manual' });
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
  createButton: { backgroundColor: colors.navy, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  createButtonText: { color: colors.white, fontWeight: '600' },
  reportsList: { flex: 1, padding: 16 },
  reportCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  reportName: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  reportType: { fontSize: 14, color: colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  activeBadge: { backgroundColor: colors.success + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  activeText: { color: colors.success, fontSize: 12, fontWeight: '600' },
  reportDetails: { gap: 8, marginBottom: 12 },
  reportDetail: { flexDirection: 'row', justifyContent: 'space-between' },
  reportDetailLabel: { fontSize: 14, color: colors.textSecondary },
  reportDetailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, textTransform: 'capitalize' },
  runButton: { backgroundColor: colors.navy, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  runButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 16, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.white, borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  pickerContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.textPrimary },
  pickerButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
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
