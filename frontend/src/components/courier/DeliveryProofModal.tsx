import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { pickImage } from '../../services/uploadService';
import { ordersAPI } from '../../services/api';

interface Props {
  visible: boolean;
  orderId: string;
  customerName: string;
  deliveryType: 'hand_to_customer' | 'leave_at_door' | 'meet_outside';
  onComplete: () => void;
  onClose: () => void;
}

export default function DeliveryProofModal({ visible, orderId, customerName, deliveryType, onComplete, onClose }: Props) {
  const [photoUri, setPhotoUri] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleTakePhoto = async () => {
    const uri = await pickImage();
    if (uri) setPhotoUri(uri);
  };

  const handleSubmit = async () => {
    if (deliveryType === 'leave_at_door' && !photoUri) {
      Alert.alert('Photo Required', 'Please take a photo of the delivery for "Leave at Door" orders.');
      return;
    }
    setUploading(true);
    try {
      await ordersAPI.updateStatus(orderId, 'delivered');
      onComplete();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to complete delivery');
    } finally {
      setUploading(false);
    }
  };

  const deliveryTypeLabels: Record<string, { label: string; icon: string; desc: string }> = {
    hand_to_customer: { label: 'Hand to Customer', icon: 'hand-left', desc: 'Hand the order directly to the customer' },
    leave_at_door: { label: 'Leave at Door', icon: 'home', desc: 'Photo proof required for leave-at-door deliveries' },
    meet_outside: { label: 'Meet Outside', icon: 'walk', desc: 'Customer will meet you outside' },
  };

  const typeInfo = deliveryTypeLabels[deliveryType] || deliveryTypeLabels.hand_to_customer;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Complete Delivery</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Delivery Type */}
          <View style={styles.typeCard}>
            <View style={[styles.typeIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name={typeInfo.icon as any} size={22} color={colors.teal} />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.typeLabel}>{typeInfo.label}</Text>
              <Text style={styles.typeDesc}>{typeInfo.desc}</Text>
            </View>
          </View>

          {/* Customer */}
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitial}>{customerName.charAt(0)}</Text>
            </View>
            <Text style={styles.customerName}>{customerName}</Text>
          </View>

          {/* Photo Section */}
          <Text style={styles.sectionLabel}>
            Delivery Photo {deliveryType === 'leave_at_door' ? '(Required)' : '(Optional)'}
          </Text>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
              <TouchableOpacity style={styles.retakeBtn} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={16} color={colors.textWhite} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoPlaceholder} onPress={handleTakePhoto}>
              <View style={styles.cameraCircle}>
                <Ionicons name="camera" size={32} color={colors.teal} />
              </View>
              <Text style={styles.photoPlaceholderText}>Take a photo of the delivery</Text>
              <Text style={styles.photoPlaceholderHint}>
                {deliveryType === 'leave_at_door'
                  ? 'Required — show where the order was left'
                  : 'Optional — helps resolve disputes'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Notes */}
          <Text style={styles.sectionLabel}>Delivery Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Left with security guard, handed to person at door..."
            placeholderTextColor={colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, uploading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={colors.textWhite} />
                <Text style={styles.submitText}>Confirm Delivery</Text>
              </>
            )}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  closeBtn: { padding: 4 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.teal + '08',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.teal + '20',
  },
  typeIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  typeInfo: { flex: 1 },
  typeLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  typeDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.navy + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInitial: { fontSize: 16, fontWeight: '700', color: colors.navy },
  customerName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoPreview: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  retakeText: { fontSize: 13, fontWeight: '600', color: colors.textWhite },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    paddingVertical: 28,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoPlaceholderText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  photoPlaceholderHint: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  notesInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 20,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
  },
  submitText: { fontSize: 17, fontWeight: '700', color: colors.textWhite },
});
