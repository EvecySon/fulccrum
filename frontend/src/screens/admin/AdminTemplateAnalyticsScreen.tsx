import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { notificationTemplatesAPI, NotificationTemplate } from '../../services/notificationTemplatesAPI';

export default function AdminTemplateAnalyticsScreen({ route, navigation }: any) {
  const { templateId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
  const [analytics, setAnalytics] = useState<{
    sentCount: number;
    openCount: number;
    clickCount: number;
    openRate: number;
    clickRate: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    try {
      const [templateData, analyticsData] = await Promise.all([
        notificationTemplatesAPI.getTemplate(templateId),
        notificationTemplatesAPI.getAnalytics(templateId),
      ]);
      setTemplate(templateData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !template || !analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Template Analytics</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Template Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.templateCard}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateKey}>{template.key}</Text>
          <View style={styles.templateMeta}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{template.type}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{template.category}</Text>
            </View>
            {template.isActive ? (
              <View style={[styles.metaBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.metaText, { color: colors.success }]}>Active</Text>
              </View>
            ) : (
              <View style={[styles.metaBadge, { backgroundColor: colors.error + '20' }]}>
                <Text style={[styles.metaText, { color: colors.error }]}>Inactive</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.teal + '20' }]}>
              <Ionicons name="send" size={24} color={colors.teal} />
            </View>
            <Text style={styles.metricValue}>{analytics.sentCount.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Sent</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="eye" size={24} color={colors.info} />
            </View>
            <Text style={styles.metricValue}>{analytics.openCount.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Opened</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="hand-left" size={24} color={colors.success} />
            </View>
            <Text style={styles.metricValue}>{analytics.clickCount.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Clicked</Text>
          </View>
        </View>

        <View style={styles.ratesSection}>
          <Text style={styles.sectionTitle}>Performance Rates</Text>
          
          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Text style={styles.rateLabel}>Open Rate</Text>
              <Text style={[styles.rateValue, { color: analytics.openRate >= 50 ? colors.success : analytics.openRate >= 30 ? colors.warning : colors.error }]}>
                {analytics.openRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(analytics.openRate, 100)}%`, backgroundColor: analytics.openRate >= 50 ? colors.success : analytics.openRate >= 30 ? colors.warning : colors.error }]} />
            </View>
            <Text style={styles.rateDescription}>
              {analytics.openRate >= 50 ? 'Excellent performance' : analytics.openRate >= 30 ? 'Good performance' : 'Needs improvement'}
            </Text>
          </View>

          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Text style={styles.rateLabel}>Click Rate</Text>
              <Text style={[styles.rateValue, { color: analytics.clickRate >= 20 ? colors.success : analytics.clickRate >= 10 ? colors.warning : colors.error }]}>
                {analytics.clickRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(analytics.clickRate, 100)}%`, backgroundColor: analytics.clickRate >= 20 ? colors.success : analytics.clickRate >= 10 ? colors.warning : colors.error }]} />
            </View>
            <Text style={styles.rateDescription}>
              {analytics.clickRate >= 20 ? 'Excellent engagement' : analytics.clickRate >= 10 ? 'Good engagement' : 'Low engagement'}
            </Text>
          </View>
        </View>

        <View style={styles.templatePreview}>
          <Text style={styles.sectionTitle}>Template Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="notifications" size={20} color={colors.teal} />
              <Text style={styles.previewTitle}>{template.title}</Text>
            </View>
            <Text style={styles.previewBody}>{template.body}</Text>
          </View>
        </View>

        {template.lastUsedAt && (
          <View style={styles.infoBox}>
            <Ionicons name="time" size={20} color={colors.info} />
            <View style={styles.infoBoxText}>
              <Text style={styles.infoBoxLabel}>Last Used</Text>
              <Text style={styles.infoBoxValue}>
                {new Date(template.lastUsedAt).toLocaleString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  templateCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  templateKey: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  rateCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  rateDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  templatePreview: {
    marginBottom: 20,
  },
  previewCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  previewBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoBoxText: {
    flex: 1,
  },
  infoBoxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoBoxValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});
