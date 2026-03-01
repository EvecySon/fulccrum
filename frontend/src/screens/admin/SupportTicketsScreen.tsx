import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ticketsAPI, type Ticket } from '../../services/ticketsAPI';
import { agentAPI } from '../../services/agentAPI';
import { useAuth } from '../../contexts/AuthContext';
import websocketService from '../../services/websocketService';
import ActionSheet from '../../components/ActionSheet';

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  agentStatus?: string;
}

export default function SupportTicketsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('all');
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Load tickets from backend
  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : undefined;
      const response = await ticketsAPI.getTickets(params);
      setTickets(response || []);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      showAlert('Error', error?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Load available agents (users with admin role)
  const loadAgents = async () => {
    try {
      // TODO: Create an endpoint to get available agents
      // For now, we'll use a placeholder
      setAgents([]);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  useEffect(() => {
    loadTickets();
    loadAgents();

    // Set up WebSocket listeners for real-time updates
    websocketService.onTicketAssigned((data) => {
      console.log('Ticket assigned:', data);
      loadTickets(); // Reload tickets when assignment happens
    });

    websocketService.onTicketUpdated((data) => {
      console.log('Ticket updated:', data);
      loadTickets(); // Reload tickets when updated
    });

    return () => {
      websocketService.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const filtered = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) || 
    t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    t.customerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    avgResponseTime: '12 min', // TODO: Calculate from backend metrics
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'high': return { bg: colors.error + '15', color: colors.error };
      case 'medium': return { bg: colors.warning + '15', color: colors.warning };
      default: return { bg: colors.info + '15', color: colors.info };
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s.toUpperCase()) {
      case 'OPEN': return { bg: colors.error + '15', color: colors.error, label: 'Open' };
      case 'IN_PROGRESS': return { bg: colors.info + '15', color: colors.info, label: 'In Progress' };
      case 'RESOLVED': return { bg: colors.success + '15', color: colors.success, label: 'Resolved' };
      case 'CLOSED': return { bg: colors.textLight + '15', color: colors.textLight, label: 'Closed' };
      case 'ESCALATED': return { bg: colors.warning + '15', color: colors.warning, label: 'Escalated' };
      default: return { bg: colors.border, color: colors.textLight, label: s };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleAssignTicket = async (agentId: string, agentName: string) => {
    if (!selectedTicketId) return;

    try {
      await ticketsAPI.assignTicket(selectedTicketId, { agentId });
      showAlert('Success', `Ticket assigned to ${agentName}`);
      loadTickets();
    } catch (error: any) {
      showAlert('Error', error?.message || 'Failed to assign ticket');
    }
  };

  const handleAutoAssign = async (ticketId: string) => {
    try {
      await ticketsAPI.autoAssignTicket(ticketId);
      showAlert('Success', 'Ticket auto-assigned successfully');
      loadTickets();
    } catch (error: any) {
      showAlert('Error', error?.message || 'Failed to auto-assign ticket');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AgentPerformance')}>
          <Ionicons name="analytics-outline" size={22} color={colors.navy} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.navy} />
          <Text style={styles.loadingText}>Loading tickets...</Text>
        </View>
      ) : (
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
            { key: 'OPEN', label: `Open (${stats.open})` },
            { key: 'IN_PROGRESS', label: `In Progress (${stats.inProgress})` },
            { key: 'RESOLVED', label: `Resolved (${stats.resolved})` },
          ].map(f => (
            <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key as any)}>
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tickets */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>No tickets found</Text>
            <Text style={styles.emptySubtext}>Tickets will appear here when created</Text>
          </View>
        ) : (
          filtered.map(ticket => {
            const priority = getPriorityStyle(ticket.priority);
            const status = getStatusStyle(ticket.status);
            const avatar = ticket.assignedAgent?.avatarUrl || 'https://i.pravatar.cc/100?img=1';
            return (
              <TouchableOpacity 
                key={ticket.id} 
                style={styles.ticketCard}
                onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
              >
                <View style={styles.ticketTop}>
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                    <View style={styles.ticketMeta}>
                      <Ionicons name="person" size={12} color={colors.textLight} />
                      <Text style={styles.ticketUser}>{ticket.customerName || ticket.customerEmail || 'Unknown'}</Text>
                      {ticket.orderId && <Text style={styles.ticketOrder}>#{ticket.orderId}</Text>}
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
                      <Text style={styles.categoryText}>{ticket.category.replace(/_/g, ' ')}</Text>
                    </View>
                  </View>
                  <View style={styles.ticketFooter}>
                    <View style={styles.footerItem}>
                      <Ionicons name="chatbubble-outline" size={12} color={colors.textLight} />
                      <Text style={styles.footerText}>{ticket.messages?.length || 0}</Text>
                    </View>
                    <Text style={styles.footerTime}>{getTimeAgo(ticket.createdAt)}</Text>
                    {ticket.status === 'OPEN' && (ticket.priority === 'HIGH' || ticket.priority === 'URGENT') && (
                      <View style={styles.slaWarning}>
                        <Ionicons name="warning" size={12} color={colors.error} />
                        <Text style={styles.slaWarningText}>SLA Risk</Text>
                      </View>
                    )}
                    {ticket.assignedAgent && (
                      <Text style={styles.assignedText}>
                        {ticket.assignedAgent.firstName} {ticket.assignedAgent.lastName}
                      </Text>
                    )}
                  </View>
                </View>

                {ticket.status === 'OPEN' && !ticket.assignedTo && (
                  <View style={styles.ticketActions}>
                    <TouchableOpacity 
                      style={styles.assignBtn}
                      onPress={() => {
                        setSelectedTicketId(ticket.id);
                        setShowAssignSheet(true);
                      }}
                    >
                      <Ionicons name="person-add-outline" size={14} color={colors.navy} />
                      <Text style={styles.assignBtnText}>Assign</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.autoAssignBtn}
                      onPress={() => handleAutoAssign(ticket.id)}
                    >
                      <Ionicons name="flash-outline" size={14} color={colors.teal} />
                      <Text style={styles.autoAssignBtnText}>Auto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.replyTicketBtn}
                      onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
                    >
                      <Ionicons name="chatbubble-outline" size={14} color={colors.textWhite} />
                      <Text style={styles.replyTicketBtnText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      )}

      {/* Agent Assignment Sheet */}
      <ActionSheet
        visible={showAssignSheet}
        title="Assign to Agent"
        message={agents.length === 0 ? "No agents available. You can assign to yourself or use auto-assign." : "Choose an agent to assign this ticket"}
        options={[
          ...(user ? [{
            label: `Assign to me (${user.firstName} ${user.lastName})`,
            icon: '👤',
            color: colors.navy,
            onPress: () => {
              if (selectedTicketId && user.id) {
                handleAssignTicket(user.id, `${user.firstName} ${user.lastName}`);
              }
            },
          }] : []),
          ...agents.map(agent => ({
            label: `${agent.firstName} ${agent.lastName}`,
            icon: agent.agentStatus === 'online' ? '🟢' : agent.agentStatus === 'busy' ? '🟡' : '⚫',
            color: colors.textPrimary,
            onPress: () => {
              if (selectedTicketId) {
                handleAssignTicket(agent.id, `${agent.firstName} ${agent.lastName}`);
              }
            },
          })),
          {
            label: 'Auto-assign',
            icon: '⚡',
            color: colors.teal,
            onPress: () => {
              if (selectedTicketId) {
                handleAutoAssign(selectedTicketId);
              }
            },
          },
        ]}
        onClose={() => {
          setShowAssignSheet(false);
          setSelectedTicketId(null);
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTicket')}
      >
        <Ionicons name="add" size={28} color={colors.textWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textLight },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: colors.textLight, marginTop: 4, textAlign: 'center' },
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
  slaWarning: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.error + '10', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  slaWarningText: { fontSize: 11, color: colors.error, fontWeight: '600' },
  ticketActions: { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  assignBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.navy + '10' },
  assignBtnText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  autoAssignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.teal + '10' },
  autoAssignBtnText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  replyTicketBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.teal },
  replyTicketBtnText: { fontSize: 13, fontWeight: '600', color: colors.textWhite },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.navy, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
