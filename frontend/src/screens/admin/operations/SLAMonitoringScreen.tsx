import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { colors } from '../../../theme/colors';
import { operationsAPI } from '../../../services/api';

export default function SLAMonitoringScreen() {
  const [breaches, setBreaches] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const [breachesRes, configsRes] = await Promise.all([
        operationsAPI.getSLABreaches(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]),
        operationsAPI.getSLAConfigs(),
      ]);

      setBreaches(breachesRes.data || []);
      setConfigs(configsRes.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load SLA data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SLA Monitoring</Text>
        <Text style={styles.subtitle}>Service Level Agreement Tracking</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{breaches.length}</Text>
          <Text style={styles.statLabel}>Breaches (7 days)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{configs.length}</Text>
          <Text style={styles.statLabel}>Active SLAs</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SLA Configurations</Text>
        {configs.map((config) => (
          <View key={config.id} style={styles.configCard}>
            <Text style={styles.configName}>{config.name}</Text>
            <Text style={styles.configType}>{config.orderType}</Text>
            <View style={styles.configDetails}>
              <View style={styles.configDetail}>
                <Text style={styles.configDetailLabel}>Max Prep Time:</Text>
                <Text style={styles.configDetailValue}>{config.maxPrepTime} min</Text>
              </View>
              <View style={styles.configDetail}>
                <Text style={styles.configDetailLabel}>Max Delivery:</Text>
                <Text style={styles.configDetailValue}>{config.maxDeliveryTime} min</Text>
              </View>
              <View style={styles.configDetail}>
                <Text style={styles.configDetailLabel}>Max Total:</Text>
                <Text style={styles.configDetailValue}>{config.maxTotalTime} min</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent SLA Breaches</Text>
        {breaches.map((breach) => (
          <View key={breach.id} style={styles.breachCard}>
            <View style={styles.breachHeader}>
              <View>
                <Text style={styles.breachOrder}>{breach.order?.orderNumber}</Text>
                <Text style={styles.breachType}>{breach.type.replace('_', ' ')}</Text>
              </View>
              <View style={styles.severityBadge}>
                <Text style={styles.severityText}>HIGH</Text>
              </View>
            </View>
            <Text style={styles.breachDescription}>{breach.description}</Text>
            <Text style={styles.breachTime}>
              {new Date(breach.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}

        {breaches.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No SLA breaches in the last 7 days</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.error,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  configCard: {
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
  configName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  configType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  configDetails: {
    gap: 8,
  },
  configDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  configDetailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  configDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breachCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  breachOrder: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  breachType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  severityBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  breachDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  breachTime: {
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
});
