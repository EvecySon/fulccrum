import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  icon?: string;
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  fullScreen = false,
  icon = 'alert-circle-outline',
}: ErrorStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <Ionicons name={icon as any} size={48} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Ionicons name="refresh" size={18} color={colors.textWhite} />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  fullScreen: { flex: 1, backgroundColor: colors.white },
  message: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22, paddingHorizontal: 20 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.teal, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  retryText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
});
