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
import { menuAPI } from '../../services/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const initialHours = [
  { dayOfWeek: 0, openingTime: '10:00', closingTime: '22:00', isClosed: true },
  { dayOfWeek: 1, openingTime: '08:00', closingTime: '22:00', isClosed: false },
  { dayOfWeek: 2, openingTime: '08:00', closingTime: '22:00', isClosed: false },
  { dayOfWeek: 3, openingTime: '08:00', closingTime: '22:00', isClosed: false },
  { dayOfWeek: 4, openingTime: '08:00', closingTime: '22:00', isClosed: false },
  { dayOfWeek: 5, openingTime: '08:00', closingTime: '23:00', isClosed: false },
  { dayOfWeek: 6, openingTime: '09:00', closingTime: '23:00', isClosed: false },
];

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${h.toString().padStart(2, '0')}:${m}`;
});

export default function BusinessHoursScreen({ navigation }: any) {
  const [hours, setHours] = useState(initialHours);

  useEffect(() => {
    (async () => {
      try {
        const res = await menuAPI.getBusinessHours('me');
        if (res?.length) setHours(res);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'open' | 'close' | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleClosed = (dayOfWeek: number) => {
    setHours(prev => prev.map(h =>
      h.dayOfWeek === dayOfWeek ? { ...h, isClosed: !h.isClosed } : h
    ));
    setHasChanges(true);
  };

  const setTime = (dayOfWeek: number, field: 'open' | 'close', time: string) => {
    setHours(prev => prev.map(h =>
      h.dayOfWeek === dayOfWeek
        ? { ...h, [field === 'open' ? 'openingTime' : 'closingTime']: time }
        : h
    ));
    setEditingDay(null);
    setEditingField(null);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await menuAPI.setBusinessHours(hours);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setHasChanges(false);
  };

  const isOpen = hours.some(h => !h.isClosed);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Hours</Text>
        <TouchableOpacity onPress={handleSave} disabled={!hasChanges}>
          <Text style={[styles.saveText, !hasChanges && { opacity: 0.4 }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: isOpen ? colors.success : colors.error }]} />
          <Text style={styles.statusText}>
            Your restaurant is currently <Text style={{ fontWeight: '700', color: isOpen ? colors.success : colors.error }}>{isOpen ? 'Open' : 'Closed'}</Text>
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => {
            setHours(prev => prev.map(h => ({ ...h, isClosed: false })));
            setHasChanges(true);
          }}>
            <Ionicons name="sunny-outline" size={18} color={colors.teal} />
            <Text style={styles.quickBtnText}>Open All Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => {
            setHours(prev => prev.map(h => h.dayOfWeek === 0 ? { ...h, isClosed: true } : { ...h, isClosed: false }));
            setHasChanges(true);
          }}>
            <Ionicons name="calendar-outline" size={18} color={colors.navy} />
            <Text style={styles.quickBtnText}>Weekdays Only</Text>
          </TouchableOpacity>
        </View>

        {/* Hours List */}
        {hours.map((day) => (
          <View key={day.dayOfWeek} style={[styles.dayCard, day.isClosed && styles.dayCardClosed]}>
            <View style={styles.dayHeader}>
              <View style={styles.dayInfo}>
                <Text style={[styles.dayName, day.isClosed && styles.dayNameClosed]}>
                  {DAYS[day.dayOfWeek]}
                </Text>
                {!day.isClosed && (
                  <Text style={styles.dayHours}>
                    {day.openingTime} — {day.closingTime}
                  </Text>
                )}
                {day.isClosed && (
                  <Text style={styles.closedText}>Closed</Text>
                )}
              </View>
              <Switch
                value={!day.isClosed}
                onValueChange={() => toggleClosed(day.dayOfWeek)}
                trackColor={{ false: colors.border, true: colors.teal + '40' }}
                thumbColor={!day.isClosed ? colors.teal : colors.darkGray}
              />
            </View>

            {!day.isClosed && (
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={[styles.timeBtn, editingDay === day.dayOfWeek && editingField === 'open' && styles.timeBtnActive]}
                  onPress={() => { setEditingDay(day.dayOfWeek); setEditingField('open'); }}
                >
                  <Ionicons name="time-outline" size={16} color={colors.teal} />
                  <View>
                    <Text style={styles.timeLabel}>Opens</Text>
                    <Text style={styles.timeValue}>{day.openingTime}</Text>
                  </View>
                </TouchableOpacity>
                <Ionicons name="arrow-forward" size={16} color={colors.textLight} />
                <TouchableOpacity
                  style={[styles.timeBtn, editingDay === day.dayOfWeek && editingField === 'close' && styles.timeBtnActive]}
                  onPress={() => { setEditingDay(day.dayOfWeek); setEditingField('close'); }}
                >
                  <Ionicons name="moon-outline" size={16} color={colors.navy} />
                  <View>
                    <Text style={styles.timeLabel}>Closes</Text>
                    <Text style={styles.timeValue}>{day.closingTime}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Time Picker */}
            {editingDay === day.dayOfWeek && editingField && (
              <View style={styles.timePicker}>
                <Text style={styles.timePickerTitle}>
                  Select {editingField === 'open' ? 'Opening' : 'Closing'} Time
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeSlots}>
                  {timeSlots.map(time => {
                    const current = editingField === 'open' ? day.openingTime : day.closingTime;
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeSlot, current === time && styles.timeSlotActive]}
                        onPress={() => setTime(day.dayOfWeek, editingField, time)}
                      >
                        <Text style={[styles.timeSlotText, current === time && styles.timeSlotTextActive]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  saveText: { fontSize: 16, fontWeight: '700', color: colors.teal },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, margin: 16, borderRadius: 14, padding: 16 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 15, color: colors.textSecondary },
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.white, paddingVertical: 12, borderRadius: 12 },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  dayCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 16 },
  dayCardClosed: { opacity: 0.6 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayInfo: { flex: 1 },
  dayName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  dayNameClosed: { color: colors.textLight },
  dayHours: { fontSize: 13, color: colors.teal, marginTop: 2, fontWeight: '600' },
  closedText: { fontSize: 13, color: colors.error, marginTop: 2, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.borderLight },
  timeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.lightGray, borderRadius: 12, padding: 12, borderWidth: 2, borderColor: 'transparent' },
  timeBtnActive: { borderColor: colors.teal },
  timeLabel: { fontSize: 11, color: colors.textLight },
  timeValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  timePicker: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  timePickerTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  timeSlots: { gap: 6, paddingBottom: 4 },
  timeSlot: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.lightGray },
  timeSlotActive: { backgroundColor: colors.teal },
  timeSlotText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  timeSlotTextActive: { color: colors.textWhite },
});
