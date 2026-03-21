import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { supportAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: '#ef4444', bg: '#fef2f2' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
  resolved:    { label: 'Resolved',    color: '#10b981', bg: '#f0fdf4' },
  closed:      { label: 'Closed',      color: '#64748b', bg: '#f8fafc' },
};

interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  orderId?: string;
  createdAt: string;
  messages: Message[];
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function CustomerTicketDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { ticketId } = (route.params as any) || {};
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTicket = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data: Ticket = await supportAPI.getTicket(ticketId) as any;
      setTicket(data);
      const msgs = (data.messages || []).filter((m: Message) => !m.isInternal);
      setMessages(msgs);
    } catch (err: any) {
      if (!silent) {
        Alert.alert('Error', err?.message || 'Failed to load ticket');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTicket();

      // Poll for new messages every 10 seconds while screen is focused
      pollRef.current = setInterval(() => {
        loadTicket(true);
      }, 10000);

      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [ticketId])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !ticket) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      setSending(true);
      await supportAPI.addMessage(ticketId, { message: text });
      await loadTicket(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send message');
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  const isAgentMessage = (msg: Message) => {
    const role = msg.sender?.role?.toLowerCase() || '';
    return role === 'admin' || role === 'support_agent';
  };

  const isMyMessage = (msg: Message) => {
    return msg.senderId === user?.id;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    msgs.forEach(msg => {
      const dateKey = new Date(msg.createdAt).toDateString();
      const existing = groups.find(g => g.date === dateKey);
      if (existing) {
        existing.messages.push(msg);
      } else {
        groups.push({ date: dateKey, messages: [msg] });
      }
    });
    return groups;
  };

  if (loading || !ticket) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const messageGroups = groupMessagesByDate(messages);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{ticket.subject}</Text>
          <Text style={styles.headerSub}>{ticket.ticketNumber}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusChipText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      {/* Order ref banner */}
      {ticket.orderId && (
        <View style={styles.orderBanner}>
          <Ionicons name="cube-outline" size={14} color="#14b8a6" />
          <Text style={styles.orderBannerText}>Re: Order #{ticket.orderId}</Text>
        </View>
      )}

      {/* Resolved banner */}
      {(ticket.status === 'resolved' || ticket.status === 'closed') && (
        <View style={styles.resolvedBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.resolvedBannerText}>
            This ticket has been {ticket.status}. Reply to reopen it.
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ticket description as first bubble */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>{formatDateHeader(ticket.createdAt)}</Text>
        </View>
        <View style={[styles.messageRow, styles.messageRowCustomer]}>
          <View style={[styles.messageBubble, styles.messageBubbleCustomer]}>
            <Text style={styles.senderLabel}>You</Text>
            <Text style={styles.messageText}>{ticket.description}</Text>
            <Text style={[styles.messageTime, styles.messageTimeCustomer]}>
              {formatTime(ticket.createdAt)}
            </Text>
          </View>
          <View style={[styles.avatar, styles.avatarCustomer]}>
            <Ionicons name="person" size={14} color="#fff" />
          </View>
        </View>

        {messageGroups.map((group) => (
          <View key={group.date}>
            {group.messages.map((msg, idx) => {
              const mine = isMyMessage(msg);
              const agent = isAgentMessage(msg);
              const senderName = agent
                ? `${msg.sender?.firstName || 'Support'} ${msg.sender?.lastName || 'Agent'}`
                : 'You';

              return (
                <View
                  key={msg.id}
                  style={[styles.messageRow, mine && styles.messageRowCustomer]}
                >
                  {!mine && (
                    <View style={[styles.avatar, styles.avatarAgent]}>
                      <Ionicons name="shield-checkmark" size={14} color="#fff" />
                    </View>
                  )}

                  <View style={[
                    styles.messageBubble,
                    mine ? styles.messageBubbleCustomer : styles.messageBubbleAgent,
                  ]}>
                    <Text style={styles.senderLabel}>{senderName}</Text>
                    <Text style={[
                      styles.messageText,
                      mine && styles.messageTextCustomer,
                    ]}>
                      {msg.message}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      mine && styles.messageTimeCustomer,
                    ]}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>

                  {mine && (
                    <View style={[styles.avatar, styles.avatarCustomer]}>
                      <Ionicons name="person" size={14} color="#fff" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {messages.length === 0 && (
          <View style={styles.noRepliesInfo}>
            <Ionicons name="time-outline" size={28} color="#94a3b8" />
            <Text style={styles.noRepliesText}>Waiting for a support agent to reply</Text>
            <Text style={styles.noRepliesSubtext}>We typically respond within a few hours</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a reply..."
          placeholderTextColor="#94a3b8"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!newMessage.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexShrink: 0,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdfa',
    borderBottomWidth: 1,
    borderBottomColor: '#99f6e4',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderBannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f766e',
  },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resolvedBannerText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateHeaderText: {
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 8,
  },
  messageRowCustomer: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarAgent: {
    backgroundColor: '#14b8a6',
  },
  avatarCustomer: {
    backgroundColor: '#6366f1',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleAgent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  messageBubbleCustomer: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    color: '#0f172a',
    lineHeight: 20,
  },
  messageTextCustomer: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'right',
  },
  messageTimeCustomer: {
    color: 'rgba(255,255,255,0.7)',
  },
  noRepliesInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 6,
  },
  noRepliesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  noRepliesSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
