import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { moderationAPI } from '../../../services/api';

export default function MerchantComplianceScreen() {
  const [compliance, setCompliance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCompliance();
  }, [filter]);

  const loadCompliance = async () => {
    try {
      setLoading(true);
      const filters = filter === 'all' ? {} : { status: filter };
      const response = await moderationAPI.getAllCompliance(filters);
      setCompliance(response.data.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return colors.success;
      case 'expiring_soon': return colors.warning;
      case 'expired': return colors.error;
      case 'pending': return colors.info;
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
        {compliance.map((item) => (
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

        {compliance.length === 0 && (
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
  header: {
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
