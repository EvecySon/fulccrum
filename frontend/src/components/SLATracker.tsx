import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface SLATrackerProps {
  createdAt: string;
  firstResponseTime?: string;
  status: string;
  priority: string;
}

export default function SLATracker({ createdAt, firstResponseTime, status, priority }: SLATrackerProps) {
  // SLA targets based on priority
  const slaTargets = {
    high: { firstResponse: 2, resolution: 60 }, // 2 min, 1 hour
    medium: { firstResponse: 5, resolution: 240 }, // 5 min, 4 hours
    low: { firstResponse: 15, resolution: 1440 }, // 15 min, 24 hours
  };

  const target = slaTargets[priority as keyof typeof slaTargets] || slaTargets.medium;

  // Calculate elapsed time (mock - in real app, use actual timestamps)
  const elapsedMinutes = 8; // Mock value
  const responseMinutes = firstResponseTime ? 3 : null; // Mock value

  // Check SLA compliance
  const responseBreached = responseMinutes === null && elapsedMinutes > target.firstResponse;
  const responseOnTime = responseMinutes !== null && responseMinutes <= target.firstResponse;
  const resolutionAtRisk = elapsedMinutes > (target.resolution * 0.7) && status !== 'resolved';

  const getStatusColor = () => {
    if (status === 'resolved') return colors.success;
    if (responseBreached || resolutionAtRisk) return colors.error;
    if (elapsedMinutes > (target.firstResponse * 0.7)) return colors.warning;
    return colors.success;
  };

  const getStatusText = () => {
    if (status === 'resolved') return 'Resolved';
    if (responseBreached) return 'SLA Breached';
    if (resolutionAtRisk) return 'At Risk';
    return 'On Track';
  };

  const getTimeRemaining = () => {
    if (status === 'resolved') return null;
    const remaining = target.resolution - elapsedMinutes;
    if (remaining < 60) return `${remaining}m remaining`;
    return `${Math.floor(remaining / 60)}h ${remaining % 60}m remaining`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        {getTimeRemaining() && (
          <Text style={styles.timeRemaining}>{getTimeRemaining()}</Text>
        )}
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Ionicons 
            name={responseOnTime ? "checkmark-circle" : responseBreached ? "close-circle" : "time-outline"} 
            size={16} 
            color={responseOnTime ? colors.success : responseBreached ? colors.error : colors.warning} 
          />
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>First Response</Text>
            <Text style={styles.metricValue}>
              {responseMinutes ? `${responseMinutes}m` : `${elapsedMinutes}m elapsed`}
            </Text>
            <Text style={styles.metricTarget}>Target: {target.firstResponse}m</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Ionicons 
            name={status === 'resolved' ? "checkmark-circle" : resolutionAtRisk ? "alert-circle" : "time-outline"} 
            size={16} 
            color={status === 'resolved' ? colors.success : resolutionAtRisk ? colors.error : colors.info} 
          />
          <View style={styles.metricInfo}>
            <Text style={styles.metricLabel}>Resolution</Text>
            <Text style={styles.metricValue}>
              {status === 'resolved' ? 'Resolved' : `${elapsedMinutes}m elapsed`}
            </Text>
            <Text style={styles.metricTarget}>
              Target: {target.resolution >= 60 ? `${target.resolution / 60}h` : `${target.resolution}m`}
            </Text>
          </View>
        </View>
      </View>

      {(responseBreached || resolutionAtRisk) && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={16} color={colors.error} />
          <Text style={styles.alertText}>
            {responseBreached ? 'First response SLA breached!' : 'Resolution time at risk'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeRemaining: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricTarget: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  alertText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
});
