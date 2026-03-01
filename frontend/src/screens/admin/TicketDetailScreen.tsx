import { showAlert } from '../../utils/alert';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ticketsAPI, type Ticket, type TicketMessage } from '../../services/ticketsAPI';
import { useAuth } from '../../contexts/AuthContext';
import websocketService from '../../services/websocketService';
import SLATracker from '../../components/SLATracker';
import ActionSheet from '../../components/ActionSheet';

const cannedResponses = [
  "Thank you for contacting us. I'm looking into your issue now.",
  "I apologize for the inconvenience. Let me help you resolve this.",
  "I've processed a refund for you. It should reflect in 3-5 business days.",
  "Your issue has been escalated to our senior team.",
  "Is there anything else I can help you with?",
];

export default function TicketDetailScreen({ route, navigation }: any) {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showPrioritySheet, setShowPrioritySheet] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const ticketData = await ticketsAPI.getTicket(ticketId);
      setTicket(ticketData);
      
      const messagesData = await ticketsAPI.getMessages(ticketId);
      setMessages(messagesData || []);
    } catch (error: any) {
      console.error('Error loading ticket:', error);
      showAlert('Error', error?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();

    websocketService.onNewMessage((data) => {
      if (data.ticketId === ticketId) {
        console.log('New message received:', data);
        setMessages(prev => [...prev, data.message]);
      }
    });

    websocketService.onTicketUpdated((data) => {
      if (data.ticketId === ticketId) {
        console.log('Ticket updated:', data);
        loadTicket();
      }
    });

    return () => {
      websocketService.removeAllListeners();
    };
  }, [ticketId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticket) return;

    try {
      setSending(true);
      await ticketsAPI.sendMessage(ticketId, { message: newMessage.trim() });
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      showAlert('Error', error?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const useCannedResponse = (response: string) => {
    setNewMessage(response);
    setShowCannedResponses(false);
  };

  const changeStatus = async (newStatus: string) => {
    if (!ticket) return;

    try {
      await ticketsAPI.updateStatus(ticketId, { status: newStatus });
      showAlert('Success', `Status changed to ${newStatus}`);
      setShowStatusSheet(false);
      loadTicket();
    } catch (error: any) {
      console.error('Error updating status:', error);
      showAlert('Error', error?.message || 'Failed to update status');
    }
  };

  const changePriority = async (newPriority: string) => {
    if (!ticket) return;

    try {
      await ticketsAPI.updatePriority(ticketId, newPriority);
      showAlert('Success', `Priority changed to ${newPriority}`);
      setShowPrioritySheet(false);
      loadTicket();
    } catch (error: any) {
      console.error('Error updating priority:', error);
      showAlert('Error', error?.message || 'Failed to update priority');
    }
  };

  const escalateTicket = async () => {
    if (!ticket) return;

    try {
      await ticketsAPI.updateStatus(ticketId, { status: 'ESCALATED' });
      showAlert('Success', 'Ticket escalated to senior support');
      loadTicket();
    } catch (error: any) {
      console.error('Error escalating ticket:', error);
      showAlert('Error', error?.message || 'Failed to escalate ticket');
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p?.toUpperCase()) {
      case 'URGENT':
      case 'HIGH': return colors.error;
      case 'MEDIUM': return colors.warning;
      default: return colors.info;
    }
  };

  const getStatusColor = (s: string) => {
    switch (s?.toUpperCase()) {
      case 'OPEN': return colors.error;
      case 'IN_PROGRESS': return colors.info;
      case 'RESOLVED': return colors.success;
      case 'CLOSED': return colors.textLight;
      case 'ESCALATED': return colors.warning;
      default: return colors.textLight;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading || !ticket) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading ticket...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Ticket #{ticketId.slice(0, 8)}</Text>
          <Text style={styles.headerSubtitle}>{ticket.customerName || ticket.customerEmail || 'Customer'}</Text>
        </View>
        <TouchableOpacity onPress={() => showAlert('Ticket Info', `Subject: ${ticket.subject}\nOrder: ${ticket.orderId || 'N/A'}\nCategory: ${ticket.category}\nPriority: ${ticket.priority}`)}>
          <Ionicons name="information-circle-outline" size={24} color={colors.navy} />
        </TouchableOpacity>
      </View>

      {/* SLA Tracker */}
      <SLATracker 
        createdAt={ticket.createdAt}
        firstResponseTime={ticket.firstResponseAt}
        status={ticket.status}
        priority={ticket.priority}
      />

      {/* Ticket Meta */}
      <View style={styles.metaBar}>
        <TouchableOpacity 
          style={[styles.metaChip, { backgroundColor: getStatusColor(ticket.status) + '15' }]}
          onPress={() => setShowStatusSheet(true)}
        >
          <Text style={[styles.metaChipText, { color: getStatusColor(ticket.status) }]}>
            {ticket.status.replace(/_/g, ' ')}
          </Text>
          <Ionicons name="chevron-down" size={12} color={getStatusColor(ticket.status)} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.metaChip, { backgroundColor: getPriorityColor(ticket.priority) + '15' }]}
          onPress={() => setShowPrioritySheet(true)}
        >
          <Text style={[styles.metaChipText, { color: getPriorityColor(ticket.priority) }]}>
            {ticket.priority}
          </Text>
          <Ionicons name="chevron-down" size={12} color={getPriorityColor(ticket.priority)} />
        </TouchableOpacity>

        {ticket.assignedAgent && (
          <View style={styles.assignedChip}>
            <Ionicons name="person-outline" size={12} color={colors.navy} />
            <Text style={styles.assignedText}>
              {ticket.assignedAgent.firstName} {ticket.assignedAgent.lastName}
            </Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyMessagesText}>No messages yet</Text>
            <Text style={styles.emptyMessagesSubtext}>Start the conversation</Text>
          </View>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.senderId === user?.id;
            const senderName = msg.sender 
              ? `${msg.sender.firstName} ${msg.sender.lastName}` 
              : 'System';
            
            return (
              <View 
                key={msg.id} 
                style={[
                  styles.messageRow,
                  isMyMessage && styles.messageRowAgent,
                ]}
              >
                {!isMyMessage && (
                  <View style={styles.messageAvatar}>
                    <Ionicons name="person" size={16} color={colors.navy} />
                  </View>
                )}
                
                <View style={[
                  styles.messageBubble,
                  isMyMessage && styles.messageBubbleAgent,
                ]}>
                  <Text style={styles.messageSender}>{senderName}</Text>
                  <Text style={[
                    styles.messageText,
                    isMyMessage && styles.messageTextAgent,
                  ]}>
                    {msg.message}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    isMyMessage && styles.messageTimeAgent,
                  ]}>
                    {formatTime(msg.createdAt)}
                  </Text>
                </View>

                {isMyMessage && (
                  <View style={[styles.messageAvatar, styles.messageAvatarAgent]}>
                    <Ionicons name="shield" size={16} color={colors.textWhite} />
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={escalateTicket}>
          <Ionicons name="arrow-up-circle-outline" size={18} color={colors.error} />
          <Text style={styles.quickActionText}>Escalate</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionBtn}
          onPress={() => setShowCannedResponses(!showCannedResponses)}
        >
          <Ionicons name="list-outline" size={18} color={colors.navy} />
          <Text style={styles.quickActionText}>Templates</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionBtn}
          onPress={() => changeStatus('RESOLVED')}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
          <Text style={styles.quickActionText}>Resolve</Text>
        </TouchableOpacity>
      </View>

      {/* Canned Responses */}
      {showCannedResponses && (
        <View style={styles.cannedResponsesContainer}>
          <Text style={styles.cannedTitle}>Quick Responses</Text>
          <ScrollView style={styles.cannedList} showsVerticalScrollIndicator={false}>
            {cannedResponses.map((response, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.cannedItem}
                onPress={() => useCannedResponse(response)}
              >
                <Text style={styles.cannedText}>{response}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={colors.textLight}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, (!newMessage.trim() || sending) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.textWhite} />
          ) : (
            <Ionicons name="send" size={20} color={colors.textWhite} />
          )}
        </TouchableOpacity>
      </View>

      {/* Status Action Sheet */}
      <ActionSheet
        visible={showStatusSheet}
        title="Change Status"
        message="Choose new status for this ticket"
        options={[
          {
            label: 'Open',
            icon: '🔴',
            color: colors.error,
            onPress: () => changeStatus('OPEN'),
          },
          {
            label: 'In Progress',
            icon: '🔵',
            color: colors.info,
            onPress: () => changeStatus('IN_PROGRESS'),
          },
          {
            label: 'Resolved',
            icon: '✅',
            color: colors.success,
            onPress: () => changeStatus('RESOLVED'),
          },
          {
            label: 'Closed',
            icon: '⚫',
            color: colors.textLight,
            onPress: () => changeStatus('CLOSED'),
          },
        ]}
        onClose={() => setShowStatusSheet(false)}
      />

      {/* Priority Action Sheet */}
      <ActionSheet
        visible={showPrioritySheet}
        title="Change Priority"
        message="Choose new priority level for this ticket"
        options={[
          {
            label: 'Low Priority',
            icon: '🟢',
            color: colors.info,
            onPress: () => changePriority('LOW'),
          },
          {
            label: 'Medium Priority',
            icon: '🟡',
            color: colors.warning,
            onPress: () => changePriority('MEDIUM'),
          },
          {
            label: 'High Priority',
            icon: '🔴',
            color: colors.error,
            onPress: () => changePriority('HIGH'),
          },
          {
            label: 'Urgent Priority',
            icon: '🚨',
            color: colors.error,
            onPress: () => changePriority('URGENT'),
          },
        ]}
        onClose={() => setShowPrioritySheet(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textLight },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 16,
    paddingBottom: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  metaBar: { flexDirection: 'row', padding: 12, backgroundColor: colors.white, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  metaChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  metaChipText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  assignedChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.navy + '10', gap: 4, marginLeft: 'auto' },
  assignedText: { fontSize: 12, fontWeight: '600', color: colors.navy },
  messagesContainer: { flex: 1, backgroundColor: colors.lightGray },
  messagesContent: { padding: 16, paddingBottom: 80 },
  emptyMessages: { alignItems: 'center', paddingVertical: 60 },
  emptyMessagesText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 12 },
  emptyMessagesSubtext: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  messageRowAgent: { flexDirection: 'row-reverse' },
  messageAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.navy + '10', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageAvatarAgent: { backgroundColor: colors.teal, marginRight: 0, marginLeft: 8 },
  messageBubble: { maxWidth: '75%', backgroundColor: colors.white, borderRadius: 16, padding: 12, borderBottomLeftRadius: 4 },
  messageBubbleAgent: { backgroundColor: colors.teal, borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  messageSender: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  messageText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  messageTextAgent: { color: colors.textWhite },
  messageTime: { fontSize: 10, color: colors.textLight, marginTop: 4 },
  messageTimeAgent: { color: 'rgba(255,255,255,0.7)' },
  quickActions: { flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.borderLight, gap: 12 },
  quickActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: colors.lightGray, gap: 6 },
  quickActionText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  cannedResponsesContainer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borderLight, maxHeight: 200 },
  cannedTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, padding: 12, paddingBottom: 8 },
  cannedList: { maxHeight: 160 },
  cannedItem: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  cannedText: { fontSize: 13, color: colors.textSecondary },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.borderLight, gap: 10 },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, maxHeight: 100, paddingVertical: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: colors.border },
});
