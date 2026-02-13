import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { adminAnalyticsAPI } from '../../../services/api';

export default function CohortAnalysisScreen({ navigation }: any) {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cohortType, setCohortType] = useState<'customer' | 'merchant' | 'courier'>('customer');

  useEffect(() => {
    loadCohorts();
  }, [cohortType]);

  const loadCohorts = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 6);

      const response = await adminAnalyticsAPI.getCohorts(
        cohortType,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setCohorts(response.data || []);
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to load cohort analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 6);

      await adminAnalyticsAPI.generateCohortAnalysis({
        cohortType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      showAlert('Success', 'Cohort analysis generated successfully');
      loadCohorts();
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to generate cohort analysis');
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
        <Text style={styles.title}>Cohort Analysis</Text>
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Text style={styles.generateButtonText}>Generate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        {(['customer', 'merchant', 'courier'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, cohortType === type && styles.typeButtonActive]}
            onPress={() => setCohortType(type)}
          >
            <Text style={[styles.typeButtonText, cohortType === type && styles.typeButtonTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.cohortsList}>
        {cohorts.map((cohort) => (
          <View key={cohort.id} style={styles.cohortCard}>
            <View style={styles.cohortHeader}>
              <Text style={styles.cohortDate}>
                {new Date(cohort.cohortDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
              <Text style={styles.cohortUsers}>{cohort.userCount} users</Text>
            </View>

            {cohort.metrics && (
              <View style={styles.metricsContainer}>
                {cohort.metrics.avgLTV !== undefined && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Avg LTV:</Text>
                    <Text style={styles.metricValue}>₦{cohort.metrics.avgLTV.toLocaleString()}</Text>
                  </View>
                )}

                {cohort.metrics.retention && (
                  <View style={styles.retentionContainer}>
                    <Text style={styles.retentionTitle}>Retention by Month:</Text>
                    <View style={styles.retentionGrid}>
                      {Object.entries(cohort.metrics.retention).map(([month, count]) => (
                        <View key={month} style={styles.retentionItem}>
                          <Text style={styles.retentionMonth}>M{month}</Text>
                          <Text style={styles.retentionCount}>
                            {Math.round((count as number / cohort.userCount) * 100)}%
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        {cohorts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No cohort data available</Text>
            <Text style={styles.emptyStateSubtext}>Click Generate to create cohort analysis</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 },
  generateButton: { backgroundColor: colors.navy, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  generateButtonText: { color: colors.white, fontWeight: '600' },
  typeSelector: { flexDirection: 'row', padding: 16, gap: 8 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center' },
  typeButtonActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  typeButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  typeButtonTextActive: { color: colors.white },
  cohortsList: { flex: 1, padding: 16 },
  cohortCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cohortHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  cohortDate: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  cohortUsers: { fontSize: 14, color: colors.textSecondary },
  metricsContainer: { gap: 16 },
  metricItem: { flexDirection: 'row', justifyContent: 'space-between' },
  metricLabel: { fontSize: 14, color: colors.textSecondary },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: colors.navy },
  retentionContainer: { marginTop: 8 },
  retentionTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  retentionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  retentionItem: { backgroundColor: colors.lightGray, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  retentionMonth: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  retentionCount: { fontSize: 14, fontWeight: 'bold', color: colors.navy },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 16, color: colors.textSecondary, marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: colors.textSecondary },
});
