import { showAlert } from '../../../utils/alert';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

const MOCK_COMPLIANCE = [
  {
    id: '1', status: 'compliant',
    business: { businessName: 'Chicken Republic - Lekki', user: { firstName: 'Adewale', lastName: 'Johnson' } },
    licenseNumber: 'LG/LK/2025/FD-00412', licenseExpiry: '2026-11-30T00:00:00Z',
    healthPermit: 'HP-LAG-2025-08821', permitExpiry: '2026-08-15T00:00:00Z',
    insurancePolicy: 'AXA-NG-BIZ-445201', insuranceExpiry: '2026-12-01T00:00:00Z',
    taxId: 'TIN-20451892-0001',
    lastChecked: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: 'All documents verified. Next review scheduled for August 2026.',
  },
  {
    id: '2', status: 'compliant',
    business: { businessName: 'The Place - Victoria Island', user: { firstName: 'Funke', lastName: 'Adeyemi' } },
    licenseNumber: 'LG/VI/2025/FD-00287', licenseExpiry: '2026-09-20T00:00:00Z',
    healthPermit: 'HP-LAG-2025-07234', permitExpiry: '2026-07-10T00:00:00Z',
    insurancePolicy: 'LEADWAY-BIZ-332109', insuranceExpiry: '2027-01-15T00:00:00Z',
    taxId: 'TIN-18923456-0001',
    lastChecked: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: '3', status: 'expiring_soon',
    business: { businessName: 'Mama Put Kitchen - Surulere', user: { firstName: 'Ngozi', lastName: 'Okafor' } },
    licenseNumber: 'LG/SR/2024/FD-01102', licenseExpiry: '2026-03-15T00:00:00Z',
    healthPermit: 'HP-LAG-2024-12450', permitExpiry: '2026-02-28T00:00:00Z',
    insurancePolicy: null, insuranceExpiry: null,
    taxId: 'TIN-30128745-0001',
    lastChecked: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Health permit expires in 2 weeks. Merchant notified via email and SMS. No insurance on file — follow up required.',
  },
  {
    id: '4', status: 'expiring_soon',
    business: { businessName: 'Dominos Pizza - Ikeja', user: { firstName: 'Chidi', lastName: 'Nnamdi' } },
    licenseNumber: 'LG/IK/2024/FD-00891', licenseExpiry: '2026-04-01T00:00:00Z',
    healthPermit: 'HP-LAG-2024-11003', permitExpiry: '2026-03-20T00:00:00Z',
    insurancePolicy: 'AIICO-BIZ-778432', insuranceExpiry: '2026-03-01T00:00:00Z',
    taxId: 'TIN-22567890-0001',
    lastChecked: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: 'Insurance policy expiring soon. Renewal reminder sent.',
  },
  {
    id: '5', status: 'expired',
    business: { businessName: 'Buka Hut - Ikoyi', user: { firstName: 'Bola', lastName: 'Tinubu' } },
    licenseNumber: 'LG/IK/2023/FD-00543', licenseExpiry: '2025-12-31T00:00:00Z',
    healthPermit: 'HP-LAG-2023-09876', permitExpiry: '2025-11-30T00:00:00Z',
    insurancePolicy: null, insuranceExpiry: null,
    taxId: 'TIN-15678234-0001',
    lastChecked: new Date(Date.now() - 30 * 86400000).toISOString(),
    notes: 'License and health permit both expired. Merchant suspended from platform until renewal. Multiple reminders sent with no response.',
  },
  {
    id: '6', status: 'expired',
    business: { businessName: 'Tantalizers - Festac', user: { firstName: 'Emeka', lastName: 'Obi' } },
    licenseNumber: 'LG/FT/2024/FD-00234', licenseExpiry: '2026-01-15T00:00:00Z',
    healthPermit: 'HP-LAG-2024-05567', permitExpiry: '2025-12-20T00:00:00Z',
    insurancePolicy: 'CUSTODIAN-BIZ-112233', insuranceExpiry: '2026-06-30T00:00:00Z',
    taxId: null,
    lastChecked: new Date(Date.now() - 15 * 86400000).toISOString(),
    notes: 'Health permit expired. License recently expired. Tax ID missing — merchant asked to provide.',
  },
  {
    id: '7', status: 'pending',
    business: { businessName: 'Seoul Kitchen - Lekki Phase 2', user: { firstName: 'Jin', lastName: 'Kim' } },
    licenseNumber: null, licenseExpiry: null,
    healthPermit: null, permitExpiry: null,
    insurancePolicy: null, insuranceExpiry: null,
    taxId: null,
    lastChecked: null,
    notes: 'New merchant application. Awaiting all compliance documents. Onboarding call scheduled for next week.',
  },
  {
    id: '8', status: 'pending',
    business: { businessName: 'Kilimanjaro - Ajah', user: { firstName: 'Yusuf', lastName: 'Mohammed' } },
    licenseNumber: 'LG/AJ/2026/FD-00015', licenseExpiry: '2027-02-01T00:00:00Z',
    healthPermit: null, permitExpiry: null,
    insurancePolicy: null, insuranceExpiry: null,
    taxId: 'TIN-40123456-0001',
    lastChecked: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'License submitted and verified. Still waiting for health permit and insurance documents.',
  },
];

