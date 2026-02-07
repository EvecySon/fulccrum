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
  balance: 78500,
  pendingBalance: 12300,
  todayEarnings: 22500,
  weeklyEarnings: 117000,
};

const mockBankAccounts = [
  { id: '1', bankName: 'First Bank', accountNumber: '****7832', accountName: 'Okafor Chinedu', isDefault: true },
  { id: '2', bankName: 'UBA', accountNumber: '****2190', accountName: 'Okafor Chinedu', isDefault: false },
];

const mockTransactions = [
  { id: '1', type: 'earning', desc: 'Delivery #3242', amount: 1300, date: 'Today, 2:30 PM' },
  { id: '2', type: 'earning', desc: 'Delivery #3240', amount: 1850, date: 'Today, 1:15 PM' },
  { id: '3', type: 'tip', desc: 'Tip from Adaeze O.', amount: 500, date: 'Today, 1:20 PM' },
  { id: '4', type: 'withdrawal', desc: 'Bank withdrawal', amount: -50000, date: 'Feb 5, 2026' },
  { id: '5', type: 'earning', desc: 'Delivery #3235', amount: 2300, date: 'Yesterday' },
  { id: '6', type: 'bonus', desc: 'Peak hour bonus', amount: 1000, date: 'Yesterday' },
  { id: '7', type: 'earning', desc: 'Delivery #3230', amount: 1500, date: 'Feb 5, 2026' },
];

export default function CourierWalletScreen({ navigation }: any) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState(mockBankAccounts.find(b => b.isDefault)?.id || '1');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 1000 || amount > mockWallet.balance) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowWithdraw(false);
      setWithdrawAmount('');
    }, 1500);
  };

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'earning': return { name: 'bicycle', color: colors.teal };
      case 'tip': return { name: 'heart', color: colors.success };
      case 'withdrawal': return { name: 'arrow-up-circle', color: colors.navy };
      case 'bonus': return { name: 'star', color: colors.warning };
      default: return { name: 'cash', color: colors.textLight };
    }
  };

  return (
    <View style={styles.container}>
      {/* FIXED: Header + Balance */}
      <View style={styles.headerBg}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>₦{mockWallet.balance.toLocaleString()}</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Ionicons name="time-outline" size={14} color={colors.textWhite + '80'} />
            <Text style={styles.balanceItemText}>Pending: ₦{mockWallet.pendingBalance.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>₦{mockWallet.todayEarnings.toLocaleString()}</Text>
            <Text style={styles.quickStatLabel}>Today</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>₦{mockWallet.weeklyEarnings.toLocaleString()}</Text>
            <Text style={styles.quickStatLabel}>This Week</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdraw(true)}>
          <Ionicons name="arrow-up-circle-outline" size={20} color={colors.textWhite} />
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* FIXED: Section title */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      {/* SCROLLABLE: Transaction list */}
      <FlatList
        data={mockTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item: tx }) => {
          const icon = getTxIcon(tx.type);
          return (
            <View style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: icon.color + '15' }]}>
                <Ionicons name={icon.name as any} size={18} color={icon.color} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{tx.desc}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount > 0 ? colors.success : colors.textPrimary }]}>
                {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

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
                placeholder="Amount"
                placeholderTextColor={colors.textLight}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.quickAmounts}>
              {[10000, 25000, 50000, 78500].map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.quickAmountBtn, withdrawAmount === amount.toString() && styles.quickAmountBtnActive]}
                  onPress={() => setWithdrawAmount(amount.toString())}
                >
                  <Text style={[styles.quickAmountText, withdrawAmount === amount.toString() && styles.quickAmountTextActive]}>
                    {amount >= 1000 ? `₦${(amount / 1000).toFixed(0)}K` : `₦${amount}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.withdrawNote}>
              Minimum: ₦1,000 · Under ₦50K: instant · Over ₦50K: 1-2 business days
            </Text>
            <TouchableOpacity
              style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
              onPress={handleWithdraw}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.textWhite} /> : (
                <Text style={styles.confirmBtnText}>Request Withdrawal</Text>
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
  headerBg: { backgroundColor: colors.teal, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  balanceLabel: { fontSize: 14, color: colors.textWhite + '80', paddingHorizontal: 24 },
  balanceValue: { fontSize: 36, fontWeight: '800', color: colors.textWhite, paddingHorizontal: 24, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16 },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceItemText: { fontSize: 13, color: colors.textWhite + '90' },
  quickStats: { flexDirection: 'row', marginHorizontal: 24, backgroundColor: colors.textWhite + '15', borderRadius: 14, padding: 14, marginBottom: 16 },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 18, fontWeight: '800', color: colors.textWhite },
  quickStatLabel: { fontSize: 12, color: colors.textWhite + '80', marginTop: 2 },
  quickStatDivider: { width: 1, backgroundColor: colors.textWhite + '30' },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 24, backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 14 },
  withdrawBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  txDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  withdrawTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  amountInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12 },
  amountPrefix: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  amountField: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.textPrimary, paddingVertical: 14, marginLeft: 4 },
  quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickAmountBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.lightGray, alignItems: 'center' },
  quickAmountBtnActive: { backgroundColor: colors.teal },
  quickAmountText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  quickAmountTextActive: { color: colors.textWhite },
  withdrawNote: { fontSize: 12, color: colors.textLight, marginBottom: 16, lineHeight: 18 },
  confirmBtn: { backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  bankOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, marginBottom: 8, gap: 12 },
  bankOptionActive: { borderColor: colors.teal, backgroundColor: colors.teal + '08' },
  bankRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.teal, justifyContent: 'center', alignItems: 'center' },
  bankRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.teal },
  bankName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  bankAccName: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  defaultBadge: { backgroundColor: colors.teal + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  defaultBadgeText: { fontSize: 11, fontWeight: '600', color: colors.teal },
});
