import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { channelsAPI } from '../../services/api';

interface Channel {
  id: string;
  type: string;
  label: string;
  icon: string;
  active: boolean;
  orders: number;
  revenue: number;
}

interface Subscription {
  id: string;
  name: string;
  type: string;
  price: number;
  subscribers: number;
  schedule: string;
}

const mockChannels: Channel[] = [
  { id: '1', type: 'delivery', label: 'Delivery', icon: 'bicycle', active: true, orders: 245, revenue: 890000 },
  { id: '2', type: 'pickup', label: 'Pickup', icon: 'storefront', active: true, orders: 89, revenue: 310000 },
  { id: '3', type: 'catering', label: 'Catering', icon: 'people', active: false, orders: 12, revenue: 450000 },
  { id: '4', type: 'subscription', label: 'Subscriptions', icon: 'repeat', active: true, orders: 34, revenue: 170000 },
  { id: '5', type: 'events', label: 'Events', icon: 'calendar', active: false, orders: 0, revenue: 0 },
];

const mockSubscriptions: Subscription[] = [
  { id: 's1', name: 'Weekly Lunch Box', type: 'weekly_meal', price: 15000, subscribers: 18, schedule: 'Mon-Fri, 12 PM' },
  { id: 's2', name: 'Monthly Gourmet Box', type: 'monthly_box', price: 45000, subscribers: 7, schedule: '1st of every month' },
  { id: 's3', name: 'Daily Coffee', type: 'coffee_subscription', price: 2500, subscribers: 9, schedule: 'Daily, 8 AM' },
];

export default function MultiChannelScreen({ navigation }: any) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ch, sub] = await Promise.all([channelsAPI.getChannels(), channelsAPI.getSubscriptions()]);
      setChannels(Array.isArray(ch) ? ch : mockChannels);
      setSubscriptions(Array.isArray(sub) ? sub : mockSubscriptions);
    } catch {
      setChannels(mockChannels);
      setSubscriptions(mockSubscriptions);
    } finally { setLoading(false); setRefreshing(false); }
  };

  const toggleChannel = async (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    try {
      const ch = channels.find(c => c.id === id);
      await channelsAPI.updateChannel(id, { active: !ch?.active });
    } catch {}
  };

  const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);
  const activeChannels = channels.filter(c => c.active).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Channels</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}>
          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{activeChannels}/{channels.length}</Text>
              <Text style={styles.summaryLabel}>Active Channels</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>₦{(totalRevenue / 1000).toFixed(0)}k</Text>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{subscriptions.reduce((s, sub) => s + sub.subscribers, 0)}</Text>
              <Text style={styles.summaryLabel}>Subscribers</Text>
            </View>
          </View>

          {/* Channels */}
          <Text style={styles.sectionTitle}>Channels</Text>
          {channels.map(ch => (
            <View key={ch.id} style={styles.channelCard}>
              <View style={[styles.channelIcon, { backgroundColor: ch.active ? colors.teal + '12' : colors.lightGray }]}>
                <Ionicons name={ch.icon as any} size={22} color={ch.active ? colors.teal : colors.textLight} />
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelLabel}>{ch.label}</Text>
                <Text style={styles.channelMeta}>{ch.orders} orders · ₦{ch.revenue.toLocaleString()}</Text>
              </View>
              <Switch
                value={ch.active}
                onValueChange={() => toggleChannel(ch.id)}
                trackColor={{ false: colors.border, true: colors.teal + '60' }}
                thumbColor={ch.active ? colors.teal : colors.darkGray}
              />
            </View>
          ))}

          {/* Subscriptions */}
          <View style={styles.subHeader}>
            <Text style={styles.sectionTitle}>Subscription Plans</Text>
            <TouchableOpacity style={styles.addSubBtn}>
              <Ionicons name="add" size={16} color={colors.teal} />
              <Text style={styles.addSubText}>New Plan</Text>
            </TouchableOpacity>
          </View>
          {subscriptions.map(sub => (
            <View key={sub.id} style={styles.subCard}>
              <View style={styles.subTop}>
                <Text style={styles.subName}>{sub.name}</Text>
                <Text style={styles.subPrice}>₦{sub.price.toLocaleString()}</Text>
              </View>
              <Text style={styles.subMeta}>{sub.schedule}</Text>
              <View style={styles.subBottom}>
                <View style={styles.subStat}>
                  <Ionicons name="people-outline" size={14} color={colors.textLight} />
                  <Text style={styles.subStatText}>{sub.subscribers} subscribers</Text>
                </View>
                <View style={styles.subTypeBadge}>
                  <Text style={styles.subTypeText}>{sub.type.replace(/_/g, ' ')}</Text>
                </View>
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', gap: 8, padding: 16 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  summaryLabel: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginHorizontal: 16, marginBottom: 10 },
  channelCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.white, borderRadius: 14, padding: 14 },
  channelIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  channelInfo: { flex: 1 },
  channelLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  channelMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 16, marginBottom: 10 },
  addSubBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addSubText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  subCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.white, borderRadius: 14, padding: 14 },
  subTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  subPrice: { fontSize: 16, fontWeight: '700', color: colors.teal },
  subMeta: { fontSize: 12, color: colors.textLight, marginBottom: 8 },
  subBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subStatText: { fontSize: 12, color: colors.textLight },
  subTypeBadge: { backgroundColor: colors.navy + '10', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  subTypeText: { fontSize: 10, fontWeight: '700', color: colors.navy, textTransform: 'capitalize' },
});
