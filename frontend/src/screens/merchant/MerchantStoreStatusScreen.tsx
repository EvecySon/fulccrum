import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { merchantStatusAPI, StoreStatus } from '../../services/merchantStatusAPI';
import { useAuth } from '../../contexts/AuthContext';

export default function MerchantStoreStatusScreen({ navigation }: any) {
  const { user } = useAuth();
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadStatus();
    }
  }, [user?.id]);

  const loadStatus = async () => {
    try {
      const data = await merchantStatusAPI.getMyStatus();
      setStatus(data);
    } catch (error) {
      console.error('Error loading status:', error);
      Alert.alert('Error', 'Failed to load store status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStatus();
  };

  const handleStatusChange = async (newStatus: 'auto' | 'force_open' | 'force_closed') => {
    setUpdating(true);
    try {
      await merchantStatusAPI.setManualStatus(user!.id, newStatus);
      await loadStatus();
      Alert.alert('Success', 'Store status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update store status');
    } finally {
      setUpdating(false);
    }
  };

  const updateActivity = async () => {
    try {
      await merchantStatusAPI.updateActivity();
      await loadStatus();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Store Status</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Loading status...</Text>
        </View>
      </View>
    );
  }

  const getStatusConfig = () => {
    if (!status) return { icon: 'help-circle', color: colors.textLight, label: 'Unknown' };
    
    switch (status.status) {
      case 'open_active':
        return { icon: 'checkmark-circle', color: colors.success, label: 'Open & Active' };
      case 'open_busy':
        return { icon: 'time', color: colors.warning, label: 'Open (Busy)' };
      case 'open_unverified':
        return { icon: 'alert-circle', color: '#FF9800', label: 'Open (Unverified)' };
      case 'closed':
        return { icon: 'close-circle', color: colors.error, label: 'Closed' };
      default:
        return { icon: 'help-circle', color: colors.textLight, label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Store Status</Text>
        <TouchableOpacity onPress={updateActivity} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, { backgroundColor: statusConfig.color + '20' }]}>
            <Ionicons name={statusConfig.icon as any} size={48} color={statusConfig.color} />
          </View>
          <Text style={styles.statusLabel}>Current Status</Text>
          <Text style={[styles.statusValue, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          
          {status?.reliability && (
            <View style={styles.reliabilityBadge}>
              <View style={[styles.reliabilityDot, { backgroundColor: statusConfig.color }]} />
              <Text style={styles.reliabilityText}>
                {status.reliability.toUpperCase()} RELIABILITY
              </Text>
            </View>
          )}

          {status?.message && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{status.message}</Text>
            </View>
          )}
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Manual Controls</Text>
          <Text style={styles.sectionDescription}>
            Override automatic status detection
          </Text>

          <TouchableOpacity
            style={[
              styles.controlButton,
              status?.manualStatus === 'auto' && styles.controlButtonActive,
              updating && styles.controlButtonDisabled,
            ]}
            onPress={() => handleStatusChange('auto')}
            disabled={updating}
          >
            <View style={styles.controlButtonContent}>
              <Ionicons
                name="sync"
                size={24}
                color={status?.manualStatus === 'auto' ? colors.white : colors.teal}
              />
              <View style={styles.controlButtonText}>
                <Text style={[styles.controlButtonTitle, status?.manualStatus === 'auto' && styles.controlButtonTitleActive]}>
                  Automatic
                </Text>
                <Text style={[styles.controlButtonSubtitle, status?.manualStatus === 'auto' && styles.controlButtonSubtitleActive]}>
                  Follow business hours
                </Text>
              </View>
            </View>
            {status?.manualStatus === 'auto' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              status?.manualStatus === 'force_open' && styles.controlButtonActive,
              updating && styles.controlButtonDisabled,
            ]}
            onPress={() => handleStatusChange('force_open')}
            disabled={updating}
          >
            <View style={styles.controlButtonContent}>
              <Ionicons
                name="lock-open"
                size={24}
                color={status?.manualStatus === 'force_open' ? colors.white : colors.success}
              />
              <View style={styles.controlButtonText}>
                <Text style={[styles.controlButtonTitle, status?.manualStatus === 'force_open' && styles.controlButtonTitleActive]}>
                  Force Open
                </Text>
                <Text style={[styles.controlButtonSubtitle, status?.manualStatus === 'force_open' && styles.controlButtonSubtitleActive]}>
                  Open even outside business hours
                </Text>
              </View>
            </View>
            {status?.manualStatus === 'force_open' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              status?.manualStatus === 'force_closed' && styles.controlButtonActive,
              updating && styles.controlButtonDisabled,
            ]}
            onPress={() => handleStatusChange('force_closed')}
            disabled={updating}
          >
            <View style={styles.controlButtonContent}>
              <Ionicons
                name="lock-closed"
                size={24}
                color={status?.manualStatus === 'force_closed' ? colors.white : colors.error}
              />
              <View style={styles.controlButtonText}>
                <Text style={[styles.controlButtonTitle, status?.manualStatus === 'force_closed' && styles.controlButtonTitleActive]}>
                  Force Closed
                </Text>
                <Text style={[styles.controlButtonSubtitle, status?.manualStatus === 'force_closed' && styles.controlButtonSubtitleActive]}>
                  Closed even during business hours
                </Text>
              </View>
            </View>
            {status?.manualStatus === 'force_closed' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>How it works</Text>
              <Text style={styles.infoCardDescription}>
                Your store status is determined by multiple factors including business hours, manual overrides, and activity detection. Customers see reliability indicators based on your recent activity.
              </Text>
            </View>
          </View>

          {status?.lastSeenAt && (
            <View style={styles.infoCard}>
              <Ionicons name="time" size={24} color={colors.textSecondary} />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardTitle}>Last Activity</Text>
                <Text style={styles.infoCardDescription}>
                  {new Date(status.lastSeenAt).toLocaleString('en-NG', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {updating && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.updatingText}>Updating status...</Text>
        </View>
      )}
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
  refreshButton: {
    padding: 8,
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
  statusCard: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  reliabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  reliabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reliabilityText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  messageBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    width: '100%',
  },
  messageText: {
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  controlsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  controlButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  controlButtonText: {
    flex: 1,
  },
  controlButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  controlButtonTitleActive: {
    color: colors.white,
  },
  controlButtonSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  controlButtonSubtitleActive: {
    color: colors.white,
    opacity: 0.9,
  },
  infoSection: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
