import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI, resolveMediaUrl } from '../../services/api';

interface AgentStats {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  activeChats: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // minutes
  ticketsToday: number;
  ticketsTotal: number;
  satisfactionScore: number;
  firstContactResolution: number; // percentage
  slaCompliance: number; // percentage
}

const teamStats = {
  totalTicketsToday: 73,
  avgResponseTime: 2.2,
  avgResolutionTime: 22,
  avgSatisfaction: 4.6,
  slaCompliance: 93.5,
  activeAgents: 3,
  totalAgents: 4,
};

export default function AgentPerformanceScreen({ navigation }: any) {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline' | 'busy'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'tickets' | 'satisfaction' | 'response'>('tickets');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAgents();
      if (res?.data) {
        setAgents(res.data);
      } else if (Array.isArray(res)) {
        setAgents(res);
      } else {
        setAgents([]);
      }
    } catch (e: any) {
      console.error('Failed to load agents:', e);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAgents();
    setRefreshing(false);
  };

  const sortedAgents = [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'tickets':
        return b.ticketsToday - a.ticketsToday;
      case 'satisfaction':
        return b.satisfactionScore - a.satisfactionScore;
      case 'response':
        return a.avgResponseTime - b.avgResponseTime;
      default:
        return 0;
    }
  });

  const filteredAgents = filter === 'all' ? sortedAgents : sortedAgents.filter(a => a.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return colors.success;
      case 'busy': return colors.warning;
      default: return colors.textLight;
    }
  };

  const getPerformanceColor = (value: number, type: 'satisfaction' | 'percentage' | 'time') => {
    if (type === 'satisfaction') {
      if (value >= 4.5) return colors.success;
      if (value >= 4.0) return colors.warning;
      return colors.error;
    }
    if (type === 'percentage') {
      if (value >= 90) return colors.success;
      if (value >= 75) return colors.warning;
      return colors.error;
    }
    if (type === 'time') {
      if (value <= 2) return colors.success;
      if (value <= 5) return colors.warning;
      return colors.error;
    }
    return colors.textPrimary;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading agents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agent Performance</Text>
        <TouchableOpacity onPress={() => showAlert('Export', 'Performance report exported')}>
          <Ionicons name="download-outline" size={22} color={colors.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />
        }
      >
        {/* Team Overview */}
        <View style={styles.teamOverview}>
          <Text style={styles.sectionTitle}>Team Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={20} color={colors.navy} />
              <Text style={styles.statValue}>{teamStats.activeAgents}/{teamStats.totalAgents}</Text>
              <Text style={styles.statLabel}>Active Agents</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="chatbubbles" size={20} color={colors.teal} />
              <Text style={styles.statValue}>{teamStats.totalTicketsToday}</Text>
              <Text style={styles.statLabel}>Tickets Today</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={20} color={colors.success} />
              <Text style={styles.statValue}>{teamStats.avgResponseTime}m</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={20} color={colors.warning} />
              <Text style={styles.statValue}>{teamStats.avgSatisfaction}</Text>
              <Text style={styles.statLabel}>Satisfaction</Text>
            </View>
          </View>
        </View>

        {/* Sort Options */}
        <View style={styles.sortBar}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortOptions}>
            {[
              { key: 'tickets', label: 'Tickets', icon: 'receipt' },
              { key: 'satisfaction', label: 'Rating', icon: 'star' },
              { key: 'response', label: 'Response Time', icon: 'time' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortChip, sortBy === option.key && styles.sortChipActive]}
                onPress={() => setSortBy(option.key as any)}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={14} 
                  color={sortBy === option.key ? colors.textWhite : colors.textSecondary} 
                />
                <Text style={[styles.sortText, sortBy === option.key && styles.sortTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Agent List */}
        <View style={styles.agentList}>
          {sortedAgents.map((agent, index) => (
            <TouchableOpacity 
              key={agent.id} 
              style={styles.agentCard}
              onPress={() => showAlert('Agent Details', `${agent.name}\n\nTotal Tickets: ${agent.ticketsTotal}\nSLA Compliance: ${agent.slaCompliance}%\nFirst Contact Resolution: ${agent.firstContactResolution}%`)}
            >
              <View style={styles.agentHeader}>
                <View style={styles.agentLeft}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <Image source={{ uri: resolveMediaUrl(agent.avatar) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(agent.name || '') + '&background=0D1B2A&color=fff&size=80' }} style={styles.agentAvatar} />
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <View style={styles.agentStatusRow}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(agent.status) }]} />
                      <Text style={styles.agentStatus}>{agent.status}</Text>
                      {agent.activeChats > 0 && (
                        <Text style={styles.activeChats}>{agent.activeChats} active</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metric}>
                  <Ionicons name="chatbubble-outline" size={14} color={colors.textLight} />
                  <Text style={styles.metricValue}>{agent.ticketsToday}</Text>
                  <Text style={styles.metricLabel}>Today</Text>
                </View>
                <View style={styles.metric}>
                  <Ionicons name="time-outline" size={14} color={getPerformanceColor(agent.avgResponseTime, 'time')} />
                  <Text style={[styles.metricValue, { color: getPerformanceColor(agent.avgResponseTime, 'time') }]}>
                    {agent.avgResponseTime}m
                  </Text>
                  <Text style={styles.metricLabel}>Response</Text>
                </View>
                <View style={styles.metric}>
                  <Ionicons name="star" size={14} color={getPerformanceColor(agent.satisfactionScore, 'satisfaction')} />
                  <Text style={[styles.metricValue, { color: getPerformanceColor(agent.satisfactionScore, 'satisfaction') }]}>
                    {agent.satisfactionScore}
                  </Text>
                  <Text style={styles.metricLabel}>Rating</Text>
                </View>
                <View style={styles.metric}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={getPerformanceColor(agent.slaCompliance, 'percentage')} />
                  <Text style={[styles.metricValue, { color: getPerformanceColor(agent.slaCompliance, 'percentage') }]}>
                    {agent.slaCompliance}%
                  </Text>
                  <Text style={styles.metricLabel}>SLA</Text>
                </View>
              </View>

              <View style={styles.progressBars}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>First Contact Resolution</Text>
                  <Text style={styles.progressValue}>{agent.firstContactResolution}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${agent.firstContactResolution}%`,
                        backgroundColor: getPerformanceColor(agent.firstContactResolution, 'percentage')
                      }
                    ]} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: colors.white,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, flex: 1, marginLeft: 12 },
  teamOverview: { backgroundColor: colors.white, padding: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 12, padding: 12, gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textLight, textAlign: 'center' },
  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, marginTop: 8, gap: 12 },
  sortLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  sortOptions: { flexDirection: 'row', gap: 8 },
  sortChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.lightGray, gap: 4 },
  sortChipActive: { backgroundColor: colors.navy },
  sortText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  sortTextActive: { color: colors.textWhite },
  agentList: { paddingHorizontal: 16, paddingTop: 12 },
  agentCard: { backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10 },
  agentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  agentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.navy + '15', justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 14, fontWeight: '800', color: colors.navy },
  agentAvatar: { width: 44, height: 44, borderRadius: 22 },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  agentStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  agentStatus: { fontSize: 12, color: colors.textLight, textTransform: 'capitalize' },
  activeChats: { fontSize: 12, color: colors.teal, fontWeight: '600', marginLeft: 4 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.borderLight, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  metric: { alignItems: 'center', gap: 2 },
  metricValue: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  metricLabel: { fontSize: 10, color: colors.textLight },
  progressBars: { marginTop: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: colors.textSecondary },
  progressValue: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  progressBarBg: { height: 6, backgroundColor: colors.lightGray, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
});
