import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

interface PackageDeliverySettings {
  basePackagePrice: number;
  perKmPackageRate: number;
  packageSizeSmallMultiplier: number;
  packageSizeMediumMultiplier: number;
  packageSizeLargeMultiplier: number;
  expressSpeedMultiplier: number;
  sameDaySpeedMultiplier: number;
  scheduledSpeedMultiplier: number;
  peakHourSurgeMultiplier: number;
  weekendSurgeMultiplier: number;
}

const PackageDeliverySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState<PackageDeliverySettings>({
    basePackagePrice: 500,
    perKmPackageRate: 100,
    packageSizeSmallMultiplier: 1.0,
    packageSizeMediumMultiplier: 1.5,
    packageSizeLargeMultiplier: 2.0,
    expressSpeedMultiplier: 1.3,
    sameDaySpeedMultiplier: 1.0,
    scheduledSpeedMultiplier: 0.8,
    peakHourSurgeMultiplier: 1.3,
    weekendSurgeMultiplier: 1.2,
  });
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading settings from backend...');
      const data = await api.get('/fees/package-delivery/settings');
      console.log('📦 Received data:', data);
      
      if (data && typeof data === 'object' && data.basePackagePrice !== undefined) {
        setSettings(data);
        // Sync string input values from loaded data
        const strings: Record<string, string> = {};
        for (const [key, val] of Object.entries(data)) {
          if (typeof val === 'number') strings[key] = val.toString();
        }
        setInputValues(strings);
        console.log('✅ Settings loaded successfully');
      } else {
        console.warn('⚠️ Invalid settings data');
      }
    } catch (error: any) {
      console.error('❌ Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load package delivery settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('🔵 Save button clicked');
    try {
      setSaving(true);
      // Only send package delivery pricing fields, exclude currency
      const payload = {
        basePackagePrice: settings.basePackagePrice,
        perKmPackageRate: settings.perKmPackageRate,
        packageSizeSmallMultiplier: settings.packageSizeSmallMultiplier,
        packageSizeMediumMultiplier: settings.packageSizeMediumMultiplier,
        packageSizeLargeMultiplier: settings.packageSizeLargeMultiplier,
        expressSpeedMultiplier: settings.expressSpeedMultiplier,
        sameDaySpeedMultiplier: settings.sameDaySpeedMultiplier,
        scheduledSpeedMultiplier: settings.scheduledSpeedMultiplier,
        peakHourSurgeMultiplier: settings.peakHourSurgeMultiplier,
        weekendSurgeMultiplier: settings.weekendSurgeMultiplier,
      };
      console.log('📦 Payload:', payload);
      await api.put('/fees/package-delivery/settings', payload);
      console.log('✅ Save successful');
      setShowSuccess(true);
      Alert.alert('Success! ✅', 'Package delivery settings saved successfully');
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('❌ Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PackageDeliverySettings, value: string) => {
    // Allow typing decimals by storing raw string
    setInputValues((prev) => ({ ...prev, [key]: value }));
    // Only update numeric state if it's a valid number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setSettings((prev) => ({ ...prev, [key]: numValue }));
    }
  };

  const calculateExamplePrice = () => {
    const distance = 5; // 5km example
    const basePrice = settings.basePackagePrice;
    const distancePrice = distance * settings.perKmPackageRate;
    const sizeMultiplier = settings.packageSizeMediumMultiplier;
    const speedMultiplier = settings.expressSpeedMultiplier;
    const surgeMultiplier = settings.peakHourSurgeMultiplier;

    const total = (basePrice + distancePrice) * sizeMultiplier * speedMultiplier * surgeMultiplier;
    return total.toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{"<"}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Package Delivery Pricing</Text>
            <Text style={styles.headerSubtitle}>Configure pricing parameters</Text>
          </View>
        </View>
      </View>

      {/* Success Banner */}
      {showSuccess && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text style={styles.successText}>Settings saved successfully!</Text>
        </View>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Base Pricing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={24} color="#14b8a6" />
            <Text style={styles.sectionTitle}>Base Pricing</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Base Package Price (₦)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.basePackagePrice ?? settings.basePackagePrice.toString()}
              onChangeText={(val) => updateSetting('basePackagePrice', val)}
              keyboardType="decimal-pad"
              placeholder="500"
            />
            <Text style={styles.hint}>Starting price for any package delivery</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Per Kilometer Rate (₦)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.perKmPackageRate ?? settings.perKmPackageRate.toString()}
              onChangeText={(val) => updateSetting('perKmPackageRate', val)}
              keyboardType="decimal-pad"
              placeholder="100"
            />
            <Text style={styles.hint}>Additional cost per kilometer traveled</Text>
          </View>
        </View>

        {/* Package Size Multipliers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={24} color="#14b8a6" />
            <Text style={styles.sectionTitle}>Package Size Multipliers</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Small Package (×)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.packageSizeSmallMultiplier ?? settings.packageSizeSmallMultiplier.toString()}
              onChangeText={(val) => updateSetting('packageSizeSmallMultiplier', val)}
              keyboardType="decimal-pad"
              placeholder="1.0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medium Package (×)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.packageSizeMediumMultiplier ?? settings.packageSizeMediumMultiplier.toString()}
              onChangeText={(val) => updateSetting('packageSizeMediumMultiplier', val)}
              keyboardType="decimal-pad"
              placeholder="1.5"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Large Package (×)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.packageSizeLargeMultiplier ?? settings.packageSizeLargeMultiplier.toString()}
              onChangeText={(val) => updateSetting('packageSizeLargeMultiplier', val)}
              keyboardType="decimal-pad"
              placeholder="2.0"
            />
          </View>
        </View>

        {/* Delivery Speed Multipliers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={24} color="#14b8a6" />
            <Text style={styles.sectionTitle}>Delivery Speed Multipliers</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Express (30-60 min) (×)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.expressSpeedMultiplier ?? settings.expressSpeedMultiplier.toString()}
              onChangeText={(val) => updateSetting('expressSpeedMultiplier', val)}
              keyboardType="decimal-pad"
              placeholder="1.3"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Same Day (×)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.sameDaySpeedMultiplier ?? settings.sameDaySpeedMultiplier.toString()}
              onChangeText={(val) => updateSetting('sameDaySpeedMultiplier', val)}
              keyboardType="decimal-pad"
              placeholder="1.0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scheduled (×)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.scheduledSpeedMultiplier ?? settings.scheduledSpeedMultiplier.toString()}
              onChangeText={(val) => updateSetting('scheduledSpeedMultiplier', val)}
              keyboardType="decimal-pad"
              placeholder="0.8"
            />
          </View>
        </View>

        {/* Surge Pricing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={24} color="#14b8a6" />
            <Text style={styles.sectionTitle}>Surge Pricing Multipliers</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Peak Hours (7-9am, 5-8pm weekdays) (×)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.peakHourSurgeMultiplier ?? settings.peakHourSurgeMultiplier.toString()}
              onChangeText={(val) => updateSetting('peakHourSurgeMultiplier', val)}
              keyboardType="decimal-pad"
              placeholder="1.3"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weekend (6-10pm Fri-Sun) (×)</Text>
            <TextInput
              style={styles.input}
              value={inputValues.weekendSurgeMultiplier ?? settings.weekendSurgeMultiplier.toString()}
              onChangeText={(val) => updateSetting('weekendSurgeMultiplier', val)}
              keyboardType="decimal-pad"
              placeholder="1.2"
            />
          </View>
        </View>

        {/* Pricing Formula */}
        <View style={styles.formulaCard}>
          <Text style={styles.formulaTitle}>Pricing Formula</Text>
          <Text style={styles.formula}>
            Price = (Base + Distance × PerKm) × Size × Speed × Surge
          </Text>
          <View style={styles.divider} />
          <Text style={styles.exampleTitle}>Example Calculation:</Text>
          <Text style={styles.exampleText}>
            Medium package, 5km, Express, Peak hour
          </Text>
          <Text style={styles.examplePrice}>₦{calculateExamplePrice()}</Text>
          <Text style={styles.exampleBreakdown}>
            ({settings.basePackagePrice} + 5 × {settings.perKmPackageRate}) × {settings.packageSizeMediumMultiplier} × {settings.expressSpeedMultiplier} × {settings.peakHourSurgeMultiplier}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  formulaCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#14b8a6',
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 8,
  },
  formula: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#0f766e',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#99f6e4',
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 13,
    color: '#14b8a6',
    marginBottom: 8,
  },
  examplePrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f766e',
    marginBottom: 8,
  },
  exampleBreakdown: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#14b8a6',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1f2937',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#10b981',
  },
  successText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    marginLeft: 12,
  },
});

export default PackageDeliverySettingsScreen;
