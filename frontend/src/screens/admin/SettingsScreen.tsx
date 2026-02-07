import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function AdminSettingsScreen({ navigation }: any) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newUserRegistration, setNewUserRegistration] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Config</Text>
        <TouchableOpacity>
          <Ionicons name="save-outline" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* System Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, { backgroundColor: maintenanceMode ? colors.error : colors.success }]} />
              <View>
                <Text style={styles.statusTitle}>{maintenanceMode ? 'Maintenance Mode' : 'System Online'}</Text>
                <Text style={styles.statusDesc}>
                  {maintenanceMode ? 'Users see maintenance page' : 'All services running normally'}
                </Text>
              </View>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: colors.success + '50', true: colors.error + '50' }}
              thumbColor={maintenanceMode ? colors.error : colors.success}
            />
          </View>
          <View style={styles.uptimeRow}>
            <View style={styles.uptimeItem}>
              <Text style={styles.uptimeValue}>99.9%</Text>
              <Text style={styles.uptimeLabel}>Uptime</Text>
            </View>
            <View style={styles.uptimeDivider} />
            <View style={styles.uptimeItem}>
              <Text style={styles.uptimeValue}>45ms</Text>
              <Text style={styles.uptimeLabel}>Avg Response</Text>
            </View>
            <View style={styles.uptimeDivider} />
            <View style={styles.uptimeItem}>
              <Text style={styles.uptimeValue}>v1.0.0</Text>
              <Text style={styles.uptimeLabel}>Version</Text>
            </View>
          </View>
        </View>

        {/* Platform Config */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Platform Configuration</Text>

          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Ionicons name="person-add-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>New User Registration</Text>
            </View>
            <Switch
              value={newUserRegistration}
              onValueChange={setNewUserRegistration}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={newUserRegistration ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.configDivider} />

          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Auto-Approve Merchants</Text>
            </View>
            <Switch
              value={autoApprove}
              onValueChange={setAutoApprove}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={autoApprove ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.configDivider} />

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="pricetag-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Default Commission Rate</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>10%</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </View>
          <View style={styles.configDivider} />

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="bicycle-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Base Delivery Fee</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>₦500</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </View>
          <View style={styles.configDivider} />

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="location-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Max Delivery Radius</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>10 km</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </View>
          <View style={styles.configDivider} />

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="time-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Order Timeout</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>5 min</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Ionicons name="mail-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={emailNotifs}
              onValueChange={setEmailNotifs}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={emailNotifs ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.configDivider} />

          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Ionicons name="chatbox-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Slack Alerts</Text>
            </View>
            <Switch
              value={slackNotifs}
              onValueChange={setSlackNotifs}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={slackNotifs ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.configDivider} />

          <TouchableOpacity style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="megaphone-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Push Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Security</Text>

          <View style={styles.configRow}>
            <View style={styles.configInfo}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Two-Factor Auth (Admin)</Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={twoFactor ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.configDivider} />

          <TouchableOpacity style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="key-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>API Keys</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>3 active</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </TouchableOpacity>
          <View style={styles.configDivider} />

          <TouchableOpacity style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="document-text-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Audit Logs</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
          <View style={styles.configDivider} />

          <TouchableOpacity style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="people-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Admin Roles & Permissions</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Integrations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Integrations</Text>
          {[
            { name: 'Stripe', desc: 'Payment processing', status: 'connected', icon: 'card' },
            { name: 'Twilio', desc: 'SMS & notifications', status: 'connected', icon: 'chatbubble' },
            { name: 'Google Maps', desc: 'Navigation & geocoding', status: 'connected', icon: 'map' },
            { name: 'Firebase', desc: 'Push notifications', status: 'connected', icon: 'notifications' },
            { name: 'Segment', desc: 'Analytics', status: 'disconnected', icon: 'analytics' },
          ].map((integration, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.integrationRow}>
                <View style={[styles.integrationIcon, {
                  backgroundColor: integration.status === 'connected' ? colors.teal + '15' : colors.lightGray
                }]}>
                  <Ionicons
                    name={integration.icon as any}
                    size={18}
                    color={integration.status === 'connected' ? colors.teal : colors.textLight}
                  />
                </View>
                <View style={styles.integrationInfo}>
                  <Text style={styles.integrationName}>{integration.name}</Text>
                  <Text style={styles.integrationDesc}>{integration.desc}</Text>
                </View>
                <View style={[styles.integrationStatus, {
                  backgroundColor: integration.status === 'connected' ? colors.success + '15' : colors.error + '15'
                }]}>
                  <View style={[styles.integrationDot, {
                    backgroundColor: integration.status === 'connected' ? colors.success : colors.error
                  }]} />
                  <Text style={[styles.integrationStatusText, {
                    color: integration.status === 'connected' ? colors.success : colors.error
                  }]}>{integration.status}</Text>
                </View>
              </TouchableOpacity>
              {index < 4 && <View style={styles.configDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.dangerBtn}>
            <Ionicons name="refresh-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.dangerBtnText}>Clear Cache</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerBtn}>
            <Ionicons name="cloud-download-outline" size={18} color={colors.navy} />
            <Text style={styles.dangerBtnText}>Export All Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerBtn, styles.dangerBtnRed]}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={[styles.dangerBtnText, { color: colors.error }]}>Purge Test Data</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Fulccrum Admin v1.0.0 · Build 2026.02.06</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite, flex: 1 },
  statusCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 12, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statusDesc: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  uptimeRow: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  uptimeItem: { alignItems: 'center' },
  uptimeValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  uptimeLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  uptimeDivider: { width: 1, height: 28, backgroundColor: colors.borderLight },
  sectionCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 12, borderRadius: 16, padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  configItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  configInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  configLabel: { fontSize: 15, color: colors.textPrimary },
  configValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  configValueText: { fontSize: 14, color: colors.textLight },
  configDivider: { height: 1, backgroundColor: colors.borderLight },
  integrationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  integrationIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  integrationInfo: { flex: 1 },
  integrationName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  integrationDesc: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  integrationStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  integrationDot: { width: 6, height: 6, borderRadius: 3 },
  integrationStatusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  dangerCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 12, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.error + '20',
  },
  dangerTitle: { fontSize: 16, fontWeight: '700', color: colors.error, marginBottom: 12 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  dangerBtnRed: { borderBottomWidth: 0 },
  dangerBtnText: { fontSize: 15, color: colors.textPrimary },
  versionText: { textAlign: 'center', fontSize: 12, color: colors.textLight, marginTop: 16 },
});
