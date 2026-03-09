import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { notificationTemplatesAPI, NotificationTemplate } from '../../services/notificationTemplatesAPI';

export default function AdminNotificationTemplatesScreen({ navigation }: any) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await notificationTemplatesAPI.getTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      setTemplates([]); // Ensure templates is always an array
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to load notification templates';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTemplates();
  };

  const handleToggleActive = async (template: NotificationTemplate) => {
    try {
      await notificationTemplatesAPI.toggleActive(template.id, !template.isActive);
      loadTemplates();
    } catch (error) {
      Alert.alert('Error', 'Failed to update template status');
    }
  };

  const handleDelete = (template: NotificationTemplate) => {
    if (template.isDefault) {
      Alert.alert('Cannot Delete', 'Default system templates cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationTemplatesAPI.deleteTemplate(template.id);
              Alert.alert('Success', 'Template deleted successfully');
              loadTemplates();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete template');
            }
          },
        },
      ]
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'engagement': return colors.teal;
      case 'transactional': return colors.navy;
      case 'promotional': return colors.warning;
      case 'reminder': return colors.info;
      default: return colors.textLight;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notification Templates</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Loading templates...</Text>
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
        <Text style={styles.title}>Notification Templates</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminTemplateEditor')}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{templates.length}</Text>
            <Text style={styles.statLabel}>Total Templates</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {templates.filter(t => t.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.textLight }]}>
              {templates.filter(t => !t.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>

        {templates.map((template) => (
          <View key={template.id} style={styles.templateCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(template.type) + '20' }]}>
                  <Text style={[styles.typeText, { color: getTypeColor(template.type) }]}>
                    {template.type}
                  </Text>
                </View>
                {template.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>DEFAULT</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleToggleActive(template)}
                style={styles.toggleButton}
              >
                <View style={[styles.toggle, template.isActive && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, template.isActive && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.templateName}>{template.name}</Text>
            {template.description && (
              <Text style={styles.templateDescription}>{template.description}</Text>
            )}

            <View style={styles.templatePreview}>
              <Text style={styles.previewTitle}>{template.title}</Text>
              <Text style={styles.previewBody} numberOfLines={2}>{template.body}</Text>
            </View>

            <View style={styles.templateStats}>
              <View style={styles.statItem}>
                <Ionicons name="send" size={14} color={colors.textSecondary} />
                <Text style={styles.statItemText}>{template.sentCount} sent</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={14} color={colors.textSecondary} />
                <Text style={styles.statItemText}>{template.openCount} opens</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="hand-left" size={14} color={colors.textSecondary} />
                <Text style={styles.statItemText}>{template.clickCount} clicks</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminTemplateAnalytics', { templateId: template.id })}
              >
                <Ionicons name="stats-chart" size={18} color={colors.teal} />
                <Text style={styles.actionButtonText}>Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AdminTemplateEditor', { templateId: template.id })}
              >
                <Ionicons name="create" size={18} color={colors.navy} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              {!template.isDefault && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(template)}
                >
                  <Ionicons name="trash" size={18} color={colors.error} />
                  <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {templates.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No Templates Yet</Text>
            <Text style={styles.emptyText}>Create your first notification template</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('AdminTemplateEditor')}
            >
              <Ionicons name="add-circle" size={20} color={colors.white} />
              <Text style={styles.createButtonText}>Create Template</Text>
            </TouchableOpacity>
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
  statsRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.teal,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  templateCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  defaultBadge: {
    backgroundColor: colors.navy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  toggleButton: {
    padding: 4,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.success,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  templateName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  templatePreview: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  previewBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.teal,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
