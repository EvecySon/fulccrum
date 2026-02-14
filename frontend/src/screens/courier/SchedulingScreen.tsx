import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierScheduleAPI } from '../../services/api';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  demand: 'low' | 'medium' | 'high' | 'peak';
  spotsLeft: number;
  totalSpots: number;
  estimatedEarnings: number;
  surgeMultiplier: number;
  booked: boolean;
  bookingId: string | null;
  canBook: boolean;
}

interface DaySchedule {
  date: string;
  canBook: boolean;
  slots: TimeSlot[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDayLabel = (dateStr: string): { dayShort: string; dayLabel: string; isToday: boolean } => {
  if (!dateStr) return { dayShort: '', dayLabel: 'Today', isToday: true };
  const date = new Date(dateStr + 'T12:00:00');
  if (isNaN(date.getTime())) return { dayShort: '', dayLabel: 'Today', isToday: true };
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  return {
    dayShort: DAY_LABELS[date.getDay()],
    dayLabel: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `${date.getDate()}/${date.getMonth() + 1}`,
    isToday,
  };
};

const TIER_COLORS: Record<string, string> = {
  excellent: '#10b981',
  good: '#3b82f6',
  standard: '#9ca3af',
};

const TIER_LABELS: Record<string, string> = {
  excellent: 'Excellent — 7 days ahead',
  good: 'Good — 5 days ahead',
  standard: 'Standard — 3 days ahead',
};

export default function SchedulingScreen({ navigation }: any) {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [tier, setTier] = useState('standard');
  const [noShowCount, setNoShowCount] = useState(0);
  const [banned, setBanned] = useState(false);
  const [zones, setZones] = useState<{ key: string; name: string }[]>([]);
  const [selectedZone, setSelectedZone] = useState('default');

  useEffect(() => {
    loadSchedule();
    loadZones();
  }, [selectedZone]);

  const loadZones = async () => {
    try {
      const res = await courierScheduleAPI.getZones();
      const data = Array.isArray(res) ? res : res?.data || [];
      if (data.length) setZones(data);
    } catch {}
  };

  const generateFallbackDays = (): DaySchedule[] => {
    const days: DaySchedule[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push({ date: d.toISOString().split('T')[0], canBook: false, slots: [] });
    }
    return days;
  };

  const loadSchedule = async () => {
    try {
      const weekStart = new Date().toISOString().split('T')[0];
      const res = await courierScheduleAPI.getSchedule(weekStart, selectedZone);
      const data = res?.data ?? res;
      if (data?.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
        setSchedule(data.schedule);
        setTier(data.tier || 'standard');
        setNoShowCount(data.noShowCount || 0);
        setBanned(data.banned || false);
      } else {
        setSchedule(generateFallbackDays());
      }
    } catch {
      setSchedule(generateFallbackDays());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'peak': return '#dc2626';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return colors.teal;
      default: return colors.textLight;
    }
  };

  const handleBookSlot = async (slotId: string, date: string) => {
    setBookingLoading(slotId);
    try {
      await courierScheduleAPI.bookShift(slotId, date, selectedZone);
      showAlert('Success', 'Shift booked successfully');
      await loadSchedule();
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || 'Failed to book shift';
      if (Platform.OS === 'web') {
        window.alert('Cannot Book: ' + msg);
      } else {
        showAlert('Cannot Book', msg);
      }
    }
    setBookingLoading(null);
  };

  const handleDropSlot = (bookingId: string) => {
    showAlert('Drop Shift', 'Are you sure you want to drop this shift?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Drop Shift',
        style: 'destructive',
        onPress: async () => {
          setBookingLoading(bookingId);
          try {
            const res = await courierScheduleAPI.dropShift(bookingId);
            if (res?.warning) showAlert('Warning', res.warning);
            await loadSchedule();
          } catch (e: any) {
            showAlert('Error', e?.message || 'Failed to drop shift');
          } finally {
            setBookingLoading(null);
          }
        },
      },
    ]);
  };

