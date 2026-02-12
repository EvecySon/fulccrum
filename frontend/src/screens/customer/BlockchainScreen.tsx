import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { blockchainAPI } from '../../services/api';

interface NFTReward {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  rarity: string;
  claimed: boolean;
  earnedAt?: string;
}

const rarityColors: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export default function BlockchainScreen({ navigation }: any) {
  const [nftRewards, setNftRewards] = useState<NFTReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await blockchainAPI.getNFTRewards();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNftRewards(data);
    } catch (e: any) {
      if (!isRefresh) Alert.alert('Error', e?.message || 'Could not load blockchain data');
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleClaimNFT = async (rewardId: string) => {
    setClaiming(rewardId);
    try {
      await blockchainAPI.claimNFT(rewardId);
      Alert.alert('NFT Claimed!', 'Your reward NFT has been minted to your wallet.');
      loadData();
    } catch (e: any) {
      Alert.alert('Claim Failed', e?.message || 'Could not claim NFT');
    }
    setClaiming(null);
  };

  const unclaimedCount = nftRewards.filter(r => !r.claimed).length;
  const claimedCount = nftRewards.filter(r => r.claimed).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blockchain & NFTs</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="diamond" size={32} color="#a855f7" />
        </View>
        <Text style={styles.heroTitle}>Your Digital Rewards</Text>
        <Text style={styles.heroSubtitle}>Earn NFT rewards for ordering, reviewing, and being a loyal customer</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.teal} />}
        >
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{claimedCount}</Text>
              <Text style={styles.statLabel}>Collected</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{unclaimedCount}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#a855f7' }]}>{nftRewards.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Blockchain Features</Text>
            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: '#3b82f615' }]}>
                  <Ionicons name="link" size={22} color="#3b82f6" />
                </View>
                <Text style={styles.featureLabel}>Supply Chain</Text>
                <Text style={styles.featureDesc}>Track food origin</Text>
              </View>
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: '#f59e0b15' }]}>
                  <Ionicons name="logo-bitcoin" size={22} color="#f59e0b" />
                </View>
                <Text style={styles.featureLabel}>Crypto Pay</Text>
                <Text style={styles.featureDesc}>Pay with crypto</Text>
              </View>
              <View style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: '#a855f715' }]}>
                  <Ionicons name="diamond" size={22} color="#a855f7" />
                </View>
                <Text style={styles.featureLabel}>NFT Rewards</Text>
                <Text style={styles.featureDesc}>Collect & trade</Text>
              </View>
            </View>
          </View>

          {/* NFT Rewards */}
          <View style={styles.nftSection}>
            <Text style={styles.sectionTitle}>Your NFT Rewards</Text>
            {nftRewards.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="diamond-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyTitle}>No rewards yet</Text>
                <Text style={styles.emptySubtitle}>Place orders and leave reviews to earn NFT rewards!</Text>
              </View>
            ) : (
              nftRewards.map(reward => (
                <View key={reward.id} style={styles.nftCard}>
                  <View style={[styles.nftRarityBadge, { backgroundColor: (rarityColors[reward.rarity] || '#9ca3af') + '20' }]}>
                    <Ionicons name="diamond" size={24} color={rarityColors[reward.rarity] || '#9ca3af'} />
                  </View>
                  <View style={styles.nftInfo}>
                    <Text style={styles.nftName}>{reward.name}</Text>
                    <Text style={styles.nftDesc}>{reward.description}</Text>
                    <View style={styles.nftMeta}>
                      <View style={[styles.rarityTag, { backgroundColor: (rarityColors[reward.rarity] || '#9ca3af') + '15' }]}>
                        <Text style={[styles.rarityText, { color: rarityColors[reward.rarity] || '#9ca3af' }]}>
                          {reward.rarity?.toUpperCase()}
                        </Text>
                      </View>
                      {reward.claimed && (
                        <View style={styles.claimedTag}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                          <Text style={styles.claimedText}>Claimed</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {!reward.claimed && (
                    <TouchableOpacity
                      style={styles.claimBtn}
                      onPress={() => handleClaimNFT(reward.id)}
                      disabled={claiming === reward.id}
                    >
                      {claiming === reward.id ? (
                        <ActivityIndicator size="small" color={colors.textWhite} />
                      ) : (
                        <Text style={styles.claimBtnText}>Claim</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#1a1a2e' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  hero: { backgroundColor: '#1a1a2e', alignItems: 'center', paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#a855f715', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: colors.textWhite },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 6, paddingHorizontal: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.teal },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  featuresSection: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  featureGrid: { flexDirection: 'row', gap: 10 },
  featureCard: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  featureIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featureLabel: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  featureDesc: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  nftSection: { paddingHorizontal: 16, marginTop: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 30, backgroundColor: colors.white, borderRadius: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.textLight, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  nftCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  nftRarityBadge: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  nftInfo: { flex: 1 },
  nftName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  nftDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  nftMeta: { flexDirection: 'row', gap: 8, marginTop: 6 },
  rarityTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  rarityText: { fontSize: 10, fontWeight: '700' },
  claimedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  claimedText: { fontSize: 11, fontWeight: '600', color: colors.success },
  claimBtn: { backgroundColor: '#a855f7', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  claimBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
});
