import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export default function LoadingState({ message = 'Loading...', size = 'large', fullScreen = false }: LoadingStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.teal} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  fullScreen: { flex: 1, backgroundColor: colors.white },
  message: { fontSize: 14, color: colors.textLight, marginTop: 12 },
});
