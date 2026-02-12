import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { rbacAPI } from '../../../services/api';

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const filters = filter === 'all' ? {} : { action: filter };
      const response = await rbacAPI.getAuditLogs(filters);
      setLogs(response.data.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const csv = await rbacAPI.exportAuditLogs({});
      Alert.alert('Success', 'Audit logs exported successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to export logs');
    }
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
        {logs.map((log) => (
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

        {logs.length === 0 && (
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
