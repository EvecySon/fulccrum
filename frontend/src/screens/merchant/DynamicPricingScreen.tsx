import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  ActivityIndicator, RefreshControl, TextInput, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { dynamicPricingAPI } from '../../services/api';

interface PricingRule {
  id: string;
  name: string;
  conditions: string;
  adjustment: number;
  active: boolean;
  type: 'surge' | 'discount' | 'happy_hour';
  adjustmentType?: string;
}


export default function DynamicPricingScreen({ navigation }: any) {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', type: 'surge', adjustment: '', condition: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await dynamicPricingAPI.getRules();
      const raw = Array.isArray(data?.rules || data) ? (data?.rules || data) : [];
      setRules(raw.map((r: any) => ({ ...r, conditions: r.conditions || r.condition || '' })));
    } catch {
      // API not available yet
    } finally { setLoading(false); setRefreshing(false); }
  };

  const handleCreateRule = async () => {
    if (!newRule.name.trim()) return;
    setSaving(true);
    try {
      await dynamicPricingAPI.createRule({
        name: newRule.name,
        type: newRule.type,
        adjustment: parseFloat(newRule.adjustment) || 0,
        condition: newRule.condition,
      });
      setShowCreate(false);
      setNewRule({ name: '', type: 'surge', adjustment: '', condition: '' });
      loadData();
    } catch (e: any) { Alert.alert('Error', e?.message || 'Could not create rule'); }
    finally { setSaving(false); }
  };

  const toggleRule = async (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    try { await dynamicPricingAPI.toggleRule(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  };

  const deleteRule = async (id: string) => {
    Alert.alert('Delete Rule', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setRules(prev => prev.filter(r => r.id !== id));
        try { await dynamicPricingAPI.deleteRule(id); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
      }},
    ]);
  };

  const typeConfig = (type: string) => {
    switch (type) {
      case 'surge': return { icon: 'trending-up', color: colors.error, label: 'Surge' };
      case 'discount': return { icon: 'pricetag', color: colors.success, label: 'Discount' };
      case 'happy_hour': return { icon: 'happy', color: colors.warning, label: 'Happy Hour' };
      default: return { icon: 'cash', color: colors.teal, label: 'Custom' };
    }
  };

  const activeRules = rules.filter(r => r.active);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dynamic Pricing</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Ionicons name="add-circle-outline" size={24} color={colors.tealLight} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.teal} />}>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{rules.length}</Text>
                <Text style={styles.summaryLabel}>Total Rules</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.success }]}>{activeRules.length}</Text>
                <Text style={styles.summaryLabel}>Active</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.teal }]}>
                  {activeRules.length > 0 ? `${activeRules.reduce((s, r) => s + r.adjustment, 0) > 0 ? '+' : ''}${(activeRules.reduce((s, r) => s + r.adjustment, 0) / activeRules.length).toFixed(0)}%` : '0%'}
                </Text>
                <Text style={styles.summaryLabel}>Avg Adjustment</Text>
              </View>
            </View>
          </View>

          {/* Rules */}
          <Text style={styles.sectionTitle}>Pricing Rules</Text>
          {rules.map(rule => {
            const config = typeConfig(rule.type);
            return (
              <View key={rule.id} style={[styles.ruleCard, !rule.active && styles.ruleInactive]}>
                <View style={styles.ruleHeader}>
                  <View style={[styles.ruleIcon, { backgroundColor: config.color + '15' }]}>
                    <Ionicons name={config.icon as any} size={20} color={config.color} />
                  </View>
                  <View style={styles.ruleInfo}>
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Text style={styles.ruleConditions}>{rule.conditions}</Text>
                  </View>
                  <Switch
                    value={rule.active}
                    onValueChange={() => toggleRule(rule.id)}
                    trackColor={{ false: colors.border, true: colors.teal + '60' }}
                    thumbColor={rule.active ? colors.teal : colors.darkGray}
                  />
                </View>
                <View style={styles.ruleFooter}>
                  <View style={[styles.adjustmentBadge, { backgroundColor: rule.adjustment > 0 ? colors.error + '12' : colors.success + '12' }]}>
                    <Ionicons name={rule.adjustment > 0 ? 'arrow-up' : 'arrow-down'} size={12} color={rule.adjustment > 0 ? colors.error : colors.success} />
                    <Text style={[styles.adjustmentText, { color: rule.adjustment > 0 ? colors.error : colors.success }]}>
                      {rule.adjustment > 0 ? '+' : ''}{rule.adjustment}%
                    </Text>
                  </View>
                  <View style={styles.ruleActions}>
                    <TouchableOpacity onPress={() => deleteRule(rule.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.teal} />
            <Text style={styles.infoText}>
              Dynamic pricing automatically adjusts your menu prices based on conditions like weather, time, and demand. Customers see the adjusted price at checkout.
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Create Rule Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => !saving && setShowCreate(false)} />
          <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.navy, textAlign: 'center', marginBottom: 20 }}>New Pricing Rule</Text>
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
              placeholder="Rule name *"
              placeholderTextColor={colors.textLight}
              value={newRule.name}
              onChangeText={v => setNewRule(p => ({ ...p, name: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['surge', 'discount', 'happy_hour'].map(t => (
                <TouchableOpacity key={t} style={[{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.lightGray, borderWidth: 1, borderColor: colors.border }, newRule.type === t && { backgroundColor: colors.navy + '15', borderColor: colors.navy }]} onPress={() => setNewRule(p => ({ ...p, type: t }))}>
                  <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'capitalize' }, newRule.type === t && { color: colors.navy }]}>{t.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
              placeholder="Adjustment % (e.g. 15 or -10)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={newRule.adjustment}
              onChangeText={v => setNewRule(p => ({ ...p, adjustment: v }))}
            />
            <TextInput
              style={{ backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
              placeholder="Condition (e.g. weekday 12-2pm)"
              placeholderTextColor={colors.textLight}
              value={newRule.condition}
              onChangeText={v => setNewRule(p => ({ ...p, condition: v }))}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.lightGray, alignItems: 'center' }} onPress={() => setShowCreate(false)}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center' }, saving && { opacity: 0.6 }]} onPress={handleCreateRule} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>Create</Text>}
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
  summaryCard: { margin: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  summaryLabel: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginHorizontal: 16, marginBottom: 10 },
  ruleCard: { marginHorizontal: 16, marginBottom: 10, backgroundColor: colors.white, borderRadius: 16, padding: 14 },
  ruleInactive: { opacity: 0.6 },
  ruleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  ruleIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ruleInfo: { flex: 1 },
  ruleName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  ruleConditions: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  ruleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adjustmentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  adjustmentText: { fontSize: 14, fontWeight: '700' },
  ruleActions: { flexDirection: 'row', gap: 12 },
  infoCard: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 8, backgroundColor: colors.teal + '08', borderRadius: 14, padding: 14 },
  infoText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
});
