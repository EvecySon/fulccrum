import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';
import { colors } from '../../theme/colors';

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export default function SavedCardsScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCard, setAddingCard] = useState(false);

  // Refresh cards when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCards();
    }, [])
  );

  const fetchCards = async () => {
    try {
      console.log('[SavedCards] Fetching saved cards...');
      setLoading(true);
      const response = await api.get<SavedCard[]>('/payment/cards');
      console.log('[SavedCards] Fetched', response?.length || 0, 'cards');
      setCards(response || []);
    } catch (error) {
      console.error('[SavedCards] Error fetching cards:', error);
      showAlert('Error', 'Failed to load saved cards');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    console.log('[SavedCards] Initiating add card flow');
    setAddingCard(true);
    
    try {
      console.log('[SavedCards] Requesting card add initialization');
      const response = await api.post<{ authorizationUrl: string; reference: string }>(
        '/payment/cards/add',
        {}
      );
      
      console.log('[SavedCards] Got payment reference:', response.reference);
      
      // Navigate to beautiful in-app payment modal
      (navigation as any).navigate('MockPaystack', {
        reference: response.reference,
        email: 'user@example.com', // TODO: Get from user context
        amount: 5000, // ₦50 in kobo
        onSuccess: async (paymentData: any) => {
          console.log('[SavedCards] Payment successful:', paymentData);
          
          // Save the card to backend
          try {
            await api.post('/payment/cards', {
              authorizationCode: paymentData.authorization.authorization_code,
              cardType: paymentData.authorization.card_type,
              last4: paymentData.authorization.last4,
              expMonth: paymentData.authorization.exp_month,
              expYear: paymentData.authorization.exp_year,
              bank: paymentData.authorization.bank,
            });
            
            console.log('[SavedCards] Card saved successfully');
            fetchCards();
            showAlert('Success', 'Card added successfully!');
          } catch (error: any) {
            console.error('[SavedCards] Error saving card:', error);
            showAlert('Error', error.message || 'Failed to save card');
          }
        },
        onClose: () => {
          console.log('[SavedCards] Payment modal closed');
        },
      });
    } catch (error: any) {
      console.error('[SavedCards] Error initializing card add:', error);
      showAlert('Error', error.message || 'Failed to initialize card addition');
    } finally {
      setAddingCard(false);
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      console.log('[SavedCards] Setting card as default:', cardId);
      await api.patch(`/payment/cards/${cardId}/set-default`, {});
      console.log('[SavedCards] Default card updated successfully');
      showAlert('Success', 'Default card updated');
      fetchCards();
    } catch (error: any) {
      console.error('[SavedCards] Error setting default card:', error);
      showAlert('Error', error.message || 'Failed to set default card');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    console.log('[SavedCards] Delete card confirmation for:', cardId);
    showAlert(
      'Remove Card',
      'Are you sure you want to remove this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[SavedCards] Deleting card:', cardId);
              await api.delete(`/payment/cards/${cardId}`);
              console.log('[SavedCards] Card deleted successfully');
              showAlert('Success', 'Card removed');
              fetchCards();
            } catch (error: any) {
              console.error('[SavedCards] Error deleting card:', error);
              showAlert('Error', error.message || 'Failed to remove card');
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return 'card';
    if (brandLower.includes('mastercard')) return 'card';
    if (brandLower.includes('verve')) return 'card';
    return 'card-outline';
  };

  const getCardColor = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return '#1A1F71';
    if (brandLower.includes('mastercard')) return '#EB001B';
    if (brandLower.includes('verve')) return '#00425F';
    return colors.teal;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Cards</Text>
        <TouchableOpacity 
          onPress={handleAddCard} 
          style={styles.addButton}
          disabled={addingCard}
        >
          {addingCard ? (
            <ActivityIndicator size="small" color={colors.teal} />
          ) : (
            <Ionicons name="add" size={24} color={colors.teal} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No Saved Cards</Text>
            <Text style={styles.emptyText}>
              Tap the + button above to add a new card, or add one during checkout
            </Text>
          </View>
        ) : (
          cards.map((card) => (
            <View key={card.id} style={styles.cardContainer}>
              <View
                style={[
                  styles.cardDisplay,
                  { backgroundColor: getCardColor(card.brand) },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardBrand}>{card.brand.toUpperCase()}</Text>
                  {card.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardChip}>
                  <Ionicons name="hardware-chip" size={32} color="rgba(255,255,255,0.8)" />
                </View>
                <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardExpiry}>
                    {card.expiryMonth}/{card.expiryYear}
                  </Text>
                  <Ionicons name={getCardIcon(card.brand)} size={32} color="rgba(255,255,255,0.9)" />
                </View>
              </View>

              <View style={styles.cardActions}>
                {!card.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(card.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.teal} />
                    <Text style={styles.actionText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteCard(card.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <Text style={[styles.actionText, styles.deleteText]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={styles.infoText}>
            Your card information is securely encrypted and stored by our payment provider. We never
            store your full card details.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    backgroundColor: colors.white,
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardContainer: {
    marginBottom: 24,
  },
  cardDisplay: {
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  defaultBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  cardChip: {
    marginTop: 16,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 2,
    marginTop: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  cardExpiry: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0fdfa',
    gap: 6,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
  },
  deleteText: {
    color: colors.error,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.success,
    lineHeight: 18,
  },
});
