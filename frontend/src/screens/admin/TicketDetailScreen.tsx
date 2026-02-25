import { showAlert } from '../../utils/alert';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { supportAPI } from '../../services/api';
import SLATracker from '../../components/SLATracker';
import ActionSheet from '../../components/ActionSheet';
import RefundActionSheet from '../../components/RefundActionSheet';

interface Message {
  id: string;
  sender: 'customer' | 'merchant' | 'courier' | 'agent' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
  attachment?: string;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

const mockMessages: Message[] = [
  { id: '1', sender: 'customer', senderName: 'Adaeze O.', message: 'Hi, I ordered food 2 hours ago and one item is missing from my order.', timestamp: '2:30 PM', attachment: undefined },
  { id: '2', sender: 'system', senderName: 'System', message: 'Ticket created and assigned to support team', timestamp: '2:31 PM', attachment: undefined },
  { id: '3', sender: 'agent', senderName: 'Agent Sarah', message: 'Hello Adaeze, I apologize for the inconvenience. Let me check your order details.', timestamp: '2:35 PM', attachment: undefined },
  { id: '4', sender: 'customer', senderName: 'Adaeze O.', message: 'Thank you. The missing item is the chicken wings.', timestamp: '2:36 PM', attachment: undefined },
  { id: '5', sender: 'agent', senderName: 'Agent Sarah', message: 'I can see the issue. I will process a refund for the missing item right away.', timestamp: '2:38 PM', attachment: undefined },
];

const mockAgents: Agent[] = [
  { id: '1', name: 'Agent Sarah', avatar: 'https://i.pravatar.cc/100?img=1', status: 'online' },
  { id: '2', name: 'Agent Mike', avatar: 'https://i.pravatar.cc/100?img=2', status: 'online' },
  { id: '3', name: 'Agent John', avatar: 'https://i.pravatar.cc/100?img=3', status: 'busy' },
  { id: '4', name: 'Agent Lisa', avatar: 'https://i.pravatar.cc/100?img=4', status: 'offline' },
];

const cannedResponses = [
  "Thank you for contacting us. I'm looking into your issue now.",
  "I apologize for the inconvenience. Let me help you resolve this.",
  "I've processed a refund for you. It should reflect in 3-5 business days.",
  "Your issue has been escalated to our senior team.",
  "Is there anything else I can help you with?",
];

export default function TicketDetailScreen({ route, navigation }: any) {
  const { ticket } = route.params;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assignedAgent, setAssignedAgent] = useState(ticket.assignedTo);
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showPrioritySheet, setShowPrioritySheet] = useState(false);
  const [showRefundSheet, setShowRefundSheet] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      senderName: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    showAlert('Success', 'Message sent');
  };

  const useCannedResponse = (response: string) => {
    setNewMessage(response);
    setShowCannedResponses(false);
  };

  const changeStatus = (newStatus: string) => {
    setStatus(newStatus);
    const systemMessage: Message = {
      id: Date.now().toString(),
      sender: 'system',
      senderName: 'System',
      message: `Ticket status changed to ${newStatus}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages([...messages, systemMessage]);
    showAlert('Success', `Status changed to ${newStatus}`);
  };

  const changePriority = (newPriority: string) => {
    setPriority(newPriority);
    showAlert('Success', `Priority changed to ${newPriority}`);
  };

  const assignToAgent = (agent: Agent) => {
    setAssignedAgent(agent.name);
    setShowAgentPicker(false);
    const systemMessage: Message = {
      id: Date.now().toString(),
      sender: 'system',
      senderName: 'System',
      message: `Ticket assigned to ${agent.name}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages([...messages, systemMessage]);
    showAlert('Success', `Assigned to ${agent.name}`);
  };

  const issueRefund = () => {
    setShowRefundSheet(true);
  };

  const processRefund = (amount: string, type: string, destination: string, chargedTo: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      sender: 'system',
      senderName: 'System',
      message: `Refund of ${amount} processed successfully\nType: ${type}\nDestination: ${destination}\nCharged to: ${chargedTo}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages([...messages, systemMessage]);
    showAlert('Success', `Refund of ${amount} processed to ${destination}`);
  };

  const escalateTicket = () => {
    showAlert('Escalate Ticket', 'Escalate this ticket to senior support?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Escalate',
        onPress: () => {
          const systemMessage: Message = {
            id: Date.now().toString(),
            sender: 'system',
            senderName: 'System',
            message: 'Ticket escalated to Senior Support Team',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          };
          setMessages([...messages, systemMessage]);
          setPriority('high');
          showAlert('Success', 'Ticket escalated');
        }
      }
    ]);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.info;
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'open': return colors.error;
      case 'in_progress': return colors.info;
      case 'resolved': return colors.success;
      default: return colors.textLight;
    }
  };

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
          <Text style={styles.headerTitle}>Ticket #{ticket.id}</Text>
          <Text style={styles.headerSubtitle}>{ticket.user}</Text>
        </View>
        <TouchableOpacity onPress={() => showAlert('Ticket Info', `Subject: ${ticket.subject}\nOrder: ${ticket.orderId || 'N/A'}\nCategory: ${ticket.category}`)}>
          <Ionicons name="information-circle-outline" size={24} color={colors.navy} />
        </TouchableOpacity>
      </View>

      {/* SLA Tracker */}
      <SLATracker 
        createdAt={ticket.createdAt}
        firstResponseTime={messages.find(m => m.sender === 'agent')?.timestamp}
        status={status}
        priority={priority}
      />

      {/* Ticket Meta */}
      <View style={styles.metaBar}>
        <TouchableOpacity 
          style={[styles.metaChip, { backgroundColor: getStatusColor(status) + '15' }]}
          onPress={() => setShowStatusSheet(true)}
        >
          <Text style={[styles.metaChipText, { color: getStatusColor(status) }]}>{status.replace('_', ' ')}</Text>
          <Ionicons name="chevron-down" size={12} color={getStatusColor(status)} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.metaChip, { backgroundColor: getPriorityColor(priority) + '15' }]}
          onPress={() => setShowPrioritySheet(true)}
        >
          <Text style={[styles.metaChipText, { color: getPriorityColor(priority) }]}>{priority}</Text>
          <Ionicons name="chevron-down" size={12} color={getPriorityColor(priority)} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.assignedChip}
          onPress={() => setShowAgentPicker(!showAgentPicker)}
        >
          <Ionicons name="person-outline" size={12} color={colors.navy} />
          <Text style={styles.assignedText}>{assignedAgent || 'Unassigned'}</Text>
          <Ionicons name="chevron-down" size={12} color={colors.navy} />
        </TouchableOpacity>
      </View>

      {/* Agent Picker */}
      {showAgentPicker && (
        <View style={styles.agentPicker}>
          <Text style={styles.pickerTitle}>Assign to Agent</Text>
          <ScrollView style={styles.agentList} showsVerticalScrollIndicator={false}>
            {mockAgents.map(agent => (
            <TouchableOpacity 
              key={agent.id} 
              style={styles.agentOption}
              onPress={() => assignToAgent(agent)}
            >
              <Image source={{ uri: agent.avatar }} style={styles.agentAvatar} />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agent.name}</Text>
                <View style={styles.agentStatusRow}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: agent.status === 'online' ? colors.success : 
                                   agent.status === 'busy' ? colors.warning : colors.textLight 
                  }]} />
                  <Text style={styles.agentStatus}>{agent.status}</Text>
                </View>
              </View>
              {assignedAgent === agent.name && (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              )}
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>
      )}

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageRow,
              msg.sender === 'agent' && styles.messageRowAgent,
              msg.sender === 'system' && styles.messageRowSystem,
            ]}
          >
            {msg.sender !== 'agent' && msg.sender !== 'system' && (
              <View style={styles.messageAvatar}>
                <Ionicons 
                  name={msg.sender === 'customer' ? 'person' : msg.sender === 'merchant' ? 'storefront' : 'bicycle'} 
                  size={16} 
                  color={colors.navy} 
                />
              </View>
            )}
            
            <View style={[
              styles.messageBubble,
              msg.sender === 'agent' && styles.messageBubbleAgent,
              msg.sender === 'system' && styles.messageBubbleSystem,
            ]}>
              {msg.sender !== 'system' && (
                <Text style={styles.messageSender}>{msg.senderName}</Text>
              )}
              <Text style={[
                styles.messageText,
                msg.sender === 'agent' && styles.messageTextAgent,
                msg.sender === 'system' && styles.messageTextSystem,
              ]}>
                {msg.message}
              </Text>
              <Text style={[
                styles.messageTime,
                msg.sender === 'agent' && styles.messageTimeAgent,
              ]}>
                {msg.timestamp}
              </Text>
            </View>

            {msg.sender === 'agent' && (
              <View style={[styles.messageAvatar, styles.messageAvatarAgent]}>
                <Ionicons name="shield" size={16} color={colors.textWhite} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={issueRefund}>
          <Ionicons name="cash-outline" size={18} color={colors.success} />
          <Text style={styles.quickActionText}>Refund</Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="attach-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
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
          style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color={colors.textWhite} />
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
            onPress: () => changeStatus('open'),
          },
          {
            label: 'In Progress',
            icon: '🔵',
            color: colors.info,
            onPress: () => changeStatus('in_progress'),
          },
          {
            label: 'Resolved',
            icon: '✅',
            color: colors.success,
            onPress: () => changeStatus('resolved'),
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
            onPress: () => changePriority('low'),
          },
          {
            label: 'Medium Priority',
            icon: '🟡',
            color: colors.warning,
            onPress: () => changePriority('medium'),
          },
          {
            label: 'High Priority',
            icon: '🔴',
            color: colors.error,
            onPress: () => changePriority('high'),
          },
        ]}
        onClose={() => setShowPrioritySheet(false)}
      />

      {/* Refund Action Sheet */}
      <RefundActionSheet
        visible={showRefundSheet}
        orderDetails={{
          orderId: ticket.orderId || '#3242',
          total: '₦2,450',
          items: ['Jollof Rice with Chicken', 'Fried Plantain', 'Chicken Wings', 'Coleslaw'],
          reportedIssue: ticket.subject || 'Missing item from order',
          customerName: ticket.user,
        }}
        customerHistory={{
          totalOrders: 12,
          totalRefunds: 2,
          refundRate: 16.7,
          trustScore: 'high',
          lastRefund: '2 months ago',
        }}
        onRefund={processRefund}
        onClose={() => setShowRefundSheet(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
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
  agentPicker: { backgroundColor: colors.white, marginHorizontal: 12, marginTop: 8, borderRadius: 12, padding: 12, maxHeight: 250 },
  pickerTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  agentList: { maxHeight: 200 },
  agentOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  agentAvatar: { width: 36, height: 36, borderRadius: 18 },
  agentInfo: { flex: 1, marginLeft: 10 },
  agentName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  agentStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  agentStatus: { fontSize: 11, color: colors.textLight, textTransform: 'capitalize' },
  messagesContainer: { flex: 1, backgroundColor: colors.lightGray },
  messagesContent: { padding: 16, paddingBottom: 80 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  messageRowAgent: { flexDirection: 'row-reverse' },
  messageRowSystem: { justifyContent: 'center' },
  messageAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.navy + '10', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  messageAvatarAgent: { backgroundColor: colors.teal, marginRight: 0, marginLeft: 8 },
  messageBubble: { maxWidth: '75%', backgroundColor: colors.white, borderRadius: 16, padding: 12, borderBottomLeftRadius: 4 },
  messageBubbleAgent: { backgroundColor: colors.teal, borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  messageBubbleSystem: { backgroundColor: colors.borderLight, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  messageSender: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  messageText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  messageTextAgent: { color: colors.textWhite },
  messageTextSystem: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
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
  attachBtn: { padding: 4 },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, maxHeight: 100, paddingVertical: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: colors.border },
});
