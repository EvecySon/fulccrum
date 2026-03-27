import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  TextInput, ActivityIndicator, RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { socialAPI, resolveMediaUrl } from '../../services/api';

interface FoodPost {
  id: string;
  userName: string;
  userAvatar: string;
  image: string;
  caption: string;
  restaurant: string;
  rating?: number;
  likes: number;
  comments: number;
  liked: boolean;
  timeAgo: string;
  tags?: string[];
}


export default function SocialFeedScreen({ navigation }: any) {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadFeed(); }, []);

  const loadFeed = async () => {
    try {
      const [feedData, challengeData] = await Promise.all([
        socialAPI.getFeed(),
        socialAPI.getChallenges().catch(() => []),
      ]);
      const items = Array.isArray(feedData?.posts) ? feedData.posts : Array.isArray(feedData) ? feedData : [];
      setPosts(items);
      const ch = Array.isArray(challengeData?.data) ? challengeData.data : Array.isArray(challengeData) ? challengeData : [];
      setChallenges(ch);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
    try { await socialAPI.likePost(postId); } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
  };

  const renderPost = ({ item }: { item: FoodPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: resolveMediaUrl(item.userAvatar) || item.userAvatar }} style={styles.avatar} />
        <View style={styles.postUserInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.postMeta}>{item.restaurant} · {item.timeAgo}</Text>
        </View>
        {(item.rating ?? 0) > 0 && (
          <View style={styles.ratingBadge}>
            {Array.from({ length: item.rating || 0 }).map((_, i) => (
              <Ionicons key={i} name="star" size={10} color={colors.warning} />
            ))}
          </View>
        )}
      </View>
      <Image source={{ uri: resolveMediaUrl(item.image) || item.image }} style={styles.postImage} />
      <View style={styles.postBody}>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
            <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={22} color={item.liked ? colors.error : colors.textPrimary} />
            <Text style={styles.actionCount}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.actionCount}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { marginLeft: 'auto' }]}>
            <Ionicons name="bookmark-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        {(item.tags?.length ?? 0) > 0 && (
          <View style={styles.tagRow}>
            {item.tags!.map((tag, i) => (
              <Text key={i} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Challenges */}
      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        {challenges.map(ch => (
          <View key={ch.id} style={styles.challengeCard}>
            <View style={styles.challengeIcon}>
              <Ionicons name={ch.icon as any} size={20} color={colors.teal} />
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeName}>{ch.name}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(ch.progress / ch.total) * 100}%` }]} />
              </View>
              <Text style={styles.challengeProgress}>{ch.progress}/{ch.total} · Reward: {ch.reward}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginTop: 8 }]}>Food Feed</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.teal} /></View>
      ) : posts.length === 0 && challenges.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={56} color={colors.textLight} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 16 }}>No Posts Yet</Text>
          <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8, paddingHorizontal: 30 }}>
            The community feed will show food reviews and posts from other users. Be the first to share!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFeed(); }} tintColor={colors.teal} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  challengesSection: { padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  challengeCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8, gap: 12, alignItems: 'center' },
  challengeIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.teal + '12', justifyContent: 'center', alignItems: 'center' },
  challengeInfo: { flex: 1 },
  challengeName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: colors.lightGray, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 3 },
  challengeProgress: { fontSize: 11, color: colors.textLight, marginTop: 4 },
  postCard: { backgroundColor: colors.white, marginBottom: 10 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  postUserInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  postMeta: { fontSize: 12, color: colors.textLight },
  ratingBadge: { flexDirection: 'row', gap: 1 },
  postImage: { width: '100%', height: 300 },
  postBody: { padding: 14 },
  postActions: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  caption: { fontSize: 14, color: colors.textPrimary, lineHeight: 20, marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { fontSize: 13, color: colors.teal, fontWeight: '600' },
});
