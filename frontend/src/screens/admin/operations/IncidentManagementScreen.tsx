import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { operationsAPI } from '../../../services/api';

const MOCK_INCIDENTS = [
  {
    id: '1', severity: 'critical', status: 'open', type: 'payment_failure',
    description: 'Multiple customers reporting failed payments via Paystack gateway. 12 orders affected in the last 30 minutes.',
    order: { orderNumber: 'ORD-2026-4810' },
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), resolution: null, resolvedAt: null,
  },
  {
    id: '2', severity: 'high', status: 'investigating', type: 'delivery_delay',
    description: 'Courier fleet shortage in Ikeja area causing 40+ min delays. 8 orders waiting for pickup.',
    order: { orderNumber: 'ORD-2026-4798' },
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(), resolution: null, resolvedAt: null,
  },
  {
    id: '3', severity: 'medium', status: 'open', type: 'merchant_offline',
    description: 'Chicken Republic - Lekki branch tablet offline for 15 minutes. 3 pending orders not acknowledged.',
    order: { orderNumber: 'ORD-2026-4821' },
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(), resolution: null, resolvedAt: null,
  },
  {
    id: '4', severity: 'low', status: 'open', type: 'customer_complaint',
    description: 'Customer reports missing item (Jollof Rice) from order. Merchant confirmed item was packed.',
    order: { orderNumber: 'ORD-2026-4785' },
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), resolution: null, resolvedAt: null,
  },
  {
    id: '5', severity: 'high', status: 'resolved', type: 'system_outage',
    description: 'Push notification service was down for 20 minutes. Couriers not receiving new order alerts.',
    order: null,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    resolution: 'Firebase Cloud Messaging service restarted. All pending notifications flushed and delivered. Monitoring for recurrence.',
    resolvedAt: new Date(Date.now() - 4.5 * 3600000).toISOString(),
  },
  {
    id: '6', severity: 'medium', status: 'resolved', type: 'wrong_delivery',
    description: 'Order delivered to wrong address. Customer at 14 Admiralty Way received order meant for 14 Admiralty Rd.',
    order: { orderNumber: 'ORD-2026-4762' },
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    resolution: 'Replacement order dispatched. Original customer refunded ₦4,500. Address validation logic updated to flag similar street names.',
    resolvedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
  },
];

export default function IncidentManagementScreen({ navigation }: any) {
  const [incidents, setIncidents] = useState<any[]>(MOCK_INCIDENTS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [resolution, setResolution] = useState('');

  const filteredIncidents = filter === 'all' ? incidents : incidents.filter(i => i.status === filter);

  const handleResolve = () => {
    if (!resolution.trim()) {
      showAlert('Error', 'Please provide resolution details');
      return;
    }
    setIncidents(prev => prev.map(i => i.id === selectedIncident.id
      ? { ...i, status: 'resolved', resolution, resolvedAt: new Date().toISOString() }
      : i
    ));
    showAlert('Success', 'Incident resolved successfully');
    setShowResolveModal(false);
    setResolution('');
    setSelectedIncident(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return colors.success;
      case 'medium': return colors.warning;
      case 'high': return colors.error;
      case 'critical': return '#dc2626';
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
        <Text style={styles.title}>Incident Management</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'open', 'investigating', 'resolved'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.filterButtonActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.incidentsList}>
        {filteredIncidents.map((incident) => (
          <View key={incident.id} style={styles.incidentCard}>
            <View style={styles.incidentHeader}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                <Text style={styles.severityText}>{incident.severity.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.info + '20' }]}>
                <Text style={[styles.statusText, { color: colors.info }]}>{incident.status}</Text>
              </View>
            </View>

            <Text style={styles.incidentType}>{incident.type.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.incidentDescription}>{incident.description}</Text>

            {incident.order && (
              <View style={styles.incidentDetail}>
                <Text style={styles.incidentDetailLabel}>Order:</Text>
                <Text style={styles.incidentDetailValue}>{incident.order.orderNumber}</Text>
              </View>
            )}

            <View style={styles.incidentDetail}>
              <Text style={styles.incidentDetailLabel}>Created:</Text>
              <Text style={styles.incidentDetailValue}>
                {new Date(incident.createdAt).toLocaleString()}
              </Text>
            </View>

            {incident.status !== 'resolved' && (
              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => {
                  setSelectedIncident(incident);
                  setShowResolveModal(true);
                }}
              >
                <Text style={styles.resolveButtonText}>Resolve Incident</Text>
              </TouchableOpacity>
            )}

            {incident.resolution && (
              <View style={styles.resolutionContainer}>
                <Text style={styles.resolutionLabel}>Resolution:</Text>
                <Text style={styles.resolutionText}>{incident.resolution}</Text>
                <Text style={styles.resolutionDate}>
                  Resolved: {new Date(incident.resolvedAt).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        ))}

        {filteredIncidents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No incidents found</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showResolveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResolveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resolve Incident</Text>
            <Text style={styles.modalSubtitle}>Provide resolution details:</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter resolution details"
              multiline
              numberOfLines={4}
              value={resolution}
              onChangeText={setResolution}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowResolveModal(false);
                  setResolution('');
                  setSelectedIncident(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleResolve}
              >
                <Text style={styles.modalConfirmButtonText}>Resolve</Text>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  filterText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
  },
  incidentsList: {
    flex: 1,
    padding: 16,
  },
  incidentCard: {
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
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  incidentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  incidentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  incidentDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  incidentDetailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  incidentDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resolveButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  resolveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  resolutionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  resolutionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resolutionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resolutionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
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
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
    backgroundColor: colors.success,
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
