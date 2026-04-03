import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

interface ReferralHistoryItem {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  status: string;
  deliveriesCompleted: number;
  deliveriesRequired: number;
  rewardAmount: number;
  paidOut: boolean;
}

const ReferralsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  });
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await api.get<{ referralCode: string; stats: ReferralStats }>('/referrals/my-stats');
      setReferralCode(response.referralCode || generateReferralCode());
      setStats(response.stats || stats);
      
      // Fetch history
      setLoadingHistory(true);
      const historyResponse = await api.get<ReferralHistoryItem[]>('/referrals/history');
      setHistory(historyResponse || []);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setReferralCode(generateReferralCode());
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateReferralCode = () => {
    const firstName = user?.firstName || 'USER';
    const randomNum = Math.floor(Math.random() * 10000);
    return `${firstName.toUpperCase()}${randomNum}`;
  };

  const handleShare = async () => {
    try {
      const message = `Join Fulccrum and get amazing deals! Use my referral code: ${referralCode}\n\nDownload now: https://fulccrum.app/ref/${referralCode}`;
      
      await Share.share({
        message,
        title: 'Join Fulccrum',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referrals</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Referral Code Card */}
        <LinearGradient
          colors={['#14b8a6', '#0d9488']}
          style={styles.codeCard}
        >
          <Ionicons name="gift" size={48} color="#fff" />
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{referralCode}</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopyCode}>
              <Ionicons name="copy-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color="#14b8a6" />
            <Text style={styles.statValue}>{stats.totalReferrals}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            <Text style={styles.statValue}>{stats.activeReferrals}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="wallet" size={32} color="#3b82f6" />
            <Text style={styles.statValue}>{formatCurrency(stats.totalEarnings)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color="#f59e0b" />
            <Text style={styles.statValue}>{formatCurrency(stats.pendingEarnings)}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share Your Code</Text>
              <Text style={styles.stepDescription}>
                Share your unique referral code with friends and family
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>They Sign Up</Text>
              <Text style={styles.stepDescription}>
                Your friends register using your referral code
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Earn Rewards</Text>
              <Text style={styles.stepDescription}>
                Get ₦500 for each successful referral and they get ₦200!
              </Text>
            </View>
          </View>
        </View>

        {/* Referral History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Referral History</Text>
            {history.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View>
                    <Text style={styles.historyName}>{item.name}</Text>
                    <Text style={styles.historyEmail}>{item.email}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    item.status === 'completed' && styles.statusCompleted,
                    item.status === 'active' && styles.statusActive,
                    item.status === 'pending' && styles.statusPending,
                  ]}>
                    <Text style={styles.statusText}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyDetails}>
                  <View style={styles.historyDetailItem}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text style={styles.historyDetailText}>
                      {new Date(item.joinedDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.historyDetailItem}>
                    <Ionicons name="bicycle-outline" size={14} color="#64748b" />
                    <Text style={styles.historyDetailText}>
                      {item.deliveriesCompleted}/{item.deliveriesRequired} orders
                    </Text>
                  </View>
                  <View style={styles.historyDetailItem}>
                    <Ionicons name="cash-outline" size={14} color="#64748b" />
                    <Text style={styles.historyDetailText}>
                      {formatCurrency(item.rewardAmount)} {item.paidOut ? '✓' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • Referral bonus is credited after the referred user completes their first order{'\n'}
            • Maximum 50 referrals per month{'\n'}
            • Bonus expires after 90 days if not used{'\n'}
            • Fulccrum reserves the right to modify terms
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerRight: {
    width: 40,
  },
  codeCard: {
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  codeLabel: {
    fontSize: 16,
    color: '#fff',
    marginTop: 16,
    marginBottom: 12,
    opacity: 0.9,
  },
  codeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  howItWorksSection: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#14b8a6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  termsSection: {
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  historySection: {
    padding: 16,
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  historyEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusActive: {
    backgroundColor: '#dbeafe',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
  },
  historyDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  historyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyDetailText: {
    fontSize: 12,
    color: '#64748b',
  },
});

export default ReferralsScreen;
