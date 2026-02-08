import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { chatAPI } from '../../services/api';

const chatMessages = [
  { id: '1', sender: 'support', text: 'Hi John! Welcome to Fulccrum support. How can I help you today?', time: '2:30 PM' },
  { id: '2', sender: 'user', text: 'Hi, I have a question about my recent order #3242', time: '2:31 PM' },
  { id: '3', sender: 'support', text: 'Of course! I can see order #3242 from Pizza Roma. What seems to be the issue?', time: '2:31 PM' },
  { id: '4', sender: 'user', text: 'One of the items was missing from my order. I ordered a Caesar Salad but it wasn\'t in the bag.', time: '2:32 PM' },
  { id: '5', sender: 'support', text: 'I\'m sorry to hear that! Let me look into this for you. I can see the Caesar Salad (₦3,000) was part of your order. I\'ll process a refund for that item right away.', time: '2:33 PM' },
  { id: '6', sender: 'support', text: 'I\'ve initiated a refund of ₦3,000 to your original payment method. It should appear within 1-3 business days. Is there anything else I can help with?', time: '2:33 PM' },
];

const quickReplies = [
  'Order issue',
  'Refund status',
  'Account help',
  'Delivery problem',
];

export default function ChatScreen({ navigation }: any) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(chatMessages);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const newMsg = {
      id: String(messages.length + 1),
      sender: 'user',
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setMessage('');
    try {
      await chatAPI.sendMessage('support', { text: newMsg.text });
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.supportAvatar}>
            <Ionicons name="headset" size={18} color={colors.textWhite} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Support</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="call-outline" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        <View style={styles.dateLabel}>
          <Text style={styles.dateLabelText}>Today</Text>
        </View>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.supportBubble]}
          >
            <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.supportText]}>
              {msg.text}
            </Text>
            <Text style={[styles.messageTime, msg.sender === 'user' ? styles.userTime : styles.supportTime]}>
              {msg.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Quick Replies */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.quickReplies}>
        {quickReplies.map((reply, index) => (
          <TouchableOpacity key={index} style={styles.quickReply} onPress={() => setMessage(reply)}>
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="attach" size={22} color={colors.textLight} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  supportAvatar: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: colors.teal,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  onlineText: { fontSize: 11, color: colors.tealLight },
  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 8 },
  dateLabel: { alignItems: 'center', marginBottom: 16 },
  dateLabelText: { fontSize: 12, color: colors.textLight, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 10 },
  messageBubble: { maxWidth: '80%', borderRadius: 18, padding: 14, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.navy, borderBottomRightRadius: 4 },
  supportBubble: { alignSelf: 'flex-start', backgroundColor: colors.white, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: colors.textWhite },
  supportText: { color: colors.textPrimary },
  messageTime: { fontSize: 10, marginTop: 4 },
  userTime: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  supportTime: { color: colors.textLight },
  quickReplies: { paddingHorizontal: 10, paddingVertical: 8, gap: 8, alignItems: 'center' },
  quickReply: { backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: colors.teal + '30', height: 40, justifyContent: 'center' },
  quickReplyText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', backgroundColor: colors.white,
    marginHorizontal: 10, marginBottom: 10, borderRadius: 24, padding: 6, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },
  attachBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 8, maxHeight: 100 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.teal,
    justifyContent: 'center', alignItems: 'center',
  },
});
