import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { walletAPI } from '../../services/api';

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '023', name: 'Citibank' },
  { code: '063', name: 'Diamond Bank' },
  { code: '050', name: 'Ecobank' },
  { code: '084', name: 'Enterprise Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank' },
  { code: '214', name: 'FCMB' },
  { code: '058', name: 'GTBank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC' },
  { code: '068', name: 'Standard Chartered' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '999', name: 'Opay' },
  { code: '998', name: 'Palmpay' },
  { code: '997', name: 'Kuda Bank' },
  { code: '996', name: 'Moniepoint' },
];

export default function BankAccountsScreen({ navigation }: any) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<{ code: string; name: string } | null>(null);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [adding, setAdding] = useState(false);

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await walletAPI.getBankAccounts();
      setAccounts(Array.isArray(res) ? res : []);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!accountName.trim()) { Alert.alert('Missing', 'Enter account holder name'); return; }
    if (!accountNumber.trim() || accountNumber.length !== 10) { Alert.alert('Invalid', 'Account number must be 10 digits'); return; }
    if (!selectedBank) { Alert.alert('Missing', 'Select a bank'); return; }
    setAdding(true);
    try {
      const created = await walletAPI.addBankAccount({
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
      });
      setAccounts(prev => [...prev, created]);
      setShowAdd(false);
      resetAddForm();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not add bank account');
    } finally {
      setAdding(false);
    }
  };

  const resetAddForm = () => {
    setAccountName('');
    setAccountNumber('');
    setSelectedBank(null);
    setBankSearch('');
  };

  const handleSetDefault = async (id: string) => {
    try {
      await walletAPI.setDefaultBankAccount(id);
      setAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not set default');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await walletAPI.deleteBankAccount(deleteTarget.id);
      setAccounts(prev => prev.filter(a => a.id !== deleteTarget.id));
      setShowDelete(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not delete account');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBanks = NIGERIAN_BANKS.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Accounts</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)}>
          <Ionicons name="add-circle-outline" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      ) : accounts.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="card-outline" size={56} color={colors.border} />
          <Text style={styles.emptyTitle}>No Bank Accounts</Text>
          <Text style={styles.emptyDesc}>Add a bank account to receive withdrawals from your wallet.</Text>
          <TouchableOpacity style={styles.addFirstBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={18} color={colors.textWhite} />
            <Text style={styles.addFirstBtnText}>Add Bank Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }}>
          {accounts.map(account => (
            <View key={account.id} style={[styles.accountCard, account.isDefault && styles.accountCardDefault]}>
              <View style={styles.accountTop}>
                <View style={[styles.bankIcon, { backgroundColor: account.isDefault ? colors.teal + '15' : colors.navy + '10' }]}>
                  <Ionicons name="business-outline" size={20} color={account.isDefault ? colors.teal : colors.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.bankName}>{account.bankName}</Text>
                    {account.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.accountNum}>{account.accountNumber}</Text>
                  <Text style={styles.accountHolder}>{account.accountName}</Text>
                </View>
              </View>
              <View style={styles.accountActions}>
                {!account.isDefault && (
                  <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(account.id)}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.teal} />
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => { setDeleteTarget(account); setShowDelete(true); }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* Add Bank Account Modal */}
      <Modal visible={showAdd} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !adding && setShowAdd(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Bank Account</Text>

            {/* Bank Selector */}
            <Text style={styles.fieldLabel}>Bank</Text>
            <TouchableOpacity style={styles.bankSelector} onPress={() => setShowBankPicker(true)}>
              <Text style={selectedBank ? styles.bankSelectorText : styles.bankSelectorPlaceholder}>
                {selectedBank ? selectedBank.name : 'Select a bank'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textLight} />
            </TouchableOpacity>

            {/* Account Number */}
            <Text style={styles.fieldLabel}>Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit account number"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              maxLength={10}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            {/* Account Name */}
            <Text style={styles.fieldLabel}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name on account"
              placeholderTextColor={colors.textLight}
              value={accountName}
              onChangeText={setAccountName}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAdd(false); resetAddForm(); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, adding && { opacity: 0.6 }]} onPress={handleAdd} disabled={adding}>
                {adding ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.submitBtnText}>Add Account</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bank Picker Modal */}
      <Modal visible={showBankPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowBankPicker(false)} />
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="Search banks..."
              placeholderTextColor={colors.textLight}
              value={bankSearch}
              onChangeText={setBankSearch}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredBanks.map(bank => (
                <TouchableOpacity
                  key={bank.code}
                  style={[styles.bankPickerItem, selectedBank?.code === bank.code && styles.bankPickerItemActive]}
                  onPress={() => { setSelectedBank(bank); setShowBankPicker(false); setBankSearch(''); }}
                >
                  <Ionicons name="business-outline" size={18} color={selectedBank?.code === bank.code ? colors.teal : colors.textLight} />
                  <Text style={[styles.bankPickerText, selectedBank?.code === bank.code && { color: colors.teal, fontWeight: '700' }]}>
                    {bank.name}
                  </Text>
                  {selectedBank?.code === bank.code && <Ionicons name="checkmark" size={18} color={colors.teal} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDelete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !deleting && setShowDelete(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove Bank Account</Text>
            <Text style={styles.deleteConfirmText}>
              Are you sure you want to remove {deleteTarget?.bankName} account ending in {deleteTarget?.accountNumber?.slice(-4)}?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDelete(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteBtnConfirm, deleting && { opacity: 0.6 }]} onPress={handleDelete} disabled={deleting}>
                {deleting ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.deleteBtnConfirmText}>Remove</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  addFirstBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.teal, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 20 },
  addFirstBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  accountCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: colors.border },
  accountCardDefault: { borderColor: colors.teal },
  accountTop: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  bankIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  bankName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  accountNum: { fontSize: 15, color: colors.textSecondary, marginTop: 2, fontWeight: '600', letterSpacing: 1 },
  accountHolder: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  defaultBadge: { backgroundColor: colors.teal + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultBadgeText: { fontSize: 11, fontWeight: '700', color: colors.teal },
  accountActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 12 },
  setDefaultBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.teal + '10' },
  setDefaultText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.error + '10' },
  deleteText: { fontSize: 13, fontWeight: '600', color: colors.error },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 420 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary },
  bankSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  bankSelectorText: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },
  bankSelectorPlaceholder: { fontSize: 15, color: colors.textLight },
  bankPickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  bankPickerItemActive: { backgroundColor: colors.teal + '08' },
  bankPickerText: { flex: 1, fontSize: 15, color: colors.textPrimary },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.teal, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  deleteConfirmText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 12 },
  deleteBtnConfirm: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.error, alignItems: 'center' },
  deleteBtnConfirmText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
});
