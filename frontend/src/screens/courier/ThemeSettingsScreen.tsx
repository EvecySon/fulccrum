import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';

type ThemeOption = { key: 'light' | 'dark' | 'system'; label: string; icon: string; desc: string };

const THEME_OPTIONS: ThemeOption[] = [
  { key: 'system', label: 'System Default', icon: 'phone-portrait-outline', desc: 'Follow your device settings' },
  { key: 'light', label: 'Light Mode', icon: 'sunny-outline', desc: 'Always use light theme' },
  { key: 'dark', label: 'Dark Mode', icon: 'moon-outline', desc: 'Always use dark theme' },
];

export default function ThemeSettingsScreen({ navigation }: any) {
  const { themeMode, setThemeMode, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <Text style={styles.sectionDesc}>Choose how the app looks</Text>

        {THEME_OPTIONS.map((option) => {
          const isSelected = themeMode === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.optionRow, isSelected && styles.optionRowActive]}
              onPress={() => setThemeMode(option.key)}
            >
              <View style={[styles.optionIcon, isSelected && { backgroundColor: colors.teal + '15' }]}>
                <Ionicons
                  name={option.icon as any}
                  size={22}
                  color={isSelected ? colors.teal : colors.textSecondary}
                />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, isSelected && { color: colors.teal, fontWeight: '700' }]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewRow}>
            <View style={[styles.previewBox, { backgroundColor: '#ffffff' }]}>
              <Ionicons name="sunny" size={20} color="#f59e0b" />
              <Text style={[styles.previewLabel, { color: '#0f172a' }]}>Light</Text>
            </View>
            <View style={[styles.previewBox, { backgroundColor: '#1e293b' }]}>
              <Ionicons name="moon" size={20} color="#93c5fd" />
              <Text style={[styles.previewLabel, { color: '#f1f5f9' }]}>Dark</Text>
            </View>
          </View>
          <Text style={styles.previewNote}>
            Currently using: {isDark ? 'Dark' : 'Light'} mode
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={styles.infoText}>
            Dark mode reduces eye strain in low-light conditions and can help save battery on OLED screens.
            The "System Default" option will automatically switch based on your device settings.
          </Text>
        </View>
      </View>
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
  content: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: colors.textLight, marginBottom: 16 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  optionRowActive: { borderColor: colors.teal + '40', backgroundColor: colors.teal + '05' },
  optionIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  optionDesc: { fontSize: 13, color: colors.textLight, marginTop: 1 },
  previewCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginTop: 16,
  },
  previewTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  previewRow: { flexDirection: 'row', gap: 12 },
  previewBox: {
    flex: 1, borderRadius: 12, padding: 20, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  previewLabel: { fontSize: 13, fontWeight: '600' },
  previewNote: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 10 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.info + '08', borderRadius: 14, padding: 14, marginTop: 16,
    borderWidth: 1, borderColor: colors.info + '20',
  },
  infoText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