export default function MerchantComplianceScreen({ navigation }: any) {
  const [compliance, setCompliance] = useState<any[]>(MOCK_COMPLIANCE);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredCompliance = filter === 'all' ? compliance : compliance.filter(c => c.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return colors.success;
      case 'expiring_soon': return colors.warning;
      case 'expired': return colors.error;
      case 'pending': return colors.info;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Merchant Compliance</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'compliant', 'expiring_soon', 'expired', 'pending'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, filter === status && styles.filterChipActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterChipText, filter === status && styles.filterChipTextActive]}>
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.complianceList}>
        {filteredCompliance.map((item) => (
          <View key={item.id} style={styles.complianceCard}>
            <View style={styles.complianceHeader}>
              <View>
                <Text style={styles.businessName}>{item.business.businessName}</Text>
                <Text style={styles.ownerName}>
                  {item.business.user.firstName} {item.business.user.lastName}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            <View style={styles.complianceDetails}>
              {item.licenseNumber && (
                <View style={styles.complianceItem}>
                  <Text style={styles.complianceLabel}>License:</Text>
                  <Text style={styles.complianceValue}>{item.licenseNumber}</Text>
                  {item.licenseExpiry && (
                    <Text style={[
                      styles.expiryDate,
                      new Date(item.licenseExpiry) < new Date() && styles.expired
                    ]}>
                      Expires: {new Date(item.licenseExpiry).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}

              {item.healthPermit && (
                <View style={styles.complianceItem}>
                  <Text style={styles.complianceLabel}>Health Permit:</Text>
                  <Text style={styles.complianceValue}>{item.healthPermit}</Text>
                  {item.permitExpiry && (
                    <Text style={[
                      styles.expiryDate,
                      new Date(item.permitExpiry) < new Date() && styles.expired
                    ]}>
                      Expires: {new Date(item.permitExpiry).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}

              {item.insurancePolicy && (
                <View style={styles.complianceItem}>
                  <Text style={styles.complianceLabel}>Insurance:</Text>
                  <Text style={styles.complianceValue}>{item.insurancePolicy}</Text>
                  {item.insuranceExpiry && (
                    <Text style={[
                      styles.expiryDate,
                      new Date(item.insuranceExpiry) < new Date() && styles.expired
                    ]}>
                      Expires: {new Date(item.insuranceExpiry).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}

              {item.taxId && (
                <View style={styles.complianceItem}>
                  <Text style={styles.complianceLabel}>Tax ID:</Text>
                  <Text style={styles.complianceValue}>{item.taxId}</Text>
                </View>
              )}
            </View>

            {item.lastChecked && (
              <Text style={styles.lastChecked}>
                Last checked: {new Date(item.lastChecked).toLocaleDateString()}
              </Text>
            )}

            {item.notes && (
              <Text style={styles.notes}>Notes: {item.notes}</Text>
            )}
          </View>
        ))}

        {filteredCompliance.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No compliance records found</Text>
          </View>
        )}
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  complianceList: {
    flex: 1,
    padding: 16,
  },
  complianceCard: {
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
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  ownerName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
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
  complianceDetails: {
    gap: 12,
  },
  complianceItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  complianceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  complianceValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 12,
    color: colors.warning,
  },
  expired: {
    color: colors.error,
    fontWeight: '600',
  },
  lastChecked: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
  },
  notes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
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
});
