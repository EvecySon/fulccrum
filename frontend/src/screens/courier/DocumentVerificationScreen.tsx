import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { uploadAPI, usersAPI } from '../../services/api';
import { pickImage } from '../../services/uploadService';

interface DocumentItem {
  key: string;
  label: string;
  description: string;
  icon: string;
  required: boolean;
  uri: string;
}

export default function DocumentVerificationScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [documents, setDocuments] = useState<DocumentItem[]>([
    { key: 'drivers_license', label: "Driver's License", description: 'Valid government-issued license', icon: 'card', required: true, uri: '' },
    { key: 'vehicle_registration', label: 'Vehicle Registration', description: 'Vehicle ownership or registration document', icon: 'car', required: true, uri: '' },
    { key: 'insurance', label: 'Insurance Certificate', description: 'Valid vehicle insurance', icon: 'shield-checkmark', required: true, uri: '' },
    { key: 'profile_photo', label: 'Profile Photo', description: 'Clear photo of your face', icon: 'person', required: true, uri: '' },
    { key: 'nin', label: 'NIN / National ID', description: 'National Identification Number slip or card', icon: 'finger-print', required: false, uri: '' },
  ]);

  const handlePickDocument = async (key: string) => {
    const uri = await pickImage();
    if (uri) {
      setDocuments(prev => prev.map(d => d.key === key ? { ...d, uri } : d));
    }
  };

  const requiredComplete = documents.filter(d => d.required).every(d => d.uri !== '');

  const handleSubmit = async () => {
    if (!requiredComplete) {
      setError('Please upload all required documents');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const uploadedDocs: Record<string, string> = {};

      for (const doc of documents) {
        if (!doc.uri) continue;
        const formData = new FormData();
        formData.append('file', {
          uri: doc.uri,
          name: `${doc.key}.jpg`,
          type: 'image/jpeg',
        } as any);

        const uploadFn = doc.key === 'profile_photo'
          ? uploadAPI.uploadAvatar
          : uploadAPI.uploadDocument;

        const res = await uploadFn(formData);
        uploadedDocs[doc.key] = res.url;
      }

      await usersAPI.updateProfile({
        avatar: uploadedDocs.profile_photo,
      });

      Alert.alert(
        'Documents Submitted',
        'Your documents are under review. We\'ll notify you once verified.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadedCount = documents.filter(d => d.uri !== '').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(uploadedCount / documents.length) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{uploadedCount} of {documents.length} documents uploaded</Text>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        <Text style={styles.sectionSubtitle}>Upload clear photos of the following documents</Text>

        {documents.map((doc) => (
          <TouchableOpacity
            key={doc.key}
            style={[styles.docCard, doc.uri ? styles.docCardUploaded : null]}
            onPress={() => handlePickDocument(doc.key)}
          >
            <View style={[styles.docIcon, doc.uri ? styles.docIconUploaded : null]}>
              {doc.uri ? (
                <Ionicons name="checkmark" size={22} color={colors.textWhite} />
              ) : (
                <Ionicons name={doc.icon as any} size={22} color={colors.navy} />
              )}
            </View>
            <View style={styles.docInfo}>
              <View style={styles.docLabelRow}>
                <Text style={styles.docLabel}>{doc.label}</Text>
                {doc.required && <Text style={styles.requiredBadge}>Required</Text>}
              </View>
              <Text style={styles.docDesc}>{doc.description}</Text>
              {doc.uri ? (
                <Text style={styles.docStatus}>✓ Uploaded — tap to replace</Text>
              ) : (
                <Text style={styles.docAction}>Tap to upload</Text>
              )}
            </View>
            {doc.uri ? (
              <Image source={{ uri: doc.uri }} style={styles.docThumb} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color={colors.teal} />
            )}
          </TouchableOpacity>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.teal} />
          <Text style={styles.infoText}>
            All documents are securely stored and only used for verification purposes. Review typically takes 24-48 hours.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!requiredComplete || loading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!requiredComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color={colors.textWhite} />
              <Text style={styles.submitBtnText}>Submit for Verification</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  progressBar: {
    height: 4, backgroundColor: colors.lightGray, marginHorizontal: 20, borderRadius: 2,
  },
  progressFill: {
    height: 4, backgroundColor: colors.teal, borderRadius: 2,
  },
  progressText: {
    fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 8, marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 12,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sectionSubtitle: { fontSize: 14, color: colors.textLight, marginTop: 4, marginBottom: 20 },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.lightGray, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: 'transparent',
  },
  docCardUploaded: { borderColor: colors.success + '40', backgroundColor: colors.success + '08' },
  docIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: colors.navy + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  docIconUploaded: { backgroundColor: colors.success },
  docInfo: { flex: 1 },
  docLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  requiredBadge: {
    fontSize: 10, fontWeight: '700', color: colors.error,
    backgroundColor: colors.error + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  docDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  docStatus: { fontSize: 12, fontWeight: '600', color: colors.success, marginTop: 4 },
  docAction: { fontSize: 12, fontWeight: '600', color: colors.teal, marginTop: 4 },
  docThumb: { width: 44, height: 44, borderRadius: 10 },
  infoCard: {
    flexDirection: 'row', gap: 10, backgroundColor: colors.teal + '08',
    borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  submitBtn: {
    backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
});
