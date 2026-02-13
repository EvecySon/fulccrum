import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { showAlert } from '../utils/alert';

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'misleading', label: 'Misleading or false information' },
  { id: 'spam', label: 'Spam or advertising' },
  { id: 'offensive', label: 'Offensive or hateful' },
  { id: 'health_safety', label: 'Health & safety concern' },
  { id: 'fraud', label: 'Fraud or scam' },
  { id: 'other', label: 'Other' },
];

interface ReportContentModalProps {
  visible: boolean;
  onClose: () => void;
  contentType: 'menu_item' | 'review' | 'business_profile';
  resourceId: string;
  resourceName?: string;
}

export default function ReportContentModal({ visible, onClose, contentType, resourceId, resourceName }: ReportContentModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) {
      showAlert('Required', 'Please select a reason for reporting.');
      return;
    }
    // In production this would call: reportAPI.reportContent({ type: contentType, resourceId, reason: selectedReason, details })
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason('');
      setDetails('');
      onClose();
      showAlert('Report Submitted', 'Thank you for your report. Our moderation team will review this content shortly.');
    }, 800);
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Report Content</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {resourceName && (
            <View style={styles.targetInfo}>
              <Ionicons name="flag-outline" size={16} color={colors.warning} />
              <Text style={styles.targetText} numberOfLines={1}>Reporting: {resourceName}</Text>
            </View>
          )}

          <Text style={styles.subtitle}>Why are you reporting this?</Text>

          {REPORT_REASONS.map(reason => (
            <TouchableOpacity
              key={reason.id}
              style={[styles.reasonRow, selectedReason === reason.id && styles.reasonRowActive]}
              onPress={() => setSelectedReason(reason.id)}
            >
              <View style={[styles.radio, selectedReason === reason.id && styles.radioActive]}>
                {selectedReason === reason.id && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.reasonText, selectedReason === reason.id && styles.reasonTextActive]}>{reason.label}</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.detailsInput}
            placeholder="Additional details (optional)..."
            placeholderTextColor={colors.textLight}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.submitBtn, !selectedReason && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!selectedReason || submitted}
          >
            {submitted ? (
              <Text style={styles.submitText}>Submitting...</Text>
            ) : (
              <>
                <Ionicons name="flag" size={16} color={colors.white} />
                <Text style={styles.submitText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            False reports may result in account restrictions. Reports are reviewed by our moderation team within 24 hours.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  targetInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warning + '10', padding: 10, borderRadius: 10, marginBottom: 12 },
  targetText: { fontSize: 13, color: colors.warning, fontWeight: '600', flex: 1 },
  subtitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 12 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  reasonRowActive: { backgroundColor: colors.error + '08' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: colors.error },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  reasonText: { fontSize: 14, color: colors.textPrimary },
  reasonTextActive: { fontWeight: '600', color: colors.error },
  detailsInput: { backgroundColor: colors.lightGray, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, textAlignVertical: 'top', minHeight: 60, marginTop: 8 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.error, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 15, fontWeight: '600', color: colors.white },
  disclaimer: { fontSize: 11, color: colors.textLight, textAlign: 'center', marginTop: 12, lineHeight: 16 },
});
