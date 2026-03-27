import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierMaintenanceAPI } from '../../services/api';

interface Reminder {
  id: string;
  type: 'document' | 'vehicle' | 'insurance' | 'license';
  title: string;
  description: string;
  icon: string;
  expiryDate: string;
  daysLeft: number;
  status: 'expired' | 'urgent' | 'warning' | 'ok';
  notifyEnabled: boolean;
}


export default function MaintenanceRemindersScreen({ navigation }: any) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [remRes, logRes] = await Promise.all([
          courierMaintenanceAPI.getReminders().catch(() => null),
          courierMaintenanceAPI.getLogs().catch(() => null),
        ]);
        if (Array.isArray(remRes)) setReminders(remRes);
        if (Array.isArray(logRes)) setMaintenanceLogs(logRes);
      } catch {}
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return colors.error;
      case 'urgent': return '#f97316';
      case 'warning': return colors.warning;
      case 'ok': return colors.success;
      default: return colors.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'expired': return 'EXPIRED';
      case 'urgent': return 'URGENT';
      case 'warning': return 'EXPIRING SOON';
      case 'ok': return 'VALID';
      default: return '';
    }
  };

  const toggleNotify = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, notifyEnabled: !r.notifyEnabled } : r));
  };

  const urgentCount = reminders.filter(r => r.status === 'expired' || r.status === 'urgent').length;
  const warningCount = reminders.filter(r => r.status === 'warning').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance & Docs</Text>
        {urgentCount > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{urgentCount}</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Alert Banner */}
        {urgentCount > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={22} color={colors.error} />
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>{urgentCount} item{urgentCount > 1 ? 's' : ''} need attention</Text>
              <Text style={styles.alertDesc}>
                {urgentCount} expired/urgent · {warningCount} expiring soon
              </Text>
            </View>
          </View>
        )}

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: colors.error }]}>
            <Text style={[styles.statValue, { color: colors.error }]}>{reminders.filter(r => r.status === 'expired').length}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#f97316' }]}>
            <Text style={[styles.statValue, { color: '#f97316' }]}>{reminders.filter(r => r.status === 'urgent').length}</Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{warningCount}</Text>
            <Text style={styles.statLabel}>Warning</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{reminders.filter(r => r.status === 'ok').length}</Text>
            <Text style={styles.statLabel}>Valid</Text>
          </View>
        </View>

        {/* Reminders List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents & Vehicle</Text>

          {reminders
            .sort((a, b) => {
              const order = { expired: 0, urgent: 1, warning: 2, ok: 3 };
              return (order[a.status] ?? 4) - (order[b.status] ?? 4);
            })
            .map((reminder) => {
              const statusColor = getStatusColor(reminder.status);
              return (
                <View key={reminder.id} style={[styles.reminderCard, { borderLeftColor: statusColor, borderLeftWidth: 3 }]}>
                  <View style={styles.reminderHeader}>
                    <View style={[styles.reminderIcon, { backgroundColor: statusColor + '12' }]}>
                      <Ionicons name={reminder.icon as any} size={20} color={statusColor} />
                    </View>
                    <View style={styles.reminderInfo}>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      <Text style={styles.reminderDesc}>{reminder.description}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '12' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(reminder.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.reminderMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
                      <Text style={styles.metaText}>{reminder.expiryDate}</Text>
                    </View>
                    {reminder.daysLeft > 0 && reminder.daysLeft < 9999 && (
                      <Text style={[styles.daysLeft, { color: statusColor }]}>
                        {reminder.daysLeft} days left
                      </Text>
                    )}
                    {reminder.daysLeft < 0 && (
                      <Text style={[styles.daysLeft, { color: colors.error }]}>
                        {Math.abs(reminder.daysLeft)} days overdue
                      </Text>
                    )}
                  </View>

                  <View style={styles.reminderActions}>
                    <View style={styles.notifyRow}>
                      <Text style={styles.notifyLabel}>Notify me</Text>
                      <Switch
                        value={reminder.notifyEnabled}
                        onValueChange={() => toggleNotify(reminder.id)}
                        trackColor={{ false: colors.border, true: colors.teal + '50' }}
                        thumbColor={reminder.notifyEnabled ? colors.teal : colors.textLight}
                      />
                    </View>
                    {(reminder.status === 'expired' || reminder.status === 'urgent') && (
                      <TouchableOpacity style={styles.renewBtn}>
                        <Ionicons name="refresh" size={14} color={colors.teal} />
                        <Text style={styles.renewText}>Update</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
        </View>

        {/* Maintenance Log */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logHeader} onPress={() => setShowLog(!showLog)}>
            <Text style={styles.sectionTitle}>Maintenance Log</Text>
            <Ionicons name={showLog ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {showLog && maintenanceLogs.map((entry) => (
            <View key={entry.id} style={styles.logEntry}>
              <View style={styles.logDot} />
              <View style={styles.logInfo}>
                <Text style={styles.logAction}>{entry.action}</Text>
                <Text style={styles.logMeta}>{entry.date} · {entry.mileage}</Text>
              </View>
              <Text style={styles.logCost}>₦{entry.cost.toLocaleString()}</Text>
            </View>
          ))}

          {showLog && (
            <TouchableOpacity style={styles.addLogBtn}>
              <Ionicons name="add-circle-outline" size={18} color={colors.teal} />
              <Text style={styles.addLogText}>Add Maintenance Entry</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  alertBadge: { backgroundColor: colors.error, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertBadgeText: { fontSize: 12, fontWeight: '800', color: colors.textWhite },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 10, marginTop: 10,
    backgroundColor: colors.error + '08', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.error + '20',
  },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: colors.error },
  alertDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 10, marginTop: 10 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 10, alignItems: 'center', borderLeftWidth: 3 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  section: { paddingHorizontal: 10, marginTop: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  reminderCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  reminderHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reminderIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  reminderInfo: { flex: 1 },
  reminderTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  reminderDesc: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  reminderMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textLight },
  daysLeft: { fontSize: 12, fontWeight: '700' },
  reminderActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  notifyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifyLabel: { fontSize: 13, color: colors.textSecondary },
  renewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.teal + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  renewText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logEntry: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 6 },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.teal },
  logInfo: { flex: 1 },
  logAction: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  logMeta: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  logCost: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  addLogBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, marginTop: 4 },
  addLogText: { fontSize: 14, fontWeight: '600', color: colors.teal },
});
