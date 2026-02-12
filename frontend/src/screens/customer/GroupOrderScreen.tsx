import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
  Modal,
  FlatList,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { socialAPI, searchAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function GroupOrderScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const groupId = route?.params?.groupId;
  const inviteCode = route?.params?.inviteCode;

  const [groupOrder, setGroupOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [splitMethod, setSplitMethod] = useState<'individual' | 'equal' | 'custom'>('individual');
  const [placing, setPlacing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadGroup();
  }, [groupId, inviteCode]);

  const loadGroup = async () => {
    setLoading(true);
    try {
      if (groupId) {
        const res = await socialAPI.getGroupOrder(groupId);
        setGroupOrder(res);
      } else if (inviteCode) {
        const res = await socialAPI.getGroupOrderByCode(inviteCode);
        setGroupOrder(res);
      } else {
        // No specific group — fetch user's active group orders
        const res = await socialAPI.getGroupOrders();
        const groups = Array.isArray(res) ? res : [];
        if (groups.length > 0) {
          setGroupOrder(groups[0]);
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not load group order');
    }
    setLoading(false);
  };

  const loadAllRestaurants = async () => {
    if (allRestaurants.length > 0) return;
    setLoadingRestaurants(true);
    try {
      const res = await searchAPI.searchBusinesses('');
      setAllRestaurants(Array.isArray(res) ? res : []);
    } catch { /* ignore */ }
    setLoadingRestaurants(false);
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await searchAPI.searchBusinesses(q.trim());
      setSearchResults(Array.isArray(res) ? res : []);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, []);

  const openPicker = () => {
    setShowPicker(true);
    loadAllRestaurants();
  };

  const handleCreateGroup = async (business: any) => {
    setCreating(true);
    try {
      const res = await socialAPI.createGroupOrder({ businessId: business.userId || business.id });
      setGroupOrder(res);
      setShowPicker(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Could not create group order');
    }
    setCreating(false);
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) { Alert.alert('Enter Code', 'Please enter an invite code.'); return; }
    setJoining(true);
    try {
      const res = await socialAPI.joinGroupOrder(joinCode.trim().toUpperCase());
      setGroupOrder(res);
      setJoinCode('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Could not join group order');
    }
    setJoining(false);
  };

  const members = groupOrder?.members || [];
  const totalAmount = members.reduce((sum: number, m: any) => sum + (m.subtotal || 0), 0);
  const readyCount = members.filter((m: any) => m.status === 'ready').length;
  const restaurantName = groupOrder?.business?.businessName || 'Restaurant';
  const code = groupOrder?.inviteCode || '';
  const isHost = groupOrder?.hostId === user?.id;
  const deliveryFee = groupOrder?.deliveryFee || 0;

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

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(`fulccrum.app/group/${code}`);
      Alert.alert('Copied!', 'Invite link copied to clipboard.');
    } catch {
      Alert.alert('Error', 'Could not copy link.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Join my group order on Fulccrum! Use code: ${code}\nfulccrum.app/group/${code}` });
    } catch { /* cancelled */ }
  };

  const handlePlaceOrder = async () => {
    if (!groupOrder?.id) return;
    setPlacing(true);
    try {
      Alert.alert('Coming Soon', 'Group order placement will be available soon.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not place order');
    }
    setPlacing(false);
  };

  const handleLeave = async () => {
    if (!groupOrder?.id) return;
    Alert.alert('Leave Group', 'Are you sure you want to leave this group order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          try {
            await socialAPI.leaveGroupOrder(groupOrder.id);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not leave group');
          }
        },
      },
    ]);
  };

  // Compute time remaining
  const getTimeRemaining = () => {
    if (!groupOrder?.expiresAt) return '';
    const diff = new Date(groupOrder.expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const myMember = members.find((m: any) => m.userId === user?.id);
  const mySubtotal = myMember?.subtotal || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Order</Text>
        <TouchableOpacity onPress={handleLeave}>
          <Ionicons name="exit-outline" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading group order...</Text>
        </View>
      ) : !groupOrder ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 }}>
          <Ionicons name="people-outline" size={56} color={colors.textLight} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 }}>No Active Group Order</Text>
          <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
            Start a new group order by picking a restaurant, or join an existing one with an invite code.
          </Text>

          <TouchableOpacity
            style={{ backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 12 }}
            onPress={openPicker}
          >
            <Text style={{ color: colors.textWhite, fontWeight: '700', fontSize: 16 }}>Start Group Order</Text>
          </TouchableOpacity>

          <View style={{ width: '100%', backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>Join with Invite Code</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={{ flex: 1, backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.textPrimary, textTransform: 'uppercase' }}
                placeholder="e.g. ABC123"
                placeholderTextColor={colors.textLight}
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={{ backgroundColor: colors.navy, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' }}
                onPress={handleJoinGroup}
                disabled={joining}
              >
                {joining ? <ActivityIndicator color={colors.textWhite} size="small" /> : <Text style={{ color: colors.textWhite, fontWeight: '700' }}>Join</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
            <Text style={{ color: colors.textLight, fontSize: 14 }}>Go Back</Text>
          </TouchableOpacity>

          {/* Restaurant Picker Modal */}
          <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
            <View style={{ flex: 1, backgroundColor: colors.lightGray }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.white }}>
                <TouchableOpacity onPress={() => { setShowPicker(false); setSearchQuery(''); setSearchResults([]); }}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>Choose Restaurant</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <TextInput
                  style={{ backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.textPrimary }}
                  placeholder="Search restaurants..."
                  placeholderTextColor={colors.textLight}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus
                />
              </View>
              {searching || loadingRestaurants ? (
                <ActivityIndicator size="large" color={colors.teal} style={{ marginTop: 40 }} />
              ) : (searchQuery.length >= 2 ? searchResults : allRestaurants).length === 0 ? (
                <Text style={{ textAlign: 'center', color: colors.textLight, marginTop: 40, fontSize: 14 }}>
                  {searchQuery.length >= 2 ? 'No restaurants found' : 'No restaurants available'}
                </Text>
              ) : (
                <FlatList
                  data={searchQuery.length >= 2 ? searchResults : allRestaurants}
                  keyExtractor={(item: any) => item.userId || item.id}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  renderItem={({ item }: any) => (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8, gap: 12 }}
                      onPress={() => handleCreateGroup(item)}
                      disabled={creating}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.navy + '15', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="storefront" size={20} color={colors.navy} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}>{item.businessName}</Text>
                        {item.cuisineType && <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>{item.cuisineType}</Text>}
                      </View>
                      {creating ? <ActivityIndicator size="small" color={colors.teal} /> : <Ionicons name="chevron-forward" size={18} color={colors.textLight} />}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </Modal>
        </ScrollView>
      ) : (
      <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Restaurant Info */}
        <View style={styles.restaurantBar}>
          <Ionicons name="storefront" size={20} color={colors.navy} />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
            <Text style={styles.restaurantMeta}>{members.length} member{members.length !== 1 ? 's' : ''} · {readyCount}/{members.length} ready</Text>
          </View>
          {groupOrder?.expiresAt && (
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={styles.timerText}>{getTimeRemaining()}</Text>
            </View>
          )}
        </View>

        {/* Invite Section */}
        <View style={styles.inviteCard}>
          <Text style={styles.inviteTitle}>Invite Friends</Text>
          <View style={styles.inviteRow}>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>fulccrum.app/group/{code}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={18} color={colors.textWhite} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color={colors.teal} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Members */}
        <Text style={styles.sectionTitle}>Members ({members.length})</Text>
        {members.map((member: any) => {
          const isMe = member.userId === user?.id;
          const isMemberHost = member.userId === groupOrder.hostId;
          const memberName = isMe
            ? `You (${member.user?.firstName || 'You'})`
            : `${member.user?.firstName || 'Member'}`;
          const items = Array.isArray(member.items) ? member.items : [];
          return (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberTop}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.avatarText}>{(member.user?.firstName || 'U').charAt(0)}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>{memberName}</Text>
                    {isMemberHost && (
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
                <Text style={styles.memberTotal}>₦{(member.subtotal || 0).toLocaleString()}</Text>
              </View>
              {items.length > 0 && (
                <View style={styles.memberItems}>
                  {items.map((item: any, idx: number) => (
                    <Text key={idx} style={styles.memberItemText}>• {typeof item === 'string' ? item : item.name || ''}</Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

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
              <Text style={styles.splitValue}>₦{totalAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>Delivery Fee</Text>
              <Text style={styles.splitValue}>₦{deliveryFee.toLocaleString()}</Text>
            </View>
            <View style={styles.splitRow}>
              <Text style={styles.splitLabel}>Your Share</Text>
              <Text style={styles.splitValueBold}>
                ₦{splitMethod === 'equal'
                  ? members.length > 0 ? ((totalAmount + deliveryFee) / members.length).toLocaleString() : '0'
                  : (mySubtotal + (members.length > 0 ? deliveryFee / members.length : 0)).toLocaleString()
                }
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomTotal}>Total: ₦{(totalAmount + deliveryFee).toLocaleString()}</Text>
          <Text style={styles.bottomReady}>{readyCount}/{members.length} ready</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderBtn, (readyCount < members.length || placing) && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={readyCount < members.length || placing}
        >
          {placing ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <Text style={styles.placeOrderText}>Place Group Order</Text>
          )}
        </TouchableOpacity>
      </View>
      </View>
      )}
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
