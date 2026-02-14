import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
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
}

interface DaySchedule {
  date: string;
  dayLabel: string;
  dayShort: string;
  isToday: boolean;
  slots: TimeSlot[];
}

const generateMockSchedule = (): DaySchedule[] => {
  const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    date: `2026-02-${13 + i}`,
    dayLabel: day,
    dayShort: daysShort[i],
    isToday: i === 0,
    slots: [
      { id: `${i}-1`, startTime: '8:00 AM', endTime: '12:00 PM', demand: 'medium', spotsLeft: 8, totalSpots: 15, estimatedEarnings: 12000, surgeMultiplier: 1.0, booked: i === 0 },
      { id: `${i}-2`, startTime: '12:00 PM', endTime: '3:00 PM', demand: 'peak', spotsLeft: 2, totalSpots: 15, estimatedEarnings: 18000, surgeMultiplier: 1.5, booked: i === 0 },
      { id: `${i}-3`, startTime: '3:00 PM', endTime: '6:00 PM', demand: 'low', spotsLeft: 12, totalSpots: 15, estimatedEarnings: 9000, surgeMultiplier: 1.0, booked: false },
      { id: `${i}-4`, startTime: '6:00 PM', endTime: '9:00 PM', demand: 'peak', spotsLeft: 1, totalSpots: 15, estimatedEarnings: 22000, surgeMultiplier: 1.8, booked: false },
      { id: `${i}-5`, startTime: '9:00 PM', endTime: '12:00 AM', demand: 'high', spotsLeft: 5, totalSpots: 15, estimatedEarnings: 15000, surgeMultiplier: 1.3, booked: false },
    ],
  }));
};

const mockWeeklyStats = {
  scheduledHours: 24,
  estimatedEarnings: 85000,
  bookedSlots: 6,
  maxSlots: 35,
};

