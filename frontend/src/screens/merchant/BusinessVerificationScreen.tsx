import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { uploadAPI, usersAPI } from '../../services/api';
import { pickImage } from '../../services/uploadService';
import { nigerianStatesLgas, nigerianStates } from '../../data/nigerianStatesLgas';
import { MERCHANT_DOCUMENTS } from '../../config/documentRequirements';
import { getActiveCategories } from '../../config/businessCategories';

type VerificationStep = 'info' | 'documents' | 'review';

export default function BusinessVerificationScreen({ navigation }: any) {
  const [step, setStep] = useState<VerificationStep>('info');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Business info
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [address, setAddress] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');

  // Existing doc URLs from backend (for edit mode)
  const [existingLogoUrl, setExistingLogoUrl] = useState('');
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [existingCacUrl, setExistingCacUrl] = useState('');

  // Load existing profile on mount
  useEffect(() => {
    (async () => {
      try {
        const profile = await usersAPI.getProfile();
        const bp = profile?.businessProfile;
        if (bp && bp.businessName) {
          setIsEditing(true);
          setBusinessName(bp.businessName || '');
          setBusinessType(bp.businessType || 'restaurant');
          setAddress(bp.address || '');
          setAddress2(bp.address2 || '');
          setCity(bp.city || '');
          setState(bp.state || '');
          setLga(bp.lga || '');
          setDescription(bp.description || '');
          if (bp.phone) setPhone(bp.phone.replace('+234', ''));
          if (bp.logoUrl) setExistingLogoUrl(bp.logoUrl);
          if (bp.coverImageUrl) setExistingCoverUrl(bp.coverImageUrl);
          if (bp.businessLicense) setExistingCacUrl(bp.businessLicense);
        }
      } catch {}
      setInitialLoading(false);
    })();
  }, []);

  // Picker modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'state' | 'lga'>('state');
  const [pickerSearch, setPickerSearch] = useState('');

  const openPicker = (type: 'state' | 'lga') => {
    setPickerType(type);
    setPickerSearch('');
    setPickerVisible(true);
  };

  const pickerItems = useMemo(() => {
    const items = pickerType === 'state' ? nigerianStates : (nigerianStatesLgas[state] || []);
    if (!pickerSearch) return items;
    const q = pickerSearch.toLowerCase();
    return items.filter(i => i.toLowerCase().includes(q));
  }, [pickerType, pickerSearch, state]);

  const handlePickerSelect = (item: string) => {
    if (pickerType === 'state') {
      setState(item);
      setLga('');
    } else {
      setLga(item);
    }
    setPickerVisible(false);
  };

  // Documents
  const [logoUri, setLogoUri] = useState('');
  const [coverUri, setCoverUri] = useState('');
  const [cacDocUri, setCacDocUri] = useState('');

  // Dynamic document uploads from config
  const [docUris, setDocUris] = useState<Record<string, string>>({});

  const handlePickDoc = async (key: string) => {
    const uri = await pickImage();
    if (uri) setDocUris(prev => ({ ...prev, [key]: uri }));
  };

  const businessTypes = getActiveCategories().map(c => ({
    key: c.key, label: c.label, icon: c.icon,
  }));

  const handlePickLogo = async () => {
    const uri = await pickImage();
    if (uri) setLogoUri(uri);
  };

  const handlePickCover = async () => {
    const uri = await pickImage();
    if (uri) setCoverUri(uri);
  };

  const handlePickCacDoc = async () => {
    const uri = await pickImage();
    if (uri) setCacDocUri(uri);
  };

  const handleSubmit = async () => {
    if (!businessName || !address || !city || !state || !lga) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Upload logo if selected
      let logoUrl: string | undefined;
      let coverUrl: string | undefined;
      let cacDocUrl: string | undefined;

      if (logoUri) {
        const formData = new FormData();
        formData.append('file', { uri: logoUri, name: 'logo.jpg', type: 'image/jpeg' } as any);
        const res = await uploadAPI.uploadBusinessLogo(formData);
        logoUrl = res.url;
      }
      if (coverUri) {
        const formData = new FormData();
        formData.append('file', { uri: coverUri, name: 'cover.jpg', type: 'image/jpeg' } as any);
        const res = await uploadAPI.uploadBusinessCover(formData);
        coverUrl = res.url;
      }
      if (cacDocUri) {
        const formData = new FormData();
        formData.append('file', { uri: cacDocUri, name: 'cac_document.jpg', type: 'image/jpeg' } as any);
        const res = await uploadAPI.uploadDocument(formData);
        cacDocUrl = res.url;
      }

      await usersAPI.updateBusinessProfile({
        businessName,
        businessType,
        address,
        address2: address2 || undefined,
        city,
        lga,
        state,
        description,
        phone: phone ? `+234${phone}` : undefined,
        logo: logoUrl,
        coverImage: coverUrl,
        cacDocument: cacDocUrl,
      });

      if (isEditing) {
        Alert.alert(
          'Profile Updated',
          'Your business profile has been updated successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert(
          'Verification Submitted',
          'Your business verification is under review. We\'ll notify you once approved.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allSteps: VerificationStep[] = ['info', 'documents', 'review'];

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {allSteps.map((s, i) => (
        <React.Fragment key={s}>
          <View style={[styles.stepDot, (step === s || i < allSteps.indexOf(step)) && styles.stepDotActive]}>
            <Text style={[styles.stepNum, (step === s || i < allSteps.indexOf(step)) && styles.stepNumActive]}>
              {i + 1}
            </Text>
          </View>
          {i < allSteps.length - 1 && <View style={[styles.stepLine, i < allSteps.indexOf(step) && styles.stepLineActive]} />}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          const idx = allSteps.indexOf(step);
          if (idx === 0) navigation.goBack();
          else setStep(allSteps[idx - 1]);
        }}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Business Profile' : 'Business Verification'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {initialLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Step 1: Business Info */}
        {step === 'info' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            <Text style={styles.sectionSubtitle}>Tell us about your business</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mama's Kitchen"
                placeholderTextColor={colors.textLight}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>

            <Text style={styles.inputLabel}>Business Type *</Text>
            <View style={styles.typeGrid}>
              {businessTypes.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeCard, businessType === t.key && styles.typeCardActive]}
                  onPress={() => setBusinessType(t.key)}
                >
                  <Ionicons name={t.icon as any} size={22} color={businessType === t.key ? colors.textWhite : colors.navy} />
                  <Text style={[styles.typeLabel, businessType === t.key && styles.typeLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput style={styles.input} placeholder="Street address" placeholderTextColor={colors.textLight} value={address} onChangeText={setAddress} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address 2 (Optional)</Text>
              <TextInput style={styles.input} placeholder="Apt, suite, floor, etc." placeholderTextColor={colors.textLight} value={address2} onChangeText={setAddress2} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State *</Text>
              <TouchableOpacity style={styles.input} onPress={() => openPicker('state')}>
                <Text style={{ fontSize: 15, color: state ? colors.textPrimary : colors.textLight }}>{state || 'Select State'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>LGA *</Text>
              <TouchableOpacity style={[styles.input, !state && { opacity: 0.5 }]} onPress={() => state ? openPicker('lga') : setError('Please select a state first')} disabled={!state}>
                <Text style={{ fontSize: 15, color: lga ? colors.textPrimary : colors.textLight }}>{lga || 'Select LGA'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City / Town *</Text>
              <TextInput style={styles.input} placeholder="e.g. Ikeja" placeholderTextColor={colors.textLight} value={city} onChangeText={setCity} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <Text style={styles.phonePrefix}>+234</Text>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="812 345 6789" placeholderTextColor={colors.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell customers about your business..."
                placeholderTextColor={colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => {
              if (!businessName || !address || !city || !state || !lga) {
                setError('Please fill in all required fields');
                return;
              }
              setError('');
              setStep('documents');
            }}>
              <Text style={styles.primaryBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Documents */}
        {step === 'documents' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Documents</Text>
            <Text style={styles.sectionSubtitle}>Upload your business documents for verification</Text>

            {MERCHANT_DOCUMENTS.map((doc) => {
              const isImage = doc.key === 'business_logo' || doc.key === 'cover_photo';
              const uri = docUris[doc.key] || '';
              const isUploaded = !!uri;
              return (
                <TouchableOpacity
                  key={doc.key}
                  style={[styles.uploadCard, isUploaded && { borderColor: colors.success + '40', borderWidth: 2 }]}
                  onPress={() => handlePickDoc(doc.key)}
                >
                  {isUploaded && isImage ? (
                    <Image source={{ uri }} style={[styles.uploadPreview, doc.key === 'cover_photo' && { height: 140 }]} />
                  ) : isUploaded ? (
                    <View style={styles.uploadDone}>
                      <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.uploadDoneText}>{doc.label}</Text>
                        <Text style={{ fontSize: 12, color: colors.success }}>Uploaded — tap to replace</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name={(doc.icon + '-outline') as any} size={32} color={doc.required ? colors.teal : colors.textLight} />
                      <Text style={styles.uploadLabel}>{doc.label}</Text>
                      <Text style={styles.uploadHint}>{doc.required ? 'Required' : 'Optional'} — {doc.description}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('review')}>
              <Text style={styles.primaryBtnText}>Review & Submit</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review & Submit</Text>
            <Text style={styles.sectionSubtitle}>Please review your information before submitting</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Business Name</Text>
              <Text style={styles.reviewValue}>{businessName}</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Type</Text>
              <Text style={styles.reviewValue}>{businessTypes.find(t => t.key === businessType)?.label}</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Address</Text>
              <Text style={styles.reviewValue}>{address}{address2 ? `, ${address2}` : ''}, {city}, {lga}, {state}</Text>
            </View>
            {phone ? (
              <View style={styles.reviewCard}>
                <Text style={styles.reviewLabel}>Phone</Text>
                <Text style={styles.reviewValue}>+234{phone}</Text>
              </View>
            ) : null}
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Documents</Text>
              <View style={styles.reviewDocs}>
                <View style={styles.reviewDocItem}>
                  <Ionicons name={(logoUri || existingLogoUrl) ? 'checkmark-circle' : 'close-circle'} size={18} color={(logoUri || existingLogoUrl) ? colors.success : colors.textLight} />
                  <Text style={styles.reviewDocText}>Logo</Text>
                </View>
                <View style={styles.reviewDocItem}>
                  <Ionicons name={(coverUri || existingCoverUrl) ? 'checkmark-circle' : 'close-circle'} size={18} color={(coverUri || existingCoverUrl) ? colors.success : colors.textLight} />
                  <Text style={styles.reviewDocText}>Cover</Text>
                </View>
                <View style={styles.reviewDocItem}>
                  <Ionicons name={(cacDocUri || existingCacUrl) ? 'checkmark-circle' : 'close-circle'} size={18} color={(cacDocUri || existingCacUrl) ? colors.success : colors.textLight} />
                  <Text style={styles.reviewDocText}>CAC Doc</Text>
                </View>
              </View>
            </View>

            {isEditing ? (
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={colors.textWhite} /> : (
                  <>
                    <Text style={styles.primaryBtnText}>Submit Changes</Text>
                    <Ionicons name="checkmark-circle" size={20} color={colors.textWhite} />
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('MerchantPayment')}
              >
                <Text style={styles.primaryBtnText}>Continue to Payment</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      )}

      {/* State / LGA Picker Modal */}
      {pickerVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPickerVisible(false)} />
          <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>{pickerType === 'state' ? 'Select State' : 'Select LGA'}</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
              <TextInput
                style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.textPrimary }}
                placeholder={`Search ${pickerType === 'state' ? 'states' : 'LGAs'}...`}
                placeholderTextColor={colors.textLight}
                value={pickerSearch}
                onChangeText={setPickerSearch}
                autoFocus
              />
            </View>
            <FlatList
              data={pickerItems}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.borderLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                  onPress={() => handlePickerSelect(item)}
                >
                  <Text style={{ fontSize: 15, color: colors.textPrimary }}>{item}</Text>
                  {((pickerType === 'state' && item === state) || (pickerType === 'lga' && item === lga)) && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  stepIndicator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, marginBottom: 20,
  },
  stepDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { backgroundColor: colors.navy },
  stepNum: { fontSize: 14, fontWeight: '700', color: colors.textLight },
  stepNumActive: { color: colors.textWhite },
  stepLine: { flex: 1, height: 3, backgroundColor: colors.lightGray, marginHorizontal: 8 },
  stepLineActive: { backgroundColor: colors.navy },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20,
    backgroundColor: colors.error + '10', borderRadius: 12, padding: 12, marginBottom: 12,
  },
  errorText: { fontSize: 14, color: colors.error, flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { flex: 1 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  sectionSubtitle: { fontSize: 14, color: colors.textLight, marginTop: 4, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: colors.lightGray, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight,
  },
  textArea: { minHeight: 100, paddingTop: 14 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phonePrefix: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, paddingLeft: 4 },
  row: { flexDirection: 'row', gap: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeCard: {
    width: '47%', paddingVertical: 16, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: colors.lightGray, alignItems: 'center', gap: 6,
    borderWidth: 2, borderColor: 'transparent',
  },
  typeCardActive: { borderColor: colors.navy, backgroundColor: colors.navy },
  typeLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  typeLabelActive: { color: colors.textWhite },
  uploadCard: {
    borderRadius: 16, borderWidth: 2, borderColor: colors.borderLight, borderStyle: 'dashed',
    marginBottom: 16, overflow: 'hidden',
  },
  uploadPlaceholder: {
    height: 100, justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  uploadPreview: { width: '100%', height: 100, resizeMode: 'cover' },
  uploadLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  uploadHint: { fontSize: 12, color: colors.textLight },
  uploadDone: {
    height: 80, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: colors.success + '10',
  },
  uploadDoneText: { fontSize: 14, fontWeight: '600', color: colors.success },
  reviewCard: {
    backgroundColor: colors.lightGray, borderRadius: 14, padding: 16, marginBottom: 12,
  },
  reviewLabel: { fontSize: 12, fontWeight: '600', color: colors.textLight, marginBottom: 4 },
  reviewValue: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  reviewDocs: { flexDirection: 'row', gap: 16, marginTop: 4 },
  reviewDocItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewDocText: { fontSize: 14, color: colors.textSecondary },
  primaryBtn: {
    backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    marginTop: 8,
    shadowColor: colors.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
});
