import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { chatAPI } from '../../services/api';
import { onSocketEvent, emitSocketEvent, connectSocket } from '../../services/socketService';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isMe: boolean;
  type: 'text' | 'image' | 'system';
}

export default function ChatScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const orderId = route?.params?.orderId;
  const recipientName = route?.params?.recipientName || 'Order Chat';
  const recipientAvatar = route?.params?.recipientAvatar;
  const recipientRole = route?.params?.recipientRole || 'merchant';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const mapApiMessages = useCallback((apiMessages: any[]): Message[] => {
    return apiMessages.map((m: any) => ({
      id: m.id,
      text: m.content,
      senderId: m.senderId || m.sender?.id,
      senderName: m.sender ? `${m.sender.firstName} ${m.sender.lastName}` : 'Unknown',
      senderAvatar: m.sender?.avatarUrl,
      timestamp: formatTime(m.createdAt),
      isMe: (m.senderId || m.sender?.id) === user?.id,
      type: m.type || 'text',
    }));
  }, [user?.id]);

  // Load conversation and messages
  useEffect(() => {
    const loadChat = async () => {
      setLoading(true);
      try {
        // Get or create conversation for this order
        const convo = await chatAPI.getConversation(orderId);
        const convoData = convo?.data || convo;
        setConversationId(convoData.id);

        // Load messages
        const msgRes = await chatAPI.getMessages(convoData.id);
        const msgData = msgRes?.data?.data || msgRes?.data || [];
        setMessages(mapApiMessages(Array.isArray(msgData) ? msgData : []));
      } catch (e: any) {
        // If conversation doesn't exist for this order, try order endpoint
        try {
          const convo = await chatAPI.getConversation(orderId);
          const convoData = convo?.data || convo;
          setConversationId(convoData.id);
        } catch {
          // No conversation yet — will create on first message
        }
      }
      setLoading(false);
    };

    if (orderId) {
      loadChat();
    } else {
      setLoading(false);
    }
  }, [orderId, mapApiMessages]);

  // Connect socket and listen for real-time events
  useEffect(() => {
    connectSocket();

    if (!conversationId) return;

    // Join conversation room
    emitSocketEvent('chat:join', { conversationId });

    // Listen for new messages
    const unsubMessage = onSocketEvent('chat:message', (data: any) => {
      if (data.conversationId !== conversationId) return;
      const msg = data.message;
      if (msg.senderId === user?.id) return; // Skip own messages (already added optimistically)

      const newMsg: Message = {
        id: msg.id,
        text: msg.content,
        senderId: msg.senderId || msg.sender?.id,
        senderName: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : recipientName,
        senderAvatar: msg.sender?.avatarUrl || recipientAvatar,
        timestamp: formatTime(msg.createdAt),
        isMe: false,
        type: msg.type || 'text',
      };
      setMessages((prev) => [...prev, newMsg]);
    });

    // Listen for typing indicators
    const unsubTyping = onSocketEvent('chat:typing', (data: any) => {
      if (data.conversationId !== conversationId) return;
      if (data.userId === user?.id) return;
      setIsTyping(data.isTyping);
      setTypingUser(data.isTyping ? recipientName : '');
    });

    return () => {
      emitSocketEvent('chat:leave', { conversationId });
      unsubMessage();
      unsubTyping();
    };
  }, [conversationId, user?.id, recipientName, recipientAvatar]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      text,
      senderId: user?.id || 'me',
      senderName: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text',
    };
    setMessages((prev) => [...prev, newMsg]);

    try {
      let currentConvoId = conversationId;

      if (!currentConvoId && orderId) {
        // Create conversation via API
        const convo = await chatAPI.getConversation(orderId);
        const convoData = convo?.data || convo;
        currentConvoId = convoData.id;
        setConversationId(convoData.id);
        emitSocketEvent('chat:join', { conversationId: convoData.id });
      }

      if (currentConvoId) {
        const res = await chatAPI.sendMessage(currentConvoId, { text });
        const sentMsg = res?.data || res;
        // Replace temp message with server-confirmed message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: sentMsg.id } : m)),
        );
      }
    } catch {
      // Mark as failed
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, text: `${text} (failed)` } : m)),
      );
    }

    // Stop typing indicator for recipients
    if (conversationId) {
      emitSocketEvent('chat:typing', { conversationId, isTyping: false });
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    // Emit typing indicator
    if (conversationId) {
      emitSocketEvent('chat:typing', { conversationId, isTyping: true });

      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        emitSocketEvent('chat:typing', { conversationId, isTyping: false });
      }, 2000);
    }
  };

  const handleCall = (type: 'voice' | 'video') => {
    navigation.navigate('Call', {
      orderId,
      recipientName,
      recipientAvatar,
      recipientRole,
      callType: type,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMsg}>
          <Text style={styles.systemMsgText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.msgRow, item.isMe && styles.msgRowMe]}>
        {!item.isMe && (
          <Image
            source={{ uri: item.senderAvatar || 'https://i.pravatar.cc/150?img=1' }}
            style={styles.msgAvatar}
          />
        )}
        <View style={[styles.msgBubble, item.isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          {!item.isMe && <Text style={styles.msgSender}>{item.senderName}</Text>}
          <Text style={[styles.msgText, item.isMe && styles.msgTextMe]}>{item.text}</Text>
          <Text style={[styles.msgTime, item.isMe && styles.msgTimeMe]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{recipientName}</Text>
          <Text style={styles.headerSub}>Order {orderId}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} onPress={() => handleCall('voice')}>
            <Ionicons name="call" size={20} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={() => handleCall('video')}>
            <Ionicons name="videocam" size={20} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 12 }}>No messages yet. Say hello!</Text>
            </View>
          }
        />
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingRow}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { opacity: 0.4 }]} />
            <View style={[styles.typingDot, { opacity: 0.7 }]} />
            <View style={styles.typingDot} />
          </View>
          <Text style={styles.typingText}>{typingUser || recipientName} is typing...</Text>
        </View>
      )}

      {/* Quick Replies */}
      <View style={styles.quickReplies}>
        {['On my way!', 'Running late', 'I\'m here', 'Thank you!'].map((reply) => (
          <TouchableOpacity
            key={reply}
            style={styles.quickReplyBtn}
            onPress={() => {
              setInputText(reply);
            }}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="add-circle" size={28} color={colors.teal} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color={inputText.trim() ? colors.textWhite : colors.textLight} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textWhite,
  },
  headerSub: {
    fontSize: 12,
    color: colors.tealLight,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowMe: {
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  msgBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
    paddingBottom: 6,
  },
  msgBubbleMe: {
    backgroundColor: colors.teal,
    borderBottomRightRadius: 4,
  },
  msgBubbleOther: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  msgSender: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 2,
  },
  msgText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  msgTextMe: {
    color: colors.textWhite,
  },
  msgTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  systemMsg: {
    alignItems: 'center',
    marginVertical: 12,
  },
  systemMsgText: {
    fontSize: 12,
    color: colors.textLight,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textLight,
  },
  typingText: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  quickReplies: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    flexWrap: 'wrap',
  },
  quickReplyBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.teal,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 8,
  },
  attachBtn: {
    paddingBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 80,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.lightGray,
  },
});
