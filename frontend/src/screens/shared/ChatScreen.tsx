import React, { useState, useRef, useEffect } from 'react';
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
import { onChatMessage, sendChatMessage } from '../../services/socketService';

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

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hi! I just placed my order. Can I add extra sauce?',
    senderId: 'customer-1',
    senderName: 'You',
    timestamp: '2:30 PM',
    isMe: true,
    type: 'text',
  },
  {
    id: '2',
    text: 'Of course! We\'ll add extra sauce to your order. No extra charge 😊',
    senderId: 'merchant-1',
    senderName: 'Burger House',
    senderAvatar: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop',
    timestamp: '2:31 PM',
    isMe: false,
    type: 'text',
  },
  {
    id: '3',
    text: 'Thank you so much! 🙏',
    senderId: 'customer-1',
    senderName: 'You',
    timestamp: '2:31 PM',
    isMe: true,
    type: 'text',
  },
  {
    id: '4',
    text: 'Your order is being prepared now. Should be ready in about 10 minutes.',
    senderId: 'merchant-1',
    senderName: 'Burger House',
    senderAvatar: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop',
    timestamp: '2:33 PM',
    isMe: false,
    type: 'text',
  },
  {
    id: 'sys-1',
    text: 'Mike Johnson (Courier) has been assigned to your order',
    senderId: 'system',
    senderName: 'System',
    timestamp: '2:38 PM',
    isMe: false,
    type: 'system',
  },
  {
    id: '5',
    text: 'Hi! I\'m Mike, your delivery driver. I\'m heading to the restaurant now.',
    senderId: 'courier-1',
    senderName: 'Mike Johnson',
    senderAvatar: 'https://i.pravatar.cc/150?img=12',
    timestamp: '2:40 PM',
    isMe: false,
    type: 'text',
  },
  {
    id: '6',
    text: 'Great, thanks Mike! I\'m at the front entrance of the building.',
    senderId: 'customer-1',
    senderName: 'You',
    timestamp: '2:41 PM',
    isMe: true,
    type: 'text',
  },
];

export default function ChatScreen({ navigation, route }: any) {
  const orderId = route?.params?.orderId || '#3242';
  const recipientName = route?.params?.recipientName || 'Order Chat';
  const recipientAvatar = route?.params?.recipientAvatar;
  const recipientRole = route?.params?.recipientRole || 'merchant';

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsub = onChatMessage((data) => {
      const newMsg: Message = {
        id: Date.now().toString(),
        text: data.message,
        senderId: data.senderId,
        senderName: recipientName,
        senderAvatar: recipientAvatar,
        timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        type: 'text',
      };
      setMessages((prev) => [...prev, newMsg]);
    });
    return unsub;
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: 'me',
      senderName: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      type: 'text',
    };

    setMessages((prev) => [...prev, newMsg]);
    sendChatMessage(orderId, inputText.trim());
    setInputText('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
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
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingRow}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { opacity: 0.4 }]} />
            <View style={[styles.typingDot, { opacity: 0.7 }]} />
            <View style={styles.typingDot} />
          </View>
          <Text style={styles.typingText}>{recipientName} is typing...</Text>
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
            onChangeText={setInputText}
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
