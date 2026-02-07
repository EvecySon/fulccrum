import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const groupMembers = [
  { id: '1', name: 'You (John)', items: ['Gourmet Cheeseburger', 'Classic Fries'], total: 19.98, isHost: true, status: 'ready' },
  { id: '2', name: 'Sarah', items: ['BBQ Bacon Burger', 'Milkshake'], total: 23.98, isHost: false, status: 'ready' },
  { id: '3', name: 'Mike', items: ['Chicken Wings'], total: 12.99, isHost: false, status: 'ordering' },
  { id: '4', name: 'Emily', items: [], total: 0, isHost: false, status: 'pending' },
];

export default function GroupOrderScreen({ navigation }: any) {
  const [inviteLink, setInviteLink] = useState('');
  const [splitMethod, setSplitMethod] = useState<'individual' | 'equal' | 'custom'>('individual');

  const totalAmount = groupMembers.reduce((sum, m) => sum + m.total, 0);
  const readyCount = groupMembers.filter(m => m.status === 'ready').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return colors.success;
      case 'ordering': return colors.warning;
      case 'pending': return colors.textLight;
      default: return colors.textLight;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'ordering': return 'Ordering...';
      case 'pending': return 'Waiting';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Order</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Restaurant Info */}
        <View style={styles.restaurantBar}>
          <Ionicons name="storefront" size={20} color={colors.navy} />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>Burger House</Text>
            <Text style={styles.restaurantMeta}>4 members · {readyCount}/{groupMembers.length} ready</Text>
          </View>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color={colors.warning} />
            <Text style={styles.timerText}>12:45</Text>
          </View>
        </View>

        {/* Invite Section */}
        <View style={styles.inviteCard}>
          <Text style={styles.inviteTitle}>Invite Friends</Text>
          <View style={styles.inviteRow}>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>fulccrum.app/group/abc123</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={18} color={colors.textWhite} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <Ionicons name="share-outline" size={18} color={colors.teal} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Members */}
        <Text style={styles.sectionTitle}>Members ({groupMembers.length})</Text>
        {groupMembers.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberTop}>
              <View style={styles.memberAvatar}>
                <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.isHost && (
                    <View style={styles.hostBadge}>
                      <Ionicons name="star" size={10} color={colors.warning} />
                      <Text style={styles.hostText}>Host</Text>
                    </View>
                  )}
                </View>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(member.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(member.status) }]}>
                    {getStatusLabel(member.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.memberTotal}>₦{member.total.toFixed(2)}</Text>
            </View>
            {member.items.length > 0 && (
              <View style={styles.memberItems}>
                {member.items.map((item, idx) => (
                  <Text key={idx} style={styles.memberItemText}>• {item}</Text>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Split Method */}
        <View style={styles.splitCard}>
          <Text style={styles.splitTitle}>Split Payment</Text>
          <View style={styles.splitOptions}>
            {(['individual', 'equal', 'custom'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[styles.splitOption, splitMethod === method && styles.splitOptionActive]}
                onPress={() => setSplitMethod(method)}
              >
                <Ionicons
                  name={method === 'individual' ? 'person-outline' : method === 'equal' ? 'people-outline' : 'options-outline'}
                  size={18}
                  color={splitMethod === method ? colors.textWhite : colors.textSecondary}
                />
                <Text style={[styles.splitOptionText, splitMethod === method && styles.splitOptionTextActive]}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.splitSummary}>
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>Subtotal</Text>
              <Text style={styles.splitValue}>₦{totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>Delivery Fee</Text>
              <Text style={styles.splitValue}>₦600</Text>
            </View>
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>Your Share</Text>
              <Text style={styles.splitValueBold}>
                ${splitMethod === 'equal'
                  ? ((totalAmount + 3.99) / groupMembers.length).toFixed(2)
                  : (groupMembers[0].total + 3.99 / groupMembers.length).toFixed(2)
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Group Chat */}
        <TouchableOpacity style={styles.chatBtn}>
          <Ionicons name="chatbubbles-outline" size={20} color={colors.teal} />
          <Text style={styles.chatBtnText}>Group Chat</Text>
          <View style={styles.chatBadge}>
            <Text style={styles.chatBadgeText}>3</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomTotal}>Total: ₦{(totalAmount + 600).toLocaleString()}</Text>
          <Text style={styles.bottomReady}>{readyCount}/{groupMembers.length} ready</Text>
        </View>
        <TouchableOpacity style={[styles.placeOrderBtn, readyCount < groupMembers.length && styles.placeOrderBtnDisabled]}>
          <Text style={styles.placeOrderText}>Place Group Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  restaurantBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16,
    padding: 14, marginBottom: 12, gap: 12,
  },
  restaurantInfo: { flex: 1 },
  restaurantName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  restaurantMeta: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warning + '15',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4,
  },
  timerText: { fontSize: 14, fontWeight: '700', color: colors.warning },
  inviteCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  inviteTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  inviteRow: { flexDirection: 'row', gap: 8 },
  linkBox: {
    flex: 1, backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  linkText: { fontSize: 13, color: colors.textSecondary },
  copyBtn: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.navy,
    justifyContent: 'center', alignItems: 'center',
  },
  shareBtn: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.teal + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  memberCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  memberTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: colors.navy + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.navy },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  hostBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.warning + '15',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 2,
  },
  hostText: { fontSize: 10, fontWeight: '700', color: colors.warning },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  memberTotal: { fontSize: 16, fontWeight: '700', color: colors.teal },
  memberItems: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  memberItemText: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  splitCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 12 },
  splitTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  splitOptions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  splitOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, backgroundColor: colors.lightGray, gap: 6,
  },
  splitOptionActive: { backgroundColor: colors.navy },
  splitOptionText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  splitOptionTextActive: { color: colors.textWhite },
  splitSummary: {},
  splitRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  splitLabel: { fontSize: 14, color: colors.textSecondary },
  splitValue: { fontSize: 14, color: colors.textPrimary },
  splitValueBold: { fontSize: 16, fontWeight: '700', color: colors.teal },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.teal + '10', borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1, borderColor: colors.teal + '25',
  },
  chatBtnText: { fontSize: 15, fontWeight: '600', color: colors.teal },
  chatBadge: {
    backgroundColor: colors.error, width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  chatBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textWhite },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 34,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
  },
  bottomInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bottomTotal: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  bottomReady: { fontSize: 14, fontWeight: '600', color: colors.teal },
  placeOrderBtn: { backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  placeOrderBtnDisabled: { opacity: 0.5 },
  placeOrderText: { fontSize: 17, fontWeight: '700', color: colors.textWhite },
});
