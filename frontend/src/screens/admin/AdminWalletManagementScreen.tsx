import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminWalletAPI, WalletBalance } from '../../services/adminWalletAPI';
import { WalletBalanceCard } from '../../components/WalletBalanceCard';
import { usersAPI } from '../../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function AdminWalletManagementScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await (usersAPI as any).searchUsers(searchQuery);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery('');
    setLoading(true);

    try {
      const walletData = await adminWalletAPI.getUserWallet(user.id);
      setWallet(walletData);
    } catch (error) {
      console.error('Error loading wallet:', error);
      Alert.alert('Error', 'Failed to load user wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditPress = () => {
    if (selectedUser) {
      navigation.navigate('AdminCreditWallet', {
        userId: selectedUser.id,
        userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
        currentBalance: wallet?.balance,
      });
    }
  };

  const handleDebitPress = () => {
    if (selectedUser) {
      navigation.navigate('AdminCreditWallet', {
        userId: selectedUser.id,
        userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
        currentBalance: wallet?.balance,
        isDebit: true,
      });
    }
  };

  const handleViewTransactions = () => {
    if (selectedUser) {
      navigation.navigate('AdminWalletAuditLog', {
        userId: selectedUser.id,
        userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Wallet Management</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminWalletApprovals')}
          style={styles.approvalsButton}
        >
          <Ionicons name="checkmark-done" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search User</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or phone..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              {searching ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              {searchResults.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.resultItem}
                  onPress={() => handleSelectUser(user)}
                >
                  <View style={styles.resultIcon}>
                    <Ionicons name="person" size={20} color={colors.teal} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={styles.resultEmail}>{user.email}</Text>
                    <Text style={styles.resultRole}>{user.role}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={styles.loadingText}>Loading wallet...</Text>
          </View>
        )}

        {!loading && selectedUser && wallet && (
          <View style={styles.walletSection}>
            <Text style={styles.sectionTitle}>User Wallet</Text>
            <WalletBalanceCard
              balance={wallet.balance}
              currency={wallet.currency}
              userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
              userId={selectedUser.id}
              onCreditPress={handleCreditPress}
              onDebitPress={handleDebitPress}
              onViewTransactions={handleViewTransactions}
            />
          </View>
        )}

        {!loading && !selectedUser && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No User Selected</Text>
            <Text style={styles.emptyText}>Search for a user to manage their wallet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  approvalsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchButton: {
    backgroundColor: colors.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resultEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultRole: {
    fontSize: 12,
    color: colors.teal,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  walletSection: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
