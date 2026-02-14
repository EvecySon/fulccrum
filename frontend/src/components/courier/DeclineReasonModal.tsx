import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const DECLINE_REASONS = [
  { key: 'too_far', label: 'Too far away', icon: 'navigate-outline' },
  { key: 'low_pay', label: 'Pay is too low', icon: 'cash-outline' },
  { key: 'ending_shift', label: 'Ending my shift', icon: 'time-outline' },
  { key: 'wrong_direction', label: 'Wrong direction', icon: 'compass-outline' },
  { key: 'restaurant_issue', label: 'Issue with restaurant', icon: 'storefront-outline' },
  { key: 'vehicle_issue', label: 'Vehicle problem', icon: 'car-outline' },
  { key: 'personal', label: 'Personal reason', icon: 'person-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

interface Props {
  visible: boolean;
  orderId: string;
  onSubmit: (orderId: string, reason: string, details?: string) => void;
  onClose: () => void;
}

export default function DeclineReasonModal({ visible, orderId, onSubmit, onClose }: Props) {
  const [selected, setSelected] = useState('');
  const [details, setDetails] = useState('');

  const canSubmit = selected !== '' && (selected !== 'other' || details.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(orderId, selected, details.trim() || undefined);
    setSelected('');
    setDetails('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Why are you declining?</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Your feedback helps us improve order matching</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.reasonsList}>
            {DECLINE_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.key}
                style={[styles.reasonRow, selected === reason.key && styles.reasonRowActive]}
                onPress={() => setSelected(reason.key)}
              >
                <View style={[styles.reasonIcon, selected === reason.key && { backgroundColor: colors.teal + '15' }]}>
                  <Ionicons
                    name={reason.icon as any}
                    size={20}
                    color={selected === reason.key ? colors.teal : colors.textSecondary}
                  />
                </View>
                <Text style={[styles.reasonLabel, selected === reason.key && { color: colors.teal, fontWeight: '700' }]}>
                  {reason.label}
                </Text>
                {selected === reason.key && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.teal} />
                )}
              </TouchableOpacity>
            ))}

            {selected === 'other' && (
              <TextInput
                style={styles.detailsInput}
                placeholder="Tell us more..."
                placeholderTextColor={colors.textLight}
                value={details}
                onChangeText={setDetails}
                multiline
              />
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitText}>Submit & Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textLight, marginBottom: 16 },
  reasonsList: { maxHeight: 380 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  reasonRowActive: {
    backgroundColor: colors.teal + '08',
    borderWidth: 1,
    borderColor: colors.teal + '25',
  },
  reasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  detailsInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.error,
  },
  submitText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
});
