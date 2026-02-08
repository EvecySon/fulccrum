import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { supportAPI } from '../../services/api';

const mockTickets = [
  { id: '1', subject: 'Missing item from order', user: 'Adaeze O.', avatar: 'https://i.pravatar.cc/100?img=1', role: 'customer', orderId: '#3242', status: 'open', priority: 'high', category: 'order_issue', createdAt: '10 min ago', messages: 3, assignedTo: null },
  { id: '2', subject: 'Payment not reflected', user: 'Chidi K.', avatar: 'https://i.pravatar.cc/100?img=3', role: 'customer', orderId: '#3238', status: 'in_progress', priority: 'high', category: 'payment', createdAt: '1 hr ago', messages: 5, assignedTo: 'Agent Sarah' },
  { id: '3', subject: 'Cannot update menu items', user: 'Burger House', avatar: 'https://i.pravatar.cc/100?img=10', role: 'merchant', orderId: null, status: 'in_progress', priority: 'medium', category: 'technical', createdAt: '2 hrs ago', messages: 4, assignedTo: 'Agent Mike' },
  { id: '4', subject: 'Wrong delivery address shown', user: 'Emeka N.', avatar: 'https://i.pravatar.cc/100?img=8', role: 'courier', orderId: '#3245', status: 'open', priority: 'medium', category: 'delivery', createdAt: '3 hrs ago', messages: 2, assignedTo: null },
  { id: '5', subject: 'Refund not received', user: 'Funke A.', avatar: 'https://i.pravatar.cc/100?img=5', role: 'customer', orderId: '#3200', status: 'resolved', priority: 'low', category: 'payment', createdAt: '1 day ago', messages: 8, assignedTo: 'Agent Sarah' },
  { id: '6', subject: 'App crashes on checkout', user: 'Tunde B.', avatar: 'https://i.pravatar.cc/100?img=12', role: 'customer', orderId: null, status: 'resolved', priority: 'high', category: 'technical', createdAt: '2 days ago', messages: 6, assignedTo: 'Agent Mike' },
];

const stats = { open: 2, inProgress: 2, resolved: 2, avgResponseTime: '12 min' };

export default function SupportTicketsScreen({ navigation }: any) {
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState(mockTickets);

  useEffect(() => {
    (async () => {
      try {
        const res = await supportAPI.getTickets();
        if (res?.data?.length) setTickets(res.data);
      } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  const filtered = tickets
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => t.subject.toLowerCase().includes(search.toLowerCase()) || t.user.toLowerCase().includes(search.toLowerCase()));

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'high': return { bg: colors.error + '15', color: colors.error };
      case 'medium': return { bg: colors.warning + '15', color: colors.warning };
      default: return { bg: colors.info + '15', color: colors.info };
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'open': return { bg: colors.error + '15', color: colors.error, label: 'Open' };
      case 'in_progress': return { bg: colors.info + '15', color: colors.info, label: 'In Progress' };
      case 'resolved': return { bg: colors.success + '15', color: colors.success, label: 'Resolved' };
      default: return { bg: colors.border, color: colors.textLight, label: s };
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer': return 'person';
      case 'merchant': return 'storefront';
      case 'courier': return 'bicycle';
      default: return 'person';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: colors.error }]}>
            <Text style={styles.statValue}>{stats.open}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.info }]}>
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
            <Text style={styles.statValue}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.teal }]}>
            <Text style={styles.statValue}>{stats.avgResponseTime}</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput style={styles.searchInput} placeholder="Search tickets..." placeholderTextColor={colors.textLight} value={search} onChangeText={setSearch} />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {[
            { key: 'all', label: 'All' },
            { key: 'open', label: `Open (${stats.open})` },
            { key: 'in_progress', label: `In Progress (${stats.inProgress})` },
            { key: 'resolved', label: `Resolved (${stats.resolved})` },
          ].map(f => (
            <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key as any)}>
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tickets */}
        {filtered.map(ticket => {
          const priority = getPriorityStyle(ticket.priority);
          const status = getStatusStyle(ticket.status);
          return (
            <TouchableOpacity key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketTop}>
                <Image source={{ uri: ticket.avatar }} style={styles.avatar} />
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                  <View style={styles.ticketMeta}>
                    <Ionicons name={getRoleIcon(ticket.role) as any} size={12} color={colors.textLight} />
                    <Text style={styles.ticketUser}>{ticket.user}</Text>
                    {ticket.orderId && <Text style={styles.ticketOrder}>{ticket.orderId}</Text>}
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>

              <View style={styles.ticketBottom}>
                <View style={styles.ticketTags}>
                  <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
                    <Text style={[styles.priorityText, { color: priority.color }]}>{ticket.priority}</Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{ticket.category.replace('_', ' ')}</Text>
                  </View>
                </View>
                <View style={styles.ticketFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="chatbubble-outline" size={12} color={colors.textLight} />
                    <Text style={styles.footerText}>{ticket.messages}</Text>
                  </View>
                  <Text style={styles.footerTime}>{ticket.createdAt}</Text>
                  {ticket.assignedTo && (
                    <Text style={styles.assignedText}>{ticket.assignedTo}</Text>
                  )}
                </View>
              </View>

              {ticket.status === 'open' && (
                <View style={styles.ticketActions}>
                  <TouchableOpacity style={styles.assignBtn}>
                    <Ionicons name="person-add-outline" size={14} color={colors.navy} />
                    <Text style={styles.assignBtnText}>Assign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.replyTicketBtn}>
                    <Ionicons name="chatbubble-outline" size={14} color={colors.textWhite} />
                    <Text style={styles.replyTicketBtnText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 12, alignItems: 'center', borderLeftWidth: 3 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, borderRadius: 12, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.textPrimary },
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },
  ticketCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14 },
  ticketTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  ticketInfo: { flex: 1, marginLeft: 10 },
  ticketSubject: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ticketUser: { fontSize: 12, color: colors.textLight },
  ticketOrder: { fontSize: 12, color: colors.teal, fontWeight: '600', marginLeft: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  ticketBottom: {},
  ticketTags: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.lightGray },
  categoryText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textTransform: 'capitalize' },
  ticketFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: colors.textLight },
  footerTime: { fontSize: 12, color: colors.textLight },
  assignedText: { fontSize: 12, color: colors.navy, fontWeight: '600' },
  ticketActions: { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  assignBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.navy + '10' },
  assignBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  replyTicketBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.teal },
  replyTicketBtnText: { fontSize: 13, fontWeight: '600', color: colors.textWhite },
});
