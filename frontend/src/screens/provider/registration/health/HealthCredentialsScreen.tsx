import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const HealthCredentialsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes, profession } = (route.params as any) || {};

  const [medicalDegree, setMedicalDegree] = useState<string | null>(null);
  const [licenseDocument, setLicenseDocument] = useState<string | null>(null);
  const [additionalCerts, setAdditionalCerts] = useState<string[]>([]);

  const handlePickDocument = (type: 'degree' | 'license' | 'certs') => {
    Alert.alert('Coming Soon', 'Document picker will be implemented');
    // Simulate document selection
    if (type === 'degree') setMedicalDegree('degree.pdf');
    if (type === 'license') setLicenseDocument('license.pdf');
    if (type === 'certs') setAdditionalCerts(['cert1.pdf', 'cert2.pdf']);
  };

  const handleContinue = () => {
    if (!medicalDegree) {
      Alert.alert('Required', 'Please upload your medical degree');
      return;
    }
    if (!licenseDocument) {
      Alert.alert('Required', 'Please upload your license document');
      return;
    }

    (navigation as any).navigate('HealthSchedule', {
      selectedTypes,
      profession,
      credentials: {
        medicalDegree,
        licenseDocument,
        additionalCerts,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credentials</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.progressText}>Step 2 of 3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Upload Credentials</Text>
        <Text style={styles.subtitle}>
          Please upload your professional credentials for verification
        </Text>

        {/* Medical Degree */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <Ionicons name="school" size={24} color="#10b981" />
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>
                Medical Degree <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.documentDesc}>
                Upload your medical degree certificate
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              medicalDegree && styles.uploadButtonSuccess,
            ]}
            onPress={() => handlePickDocument('degree')}
          >
            <Ionicons
              name={medicalDegree ? 'checkmark-circle' : 'cloud-upload-outline'}
              size={20}
              color={medicalDegree ? '#10b981' : '#10b981'}
            />
            <Text
              style={[
                styles.uploadButtonText,
                medicalDegree && styles.uploadButtonTextSuccess,
              ]}
            >
              {medicalDegree ? 'Document Uploaded' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* License Document */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <Ionicons name="document-text" size={24} color="#10b981" />
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>
                Professional License <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.documentDesc}>
                Upload your medical license (License #: {profession?.licenseNumber})
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              licenseDocument && styles.uploadButtonSuccess,
            ]}
            onPress={() => handlePickDocument('license')}
          >
            <Ionicons
              name={licenseDocument ? 'checkmark-circle' : 'cloud-upload-outline'}
              size={20}
              color={licenseDocument ? '#10b981' : '#10b981'}
            />
            <Text
              style={[
                styles.uploadButtonText,
                licenseDocument && styles.uploadButtonTextSuccess,
              ]}
            >
              {licenseDocument ? 'Document Uploaded' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Certifications */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <Ionicons name="ribbon" size={24} color="#10b981" />
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>
                Additional Certifications (Optional)
              </Text>
              <Text style={styles.documentDesc}>
                Upload any additional certifications or training certificates
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              additionalCerts.length > 0 && styles.uploadButtonSuccess,
            ]}
            onPress={() => handlePickDocument('certs')}
          >
            <Ionicons
              name={additionalCerts.length > 0 ? 'checkmark-circle' : 'cloud-upload-outline'}
              size={20}
              color={additionalCerts.length > 0 ? '#10b981' : '#10b981'}
            />
            <Text
              style={[
                styles.uploadButtonText,
                additionalCerts.length > 0 && styles.uploadButtonTextSuccess,
              ]}
            >
              {additionalCerts.length > 0
                ? `${additionalCerts.length} Document(s) Uploaded`
                : 'Upload Documents'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.infoText}>
            All documents will be securely stored and reviewed by our verification team.
            This process usually takes 24-48 hours.
          </Text>
        </View>
      </ScrollView>

      {medicalDegree && licenseDocument && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.continueGradient}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  progressContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  progressBar: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  progressText: { fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24, lineHeight: 24 },
  required: { color: '#ef4444' },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  documentInfo: { flex: 1, marginLeft: 12 },
  documentTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 },
  documentDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10b981',
    borderStyle: 'dashed',
    backgroundColor: '#f0fdf4',
  },
  uploadButtonSuccess: {
    borderStyle: 'solid',
    backgroundColor: '#f0fdf4',
  },
  uploadButtonText: { fontSize: 15, fontWeight: '600', color: '#10b981', marginLeft: 8 },
  uploadButtonTextSuccess: { color: '#059669' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginTop: 8,
  },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#1e40af', lineHeight: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: { borderRadius: 12, overflow: 'hidden' },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: { fontSize: 16, fontWeight: '700', color: '#fff', marginRight: 8 },
});

export default HealthCredentialsScreen;
