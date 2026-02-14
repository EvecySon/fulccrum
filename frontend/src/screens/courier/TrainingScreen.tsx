import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierTrainingAPI } from '../../services/api';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  lessons: number;
  completedLessons: number;
  required: boolean;
  category: 'onboarding' | 'safety' | 'skills' | 'advanced';
}

const mockModules: TrainingModule[] = [
  { id: '1', title: 'Getting Started', description: 'Learn the basics of the Fulccrum courier app', icon: 'rocket', color: colors.teal, duration: '10 min', lessons: 5, completedLessons: 5, required: true, category: 'onboarding' },
  { id: '2', title: 'Accepting & Managing Orders', description: 'How to accept, manage, and complete deliveries', icon: 'bag-check', color: colors.navy, duration: '15 min', lessons: 7, completedLessons: 7, required: true, category: 'onboarding' },
  { id: '3', title: 'Navigation & Routes', description: 'Tips for efficient navigation and route optimization', icon: 'navigate', color: '#3b82f6', duration: '8 min', lessons: 4, completedLessons: 3, required: true, category: 'onboarding' },
  { id: '4', title: 'Food Handling & Safety', description: 'Proper food handling, temperature control, and hygiene', icon: 'restaurant', color: '#f97316', duration: '12 min', lessons: 6, completedLessons: 0, required: true, category: 'safety' },
  { id: '5', title: 'Road Safety', description: 'Safe driving practices and accident prevention', icon: 'shield-checkmark', color: colors.error, duration: '10 min', lessons: 5, completedLessons: 2, required: true, category: 'safety' },
  { id: '6', title: 'Customer Communication', description: 'Best practices for communicating with customers', icon: 'chatbubbles', color: '#8b5cf6', duration: '8 min', lessons: 4, completedLessons: 0, required: false, category: 'skills' },
  { id: '7', title: 'Maximizing Earnings', description: 'Strategies to earn more: surge zones, quests, tips', icon: 'trending-up', color: colors.success, duration: '10 min', lessons: 5, completedLessons: 0, required: false, category: 'skills' },
  { id: '8', title: 'Handling Difficult Situations', description: 'What to do with missing items, wrong orders, or disputes', icon: 'help-buoy', color: colors.warning, duration: '12 min', lessons: 6, completedLessons: 0, required: false, category: 'advanced' },
  { id: '9', title: 'Vehicle Maintenance', description: 'Keep your vehicle in top condition for deliveries', icon: 'build', color: '#6366f1', duration: '8 min', lessons: 4, completedLessons: 0, required: false, category: 'advanced' },
];

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'onboarding', label: 'Getting Started', icon: 'rocket' },
  { key: 'safety', label: 'Safety', icon: 'shield-checkmark' },
  { key: 'skills', label: 'Skills', icon: 'bulb' },
  { key: 'advanced', label: 'Advanced', icon: 'school' },
];

