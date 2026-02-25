import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface StoreStatusBadgeProps {
  status: 'open_active' | 'open_busy' | 'open_unverified' | 'closed';
  reliability?: 'high' | 'medium' | 'low';
  message?: string;
  showPhone?: boolean;
  onCallPress?: () => void;
  compact?: boolean;
}

export const StoreStatusBadge: React.FC<StoreStatusBadgeProps> = ({
  status,
  reliability,
  message,
  showPhone,
  onCallPress,
  compact = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'open_active':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.success,
          bgColor: '#E8F5E9',
          label: 'Open',
          iconColor: colors.success,
        };
      case 'open_busy':
        return {
          icon: 'time' as const,
          color: colors.warning,
          bgColor: '#FFF3E0',
          label: 'Open (Busy)',
          iconColor: colors.warning,
        };
      case 'open_unverified':
        return {
          icon: 'alert-circle' as const,
          color: '#FF9800',
          bgColor: '#FFF3E0',
          label: 'Open (Unverified)',
          iconColor: '#FF9800',
        };
      case 'closed':
        return {
          icon: 'close-circle' as const,
          color: colors.error,
          bgColor: '#FFEBEE',
          label: 'Closed',
          iconColor: colors.error,
        };
      default:
        return {
          icon: 'help-circle' as const,
          color: colors.textLight,
          bgColor: colors.lightGray,
          label: 'Unknown',
          iconColor: colors.textLight,
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={14} color={config.iconColor} />
        <Text style={[styles.compactLabel, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={20} color={config.iconColor} />
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        {reliability && (
          <View style={styles.reliabilityContainer}>
            <View style={[styles.reliabilityDot, { backgroundColor: config.color }]} />
            <Text style={[styles.reliabilityText, { color: config.color }]}>
              {reliability.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
          {showPhone && onCallPress && (
            <TouchableOpacity style={styles.callButton} onPress={onCallPress}>
              <Ionicons name="call" size={16} color={colors.teal} />
              <Text style={styles.callText}>Call Store</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  reliabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  reliabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  reliabilityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  messageContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
  },
  messageText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.tealLight,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  callText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.teal,
    marginLeft: 6,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
