import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, TextInput,
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
  const [activeTab, setActiveTab] = useState<'customers' | 'campaigns'>('customers');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [cust, camp] = await Promise.all([merchantCrmAPI.getCustomerProfiles(), merchantCrmAPI.getCampaigns()]);
      setCustomers(Array.isArray(cust?.data || cust) ? (cust?.data || cust) : []);
      setCampaigns(Array.isArray(camp?.data || camp) ? (camp?.data || camp) : []);
    } catch {
      // API not available yet
    } finally { setLoading(false); setRefreshing(false); }
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
        <TouchableOpacity>
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
      </View>

      {activeTab === 'customers' && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput style={styles.searchInput} placeholder="Search customers..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
        </View>
      )}

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
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
});
