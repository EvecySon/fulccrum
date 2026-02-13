import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
  const trackWidth = useRef(SCREEN_WIDTH - 80);
  const maxSlide = trackWidth.current - BUTTON_SIZE - TRACK_PADDING * 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gs) => !disabled && Math.abs(gs.dx) > 5,
      onPanResponderMove: (_, gs) => {
        const x = Math.max(0, Math.min(gs.dx, maxSlide));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, gs) => {
        const pct = gs.dx / maxSlide;
        if (pct >= SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: maxSlide,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start(() => {
            onConfirm();
            // Reset after a short delay
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
    })
  ).current;

  const opacity = translateX.interpolate({
    inputRange: [0, maxSlide * 0.5, maxSlide],
    outputRange: [1, 0.3, 0],
  });

  const checkOpacity = translateX.interpolate({
    inputRange: [maxSlide * 0.8, maxSlide],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, { backgroundColor: color + '15', borderColor: color + '30' }, disabled && { opacity: 0.5 }]}
      onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
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
