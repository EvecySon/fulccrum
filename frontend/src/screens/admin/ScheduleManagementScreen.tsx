import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';

type Tab = 'slots' | 'zones' | 'stats' | 'noshows';

interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  zone: string;
  totalSpots: number;
  demand: string;
  surgeMultiplier: number;
  estimatedEarnings: number;
  active: boolean;
  sortOrder: number;
}

interface ScheduleZone {
  id: string;
  key: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
}

interface NoShow {
  id: string;
  courierId: string;
  date: string;
  penalty: string;
  resolved: boolean;
  createdAt: string;
  courier?: { id: string; firstName: string; lastName: string; email: string };
}

interface Stats {
  zone: string;
  period: { start: string; end: string };
  totalBooked: number;
  totalCompleted: number;
  totalNoShows: number;
  totalCancelled: number;
  fillRate: number;
}

const DEMAND_OPTIONS = ['low', 'medium', 'high', 'peak'];
const DEMAND_COLORS: Record<string, string> = {
  low: colors.teal,
  medium: '#eab308',
  high: '#f97316',
  peak: '#dc2626',
};

export default function ScheduleManagementScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('slots');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Slots state
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [slotForm, setSlotForm] = useState({
    startTime: '', endTime: '', zone: 'default', totalSpots: '15',
    demand: 'medium', surgeMultiplier: '1.0', estimatedEarnings: '15000',
    active: true, sortOrder: '0',
  });

  // Zones state
  const [zones, setZones] = useState<ScheduleZone[]>([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ScheduleZone | null>(null);
  const [zoneForm, setZoneForm] = useState({
    key: '', name: '', latitude: '6.5244', longitude: '3.3792', radius: '5.0', active: true,
  });

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedZone, setSelectedZone] = useState('default');

  // No-shows state
  const [noShows, setNoShows] = useState<NoShow[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [activeTab, selectedZone, showResolved]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'slots') {
        const res = await adminAPI.getScheduleSlots(selectedZone);
        setSlots(Array.isArray(res) ? res : res?.data || []);
      } else if (activeTab === 'zones') {
        const res = await adminAPI.getScheduleZones();
        setZones(Array.isArray(res) ? res : res?.data || []);
      } else if (activeTab === 'stats') {
        const res = await adminAPI.getScheduleStats(selectedZone);
        setStats(res?.data ?? res);
      } else if (activeTab === 'noshows') {
        const res = await adminAPI.getScheduleNoShows(showResolved);
        setNoShows(Array.isArray(res) ? res : res?.data || []);
      }
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ─── Slot CRUD ───
  const openCreateSlot = () => {
    setEditingSlot(null);
    setSlotForm({
      startTime: '', endTime: '', zone: selectedZone, totalSpots: '15',
      demand: 'medium', surgeMultiplier: '1.0', estimatedEarnings: '15000',
      active: true, sortOrder: String(slots.length),
    });
    setShowSlotModal(true);
  };

  const openEditSlot = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      startTime: slot.startTime, endTime: slot.endTime, zone: slot.zone,
      totalSpots: String(slot.totalSpots), demand: slot.demand,
      surgeMultiplier: String(slot.surgeMultiplier),
      estimatedEarnings: String(slot.estimatedEarnings),
      active: slot.active, sortOrder: String(slot.sortOrder),
    });
    setShowSlotModal(true);
  };

  const saveSlot = async () => {
    if (!slotForm.startTime || !slotForm.endTime) {
      showAlert('Error', 'Start time and end time are required');
      return;
    }
    setSaving(true);
    try {
      await adminAPI.upsertScheduleSlot({
        id: editingSlot?.id,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        zone: slotForm.zone,
        totalSpots: parseInt(slotForm.totalSpots) || 15,
        demand: slotForm.demand,
        surgeMultiplier: parseFloat(slotForm.surgeMultiplier) || 1.0,
        estimatedEarnings: parseInt(slotForm.estimatedEarnings) || 15000,
        active: slotForm.active,
        sortOrder: parseInt(slotForm.sortOrder) || 0,
      });
      setShowSlotModal(false);
      loadData();
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || 'Failed to save slot. Is the backend running?';
      showAlert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = (slot: ScheduleSlot) => {
    showAlert('Delete Slot', `Delete ${slot.startTime} - ${slot.endTime}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await adminAPI.deleteScheduleSlot(slot.id);
            loadData();
          } catch (e: any) {
            showAlert('Error', e?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  // ─── Zone CRUD ───
  const openCreateZone = () => {
    setEditingZone(null);
    setZoneForm({ key: '', name: '', latitude: '6.5244', longitude: '3.3792', radius: '5.0', active: true });
    setShowZoneModal(true);
  };

  const openEditZone = (zone: ScheduleZone) => {
    setEditingZone(zone);
    setZoneForm({
      key: zone.key, name: zone.name, latitude: String(zone.latitude),
      longitude: String(zone.longitude), radius: String(zone.radius), active: zone.active,
    });
    setShowZoneModal(true);
  };

  const saveZone = async () => {
    if (!zoneForm.key || !zoneForm.name) {
      showAlert('Error', 'Key and name are required');
      return;
    }
    setSaving(true);
    try {
      await adminAPI.upsertScheduleZone({
        id: editingZone?.id,
        key: zoneForm.key,
        name: zoneForm.name,
        latitude: parseFloat(zoneForm.latitude) || 6.5244,
        longitude: parseFloat(zoneForm.longitude) || 3.3792,
        radius: parseFloat(zoneForm.radius) || 5.0,
        active: zoneForm.active,
      });
      setShowZoneModal(false);
      loadData();
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || 'Failed to save zone. Is the backend running?';
      showAlert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteZone = (zone: ScheduleZone) => {
    showAlert('Delete Zone', `Delete "${zone.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await adminAPI.deleteScheduleZone(zone.id);
            loadData();
          } catch (e: any) {
            showAlert('Error', e?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  // ─── No-show actions ───
  const resolveNoShow = async (id: string) => {
    try {
      await adminAPI.resolveNoShow(id);
      loadData();
    } catch (e: any) {
      showAlert('Error', e?.message || 'Failed to resolve');
    }
  };

  // ─── Render helpers ───
  const renderTabs = () => (
    <View style={styles.tabRow}>
      {([
        { key: 'slots', label: 'Slots', icon: 'time-outline' },
        { key: 'zones', label: 'Zones', icon: 'location-outline' },
        { key: 'stats', label: 'Stats', icon: 'bar-chart-outline' },
        { key: 'noshows', label: 'No-Shows', icon: 'warning-outline' },
      ] as { key: Tab; label: string; icon: string }[]).map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? colors.textWhite : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSlots = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Time Slots ({selectedZone})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateSlot}>
          <Ionicons name="add" size={18} color={colors.textWhite} />
          <Text style={styles.addBtnText}>Add Slot</Text>
        </TouchableOpacity>
      </View>

      {slots.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="time-outline" size={40} color={colors.textLight} />
          <Text style={styles.emptyText}>No slots configured</Text>
          <Text style={styles.emptySubtext}>Add time slots so couriers can book shifts</Text>
        </View>
      )}

      {slots.map((slot) => (
        <TouchableOpacity key={slot.id} style={styles.card} onPress={() => openEditSlot(slot)}>
          <View style={styles.cardRow}>
            <View style={[styles.demandDot, { backgroundColor: DEMAND_COLORS[slot.demand] || colors.textLight }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{slot.startTime} — {slot.endTime}</Text>
              <Text style={styles.cardSub}>
                {slot.totalSpots} spots · {slot.demand} · {slot.surgeMultiplier}x · ₦{slot.estimatedEarnings.toLocaleString()}
              </Text>
            </View>
            <View style={styles.cardActions}>
              {!slot.active && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>OFF</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => deleteSlot(slot)}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderZones = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Scheduling Zones</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateZone}>
          <Ionicons name="add" size={18} color={colors.textWhite} />
          <Text style={styles.addBtnText}>Add Zone</Text>
        </TouchableOpacity>
      </View>

      {zones.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="location-outline" size={40} color={colors.textLight} />
          <Text style={styles.emptyText}>No zones configured</Text>
          <Text style={styles.emptySubtext}>Create zones to enable zone-based scheduling</Text>
        </View>
      )}

      {zones.map((zone) => (
        <TouchableOpacity key={zone.id} style={styles.card} onPress={() => openEditZone(zone)}>
          <View style={styles.cardRow}>
            <View style={[styles.zoneIcon, { backgroundColor: zone.active ? colors.teal + '15' : colors.textLight + '15' }]}>
              <Ionicons name="location" size={18} color={zone.active ? colors.teal : colors.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{zone.name}</Text>
              <Text style={styles.cardSub}>Key: {zone.key} · Radius: {zone.radius}km · {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}</Text>
            </View>
            <View style={styles.cardActions}>
              {!zone.active && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>OFF</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => deleteZone(zone)}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStats = () => (
    <View>
      <Text style={styles.sectionTitle}>Booking Statistics</Text>
      {stats ? (
        <View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalBooked}</Text>
              <Text style={styles.statLabel}>Booked</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.success }]}>{stats.totalCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.error }]}>{stats.totalNoShows}</Text>
              <Text style={styles.statLabel}>No-Shows</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{stats.totalCancelled}</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
          <View style={styles.fillRateCard}>
            <Text style={styles.fillRateLabel}>Fill Rate</Text>
            <Text style={styles.fillRateValue}>{stats.fillRate}%</Text>
            <View style={styles.fillRateBar}>
              <View style={[styles.fillRateFill, { width: `${Math.min(stats.fillRate, 100)}%` }]} />
            </View>
            <Text style={styles.fillRatePeriod}>{stats.period.start} — {stats.period.end}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <ActivityIndicator size="small" color={colors.teal} />
          <Text style={styles.emptyText}>Loading stats...</Text>
        </View>
      )}
    </View>
  );

  const renderNoShows = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>No-Show Records</Text>
        <TouchableOpacity
          style={[styles.filterBtn, showResolved && styles.filterBtnActive]}
          onPress={() => setShowResolved(!showResolved)}
        >
          <Text style={[styles.filterBtnText, showResolved && styles.filterBtnTextActive]}>
            {showResolved ? 'Resolved' : 'Unresolved'}
          </Text>
        </TouchableOpacity>
      </View>

      {noShows.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-circle-outline" size={40} color={colors.success} />
          <Text style={styles.emptyText}>No {showResolved ? 'resolved' : 'unresolved'} no-shows</Text>
        </View>
      )}

      {noShows.map((ns) => (
        <View key={ns.id} style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.penaltyIcon, {
              backgroundColor: ns.penalty === 'booking_ban' ? colors.error + '15' :
                ns.penalty === 'reduced_priority' ? colors.warning + '15' : colors.textLight + '15',
            }]}>
              <Ionicons
                name={ns.penalty === 'booking_ban' ? 'ban' : ns.penalty === 'reduced_priority' ? 'arrow-down' : 'warning'}
                size={18}
                color={ns.penalty === 'booking_ban' ? colors.error : ns.penalty === 'reduced_priority' ? colors.warning : colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                {ns.courier ? `${ns.courier.firstName} ${ns.courier.lastName}` : ns.courierId.slice(0, 8)}
              </Text>
              <Text style={styles.cardSub}>
                {ns.penalty.replace('_', ' ')} · {new Date(ns.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {!ns.resolved && (
              <TouchableOpacity style={styles.resolveBtn} onPress={() => resolveNoShow(ns.id)}>
                <Text style={styles.resolveBtnText}>Resolve</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Management</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderTabs()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        ) : (
          <>
            {activeTab === 'slots' && renderSlots()}
            {activeTab === 'zones' && renderZones()}
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'noshows' && renderNoShows()}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Slot Modal */}
      <Modal visible={showSlotModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingSlot ? 'Edit Slot' : 'New Slot'}</Text>
              <TouchableOpacity onPress={() => setShowSlotModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Start Time</Text>
              <TextInput
                style={styles.input}
                value={slotForm.startTime}
                onChangeText={(v) => setSlotForm({ ...slotForm, startTime: v })}
                placeholder="e.g. 6:00 AM"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>End Time</Text>
              <TextInput
                style={styles.input}
                value={slotForm.endTime}
                onChangeText={(v) => setSlotForm({ ...slotForm, endTime: v })}
                placeholder="e.g. 9:00 AM"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>Zone</Text>
              <TextInput
                style={styles.input}
                value={slotForm.zone}
                onChangeText={(v) => setSlotForm({ ...slotForm, zone: v })}
                placeholder="default"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>Total Spots</Text>
              <TextInput
                style={styles.input}
                value={slotForm.totalSpots}
                onChangeText={(v) => setSlotForm({ ...slotForm, totalSpots: v })}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>Demand Level</Text>
              <View style={styles.demandRow}>
                {DEMAND_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.demandChip, slotForm.demand === d && { backgroundColor: DEMAND_COLORS[d] + '20', borderColor: DEMAND_COLORS[d] }]}
                    onPress={() => setSlotForm({ ...slotForm, demand: d })}
                  >
                    <View style={[styles.demandChipDot, { backgroundColor: DEMAND_COLORS[d] }]} />
                    <Text style={[styles.demandChipText, slotForm.demand === d && { color: DEMAND_COLORS[d], fontWeight: '700' }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Surge Multiplier</Text>
              <TextInput
                style={styles.input}
                value={slotForm.surgeMultiplier}
                onChangeText={(v) => setSlotForm({ ...slotForm, surgeMultiplier: v })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>Estimated Earnings (₦)</Text>
              <TextInput
                style={styles.input}
                value={slotForm.estimatedEarnings}
                onChangeText={(v) => setSlotForm({ ...slotForm, estimatedEarnings: v })}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>Sort Order</Text>
              <TextInput
                style={styles.input}
                value={slotForm.sortOrder}
                onChangeText={(v) => setSlotForm({ ...slotForm, sortOrder: v })}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active</Text>
                <Switch value={slotForm.active} onValueChange={(v) => setSlotForm({ ...slotForm, active: v })} trackColor={{ true: colors.teal }} />
              </View>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={saveSlot} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <Text style={styles.saveBtnText}>{editingSlot ? 'Update Slot' : 'Create Slot'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Zone Modal */}
      <Modal visible={showZoneModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingZone ? 'Edit Zone' : 'New Zone'}</Text>
              <TouchableOpacity onPress={() => setShowZoneModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Key (unique identifier)</Text>
              <TextInput
                style={styles.input}
                value={zoneForm.key}
                onChangeText={(v) => setZoneForm({ ...zoneForm, key: v })}
                placeholder="e.g. victoria_island"
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
              />
              <Text style={styles.fieldLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={zoneForm.name}
                onChangeText={(v) => setZoneForm({ ...zoneForm, name: v })}
                placeholder="e.g. Victoria Island"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={zoneForm.latitude}
                onChangeText={(v) => setZoneForm({ ...zoneForm, latitude: v })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={zoneForm.longitude}
                onChangeText={(v) => setZoneForm({ ...zoneForm, longitude: v })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textLight}
              />
              <Text style={styles.fieldLabel}>Radius (km)</Text>
              <TextInput
                style={styles.input}
                value={zoneForm.radius}
                onChangeText={(v) => setZoneForm({ ...zoneForm, radius: v })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textLight}
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active</Text>
                <Switch value={zoneForm.active} onValueChange={(v) => setZoneForm({ ...zoneForm, active: v })} trackColor={{ true: colors.teal }} />
              </View>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={saveZone} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <Text style={styles.saveBtnText}>{editingZone ? 'Update Zone' : 'Create Zone'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.white,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, gap: 6,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, borderRadius: 12, backgroundColor: colors.lightGray,
  },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  content: { padding: 10 },
  loadingContainer: { paddingTop: 60, alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.teal, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  card: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardSub: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  demandDot: { width: 10, height: 10, borderRadius: 5 },
  zoneIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  penaltyIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inactiveBadge: { backgroundColor: colors.textLight + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  inactiveBadgeText: { fontSize: 10, fontWeight: '700', color: colors.textLight },
  emptyCard: {
    alignItems: 'center', justifyContent: 'center', padding: 40,
    backgroundColor: colors.white, borderRadius: 16, gap: 8,
  },
  emptyText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  emptySubtext: { fontSize: 13, color: colors.textLight },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  statBox: {
    flex: 1, minWidth: '45%', backgroundColor: colors.white, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  fillRateCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 16, marginTop: 12, alignItems: 'center',
  },
  fillRateLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  fillRateValue: { fontSize: 36, fontWeight: '800', color: colors.teal, marginTop: 4 },
  fillRateBar: { width: '100%', height: 8, backgroundColor: colors.lightGray, borderRadius: 4, marginTop: 8 },
  fillRateFill: { height: 8, backgroundColor: colors.teal, borderRadius: 4 },
  fillRatePeriod: { fontSize: 12, color: colors.textLight, marginTop: 8 },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: colors.lightGray, borderWidth: 1, borderColor: colors.borderLight,
  },
  filterBtnActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterBtnTextActive: { color: colors.textWhite },
  resolveBtn: {
    backgroundColor: colors.success + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  resolveBtnText: { fontSize: 12, fontWeight: '700', color: colors.success },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 14, marginBottom: 4 },
  input: {
    backgroundColor: colors.lightGray, borderRadius: 12, padding: 14, fontSize: 15,
    color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight,
  },
  demandRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  demandChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.lightGray,
  },
  demandChipDot: { width: 8, height: 8, borderRadius: 4 },
  demandChipText: { fontSize: 13, color: colors.textSecondary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  saveBtn: {
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
});
