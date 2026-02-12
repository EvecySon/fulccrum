import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { colors } from '../../../theme/colors';
import { moderationAPI } from '../../../services/api';

export default function ContentModerationScreen() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadQueue();
  }, [filter]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await moderationAPI.getQueue({ status: filter === 'all' ? undefined : filter });
      setQueue(response.data.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    try {
      await moderationAPI.approveContent(itemId);
      Alert.alert('Success', 'Content approved');
      loadQueue();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve content');
    }
  };

  const handleReject = async (itemId: string) => {
    Alert.prompt(
      'Reject Content',
      'Please provide a reason for rejection:',
      async (reason) => {
        if (reason) {
          try {
            await moderationAPI.rejectContent(itemId, reason);
            Alert.alert('Success', 'Content rejected');
            loadQueue();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to reject content');
          }
        }
      }
    );
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
        <Text style={styles.title}>Content Moderation</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
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

      <ScrollView style={styles.queueList}>
        {queue.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{item.type.replace('_', ' ')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.statusText, { color: colors.warning }]}>{item.status}</Text>
              </View>
            </View>

            {item.resourceData && (
              <View style={styles.contentPreview}>
                {item.resourceData.name && (
                  <Text style={styles.contentName}>{item.resourceData.name}</Text>
                )}
                {item.resourceData.description && (
                  <Text style={styles.contentDescription}>{item.resourceData.description}</Text>
                )}
                {item.resourceData.imageUrl && (
                  <Image source={{ uri: item.resourceData.imageUrl }} style={styles.contentImage} />
                )}
              </View>
            )}

            {item.flags && item.flags.length > 0 && (
              <View style={styles.flagsContainer}>
                <Text style={styles.flagsLabel}>Flags:</Text>
                <View style={styles.flagsList}>
                  {item.flags.map((flag: string, index: number) => (
                    <View key={index} style={styles.flagChip}>
                      <Text style={styles.flagText}>{flag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.itemTime}>Submitted: {new Date(item.createdAt).toLocaleString()}</Text>

            {item.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item.id)}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item.id)}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.reason && (
              <Text style={styles.rejectionReason}>Rejection Reason: {item.reason}</Text>
            )}
          </View>
        ))}

        {queue.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items in moderation queue</Text>
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
  queueList: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: colors.info + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    color: colors.info,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  contentPreview: {
    marginBottom: 12,
  },
  contentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  flagsContainer: {
    marginBottom: 12,
  },
  flagsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  flagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  flagChip: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flagText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '600',
  },
  itemTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  rejectionReason: {
    fontSize: 12,
    color: colors.error,
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
