import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Platform,
  Pressable,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const webConfirm = (msg: string) => Platform.OS === 'web' ? window.confirm(msg) : false;

export default function AdminSettingsScreen({ navigation }: any) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newUserRegistration, setNewUserRegistration] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setToast(msg);
    toastOpacity.setValue(1);
    Animated.timing(toastOpacity, { toValue: 0, duration: 500, delay: 1800, useNativeDriver: true }).start(() => setToast(''));
  };

  // Editable config values
  const [commissionRate, setCommissionRate] = useState('10');
  const [deliveryFee, setDeliveryFee] = useState('500');
  const [maxRadius, setMaxRadius] = useState('10');
  const [orderTimeout, setOrderTimeout] = useState('5');

  // Edit modal
  const [editModal, setEditModal] = useState<{ visible: boolean; label: string; value: string; unit: string; onSave: (v: string) => void }>({
    visible: false, label: '', value: '', unit: '', onSave: () => {},
  });
  const [editValue, setEditValue] = useState('');

  // Danger zone feedback
  const [cacheCleared, setCacheCleared] = useState(false);
  const [exportStarted, setExportStarted] = useState(false);
  const [purgeStarted, setPurgeStarted] = useState(false);

  // Integration statuses (toggleable)
  const [integrations, setIntegrations] = useState([
    { name: 'Stripe', desc: 'Payment processing', connected: true, icon: 'card' },
    { name: 'Twilio', desc: 'SMS & notifications', connected: true, icon: 'chatbubble' },
    { name: 'Google Maps', desc: 'Navigation & geocoding', connected: true, icon: 'map' },
    { name: 'Firebase', desc: 'Push notifications', connected: true, icon: 'notifications' },
    { name: 'Segment', desc: 'Analytics', connected: false, icon: 'analytics' },
  ]);

  const openEditModal = (label: string, value: string, unit: string, onSave: (v: string) => void) => {
    setEditValue(value);
    setEditModal({ visible: true, label, value, unit, onSave });
  };

  const handleSaveConfig = () => {
    setSaved(true);
    showToast('Settings saved successfully!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = (name: string, setter: (v: boolean) => void, current: boolean) => {
    const newVal = !current;
    setter(newVal);
    if (name === 'Maintenance Mode' && newVal) {
      if (!webConfirm('Enable Maintenance Mode?\nAll users will see a maintenance page.')) {
        setter(current);
        return;
      }
    }
    showToast(`${name}: ${newVal ? 'Enabled' : 'Disabled'}`);
  };

  const handleIntegrationToggle = (index: number) => {
    const item = integrations[index];
    const action = item.connected ? 'Disconnect' : 'Connect';
    if (webConfirm(`${action} ${item.name}?\nThis will ${item.connected ? 'disable' : 'enable'} the ${item.desc.toLowerCase()} integration.`)) {
      setIntegrations(prev => prev.map((it, i) => i === index ? { ...it, connected: !it.connected } : it));
      showToast(`${item.name} ${item.connected ? 'disconnected' : 'connected'} successfully`);
    }
  };

  const handleClearCache = async () => {
    if (webConfirm('Clear Cache?\nThis will clear all cached data including images and temporary files.')) {
      try {
        await AsyncStorage.clear();
        setCacheCleared(true);
        showToast('Cache cleared successfully!');
        setTimeout(() => setCacheCleared(false), 3000);
      } catch { showToast('Failed to clear cache'); }
    }
  };

  const handleExportData = () => {
    if (webConfirm('Export All Data?\nThis will export all platform data to CSV. This may take several minutes.')) {
      setExportStarted(true);
      showToast('Data export queued. You will receive an email when complete.');
      setTimeout(() => setExportStarted(false), 3000);
    }
  };

  const handlePurgeTestData = () => {
    if (webConfirm('DANGER: Purge Test Data?\nThis will permanently delete ALL test data. This cannot be undone!')) {
      if (webConfirm('FINAL WARNING: Are you absolutely sure?\nThis will delete all test orders, users, and transactions.')) {
        setPurgeStarted(true);
        showToast('Test data purge initiated');
        setTimeout(() => setPurgeStarted(false), 3000);
      }
    }
  };

  const Btn = ({ onPress, children, style }: any) => (
    <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && { opacity: 0.6 }]}>
      {children}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Btn onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textWhite} />
        </Btn>
        <Text style={styles.headerTitle}>Settings & Config</Text>
        <Btn onPress={handleSaveConfig} style={{}}>
          <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={22} color={saved ? colors.success : colors.textWhite} />
        </Btn>
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
              onValueChange={() => handleToggle('Maintenance Mode', setMaintenanceMode, maintenanceMode)}
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
              onValueChange={() => handleToggle('New User Registration', setNewUserRegistration, newUserRegistration)}
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
              onValueChange={() => handleToggle('Auto-Approve Merchants', setAutoApprove, autoApprove)}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={autoApprove ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.configDivider} />

          <Btn onPress={() => openEditModal('Default Commission Rate', commissionRate, '%', setCommissionRate)} style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="pricetag-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Default Commission Rate</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>{commissionRate}%</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </Btn>
          <View style={styles.configDivider} />

          <Btn onPress={() => openEditModal('Base Delivery Fee', deliveryFee, '₦', setDeliveryFee)} style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="bicycle-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Base Delivery Fee</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>₦{deliveryFee}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </Btn>
          <View style={styles.configDivider} />

          <Btn onPress={() => openEditModal('Max Delivery Radius', maxRadius, 'km', setMaxRadius)} style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="location-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Max Delivery Radius</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>{maxRadius} km</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </Btn>
          <View style={styles.configDivider} />

          <Btn onPress={() => openEditModal('Order Timeout', orderTimeout, 'min', setOrderTimeout)} style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="time-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Order Timeout</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>{orderTimeout} min</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </Btn>
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
              onValueChange={() => handleToggle('Email Notifications', setEmailNotifs, emailNotifs)}
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
              onValueChange={() => handleToggle('Slack Alerts', setSlackNotifs, slackNotifs)}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={slackNotifs ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.configDivider} />

          <Btn onPress={() => navigation.navigate('PushNotifications')} style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="megaphone-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Push Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </Btn>
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
              onValueChange={() => handleToggle('Two-Factor Auth', setTwoFactor, twoFactor)}
              trackColor={{ false: colors.border, true: colors.teal + '50' }}
              thumbColor={twoFactor ? colors.teal : colors.textLight}
            />
          </View>
          <View style={styles.configDivider} />

          <Btn onPress={() => showToast('3 API keys active — manage in Stripe dashboard')} style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="key-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>API Keys</Text>
            </View>
            <View style={styles.configValue}>
              <Text style={styles.configValueText}>3 active</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </View>
          </Btn>
          <View style={styles.configDivider} />

          <Btn onPress={() => navigation.navigate('AuditLogs')} style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="document-text-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Audit Logs</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </Btn>
          <View style={styles.configDivider} />

          <Btn onPress={() => navigation.navigate('RolesManagement')} style={styles.configItem}>
            <View style={styles.configInfo}>
              <Ionicons name="people-outline" size={20} color={colors.navy} />
              <Text style={styles.configLabel}>Admin Roles & Permissions</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </Btn>
        </View>

        {/* Integrations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Integrations</Text>
          {integrations.map((integration, index) => (
            <React.Fragment key={index}>
              <Btn onPress={() => handleIntegrationToggle(index)} style={styles.integrationRow}>
                <View style={[styles.integrationIcon, {
                  backgroundColor: integration.connected ? colors.teal + '15' : colors.lightGray
                }]}>
                  <Ionicons
                    name={integration.icon as any}
                    size={18}
                    color={integration.connected ? colors.teal : colors.textLight}
                  />
                </View>
                <View style={styles.integrationInfo}>
                  <Text style={styles.integrationName}>{integration.name}</Text>
                  <Text style={styles.integrationDesc}>{integration.desc}</Text>
                </View>
                <View style={[styles.integrationStatus, {
                  backgroundColor: integration.connected ? colors.success + '15' : colors.error + '15'
                }]}>
                  <View style={[styles.integrationDot, {
                    backgroundColor: integration.connected ? colors.success : colors.error
                  }]} />
                  <Text style={[styles.integrationStatusText, {
                    color: integration.connected ? colors.success : colors.error
                  }]}>{integration.connected ? 'Connected' : 'Disconnected'}</Text>
                </View>
              </Btn>
              {index < integrations.length - 1 && <View style={styles.configDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Btn onPress={handleClearCache} style={styles.dangerBtn}>
            <Ionicons name="refresh-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.dangerBtnText}>{cacheCleared ? 'Cache Cleared!' : 'Clear Cache'}</Text>
          </Btn>
          <Btn onPress={handleExportData} style={styles.dangerBtn}>
            <Ionicons name="cloud-download-outline" size={18} color={colors.navy} />
            <Text style={styles.dangerBtnText}>{exportStarted ? 'Export Queued!' : 'Export All Data'}</Text>
          </Btn>
          <Btn onPress={handlePurgeTestData} style={[styles.dangerBtn, styles.dangerBtnRed]}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={[styles.dangerBtnText, { color: colors.error }]}>{purgeStarted ? 'Purge Initiated!' : 'Purge Test Data'}</Text>
          </Btn>
        </View>

        <Text style={styles.versionText}>Fulccrum Admin v1.0.0 · Build 2026.02.06</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Config Modal */}
      <Modal visible={editModal.visible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditModal(m => ({ ...m, visible: false }))}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit {editModal.label}</Text>
            <View style={styles.modalInputRow}>
              {editModal.unit === '₦' && <Text style={styles.modalUnit}>₦</Text>}
              <TextInput
                style={styles.modalInput}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="numeric"
                autoFocus
              />
              {editModal.unit !== '₦' && <Text style={styles.modalUnit}>{editModal.unit}</Text>}
            </View>
            <View style={styles.modalActions}>
              <Btn onPress={() => setEditModal(m => ({ ...m, visible: false }))} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Btn>
              <Btn onPress={() => {
                editModal.onSave(editValue);
                setEditModal(m => ({ ...m, visible: false }));
                showToast(`${editModal.label} updated to ${editModal.unit === '₦' ? '₦' : ''}${editValue}${editModal.unit !== '₦' ? ' ' + editModal.unit : ''}`);
              }} style={styles.modalSaveBtn}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Btn>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Toast */}
      {toast !== '' && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}
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
  backBtn: { marginRight: 10, padding: 4 },
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
  configItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, cursor: 'pointer' as any },
  configInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  configLabel: { fontSize: 15, color: colors.textPrimary },
  configValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  configValueText: { fontSize: 14, color: colors.textLight },
  configDivider: { height: 1, backgroundColor: colors.borderLight },
  integrationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, cursor: 'pointer' as any },
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
    borderBottomWidth: 1, borderBottomColor: colors.borderLight, cursor: 'pointer' as any,
  },
  dangerBtnRed: { borderBottomWidth: 0 },
  dangerBtnText: { fontSize: 15, color: colors.textPrimary },
  versionText: { textAlign: 'center', fontSize: 12, color: colors.textLight, marginTop: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white, borderRadius: 16, padding: 24, width: '90%', maxWidth: 400,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  modalInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  modalUnit: { fontSize: 18, fontWeight: '600', color: colors.textLight },
  modalInput: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12,
    fontSize: 18, fontWeight: '600', color: colors.textPrimary,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.lightGray, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  modalSaveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.navy, alignItems: 'center',
  },
  modalSaveText: { fontSize: 15, fontWeight: '600', color: colors.textWhite },
  toast: {
    position: 'absolute', bottom: 100, left: 20, right: 20,
    backgroundColor: colors.navy, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  toastText: { color: colors.textWhite, fontSize: 14, fontWeight: '600' },
});
