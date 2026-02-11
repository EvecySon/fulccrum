import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, TextInput, Modal, Alert, ScrollView, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { merchantCrmAPI } from '../../services/api';

interface CustomerProfile {
  id: string;
  name: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  favoriteItems: string[];
  frequency: string;
  loyaltyScore: number;
  lastVisit: string;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  targetCount: number;
  status: 'active' | 'draft' | 'completed';
  effectiveness: number;
}


export default function CRMScreen({ navigation }: any) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'campaigns' | 'loyalty'>('customers');
  const [loyalty, setLoyalty] = useState({ enabled: false, pointsPerOrder: 10, rewardThreshold: 100, rewardValue: 500, rewardType: 'discount' });
  const [savingLoyalty, setSavingLoyalty] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [cust, camp, loy] = await Promise.all([
        merchantCrmAPI.getCustomerProfiles(),
        merchantCrmAPI.getCampaigns(),
        merchantCrmAPI.getLoyaltyProgram(),
      ]);
      setCustomers(Array.isArray(cust?.data || cust) ? (cust?.data || cust) : []);
      setCampaigns(Array.isArray(camp?.data || camp) ? (camp?.data || camp) : []);
      if (loy) setLoyalty({ enabled: loy.enabled ?? false, pointsPerOrder: loy.pointsPerOrder ?? 10, rewardThreshold: loy.rewardThreshold ?? 100, rewardValue: loy.rewardValue ?? 500, rewardType: loy.rewardType ?? 'discount' });
    } catch {
      // API not available yet
    } finally { setLoading(false); setRefreshing(false); }
  };

  const handleSaveLoyalty = async () => {
    setSavingLoyalty(true);
    try {
      const res = await merchantCrmAPI.updateLoyaltyProgram(loyalty);
      if (res) Alert.alert('Success', 'Loyalty program updated');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update loyalty program');
    } finally { setSavingLoyalty(false); }
  };

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [saving, setSaving] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', email: '', phone: '' });
  const [campForm, setCampForm] = useState({ name: '', type: 'promotion', targetCount: '' });

  const handleAdd = () => {
    if (activeTab === 'customers') {
      setCustForm({ name: '', email: '', phone: '' });
      setShowAddCustomer(true);
    } else {
      setCampForm({ name: '', type: 'promotion', targetCount: '' });
      setShowAddCampaign(true);
    }
  };

  const handleSaveCustomer = async () => {
    if (!custForm.name.trim()) return;
    setSaving(true);
    try {
      await merchantCrmAPI.createCustomerProfile(custForm);
      setShowAddCustomer(false);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not add customer');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCampaign = async () => {
    if (!campForm.name.trim()) return;
    setSaving(true);
    try {
      await merchantCrmAPI.createCampaign({
        ...campForm,
        targetCount: parseInt(campForm.targetCount) || 0,
      });
      setShowAddCampaign(false);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not create campaign');
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const loyaltyColor = (score: number) => score >= 80 ? colors.success : score >= 50 ? colors.warning : colors.error;

  const renderCustomer = ({ item }: { item: CustomerProfile }) => (
    <TouchableOpacity style={styles.customerCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerMeta}>{item.totalOrders} orders · ₦{item.totalSpent.toLocaleString()} spent</Text>
        <View style={styles.favRow}>
          {item.favoriteItems.slice(0, 2).map((f, i) => (
            <View key={i} style={styles.favChip}><Text style={styles.favText}>{f}</Text></View>
          ))}
        </View>
      </View>
      <View style={styles.customerRight}>
        <View style={[styles.loyaltyCircle, { borderColor: loyaltyColor(item.loyaltyScore) }]}>
          <Text style={[styles.loyaltyScore, { color: loyaltyColor(item.loyaltyScore) }]}>{item.loyaltyScore}</Text>
        </View>
        <Text style={styles.lastVisit}>{item.lastVisit}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCampaign = ({ item }: { item: Campaign }) => (
    <View style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        <Text style={styles.campaignName}>{item.name}</Text>
        <View style={[styles.campaignStatus, { backgroundColor: item.status === 'active' ? colors.success + '15' : item.status === 'draft' ? colors.warning + '15' : colors.textLight + '15' }]}>
          <Text style={[styles.campaignStatusText, { color: item.status === 'active' ? colors.success : item.status === 'draft' ? colors.warning : colors.textLight }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.campaignMeta}>Type: {item.type} · Target: {item.targetCount} customers</Text>
      {item.effectiveness > 0 && (
        <View style={styles.effectivenessRow}>
          <Text style={styles.effectivenessLabel}>Effectiveness</Text>
          <View style={styles.effectivenessBar}>
            <View style={[styles.effectivenessFill, { width: `${item.effectiveness * 100}%` }]} />
          </View>
          <Text style={styles.effectivenessValue}>{Math.round(item.effectiveness * 100)}%</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer CRM</Text>
        <TouchableOpacity onPress={handleAdd}>
          <Ionicons name="add-circle-outline" size={24} color={colors.tealLight} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'customers' && styles.tabActive]} onPress={() => setActiveTab('customers')}>
          <Ionicons name="people" size={16} color={activeTab === 'customers' ? colors.textWhite : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'customers' && styles.tabTextActive]}>Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'campaigns' && styles.tabActive]} onPress={() => setActiveTab('campaigns')}>
          <Ionicons name="megaphone" size={16} color={activeTab === 'campaigns' ? colors.textWhite : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'campaigns' && styles.tabTextActive]}>Campaigns</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'loyalty' && styles.tabActive]} onPress={() => setActiveTab('loyalty')}>
          <Ionicons name="heart" size={16} color={activeTab === 'loyalty' ? colors.textWhite : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'loyalty' && styles.tabTextActive]}>Loyalty</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'customers' && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput style={styles.searchInput} placeholder="Search customers..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
        </View>
      )}

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : activeTab === 'loyalty' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View style={styles.loyaltyCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>Loyalty Program</Text>
                <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 2 }}>{loyalty.enabled ? 'Active' : 'Inactive'}</Text>
              </View>
              <TouchableOpacity
                style={[styles.loyaltyToggle, loyalty.enabled && styles.loyaltyToggleActive]}
                onPress={() => setLoyalty(p => ({ ...p, enabled: !p.enabled }))}
              >
                <View style={[styles.loyaltyToggleDot, loyalty.enabled && styles.loyaltyToggleDotActive]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.loyaltyLabel}>Points per Order</Text>
            <TextInput style={styles.loyaltyInput} keyboardType="number-pad" value={String(loyalty.pointsPerOrder)} onChangeText={v => setLoyalty(p => ({ ...p, pointsPerOrder: parseInt(v) || 0 }))} />

            <Text style={styles.loyaltyLabel}>Reward Threshold (points needed)</Text>
            <TextInput style={styles.loyaltyInput} keyboardType="number-pad" value={String(loyalty.rewardThreshold)} onChangeText={v => setLoyalty(p => ({ ...p, rewardThreshold: parseInt(v) || 0 }))} />

            <Text style={styles.loyaltyLabel}>Reward Value (₦)</Text>
            <TextInput style={styles.loyaltyInput} keyboardType="number-pad" value={String(loyalty.rewardValue)} onChangeText={v => setLoyalty(p => ({ ...p, rewardValue: parseInt(v) || 0 }))} />

            <Text style={styles.loyaltyLabel}>Reward Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {['discount', 'free_item', 'cashback'].map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, loyalty.rewardType === t && styles.typeChipActive]} onPress={() => setLoyalty(p => ({ ...p, rewardType: t }))}>
                  <Text style={[styles.typeChipText, loyalty.rewardType === t && styles.typeChipTextActive]}>{t.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.modalSaveBtn, savingLoyalty && { opacity: 0.6 }]} onPress={handleSaveLoyalty} disabled={savingLoyalty}>
              {savingLoyalty ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.modalSaveText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.loyaltyInfoCard}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, marginLeft: 10 }}>
              Customers earn {loyalty.pointsPerOrder} points per order. After {loyalty.rewardThreshold} points, they get a ₦{loyalty.rewardValue} {loyalty.rewardType.replace('_', ' ')} reward.
            </Text>
          </View>
        </ScrollView>
      ) : activeTab === 'customers' ? (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderCustomer}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}
        />
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={item => item.id}
          renderItem={renderCampaign}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}
        />
      )}
      {/* Add Customer Modal */}
      <Modal visible={showAddCustomer} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !saving && setShowAddCustomer(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Customer</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Customer name *"
              placeholderTextColor={colors.textLight}
              value={custForm.name}
              onChangeText={v => setCustForm(p => ({ ...p, name: v }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              value={custForm.email}
              onChangeText={v => setCustForm(p => ({ ...p, email: v }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              value={custForm.phone}
              onChangeText={v => setCustForm(p => ({ ...p, phone: v }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddCustomer(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]} onPress={handleSaveCustomer} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.modalSaveText}>Add</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Campaign Modal */}
      <Modal visible={showAddCampaign} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !saving && setShowAddCampaign(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Campaign</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Campaign name *"
              placeholderTextColor={colors.textLight}
              value={campForm.name}
              onChangeText={v => setCampForm(p => ({ ...p, name: v }))}
            />
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              {['promotion', 'loyalty', 'retention', 'winback'].map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, campForm.type === t && styles.typeChipActive]} onPress={() => setCampForm(p => ({ ...p, type: t }))}>
                  <Text style={[styles.typeChipText, campForm.type === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Target customer count"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={campForm.targetCount}
              onChangeText={v => setCampForm(p => ({ ...p, targetCount: v }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddCampaign(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]} onPress={handleSaveCampaign} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={styles.modalSaveText}>Create</Text>}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.white },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  customerCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 8, alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  customerMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  favRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  favChip: { backgroundColor: colors.teal + '12', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  favText: { fontSize: 10, fontWeight: '600', color: colors.teal },
  customerRight: { alignItems: 'center' },
  loyaltyCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  loyaltyScore: { fontSize: 14, fontWeight: '800' },
  lastVisit: { fontSize: 10, color: colors.textLight, marginTop: 4 },
  campaignCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10 },
  campaignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  campaignName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  campaignStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  campaignStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  campaignMeta: { fontSize: 12, color: colors.textLight, marginBottom: 10 },
  effectivenessRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  effectivenessLabel: { fontSize: 12, color: colors.textSecondary },
  effectivenessBar: { flex: 1, height: 6, backgroundColor: colors.lightGray, borderRadius: 3, overflow: 'hidden' },
  effectivenessFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 3 },
  effectivenessValue: { fontSize: 12, fontWeight: '700', color: colors.teal },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, textAlign: 'center', marginBottom: 20 },
  modalInput: { backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  modalSaveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center' },
  modalSaveText: { fontSize: 15, fontWeight: '600', color: colors.textWhite },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.lightGray, borderWidth: 1, borderColor: colors.border },
  typeChipActive: { backgroundColor: colors.navy + '15', borderColor: colors.navy },
  typeChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'capitalize' },
  typeChipTextActive: { color: colors.navy },
  loyaltyCard: { backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 12 },
  loyaltyLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  loyaltyInput: { backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontWeight: '700', color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  loyaltyToggle: { width: 52, height: 30, borderRadius: 15, backgroundColor: colors.border, justifyContent: 'center', paddingHorizontal: 3 },
  loyaltyToggleActive: { backgroundColor: colors.teal },
  loyaltyToggleDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
  loyaltyToggleDotActive: { alignSelf: 'flex-end' as const },
  loyaltyInfoCard: { flexDirection: 'row' as const, backgroundColor: colors.info + '10', borderRadius: 14, padding: 14, alignItems: 'flex-start' as const },
});
