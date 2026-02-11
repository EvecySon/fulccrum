import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { supportAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const quickReplies = [
  'Order issue',
  'Refund status',
  'Account help',
  'Delivery problem',
];

export default function ChatScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const ticketIdParam = route?.params?.ticketId;

  const [ticketId, setTicketId] = useState<string | null>(ticketIdParam || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ticketStatus, setTicketStatus] = useState('');

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    setLoading(true);
    try {
      if (ticketIdParam) {
        // Load specific ticket
        const ticket = await supportAPI.getTicket(ticketIdParam);
        setTicketId(ticket.id);
        setTicketStatus(ticket.status);
        setMessages(formatMessages(ticket.messages || [], ticket));
      } else {
        // Find most recent open ticket or show empty
        const res = await supportAPI.getTickets({ status: 'open' });
        const tickets = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (tickets.length > 0) {
          const ticket = await supportAPI.getTicket(tickets[0].id);
          setTicketId(ticket.id);
          setTicketStatus(ticket.status);
          setMessages(formatMessages(ticket.messages || [], ticket));
        }
        // else: no open ticket, show welcome state
      }
    } catch (e: any) {
      // Only show error if it's not a "no tickets" scenario
      const status = e?.status || e?.response?.status;
      if (status === 401) {
        Alert.alert('Session Expired', 'Please log in again to use support chat.');
      }
      // 404 or empty results are fine — means no tickets yet
    }
    setLoading(false);
  };

  const formatMessages = (msgs: any[], ticket: any) => {
    const formatted: any[] = [];
    // Add initial ticket description as first message
    if (ticket.description) {
      formatted.push({
        id: 'ticket-desc',
        sender: 'user',
        text: ticket.subject ? `${ticket.subject}\n\n${ticket.description}` : ticket.description,
        time: formatTime(ticket.createdAt),
      });
    }
    msgs.forEach((m: any) => {
      const isSupport = m.sender?.role === 'admin' || m.sender?.role === 'support_agent';
      formatted.push({
        id: m.id,
        sender: isSupport ? 'support' : 'user',
        text: m.message,
        time: formatTime(m.createdAt),
        senderName: isSupport ? `${m.sender?.firstName || 'Support'}` : undefined,
      });
    });
    return formatted;
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const text = message.trim();
    setSending(true);
    setMessage('');

    // Optimistic UI — add message immediately
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pending: true,
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      let currentTicketId = ticketId;

      if (!currentTicketId) {
        // Create a new support ticket with first message
        const ticket = await supportAPI.createTicket({
          subject: text.length > 60 ? text.slice(0, 60) + '...' : text,
          description: text,
          category: 'other',
          priority: 'medium',
        });
        currentTicketId = ticket.id;
        setTicketId(ticket.id);
        setTicketStatus(ticket.status || 'open');
      } else {
        // Add message to existing ticket
        await supportAPI.addMessage(currentTicketId, { message: text });
      }

      // Reload ticket to get server-confirmed messages
      if (currentTicketId) {
        try {
          const ticket = await supportAPI.getTicket(currentTicketId);
          setMessages(formatMessages(ticket.messages || [], ticket));
          setTicketStatus(ticket.status);
        } catch {
          // If reload fails, keep the optimistic message but mark as sent
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending: false } : m));
        }
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.data?.message || e?.message || 'Could not send message';
      Alert.alert('Send Failed', typeof msg === 'string' ? msg : JSON.stringify(msg));
      // Mark message as failed instead of removing it
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending: false, failed: true } : m));
    }
    setSending(false);
  };

  const pickAndSendImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const tempId = `temp-img-${Date.now()}`;
      const tempMsg = {
        id: tempId,
        sender: 'user',
        text: '',
        imageUri: asset.uri,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pending: true,
      };
      setMessages(prev => [...prev, tempMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      // Upload image
      const formData = new FormData();
      const filename = asset.uri.split('/').pop() || 'photo.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      formData.append('file', { uri: asset.uri, name: filename, type: mimeType } as any);
      const uploadRes = await uploadAPI.uploadImage(formData);
      const imageUrl = uploadRes?.url || uploadRes?.fileUrl || asset.uri;

      // Send as message with attachment
      let currentTicketId = ticketId;
      if (!currentTicketId) {
        const ticket = await supportAPI.createTicket({
          subject: 'Image attachment',
          description: '[Image]',
          category: 'other',
          priority: 'medium',
          attachments: [imageUrl],
        });
        currentTicketId = ticket.id;
        setTicketId(ticket.id);
        setTicketStatus(ticket.status || 'open');
      } else {
        await supportAPI.addMessage(currentTicketId, {
          message: '[Image]',
          attachments: [imageUrl],
        });
      }

      // Reload
      if (currentTicketId) {
        try {
          const ticket = await supportAPI.getTicket(currentTicketId);
          setMessages(formatMessages(ticket.messages || [], ticket));
        } catch {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending: false } : m));
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not send image');
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
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
              <View style={[styles.onlineDot, { backgroundColor: ticketStatus === 'in_progress' ? colors.success : colors.textLight }]} />
              <Text style={styles.onlineText}>
                {ticketStatus === 'in_progress' ? 'Agent assigned' : ticketStatus === 'resolved' ? 'Resolved' : ticketStatus === 'closed' ? 'Closed' : 'Online'}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading conversation...</Text>
        </View>
      ) : (
        <ScrollView ref={scrollRef} style={styles.chatArea} contentContainerStyle={styles.chatContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {messages.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 }}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 16 }}>How can we help?</Text>
              <Text style={{ fontSize: 13, color: colors.textLight, textAlign: 'center', marginTop: 8 }}>
                Send a message or tap a quick reply below to start a conversation with our support team.
              </Text>
            </View>
          )}
          {messages.length > 0 && (
            <View style={styles.dateLabel}>
              <Text style={styles.dateLabelText}>Today</Text>
            </View>
          )}
          {messages.map((msg: any) => (
            <View
              key={msg.id}
              style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.supportBubble, msg.failed && { opacity: 0.6 }]}
            >
              {msg.senderName && (
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.teal, marginBottom: 4 }}>{msg.senderName}</Text>
              )}
              <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.supportText]}>
                {msg.text}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 4, marginTop: 4 }}>
                <Text style={[styles.messageTime, msg.sender === 'user' ? styles.userTime : styles.supportTime, { marginTop: 0 }]}>
                  {msg.pending ? 'Sending...' : msg.failed ? 'Failed' : msg.time}
                </Text>
                {msg.failed && (
                  <TouchableOpacity onPress={() => {
                    setMessages(prev => prev.filter(m => m.id !== msg.id));
                    setMessage(msg.text);
                  }}>
                    <Text style={{ fontSize: 10, color: '#ff6b6b', fontWeight: '700' }}>Retry</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Quick Replies */}
      {messages.length === 0 && !loading && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.quickReplies}>
          {quickReplies.map((reply, index) => (
            <TouchableOpacity key={index} style={styles.quickReply} onPress={() => handleQuickReply(reply)}>
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn} onPress={pickAndSendImage}>
          <Ionicons name="image-outline" size={22} color={colors.textLight} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, sending && { opacity: 0.5 }]} onPress={sendMessage} disabled={sending}>
          {sending ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Ionicons name="send" size={20} color={colors.textWhite} />}
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
