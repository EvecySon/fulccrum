import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface TemplateEditorProps {
  initialTitle?: string;
  initialBody?: string;
  onSave: (title: string, body: string) => void;
  onCancel?: () => void;
  availablePlaceholders?: string[];
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTitle = '',
  initialBody = '',
  onSave,
  onCancel,
  availablePlaceholders = ['{userName}', '{orderNumber}', '{amount}', '{restaurantName}', '{driverName}'],
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [showPlaceholders, setShowPlaceholders] = useState(false);

  const insertPlaceholder = (placeholder: string) => {
    setBody(body + placeholder);
    setShowPlaceholders(false);
  };

  const handleSave = () => {
    if (title.trim() && body.trim()) {
      onSave(title, body);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Notification Title</Text>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., 🔔 New Order!"
          placeholderTextColor={colors.textLight}
          maxLength={100}
        />
        <Text style={styles.charCount}>{title.length}/100</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Notification Body</Text>
          <TouchableOpacity
            style={styles.placeholderButton}
            onPress={() => setShowPlaceholders(!showPlaceholders)}
          >
            <Ionicons name="code-slash" size={16} color={colors.teal} />
            <Text style={styles.placeholderButtonText}>Insert Variable</Text>
          </TouchableOpacity>
        </View>

        {showPlaceholders && (
          <ScrollView horizontal style={styles.placeholderList} showsHorizontalScrollIndicator={false}>
            {availablePlaceholders.map((placeholder) => (
              <TouchableOpacity
                key={placeholder}
                style={styles.placeholderChip}
                onPress={() => insertPlaceholder(placeholder)}
              >
                <Text style={styles.placeholderChipText}>{placeholder}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <TextInput
          style={styles.bodyInput}
          value={body}
          onChangeText={setBody}
          placeholder="e.g., You have a new order from {restaurantName}. Order #{orderNumber}"
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{body.length}/500</Text>
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Ionicons name="notifications" size={20} color={colors.teal} />
            <Text style={styles.previewTitle}>{title || 'Notification Title'}</Text>
          </View>
          <Text style={styles.previewBody}>{body || 'Notification body text will appear here...'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.saveButton, (!title.trim() || !body.trim()) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!title.trim() || !body.trim()}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>Save Template</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  bodyInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  placeholderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  placeholderButtonText: {
    fontSize: 13,
    color: colors.teal,
    fontWeight: '600',
  },
  placeholderList: {
    marginBottom: 12,
  },
  placeholderChip: {
    backgroundColor: colors.tealLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  placeholderChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
  },
  preview: {
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  previewBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.teal,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
