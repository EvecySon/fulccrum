import { showAlert } from '../../../utils/alert';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { adminAPI } from '../../../services/api';

const MOCK_QUEUE_REMOVED = [
  {
    id: '1', type: 'menu_item', status: 'pending',
    resourceData: { name: 'Spicy Suya Platter', description: 'Grilled beef skewers with yaji spice, served with sliced onions, tomatoes, and pepper sauce. Image flagged for review.' },
    flags: ['potentially misleading image', 'price discrepancy'],
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: '2', type: 'merchant_profile', status: 'pending',
    resourceData: { name: 'Mama Put Kitchen - Surulere', description: 'Home-cooked Nigerian meals delivered fresh. Business description contains phone number and external website link which violates platform policy.' },
    flags: ['external links', 'contact info in description'],
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: '3', type: 'review', status: 'pending',
    resourceData: { name: 'Review by Chinedu O.', description: '"This restaurant is TERRIBLE. The owner is a thief and a fraud. DO NOT ORDER FROM HERE. I will report them to NAFDAC!!!"' },
    flags: ['hate speech', 'defamation', 'all caps'],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '4', type: 'menu_item', status: 'pending',
    resourceData: { name: 'Alcoholic Palm Wine Special', description: 'Fresh palm wine tapped daily from Ondo State. 1 litre bottle. Requires age verification for delivery.' },
    flags: ['age-restricted product', 'missing age gate'],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: '5', type: 'merchant_profile', status: 'approved',
    resourceData: { name: 'Chicken Republic - Lekki Phase 1', description: 'Fast food restaurant serving fried chicken, burgers, rice meals, and wraps. Open daily 8am-10pm.' },
    flags: [],
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: '6', type: 'review', status: 'approved',
    resourceData: { name: 'Review by Amaka N.', description: '"Great jollof rice! Delivery was fast and the food was still hot. Will definitely order again. 5 stars!"' },
    flags: [],
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: '7', type: 'menu_item', status: 'rejected',
    resourceData: { name: 'Weight Loss Miracle Soup', description: 'Guaranteed to make you lose 10kg in one week! Doctor-approved herbal formula.' },
    flags: ['false health claims', 'misleading description'],
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    reason: 'Contains unverified health claims. NAFDAC compliance required for health-related food claims.',
  },
  {
    id: '8', type: 'review', status: 'rejected',
    resourceData: { name: 'Review by Anonymous', description: '"Go to @cheapfood_lagos on Instagram for better prices. Use code SAVE20 for discount."' },
    flags: ['spam', 'competitor promotion'],
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    reason: 'Spam content promoting external competitor platform.',
  },
];

export default function ContentModerationScreen({ navigation }: any) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getContentModerationQueue();
      if (res?.data) {
        setQueue(res.data);
      } else if (Array.isArray(res)) {
        setQueue(res);
      }
    } catch (e: any) {
      console.error('Failed to load moderation queue:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const filteredQueue = filter === 'all' ? queue : queue.filter(item => item.status === filter);

  const handleApprove = (itemId: string) => {
    setQueue(prev => prev.map(item => item.id === itemId ? { ...item, status: 'approved' } : item));
    showAlert('Success', 'Content approved');
  };

  const handleReject = (itemId: string) => {
    const reason = Platform.OS === 'web'
      ? window.prompt('Reject Content\n\nPlease provide a reason for rejection:')
      : 'Policy violation';
    if (reason) {
      setQueue(prev => prev.map(item => item.id === itemId ? { ...item, status: 'rejected', reason } : item));
      showAlert('Success', 'Content rejected');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading moderation queue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </TouchableOpacity>
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

      <ScrollView 
        style={styles.queueList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />
        }
      >
        {filteredQueue.map((item) => {
          const statusColor = item.status === 'approved' ? colors.success : item.status === 'rejected' ? colors.error : colors.warning;
          return (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{item.type.replace('_', ' ')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
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
          );
        })}

        {filteredQueue.length === 0 && (
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
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