export default function SchedulingScreen({ navigation }: any) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(generateMockSchedule());
  const [selectedDay, setSelectedDay] = useState(0);
  const [weekStats, setWeekStats] = useState(mockWeeklyStats);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadSchedule(); }, []);

  const loadSchedule = async () => {
    try {
      const weekStart = new Date().toISOString().split('T')[0];
      const res = await courierScheduleAPI.getSchedule(weekStart);
      const data = res?.data ?? res;
      if (Array.isArray(data) && data.length) setSchedule(data);
      else setSchedule(generateMockSchedule());
    } catch {
      setSchedule(generateMockSchedule());
    }
    setRefreshing(false);
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

  const handleBookSlot = (slotId: string) => {
    setSchedule(prev => prev.map(day => ({
      ...day,
      slots: day.slots.map(slot =>
        slot.id === slotId ? { ...slot, booked: !slot.booked, spotsLeft: slot.booked ? slot.spotsLeft + 1 : slot.spotsLeft - 1 } : slot
      ),
    })));
  };

  const handleDropSlot = (slotId: string) => {
    Alert.alert('Drop Shift', 'Are you sure you want to drop this shift?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Drop Shift', style: 'destructive', onPress: () => handleBookSlot(slotId) },
    ]);
  };

  const currentDay = schedule[selectedDay];
  const bookedCount = schedule.reduce((acc, day) => acc + day.slots.filter(s => s.booked).length, 0);

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
        {/* Weekly Overview */}
        <View style={styles.weekOverview}>
          <View style={styles.weekStat}>
            <Ionicons name="time-outline" size={18} color={colors.teal} />
            <Text style={styles.weekStatValue}>{weekStats.scheduledHours}h</Text>
            <Text style={styles.weekStatLabel}>Scheduled</Text>
          </View>
          <View style={styles.weekStatDivider} />
          <View style={styles.weekStat}>
            <Ionicons name="cash-outline" size={18} color={colors.success} />
            <Text style={styles.weekStatValue}>₦{(weekStats.estimatedEarnings / 1000).toFixed(0)}k</Text>
            <Text style={styles.weekStatLabel}>Est. Earnings</Text>
          </View>
          <View style={styles.weekStatDivider} />
          <View style={styles.weekStat}>
            <Ionicons name="calendar-outline" size={18} color={colors.navy} />
            <Text style={styles.weekStatValue}>{weekStats.bookedSlots}/{weekStats.maxSlots}</Text>
            <Text style={styles.weekStatLabel}>Slots</Text>
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>
          {schedule.map((day, index) => {
            const hasBookings = day.slots.some(s => s.booked);
            return (
              <TouchableOpacity
                key={day.date}
                style={[styles.dayTab, selectedDay === index && styles.dayTabActive]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={[styles.dayTabShort, selectedDay === index && styles.dayTabShortActive]}>
                  {day.dayShort}
                </Text>
                <Text style={[styles.dayTabLabel, selectedDay === index && styles.dayTabLabelActive]}>
                  {day.dayLabel}
                </Text>
                {hasBookings && <View style={[styles.dayDot, selectedDay === index && { backgroundColor: colors.textWhite }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slots */}
        <View style={styles.slotsSection}>
          <Text style={styles.slotsTitle}>
            {currentDay?.dayLabel || 'Today'} — Available Shifts
          </Text>

          {currentDay?.slots.map((slot) => {
            const demandColor = getDemandColor(slot.demand);
            const isFull = slot.spotsLeft <= 0 && !slot.booked;
            return (
              <View key={slot.id} style={[styles.slotCard, slot.booked && styles.slotCardBooked, isFull && { opacity: 0.5 }]}>
                <View style={styles.slotLeft}>
                  {/* Time */}
                  <View style={styles.slotTime}>
                    <Text style={styles.slotTimeStart}>{slot.startTime}</Text>
                    <View style={styles.slotTimeLine} />
                    <Text style={styles.slotTimeEnd}>{slot.endTime}</Text>
                  </View>
                </View>

                <View style={styles.slotCenter}>
                  {/* Demand badge */}
                  <View style={[styles.demandBadge, { backgroundColor: demandColor + '12' }]}>
                    <View style={[styles.demandDot, { backgroundColor: demandColor }]} />
                    <Text style={[styles.demandText, { color: demandColor }]}>
                      {slot.demand.toUpperCase()}
                    </Text>
                    {slot.surgeMultiplier > 1 && (
                      <Text style={[styles.demandSurge, { color: demandColor }]}>{slot.surgeMultiplier}x</Text>
                    )}
                  </View>

                  {/* Earnings */}
                  <Text style={styles.slotEarnings}>₦{slot.estimatedEarnings.toLocaleString()}</Text>
                  <Text style={styles.slotEarningsLabel}>estimated</Text>

                  {/* Spots */}
                  <View style={styles.spotsRow}>
                    <Ionicons name="people-outline" size={12} color={slot.spotsLeft <= 3 ? colors.error : colors.textLight} />
                    <Text style={[styles.spotsText, slot.spotsLeft <= 3 && { color: colors.error }]}>
                      {isFull ? 'Full' : `${slot.spotsLeft} spots left`}
                    </Text>
                  </View>
                </View>

                <View style={styles.slotRight}>
                  {slot.booked ? (
                    <TouchableOpacity style={styles.dropBtn} onPress={() => handleDropSlot(slot.id)}>
                      <Ionicons name="close-circle" size={16} color={colors.error} />
                      <Text style={styles.dropBtnText}>Drop</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.bookBtn, isFull && { backgroundColor: colors.textLight }]}
                      onPress={() => !isFull && handleBookSlot(slot.id)}
                      disabled={isFull}
                    >
                      <Ionicons name="add" size={18} color={colors.textWhite} />
                      <Text style={styles.bookBtnText}>Book</Text>
                    </TouchableOpacity>
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
            <Text style={styles.tipText}>Consistent scheduling improves your priority score</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.tipText}>Drop shifts at least 2 hours before to avoid penalties</Text>
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
});
