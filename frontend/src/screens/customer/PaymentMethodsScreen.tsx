import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '../../theme/colors';
import { paymentAPI, walletAPI } from '../../services/api';

const getCardIcon = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('visa')) return 'card';
  if (t.includes('master')) return 'card';
  if (t.includes('apple')) return 'logo-apple';
  return 'card-outline';
};

const getCardColor = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('visa')) return '#1A1F71';
  if (t.includes('master')) return '#EB001B';
  if (t.includes('apple')) return '#000000';
  return colors.navy;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function PaymentMethodsScreen({ navigation }: any) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [cardsRes, balRes, txRes] = await Promise.all([
        paymentAPI.getSavedCards().catch(() => null),
        walletAPI.getBalance().catch(() => null),
        paymentAPI.history(1, 10).catch(() => null),
      ]);
      const cards = Array.isArray(cardsRes?.data) ? cardsRes.data : Array.isArray(cardsRes) ? cardsRes : [];
      setPaymentMethods(cards);
      if (balRes?.balance != null) setWalletBalance(Number(balRes.balance));
      const txData = Array.isArray(txRes?.data) ? txRes.data : Array.isArray(txRes) ? txRes : [];
      setTransactions(txData);
    } catch (e: any) {
      if (!isRefresh) Alert.alert('Error', e?.message || 'Could not load payment methods');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSetDefault = async (cardId: string) => {
    try {
      await paymentAPI.setDefaultCard(cardId);
      loadData(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not set default card');
    }
  };

  const handleDeleteCard = (card: any) => {
    Alert.alert(
      'Remove Card',
      `Remove card ending in ${card.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: async () => {
            try {
              await paymentAPI.deleteCard(card.id);
              loadData(true);
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Could not remove card');
            }
          },
        },
      ],
    );
  };

  const handleCardMenu = (card: any) => {
    const options: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [];
    if (!card.isDefault) {
      options.push({ text: 'Set as Default', onPress: () => handleSetDefault(card.id) });
    }
    options.push({ text: 'Remove Card', style: 'destructive', onPress: () => handleDeleteCard(card) });
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(
      `${card.bank || card.cardType} •••• ${card.last4}`,
      undefined,
      options,
    );
  };

  const handleTopUp = () => {
    navigation.navigate('WalletTopUp');
  };

  const processTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount < 100) {
      Alert.alert('Invalid Amount', 'Minimum top-up is ₦100');
      return;
    }
    setProcessing(true);
    setShowTopUpModal(false);
    try {
      const res = await paymentAPI.topUp(amount);
      if (res?.authorizationUrl) {
        await WebBrowser.openBrowserAsync(res.authorizationUrl);
        // After browser closes, verify the payment
        if (res.reference) {
          try {
            const verifyRes = await paymentAPI.verifyTopUp(res.reference);
            if (verifyRes?.success) {
              Alert.alert('Top Up Successful', verifyRes.message || `₦${amount.toLocaleString()} added to wallet`);
            } else {
              Alert.alert('Pending', 'Payment is being processed. Pull to refresh to check status.');
            }
          } catch {
            Alert.alert('Pending', 'Payment is being processed. Pull to refresh to check status.');
          }
        }
        loadData(true);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not initialize top-up');
    }
    setProcessing(false);
  };

  const handleAddCard = async () => {
    setProcessing(true);
    try {
      const res = await paymentAPI.addCard();
      if (res?.authorizationUrl) {
        await WebBrowser.openBrowserAsync(res.authorizationUrl);
        // After browser closes, verify to save card
        if (res.reference) {
          try {
            const verifyRes = await paymentAPI.verifyTopUp(res.reference);
            if (verifyRes?.cardSaved) {
              Alert.alert('Card Added', 'Your card has been saved and ₦50 credited to your wallet.');
            } else if (verifyRes?.success) {
              Alert.alert('Success', '₦50 credited to your wallet.');
            } else {
              Alert.alert('Pending', 'Card verification is being processed. Pull to refresh.');
            }
          } catch {
            Alert.alert('Pending', 'Card verification is being processed. Pull to refresh.');
          }
        }
        loadData(true);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not initialize card add');
    }
    setProcessing(false);
  };

  const getTxType = (tx: any) => {
    const status = tx.paymentStatus || '';
    if (status.includes('refund')) return 'refund';
    return 'order';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.teal} />}
        >
          {/* Wallet Balance */}
          <View style={styles.walletCard}>
            <View style={styles.walletTop}>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet" size={24} color={colors.textWhite} />
              </View>
              <View>
                <Text style={styles.walletLabel}>Fulccrum Wallet</Text>
                <Text style={styles.walletBalance}>₦{walletBalance.toLocaleString()}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.topUpBtn} onPress={handleTopUp}>
              <Ionicons name="add" size={18} color={colors.teal} />
              <Text style={styles.topUpText}>Top Up</Text>
            </TouchableOpacity>
          </View>

          {/* Cards */}
          <Text style={styles.sectionTitle}>Saved Cards</Text>
          {paymentMethods.length === 0 ? (
            <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="card-outline" size={36} color={colors.textLight} />
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8, textAlign: 'center' }}>
                No saved cards yet. Cards are saved automatically after your first payment.
              </Text>
            </View>
          ) : (
            paymentMethods.map((card: any) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={[styles.cardIcon, { backgroundColor: getCardColor(card.cardType) + '15' }]}>
                  <Ionicons name={getCardIcon(card.cardType) as any} size={22} color={getCardColor(card.cardType)} />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardLabelRow}>
                    <Text style={styles.cardLabel}>{card.bank || card.cardType}</Text>
                    {card.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                  <Text style={styles.cardExpiry}>Expires {card.expMonth}/{card.expYear}</Text>
                </View>
                <View style={styles.cardActions}>
                  {!card.isDefault && (
                    <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(card.id)}>
                      <Text style={styles.setDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleCardMenu(card)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Add Payment Method */}
          <TouchableOpacity style={styles.addBtn} onPress={handleAddCard}>
            <Ionicons name="add-circle-outline" size={22} color={colors.teal} />
            <Text style={styles.addText}>Add Payment Method</Text>
          </TouchableOpacity>

          {/* Transaction History */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="receipt-outline" size={36} color={colors.textLight} />
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8 }}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map((tx: any) => {
              const type = getTxType(tx);
              const amount = Number(tx.totalAmount || 0);
              const isRefund = type === 'refund';
              return (
                <View key={tx.id} style={styles.txRow}>
                  <View style={[styles.txIcon, {
                    backgroundColor: isRefund ? colors.success + '10' : colors.navy + '10'
                  }]}>
                    <Ionicons
                      name={isRefund ? 'refresh-outline' : 'receipt-outline'}
                      size={18}
                      color={isRefund ? colors.success : colors.navy}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txDesc}>
                      {isRefund ? 'Refund' : 'Order'} #{tx.orderNumber}
                    </Text>
                    <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: isRefund ? colors.success : colors.textPrimary }]}>
                    {isRefund ? '+' : '-'}₦{amount.toLocaleString()}
                  </Text>
                </View>
              );
            })
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Processing overlay */}
      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textWhite, marginTop: 12, fontSize: 16, fontWeight: '600' }}>Processing...</Text>
        </View>
      )}

      {/* Top Up Modal */}
      <Modal visible={showTopUpModal} transparent animationType="slide" onRequestClose={() => setShowTopUpModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTopUpModal(false)}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Top Up Wallet</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
                Enter amount to add to your Fulccrum Wallet. Min ₦100.
              </Text>

              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>Amount (₦)</Text>
              <TextInput
                style={styles.topUpInput}
                placeholder="e.g. 5000"
                placeholderTextColor={colors.textLight}
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="number-pad"
                autoFocus
              />

              {/* Quick amounts */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 16 }}>
                {[500, 1000, 2000, 5000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickAmtBtn, topUpAmount === String(amt) && { backgroundColor: colors.teal, borderColor: colors.teal }]}
                    onPress={() => setTopUpAmount(String(amt))}
                  >
                    <Text style={[styles.quickAmtText, topUpAmount === String(amt) && { color: colors.textWhite }]}>
                      ₦{amt.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.lightGray, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                  onPress={() => setShowTopUpModal(false)}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                  onPress={processTopUp}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>Continue to Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  walletCard: {
    backgroundColor: colors.navy, borderRadius: 20, padding: 20, marginBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  walletTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  walletIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  walletLabel: { fontSize: 13, color: colors.tealLight },
  walletBalance: { fontSize: 26, fontWeight: '800', color: colors.textWhite },
  topUpBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 4,
  },
  topUpText: { fontSize: 14, fontWeight: '700', color: colors.teal },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  cardItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16,
    padding: 16, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  defaultBadge: { backgroundColor: colors.teal + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultText: { fontSize: 11, fontWeight: '700', color: colors.teal },
  cardNumber: { fontSize: 13, color: colors.textSecondary, marginTop: 2, letterSpacing: 1 },
  cardExpiry: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setDefaultBtn: { backgroundColor: colors.lightGray, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  setDefaultText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.teal + '08', borderRadius: 16, padding: 16, marginTop: 4, gap: 8,
    borderWidth: 1.5, borderColor: colors.teal + '25', borderStyle: 'dashed',
  },
  addText: { fontSize: 15, fontWeight: '600', color: colors.teal },
  txRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
  },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  txDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '700' },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  topUpInput: {
    backgroundColor: colors.lightGray, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 22, fontWeight: '700', color: colors.textPrimary, textAlign: 'center',
  },
  quickAmtBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
    paddingVertical: 8, alignItems: 'center',
  },
  quickAmtText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
});
