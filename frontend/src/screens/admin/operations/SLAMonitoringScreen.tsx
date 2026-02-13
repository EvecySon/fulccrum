import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { operationsAPI } from '../../../services/api';

const MOCK_CONFIGS = [
  { id: '1', name: 'Standard Delivery', orderType: 'food_delivery', maxPrepTime: 20, maxDeliveryTime: 30, maxTotalTime: 50 },
  { id: '2', name: 'Express Delivery', orderType: 'express', maxPrepTime: 10, maxDeliveryTime: 15, maxTotalTime: 25 },
  { id: '3', name: 'Grocery Delivery', orderType: 'grocery', maxPrepTime: 15, maxDeliveryTime: 45, maxTotalTime: 60 },
  { id: '4', name: 'Scheduled Delivery', orderType: 'scheduled', maxPrepTime: 30, maxDeliveryTime: 30, maxTotalTime: 60 },
];

const MOCK_BREACHES = [
  {
    id: '1', type: 'delivery_time_exceeded',
    order: { orderNumber: 'ORD-2026-4801' },
    description: 'Delivery took 52 min (SLA: 30 min). Courier stuck in traffic on Third Mainland Bridge.',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '2', type: 'prep_time_exceeded',
    order: { orderNumber: 'ORD-2026-4789' },
    description: 'Merchant prep time was 38 min (SLA: 20 min). Kitchen understaffed during lunch rush.',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: '3', type: 'total_time_exceeded',
    order: { orderNumber: 'ORD-2026-4776' },
    description: 'Total order time was 1h 15min (SLA: 50 min). Both prep and delivery delays compounded.',
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: '4', type: 'delivery_time_exceeded',
    order: { orderNumber: 'ORD-2026-4750' },
    description: 'Delivery took 48 min (SLA: 30 min). Courier had difficulty locating customer address in Lekki Phase 2.',
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: '5', type: 'prep_time_exceeded',
    order: { orderNumber: 'ORD-2026-4738' },
    description: 'Merchant prep time was 45 min (SLA: 20 min). Equipment malfunction at KFC Surulere.',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

export default function SLAMonitoringScreen({ navigation }: any) {
  const [breaches, setBreaches] = useState<any[]>(MOCK_BREACHES);
  const [configs, setConfigs] = useState<any[]>(MOCK_CONFIGS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
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
