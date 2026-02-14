import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonBox({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <View style={skeletonStyles.restaurantCard}>
      <SkeletonBox width="100%" height={160} borderRadius={0} />
      <View style={skeletonStyles.cardBody}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <SkeletonBox width={180} height={18} />
          <SkeletonBox width={50} height={24} borderRadius={8} />
        </View>
        <SkeletonBox width={120} height={14} style={{ marginBottom: 10 }} />
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <SkeletonBox width={70} height={14} />
          <SkeletonBox width={60} height={14} />
          <SkeletonBox width={50} height={14} />
        </View>
      </View>
    </View>
  );
}

export function MenuItemSkeleton() {
  return (
    <View style={skeletonStyles.menuItem}>
      <View style={{ flex: 1 }}>
        <SkeletonBox width={160} height={16} style={{ marginBottom: 6 }} />
        <SkeletonBox width="90%" height={12} style={{ marginBottom: 4 }} />
        <SkeletonBox width="70%" height={12} style={{ marginBottom: 10 }} />
        <SkeletonBox width={80} height={16} />
      </View>
      <SkeletonBox width={100} height={100} borderRadius={12} />
    </View>
  );
}

export function OrderCardSkeleton() {
  return (
    <View style={skeletonStyles.orderCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <View>
          <SkeletonBox width={150} height={16} style={{ marginBottom: 4 }} />
          <SkeletonBox width={80} height={12} />
        </View>
        <SkeletonBox width={80} height={28} borderRadius={8} />
      </View>
      <SkeletonBox width="80%" height={12} style={{ marginBottom: 4 }} />
      <SkeletonBox width="60%" height={12} style={{ marginBottom: 12 }} />
      <View style={{ borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 12 }}>
        <SkeletonBox width={100} height={18} />
      </View>
    </View>
  );
}

export function HomeSkeleton() {
  return (
    <View style={{ padding: 20, gap: 16 }}>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={{ alignItems: 'center', gap: 8 }}>
            <SkeletonBox width={56} height={56} borderRadius={16} />
            <SkeletonBox width={48} height={10} />
          </View>
        ))}
      </View>
      <SkeletonBox width={160} height={20} style={{ marginTop: 8 }} />
      <RestaurantCardSkeleton />
      <RestaurantCardSkeleton />
    </View>
  );
}

export default SkeletonBox;

const skeletonStyles = StyleSheet.create({
  restaurantCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: {
    padding: 14,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
});
