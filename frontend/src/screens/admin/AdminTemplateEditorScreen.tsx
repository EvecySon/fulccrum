import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { notificationTemplatesAPI, NotificationTemplate } from '../../services/notificationTemplatesAPI';
import { TemplateEditor } from '../../components/TemplateEditor';

export default function AdminTemplateEditorScreen({ route, navigation }: any) {
  const { templateId } = route.params || {};
  const isEditing = !!templateId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
  
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('engagement');
  const [category, setCategory] = useState('customer');
  const [targetRole, setTargetRole] = useState<string[]>(['customer']);

  useEffect(() => {
    if (isEditing) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const data = await notificationTemplatesAPI.getTemplate(templateId);
      setTemplate(data);
      setKey(data.key);
      setName(data.name);
      setDescription(data.description || '');
      setTitle(data.title);
      setBody(data.body);
      setType(data.type);
      setCategory(data.category);
      setTargetRole(data.targetRole);
    } catch (error) {
      Alert.alert('Error', 'Failed to load template');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (templateTitle: string, templateBody: string) => {
    console.log('=== SAVE TEMPLATE STARTED ===');
    console.log('Template Title:', templateTitle);
    console.log('Template Body:', templateBody);
    console.log('Key:', key);
    console.log('Name:', name);
    console.log('Type:', type);
    console.log('Category:', category);
    console.log('Target Role:', targetRole);
    
    const missingFields = [];
    if (!key.trim()) missingFields.push('Template Key');
    if (!name.trim()) missingFields.push('Template Name');
    if (!templateTitle.trim()) missingFields.push('Notification Title');
    if (!templateBody.trim()) missingFields.push('Notification Body');
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      Alert.alert('Missing Required Fields', `Please fill in:\n• ${missingFields.join('\n• ')}`);
      return;
    }

    console.log('All fields validated, starting save...');
    setSaving(true);
    
    try {
      const data = {
        key: key.trim(),
        name: name.trim(),
        description: description.trim(),
        title: templateTitle.trim(),
        body: templateBody.trim(),
        type,
        category,
        targetRole,
      };
      
      console.log('Data to send:', JSON.stringify(data, null, 2));

      if (isEditing) {
        console.log('Updating template:', templateId);
        const result = await notificationTemplatesAPI.updateTemplate(templateId, data);
        console.log('Update result:', result);
        setSaving(false);
        Alert.alert(
          'Success', 
          'Template updated successfully!', 
          [{ text: 'OK', onPress: () => navigation.goBack() }],
          { cancelable: false }
        );
      } else {
        console.log('Creating new template...');
        const result = await notificationTemplatesAPI.createTemplate(data);
        console.log('Create result:', result);
        setSaving(false);
        Alert.alert(
          'Success', 
          'Template created successfully!', 
          [{ text: 'OK', onPress: () => navigation.goBack() }],
          { cancelable: false }
        );
      }
    } catch (error: any) {
      setSaving(false);
      console.error('=== TEMPLATE SAVE ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      console.error('Error message:', error?.message);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save template. Please check your connection and try again.';
      Alert.alert('Error', errorMessage, [{ text: 'OK' }], { cancelable: false });
    }
  };

  const types = [
    { value: 'engagement', label: 'Engagement' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'alert', label: 'Alert' },
  ];

  const categories = [
    { value: 'customer', label: 'Customer' },
    { value: 'merchant', label: 'Merchant' },
    { value: 'driver', label: 'Driver' },
    { value: 'admin', label: 'Admin' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Loading...</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Template' : 'Create Template'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Template Key *</Text>
          <TextInput
            style={styles.input}
            value={key}
            onChangeText={setKey}
            placeholder="e.g., customer_engagement_morning"
            placeholderTextColor={colors.textLight}
            editable={!isEditing}
          />
          {isEditing && (
            <Text style={styles.hint}>Template key cannot be changed after creation</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Template Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Morning Engagement - Hungry Yet?"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of when this template is used..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type *</Text>
          <View style={styles.optionsRow}>
            {types.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionButton, type === option.value && styles.optionButtonActive]}
                onPress={() => setType(option.value)}
              >
                <Text style={[styles.optionText, type === option.value && styles.optionTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.optionsRow}>
            {categories.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionButton, category === option.value && styles.optionButtonActive]}
                onPress={() => setCategory(option.value)}
              >
                <Text style={[styles.optionText, category === option.value && styles.optionTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <TemplateEditor
          initialTitle={title}
          initialBody={body}
          onSave={handleSave}
          onCancel={() => navigation.goBack()}
        />
      </ScrollView>

      {saving && (
        <View style={styles.savingOverlay}>
          <View style={styles.savingCard}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={styles.savingText}>Saving template...</Text>
          </View>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: 80,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingCard: {
    backgroundColor: colors.white,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  savingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
