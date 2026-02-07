import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const mockWallet = {
  balance: 485000,
  pendingBalance: 67500,
  frozenBalance: 0,
  todayEarnings: 45200,
  weeklyEarnings: 312000,
  currency: 'NGN',
};

const mockBankAccounts = [
  { id: '1', bankName: 'GTBank', accountNumber: '****4521', accountName: 'Chukwu Foods Ltd', isDefault: true },
  { id: '2', bankName: 'Access Bank', accountNumber: '****8903', accountName: 'Chukwu Emmanuel', isDefault: false },
];

const mockTransactions = [
  { id: 't1', type: 'order_earning', desc: 'Order #FUL-3242', amount: 8500, commission: 850, date: 'Today, 3:15 PM' },
  { id: 't2', type: 'order_earning', desc: 'Order #FUL-3240', amount: 12300, commission: 1230, date: 'Today, 1:45 PM' },
  { id: 't3', type: 'order_earning', desc: 'Order #FUL-3238', amount: 6700, commission: 670, date: 'Today, 11:20 AM' },
  { id: 't4', type: 'withdrawal', desc: 'Bank withdrawal → GTBank', amount: -150000, commission: 0, date: 'Feb 5, 2026' },
  { id: 't5', type: 'order_earning', desc: 'Order #FUL-3235', amount: 15400, commission: 1540, date: 'Feb 5, 2026' },
  { id: 't6', type: 'refund', desc: 'Refund — Order #FUL-3220', amount: -4500, commission: 0, date: 'Feb 4, 2026' },
  { id: 't7', type: 'order_earning', desc: 'Order #FUL-3218', amount: 9800, commission: 980, date: 'Feb 4, 2026' },
  { id: 't8', type: 'bonus', desc: 'Weekend promo bonus', amount: 5000, commission: 0, date: 'Feb 3, 2026' },
];

const mockWithdrawals = [
  { id: '1', amount: 150000, status: 'completed', requestedAt: 'Feb 5, 2026', processedAt: 'Feb 6, 2026', bank: 'GTBank ****4521' },
  { id: '2', amount: 200000, status: 'processing', requestedAt: 'Feb 7, 2026', processedAt: null, bank: 'GTBank ****4521' },
  { id: '3', amount: 100000, status: 'completed', requestedAt: 'Jan 28, 2026', processedAt: 'Jan 29, 2026', bank: 'Access ****8903' },
  { id: '4', amount: 75000, status: 'failed', requestedAt: 'Jan 20, 2026', processedAt: null, bank: 'GTBank ****4521', failedReason: 'Insufficient balance' },
  { id: '5', amount: 300000, status: 'completed', requestedAt: 'Jan 15, 2026', processedAt: 'Jan 16, 2026', bank: 'GTBank ****4521' },
];

