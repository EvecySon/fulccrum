import React, { useState, useRef, useEffect } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';
import { onToast } from '../utils/alert';
import { colors } from '../theme/colors';

export default function GlobalToast() {
  const [message, setMessage] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = onToast((msg) => {
      setMessage(msg);
      opacity.setValue(1);
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        delay: 2000,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => setMessage(''));
    });
    return unsub;
  }, []);

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  text: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
