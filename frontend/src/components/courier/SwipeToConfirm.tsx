import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const SWIPE_THRESHOLD = 0.65;
const BUTTON_SIZE = 56;
const TRACK_PADDING = 4;

interface Props {
  label: string;
  icon?: string;
  color?: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export default function SwipeToConfirm({ label, icon = 'checkmark', color = colors.teal, onConfirm, disabled }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const maxSlideRef = useRef(200);
  const [ready, setReady] = useState(false);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gs) => !disabled && Math.abs(gs.dx) > 5,
      onPanResponderMove: (_, gs) => {
        const ms = maxSlideRef.current;
        if (ms <= 0) return;
        const x = Math.max(0, Math.min(gs.dx, ms));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, gs) => {
        const ms = maxSlideRef.current;
        if (ms <= 0) return;
        const pct = gs.dx / ms;
        if (pct >= SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: ms,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start(() => {
            onConfirm();
            setTimeout(() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }, 500);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 60,
            friction: 8,
          }).start();
        }
      },
    }),
  [disabled, onConfirm]);

  const handleLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    const ms = w - BUTTON_SIZE - TRACK_PADDING * 2;
    if (ms > 0) {
      maxSlideRef.current = ms;
      setReady(true);
    }
  };

  // Safe interpolation — only use positive maxSlide
  const ms = Math.max(maxSlideRef.current, 1);

  const opacity = translateX.interpolate({
    inputRange: [0, ms * 0.5, ms],
    outputRange: [1, 0.3, 0],
  });

  const checkOpacity = translateX.interpolate({
    inputRange: [ms * 0.8, ms],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, { backgroundColor: color + '15', borderColor: color + '30' }, disabled && { opacity: 0.5 }]}
      onLayout={handleLayout}
    >
      {/* Label */}
      <Animated.View style={[styles.labelContainer, { opacity }]}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        <View style={styles.arrowHints}>
          <Ionicons name="chevron-forward" size={16} color={color + '40'} />
          <Ionicons name="chevron-forward" size={16} color={color + '60'} />
          <Ionicons name="chevron-forward" size={16} color={color + '80'} />
        </View>
      </Animated.View>

      {/* Confirmed check */}
      <Animated.View style={[styles.confirmedContainer, { opacity: checkOpacity }]}>
        <Ionicons name="checkmark-circle" size={22} color={color} />
        <Text style={[styles.confirmedText, { color }]}>Confirmed!</Text>
      </Animated.View>

      {/* Draggable button */}
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: color, transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons name={icon as any} size={24} color={colors.textWhite} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BUTTON_SIZE + TRACK_PADDING * 2,
    borderRadius: (BUTTON_SIZE + TRACK_PADDING * 2) / 2,
    borderWidth: 1.5,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: BUTTON_SIZE + 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  arrowHints: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  confirmedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmedText: {
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: TRACK_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
