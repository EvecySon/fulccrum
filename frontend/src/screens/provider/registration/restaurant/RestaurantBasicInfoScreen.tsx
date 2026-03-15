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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const RESTAURANT_TYPES = [
  'Fast Food',
  'Fine Dining',
  'Casual Dining',
  'Cafe',
  'Bakery',
  'Food Truck',
  'Cloud Kitchen',
];

const CUISINE_TYPES = [
  'Nigerian',
  'Chinese',
  'Italian',
  'Indian',
  'Continental',
  'Japanese',
  'Mexican',
  'Lebanese',
  'American',
  'Thai',
  'Korean',
  'French',
];

const RestaurantBasicInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedTypes } = (route.params as any) || {};

  const [businessName, setBusinessName] = useState('');
  const [restaurantType, setRestaurantType] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const toggleCuisine = (cuisine: string) => {
    setCuisineTypes((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleContinue = () => {
    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your business name');
      return;
    }
    if (!restaurantType) {
      Alert.alert('Required', 'Please select restaurant type');
      return;
    }
    if (cuisineTypes.length === 0) {
      Alert.alert('Required', 'Please select at least one cuisine type');
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

    (navigation as any).navigate('RestaurantLocation', {
      selectedTypes,
      basicInfo: {
        businessName,
        restaurantType,
        cuisineTypes,
        phoneNumber,
        email,
        description,
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
        <Text style={styles.headerTitle}>Restaurant Info</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
        <Text style={styles.progressText}>Step 1 of 4</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Basic Information</Text>

        {/* Business Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Business Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mama's Kitchen"
            value={businessName}
            onChangeText={setBusinessName}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Restaurant Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Restaurant Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipsContainer}>
            {RESTAURANT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  restaurantType === type && styles.chipSelected,
                ]}
                onPress={() => setRestaurantType(type)}
              >
                <Text
                  style={[
                    styles.chipText,
                    restaurantType === type && styles.chipTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cuisine Types */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Cuisine Types <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>Select all that apply</Text>
          <View style={styles.chipsContainer}>
            {CUISINE_TYPES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.chip,
                  cuisineTypes.includes(cuisine) && styles.chipSelected,
                ]}
                onPress={() => toggleCuisine(cuisine)}
              >
                <Text
                  style={[
                    styles.chipText,
                    cuisineTypes.includes(cuisine) && styles.chipTextSelected,
                  ]}
                >
                  {cuisine}
                </Text>
                {cuisineTypes.includes(cuisine) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#fff"
                    style={{ marginLeft: 4 }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
            placeholder="restaurant@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell customers about your restaurant..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
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
            colors={['#ef4444', '#dc2626']}
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
    backgroundColor: '#ef4444',
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextSelected: {
    color: '#fff',
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

export default RestaurantBasicInfoScreen;
