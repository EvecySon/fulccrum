import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { notificationsAPI } from '../../services/api';

const recentNotifications = [
  { id: '1', title: 'Weekend Sale!', body: '20% off all orders this weekend. Use code WEEKEND20', audience: 'all_customers', sentAt: '2 hrs ago', delivered: 12450, opened: 3200 },
  { id: '2', title: 'New Restaurant Alert', body: 'Seoul Kitchen just joined Fulccrum! Check out their menu.', audience: 'lekki_customers', sentAt: '1 day ago', delivered: 4500, opened: 1800 },
  { id: '3', title: 'Earn More Today!', body: 'Peak hours bonus active from 6-9 PM. Extra ₦500 per delivery!', audience: 'all_couriers', sentAt: '2 days ago', delivered: 185, opened: 142 },
  { id: '4', title: 'Update Your Menu', body: 'Valentine\'s Day is coming! Add special items to attract more orders.', audience: 'all_merchants', sentAt: '3 days ago', delivered: 320, opened: 210 },
];

const audienceOptions = [
  { key: 'all_customers', label: 'All Customers', icon: 'people', count: 145203 },
  { key: 'all_merchants', label: 'All Merchants', icon: 'storefront', count: 320 },
  { key: 'all_couriers', label: 'All Couriers', icon: 'bicycle', count: 185 },
  { key: 'all_users', label: 'Everyone', icon: 'globe', count: 145708 },
];

export default function PushNotificationScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all_customers');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await notificationsAPI.create({ title, body, audience });
      setSent(true);
      setTimeout(() => { setSent(false); setTitle(''); setBody(''); }, 2000);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setSending(false);
  };

  const selectedAudience = audienceOptions.find(a => a.key === audience);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Push Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Compose */}
        <View style={styles.composeCard}>
          <Text style={styles.composeTitle}>Send Notification</Text>

          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Notification title..."
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />
          <Text style={styles.charCount}>{title.length}/60</Text>

          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notification body..."
            placeholderTextColor={colors.textLight}
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{body.length}/200</Text>

          <Text style={styles.inputLabel}>Audience</Text>
          <View style={styles.audienceGrid}>
            {audienceOptions.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.audienceBtn, audience === opt.key && styles.audienceBtnActive]}
                onPress={() => setAudience(opt.key)}
              >
                <Ionicons name={opt.icon as any} size={18} color={audience === opt.key ? colors.textWhite : colors.textSecondary} />
                <Text style={[styles.audienceLabel, audience === opt.key && styles.audienceLabelActive]}>{opt.label}</Text>
                <Text style={[styles.audienceCount, audience === opt.key && styles.audienceCountActive]}>
                  {opt.count.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          {(title || body) && (
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewIcon}>
                  <Ionicons name="notifications" size={16} color={colors.teal} />
                </View>
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle} numberOfLines={1}>{title || 'Notification Title'}</Text>
                  <Text style={styles.previewBody} numberOfLines={2}>{body || 'Notification body text...'}</Text>
                </View>
                <Text style={styles.previewTime}>now</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.sendBtn, (!title.trim() || !body.trim()) && styles.sendBtnDisabled, sent && styles.sendBtnSent]}
            onPress={handleSend}
            disabled={sending || sent || !title.trim() || !body.trim()}
          >
            {sending ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : sent ? (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.textWhite} />
                <Text style={styles.sendBtnText}>Sent to {selectedAudience?.count.toLocaleString()} users</Text>
              </>
            ) : (
              <>
                <Ionicons name="send" size={18} color={colors.textWhite} />
                <Text style={styles.sendBtnText}>Send to {selectedAudience?.count.toLocaleString()} users</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Notifications */}
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        {recentNotifications.map(notif => {
          const openRate = ((notif.opened / notif.delivered) * 100).toFixed(0);
          return (
            <View key={notif.id} style={styles.notifCard}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
              <View style={styles.notifMeta}>
                <View style={styles.notifStat}>
                  <Ionicons name="send-outline" size={12} color={colors.textLight} />
                  <Text style={styles.notifStatText}>{notif.delivered.toLocaleString()} delivered</Text>
                </View>
                <View style={styles.notifStat}>
                  <Ionicons name="eye-outline" size={12} color={colors.textLight} />
                  <Text style={styles.notifStatText}>{notif.opened.toLocaleString()} opened ({openRate}%)</Text>
                </View>
                <Text style={styles.notifTime}>{notif.sentAt}</Text>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  composeCard: { backgroundColor: colors.white, margin: 16, borderRadius: 16, padding: 20 },
  composeTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.textPrimary, marginBottom: 4 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: colors.textLight, textAlign: 'right', marginBottom: 14 },
  audienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  audienceBtn: { width: '48%', flexDirection: 'column', alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, borderWidth: 2, borderColor: 'transparent' },
  audienceBtnActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  audienceLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  audienceLabelActive: { color: colors.textWhite },
  audienceCount: { fontSize: 11, color: colors.textLight },
  audienceCountActive: { color: colors.textWhite + '80' },
  preview: { marginBottom: 16 },
  previewLabel: { fontSize: 12, fontWeight: '600', color: colors.textLight, marginBottom: 8 },
  previewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 12, padding: 12, gap: 10 },
  previewIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.teal + '15', justifyContent: 'center', alignItems: 'center' },
  previewContent: { flex: 1 },
  previewTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  previewBody: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  previewTime: { fontSize: 11, color: colors.textLight },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnSent: { backgroundColor: colors.success },
  sendBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, paddingHorizontal: 16, marginBottom: 12 },
  notifCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  notifBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  notifMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  notifStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notifStatText: { fontSize: 12, color: colors.textSecondary },
  notifTime: { fontSize: 12, color: colors.textLight, marginLeft: 'auto' },
});
