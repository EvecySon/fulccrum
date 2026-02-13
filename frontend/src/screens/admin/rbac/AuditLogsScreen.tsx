import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { rbacAPI } from '../../../services/api';

const MOCK_LOGS = [
  {
    id: '1', action: 'created_user', resource: 'User',
    admin: { user: { firstName: 'Adebayo', lastName: 'Ogunlesi' }, role: { displayName: 'Super Admin' } },
    ipAddress: '102.89.23.45', createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    changes: { email: 'newcourier@fulccrum.com', role: 'driver', status: 'active' },
  },
  {
    id: '2', action: 'approved_merchant', resource: 'Merchant',
    admin: { user: { firstName: 'Adebayo', lastName: 'Ogunlesi' }, role: { displayName: 'Super Admin' } },
    ipAddress: '102.89.23.45', createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    changes: { merchantName: 'Mama Put Kitchen', status: 'pending → approved', verifiedAt: new Date().toISOString() },
  },
  {
    id: '3', action: 'updated_commission', resource: 'CommissionTier',
    admin: { user: { firstName: 'Chioma', lastName: 'Nwankwo' }, role: { displayName: 'Finance Manager' } },
    ipAddress: '197.210.54.12', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    changes: { tier: 'Premium Restaurant', percentage: '8% → 7.5%', effectiveDate: '2026-02-15' },
  },
  {
    id: '4', action: 'rejected_refund', resource: 'Refund',
    admin: { user: { firstName: 'Chioma', lastName: 'Nwankwo' }, role: { displayName: 'Finance Manager' } },
    ipAddress: '197.210.54.12', createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    changes: { orderId: 'ORD-2026-4720', amount: '₦3,200', reason: 'Order was delivered correctly per GPS logs' },
  },
  {
    id: '5', action: 'deleted_promo', resource: 'PromoCode',
    admin: { user: { firstName: 'Tunde', lastName: 'Fashola' }, role: { displayName: 'Marketing Specialist' } },
    ipAddress: '41.58.100.88', createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    changes: { code: 'EXPIRED50OFF', reason: 'Campaign ended, code was being shared on social media' },
  },
  {
    id: '6', action: 'updated_role', resource: 'AdminRole',
    admin: { user: { firstName: 'Adebayo', lastName: 'Ogunlesi' }, role: { displayName: 'Super Admin' } },
    ipAddress: '102.89.23.45', createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    changes: { role: 'Operations Lead', added: 'operations.resolve', removed: null },
  },
  {
    id: '7', action: 'created_campaign', resource: 'Campaign',
    admin: { user: { firstName: 'Tunde', lastName: 'Fashola' }, role: { displayName: 'Marketing Specialist' } },
    ipAddress: '41.58.100.88', createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    changes: { name: 'Valentine Special 2026', discount: '25%', budget: '₦500,000' },
  },
  {
    id: '8', action: 'approved_payout', resource: 'Payout',
    admin: { user: { firstName: 'Chioma', lastName: 'Nwankwo' }, role: { displayName: 'Finance Manager' } },
    ipAddress: '197.210.54.12', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    changes: { merchant: 'Chicken Republic - Lekki', amount: '₦245,000', period: 'Feb 1-7, 2026' },
  },
];

export default function AuditLogsScreen({ navigation }: any) {
  const [logs, setLogs] = useState<any[]>(MOCK_LOGS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.action.includes(filter));

  const handleExport = () => {
    showAlert('Success', 'Audit logs exported successfully');
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return colors.success;
    if (action.includes('delete') || action.includes('reject')) return colors.error;
    if (action.includes('update') || action.includes('approve')) return colors.warning;
    return colors.info;
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
        <Text style={styles.title}>Audit Logs</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'created', 'updated', 'deleted', 'approved', 'rejected'].map((action) => (
          <TouchableOpacity
            key={action}
            style={[styles.filterChip, filter === action && styles.filterChipActive]}
            onPress={() => setFilter(action)}
          >
            <Text style={[styles.filterChipText, filter === action && styles.filterChipTextActive]}>
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.logsList}>
        {filteredLogs.map((log) => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <View style={[styles.actionBadge, { backgroundColor: getActionColor(log.action) + '20' }]}>
                <Text style={[styles.actionText, { color: getActionColor(log.action) }]}>
                  {log.action.replace(/_/g, ' ')}
                </Text>
              </View>
              <Text style={styles.logTime}>{new Date(log.createdAt).toLocaleString()}</Text>
            </View>

            <View style={styles.logDetails}>
              <View style={styles.logDetail}>
                <Text style={styles.logDetailLabel}>Admin:</Text>
                <Text style={styles.logDetailValue}>
                  {log.admin.user.firstName} {log.admin.user.lastName}
                </Text>
              </View>
              <View style={styles.logDetail}>
                <Text style={styles.logDetailLabel}>Role:</Text>
                <Text style={styles.logDetailValue}>{log.admin.role.displayName}</Text>
              </View>
              <View style={styles.logDetail}>
                <Text style={styles.logDetailLabel}>Resource:</Text>
                <Text style={styles.logDetailValue}>{log.resource}</Text>
              </View>
              <View style={styles.logDetail}>
                <Text style={styles.logDetailLabel}>IP Address:</Text>
                <Text style={styles.logDetailValue}>{log.ipAddress}</Text>
              </View>
            </View>

            {log.changes && (
              <View style={styles.changesContainer}>
                <Text style={styles.changesLabel}>Changes:</Text>
                <Text style={styles.changesText}>{JSON.stringify(log.changes, null, 2)}</Text>
              </View>
            )}
          </View>
        ))}

        {filteredLogs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No audit logs found</Text>
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
  exportButton: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: colors.white,
    fontWeight: '600',
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
  logsList: {
    flex: 1,
    padding: 16,
  },
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  logTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logDetails: {
    gap: 6,
  },
  logDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logDetailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  logDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  changesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  changesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  changesText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
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