export default function WalletScreen({ navigation }: any) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState(mockBankAccounts.find(b => b.isDefault)?.id || '1');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'earnings' | 'withdrawals'>('earnings');

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 1000 || amount > mockWallet.balance) return;
    setLoading(true);
    // TODO: Call walletAPI.requestWithdrawal(amount, selectedBank)
    setTimeout(() => {
      setLoading(false);
      setShowWithdraw(false);
      setWithdrawAmount('');
    }, 1500);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: colors.success + '15', color: colors.success, icon: 'checkmark-circle' };
      case 'processing': return { bg: colors.info + '15', color: colors.info, icon: 'time' };
      case 'pending': return { bg: colors.warning + '15', color: colors.warning, icon: 'hourglass' };
      case 'failed': return { bg: colors.error + '15', color: colors.error, icon: 'close-circle' };
      default: return { bg: colors.border, color: colors.textLight, icon: 'help-circle' };
    }
  };

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'order_earning': return { name: 'cart', color: colors.teal };
      case 'withdrawal': return { name: 'arrow-up-circle', color: colors.navy };
      case 'refund': return { name: 'return-down-back', color: colors.error };
      case 'bonus': return { name: 'star', color: colors.warning };
      default: return { name: 'cash', color: colors.textLight };
    }
  };

  const renderEarningItem = (tx: typeof mockTransactions[0]) => {
    const icon = getTxIcon(tx.type);
    return (
      <View style={styles.txCard}>
        <View style={[styles.txIcon, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name as any} size={18} color={icon.color} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txAmount}>
            {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
          </Text>
          <Text style={styles.txDate}>{tx.desc} · {tx.date}</Text>
          {tx.commission > 0 && (
            <Text style={styles.txCommission}>Commission: ₦{tx.commission.toLocaleString()} (10%)</Text>
          )}
        </View>
      </View>
    );
  };

  const renderWithdrawalItem = (withdrawal: typeof mockWithdrawals[0]) => {
    const statusStyle = getStatusStyle(withdrawal.status);
    return (
      <View style={styles.txCard}>
        <View style={[styles.txIcon, { backgroundColor: statusStyle.bg }]}>
          <Ionicons name={statusStyle.icon as any} size={20} color={statusStyle.color} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txAmount}>₦{withdrawal.amount.toLocaleString()}</Text>
          <Text style={styles.txDate}>{withdrawal.bank} · {withdrawal.requestedAt}</Text>
          {withdrawal.failedReason && (
            <Text style={styles.txError}>{withdrawal.failedReason}</Text>
          )}
        </View>
        <View style={[styles.txStatusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.txStatusText, { color: statusStyle.color }]}>
            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* FIXED: Header + Balance */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>₦{mockWallet.balance.toLocaleString()}</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Ionicons name="time-outline" size={14} color={colors.warning} />
            <Text style={styles.balanceItemText}>Pending: ₦{mockWallet.pendingBalance.toLocaleString()}</Text>
          </View>
          {mockWallet.frozenBalance > 0 && (
            <View style={styles.balanceItem}>
              <Ionicons name="snow-outline" size={14} color={colors.info} />
              <Text style={styles.balanceItemText}>Frozen: ₦{mockWallet.frozenBalance.toLocaleString()}</Text>
            </View>
          )}
        </View>
        <View style={styles.earningsStats}>
          <View style={styles.earningStat}>
            <Text style={styles.earningStatValue}>₦{mockWallet.todayEarnings.toLocaleString()}</Text>
            <Text style={styles.earningStatLabel}>Today</Text>
          </View>
          <View style={styles.earningStatDivider} />
          <View style={styles.earningStat}>
            <Text style={styles.earningStatValue}>₦{mockWallet.weeklyEarnings.toLocaleString()}</Text>
            <Text style={styles.earningStatLabel}>This Week</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdraw(true)}>
          <Ionicons name="arrow-up-circle-outline" size={20} color={colors.textWhite} />
          <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
        </TouchableOpacity>
      </View>

      {/* FIXED: Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'earnings' && styles.tabActive]} onPress={() => setTab('earnings')}>
          <Text style={[styles.tabText, tab === 'earnings' && styles.tabTextActive]}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'withdrawals' && styles.tabActive]} onPress={() => setTab('withdrawals')}>
          <Text style={[styles.tabText, tab === 'withdrawals' && styles.tabTextActive]}>Withdrawals</Text>
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE: Transaction list */}
      {tab === 'earnings' ? (
        <FlatList
          data={mockTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderEarningItem(item)}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={mockWithdrawals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderWithdrawalItem(item)}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdraw && <Modal visible={showWithdraw} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.withdrawTitle}>Withdraw to Bank</Text>
              <TouchableOpacity onPress={() => setShowWithdraw(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Select Bank Account</Text>
            {mockBankAccounts.map(bank => (
              <TouchableOpacity
                key={bank.id}
                style={[styles.bankOption, selectedBank === bank.id && styles.bankOptionActive]}
                onPress={() => setSelectedBank(bank.id)}
              >
                <View style={styles.bankRadio}>
                  {selectedBank === bank.id && <View style={styles.bankRadioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bankName}>{bank.bankName} · {bank.accountNumber}</Text>
                  <Text style={styles.bankAccName}>{bank.accountName}</Text>
                </View>
                {bank.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Amount</Text>
            <View style={styles.amountInput}>
              <Text style={styles.amountPrefix}>₦</Text>
              <TextInput
                style={styles.amountField}
                placeholder="Enter amount"
                placeholderTextColor={colors.textLight}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.quickAmounts}>
              {[50000, 100000, 200000, 485000].map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.quickAmountBtn, withdrawAmount === amount.toString() && styles.quickAmountBtnActive]}
                  onPress={() => setWithdrawAmount(amount.toString())}
                >
                  <Text style={[styles.quickAmountText, withdrawAmount === amount.toString() && styles.quickAmountTextActive]}>
                    {amount === 485000 ? 'All' : `₦${(amount / 1000).toFixed(0)}K`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.withdrawNote}>
              Minimum: ₦1,000 · Under ₦50K: instant · Over ₦50K: 1-2 business days
            </Text>
            <TouchableOpacity
              style={[styles.confirmWithdrawBtn, loading && { opacity: 0.7 }]}
              onPress={handleWithdraw}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.confirmWithdrawText}>Request Withdrawal</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.navy },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  balanceCard: { backgroundColor: colors.navy, paddingHorizontal: 24, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  balanceLabel: { fontSize: 14, color: colors.textWhite + '80', marginBottom: 4 },
  balanceValue: { fontSize: 36, fontWeight: '800', color: colors.textWhite, marginBottom: 12 },
  balanceRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  earningsStats: { flexDirection: 'row', backgroundColor: colors.textWhite + '15', borderRadius: 14, padding: 14, marginBottom: 16 },
  earningStat: { flex: 1, alignItems: 'center' },
  earningStatValue: { fontSize: 18, fontWeight: '800', color: colors.textWhite },
  earningStatLabel: { fontSize: 12, color: colors.textWhite + '80', marginTop: 2 },
  earningStatDivider: { width: 1, backgroundColor: colors.textWhite + '30' },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceItemText: { fontSize: 13, color: colors.textWhite + '90' },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14 },
  withdrawBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  withdrawTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  amountInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12 },
  amountPrefix: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  amountField: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.textPrimary, paddingVertical: 14, marginLeft: 4 },
  quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickAmountBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.lightGray, alignItems: 'center' },
  quickAmountBtnActive: { backgroundColor: colors.navy },
  quickAmountText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  quickAmountTextActive: { color: colors.textWhite },
  withdrawNote: { fontSize: 12, color: colors.textLight, marginBottom: 16, lineHeight: 18 },
  confirmWithdrawBtn: { backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmWithdrawText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 12, backgroundColor: colors.white, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 12 },
  txIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txAmount: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  txDate: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  txError: { fontSize: 12, color: colors.error, marginTop: 2 },
  txCommission: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  txStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  txStatusText: { fontSize: 12, fontWeight: '600' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  bankOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, marginBottom: 8, gap: 12 },
  bankOptionActive: { borderColor: colors.navy, backgroundColor: colors.navy + '08' },
  bankRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.navy, justifyContent: 'center', alignItems: 'center' },
  bankRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.navy },
  bankName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  bankAccName: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  defaultBadge: { backgroundColor: colors.teal + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  defaultBadgeText: { fontSize: 11, fontWeight: '600', color: colors.teal },
});
