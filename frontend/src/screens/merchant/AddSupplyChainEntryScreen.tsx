import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { blockchainAPI, menuAPI } from '../../services/api';

export default function AddSupplyChainEntryScreen({ navigation, route }: any) {
  const { itemId, itemName } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    itemId: itemId || '',
    stage: 'sourced',
    location: '',
    handler: '',
    description: '',
    temperature: '',
    batchNumber: '',
  });

  useEffect(() => {
    if (!itemId) {
      loadMenuItems();
    }
  }, []);

  const loadMenuItems = async () => {
    try {
      const res = await menuAPI.getItems('me');
      const items = Array.isArray(res?.data || res) ? (res?.data || res) : [];
      setMenuItems(items);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load menu items');
    }
  };

  const stages = [
    { value: 'sourced', label: 'Sourced', icon: 'leaf-outline' },
    { value: 'processed', label: 'Processed', icon: 'construct-outline' },
    { value: 'stored', label: 'Stored', icon: 'cube-outline' },
    { value: 'prepared', label: 'Prepared', icon: 'restaurant-outline' },
    { value: 'dispatched', label: 'Dispatched', icon: 'car-outline' },
    { value: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
  ];

  const handleSubmit = async () => {
    if (!formData.itemId || !formData.location || !formData.handler || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await blockchainAPI.addSupplyChainEntry({
        itemId: formData.itemId,
        stage: formData.stage,
        location: formData.location,
        handler: formData.handler,
        description: formData.description,
        temperature: formData.temperature || undefined,
        batchNumber: formData.batchNumber || undefined,
      });

      Alert.alert('Success', 'Supply chain entry added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to add supply chain entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Supply Chain Entry</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!itemId && (
          <View style={styles.section}>
            <Text style={styles.label}>Menu Item *</Text>
            <View style={styles.pickerButtons}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.pickerButton,
                    formData.itemId === item.id && styles.pickerButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, itemId: item.id })}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      formData.itemId === item.id && styles.pickerButtonTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {itemId && (
          <View style={styles.infoCard}>
            <Ionicons name="restaurant" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{itemName}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Stage *</Text>
          <View style={styles.stageGrid}>
            {stages.map((stage) => (
              <TouchableOpacity
                key={stage.value}
                style={[
                  styles.stageCard,
                  formData.stage === stage.value && styles.stageCardActive,
                ]}
                onPress={() => setFormData({ ...formData, stage: stage.value })}
              >
                <Ionicons
                  name={stage.icon as any}
                  size={24}
                  color={formData.stage === stage.value ? colors.white : colors.teal}
                />
                <Text
                  style={[
                    styles.stageLabel,
                    formData.stage === stage.value && styles.stageLabelActive,
                  ]}
                >
                  {stage.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="e.g., Farm ABC, Lagos"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Handler *</Text>
          <TextInput
            style={styles.input}
            value={formData.handler}
            onChangeText={(text) => setFormData({ ...formData, handler: text })}
            placeholder="e.g., John Doe, Cold Storage Ltd"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe this stage of the supply chain..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Temperature (°C)</Text>
            <TextInput
              style={styles.input}
              value={formData.temperature}
              onChangeText={(text) => setFormData({ ...formData, temperature: text })}
              placeholder="e.g., 4°C"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Batch Number</Text>
            <TextInput
              style={styles.input}
              value={formData.batchNumber}
              onChangeText={(text) => setFormData({ ...formData, batchNumber: text })}
              placeholder="e.g., B2024-001"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.submitButtonText}>Add Entry</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tealLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.teal,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stageCard: {
    width: '30%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  stageCardActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  stageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stageLabelActive: {
    color: colors.white,
  },
  pickerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pickerButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  pickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerButtonTextActive: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
