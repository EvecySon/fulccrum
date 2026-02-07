import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Web fallback for react-native-maps (native-only module)
function MapViewWeb({ style, children, ...props }: any) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="map-outline" size={40} color={colors.textLight} />
      <Text style={styles.text}>Map Preview</Text>
      <Text style={styles.subtext}>Maps available on mobile devices</Text>
    </View>
  );
}

export function Marker(_props: any) {
  return null;
}

export const PROVIDER_GOOGLE = 'google';

export default MapViewWeb;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  subtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
});