  const currentDay = schedule[selectedDay];
  const bookedCount = schedule.reduce((acc, day) => acc + day.slots.filter(s => s.booked).length, 0);
  const totalEstEarnings = schedule.reduce(
    (acc, day) => acc + day.slots.filter(s => s.booked).reduce((a, s) => a + s.estimatedEarnings, 0), 0,
  );
  const scheduledHours = schedule.reduce(
    (acc, day) => acc + day.slots.filter(s => s.booked).length * 3, 0,
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Shifts</Text>
        <View style={styles.bookedBadge}>
          <Text style={styles.bookedBadgeText}>{bookedCount} booked</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSchedule(); }} tintColor={colors.teal} />}
      >
        {/* Tier Badge */}
        <View style={styles.tierCard}>
          <View style={styles.tierRow}>
            <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[tier] || colors.textLight }]} />
            <Text style={styles.tierText}>{TIER_LABELS[tier] || 'Standard — 3 days ahead'}</Text>
          </View>
          {noShowCount > 0 && (
            <View style={styles.warningRow}>
              <Ionicons name="warning" size={14} color={colors.error} />
              <Text style={styles.warningText}>{noShowCount} no-show{noShowCount > 1 ? 's' : ''} on record</Text>
            </View>
          )}
          {banned && (
            <View style={styles.warningRow}>
              <Ionicons name="ban" size={14} color={colors.error} />
              <Text style={[styles.warningText, { color: colors.error, fontWeight: '700' }]}>Booking temporarily suspended</Text>
            </View>
          )}
        </View>

        {/* Zone Selector */}
        {zones.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zoneSelector}>
            {zones.map((zone) => (
              <TouchableOpacity
                key={zone.key}
                style={[styles.zoneTab, selectedZone === zone.key && styles.zoneTabActive]}
                onPress={() => setSelectedZone(zone.key)}
              >
                <Text style={[styles.zoneTabText, selectedZone === zone.key && styles.zoneTabTextActive]}>{zone.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Weekly Overview */}
        <View style={styles.weekOverview}>
          <View style={styles.weekStat}>
            <Ionicons name="time-outline" size={18} color={colors.teal} />
            <Text style={styles.weekStatValue}>{scheduledHours}h</Text>
            <Text style={styles.weekStatLabel}>Scheduled</Text>
          </View>
          <View style={styles.weekStatDivider} />
          <View style={styles.weekStat}>
            <Ionicons name="cash-outline" size={18} color={colors.success} />
            <Text style={styles.weekStatValue}>₦{(totalEstEarnings / 1000).toFixed(0)}k</Text>
            <Text style={styles.weekStatLabel}>Est. Earnings</Text>
          </View>
          <View style={styles.weekStatDivider} />
          <View style={styles.weekStat}>
            <Ionicons name="calendar-outline" size={18} color={colors.navy} />
            <Text style={styles.weekStatValue}>{bookedCount}</Text>
            <Text style={styles.weekStatLabel}>Booked</Text>
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
          {schedule.map((day, index) => {
            const { dayShort, dayLabel } = getDayLabel(day.date);
            const hasBookings = day.slots.some(s => s.booked);
            return (
              <TouchableOpacity
                key={day.date}
                style={[styles.dayTab, selectedDay === index && styles.dayTabActive, !day.canBook && styles.dayTabDisabled]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={[styles.dayTabShort, selectedDay === index && styles.dayTabShortActive]}>
                  {dayShort}
                </Text>
                <Text style={[styles.dayTabLabel, selectedDay === index && styles.dayTabLabelActive]}>
                  {dayLabel}
                </Text>
                {hasBookings && <View style={[styles.dayDot, selectedDay === index && { backgroundColor: colors.textWhite }]} />}
                {!day.canBook && !hasBookings && (
                  <Ionicons name="lock-closed" size={10} color={colors.textLight} style={{ marginTop: 2 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slots */}
        <View style={styles.slotsSection}>
          <Text style={styles.slotsTitle}>
            {getDayLabel(currentDay?.date || '').dayLabel || 'Today'} — Available Shifts
          </Text>

          {(!currentDay?.slots || currentDay.slots.length === 0) && (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>No slots configured for this zone</Text>
            </View>
          )}

          {currentDay?.slots.map((slot) => {
            const demandColor = getDemandColor(slot.demand);
            const isFull = slot.spotsLeft <= 0 && !slot.booked;
            const isLoadingThis = bookingLoading != null && (bookingLoading === slot.id || bookingLoading === slot.bookingId);
            return (
              <View key={slot.id} style={[styles.slotCard, slot.booked && styles.slotCardBooked, isFull && !slot.booked && { opacity: 0.5 }]}>
                <View style={styles.slotLeft}>
                  <View style={styles.slotTime}>
                    <Text style={styles.slotTimeStart}>{slot.startTime}</Text>
                    <View style={styles.slotTimeLine} />
                    <Text style={styles.slotTimeEnd}>{slot.endTime}</Text>
                  </View>
                </View>

                <View style={styles.slotCenter}>
                  <View style={[styles.demandBadge, { backgroundColor: demandColor + '12' }]}>
                    <View style={[styles.demandDot, { backgroundColor: demandColor }]} />
                    <Text style={[styles.demandText, { color: demandColor }]}>
                      {slot.demand.toUpperCase()}
                    </Text>
                    {slot.surgeMultiplier > 1 && (
                      <Text style={[styles.demandSurge, { color: demandColor }]}>{slot.surgeMultiplier}x</Text>
                    )}
                  </View>

                  <Text style={styles.slotEarnings}>₦{slot.estimatedEarnings.toLocaleString()}</Text>
                  <Text style={styles.slotEarningsLabel}>estimated</Text>

                  <View style={styles.spotsRow}>
                    <Ionicons name="people-outline" size={12} color={slot.spotsLeft <= 3 ? colors.error : colors.textLight} />
                    <Text style={[styles.spotsText, slot.spotsLeft <= 3 && { color: colors.error }]}>
                      {isFull ? 'Full' : `${slot.spotsLeft} spots left`}
                    </Text>
                  </View>
                </View>

                <View style={styles.slotRight}>
                  {isLoadingThis ? (
                    <ActivityIndicator size="small" color={colors.teal} />
                  ) : slot.booked ? (
                    <TouchableOpacity style={styles.dropBtn} onPress={() => slot.bookingId && handleDropSlot(slot.bookingId)}>
                      <Ionicons name="close-circle" size={16} color={colors.error} />
                      <Text style={styles.dropBtnText}>Drop</Text>
                    </TouchableOpacity>
                  ) : (
                    <Pressable
                      style={({ pressed }) => [
                        styles.bookBtn,
                        (!slot.canBook || isFull) && { backgroundColor: colors.textLight },
                        pressed && { opacity: 0.7 },
                        Platform.OS === 'web' && { cursor: 'pointer' as any },
                      ]}
                      onPress={() => {
                        if (!slot.canBook || isFull || !currentDay) return;
                        handleBookSlot(slot.id, currentDay.date);
                      }}
                    >
                      <Ionicons name="add" size={18} color={colors.textWhite} />
                      <Text style={styles.bookBtnText}>Book</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Scheduling Tips</Text>
          <View style={styles.tipRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.tipText}>Book peak slots early — they fill up fast</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.tipText}>Higher ratings unlock more booking days ahead</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.tipText}>Drop shifts at least 2 hours before to avoid penalties</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.tipText}>Booked riders get priority for order assignments</Text>
          </View>
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
  bookedBadge: { backgroundColor: colors.teal, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  bookedBadgeText: { fontSize: 12, fontWeight: '700', color: colors.textWhite },
  weekOverview: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 10, borderRadius: 16, padding: 16,
  },
  weekStat: { alignItems: 'center' },
  weekStatValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  weekStatLabel: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  weekStatDivider: { width: 1, height: 40, backgroundColor: colors.borderLight },
  daySelector: { paddingHorizontal: 10, paddingVertical: 12, gap: 8 },
  dayTab: {
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
    backgroundColor: colors.white, minWidth: 60,
  },
  dayTabActive: { backgroundColor: colors.teal },
  dayTabShort: { fontSize: 11, fontWeight: '600', color: colors.textLight },
  dayTabShortActive: { color: colors.textWhite + '80' },
  dayTabLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  dayTabLabelActive: { color: colors.textWhite },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.teal, marginTop: 4 },
  slotsSection: { paddingHorizontal: 10 },
  slotsTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  slotCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 16, padding: 14, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: 'transparent',
  },
  slotCardBooked: { borderColor: colors.teal + '40', backgroundColor: colors.teal + '05' },
  slotLeft: {},
  slotTime: { alignItems: 'center' },
  slotTimeStart: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  slotTimeLine: { width: 2, height: 16, backgroundColor: colors.borderLight, marginVertical: 2 },
  slotTimeEnd: { fontSize: 12, color: colors.textLight },
  slotCenter: { flex: 1 },
  demandBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  demandDot: { width: 6, height: 6, borderRadius: 3 },
  demandText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  demandSurge: { fontSize: 11, fontWeight: '800', marginLeft: 2 },
  slotEarnings: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  slotEarningsLabel: { fontSize: 11, color: colors.textLight },
  spotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  spotsText: { fontSize: 11, color: colors.textLight },
  slotRight: {},
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.teal, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
  },
  bookBtnText: { fontSize: 14, fontWeight: '700', color: colors.textWhite },
  dropBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.error + '10', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: colors.error + '25',
  },
  dropBtnText: { fontSize: 13, fontWeight: '600', color: colors.error },
  tipsCard: { marginHorizontal: 10, marginTop: 8, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  tipsTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, color: colors.textSecondary },
  tierCard: {
    marginHorizontal: 10, marginTop: 10, backgroundColor: colors.white,
    borderRadius: 16, padding: 14, gap: 6,
  },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  tierText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  warningText: { fontSize: 12, color: colors.textSecondary },
  zoneSelector: { paddingHorizontal: 10, paddingTop: 10, gap: 8 },
  zoneTab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderLight,
  },
  zoneTabActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  zoneTabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  zoneTabTextActive: { color: colors.textWhite },
  dayTabDisabled: { opacity: 0.5 },
  emptyCard: {
    alignItems: 'center', justifyContent: 'center', padding: 40,
    backgroundColor: colors.white, borderRadius: 16, gap: 8,
  },
  emptyText: { fontSize: 14, color: colors.textLight },
});
