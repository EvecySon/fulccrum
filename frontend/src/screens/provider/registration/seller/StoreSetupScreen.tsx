import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const StoreSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes } = (route.params as any) || {};

  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [storeLogo, setStoreLogo] = useState<string | null>(null);

  const handlePickLogo = () => {
    // Image picker implementation
    Alert.alert('Coming Soon', 'Image picker will be implemented');
  };

  const handleContinue = () => {
    if (!storeName.trim()) {
      Alert.alert('Required', 'Please enter your store name');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Required', 'Please enter phone number');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter email address');
      return;
    }

    (navigation as any).navigate('ProductCategories', {
      selectedTypes,
      storeInfo: {
        storeName,
        storeDescription,
        phoneNumber,
        email,
        businessRegNumber,
        storeLogo,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Setup</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <Text style={styles.progressText}>Step 1 of 3</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Set Up Your Store</Text>

        {/* Store Logo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Store Logo (Optional)</Text>
          <TouchableOpacity
            style={styles.logoUpload}
            onPress={handlePickLogo}
          >
            {storeLogo ? (
              <Image source={{ uri: storeLogo }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="camera" size={32} color="#9ca3af" />
                <Text style={styles.logoText}>Upload Logo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Store Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Store Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Tech Hub Nigeria"
            value={storeName}
            onChangeText={setStoreName}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Store Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Store Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell customers about your store and products..."
            value={storeDescription}
            onChangeText={setStoreDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="+234 800 000 0000"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="store@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Business Registration */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Business Registration Number (Optional)
          </Text>
          <Text style={styles.hint}>
            CAC registration number if you have one
          </Text>
          <TextInput
            style={styles.input}
            placeholder="RC 123456"
            value={businessRegNumber}
            onChangeText={setBusinessRegNumber}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.infoText}>
            Your store information will be reviewed by our team before going
            live. This usually takes 24-48 hours.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.continueGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  logoUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  logoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
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
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
});

export default StoreSetupScreen;
