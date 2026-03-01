import { showAlert } from '../../utils/alert';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ticketsAPI } from '../../services/ticketsAPI';

const CATEGORIES = [
  { value: 'ORDER_ISSUE', label: 'Order Issue', icon: 'receipt-outline' },
  { value: 'PAYMENT', label: 'Payment', icon: 'card-outline' },
  { value: 'DELIVERY', label: 'Delivery', icon: 'bicycle-outline' },
  { value: 'TECHNICAL', label: 'Technical', icon: 'bug-outline' },
  { value: 'ACCOUNT', label: 'Account', icon: 'person-outline' },
  { value: 'OTHER', label: 'Other', icon: 'help-circle-outline' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: colors.info },
  { value: 'MEDIUM', label: 'Medium', color: colors.warning },
  { value: 'HIGH', label: 'High', color: colors.error },
  { value: 'URGENT', label: 'Urgent', color: colors.error },
];

export default function CreateTicketScreen({ navigation }: any) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ORDER_ISSUE');
  const [priority, setPriority] = useState('MEDIUM');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateTicket = async () => {
    if (!subject.trim()) {
      showAlert('Validation Error', 'Please enter a subject');
      return;
    }

    if (!description.trim()) {
      showAlert('Validation Error', 'Please enter a description');
      return;
    }

    if (!customerEmail.trim() && !customerName.trim()) {
      showAlert('Validation Error', 'Please enter customer name or email');
      return;
    }

    try {
      setCreating(true);
      const ticket = await ticketsAPI.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        orderId: orderId.trim() || undefined,
      });

      showAlert('Success', 'Ticket created successfully', [
        {
          text: 'View Ticket',
          onPress: () => {
            navigation.replace('TicketDetail', { ticketId: ticket.id });
          },
        },
        {
          text: 'Create Another',
          onPress: () => {
            setSubject('');
            setDescription('');
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
            setOrderId('');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      showAlert('Error', error?.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Support Ticket</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of the issue"
            placeholderTextColor={colors.textLight}
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
          <Text style={styles.charCount}>{subject.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed explanation of the issue"
            placeholderTextColor={colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryCard,
                  category === cat.value && styles.categoryCardActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={24}
                  color={category === cat.value ? colors.navy : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.value && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority *</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((pri) => (
              <TouchableOpacity
                key={pri.value}
                style={[
                  styles.priorityChip,
                  priority === pri.value && { backgroundColor: pri.color + '20' },
                ]}
                onPress={() => setPriority(pri.value)}
              >
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: priority === pri.value ? pri.color : colors.border },
                  ]}
                />
                <Text
                  style={[
                    styles.priorityLabel,
                    priority === pri.value && { color: pri.color, fontWeight: '700' },
                  ]}
                >
                  {pri.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <Text style={styles.label}>Customer Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={colors.textLight}
            value={customerName}
            onChangeText={setCustomerName}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Customer Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor={colors.textLight}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Customer Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+234 XXX XXX XXXX"
            placeholderTextColor={colors.textLight}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information (Optional)</Text>
          
          <Text style={styles.label}>Order ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., #3242"
            placeholderTextColor={colors.textLight}
            value={orderId}
            onChangeText={setOrderId}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createBtn, creating && styles.createBtnDisabled]}
          onPress={handleCreateTicket}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color={colors.textWhite} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color={colors.textWhite} />
              <Text style={styles.createBtnText}>Create Ticket</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: 16 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: { height: 120, textAlignVertical: 'top', paddingTop: 12 },
  charCount: { fontSize: 12, color: colors.textLight, marginTop: 4, textAlign: 'right' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '31%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryCardActive: { borderColor: colors.navy, backgroundColor: colors.navy + '05' },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 6 },
  categoryLabelActive: { color: colors.navy },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  createBtnDisabled: { backgroundColor: colors.border },
  createBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
});