export default function TrainingScreen({ navigation }: any) {
  const [modules, setModules] = useState(mockModules);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await courierTrainingAPI.getModules();
        const data = res?.data ?? res;
        if (Array.isArray(data) && data.length) setModules(data);
      } catch {}
    })();
  }, []);

  const filtered = filter === 'all' ? modules : modules.filter(m => m.category === filter);
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.completedLessons, 0);
  const overallPct = Math.round((completedLessons / totalLessons) * 100);
  const requiredComplete = modules.filter(m => m.required && m.completedLessons >= m.lessons).length;
  const requiredTotal = modules.filter(m => m.required).length;

  const handleStartModule = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    if (mod.completedLessons >= mod.lessons) {
      Alert.alert('Already Completed', 'You\'ve already completed this module. Would you like to review it?', [
        { text: 'Cancel' },
        { text: 'Review', onPress: () => {} },
      ]);
      return;
    }
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, completedLessons: Math.min(m.completedLessons + 1, m.lessons) } : m
    ));
    courierTrainingAPI.completeLesson(moduleId).catch(() => {});
    Alert.alert('Lesson Complete!', `You completed lesson ${mod.completedLessons + 1} of ${mod.lessons} in "${mod.title}".`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Training Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPct}>{overallPct}%</Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Your Training Progress</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${overallPct}%` }]} />
            </View>
            <Text style={styles.progressMeta}>
              {completedLessons}/{totalLessons} lessons · {requiredComplete}/{requiredTotal} required modules
            </Text>
            {requiredComplete < requiredTotal && (
              <View style={styles.requiredBanner}>
                <Ionicons name="alert-circle" size={14} color={colors.warning} />
                <Text style={styles.requiredText}>
                  Complete all required modules to unlock full features
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.filterChip, filter === cat.key && styles.filterChipActive]}
              onPress={() => setFilter(cat.key)}
            >
              <Ionicons name={cat.icon as any} size={16} color={filter === cat.key ? colors.textWhite : colors.textSecondary} />
              <Text style={[styles.filterText, filter === cat.key && styles.filterTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Module Cards */}
        <View style={styles.modulesList}>
          {filtered.map((mod) => {
            const pct = Math.round((mod.completedLessons / mod.lessons) * 100);
            const isComplete = mod.completedLessons >= mod.lessons;
            return (
              <TouchableOpacity
                key={mod.id}
                style={[styles.moduleCard, isComplete && styles.moduleCardComplete]}
                onPress={() => handleStartModule(mod.id)}
              >
                <View style={styles.moduleHeader}>
                  <View style={[styles.moduleIcon, { backgroundColor: mod.color + '15' }]}>
                    <Ionicons name={mod.icon as any} size={24} color={mod.color} />
                  </View>
                  <View style={styles.moduleInfo}>
                    <View style={styles.moduleTitleRow}>
                      <Text style={styles.moduleTitle}>{mod.title}</Text>
                      {mod.required && (
                        <View style={styles.requiredBadge}>
                          <Text style={styles.requiredBadgeText}>REQUIRED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.moduleDesc}>{mod.description}</Text>
                  </View>
                </View>

                <View style={styles.moduleMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textLight} />
                    <Text style={styles.metaText}>{mod.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="book-outline" size={14} color={colors.textLight} />
                    <Text style={styles.metaText}>{mod.lessons} lessons</Text>
                  </View>
                  {isComplete ? (
                    <View style={styles.completeBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      <Text style={styles.completeText}>Complete</Text>
                    </View>
                  ) : (
                    <Text style={[styles.pctText, { color: mod.color }]}>{pct}%</Text>
                  )}
                </View>

                {/* Progress Bar */}
                <View style={styles.moduleProgressBar}>
                  <View style={[styles.moduleProgressFill, { width: `${pct}%`, backgroundColor: isComplete ? colors.success : mod.color }]} />
                </View>

                {/* Action */}
                <View style={styles.moduleAction}>
                  <Text style={[styles.actionText, { color: mod.color }]}>
                    {isComplete ? 'Review Module' : mod.completedLessons > 0 ? 'Continue' : 'Start Module'}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={mod.color} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          {[
            { icon: 'bulb', tip: 'Complete required modules first to unlock all app features', color: colors.warning },
            { icon: 'trophy', tip: 'Finishing training modules earns you bonus rewards', color: colors.teal },
            { icon: 'refresh', tip: 'Review modules anytime to refresh your knowledge', color: colors.navy },
          ].map((item, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
              <Text style={styles.tipText}>{item.tip}</Text>
            </View>
          ))}
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
  progressCard: {
    flexDirection: 'row', gap: 16, backgroundColor: colors.white,
    marginHorizontal: 10, marginTop: 10, borderRadius: 20, padding: 20,
  },
  progressCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.teal + '12',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.teal,
  },
  progressPct: { fontSize: 22, fontWeight: '900', color: colors.teal },
  progressLabel: { fontSize: 10, color: colors.teal, fontWeight: '600' },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: colors.lightGray, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 4 },
  progressMeta: { fontSize: 12, color: colors.textLight, marginTop: 6 },
  requiredBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
    backgroundColor: colors.warning + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  requiredText: { fontSize: 11, color: colors.warning, flex: 1 },
  filterRow: { paddingHorizontal: 10, paddingVertical: 12, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white,
  },
  filterChipActive: { backgroundColor: colors.teal },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  modulesList: { paddingHorizontal: 10 },
  moduleCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  moduleCardComplete: { borderWidth: 1, borderColor: colors.success + '30' },
  moduleHeader: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  moduleIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  moduleInfo: { flex: 1 },
  moduleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moduleTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  requiredBadge: { backgroundColor: colors.error + '12', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  requiredBadgeText: { fontSize: 9, fontWeight: '800', color: colors.error, letterSpacing: 0.5 },
  moduleDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  moduleMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textLight },
  completeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  completeText: { fontSize: 12, fontWeight: '600', color: colors.success },
  pctText: { fontSize: 14, fontWeight: '800', marginLeft: 'auto' },
  moduleProgressBar: { height: 6, backgroundColor: colors.lightGray, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  moduleProgressFill: { height: '100%', borderRadius: 3 },
  moduleAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  actionText: { fontSize: 14, fontWeight: '700' },
  tipsCard: { marginHorizontal: 10, marginTop: 8, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  tipsTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  tipText: { flex: 1, fontSize: 13, color: colors.textSecondary },
});
