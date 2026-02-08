import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function CallScreen({ navigation, route }: any) {
  const recipientName = route?.params?.recipientName || 'Unknown';
  const recipientAvatar = route?.params?.recipientAvatar || 'https://i.pravatar.cc/150?img=1';
  const recipientRole = route?.params?.recipientRole || 'merchant';
  const callType = route?.params?.callType || 'voice';
  const orderId = route?.params?.orderId || '';

  const [callState, setCallState] = useState<'connecting' | 'ringing' | 'active' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Simulate connection flow
    const t1 = setTimeout(() => setCallState('ringing'), 1500);
    const t2 = setTimeout(() => {
      setCallState('active');
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (callState === 'ringing') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [callState]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => navigation.goBack(), 1000);
  };

  const getRoleLabel = () => {
    switch (recipientRole) {
      case 'merchant': return 'Restaurant';
      case 'courier': return 'Delivery Driver';
      case 'customer': return 'Customer';
      default: return '';
    }
  };

  const getStatusText = () => {
    switch (callState) {
      case 'connecting': return 'Connecting...';
      case 'ringing': return 'Ringing...';
      case 'active': return formatDuration(duration);
      case 'ended': return 'Call Ended';
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.bgTop} />

      {/* Call Type Badge */}
      <View style={styles.callTypeBadge}>
        <Ionicons name={callType === 'video' ? 'videocam' : 'call'} size={14} color={colors.textWhite} />
        <Text style={styles.callTypeText}>{callType === 'video' ? 'Video' : 'Voice'} Call</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.avatarBorder}>
            <Image source={{ uri: recipientAvatar }} style={styles.avatar} />
          </View>
        </Animated.View>
      </View>

      {/* Info */}
      <Text style={styles.recipientName}>{recipientName}</Text>
      <Text style={styles.roleLabel}>{getRoleLabel()}</Text>
      {orderId ? <Text style={styles.orderLabel}>Order {orderId}</Text> : null}
      <Text style={styles.statusText}>{getStatusText()}</Text>

      {/* Call Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={isMuted ? colors.navy : colors.textWhite} />
          <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          onPress={() => setIsSpeaker(!isSpeaker)}
        >
          <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium'} size={24} color={isSpeaker ? colors.navy : colors.textWhite} />
          <Text style={[styles.controlLabel, isSpeaker && styles.controlLabelActive]}>Speaker</Text>
        </TouchableOpacity>

        {callType === 'video' && (
          <TouchableOpacity style={styles.controlBtn}>
            <Ionicons name="camera-reverse" size={24} color={colors.textWhite} />
            <Text style={styles.controlLabel}>Flip</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlBtn} onPress={() => {
          navigation.navigate('Chat', {
            orderId,
            recipientName,
            recipientAvatar,
            recipientRole,
          });
        }}>
          <Ionicons name="chatbubble" size={24} color={colors.textWhite} />
          <Text style={styles.controlLabel}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* End Call Button */}
      <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
        <Ionicons name="call" size={28} color={colors.textWhite} style={{ transform: [{ rotate: '135deg' }] }} />
      </TouchableOpacity>

      {/* Bottom safe area */}
      <View style={{ height: Platform.OS === 'ios' ? 34 : 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  callTypeBadge: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  callTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textWhite,
  },
  avatarSection: {
    marginBottom: 20,
  },
  pulseRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  recipientName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 14,
    color: colors.tealLight,
    fontWeight: '600',
  },
  orderLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  statusText: {
    fontSize: 16,
    color: colors.textWhite,
    marginTop: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 50,
    gap: 24,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 6,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  controlBtnActive: {
    backgroundColor: colors.textWhite,
  },
  controlLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    position: 'absolute',
    bottom: -18,
  },
  controlLabelActive: {
    color: colors.navy,
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
