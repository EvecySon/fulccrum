import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useI18n, SUPPORTED_LANGUAGES, Language } from '../../i18n/I18nContext';

export default function LanguageSettingsScreen({ navigation }: any) {
  const { language, setLanguage, t } = useI18n();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Language</Text>
        <Text style={styles.sectionDesc}>Choose your preferred language for the app</Text>

        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langRow, isSelected && styles.langRowActive]}
              onPress={() => handleSelect(lang.code)}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <View style={styles.langInfo}>
                <Text style={[styles.langLabel, isSelected && { color: colors.teal, fontWeight: '700' }]}>
                  {lang.label}
                </Text>
                <Text style={styles.langNative}>{lang.nativeLabel}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={styles.infoText}>
            More languages will be added soon. If you'd like to help translate, contact us through the Help & Support section.
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
  langRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  langRowActive: { borderColor: colors.teal + '40', backgroundColor: colors.teal + '05' },
  langFlag: { fontSize: 28 },
  langInfo: { flex: 1 },
  langLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  langNative: { fontSize: 13, color: colors.textLight, marginTop: 1 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.info + '08', borderRadius: 14, padding: 14, marginTop: 16,
    borderWidth: 1, borderColor: colors.info + '20',
  },
  infoText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
