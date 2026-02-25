import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface ReliabilityIndicatorProps {
  reliability: 'high' | 'medium' | 'low';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ReliabilityIndicator: React.FC<ReliabilityIndicatorProps> = ({
  reliability,
  showLabel = true,
  size = 'medium',
}) => {
  const getConfig = () => {
    switch (reliability) {
      case 'high':
        return {
          color: colors.success,
          icon: 'checkmark-circle' as const,
          label: 'Highly Reliable',
          dots: 3,
        };
      case 'medium':
        return {
          color: colors.warning,
          icon: 'alert-circle' as const,
          label: 'Moderately Reliable',
          dots: 2,
        };
      case 'low':
        return {
          color: colors.error,
          icon: 'warning' as const,
          label: 'Low Reliability',
          dots: 1,
        };
    }
  };

  const config = getConfig();
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  const dotSize = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
  const fontSize = size === 'small' ? 11 : size === 'medium' ? 13 : 15;

  return (
    <View style={styles.container}>
      <Ionicons name={config.icon} size={iconSize} color={config.color} />
      
      <View style={styles.dotsContainer}>
        {[...Array(3)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                backgroundColor: index < config.dots ? config.color : colors.gray,
              },
            ]}
          />
        ))}
      </View>
      
      {showLabel && (
        <Text style={[styles.label, { fontSize, color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    borderRadius: 999,
  },
  label: {
    fontWeight: '600',
    marginLeft: 2,
  },
});
