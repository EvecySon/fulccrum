import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Check back later for updates.',
  icon = 'folder-open-outline',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={48} color={colors.textLight} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 12 },
  message: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 6, lineHeight: 20, paddingHorizontal: 20 },
  actionBtn: { backgroundColor: colors.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  actionText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
});
